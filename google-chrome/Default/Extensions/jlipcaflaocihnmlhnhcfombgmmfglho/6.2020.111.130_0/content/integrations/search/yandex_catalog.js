window.rdz.integrations = window.rdz.integrations || {};
window.rdz.integrations.search = window.rdz.integrations.search || {};

window.rdz.integrations.search.yandex_catalog = function (data) {
  if (!/^https?:\/\/(www\.)?yandex\.(ua|ru|by|kz|com\.tr|com)\/(yaca|school)/.test(document.location.href)) return ;
  
    var that = this,
        updatesContainerSelector = '.header',
        updatesContainer,
        searchContainers = rdz.$('.yaca-snippet').filter((x, y) => y.className === 'yaca-snippet'),
        linkSelector = 'a.yaca-snippet__title-link',
        saContainerSelector = '.yaca-snippet__path',
        saContainer;

    that.data = data;

    // if yandex integration is disabled
    if (!that.data.options.catalog_active) {
        that.methods.resetSearchIntegration();
        return;
    }

    // updates
    updatesContainer = rdz.$(updatesContainerSelector)[0];
    if (updatesContainer) {
        rdz.$('.rds-bar-search-updates').remove();
        if (data.updates && data.options.functions.Updates.active) {
            window.rdz.integrations.search.methods.showUpdates(updatesContainer, data.updates, 'yandex_catalog', 'search');
        }
    }

    // remove the advertisement
    if (data.options.functions.DisableAdv.active) {
        rdz.integrations.search.methods.disableAdv();
    }

    // check the parameters
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
        window.rdz.integrations.search.methods.addNumeration('yandex_catalog');

        // yandex paging
        if (data.options.functions.Paging.active) {
            window.rdz.integrations.search.methods.showPaging('yandex_catalog', data);
        }
    }

    Array.prototype.forEach.call(document.querySelectorAll('.rds-full-url, .rds-bar-search-parameters'), function (e) {
      e.className += ' rds-yacatalog';
    });
};