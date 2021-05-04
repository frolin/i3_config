/** @namespace global scope for parameters' context menu*/
window.rdz.contextmenu = {};

window.rdz.contextmenu.SuperClass = function (url) {
    this.dataReady = false;

    if (url) {
        this.url = url;
        //url = url.replace(/#.*$/, '');
        this.domain = rdz.utils.domainFromUri(url).domain;
        this.page = rdz.utils.protolessUri(url);
    }

    this.returnData = function (contextmenu) {
        if (this.dataReady) contextmenu.sendData({name: this.id, data: this.data});
        if (typeof this.APIHistoryCount !== 'undefined' && rdz.user.logged) this.APIHistoryCount();
        if (typeof this.GetNews !== 'undefined') this.GetNews();
    };
};

window.rdz.contextmenu.History = function (url) {
    this.APIHistoryCount = function () {
        rdz.model.parameters.Factory.requestOneParameter({
            model: {name: 'HistoryCount', request: 'HistoryCount', extra: {api: {active: true}}, parameter: this.id},
            url: url,
            receiver: 'callback',
            callback: function () {
                portRequest.postMessage({
                    method: 'message',
                    request: 'API_HISTORY_COUNT_ContentResponse',
                    model: this.toJSON()
                });
            }
        });
    };

    this.APIHistory = function () {

        return {
            parameter: this.id,
            type: rdz.user.logged ? 'history' : 'page',
            name: 'History',
            request: 'API_HISTORY_ContentRequest',
            title: AppLocale.get('bar.contextmenu.' + this.id + '.History.ttl'),
            text: AppLocale.get('bar.contextmenu.' + this.id + '.History.name'),
            url: 'http://www.recipdonor.com/',
            class: 'rds-cm-image rds-cm-history ' + (rdz.user.logged ? 'rds-logged' : '')
        };

    };
};

window.rdz.contextmenu.News = function (url) {
    this.GetNews = function () {
        var localeStr = AppLocale.get_locale_str(),
            news = localeStr === 'ru' ? ['NewsYandex', 'NewsWebmasters', 'NewsSE', 'NewsWebmoney', 'NewsRDS'] :
                ['NewsSEWatch', 'NewsTrafficplanet', 'NewsWebmasterworld', 'NewsSEJournal', 'NewsSELand', 'NewsSeochat'];

        rdz.model.parameters.Factory.requestOneParameter({
            model: {name: 'News', request: news, parameter: this.id},
            url: url,
            receiver: 'callback',
            callback: function () {
                portRequest.postMessage({method: 'message', request: 'NEWS_ContentResponse', model: this.toJSON()});
            },
            ignore_cache: true
        });
    };
};

window.rdz.contextmenu.Mainmenu = function (contextmenu, arg) {
    window.rdz.contextmenu.SuperClass.call(this, arg.url);
    window.rdz.contextmenu.News.call(this, arg.url);
    this.id = 'Mainmenu';
    var show_recipients_item, recipients_count,
        localeStr = AppLocale.get_locale_str(),
        seobudget = rdz.cache.get(['ApplicationData', 'Seobudget']);

    chrome.storage.local.get('Bar', settings => {

    this.data = [];
    if (rdz.user.get()) {
        // prepage show recipient item
        show_recipients_item = (function () {
            var MAX_RECIPIENTS_COUNT = 20,
                recipients = rdz.cache.get(['API', 'Recipients']),
                recipients_list = [],
                result = [];
            recipients_count = recipients && recipients.length || 0;
            if (recipients_count) {
                recipients = rdz._.clone(recipients).splice(0, MAX_RECIPIENTS_COUNT);
                recipients.forEach(function (e) {
                    recipients_list.push({
                        type: 'Recipient',
                        name: e.Url,
                        title: e.Url,
                        text: e.Url,
                        url: 'http://' + e.Url,
                        class: 'rds-cm-rds_recipient'
                    });
                });
                if (recipients_count > MAX_RECIPIENTS_COUNT) {
                    recipients_list.push({
                        type: 'page',
                        name: 'more_recipients',
                        title: AppLocale.get('bar.contextmenu.Mainmenu.more_recipients.ttl'),
                        text: '... (+' + (recipients_count - MAX_RECIPIENTS_COUNT) + ')',
                        url: 'http://www.recipdonor.com/recip'
                    });
                }

                result.push({
                    type: 'submenu',
                    name: 'show_recipients',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.show_recipients.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.show_recipients.name'),
                    url: 'http://www.recipdonor.com/recip',
                    class: 'rds-cm-show_recipients',
                    submenu: recipients_list
                });
            } else {
                result.push({
                    type: 'page',
                    name: 'show_recipients',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.show_recipients.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.show_recipients.name'),
                    url: 'http://www.recipdonor.com/recip',
                    class: 'rds-cm-show_recipients'
                });
            }
            return result;
        }());

        this.data.push({
            type: 'submenu',
            name: this.id,
            title: AppLocale.get('bar.contextmenu.Mainmenu.enter.ttl'),
            text: rdz.user.get('email') + ' (' + rdz.user.get('balance') + '$)',
            url: 'http://www.recipdonor.com',
            class: 'rds-cm-image rds-cm-user',
            submenu: [{
                type: 'submenu',
                name: this.id,
                title: AppLocale.get('bar.contextmenu.Mainmenu.recipients.ttl'),
                text: AppLocale.get('bar.contextmenu.Mainmenu.recipients.name') + (recipients_count ?
                ' (' + recipients_count + ')' : ''),
                url: 'http://www.recipdonor.com',
                class: 'rds-cm-recipients rds-cm-sep',
                submenu: show_recipients_item.concat([
                    {
                        type: 'page',
                        name: 'add_recipients',
                        title: AppLocale.get('bar.contextmenu.Mainmenu.add_recipients.ttl'),
                        text: AppLocale.get('bar.contextmenu.Mainmenu.add_recipients.name'),
                        url: 'http://www.recipdonor.com/recip/add',
                        class: 'rds-cm-add_recipients'
                    },
                    {
                        type: 'page',
                        name: 'recipients_topic_stat',
                        title: AppLocale.get('bar.contextmenu.Mainmenu.recipients_topic_stat.ttl'),
                        text: AppLocale.get('bar.contextmenu.Mainmenu.recipients_topic_stat.name'),
                        url: 'http://www.recipdonor.com/recip/themes',
                        class: 'rds-cm-recipients_topic_stat'
                    },
                    {
                        type: 'page',
                        name: 'recipients_setting',
                        title: AppLocale.get('bar.contextmenu.Mainmenu.recipients_setting.ttl'),
                        text: AppLocale.get('bar.contextmenu.Mainmenu.recipients_setting.name'),
                        url: 'http://www.recipdonor.com/recip/themes',
                        class: 'rds-cm-recipients_setting'
                    }
                ])
            }, {
                type: 'page',
                name: 'profile',
                title: AppLocale.get('bar.contextmenu.Mainmenu.profile.ttl'),
                text: AppLocale.get('bar.contextmenu.Mainmenu.profile.name'),
                url: 'https://www.recipdonor.com/account/settings',
                class: 'rds-cm-profile'
            },
                {
                    type: 'page',
                    name: 'balance',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.balance.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.balance.name'),
                    url: 'http://www.recipdonor.com/userproperties/useroperations',
                    class: 'rds-cm-balance'
                },
                {
                    type: 'page',
                    name: 'partnership',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.partnership.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.partnership.name'),
                    url: 'http://www.recipdonor.com/partnership',
                    class: 'rds-cm-partnership rds-cm-sep'
                },
                {
                    type: 'background',
                    name: 'change_user',
                    request: 'CHANGE_USER_ContentRequest',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.change_user.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.change_user.name'),
                    class: 'rds-cm-change_user'
                },
                {
                    type: 'background',
                    name: 'exit',
                    request: 'EXIT_ContentRequest',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.exit.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.exit.name'),
                    class: 'rds-cm-exit'
                }
            ]
        });
    }
    else {
        this.data.push({
            type: 'page',
            name: 'enter',
            title: AppLocale.get('bar.contextmenu.Mainmenu.enter.ttl'),
            text: AppLocale.get('bar.contextmenu.Mainmenu.enter.name'),
            url: 'http://www.recipdonor.com',
            class: 'rds-cm-image rds-cm-login'
        });
    }

    let bar = rdz.utils.getOptions({ options: ['Bar'] }, settings),
        buttmod = bar.check_by_button ? 'rds-cm-button_on' : 'rds-cm-button';
    this.data.push({
        type: 'background',
        name: 'button',
        request: 'CHECK_BY_BUTTON_ContentRequest',
        title: AppLocale.get('bar.contextmenu.Mainmenu.button.ttl'),
        text: AppLocale.get('bar.contextmenu.Mainmenu.button.name'),
        class: 'rds-cm-image ' + buttmod
    },
    {
        type: 'background',
        name: 'trash',
        request: 'CLEAR_CACHE_ContentRequest',
        title: AppLocale.get('bar.contextmenu.Mainmenu.trash.ttl'),
        text: AppLocale.get('bar.contextmenu.Mainmenu.trash.name'),
        class: 'rds-cm-image rds-cm-trash'
    },
    {
        type: 'background',
        name: 'options',
        request: 'OPTION_PAGE_ContentRequest',
        title: AppLocale.get('bar.contextmenu.Mainmenu.options.ttl'),
        text: AppLocale.get('bar.contextmenu.Mainmenu.options.name'),
        class: 'rds-cm-image rds-cm-options'
    });

    if (localeStr === 'ru') {
        this.data.push({
            type: 'submenu',
            name: "updatesYandex",
            title: AppLocale.get('bar.contextmenu.Mainmenu.updates_yandex.ttl'),
            text: AppLocale.get('bar.contextmenu.Mainmenu.updates_yandex.name'),
            class: 'rds-cm-image rds-cm-updates-yandex',
            submenu: [{
                type: 'page',
                name: 'tyc',
                title: AppLocale.get('bar.contextmenu.Mainmenu.updates_yandex.tyc.ttl'),
                text: AppLocale.get('bar.contextmenu.Mainmenu.updates_yandex.tyc.name') + " " + rdz.utils.getUpdateTimeString(seobudget.TYC),
                url: 'http://seobudget.ru/updates/?from=rdsbar',
                class: 'rds-cm-image rds-cm-updates-yandex-tyc'
            },
                {
                    type: 'page',
                    name: 'yabase',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.updates_yandex.yabase.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.updates_yandex.yabase.name') + " " + rdz.utils.getUpdateTimeString(seobudget.IY),
                    url: 'http://seobudget.ru/updates/?from=rdsbar',
                    class: 'rds-cm-image rds-cm-updates-yandex-yabase'
                },
                {
                    type: 'page',
                    name: 'ya_user',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.updates_yandex.ya_user.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.updates_yandex.ya_user.name') + " " + rdz.utils.getUpdateTimeString(seobudget.USER),
                    url: 'http://seobudget.ru/updates/?from=rdsbar',
                    class: 'rds-cm-image rds-cm-updates-yandex-ya_user'
                },
                {
                    type: 'page',
                    name: 'yaca',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.updates_yandex.yaca.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.updates_yandex.yaca.name') + " " + rdz.utils.getUpdateTimeString(seobudget.YACA),
                    url: 'http://seobudget.ru/updates/?from=rdsbar',
                    class: 'rds-cm-image rds-cm-updates-yandex-yaca'
                },
                {
                    type: 'page',
                    name: 'forum',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.updates_yandex.forum.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.updates_yandex.forum.name'),
                    url: 'http://forum.searchengines.ru/forumdisplay.php?f=60',
                    class: 'rds-cm-image rds-cm-updates-yandex-forum'
                }
            ]
        });
    }

    this.data.push({
        type: 'submenu',
        name: "updatesGoogle",
        title: AppLocale.get('bar.contextmenu.Mainmenu.updates_google.ttl'),
        text: AppLocale.get('bar.contextmenu.Mainmenu.updates_google.name'),
        class: 'rds-cm-image rds-cm-updates-google',
        submenu: [{
            type: 'page',
            name: 'pr',
            title: AppLocale.get('bar.contextmenu.Mainmenu.updates_google.pr.ttl'),
            text: AppLocale.get('bar.contextmenu.Mainmenu.updates_google.pr.name') + " " + rdz.utils.getUpdateTimeString(seobudget.PR),
            url: localeStr === 'ru' ? 'http://seobudget.ru/updates/?from=rdsbar' : 'http://www.webmasterworld.com/google/',
            class: 'rds-cm-image rds-cm-updates-google-pr'
        },
            {
                type: 'page',
                name: 'forum',
                title: AppLocale.get('bar.contextmenu.Mainmenu.updates_google.forum.ttl'),
                text: AppLocale.get('bar.contextmenu.Mainmenu.updates_google.forum.name'),
                url: localeStr === 'ru' ? 'http://forum.searchengines.ru/forumdisplay.php?f=7' : 'http://www.webmasterworld.com/google/',
                class: 'rds-cm-image rds-cm-updates-google-forum'
            }
        ]
    });

    if (localeStr === 'ru') {
        this.data.push({
            type: 'news',
            name: "newsYandex",
            title: AppLocale.get('bar.contextmenu.Mainmenu.news_yandex.ttl'),
            text: AppLocale.get('bar.contextmenu.Mainmenu.news_yandex.name'),
            class: 'rds-cm-image rds-cm-news-yandex',
            submenu: []
        }, {
            type: 'news',
            name: "newsWebmasters",
            title: AppLocale.get('bar.contextmenu.Mainmenu.news_webmasters.ttl'),
            text: AppLocale.get('bar.contextmenu.Mainmenu.news_webmasters.name'),
            class: 'rds-cm-image rds-cm-news-webmasters',
            submenu: []
        }, {
            type: 'news',
            name: "newsSE",
            title: AppLocale.get('bar.contextmenu.Mainmenu.news_se.ttl'),
            text: AppLocale.get('bar.contextmenu.Mainmenu.news_se.name'),
            class: 'rds-cm-image rds-cm-news-se',
            submenu: []
        }, {
            type: 'news',
            name: "newsWebmoney",
            title: AppLocale.get('bar.contextmenu.Mainmenu.news_webmoney.ttl'),
            text: AppLocale.get('bar.contextmenu.Mainmenu.news_webmoney.name'),
            class: 'rds-cm-image rds-cm-news-webmoney',
            submenu: []
        }, {
            type: 'news',
            name: "newsRDS",
            title: AppLocale.get('bar.contextmenu.Mainmenu.news_rds.ttl'),
            text: AppLocale.get('bar.contextmenu.Mainmenu.news_rds.name'),
            class: 'rds-cm-image rds-cm-news-rds',
            submenu: []
        });
    }

    if (localeStr !== 'ru') {
        this.data.push({
            type: 'news',
            name: "newsSEWatch",
            title: AppLocale.get('bar.contextmenu.Mainmenu.news_se_watch.ttl'),
            text: AppLocale.get('bar.contextmenu.Mainmenu.news_se_watch.name'),
            class: 'rds-cm-image rds-cm-news-se-watch',
            submenu: []
        }, {
            type: 'news',
            name: "newsTrafficplanet",
            title: AppLocale.get('bar.contextmenu.Mainmenu.news_trafficplanet.ttl'),
            text: AppLocale.get('bar.contextmenu.Mainmenu.news_trafficplanet.name'),
            class: 'rds-cm-image rds-cm-news-trafficplanet',
            submenu: []
        }, {
            type: 'news',
            name: "newsWebmasterworld",
            title: AppLocale.get('bar.contextmenu.Mainmenu.news_webmasterworld.ttl'),
            text: AppLocale.get('bar.contextmenu.Mainmenu.news_webmasterworld.name'),
            class: 'rds-cm-image rds-cm-news-webmasterworld',
            submenu: []
        }, {
            type: 'news',
            name: "newsSEJournal",
            title: AppLocale.get('bar.contextmenu.Mainmenu.news_se_journal.ttl'),
            text: AppLocale.get('bar.contextmenu.Mainmenu.news_se_journal.name'),
            class: 'rds-cm-image rds-cm-news-se-journal',
            submenu: []
        }, {
            type: 'news',
            name: "newsSELand",
            title: AppLocale.get('bar.contextmenu.Mainmenu.news_se_land.ttl'),
            text: AppLocale.get('bar.contextmenu.Mainmenu.news_se_land.name'),
            class: 'rds-cm-image rds-cm-news-se-land',
            submenu: []
        }, {
            type: 'news',
            name: "newsSeochat",
            title: AppLocale.get('bar.contextmenu.Mainmenu.news_seochat.ttl'),
            text: AppLocale.get('bar.contextmenu.Mainmenu.news_seochat.name'),
            class: 'rds-cm-image rds-cm-news-seochat',
            submenu: []
        });
    }

    this.data.push({
        type: 'page',
        name: 'about',
        title: AppLocale.get('bar.contextmenu.Mainmenu.about.ttl'),
        text: AppLocale.get('bar.contextmenu.Mainmenu.about.name'),
        url: localeStr === 'ru' ? 'http://www.recipdonor.com/bar/' : 'http://www.recipdonor.com/bar/ln=en',
        class: 'rds-cm-image rds-cm-about'
    });
    if (localeStr === 'ru') {
        this.data.push({
            type: 'submenu',
            name: "searchengines",
            title: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.ttl'),
            text: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.name'),
            class: 'rds-cm-image rds-cm-searchengines',
            submenu: [{
                type: 'page',
                name: 'ffaddon',
                title: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.ffaddon.ttl'),
                text: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.ffaddon.name'),
                url: 'http://forum.searchengines.ru/showthread.php?t=724039',
                class: 'rds-cm-image rds-cm-searchengines-ffaddon'
            },
                {
                    type: 'page',
                    name: 'gcaddon',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.gcaddon.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.gcaddon.name'),
                    url: 'http://forum.searchengines.ru/showthread.php?t=806692',
                    class: 'rds-cm-image rds-cm-searchengines-gcaddon'
                },
                {
                    type: 'page',
                    name: 'opera',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.opera.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.opera.name'),
                    url: 'http://forum.searchengines.ru/showthread.php?p=12527993',
                    class: 'rds-cm-image rds-cm-searchengines-opera'
                },
                {
                    type: 'page',
                    name: 'desktop',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.desktop.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.desktop.name'),
                    url: 'http://forum.searchengines.ru/showthread.php?t=586843',
                    class: 'rds-cm-image rds-cm-searchengines-desktop'
                },
                {
                    type: 'page',
                    name: 'API',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.API.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.API.name'),
                    url: 'http://forum.searchengines.ru/showthread.php?t=586840',
                    class: 'rds-cm-image rds-cm-searchengines-api'
                },
                {
                    type: 'page',
                    name: 'RDS',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.RDS.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.RDS.name'),
                    url: 'http://forum.searchengines.ru/showthread.php?t=520824',
                    class: 'rds-cm-image rds-cm-searchengines-rds'
                },
                {
                    type: 'page',
                    name: 'selection',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.selection.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.selection.name'),
                    url: 'http://forum.searchengines.ru/showthread.php?t=532765',
                    class: 'rds-cm-image rds-cm-searchengines-selection'
                },
                {
                    type: 'page',
                    name: 'history',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.history.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.history.name'),
                    url: 'http://forum.searchengines.ru/showthread.php?t=529035',
                    class: 'rds-cm-image rds-cm-searchengines-history'
                },
                {
                    type: 'page',
                    name: 'mirrors',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.mirrors.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.mirrors.name'),
                    url: 'http://forum.searchengines.ru/showthread.php?t=539779',
                    class: 'rds-cm-image rds-cm-searchengines-mirrors'
                },
                {
                    type: 'page',
                    name: 'whois',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.whois.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.whois.name'),
                    url: 'http://forum.searchengines.ru/showthread.php?t=595839',
                    class: 'rds-cm-image rds-cm-searchengines-whois'
                },
                {
                    type: 'page',
                    name: 'googleads',
                    title: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.googleads.ttl'),
                    text: AppLocale.get('bar.contextmenu.Mainmenu.searchengines.googleads.name'),
                    url: 'http://forum.searchengines.ru/showthread.php?t=619364',
                    class: 'rds-cm-image rds-cm-searchengines-googleads'
                }
            ]
        });
    }

    this.data.push({
        type: 'submenu',
        name: 'cookies',
        title: AppLocale.get('bar.contextmenu.Mainmenu.cookies.ttl'),
        text: AppLocale.get('bar.contextmenu.Mainmenu.cookies.name'),
        class: 'rds-cm-image rds-cm-cookies',
        submenu: [
            {
                type: 'background',
                name: 'cookies_session',
                request: 'COOKIES_SESSION_ContentRequest',
                title: AppLocale.get('bar.contextmenu.Mainmenu.cookies.session.ttl'),
                text: AppLocale.get('bar.contextmenu.Mainmenu.cookies.session.name'),
                class: 'rds-cm-cookies-session'
            },
            {
                type: 'background',
                name: 'cookies_host',
                request: 'COOKIES_HOST_ContentRequest',
                title: AppLocale.get('bar.contextmenu.Mainmenu.cookies.host.ttl'),
                text: AppLocale.get('bar.contextmenu.Mainmenu.cookies.host.name'),
                class: 'rds-cm-cookies-host'
            },
            {
                type: 'background',
                name: 'cookies_info',
                request: 'COOKIES_INFO_ContentRequest',
                title: AppLocale.get('bar.contextmenu.Mainmenu.cookies.info.ttl'),
                text: AppLocale.get('bar.contextmenu.Mainmenu.cookies.info.name'),
                class: 'rds-cm-cookies-info'
            }
        ]
    });

    this.data.push({
        type: 'submenu',
        name: 'useragent',
        title: 'UserAgent',
        text: 'UserAgent',
        class: 'rds-cm-image rds-cm-useragent',
        submenu: [
            {
                type: 'Background_UserAgent',
                name: 'default',
                request: 'USERAGENT_SESSION_ContentRequest',
                title: navigator.userAgent,
                text: 'Default',
                class: 'rds-cm-useragent'
            },

            {
                type: 'Background_UserAgent',
                name: 'googlebot_desktop',
                request: 'USERAGENT_SESSION_ContentRequest',
                title: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                text: 'GoogleBot (Desktop)',
                class: 'rds-cm-useragent'
            },
            {
                type: 'Background_UserAgent',
                name: 'googlebot_mobile',
                request: 'USERAGENT_SESSION_ContentRequest',
                title: 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.96 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                text: 'GoogleBot (Mobile)',
                class: 'rds-cm-useragent'
            },
            {
                type: 'Background_UserAgent',
                name: 'yandexbot_desktop',
                request: 'USERAGENT_SESSION_ContentRequest',
                title: 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
                text: 'YandexBot (Desktop)',
                class: 'rds-cm-useragent'
            },
            {
                type: 'Background_UserAgent',
                name: 'yandexbot_mobile',
                request: 'USERAGENT_SESSION_ContentRequest',
                title: 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12B411 Safari/600.1.4 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
                text: 'YandexBot (Mobile)',
                class: 'rds-cm-useragent'
            },
            {
                type: 'Background_UserAgent',
                name: 'bingbot_desktop',
                request: 'USERAGENT_SESSION_ContentRequest',
                title: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
                text: 'BingBot (Desktop)',
                class: 'rds-cm-useragent'
            },
            {
                type: 'Background_UserAgent',
                name: 'bingbot_mobile',
                request: 'USERAGENT_SESSION_ContentRequest',
                title: 'Mozilla/5.0 (Windows Phone 8.1; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 530) like Gecko (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
                text: 'BingBot (Mobile)',
                class: 'rds-cm-useragent'
            },

            
            {
                type: 'Background_UserAgent',
                name: 'msnbot',
                request: 'USERAGENT_SESSION_ContentRequest',
                title: 'msnbot/2.0b (+http://search.msn.com/msnbot.htm)',
                text: 'MSNBot',
                class: 'rds-cm-useragent'
            },
            {
                type: 'Background_UserAgent',
                name: 'yahoo',
                request: 'USERAGENT_SESSION_ContentRequest',
                title: 'Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)',
                text: 'Yahoo! Slurp',
                class: 'rds-cm-useragent'
            },

            
            {
                type: 'Background_UserAgent',
                name: 'ie6',
                request: 'USERAGENT_SESSION_ContentRequest',
                title: 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)',
                text: 'Internet Explorer 6',
                class: 'rds-cm-useragent'
            },
            {
                type: 'Background_UserAgent',
                name: 'ie7',
                request: 'USERAGENT_SESSION_ContentRequest',
                title: 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
                text: 'Internet Explorer 7',
                class: 'rds-cm-useragent'
            },
            {
                type: 'Background_UserAgent',
                name: 'ie8',
                request: 'USERAGENT_SESSION_ContentRequest',
                title: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)',
                text: 'Internet Explorer 8',
                class: 'rds-cm-useragent'
            }
        ]
    });

    this.data.push({
        type: 'submenu',
        name: "hotkeys",
        title: AppLocale.get('bar.contextmenu.Mainmenu.hotkeys.ttl'),
        text: AppLocale.get('bar.contextmenu.Mainmenu.hotkeys.name'),
        class: 'rds-cm-image rds-cm-hotkeys',
        submenu: [/*{
         type: 'background',
         name: 'ctrlY',
         request: 'HOTKEYS_CTRL_Y_ContentRequest',
         title: AppLocale.get('bar.contextmenu.Mainmenu.hotkeys.ctrlY.ttl'),
         text: AppLocale.get('bar.contextmenu.Mainmenu.hotkeys.ctrlY.name'),
         class: 'rds-cm-hotkeys-ctrl_y'
         },*/
            {
                type: 'background',
                name: 'ctrlQ',
                request: 'HOTKEYS_CTRL_Q_ContentRequest',
                title: AppLocale.get('bar.contextmenu.Mainmenu.hotkeys.ctrlQ.ttl'),
                text: AppLocale.get('bar.contextmenu.Mainmenu.hotkeys.ctrlQ.name'),
                class: 'rds-cm-hotkeys-ctrl_q'
            },
            {
                type: 'background',
                name: 'ctrlShiftF',
                request: 'HOTKEYS_CTRL_SHIFT_F_ContentRequest',
                title: AppLocale.get('bar.contextmenu.Mainmenu.hotkeys.ctrlShiftF.ttl'),
                text: AppLocale.get('bar.contextmenu.Mainmenu.hotkeys.ctrlShiftF.name'),
                class: 'rds-cm-hotkeys-ctrl_shift_f'
            },
            {
                type: 'background',
                name: 'altS',
                request: 'HOTKEYS_ALT_S_ContentRequest',
                title: AppLocale.get('bar.contextmenu.Mainmenu.hotkeys.altS.ttl'),
                text: AppLocale.get('bar.contextmenu.Mainmenu.hotkeys.altS.name'),
                class: 'rds-cm-hotkeys-alt_s'
            }
        ]
    });

    this.data.push({
        type: 'page',
        name: 'version',
        title: AppLocale.get('bar.contextmenu.Mainmenu.version.ttl'),
        text: AppLocale.get('bar.contextmenu.Mainmenu.version.name') + chrome.runtime.getManifest().version,
        url: 'https://www.recipdonor.com/bar',
        class: 'rds-cm-image rds-cm-version'
    });

    this.dataReady = true;
    this.returnData(contextmenu);

    });
};

window.rdz.contextmenu.IY = function (contextmenu, arg) {
    window.rdz.contextmenu.SuperClass.call(this, arg.url);
    window.rdz.contextmenu.History.call(this, arg.url);
    this.id = 'IY';

    this.data = [
        {
            parameter: this.id,
            type: 'page',
            name: 'IY',
            title: AppLocale.get('bar.contextmenu.IY.IY.ttl'),
            text: AppLocale.get('bar.contextmenu.IY.IY.name'),
            class: 'rds-cm-pl'
        },
        {
            parameter: this.id,
            type: 'page',
            name: 'Site',
            title: AppLocale.get('bar.contextmenu.IY.Site.ttl'),
            text: AppLocale.get('bar.contextmenu.IY.Site.name') + this.domain,
            url: 'http://yandex.ru/yandsearch?site=' + this.domain + '&lr=213&text=',
            class: 'rds-cm-pl'
        }
    ];
    this.data.push(this.APIHistory());

    this.dataReady = true;
    this.returnData(contextmenu);
};

window.rdz.contextmenu.IYP = function (contextmenu, arg) {
    window.rdz.contextmenu.SuperClass.call(this, arg.url);
    this.id = 'IYP';

    this.data = [
        {
            parameter: this.id,
            type: 'page',
            name: 'IYP',
            title: AppLocale.get('bar.contextmenu.IYP.IYP.ttl'),
            text: AppLocale.get('bar.contextmenu.IYP.IYP.name')
        },
        {
            parameter: this.id,
            type: 'page',
            name: 'IYPCache',
            title: AppLocale.get('bar.contextmenu.IYP.IYPCache.ttl'),
            text: AppLocale.get('bar.contextmenu.IYP.IYPCache.name')
        }
    ];

    this.dataReady = true;
    this.returnData(contextmenu);
};

window.rdz.contextmenu.TYC = function (contextmenu, arg) {
    window.rdz.contextmenu.SuperClass.call(this, arg.url);
    window.rdz.contextmenu.History.call(this, arg.url);
    this.id = 'TYC';

    this.data = [
        {
            parameter: this.id,
            type: 'page',
            name: 'TYC',
            title: AppLocale.get('bar.contextmenu.TYC.TYC.ttl'),
            text: AppLocale.get('bar.contextmenu.TYC.TYC.name'),
            url: 'https://webmaster.yandex.ru/tic/' + encodeURIComponent(this.domain) + '/',
            class: 'rds-cm-pl'
        },
        {
            parameter: this.id, // there is nothing to get from when YaBar parameter switched off in options
            type: 'page',
            name: 'YaBar',
            title: AppLocale.get('bar.contextmenu.TYC.YaBar.ttl'),
            text: AppLocale.get('bar.contextmenu.TYC.YaBar.name'),
            url: 'http://bar-navig.yandex.ru/u?ver=2&url=' + encodeURIComponent('http://' + this.domain) + '&show=1', //new window.rdz.request.YaBar (this.url, window.rdz.request.DataRequest).serviceUrl,
            class: 'rds-cm-pl'
        }
    ];

    if (arg.model.value && arg.model.value.MirrorsCount > 0) {
        this.data.push({
            parameter: this.id,
            type: 'mirrors',
            name: 'Mirrors',
            request: 'API_MIRRORS_ContentRequest',
            title: AppLocale.get('bar.contextmenu.' + this.id + '.Mirrors.ttl'),
            text: AppLocale.get('bar.contextmenu.' + this.id + '.Mirrors.name').replace('$1', arg.model.value.MirrorsCount),
            url: 'http://www.recipdonor.com/',
            class: 'rds-cm-image rds-cm-mirrors ' + (rdz.user.logged ? 'rds-logged' : '')
        });
    }

    this.data.push(this.APIHistory());
    this.dataReady = true;
    this.returnData(contextmenu);
};

window.rdz.contextmenu.PR = function (contextmenu, arg) {
    window.rdz.contextmenu.SuperClass.call(this, arg.url);
    window.rdz.contextmenu.History.call(this, arg.url);
    this.id = 'PR';

    this.data = [
        {
            parameter: this.id,
            type: 'page',
            name: 'PR',
            title: AppLocale.get('bar.contextmenu.PR.PR.ttl'),
            text: AppLocale.get('bar.contextmenu.PR.PR.name'),
            class: 'rds-cm-pl'
        },
        {
            parameter: this.id,
            type: 'page',
            name: 'PRg',
            title: AppLocale.get('bar.contextmenu.PR.PRg.ttl'),
            text: AppLocale.get('bar.contextmenu.PR.PRg.name'),
            url: 'https://www.google.com/search?hl=en&q=' + encodeURIComponent('info:' + this.url), //new window.rdz.request.PRg (this.url, window.rdz.request.DataRequest).serviceUrl,
            class: 'rds-cm-pl'
        },
        {
            parameter: this.id, // there is nothing to get from when PR parameter switched off in options
            type: 'page',
            name: 'Dmoz',
            title: AppLocale.get('bar.contextmenu.PR.Dmoz.ttl'),
            text: AppLocale.get('bar.contextmenu.PR.Dmoz.name'),
            url: 'http://search.dmoz.org/search/?q=' + encodeURIComponent(this.domain), //new window.rdz.request.Dmoz (this.url, window.rdz.request.DataRequest).serviceUrl,
            class: 'rds-cm-pl'
        }
    ];
    this.data.push(this.APIHistory());
    this.dataReady = true;
    this.returnData(contextmenu);
};

window.rdz.contextmenu.Counters = function (contextmenu, arg) {
    window.rdz.contextmenu.SuperClass.call(this, arg.url);
    this.id = 'Counters';
    this.data = [];

    var counters = arg.model.value,
        self = this;
    if (counters.Alexa) {
        counters.Alexa.value = counters.Alexa.value > 100000 ? false : true;

    }
    var countervalues = rdz.utils.sortCounters(counters);

    this.checkError = function (value) {
        if (value === rdz.errors.GLUED || value === -666) {
            value = AppLocale.get('glued');
        }
        else if (value === rdz.errors.PARSE) {
            value = 'parse error';
        }
        else if (value === rdz.errors.CAPTCHA) {
            value = 'captcha';
        }
        else if (value === rdz.errors.ACCESS) {
            value = AppLocale.get('no_access');
        }
        else if
        (value === rdz.errors.HTTP || value === null) {
            value = '?';
        }
        return value;
    };
        this.formatValue = function (value) {
            return value === null ? value : typeof value === 'number' ? rdz.utils.formatNumber.apply(value, [0, "", "\u2009"]) : value;
        };
        this.build_data = function (a) {
            var data = arg.model.value[a];
            var value = this.checkError(data.value);
            value = this.formatValue(value);
            var applocate = AppLocale.get('bar.contextmenu.Counters.' + a + '.name');
            return {
                parameter: this.id,
                type: 'pageHover',
                name: a,
                title: AppLocale.get('bar.contextmenu.Counters.' + a + '.ttl'),
                text: applocate,
                value: typeof value !== 'boolean' ? value + ' ' : '',
                red: (data.image && data.image.indexOf('yadro.ru') !== -1) ? true : false,
                domains: data.domains ? data.domains : null
            };
        };

    countervalues.forEach(function (e) {
        if (e[0] != 'Alexa') {
            if (e[1]['value'] !== null && e[1]['value'] !== false) {
                self.data.push(self.build_data(e[0]));
            }
        }
        else {
            if (e[1]['value'] !== false) {
                self.data.push(self.build_data(e[0]));
            }
        }
    });

    this.dataReady = true;
    this.returnData(contextmenu);

};

window.rdz.contextmenu.Whois = function (contextmenu, arg) {
    this.getData = function (arg) {
        var data = {};
        rdz.model.parameters.Factory.requestOneParameter({
            model: {name: 'Whois', request: 'Whois', extra: {api: {active: true}}},
            url: arg.url,
            receiver: 'callback',
            callback: function () {
                var val = this.get('value');

                //Get count for whois data
                if (val != null) {

                    var counts = {
                        Email: [2, 2, val.WhoisEmail ? val.WhoisEmail : null],
                        Dns: [3, 2, val.WhoisDns ? val.WhoisDns : null],
                        Info: [1, 2, val.WhoisInfo ? val.WhoisInfo : null],
                        Phone: [4, 2, val.WhoisPhone ? val.WhoisPhone : null],
                        RegInfo: [5, 2, val.WhoisRegInfo ? val.WhoisRegInfo : null]
                    };

                    rdz._.each(counts, function (value, name) {
                        if (value !== null) {
                            rdz.model.parameters.Factory.requestOneParameter({
                                model: {
                                    name: name,
                                    request: 'CountForWhois' + name,
                                    params: {SearchIn: value[0], SearchType: value[1], SearchString: value[2]},
                                    extra: {api: {active: true}}
                                },
                                url: arg.url,
                                receiver: 'callback',
                                callback: function () {

                                    portRequest.postMessage({
                                        method: 'message',
                                        request: 'API_WHOIS_ContentResponse',
                                        model: this.toJSON()
                                    });
                                }
                            });
                        }
                    });
                }

                portRequest.postMessage({
                    method: 'message',
                    request: 'API_WHOIS_ContentResponse',
                    model: this.toJSON()
                });
                //Get Whois history count
                rdz.model.parameters.Factory.requestOneParameter({
                    model: {name: 'HistoryCount', request: 'WhoisCount', extra: {api: {active: true}}},
                    url: arg.url,
                    receiver: 'callback',
                    callback: function () {

                        portRequest.postMessage({
                            method: 'message',
                            request: 'API_WHOIS_ContentResponse',
                            model: this.toJSON()
                        });
                    }
                });
            }
        });
    };
};

window.rdz.contextmenu.Age = function (contextmenu, arg) {
    window.rdz.contextmenu.SuperClass.call(this, arg.url);
    this.id = 'Age';
    this.data = [
        {
            type: 'Age_menu',
            name: 'preload',
            text: ''
        }
    ];
    this.dataReady = true;
    this.returnData(contextmenu);
    window.rdz.contextmenu.Whois.call(this, arg.url);
    this.getData(arg);
};

window.rdz.contextmenu.SubdomainsList = function (contextmenu, arg) {
    this.getData = function (arg) {
        var data = {};
        rdz.model.parameters.Factory.requestOneParameter({
            model: {name: 'Subdomains', request: 'Subdomains', extra: {api: {active: true}}},
            url: arg.url,
            receiver: 'callback',
            callback: function () {
                portRequest.postMessage({
                    method: 'message',
                    request: 'SUBDOMAINS_ContentResponse',
                    model: this.toJSON()
                });
            }
        });
    };
};

window.rdz.contextmenu.Subdomains = function (contextmenu, arg) {
    window.rdz.contextmenu.SuperClass.call(this, arg.url);
    this.id = 'Subdomains';
    this.data = [{
        type: 'Subdomains_menu',
        name: 'Subdomains',
        text: ''
    }
    ];

    if (arg.model.value > 0) {
        this.dataReady = true;
        this.returnData(contextmenu);
        window.rdz.contextmenu.SubdomainsList.call(this, arg.url);
        this.getData(arg);
    }
};

window.rdz.contextmenu.Webmoney = function (contextmenu, arg) {
    window.rdz.contextmenu.SuperClass.call(this, arg.url);
    this.id = 'Webmoney';

    var count = rdz.user.logged && arg.model.value &&
    arg.model.value.Webmoney > 0 ? arg.model.value.Webmoney : null;

    this.data = [
        {
            parameter: this.id,
            type: 'page',
            name: 'WMAdvisor',
            title: AppLocale.get('bar.contextmenu.Webmoney.WMAdvisor.ttl'),
            text: AppLocale.get('bar.contextmenu.Webmoney.WMAdvisor.name'),
            url: 'http://advisor.wmtransfer.com/sitedetails.aspx?url=' + encodeURIComponent(this.domain) + '&sort=dt',
            class: 'rds-cm-image rds-cm-webmoney-advisor'
        },
        {
            parameter: this.id,
            type: 'page',
            name: 'WMRDS',
            title: AppLocale.get('bar.contextmenu.Webmoney.WMRDS.ttl'),
            text: AppLocale.get('bar.contextmenu.Webmoney.WMRDS.name') + (count ? ' (' + count + ')' : ''),
            url: rdz.user.logged ? 'http://www.recipdonor.com/wm?Domain=' + encodeURIComponent(this.domain) : 'http://www.recipdonor.com/',
            class: 'rds-cm-image rds-cm-webmoney-rds ' + (rdz.user.logged ? 'rds-logged' : '')
        }
    ];

    this.dataReady = true;
    this.returnData(contextmenu);
};

window.rdz.contextmenu.CheckDangerous = function (contextmenu, arg) {
    window.rdz.contextmenu.SuperClass.call(this, arg.url);
    this.id = 'CheckDangerous';
    this.data = [];

    var value = arg.model.value;
    if (value && value.Dangerous && value.Dangerous !== 'None') {
        if (value.Dangerous.indexOf('Yandex') !== -1) {
            this.data.push({
                parameter: this.id,
                type: 'page',
                name: 'Yandex',
                title: AppLocale.get('bar.contextmenu.CheckDangerous.Yandex.ttl'),
                text: AppLocale.get('bar.contextmenu.CheckDangerous.Yandex.name'),
                url: 'http://yandex.ru/infected?url=http://' + encodeURIComponent(this.domain),
                class: 'rds-cm-image rds-cm-dangerous-yandex'
            });
        }
        if (value.Dangerous.indexOf('Google') !== -1) {
            this.data.push({
                parameter: this.id,
                type: 'page',
                name: 'Google',
                title: AppLocale.get('bar.contextmenu.CheckDangerous.Google.ttl'),
                text: AppLocale.get('bar.contextmenu.CheckDangerous.Google.name'),
                url: 'https://www.google.com/safebrowsing/diagnostic?site=' + encodeURIComponent(this.domain),
                class: 'rds-cm-image rds-cm-dangerous-google'
            });
        }
        if (value.Dangerous.indexOf('WebmoneyAdvisor') !== -1) {
            this.data.push({
                parameter: this.id,
                type: 'page',
                name: 'WebmoneyAdvisor',
                title: AppLocale.get('bar.contextmenu.CheckDangerous.WebmoneyAdvisor.ttl'),
                text: AppLocale.get('bar.contextmenu.CheckDangerous.WebmoneyAdvisor.name'),
                url: 'http://advisor.wmtransfer.com/SiteDetails.aspx?url=' + encodeURIComponent(this.domain),
                class: 'rds-cm-image rds-cm-dangerous-advisor'
            });
        }
        if (value.Dangerous.indexOf('VirusTotal') !== -1) {
            this.data.push({
                parameter: this.id,
                type: 'page',
                name: 'VirusTotal',
                title: AppLocale.get('bar.contextmenu.CheckDangerous.VirusTotal.ttl'),
                text: AppLocale.get('bar.contextmenu.CheckDangerous.VirusTotal.name'),
                url: 'https://www.virustotal.com/ru/url/submission/?force=1&url=http://' + encodeURIComponent(this.domain),
                class: 'rds-cm-image rds-cm-dangerous-virustotal'
            });
        }

        this.dataReady = true;
    }

    this.returnData(contextmenu);
};

window.rdz.contextmenu.UniqueContent = function (contextmenu, arg) {
    window.rdz.contextmenu.SuperClass.call(this, arg.url);
    this.id = 'UniqueContent';

    this.data = [{
        type: 'UniqueContent_menu',
        name: 'UniqueContent',
        text: ''
    }
    ];

    this.dataReady = true;
    this.returnData(contextmenu);

    var that = this;

    rdz.model.parameters.Factory.requestOneParameter({
        model: arg.model,
        url: arg.url,
        receiver: 'callback',
        callback: function () {
            var value = this.get('value'),
                m = this,
                sortedMatches;

            portRequest.postMessage({
                method: 'message',
                request: 'UNIQUE_CONTENT_ContentResponse',
                model: JSON.stringify(rdz.utils.addDataFromRequest(this.toJSON(), this.request))
            });

            function sortMatches(val) {
                var sorted = val.Matches.sort(function (a, b) {
                    return b.percent - a.percent;
                });

                return sorted;
            }

            that.data = [];

            if (value && value.Matches && value.Matches.length) {
                that.data.push({
                    type: 'UniqueContent_background',
                    name: 'Copy',
                    request: 'COPY_TEXT_ContentResponse',
                    title: AppLocale.get('bar.contextmenu.UniqueContent.Copy.ttl'),
                    text: AppLocale.get('bar.contextmenu.UniqueContent.Copy.name'),
                    class: 'rds-cm-image rds-cm-unique-content rds-logged'
                });

                sortedMatches = sortMatches(value);

                sortedMatches.forEach(function (e) {
                    that.data.push({
                        parameter: that.id,
                        type: 'UniqueContentItem',
                        name: e.url,
                        title: e.url,
                        html: '<div class="uc-cm-item">' +
                        '<div class="uc-cm-percent">' + Math.round(e.percent) + ' %' + '</div>' +
                        '<div class="uc-cm-url"><a href="' + e.url + '" target="_blank" >' + e.url + '</a></div>' +
                        '</div>',
                        text: Math.round(e.percent) + ' % ' + e.url,
                        url: e.url
                    });
                });
            }

            that.dataReady = true;
            that.returnData(contextmenu);
        }
    });
};

window.rdz.contextmenu.RSS = function (contextmenu, arg) {
    window.rdz.contextmenu.SuperClass.call(this, arg.url);
    this.id = 'RSS';
    this.data = [];

    var self = this,
        links = arg.model.value;

    if (links && links.length) {
        links.forEach(function (link) {
            self.data.push({
                parameter: self.id,
                type: 'page',
                name: 'RSSLink' + (Math.random()), // in order to avoid matches
                title: link.title,
                text: link.title,
                url: link.href,
                class: 'rds-cm-pl'
            });
        });
    }

    this.dataReady = true;
    this.returnData(contextmenu);
};

window.rdz.contextmenu.Services = function (contextmenu, arg) {
    window.rdz.contextmenu.SuperClass.call(this, arg.url);
    this.id = 'Services';

    this.data = [
        {
            type: 'page',
            name: 'WhoIs',
            title: AppLocale.get('bar.contextmenu.Services.WhoIs.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.WhoIs.name') + ' ' + this.domain,
            url: rdz.utils.urlForWhoIs(this.domain),
            class: 'rds-cm-image ' + rdz.utils.iconForWhoIs(this.domain)
        },
        {
            type: 'page',
            name: 'Domaintools',
            title: AppLocale.get('bar.contextmenu.Services.Domaintools.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.Domaintools.name') + ' ' + this.domain,
            url: 'http://whois.domaintools.com/' + this.domain + '/',
            class: 'rds-cm-image rds-cm-services-whois'
        },
        {
            type: 'page',
            name: 'NetworkTools',
            title: AppLocale.get('bar.contextmenu.Services.NetworkTools.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.NetworkTools.name'),
            url: 'http://network-tools.com/default.asp?prog=trace&host=' + this.domain + '/',
            class: 'rds-cm-image rds-cm-services-networktools'
        },
        // {
        //     type: 'page',
        //     name: 'Rassanov',
        //     title: AppLocale.get('bar.contextmenu.Services.Rassanov.ttl'),
        //     text: AppLocale.get('bar.contextmenu.Services.Rassanov.name'),
        //     url: 'http://rassanov.ru/web-tools/tracert-IP-domain.htm',
        //     class: 'rds-cm-image rds-cm-services-rassanov'
        // },
        {
            type: 'page',
            name: 'GTranslate',
            title: AppLocale.get('bar.contextmenu.Services.GTranslate.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.GTranslate.name'),
            url: 'https://translate.google.com/',
            class: 'rds-cm-image rds-cm-services-google'
        },
        {
            type: 'page',
            name: 'Be1',
            title: AppLocale.get('bar.contextmenu.Services.Be1.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.Be1.name'),
            url: 'https://be1.ru/stat/' + this.domain,
            class: 'rds-cm-image rds-cm-services-be1'
        },
        {
            type: 'page',
            name: 'PR_CY',
            title: AppLocale.get('bar.contextmenu.Services.PR_CY.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.PR_CY.name'),
            url: 'https://a.pr-cy.ru/' + this.domain + '/',
            class: 'rds-cm-image rds-cm-services-prcy'
        },
        {
            type: 'page',
            name: 'CY_PR',
            title: AppLocale.get('bar.contextmenu.Services.CY_PR.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.CY_PR.name'),
            url: 'https://www.cy-pr.com/a/' + this.domain,
            class: 'rds-cm-image rds-cm-services-cypr'
        },
        {
            type: 'page',
            name: 'Advego',
            title: AppLocale.get('bar.contextmenu.Services.Advego.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.Advego.name'),
            url: 'http://advego.ru/text/seo/',
            class: 'rds-cm-image rds-cm-services-advego'
        },
        {
            type: 'page',
            name: 'Promolab',
            title: AppLocale.get('bar.contextmenu.Services.Promolab.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.Promolab.name'),
            url: 'http://www.promolab.ru/free/',
            class: 'rds-cm-image rds-cm-services-promolab'
        },
        {
            type: 'page',
            name: 'RDS_CheckPage',
            title: AppLocale.get('bar.contextmenu.Services.RDS_CheckPage.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.RDS_CheckPage.name'),
            url: 'http://www.recipdonor.com/CheckPage?url=' + this.url,
            class: 'rds-cm-image rds-cm-services-rds'
        },
        {
            type: 'page',
            name: 'Megaindex_Positions',
            title: AppLocale.get('bar.contextmenu.Services.Megaindex_Positions.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.Megaindex_Positions.name'),
            url: 'http://www.megaindex.ru/index.php?tab=siteAnalyze&site=' + this.url,
            class: 'rds-cm-image rds-cm-services-megaindex'
        },
        {
            type: 'page',
            name: 'Webeffector',
            title: AppLocale.get('bar.contextmenu.Services.Webeffector.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.Webeffector.name'),
            url: 'http://client.webeffector.ru/compare.html',
            class: 'rds-cm-image rds-cm-services-webeffector'
        },
        {
            type: 'page',
            name: 'Megaindex_LinksIn',
            title: AppLocale.get('bar.contextmenu.Services.Megaindex_LinksIn.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.Megaindex_LinksIn.name'),
            url: 'http://www.megaindex.ru/index.php?tab=linkAnalyze\u0026do=linkIn&site=' + this.domain,
            class: 'rds-cm-image rds-cm-services-megaindex'
        },
        {
            type: 'page',
            name: 'LinkpadIn',
            title: AppLocale.get('bar.contextmenu.Services.LinkpadIn.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.LinkpadIn.name'),
            url: 'https://www.linkpad.ru/default.aspx?r=4&i=www.' + this.domain,
            class: 'rds-cm-image rds-cm-services-linkpad'
        },
        {
            type: 'page',
            name: 'LinkpadOut',
            title: AppLocale.get('bar.contextmenu.Services.LinkpadOut.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.LinkpadOut.name'),
            url: 'https://www.linkpad.ru/default.aspx?r=16&i=www.' + this.domain,
            class: 'rds-cm-image rds-cm-services-linkpad'
        },
        {
            type: 'page',
            name: 'Xtool',
            title: AppLocale.get('bar.contextmenu.Services.Xtool.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.Xtool.name'),
            url: 'https://xtool.ru/analyze/_' + this.domain + '/',
            class: 'rds-cm-image rds-cm-services-xtool'
        },
        {
            type: 'page',
            name: 'RDS_info',
            title: AppLocale.get('bar.contextmenu.Services.RDS_info.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.RDS_info.name'),
            url: 'http://www.recipdonor.com/info/',
            class: 'rds-cm-image rds-cm-services-rds'
        },
        {
            type: 'page',
            name: 'TYC',
            title: AppLocale.get('bar.contextmenu.Services.TYC.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.TYC.name'),
            url: 'https://webmaster.yandex.ru/siteinfo/?host=' + this.domain + '/',
            class: 'rds-cm-image rds-cm-services-tyc'
        },
        {
            type: 'page',
            name: 'CYcounter',
            title: AppLocale.get('bar.contextmenu.Services.CYcounter.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.CYcounter.name'),
            url: 'https://webmaster.yandex.ru/sqicounter?host=' + this.domain + '/',
            class: 'rds-cm-image rds-cm-services-cycounter'
        },
        // {
        //     type: 'page',
        //     name: 'YaBar',
        //     title: AppLocale.get('bar.contextmenu.Services.YaBar.ttl'),
        //     text: AppLocale.get('bar.contextmenu.Services.YaBar.name'),
        //     url: 'http://bar-navig.yandex.ru/u?ver=2&url=http://www.' + this.domain + '&show=1',
        //     class: 'rds-cm-image rds-cm-services-yabar'
        // },
        {
            type: 'page',
            name: 'IY',
            title: AppLocale.get('bar.contextmenu.Services.IY.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.IY.name'),
            url: 'http://www.yandex.ru/yandsearch?lr=213&text=url:www.' + this.domain + '* | url:' + this.domain + '*',
            class: 'rds-cm-image rds-cm-services-yandex'
        },
        {
            type: 'page',
            name: 'IYD',
            title: AppLocale.get('bar.contextmenu.Services.IYD.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.IYD.name'),
            url: 'http://www.yandex.ru/yandsearch?lr=213&how=tm&amp;text=url:www.' + this.domain + '* | url:' + this.domain,
            class: 'rds-cm-image rds-cm-services-yandex'
        },
        {
            type: 'page',
            name: 'IYP',
            title: AppLocale.get('bar.contextmenu.Services.IYP.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.IYP.name'),
            url: 'http://yandex.ru/yandsearch?lr=213&text=url%3D%22www.' + this.page + '%22|url%3D%22' + this.page + '%22',
            class: 'rds-cm-image rds-cm-services-yandex'
        },
        {
            type: 'page',
            name: 'IYDP',
            title: AppLocale.get('bar.contextmenu.Services.IYDP.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.IYDP.name'),
            url: 'http://www.yandex.ru/yandsearch?lr=213&how=tm&amp;text=url%3Awww.' + this.page + '%20%7C%20url%3A' + this.page + '%26how=tm',
            class: 'rds-cm-image rds-cm-services-yandex'
        },
        {
            type: 'page',
            name: 'BY',
            title: AppLocale.get('bar.contextmenu.Services.BY.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.BY.name'),
            url: 'http://yandex.ru/yandsearch?&text=("*.' + this.domain + '")&lr=213',
            class: 'rds-cm-image rds-cm-services-yandex'
        },
        {
            type: 'page',
            name: 'YaBlogs',
            title: AppLocale.get('bar.contextmenu.Services.YaBlogs.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.YaBlogs.name'),
            url: 'http://blogs.yandex.ru/search.xml?text=' + this.domain + '&ft=all',
            class: 'rds-cm-image rds-cm-services-yablogs'
        },
        {
            type: 'page',
            name: 'BYaBlogs',
            title: AppLocale.get('bar.contextmenu.Services.BYaBlogs.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.BYaBlogs.name'),
            url: 'http://blogs.yandex.ru/search.xml?text=link%3D%22' + this.domain + '*%22',
            class: 'rds-cm-image rds-cm-services-yablogs'
        },
        {
            type: 'page',
            name: 'PicturesYa',
            title: AppLocale.get('bar.contextmenu.Services.PicturesYa.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.PicturesYa.name'),
            url: 'http://images.yandex.ru/yandsearch?lr=213&site=' + this.domain,
            class: 'rds-cm-image rds-cm-services-picturesya'
        },
        {
            type: 'page',
            name: 'Curlie',
            title: AppLocale.get('bar.contextmenu.Services.DMOZ.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.DMOZ.name'),
            url: 'https://www.curlie.org/search/?q=' + this.domain,
            class: 'rds-cm-image rds-cm-services-dmoz'
        },
        {
            type: 'page',
            name: 'IG',
            title: AppLocale.get('bar.contextmenu.Services.IG.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.IG.name'),
            url: 'https://www.google.com/search?&q=site:' + this.domain,
            class: 'rds-cm-image rds-cm-services-google'
        },
        {
            type: 'page',
            name: 'IGP',
            title: AppLocale.get('bar.contextmenu.Services.IGP.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.IGP.name'),
            url: 'https://www.google.com.ua/search?q=info%3A' + this.page,
            class: 'rds-cm-image rds-cm-services-google'
        },
        {
            type: 'page',
            name: 'IGPCache',
            title: AppLocale.get('bar.contextmenu.Services.IGPCache.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.IGPCache.name'),
            url: 'https://google.com/search?q=cache:http://' + this.page,
            class: 'rds-cm-image rds-cm-services-google'
        },
        {
            type: 'page',
            name: 'PRg',
            title: AppLocale.get('bar.contextmenu.Services.PRg.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.PRg.name'),
            url: 'https://www.google.com/search?hl=ru&amp;q=info:' + this.page,
            class: 'rds-cm-image rds-cm-services-google'
        },
        {
            type: 'page',
            name: 'PicturesG',
            title: AppLocale.get('bar.contextmenu.Services.PicturesG.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.PicturesG.name'),
            url: 'http://images.google.com/images?hl=ru&source=hp&q=site%3A' + this.domain,
            class: 'rds-cm-image rds-cm-services-google'
        },
        {
            type: 'page',
            name: 'BackBing',
            title: AppLocale.get('bar.contextmenu.Services.BackBing.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.BackBing.name'),
            url: 'http://search.live.com/results.aspx?q=linkfromdomain%3A' + this.domain + '&form=QBRE',
            class: 'rds-cm-image rds-cm-services-bing'
        },
        {
            type: 'page',
            name: 'Alexa',
            title: AppLocale.get('bar.contextmenu.Services.Alexa.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.Alexa.name'),
            url: 'http://www.alexa.com/data/details/traffic_details/' + this.domain,
            class: 'rds-cm-image rds-cm-services-alexa'
        },
        {
            type: 'page',
            name: 'BackA',
            title: AppLocale.get('bar.contextmenu.Services.BackA.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.BackA.name'),
            url: 'http://www.alexa.com/site/linksin/' + this.domain,
            class: 'rds-cm-image rds-cm-services-alexa'
        },
        {
            type: 'page',
            name: 'YaDelurl',
            title: AppLocale.get('bar.contextmenu.Services.YaDelurl.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.YaDelurl.name'),
            url: 'http://webmaster.yandex.ru/delurl.xml',
            class: 'rds-cm-image rds-cm-services-yandex'
        },
        {
            type: 'page',
            name: 'YaAddurl',
            title: AppLocale.get('bar.contextmenu.Services.YaAddurl.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.YaAddurl.name'),
            url: 'http://webmaster.yandex.ru/addurl.xml',
            class: 'rds-cm-image rds-cm-services-yandex'
        },
        {
            type: 'page',
            name: 'GDelurl',
            title: AppLocale.get('bar.contextmenu.Services.GDelurl.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.GDelurl.name'),
            url: 'https://www.google.com/support/webmasters/bin/answer.py?hl=ru&answer=164734',
            class: 'rds-cm-image rds-cm-services-google'
        },
        {
            type: 'page',
            name: 'GAddurl',
            title: AppLocale.get('bar.contextmenu.Services.GAddurl.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.GAddurl.name'),
            url: 'https://www.google.ru/intl/ru/addurl.html',
            class: 'rds-cm-image rds-cm-services-google'
        },
        {
            type: 'page',
            name: 'BAddurl',
            title: AppLocale.get('bar.contextmenu.Services.BAddurl.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.BAddurl.name'),
            url: 'http://www.bing.com/webmaster/SubmitSitePage.aspx',
            class: 'rds-cm-image rds-cm-services-bing'
        },
        {
            type: 'page',
            name: 'YaWordstat',
            title: AppLocale.get('bar.contextmenu.Services.YaWordstat.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.YaWordstat.name'),
            url: 'http://wordstat.yandex.ru/',
            class: 'rds-cm-image rds-cm-services-yandex'
        },
        {
            type: 'page',
            name: 'GAdwords',
            title: AppLocale.get('bar.contextmenu.Services.GAdwords.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.GAdwords.name'),
            url: 'https://adwords.google.ru/o/Targeting/Explorer?__u=1000000000&amp;__c=1000000000&amp;stylePrefOverride=2#search.none!ideaType=KEYWORD&amp;requestType=IDEAS',
            class: 'rds-cm-image rds-cm-services-google'
        },
        {
            type: 'page',
            name: 'Anonymizer',
            title: AppLocale.get('bar.contextmenu.Services.Anonymizer.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.Anonymizer.name'),
            url: 'http://nntime.com/',
            class: 'rds-cm-image rds-cm-services-anonymizer'
        },
        {
            type: 'page',
            name: 'VirusTotal',
            title: AppLocale.get('bar.contextmenu.Services.VirusTotal.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.VirusTotal.name'),
            url: 'https://www.virustotal.com/gui/home/url',
            class: 'rds-cm-image rds-cm-services-virustotal'
        },
        {
            type: 'page',
            name: 'Validator',
            title: AppLocale.get('bar.contextmenu.Services.Validator.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.Validator.name'),
            url: 'https://validator.w3.org/nu/?doc=' + this.url,
            class: 'rds-cm-image rds-cm-services-validator'
        },
        {
            type: 'page',
            name: 'CSSValidator',
            title: AppLocale.get('bar.contextmenu.Services.CSSValidator.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.CSSValidator.name'),
            url: 'http://jigsaw.w3.org/css-validator/',
            class: 'rds-cm-image rds-cm-services-validator'
        },
        {
            type: 'page',
            name: 'HostTracker',
            title: AppLocale.get('bar.contextmenu.Services.HostTracker.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.HostTracker.name'),
            url: 'http://host-tracker.com/',
            class: 'rds-cm-image rds-cm-services-hosttracker'
        },
        {
            type: 'page',
            name: 'AlertSite',
            title: AppLocale.get('bar.contextmenu.Services.AlertSite.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.AlertSite.name'),
            url: 'http://www.alertsite.com/cgi-bin/tsite3.pl',
            class: 'rds-cm-image rds-cm-services-alertsite'
        },
        {
            type: 'page',
            name: 'Gpagespeed',
            title: AppLocale.get('bar.contextmenu.Services.Gpagespeed.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.Gpagespeed.name'),
            url: 'https://developers.google.com/speed/pagespeed/insights/?url=' + this.page + '&amp;mobile=false',
            class: 'rds-cm-image rds-cm-services-google'
        },
        {
            type: 'page',
            name: 'WA',
            title: AppLocale.get('bar.contextmenu.Services.WA.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.WA.name'),
            url: 'http://wayback.archive.org/web/*/http://' + this.domain,
            class: 'rds-cm-image rds-cm-services-wa'
        },
        {
            type: 'page',
            name: 'YaSpellcheck',
            title: AppLocale.get('bar.contextmenu.Services.YaSpellcheck.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.YaSpellcheck.name'),
            url: 'http://webmaster.yandex.ru/spellcheck.xml?checkurl=' + this.url,
            class: 'rds-cm-image rds-cm-services-yaspellcheck'
        },
        {
            type: 'page',
            name: 'Copyscape',
            title: AppLocale.get('bar.contextmenu.Services.Copyscape.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.Copyscape.name'),
            url: 'http://www.copyscape.com/',
            class: 'rds-cm-image rds-cm-services-copyscape'
        },
        {
            type: 'page',
            name: 'Tineye',
            title: AppLocale.get('bar.contextmenu.Services.Tineye.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.Tineye.name'),
            url: 'http://www.tineye.com/',
            class: 'rds-cm-image rds-cm-services-tineye'
        },
        {
            type: 'page',
            name: 'RDS_Synonymizer',
            title: AppLocale.get('bar.contextmenu.Services.RDS_Synonymizer.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.RDS_Synonymizer.name'),
            url: 'http://www.recipdonor.com/synonymizer',
            class: 'rds-cm-image rds-cm-services-rds'
        },
        {
            type: 'page',
            name: 'OtvetMailRu',
            title: AppLocale.get('bar.contextmenu.Services.OtvetMailRu.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.OtvetMailRu.name'),
            url: 'http://search.otvet.mail.ru/?q=' + this.domain,
            class: 'rds-cm-image rds-cm-services-otvetmailru'
        },
        {
            type: 'page',
            name: 'Semrush',
            title: AppLocale.get('bar.contextmenu.Services.Semrush.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.Semrush.name'),
            url: 'https://www.semrush.com/info/' + this.domain,
            class: 'rds-cm-image rds-cm-services-semrush'
        },
        {
            type: 'page',
            name: 'Robots',
            title: AppLocale.get('bar.contextmenu.Services.Robots.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.Robots.name'),
            url: 'http://webmaster.yandex.ru/robots.xml?hostname=http://' + this.domain + '/',
            class: 'rds-cm-image rds-cm-services-robots'
        },
        {
            type: 'page',
            name: 'New_service',
            title: AppLocale.get('bar.contextmenu.Services.New_service.ttl'),
            text: AppLocale.get('bar.contextmenu.Services.New_service.name'),
            url: 'http://www.recipdonor.com/BarFeedBack',
            class: 'rds-cm-services-newservice'
        }

    ];

//    for (var i = 0; i < 50; i++) {
//	this.data.push({
//            type: 'page',
//            name: 'TYC' + i,
//            title: AppLocale.get('bar.contextmenu.Services.TYC.ttl'),
//            text: AppLocale.get('bar.contextmenu.Services.TYC.name'),
//            url: 'http://yaca.yandex.ru/yca/cy/ch/' + this.domain + '/',
//            class: 'rds-cm-image rds-cm-services-tyc'
//        });
//    }

    this.dataReady = true;
    this.returnData(contextmenu);
};

window.rdz.contextmenu.StatHistory = function (contextmenu, arg) {
    window.rdz.contextmenu.SuperClass.call(this, arg.url);
    this.id = 'StatHistory';

    this.data = [{
        parameter: this.id,
        type: 'History_menu',
        name: 'History',
        text: ''
    }
    ];

    this.dataReady = true;
    this.returnData(contextmenu);

    var that = this;

    rdz.model.parameters.Factory.requestOneParameter({
        receiving_history: true,
        model: arg.model,
        url: arg.url,
        receiver: 'callback',
        callback: function () {
            var value = this.get('value');

            if (rdz._.isArray(value) && value.length > 1) {
                portRequest.postMessage({
                    method: 'message',
                    request: 'PARAMETER_ContentResponse',
                    model: JSON.stringify(this.toJSON()),
                    caller: arg.caller || null
                });

                this.set('name', 'History'); // cheating
                this.set('parameter', 'StatHistory');
                this.set('price', {StatHistory: rdz.cache.get(['API', 'Prices', 'StatHistory'])});
                portRequest.postMessage({
                    method: 'message',
                    request: 'STAT_HISTORY_ContentResponse',
                    model: this.toJSON(),
                    caller: arg.caller || null
                });
            }
        }
    });
};

window.rdz.contextmenu.Sitemap = function (contextmenu, arg) {
    window.rdz.contextmenu.SuperClass.call(this, arg.url);
    this.id = 'Sitemap';
    this.data = [];

    var v = arg.model.value,
        that = this,
        domain = rdz.utils.domainFromUri(arg.url).domain,
        pairs;

    // root sitemap
    if (v && v['Sitemap'] && v['Sitemap'].value) {
        that.data.push({
            parameter: that.id,
            type: 'SitemapItem',
            name: arg.url,
            title: arg.url,
            value: ['http://www.' + domain + '/sitemap.xml', v['Sitemap'].date],
            url: arg.url
        });
        this.dataReady = true;
    }
    if (v && !rdz._.isEmpty(v['CurrSitemap'])) {
        pairs = rdz._.pairs(v['CurrSitemap']);
        pairs.forEach(function (e) {
            that.data.push({
                parameter: that.id,
                type: 'SitemapItem',
                name: e[0],
                title: e[0],
                value: e,
                url: e[0]
            });
        });
        this.dataReady = true;
    }

    this.returnData(contextmenu);
};