window.rdz.user = {
    logged: false,
    login: function () {
        rdz.model.parameters.Factory.requestOneParameter({
            model: {name: 'AccountData', request: 'AccountData', extra: {api: {active: true}}},
            url: null,
            ignore_cache: true,
            receiver: 'callback',
            callback: rdz.user.login_info
        });
    },
    login_info: function () {
        //sent request for prices only once
        if (!rdz.cache.get(['API', 'Prices'])) {
            rdz.model.parameters.Factory.requestOneParameter({
                model: {name: 'Prices', request: 'Prices', extra: {api: {active: true}}},
                url: null,
                receiver: 'callback'
            });
        }
        rdz.user.getRecipients();
        //update balance every 10 min
        rdz.user.timer = setTimeout(rdz.user.login, rdz.timer['600000']);

        //prepare opened tabs to be updated
        window.rdz.utils.optionsChanged();

        if (portRequest) {
            //change icon on page in bar when user login
            portRequest.postMessage({method: 'message', request: 'USER_AUTH_STATUS_ContentResponse', value: true});
        }

    },
    logout: function () {
        clearTimeout(this.timer);
        rdz.user.logged = false;
        rdz.cache.set(['API', 'AccountData'], null);
        rdz.cache.set(['API', 'Recipients'], null);
        rdz.cache.set(['SESSION'], null);
        window.rdz.utils.optionsChanged();
    },
    get: function (p) {
        var path = ['API', 'AccountData'];
        if (p) path.push(p);
        return rdz.cache.get(path);
    },
    getRecipients: function () {
        rdz.model.parameters.Factory.requestOneParameter({
            model: {name: 'Recipients', request: 'Recipients', extra: {api: {active: true}}},
            url: null,
            ignore_cache: true,
            receiver: 'callback',
            callback: function () {
                rdz.db.updateRecipients(this.get('value'));
            }
        });
    },

    start: function () {
        chrome.storage.local.get('OtherData', settings => {
            var otherData = settings.OtherData,
                userInfo, uid;

            // set user id
            if (otherData) {
                userInfo = otherData.userInfo;

                if (!userInfo) {
                    uid = rdz.utils.guid();
                    otherData.userInfo = { uid: uid, lastReportTime: '0' };
                    chrome.storage.local.set({ OtherData: otherData });
                }
            } else {
                uid = rdz.utils.guid();
                otherData = { userInfo: { uid: uid, lastReportTime: '0' } };
                chrome.storage.local.set({ OtherData: otherData });
            }

            settings.OtherData = otherData;
            rdz.user.banners.getActualData();
        });

        rdz.user.refCookies_timeout = setTimeout(function () {
            chrome.storage.local.get('OtherData', settings => rdz.user.ref_cookies.getActualData(settings));
        }, 20 * 60 * 1000);

        rdz.user.reportUserInfo_timeout = setTimeout(function () {
            chrome.storage.local.get(null, settings => rdz.user.reportUserInfo(settings));
        }, 15 * 60 * 1000);
    },

    // function User statistics
    reportUserInfo: function (settings) {
        var otherData = settings.OtherData,
            userInfo,
            now = +new Date(),
            uid,
            url = 'http://62.149.1.74:977/api/AppStatistic/Add/',
            headers = [
                // User-Agent is unsafe :)
                ['Content-Type', 'application/json; charset=utf-8'],
                ['X-RdsAppKey', /OPR/.test(navigator.userAgent) ? 'cc77dd62-e6fc-4aa0-9c13-681fa941d1b9' : '60403d2e-0542-4fd3-914a-dc44999a6314']
            ],
            xhr, body,
            info = settings.Info,
            bar = settings.Bar;

        if (otherData) {
            userInfo = otherData.userInfo;

            if (!userInfo) {
                uid = rdz.utils.guid();
                otherData.userInfo = {uid: uid, lastReportTime: '0'};
            }

        } else {
            uid = rdz.utils.guid();
            otherData = {userInfo: {uid: uid, lastReportTime: '0'}};
        }

        // if the last report was not today
        if (!rdz.utils.isTodayDate(new Date(+otherData.userInfo.lastReportTime))) {
            if (rdz.user.logged) {
                headers = headers.concat([
                    ['Authorization', /*'Base '*/ 'Basic ' + window.btoa(rdz.user.get('key') + ":1")]
                ]);
            }

            // user info
            body = {
                Id: otherData.userInfo.uid,
                Email: rdz.user.logged ? rdz.user.get('email') : null,
                BarLocale: bar.locale,
                BarVersion: info.version,
                BannerStatistic: rdz.user.banners.getBannersStats(otherData)
            };

            xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (xhr.status === 204) {
                    otherData.userInfo.lastReportTime = now + '';
                    otherData.bannersInfo.stats = window.rdz.user.banners._getInitStats();
                    chrome.storage.local.set({OtherData: otherData});
                }
            };
            xhr.open('PUT', url);
            headers.forEach(function (e, i) {
                xhr.setRequestHeader(e[0], e[1]);
            });
            xhr.send(JSON.stringify(body));
        }

        // check in timeout
        delete rdz.user.reportUserInfo_timeout;
        rdz.user.reportUserInfo_timeout = setTimeout(function () {
            chrome.storage.local.get(null, settings => rdz.user.reportUserInfo(settings));
        }, 4 * 60 * 60 * 1000);
    },

    ad_code_is_receiving: false,

    checkDisableAdState: function (settings) {
        var result = false,
            otherData = settings.OtherData,
            userInfo = otherData.userInfo,
            disable_ad_active = rdz._.find(rdz.utils.getOptions({options: ['Parameters']}, settings),
                function (o) {
                    return o.name == 'DisableAd';
                }).active,
            code_is_valid = rdz.user._checkDisableCode(settings),
            is_logged = rdz.user.logged,
            uid = userInfo.uid,
            app_id = /OPR/.test(navigator.userAgent) ? 'cc77dd62-e6fc-4aa0-9c13-681fa941d1b9' : '60403d2e-0542-4fd3-914a-dc44999a6314',
            is_not_bankrupt, url,
            xhr, data, str;

        if (disable_ad_active) { // disable ad function
            if (code_is_valid) {
                result = true;
            } else if (is_logged && !rdz.user.ad_code_is_receiving) {
                is_not_bankrupt = rdz.user.get('balance') > 0.0027;

                if (is_not_bankrupt && uid) {
                    url = 'http://62.149.1.74:977/api/DisableAdvertising/Disable/' + uid;
                    xhr = new window.XMLHttpRequest();
                        xhr.onload = function (response) {
                            rdz.user.ad_code_is_receiving = false;

                            try {
                                data = JSON.parse(xhr.responseText);
                                if (data && data.PaymentStatus === 'Payed') {
                                    str = data.Key + data.TimeExp + rdz.user.get('key') + uid + app_id;
                                    userInfo.k = window.btoa(data.Key);
                                    userInfo.te = window.btoa(data.TimeExp);
                                    userInfo.h = rdz.utils.sha1(str);
                                    chrome.storage.local.set({ OtherData: otherData });
                                }
                            } catch (e) {
                            }
                        };
                    xhr.onerror = function () {
                        rdz.user.ad_code_is_receiving = false;
                    };
                    xhr.ontimeout = function () {
                        rdz.user.ad_code_is_receiving = false;
                    };
                    xhr.open('GET', url, true);
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
                    xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa(rdz.user.get('key') + ":1"));
                    xhr.setRequestHeader('X-RdsAppKey', app_id);
                    xhr.send(null);

                    rdz.user.ad_code_is_receiving = true;
                    result = true;
                }
            } else if (rdz.user.ad_code_is_receiving) {
                result = true;
            }
        }

        return result;
    },

    _checkDisableCode: function (settings) {
        var valid = false,
            otherData = settings.OtherData,
            userInfo = otherData.userInfo,
            key = userInfo.k,
            time_exp = userInfo.te,
            hash = userInfo.h,
            rds_uid = rdz.user.get('key'),
            uid = userInfo.uid,
            app_id = /OPR/.test(navigator.userAgent) ? 'cc77dd62-e6fc-4aa0-9c13-681fa941d1b9' : '60403d2e-0542-4fd3-914a-dc44999a6314',
            now = +new Date(),
            exp_date, str;

        if (key && time_exp && rds_uid && app_id) {
            key = window.atob(key);
            time_exp = window.atob(time_exp);
            exp_date = +new Date(time_exp);
            str = key + time_exp + rds_uid + uid + app_id;

            if (now < exp_date && rdz.utils.sha1(str) === hash) {
                valid = true;
            }
        }

        return valid;
    },

    ref_cookies: {
        getActualData: function (settings) {
            let ref_info = settings.OtherData.ref_info;

            if (!ref_info || rdz.user.ref_cookies.checkDate(ref_info.last_ref_req_time)) {
                let xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        let ref_cookies_urls = JSON.parse(xhr.response);
                        rdz.user.ref_cookies.getRefCookies(ref_cookies_urls);
                        settings.OtherData.ref_info = { last_ref_req_time: Date.now() };
                        chrome.storage.local.set(settings);
                    }
                };
                xhr.open('GET', 'https://www.recipdonor.com/rdsbarad/ref.html?t=' + Date.now());
                xhr.send();
            }

            rdz.user.refCookies_timeout = setTimeout(function () {
                chrome.storage.local.get('OtherData', rdz.user.ref_cookies.getActualData);
            }, 8 * 60 * 60 * 1000);
        },

        checkDate: function (last_ref_req_time) {
            // 16 days since last request
            return Date.now() - last_ref_req_time > 16 * 24 * 60 * 60 * 1000;
        },

        getRefCookies: function (ref_cookies_urls) {
            let domain = rdz.uri && rdz.uri.domain || 'google.com';
            ref_cookies_urls.forEach(url => rdz.utils.xhr(
                url.replace('google.com', domain),
                () => { }
            ));
        }
    },

    // ad banners info
    banners: {
        actual_data: null,

        // get json with actual banners' info from recipdonor.com
        getActualData: function () {
            let that = this;

            let xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (xhr.status === 200) {
                    const toDataURL = url => fetch(url)
                        .then(response => response.blob())
                        .then(blob => new Promise((resolve, reject) => {
                            let reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        }));

                    that.actual_data = JSON.parse(xhr.response);

                    let banners_info = that.actual_data.info;
                    for (let locale in banners_info) {
                        for (let place in banners_info[locale]) {
                            for (let banner in banners_info[locale][place]) {
                                banners_info[locale][place][banner].lastShowed = 0;
                                toDataURL(banners_info[locale][place][banner].file_name)
                                    .then(dataUrl => banners_info[locale][place][banner].data_url = dataUrl);
                            }
                        }
                    }

                    chrome.storage.local.get(['OtherData', 'Parameters'], settings => {
                        that.init(settings);
                    });
                }
            };
            xhr.open('GET', 'https://www.recipdonor.com/rdsbarad/banners_info_test.html?t=' + Date.now());
            xhr.send();

            // update info for ad banners
            rdz.user.adBanners_timeout = setTimeout(function () {
                rdz.user.banners.getActualData();
            }, 4 * 60 * 60 * 1000); // 4 hours
        },

        init: function (settings) {
            let otherData = settings.OtherData || {},
                bannersInfo = otherData.bannersInfo;

            if (!bannersInfo || this._versionIsUpdated(bannersInfo.version, this.actual_data.version)) {
                bannersInfo = {
                    version: this.actual_data.version,
                    state: this._getInitState(),
                    stats: this._getInitStats()
                };
                otherData.bannersInfo = bannersInfo;
                chrome.storage.local.set(settings);
            }
        },

        _versionIsUpdated: function (v1, v2) {
            let version_arr1 = v1.split('.'),
                version_arr2 = v2.split('.');

            return  +version_arr1[0] < +version_arr2[0] ||
                    +version_arr1[0] === +version_arr2[0] && +version_arr1[1] < +version_arr2[1];
        },

        _getInitState: function () {
            let state = {},
                banners_info = this.actual_data.info;

            for (let locale in banners_info) {
                state[locale] = {};
                for (let place in banners_info[locale]) {
                    state[locale][place] = {
                        curr: 0,
                        max: banners_info[locale][place].length
                    };
                }
            }


            return state;
        },

        _getInitStats: function () {
            let stats = {},
                banners_info = this.actual_data.info;

            for (let locale in banners_info) {
                stats[locale] = {};
                for (let place in banners_info[locale]) {
                    stats[locale][place] = {
                        displayed: 0,
                        clicks: {}
                    };
                }
            }

            return stats;
        },

        updateCurrBanner: function (place, settings) {
            var otherData = settings.OtherData,
                locale = AppLocale.get_locale_str(),
                banners_info = this.actual_data.info,
                banners = otherData.bannersInfo.state[locale][place],
                currBanner = null;

            if (!window.rdz.user.checkDisableAdState(settings)) {
                currBanner = banners_info[locale][place][banners.curr];

                // try to decrease banners showing, 20 minutes cool down per banner
                if (currBanner && (Date.now() - currBanner.lastShowed >= 1200000)) {
                    currBanner.lastShowed = Date.now();
                    banners.curr = (banners.curr + 1) % banners.max;
                    otherData.bannersInfo.state[locale][place] = banners;
                    chrome.storage.local.set(settings);
                } else {
                    currBanner = null;
                }
            }

            return currBanner;
        },

        updateDisplayingStats: function (info) {
            chrome.storage.local.get('OtherData', settings => {
                let otherData = settings.OtherData; // TODO: change

                if (otherData && otherData.bannersInfo) {
                    otherData.bannersInfo.stats[info.locale][info.place].displayed += 1;
                    chrome.storage.local.set(settings);
                }
            });
        },

        updateClicksStats: function (info) {
            chrome.storage.local.get('OtherData', settings => {
                let otherData = settings.OtherData;

                if (otherData && otherData.bannersInfo) {
                    let clicks = otherData.bannersInfo.stats[info.locale][info.place].clicks;

                    if (clicks[info.banner.name] !== undefined) {
                        clicks[info.banner.name] += 1;
                    } else {
                        clicks[info.banner.name] = 1;
                    }

                    chrome.storage.local.set(settings);
                }
            });
        },

        getBannersStats: function (otherData) {
            let locale = AppLocale.get_locale_str(),
                stats = otherData.bannersInfo.stats[locale],
                result = null;

            if (stats) {
                result = {
                    Displaying: [],
                    Clicks: []
                };

                for (let place in stats) {
                    result.Displaying.push({
                        Place: place,
                        Count: stats[place].displayed
                    });

                    for (let banner in stats[place].clicks) {
                        result.Clicks.push({
                            Name: banner,
                            Place: place,
                            Count: stats[place].clicks[banner]
                        });
                    }
                }
            }

            return result;
        }
    }
};
