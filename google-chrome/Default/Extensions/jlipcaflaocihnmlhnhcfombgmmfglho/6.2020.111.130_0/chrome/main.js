chrome.storage.local.get(null, async (settings) => {
    rdz.storage.update(settings);
    rdz.user.locale = rdz.utils.getOptions({ options: ['Bar'] }, settings).locale;
    await AppLocale.init();
    rdz.db.init();

    //check cookie when browser was started
    rdz.user.is_logged();
    //chrome.cookies.onChanged.addListener(cookieChangeHandler);

    contextMenusInit();
});

chrome.storage.onChanged.addListener(function storageListener(changes, areaName) {
    if (areaName !== 'local') return;

    if (changes.Bar) {
        rdz.user.locale = changes.Bar.newValue ? changes.Bar.newValue.locale : rdz.utils.locale.get_browser_locale();
    }
});

window.portRequest = undefined;
window.ports = {};

function requestForTab(tab) {
    function handler(value) {
        value = value && typeof value.TYC !== "undefined" ? value.TYC : value;

        if (value === null)
            chrome.browserAction.setBadgeText({text: '', tabId: tab.id});
        else if (value == rdz.errors.GLUED)
            chrome.browserAction.setBadgeText({text: AppLocale.get('glue'), tabId: tab.id});
        else if (value == rdz.errors.AGS)
            chrome.browserAction.setBadgeText({text: AppLocale.get('ags'), tabId: tab.id});
        else
            chrome.browserAction.setBadgeText({text: rdz.utils.logAmount(value), tabId: tab.id});
    }

    if (!tab.url.match(/^https?:\/\//i)) return;

    var setBadgeTextRequestModel = window.rdz.model.parameters.Parameter.extend({
        valueChanged: function () {
            var value = this.get('value');
            handler(value);
        }
    });

    if (AppLocale.get_locale_str() === "ru") {
        chrome.storage.local.get('Bar', settings => {
            if (!rdz.utils.getOptions({ options: ['Bar'] }, settings).check_by_button) {
                var request_param = { name: 'SQI', request: 'SQI' };

                var setBadgeTextRequest = new setBadgeTextRequestModel(request_param);
                setBadgeTextRequest.on("change:value", setBadgeTextRequest.valueChanged, setBadgeTextRequest);
                setBadgeTextRequest.makeORsendRequest({ url: tab.url });
            }
        });
    } else {
        handler(null);
    }
}

/***
 *
 * @param Ids { Object }
 * @param Ids.tabId { Number } The ID of the tab that has become active
 * @param Ids.windowId { Number } The ID of the window the active tab changed inside of
 *
 */
function tabActivated(Ids) {
    chrome.tabs.get(Ids.tabId, function (tab) {
        if (tab.status !== "complete" || !/^https?:\/\//.test(tab.url)) return;
        chrome.storage.local.get(null, settings => {
            tabUpdated(Ids.tabId, [], tab, settings);
        });
    });
}


/***
 *
 * @param tabId { Number }
 * @param changeInfo { Object }
 * @param changeInfo.status { String } The status of the tab. Can be either loading or complete.
 * @param changeInfo.pinned { Boolean } The tab's new pinned state.
 * @param changeInfo.url { String } The tab's URL if it has changed.
 * @param tab { Object }
 *
 */
function tabUpdated(tabId, changeInfo, tab, settings) {
    // Tab url optimize
    //if (tab.status !== "complete" || !/^https?:\/\//.test(tab.url)) return;

    portRequest = ports[tabId];
    if (!portRequest || changeInfo.length !== 0) {
        portRequest = ports[tabId] = chrome.tabs.connect(tabId);
        portRequest.onMessage.addListener(function (data) {
            if (data.method === 'message') {
                rdz.messenger.execute(data);
            }
        });
    }

    // start an integration on Content script page	    
    if (rdz.utils.validateDomain(rdz.utils.domainFromUri(tab.url).domain)) {
        // we should test current url before sending the message
        // added later
        var patterns = {
            yandex: /^https?:\/\/(www\.)?(beta\.)?yandex\.(ua|ru|by|kz)\/(yand|site|large)?search\/?\?/,
            ya: /^https:\/\/(www\.)?ya\.ru/,
            //google: /^https?:\/\/(www\.)?google\.(am|az|bg|by|ee|kz|lv|md|ru|ua|com\.ua|uz|com|us|fr|de|es|it|pl|pt)[^]+?q=/
            google: /^https?:\/\/(www\.)?google(?=.(?:[^\.]{2,3}\.)*)[^]+?q=/
        };

        var domain = rdz.utils.domainFromUri(tab.url).domain,
            url = tab.url,
            integration, options;

        if ((changeInfo.status === 'complete' || !changeInfo.status) && !changeInfo.favIconUrl) {
            if ((/^(www\.)?yandex\.(ua|ru|by|kz|com\.tr|com)/.test(domain) || /^(www\.)?ya\.ru/.test(domain)) && AppLocale.get_locale_str() === 'ru') {

                // rdz.utils.turnOnOffYandex50(settings);

                options = rdz.utils.getOptions({options: ['Yandex']}, settings);
                options.id = patterns.yandex.test(url) ? 'Yandex' :
                             patterns.ya.test(url) ? 'Ya' : 'Yandex';

                portRequest.postMessage({
                    'method': 'integration',
                    'integration': {yandex: true, ya: true},
                    'parameters': JSON.stringify(rdz.utils.returnActiveParameters(rdz.utils.mergeWithOptions(rdz.setting.params, rdz.utils.getOptions({options: ['YaParameters']}, settings), tab.url, 'Yandex', settings))),
                    'options': options,
                    'locale': AppLocale.get(),
                    'options_changed': rdz.cache.get(tab.url) ? rdz.cache.get(tab.url).options_changed : true,
                    'updates': rdz.cache.get('ApplicationData').Seobudget,
                    'bar_parameters': JSON.stringify(rdz.utils.mergeWithOptions(rdz.setting.params, rdz.utils.getOptions({
                        options: ['Parameters'],
                        filter: 'isNotFunction'
                    }, settings), null, null, settings))
                });
            }

            if (/^(www\.)?google(?=.(?:[^\.]{2,3}\.)*)/.test(domain)) {
                options = rdz.utils.getOptions({options: ['Google']}, settings);
                options.id = 'Google';

                portRequest.postMessage({
                    'method': 'integration',
                    'integration': {google: true},
                    'parameters': JSON.stringify(rdz.utils.returnActiveParameters(rdz.utils.mergeWithOptions(rdz.setting.params, rdz.utils.getOptions({options: ['GoParameters']}, settings), tab.url, 'Google', settings))),
                    'options': options,
                    'locale': AppLocale.get(),
                    'options_changed': rdz.cache.get(tab.url) ? rdz.cache.get(tab.url).options_changed : true,
                    'updates': AppLocale.get_locale_str() === 'ru' ? rdz.cache.get('ApplicationData').Seobudget : null,
                    'bar_parameters': JSON.stringify(rdz.utils.mergeWithOptions(rdz.setting.params, rdz.utils.getOptions({
                        options: ['Parameters'],
                        filter: 'isNotFunction'
                    }, settings), null, null, settings))
                });
            }

            rdz.cache.set([tab.url, 'options_changed'], false);
        }
    }

    //load only current page
    if (tab.active) {
        //if (tab.status == 'loading') {
        loadBar(tab, function () {
            requestForTab(tab);
        }, settings);
        /*} else*/
        if (tab.status == 'complete') {
            //start highlighting on Content script page
            if (rdz.utils.getOptions({options: ['Bar']}, settings).highlight_pages) {
                portRequest.postMessage({
                    'method': 'highlighting',
                    'options': rdz.utils.getOptions({options: ['NoIndex', 'NoFollow', 'Canonical', 'Robots', 'OuterLinks', 'DisplayNone']}, settings),
                    'locale': AppLocale.get()
                });
            }

            try {
                portRequest.postMessage({
                    method: 'message',
                    request: 'SEOTAGS_CHECKED_ContentResponse',
                    functions: rdz.utils.returnActiveFunctions(rdz.utils.getOptions({options: ['Parameters']}, settings))
                });
            } catch (e) {
            }

            // updates notification
            if (rdz.utils.validateDomain(rdz.utils.domainFromUri(tab.url).domain) &&
                (AppLocale.get_locale_str() === 'ru')) { // valid domain name
                chrome.storage.local.get(['Parameters', 'OtherData'], settings => {
                    rdz.utils.checkSeobudgetUpdates(settings);
                    rdz.utils.checkRDSNotification(settings);
                });
            }
        }
    }

    // reset the disable styles shortcut
    window.disableStyles = false;
}

function loadBar(tab, callback, settings) {
    //var domain = rdz.utils.domainFromUri(tab.url);
    rdz.cache.set(tab.url, {});
    rdz.uri = rdz.utils.get_uri_obj(tab.url);

    if (tab.url.match(/https?:\/\/(?:www\.)?recipdonor\.com(?:\/|$)/)) {
        rdz.user.is_logged();
    }

    // valid domain name
    if (rdz.utils.validateDomain(rdz.utils.domainFromUri(tab.url).domain)) {

        /*for new tab fetch calls two times %) it's not good */
        rdz.db.fetch(rdz.uri, function () {
            callback();

            // if not SSL
            if (/*!tab.url.match(/https:\/\//i) &&*/
            //and if "show panel" was checked on options page
            (rdz.utils.getOptions({options: ['Bar']}, settings).active ||

                //or if panel previously was on but then switched off
            !rdz.utils.getOptions({options: ['Bar']}, settings).active && rdz.cache.get(tab.url).options_changed) &&

                //and if "domain" not in exception list
            !rdz.utils.isDomainInList(rdz.utils.domainFromUri(tab.url).domain, rdz.utils.getOptions({options: ['Bar']}, settings).filter_domain)) {

                try {
                    portRequest.postMessage({
                        method: 'bar',
                        parameters: JSON.stringify(rdz.utils.returnActiveParameters(rdz.utils.mergeWithOptions(rdz.setting.params, rdz.utils.getOptions({
                            options: ['Parameters'],
                            filter: 'isNotFunction, bar'
                        }, settings), tab.url, null, settings))),
                        options: rdz.utils.getOptions({options: ['Bar']}, settings),
                        options_changed: rdz.cache.get(tab.url).options_changed,
                        logged: rdz.user.logged,

                        //define locale here, before send message
                        locale: AppLocale.get(),
                        url: tab.url,
                        functions: rdz.utils.returnActiveFunctions(rdz.utils.getOptions({options: ['Parameters']}, settings))
                    });
                } catch (e) {
                    console.error(e);
                }

                rdz.cache.set([tab.url, 'options_changed'], false);

            }
        });
    }
}

function tabRemoved(tabId, removeInfo) {
    delete window.ports[tabId];
}

chrome.tabs.onActivated.addListener(tabActivated);
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.status !== "complete" || !/^https?:\/\//.test(tab.url)) return;
    chrome.storage.local.get(null, settings => {
        tabUpdated(tabId, changeInfo, tab, settings);
    });
});
chrome.tabs.onRemoved.addListener(tabRemoved);

/* Export the urls from the selected text*/
function contextMenusInit() {
// add an item to context menu of selection type.
(function createContextMenuItem() {
    var cmItemId = chrome.contextMenus.create({
            "title": AppLocale.get('context_menu.mass_checking'),
            "contexts": ["selection"],
            "onclick": cmOnClick,
            "enabled": false
        }
    );
    rdz.cache.set(['ApplicationData', 'cmItemId'], cmItemId);
    rdz.cache.set(['ApplicationData', 'selectedUrls'], null);
}());

// enable or disable the CM item
function updateContextMenu(options) {
    var cmItemId = rdz.cache.get(['ApplicationData', 'cmItemId']);
    chrome.contextMenus.update(cmItemId, {
        "title": AppLocale.get('context_menu.mass_checking'),
        "enabled": options.enabled
    });
}

// onclick handler of the CM item
function cmOnClick(info, tab) {
    rdz.utils.openDBPage("#checkpages/1/1");
    updateContextMenu({enabled: false});
}


chrome.contextMenus.create({
    contexts: ['browser_action', 'page'],
    'id': 'rdz-toggle_bar',
    "title": AppLocale.get('context_menu.toggle_bar'),
    "onclick": cmClickToggleBar,
});
function cmClickToggleBar(info, tab) {
    chrome.storage.local.get(null, settings => {
        let o = settings.Bar = rdz.utils.getOptions({options: ['Bar']}, settings),
            active = !o.active;

        o.active = active;
        chrome.storage.local.set({Bar: o});
        window.rdz.utils.optionsChanged();

        // set the attribute of the model
        let options_window = rdz.utils.getOptionsWindowObj();
        if (options_window) options_window.Bar.set('active', active);

        if (active) {
            loadBar(tab, () => { }, settings);
        } else {
            Object.keys(ports).forEach(p => ports[p].postMessage({ method: 'message', request: 'CLOSE_BAR_ContentResponse' }));
        }
    });
}

if (typeof browser !== 'undefined') {
    chrome.contextMenus.create({
        contexts: ['browser_action'],
        id: 'rdz-options',
        title: 'Options',
        onclick: (info, tab) => rdz.utils.openOptionPage()
    });
}
}

/* hotkeys */

// add listener to the keyboard shortcut
chrome.commands.onCommand.addListener(function (command) {
    if (command === 'get-indexed-pages') {
        rdz.utils.getAllIndexedPages();
    } else if (command === 'copy-search-urls') {
        rdz.utils.copySearchIntegrationResults();
    } else if (command === 'seotags-check-button') {
        rdz.utils.checkSEOTags();
    } else if (command === 'disable-styles') {
        rdz.utils.disableStyles();
    }
});

// add listener to get current IP
rdz.IPs = {};
chrome.webRequest.onCompleted.addListener(function (info) {
    if ((info.type === 'xmlhttprequest' && info.method === 'HEAD')) {
        rdz.IPs[rdz.utils.domainFromUri(info.url).domain] = info.ip;
    }
}, { urls: ['*://*/*'], types: ['main_frame', 'xmlhttprequest'] });


rdz.user.start();
