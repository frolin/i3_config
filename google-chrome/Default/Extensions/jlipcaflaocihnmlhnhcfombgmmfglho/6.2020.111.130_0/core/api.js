/** @namespace global scope for parameters' api request */
window.rdz.api = {
    headers: function () {
        return {
            user_agent: ["User-Agent", window.navigator.userAgent + " RDSbar/" + chrome.runtime.getManifest().version],
            content_type: ['Content-Type', 'application/json; charset=utf-8'],
            authorization: ['Authorization', /*'Base '*/ 'Basic ' + window.btoa(rdz.user.get('key') + ":1")],
            x_rdsappkey: ['X-RdsAppKey', window.browser ? '7c95598d-d708-488f-bf2a-e64f11a49d32' : '60403d2e-0542-4fd3-914a-dc44999a6314']
        };
    },
    APIClass: function (a) {
        var o = function () {
            this.callback = rdz.api.APICallback;
            //this.url = 'http://recipdonor.com:998/api/session/get/' + a.session.Id + '?format=json';             
            this.url = 'http://62.149.1.74:977/api/session/get/' + a.session.Id + '?format=json';
            this.type = 'GET';
            this.parseResponse = rdz.api.APISessionParamsParser;

            //uses in sessions in which we need to modify response from server (1 to true for example)
            this.modifyResponse = function (response) {
                return Number(response, 10);
            };

            rdz.api[a.self.id].call(this, a);

            //raise count each time until SessionStatus !== "Completed (for parameters with session)
            //only for request with sessions
            if (this.session) {
                var c = rdz.cache.get(['SESSION', a.self.id, a.self.mass_id ? a.self.mass_id : a.self.page]),
                    r = c && c['RequestsCount'];
                this.request_count = (r !== null && typeof r !== 'undefined') ? r + 1 : 0;

                if (a.self.mass_id) {
                    this.update_points = c && c['update_points'];
                    //saving here isn't showed data
                    this.view_new_data = c && c['view_new_data'] || [];
                }
            }


        };

        o.prototype.extract_new_data = function (new_data) {
            var cache = rdz.cache.get(['SESSION', a.self.id, a.self.mass_id]),
                cached = cache && rdz._.isArray(cache.Domains),
                not_included,
                values = [],
                v;

            if (new_data.value &&
                rdz._.isArray(new_data.value.Domains) &&
                new_data.value.Progress !== cache.Progress
            ) {
                new_data.value.Domains.forEach(function (e) {
                    not_included = true;
                    if (cached) {
                        cache.Domains.forEach(function (o) {
                            if (e.DomainName === o.DomainName) {
                                not_included = false;
                            }
                        });
                    }
                    if (not_included) {
                        /*if you need some new property from response, add here*/
                        values.push({
                            uri: e.DomainName,
                            value: e.Values[0].Value,
                            fullValue: e.Values,
                            errors: e.Values[0].Errors
                        });
                    }
                });
            }

            return values;
        };

        o.prototype.is_update_ready = function (new_data) {
            var progress = new_data.value.Progress,
                level = 0 < progress && progress < 25 ? 25 :
                    25 <= progress && progress < 50 ? 50 :
                        50 <= progress && progress < 75 ? 75 : null;

            var find_point = this.update_points.filter(function (a) {
                return a === level;
            });
            this.update_points = rdz._.without(this.update_points, level);

            return find_point.length !== 0 || progress === 100;
        };

        return new o;
    },
    APINewSessionClass: function (a) {

        var o = function () {
            this.source = 'SESSION';
            this.xhr_body = (function () {
                var bodyData = {
                    //a.model.DomainNames exeption from PRgMain (model PR, models.js) <[domain]>
                    //DomainNames also uses from mass checking a.self.mass_id  <[domain, ...]>
                    DomainNames: a.self.mass_id ? a.model.get('DomainNames') : [a.model.get('DomainNames') || a.self.source],
                    Parameters: [a.self.api.session_id || a.self.id],
                    Refresh: !!a.model.get('check_mode') //false is default, can be undefined (if not mass checks), should be Boolean
                };

                // set request body
                if (a.self.api.session_id === 'Counters' ||
                    a.self.id === 'APICounters') { // Counters
                    var DomainNames = [],
                        counters = a.model.get('counters') || {},
                        c;

                    if (a.self.mass_id) {
                        DomainNames = a.model.get('bodyData');
                    } else {
                        for (c in counters) {
                            if (c in rdz.utils.RDSCountersNames) {
                                DomainNames.push({
                                    SiteId: (c === 'liveinternet' ? -5 : counters[c]),
                                    CounterType: rdz.utils.RDSCountersNames[c],
                                    Url: a.self.source
                                });
                            }
                        }
                    }

                    bodyData.DomainNames = DomainNames;
                } else if (a.self.api.session_id === 36) { // Geo
                    bodyData.DomainNames = [a.model.get('ip')];
                } else if (a.self.api.session_id === 'UniqueContent') {
                    var urls = a.self.mass_id ? a.model.get('DomainNames') : [a.self.url];
                    bodyData.DomainNames = [];
                    urls.forEach(function (url) {
                        bodyData.DomainNames.push({
                            'Action': 'Uri',
                            'CheckData': url,
                            'Ignore': ''
                        });
                    });
                } else if (a.self.api.session_id === 'Majestic') {
                    var domains = a.model.get('DomainNames');
                    bodyData.DomainNames = [];
                    domains.forEach(function (domain) {
                        bodyData.DomainNames.push({
                            'TypeRequest': 'Fresh',
                            'DomainName': domain
                        });
                    });
                } else if (a.self.api.session_id === 'StatHistory') {
                    bodyData = a.model.get('bodyData');
                }

                return JSON.stringify(bodyData);
            })();

            //this.url = 'http://recipdonor.com:998/api/session/new?format=json';
            this.url = 'http://62.149.1.74:977/api/session/new?format=json';
            var parameter = a.self.api.session_id || a.self.id;
            this.type = 'PUT';
            this.parseResponse = rdz.api.APINewSessionParser;

            var h = rdz.api.headers();
            this.header = [/*h.user_agent,*/ h.content_type, h.authorization, h.x_rdsappkey];

            this.callback = rdz.api.APICallback;
            //rdz.api[a.model.get('name')+ '_session'].call(this,a);
        };

        return new o;
    },
    APICallback: function (response, request) {
        var result = {};

        if (request.readyState === 4) {

            switch (request.status) {
                case 401:
                    result = {value: rdz.errors.APIOFF};
                    //self.timer.cancel();
                    break;

                case 402:
                    result = {value: rdz.errors.BUNKRUPT};
                    break;

                /* case 500:
                 result = {action:'RESTART', value:null};
                 break;*/

                case 200:
                    result = this.api.parseResponse(response, request);
                    break;

                default :
                    //case 502, 504
                    result = {value: -4}; //TODO:check what will be shown
                    break;
            }
        }
        else {
            //self.timer.cancel();
        }

        return result;
    },

    APISessionParamsParser: function (response, request) {
        var result = {value: JSON.parse(response)};
        result.value["ExpireAt"] = (+new Date()) + 60 * 60 * 1000; // use system time

        if (request.self.mass_id) {
            //extracting new data from session if it's mass checks
            result.value['new_data'] = request.self.api.extract_new_data(result);
            //flag defines that UI is going to be updated
            result.value.update_ready = request.self.api.is_update_ready(result);
            //save array with update points
            result.value["update_points"] = this.update_points;

            if (result.value.update_ready) {
                //add hasn't been showed data
                result.value['new_data'] = rdz._.union(result.value['new_data'], this['view_new_data']);
            } else {
                //save hasn't been showed data for future UI update
                result.value['view_new_data'] = rdz._.union(this['view_new_data'], result.value['new_data']);
            }
            //console.log(result.value.Progress, result.value.update_ready, JSON.stringify(result.value['new_data']), JSON.stringify(result.value['view_new_data']) )
        }

        if (result.value.SessionStatus !== 'Completed' &&
            result.value.SessionStatus !== 4) {
            //increase counter (increase interval between requests)
            result.value["RequestsCount"] = this.request_count;
            result.action = 'SESSION_TIMER';

        }
        else if (result.value.Domains !== null &&
            typeof result.value.Domains[0] !== "undefined" &&
            typeof result.value.Domains[0].Values[0].Value !== 'undefined' &&
            result.value.Domains[0].Values[0].Value !== null) {
            if (request.self.mass_id) {
                if (result.value.Progress === 100) {
                    result.value["RequestsCount"] = 0;
                    result.action = 'SESSION_ENDED';
                } else {
                    result.value["RequestsCount"] = this.request_count;
                    result.action = 'SESSION_TIMER';
                }
            }
            else {
                //reset counter for next time
                result.value["RequestsCount"] = 0;
                //copy value to get it easier in future
                if (result.value.Domains[0].Values.length === 1) { // to process all values
                    result.value.value = this.modifyResponse(result.value.Domains[0].Values[0].Value);
                } else {
                    result.value.value = this.modifyResponse(result.value.Domains[0].Values);
                }
                result.action = 'SESSION_ENDED';
            }
        }
        else {
            result.action = 'ERROR';
        }

        return result;
    },
    APINewSessionParser: function (response, request) {
        var result = JSON.parse(response);
        result["ExpireAt"] = (+new Date()) + 60 * 60 * 1000; // use system time
        result["RequestsCount"] = 0;

        if (request.self.mass_id) {
            result.update_points = [25, 50, 75];
        }

        return {action: 'SESSION_START', value: result};
    }
};

window.rdz.request.AccountData = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "AccountData";
    this.source = 'API';
};

window.rdz.api.AccountData = function () {
    this.url = 'https://www.recipdonor.com/account/data';
    this.type = 'GET';

    this.parseResponse = function (response) {
        response = JSON.parse(response);
        return {
            value: {
                email: response.RdsEmail,
                key: response.RdsAccountApiKey,
                balance: response.RdsAccountBalance
            }
        };
    };
};

window.rdz.request.Prices = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "Prices";
    this.source = 'API';
};

window.rdz.api.Prices = function () {
    this.url = 'http://recipdonor.com:998/api/prices?format=json';
    this.type = 'GET';

    this.parseResponse = function (response) {
        response = JSON.parse(response);
        var result = {
                History: {},
                UIMirrorsCount: 0
            },
            names = {
                Ip: 'IP',
                Positions: ['positions', 'positionspage'],
                Seo: 'Seo',
                BuyLinks: ['LinksBuy', 'linkspurch'],
                Cy: ['TYC', 'TYCCategory'],
                YaBar: ['TYCBar', 'TYCTopics', 'TYCRegion'],
                Pr: ['PR', 'PRpage', 'PRpageMain'], //PRpage in CheckPagesLibrary
                IY: 'IY',
                IyDate: 'IYD',
                IG: 'IG',
                BingIndex: 'ibing',
                BY: 'BY',
                YandexImage: 'Imgyan',
                GoogleImage: 'Imgg',
                Subdomen: 'Subdomen',
                Wa: 'WA',
                SeoMoz: ['seomoz', 'seomozP'], //seomozP in CheckPagesLibrary
                GoogleBack: ['BackG', 'LG'], //in bar BackG, in user LG
                BackBing: 'BackBing',
                Bing: 'Bing',
                Alexa: ['Alexa', 'AlexaPage'],
                BackAlexa: ['BackAlexa', 'BackAlexaPage'],
                Dmoz: 'DMOZ',
                PageValues: ['CMS', 'Counters', 'CountersPage', 'CMSpage', 'pageweight', 'LinksIn', 'LinksOut', 'pagetitle', 'commercials', 'commercialsDomains', 'RecipientPage', 'LinkPresence', 'Anchor', 'pageweightDomain', 'LinksInDomain', 'LinksOutDomain', 'pagetitleDomain'], //CMSpage in CheckPagesLibrary
                Majestic: ['MJ', 'CF', 'TF'],
                Semrush: 'Semrush',
                Solomono: ['Solomono', 'ISolomono', 'SolomonoPage', 'ISolomonoPage'],
                GeoTool: ['Host', 'Provider', 'Geo'],
                DomainAge: 'Age',
                Counters: ['APICounters', 'UICounters'],
                CheckDangerous: ['Dangerous', 'DangerousPage', 'CheckDangerous'],
                SocialNetworks: ['SocialNetworks', 'SocialNetworkspage'],
                UniqueContent: ['UniqueContent', 'UniqueContentPage'],
                StatHistory: 'StatHistory',
                DisableBarAd: "DisableAd",

                IYPages: 'IYP',
                IyPagesDate: 'IYDP',
                IGPages: 'IGP',

                CyHistory: 'TYC',
                IyHistory: 'IY',
                PrHistory: 'PR'
            };
        response.forEach(function (e) {
            if (names[e.TaskVariant]) {
                if (e.TaskVariant === 'CyHistory' ||
                    e.TaskVariant === 'IyHistory' ||
                    e.TaskVariant === 'PrHistory') {
                    //copy history prices
                    result.History[names[e.TaskVariant]] = e.Price;
                }
                else {
                    if (typeof names[e.TaskVariant] === 'string') {
                        result[names[e.TaskVariant]] = e.Price;
                    }
                    else {
                        names[e.TaskVariant].forEach(function (e2) {
                            result[e2] = e.Price;
                        });
                    }

                }

            }
        });
        return {value: result};
    };
};

window.rdz.request.Recipients = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "Recipients";
    this.source = 'API';
};

window.rdz.api.Recipients = function () {
    this.url = 'http://www.recipdonor.com:998/api/recip/?format=json';
    this.type = 'GET';
    this.parseResponse = function (response) {
        response = JSON.parse(response);
        return {
            value: response
        };
    };
    var h = rdz.api.headers();
    this.header = [/*h.user_agent,*/ h.content_type, h.authorization, h.x_rdsappkey];
};

window.rdz.request.HistoryCount = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "HistoryCount";
    //this.source = this.domain;
    var converter = {
        IY: 'iy',
        TYC: 'cy',
        PR: 'pr'
    };

    this.displayUrl = "http://www.recipdonor.com/info?TaDomains=" + this.domain + "&Check" + converter[this.model.get('parameter')] + "=true";

};

window.rdz.api.HistoryCount = function (a) {
    var converter = {
        IY: 'iy',
        TYC: 'cy',
        PR: 'pr'
    };

    this.url = 'http://recipdonor.com:998/api/history/count/siteslibrary/' + converter[a.model.get('parameter')] + '/' + a.self.domain + '?format=json';
    this.type = 'GET';


    this.parseResponse = function (response) {
        response = JSON.parse(response);
        var result = response;

        return {value: result, action: 'API_HISTORY_COUNT', param: a.model.get('parameter')};
    };

    var h = rdz.api.headers();
    this.header = [/*h.user_agent,*/ h.content_type, h.authorization, h.x_rdsappkey];
};

window.rdz.request.History = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "History";
    //this.source = this.domain;
};

window.rdz.api.History = function (a) {
    var converter = {
        IY: 'iy',
        TYC: 'cy',
        PR: 'pr'
    };

    this.url = 'http://recipdonor.com:998/api/history/siteslibrary/' + converter[a.model.get('parameter')] + '/' + a.self.domain + '?format=json';
    this.type = 'GET';

    this.parseResponse = function (response) {
        response = JSON.parse(response);
        var result = response;

        return {value: result, action: 'API_HISTORY', param: a.model.get('parameter')};
    };

    var h = rdz.api.headers();
    this.header = [/*h.user_agent,*/ h.content_type, h.authorization, h.x_rdsappkey];
};

window.rdz.request.SubdomainsCount = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "SubdomainsCount";
    this.source = this.domain;
    this.serviceUrl = 'http://recipdonor.com:998/api/subdomens/count/' + this.domain + '?format=json';
};

window.rdz.api.SubdomainsCount = function (a) {

    this.url = 'http://recipdonor.com:998/api/subdomens/count/' + a.self.domain + '?format=json';
    this.type = 'GET';

    this.parseResponse = function (response) {
        var value = parseInt(response, 10);
        return {value: value >= -1 ? value : rdz.errors.PARSE};
    };

    var h = rdz.api.headers();
    this.header = [/*h.user_agent,*/ h.content_type, h.authorization, h.x_rdsappkey];
};

window.rdz.request.Webmoney = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "Webmoney";
    this.source = this.domain;
    this.serviceUrl = 'http://www.recipdonor.com/wm?Domain=' + this.domain;
};

window.rdz.api.Webmoney = function (a) {

    this.url = 'http://recipdonor.com:998/api/wmidsbysite/count?format=json';
    this.type = 'POST';

    this.xhr_body = JSON.stringify([a.self.domain]);

    this.parseResponse = function (response) {
        var result = JSON.parse(response);
        return {value: result && result[0] ? result[0].ResultsCount : null};
    };

    var h = rdz.api.headers();
    this.header = [/*h.user_agent,*/ h.content_type, h.authorization, h.x_rdsappkey];
};

window.rdz.request.Subdomains = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "Subdomains";
    this.source = this.domain;
};

window.rdz.api.Subdomains = function (a) {

    this.url = 'http://recipdonor.com:998/api/subdomens/' + a.self.domain + '?format=json';
    this.type = 'GET';

    this.parseResponse = function (response) {
        var result = JSON.parse(response);
        return {value: result};
    };

    var h = rdz.api.headers();
    this.header = [/*h.user_agent,*/ h.content_type, h.authorization, h.x_rdsappkey];
};

window.rdz.request.MirrorsCount = function (url, DataRequest) {
    DataRequest.apply(this, arguments);

    this.serviceUrl = 'http://recipdonor.com:998/api/mirror/count/' + this.domain + '?format=json';
    this.displayUrl = 'http://www.recipdonor.com/info?TaDomains=' + this.domain + '&CheckBonding=true';
    this.id = "MirrorsCount";
    this.source = this.domain;

    var h = rdz.api.headers();
    this.header = [h.content_type, h.authorization, h.x_rdsappkey];


    this.parseResponse = function (response) {
        var value = parseInt(response, 10);
        return {value: value >= -1 ? value : rdz.errors.PARSE};
    };
};

window.rdz.request.UIMirrorsCount = function (url, DataRequest) {
    DataRequest.apply(this, arguments);

    this.serviceUrl = 'http://recipdonor.com:998/api/mirrorbulk/count?format=json';
    this.id = "UIMirrorsCount";

    var h = rdz.api.headers();
    this.header = [h.content_type, h.authorization, h.x_rdsappkey];

    this.xhr_type = 'POST';

    this.xhr_body = (function (self) {
        var domains = self.model.get('DomainNames'),
            request_body = [];

        domains.forEach(function (domain) {
            request_body.push({"Domain": domain, "MaxCount": null});
        });

        return JSON.stringify(request_body);
    })(this);


    this.parseResponse = function (response) {
        var res = JSON.parse(response),
            values = [];

        res.forEach(function (e) {
            values.push({uri: e.Domain, value: e.Count});
        });

        return {value: values};
    };
};

window.rdz.request.Mirrors = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "Mirrors";
    this.source = this.domain;
};

window.rdz.api.Mirrors = function (a) {

    this.url = 'http://recipdonor.com:998/api/mirror/' + a.self.domain + '?format=json';
    this.type = 'GET';

    this.parseResponse = function (response) {
        response = JSON.parse(response);
        var result = response;

        return {value: result};
    };

    var h = rdz.api.headers();
    this.header = [/*h.user_agent,*/ h.content_type, h.authorization, h.x_rdsappkey];
};


window.rdz.api.BaseSessionClass = function (a) {
    //is parameter use session to get value
    this.session = true;
    //parameter id for request body
    this.session_id = null;
    //where to store response
    this.source = 'SESSION';

    var h = rdz.api.headers();
    this.header = [/*h.user_agent,*/ h.content_type, h.authorization, h.x_rdsappkey];
};


window.rdz.api.IY = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 1;
};

window.rdz.api.IYD = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'IyDate';
};

window.rdz.api.IYP = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'IYPagesExt';
    this.modifyResponse = function (response) {
        return Number(response.Value);
    };
};

window.rdz.api.IYDP = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'IyPagesDate';
    this.modifyResponse = function (response) {
        return +new Date(response.Date);
    };
};

window.rdz.api.IG = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'IG';
};

window.rdz.api.IGP = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'IGPages';
};

window.rdz.api.TYC = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'Cy';
};

window.rdz.api.YaBar = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'YaBar';
};

window.rdz.api.PR = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'Pr';
};

window.rdz.api.PRMain = function (a) {
    rdz.api.PR.call(this, a);
};

window.rdz.api.PRg = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'PrBonding';
};

window.rdz.api.PRgMain = function (a) {
    rdz.api.PRg.call(this, a);
};

window.rdz.api.BackG = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'GoogleBack';
};

window.rdz.api.IBing = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'BingIndex';
};

window.rdz.api.BY = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'BY';

};

window.rdz.api.PicturesYa = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'YandexImage';

};

window.rdz.api.Pictures = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'GoogleImage';

};

window.rdz.api.WA = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'Wa';
};

window.rdz.api.Dmoz = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'Dmoz';
};

window.rdz.request.Whois = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = 'Whois';
    this.source = this.domain;
    //this.source = 'API';

};
window.rdz.api.Whois = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'Whois';
    this.model = {DomainNames: a.model.domain};
    this.modifyResponse = function (response) {
        response.WhoisStartDate = new Date(response.WhoisStartDate).getTime();
        response.WhoisExpDate = new Date(response.WhoisExpDate).getTime();
        response.WhoisInfo = response.WhoisInfo.replace('\u21B5', '');
        return response;
    };
};

window.rdz.request.Age = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "Age";
    this.source = this.domain;
    this.displayUrl = rdz.utils.urlForWhoIs(this.domain);
};

window.rdz.api.Age = function (a) {
    //this.url = 'http://recipdonor.com:998/api/age/'+ a.self.domain + '?format=json';
    //this.type = 'GET';    
    //this.parseResponse = function(response) {
    //    var date = (response === '' || response.toLowerCase() === 'null') ? 0 : new Date(JSON.parse(response)).getTime();
    //    return {
    //        value : 1//date
    //    }
    //}    
    this.url = 'http://recipdonor.com:998/api/age/bulk?format=json';
    this.type = 'POST';
    this.xhr_body = JSON.stringify([a.self.domain]);
    this.parseResponse = function (response) {
        var result = JSON.parse(response);
        result && result[0] ? result = (new Date(result[0]['Age'])).getTime() : null;
        return {
            value: result
        };
    };
    var h = rdz.api.headers();
    this.header = [/*h.user_agent,*/ h.content_type, h.authorization, h.x_rdsappkey];
};

window.rdz.request.WhoisCount = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "WhoisCount";
    this.source = this.domain;
};

window.rdz.api.WhoisCount = function (a) {
    this.url = 'http://recipdonor.com:998/api/whoishist/bulk/count?format=json';
    this.type = 'POST';
    this.xhr_body = JSON.stringify([a.self.domain]);

    this.parseResponse = function (response) {
        response = JSON.parse(response);
        var result = response;
        result != null ? result = result[0]['Count'] : null;
        return {
            value: result
        };
    };
    var h = rdz.api.headers();
    this.header = [/*h.user_agent,*/ h.content_type, h.authorization, h.x_rdsappkey];
};

window.rdz.request.CountForWhoisEmail = function (url, DataRequest) {
    if (DataRequest) {
        DataRequest.apply(this, arguments);
    }
    this.id = "CountForWhoisEmail";
    this.source = this.domain;

};
window.rdz.api.CountForWhoisEmail = function (a) {
    this.url = 'http://recipdonor.com:998/api/whois/search/count?format=json';
    this.type = 'PUT';
    if (a && a.model) {
        var params = a.model.get('params');

        this.xhr_body = JSON.stringify({
            Parameters: [{
                SearchIn: params.SearchIn,
                SearchString: '"' + params.SearchString + '"',
                SearchType: params.SearchType
            }]
        });

        this.parseResponse = function (response) {
            response = JSON.parse(response);
            var result = response;
            return {
                value: result
            };
        };
        var h = rdz.api.headers();
        this.header = [/*h.user_agent,*/ h.content_type, h.authorization, h.x_rdsappkey];
    }
};

window.rdz.request.CountForWhoisEmail.instance = new window.rdz.request.CountForWhoisEmail();
window.rdz.api.CountForWhoisEmail.instance = new window.rdz.api.CountForWhoisEmail();

window.rdz.request.CountForWhoisDns = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "CountForWhoisDns";
};
window.rdz.request.CountForWhoisDns.prototype = window.rdz.request.CountForWhoisEmail.instance;
window.rdz.api.CountForWhoisDns = window.rdz.api.CountForWhoisEmail;


window.rdz.request.CountForWhoisInfo = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "CountForWhoisInfo";
};
window.rdz.request.CountForWhoisInfo.prototype = window.rdz.request.CountForWhoisEmail.instance;
window.rdz.api.CountForWhoisInfo = window.rdz.api.CountForWhoisEmail;


window.rdz.request.CountForWhoisPhone = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "CountForWhoisPhone";
};
window.rdz.request.CountForWhoisPhone.prototype = window.rdz.request.CountForWhoisEmail.instance;
window.rdz.api.CountForWhoisPhone = window.rdz.api.CountForWhoisEmail;


window.rdz.request.CountForWhoisRegInfo = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "CountForWhoisRegInfo";
};
window.rdz.request.CountForWhoisRegInfo.prototype = window.rdz.request.CountForWhoisEmail.instance;
window.rdz.api.CountForWhoisRegInfo = window.rdz.api.CountForWhoisEmail;

window.rdz.api.PageValues = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'PageValuesExt'; //'PageValuesExt'

    var tempUrl = window.rdz.utils.RecipientUrl;
    var recUrl = "http://notrealdomainname.dot.net/";
    if (tempUrl !== "") {
        recUrl = tempUrl;
    }


    var domains = a.self.model.get("DomainNames");
    var DomainNames = [];
    for (var i = 0; i < domains.length; i++) {
        DomainNames.push({"Url": domains[i], "RecipSiteUrl": recUrl});
    }
    a.self.model.set("DomainNames", DomainNames);
};

window.rdz.request.PageValues = function (url, DataRequest) {

    DataRequest.apply(this, arguments);
    this.id = "PageValues";
    this.source = this.domain;
    this.serviceUrl = '';

};

window.rdz.api.PageValuesDomains = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'PageValues';
};

window.rdz.request.PageValuesDomains = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "PageValuesDomains";
    this.source = this.domain;
    this.serviceUrl = '';
};

window.rdz.request.CheckDangerous = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = 'CheckDangerous';
    this.source = this.domain;
};
window.rdz.api.CheckDangerous = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'CheckDangerous';
    this.modifyResponse = function (response) {
        return (response);
    };
};

//window.rdz.api.CheckDangerousPage = function(a) {
//    rdz.api.BaseSessionClass.call(this, a);
//    this.session_id = 'CheckDangerous'; 
//};
//
//window.rdz.request.CheckDangerousPage = function(url,DataRequest) {
//    
//    DataRequest.apply(this, arguments);
//    this.id = "CheckDangerous";
//    this.source = this.domain;
//    this.serviceUrl = '';
//};

window.rdz.api.Alexa = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'Alexa';
};

//window.rdz.request.Alexa = function(url,DataRequest) {
//    
//    DataRequest.apply(this, arguments);
//    this.id = "Alexa";
//    this.source = this.domain;
//    this.serviceUrl = '';
//};

window.rdz.api.BackA = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'BackAlexa';
};

//window.rdz.request.BackA  = function(url,DataRequest) {
//    
//    DataRequest.apply(this, arguments);
//    this.id = "BackA";
//    this.source = this.domain;
//    this.serviceUrl = '';
//};

//window.rdz.api.AlexaPage = function(a) {
//    rdz.api.BaseSessionClass.call(this, a);
//    this.session_id = 'Alexa'; 
//};
//
//window.rdz.request.AlexaPage = function(url,DataRequest) {  
//    DataRequest.apply(this, arguments);
//    this.id = "Alexa";
//    this.source = this.domain;
//    this.serviceUrl = '';
//};

//window.rdz.api.BackAPage  = function(a) {
//    rdz.api.BaseSessionClass.call(this, a);
//    this.session_id = 'BackAlexa'; 
//};
//
//window.rdz.request.BackAPage  = function(url,DataRequest) {  
//    DataRequest.apply(this, arguments);
//    this.id = "BackA";
//    this.source = this.domain;
//    this.serviceUrl = '';
//};

window.rdz.api.Solomono = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'Solomono';
};

//window.rdz.request.Solomono  = function(url,DataRequest) {
//    DataRequest.apply(this, arguments);
//    this.id = "Solomono";
//    this.source = this.domain;
//    this.serviceUrl = '';
//};


//window.rdz.api.SolomonoPage  = function(a) {
//    rdz.api.BaseSessionClass.call(this, a);
//    this.session_id = 'Solomono'; 
//};
//
//window.rdz.request.SolomonoPage  = function(url,DataRequest) {
//    DataRequest.apply(this, arguments);
//    this.id = "Solomono";
//    this.source = this.domain;
//    this.serviceUrl = '';
//};

window.rdz.api.CountersMass = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'PageValues';
};


window.rdz.request.CountersMass = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "CountersMass";
    this.source = this.domain;
    this.serviceUrl = '';
};

window.rdz.request.CountersMassPage = window.rdz.request.CountersMass;

window.rdz.api.SocialNetworksMass = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 135;

    var domains = a.self.model.get("DomainNames");
    var DomainNames = [];
    for (var i = 0; i < domains.length; i++) {
        DomainNames.push({"Url": domains[i], "SocialNetworks": "All"});
    }

    a.self.model.set("DomainNames", DomainNames);
};

window.rdz.request.SocialNetworksMass = function (url, DataRequest) {

    DataRequest.apply(this, arguments);
    this.id = "SocialNetworksMass";
    this.source = this.domain;
    this.serviceUrl = '';
};

window.rdz.api.SocialNetworkspage = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 135;

    var domains = a.self.model.get("DomainNames");
    var DomainNames = [];
    for (var i = 0; i < domains.length; i++) {
        DomainNames.push({"Url": domains[i], "SocialNetworks": "All"});
    }

    a.self.model.set("DomainNames", DomainNames);
};

window.rdz.request.SocialNetworkspage = function (url, DataRequest) {

    DataRequest.apply(this, arguments);
    this.id = "SocialNetworkspage";
    this.source = this.domain;
    this.serviceUrl = '';
};

window.rdz.api.PRpageMain = function (a) {
    //rdz.api.BaseSessionClass.call(this, a);
    //this.session_id = 'Pr';
    //
    //var domains = a.self.model.get("DomainNames");
    //for(var i = 0; i < domains.length; i++){
    //    //console.log(rdz.utils.get_uri_obj(domains[i]).domain)
    //    domains[i] = rdz.utils.get_uri_obj(domains[i]).domain;
    //}
    //
    //a.self.model.set("DomainNames",domains);

    rdz.api.PR.call(this, a);
};

window.rdz.request.PRpageMain = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "PRpageMain";
    this.source = this.domain;
    this.serviceUrl = '';
};

window.rdz.request.Seo = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "Seo";
    this.source = this.domain;
    this.serviceUrl = "http://recipdonor.com:998/api/seo/bulk?format=json";

};

window.rdz.api.Seo = function (a) {
    var domainNames = null,
        activeMarkets = [];

    // mass checking    
    if (a.self.model.get("mass_id")) {
        domainNames = a.self.model.get("DomainNames");

        this.parseResponse = function (response) {
            response = JSON.parse(response);

            var result = {value: response};
            result.value['new_data'] = [];

            for (var i = 0; i < response.length; i++) {
                var curSeos = response && response[i] && response[i].Seos || null;
                var curValue = [];

                if (curSeos) {
                    for (var j = 0; j < curSeos.length; j++) {
                        var name = curSeos[j];
                        curValue.push(rdz.utils.Seo_NumberByName[name]);
                    }
                }

                result.value['new_data'].push({uri: response[i].Url, value: curValue});
            }

            return result;
        };

    } else {
        var extra = a.self.model.get("extra");
        cachedMarkets = a.self.model.cachedValue || {};

        for (var name in extra) {
            if (name !== "api") {
                if (extra[name].active === true && !(name in cachedMarkets)) {
                    activeMarkets.push(rdz.utils.Seo_NumberByName[name]);
                }
            }
        }

        domainNames = [a.self.domain];

        this.parseResponse = function (response) {
            response = JSON.parse(response);
            var result = response && response[0] && response[0].Seos || null;

            if (result) {
                var resultObj = {};

                for (var i = 0; i < activeMarkets.length; i++) {
                    var name = window.rdz.utils.Seo_NameByNumber[activeMarkets[i]];
                    resultObj[name] = result.indexOf(name) !== -1 ? "yes" : "no";
                }

                resultObj = mergeObjects(resultObj, a.self.model.cachedValue);
            }

            return {
                value: resultObj || result
            };
        };
    }

    this.url = "http://recipdonor.com:998/api/seo/bulk?format=json";
    this.type = 'POST';
    //this.xhr_body = '{"Domains":["' + a.self.domain + '"], "Parameters": [' + activeMarkets.toString() + ']}';
    var bodyObj = {Domains: domainNames, Parameters: activeMarkets};
    this.xhr_body = JSON.stringify(bodyObj);

    var h = rdz.api.headers();
    this.header = [/*h.user_agent,*/ h.content_type, h.authorization, h.x_rdsappkey];

    // merge 2 objects
    function mergeObjects(obj1, obj2) {
        var obj3 = {};
        for (var attrname in obj1) {
            obj3[attrname] = obj1[attrname];
        }
        for (var attrname in obj2) {
            obj3[attrname] = obj2[attrname];
        }
        return obj3;
    }

};

window.rdz.request.LinksBuy = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "LinksBuy";
    this.source = this.domain;
    this.serviceUrl = 'http://linkpad.ru/default.aspx?ref=rdsbar&to=' + this.domain;

};

window.rdz.api.LinksBuy = function (a) {

    this.url = 'http://recipdonor.com:998/api/links/bulk/values=true?format=json';
    this.type = 'POST';

    if (a.self.model.get("mass_id")) {
        var domainNames = null;

        domainNames = a.self.model.get("DomainNames");

        this.parseResponse = function (response) {
            response = JSON.parse(response);

            var result = {value: response};
            result.value['new_data'] = [];

            for (var i = 0; i < response.length; i++) {
                var curValue = response && response[i] && response[i].BuyLinks || null;

                result.value['new_data'].push({uri: response[i].Url, value: curValue});
            }

            return result;
        };

        this.xhr_body = JSON.stringify(domainNames);

        var h = rdz.api.headers();

        this.header = [/*h.user_agent,*/ h.content_type, h.authorization, h.x_rdsappkey];

    } else {

        this.parseResponse = function (response) {
            response = JSON.parse(response);
            var result = response;

            return {
                value: result && result[0] && result[0].BuyLinks
            };
        };
        var h = rdz.api.headers();

        this.xhr_body = JSON.stringify([a.self.domain]);

        this.header = [/*h.user_agent,*/ h.content_type, h.authorization, h.x_rdsappkey];
    }
};

window.rdz.request.GA = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    var counterid = this.model.get('counters').GA;
    this.id = "GA";
    this.source = this.domain;
    this.serviceUrl = 'http://recipdonor.com:998/api/commercials/count/analytics/' + counterid + '?format=json';
    if (rdz.user.logged) {
        this.displayUrl = 'http://www.recipdonor.com/partnercode?code=' + counterid + '&type=Analytics';
    }
    else {
        this.displayUrl = 'https://www.google.com.ua/intl/ru_ALL/analytics/';
    }
    var h = rdz.api.headers();
    this.header = [h.content_type, h.authorization, h.x_rdsappkey];
    this.parseResponse = function (response) {
        var result = {
            value: true
        };

        /*код ошибки "Не авторизирован" возвращается из window.rdz.request.DataRequest если использовать window.rdz.api.GA */
        /** оставил как есть, не авторизирован - если нет свойства result.domains */
        if (response > 0) result.domains = +response;

        return {value: result};
    };

};

window.rdz.request.APICounters = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "APICounters";
    this.source = this.domain;
};

window.rdz.api.APICounters = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'Counters';
    this.modifyResponse = function (response) {
        var result,
            tmp;
        if (response.length) {
            result = [];
            response.forEach(function (e) {
                tmp = e.Value;
                result.push(tmp);
            });
        } else if (response) {
            result = [response];
        } else {
            result = response;
        }

        return result;
    };
};

window.rdz.request.IPSitesCountRDS = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "IPSitesCountRDS";
    this.source = this.domain;
    this.serviceUrl = 'http://recipdonor.com:998/api/sitesonip/bulk/count?format=json';
    if (this.model.get('ip')) this.displayUrl = 'http://www.recipdonor.com/infoip?ip=' + this.model.get('ip');
    this.xhr_type = 'POST';
    this.xhr_body = JSON.stringify([this.model.get('ip')]);
    this.parseResponse = function (response) {
        response = JSON.parse(response);
        var result = response;
        return {
            value: result && result[0] && result[0].Count
        };
    };
    var h = rdz.api.headers();
    this.header = [/*h.user_agent,*/ h.content_type, h.authorization, h.x_rdsappkey];
};

window.rdz.request.Geo = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = "Geo";
    this.source = this.domain;
    if (this.model.get('ip')) this.displayUrl = 'http://geoip.flagfox.net/?ip=' + this.model.get('ip') + '&lang=ru';
};

window.rdz.api.Geo = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 36;
    this.modifyResponse = function (response) {
        var result = {},
            locale = AppLocale.get_locale_str();
        result.host = response.HostName;
        result.provider = response.Isp;
        result.flag = response.Iso2;
        result.country = locale === 'ru' && response.CountryRu ? response.CountryRu : response.Country;
        result.city = locale === 'ru' && response.CityRu ? response.CityRu : response.City;
        return result;
    };
};

window.rdz.request.UniqueContent = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = 'UniqueContent';
    this.source = this.page;

    var self = this;
    this.execute = function () {
        var cache = this.cache();

        if (cache !== null && cache !== undefined && typeof this.model.ignore_cache === 'undefined') {
            this.cached = true;
            this.return(cache);
        } else {
            if (!this.model.get('only_cache')) {

                var extra = this.model.get('extra');
                if (rdz.user.get('balance') && rdz.user.get('balance') >= 0.005) {
                    var session = self.getAPISession(self.id);

                    self.api = window.rdz.api.APIClass({model: this.model, self: self, session: session});

                    //if request gets value from api
                    if (self.api.session &&
                            //if value doesn't exists or date are expired
                        session.Id === null) {
                        self.api = window.rdz.api.APINewSessionClass({model: this.model, self: self});
                    }

                    self.parseResponse = self.api.callback;

                    self.xhr({
                        type: self.api.type,
                        body: self.api.xhr_body || null,
                        url: self.api.url,
                        header: self.api.header || null
                    });
                } else {
                    //need money or is not authorized
                    self.return(rdz.user.logged ? rdz.errors.BUNKRUPT : rdz.errors.AUTHOR);
                }
            }
        }
    };
};
window.rdz.api.UniqueContent = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'UniqueContent';
    this.modifyResponse = function (response) {
        return response;
    };
};

window.rdz.api.Majestic = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'Majestic';
};

window.rdz.request.StatHistory = function (url, DataRequest) {
    DataRequest.apply(this, arguments);
    this.id = 'StatHistory';
    this.source = this.domain;

    var self = this;
    this.caching = function (result) {
        if (typeof result.value === "number" && (result.value > -2 || result.value === rdz.errors.VIRUS) ||
            typeof result.value === "object" ||
            typeof result.value === "string" ||
            typeof result.value === "boolean") {

            var path = [this.getKey(result), this.id];

            //if one of SESSION_<*> response, path should be "SESSION/<parameter name>/<page>"
            if (typeof result.action !== 'undefined') {
                switch (result.action) {
                    case 'API_HISTORY_COUNT':
                        path = [this.domain, this.id, result.param];
                        break;

                    case 'API_HISTORY':
                        path = [this.domain, this.id, result.param];
                        break;

                    default:
                        path.push(this.mass_id ? this.mass_id : this.page);
                }
            }

            if (rdz.db.period[this.id] && typeof result.action === 'undefined' ||
                rdz.db.period[this.id] && this.mass_id
            ) {
                // delete current session after receiving the value
                delete rdz.cache['SESSION'][this.id][this.page];

                // concat value for the last month and history
                if (rdz._.isArray(this.model.get('value')) &&
                    this.model.get('value').length === 1
                ) {
                    result.value = this.model.get('value').concat(result.value);
                }

                rdz.db.update(this.id, result.value, this.uri, this.mass_id, this.source);
            }

            rdz.cache.set(path, result.value);
        }
    };

    this.execute = function () {
        var cache = this.cache();

        if (cache !== null && cache !== undefined && typeof this.model.ignore_cache === 'undefined') {
            this.cached = true;
            this.return(cache);
        } else {
            if (!this.model.get('only_cache')) {

                var extra = this.model.get('extra');
                if (rdz.user.get('balance') && rdz.user.get('balance') >= 0.005) {
                    var session = self.getAPISession(self.id);

                    self.api = window.rdz.api.APIClass({model: this.model, self: self, session: session});

                    //if request gets value from api
                    if (self.api.session &&
                            //if value doesn't exists or date are expired
                        session.Id === null) {
                        self.api = window.rdz.api.APINewSessionClass({model: this.model, self: self});
                    }

                    self.parseResponse = self.api.callback;

                    self.xhr({
                        type: self.api.type,
                        body: self.api.xhr_body || null,
                        url: self.api.url,
                        header: self.api.header || null
                    });
                } else {
                    //need money or is not authorized
                    self.return(rdz.user.logged ? rdz.errors.BUNKRUPT : rdz.errors.AUTHOR);
                }
            }
        }
    };
};
window.rdz.api.StatHistory = function (a) {
    rdz.api.BaseSessionClass.call(this, a);
    this.session_id = 'StatHistory';
    this.modifyResponse = function (response) {
        return response;
    };
};