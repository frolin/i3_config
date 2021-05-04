/** @namespace namespace for models. Store all models */
window.rdz.model = {
    parameters: {},
    contextmenu: {}
};
/**
 * @class Factory create parameters' model on BG script
 */

window.rdz.model.parameters.Factory = {
    /**
     * @description create instance of Parameter and send requests
     * @param arg { Object }
     * @param arg.method { String | undefined } message name from content or popup script (action)
     * @param arg.model { Object } model
     * @param arg.request { Object | undefined } messenger method name
     * @param arg.url { Object } url
     * @param arg.ignore_cache { Boolean | undefined}
     * @param arg.receiver { String  | undefined } where to send response Content script or Browser action (popup.html)
     * @param arg.callback { Function | undefined} this function will be called if arg.receiver === 'callback'
     */
    requestOneParameter: function (arg) {
      if (arg.model.name === 'IP') return; 
        var model = rdz.model.parameters[arg.model.name] ? new rdz.model.parameters[arg.model.name](arg.model) : new rdz.model.parameters.Parameter(arg.model);
        if (arg.receiver) model.receiver = arg.receiver;
        if (arg.callback) model.callback = arg.callback;
        if (arg.ignore_cache) model.ignore_cache = arg.ignore_cache;
        if (arg.url) model.set('url', arg.url); // added for integrations' SA
        model.on("change:value", model.valueChanged, model);
        model.makeORsendRequest(arg);

        //return model if not sending request
        return model;
    },
    /**
     * @description create instance of Parameters and send requests
     * @param arg { Object }
     * @param arg.models { Object } models that we want to update
     */
    requestAllParameters: function (arg) {
        chrome.storage.local.get(null, settings => {
            var models = arg.models || rdz.utils.mergeWithOptions(rdz.setting.params, rdz.utils.getOptions({
                options: ['Parameters'],
                filter: 'isNotFunction'
            }, settings), null, null, settings);
            if (arg.SA) { // check Site Analisys function
                models = models.filter(function (e) {
                    return (e.name !== 'UniqueContent' && e.name !== 'StatHistory' && e.name !== 'LinksBuy') && (!arg.SA.extra[e.name] || (arg.SA.active && arg.SA.extra[e.name].active));
                });
            }
            for (var i in models) {
                arg.model = models[i];
                rdz.model.parameters.Factory.requestOneParameter(arg);
            }
        });
    }
};

/**
 * @class Parameter creates requests for parameters' model. If a parameter need additional handle response or option's checking create a new model for him
 */
window.rdz.model.parameters.Parameter = rdz.Backbone.Model.extend(
    /** @lends window.rdz.model.Parameter */
    {
        defaults: {
            value: null
        },
        idAttribute: 'name',

        preRequest: function (options) {
            return false;
        },
        //sendRequest send XMLHttpRequest and parse response

        /**
         * @description create this.request property which send request end store response
         * @param options { Object }
         * @param options.url { String } tab.url
         * @param options.request { String | Number | Object } default this.get('request') to send additional requests
         * @param options.only_property { Boolean } define send request or copy needed property
         */

        makeORsendRequest: function (options) {
            this.preRequest(options);
            if (!this.request) this.request = {};
            var self = this,
                r = self.get('request'),
                o = Object.prototype.toString.call(r);


            switch (o) {
                case "[object Array]":
                    rdz._.each(r, function (name, index, list) {
                        self.request[name] = {};
                        rdz._.extend(self.request[name], new rdz.request[name](options.url, rdz.request.DataRequest, self));
                        if (!options.only_property) {
                            //stops future requests (requests in r) if current request name equal api request name
                            if (self.isAPIRequest(name)) {
                                options.only_property = true;
                            }
                            self.request[name].execute();
                        }
                    });
                    break;

                case "[object Object]":
                    var name = rdz._.keys(r)[0];

                    self.request[name] = {};
                    rdz._.extend(self.request[name], new rdz.request[name](options.url, rdz.request.DataRequest, self));

                    if (!options.only_property) {
                        self.request[name].execute();
                    }
                    else {
                        //copy properties from second request
                        self.request[r[name][0]] = {};
                        rdz._.extend(self.request[r[name][0]], new rdz.request[r[name][0]](options.url, rdz.request.DataRequest, self));
                    }

                    break;

                case "[object String]":
                    //each parameter need options: url, function-constructor with methods to each XMLHttpRequest and model (this) to be able save response
                    rdz._.extend(self.request, new rdz.request[r](options.url, rdz.request.DataRequest, self));
                    if (!options.only_property) self.request.execute();
            }

            //TODO: create instances from requestAllParameters, property <only_property> is shared between all instances (created once for a parameter, exists in other )
            delete options.only_property;

        },
        /**@description function return false if API is turned on and API name is not defined or true
         * if API is turned on and request name the same sa API name
         * @param  {String} request_name
         * @return {Boolean}
         */
        isAPIRequest: function (request_name) {
            var extra = this.get('extra');
            //api was turned on
            return this.isAPIon() &&
                    //api request should wait when it's queue (if it was decelerated)
                typeof extra.api.request !== 'undefined' &&
                    //comparing API name and request name we define when stop calling this.execute()
                extra.api.request.indexOf(request_name) > -1;
        },
        isAPIon: function () {
            var extra = this.get('extra');
            return extra && extra.api && extra.api.active;
        },
        /**
         * @description is triggered when this.set({value: }) or this.trigger("change:value") was called. Send parameter's value from background script to content script, popup script
         */
        valueChanged: function () {

            switch (this.receiver) {

                case "callback":
                    //put code here to execute function
                    if (typeof this.callback === 'function') {
                        this.callback(this);
                    }
                    break;

                case "popup":
                    if (window.chrome) {
                        //call views from Browser action in Chrome
                        if (rdz.popup) {
                            rdz.popup.app.popup.parameters.updateModel({model: rdz.utils.addDataFromRequest(this.toJSON(), this.request)});
                        }
                    }
                    else if (window.opera) {

                        //send response to Popup in Opera
                        portRequest.postMessage({
                            method: 'OPERA_AllParametersPopupResponse',
                            model: JSON.stringify(rdz.utils.addDataFromRequest(this.toJSON(), this.request)),
                            url: this.request.url
                        });
                    }
                    break;

                case "integration":
                    portRequest.postMessage({
                        method: 'message',
                        request: 'INTEGRATION_ContentResponse',
                        model: JSON.stringify(rdz.utils.addDataFromRequest(this.toJSON(), this.request))
                    });
                    break;
                case "integration_sa":
                    portRequest.postMessage({
                        method: 'message',
                        request: 'INTEGRATION_SA_ContentResponse',
                        model: JSON.stringify(rdz.utils.addDataFromRequest(this.toJSON(), this.request))
                    });
                    break;

                default:
                    //send to Content script
                    portRequest.postMessage({
                        method: 'message',
                        request: 'PARAMETER_ContentResponse',
                        model: JSON.stringify(rdz.utils.addDataFromRequest(this.toJSON(), this.request))
                    });
            }

        },

        /**
         * @description is called from this.request.model after parsing XMLHttpRequest.response and defining whatever was or will be sent another request
         * @param a { Object }
         * @param a.id {String} equal this.get('request') or this.get('request') contains it in Array or Object
         * @param a.value { String | Number | Object | Null} parameter's value that was parsed
         * @param a.url { Object }
         * @param a.url.url { String }
         * @param a.url.domain { String }
         * @param a.url.page { String }
         */

        returnValue: function (a) {

            a.r = this.get('request');
            var o = Object.prototype.toString.call(a.r);
            //console.log('returnValue', a.id, this, a, a.value)
            switch (o) {
                case "[object Array]":

                    this.setMultipleValue(a);
                    this.triggerValue(a);

                    break;

                case "[object Object]":

                    this.returnValueByValue({
                        id: a.id,
                        value: a.value,
                        request: a.r[a.id],
                        url: a.url/*, cached:a.cached*/
                    });

                    break;

                case "[object String]":
                    this.set({value: a.value/*, cached:a.cached*/}, {silent: true});
                    this.trigger("change:value");
            }

        },

        setMultipleValue: function (a) {
            var v = this.get('value');
            if (v === null) {
                v = {};
            }
            v[a.id] = a.value;
            this.set({value: v/*, cached:a.cached*/}, {silent: true});
        },
        triggerValue: function (a) {
            var donotwait = true,
                v = this.get('value');

            //wait until all request will be returned, then pass to content script
            rdz._.each(a.r, function (e) {
                if (typeof  v[e] === "undefined") donotwait = false;
            });

            if (donotwait || this.isAPIon()) {
                this.trigger("change:value");
            }
        },

        /**
         * @description should be rewritten for each parameter that has in this.get('request') value as Object
         * @param a { Object }
         * @param a.id {String} equal this.get('request') or this.get('request') contains it in Array or Object
         * @param a.value { String | Number | Object | Null} parameter's value that was parsed
         * @param a.request { String | Number | Object } new requests, this parameter could be rewritten in instance method or using jointly with new
         */

        returnValueByValue: function (a) {
            console.log('forgot replace returnValueByValue', a);
        }

    });

/**
 * @class IYP handle responses for IYP model
 *
 */
window.rdz.model.parameters.IYP = window.rdz.model.parameters.Parameter.extend(
    /** @lends window.rdz.model.IYP */
    {
        returnValueByValue: function (a) {
            var o = Object.prototype.toString.call(a.value);
            switch (o) {
                //parser found cache-link on Yandex page result
                case "[object Object]":
                    this.setMultipleValue(a);
                    this.set({request: a.request}, {silent: true});
                    this.makeORsendRequest({url: a.url.url});
                    break;

                default:
                    this.setMultipleValue(a);
                    this.triggerValue(a);
            }

        }
    });
window.rdz.model.parameters.IGP = window.rdz.model.parameters.Parameter.extend(
    /** @lends window.rdz.model.IGP */
    {
        returnValueByValue: function (a) {
            var request = null,
                checkIndexationDate = this.get('extra').api.extra.indexation_date;

            if (a.value && checkIndexationDate) {
                request = ['IGPCache'];
            }

            this.setMultipleValue(a);
            this.triggerValue(a);

            if (request) {
                this.set({ request: request }, { silent: true });
                this.makeORsendRequest({ url: a.url.url });
            }
        }
    });
window.rdz.model.parameters.TYC = window.rdz.model.parameters.Parameter.extend(
    /** @lends window.rdz.model.TYC */
    {
        preRequest: function (options) {
            if (rdz.user.logged && !this.mirrors_request && !this.get('mass_id')) {
                //adds MirrorsCount
                this.set({request: {TYC: ['YaBar', 'MirrorsCount']}});
                this.mirrors_request = true;
            }
        },
        returnValueByValue: function (a) {
            // to separate YaBar from TYC
            var YaBar = this.get('extra') ? this.get('extra').YaBar : {active: false};
            if (YaBar.active || this.receiver && this.receiver === "popup") {
                this.setMultipleValue(a);
                this.set({request: a.request});
                this.makeORsendRequest({url: a.url.url});
            }
            else {
                this.setMultipleValue(a);
                this.triggerValue(a);
            }

        }
    });

window.rdz.model.parameters.SeoM = window.rdz.model.parameters.IYP.extend({});
window.rdz.model.parameters.MozRank = window.rdz.model.parameters.SeoM.extend({});

window.rdz.model.parameters.Majestic = window.rdz.model.parameters.IYP.extend({});
window.rdz.model.parameters.CF = window.rdz.model.parameters.Majestic.extend({});
window.rdz.model.parameters.TF = window.rdz.model.parameters.Majestic.extend({});

window.rdz.model.parameters.AhrefsPage = window.rdz.model.parameters.IYP.extend({});
window.rdz.model.parameters.AhrefsDomain = window.rdz.model.parameters.AhrefsPage.extend({});

//window.rdz.model.parameters.Ahrefs = window.rdz.model.parameters.Parameter.extend(
//{
//    preRequest: function(options) {
//        
//       
//        //var request = null;
//            
//        //request = {'AhrefsAJAXKey':['Ahrefs']};
//        //this.set({request:request}, {silent: true});
//        // console.log(options);
//        // console.log(this)
//        
//    },
//    
//    returnValueByValue: function (a) {
//        this.setMultipleValue(a); // save value to model
//        this.set({request:a.request}); // set next request
//        this.makeORsendRequest({url: a.url.url}); // send next request
//                
//        //this.set({request:request}, {silent: true});
//       
//        //this.makeORsendRequest({url: a.url.url});
//    }
//});

//window.rdz.model.parameters.Age = window.rdz.model.parameters.IYP.extend({});

/**
 * @class PR handle responses for PR
 */
window.rdz.model.parameters.PR = window.rdz.model.parameters.Parameter.extend(
    /** @lends window.rdz.model.PR */
    {
        returnValueByValue: function (a) {

            var request = null;

            switch (a.id) {

                case "PR":

                    //check should we send request PRMain for main page
                    if (!rdz.utils.isMainPage(a.url.url) && this.get('extra').PRMain.active) {

                        //if PR value = 0 - PRg shouldn't be send, but PRgMain should after PRMain, if PRMain>0
                        request = {'PRMain': ['PRgMain']};
                    }


                    //parsed value should be bigger then 0 for reason send request to check Glued or not for page
                    if (a.value > 0 && this.get('extra').PRg.active) {
                        if (request) {
                            request = {'PRMain': ['PRg']};
                        }
                        else {
                            request = ['PRg'];
                        }
                    }

                    this.setMultipleValue(a);
                    this.triggerValue(a);

                    if (request) {
                        this.set({request: request}, {silent: true});
                        this.makeORsendRequest({url: a.url.url});
                    }

                    break;


                case "PRMain":
                    this.setMultipleValue(a);

                    //return values before checking glued
                    this.triggerValue(a);

                    //check PRg and PRgMain
                    if (this.get('value').PR > 0 && this.get('extra').PRg.active) {
                        a.request = {PRg: ['PRgMain']};
                        this.set({request: a.request}, {silent: true});
                        this.makeORsendRequest({url: a.url.url});
                    } else
                    //to check PRgMain, value for main page should be greater then 0.
                    if (a.value > 0 && this.get('extra').PRg.active) {
                        this.set({request: a.request}, {silent: true});
                        this.makeORsendRequest({url: a.url.url});
                    }

                    break;


                case "PRg":

                    this.setMultipleValue(a);
                    //send new request or return value to content script
                    if (!rdz.utils.isMainPage(a.url.url) && this.get('extra').PRMain.active) {
                        if (this.isAPIon()) {
                            //xhr_body (api.js) needs DomainNames, for PRgMain it's not page (<source> attr in request) it's domain
                            //this.DomainNames = rdz.utils.domainFromUri(a.url.url).domain;
                            this.set({DomainNames: rdz.utils.domainFromUri(a.url.url).domain});
                        }
                        //a.request = ['PRgMain']
                        this.set({request: a.request}, {silent: true});
                        this.makeORsendRequest({url: a.url.url});
                    }
                    else {
                        this.triggerValue(a);
                    }
                    break;

            }
        }

    });


window.rdz.model.parameters.Pictures = window.rdz.model.parameters.Parameter.extend(
    /** @lends window.rdz.model.TYC */
    {
        preRequest: function (options) {
            if (!this.get('mass_id')) {
                this.set({
                    request: AppLocale.get_locale_str() === "ru" ?
                        ['Pictures', 'PicturesYa'/*,'PicturesAol'*/] :
                        ['Pictures'/*, 'PicturesAol'*/]
                });
            }
        }
    });

window.rdz.model.parameters.Counters = window.rdz.model.parameters.Parameter.extend(
    {

        preRequest: function (options) {

            var cache = rdz.cache.get([rdz.utils.domainFromUri(options.url).domain, 'CountersID']);
            if (cache) {
                this.set({request: rdz._.keys(cache)}, {silent: true});
                this.set({counters: cache}, {silent: true});
            } else if (this.get('counters')) {
                rdz.db.update('CountersID', this.get('counters'), rdz.uri, null, rdz.utils.domainFromUri(options.url).domain);
                rdz.cache.set([rdz.utils.domainFromUri(options.url).domain, 'CountersID'], this.get('counters'));
                this.set({request: rdz._.keys(this.get('counters'))}, {silent: true});
            } else if (options.receiver === 'integration_sa') { // counters for SA of the integrations
                var that = this;
                rdz.utils.xhr(options.url, function (response) {  // TODO: improve
                    var counters = rdz.utils.parseCounters(rdz.utils.counters_list, response);
                    rdz.cache.set([rdz.utils.domainFromUri(options.url).domain, 'CountersID'], counters);
                    that.set({counters: counters}, {silent: true});
                    rdz.db.update('CountersID', counters, rdz.utils.get_uri_obj(options.url), null, rdz.utils.domainFromUri(options.url).domain);
                    rdz.model.parameters.Factory.requestOneParameter({
                        model: {name: 'Counters', request: []},
                        url: options.url,
                        receiver: options.receiver
                    });
                });
            } else { //if no counters values in the model or cache, get it for popup (send message to content/messenger)            
                portRequest.postMessage({
                    method: 'message',
                    request: 'COUNTERS_ID_ContentRequests',
                    receiver: options.receiver
                });
            }

            // GA
            if (!rdz.user.logged &&
                this.get('request').indexOf('GA') !== -1) {
                //copy displayUrl from request obj
                if (!this.request) this.request = {};
                this.request['GA'] = {};
                rdz._.extend(this.request['GA'], new rdz.request['GA'](options.url, rdz.request.DataRequest, this));

                this.set({request: rdz._.without(this.get('request'), 'GA')});
                this.set({value: {GA: rdz.cache.get([rdz.utils.domainFromUri(options.url).domain, 'GA']) || {value: true}}}, {silent: true});
                rdz.db.update('GA', {value: true}, rdz.uri, null, rdz.utils.domainFromUri(options.url).domain);
            }

        },
        setMultipleValue: function (a) {
            var v = this.get('value');
            if (v === null) {
                v = {};
            }
            v[a.id] = a.value;
            this.set({value: v}, {silent: true});

            if (a.id === 'liveinternet' && a.parameters && a.parameters.needxml) {
                this.request['liveinternet'] = {};
                rdz._.extend(this.request['liveinternet'], new rdz.request['liveinternet_xml'](a.url.url, rdz.request.DataRequest, this));
                this.request['liveinternet'].execute();
            }
            if (a.id === 'hotlog' && a.parameters && a.parameters.attempt) {
                this.att = a.parameters.attempt.num;
                this.cookie = a.parameters.attempt.cookie;
                var self = this;

                let url = window.chrome ? 'http://.hotlog.ru' : 'http://hotlog.ru/viewstat?id=71188&attempt=' + this.att;

                rdz.utils.setCookies(url, 'BPC', this.cookie, function () {
                    self.request['hotlog'] = {};
                    window.rdz._.extend(self.request['hotlog'], new rdz.request['hotlog_attempt'](a.url.url, rdz.request.DataRequest, self));
                    self.request['hotlog'].execute();

                }, a);
                //chrome.cookies.set({url:'http://.hotlog.ru',name:'BPC',value:this.cookie});

            }
        }

    }
);

window.rdz.model.parameters.APICounters = window.rdz.model.parameters.Parameter.extend({
    preRequest: function (options) {
        var that = this,
            cache = rdz.cache.get([rdz.utils.domainFromUri(options.url).domain, 'CountersID']),
            request = ['APICounters'];

        if (cache) {
            if (cache['GA']) {
                request.push('GA');
            }
            this.set({counters: cache}, {silent: true});
            this.set({request: request}, {silent: true});
        } else if (this.get('counters')) {
            if (this.get('counters')['GA']) {
                request.push('GA');
            }
            rdz.cache.set([rdz.utils.domainFromUri(options.url).domain, 'CountersID'], this.get('counters'));
            this.set({request: request}, {silent: true});
        } else {
            rdz.utils.xhr(options.url, function (response) {
                var counters = rdz.utils.parseCounters(rdz.utils.counters_list, response);
                delete counters['Alexa'];
                delete counters['GA'];
                if (rdz._.isEmpty(counters)) {
                    rdz.cache.set([rdz.utils.domainFromUri(options.url).domain, 'APICounters'], []);
                }

                rdz.cache.set([rdz.utils.domainFromUri(options.url).domain, 'CountersID'], counters);
                that.set({counters: counters}, {silent: true});
                rdz.db.update('CountersID', counters, rdz.utils.get_uri_obj(options.url), null, rdz.utils.domainFromUri(options.url).domain);
                rdz.model.parameters.Factory.requestOneParameter({
                    model: that.toJSON(),
                    url: options.url,
                    receiver: 'integration'
                });
            });
        }
    }
});

window.rdz.model.parameters.Seo = window.rdz.model.parameters.Parameter.extend(
    {
        preRequest: function (options) {
            if (this.get("mass_id")) {
                return false;
            }

            var requests = this.get("requests"),
                extra = this.get("extra"),
                url = options.url ? options.url :
                    requests && requests.url ? requests.url :
                        null;

            // check which seo markets was cached
            this.cachedValue = null;
            if (url) {
                var uri = rdz.utils.get_uri_obj(url);
                if (uri && uri.domain) {
                    var cache = rdz.cache.get(uri.domain);
                    if (cache && cache.Seo) {
                        this.cachedValue = cache.Seo;
                    }

                }
            }

            if (this.cachedValue) {
                for (var name in extra) {
                    if (name !== "api") {
                        if (extra[name].active === true && !(name in this.cachedValue)) {
                            this.ignore_cache = true;
                        }
                    }
                }
            }

        }
    });

window.rdz.model.parameters.Webmoney = window.rdz.model.parameters.Parameter.extend({
    returnValueByValue: function (a) {
        var extra = this.get('extra');
        extra.api.active = false;
        this.set('extra', extra);

        this.setMultipleValue(a);
        this.set({request: (a.id === "Webmoney" ? {WMAdvisor: ['WMAdvisorGraph']} : ['WMAdvisorGraph'])}, {silent: true});
        this.makeORsendRequest({url: a.url.url});
    }
});

window.rdz.model.parameters.LIO = window.rdz.model.parameters.Parameter.extend({
    preRequest: function (options) {
        var requests = this.get("requests"),
            extra = this.get("extra"),
            url = options.url ? options.url :
                requests && requests.url ? requests.url :
                    null,
            origin,
            list = extra.exceptions.value,
            path;

        if (url) {
            origin = window.rdz.utils.domainFromUri(url).domain.toLowerCase();
            // check if the domain is in the exceptions list
            if (window.rdz.utils.isDomainInList(origin, list)) {
                path = [rdz.utils.protolessUri(url), this.id];
                rdz.cache.set(path, rdz.errors.HARDSITE);
            }
        }

    }
});

window.rdz.model.parameters.SocialNetworks = window.rdz.model.parameters.Parameter.extend({
    preRequest: function (options) {
        var extra = this.get('extra'),
            request = [];

        //if (extra.GooglePlus.active) request.push('GooglePlus', 'GooglePlusMain');
        if (extra.Facebook.active) request.push('Facebook', 'FacebookMain');
        //if (extra.Twitter.active) request.push('Twitter', 'TwitterMain', 'Twitter2', 'TwitterMain2');
        if (extra.VK.active) request.push('VK', 'VKMain', 'VK2', 'VKMain2', 'VK3', 'VKMain3', 'VK4', 'VKMain4');

        this.set({request: request});
    }
});

window.rdz.model.parameters.Aggregators = window.rdz.model.parameters.Parameter.extend({
    preRequest: function (options) {
        if (options.yandexNewsLink) {
            this.set({request: ['AggregatorsYandex', 'AggregatorsGoogle', 'AggregatorsBing'/*, 'AggregatorsNovoteka'*/, 'AggregatorsYandexNews']});
            this.set({yandexNewsLink: options.yandexNewsLink});
        } else {
            this.set({request: ['AggregatorsYandex', 'AggregatorsGoogle', 'AggregatorsBing'/*, 'AggregatorsNovoteka'*/]});
        }
    }
});

window.rdz.model.parameters.Nesting = window.rdz.model.parameters.Parameter.extend({
    preRequest: function (options) {
        var url = options.url,
            uriObj,
            value;

        if (url) {
            uriObj = rdz.utils.get_uri_obj(url);
            if (uriObj.path === '/') {
                value = {value: 1};
                rdz.db.update('Nesting', value, rdz.uri, null, uriObj.page);
                rdz.cache.set([uriObj.page, 'Nesting'], value);
            }
            this.set({request: 'Nesting'}, {silent: true});
        }

    }
});

window.rdz.model.parameters.RSS = window.rdz.model.parameters.Parameter.extend({
    preRequest: function (options) {
        var cache = rdz.cache.get([rdz.utils.domainFromUri(options.url).domain, 'RSS']);
        if (cache) {
            this.set({request: 'RSS'}, {silent: true});
        } else {
            portRequest.postMessage({method: 'message', request: 'RSS_ContentRequests'});
        }
    }
});

window.rdz.model.parameters.IP = window.rdz.model.parameters.Parameter.extend({
    preRequest: function (options) {
        var url = options.url,
            domain, cache, ip;

        if (url) {
            //domain = rdz.utils.domainFromUri(url).domain.toLowerCase();
            //cache = rdz.cache.get([domain, this.id]);
            //this.set({'fromCache': true}, {silent: true}); // to display the correct font style            
            //if (!cache) {
            //    this.set({'fromCache': false}, {silent: true});
            //    cache = rdz.IPs[url];
            //    if (cache) {                    
            //        rdz.cache.set([domain, this.id], cache);
            //        rdz.db.update('IP', cache, rdz.utils.get_uri_obj(options.url));
            //    }
            //}            
            //if (cache) {
            //    this.set({request: 'IP'}, {silent: true});
            //}


            domain = rdz.utils.domainFromUri(url).domain.toLowerCase();
            cache = rdz.cache.get([domain, this.id]);
            if (!cache) {
                ip = rdz.IPs[url];
                if (ip && ip !== '127.0.0.1') {
                    rdz.cache.set([domain, this.id], ip);
                    rdz.db.update('IP', ip, rdz.utils.get_uri_obj(options.url), null, domain);
                }
            }
            this.set({request: 'IP'}, {silent: true});
        }
    }
});

window.rdz.model.parameters.IPSitesCount = window.rdz.model.parameters.Parameter.extend({
    preRequest: function (options) {
        var url = options.url,
            domain,
            ip;

        if (url) {
            domain = rdz.utils.domainFromUri(url).domain.toLowerCase();
            ip = rdz.cache.get([domain, 'IP']);

            if (ip) {
                this.set({'ip': ip}, {silent: true});
                this.set({request: ['IPSitesCountBing', 'IPSitesCountSolomono', 'IPSitesCountRDS']}, {silent: true});
                if (!rdz.user.logged) {
                    rdz.cache.set([domain, 'IPSitesCountRDS'], rdz.errors.AUTHOR);
                }
            } else {
                rdz.model.parameters.Factory.requestOneParameter({
                    model: { name: 'IP', request: [] },
                    url: url,
                    receiver: 'callback',
                    callback: function () {
                        rdz.model.parameters.Factory.requestOneParameter({
                            model: {name: 'IPSitesCount', request: []},
                            url: url,
                            receiver: options.receiver
                        });
                    }
                });
            }
        }
    }
});

window.rdz.model.parameters.Geo = window.rdz.model.parameters.Parameter.extend({
    preRequest: function (options) {
        var that = this,
            url = options.url,
            domain,
            ip;

        if (url) {
            domain = rdz.utils.domainFromUri(url).domain.toLowerCase();
            ip = rdz.cache.get([domain, 'IP']);

            if (ip) {
                this.set({'ip': ip}, {silent: true});
                this.set({request: 'Geo'}, {silent: true});
            } else {
                rdz.model.parameters.Factory.requestOneParameter({
                    model: { name: 'IP', request: [] },
                    url: url,
                    receiver: 'callback',
                    callback: function () {
                        rdz.model.parameters.Factory.requestOneParameter({
                            model: {name: that.get('name'), request: [], extra: {api: {active: true}}},
                            url: url,
                            receiver: options.receiver
                        });
                    }
                });
            }
        }
    }
});

window.rdz.model.parameters.Host = window.rdz.model.parameters.Geo.extend({});

window.rdz.model.parameters.Provider = window.rdz.model.parameters.Geo.extend({});

window.rdz.model.parameters.CMS = window.rdz.model.parameters.Parameter.extend({
    preRequest: function (options) {
        var url = options.url,
            path, cache, domain,
            cms_data;

        if (url) {
            path = [rdz.utils.protolessUri(url), this.id];
            cache = rdz.cache.get(path);
            if (cache) {
                this.set({request: 'CMS'}, {silent: true});
            } else {
                if (options.receiver === 'popup') {
                    portRequest.postMessage({method: 'message', request: 'CMS_ContentRequests', receiver: 'popup'});
                } else if (options.receiver === 'integration') {
                    rdz.utils.xhr(url, function (response) {
                        domain = rdz.utils.domainFromUri(url).domain;
                        cms_data = rdz.utils.CMS.getData(response || '', domain);

                        rdz.db.update('CMS', cms_data, rdz.utils.get_uri_obj(url), null, domain);
                        rdz.db.update('CMS', cms_data, rdz.utils.get_uri_obj(url), null, rdz.utils.get_uri_obj(url).page);
                        rdz.cache.set([rdz.utils.protolessUri(url), 'CMS'], cms_data);

                        rdz.model.parameters.Factory.requestOneParameter({
                            model: {name: 'CMS', request: []},
                            url: url,
                            receiver: options.receiver
                        });
                    });
                }
            }
        }
    }
});

window.rdz.model.parameters.UniqueContent = window.rdz.model.parameters.Parameter.extend({
    preRequest: function (options) {
        if (this.get("mass_id")) {
            return false;
        } else {
            var requests = this.get("requests"),
                extra = this.get("extra"),
                url = options.url ? options.url :
                    requests && requests.url ? requests.url :
                        null,
                origin,
                list = extra.exceptions.value,
                path;

            if (url) {
                origin = window.rdz.utils.domainFromUri(url).domain.toLowerCase();
                // check if the domain is in the exceptions list
                if (window.rdz.utils.isDomainInList(origin, list)) {
                    path = [rdz.utils.protolessUri(url), this.id];
                    rdz.cache.set(path, rdz.errors.HARDSITE);
                }

                if (options.only_cache) {
                    this.set({only_cache: true}, {silent: true});
                }
            }
        }
    }
});

window.rdz.model.parameters.Prodvigator = window.rdz.model.parameters.Parameter.extend({
    preRequest: function (options) {
        var extra = this.get('extra'),
            request = [];

        if (extra.prodvigator_yandex.active) request.push('Prodvigator_y_traff', 'Prodvigator_y_count', 'Prodvigator_y_visible');
        if (extra.prodvigator_google.active) request.push('Prodvigator_g_traff', 'Prodvigator_g_count', 'Prodvigator_g_visible');

        this.set({request: request});

        if (options.only_cache) {
            this.set({only_cache: true}, {silent: true});
        }
    }
});

window.rdz.model.parameters.SpyWords = window.rdz.model.parameters.Parameter.extend({
    preRequest: function (options) {
        if (options.only_cache) {
            this.set({only_cache: true}, {silent: true});
        }
    }
});

window.rdz.model.parameters.StatHistory = window.rdz.model.parameters.Parameter.extend({
    preRequest: function (options) {
        var url = options.url,
            domain,
            d1 = new Date(),
            d2 = new Date(),
            day_after_10 = d1.getDate() > 10,
            start_date, stop_date;

        if (url) {
            domain = rdz.utils.domainFromUri(url).domain.toLowerCase();

            // check if the domain is a subdomain
            if (window.rdz.utils.isSubdomain(domain)) {
                path = [domain, this.id];
                rdz.cache.set(path, rdz.errors.HARDSITE);
            }

            d1.setMonth(d1.getMonth() - (day_after_10 ? 1 : 2));
            if (options.receiving_history) d1.setMonth(d1.getMonth() - 11);
            start_date = d1.getFullYear() + '-' + (d1.getMonth() + 1 < 10 ? '0' + (d1.getMonth() + 1) : (d1.getMonth() + 1));

            d2.setMonth(d2.getMonth() - (day_after_10 ? 1 : 2));
            if (options.receiving_history) d2.setMonth(d2.getMonth() - 1);
            stop_date = d2.getFullYear() + '-' + (d2.getMonth() + 1 < 10 ? '0' + (d2.getMonth() + 1) : (d2.getMonth() + 1));

            if (options.receiving_history &&
                rdz._.isArray(this.get('value')) &&
                this.get('value').length === 1
            ) {
                this.ignore_cache = true;
            }

            if (options.receiving_history) {
                this.set('options.receiving_history', true);
            }

            this.set('bodyData', {
                Parameters: ['StatHistory'],
                DomainNames: [{
                    'DomainName': domain,
                    'StartDate': start_date,
                    'StopDate': stop_date
                }],
                Refresh: true
            }, {silent: true});

            if (options.only_cache) {
                this.set({only_cache: true}, {silent: true});
            }
        }
    }
});

window.rdz.model.parameters.Sitemap = window.rdz.model.parameters.Parameter.extend({
    makeORsendRequest: function (options) {
        if (!this.request) this.request = {};
        var self = this,
            r = self.get('request'),
            o = Object.prototype.toString.call(r);

        switch (o) {
            case "[object Array]":
                rdz._.each(r, function (name, index, list) {
                    self.request[name] = {};
                    rdz._.extend(self.request[name], new rdz.request[name](options.url, rdz.request.DataRequest, self));
                    if (!options.only_property) {
                        self.request[name].execute();
                    }
                });
                break;

            case "[object Object]":
                var name = rdz._.keys(r)[0];
                self.request[name] = {};
                rdz._.extend(self.request[name], new rdz.request[name](options.url, rdz.request.DataRequest, self));
                if (!options.only_property) {
                    self.request[name].execute();
                } else {
                    var second = rdz._.keys(r[name])[0];
                    //copy properties from second request
                    self.request[second] = {};
                    rdz._.extend(self.request[second], new rdz.request[second](options.url, rdz.request.DataRequest, self));
                }
                break;
        }

        delete options.only_property;
    },
    returnValueByValue: function (a) {
        switch (a.id) {
            case 'Sitemap':
                this.setMultipleValue(a);
                this.set({request: a.request}, {silent: true});
                this.makeORsendRequest({url: a.url.url});
                break;
            case 'SitemapRobots':
                this.setMultipleValue(a);
                this.set({request: a.request}, {silent: true});

                var sitemap_urls = rdz._.clone(this.get('value')['SitemapRobots']['sitemap_urls']),
                    that = this,
                    domain = rdz.utils.domainFromUri(a.url.url).domain,
                    curr_sitemap_cache = rdz.cache.get([domain, 'CurrSitemap']), // CurrSitemap is in another model
                    value;
                if (curr_sitemap_cache) {
                    value = this.get('value');
                    value['CurrSitemap'] = curr_sitemap_cache;
                    this.set('value', value);
                }
                if (sitemap_urls && sitemap_urls.length && !this.get('value')['CurrSitemap']) {
                    sitemap_urls.forEach(function(e) {
                        that._checkCurrSitemap({
                            url: e,
                            sitemap_urls: sitemap_urls
                        });
                    });
                } else {
                    this.trigger("change:value");
                }
                break;
        }
    },
    _checkCurrSitemap: function(a) {
        var m = this;
        rdz.model.parameters.Factory.requestOneParameter({
            model: {
                name: 'CurrSitemap',
                request: 'CurrSitemap'
            },
            url: a.url,
            receiver: 'callback',
            callback: function (arg) {
                var model_value = m.get('value'),
                    sitemap_urls = a['sitemap_urls'],
                    value = arg.get('value');
                if (!rdz._.isEmpty(value)) {
                    if (!rdz._.isObject(model_value[arg.id])) {
                        model_value[arg.id] = {};
                    }
                    model_value[arg.id][rdz._.keys(value)[0]] = value[rdz._.keys(value)[0]];
                }
                sitemap_urls.splice(sitemap_urls.indexOf(a.url), 1);
                m.set('value', model_value);
                // trigger change event when all the requests have been done
                if (sitemap_urls.length === 0) {
                    if (rdz._.isObject(model_value[arg.id])) {
                        var path = [arg.request.source, arg.id];
                        rdz.db.update(arg.id,  model_value[arg.id], arg.request.uri, arg.request.mass_id, arg.request.source);
                        rdz.cache.set(path,  model_value[arg.id]);
                    }
                    m.trigger("change:value");
                }
            }
        });
    }
});

window.rdz.model.contextmenu.Contextmenu = {
    requestData: function (arg) {
        new window.rdz.contextmenu[arg.model.name](this, arg);
    },
    sendData: function (menu_data) {
        portRequest.postMessage({
            method: 'message',
            request: 'CONTEXTMENU_ContentResponse',
            model: JSON.stringify(menu_data)
        });
    }
};

