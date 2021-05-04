var main = chrome.extension.getBackgroundPage(),
    model = {},
    tab = {};

chrome.tabs.query({active: true, lastFocusedWindow: true}, currentTabCallback);

function currentTabCallback(curtab) {
    //var params = main.params;
    tab = curtab[0];

    document.getElementById('YaCatalogTitle').textContent = tab.title;

    if (!tab.url.match(/^https?:\/\//i)) return;

    /** @property { Object } popup Helps Chrome gets access back to Browser Actions (popup.html) from background script*/
    main.rdz.popup = rdz;

    window.rdz.pmessenger = {};
    window.rdz.pmessenger.post = function (data) {
        switch (data.request) {

            default:
                data.SA = rdz.app.popup.SA; // to check Site Analisys

                main.rdz.model.parameters.Factory.requestAllParameters(data);
                var logged = main.rdz.user.logged;
                var local = main.rdz.setting.options.Bar.locale;
                chrome.storage.local.get('Bar', settings => {
                    main.rdz.utils.getPopupHistoryCounts(rdz.tab.url, logged, local, null, settings);
                });


        }

    };


    window.rdz.tab = {
        url: tab.url,
        favicon: tab.favIconUrl
    };

    chrome.storage.local.get(['Parameters', 'Bar'], settings => {
        rdz.app.popup.SA = rdz.utils.getOptions({ options: ['Parameters'], filter: 'SA' }, settings)[0];

        var paramsWithOptions = rdz.utils.mergeWithOptions(rdz.setting.params, rdz.utils.getOptions({
            options: ['Parameters'],
            filter: 'isNotFunction'
        }, settings), null, null, settings);
        rdz.app.popup.parameters.add(paramsWithOptions);
    });


    /*document.getElementById('LinksInValue').innerText = main.currentPageStats.linksInternal.length;
     document.getElementById('LinksOutValue').innerText = main.currentPageStats.linksExternal.length;*/
    //document.getElementById('RSSCountValue').innerText = main.currentPageStats.rss.length;
}

