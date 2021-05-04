/** @namespace here is a default objects-options for model's data*/
window.rdz.setting = {};

/** @namespace extension settings (also default). */
window.rdz.setting.options = {};

/** @description settings for Bar (content script)*/
window.rdz.setting.options.Bar = {
    active: true,
    top: 0,
    left: 0,
    italic: false,
    filter_domain: '*.google.com\n' + '*.google.ru\n' + '*.google.com.ua\n' + '*.ya.ru\n' + '*.yandex.ru\n' + '*.yandex.ua\n' + '*.yandex.by\n' + '*.yahoo.com\n' +
    '*.bing.com\n' + '*.vk.com\n' + '*.vkontakte.ru\n' + '*.odnoklassniki.ru\n' + '*.facebook.com',
    check_by_button: true,
    locale: rdz.utils.locale.get_browser_locale(),
    highlight_pages: true
};


/** @description add in array prameter's name and request.
 *
 *  @property {String} request: 'IY' - single request
 *  @property {Array} request: ['IG', 'MIG'] - multiple independent requests
 *  @property {Object} request: ['IG', 'MIG'] - multiple dependent requests (one by one), behaviour after each response handle in window.rdz.model[name]
 */
window.rdz.setting.params =
    [
        {
            name: 'IY',
            request: 'IY'
        },
        {
            name: 'IYD',
            request: 'IYD'
        },
        {
            name: 'IYP',
            request: {IYP: ['IYPCache']}
        },
        {
            name: 'IYDP',
            request: 'IYDP'
        },
        {
            name: 'IG',
            request: 'IG'
            //request: ['IG', 'MIG']
        },
        {
            name: 'IGP',
            request: {IGP: ['IGPCache']}
        },
        {
            name: 'SQI',
            request: 'SQI'
        },
        // {
        //     name: 'TYC',
        //     request: {TYC: ['YaBar']}
        // },
        // {
        //     name: 'YaBar',
        //     request: 'YaBar'
        // },
        // {
        //     name: 'YaCatalog',
        //     request: 'YaCatalog'
        // },
        //{
        //    name: 'PR',
        //    request: {PR: ['PRMain']}
        //},
        {
            name: 'Dmoz',
            request: 'Dmoz'
        },
        {
            name: 'WA',
            request: 'WA'
        },
        {
            name: 'MozRank',
            request: {MozRank: ['MozRankCache']}
        },
        {
            name: 'SeoM',
            request: 'SeoM'
        },
        {
            name: 'Age',
            request: 'Age'
        },
        // {
        //     name: 'YT',
        //     request: 'YT'
        // },
        // {
        //     name: 'YR',
        //     request: 'YR'
        // },
        {
            name: 'Subdomains',
            request: 'SubdomainsCount'
        },
        // {
        //     name: 'BackG',
        //     request: 'BackG'
        // },
        {
            name: 'BackBing',
            request: 'BackBing'
        },
        {
            name: 'IBing',
            request: 'IBing'
        },
        {
            name: 'BI',
            request: 'BI'
        },
        {
            name: 'Alexa',
            request: 'Alexa'
        },
        {
            name: 'BackA',
            request: 'BackA'
        },
        {
            name: 'BY',
            request: 'BY'
        },
        //{ //RYB in ff
        //    name:'YaBlogs',
        //    request:'YaBlogs'
        //},
        //{
        //    name: 'Majestic',
        //    request: 'Majestic'
        //},
        //{
        //    name: 'TF',
        //    request: {Majestic: ['TF']}
        //},
        //{
        //    name: 'CF',
        //    request: {Majestic: ['CF']}
        //},
        //{
        //    name:'Ahrefs',
        //    request: {'AhrefsAJAXKey': ['Ahrefs', 'AhrefsGraph']}
        //},
        {
            name: 'AhrefsTB',
            request: 'AhrefsTB'
        },
        // {
        //     name: 'AhrefsPage',
        //     request: {'AhrefsCookies': ['AhrefsPage']}
        // },
        // {
        //     name: 'AhrefsDomain',
        //     request: {'AhrefsCookies': ['AhrefsDomain']}
        // },
        {
            name: 'SemRush',
            request: 'SemRush'
        },
        {
            name: 'Pictures',
            request: []
        },
        {
            name: 'Aggregators',
            request: []
        },
        {
            name: 'ISolomono',
            request: 'Solomono'
        },
        {
            name: 'Solomono',
            request: 'Solomono'
        },
        {
            name: 'SimilarWeb',
            request: 'SimilarWeb'
        },
        {
            name: 'Webmoney',
            request: {'Webmoney': ['WMAdvisor']}
        },
        {
            name: 'IP',
            request: []
        },
        {
            name: 'IPSitesCount',
            request: []
        },
        {
            name: 'Host',
            request: []
        },
        {
            name: 'Provider',
            request: []
        },
        {
            name: 'Geo',
            request: []
        },
        {
            name: 'CMS',
            request: []
        },
        // {
        //     name: 'UniqueContent',
        //     request: 'UniqueContent'
        // },
        {
            name: 'LIO',
            request: 'LIO'
        },
        {
            name: 'SocialNetworks',
            request: []
        },
        // {
        //     name: 'Prodvigator',
        //     request: []
        // },
        {
            name: 'SpyWords',
            request: 'SpyWords'
        },
        {
            name: 'StatHistory',
            request: 'StatHistory'
        },
        {
            name: 'Counters',
            request: []
        },
        {
            name: 'APICounters',
            request: []
        },
        {
            name: 'CheckDangerous',
            request: 'CheckDangerous'
        },
        {
            name: 'Seo',
            request: 'Seo'
        },
        {
            name: 'LinksBuy',
            request: 'LinksBuy'
        },
        {
            name: 'Validation',
            request: 'Validation'
        },
        {
            name: 'RSS',
            request: []
        },
        {
            name: 'Robots',
            request: 'Robots'
        },
        {
            name: 'Nesting',
            request: []
        },
        {
            name: 'Sitemap',
            request: {'Sitemap': {'SitemapRobots': []}}
        }

    ];


/** @description settings for parameters
 *
 * @property {String} name
 * @property {Boolean} active define default state (on/off)
 * @property {Object} extra define additional property
 * @property {Boolean} extra.api.active on/off api
 * @property {String/Array} extra.api.request define which requests in parameter is replaced by api
 *
 * */
window.rdz.setting.options.Parameters = function () {
    var locale = AppLocale.get_locale_str();
    return [
        {
            name: 'IY',
            active: true,
            extra: {
                api: {active: false}
            }
        },
        {
            name: 'IYD',
            active: false
        },
        {
            name: 'IYP',
            active: true,
            extra: {
                api: {
                    active: false,
                    request: 'IYP'
                }
            }
        },
        {
            name: 'IYDP',
            active: false,
            extra: {
                api: {
                    active: false,
                    request: 'IYDP'
                }
            }
        },
        {
            name: 'IG',
            active: locale !== "ru",
            extra: {
                api: {
                    active: false,
                    request: 'IG'
                },
                domain_zone: {
                    active: '.com'
                }
            }
        },
        {
            name: 'IGP',
            active: locale !== "ru",
            extra: {
                api: {
                    active: false,
                    request: 'IGP',
                    extra: {indexation_date: false}
                }
            }
        },
        {
            name: 'SQI',
            active: true
        },
        /*{
            name: 'TYC',
            active: true,
            extra: {
                YaBar: {
                    active: true
                }
            }
        },*/
        // {
        //     name: 'YaBar',
        //     active: true
        // },
        //{
        //    name: 'PR',
        //    active: false,
        //
        //    extra: {
        //        PRMain: {
        //            active: true
        //        },
        //        PRg: {
        //            active: false
        //        },
        //        api: {
        //            active: false,
        //            request: ['PRg', 'PRgMain']
        //        }
        //    }
        //},
        {
            name: 'Dmoz',
            active: true
        },
        {
            name: 'WA',
            active: true
        },
        //{
        //    name: 'MozRank',
        //    active: locale !== "ru"
        //},
        {
            name: 'SeoM',
            active: locale !== "ru"
        },
        {
            name: 'Age',
            active: false,
            extra: {
                //hidden:true,
                api: {active: true},
                no_cogwheel: true
            }
        },
        // {
        //     name: 'YT',
        //     active: false
        // },
        // {
        //     name: 'YR',
        //     active: false
        // },
        {
            name: 'Subdomains',
            active: false,
            extra: {
                hidden: true,
                api: {active: true}
            }
        },
        // {
        //     name: 'BackG',
        //     active: false,
        //     extra: {
        //         api: {active: false}
        //     }
        // },
        {
            name: 'BackBing',
            active: false
        },
        {
            name: 'IBing',
            active: false
        },
        {
            name: 'BI',
            active: false
        },

        {
            name: 'Alexa',
            active: locale !== "ru",
            extra: {
                RegionalRank: {
                    active: true
                }
            }
        },
        {
            name: 'BackA',
            active: false
        },
        {
            name: 'BY',
            active: false,
            extra: {
                api: {active: false}
            }
        },
        //{
        //    name:'YaBlogs',
        //    active:false
        //},

        //{
        //    name: 'Majestic',
        //    active: locale !== "ru"
        //},
        //{
        //    name: 'TF',
        //    active: locale !== "ru"
        //},
        //{
        //    name: 'CF',
        //    active: locale !== "ru"
        //},
        //{
        //    name:'Ahrefs',
        //    active:false
        //},
        {
            name: 'AhrefsTB',
            active: false,
            extra: {
                Page: {active: false},
                Domain: {active: false}
            }
        },
        // {
        //     name: 'AhrefsPage',
        //     active: false
        // },
        // {
        //     name: 'AhrefsDomain',
        //     active: false
        // },
        {
            name: 'SemRush',
            active: locale !== "ru",
            extra: {
                semrush_zone: {
                    active: 'com'
                }
            }
        },
        {
            name: 'Pictures',
            active: false
        },
        {
            name: 'Aggregators',
            active: false
        },
        {
            name: 'ISolomono',
            active: true
        },
        {
            name: 'Solomono',
            active: true
        },
        {
            name: 'SimilarWeb',
            active: false,
            extra: {
                Visits: {active: false},
                TimeOnSite: {active: false},
                PagePerVisit: {active: false},
                BounceRate: {active: false},
                CountryShares: {active: false},
                Sources: {active: false}
                // Referrals: {active: false},
                // OrganicKeywords: {active: false}
            }
        },
        {
            name: 'Webmoney',
            active: false,
            extra: {
                hidden: true,
                api: {active: true}
            }
        },
        {
            name: 'IP',
            active: true,
            popup: true
        },
        {
            name: 'IPSitesCount',
            active: true,
            popup: true
        },
        {
            name: 'Geo',
            active: true,
            extra: {
                api: {active: true}
            },
            popup: true
        },
        {
            name: 'Host',
            active: true,
            extra: {
                api: {active: true}
            },
            popup: true
        },
        {
            name: 'Provider',
            active: true,
            extra: {
                api: {active: true}
            },
            popup: true
        },
        {
            name: 'CMS',
            active: true,
            popup: true
        },
        // {
        //     name: 'UniqueContent',
        //     active: true,
        //     extra: {
        //         api: {active: true},
        //         //no_cogwheel: true,
        //         exceptions: {
        //             active: true,
        //             value: '*.google.com\n' + '*.google.ru\n' + '*.yandex.ru\n' + '*.yandex.ua\n' + '*.sape.ru\n' + '*.recipdonor.com\n' + '*.google.com.ua\n' + '*.xap.ru\n' +
        //             '*.liex.ru\n' + '*.seozavr.ru\n' + '*.yahoo.com\n' + '*.bing.com\n' + '*.searchengines.ru\n' + '*.vk.com\n' + '*.vkontakte.ru\n' + '*.odnoklassniki.ru\n' + '*.mail.ru\n' +
        //             '*.rambler.ru\n' + '*.youtube.com\n' + '*.linkfeed.ru\n' + '*.trustlink.ru\n' + '*.seopult.ru\n' + '*.rookee.ru\n' + '*.yandex.by\n' + '*.mainlink.ru\n' +
        //             '*.setlinks.ru\n' + '*.trustlink.ru\n' + '*.propage.ru\n' + '*.miralinks.ru\n' + '*.gogetlinks.ru\n' + '*.blogun.ru\n' + '*.facebook.com\n' + '*.wmtransfer.com\n' +
        //             '*.webmoney.ru'
        //         },
        //         pause: false
        //     }
        // },
        {
            name: 'LIO',
            active: true,
            extra: {
                title: {active: true},
                noindex: {active: true},
                rel_nofollow: {active: true},
                subdomains: {active: true},
                exceptions: {
                    active: true,
                    value: '*.google.com\n' + '*.google.ru\n' + '*.yandex.ru\n' + '*.yandex.ua\n' + '*.sape.ru\n' + '*.recipdonor.com\n' + '*.google.com.ua\n' + '*.xap.ru\n' +
                    '*.liex.ru\n' + '*.seozavr.ru\n' + '*.yahoo.com\n' + '*.bing.com\n' + '*.searchengines.ru\n' + '*.vk.com\n' + '*.vkontakte.ru\n' + '*.odnoklassniki.ru\n' + '*.mail.ru\n' +
                    '*.rambler.ru\n' + '*.youtube.com\n' + '*.linkfeed.ru\n' + '*.trustlink.ru\n' + '*.seopult.ru\n' + '*.rookee.ru\n' + '*.yandex.by\n' + '*.mainlink.ru\n' +
                    '*.setlinks.ru\n' + '*.trustlink.ru\n' + '*.propage.ru\n' + '*.miralinks.ru\n' + '*.gogetlinks.ru\n' + '*.blogun.ru\n' + '*.facebook.com\n' + '*.wmtransfer.com\n' +
                    '*.webmoney.ru'
                }
            }
        },
        {
            name: 'SocialNetworks',
            active: false,
            extra: {
                //GooglePlus: {active: true},
                //Twitter: {active: true},
                Facebook: {active: true},
                VK: {active: true}
            }
        },
        {
            name: 'IG',
            active: true,
            extra: {
                api: {
                    active: false,
                    request: 'IG'
                },
                domain_zone: {
                    active: '.com'
                }
            }
        },
        // {
        //     name: 'Prodvigator',
        //     active: true,
        //     extra: {
        //         prodvigator_yandex: {
        //             active: true
        //         },
        //         prodvigator_google: {
        //             active: true
        //         },
        //         prodvigator_google_source: {
        //             active: 'google_ru'
        //         },
        //         daily_traffic: {
        //             active: false
        //         }
        //     }
        // },
        {
            name: 'SpyWords',
            active: true,
            extra: {
                daily_traffic: {
                    active: false
                }
            }
        },
        {
            name: 'Counters',
            active: true
        },
        {
            name: 'StatHistory',
            active: true,
            extra: {
                api: {active: true},
                check_always: {
                    active: true
                }
            }
        },
        {
            name: 'CheckDangerous',
            active: false,
            extra: {
                api: {active: true},
                no_cogwheel: true
            }
        },
        {
            name: 'Seo',
            active: true,
            extra: {
                api: {active: true},
                Sape: {active: true},
                Trustlink: {active: true},
                Liex: {active: true},
                Mainlink: {active: true},
                Linkfeed: {active: true},
                Setlinks: {active: true},
                Xap: {active: true},
                Propage: {active: true},
                Seozavr: {active: true},
                SapeArticles: {active: true},
                SapePr: {active: true},
                Miralinks: {active: true},
                Gogetlinks: {active: true},
                Blogun: {active: true},
                RotaPost: {active: true},
                Rds: {active: true}
            }
        },
        {
            name: 'LinksBuy',
            active: true,
            extra: {
                api: {active: true},
                no_cogwheel: true
            }

        },
        {
            name: 'Validation',
            active: false
        },
        {
            name: 'RSS',
            active: true
        },
        {
            name: 'Robots',
            active: locale !== "ru"
        },
        {
            name: 'Nesting',
            active: false
        },
        {
            name: 'Sitemap',
            active: false
        },
        {
            name: 'DisableAd',
            active: false,
            extra: {
                api: {active: true},
                no_cogwheel: true
            },
            isFunction: true
        },
        {
            name: 'SiteAnalysis',
            active: false,
            extra: {
                title: {active: true},
                Seo: {active: true},
                Host: {active: true},
                Provider: {active: true},
                Geo: {active: true},
                CheckDangerous: {active: true},
                Age: {active: true},
                api: {active: true}
            },
            SA: true
        },
        {
            name: 'Updates',
            active: true,
            isFunction: true
        },
        {
            name: 'SEOTags',
            active: true,
            extra: {
                title: {active: true},
                _title: {active: true},
                description: {active: true},
                keywords: {active: true},
                h1: {active: true},
                h2_h4: {active: false},
                canonical: {active: true},
                metaRobots: {active: true},
                exceptions: {
                    active: true,
                    value: '*.google.com\n' + '*.google.ru\n' + '*.yandex.ru\n' + '*.yandex.ua\n' + '*.sape.ru\n' + '*.recipdonor.com\n' + '*.google.com.ua\n' + '*.xap.ru\n' +
                    '*.liex.ru\n' + '*.seozavr.ru\n' + '*.yahoo.com\n' + '*.bing.com\n' + '*.searchengines.ru\n' + '*.vk.com\n' + '*.vkontakte.ru\n' + '*.odnoklassniki.ru\n' + '*.mail.ru\n' +
                    '*.rambler.ru\n' + '*.youtube.com\n' + '*.linkfeed.ru\n' + '*.trustlink.ru\n' + '*.seopult.ru\n' + '*.rookee.ru\n' + '*.yandex.by\n' + '*.mainlink.ru\n' +
                    '*.setlinks.ru\n' + '*.trustlink.ru\n' + '*.propage.ru\n' + '*.miralinks.ru\n' + '*.gogetlinks.ru\n' + '*.blogun.ru\n' + '*.facebook.com\n' + '*.wmtransfer.com\n' +
                    '*.webmoney.ru'
                }
            },
            isFunction: true,
            checked: true
        },
        {
            name: 'EditMode',
            active: false,
            isFunction: true
        },
        {
            name: 'MainPage',
            active: true,
            isFunction: true
        },
        {
            name: 'ViewSource',
            active: true,
            isFunction: true
        },
        {
            name: 'DB',
            active: true,
            isFunction: true
        },
        // {
        //     name: 'MassChecking',
        //     active: false,
        //     isFunction: true
        // },
        {
            name: 'DisableHighlighting',
            active: true,
            isFunction: true
        },
        {
            name: 'Options',
            active: true,
            isFunction: true
        },
        {
            name: 'Trash',
            active: true,
            isFunction: true
        },
        {
            name: 'Services',
            active: true,
            isFunction: true
        }
    ];
};

/** @description settings for the Yandex integration (content script)*/
window.rdz.setting.options.Yandex = {
    active: false,
    urls_to_check: 10,
    italic: true,
    notified: false,
    functions: {
        Enable: {
            active: true
        },
        RecipientsPositions: {
            active: true
        },
        /*Competition: {
            active: false
        },*/
        SiteAnalysis: {
            active: true,
            extra: {
                title: {active: true},
                Seo: {active: true},
                Host: {active: true},
                Provider: {active: true},
                Geo: {active: true},
                CheckDangerous: {active: true},
                Age: {active: true},
                api: {active: true}
            },
            SA: true
        },
        Updates: {
            active: true
        },
        FullURL: {
            active: false
        },
        // MaxResultsCount: {
        //     active: true
        // },
        Paging: {
            active: true
        },
        DisableAdv: {
            active: false
        },
        CopyResults: {
            active: true,
            extra: {
                res_ttl: {active: true},
                res_desc: {active: true},
                res_url: {active: true}
            },
            no_checkbox: true
        }
    }
};

/** @description settings for the Yandex integration parameters
 *
 * @property {String} name
 * @property {Boolean} active define default state (on/off)
 * @property {Object} extra define additional property
 * @property {Boolean} extra.api.active on/off api
 * @property {String/Array} extra.api.request define which requests in parameter is replaced by api
 *
 * */
window.rdz.setting.options.YaParameters = function () {
    var locale = AppLocale.get_locale_str();
    return [
        {
            name: 'IY',
            active: false,
            extra: {
                api: {active: false}
            }
        },
        //{
        //    name:'IYD',
        //    active:false
        //},
        //{
        //    name:'IYP',
        //    active:true,
        //    extra:{
        //        api:{
        //            active: false,
        //            request: 'IYP'
        //        }
        //    }
        //},
        {
            name: 'IYDP',
            active: false,
            extra: {
                api: {
                    active: false,
                    request: 'IYDP'
                }
            }
        },
        {
            name: 'IG',
            active: locale !== "ru",
            extra: {
                api: {
                    active: false,
                    request: 'IG'
                },
                domain_zone: {
                    active: '.com'
                }
            }
        },
        {
            name: 'IGP',
            active: locale !== "ru",
            extra: {
                api: {
                    active: false,
                    request: 'IGP',
                    extra: {indexation_date: false}
                }
            }
        },
        {
            name: 'SQI',
            active: true
        },
        /*{
            name: 'TYC',
            active: true
        },
        {
            name: 'YaCatalog',
            active: true
        },*/
        // {
        //     name: 'YaBar',
        //     active: true
        // },
        //{
        //    name: 'PR',
        //    active: true,
        //
        //    extra: {
        //        PRMain: {
        //            active: true
        //        },
        //        PRg: {
        //            active: false
        //        },
        //        api: {
        //            active: false,
        //            request: ['PRg', 'PRgMain']
        //        }
        //    }
        //},
        {
            name: 'Dmoz',
            active: true
        },
        {
            name: 'WA',
            active: true
        },
        //{
        //    name: 'MozRank',
        //    active: locale !== "ru"
        //},
        {
            name: 'SeoM',
            active: false
        },
        {
            name: 'Age',
            active: false,
            extra: {
                api: {active: true},
                no_cogwheel: true
            }
        },
        // {
        //     name: 'YT',
        //     active: false
        // },
        // {
        //     name: 'YR',
        //     active: false
        // },
        //{
        //    name:'BackG',
        //    active:false,
        //    extra:{
        //        api:{active:false}
        //    }
        //},
        //{
        //    name:'BackBing',
        //    active:false
        //},
        //{
        //    name:'IBing',
        //    active:false
        //},
        //{
        //    name:'BI',
        //    active:false
        //},
        //
        {
            name: 'Alexa',
            active: locale !== "ru",
            extra: {
                RegionalRank: {
                    active: true
                }
            }
        },
        //{
        //    name:'BackA',
        //    active:false
        //},
        //{
        //    name:'BY',
        //    active:false,
        //    extra:{
        //        api:{active:false}
        //    }
        //},
        //{
        //    name:'YaBlogs',
        //    active:false
        //},
        //
        //{
        //    name:'Majestic',
        //    active: locale !== "ru"
        //},
        //{
        //    name:'TF',
        //    active:false
        //},
        //{
        //    name:'CF',
        //    active:false
        //},
        //{
        //    name:'Ahrefs',
        //    active:false
        //},
        //{
        //    name:'SemRush',
        //    active:locale !== "ru"
        //},
        {
            name: 'AhrefsTB',
            active: false,
            extra: {
                Page: {active: false},
                Domain: {active: false}
            }
        },
        // {
        //     name: 'AhrefsPage',
        //     active: false
        // },
        // {
        //     name: 'AhrefsDomain',
        //     active: false
        // },
        {
            name: 'Pictures',
            active: false
        },
        {
            name: 'Aggregators',
            active: false
        },
        {
            name: 'SocialNetworks',
            active: true,
            extra: {
                //GooglePlus: {active: true},
                Facebook: {active: true},
                //Twitter: {active: true},
                VK: {active: true}
            }
        },
        {
            name: 'ISolomono',
            active: true
        },
        {
            name: 'Solomono',
            active: true
        },
        {
            name: 'APICounters',
            active: true,
            extra: {
                api: {active: true},
                no_cogwheel: true
            }
        },
        {
            name: 'StatHistory',
            active: true,
            extra: {
                api: {active: true},
                no_cogwheel: true
            }
        },
        {
            name: 'Seo',
            active: true,
            extra: {
                api: {active: true},
                Sape: {active: true},
                Trustlink: {active: true},
                Liex: {active: true},
                Mainlink: {active: true},
                Linkfeed: {active: true},
                Setlinks: {active: true},
                Xap: {active: true},
                Propage: {active: true},
                Seozavr: {active: true},
                SapeArticles: {active: true},
                SapePr: {active: true},
                Miralinks: {active: true},
                Gogetlinks: {active: true},
                Blogun: {active: true},
                RotaPost: {active: true},
                Rds: {active: true},
            }
        },
        {
            name: 'LinksBuy',
            active: true,
            extra: {
                api: {active: true},
                no_cogwheel: true
            }

        },
        {
            name: 'Nesting',
            active: false
        },
        {
            name: 'IP',
            active: true
        },
        {
            name: 'IPSitesCount',
            active: true
        },
        {
            name: 'Geo',
            active: true,
            extra: {
                api: {active: true},
                no_cogwheel: true
            }
        },
        {
            name: 'Host',
            active: true,
            extra: {
                api: {active: true},
                no_cogwheel: true
            }
        },
        {
            name: 'Provider',
            active: true,
            extra: {
                api: {active: true},
                no_cogwheel: true
            }
        },
        {
            name: 'CMS',
            active: true
        },
        {
            name: 'Validation',
            active: false
        }
        //{
        //    name:'Robots',
        //    active:locale !== "ru"
        //},
        //{
        //    name:'Sitemap',
        //    active:false
        //}
    ];
};

/** @description settings for the Google integration (content script)*/
window.rdz.setting.options.Google = {
    active: false,
    urls_to_check: 10,
    italic: true,
    notified: false,
    functions: {
        Enable: {
            active: true
        },
        RecipientsPositions: {
            active: true
        },
        /*Competition: {
            active: false
        },*/
        SiteAnalysis: {
            active: true,
            extra: {
                title: {active: true},
                Seo: {active: true},
                Host: {active: true},
                Provider: {active: true},
                Geo: {active: true},
                CheckDangerous: {active: true},
                Age: {active: true},
                api: {active: true}
            },
            SA: true
        },
        Updates: {
            active: true
        },
        FullURL: {
            active: false
        },
        DisableAdv: {
            active: false
        },
        CopyResults: {
            active: true,
            extra: {
                res_ttl: {active: true},
                res_desc: {active: true},
                res_url: {active: true}
            },
            no_checkbox: true
        }
    }
};

/** @description settings for the Google integration parameters
 *
 * @property {String} name
 * @property {Boolean} active define default state (on/off)
 * @property {Object} extra define additional property
 * @property {Boolean} extra.api.active on/off api
 * @property {String/Array} extra.api.request define which requests in parameter is replaced by api
 *
 * */
window.rdz.setting.options.GoParameters = function () {
    var locale = AppLocale.get_locale_str();
    return [
        {
            name: 'IY',
            active: false,
            extra: {
                api: {active: false}
            }
        },
        //{
        //    name:'IYD',
        //    active:false
        //},
        {
            name: 'IYP',
            active: false,
            extra: {
                api: {
                    active: false,
                    request: 'IYP'
                }
            }
        },
        {
            name: 'IYDP',
            active: false,
            extra: {
                api: {
                    active: false,
                    request: 'IYDP'
                }
            }
        },
        {
            name: 'IG',
            active: locale !== "ru",
            extra: {
                api: {
                    active: false,
                    request: 'IG'
                },
                domain_zone: {
                    active: '.com'
                }
            }
        },
        //{
        //    name:'IGP',
        //    active: locale !== "ru",
        //    extra:{
        //        api:{
        //            active: false,
        //            request: 'IGP',
        //            extra: {indexation_date: false}
        //        }
        //    }
        //},
        {
            name: 'SQI',
            active: true
        },
        /*{
            name: 'TYC',
            active: true
        },
        {
            name: 'YaCatalog',
            active: true
        },*/
        // {
        //     name: 'YaBar',
        //     active: true
        // },
        //{
        //    name: 'PR',
        //    active: true,
        //
        //    extra: {
        //        PRMain: {
        //            active: true
        //        },
        //        PRg: {
        //            active: false
        //        },
        //        api: {
        //            active: false,
        //            request: ['PRg', 'PRgMain']
        //        }
        //    }
        //},
        {
            name: 'Dmoz',
            active: true
        },
        {
            name: 'WA',
            active: true
        },
        //{
        //    name: 'MozRank',
        //    active: locale !== "ru"
        //},
        {
            name: 'SeoM',
            active: false
        },
        {
            name: 'Age',
            active: false,
            extra: {
                api: {active: true},
                no_cogwheel: true
            }
        },
        // {
        //     name: 'YT',
        //     active: false
        // },
        // {
        //     name: 'YR',
        //     active: false
        // },
        //{
        //    name:'BackG',
        //    active:false,
        //    extra:{
        //        api:{active:false}
        //    }
        //},
        //{
        //    name:'BackBing',
        //    active:false
        //},
        //{
        //    name:'IBing',
        //    active:false
        //},
        //{
        //    name:'BI',
        //    active:false
        //},
        //
        {
            name: 'Alexa',
            active: locale !== "ru",
            extra: {
                RegionalRank: {
                    active: true
                }
            }
        },
        //{
        //    name:'BackA',
        //    active:false
        //},
        //{
        //    name:'BY',
        //    active:false,
        //    extra:{
        //        api:{active:false}
        //    }
        //},
        //{
        //    name:'YaBlogs',
        //    active:false
        //},
        //
        //{
        //    name:'Majestic',
        //    active: locale !== "ru"
        //},
        //{
        //    name:'TF',
        //    active:false
        //},
        //{
        //    name:'CF',
        //    active:false
        //},
        //{
        //    name:'Ahrefs',
        //    active:false
        //},
        //{
        //    name:'SemRush',
        //    active:locale !== "ru"
        //},
        {
            name: 'AhrefsTB',
            active: false,
            extra: {
                Page: {active: false},
                Domain: {active: false}
            }
        },
        // {
        //     name: 'AhrefsPage',
        //     active: false
        // },
        // {
        //     name: 'AhrefsDomain',
        //     active: false
        // },
        {
            name: 'Pictures',
            active: false
        },
        {
            name: 'Aggregators',
            active: false
        },
        {
            name: 'SocialNetworks',
            active: true,
            extra: {
                //GooglePlus: {active: true},
                Facebook: {active: true},
                //Twitter: {active: true},
                VK: {active: true}
            }
        },
        {
            name: 'ISolomono',
            active: true
        },
        {
            name: 'Solomono',
            active: true
        },
        {
            name: 'APICounters',
            active: true,
            extra: {
                api: {active: true},
                no_cogwheel: true
            }
        },
        {
            name: 'StatHistory',
            active: true,
            extra: {
                api: {active: true},
                no_cogwheel: true
            }
        },
        {
            name: 'Seo',
            active: true,
            extra: {
                api: {active: true},
                Sape: {active: true},
                Trustlink: {active: true},
                Liex: {active: true},
                Mainlink: {active: true},
                Linkfeed: {active: true},
                Setlinks: {active: true},
                Xap: {active: true},
                Propage: {active: true},
                Seozavr: {active: true},
                SapeArticles: {active: true},
                SapePr: {active: true},
                Miralinks: {active: true},
                Gogetlinks: {active: true},
                Blogun: {active: true},
                RotaPost: {active: true},
                Rds: {active: true},
            }
        },
        {
            name: 'LinksBuy',
            active: true,
            extra: {
                api: {active: true},
                no_cogwheel: true
            }

        },
        {
            name: 'Nesting',
            active: false
        },
        {
            name: 'IP',
            active: true
        },
        {
            name: 'IPSitesCount',
            active: true
        },
        {
            name: 'Geo',
            active: true,
            extra: {
                api: {active: true},
                no_cogwheel: true
            }
        },
        {
            name: 'Host',
            active: true,
            extra: {
                api: {active: true},
                no_cogwheel: true
            }
        },
        {
            name: 'Provider',
            active: true,
            extra: {
                api: {active: true},
                no_cogwheel: true
            }
        },
        {
            name: 'CMS',
            active: true
        },
        {
            name: 'Validation',
            active: false
        }
        //{
        //    name:'Robots',
        //    active:locale !== "ru"
        //},
        //{
        //    name:'Sitemap',
        //    active:false
        //}
    ];
};

/** @description settings for highlight noindex*/
window.rdz.setting.options.NoIndex = [
    {
        name: 'example',
        active: true // to be able to turn on/off
    },
    {
        name: 'clr_bg_txt_and_img',
        active: true,
        value: ['DAA520', 'rgb(0, 0, 0)']
    },
    {
        name: 'cross_txt',
        active: false,
        value: 'line-through'
    },
    {
        name: 'show_notification',
        active: true
    },
    {
        name: 'exceptions',
        value: '*.google.com\n' + '*.google.ru\n' + '*.yandex.ru\n' + '*.yandex.ua\n' + '*.sape.ru\n' + '*.recipdonor.com\n' + '*.google.com.ua\n' + '*.xap.ru\n' +
        '*.liex.ru\n' + '*.seozavr.ru\n' + '*.yahoo.com\n' + '*.bing.com\n' + '*.searchengines.ru\n' + '*.vk.com\n' + '*.vkontakte.ru\n' + '*.odnoklassniki.ru\n' + '*.mail.ru\n' +
        '*.rambler.ru\n' + '*.youtube.com\n' + '*.linkfeed.ru\n' + '*.trustlink.ru\n' + '*.seopult.ru\n' + '*.rookee.ru\n' + '*.yandex.by\n' + '*.mainlink.ru\n' +
        '*.setlinks.ru\n' + '*.trustlink.ru\n' + '*.propage.ru\n' + '*.miralinks.ru\n' + '*.gogetlinks.ru\n' + '*.blogun.ru\n' + '*.facebook.com\n' + '*.wmtransfer.com\n' +
        '*.webmoney.ru'
    }
];
/** @description settings for highlight noffolow*/
window.rdz.setting.options.NoFollow = [
    {
        name: 'example',
        active: true
    },
    {
        name: 'clr_bg_txt_and_img',
        active: false,
        value: ['ECECEC', 'rgb(0, 0, 0)']
    },
    {
        name: 'clr_brdr_txt',
        active: false,
        value: ['000', 'rgb(255, 255, 255)']
    },
    {
        name: 'cross_txt',
        active: true,
        value: 'line-through'
    },
    {
        name: 'clr_brdr_img',
        active: true,
        value: ['000', 'rgb(255, 255, 255)']
    }
];
/** @description settings for highlight sponsored*/
window.rdz.setting.options.Sponsored = [
    {
        name: 'example',
        active: true
    },
    {
        name: 'clr_bg_txt_and_img',
        active: false,
        value: ['ECECEC', 'rgb(0, 0, 0)']
    },
    {
        name: 'clr_brdr_txt',
        active: false,
        value: ['000', 'rgb(255, 255, 255)']
    },
    {
        name: 'cross_txt',
        active: true,
        value: 'line-through'
    },
    {
        name: 'clr_brdr_img',
        active: true,
        value: ['000', 'rgb(255, 255, 255)']
    }
];
/** @description settings for highlight ugc*/
window.rdz.setting.options.UGC = [
    {
        name: 'example',
        active: true
    },
    {
        name: 'clr_bg_txt_and_img',
        active: false,
        value: ['ECECEC', 'rgb(0, 0, 0)']
    },
    {
        name: 'clr_brdr_txt',
        active: false,
        value: ['000', 'rgb(255, 255, 255)']
    },
    {
        name: 'cross_txt',
        active: true,
        value: 'line-through'
    },
    {
        name: 'clr_brdr_img',
        active: true,
        value: ['000', 'rgb(255, 255, 255)']
    }
];
/** @description settings for highlight canonical*/
window.rdz.setting.options.Canonical = [
    {
        name: 'example',
        active: false
    }
];
/** @description settings for highlight robots*/
window.rdz.setting.options.Robots = [
    {
        name: 'example',
        active: false
    }
];
/** @description settings for highlight outer links*/
window.rdz.setting.options.OuterLinks = [
    {
        name: 'example',
        active: false
    },
    {
        name: 'clr_bg_txt_and_img',
        active: false,
        value: ['ECECEC', 'rgb(0, 0, 0)']
    },
    {
        name: 'clr_brdr_txt_and_img',
        active: true,
        value: ['FF0800', 'rgb(255, 255, 255)']
    },
    {
        name: 'cross_txt',
        active: false,
        value: 'line-through'
    },
    {
        name: 'exceptions',
        value: '*.google.com\n' + '*.google.ru\n' + '*.yandex.ru\n' + '*.yandex.ua\n' + '*.sape.ru\n' + '*.recipdonor.com\n' + '*.google.com.ua\n' + '*.xap.ru\n' +
        '*.liex.ru\n' + '*.seozavr.ru\n' + '*.yahoo.com\n' + '*.bing.com\n' + '*.searchengines.ru\n' + '*.vk.com\n' + '*.vkontakte.ru\n' + '*.odnoklassniki.ru\n' + '*.mail.ru\n' +
        '*.rambler.ru\n' + '*.youtube.com\n' + '*.linkfeed.ru\n' + '*.trustlink.ru\n' + '*.seopult.ru\n' + '*.rookee.ru\n' + '*.yandex.by\n' + '*.mainlink.ru\n' +
        '*.setlinks.ru\n' + '*.trustlink.ru\n' + '*.propage.ru\n' + '*.miralinks.ru\n' + '*.gogetlinks.ru\n' + '*.blogun.ru\n' + '*.facebook.com\n' + '*.wmtransfer.com\n' +
        '*.webmoney.ru'
    }
];
/** @description settings for highlight display:none*/
window.rdz.setting.options.DisplayNone = [
    {
        name: 'example',
        active: false
    },
    {
        name: 'clr_bg_txt_and_img',
        active: true,
        value: ['A7F21F', 'rgb(0, 0, 0)']
    },
    {
        name: 'show_notification',
        active: true
    },
    {
        name: 'exceptions',
        value: '*.google.com\n' + '*.google.ru\n' + '*.yandex.ru\n' + '*.yandex.ua\n' + '*.sape.ru\n' + '*.recipdonor.com\n' + '*.google.com.ua\n' + '*.xap.ru\n' +
        '*.liex.ru\n' + '*.seozavr.ru\n' + '*.yahoo.com\n' + '*.bing.com\n' + '*.searchengines.ru\n' + '*.vk.com\n' + '*.vkontakte.ru\n' + '*.odnoklassniki.ru\n' + '*.mail.ru\n' +
        '*.rambler.ru\n' + '*.youtube.com\n' + '*.linkfeed.ru\n' + '*.trustlink.ru\n' + '*.seopult.ru\n' + '*.rookee.ru\n' + '*.yandex.by\n' + '*.mainlink.ru\n' +
        '*.setlinks.ru\n' + '*.trustlink.ru\n' + '*.propage.ru\n' + '*.miralinks.ru\n' + '*.gogetlinks.ru\n' + '*.blogun.ru\n' + '*.facebook.com\n' + '*.wmtransfer.com\n' +
        '*.webmoney.ru'
    }
];

