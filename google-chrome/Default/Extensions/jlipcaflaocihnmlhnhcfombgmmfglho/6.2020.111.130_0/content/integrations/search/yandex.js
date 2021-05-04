window.rdz.integrations = window.rdz.integrations || {};
window.rdz.integrations.search = window.rdz.integrations.search || {};

window.rdz.integrations.search.yandex = function (data) {
    var that = this; // window.rdz.integrations.search

    if (that.yandex.mutationObserver) {
        that.yandex.mutationObserver.disconnect();
    }

    that.data = data;

    // the enable function
    if (/^\/(yandsearch|search\/?)$/.test(document.location.pathname)) {
        rdz.$('.rds-bar-search-enable_button').remove();
        if (that.data.options.functions.Enable.active) {
            //var enable_btn_cnt = rdz.$('.header__search2');
            var enable_btn_cnt = rdz.$('.serp-header__search2');
            if (enable_btn_cnt.length) {
              enable_btn_cnt.css('min-width', '850px');
                var enable_btn_view = new window.rdz.integrations.search.views.EnableButton({
                    model: new (rdz.Backbone.Model.extend({defaults: {data: that.data}}) )
                });
                var enable_btn_el = enable_btn_view.render().el;
                enable_btn_el.style['float'] = 'left';
                enable_btn_el.style['margin-top'] = '4px';
                enable_btn_el.style['margin-left'] = '30px';
                rdz.$(enable_btn_cnt).append(enable_btn_el);
                rdz.$('.serp-header__search2 .suggest2-form').css('float', 'left');
            }
        }
    }

    // if yandex integration is disabled
    if (!that.data.options.active) {
        that.methods.resetSearchIntegration();
        return;
    }

    // detect main or search yandex page
    if (document.location.pathname === '/') {
        that.yandexMainPage(data);
    } else if (/^\/(yandsearch|search\/?)$/.test(document.location.pathname)) {
        that.yandexSearchIntegration(data);

        // observe dom changes
        if (rdz.$('.b-head-logo__logo').length > 0) {  // old yandex
            that.yandex.mutationObserver = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    for (var i = 0, l = mutation.addedNodes.length; i < l; i++) {
                        if ('getElementsByClassName' in mutation.addedNodes[i] &&
                            mutation.addedNodes[i].classList.contains('b-page-layout__column')) {
                            if (mutation.addedNodes[i].getElementsByClassName('b-body-items').length) {
                                that.methods.resetSearchIntegration();
                                if (that.data.options.active) {
                                    that.yandexSearchIntegration(that.data);
                                }
                                if (that.yandex.mutationObserver) {
                                    that.yandex.mutationObserver.disconnect();
                                }
                            }
                        }
                    }
                });
            });
        } else if (rdz.$('.logo').length > 0) {  // new yandex
            that.yandex.mutationObserver = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    for (var i = 0, l = mutation.addedNodes.length; i < l; i++) {
                        if ('getElementsByClassName' in mutation.addedNodes[i] &&
                            mutation.addedNodes[i].classList.contains('main-portion')) {
                            that.methods.resetSearchIntegration();
                            if (that.data.options.active) {
                                that.yandexSearchIntegration(that.data);
                            }
                            if (that.yandex.mutationObserver) {
                                that.yandex.mutationObserver.disconnect();
                            }
                        }
                    }
                });
            });

        }

        if (that.yandex.mutationObserver) {
            that.yandex.mutationObserver.observe(document.body, {
                childList: true,
                subtree: true
            });

            (function () {
                document.defaultView.addEventListener('unload', function () {
                    that.yandex.mutationObserver.disconnect();
                });
            }());
        }
    }
};

// main yandex page
window.rdz.integrations.search.yandexMainPage = function (data) {
    var updatesContainerSelector,
        updatesContainer;

    // remove the advertisement
    if (data.options.functions.DisableAdv.active) {
        rdz.integrations.search.methods.disableAdv();
    }

    if (rdz.$('.b-morda-search-form').length > 0) { // old yandex
        integrationName = 'yandex_old';
        updatesContainerSelector = 'table.b-morda-search-table td';
    } else if (rdz.$('.suggest2-form__node').length > 0) { // new yandex
        integrationName = 'yandex_new';
        updatesContainerSelector = '.suggest2-form__node';
    }

    // updates
    updatesContainer = rdz.$(updatesContainerSelector)[0];
    if (updatesContainer) {
        rdz.$('.rds-bar-search-updates').remove();
        if (data.updates && data.options.functions.Updates.active) {
            window.rdz.integrations.search.methods.showUpdates(updatesContainer, data.updates, integrationName, 'main');
            rdz.$('.b-yabrowser-promo__wrap.b-yabrowser-promo__wrap_left').css('display', 'none'); // Y.browser
        }

        if (integrationName === 'yandex_old') {
            rdz.$('.b-morda-search__button').css('vertical-align', 'top');
            rdz.$('.b-form-button').css('top', '-2px');
        }
        if (integrationName === 'yandex_new') {
            rdz.$('.container__banner').css('margin-top', '28px');
            //rdz.$('.arrow').css('height', '70px');
            //rdz.$('.input__samples').css('margin-top', '20px')
        }
    }
};

// search yandex page
window.rdz.integrations.search.yandexSearchIntegration = function (data) {
    var updatesContainerSelector,
        searchContainerSelector,
        linkSelector,
        linkFilterSelector,
        integrationName,
        updatesContainer,
        searchContainers,
        link,
        url,
        searchResults,
        saContainerSelector,
        saContainer;

    // show the notification
    if (!data.options.notified) {
        window.rdz.integrations.search.methods.showNotification('Yandex');
        data.options.notified = true;
    }

    // remove the advertisement
    if (data.options.functions.DisableAdv.active) {
        rdz.integrations.search.methods.disableAdv();
    }

    window.rdz.integrations.search.yandex.showResutsCount(document);

    //if (!rdz.$('.rds-region-cnt').length) {
    //    window.rdz.integrations.search.yandex.addRegion(document);
    //}


    if (rdz.$('ol.b-serp-list').length > 0) { // old yandex
        integrationName = 'yandex_old';
        updatesContainerSelector = 'table.b-search__table td';
        searchContainerSelector = '.b-body-items ol.b-serp-list li';
        linkSelector = 'a.b-serp-item__title-link';
        linkFilterSelector = '.b-serp-item__number';
    } else if (rdz.$('.content__left .serp-list').length > 0) { // new yandex
        integrationName = 'yandex_new';
        updatesContainerSelector = '.navigation';
        searchContainerSelector = '.serp-item';
        linkSelector = 'a.link_cropped_no';
        linkFilterSelector = 'a.link_cropped_no';//linkFilterSelector = '.serp-url__arrow, .serp-item__extra-link, .extralinks';
        saContainerSelector = '.serp-url, .organic__subtitle';
    }

    // updates
    updatesContainer = rdz.$(updatesContainerSelector)[0];
    if (updatesContainer) {
        rdz.$('.rds-bar-search-updates').remove();
        if (data.updates && data.options.functions.Updates.active) {
            window.rdz.integrations.search.methods.showUpdates(updatesContainer, data.updates, integrationName, 'search', true);
        }

        if (integrationName === 'yandex_old') {
            rdz.$('.b-search__button').css('vertical-align', 'top');
            rdz.$('.b-search__under').css('vertical-align', 'bottom');
            rdz.$('.b-form-button').css('top', '-2px');
        } else if (integrationName === 'yandex_new') {
            rdz.$('.search__button').css('vertical-align', 'top');
            rdz.$(updatesContainerSelector).css('height', 'unset');
        }
    }

    // check parameters
    searchContainers = rdz.$(searchContainerSelector).filter( // search results
        function (index) {
            return rdz.$(linkFilterSelector, this).length > 0;
        }
    );

    if (searchContainers.length > 0) {
        searchResults = [];
        searchContainers = searchContainers.toArray();

        // for each search result create the property in the hash,
        // save container for the search result in this property
        searchContainers.forEach(function (container) {
            link = rdz.$(linkSelector, container);
            url = link.attr('href');
            saContainer = rdz.$(saContainerSelector, container);
            searchResults.push({
                url: url,
                container: container,
                saContainer: saContainer
            });
        });

        window.rdz.integrations.search.methods.checkParameters(searchResults, data);
        if (integrationName === 'yandex_new') {
            window.rdz.integrations.search.methods.addNumeration('yandex_new');
            if (data.options.functions.Paging.active) {
                window.rdz.integrations.search.methods.showPaging('yandex_new', data);
            }
            
            // the recipients positions function
            rdz.$('.rds-recipients-list').remove();
            if (data.options.functions.RecipientsPositions.active) {
                var hash = window.rdz.integrations.search.hash;
                data.recipients_positions = new rdz.integrations.search.models.RecipientsPositions({integration: 'yandex',
                    hash: hash});
                var recipients_positions_view = new rdz.integrations.search.views.RecipientsPositions({el: hash[rdz._.keys(hash)[0]]['searchContainer'],
                    model: data.recipients_positions});
            }

            // the competition function
            /*rdz.$('.rds-search_competition').remove();
            if (data.options.functions.Competition.active) {
                data.competition = new rdz.integrations.search.models.Competition({integration: 'yandex'});
                var competition_view = new rdz.integrations.search.views.Competition({el: '.logo',
                    model: data.competition});
            }*/
        }
    }

};

window.rdz.integrations.search.yandex.showResutsCount = function (doc) {
    var inputFound = doc.getElementsByClassName('input__found')[0];
    if (inputFound) {
        var foundResults = doc.getElementById('rds-found_results');
        if (!foundResults) {
            foundResults = doc.createElement('div');
            foundResults.setAttribute('id', 'rds-found_results');
            doc.getElementsByClassName('logo__link')[0].parentNode.appendChild(foundResults);
        }
        foundResults.textContent = inputFound.textContent.replace(/—/, '').trim();
    }
};

window.rdz.integrations.search.yandex.addRegion = function (doc) {
    var logo = rdz.$('.logo'),
        regionName = rdz.$('.region-change__text a').text(),
        html = rdz.$('<div class="rds-region-cnt">' +
            '<form class="rds-region-form">' +
            '<span>' +
            '<input class="rds-region-cbox" type="checkbox" />' +
            '<input class="rds-region-tbox" type="text" value="' + regionName + '"/>' +
            '</span>' +
            '</form>' +
            '<div clas="rds-region-popup"></div>' +
            '</div>'
        );


    /*,
     container = rdz.$('<div/>'),
     input = rdz.$('<input/>'),
     checkbox = rdz.$('<input/>'),
     popup = rdz.$('<div/>'),
     form = rdz.$('<form/>');*/


    //    
    //input.attr({'type': 'text', 'value': 'Test'}).css('width', '100');
    //container.attr({'id': 'rds-region'});
    //
    //checkbox.attr('type', 'checkbox')

    //input.keyup(function(e) {
    //    window.rdz.integrations.search.yandex.getRegion(input.val(), popup);
    //});


    //container.append(checkbox);
    //container.append(input);
    //container.append(popup);
    //form.append(container);
    logo.append(html);

    rdz.$('.rds-region-tbox').keyup(function (e) {
        window.rdz.integrations.search.yandex.getRegion();
    });
};

window.rdz.integrations.search.yandex.getRegion = function () {
    var req = new XMLHttpRequest(),
        text = rdz.$('.rds-region-tbox').val();

    req.open("GET", 'http://tune.yandex.ru/api/search/2/search.xml?lang=ru?&types=3,6,7,8&part=' + encodeURIComponent(text), true);
    req.send(null);
    req.onreadystatechange = function () {
        if (req.readyState == 4) {
            if (req.status == 200) {
                window.rdz.integrations.search.yandex.setRegionPopup(req.responseText);
            }
        }
    };
};

window.rdz.integrations.search.yandex.setRegionPopup = function (responseText) {
    var popup = rdz.$('.rds-region-popup'),
        ids = JSON.parse(responseText)[1],
        i,
        len,
        id_block;

    popup.empty();

    for (i = 0, len = ids.length; i < len; i += 1) {
        id_block = rdz.$('<a/>').addClass('region-input-item').text(ids[i][0]);
        id_block.click(function (e) {
            return '{&quot;suggest2-item&quot;:{}}';
        });
        popup.append(id_block);
    }
};