rdz.utils.openOptionPage = function () {
    chrome.management.getSelf(function (extention) {
        rdz.utils.openPage(extention.optionsUrl);
    });
};

rdz.utils.openDBPage = function(hash) {
    //extension id
    //var id = chrome.i18n.getMessage("@@extension_id");
    
    // to open a page like #checkpages/1/1
    hash = hash || "";

    rdz.utils.openPage(chrome.extension.getURL('/user/rds.html') + hash);
};

rdz.utils.openRecipdonorPage = function() {
    rdz.utils.openPage("https://www.recipdonor.com/bar?update#changes");
};

rdz.utils.openPage = function(url) {

    //gets pages with our url
    chrome.tabs.query({url: url}, function(tabs) {

        //one ore more option page was opened
        if (tabs && tabs.length >= 1)
        {
            //select first
            chrome.tabs.update(tabs[0].id, {active: true});
        }
        else
        {
            //or open new
            chrome.tabs.create({ url: url });
        }
    });
};

rdz.utils.getOptionsWindowObj = function() {

    var allWindowObjects = chrome.extension.getViews({type:'tab'}),
        optionsWindowObjects = allWindowObjects.filter(function(windowObject) {
            return windowObject.location.pathname === '/new_options.html';
        }),
        optionsWindowObject = optionsWindowObjects[0];
        
	return optionsWindowObject || null;
};

rdz.utils.setCookies = function(url,name, value, callback, args){
    chrome.cookies.set({url:url, name:name ,value:value});
    callback(args);
};

if (!rdz.user) rdz.user = {};
rdz.user.is_logged = function(){
    chrome.cookies.get({url: 'http://www.recipdonor.com', name: '.ASPXAUTH'}, function(event) {
        if (rdz.user.logged !== Boolean(event)) {
            rdz.user.logged = Boolean(event);

            if(rdz.user.logged)
            {
                rdz.user.login();
            }
            else {
                rdz.user.logout();
            }

            rdz.user.change_icon(rdz.user.logged);
        }
    });
};

rdz.user.change_icon = function(logged){
        if (logged)
       	{
       		chrome.browserAction.setIcon({path: '/icons/skin/logo/19_auth.png'});
       		chrome.browserAction.setBadgeBackgroundColor({color: [0xf5, 0xbc, 0x4b, 0xff]});
       	}
       	else
       	{
       		chrome.browserAction.setIcon({path: '/icons/skin/logo/19.png'});
       		chrome.browserAction.setBadgeBackgroundColor({color: [0xa3, 0xaa, 0xb6, 0xff]});
       	}
};

rdz.user.exit = function(callback){
    chrome.cookies.remove({url: 'http://www.recipdonor.com', name: '.ASPXAUTH'}, callback);
};

rdz.utils.turnOnOffYandex50 = function (settings) {
    var turn_on = rdz.utils.getOptions({ options: ['Yandex'] }, settings).functions.MaxResultsCount.active;

    if (turn_on) {
        let yp_cookie_expires = Date.now() + 10 * 365 * 24 * 60 * 60 * 1000;

        ['ua', 'by', 'ru'].forEach(domain_zone => {
            chrome.cookies.get({ url: 'http://www.yandex.' + domain_zone, name: 'yp' }, function (event) {
                let value = yp_cookie_expires + '.sp.';
                if (event) { // cookie exists
                    if (event.value.indexOf('nd%3A50%3A') === -1) {
                        value += 'nd%3A50%3A';
                    }
                    value += event.value.split('.sp.')[1];
                } else {
                    value += 'nd%3A50%3A';
                }

                chrome.cookies.set({
                    url: 'http://www.yandex.' + domain_zone,
                    name: 'yp',
                    domain: '.yandex.' + domain_zone,
                    value: value,
                    expirationDate: Math.ceil(yp_cookie_expires / 1000)
                });
            });
        });
    }
};

rdz.utils.reloadIntegrationTabs = function (integration) {
    var re, i, len, url;

    if (integration === 'Yandex') {
       re = /^https?:\/\/(www\.)?(beta\.)?yandex\.(ua|ru|by|kz)\/(yand|site|large)?search\/?\?/;
    } else if (integration === 'Google') {
        re = /^https?:\/\/(www\.)?google(?=.(?:[^\.]{2,3}\.)*)[^]+?q=/;
    }

    chrome.tabs.query({url: ['*://*/*']}, function(tabs) {
        for (i = 0, len = tabs.length; i < len; i += 1) {
            url = tabs[i].url;
            if (url && re.test(url)) {
                chrome.tabs.update(tabs[i].id, {'url': url}); // reload tab
            }
        }
    });
};
