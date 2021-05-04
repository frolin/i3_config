window.Router = Backbone.Router.extend({
        routes: {

            'recipients/:id/:page' :                    'recipients',
            'recipients/:id/:page/:param/:order':       'recipients',
            'siteslibrary/:id/:page':                   'siteslibrary',
            'siteslibrary/:id/:page/:param/:order':     'siteslibrary',
            'pageslibrary/:id/:page':                   'pageslibrary',
            'pageslibrary/:id/:page/:param/:order':     'pageslibrary',

            'checksites/:id/:page':                     'checksites',
            'checksites/:id/:page/:param/:order':       'checksites',
            'checkpages/:id/:page':                     'checkpages',
            'checkpages/:id/:page/:param/:order':       'checkpages',

            'execute':                            'execute',
            'datapage':                           'datapage',
            '*path' :                             'index'

        },
        index:function() {

            AppBlockMassage.show('BlockLoading');

            if (window.SitesLibraryView) {

                SitesLibrary.fetch({reset: true});
            } else {
                   window.SitesLibraryView = new SitesView();
            }

        },
        recipients: function(id, page, param, order) {

            AppBlockMassage.show('BlockLoading');

            var o = {
                'id': parseInt(id,10),
                'page': parseInt(page,10),
                'path': 'recipients',
                'length': DataPaging.get('PerPage').get('recipientslength')
            };

            DataPaging.fetch({prev_model:o});
            DataPaging.get('PerPage').set(o);

            AppTableSort.setSortedField({name:param, order: order});

            //make checked box in th - default, only for Recipients and SitesLibrary (they have the same SitesLibraryTableFields)
            LibRouter.get({ends:'TableFields'}).get('Uri').set('checked', false);

            if (window.RecipientsLibraryView) {
                Recipients.fetch({reset: true});
            } else {
                window.RecipientsLibraryView = new RecipientsView();
            }
        },
        siteslibrary: function(id, page, param, order) {

            AppBlockMassage.show('BlockLoading');

            var o = {
                'id': parseInt(id,10),
                'page': parseInt(page,10),
                'path': 'siteslibrary',
                'length': DataPaging.get('PerPage').get('siteslength')
            };

            DataPaging.fetch({prev_model:o});
            DataPaging.get('PerPage').set(o);

            AppTableSort.setSortedField({name:param, order: order});

            //make checked box in th - default, only for Recipients and SitesLibrary (they have the same SitesLibraryTableFields)
            LibRouter.get({ends:'TableFields'}).get('Uri').set('checked', false);

            if (window.SitesLibraryView) {
                SitesLibrary.fetch({reset: true});
            } else {
                window.SitesLibraryView = new SitesView();
            }
        },
        pageslibrary: function(id, page, param, order) {

            AppBlockMassage.show('BlockLoading');

            var o = {
                'id': parseInt(id,10),
                'page': parseInt(page,10),
                'path': 'pageslibrary',
                'length': DataPaging.get('PerPage').get('pageslength')
            };

            DataPaging.fetch({prev_model:o});
            DataPaging.get('PerPage').set(o);

            AppTableSort.setSortedField({name:param, order: order});

            if (window.PagesLibraryView) {
                PagesLibrary.fetch({reset: true});

            } else {
                window.PagesLibraryView = new PagesView();
            }

        },
        checksites: function(id, page, param, order) {

            AppBlockMassage.show('BlockLoading');

            var o = {
                'id': parseInt(id,10),
                'page': parseInt(page,10),
                'path': 'checksites',
                'length': DataPaging.get('PerPage').get('checksiteslength')
            };

            DataPaging.fetch({prev_model:o});
            DataPaging.get('PerPage').set(o);


            AppTableSort.setSortedField({name:param, order: order});

            if (window.CheckSiteLibraryView) {
                CheckSitesLibrary.fetch({reset: true});

            } else {
                window.CheckSiteLibraryView = new CheckSiteView();
            }

        },
        checkpages: function(id, page, param, order) {

            AppBlockMassage.show('BlockLoading');

            var o = {
                'id': parseInt(id,10),
                'page': parseInt(page,10),
                'path': 'checkpages',
                'length': DataPaging.get('PerPage').get('checkpageslength')
            };

            DataPaging.fetch({prev_model:o});
            DataPaging.get('PerPage').set(o);

            AppTableSort.setSortedField({name:param, order: order});

            if (window.CheckPageLibraryView) {
                CheckPagesLibrary.fetch({reset: true});

            } else {
                window.CheckPageLibraryView = new CheckPageView();
            }

        },
        datapage: function() {
            DataPaging.get('PerPage').set({'path': 'datapage'});
            AppView.renderHeader();
            var message = new MessageErr({model: AppLocale.errors.inprogress});
            $('.content').html(message.render().el);
        },
        execute:function() {
            DataPaging.get('PerPage').set({'path': 'execute'});
            AppView.renderHeader();
            var message = new MessageErr({model: AppLocale.errors.inprogress});
            $('.content').html(message.render().el);

        }
    });


