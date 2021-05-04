/**@class messenger handle messages from content and popup page*/
window.rdz.messenger = {
    execute: function (arg) {
        this[arg.method](arg);
    },
    /**
     * @method message coordinate with all messages that flag has arg.method === 'message'
     * @param arg { Object }
     * @param arg.method { String } flag to identify message
     * @param arg.model { Object } model from content script collection
     * @param arg.request { Object } subflag
     * @param arg.url { Object } url
     */
    message: function (arg) {
        switch (arg.request) {

            case "PARAMETER_ContentRequest":
                rdz.model.parameters.Factory.requestOneParameter(arg);
                break;

            case "OPERA_GET_ONFOCUS_ContentRequest":
                portRequest.postMessage({method: 'onfocus', url: opera.extension.tabs.getSelected().url});
                break;

            case "OPERA_ALL_PARAMETERS_PopupRequest":
                rdz.model.parameters.Factory.requestAllParameters(arg);

                chrome.storage.local.get('Bar', settings => {
                    rdz.utils.getPopupHistoryCounts(arg.url, rdz.user.logged, rdz.setting.options.Bar.locale, null, settings);
                });
                break;

            case "MainPage_PAGE_ContentRequest":
                rdz.utils.openPage(arg.url.replace(/\/[^\/]*$/, '') + '/');
                break;

            case "ViewSource_PAGE_ContentRequest":
                   rdz.utils.openPage('view-source:' + arg.url);
                break;

            case "DB_PAGE_ContentRequest":
                rdz.utils.openDBPage();
                break;

            case "DB_PAGE_ContentRequest_MassChecking":
                rdz.utils.openDBPage("#checkpages/1/1");
                break;

            case "OPTION_PAGE_ContentRequest":
                if (arg.hash) { // open CM of the highlighting
                    chrome.storage.local.set({other: {hash: arg.hash}});
                }
                rdz.utils.openOptionPage();
                break;

            case "OPEN_PAGE_ContentRequest":
                rdz.utils.openPage(arg.url);
                break;

            case "CLEAR_CACHE_ContentRequest":
                rdz.cache.clear({url: arg.url});
                rdz.db.delete_sites_row([rdz.uri.domain], function () {
                    //insert row in tables
                    //rdz.db.fetch(rdz.uri);

                    portRequest.postMessage({method: 'message', request: 'CLEAR_CACHE_ContentResponse'});
                });
                break;

            case "CLOSE_BAR_ContentRequest":
                chrome.storage.local.get('Bar', settings => {
                    var o = rdz.utils.getOptions({options: ['Bar']}, settings);
                    o.active = false;
                    chrome.storage.local.set({ Bar: o });
                    window.rdz.utils.optionsChanged();
                });

                // set the attribute of the model
                var options_window = rdz.utils.getOptionsWindowObj();
                if (options_window) {
                    options_window.Bar.set('active', false);
                }

                portRequest.postMessage({method: 'message', request: 'CLOSE_BAR_ContentResponse'});
                break;

            case "CONTEXTMENU_ContentRequest":
                rdz.model.contextmenu.Contextmenu.requestData(arg);
                break;

            case "CHANGE_USER_ContentRequest":
                rdz.user.exit(function () {
                    rdz.user.logout();
                    window.rdz.utils.optionsChanged();
                    rdz.utils.openPage('http://www.recipdonor.com/');
                    rdz.user.change_icon(false);
                });
                break;

            case "EXIT_ContentRequest":
                rdz.user.exit(function () {
                    rdz.user.logout();
                    window.rdz.utils.optionsChanged();
                    rdz.user.change_icon(false);
                    portRequest.postMessage({
                        method: 'message',
                        request: 'USER_AUTH_STATUS_ContentResponse',
                        value: false
                    });
                });
                break;


            case "COOKIES_SESSION_ContentRequest":
                chrome.cookies.getAll({ session: true }, cookies => {
                    //if (confirm(`Delete all ${cookies.length} session cookies?`))
                    cookies.forEach(cookie => {
                        let url = 'http' + (cookie.secure ? 's' : '') + '://' + cookie.domain + cookie.path;
                        chrome.cookies.remove({ "url": url, "name": cookie.name });
                    });
                });
                break;
            case "COOKIES_HOST_ContentRequest":
                let domain = rdz.utils.domainFromUri(arg.url).domain;
                chrome.cookies.getAll({ domain: domain }, cookies => {
                    //if (confirm(`Delete all ${cookies.length} cookies for ${domain}?`))
                    cookies.forEach(cookie => {
                        let url = 'http' + (cookie.secure ? 's' : '') + '://' + cookie.domain + cookie.path;
                        chrome.cookies.remove({ "url": url, "name": cookie.name });
                    });
                });
                break;
            case "COOKIES_INFO_ContentRequest":
                chrome.windows.create({
                    url: chrome.runtime.getURL('cookies/cookies_info.html'),
                    type: chrome.windows.CreateType.POPUP,
                    width: 460,
                    height: 420
                });
                break;

            case "USERAGENT_SESSION_ContentRequest":
                rdz.utils.userAgent.selectAgent(arg.agent_name);
                break;

            //case "HOTKEYS_CTRL_Y_ContentRequest":
            //    rdz.utils.copySearchIntegrationURLs();
            //    break;
            case "HOTKEYS_CTRL_SHIFT_F_ContentRequest":
                rdz.utils.checkSEOTags();
                break;
            case "HOTKEYS_CTRL_Q_ContentRequest":
                rdz.utils.getAllIndexedPages();
                break;
            case "HOTKEYS_ALT_S_ContentRequest":
                rdz.utils.disableStyles();
                break;

            case "API_HISTORY_ContentRequest":
                rdz.model.parameters.Factory.requestOneParameter({
                    model: {
                        name: 'History',
                        request: 'History',
                        extra: {api: {active: true}},
                        parameter: arg.model.parameter,
                        price: rdz.cache.get(['API', 'Prices', 'History'])
                    },
                    url: arg.url,
                    receiver: 'callback',
                    callback: function () {
                        portRequest.postMessage({
                            method: 'message',
                            request: 'API_HISTORY_ContentResponse',
                            model: this.toJSON(),
                            caller: arg.caller || null
                        });
                    }
                });
                break;

            case "API_MIRRORS_ContentRequest":
                rdz.model.parameters.Factory.requestOneParameter({
                    model: {
                        name: 'Mirrors',
                        request: 'Mirrors',
                        extra: {api: {active: true}},
                        parameter: arg.model.parameter,
                        price: rdz.cache.get(['API', 'Prices', 'History'])
                    },
                    url: arg.url,
                    receiver: 'callback',
                    callback: function () {
                        portRequest.postMessage({
                            method: 'message',
                            request: 'API_MIRRORS_ContentResponse',
                            model: this.toJSON()
                        });
                    }
                });
                break;


            case "COUNTERS_ID_ContentResponse":
                //set cache for the Counters and send values to popup
                rdz.db.update('CountersID', arg.counters, rdz.uri, null, rdz.utils.domainFromUri(arg.url).domain);
                rdz.cache.set([rdz.utils.domainFromUri(arg.url).domain, 'CountersID'], arg.counters);

                /*this event also occurs if Counters is switched off by jQuery.onload.
                 * If parameter disable, do not send message to Content or Popup script*/
                chrome.storage.local.get(['Parameters', 'Bar'], settings => {
                    if (rdz._.find(rdz.utils.getOptions({ options: ['Parameters'] }, settings), function (o) {
                        return o.name == 'Counters';
                    }).active && !rdz.utils.getOptions({ options: ['Bar'] }, settings).check_by_button ||
                        arg.receiver === 'popup') {
                        rdz.model.parameters.Factory.requestOneParameter({
                            model: { name: 'Counters', request: [] },
                            url: arg.url,
                            receiver: arg.receiver
                        });
                    }
                });

                break;

            case "CHECK_BY_BUTTON_ContentRequest":
                chrome.storage.local.get('Bar', settings => {
                    //set cache for the Counters and send values to popup
                    var bar_options = rdz.utils.getOptions({options: ['Bar']}, settings);
                    bar_options.check_by_button = !bar_options.check_by_button;
                    chrome.storage.local.set({ Bar: bar_options });
                    portRequest.postMessage({
                        method: 'message',
                        request: 'CHECK_BY_BUTTON_ContentResponse',
                        value: bar_options
                    });
                });
                break;
            case "DISABLE_HIGHLIGHTING_ContentRequest":
                chrome.storage.local.get('Bar', settings => {
                    var bar_options = rdz.utils.getOptions({options: ['Bar']}, settings);
                    bar_options.highlight_pages = !bar_options.highlight_pages;
                    chrome.storage.local.set({ Bar: bar_options });
                });
                break;
            case "OPERA_History_CountersPopupResponse":
                rdz.popup.app.popup.history_counters.updateModel({model: arg.model});
                break;

            case "ONSELECTIONCHANGE_ContentRequest":
                if (arg.disabled) {
                    updateContextMenu({enabled: false});
                    rdz.cache.set(['ApplicationData', 'selectedUrls'], null);
                } else {
                    updateContextMenu({enabled: true});
                    rdz.cache.set(['ApplicationData', 'selectedUrls'], arg.urls);
                }
                break;

            case "INTEGRATION_Save_URLs_ContentRequest":
                if (arg.sql && arg.sql.length > 0) {
                    rdz.db.execute(arg.sql, function () {
                    });
                }

                break;

            case "INTEGRATION_Fetch_ContentRequest":
                if (arg.urls && arg.urls.length > 0) {
                    var i = 0,
                        fetchUrlData;                    
                    // use the recursion to fetch data asynchronously 
                    fetchUrlData = function () {
                        if (i < arg.urls.length) {
                            var uri = rdz.utils.get_uri_obj(arg.urls[i]);
                            rdz.db.fetch(uri, function () {
                                i++;
                                fetchUrlData();
                            });
                        } else {
                            rdz.utils.findRecipientsInURLs(arg.urls, function (recipients) {
                                arg.data.recipients = recipients;
                                portRequest.postMessage({
                                    method: 'message',
                                    request: 'INTEGRATION_Fetch_ContentResponse',
                                    data: arg.data
                                });
                                portRequest.postMessage({
                                    method: 'message',
                                    request: 'RECIPIENTS_POSITIONS_ContentResponse',
                                    recipients: recipients
                                });
                            });                            
                        }
                    };
                    fetchUrlData();                    
                }
                break;

            case "INTEGRATION_Copy_URLs_ContentResponse":
                if (arg.data && arg.data.length > 0) {
                    rdz.utils.copyTextToClipboard(arg.data.join(''));
                }
                break;
            case "INTEGRATION_Notified_ContentRequest":
                chrome.storage.local.get(arg.integration, settings => {
                    var options = settings[arg.integration] = rdz.utils.getOptions({options: [arg.integration]}, settings);
                    if (options) {
                        options.notified = true;
                        chrome.storage.local.set(settings);
                    }
                });
                break;
            case "ENABLE_INTEGRATION_ContentRequest":
                var integration = arg.data.options.id;
                chrome.storage.local.get(integration, settings => {
                    var options = settings[integration] = rdz.utils.getOptions({options: [integration]}, settings);
                    if (options) { // save preference and reload tabs with the integration
                        options.active = !options.active;
                        chrome.storage.local.set(settings);
                        rdz.utils.reloadIntegrationTabs(integration);
                    }
                });
                break;
            case "COMPETITION_AHREFS_ContentRequest":
                var urls = arg['urls'],
                    len = urls.length,
                    data = {};
                if (len > 0) {
                    urls.forEach(function(url) {
                        rdz.model.parameters.Factory.requestOneParameter({
                            model: {
                                name: 'AhrefsPage',
                                request: {'AhrefsCookies': ['AhrefsPage']}
                            },
                            url: url,
                            receiver: 'callback',
                            callback: function () {
                                len -= 1;
                                data[this.get('url')] = this.get('value')['AhrefsPage'];
                                if (len === 0) {
                                    portRequest.postMessage({
                                        method: 'message',
                                        request: 'COMPETITION_AHREFS_ContentResponse',
                                        data: data
                                    });
                                }
                            }
                        });
                    });
                }
                break;
            
            case "COPY_TEXT_ContentResponse":
                if (arg.text.length > 0) {
                    rdz.utils.copyTextToClipboard(arg.text);
                }
                break;
            case "UPDATES_DISCUSSION_ContentRequest":
                rdz.utils.openPage('http://searchengines.guru/forumdisplay.php?f=60');
                break;
            case "SEOTAGS_CHECKED_ContentResponse":
            chrome.storage.local.get('Parameters', settings => {
                var optionsWindowObj = rdz.utils.getOptionsWindowObj(),
                    parameters = settings.Parameters = rdz.utils.getOptions({options: ['Parameters']}, settings),
                    SEOTags = parameters.filter(function (p) {
                        return p.name === 'SEOTags';
                    });

                // set the attribute of the model
                if (optionsWindowObj) {
                    optionsWindowObj.Parameters.get('SEOTags').set('checked', arg.checked);
                }

                if (SEOTags.length > 0) {
                    SEOTags = SEOTags[0];
                    parameters[parameters.indexOf(SEOTags)].checked = arg.checked;
                    chrome.storage.local.set(settings);
                }
            });
                break;
            case "RSS_ContentResponse":
                rdz.db.update('RSS', arg.links, rdz.uri, null, rdz.utils.domainFromUri(arg.url).domain);
                rdz.cache.set([rdz.utils.domainFromUri(arg.url).domain, 'RSS'], arg.links);

                chrome.storage.local.get(['Parameters', 'Bar'], settings => {
                    if (rdz._.find(rdz.utils.getOptions({ options: ['Parameters'] }, settings), function (o) {
                        return o.name == 'RSS';
                    }).active && !rdz.utils.getOptions({ options: ['Bar'] }, settings).check_by_button ||
                        arg.receiver === 'popup') {
                        rdz.model.parameters.Factory.requestOneParameter({
                            model: { name: 'RSS', request: [] },
                            url: arg.url,
                            receiver: arg.receiver
                        });
                    }
                });

                break;
            case "CMS_ContentResponse":
                rdz.db.update('CMS', arg.data, rdz.uri, null, rdz.uri.page);
                rdz.cache.set([rdz.utils.protolessUri(arg.url), 'CMS'], arg.data);

                chrome.storage.local.get(['Parameters', 'Bar'], settings => {
                    if (rdz._.find(rdz.utils.getOptions({ options: ['Parameters'] }, settings), function (o) {
                        return o.name == 'CMS';
                    }).active && !rdz.utils.getOptions({ options: ['Bar'] }, settings).check_by_button ||
                        arg.receiver === 'popup') {
                        rdz.model.parameters.Factory.requestOneParameter({
                            model: { name: 'CMS', request: [] },
                            url: arg.url,
                            receiver: arg.receiver
                        });
                    }
                });

                break;
            case 'NOTIFICATION_DO_NOT_SHOW_ContentResponse':
                var optionsWindowObj = rdz.utils.getOptionsWindowObj();

                if (arg.openerClass === 'noindex') {
                    chrome.storage.local.get('NoIndex', settings => {
                        var noindex = settings.NoIndex = rdz.utils.getOptions({options: ['NoIndex']}, settings),
                            notification = noindex.filter(function (p) {
                                return p.name === 'show_notification';
                            });

                        // set the attribute of the model
                        if (optionsWindowObj) {
                            optionsWindowObj.NoIndex.get('show_notification').set('active', !arg.checked);
                        }

                        // save the value in the localStorage
                        if (notification.length > 0) {
                            notification = notification[0];
                            noindex[noindex.indexOf(notification)].active = !arg.checked;
                            chrome.storage.local.set(settings);
                        }
                    });
                } else if (arg.openerClass === 'displaynone') {
                    chrome.storage.local.get('DisplayNone', settings => {
                        var displaynone = settings.DisplayNone = rdz.utils.getOptions({options: ['DisplayNone']}, settings),
                            notification = displaynone.filter(function (p) {
                                return p.name === 'show_notification';
                            });

                        // set the attribute of the model
                        if (optionsWindowObj) {
                            optionsWindowObj.DisplayNone.get('show_notification').set('active', !arg.checked);
                        }

                        // save the value in the localStorage
                        if (notification.length > 0) {
                            notification = notification[0];
                            displaynone[displaynone.indexOf(notification)].active = !arg.checked;
                            chrome.storage.local.set(settings);
                        }
                    });
                } else if (arg.openerClass === 'updates') {
                    chrome.storage.local.get('Parameters', settings => {
                        var parameters = settings.Parameters = rdz.utils.getOptions({options: ['Parameters']}, settings),
                            updates = parameters.filter(function (p) {
                                return p.name === 'Updates';
                            });

                        // set the attribute of the model
                        if (optionsWindowObj) {
                            optionsWindowObj.Parameters.get('Updates').set('active', !arg.checked);
                        }

                        if (updates.length > 0) {
                            updates = updates[0];
                            parameters[parameters.indexOf(updates)].active = !arg.checked;
                            chrome.storage.local.set(settings);
                        }
                    });
                }

                break;
            case "UNIQUE_CONTENT_PAUSE":
                chrome.storage.local.get('Parameters', settings => {
                    let parameters = settings.Parameters = rdz.utils.getOptions({options: ['Parameters']}, settings),
                        parameter = parameters.filter(function (p) {
                            return p.name === 'UniqueContent';
                        });

                    if (parameter.length > 0) {
                        parameter = parameter[0];
                        let extra = parameters[parameters.indexOf(parameter)].extra;
                        extra['pause'] = !extra['pause'];
                        parameters[parameters.indexOf(parameter)].extra = extra;
                        chrome.storage.local.set(settings);
                    }
                });
                break;
            case "UPDATES_CLOSED_ContentResponse":
                /*let ups = JSON.parse(localStorage.getItem('Seobudget') || '{}');
                for (let up in arg.updates) {
                    ups[up] = arg.updates[up];
                    localStorage.setItem('Seobudget', JSON.stringify(ups));
                }
                break;*/
            case "RDS_NOTICATION_CLOSED_ContentResponse":
            chrome.storage.local.get('OtherData', settings => {
                var otherData = settings.OtherData;
                otherData.rds_notification.prev = arg.data;
                chrome.storage.local.set(settings);
            });
                break;
            case "ALL_PARAMETERS_PopupRequest":
                rdz.model.parameters.Factory.requestAllParameters(arg);

                chrome.storage.local.get('Bar', settings => {
                    rdz.utils.getPopupHistoryCounts(arg.url, rdz.user.logged, rdz.setting.options.Bar.locale, true, settings);
                });
                break;
            case "GET_AD_ContentRequest":
                chrome.storage.local.get(['OtherData', 'Parameters'], settings => {
                    var curr_banner = /*AppLocale.get_locale_str() === 'ru' &&*/ rdz.user.banners.updateCurrBanner('bar', settings),
                        ad;
                    if (curr_banner) {
                        ad = { currBanner: curr_banner };
                        portRequest.postMessage({ method: 'message', request: 'GET_AD_ContentResponse', ad: ad });
                    }
                });
                break;
            case "UPDATE_BANNERS_STATS_ContentRequest":
                if (arg.data.banner) { // clicks
                    rdz.user.banners.updateClicksStats({
                        locale: arg.data.locale,
                        place: 'bar',
                        banner: arg.data.banner
                    });
                } else { // displaying
                    rdz.user.banners.updateDisplayingStats({locale: arg.data.locale, place: 'bar'});
                }
                break;
        }
    }
};