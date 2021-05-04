var main = chrome.extension.getBackgroundPage(),
    browser_name = 'chrome';

window.rdz = window.rdz || {}; // to prevent the errors in the console
window.rdz.utils = window.rdz.utils || {};

AppLocale = main.AppLocale;
//prevent F5 + not saved locale (if was changed)
AppLocale.init();

//clear localStorage for version <= 1.1.2012.1709
chrome.storage.local.get(null, settings => {
    let storage = settings.Bar ||
        //version = 3..  exists only <Info> after installation
        settings.Info;

    if (!storage) chrome.storage.local.clear();
});


require.config({
    baseUrl: '.',
    //urlArgs: "bust=" + new Date().getTime(),

    paths: {
        jquery: 'lib/jquery',
        underscore: 'lib/underscore',
        backbone: 'lib/backbone',
        jscolor: 'lib/jscolor/jscolor',
        lib: 'includes/lib',
        punycode: 'includes/punycode',
        browser_lib: 'lib/chrome',


        user: 'core/user',

        //Models
        bar: 'new_options/models/bar',
        yandex: 'new_options/models/yandex',
        google: 'new_options/models/google',

        //Collections
        parameters: 'new_options/collections/parameters',
        ya_parameters: 'new_options/collections/ya_parameters',
        go_parameters: 'new_options/collections/go_parameters',
        noindex: 'new_options/collections/noindex',
        nofollow: 'new_options/collections/nofollow',
        sponsored: 'new_options/collections/sponsored',
        ugc: 'new_options/collections/ugc',
        canonical: 'new_options/collections/canonical',
        robots: 'new_options/collections/robots',
        outerlinks: 'new_options/collections/outerlinks',
        displaynone: 'new_options/collections/displaynone',

        //Views
        view: 'new_options/views/view',
        contextmenu: 'new_options/views/contextmenu'

    },

    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        'jquery': {
            exports: '$'
        },
        'jscolor': {
            exports: 'jscolor'
        },
        'punycode': {
            exports: 'punycode'
        },
        view: {
            deps: ['backbone'],
            exports: 'View'
        },
        bar: {
            deps: ['backbone'],
            exports: 'Bar'
        },
        yandex: {
            deps: ['backbone'],
            exports: 'Yandex'
        },
        google: {
            deps: ['backbone'],
            exports: 'Google'
        },
        parameters: {
            deps: ['backbone'],
            exports: 'Parameters'
        },
        ya_parameters: {
            deps: ['backbone'],
            exports: 'YaParameters'
        },
        go_parameters: {
            deps: ['backbone'],
            exports: 'GoParameters'
        },
        noindex: {
            deps: ['backbone'],
            exports: 'NoIndex'
        },
        nofollow: {
            deps: ['backbone'],
            exports: 'NoFollow'
        },
        sponsored: {
            deps: ['backbone'],
            exports: 'Sponsored'
        },
        ugc: {
            deps: ['backbone'],
            exports: 'UGC'
        },
        canonical: {
            deps: ['backbone'],
            exports: 'Canonical'
        },
        robots: {
            deps: ['backbone'],
            exports: 'Robots'
        },
        outerlinks: {
            deps: ['backbone'],
            exports: 'OuterLinks'
        },
        displaynone: {
            deps: ['backbone'],
            exports: 'DisplayNone'
        },
        contextmenu: {
            deps: ['backbone'],
            exports: 'Contextmenu'
        }
    }
});

require(
    ['jquery', 'backbone', 'underscore', 'jscolor', 'view', 'bar', 'yandex', 'google', 'parameters', 'ya_parameters', 'go_parameters', 'noindex', 'nofollow', 'sponsored', 'ugc', 'canonical', 'robots', 'outerlinks', 'displaynone', 'contextmenu', 'lib', 'user', 'browser_lib', 'punycode'],
    function ($, Backbone, _, jscolor, View, Bar, Yandex, Google, Parameters, YaParameters, GoParameters, NoIndex, NoFollow, Sponsored, UGC, Canonical, Robots, OuterLinks, DisplayNone, Contextmenu) {
        let fetchSet = new Set();
        function onFetched(collection) {
            fetchSet.delete(collection.localStorage.name);

            if (fetchSet.size === 0) {
                rdz.AppView = new View();
                rdz.AppView.render();
            }
        }

        window.Bar = new Bar({ id: 'Bar' });
        window.Yandex = new Yandex({ id: 'Yandex' });
        window.Google = new Google({ id: 'Google' });

        window.Parameters = new Parameters();
        window.YaParameters = new YaParameters();
        window.GoParameters = new GoParameters();

        window.NoIndex = new NoIndex();
        window.NoFollow = new NoFollow();
        window.Sponsored = new Sponsored();
        window.UGC = new UGC();
        window.Canonical = new Canonical();
        window.Robots = new Robots();
        window.OuterLinks = new OuterLinks();
        window.DisplayNone = new DisplayNone();

        window.Contextmenu = new Contextmenu();

        ["Bar", "Yandex", "Google", "Parameters", "YaParameters", "GoParameters", "NoIndex", "NoFollow", "Sponsored", "UGC", "Canonical", "Robots", "OuterLinks", "DisplayNone"].forEach(item => {
            window[item].fetch({ success: onFetched });
            fetchSet.add(item);
        });
    }
);
