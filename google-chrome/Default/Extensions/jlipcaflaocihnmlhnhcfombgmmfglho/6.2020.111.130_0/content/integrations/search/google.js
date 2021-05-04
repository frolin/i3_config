window.rdz.integrations = window.rdz.integrations || {};
window.rdz.integrations.search = window.rdz.integrations.search || {};

window.rdz.integrations.search.google = function (data) {
    var that = this; // window.rdz.integrations.search

    that.data = data;
    //that.google.observedElements = ['ires', 'tvcap', 'topstuff','rhs', 'tadsb'];

    // the enable function
    if (/q=/.test(document.location.href)) {
        rdz.$('.rds-bar-search-enable_button').remove();
        if (that.data.options.functions.Enable.active) {
            var enable_btn_cnt = rdz.$('.tsf'); // .tsf-p
            if (enable_btn_cnt.length) {
                var enable_btn_view = new window.rdz.integrations.search.views.EnableButton({
                    model: new (rdz.Backbone.Model.extend({defaults: {data: that.data}}) )
                });
                rdz.$(enable_btn_cnt).append(enable_btn_view.render().el);
            }
        }
    }

    // if google integration is disabled
    if (!that.data.options.active) {
        that.methods.resetSearchIntegration();
        if (that.google.mutationObserver) {
            that.google.mutationObserver.disconnect();
        }
        return;
    }

    // detect main or search google page
    if (/q=/.test(document.location.href)) {
        setTimeout(function () {
            that.googleSearchIntegration(data);
        }, 300);
    } else {
        that.googleMainPage(data);
    }

    // observe dom changes
//    that.google.mutationObserver = new MutationObserver( function ( mutations ) {          
//          mutations.forEach( function ( mutation ) {
//              for ( var i = 0, l = mutation.addedNodes.length; i < l; i++ ) {
//	        if ( that.google.observedElements.indexOf(mutation.addedNodes[i].id) !== -1 ) {                    
//		    if ( mutation.addedNodes[i].getElementsByClassName('b-body-items').length ) {
//                      that.methods.resetSearchIntegration();
//                      if (that.data.options.active) {
//                        that.googleSearchIntegration(that.data);
//                      } else {
//                        if (that.google.mutationObserver) {
//                          that.google.mutationObserver.disconnect();
//                        }
//                      }                                        
//		    } 
//	        }
//	      }          
//          } );
//    } );

    // taken from FF
    var liveSearch = false;
    that.google.mutationObserver = new MutationObserver(function (mutations) {
        var m, i, addedNodes, target;
        for (m = 0; m < mutations.length; m++) {
            addedNodes = mutations[m].addedNodes;
            for (i = 0; i < addedNodes.length; i++) {
                if (addedNodes[i].id === 'rhs') {
                    if (window.rdz.integrations.search.google.isAllowedIntegration(document)) {

                        // start the integration
                        that.methods.resetSearchIntegration();
                        if (that.data.options.active) {
                            that.googleSearchIntegration(that.data);
                        } else {
                            if (that.google.mutationObserver) {
                                that.google.mutationObserver.disconnect();
                            }
                        }

                        return;
                    }
                    liveSearch = true;
                }
            }

            target = mutations[m].target;
            if (liveSearch && target.nodeName === 'UL' && target.getAttribute('role') === 'listbox' && !target.childElementCount) {
                liveSearch = false;

                // start the integration
                that.methods.resetSearchIntegration();
                if (that.data.options.active) {
                    that.googleSearchIntegration(that.data);
                } else {
                    if (that.google.mutationObserver) {
                        that.google.mutationObserver.disconnect();
                    }
                }

                return;
            }
        }
    });


    if (document.body) {
        that.google.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    ( function () {
        document.defaultView.addEventListener('unload', function () {
            that.google.mutationObserver.disconnect();
        });
    }() );

};

//// main google page
window.rdz.integrations.search.googleMainPage = function (data) {
    var updatesContainer = rdz.$('.A8SBwf').length ? rdz.$('.A8SBwf') : null,
        updates,
        updatesView;

    if (!updatesContainer) {
        setTimeout(function () {
            updatesContainer = rdz.$('.A8SBwf').length ? rdz.$('.A8SBwf') : null;
                showUpdates();
        }, 200);
    } else {
        showUpdates();
    }

    function showUpdates() {
        // updates
        if (updatesContainer) {
            rdz.$('.rds-bar-search-updates').remove();
            rdz.$('.rds-updates').removeClass('rds-updates');
            rdz.$('.rds-ups').removeClass('rds-ups');
            if (data.updates && data.options.functions.Updates.active) {
                let updates = new rdz.Backbone.Collection([
                    {name: 'TYC', value: data.updates.TYC},
                    {name: 'IY', value: data.updates.IY},
                    {name: 'USER', value: data.updates.USER},
                    {name: 'PR', value: data.updates.PR},
                ]),
                    updatesView = new window.rdz.integrations.search.views.Updates({collection: updates});
                rdz.$(updatesContainer).append(updatesView.render().el);

                //  window.rdz.integrations.search.methods.showUpdates(updatesContainer, data.updates, 'google', 'main');
                rdz.$('.rds-bar-search-updates').addClass('google-main');
                rdz.$('.jsb').addClass('rds-ups');
            }
        }
    }
};

// search google page
window.rdz.integrations.search.googleSearchIntegration = function (data) {
    var updatesContainer = rdz.$('.A8SBwf').length ? rdz.$('.A8SBwf') : null,
        updates,
        updatesView,
        mainList = document.querySelector('#rso'), // the list with the search results (tag "ol")
        searchContainers = [...mainList.querySelectorAll('li, div.g')].filter(function (item) { // search results (tags "li")
            return !item.id && item.className.replace('rds-recipient', '').trim() === 'g' && item.offsetParent.id; // added for responsive view
        }),
        link,
        url,
        searchResults,
        saContainerSelector = 'cite',
        saContainer;

    // show the notification
    if (!data.options.notified) {
        setTimeout(function () {
            window.rdz.integrations.search.methods.showNotification('Google');
        }, 1000);
        data.options.notified = true;
    }

    // remove the advertisement
    if (data.options.functions.DisableAdv.active) {
        rdz.integrations.search.methods.disableAdv();
    }

    if (!updatesContainer) {
        setTimeout(function () {
            updatesContainer = rdz.$('.A8SBwf').length ? rdz.$('.A8SBwf') : null;
                showUpdates();
        }, 200);
    } else {
        showUpdates();
    }

    function showUpdates() {
        // updates
        if (updatesContainer) {
            rdz.$('.rds-bar-search-updates').remove();
            rdz.$('.rds-updates').removeClass('rds-updates');
            rdz.$('.rds-ups').removeClass('rds-ups');
            if (data.updates && data.options.functions.Updates.active) {
                //window.rdz.integrations.search.methods.showUpdates(updatesContainer, data.updates);
                let updates = new rdz.Backbone.Collection([
                    {name: 'TYC', value: data.updates.TYC},
                    {name: 'IY', value: data.updates.IY},
                    {name: 'USER', value: data.updates.USER},
                    {name: 'PR', value: data.updates.PR},
                ]),
                    updatesView = new window.rdz.integrations.search.views.Updates({collection: updates});
                rdz.$(updatesContainer).append(updatesView.render().el);

                rdz.$('.rds-bar-search-updates').addClass('google-search');
                rdz.$('#top_nav').addClass('rds-ups');
            }
        }
    }

    // check parameters
    if (searchContainers.length > 0) {
        searchResults = [];
        //searchContainers = searchContainers.toArray();

        // for each search result create the property in the hash,
        // save container for the search result in this property
        searchContainers.forEach(function (container) {
            link = rdz.$('.yuRUbf a', container);
            saContainer = rdz.$(saContainerSelector, container).parent();
            if (link.length > 0) {
                url = link.attr('href');
                searchResults.push({
                    url: url,
                    container: container,
                    saContainer: saContainer
                });
            }
        });

        window.rdz.integrations.search.methods.checkParameters(searchResults, data);
        window.rdz.integrations.search.methods.addNumeration('google');
        
        // the recipients positions function
        rdz.$('.rds-recipients-list').remove();
        if (data.options.functions.RecipientsPositions.active) {
            var hash = window.rdz.integrations.search.hash;
            data.recipients_positions = new rdz.integrations.search.models.RecipientsPositions({integration: 'google',
                hash: hash});
            var recipients_positions_view = new rdz.integrations.search.views.RecipientsPositions({el: hash[rdz._.keys(hash)[0]]['searchContainer'],
                model: data.recipients_positions});
        }

        // the competition function
        /*rdz.$('.rds-search_competition').remove();
        if (data.options.functions.Competition.active) {
            data.competition = new rdz.integrations.search.models.Competition({integration: 'google'});
            var competition_view = new rdz.integrations.search.views.Competition({el: '#logocont h1',
                model: data.competition});
        }*/
    } else {
        window.rdz.integrations.search.googleSearchIntegrationMobile(data);
    }

};

// search google page mobile
window.rdz.integrations.search.googleSearchIntegrationMobile = function (data) {
    var mainList = document.querySelector('#rso'), // the list with the search results (tag "ol")
        searchContainers = [...mainList.querySelectorAll('.mnr-c.xpd')];

    // check parameters
    if (searchContainers.length > 0) {
        let searchResults = [];
        //searchContainers = searchContainers.toArray();

        // for each search result create the property in the hash,
        // save container for the search result in this property
        searchContainers.forEach(function (container) {
            let link = rdz.$('a.C8nzq.BmP5tf', container);
            if (link.length > 0) {
                searchResults.push({
                    url: link.attr('href'),
                    container: container
                });
            }
        });

        window.rdz.integrations.search.methods.checkParameters(searchResults, data);
        window.rdz.integrations.search.methods.addNumeration('google');

        // the recipients positions function
        rdz.$('.rds-recipients-list').remove();
        if (data.options.functions.RecipientsPositions.active) {
            var hash = window.rdz.integrations.search.hash;
            data.recipients_positions = new rdz.integrations.search.models.RecipientsPositions({integration: 'google',
                hash: hash});
            // var recipients_positions_view = new rdz.integrations.search.views.RecipientsPositions({el: hash[rdz._.keys(hash)[0]]['searchContainer'],
            //     model: data.recipients_positions});
        }
    }

};

window.rdz.integrations.search.google.isAllowedIntegration = function (doc) {
    var ulList = doc.getElementsByTagName('UL');
    for (var i = 0; i < ulList.length; i++) {
        if (ulList[i].getAttribute('role') === 'listbox' && ulList[i].childElementCount) return false;
    }
    return true;
};