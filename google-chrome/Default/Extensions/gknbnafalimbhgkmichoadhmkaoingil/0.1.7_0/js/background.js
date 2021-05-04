var checkZendPresence = function(tabId){

	chrome.tabs.get(tabId, function(tab){
		if(typeof tab == 'object' && tab['url']){
			DebugCookie.get(parseUrl(tab.url), ['ZDEDebuggerPresent'], function (cookies){
				// Find the Zend Debug cookie
				if(typeof cookies['ZDEDebuggerPresent'] == 'undefined'){
					chrome.browserAction.setIcon({path: 'img/ico-disabled.png'});
					return true;
				};
				chrome.browserAction.setIcon({path: 'img/ico.png'});
				return true;
			});
		};
	});

};

chrome.tabs.onUpdated.addListener(checkZendPresence);
chrome.tabs.onActiveChanged.addListener(checkZendPresence);