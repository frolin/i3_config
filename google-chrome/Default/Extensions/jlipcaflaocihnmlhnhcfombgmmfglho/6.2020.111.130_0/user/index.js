$(function(){

    window.main = {};
    window.webworkers = {};


    if (window && window.chrome) {
        window.main = chrome.extension.getBackgroundPage();
        window.rdz = main.rdz;
        window.BigInteger = main.BigInteger;
        window.rdz.locale = main.AppLocale.get();
        window.main.webworkers = window.webworkers;
    }
    var locale = main.AppLocale.get_locale_str();
    window.AppLocale = JSON.parse(rdz.utils.loadInjected('/user/locale/' + locale + '.json'));
    AppLocale.locale = locale;
    AppLocale.ru_params = [ "Seo", "linkspurch", "TYC", "TYCBar", "TYCCategory", "TYCTopics", "TYCRegion", "IY", "IYD", "BY", "Imgyan", "ISolomono", "Solomono", "IYP", "IYDP", "UniqueContent"];
    
    // define an object to store some mass checking values in cache
    if (!rdz.cache.get("mass_checking")) {
        rdz.cache.set("mass_checking", {
            show_with_date: false
        });
    }

    window.DataPaging = new PagingCollection;
    DataPaging.fetch();

    window.DataPaging.on('add', function(){

        window.AppTableSort = new TableSort({id:guid(), sortedparam: '',sortedlib: ''});

        //LibRouter help switching between Collections
        window.LibRouter = {
            path: {
                recipients :    'Recipients',
                siteslibrary:   'SitesLibrary',
                pageslibrary:   'PagesLibrary',
                checksites:     'CheckSitesLibrary',
                checkpages:     'CheckPagesLibrary'
            },
            get: function (p) {
                if (!p) p = {};
                var o = [this.path[p.lib || DataPaging.get('PerPage').get('path')]] + (p.ends || '');

                //шапка и поля для SitesLibrary и Recipients одинаковые
                if (o === 'RecipientsTableFields') o = 'SitesLibraryTableFields';

                return !p.str ? window[o] : o;
            }/*,
             getName: function(p) {
             return [this.path[DataPaging.get('PerPage').get('path')]] + (p.ends || '');
             }*/
        };

        window.SitesLibraryTableFields = new SitesLibraryTableFieldsCollection;
        SitesLibraryTableFields.fetch();
        window.PagesLibraryTableFields = new PagesLibraryTableFieldsCollection;
        PagesLibraryTableFields.fetch();

        window.Recipients   = new RecipientsCollection;
        window.SitesLibrary = new SitesLibraryCollection;
        window.PagesLibrary = new PagesLibraryCollection;


        window.CheckSitesLibraryTableFields = new CheckSiteTableFieldsCollection;
        CheckSitesLibraryTableFields.fetch();
        window.CheckPagesLibraryTableFields = new CheckPageTableFieldsCollection;
        CheckPagesLibraryTableFields.fetch();

        window.CheckSitesLibrary = new CheckSitesCollection;
        window.CheckPagesLibrary= new CheckPagesCollection;


        window.AppView = new UserView;

        window.AppPopup = new Popup();
        window.AppBlockMassage = new BlockMassage();
        window.AppTooltip = new Tooltip();

        window.AppRouter = new Router;
        Backbone.history.start();

        /*for some reason router calls DataPaging.fetch()
        * remove handler to prevent*/
        window.DataPaging.off('add');

    });

    /*Array with request, which body contains domains (not pages)*/
    window.api_domains = ['Seo', 'LinksBuy','UIMirrorsCount', 'TYC', 'TYCBar', 'TYCCategory', 'TYCTopics', 'TYCRegion', 'IY', 'IYD', 'IG', 'WA', 'Alexa', 'BackAlexa', 'DMOZ', 'UICounters', 'Dangerous', 'Solomono', 'ISolomono', 'PRpageMain'];

    window.AppRequest = new (Backbone.Collection.extend({
        model: Backbone.Model.extend({
            idAttribute: 'name'
        })
    }));
    
    window.checkIndicators = new CheckIndicators();
});

