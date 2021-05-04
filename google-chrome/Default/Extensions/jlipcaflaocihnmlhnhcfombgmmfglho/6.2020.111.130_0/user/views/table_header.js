TableHeader = Backbone.View.extend({

    tagName: 'tr',

    render: function() {
        var th_num = new window['THNum']();
            $(this.el).append(th_num.render().el);

        //get TH model with checkbox
        var model_check = LibRouter.get({ends:'TableFields'}).get('Uri');
        var th_check = new window['THCheck']({model: model_check}),
            lib = LibRouter.get({str:true});
            $(this.el).append(th_check.render().el);

        var models = LibRouter.get({ends:'TableFields'}).models;
        for (var i in models) {
            var model = models[i],
                name = model.get('name');

            //filter out hidden fields
            if (model.get('value') !== 0 &&
                //проверка скрытого поля
                window.rdz.TableFields.hidden.indexOf(name) == -1 &&

                //проверка скрытого поля в массовых проверках
                (window.rdz.TableFields.hidden_in_mass_checks.indexOf(name) == -1 || ["Recipients", "SitesLibrary", "PagesLibrary"].indexOf(lib) !== -1 ) &&

                    (AppLocale.locale === 'ru' || AppLocale.ru_params.indexOf(name) === -1))
            {
                var view = new window['TH' + model.get('name')]({model: model});
                    $(this.el).append(view.render().el);
            }
        }
        return this;
    }
});

THCLass = Backbone.View.extend({

    tagName: 'th',

    template: _.template(templates.user_table.th),

    events: {
      "click .check":   "toggleWindowOptions",
      "mouseenter": "toggleTooltip",
      "mouseleave": "toggleTooltip"
    },

    render: function() {

        var u = this.model ? this.model.get('name') + '/' + (this.model.get('sortorder') === '' || this.model.get('sortorder') !== 'desc' ? 'desc' : 'asc') : '';
        var o = this.model ? this.model.get('sortorder') : '' ;

        $(this.el).html(this.template({
            uri:  'rds.html#' +
                  DataPaging.get('PerPage').get('path') + '/' +
                  DataPaging.get('PerPage').get('id') + '/' +
                  DataPaging.get('PerPage').get('page') + '/' +
                  u,
            order: o
        }));
        return this;
    },

    toggleWindowOptions: function() {
        AppPopup.show('PopupTableFields');
    },

    toggleTooltip: function(e) {

        if (e.type === "mouseenter") {
            if (this.model) {
                AppTooltip.show({tooltip: "THUserTableTooltip", name: this.model.get('name'), event: e})
            }            
        } else if (e.type === "mouseleave") {
            AppTooltip.close();
        }
    }
});



THNum = THCLass.extend({

    template: _.template(templates.user_table.thNum)

});

THCheck = THCLass.extend({

    template: _.template(templates.user_table.thCheck),

    events: {
      "change input": "toggleCheck"
    },

    render: function() {
        $(this.el).html(this.template({m:this.model.attributes}));
        return this;
    },

    toggleCheck: function () {
        AppBlockMassage.show('BlockLoading');

        //it simple magic gives AppBlockMassage time to show message
        setTimeout($.proxy(this.model.toggleCheck, this.model), 500)
    }

});


//------------------------------------------------------------------------------------------> siteslibrary

THIP = THCLass.extend({

    template: _.template(templates.user_table.thIP)

});

THGeo = THCLass.extend({

    template: _.template(templates.user_table.thGeo)

});

THHost = THCLass.extend({

    template: _.template(templates.user_table.thHost)

});

THProvider = THCLass.extend({

    template: _.template(templates.user_table.thProvider)

});

THUrl = THCLass.extend({

    template: _.template(templates.user_table.thUrl)

});

THpositions = THCLass.extend({

    template: _.template(templates.user_table.thpositions)

});

THTYC = THCLass.extend({

    template: _.template(templates.user_table.thTYC)

});

THTYCBar = THCLass.extend({

    template: _.template(templates.user_table.thTYCBar)

});

THTYCCategory = THCLass.extend({

    template: _.template(templates.user_table.thTYCCategory)

});

THTYCTopics = THCLass.extend({

    template: _.template(templates.user_table.thTYCTopics)

});

THTYCRegion = THCLass.extend({

    template: _.template(templates.user_table.thTYCRegion)

});


THPR = THCLass.extend({

    template: _.template(templates.user_table.thPR)

});

THIY = THCLass.extend({

    template: _.template(templates.user_table.thIY)

});

THIYD = THCLass.extend({

    template: _.template(templates.user_table.thIYD)

});

THIG = THCLass.extend({

    template: _.template(templates.user_table.thIG)

});

THibing = THCLass.extend({

    template: _.template(templates.user_table.thibing)

});


THBY = THCLass.extend({

    template: _.template(templates.user_table.thBY)

});

THImgyan = THCLass.extend({

    template: _.template(templates.user_table.thImgyan)

});

THImgg = THCLass.extend({

    template: _.template(templates.user_table.thImgg)

});

THAOLimg = THCLass.extend({

    template: _.template(templates.user_table.thAOLimg)

});

THSubdomains = THCLass.extend({

    template: _.template(templates.user_table.thSubdomains)

});

THWA = THCLass.extend({

    template: _.template(templates.user_table.thWA)

});

THseomoz = THCLass.extend({

    template: _.template(templates.user_table.thseomoz)

});

THLG = THCLass.extend({

    template: _.template(templates.user_table.thLG)

});

THBackBing = THCLass.extend({

    template: _.template(templates.user_table.thBackBing)

});


THBing = THCLass.extend({

    template: _.template(templates.user_table.thBing)

});


THIndexAol = THCLass.extend({

    template: _.template(templates.user_table.thIndexAol)

});


THAlexa = THCLass.extend({

    template: _.template(templates.user_table.thAlexa)

});

THBackAlexa = THCLass.extend({

    template: _.template(templates.user_table.thBackAlexa)

});


THDMOZ = THCLass.extend({

    template: _.template(templates.user_table.thDMOZ)

});

THCMS = THCLass.extend({

    template: _.template(templates.user_table.thCMS)

});

THLinksInDomain = THCLass.extend({

    template: _.template(templates.user_table.thLinksIn)

});

THLinksOutDomain = THCLass.extend({

    template: _.template(templates.user_table.thLinksOut)

});

THpageweightDomain = THCLass.extend({

    template: _.template(templates.user_table.thpageweight)

});

THpagetitleDomain = THCLass.extend({

    template: _.template(templates.user_table.thpagetitle)

});

THcommercialsDomains = THCLass.extend({

    template: _.template(templates.user_table.thcommercials)

});


THTechnorati = THCLass.extend({

    template: _.template(templates.user_table.thTechnorati)

});

/*THfb = THCLass.extend({

    template: _.template(templates.user_table.thfb)

});*/

THMJ = THCLass.extend({

    template: _.template(templates.user_table.thMJ)

});

THCF = THCLass.extend({

    template: _.template(templates.user_table.thCF)

});

THTF = THCLass.extend({

    template: _.template(templates.user_table.thTF)

});


THAhrefs = THCLass.extend({

    template: _.template(templates.user_table.thAhrefs)

});

THSemrush = THCLass.extend({

    template: _.template(templates.user_table.thSemrush)

});

THGoogleAdplanner = THCLass.extend({

    template: _.template(templates.user_table.thGoogleAdplanner)

});

THGoogleTrends = THCLass.extend({

    template: _.template(templates.user_table.thGoogleTrends)

});

THCompete = THCLass.extend({

    template: _.template(templates.user_table.thCompete)

});


THQuantcast = THCLass.extend({

    template: _.template(templates.user_table.thQuantcast)

});

// THNetchart = THCLass.extend({
// 
    // template: _.template(templates.user_table.thNetchart)
// 
// });


THAggregators = THCLass.extend({

    template: _.template(templates.user_table.thAggregators)

});

THISolomono = THCLass.extend({
    template: _.template(templates.user_table.thISolomono)

});

THSolomono = THCLass.extend({
    template: _.template(templates.user_table.thSolomono)

});

THWebmoney = THCLass.extend({
    template: _.template(templates.user_table.thWebmoney)

});

THIP = THCLass.extend({

    template: _.template(templates.user_table.thIP)

});

THAge = THCLass.extend({

    template: _.template(templates.user_table.thAge)

});


THDangerous = THCLass.extend({

    template: _.template(templates.user_table.thDangerous)

});

/*THGoogleOne = THCLass.extend({

    template: _.template(templates.user_table.thGoogleOne)

});

THFacebookLike = THCLass.extend({

    template: _.template(templates.user_table.thFacebookLike)

});

THTwitterLike = THCLass.extend({

    template: _.template(templates.user_table.thTwitterLike)

});

THVkLike = THCLass.extend({

    template: _.template(templates.user_table.thVkLike)

});*/

THSocialNetworks = THCLass.extend({

    template: _.template(templates.user_table.thSocialNetworks)

});

THCounters = THCLass.extend({

    template: _.template(templates.user_table.thCounters)

});

THSeo = THCLass.extend({

    template: _.template(templates.user_table.thSeo)

});

THlinkspurch = THCLass.extend({

    template: _.template(templates.user_table.thlinkspurch)

});

THRSS = THCLass.extend({

    template: _.template(templates.user_table.thRSS)

});

THRobots = THCLass.extend({

    template: _.template(templates.user_table.thRobots)

});

THSitemap = THCLass.extend({

    template: _.template(templates.user_table.thSitemap)

});

//------------------------------------------------------------------------------------------> pageslibrary

THUri = THCLass.extend({

    template: _.template(templates.user_table.thUri)

});

THpositionspage = THCLass.extend({

    template: _.template(templates.user_table.thpositionspage)

});

THRecipientPage = THCLass.extend({
    
    template: _.template(templates.user_table.thRecipientPage)

});

THNesting = THCLass.extend({

    template: _.template(templates.user_table.thNesting)

});

THcommercials = THCLass.extend({

    template: _.template(templates.user_table.thcommercials)

});

THCountersPage = THCLass.extend({

    template: _.template(templates.user_table.thCountersPage)

});

THPRpageMain = THCLass.extend({

    template: _.template(templates.user_table.thPRpageMain)

});

THPRpage = THCLass.extend({

    template: _.template(templates.user_table.thPRpage)

});

THIYP = THCLass.extend({

    template: _.template(templates.user_table.thIYP)

});

THIGP = THCLass.extend({

    template: _.template(templates.user_table.thIGP)

});

THIYDP = THCLass.extend({

    template: _.template(templates.user_table.thIYDP)

});

THValid = THCLass.extend({

    template: _.template(templates.user_table.thValid)

});

THBackAlexaPage = THCLass.extend({

    template: _.template(templates.user_table.thBackAlexa)

});

THSocialNetworkspage = THCLass.extend({

    template: _.template(templates.user_table.thSocialNetworkspage)

});

THISolomonoPage = THCLass.extend({
    template: _.template(templates.user_table.thISolomono)

});

THSolomonoPage = THCLass.extend({
    template: _.template(templates.user_table.thSolomono)

});

THUniqueContentPage = THCLass.extend({

    template: _.template(templates.user_table.thUniqueContentPage)

});

THAnchor = THCLass.extend({

    template: _.template(templates.user_table.thAnchor)

});

THLinksIn = THCLass.extend({

    template: _.template(templates.user_table.thLinksIn)

});

THLinksOut = THCLass.extend({

    template: _.template(templates.user_table.thLinksOut)

});

THpagetitle = THCLass.extend({

    template: _.template(templates.user_table.thpagetitle)

});

THpageweight = THCLass.extend({

    template: _.template(templates.user_table.thpageweight)

});

THLinkPresence = THCLass.extend({

    template: _.template(templates.user_table.thLinkPresence)

});

THCMSpage = THCLass.extend({

    template: _.template(templates.user_table.thCMSpage)

});

THDangerousPage = THCLass.extend({

    template: _.template(templates.user_table.thDangerous)

});

THAlexaPage = THCLass.extend({

    template: _.template(templates.user_table.thAlexa)

});

THMozRank = THCLass.extend({

    template: _.template(templates.user_table.thMozRank)

});

THseomozP = THCLass.extend({

    template: _.template(templates.user_table.thseomozP)

});