/**
 * @class cmessenger handles messages from background script to content script
 */
window.rdz.cmessenger = {
    execute: function (arg) {
        this[arg.method](arg);
    },
    /**
     * @description message coordinates with messages that has flag arg.method === 'message' and call function
     *
     *
     * @param arg { Object }
     * @param arg.method { String } flag to identify message
     * @param arg.request { Object } subflag
     * @param arg.url { Object } url
     * @param arg.model { Object }
     * @param arg.response { Object } XMLHttpRequest
     */
    message: function (arg) {
        switch (arg.request) {
            case "PARAMETER_ContentResponse":
                //prevent updating models after cache was cleared and not all parameters got response
                if (window.rdz.app.content.bar.get('options').check_by_button && window.rdz.app.content.bar.get('cache_cleared')) return;

                window.rdz.app.content.parameters.updateModel({model: JSON.parse(arg.model)});
                break;

            case "CLEAR_CACHE_ContentResponse":
                window.rdz.app.content.parameters.clearAllCaches();
                break;

            case "CLOSE_BAR_ContentResponse":
                rdz.app.content.view.barDestroy();
                break;

            case "CONTEXTMENU_ContentResponse":
                rdz.app.content.contextmenu.show({model: JSON.parse(arg.model)});
                break;

            case "USER_AUTH_STATUS_ContentResponse":
                rdz.app.content.bar.set('logged', arg.value);
                break;

            case "API_HISTORY_COUNT_ContentResponse":
                if (arg.model.value && !rdz.app.content.contextmenu.donot_show) {
                    rdz.app.content.contextmenu.collection.get('History').set({history_count: arg.model.value});
                    rdz.app.content.contextmenu.show_menu();
                }
                break;

            case "API_HISTORY_ContentResponse":
                delete rdz.app.content.contextmenu.donot_show;

                if (arg.model.value) {
                    rdz.app.content.contextmenu.show_submenu(arg.model);

                }
                break;

            case "API_MIRRORS_ContentResponse":
                delete rdz.app.content.contextmenu.donot_show;

                if (arg.model.value) {
                    rdz.app.content.contextmenu.show_submenu(arg.model);
                }
                break;

            case "NEWS_ContentResponse":
                if (arg.model.value) {
                    for (var news in arg.model.value) {
                        var m = rdz.app.content.contextmenu.collection.get(rdz.utils.toSmallCase(news));
                        if (m) m.set({news: arg.model.value[news]});
                    }
                    rdz.app.content.contextmenu.show_menu();
                }
                break;

            case "COUNTERS_ID_ContentRequests": //send counters id's to the core/messenger
                if (rdz.cmessenger.post)
                    rdz.$(function () {
                        rdz.cmessenger.post({
                            url: window.rdz.url || /*if bar is switched off. TODO: */ document.location.href,
                            request: 'COUNTERS_ID_ContentResponse',
                            method: 'message',
                            receiver: arg.receiver,
                            counters: rdz.utils.parseCounters(rdz.utils.counters_list)
                        });
                    });

                break;

            case "CHECK_BY_BUTTON_ContentResponse": //send counters id's to the core/messenger
                window.rdz.app.content.bar.set({options: arg.value});
                window.rdz.app.content.view.barRestore(window.rdz.app.content.parameters.toJSON());
                break;

            case "API_WHOIS_ContentResponse":
                var model = rdz.app.content.parameters.get('Age');
                if (model && !model.get('Counts')) {
                    model.set({Counts: {}});
                }
                if (arg.model.name == 'Whois') {
                    var val = arg.model.value;
                    var data = {
                        Cr: {value: val['WhoisStartDate']},
                        Exp: {value: val['WhoisExpDate']},
                        Info: {value: val['WhoisInfo']},
                        Email: {value: val['WhoisEmail']},
                        Dns: {value: val['WhoisDns']},
                        Phone: {value: val['WhoisPhone']},
                        RegInfo: {value: val['WhoisRegInfo']}
                    };
                    model.set({Whois: data});
                }
                if (arg.model.request.indexOf('CountForWhois') !== -1) {
                    let item = model.get('Counts');
                    item[arg.model.name] = arg.model.value;

                }
                if (arg.model.name == 'HistoryCount' && model.get('Whois')) {
                    let item = model.get('Whois');
                    item[arg.model.name] = arg.model.value;
                }
                window.rdz.app.content.contextmenu.show_submenu(model.toJSON());
                break;

            case "SUBDOMAINS_ContentResponse":
                window.rdz.app.content.contextmenu.show_submenu(arg.model);
                break;

            case "UNIQUE_CONTENT_ContentResponse":
                window.rdz.app.content.parameters.updateModel({model: JSON.parse(arg.model)});
                break;
            case "STAT_HISTORY_ContentResponse":
                rdz.app.content.contextmenu.show_submenu(arg.model);
                break;

            case "INTEGRATION_ContentResponse":
                rdz.integrations.search.methods.updateParameter(arg.model);
                break;

            case "INTEGRATION_Fetch_ContentResponse":
                window.rdz.integrations.search.methods.sendRequests(arg.data);
                break;

            case "INTEGRATION_Copy_URLs_ContentRequest":
                if (rdz.cmessenger.post) {
                    rdz.$(function () {
                        rdz.cmessenger.post({
                            method: 'message',
                            request: 'INTEGRATION_Copy_URLs_ContentResponse',
                            data: rdz.integrations.search.methods.getSearchResultsData(arg.options)
                        });
                    });
                }
                break;
            case "RECIPIENTS_POSITIONS_ContentResponse":
                var recipients_positions = rdz.integrations.search.data.recipients_positions;
                if (recipients_positions) {
                    recipients_positions.set('recipients', arg.recipients);
                }
                rdz.integrations.search.methods.highlightRecipients(arg.recipients);
                break;
            case "COMPETITION_AHREFS_ContentResponse":
                var competition = rdz.integrations.search.data.competition;
                if (competition) {
                    competition.set('ahrefs_data', arg.data);
                }
                break;
            case "SEOTAGS_CHECKED_ContentResponse":
                // push the button
                if (arg.functions.SEOTags &&
                    arg.functions.SEOTags.checked &&
                    rdz.$('.rds-bar-notification.seo_tags').length === 0 &&
                    rdz.$('.rds-seo_tags.checked').length === 0) {
                    rdz.utils.clickSEOTags(rdz.app.content.bar);
                } else if (arg.functions.SEOTags && !arg.functions.SEOTags.checked &&
                    ( rdz.$('.rds-bar-notification.seo_tags').length > 0 ||
                    rdz.$('.rds-seo_tags.checked').length > 0)) {
                    rdz.utils.clickSEOTags(rdz.app.content.bar);
                }
                break;
            case "RSS_ContentRequests":
                if (rdz.cmessenger.post) {
                    rdz.$(function () {
                        rdz.cmessenger.post({
                            url: window.rdz.url || /*if bar is switched off. TODO: */ document.location.href,
                            request: 'RSS_ContentResponse',
                            method: 'message',
                            receiver: arg.receiver,
                            links: rdz.utils.getRSSLinks()
                        });
                    });
                }
                break;
            case "DISABLE_STYLES_ContentRequests":
                rdz.utils.toggleStyles(arg.disable);
                break;
            case "CMS_ContentRequests":
                if (rdz.cmessenger.post) {
                    rdz.$(function () {
                        rdz.cmessenger.post({
                            url: window.rdz.url || /*if bar is switched off. TODO: */ document.location.href,
                            request: 'CMS_ContentResponse',
                            method: 'message',
                            receiver: arg.receiver,
                            data: rdz.utils.CMS.getData(document.documentElement && document.documentElement.innerHTML || '')
                        });
                    });
                }
                break;
            case "SHOW_UPDATES_NOTIFICATION_ContentRequest":
                rdz.utils.showUpdatesNotification(arg.updates);
                break;
            case "SHOW_RDS_NOTIFICATION_ContentRequest":
                rdz.utils.showRDSNotification(arg.data);
                break;
            case "INTEGRATION_SA_ContentResponse":
                window.rdz.integrations.search.methods.updateSAParameter({model: JSON.parse(arg.model)});
                break;
            case "OPERA_History_CountersPopupResponse":
                window.rdz.integrations.search.methods.updateSAHistoryCounter(arg);
                break;
            case "GET_AD_ContentResponse":
                window.rdz.app.content.bar.set({ad: arg.ad}, {silent: true});
                rdz.app.content.view.renderAd();
                break;

        }
    }
};