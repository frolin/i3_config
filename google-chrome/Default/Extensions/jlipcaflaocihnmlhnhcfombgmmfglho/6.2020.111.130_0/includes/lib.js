if (!window.rdz) window.rdz = {};
/**
 * @namespace utils keeps additional functions for random purpose
 */
window.rdz.utils = {
    mapingObj: function (data, where) {

        if (!data) return [];
        //sorting object's property from min to max
        var sortable = [],
            w = typeof where === 'string' ? rdz.utils[where] : where.length === 2 ? rdz[where[0]][where[1]] : where.length === 3 ? rdz[where[0]][where[1]][where[2]] : console.log('rdz.utils.mapingObj: допиши исключение, что-то не сходится');

        for (var i in w) {
            sortable.push([i, w[i]]);
        }
        sortable.sort(function (a, b) {
            return a[1] - b[1];
        });

        if (typeof data !== 'string') data = (data).toString();

        //collect markets from binary number by mapping
        //using BigInt Lib to work with Numbers > 2^53
        var indexes = BigInteger.parse(data, 10),
            newdata = [];

        //convert to binary string
        indexes = BigInteger(indexes).toString(2);

        for (var o = indexes.length - 1; o >= 0; o -= 1) {
            if (indexes[o] === '1') {
                newdata.push(sortable[indexes.length - 1 - o]);
            }
        }

        return newdata;
    },

    find: function (arr, what) {
        // e === what: [1, 2, 3, 4, 5]
        //e[0] === what: [["GoogleOne", 1], ["Twitter", 2], ["Facebook", 4], ["Vk", 8]]
        return rdz._.find(arr, function (e) {
            return e === what || e[0] === what;
        });
    },

    requestbodySeoMarkets: function (markets) {
        var res = [],
            i;
        for (i in markets) {
            if (markets[i] && markets[i][1]) res.push(markets[i][1]);
        }
        return res;
    },

    /**
     * Ф-я шлет реквесты для получения каунтов Истории изменения
     * @param url
     * @param logged
     * @param local
     */
    getPopupHistoryCounts: function (url, logged, local, fromIntegration, settings) {
        var hc = {},
            options = { italic: rdz.utils.getOptions({ options: ['Bar'] }, settings).italic };
        hc = local == 'ru' ? {name: 'HistoryCount', params: ['TYC', 'IY', 'PR']} : {
            name: 'HistoryCount',
            params: ['PR']
        };
        var mc = {name: 'MirrorsCount', needed: local == 'ru' ? true : false};
        if (logged) {
            for (var h in hc['params']) {
                rdz.model.parameters.Factory.requestOneParameter({
                    model: {
                        name: 'history_counters',
                        request: hc.name,
                        extra: {api: {active: true}},
                        parameter: hc['params'][h],
                        options: options,
                        number: parseInt(h, 10)
                    },
                    url: url,
                    receiver: 'callback',

                    callback: function () {
                        if (this.get('value') != 0) {
                            if (window.chrome && !fromIntegration) {
                                //rdz.popup.app.popup.history_counters.updateModel({model: rdz.utils.addDataFromRequest(this.toJSON(), this.request)});
                                rdz.popup.app.popup.history_counters.add(rdz.utils.addDataFromRequest(this.toJSON(), this.request));
                            }
                            else if (window.opera || fromIntegration) {
                                portRequest.postMessage({
                                    method: 'message',
                                    request: 'OPERA_History_CountersPopupResponse',
                                    model: JSON.stringify(rdz.utils.addDataFromRequest(this.toJSON(), this.request)),
                                    url: this.request.url
                                });
                            }
                        }
                    }
                });
            }
            if (mc.needed) {
                rdz.model.parameters.Factory.requestOneParameter({
                    model: {
                        name: 'history_counters',
                        request: mc.name,
                        options: options,
                        number: 5
                    },
                    url: url,
                    receiver: 'callback',
                    callback: function () {
                        if ((this.get('value') != 0) && (this.get('value') > 0)) {
                            if (window.chrome && !fromIntegration) {

                                rdz.popup.app.popup.history_counters.add(rdz.utils.addDataFromRequest(this.toJSON(), this.request));
                            }
                            else if (window.opera || fromIntegration) {
                                portRequest.postMessage({
                                    method: 'message',
                                    request: 'OPERA_History_CountersPopupResponse',
                                    model: JSON.stringify(rdz.utils.addDataFromRequest(this.toJSON(), this.request)),
                                    url: this.request.url
                                });
                            }
                        }
                    }
                });
            }
            rdz.model.parameters.Factory.requestOneParameter({
                model: {
                    name: 'history_counters',
                    request: 'WhoisCount',
                    extra: {api: {active: true}},
                    options: options,
                    number: 4
                },
                url: url,
                receiver: 'callback',
                callback: function () {
                    var value = this.get('value');
                    if (value) {
                        if (window.chrome && !fromIntegration) {
                            rdz.popup.app.popup.history_counters.add(rdz.utils.addDataFromRequest(this.toJSON(), this.request));
                        }
                        else if (window.opera || fromIntegration) {
                            portRequest.postMessage({
                                method: 'message',
                                request: 'OPERA_History_CountersPopupResponse',
                                model: JSON.stringify(rdz.utils.addDataFromRequest(this.toJSON(), this.request)),
                                url: this.request.url
                            });
                        }
                    }
                }
            });
        }
    },

    getRandomYandex: function () {
        var servers = ['yandex.ru'/*, 'yandex.ua','yandex.by'*/];
        return servers[Math.floor(Math.random() * servers.length)];
    },
    noWWWUri: function (url) {
        return url && url.replace(/^([^:]+:\/\/)?www\.([^\.\/]+\.)/, '$1$2');
    },

    domainFromUri: function (url) {
        var o = {domain: undefined, www: false};
        if (!url) return o;
        var match = url.match(/(?:https?:)?\/\/([^\/]+)/);

        if (!match) {
            match = rdz.utils.SubstractDomainName(url);
            if (match && match[0] !== "") {
                o.domain = match.join('');
                //make sure subdomain is not missed
                var domain = url.replace('www.', '').match(new RegExp('[^]+?' + o.domain));
                o.domain = (domain && domain[0] || o.domain);
                if (url.split('.').length > 2 && url.substr(0, 4) == 'www.') {
                    o.www = true;
                }
            }
        } else {
            o.domain = match[1];
            if (o.domain.split('.').length > 2 && o.domain.substr(0, 4) == 'www.') {
                o.domain = o.domain.substr(4);
                o.www = true;
            }
        }
        return o;
    },

    isMainPage: function (url) {
        return url.match(/^[^:]+:\/\/[^\/]+\/?$/);
    },

    protolessUri: function (url) {
        return url.replace(/^[^:\/]+:\/\//, '').replace(/#.*$/, '');
    },

    get_uri_obj: function (uri) {
        var obj = {},
            domain = rdz.utils.domainFromUri(uri),
            domain_and_zone = rdz.utils.SubstractDomainName(domain.domain);

        obj.domain = domain.domain;
        obj.www = domain.www;
        obj.page = rdz.utils.protolessUri(uri);
        obj.path = uri.replace(new RegExp('[^]+?' + obj.domain + '|' + obj.domain), '');
        obj.is_main = Boolean(rdz.utils.isMainPage(uri));

        obj.subdomain =
            obj.domain.indexOf(domain_and_zone[0]) !== 0 ?
                obj.domain.substring(0, obj.domain.indexOf(domain_and_zone[0]) - 1) : null;

        obj.protocol = uri.match(/^[^:\/]+:\/\//);

        return obj;
    },
    validateDomain: function (domain) {
        //^(?!-|_[A-Za-z0-9]*) : not "_" or "-" but only letters and numbers at the start
        // [A-Za-z0-9_-]+ : domain name consist letters, numbers, "_" and "-"
        //[^_-][A-Za-z0-9]* : not "_" or "-" but only letters and numbers at the and of domain name
        //(\.[A-Za-z]+)+$/): domain zone with ".", "-" and letters, number characters
        //bug: milidom-.ru
        return domain && domain.length < 255 && (domain).match(/^(?!-|_[A-Za-z0-9]*)[A-Za-z0-9_-]+[^_-][A-Za-z0-9]*(\.[A-Za-z0-9-]{2,})+$/);
    },

    isASCIIDomain: function (domain) {
        var domain_array = domain.split("."),
            re = /[^A-Za-z0-9-]/;

        for (var i = 0; i < domain_array.length; ++i) {
            var s = domain_array[i];
            if (!re.test(s)) {
                return false;
            }
        }
        return true;
    },

    encodePath: function (path) {
        var pathParts = path.split("/");
        for (var i = 0; i < pathParts.length; i++) {
            pathParts[i] = encodeURIComponent(pathParts[i]);
        }
        path = pathParts.join("/");
        return path;
    },

    decodePath: function (path) {
        var pathParts = path.split("/");
        for (var i = 0; i < pathParts.length; i++) {
            pathParts[i] = decodeURIComponent(pathParts[i]);
        }
        path = pathParts.join("/");
        return path;
    },

    saveDomains: function (domains) {
        if (domains && domains.length > 0) {
            var sql = [];
            domains.forEach(function (domain) {
                sql.push({
                    sql: 'INSERT OR IGNORE INTO SitesLibrary (SlUrl, SlCreateDate) VALUES (?, ?)',
                    params: [domain, +new Date()]
                });
            });
            rdz.db.execute(sql, function () {
            });
        }
    },

    isSubdomain: function (domain) {
        domain = domain.replace(/^www\., ''/);
        return domain.split('.').length > 2 &&
            rdz.utils.SubstractDomainName(domain).join('') !== domain;
    },

    // Generate four random hex digits.
    S4: function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    },

    // Generate a pseudo-GUID by concatenating random hexadecimal.
    guid: function () {
        return (this.S4() + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + "-" + this.S4() + this.S4() + this.S4());
    },
    prettyDate: function (time, format) {
        //var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
        if (!time) return 'unknown';
        if (!format) format = {};


        var date = new Date(time),
            diff = (((new Date()).getTime() - date.getTime()) / 1000),
            day_diff = Math.floor(diff / 86400),
            months = rdz.locale.months;

        if (isNaN(day_diff) || day_diff < 0 && !format.future /*|| day_diff >= 31*/)
            return;

        //format = {} - сейчас, 12 минут назад, 2 часа назад, Сегодня, Вчера, Позавчера, 12 апр (текущий год не показываем), 12 апр 2004
        //format = {withoutDays:true} - сейчас, 12 минут назад, 2 часа назад, Сегодня, Вчера, Позавчера, Апр (нужно проверить, такого варианта быть не должно), Апр 2004
        //format = {withoutDays: true, year:true} - сейчас, 12 минут назад, 2 часа назад, Сегодня, Вчера, Позавчера, Апр 2004
        //format = {digit:true, year:true, today:true} - Сегодня, Вчера, Позавчера, 12.05.2004
        //format = {time_or_date:true} - 15:15, 28 авг, 01 сен 2012


        return !format.time_or_date && (
            day_diff == 0 && (!format.today && !format.future && (
            diff < 60 && rdz.locale.now ||
            diff < 120 && rdz.locale.minute_ago ||
            diff < 3600 && Math.floor(diff / 60) + " " + this.endings(Math.floor(diff / 60), rdz.locale.minutes) + rdz.locale.ago ||
            diff < 7200 && rdz.locale.hour_ago ||
            diff < 86400 && Math.floor(diff / 3600) + " " + this.endings(Math.floor(diff / 3600), rdz.locale.hours) + rdz.locale.ago ) ||
            diff < 86400 && rdz.locale.today) ||
            day_diff == 1 && rdz.locale.yesterday ||
            day_diff == 2 && rdz.locale.day_before_yesterday
            ) ||

                //days
            (format.withoutDays ? '' :
                (format.time_or_date && date.getDate() === new Date().getDate() ?
                    //choose time if date is current day
                date.getHours() + ':' + (date.getMinutes() > 9 ? '' : '0') + date.getMinutes() :
                    //or choose number of day
                    date.getDate() > 9 ? date.getDate() : '0' + date.getDate()) ) +


            (format.time_or_date && date.getDate() === new Date().getDate() ? '' :

                //month
            (format.digit ?
            '.' + (date.getMonth() + 1 > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)) + (format.year ? '.' : '') :
            (format.withoutDays ? '' + months[date.getMonth()] : ' ' + months[date.getMonth()].toLowerCase()) + ' ') +

                //year
            (new Date().getFullYear() === date.getFullYear() && !format.year ? '' : date.getFullYear())
            );
    },

    stringToDate: function (time) {
        if (!time) return '';
        time = time.toLowerCase();
        var date = new Date(),
            t = time.split(/\s+/),
            months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
            monthsukr = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру'];

        return time.match('сейчас') && date ||
            time.match(/мин|м |хви/) && date - (1000 * 60 * parseInt(t[0], 10)) ||
            time.match(/час|ч |ч\.|год/) && date - (1000 * 60 * 60 * parseInt(t[0], 10)) ||
            time.match(/сегодня|сьогодні/) && date.setHours(0, 0, 0, 0) ||
            time.match(/вчера|вчора/) && date.setHours(0, 0, 0, 0) - (1000 * 60 * 60 * 24) ||
            time.match(/позавчера|позавчора/) && date.setHours(0, 0, 0, 0) - (1000 * 60 * 60 * 24 * 2) || +new Date(parseInt(t[2], 10) ||
                date.getFullYear(),
                (monthsukr.indexOf(t[1].substr(0, 3)) !== -1) ? monthsukr.indexOf(t[1].substr(0, 3)) :
                    months.indexOf(t[1].substr(0, 3)) === -1 ? 4 : months.indexOf(t[1].substr(0, 3)), // May if indexOf === -1
                parseInt(t[0], 10));
    },

    getUpdateTimeString: function (time) {
        var updateDate = new Date(time),
            today = new Date(),
            yesterday = new Date(today - 24 * 60 * 60 * 1000),
            dayBeforeYesterday = new Date(today - 2 * 24 * 60 * 60 * 1000),
            date,
            month,
            year;

        if (today.getDate() === updateDate.getDate() &&
            today.getMonth() === updateDate.getMonth() &&
            today.getFullYear() === updateDate.getFullYear()) {
            return AppLocale.get("today");
        } else if (yesterday.getDate() === updateDate.getDate() &&
            yesterday.getMonth() === updateDate.getMonth() &&
            yesterday.getFullYear() === updateDate.getFullYear()) {
            return AppLocale.get("yesterday");
        } else if (dayBeforeYesterday.getDate() === updateDate.getDate() &&
            dayBeforeYesterday.getMonth() === updateDate.getMonth() &&
            dayBeforeYesterday.getFullYear() === updateDate.getFullYear()) {
            return AppLocale.get("day_before_yesterday");
        } else {
            date = updateDate.getDate() >= 10 ? updateDate.getDate() : "0" + updateDate.getDate();
            month = (updateDate.getMonth() + 1) >= 10 ? (updateDate.getMonth() + 1) : "0" + (updateDate.getMonth() + 1);
            year = updateDate.getFullYear();

            return date + "." + month + "." + year;
        }
    },

    formatUpdateTime: function (time) { // updates notification
        var updateDate = new Date(time),
            today = new Date(),
            yesterday = new Date(today - 24 * 60 * 60 * 1000),
            date = updateDate.getDate() >= 10 ? updateDate.getDate() : "0" + updateDate.getDate(),
            month = (updateDate.getMonth() + 1) >= 10 ? (updateDate.getMonth() + 1) : "0" + (updateDate.getMonth() + 1),
            year = updateDate.getFullYear(),
            h = updateDate.getHours(),
            m = updateDate.getMinutes(),
            timeOfUp = (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
        result = {dateOfUp: date + "." + month + "." + year};

        if (today.getDate() === updateDate.getDate() &&
            today.getMonth() === updateDate.getMonth() &&
            today.getFullYear() === updateDate.getFullYear()) {
            result.day = 'today';
            result.timeOfUp = timeOfUp;

        } else if (yesterday.getDate() === updateDate.getDate() &&
            yesterday.getMonth() === updateDate.getMonth() &&
            yesterday.getFullYear() === updateDate.getFullYear()) {
            result.day = 'yesterday';
            result.timeOfUp = timeOfUp;
        }

        return result;
    },


    /**
     * Возвращает единицу измерения с правильным окончанием
     *
     * @param {Number} num      Число
     * @param {Object} cases    Варианты слова {nom: 'час', gen: 'часа', plu: 'часов'}
     * @return {String}
     */

    endings: function (num, cases) {
        num = Math.abs(num);

        var word = '';

        if (num.toString().indexOf('.') > -1) {
            word = cases.gen;
        } else {
            word = (
                num % 10 == 1 && num % 100 != 11
                    ? cases.nom
                    : num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20)
                    ? cases.gen
                    : cases.plu
            );
        }

        return word;
    },
    formatNumber: function (c, d, t) {
        var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    },


    toHex8: function (num) {
        return (num < 16 ? "0" : "") + num.toString(16);
    },
    hexEncodeU32: function (num) {
        var result = this.toHex8(num >>> 24);
        result += this.toHex8(num >>> 16 & 255);
        result += this.toHex8(num >>> 8 & 255);
        return result + this.toHex8(num & 255);
    },
    getHash: function (value) {
        var combination = 16909125;
        var seed = "Mining PageRank is AGAINST GOOGLE'S TERMS OF SERVICE. Yes, I'm talking to you, scammer.";
        var doIcare = 'no';
        for (var i = 0; i < value.length; i++) {
            combination ^= seed.charCodeAt(i % seed.length) ^ value.charCodeAt(i);
            combination = combination >>> 23 | combination << 9;
        }
        return this.hexEncodeU32(combination);
    },
    xhr: function (request, listener) {
        var xhr = new window.XMLHttpRequest(),
            url = decodeURI(request);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    listener(xhr.responseText);
                }
            }
        };

        xhr.open('GET', url, true);
        xhr.send(null);
    },

    getOptions: function (a, settings = {}) { //TODO: improve using filters
        var data = {},
            o = a.options,
            res;

        for (var i in o) {
            data[o[i]] = settings[o[i]] ||
            (typeof rdz.setting.options[o[i]] == "function" ? rdz.setting.options[o[i]]() : rdz.setting.options[o[i]]);
        }

        res = o.length === 1 ? data[o[0]] : data;

        if (res && res.length && a.filter) {
            if (a.filter.indexOf('SA') !== -1) {
                res = res.filter(function (e) {
                    return e.SA;
                });
            } else {
                res = res.filter(function (e) {
                    return !e.SA;
                });
                if (a.filter.indexOf('isNotFunction') !== -1) {
                    res = res.filter(function (e) {
                        return !e.isFunction;
                    });
                }
                if (a.filter.indexOf('bar') !== -1) {
                    res = res.filter(function (e) {
                        return !e.popup;
                    });
                }
            }
        }
        return res;
    },

    returnActiveFunctions: function (params) {
        var res = {};
        params = params.filter(function (e) {
            return e.active && e.isFunction;
        });
        params.forEach(function (e) {
            res[e.name] = e;
        });

        return res;
    },

    mergeWithOptions: function (obj, options, url, branch, settings) {
        var a = [];
        branch = branch || 'Bar';
        rdz._.each(options, function (e) {
            var o;
            //
            if (AppLocale.get_locale_str() === 'ru' || rdz.utils.locale.ru.parameters.indexOf(e.name) === -1) {
                o = rdz._.find(obj, function (e2) {
                    return e.name === e2.name;
                });
                o.options = {};
                o.options.active = e.active;

                //show cached values italic or don't
                o.options.italic = rdz.utils.getOptions({options: ['Bar']}, settings).italic;

                //options for additional requests
                o.extra = e.extra;

                if (url && o.name !== 'APICounters' && o.name !== 'IP') {
                    a.push(rdz.utils.addParameterData(o, url));
                }
                else {
                    a.push(o);
                }
            }
        });
        return a;
    },
    /**@method adds request's urls.
     * It's a trick %)
     * To be able handle clicks on parameter when bar in "Check by button" mode we need links.
     * Links we got only after request is returned, so here we add property urls in model before sending requests temporary and then delete it.
     * After that, when bar will be shown on content script once and we used data from urls, it never well be used in future*/
    addParameterData: function (o, url) {
        var options = {};
        options.model = o;
        options.url = url;
        //flag indicate should we send request or just copy request property
        options.only_property = true;

        var model = rdz.model.parameters.Factory.requestOneParameter(options);
        return rdz.utils.addDataFromRequest(o, model.request);
    },
    addDataFromRequest: function (o, request) {

        o.requests = {};

        if (request.serviceUrl || request.displayUrl) {
            if (request.serviceUrl) o.requests.serviceUrl = request.serviceUrl;
            if (request.displayUrl) o.requests.displayUrl = request.displayUrl;
            o.requests.url = request.url;
            o.requests.cached = request.cached;
        }
        else {
            for (var i in request) {
                if (request.hasOwnProperty(i) && request[i]) //if API request, serviceUrl can be is not defined
                {
                    o.requests[i] = {};
                    o.requests[i].serviceUrl = request[i].serviceUrl;
                    o.requests[i].url = request[i].url;
                    o.requests[i].cached = request[i].cached;
                    if (request[i].displayUrl) o.requests[i].displayUrl = request[i].displayUrl;
                }
            }
        }
        return o;
    },
    returnActiveParameters: function (params) {
        var a = [];
        rdz._.each(params, function (e) {
            if (e.options.active) a.push(e);
        });
        return a;
    },

    logAmount: function (amount) {
        var transform =
            [
                {name: 'k', ratio: 1000, start: 10000},
                {name: 'M', ratio: 1000000},
                {name: 'G', ratio: 1000000000},
                {name: 'T', ratio: 1000000000000}
            ];
        var trans = {name: '', ratio: 1};
        for (var i = 0, len = transform.length; i < len; i++) {
            var start = transform[i].start != null ? transform[i].start : transform[i].ratio;
            if (Math.abs(amount) >= start)
                trans = transform[i];
            else
                break;
        }
        var precision = 10;
        if (Math.abs(amount) >= trans.ratio * 10)
            precision = 1;
        return Math.round(precision * amount / trans.ratio) / precision + trans.name;
    },

    convert_WA_api_date: function (date) {
        return !date ? null :
            date === "0" ? 0 :
                +new Date(('' + date).replace(/(\d{0,4})(\d{0,2})(\d{0,2})*/, function (str, year, mounth) {
                    return new Date(Number(year, 10), Number(mounth, 10) - 1);
                }));
    },

    addClass: function (node, classStr) {
        classStr = classStr.split(" ");
        var cls = " " + node.className + " ";
        for (var i = 0, len = classStr.length, c; i < len; ++i) {
            c = classStr[i];
            if (c && cls.indexOf(" " + c + " ") < 0)
                cls += c + " ";
        }
        node.className = cls.trim();
    },
    /*aren't using*/
    removeClass: function (node, classStr) {
        var cls;
        if (classStr !== undefined) {
            classStr = classStr.split(" ");
            cls = " " + node.className + " ";
            for (var i = 0, len = classStr.length; i < len; ++i)
                cls = cls.replace(" " + classStr[i] + " ", " ");
            cls = cls.trim();
        }
        else
            cls = "";
        if (node.className != cls)
            node.className = cls;
    },
    returnOption: function (obj, option) {
        var v = [];
        for (var i in obj) {
            if (obj[i].name === option) v = obj[i];
        }
        return v;
    },
    loadInjected: async function (path) {
        // var req = new XMLHttpRequest();
        // req.open("GET", path, false);
        // req.send(null);
        // return req.responseText || 'Failed to load ' + path;

        const response = await fetch(path);
        return await response.text();
    },
    appendInjected: function (obj) {

        //var fragment = document.createElement(obj.name);
        var fragment = document.createElementNS('http://www.w3.org/1999/xhtml', obj.name);
        fragment.appendChild(document.createTextNode(obj.txt));
        document.getElementsByTagName('head')[0].appendChild(fragment);

    },
    /**@function prevent showing value from past domain*/
    isModelURLValid: function (a) {
        var url = a.requests.url || a.requests,
            valid = true;
        if (typeof url !== 'string') {
            for (var i in url) {
                if (url[i].url !== a.url) valid = false;
            }
        }
        else if (url !== a.url) {
            valid = false;
        }
        return valid;
    },

    isDomainInList: function (domain, list) {
        var all_dmn = list.replace(/^\s+|\s+$/g, '').split('\n'),
            l = all_dmn.length,
            cur_dmn;

        //domain is undefined when tab.status == 'loading' in Chrome
        for (; domain && l--;) {
            cur_dmn = new RegExp('((\\S+?\\.)|^)' + String(all_dmn[l]).toLowerCase().replace(/^\s+|\s+$/g, '').replace(/\*./g, ''));
            if (all_dmn[l] && (cur_dmn.test(domain))) return true;
            //cur_dmn = String(all_dmn[l]).toLowerCase().replace(/^\s+|\s+$/g, '').replace(/\*./g, '');
            //if (cur_dmn !== "" && (cur_dmn.length >= domain.length ? cur_dmn.indexOf(domain) !== -1 : domain.indexOf(cur_dmn) !== -1)) return true;
        }

    },
    optionsChanged: function (context) {
        context = context || window;
        for (var i in context.rdz.cache) {
            //mark all except domain
            if (i &&
                i.length !== rdz.utils.domainFromUri('http://' + i).domain.length) {
                context.rdz.cache.set([i, 'options_changed'], true);
            }
        }
    },
    toCapitaliseCase: function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    toSmallCase: function (string) {
        return string.charAt(0).toLowerCase() + string.slice(1);
    },
    SubstractDomainName: function (domain) {
        var domains_zone = '.freemarket.kiev.ua .h.com.ua .ho.com.ua .otaku.org.ua .pp.net.ua .ru.all-biz.info .ua.all-biz.info .ws.co.ua .fanforum.ru .e-gloryon.com .eto-ya.com .edusite.ru .energoportal.ru .eomy.net .diary.ru .dj.ru .do.am .e2e.ru .eclub.lv .co.cc .comintern.ru .dama-pik.ru .h1.ru .h10.ru .h11.ru .h12.ru .h13.ru .h14.ru .h15.ru .h16.ru .h17.ru .h18.ru .h2.ru .h3.ru .h4.ru .h5.ru .h6.ru .h7.ru .h8.ru .h9.ru .habrahabr.ru .hiblogger.net .g3g.ru .gallery.ru .gb.ru .googlepages.com .freeoda.com .free-ru.net .freeyellow.com .fteme.ru .free.bg .freeb.ru .freehostia.com .freelance.ru .fatal.ru .fis.ru .flamber.ru .flexum.ru .flybb.ru .forever.kz .fortunecity.com .forum24.ru .forum2x2.ru .forumbb.ru .fotki.com .fotoplex.ru .0catch.com .0pk.ru .100free.com .100freemb.com .10f.ru .110mb.com .150m.com .1gb.ru .1nsk.ru .24net.kz .2bb.ru .33b.mobi .33b.ru .3bb.ru .3dn.ru .3x.ro .4bb.ru .4put.ru .50webs.com .5bb.ru .6bb.ru .6te.net .70mb.ru .7bb.ru .7bk.ru .9bb.ru .addr.ru .agava.ru .alfamoon.com .alfaspace.net .all-biz.info .anihub.ru .at.ua .atspace.com .awardspace.com .ayola.net .beon.ru .beplaced.ru .best-host.ru .bestof.ru .bestpersons.ru .blog.ru .blog2x2.ru .blogi.by .blogspot.com .blox.ua .boom.ru .borda.ru .boxmail.biz .bravehost.com .chat.ru .chatcity.ru .chathome.ru .chats.ru .chatservice.ru .chatzone.ru .by.ru .clan.su .p0.ru .p8.ru .page.by .pdj.ru .orgfree.com .orthodoxy.ru .nx0.ru .offtop.ru .okis.ru .onego.ru .onepage.ru .narod.ru .narod2.ru .newmail.ru .nightparty.ru .net46.net .nm.ru .nnm.ru .nnov.ru .nnover.ru .noka.ru .mail15.com .mail333.com .makebetter.ru .mamusik.ru .lycos.com .m98.ru .madloud.com .mark-itt.ru .maxhost.ru .metroland.ru .mindmix.ru .mirahost.ru .mirtesen.ru .mhost.ru .miheeff.info .mmm-tasty.ru .mnogonado.net .moiforum.info .moikrug.ru .moy.su .moskva.com .mrezha.ru .my1.ru .mybb.ru .mybb2.ru .mybb3.ru .myguestbook.ru .myjulia.ru .mylivepage.ru .myminicity.com .my-php.net .na.by .ho.ua .hobby.ru .hoha.ru .holm.ru .host.sk .ho-sting.ru .hostland.su .hostobzor.ru .hostow.net .hotbox.ru .hoter.ru .hut.ru .hut1.ru .hut10.ru .hut2.ru .hut3.ru .hut4.ru .hut5.ru .hut6.ru .hut7.ru .hut8.ru .hut9.ru .ibord.ru .guestbook.ru .ifolder.ru .imhonet.ru .intobservatory.ru .intway.info .io.ua .informer.com .ixbb.ru .jimdo.com .jino.ru .jino-net.ru .jlt.ru .karelia.ru .keep4u.ru .km.ru .kazan.ws .krasnet.ru .kulichki.net .land.ru .lapin.ru .leaderhost.ru .liveforums.ru .liveinternet.ru .livejournal.com .locals.ru .lib.ru .lici.ru .ltalk.ru .x5x.ru .xbase.ru .ya.ru .yadviga.ru .vo.uz .wmsite.ru .wordpress.com .yard.ru .zbook.ru .zmail.ru .z-photo.ru .zzn.com .ucoz.ae .ucoz.com .ucoz.de .ucoz.es .ucoz.kz .ucoz.lv .ucoz.net .ucoz.org .ucoz.ru .ucoz.ua .ueuo.com .ufanet.ru .ukrbiz.net .ukrbiznes.com .tulpar.net .tut.by .tut.ru .tut.su .tut.ua .tu1.ru .tu2.ru .tvidi.ru .unlimhost.ru .ultranet.ru .vdforum.ru .vendedoronline.com .virtualave.net .wagoo.com .web-box.ru .webjump.com .webs.com .webservis.ru .webstolica.ru .webtalk.ru .webzone.ru .wen.ru .wetpaint.com .rpod.ru .ru.gg .ruboard.net .realbook.ru .reformal.ru .roleforum.ru .rolevaya.ru .rolka.su .rusmarket.ru .russchat.ru .rutube.ru .pp.ua .promodj.ru .qrz.ru .rbcmail.ru .rc-mir.com .pesni.ru .photoalbums.ru .photofile.ru .photohost.ru .photoshare.ru .pildid.com .pochta.ru .pokeroff.lv .pokeroff.ru .shop.by .sitebase.ru .sitecity.ru .siteedit.ru .sk6.ru .smartphone.ua .softonic.com .sourceforge.net .spravka.ua .spybb.ru .stroyportal.su .stroyvitrina.ru .su74.ru .sudrf.ru .svoiforum.ru .taba.ru .sytes.net .times.lv .tiu.ru .tomsk.net .eu.com.ua .tomsk.ru .togliatti.su .tom.ru .troitsk.su .syzran.ru .te.ua .termez.su .ternopil.ua .tagil.ru .tambov.ru .tashkent.su .tatarstan.ru .sochi.su .stavropol.ru .sumy.ua .surgut.ru .stv.ru .spb.ru .spb.su .smolensk.ru .snz.ru .rovno.ua .simbirsk.ru .ryazan.ru .pokrovsk.su .poltava.ua .penza.ru .penza.su .perm.ru .pl.ua .ptz.ru .pyatigorsk.ru .pskov.ru .pp.ru .pp.ua .rv.ua .sebastopol.ua .semsk.su .sakhalin.ru .samara.ru .samara.su .saratov.ru .rnd.ru .rubtsovsk.ru .ru.net .ru.com .vl.ru .vladikavkaz.ru .vladikavkaz.su .vladimir.ru .vladimir.su .vladivostok.ru .tver.ru .vinnica.ua .vdonsk.ru .uz.ua .uzhgorod.ua .tsaritsyn.ru .tsk.ru .tula.ru .tula.su .tuva.ru .tuva.su .ulan-ude.ru .tyumen.ru .udm.ru .udmurtia.ru .zaporizhzhe.ua .zt.ua .zp.ua .yuzhno-sakhalinsk.ru .zgrad.ru .zhitomir.ua .yaroslavl.ru .yekaterinburg.ru .vn.ua .vyatka.ru .volgograd.ru .vologda.ru .vologda.su .voronezh.ru .vrn.ru .yakutia.ru .yakutia.su .yalta.ua .yamal.ru .lipetsk.ru .lugansk.ua .lutsk.ua .lviv.ua .lenug.su .lg.ua .law.pro .k-uralsk.ru .kurgan.ru .kurgan.su .kursk.ru .kustanai.ru .kustanai.su .kuzbass.ru .krasnodar.su .krasnoyarsk.ru .ks.ua .kuban.ru .kchr.ru .int.ru .kr.ua .km.ua .kms.ru .koenig.ru .komi.ru .komi.su .kostroma.ru .kemerovo.ru .kiev.ua .kirov.ru .kirovograd.ua .kh.ua .khabarovsk.ru .khakassia.ru .khakassia.su .kharkov.ua .kherson.ua .khmelnitskiy.ua .khv.ru .karelia.su .kazan.ru .joshkar-ola.ru .kaliningrad.ru .kalmykia.ru .kalmykia.su .kaluga.ru .kaluga.su .kamchatka.ru .karacol.su .karaganda.su .izhevsk.ru .jamal.ru .jambyl.su .jar.ru .ivano-frankivsk.ua .ivanovo.ru .ivanovo.su .irk.ru .irkutsk.ru .in.ua .exnet.su .if.ua .idv.tw .nakhodka.ru .nalchik.ru .nalchik.su .murmansk.ru .murmansk.su .mytis.ru .mosreg.ru .msk.ru .msk.su .msu.su .mordovia.ru .mordovia.su .mos.ru .mk.ua .magadan.ru .magnitka.ru .mangyshlak.su .mari.ru .mari-el.ru .marine.ru .norilsk.ru .north-kazakhstan.su .nov.ru .nov.su .novosibirsk.ru .nn.ru .newmail.ru .nikolaev.ua .nkz.ru .net.cn .net.ru .net.ua .navoi.su .orenburg.ru .med.pro .omsk.ru .obninsk.su .od.ua .odessa.ua .nsc.ru .nsk.ru .nsk.su .oryol.ru .oskol.ru .org.by .org.cn .org.ru .org.tw .org.ua .org.uk .palana.ru .ck.ua .cmw.ru .cn.ua .cbg.ru .chel.ru .chelyabinsk.ru .cherkassy.ua .chernigov.ua .chernovtsy.ua .chimkent.su .chita.ru .chukotka.ru .chuvashia.ru .bryansk.ru .bryansk.su .bukhara.su .buryatia.ru .bir.ru .biz.ua .azerbaijan.su .belgorod.ru .belgorod.su .baikal.ru .balashov.su .bashkiria.ru .bashkiria.su .basnet.by .ashgabad.su .astrakhan.ru .arkhangelsk.ru .arkhangelsk.su .armenia.su .altai.ru .aktyubinsk.su .amur.ru .amursk.ru .ac.ru .adygeya.ru .adygeya.su .abkhazia.su .georgia.su .gov.by .gov.ru .gov.ua .grozny.ru .grozny.su .da.ru .dagestan.ru .dagestan.su .cv.ua .cpa.pro .crimea.ua .co.il .co.in .co.jp .co.kr .co.kz .co.nz .co.ua .co.uk .co.za .com.ar .com.au .com.br .com.by .com.cn .com.kz .com.my .com.pl .com.pt .com.ru .com.tw .com.ua .dn.ua .dnepropetrovsk.ua .east-kazakhstan.su .e-burg.ru .donetsk.ua .dp.ua .dudinka.ru .edu.au .edu.ru .edu.ua .fareast.ru .example .exit .ph .eu .eh .ee .eg .er .es .et .dz .dk .dm .dj .ec .do .edu .com .cs .csnet .cu .cv .cr .coop .cx .cy .cz .dd .de .gs .gt .gu .gp .gq .gr .gov .gd .ge .gb .ga .hk .hm .hn .gf .gg .gh .gi .gl .gm .gn .fx .fr .fm .fo .fj .fk .fi .ac .ae .aero .af .ag .ad .ai .an .al .am .arpa .as .ao .aq .ar .at .asia .au .aw .bb .bd .be .ba .az .ax .bj .bl .bitnet .biz .br .bv .bw .by .bs .bt .bu .bm .bn .bo .bf .bg .bh .bi .ci .ck .cc .cd .cf .cg .ch .bz .ca .cat .co .cn .cl .cm .pe .pa .nt .nu .nz .om .org .onion .nc .ne .net .nato .nl .nf .ng .ni .no .np .nr .ma .mc .md .me .ml .mm .mil .mo .mobi .mn .mk .mf .mg .mh .mp .mq .mr .mt .mu .ms .mz .na .museum .mv .mw .mx .my .name .ie .gw .gy .il .im .info .in .invalid .io .id .hr .ht .hu .is .it .ip .iq .ir .int .je .jp .jm .jo .jobs .ki .km .kg .kh .kp .kr .kn .ke .kw .ky .kz .la .lb .lc .li .ly .lv .lu .lr .ls .lt .lk .local .localhost .xn--p1ai .vu .ws .yt .yu .ye .zm .za .zw .zr .tz .ua .ug .uk .tv .tt .tw .va .vc .us .uucp .uy .uz .ve .um .vg .vi .vn .wf .rs .ru .ro .root .sb .sc .sd .se .sg .sh .rw .pr .pro .pt .ps .qa .pw .py .re .pm .pn .pk .pl .pf .pg .sa .si .sj .sk .sl .sm .so .sn .sr .st .su .sv .sy .tc .td .test .tf .tg .th .tel .sz .ts .tp .tr .travel .tj .tk .tl .tm .tn .to .рф'.split(' '),
            l = domains_zone.length,
            domain_zone = '',
            name;

        for (; l--;) {
            if (domain.indexOf(domains_zone[l]) !== -1 && domains_zone[l].length > domain_zone.length) {
                domain_zone = domains_zone[l];

            }
        }
        domain = domain.substring(0, domain.indexOf(domain_zone));
        return [(name = domain.split('.')) ? name[name.length - 1] : domain, domain_zone];
    },
    toFixed: function (num, dec) {
        var is_float = Boolean(num % 1);
        return +(is_float ? ((num).toFixed(dec)).replace(/0*$/, '') : num);
    },
    /**@function Sorting list of counters by value*/
    sortCounters: function (v) {

        // var values = rdz._.pairs(v); //convert object to the list of arrays
        var values = rdz._.pairs(v); //convert object to the list of arrays

        values.sort(function (a, b) {
            var i;
            if (a[1].value < 0 && typeof b[1].value === 'boolean') //if a is negative and b is boolean do nothing
            {
                i = 0;
            }
            else if (b[1].value < 0 && typeof a[1].value === 'boolean') {
                i = 1;                                //if a is boolean and b is negative, move b to the left
            }
            else {
                i = b[1].value - a[1].value;                      //compare a and b, greater value move to the left
            }
            return i;
        });
        return values;
    },

    counters_list: ['liveinternet', 'rambler', 'mail', 'hotlog', 'bigmir', 'i_ua', 'ya_metric', 'openstat', 'topstat', 'mycounter', 'log24', 'yandeg', 'mystat', 'hit_ua', 'Alexa', 'GA', 'uptolike', 'sape'],

    /**@function Detect all counters on the page, and parse its id */
    parseCounters: function (a, response) {
        var counters = {},
            self = this;

        a.forEach(function (e) {
            counters[e] = self.page_counter_parsers[e](response);
            //if (counters[e] === undefined) delete counters[e]; // if parser don't return id, delete it from counters
            if (!counters[e]) delete counters[e]; // if parser doesn't return id, delete it from counters
        });

        return counters;

    },
    /* Parsers for all counters*/
    page_counter_parsers: {
        'Alexa': function () {
            return '1';
        },
        'liveinternet': function (response) {
            var data = response || document.documentElement.innerHTML;
            var result = data.match(/http:\/\/www\.liveinternet\.ru|counter\.yadro\.ru/);
            return result !== null ? '1' : undefined;
        },
        'rambler': function (response) {
            var data = response || document.documentElement.innerHTML;
            var regex = /\/\/top100\.rambler\.ru\/home\?id=(\d+)|\/\/counter\.rambler\.ru\/top100.cnt\?(\d+)|_top100q\.push\(\["setAccount"\,[\s]*"[0-9]+"|top100\.rambler\.ru\/resStats\/(\d+)/;
            var result = data.match(regex);
            return result !== null ? result[0].replace(/top100|\D/gmi, '') : undefined;
        },
        'mail': function (response) {
            var data = response || document.documentElement.innerHTML;
            var regex = /http:\/\/top\.mail\.ru\/jump\?from=\d+/gmi;
            var result = data.match(regex);
            return result !== null ? result[0].replace(/\D/gmi, '') : undefined;
        },
        'hotlog': function (response) {
            var data = response || document.documentElement.innerHTML;
            var regex = /http:\/\/click\.hotlog\.ru\/\?\d+/gmi;
            var result = data.match(regex);
            return result !== null ? result[0].replace(/\D/gmi, '') : undefined;
        },
        'bigmir': function (response) {
            var data = response || document.documentElement.innerHTML;
            //var regex  = /http:\/\/c\.bigmir\.net\/\?.*?\d{2,}/gmi;
            var regex = /http:\/\/www\.bigmir\.net\/\?cl=\d+|http:\/\/c\.bigmir\.net\/\?v\d+/gmi;
            var result = data.match(regex);
            return result !== null ? result[0].replace(/\D/gmi, '') : undefined;
        },
        'i_ua': function (response) {
            var data = response || document.documentElement.innerHTML;
            var regex = /http:\/\/i\.ua\/r\.php\?\d+|i\.ua\/s\?u\d+/gmi;
            var result = data.match(regex);
            return result !== null ? result[0].replace(/\D/gmi, '') : undefined;
        },
        'ya_metric': function (response) {
            var data = response || document.documentElement.innerHTML;
            var regex = /src="(http:)?\/\/[bs|mc]+\.yandex\.ru\/[informer|watch]+\/\d+|yaCounter\d+"/gmi;
            var result = data.match(regex);
            return result !== null ? result[0].replace(/\D/gmi, '') : undefined;
        },
        /*'spylog' : function(){
         var data   = document.documentElement.innerHTML;
         if(data.indexOf('openstat') == -1){
         var regex = /spylog\d+|spylog\.com\/cnt\?cid=\d+/gmi;
         var result = data.match(regex);
         if(result !== null){
         var id = result[0].replace(/\D/gmi,'');
         }
         }
         return id;
         },*/
        'openstat': function (response) {
            var data = response || document.documentElement.innerHTML;
            // var regex = /openstat\d+/gmi;
            var result = data.match(/openstat\d+/gmi) || data.match(/spylog\d+|spylog\.com\/cnt\?cid=\d+/gmi);
            return result !== null ? result[0].replace(/\D/gmi, '') : undefined;
        },
        'topstat': function (response) {
            var data = response || document.documentElement.innerHTML;
            var regex = /http:\/\/www\.topstat\.ru\/rating\/button\/\?f=\d+/gmi;
            var result = data.match(regex);
            return result !== null ? result[0].replace(/\D/gmi, '') : undefined;
        },
        'mycounter': function (response) {
            var data = response || document.documentElement.innerHTML;
            var regex = /http:\/\/get\.mycounter(\.com)?\.ua\/counter\.php\?id=\d+/gmi;
            var result = data.match(regex);
            return result !== null ? result[0].replace(/\D/gmi, '') : undefined;
        },
        'log24': function (response) {
            var data = response || document.documentElement.innerHTML;
            var regex = /http:\/\/counter\.24log\.ru\/counter\?id=\d+/gmi;
            var result = data.match(regex);
            return result !== null ? result[0].replace(/24log|\D/gmi, '') : undefined;
        },
        'yandeg': function (response) {
            var data = response || document.documentElement.innerHTML;
            var regex = /http:\/\/count\.yandeg\.ru\/(sitecnt|cnt)\.php\?id=\d+/gmi;
            var result = data.match(regex);
            return result !== null ? result[0].replace(/\D/gmi, '') : undefined;
        },
        'mystat': function (response) {
            var data = response || document.documentElement.innerHTML;
            var regex = /http:\/\/(\d+\.)?c\.mystat-in\.net(\/.?\d+)?/gmi;
            var result = data.match(regex);
            if (result !== null) {
                if (result.length == 1) {
                    var id = result[0].replace(/\D/gmi, '');
                }
                else {
                    var id = result[result.length - 1].replace(/\D/gmi, '');
                }
            }
            return id;
        },
        'hit_ua': function (response) {
            var data = response || document.documentElement.innerHTML;
            var regex = /http:\/\/hit\.ua\/\?.=\d+/gmi;
            var result = data.match(regex);
            return result !== null ? result[0].replace(/\D/gmi, '') : undefined;
        },
        'GA': function (response) {
            var data = response || document.documentElement.innerHTML;
            if (data.indexOf('google-analytics') !== -1) {
                //var regex = /UA-\d{1,}-\d{1,}/gmi,
                var regex = /getTracker\(["'](UA-\d*-\d*)["']\)|_uacct\s?=\s?["'](UA-\d*-\d*)["']|\[["']_setAccount["']\s?,\s?["'](UA-\d*-\d*)["']\]|ga\(["']create["']\s?,\s?["'](UA-\d*-\d*)["']/mi,
                    result = data.match(regex);
                if (result) var id = result[1]; //result[0];
            }
            return id;
        },
        'uptolike': function (response) {
            var data = response || document.documentElement.innerHTML;
            var regex = /https?:\/\/w\.uptolike\.com\/widgets\/v1\/zp\.js\?pid=(\d+)/i;
            var result = data.match(regex);
            return result && result[1] ? result[1] : undefined;
        },
        'sape': function (response) {
            var data = response || document.documentElement.innerHTML;
            var regex = /acint\.net\/aci\.js/i;
            var result = data.match(regex);
            return result !== null ? '1' : undefined;
        }
    },

    /**
     * returns the correct form of the word depending on the value
     * @param number
     * @returns {String}
     */
    getRecordFromNum: function (number) {
        if (!number || number == null) number = 0;
        var locale;
        if (rdz.setting) {
            locale = rdz.setting.options.Bar.locale;
        } else {
            locale = rdz.app.content.bar.get('options').locale;
        }

        var titles = locale == 'ru' ? ['запись', 'записи', 'записей'] : ['note', 'notes', 'notes'],
            cases = [2, 0, 1, 1, 1, 2];

        return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
    },
    /**
     * returns the correct form of the word depending on the value
     * @param number
     * @returns {String}
     */
    getMirrorsFromNum: function (number) {
        if (!number || number == null) number = 0;
        var titles = ['зеркало', 'зеркала', 'зеркал'],
            cases = [2, 0, 1, 1, 1, 2];

        return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
    },

    getSEOTags: function (options, url) {
        // exceptions
        var hardList = options.exceptions.value;
        var domain = window.rdz.utils.domainFromUri(url).domain.toLowerCase();
        if (window.rdz.utils.isDomainInList(domain, hardList)) {
            return ('<span>' + rdz.locale.notification['exception_domain'] + '</span>' + '<a class="rds-notification-options">' + rdz.locale.notification['options'] + '</a>');
        }

        var metas = document.head.getElementsByTagName("meta"),
            links = document.head.getElementsByTagName("link"),
            title = "",
            keywords = "",
            description = "",
            canonical = "",
            metaRobots = "",
            keyreg = /^keywords$/i,
            descreg = /^description$/i,
            canonicalreg = /^canonical$/i,
            TITLE_RANGE_MIN = 0,
            TITLE_RANGE_MAX = 70,
            DESCRIPTION_RANGE_MIN = 80,
            DESCRIPTION_RANGE_MAX = 200,
            KEYWORDS_RANGE_MIN = 0,
            KEYWORDS_RANGE_MAX = 250;

        function gettagcont(tag) {
            var docpage = document, result = "", elems = docpage.getElementsByTagName(tag);
            if (elems.length !== 0) {
                result = '<span class="rds-bold">' + tag.toUpperCase() + ":</span> ";
                if (elems.length > 1) {
                    result += elems[0].textContent;
                    for (var i = 1; i < elems.length; i++) {
                        if (elems[i].textContent !== "") {
                            result += " || " + elems[i].textContent;
                        }
                    }
                } else {
                    // if the webpage contains incorrect markup then there can be empty tags
                    if (elems[0].textContent !== "") {
                        result += elems[0].textContent;
                    } else {
                        result = "";
                    }
                }
            }

            return result;
        }

        var titles = document.head.getElementsByTagName("title"),
            titleStrs = [], titleSymbCount = 0,
            descriptionStrs = [], descriptionSymbCount = 0,
            keywordsStrs = [], keywordsSymbCount = 0,
            metaRobotsStrs = [];

        // title tags
        if (options._title.active) {
            for (var i = 0, len = titles.length; i < len; i++) {
                if (titles[i] !== "") {
                    titleStrs.push(titles[i].textContent.replace(/\s{2,}/g, " "));
                    titleSymbCount += titles[i].textContent.replace(/\s{2,}/g, " ").length;
                }
            }
        }

        // meta tags
        for (let i = 0, len = metas.length; i < len; i++) {
            if (metas[i] !== "") {
                var metaName = metas[i].getAttribute('name'),
                    metaContent = metas[i].getAttribute('content');
                
                metaName = metaName ? metaName.trim() : metaName;
                
                // description
                if (options.description.active) {
                    if ((descreg.test(metaName) || descreg.test(metas[i].getAttribute("http-equiv"))) && metaContent) {
                        descriptionStrs.push(metaContent.replace(/\s{2,}/g, " "));
                        descriptionSymbCount += metaContent.replace(/\s{2,}/g, " ").length;
                    }
                }

                // key words
                if (options.keywords.active) {
                    if ((keyreg.test(metaName) || keyreg.test(metas[i].getAttribute("http-equiv"))) && metaContent) {
                        keywordsStrs.push(metaContent.replace(/\s{2,}/g, " "));
                        keywordsSymbCount += metaContent.replace(/\s{2,}/g, " ").length;
                    }
                }
                
                // meta robots
                if (options.metaRobots.active) {
                    if (metaName === 'robots' && metaContent) {
                        metaRobotsStrs.push(metaContent.replace(/\s{2,}/g, " "));
                    }
                }
            }
        }

        // links with rel="canonical"
        if (options.canonical.active) {
            for (let i = 0, len = links.length; i < len; i++) {
                if (canonicalreg.test(links[i].getAttribute("rel")) && links[i].getAttribute("href") !== "") {
                    if (canonical === "") {
                        canonical = '<span class="rds-bold">Canonical:</span> ' + links[i].getAttribute('href');
                    } else {
                        canonical += " || " + links[i].getAttribute("href");
                    }
                }
            }
        }

        var frag = [], fragh1 = '', h = ["h1", "h2", "h3", "h4", "h5", "h6"];

        //H1
        if (options.h1.active) {
            let cont = gettagcont(h[0]);
            if (cont) {
                fragh1 = cont.replace(/\s{2,}/g, " ") + "\n";
            }
        }

        //H2-H6
        if (options.h2_h4.active) {
            for (let i = 1, len = h.length; i < len; i++) {
                let cont = gettagcont(h[i]);
                if (cont) {
                    frag.push(cont.replace(/\s{2,}/g, " "));
                }
            }
        }

        var html = rdz.$('<div1></div1>');
        if (titleSymbCount > 0) html.append('<div1><span class="rds-bold">' + 'Title ' + '(<span1 class="rds-' + (TITLE_RANGE_MIN <= titleSymbCount && titleSymbCount <= TITLE_RANGE_MAX ? 'green' : 'red') + '">' + titleSymbCount + '</span1>)' + ':</span> ' + titleStrs.join(' || ') + '</div1>');
        if (descriptionSymbCount > 0) html.append('<div1><span class="rds-bold">' + 'Description ' + '(<span1 class="rds-' + (DESCRIPTION_RANGE_MIN <= descriptionSymbCount && descriptionSymbCount <= DESCRIPTION_RANGE_MAX ? 'green' : 'red') + '">' + descriptionSymbCount + '</span1>)' + ':</span> ' + descriptionStrs.join(' || ') + '</div1>');
        if (keywordsSymbCount > 0) html.append('<div1><span class="rds-bold">' + 'Keywords ' + '(<span1 class="rds-' + (KEYWORDS_RANGE_MIN <= keywordsSymbCount && keywordsSymbCount <= KEYWORDS_RANGE_MAX ? 'green' : 'red') + '">' + keywordsSymbCount + '</span1>)' + ':</span> ' + keywordsStrs.join(' || ') + '</div1>');
        if (fragh1.length > 0) html.append('<div1>' + fragh1 + '</div1>');
        if (frag.length > 0) {
            frag.forEach(function (h) {
                html.append('<div1>' + h + '</div1>');
            });
        }
        if (canonical.length > 0) html.append('<div1>' + canonical + '</div1>');
        if (metaRobotsStrs.length)
            html.append('<div1><span class="rds-bold">Robots:</span> ' + metaRobotsStrs.join(' || ') + '</div1>');

        return html.html();
    },

    toggleEditMode: function () {
        let body = document.body;
        body.contentEditable = body.contentEditable !== 'true';
        document.querySelector('.rds-cnt.rds-edit_mode').classList.toggle('checked');
    },

    showNotification: function (data, options) {
        var container = document.body && document.body.tagName === 'BODY' ?
                document.body : document.getElementsByTagName('html')[0],
            view = new window.rdz.view.Notification({
                model: new (rdz.Backbone.Model.extend({
                    defaults: {data: data}
                }))
            }),
            notification,
            t;

        rdz.$('.rds-bar-notification.' + options.openerClass).remove();
        t = calculatePosition();
        notification = view.render().el;
        rdz.$(container).prepend(notification);
        rdz.$(notification).css('top', t);

        /* options */

        rdz.$(notification).addClass(options.openerClass);

        // add the opener class which will be used to open CM on the options page
        rdz.$(rdz.$(notification).find('.rds-notification-options')).addClass(options.openerClass);

        // add the copy button
        if (options && options.copyButton) {
            rdz.$(notification).find('.rds-notification-content')
                .after('<div1 class="rds-cnt rds-notification-copy"><div1 class="rds-prm">' + rdz.locale.bar.buttons.copy + '</div1></div1>');

            var tags = document.querySelector('.seo_tags .rds-notification-content').children[0].children,
                seoContent = [];

            for (var i = 0; i < tags.length; i++) {
                seoContent.push(tags[i].textContent);
            }

            rdz.$(notification).find('.rds-notification-copy')
                .bind("click", function () {
                    rdz.cmessenger.post({
                        method: 'message',
                        request: 'COPY_TEXT_ContentResponse',
                        //text: rdz.$(notification).find('.rds-notification-content .rds-prm').text()
                        text: seoContent.join('\r\n')
                    });
                });
        }

        if (options && options.doNotShowAgain) {
            rdz.$(notification).find('.rds-notification-content')
                .after('<div1 class="rds-cnt rds-notification-do-not-show-again">' + rdz.locale.notification.do_not_show_again + ' <input type="checkbox" class="rds-notification-checkbox"></input></div1>');
            rdz.$(notification).find('.rds-notification-checkbox')
                .bind("click", function () {
                    rdz.cmessenger.post({
                        method: 'message',
                        request: 'NOTIFICATION_DO_NOT_SHOW_ContentResponse',
                        openerClass: options.openerClass,
                        checked: rdz.$(notification).find('.rds-notification-checkbox').prop('checked')
                    });
                });
        }

        // add the discussion button
        if (options && options.discussionButton) {
            rdz.$(notification).find('.rds-notification-content')
                .after('<div1 class="rds-cnt rds-notification-discussion"><div1 class="rds-prm">' + rdz.locale.bar.buttons.discussion + '</div1></div1>');

            rdz.$(notification).find('.rds-notification-discussion')
                .bind("click", function () {
                    rdz.cmessenger.post({
                        method: 'message',
                        request: 'UPDATES_DISCUSSION_ContentRequest'
                    });
                });
        }

        if (options && options.css && options.selector) {
            rdz.$(notification).find(options.selector).css(options.css);
        }

        // calculate css top value for the notification
        function calculatePosition() {
            var t = 0,
                h,
                margin = 5,
                panels = rdz.$('.rds-bar').add(".rds-bar-notification");
            panels.each(function (index) {
                h = parseInt(rdz.$(this).css('height'));
                if (isFinite(h)) t += h;
            });
            if (t === 0) {
                t = 30;
            }
            return (t + margin);
        }
    },

    clickSEOTags: function (bar) {
        rdz.$(function () {
            if (!bar.get('functions')) return;

            if (rdz.$('.rds-bar-notification.seo_tags').length > 0 ||
                rdz.$('.rds-seo_tags.checked').length > 0) {
                rdz.$('.rds-bar-notification.seo_tags').remove();
                rdz.$('.rds-seo_tags').removeClass('checked');
                rdz.cmessenger.post({
                    method: 'message',
                    request: 'SEOTAGS_CHECKED_ContentResponse',
                    checked: false
                });
            } else {
                var url = document.location.href;
                var SEOTags = rdz.utils.getSEOTags(bar.get('functions').SEOTags.extra, url);

                // exceptions
                var hardList = bar.get('functions').SEOTags.extra.exceptions.value;
                var domain = window.rdz.utils.domainFromUri(url).domain.toLowerCase();
                var copyButton = !window.rdz.utils.isDomainInList(domain, hardList);

                if (SEOTags) {
                    rdz.utils.showNotification(SEOTags, {openerClass: 'seo_tags', copyButton: copyButton});
                }

                rdz.$('.rds-seo_tags').addClass('checked');
                rdz.cmessenger.post({
                    method: 'message',
                    request: 'SEOTAGS_CHECKED_ContentResponse',
                    checked: true
                });
            }
        });
    },

    checkSeobudgetUpdates: function (settings) { // background
        var parameters = rdz.utils.getOptions({ options: ['Parameters'] }, settings),
            updates = parameters.find(p => p.name === 'Updates');

        if (updates && updates.active) {
            let updates = {},
                curr = rdz.cache.get(['ApplicationData', 'Seobudget']),
                otherData = settings.OtherData,
                prev = otherData.Seobudget;

            for (let up in curr) {
                if (prev[up] < curr[up]) {
                    updates[up] = {
                        curr_up: curr[up],
                        prev_up: prev[up]
                    };
                    prev[up] = curr[up];
                }
            }

            if (!rdz._.isEmpty(updates)) {
                chrome.storage.local.set({ OtherData: otherData });
                portRequest.postMessage({
                    method: 'message',
                    request: 'SHOW_UPDATES_NOTIFICATION_ContentRequest',
                    updates: updates
                });
            }
        }
    },

    showUpdatesNotification: function (updates) { // content
        var message,
            up,
            diff,
            diffStr,
            updateTimeObj;

        message = rdz.locale.notification.updates.greet;

        for (up in updates) {
            // Ignore BY, IYD, IYDP, etc. as they are extra and only general IY need to show
            if (!rdz.locale.notification.updates[up]) continue;

            updateTimeObj = rdz.utils.formatUpdateTime(updates[up].curr_up);
            if (updateTimeObj.day) {
                message += ' ' + rdz.locale[updateTimeObj.day] + ',';
            }
            message += ' ' + getStringDate(updates[up].curr_up);
            if (updateTimeObj.day) {
                message += ' ' + rdz.locale.notification.updates.at + ' ' + updateTimeObj.timeOfUp;
            }

            message += rdz.locale.notification.updates.up_detected;
            message += rdz.locale.notification.updates[up];

            diff = Math.floor((updates[up].curr_up - updates[up].prev_up) / (1000 * 60 * 60 * 24));
            diffStr = diff + ' ' + rdz.utils.endings(diff, rdz.locale.days);
            message += ', ' + rdz.utils.endings(diff, rdz.locale.passed);
            message += ' ' + diffStr;
            message += rdz.locale.notification.updates.prev_up + '.';
        }

        if (!('USER' in updates)) {
            message += ' ' + rdz.locale.notification.updates.end;
        }

        rdz.utils.showNotification(message, {openerClass: 'updates', 'doNotShowAgain': true, discussionButton: true});

        rdz.$('.rds-bar-notification.updates').data('updates', updates);

        function getStringDate(ms) {
            var date = new Date(ms),
                d = date.getDate(),
                m = date.getMonth() + 1,
                y = date.getFullYear();
            return d + "." + (m < 9 ? "0" : "") + m + "." + y;
        }
    },

    checkRDSNotification: function (settings) { // background
        var otherData = settings.OtherData,
            rds_notification;

        if (otherData) {
            rds_notification = otherData.rds_notification;

            if (!rds_notification) {
                return;
            }

            if (!rds_notification.prev ||
                +(new Date(rds_notification.curr.Date)) > +(new Date(rds_notification.prev.Date))
            ) {
                portRequest.postMessage({
                    method: 'message',
                    request: 'SHOW_RDS_NOTIFICATION_ContentRequest',
                    data: rds_notification.curr
                });
            }
        }
    },

    showRDSNotification: function (data) { // content
        var message = data.Message;

        rdz.utils.showNotification(message, {openerClass: 'rds_notification'});

        rdz.$('.rds-bar-notification.rds_notification').data('data', data);
    },

    getRSSLinks: function () {
        var RSSLinks = rdz.$('link').filter(function (index) {
            return rdz.$(this).attr('type') === 'application/rss+xml' ||
                rdz.$(this).attr('type') === 'application/atom+xml';
        });

        var objectsArray = [];

        rdz.$.each(RSSLinks, function (index, value) {
            objectsArray.push({
                href: rdz.$(value).prop('href'),
                title: rdz.$(value).attr('title')
            });
        });

        return objectsArray;
    },

    // taken from FF
    sortSeoMarkets: function (seos, activeMarketsSum) {
        var seosObj = seos;
        seos = [];
        for (var name in seosObj) {
            if (seosObj[name] === "yes") {
                seos.push(name);
            }
        }

        var css_class = ''; // 'unchecked', 'yes', 'no', 'bankrupt', 'authoris', 'reset'
        if (typeof seos === "string") {
            css_class = seos; // 'bankrupt', 'logoff', 'reset'
        } else if (seos) {
            css_class = seos.length > 0 ? 'yes' : 'no';
        } else {
            css_class = 'unchecked';
        }

        var sorted = [],
            sorted_in = [],
            sorted_out = [],
            sorted_off = [];

        for (var i in rdz.utils.Seo_NumberByName) {
            if (rdz.utils.Seo_NumberByName.hasOwnProperty(i)) {
                // assign value: toolbar, tooltip, infosite
                if (css_class === 'bankrupt' || css_class === 'authoris' || css_class === 'unchecked' || css_class === 'reset') {
                    //toolbar
                    sorted.push([i, css_class]);
                } else if (css_class === 'yes' || css_class === 'no') {
                    var markets = rdz.utils.mapingSeoMarkets(activeMarketsSum),
                        sub_class = rdz._.find(markets, function (e) {
                            return e[0] === i;
                        }) ? 'no' : 'unchecked';
                    //checking whether SEO market in JSON response
                    for (var j = seos.length; j--;) {
                        if (seos[j] === i) {
                            sub_class = 'yes';
                            sorted_in.push([i, sub_class]);
                        }
                    }
                    if (sub_class === 'no') {
                        sorted_out.push([i, sub_class]);
                    } else if (sub_class === 'unchecked') {
                        sorted_off.push([i, sub_class]);
                    }
                }
            }
        }
        sorted_out = sorted_out.concat(sorted_off);

        //filter copies
        if (sorted_in.length > 0) {
            sorted_in.map(function (o, i, arr) {
                for (var g in sorted_out) {
                    if (sorted_out[g][0] === o[0]) sorted_out.splice(g, 1);
                }
            });
        }
        sorted = sorted.concat(sorted_in, sorted_out);

        return {
            sorted: sorted,
            sorted_in: sorted_in
        };
    },

    // taken from FF
    mapingSeoMarkets: function (data) {
        if (!data) return [];
        //sorting object's property from min to max
        var sortable = [];
        for (var i in rdz.utils.Seo_NumberByName) {
            sortable.push([i, rdz.utils.Seo_NumberByName[i]]);
        }
        sortable.sort(function (a, b) {
            return a[1] - b[1];
        });
        //collect markets from binary number by mapping
        var indexes = (data).toString(2),
            newdata = [];
        for (var o = indexes.length - 1; o >= 0; o -= 1) {
            if (indexes[o] === '1') {
                newdata.push(sortable[indexes.length - 1 - o]);
            }
        }
        return newdata;
    },

    // construct graph (taken from FF)
    createChartURL: function (dataChart) {

        // round max and min value and getting the values for the left axis of the praph
        function graphNum(num) {
            var len = (num + '').length;

            function round(dig) {
                dig = Math.round(dig * 10) / 10;
                return dig;
            }
            if (len > 6) {
                num = num / 1000000;
                num = round(num) + 'M';
                return num;
            }
            if (len > 3) {
                num = num / 1000;
                num = round(num) + 'K';
                return num;
            }
            return num;
        }

        dataChart.minValue = dataChart.minValue + '';
        dataChart.minValue = +(((+(dataChart.minValue[0] + dataChart.minValue[1])) - 0) + 'e' + (dataChart.minValue.length - 2));
        dataChart.maxValue = dataChart.maxValue + '';
        dataChart.maxValue = +(((+(dataChart.maxValue[0] + dataChart.maxValue[1])) + 1) + 'e' + (dataChart.maxValue.length - 2));
        dataChart.chxl1 = [
            graphNum(dataChart.minValue), graphNum((dataChart.minValue + dataChart.maxValue) / 2), graphNum(dataChart.maxValue)];


        // generating the curve and values for the bottom axis of the praph (months)
        var maxData = dataChart.maxValue - dataChart.minValue;
        dataChart.chd = [];
        dataChart.chxl0 = [];
        for (var l = dataChart.data.length, i = 0; i < l; i++) {
            dataChart.chd.push(Math.round((dataChart.data[i][1] - dataChart.minValue) * 100 / maxData));
        }
        for (var l = dataChart.data.length - 1; l >= 0; l -= 15) {
            var time = new Date(+dataChart.data[l][0]);
            dataChart.chxl0.unshift(rdz.utils.getMonthName(time.getMonth()) + "'" + time.getDate());
        }

        return 'https://chart.googleapis.com/chart?chs=460x200&cht=lc&chd=t:' + dataChart.chd.join(',') +
            '&chco=ff0000&chg=0,25,3,2,10&chxt=x,y&chxl=0:|' + dataChart.chxl0.join('|') + '|1:|' +
            dataChart.chxl1.join('|') + '&chtt=' + dataChart.chtt;
    },

    createSimilarWebChartURL: function (data) {
        var dataChart = {
            data: [],
            chtt: rdz.setting.options.Bar.locale === 'ru' ? 'Посещаемость сайта (в день)' : 'Site Visits (per month)',
            minValue: 0,
            maxValue: 100
        },
            d, i, len,
            splittedDate, v;

        function graphNum(num) {
            if (num / 1000000 > 1) {
                num = (Math.round(num / 100000) / 10) + 'M';
            } else if (num / 1000 > 1) {
                num = (Math.round(num / 100) / 10) + 'K';
            }

            return num;
        }

        let days = rdz.setting.options.Bar.locale === 'ru' ? 30 : 1;
        for (i = 0, len = data.length; i < len; i += 1) {
            d = data[i].Date;
            splittedDate = d.split('-');
            v = Math.round(data[i].Value / days);
            if (v > dataChart.maxValue) {
                dataChart.maxValue = v;
            }
            dataChart.data.push([d, v]);
        }

        dataChart.chxl1 = [
            0,
            graphNum(Math.round(dataChart.maxValue * 1 / 5)),
            graphNum(Math.round(dataChart.maxValue / 2)),
            graphNum(Math.round(dataChart.maxValue * 4 / 5)),
            graphNum(dataChart.maxValue)
        ];
        var maxData = dataChart.maxValue;
        dataChart.chd = [];
        dataChart.chxl0 = [];
        for (var len = dataChart.data.length, i = 0; i < len; i++) {
            dataChart.chd.push(Math.round(dataChart.data[i][1] * 100 / maxData));
        }

        if (dataChart.data.length > 15) {
            var move = Math.round((dataChart.data.length - 1) / 5);
            for (var len = dataChart.data.length - 1; len >= 0; len -= move) {
                splittedDate = dataChart.data[len][0].split('-');
                dataChart.chxl0.unshift(rdz.utils.getMonthName(+ splittedDate[1] - 1) + ' ' + splittedDate[0].substr(2));
            }
            splittedDate = dataChart.data[0][0].split('-');
            dataChart.chxl0.unshift(rdz.utils.getMonthName(+ splittedDate[1] - 1) + ' ' + splittedDate[0].substr(2));
        } else {
            for (var len = dataChart.data.length - 1; len >= 0; len -= 1) {
                splittedDate = dataChart.data[len][0].split('-');
                dataChart.chxl0.unshift(rdz.utils.getMonthName(+ splittedDate[1] - 1) + ' ' + splittedDate[0].substr(2));
            }
        }

        return 'https://chart.googleapis.com/chart?chs=460x200&cht=lc&chd=t:' + dataChart.chd.join(',') +
            '&chco=066799&chg=14.3,25,3,2,14.3&chxt=x,y&chxl=0:|' + dataChart.chxl0.join('|') + '|1:|' + dataChart.chxl1.join('|') +
            '&chxp=0,3&chtt=' + dataChart.chtt + '&chts=000000,15&chm=D,0033FF,0,0,5,1';
    },

    // convert month number to name
    getMonthName: function (monthNum) {
        switch (monthNum) {
            case 0:
                return 'Jan';
            case 1:
                return 'Feb';
            case 2:
                return 'Mar';
            case 3:
                return 'Apr';
            case 4:
                return 'May';
            case 5:
                return 'Jun';
            case 6:
                return 'Jul';
            case 7:
                return 'Aug';
            case 8:
                return 'Sep';
            case 9:
                return 'Oct';
            case 10:
                return 'Nov';
            case 11:
                return 'Dec';
        }

        return '';
    },

    // get url from text
    findUrls: function (text) {
        text = text || '';
        //var uri_pattern = /((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Zа-яА-ЯёЁ0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Zа-яА-ЯёЁ0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Zа-яА-ЯёЁ0-9][a-zA-Zа-яА-ЯёЁ0-9\-]{0,64}\.)+(?:(?:рф|укр|aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Zа-яА-ЯёЁ0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/ig;
        ////var urls = text.match(/\b(http|https)?(:\/\/)?(\S*)\.(\w{2,4})\b/ig);
        var urls = rdz.utils.getAllLinks(text, ['noindex', 'rel_nofollow', 'subdomains']);
        urls = rdz.utils.getOuterLinks(urls, window.location.href, false);

        return urls ? urls : [];
    },

    // get html wich contains selected text
    getSelectedHTML: function () {
        var selection = window.getSelection(),
            div = document.createElement('div'),
            range;


        if (selection.rangeCount) {
            range = selection.getRangeAt(0);
        }

        if (range) {
            div.appendChild(range.cloneContents());
        }

        return div.innerHTML;
    },

    copyTextToClipboard: function (text) {
        var copyFrom = rdz.$('<textarea/>');
        copyFrom.text(text);
        rdz.$('body').append(copyFrom);
        copyFrom.select();
        document.execCommand('copy');
        copyFrom.remove();
    },

    // get all links from the text
    // and filter them according to the filters array
    getAllLinks: function (text, filters) {
        var links = [],
            regExps = [
                new RegExp("<script([\\s\\S]*?)</script>", "gi"),
                new RegExp("<noscript([\\s\\S]*?)</noscript>", "gi"),
                new RegExp("<textarea([\\s\\S]*?)</textarea>", "gi"),
                new RegExp("<!--([\\s\\S]*?)-->", "gi")
            ],
            r = regExps.length,
            aTagRegExp = new RegExp("<a[^]+?>", "gmi"),
            hrefRegExp = new RegExp(`href=["']([^]+?)["']`, 'i'),
            ampRegExp = new RegExp('&amp;', 'g'),
            href;

        // noindex
        if (filters && filters.indexOf('noindex') !== -1) {
          text = text.replace(new RegExp("<!--noindex--([\\s\\S]*?)<!--/noindex-->", "gi"), '');
          text = text.replace(new RegExp("<noindex([\\s\\S]*?)</noindex>", "gi"), '');
        }

        for (; r--;) {
            text = text.replace(regExps[r], '');
        }

        let linkTags = text.match(aTagRegExp) || [];

        // rel="nofollow"
        if (filters && filters.indexOf('rel_nofollow') !== -1) {
            linkTags = rdz.utils._filterLinkTags(linkTags, filters);
        }

        let l = linkTags.length;

        for (let i = 0; i < l; i++) {
            href = linkTags[i].match(hrefRegExp);
            if (href) {
                href = href[1];
                href = href.replace(ampRegExp, '&');
                href = href.replace(/\s+/g, '');
                href = href.split('#')[0];
                if (href) links.push(href);
            }
        }

        return rdz._.uniq(links);
    },

    _filterLinkTags: function (linkTags, filters) {
        var filtersREs = {
                noindex: new RegExp("<noindex([\\s\\S]*?)</noindex>", "i"),
                rel_nofollow: new RegExp("rel=[\"\'][^\"\']*?nofollow", "i")
            },
            exclude,
            filteredTags = [];

        linkTags.forEach(function (tag) {
            exclude = false;
            filters.forEach(function (filter) {
                if (filtersREs[filter] && filtersREs[filter].test(tag)) {
                    exclude = true;
                }
            });
            if (!exclude) {
                filteredTags.push(tag);
            }
        });

        return filteredTags;
    },

    // get outer links from the links array
    getOuterLinks: function (links, url, subdomainFlag) {
        var origin = window.rdz.utils.domainFromUri(url).domain.toLowerCase(),
            origin_name = window.rdz.utils.SubstractDomainName(origin),
            l = links.length, n = 0,
            isOuter, outer_links = [],
            link, link_origin, link_origin_name;

        for (; n < l; n++) {
            link = links[n];
            try {
                link_origin = window.rdz.utils.domainFromUri(link).domain;
            } catch (e) {
                continue;
            }


            if (/^[\s]*http/.test(link) && link_origin) {
                //link_origin = punycode.ToASCII(link_origin.toLowerCase());
                link_origin = link_origin.toLowerCase();
                link_origin_name = window.rdz.utils.SubstractDomainName(link_origin);
                isOuter = false;

                if (origin === link_origin) { // full domains are the same
                    isOuter = false;
                } else if (origin_name[0] !== link_origin_name[0] || origin_name[1] !== link_origin_name[1]) { // main domains are different
                    isOuter = true;
                } else {
                    isOuter = ( subdomainFlag === true );
                }

                if (isOuter) {
                    outer_links.push(link.toLowerCase());
                }
            }
        }

        return outer_links;
    },

    // get inner links from the links array
    getInnerLinks: function (links, url) {
        var origin = window.rdz.utils.domainFromUri(url).domain.toLowerCase(),
            l = links.length, n = 0,
            inner_links = [],
            link,
            domain_str;

        for (; n < l; n++) {
            link = links[n];
            try {
                domain_str = window.rdz.utils.domainFromUri(link).domain;
            } catch (e) {
                continue;
            }

            if ((link.indexOf('http') === -1) ||
                typeof domain_str === 'undefined' ||
                origin === domain_str.toLowerCase()) {
                inner_links.push(link.toLowerCase());
            }
        }

        return inner_links;
    },

    getAllIndexedPages: function () {
        var pages = [],
            q,
            i,
            length;

        if (AppLocale.get_locale_str() === 'ru') {
            q = "SELECT (SlUrl || PlUri) as pageUrl, PlWwwFlag FROM SitesLibrary LEFT JOIN PagesLibrary ON SlId = PlSlId WHERE PlIYP > 0";
        } else {
            q = "SELECT (SlUrl || PlUri) as pageUrl, PlWwwFlag FROM SitesLibrary LEFT JOIN PagesLibrary ON SlId = PlSlId WHERE PlIGP > 0";
        }

        var sql = [{
            sql: q,
            success: function (tx, r) {
                var sql_data = rdz.db.return_selected(tx, r);
                if (sql_data && sql_data.length) {
                    for (i = 0, length = sql_data.length; i < length; i = i + 1) {
                        pages.push('http://' + (sql_data[i].PlWwwFlag ? 'www.' : '') + sql_data[i].pageUrl);
                    }
                }
                rdz.utils.copyTextToClipboard(pages.join('\n') + '\n');
            }
        }];
        rdz.db.execute(sql, function () {
        });
    },

    copySearchIntegrationResults: function () {
        try {
            chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tab) {
                var url = tab && tab[0] && tab[0].url,
                    y_re = /^https?:\/\/(www\.)?(beta\.)?yandex\.(ua|ru|by|kz)\/(yand|site|large)?search\/?\?/,
                    g_re = /^https?:\/\/(www\.)?google(?=.(?:[^\.]{2,3}\.)*)[^]+?q=/,
                    y_ca_re = /^https?:\/\/(www\.)?yandex\.(ua|ru|by|kz|com\.tr|com)\/(yaca|school)/,
                    integration, opt_name, options;
                if (url) {
                  if (y_re.test(url)) {
                    integration = 'Yandex';
                    opt_name = 'Yandex';
                  } else if (y_ca_re.test(url)) {
                    integration = 'YandexCatalog';
                    opt_name = 'Yandex';
                  } else if (g_re.test(url)) {
                    integration = 'Google';
                    opt_name = 'Google';
                  }

                    //integration = y_re.test(url) ? 'Yandex' : g_re.test(url) ? 'Google' : null;
                    if (integration) {
                        chrome.storage.local.get(opt_name, settings => {
                            options = rdz.utils.getOptions({ options: [opt_name] }, settings);
                            options.id = integration;
                            portRequest.postMessage({
                                method: 'message', request: 'INTEGRATION_Copy_URLs_ContentRequest',
                                options: options
                            });
                        });
                    }
                }
            });
        } catch (e) {  }
    },

    checkSEOTags: function () {
        chrome.storage.local.get('Parameters', settings => {
            var parameters = settings.Parameter = rdz.utils.getOptions({ options: ['Parameters'] }, settings),
                SEOTags = parameters.filter(function (p) {
                    return p.name === 'SEOTags';
                });

            if (SEOTags.length > 0) {
                SEOTags = SEOTags[0];
                parameters[parameters.indexOf(SEOTags)].checked = !parameters[parameters.indexOf(SEOTags)].checked;
                chrome.storage.local.set(settings);
                try {
                    portRequest.postMessage({
                        method: 'message',
                        request: 'SEOTAGS_CHECKED_ContentResponse',
                        functions: rdz.utils.returnActiveFunctions(rdz.utils.getOptions({ options: ['Parameters'] }, settings))
                    });
                } catch (e) {
                }
            }
        });
    },

    // disable styles functions
    // taken from FF

    disableStyles: function () {
        window.disableStyles = !window.disableStyles;
        try {
            portRequest.postMessage({
                method: 'message',
                request: 'DISABLE_STYLES_ContentRequests',
                disable: window.disableStyles
            });
        } catch (e) {
        }
    },

    toggleStyles: function (disable) {
        var documentList = [document],
            documentLength = documentList.length,
            key = null,
            ownerNode = null,
            pageDocument = null,
            styleElement = null,
            styleSheet = null,
            styleSheetLength = null,
            styleSheetList = null;


        // Loop through the documents
        for (var i = 0; i < documentLength; i++) {
            pageDocument = documentList[i];
            styleSheetList = pageDocument.styleSheets;
            styleSheetLength = styleSheetList.length;

            if (disable) {
                pageDocument.getElementsByTagName('body')[0].setAttribute('rdsStylesDis', 'disabled');
            } else {
                if (pageDocument.getElementsByTagName('body')[0].getAttribute('rdsStylesDis') !== null) {
                    pageDocument.getElementsByTagName('body')[0].removeAttribute('rdsStylesDis');
                }
            }

            // Loop through all the stylesheets
            for (var j = 0; j < styleSheetLength; j++) {
                styleSheet = styleSheetList[j];

                // If this is a valid style sheet and is not an alternate style sheet
                if (rdz.utils.isValidStyleSheet(styleSheet)) {
                    styleSheet.disabled = disable;
                }
            }

            rdz.utils.toggleDocumentInlineStyles(pageDocument.documentElement, disable);
        }
    },
    isValidStyleSheet: function (styleSheet) {
        // If the style sheet is set
        if (styleSheet) {
            var styleSheetHref = styleSheet.href;
            // If the style sheet href is set and this is not an internal style sheet or the style sheet href is not set and this does not have a Web Developer id
            if ((styleSheetHref && styleSheetHref.indexOf("about:PreferenceStyleSheet") != 0 && styleSheetHref.indexOf("chrome://") != 0 && styleSheetHref.indexOf("data:text/css") != 0 && styleSheetHref.indexOf("jar:file://") != 0 && styleSheetHref.indexOf("resource://") != 0) || (!styleSheetHref && styleSheet.ownerNode)) {
                return true;
            }
        }

        return false;
    },
    toggleDocumentInlineStyles: function (node, disable) {
        // If the node exists and is an element
        if (node && node.nodeType == Node.ELEMENT_NODE) {
            var childNodes = node.childNodes;
            var childNodesLength = childNodes.length;
            // If disabling styles and the node has a style attribute
            if (disable && node.hasAttribute("style")) {
                node.setAttribute("rds-inline-style", node.getAttribute("style"));
                node.removeAttribute("style");
            } else if (!disable && node.hasAttribute("webdeveloper-inline-style")) {
                node.setAttribute("style", node.getAttribute("webdeveloper-inline-style"));
                node.removeAttribute("webdeveloper-inline-style");
            }
            // Loop through the child nodes
            for (var i = 0; i < childNodesLength; i++) {
                rdz.utils.toggleDocumentInlineStyles(childNodes[i], disable);
            }
        }
    },

    urlForWhoIs: function (domain) {
        var url = (AppLocale.get_locale_str() === 'ru') ?
            ((/ru$/).test(domain) ? "http://www.nic.ru/whois/?domain=" :
                ((/xn--p1ai$/).test(domain) ? "http://www.nic.ru/whois/?query=" :
                    "https://www.imena.ua/whois.php?domain=")) :
            "http://whois.domaintools.com/";
        url += encodeURIComponent(domain);
        return url;
    },

    iconForWhoIs: function (domain) {
        var iconClass = (AppLocale.get_locale_str() === 'ru') ?
            ((/ru$/).test(domain) ? 'rds-cm-services-whois' :
                ((/xn--p1ai$/).test(domain) ? 'rds-cm-services-whois' :
                    'rds-cm-services-dns')) :
            'rds-cm-services-whois';
        return iconClass;
    },

    //Get OS version
    getOS: function () {
        var UserAgent = window.navigator.userAgent;

        if (UserAgent.indexOf("Win") > 0) {
            if (UserAgent.indexOf("NT 10") > 0) {
                return "Windows 10";
            }
            if (UserAgent.indexOf("NT 6.3") > 0) {
                return "Windows 8.1";
            }
            if (UserAgent.indexOf("NT 6.2") > 0) {
                return "Windows 8";
            }
            if (UserAgent.indexOf("NT 6.1") > 0) {
                return "Windows 7";
            }
            if (UserAgent.indexOf("NT 6.0") > 0) {
                return "Windows Vista";
            }
            if (UserAgent.indexOf("NT 5.2") > 0) {
                return "Windows Server 2003 или XPx64";
            }
            if (UserAgent.indexOf("NT 5.1") > 0 || UserAgent.indexOf("Win32") > 0 || UserAgent.indexOf("XP") > 0) {
                return "Windows XP";
            }
            if (UserAgent.indexOf("NT 5.0") > 0) {
                return "Windows 2000";
            }
            if (UserAgent.indexOf("NT 4.0") > 0 || UserAgent.indexOf("NT 3.5") > 0) {
                return "Windows NT";
            }
            if (UserAgent.indexOf("Me") > 0) {
                return "Windows Me";
            }
            if (UserAgent.indexOf("98") > 0) {
                return "Windows 98";
            }
            if (UserAgent.indexOf("95") > 0) {
                return "Windows 95";
            }
            return UserAgent.match(/\((Win[^\)]+)\)/)[1];
        }

        if (UserAgent.indexOf("Linux") > 0 || UserAgent.indexOf("Lynx") > 0 || UserAgent.indexOf("Unix") > 0) {
            return "Linux";
        }

        if (UserAgent.indexOf("Macintosh") > 0 || UserAgent.indexOf("PowerPC") > 0) {
            return "Macintosh";
        }

        if (UserAgent.indexOf("OS/2") > 0) {
            return "OS/2";
        }

        if (UserAgent.indexOf("BeOS") > 0) {
            return "BeOS";
        }

        return "Unknown";
    },

    CreateWebmoneyChartURL: function (dataChart) {

        function graphNum(num) {
            var len = (num + '').length;

            function round(dig) {
                dig = Math.round(dig * 10) / 10;
                return dig;
            }
            if (len > 6) {
                num = num / 1000000;
                num = round(num) + 'M';
                return num;
            }
            if (len > 3) {
                num = num / 1000;
                num = round(num) + 'K';
                return num;
            }
            return num;
        }

        dataChart.minValue = dataChart.minValue;
        dataChart.maxValue = dataChart.maxValue;
        dataChart.chxl1 = [
            graphNum(dataChart.minValue),
            graphNum(dataChart.minValue + Math.round((dataChart.maxValue - dataChart.minValue) * 1 / 5)),
            graphNum(dataChart.minValue + Math.round((dataChart.maxValue - dataChart.minValue) / 2)),
            graphNum(dataChart.minValue + Math.round((dataChart.maxValue - dataChart.minValue) * 4 / 5)),
            graphNum(dataChart.maxValue)
        ];

        var maxData = dataChart.maxValue - dataChart.minValue;
        dataChart.chd = [];
        dataChart.chxl0 = [];
        var length = dataChart.data.length;

        for (var i = length - 1; (i > length - 25 && i > 0); i--) {
            dataChart.chd.unshift(Math.round((dataChart.data[i][1] - dataChart.minValue) * 100 / maxData));
        }

        for (var i = length - 1; (i > length - 22 && i > 0); i = i - 3) {
            dataChart.chxl0.unshift(dataChart.data[i][0]);
        }

        i = i - 2;
        dataChart.chxl0.unshift(dataChart.data[i][0]);

        return 'https://chart.googleapis.com/chart?chs=650x200&cht=lc&chd=t:' + dataChart.chd.join(',') +
            '&chco=74E068&chg=14.3,25,3,2,14.3&chxt=x,y&chxl=0:|' + dataChart.chxl0.join('|') + '|1:|' + dataChart.chxl1.join('|') +
            '&chxp=0,3&chtt=' + dataChart.chtt + '&chts=000000,15';
    },

    // check if the date is today
    isTodayDate: function (date) {
        var now = new Date();

        return date.toDateString() === now.toDateString();
    },

    // get random integer from min to max (including min, max)
    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    sha1: function (str) {
        var rotate_left = function (n, s) {
            var t4 = (n << s) | (n >>> (32 - s));
            return t4;
        };
        var cvt_hex = function (val) {
            var str = '';
            var i;
            var v;
            for (i = 7; i >= 0; i--) {
                v = (val >>> (i * 4)) & 15;
                str += v.toString(16);
            }
            return str;
        };
        var blockstart;
        var i,
            j;
        var W = new Array(80);
        var H0 = 1732584193;
        var H1 = 4023233417;
        var H2 = 2562383102;
        var H3 = 271733878;
        var H4 = 3285377520;
        var A,
            B,
            C,
            D,
            E;
        var temp;
        str = unescape(encodeURIComponent(str));
        var str_len = str.length;
        var word_array = [];
        for (i = 0; i < str_len - 3; i += 4) {
            j = str.charCodeAt(i) << 24 | str.charCodeAt(i + 1) << 16 | str.charCodeAt(i + 2) << 8 | str.charCodeAt(i + 3);
            word_array.push(j);
        }
        switch (str_len % 4) {
            case 0:
                i = 2147483648;
                break;
            case 1:
                i = str.charCodeAt(str_len - 1) << 24 | 8388608;
                break;
            case 2:
                i = str.charCodeAt(str_len - 2) << 24 | str.charCodeAt(str_len - 1) << 16 | 32768;
                break;
            case 3:
                i = str.charCodeAt(str_len - 3) << 24 | str.charCodeAt(str_len - 2) << 16 | str.charCodeAt(str_len - 1) <<
                8 | 128;
                break;
        }
        word_array.push(i);
        while ((word_array.length % 16) != 14) {
            word_array.push(0);
        }
        word_array.push(str_len >>> 29);
        word_array.push((str_len << 3) & 4294967295);
        for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
            for (i = 0; i < 16; i++) {
                W[i] = word_array[blockstart + i];
            }
            for (i = 16; i <= 79; i++) {
                W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
            }
            A = H0;
            B = H1;
            C = H2;
            D = H3;
            E = H4;
            for (i = 0; i <= 19; i++) {
                temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 1518500249) & 4294967295;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }
            for (i = 20; i <= 39; i++) {
                temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 1859775393) & 4294967295;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }
            for (i = 40; i <= 59; i++) {
                temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 2400959708) & 4294967295;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }
            for (i = 60; i <= 79; i++) {
                temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 3395469782) & 4294967295;
                E = D;
                D = C;
                C = rotate_left(B, 30);
                B = A;
                A = temp;
            }
            H0 = (H0 + A) & 4294967295;
            H1 = (H1 + B) & 4294967295;
            H2 = (H2 + C) & 4294967295;
            H3 = (H3 + D) & 4294967295;
            H4 = (H4 + E) & 4294967295;
        }
        temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
        return temp.toLowerCase();
    },

    findRecipientsInURLs: function (urls_arr, callback) {
        let domains = urls_arr.map(url => rdz.utils.domainFromUri(url).domain);
        rdz.db.get('Recipients', data => {
            let recipients = data ? data.value : [];
            callback(domains.filter(domain => recipients.includes(domain)));
        });
    },

    NumberParser: function(result) {
        result = result.replace(/^([а-яё\s]+)/, "");
        result = result.replace(/\s$/, "");
        result = result.replace(/тыс\.*/, "000");
        result = result.replace(/тис\.*/, "000");
        result = result.replace(/млн/, "000000");
        result = result.replace(/&nbsp;/, "");
        result = result.replace(/[^\d]/g, '');
        return result;
    }
};

window.rdz.utils.userAgent = {
    selected: 'default',
    agents: {
        googlebot_desktop: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        googlebot_mobile: 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        yandexbot_desktop: 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
        yandexbot_mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12B411 Safari/600.1.4 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
        bingbot_desktop: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
        bingbot_mobile: 'Mozilla/5.0 (Windows Phone 8.1; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 530) like Gecko (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',

        msnbot: 'msnbot/2.0b (+http://search.msn.com/msnbot.htm)',
        yahoo: 'Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)',

        ie6: 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)',
        ie7: 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
        ie8: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)',

        appleIpad: 'Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.10',
        appleIphone: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_0 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7A341 Safari/528.16',
        Blackberry: 'BlackBerry8300/4.2.2 Profile/MIDP-2.0 Configuration/CLDC-1.1 VendorID/107 UP.Link/6.2.3.15.0',
        htc: 'Mozilla/5.0 (Linux; U; Android 1.5; en-us; HTC Hero Build/CUPCAKE) AppleWebKit/528.5+ (KHTML, like Gecko) Version/3.1.2 Mobile Safari/525.20.1',
        lg: 'LG-GC900/V10a Obigo/WAP2.0 Profile/MIDP-2.1 Configuration/CLDC-1.1'
    },
    rewriteUserAgentHeader: function (details) {
        for (let header of details.requestHeaders) {
            if (header.name == 'User-Agent') {
                let ua = window.rdz.utils.userAgent;
                header.value = ua.agents[ua.selected];
                break;
            }
        }
        return { requestHeaders: details.requestHeaders };
    },
    selectAgent: function (agent_name) {
        if (agent_name !== 'default') {
            this.selected = agent_name;
            chrome.webRequest.onBeforeSendHeaders.addListener(this.rewriteUserAgentHeader, { urls: ['http://*/*', 'https://*/*'] }, ['requestHeaders', 'blocking']);
        } else {
            this.resetAgent();
        }
    },
    resetAgent: function () {
        chrome.webRequest.onBeforeSendHeaders.removeListener(this.rewriteUserAgentHeader);
    }
};

/*
 function stripHttps(string)
 {
 if (string)
 return string.replace(/^https:/i, 'http:');
 return null;
 }*/

/** @type {Object} dictionary of errors */
window.rdz.errors =
{
    'GLUED': -1,
    'PARSE': -2,
    'CAPTCHA': -3,
    'HTTP': -4,
    'APIOFF': -5,
    'BUNKRUPT': -6,
    'AUTHOR': -7,
    'ACCESS': -8,
    'VIRUS': -9,
    'HARDSITE': -10,
    'AGS': -40,
    'RECEIVING': -100 // actually is not an error
};

window.rdz.timer = {
    '2000': 2000,
    '600000': 600000
};

window.rdz.utils.locale = {
    ru: {
        parameters: ["IY", "IYD", "IYP", "IYDP", "SQI", /*"TYC", "YaCatalog",*/ "YaBar", "YT", "YR", "BY", "YaBlogs", "ISolomono",
            "Solomono", 'Webmoney', "Seo", "LinksBuy", "Aggregators", "UniqueContent", "Prodvigator", "SpyWords",
            "Updates", "DB", "MassChecking", "Services"],
        functions: ['Updates', /*'Competition',*/ 'RecipientsPositions']
    },
    languages: ['ru', 'en'],
    get_browser_locale: function () {
        var locale = navigator.language.substr(0, 2);
        return this.languages.indexOf(locale) !== -1 ? locale : "uk" === locale ? 'ru' : 'en';
    }
};

window.rdz.utils.google = {
    zones: [".co.uk", ".com", ".fr", ".de", ".es", ".it", ".pl", ".pt", ".ru", ".com.ua", ".ad", ".ae", ".am", ".as", ".at", ".az", ".ba", ".be",
        ".bf", ".bg", ".bi", ".bj", ".bs", ".by", ".ca", ".cat", ".cd", ".cf", ".cg", ".ch", ".ci", ".cl", ".cm", ".co.ao", ".co.bw", ".co.ck", ".co.cr",
        ".co.id", ".co.il", ".co.im", ".co.in", ".co.je", ".co.jp", ".co.ke", ".co.kr", ".co.ls", ".co.ma", ".co.mw", ".co.mz", ".co.nz", ".co.pn", ".co.th",
        ".co.tt", ".co.tz", ".co.ug", ".co.uz", ".co.ve", ".co.vi", ".co.za", ".co.zm", ".co.zw", ".com.af", ".com.ag", ".com.ai", ".com.ar", ".com.au", ".com.bd",
        ".com.bh", ".com.bn", ".com.bo", ".com.br", ".com.bz", ".com.co", ".com.cu", ".com.cy", ".com.do", ".com.ec", ".com.eg", ".com.et", ".com.fj", ".com.gh",
        ".com.gi", ".com.gr", ".com.gt", ".com.hk", ".com.jm", ".com.kh", ".com.kw", ".com.lb", ".com.lv", ".com.ly", ".com.mt", ".com.mw", ".com.mx", ".com.my",
        ".com.na", ".com.nf", ".com.ng", ".com.ni", ".com.np", ".com.om", ".com.pa", ".com.pe", ".com.ph", ".com.pk", ".com.pl", ".com.pr", ".com.py", ".com.qa",
        ".com.ru", ".com.sa", ".com.sb", ".com.sg", ".com.sl", ".com.sv", ".com.tj", ".com.tn", ".com.tr", ".com.tt", ".com.tw", ".com.uy", ".com.vc", ".com.ve",
        ".com.vn", ".cv", ".cz", ".dj", ".dk", ".dm", ".dz", ".ee", ".fi", ".fm", ".ga", ".ge", ".gg", ".gl", ".gm", ".gp", ".gr", ".gy", ".hk", ".hn", ".hr",
        ".ht", ".hu", ".ie", ".iq", ".is", ".je", ".jo", ".jp", ".kg", ".ki", ".kz", ".la", ".li", ".lk", ".lt", ".lu", ".lv", ".md", ".me", ".mg", ".mk", ".ml", ".mn",
        ".ms", ".mu", ".mv", ".mw", ".ne", ".ne.jp", ".nl", ".no", ".nr", ".nu", ".off.ai", ".ph", ".pn", ".ps", ".ro", ".rs", ".rw", ".sc", ".se", ".sg", ".sh",
        ".si", ".sk", ".sm", ".sn", ".so", ".st", ".td", ".tg", ".tk", ".tl", ".tl", ".tm", ".tn", ".to", ".tt", ".us", ".vg", ".vn", ".vu", ".ws"]
};

window.rdz.utils.semrush = {
    zones: ['com', 'ru', 'co.uk', 'de', 'fr']
};

window.rdz.utils.prodvigator_google_sources = [/*'yandex_ru',*/ 'google_ru', 'google_ua', 'google_bg', 'google_kz',
    'google_us'];

window.rdz.utils.prodvigator_request_google = {'google_ru': 'g_ru', 'google_ua': 'g_ua', 'google_bg': 'g_bg',
    'google_kz': 'g_kz', 'google_us': 'g_us'};

window.rdz.utils.namesForRD = {TYC: 'Cy', IY: 'Iy', PR: 'Pr', MirrorsCount: 'Bonding'};

window.rdz.TableFields = {
    /*Важен порядок свойств! */
    Sites: {
        IP: 274877906944,
        Host: 1099511627776,
        Provider: 2199023255552,
        Geo: 549755813888,
        Uri: 1,
        positions: 32768,
        Seo: 32,
        commercialsDomains: 4503599627370496,
        Counters: 1125899906842624,
        linkspurch: 70368744177664,
        TYC: 128,
        TYCBar: 256,
        TYCCategory: 512,
        TYCTopics: 1024,
        TYCRegion: 2048,
        PR: 4398046511104,
        IY: 2,
        IYD: 64,
        IG: 4,
        ibing: 65536,
        BY: 4096,
        WA: 1048576,
        Age: 8,
        LG: 524288,
        BackAlexa: 4194304,
        BackBing: 262144,
        Bing: 131072,
        SocialNetworks: 140737488355328,
        Semrush: 17179869184,
        ISolomono: 281474976710656,
        Solomono: 562949953421312,
        MJ: 16777216,
        CF: 144115188075855872,
        TF: 288230376151711744,
        Imgyan: 8192,
        Imgg: 134217728,
        AOLimg: 268435456,
        Alexa: 2097152,
        DMOZ: 33554432,
        LinksInDomain: 9007199254740992,
        LinksOutDomain: 18014398509481984,
        pagetitleDomain: 72057594037927936,
        pageweightDomain: 36028797018963968,
        CMS: 17592186044416,
        Dangerous: 16,

        Subdomains: 2147483648,
        seomoz: 34359738368,
        IndexAol: 8388608,
        Technorati: 67108864,
        Ahrefs: 4294967296,
        GoogleAdplanner: 8589934592,
        GoogleTrends: 1073741824,
        Compete: 68719476736,
        Quantcast: 137438953472,
        Aggregators: 16384,
        Webmoney: 2251799813685248,
        RSS: 35184372088832,
        Robots: 536870912,
        Sitemap: 8796093022208
    },
    Pages: {
        Uri: 1,
        positionspage: 16,
        RecipientPage: 268435456,
        Nesting: 128,
        Seo: 33554432,
        commercials: 134217728,
        CountersPage: 68719476736,
        TYC: 262144,
        TYCBar: 524288,
        TYCCategory: 1048576,
        TYCTopics: 2097152,
        TYCRegion: 4194304,
        PRpageMain: 137438953472,
        PRpage: 256,
        IYP: 2,
        IGP: 32,
        IY: 32768,
        IYD: 65536,
        IYDP: 4,
        IG: 131072,
        WA: 8388608,
        Valid: 2048,
        BackAlexa: 4294967296, //BackAlexaPage: 4294967296,
        SocialNetworkspage: 4096,
        ISolomono: 8589934592, //ISolomonoPage: 8589934592,
        Solomono: 17179869184, //SolomonoPage: 17179869184,
        Alexa: 2147483648, //AlexaPage: 2147483648,
        DMOZ: 16777216,
        UniqueContentPage: 274877906944,
        Anchor: 1073741824,
        LinksIn: 512,
        LinksOut: 1024,
        pagetitle: 67108864,
        pageweight: 64,
        LinkPresence: 536870912,
        CMSpage: 8192,
        Dangerous: 34359738368, //DangerousPage: 34359738368,
        MozRank: 16384,
        seomozP: 8
    },
    hidden: [
        'IP',
        'Geo',
        'Host',
        'Provider',
        'positions',
        'AOLimg',
        //'Seo',
        'Subdomains',
        'IndexAol',
        //'CMS',
        'Technorati',
        'fb',
        'Ahrefs',
        'GoogleAdplanner',
        'GoogleTrends',
        'Compete',
        'Quantcast',
        'Netchart',
        'Aggregators',
        //'ISolomono',
        'Webmoney',
        'Age',
        //'Dangerous',
        //'SocialNetworks',
        'RSS',

        //'CMSpage',
        //'pageweight',
        //'pagetitle',
        'positionspage',
        //'LinksIn',
        //'LinksOut',
        //'SocialNetworkspage',
        'Nesting'
    ],
    hidden_in_mass_checks: [
        //'linkspurch',
        'Imgyan',
        'AOLimg',
        'seomoz',
        'LG',
        'BackBing',
        'Bing',
        //'Alexa',
        //'BackAlexa',
        //'MJ',
        'Semrush',
        //'ISolomono',
        //'Solomono',
        //'Counters',
        'Robots',
        'Sitemap',

        'MozRank',
        'seomozP',
        'Valid',

        'Imgg',
        'BY',
        'IYD',
        'IYDP'
    ]
};

window.rdz.TableFieldsToRequest = {
    IP: {},
    Geo: {},
    Host: {},
    Provider: {},
    Url: {},
    positions: {},
    Seo: {name: 'Seo', request: 'Seo'},
    linkspurch: {name: 'linkspurch', request: 'LinksBuy'},
    TYC: {name: 'TYC', request: 'TYC'},
    TYCBar: {name: 'TYC', request: 'YaBar'},
    TYCCategory: {name: 'TYC', request: 'TYC'},
    TYCTopics: {name: 'TYC', request: 'YaBar'},
    TYCRegion: {name: 'TYC', request: 'YaBar'},
    PR: {name: 'PR', request: 'PRMain'},
    IY: {name: 'IY', request: 'IY'},
    IYD: {name: 'IYD', request: 'IYD'},
    IG: {name: 'IG', request: 'IG'},
    ibing: {name: 'IBing', request: 'IBing'},
    BY: {name: 'BY', request: 'BY'},
    Imgyan: {name: 'Pictures', request: 'PicturesYa'},
    Imgg: {name: 'Pictures', request: 'Pictures'},
    AOLimg: {},
    Subdomains: {},
    WA: {name: 'WA', request: 'WA'},
    seomoz: {name: 'SeoM', request: 'SeoM'},
    LG: {name: 'BackG', request: 'BackG'},
    BackBing: {name: 'BackBing', request: 'BackBing'},
    Bing: {name: 'IBing', request: 'IBing'},
    IndexAol: {},
    Alexa: {name: 'Alexa', request: 'Alexa'},
    BackAlexa: {name: 'BackA', request: 'BackA'},
    DMOZ: {name: 'Dmoz', request: 'Dmoz'},
    CMS: {name: 'CMS', request: 'PageValuesDomains'},
    LinksInDomain: {name: 'LinksInDomain', request: 'PageValuesDomains'},
    LinksOutDomain: {name: 'LinksOutDomain', request: 'PageValuesDomains'},
    pageweightDomain: {name: 'pageweightDomain', request: 'PageValuesDomains'},
    pagetitleDomain: {name: 'pagetitleDomain', request: 'PageValuesDomains'},
    commercialsDomains: {name: 'commercialsDomains', request: 'PageValuesDomains'},
    Technorati: {},
    MJ: {name: 'MJ', request: 'Majestic'},
    CF: {name: 'CF', request: 'Majestic'},
    TF: {name: 'TF', request: 'Majestic'},
    Ahrefs: {},
    Semrush: {name: 'SemRush', request: 'SemRush'},
    GoogleAdplanner: {},
    GoogleTrends: {},
    Compete: {},
    Quantcast: {},
    Aggregators: {},
    ISolomono: {name: 'ISolomono', request: 'Solomono'},
    Solomono: {name: 'Solomono', request: 'Solomono'},
    Webmoney: {},
    Age: {},
    Dangerous: {name: 'Dangerous', request: 'CheckDangerous'},
    SocialNetworks: {name: 'SocialNetworksMass', request: 'SocialNetworksMass'},
    Counters: {name: 'CountersMass', request: "PageValuesDomains"},
    RSS: {},
    Robots: {},
    Sitemap: {},

    //pages
    Uri: {},
    IYP: {name: 'IYP', request: 'IYP'},
    IYDP: {name: 'IYDP', request: 'IYDP'},
    IGP: {name: 'IGP', request: 'IGP'},
    PRpage: {name: 'PR', request: 'PR'},
    PRpageMain: {name: 'PRpageMain', request: 'PRpageMain'},
    MozRank: {name: 'MozRank', request: 'MozRank'},
    seomozP: {name: 'SeoM', request: 'SeoM'},
    //AlexaPage:      { name:'AlexaPage', request: 'AlexaPage' },
    //BackAlexaPage:  { name:'BackAPage', request: 'BackAPage' },
    //ISolomonoPage:  { name:'ISolomonoPage', request: 'SolomonoPage'},
    //SolomonoPage:   { name:'SolomonoPage', request: 'SolomonoPage' },
    //DangerousPage:  { name:'DangerousPage', request: 'CheckDangerousPage' },
    RecipientPage: {name: 'RecipientPage', request: 'PageValues'},
    LinkPresence: {name: 'LinkPresence', request: 'PageValues'},
    Anchor: {name: 'Anchor', request: 'PageValues'},
    CMSpage: {name: 'CMSpage', request: 'PageValues'},
    pageweight: {name: 'pageweight', request: 'PageValues'},
    positionspage: {},
    LinksIn: {name: 'LinksIn', request: 'PageValues'},
    LinksOut: {name: 'LinksOut', request: 'PageValues'},
    pagetitle: {name: 'pagetitle', request: 'PageValues'},
    CountersPage: {name: "CountersMassPage", request: 'PageValues'},
    commercials: {name: 'commercials', request: 'PageValues'},
    SocialNetworkspage: {name: 'SocialNetworkspage', request: 'SocialNetworkspage'},
    Valid: {name: 'Validation', request: 'Validation'},
    Nesting: {},
    UniqueContentPage: {name: 'UniqueContentPage', request: 'UniqueContent'},

    //additional buttons in mass cheks
    UIMirrorsCount: {name: 'UIMirrorsCount', request: 'UIMirrorsCount'},
    UICounters: {name: 'UICounters', request: 'APICounters'}
};

window.rdz.utils.Seo_NumberByName = {
    Sape: 1,
    Trustlink: 32,
    Liex: 128,
    Mainlink: 2,
    Linkfeed: 4,
    Setlinks: 8,
    Xap: 16,
    Propage: 64,
    Seozavr: 256,
    SapeArticles: 512,
    SapePr: 1024,
    Miralinks: 2048,
    Gogetlinks: 4096,
    Blogun: 8192,
    RotaPost: 16384,
    Rds: 32768
};

window.rdz.utils.Seo_NameByNumber = {
    '1': 'Sape',
    '32': 'Trustlink',
    '128': 'Liex',
    '2': 'Mainlink',
    '4': 'Linkfeed',
    '8': 'Setlinks',
    '16': 'Xap',
    '64': 'Propage',
    '256': 'Seozavr',
    '512': 'SapeArticles',
    '1024': 'SapePr',
    '2048': 'Miralinks',
    '4096': 'Gogetlinks',
    '8192': 'Blogun',
    '16384': 'RotaPost',
    '32768': 'Rds'
};

window.rdz.utils.Dangerous = {
    Yandex: 1,
    Google: 2,
    WebmoneyAdvisor: 4,
    VirusTotal: 8
};

window.rdz.utils.RDSCountersNames = {
    'liveinternet': 'Liveinternet', 'GA': 'GoogleAnalytics', 'ya_metric': 'YandexMetrica', 'rambler': 'Top100Rambler',
    'mail': 'MailRu', 'hotlog': 'HotLog', 'bigmir': 'Bigmir',
    'topstat': 'Topstat', 'mycounter': 'MyCounter', 'log24': 'Log24',
    'yandeg': 'YandeG', 'openstat': 'OpenStat',
    'hit_ua': 'HitUa', 'i_ua': 'IUa'
};

window.rdz.utils.RDSBarCountersNames = {
    'Liveinternet': 'liveinternet', 'GoogleAnalytics': 'GA', 'YandexMetrica': 'ya_metric', 'Top100Rambler': 'rambler',
    'MailRu': 'mail', 'HotLog': 'hotlog', 'Bigmir': 'bigmir',
    'Topstat': 'topstat', 'MyCounter': 'mycounter', 'Log24': 'log24',
    'YandeG': 'yandeg', 'OpenStat': 'openstat',
    'HitUa': 'hit_ua', 'IUa': 'i_ua'
};

window.rdz.utils.RDSBarCountersDBFields = {
    'Liveinternet': 'CLiveInternet',
    'GoogleAnalytics': 'CGA',
    'YandexMetrica': 'CYaMetrika',
    'Top100Rambler': 'CRambler',
    'MailRu': 'CMailRu',
    'HotLog': 'CHotLog',
    'Bigmir': 'CBigmir',
    'Topstat': 'CTopStat',
    'MyCounter': 'Cmycounter',
    'Log24': 'CLog24',
    'YandeG': 'yandeg',
    'OpenStat': 'openstat',
    'HitUa': 'CHIT_UA',
    'IUa': 'CI_UA'
};

window.rdz.utils.CMS = {
    getPatterns: function (domain) { // use the function to be able include the domain to the REs
        return {
            sites: {
                '1C-Bitrix': {
                    html: /<link[^>]+components\/bitrix|<script[^>]+1c\-bitrix|(href|src)="\/bitrix\/(templates|images|components)\/|href="\/bitrix\/rk.php\?id=/i
                },
                '2z Project': {
                    html: /<meta name=("|')generator("|') [^>]+2z project/i
                },
                'Amiro.CMS': {
                    html: /<meta name=("|')generator("|') [^>]+Amiro/i
                },
                'BIGACE': {
                    html: /(<meta name=("|')generator("|') [^>]+BIGACE|Powered by <a href=("|')[^>]+BIGACE|<!--\s+Site is running BIGACE)/i
                },
                'BigDump': {
                    html: /<!-- <h1>BigDump: Staggered MySQL Dump Importer/
                },
                'BPanel': {
                    html: /href.*bpanel\.net.*BPanel|rel="stylesheet" href="\/(includes|content)\/css\/(main|styles|style|sheet)\.css"|type="text\/javascript" src="includes\/(menu|scripts)\.js"|src="\/admin\/modules\/thumbnail\.php\?img=\/|abp.*\Wbpanel|Сайт создан [\s\S]{0,100}BPanel CMS/i,
                    headers: {
                        'X-Powered-CMS': /BPanel CMS \(www\.bpanel\.net\)/
                    }
                },
                'Bugzilla': {
                    html: /<[^>]+(id|title|name)=("|')bugzilla/i
                },
                'CMS Made Simple': {
                    html: /<meta name=("|')generator("|') [^>]+CMS Made Simple/i
                },
                'cPanel': {
                    html: /<!-- cPanel/i
                },
                'cutephp': {
                    html: /Content Management Powered by .{0,50}<a href="http:\/\/cutephp\.com\/"/i
                },
                'DirectAdmin': {
                    html: /<a[^>]+>DirectAdmin<\/a> Web Control Panel/i
                },
                'DLE': {
                    html: new RegExp('<meta name=("|\')generator("|\') [^>]+DataLife Engine|@import url\\(/templates/[^/]+/css/engine\\.css\\);|/engine/ajax/dle_ajax\\.js|var dle_root|var dle_del_agree|<!-- DataLife Engine Copyright|onclick="dleRate|id=\'dle-content\'|id=\'dle-info\'', 'i'),
                    headers: {
                        'Set-Cookie': /dle_user_id|dle_password|dle_hash/
                    }
                },
                'DokuWiki': {
                    html: /<meta name=("|')generator("|') [^>]+DokuWiki/i
                },
                'DotNetNuke': {
                    html: /(<meta name=("|')generator("|') [^>]+DotNetNuke|<!\-\- by DotNetNuke Corporation)/i
                },
                'DreamWeaver': {
                    html: /(<!\-\-[^>]*(InstanceBeginEditable|Dreamweaver[^>]+target|DWLayoutDefaultTable)|function MM_preloadImages\(\) {)/
                },
                'Drupal': {
                    html: /<script [^>]+drupal\.js|jQuery\.extend\(Drupal\.settings, \{|Drupal\.extend\(\{ settings: \{|<link[^>]+sites\/(default|all)\/themes\/|<style.+sites\/(default|all)\/(themes|modules)\/|class="block block-block"|class="clear-block clear"|class="clear-block"|id="block-(block|menu|nice_menus)-\d+"|id="container" class="clear-block"|<input type="hidden" name="form_id" id="edit-user-login-block" value="user_login_block"  \/>/i,
                    headers: {
                        'X-Drupal-Cache': /.*/
                    }
                },
                'e107': {
                    html: /<script [^>]+e107\.js/i
                },
                'eZ Publish': {
                    html: /<meta name=("|')generator("|') [^>]+eZ Publish/i
                },
                'Flyspray': {
                    html: /(<a[^>]+>Powered by Flyspray|<map id=("|')projectsearchform)/
                },
                'FrontPage': {
                    html: /<meta name=("|')GENERATOR("|') [^>]+Microsoft FrontPage/i
                },
                'InstantCMS': {
                    html: /<meta name=("|')generator("|') [^>]+InstantCMS/i
                },
                'InSales': {
                    html: /\/javascripts\/insales_counter\.js/
                },
                'Joomla': {
                    url: new RegExp('/component/option,com_.+?/Itemid,\d+|/index.php\\?option=com_.+?&|/content/blogcategory/\d+/\d+(/|)|/content/view/\d+|/component/content/article/|/component/content/section/|/component/content/frontpage/', 'i'),
                    html: new RegExp('(<meta name=("|\')generator("|\') [^>]+Joomla|<!\-\- JoomlaWorks "K2"|(' + domain + '|"|\')/component/option,com_.+?/itemid,\d+|(' + domain + '|"|\')/index.php?option=com_.+?&|(' + domain + '|"|\')/content/blogcategory/\d+/\d+(/|)|(' + domain + '|"|\')/content/view/\d+|(' + domain + '|"|\')/component/content/article/|(' + domain + '|"|\')/component/content/section/|(' + domain + '|"|\')/component/content/frontpage/)', 'i'),
                    headers: {
                        'X-Content-Encoded-By': /Joomla/
                    }
                },
                'Kentico CMS': {
                    html: /<meta name=("|')generator("|') [^>]+Kentico CMS/i
                },
                'KMStudio': {
                    html: / href=["']?http:\/\/kmstudio\.(com|kiev)\.ua["']?.{0,50}\WKMStudio/i
                },
                'Kolibri CMS': {
                    html: /<meta name=("|')copyright("|') [^>]+Kolibri/i
                },
                'Koobi': {
                    html: /<meta name=("|')generator("|') [^>]+Koobi/i
                },
                'MantisBT': {
                    html: /<img[^>]+ alt=("|')Powered by Mantis Bugtracker/i
                },
                'MaxSite CMS': {
                    html: /<meta name=("|')generator("|') [^>]+MaxSite CMS/i
                },
                'MediaWiki': {
                    html: /(<meta name=("|')generator("|') [^>]+MediaWiki|<a[^>]+>Powered by MediaWiki<\/a>)/i
                },
                'Microsoft ASP.NET': {
                    html: /<input[^>]+name=("|')__VIEWSTATE/,
                    url: /\.aspx?($|\?)/i,
                    headers: {
                        'X-Powered-By': /ASP\.NET/
                    }
                },
                'MODx': {
                    html: /(<a[^>]+>Powered by MODx<\/a>|var el= \$\('modxhost'\);|<script type=("|')text\/javascript("|')>var MODX_MEDIA_PATH = "media";)/i
                },
                'Moogo': {
                    html: /<script[^>]* src=("|')[^"']+kotisivukone.js/
                },
                'Movable Type': {
                    html: /<meta name=("|')generator("|') [^>]+Movable Type/i
                },
                'Neocrome': {
                    html: /<meta name=["']Generator["'] [^>]+Neocrome/i
                },
                'Next Generation': {
                    html: /<meta name=["']Generator["'] [^>]+NGCMS/i
                },
                'openEngine': {
                    html: /<meta[^>]+openEngine/i
                },
                'papaya CMS': {
                    html: /<link[^>]*\/papaya-themes\//i
                },
                'Perl': {
                    url: /\.pl($|\?)/i,
                    html: /(href|action)=("|')((https?:)?\/\/{0}|\/[^\/"' ]+)?\/[^\"'? ]*[.]pl[\"' ?]/i
                },
                'PHP-Fusion': {
                    html: /Powered by <a[^>]*href=("|')[^>]+php-fusion/i
                },
                'phpMyAdmin': {
                    html: /(var pma_absolute_uri = '|PMA_sendHeaderLocation\(|<title>phpMyAdmin<\/title>)/i
                },
                'PHP-Nuke': {
                    url: new RegExp('/index\\.php\\?name=Account&op=userinfo&user_name=|/index\\.php\\?name=News&op=Article&sid=|/modules\\.php\\?name=News&file=article&sid=|/modules\\.php\\?name=Surveys&op=results&pollID=', 'i'),
                    html: /<meta name="generator" content="[^"]*PHP[^"]*Nuke[^"]*">|Russian localization.*href="http:\/\/rus-phpnuke\.com\/".*Rus-PhpNuke\.com|Copyright[^<>]*PHP-Nuke|myNukeSecuRity[^<>]+Maxim Mozul/i
                },
                'phpPgAdmin': {
                    html: /(<title>phpPgAdmin<\/title>|<span class=("|')appname("|')>phpPgAdmin)/i
                },
                'Plesk': {
                    html: /<script[^>]* src=("|')[^>]*common\.js\?plesk|generated by <a[^>]* href=["']?http:\/\/www\.parallels\.com[^">]*["']?[^>]*>[^<]*Plesk/i
                },
                'Plone': {
                    html: /<meta name=("|')generator("|') [^>]+Plone/i
                },
                'Ruxe': {
                    html: /<meta name=["']generator["'] [^>]+Ruxe/i
                },
                'Redmine': {
                    html: /(<meta name=("|')description("|')Redmine("|')|Powered by <a href=("|')[^>]+Redmine)/i
                },
                'S.Builder': {
                    html: /<meta name=("|')generator("|') [^>]+S\.Builder/i
                },
                's9y': {
                    html: /<meta name=("|')Powered-By("|') [^>]+Serendipity/i
                },
                'SiteEdit': {
                    html: /<meta name=("|')generator("|') [^>]+SiteEdit/i
                },
                'SLAED': {
                    html: /<meta name=["']generator["'] [^>]+SLAED|Powered by.*href="http:\/\/www\.slaed\.net".*SLAED CMS/i
                },
                'sNews': {
                    html: /<meta name=("|')Generator("|') [^>]+sNews/
                },
                'SPIP': {
                    html: /<meta name=("|')generator("|') [^>]+SPIP/i,
                    headers: {
                        'X-Spip-Cache': /.*/
                    }
                },
                'SQL Buddy': {
                    html: /(<title>SQL Buddy<\/title>|<[^>]+onclick=("|')sideMainClick\(("|')home\.php)/i
                },
                'Squarespace': {
                    html: /Squarespace\.Constants\.CURRENT_MODULE_ID/i
                },
                'swift.engine': {
                    headers: {
                        'X-Powered-By': /swift\.engine/
                    }
                },
                'Swiftlet': {
                    html: /(<meta name=("|')generator("|') [^>]+Swiftlet|Powered by <a href=("|')[^>]+Swiftlet)/i,
                    headers: {
                        'X-Swiftlet-Cache': /.*/,
                        'X-Powered-By': /Swiftlet/
                    }
                },
                'Textpattern CMS': {
                    html: /<meta name=("|')generator("|') [^>]+Textpattern/i
                },
                'Trac': {
                    html: /(<a[^>]*id=("|')tracpowered)/i
                },
                'TYPO3': {
                    html: /(<meta name=("|')generator("|') [^>]+TYPO3|<(script[^>]* src|link[^>]* href)=[^>]*fileadmin)/i,
                    url: /\/typo3/i
                },
                'TYPOlight': {
                    html: /(<!--\s+This website is powered by (TYPOlight|Contao)|<link[^>]+(typolight|contao).css)/i
                },
                'uCoz': {
                    html: /rel="StyleSheet" href="http:\/\/s\d+\.ucoz\.net\/src\/layer\d+\.css"|type="text\/javascript" src="http:\/\/s\d+\.ucoz\.net\/src\/u\.js"|src="http:\/\/s\d+\.ucoz\.net\/img\/cp\/\d+.gif"|<a href="http:\/\/www\.ucoz\.ru\/" title="Создать сайт бесплатно">uCoz<\/a>|title="uCoz Counter"/i,
                    url: /^https?:\/\/[^\/]+\.ucoz\.(ru|net|com|ua|org|biz)(\/|$)/i
                },
                'Webalizer': {
                    html: /Generated by The Webalizer|href=["']?http:\/\/www\.mrunix\.net\/webalizer\/["']?.*\WWebalizer/i
                },
                'WCPS': {
                    html: /(<meta name=("|')generator("|') [^>]+WebCodePortalSystem - http:\/\/wcps\.ru)/i
                },
                'webEdition': {
                    html: /(<meta name=("|')generator("|') [^>]+webEdition|<meta name=("|')DC.title("|') [^>]+webEdition)/i
                },
                'WebGUI': {
                    html: /<meta name=("|')generator("|') [^>]+WebGUI/i
                },
                'WebPublisher': {
                    html: /<meta name=("|')generator("|') [^>]+WEB\|Publisher/i
                },
                'WikkaWiki': {
                    html: /(Powered by <a[^>]*href=("|')[^>]+WikkaWiki|<meta name=("|')generator("|') [^>]+WikkaWiki)/i
                },
                'Xevian': {
                    html: /<meta name=["']?generator["']? [^>]+Xevian|href="http:\/\/xevian\.com".*Xevian/i
                },
                'XOOPS': {
                    html: /<meta name=("|')generator("|') [^>]+XOOPS/i
                }
            },
            forums: {
                'vBulletin': {
                    html: /<meta name=("|')generator("|')[^>]+vBulletin|vBulletin. .{0,50}Copyright[^<]*Jelsoft Enterprises Ltd|id="vbulletin_css"|src="clientscript\/vbulletin_[^"]*\.js[^"]*"/i
                },
                'phpBB': {
                    html: /(Powered by .{0,50}(<a[^>]*href=("|')[^>]+)?phpBB|<meta name=("|')copyright("|') [^>]+phpBB Group)/i
                },
                'SMF': {
                    html: /<script .+\s+var smf_/i
                },
                'IPB': {
                    html: /<script [^>]+jscripts\/ips_|id=['"]ipbcopyright['"]|id=['"]ipbwrapper['"]|href='http:\/\/www\.invisionboard\.com\/'.*IP\.Board|Powered by.*http:\/\/www\.invisionboard\.com".*Invision Power Board/i
                },
                'MyBB': {
                    html: /(<script .+\s+<!--\s+lang\.no_new_posts|<a[^>]* title=("|')Powered By MyBB)/i
                },
                'punBB': {
                    html: /Powered by <a[^>]*href=("|')[^>]+punbb/i
                },
                'Vanilla': {
                    html: /<body id=("|')(DiscussionsPage|vanilla)/i,
                    headers: {
                        'X-Powered-By': /Vanilla/
                    }
                },
                'FluxBB': {
                    html: /Powered by (<strong>)?<a[^>]*href=("|')[^>]+fluxbb/i
                },
                'YaBB': {
                    html: /Powered by <a[^>]*href=("|')[^>]+yabbforum/i
                },
                'XMB': {
                    html: /<!-- Powered by XMB/i
                },
                'MiniBB': {
                    html: /<a[^>]*href=("|')[^>]+minibb.+\s+<!--End of copyright link/i
                },
                'YAF': {
                    html: /(<head[^>]*id=("|')YafHead)/
                }
            },
            blogs: {
                'Envos': {
                    html: /<meta name=["']?generator["']? [^>]+Envos|href="http:\/\/envos\.org\/".*envos\.org/i
                },
                'WordPress': {
                    html: /(<link rel=("|')stylesheet("|') [^>]+wp-content|<meta name=("|')generator("|') [^>]+WordPress)/i
                },
                'Blogger': {
                    html: /<meta content=("|')blogger("|') [^>]+generator/i,
                    url: /^https?:\/\/[^\/]+\.blogspot\.com(\/|$)/i
                },
                'LiveInternet': {
                    html: /src="http:\/\/i\.li\.ru\/ReActive\/js\/global\//i
                },
                'LiveJournal': {
                    url: /^https?:\/\/[^\/]+\.livejournal\.com(\/|$)/i
                },
                'Tumblr': {
                    html: /<iframe src=("|')http:\/\/www\.tumblr\.com/i,
                    url: /^https?:\/\/[^\/]+\.tumblr\.com(\/|$)/i,
                    headers: {
                        'X-Tumblr-Usec': /.*/
                    }
                },
                'TypePad': {
                    html: /<meta name=("|')generator("|') [^>]+typepad/i,
                    url: /^https?:\/\/[^\/]+\.typepad\.com(\/|$)/i
                },
                'posterous': {
                    html: /<div class=("|')posterous/i
                },
                'Vox': {
                    url: /^https?:\/\/[^\/]+\.vox\.com(\/|$)/i
                }
            },
            shops: {
                'Magento': {
                    html: /var BLANK_URL = '[^>]+js\/blank\.html'/i
                },
                'osCommerce': {
                    html: /<!-- header_eof \/\/-->/i
                },
                'Prestashop': {
                    html: /(<meta name=("|')generator("|') [^>]+PrestaShop|Powered by <a href=("|')[^>]+PrestaShop)/i
                },
                'Zen Cart': {
                    html: /<meta name=("|')generator("|') [^>]+Zen Cart/i
                },
                'xtCommerce': {
                    html: /(<meta name=("|')generator("|') [^>]+xt:Commerce|<div class=("|')copyright("|')>.+<a[^>]+>xt:Commerce)/i
                },
                'Ubercart': {
                    html: /<script[^>]* src=("|')[^>]*uc_cart\/uc_cart_block\.js/i
                },
                'OpenCart': {
                    html: /Powered By <a[^>]*href=("|')[^>]+OpenCart/i
                },
                'CS Cart': {
                    html: /&nbsp;Powered by (<a[^>]*href=.http:\/\/www\.cs\-cart\.com|CS\-Cart)/i
                },
                'CubeCart': {
                    html: /Powered by <a[^>]*href=.http:\/\/www\.cubecart\.com/i
                },
                'Vamshop': {
                    html: /<link[^>]* rel="stylesheet"[^>]* href="templates\/vamshop\/stylesheet.css"/i
                },
                'VP-ASP': {
                    html: /(<a[^>]+>Powered By VP\-ASP Shopping Cart<\/a>|<script[^>]* src=("|')[^>]*vs350\.js)/
                },
                'osCSS': {
                    html: /<body onload=("|')window\.defaultStatus='oscss templates';("|')/i
                }
            },
            galleries: {
                'Coppermine': {
                    html: /<!--Coppermine Photo Gallery/i
                }
            }
        };
    },
    getData: function (html, domain) {
        var domain = domain || rdz.utils.domainFromUri(document.location.href).domain,
            result = [],
            patterns,
            pattern,
            CMSType,
            CMSName;

        if (domain) {
            patterns = this.getPatterns(domain);
            for (CMSType in patterns) {
                for (CMSName in patterns[CMSType]) {
                    pattern = patterns[CMSType][CMSName];
                    if (pattern.html && pattern.html.test(html)
                        && result.indexOf(CMSName) === -1
                    ) {
                        result.push(CMSName);
                    }
                }
            }
        }

        return result;
    }
};

window.rdz.utils.pageParameters = ['IYP', 'IYDP', 'IGP', 'LIO', 'Validation', 'Nesting'];

window.rdz.utils.CommercialsSevices = {
    "Google AdSense": "google_adsence",
    "Яндекс.Директ": "yandex_direct",
    "Begun": "begun",
    "Adriver": "adriver",
    "UkrBN": "ukr_bannernaya_set",
    "Banner.ua": "banner_ua",
    "Marketgid": "marketgid",
    "Redtram": "redtram",
    "Readme": "readme_ru",
    "Recreativ": "recreativ",
    "Pay-click.ru": "pay-click",
    "Teasernet": "teasernet",
    "RLE": "rle",
    "rb2": "rb2",
    "red": "red",
    "bannerbank": "bannerbank",
    "bigbn": "bigbn",
    "bigmir": "bigmir",
    "clickhere": "clickhere",
    "mbn.com.ua": "mbn",
    "rotaban": "rotaban",
    "banner.kiev.ua": "banner_kiev_ua",
    "madbanner": "madbanner",
    "link.ru": "link_ru",
    "MBE": "mbe",
    "adskape": "adskape",
    "ladycash": "ladycash",
    "bannerhost": "bannerhost",
    "adlabs": "adlabs",
    "smi2": "smi2",
    "attivertura": "attivertura",
    "B2Bcontext": "B2Bcontext",
    "rorer": "rorer",
    "regnum": "regnum",
    "rian": "rian",
    "interfax": "interfax",
    "novoteka": "novoteka",
    "join": "join",
    "selectornews": "selectornews",
    "rambler": "rambler",
    "supernews": "supernews",
    "yottos": "?",
    "bigrbc": "bigbord",
    "ukr.net": "ukr_net",
    "meta.ua": "meta_ua",
    "adonweb": "adonweb",
    "hit-sales": "hit-sales",
    "tradedoubler": "tradedoubler",
    "Я.Маркет": "ya_market",
    "autoteaser": "autoteaser",
    "Google Analytics": "google_analytics"
};

window.rdz.utils.CountersServices = {
    "Liveinternet": "LiveInternet",
    "Top100Rambler": "Rambler",
    "MailRu": "MailRu",
    "OpenStat": "OpenStat",
    "HotLog": "HotLog",
    "GoogleAnalytics": "GA",
    "YandexMetrica": "YaMetrika",
    "Bigmir": "Bigmir",
    "TopStat": "TopStat",
    "mycounter": "mycounter",
    "Log24": "Log24",
    "Yandeg": "Yandeg",
    "Mystat": "Mystat",
    "HIT_UA": "HIT_UA",
    "I_UA": "I_UA",
    "PROext": "PROext",
    "Alexa": "Alexa",
    "GoogleAdplanner": "GoogleAdplanner",
    "Compete": "Compete",
    "Quantcast": "Quantcast",
    "GoogleTrends": "GoogleTrends",
    "WebmoneyAdvisor": "WebmoneyAdvisor"
};

window.rdz.utils.CountersDBNames = {
    "LiveInternet": "Liveinternet",
    "Rambler": "Top100Rambler",
    "MailRu": "MailRu",
    "OpenStat": "OpenStat",
    "HotLog": "HotLog",
    "GA": "GoogleAnalytics",
    "YaMetrika": "YandexMetrica",
    "Bigmir": "Bigmir",
    "TopStat": "TopStat",
    "mycounter": "mycounter",
    "Log24": "Log24",
    "Yandeg": "Yandeg",
    "Mystat": "Mystat",
    "HIT_UA": "HIT_UA",
    "I_UA": "I_UA",
    "PROext": "PROext",
    "Alexa": "Alexa",
    "GoogleAdplanner": "GoogleAdplanner",
    "Compete": "Compete",
    "Quantcast": "Quantcast",
    "GoogleTrends": "GoogleTrends",
    "WebmoneyAdvisor": "WebmoneyAdvisor"
};

window.rdz.utils.Countries = {
    '4': { name: 'Afghanistan', iso2: 'AF' },
    '8': { name: 'Albania', iso2: 'AL' },
    '10': { name: 'Antarctica', iso2: 'AQ' },
    '12': { name: 'Algeria', iso2: 'DZ' },
    '16': { name: 'American Samoa', iso2: 'AS' },
    '20': { name: 'Andorra', iso2: 'AD' },
    '24': { name: 'Angola', iso2: 'AO' },
    '28': { name: 'Antigua and Barbuda', iso2: 'AG' },
    '31': { name: 'Azerbaijan', iso2: 'AZ' },
    '32': { name: 'Argentina', iso2: 'AR' },
    '36': { name: 'Australia', iso2: 'AU' },
    '40': { name: 'Austria', iso2: 'AT' },
    '44': { name: 'Bahamas', iso2: 'BS' },
    '48': { name: 'Bahrain', iso2: 'BH' },
    '50': { name: 'Bangladesh', iso2: 'BD' },
    '51': { name: 'Armenia', iso2: 'AM' },
    '52': { name: 'Barbados', iso2: 'BB' },
    '56': { name: 'Belgium', iso2: 'BE' },
    '60': { name: 'Bermuda', iso2: 'BM' },
    '64': { name: 'Bhutan', iso2: 'BT' },
    '68': { name: 'Bolivia', iso2: 'BO' },
    '70': { name: 'Bosnia and Herzegovina', iso2: 'BA' },
    '72': { name: 'Botswana', iso2: 'BW' },
    '74': { name: 'Bouvet Island', iso2: 'BV' },
    '76': { name: 'Brazil', iso2: 'BR' },
    '84': { name: 'Belize', iso2: 'BZ' },
    '86': { name: 'British Indian Ocean Territory', iso2: 'IO' },
    '90': { name: 'Solomon Islands', iso2: 'SB' },
    '92': { name: 'Virgin Islands, British', iso2: 'VG' },
    '96': { name: 'Brunei Darussalam', iso2: 'BN' },
    '100': { name: 'Bulgaria', iso2: 'BG' },
    '104': { name: 'Myanmar', iso2: 'MM' },
    '108': { name: 'Burundi', iso2: 'BI' },
    '112': { name: 'Belarus', iso2: 'BY' },
    '116': { name: 'Cambodia', iso2: 'KH' },
    '120': { name: 'Cameroon', iso2: 'CM' },
    '124': { name: 'Canada', iso2: 'CA' },
    '132': { name: 'Cape Verde', iso2: 'CV' },
    '136': { name: 'Cayman Islands', iso2: 'KY' },
    '140': { name: 'Central African Republic', iso2: 'CF' },
    '144': { name: 'Sri Lanka', iso2: 'LK' },
    '148': { name: 'Chad', iso2: 'TD' },
    '152': { name: 'Chile', iso2: 'CL' },
    '156': { name: 'China', iso2: 'CN' },
    '158': { name: 'Taiwan, Province of China', iso2: 'TW' },
    '162': { name: 'Christmas Island', iso2: 'CX' },
    '166': { name: 'Cocos (Keeling) Islands', iso2: 'CC' },
    '170': { name: 'Colombia', iso2: 'CO' },
    '174': { name: 'Comoros', iso2: 'KM' },
    '175': { name: 'Mayotte', iso2: 'YT' },
    '178': { name: 'Congo', iso2: 'CG' },
    '180': { name: 'Democratic Republic of the Congo', iso2: 'CD' },
    '184': { name: 'Cook Islands', iso2: 'CK' },
    '188': { name: 'Costa Rica', iso2: 'CR' },
    '191': { name: 'Croatia', iso2: 'HR' },
    '192': { name: 'Cuba', iso2: 'CU' },
    '196': { name: 'Cyprus', iso2: 'CY' },
    '203': { name: 'Czech Republic', iso2: 'CZ' },
    '204': { name: 'Benin', iso2: 'BJ' },
    '208': { name: 'Denmark', iso2: 'DK' },
    '212': { name: 'Dominica', iso2: 'DM' },
    '214': { name: 'Dominican Republic', iso2: 'DO' },
    '218': { name: 'Ecuador', iso2: 'EC' },
    '222': { name: 'El Salvador', iso2: 'SV' },
    '226': { name: 'Equatorial Guinea', iso2: 'GQ' },
    '231': { name: 'Ethiopia', iso2: 'ET' },
    '232': { name: 'Eritrea', iso2: 'ER' },
    '233': { name: 'Estonia', iso2: 'EE' },
    '234': { name: 'Faroe Islands', iso2: 'FO' },
    '238': { name: 'Falkland Islands (Malvinas)', iso2: 'FK' },
    '239': { name: 'South Georgia and the South Sandwich Islands', iso2: 'GS' },
    '242': { name: 'Fiji', iso2: 'FJ' },
    '246': { name: 'Finland', iso2: 'FI' },
    '248': { name: 'Aland Islands', iso2: 'AX' },
    '250': { name: 'France', iso2: 'FR' },
    '254': { name: 'French Guiana', iso2: 'GF' },
    '258': { name: 'French Polynesia', iso2: 'PF' },
    '260': { name: 'French Southern Territories', iso2: 'TF' },
    '262': { name: 'Djibouti', iso2: 'DJ' },
    '266': { name: 'Gabon', iso2: 'GA' },
    '268': { name: 'Georgia', iso2: 'GE' },
    '270': { name: 'Gambia', iso2: 'GM' },
    '275': { name: 'Palestinian', iso2: 'PS' },
    '276': { name: 'Germany', iso2: 'DE' },
    '288': { name: 'Ghana', iso2: 'GH' },
    '292': { name: 'Gibraltar', iso2: 'GI' },
    '296': { name: 'Kiribati', iso2: 'KI' },
    '300': { name: 'Greece', iso2: 'GR' },
    '304': { name: 'Greenland', iso2: 'GL' },
    '308': { name: 'Grenada', iso2: 'GD' },
    '312': { name: 'Guadeloupe', iso2: 'GP' },
    '316': { name: 'Guam', iso2: 'GU' },
    '320': { name: 'Guatemala', iso2: 'GT' },
    '324': { name: 'Guinea', iso2: 'GN' },
    '328': { name: 'Guyana', iso2: 'GY' },
    '332': { name: 'Haiti', iso2: 'HT' },
    '334': { name: 'Heard Island and Mcdonald Islands', iso2: 'HM' },
    '336': { name: 'Holy See (Vatican City State)', iso2: 'VA' },
    '340': { name: 'Honduras', iso2: 'HN' },
    '344': { name: 'Hong Kong', iso2: 'HK' },
    '348': { name: 'Hungary', iso2: 'HU' },
    '352': { name: 'Iceland', iso2: 'IS' },
    '356': { name: 'India', iso2: 'IN' },
    '360': { name: 'Indonesia', iso2: 'ID' },
    '364': { name: 'Islamic Republic Of Iran', iso2: 'IR' },
    '368': { name: 'Iraq', iso2: 'IQ' },
    '372': { name: 'Ireland', iso2: 'IE' },
    '376': { name: 'Israel', iso2: 'IL' },
    '380': { name: 'Italy', iso2: 'IT' },
    '384': { name: 'Cote D\'Ivoire', iso2: 'CI' },
    '388': { name: 'Jamaica', iso2: 'JM' },
    '392': { name: 'Japan', iso2: 'JP' },
    '398': { name: 'Kazakhstan', iso2: 'KZ' },
    '400': { name: 'Jordan', iso2: 'JO' },
    '404': { name: 'Kenya', iso2: 'KE' },
    '408': { name: 'Democratic People\'s Republic of Korea', iso2: 'KP' },
    '410': { name: 'Republic of Korea', iso2: 'KR' },
    '414': { name: 'Kuwait', iso2: 'KW' },
    '417': { name: 'Kyrgyzstan', iso2: 'KG' },
    '418': { name: 'Lao People\'s Democratic Republic', iso2: 'LA' },
    '422': { name: 'Lebanon', iso2: 'LB' },
    '426': { name: 'Lesotho', iso2: 'LS' },
    '428': { name: 'Latvia', iso2: 'LV' },
    '430': { name: 'Liberia', iso2: 'LR' },
    '434': { name: 'Libyan Arab Jamahiriya', iso2: 'LY' },
    '438': { name: 'Liechtenstein', iso2: 'LI' },
    '440': { name: 'Lithuania', iso2: 'LT' },
    '442': { name: 'Luxembourg', iso2: 'LU' },
    '446': { name: 'Macao', iso2: 'MO' },
    '450': { name: 'Madagascar', iso2: 'MG' },
    '454': { name: 'Malawi', iso2: 'MW' },
    '458': { name: 'Malaysia', iso2: 'MY' },
    '462': { name: 'Maldives', iso2: 'MV' },
    '466': { name: 'Mali', iso2: 'ML' },
    '470': { name: 'Malta', iso2: 'MT' },
    '474': { name: 'Martinique', iso2: 'MQ' },
    '478': { name: 'Mauritania', iso2: 'MR' },
    '480': { name: 'Mauritius', iso2: 'MU' },
    '484': { name: 'Mexico', iso2: 'MX' },
    '492': { name: 'Monaco', iso2: 'MC' },
    '496': { name: 'Mongolia', iso2: 'MN' },
    '498': { name: 'Republic of Moldova', iso2: 'MD' },
    '499': { name: 'Montenegro', iso2: 'ME' },
    '500': { name: 'Montserrat', iso2: 'MS' },
    '504': { name: 'Morocco', iso2: 'MA' },
    '508': { name: 'Mozambique', iso2: 'MZ' },
    '512': { name: 'Oman', iso2: 'OM' },
    '516': { name: 'Namibia', iso2: 'NA' },
    '520': { name: 'Nauru', iso2: 'NR' },
    '524': { name: 'Nepal', iso2: 'NP' },
    '528': { name: 'Netherlands', iso2: 'NL' },
    '530': { name: 'Netherlands Antilles', iso2: 'AN' },
    '533': { name: 'Aruba', iso2: 'AW' },
    '540': { name: 'New Caledonia', iso2: 'NC' },
    '548': { name: 'Vanuatu', iso2: 'VU' },
    '554': { name: 'New Zealand', iso2: 'NZ' },
    '558': { name: 'Nicaragua', iso2: 'NI' },
    '562': { name: 'Niger', iso2: 'NE' },
    '566': { name: 'Nigeria', iso2: 'NG' },
    '570': { name: 'Niue', iso2: 'NU' },
    '574': { name: 'Norfolk Island', iso2: 'NF' },
    '578': { name: 'Norway', iso2: 'NO' },
    '580': { name: 'Northern Mariana Islands', iso2: 'MP' },
    '581': { name: 'United States Minor Outlying Islands', iso2: 'UM' },
    '583': { name: 'Federated States of Micronesia', iso2: 'FM' },
    '584': { name: 'Marshall Islands', iso2: 'MH' },
    '585': { name: 'Palau', iso2: 'PW' },
    '586': { name: 'Pakistan', iso2: 'PK' },
    '591': { name: 'Panama', iso2: 'PA' },
    '598': { name: 'Papua New Guinea', iso2: 'PG' },
    '600': { name: 'Paraguay', iso2: 'PY' },
    '604': { name: 'Peru', iso2: 'PE' },
    '608': { name: 'Philippines', iso2: 'PH' },
    '612': { name: 'Pitcairn', iso2: 'PN' },
    '616': { name: 'Poland', iso2: 'PL' },
    '620': { name: 'Portugal', iso2: 'PT' },
    '624': { name: 'Guinea-Bissau', iso2: 'GW' },
    '626': { name: 'Timor-Leste', iso2: 'TL' },
    '630': { name: 'Puerto Rico', iso2: 'PR' },
    '634': { name: 'Qatar', iso2: 'QA' },
    '638': { name: 'Reunion', iso2: 'RE' },
    '642': { name: 'Romania', iso2: 'RO' },
    '643': { name: 'Russian Federation', iso2: 'RU' },
    '646': { name: 'Rwanda', iso2: 'RW' },
    '652': { name: 'Saint Barthelemy', iso2: 'BL' },
    '654': { name: 'Saint Helena', iso2: 'SH' },
    '659': { name: 'Saint Kitts and Nevis', iso2: 'KN' },
    '660': { name: 'Anguilla', iso2: 'AI' },
    '662': { name: 'Saint Lucia', iso2: 'LC' },
    '663': { name: 'Saint Martin (French part)', iso2: 'MF' },
    '666': { name: 'Saint Pierre and Miquelon', iso2: 'PM' },
    '670': { name: 'Saint Vincent and the Grenadines', iso2: 'VC' },
    '674': { name: 'San Marino', iso2: 'SM' },
    '678': { name: 'Sao Tome and Principe', iso2: 'ST' },
    '682': { name: 'Saudi Arabia', iso2: 'SA' },
    '686': { name: 'Senegal', iso2: 'SN' },
    '688': { name: 'Serbia', iso2: 'RS' },
    '690': { name: 'Seychelles', iso2: 'SC' },
    '694': { name: 'Sierra Leone', iso2: 'SL' },
    '702': { name: 'Singapore', iso2: 'SG' },
    '703': { name: 'Slovakia', iso2: 'SK' },
    '704': { name: 'Viet Nam', iso2: 'VN' },
    '705': { name: 'Slovenia', iso2: 'SI' },
    '706': { name: 'Somalia', iso2: 'SO' },
    '710': { name: 'South Africa', iso2: 'ZA' },
    '716': { name: 'Zimbabwe', iso2: 'ZW' },
    '724': { name: 'Spain', iso2: 'ES' },
    '729': { name: 'Sudan', iso2: 'SD' },
    '732': { name: 'Western Sahara', iso2: 'EH' },
    '736': { name: 'Sudan', iso2: 'SD' },
    '740': { name: 'Suriname', iso2: 'SR' },
    '744': { name: 'Svalbard and Jan Mayen', iso2: 'SJ' },
    '748': { name: 'Swaziland', iso2: 'SZ' },
    '752': { name: 'Sweden', iso2: 'SE' },
    '756': { name: 'Switzerland', iso2: 'CH' },
    '760': { name: 'Syrian Arab Republic', iso2: 'SY' },
    '762': { name: 'Tajikistan', iso2: 'TJ' },
    '764': { name: 'Thailand', iso2: 'TH' },
    '768': { name: 'Togo', iso2: 'TG' },
    '772': { name: 'Tokelau', iso2: 'TK' },
    '776': { name: 'Tonga', iso2: 'TO' },
    '780': { name: 'Trinidad and Tobago', iso2: 'TT' },
    '784': { name: 'United Arab Emirates', iso2: 'AE' },
    '788': { name: 'Tunisia', iso2: 'TN' },
    '792': { name: 'Turkey', iso2: 'TR' },
    '795': { name: 'Turkmenistan', iso2: 'TM' },
    '796': { name: 'Turks and Caicos Islands', iso2: 'TC' },
    '798': { name: 'Tuvalu', iso2: 'TV' },
    '800': { name: 'Uganda', iso2: 'UG' },
    '804': { name: 'Ukraine', iso2: 'UA' },
    '807': { name: 'The Former Yugoslav Republic of Macedonia', iso2: 'MK' },
    '818': { name: 'Egypt', iso2: 'EG' },
    '826': { name: 'United Kingdom', iso2: 'GB' },
    '831': { name: 'Guernsey', iso2: 'GG' },
    '832': { name: 'Jersey', iso2: 'JE' },
    '833': { name: 'Isle of Man', iso2: 'IM' },
    '834': { name: 'United Republic of Tanzania', iso2: 'TZ' },
    '840': { name: 'United States', iso2: 'US' },
    '850': { name: 'Virgin Islands, U.S.', iso2: 'VI' },
    '854': { name: 'Burkina Faso', iso2: 'BF' },
    '858': { name: 'Uruguay', iso2: 'UY' },
    '860': { name: 'Uzbekistan', iso2: 'UZ' },
    '862': { name: 'Venezuela', iso2: 'VE' },
    '876': { name: 'Wallis and Futuna', iso2: 'WF' },
    '882': { name: 'Samoa', iso2: 'WS' },
    '887': { name: 'Yemen', iso2: 'YE' },
    '891': { name: 'SERBIA Republic', iso2: 'CS' },
    '894': { name: 'Zambia', iso2: 'ZM' },
    '900': { name: 'European Union', iso2: 'EU' },
    '901': { name: 'Non-spec Asia Location', iso2: 'AP' },
    '902': { name: 'Reserved', iso2: 'ZZ' },
    '999': { name: 'World', iso2: 'WO' }
};
