var chromeTabSender=chrome.tabs.sendMessage;"function"!=typeof chromeTabSender&&(chromeTabSender=chrome.tabs.sendRequest);var webRequestCache={};function addToWebRequestCache(e,t){"object"==typeof webRequestCache[e]?webRequestCache[e]=$.merge(webRequestCache[e],t):webRequestCache[e]=t}var imgs={},bg_more=!!localStorage.bg_more;function bgMoreListener(e){if(bg_more){e.url;-1!=e.tabId&&(imgs[e.tabId]||(imgs[e.tabId]=[]),-1==imgs[e.tabId].indexOf(e.url)&&imgs[e.tabId].push({src:e.url}))}}function enableBgmore(){chrome.webRequest.onBeforeRequest.addListener(bgMoreListener,{urls:["<all_urls>"],types:["image"]})}function disableBgmore(){chrome.webRequest.onBeforeRequest.removeListener(bgMoreListener)}function getDomain(e){return e.match("://(.*?)/")[1]}bg_more&&enableBgmore();var aiscripts=[];function clearCache(){chrome.tabs.query({},function(e){for(var t=[],r=0;r<e.length;r++)t.push(e[r].id);for(var a in webRequestCache)webRequestCache.hasOwnProperty(a)&&-1==$.inArray(parseInt(a),t)&&delete webRequestCache[a]})}chrome.storage.local.get("aiscripts",function(e){e.aiscripts&&(aiscripts=aiscripts.concat(e.aiscripts)),$.ajax({url:gConfig.staticServer+"/aiscripts/scripts.json?_="+Date.now(),dataType:"json",success:function(e){e.forEach(function(e,t){var r=aiscripts[t];r?r.text?utils.compareVersion(e.version,r.version)>0&&(r.latestVersion=e.version,r.latest=e):aiscripts[t]=e:aiscripts.push(e)}),chrome.storage.local.set({aiscripts:aiscripts})}})}),chrome.tabs.onUpdated.addListener(function(e,t,r){t&&t.url&&(imgs[e]=[])}),chrome.runtime.onMessage.addListener(function(e,t,r){if("GET_IMG"==e.cmd)r(imgs[t.tab.id]);else if("ENABLE_BG_MORE"==e.cmd)bg_more=!0,enableBgmore(),chrome.webRequest.handlerBehaviorChanged(function(){chrome.tabs.query({active:!0},function(e){e.forEach(function(e){chrome.tabs.reload(e.id)})})});else if("DISABLE_BG_MORE"==e.cmd)bg_more=!1,disableBgmore();else if("GET_STORAGE"==e.cmd)chrome.storage.local.get(e.key,function(t){r(utils.parseJSON(t[e.key]))});else if("SET_STORAGE"==e.cmd){var a={};a[e.key]=e.value,chrome.storage.local.set(a)}else if("GET_RULES"==e.cmd)r(G_CONFIG.getRules());else if("INSTALL_SCRIPT"==e.cmd){(o=_.find(aiscripts,{id:e.script.id})).text=e.script.text,chrome.storage.local.set({aiscripts:aiscripts},function(){r&&r()})}else if("UPDATE_SCRIPT"==e.cmd){var o=_.find(aiscripts,{id:e.script.id});$.extend(o,e.script.latest),delete o.latest,chrome.storage.local.set({aiscripts:aiscripts},function(){r&&r()})}else if("REMOVE_SCRIPT"==e.cmd){(o=_.find(aiscripts,{id:e.script.id})).text="",chrome.storage.local.set({aiscripts:aiscripts},function(){r&&r()})}else if("GET_AISCRIPTS"==e.cmd)r(aiscripts);else if("NET"==e.cmd)$.ajax($.extend({},e.settings,{success:function(e){r({status:"ok",data:e})},error:function(){r({status:"error"})}}));else if("INSERT_AI_SCRIPT"==e.cmd){getDomain(e.url);aiscripts.forEach(function(r){r.text&&e.url.match(r.reg)&&chrome.tabs.executeScript(t.tab.id,{code:r.text,allFrames:!0})})}else"SILENT_DOWNLOAD"==e.cmd&&e.imgs.forEach(function(e){var t={url:e.url,saveAs:!1,conflictAction:"uniquify"};e.filename&&(t.filename=e.filename),chrome.downloads.download(t)});return!0}),setInterval(clearCache,6e5);var outputTabId,GET_IMAGE_TYPE={CURRENT:0,ALL_TAB:1};function getOuputTab(e){chrome.tabs.query({url:chrome.extension.getURL("output.html"),windowId:chrome.windows.WINDOW_ID_CURRENT},function(t){0==t.length||"0"==localStorage.oneOutput?chrome.tabs.create({url:chrome.extension.getURL("output.html")},function(t){e.callback(t,!0),_imgList=[]}):e.callback(t[0])})}function getTabImage(e){var t={};if(e.type==GET_IMAGE_TYPE.CURRENT)t={active:!0,windowId:chrome.windows.WINDOW_ID_CURRENT};else{if(e.type!=GET_IMAGE_TYPE.ALL_TAB)return void alert("出错啦！");t={windowId:chrome.windows.WINDOW_ID_CURRENT}}chrome.tabs.query(t,function(e){if(0!=e.length){localStorage.title=e[0].title,localStorage.url=e[0].url;var t=getHost(e[0].url);_gaq.push(["_trackEvent","getTagImage",t,e[0].title,null,!1]),chrome.browserAction.setBadgeText({text:"load"}),(new Image).src=gConfig.tjServer+"/20.gif?"+$.param(gParams)+"&domain="+utils.getDomainFromUrl(e[0].url)+"&ref="+encodeURIComponent(e[0].url),getOuputTab({callback:function(t){chrome.tabs.highlight({windowId:t.windowId,tabs:[t.index]},function(){});for(var r=t.id,a=0;a<e.length;a++){getImage(e[a],r)}}})}else alert("没有标签啊？！")})}function getHost(e){var t=null,r=e.match(/.*\:\/\/([^\/]*).*/);return void 0!==r&&null!=r&&(t=r[1]),t}function getImage(e,t){function r(){var r={rules:G_CONFIG.getRules(),outputTabId:t,tabIndex:e.index,bg_more:bg_more,aidownload:aidownload.getStatusFromUrl(e.url)},a=JSON.stringify(r,null,null),o=e.id,n='var __interval = setInterval(function(){if(typeof imageManager != "undefined"){clearInterval(__interval);imageManager.getImage('+a+");}}, 100);";chrome.tabs.executeScript(o,{code:n,allFrames:!bg_more&&"disabled"==r.aidownload},function(){var r=webRequestCache[o];if("object"==typeof r){var a=[];$.each(r,function(e,t){a.push({type:"IMG",src:t,width:0,height:0})}),chromeTabSender(t,{cmd:"ADD_PIC",imgList:a,title:e.title,url:e.url},function(e){}),delete webRequestCache[o]}chrome.browserAction.setBadgeText({text:""})})}chrome.tabs.sendMessage(e.id,{topic:"test-contentjs"},function(t){t?r():(chrome.tabs.executeScript(e.id,{file:"lib/jQuery.js",allFrames:!0}),chrome.tabs.executeScript(e.id,{file:"js/config.js",allFrames:!0}),chrome.tabs.executeScript(e.id,{file:"js/utils.js",allFrames:!0}),chrome.tabs.executeScript(e.id,{file:"js/parsers.js",allFrames:!0}),chrome.tabs.executeScript(e.id,{file:"js/content.js",allFrames:!0}),chrome.tabs.executeScript(e.id,{file:"js/content2.js",allFrames:!0},function(){r()}),chrome.tabs.insertCSS(e.id,{file:"css/content.css",allFrames:!0}),chrome.tabs.insertCSS(e.id,{file:"css/droppanel.css",allFrames:!0}))})}function getCurrentTabImage(){getTabImage({type:GET_IMAGE_TYPE.CURRENT})}function getAllTabImage(){getTabImage({type:GET_IMAGE_TYPE.ALL_TAB})}function translateUrl(e){var t=[],r=[],a=/\d+-\d+/,o=e.match(/^(.*)\[(.*?)\](.*)$/);if(o){for(var n=o[1],s=o[2],i=o[3],c=s.split(","),l=0;l<c.length;l++){var u=c[l];if(u.indexOf("-")>0){var g=u.split("-")[0],m=u.split("-")[1];if(a.test(u))for(var d=parseInt(g);d<=parseInt(m);d++)r.push("00000".substr(0,g.length-(""+d).length)+d);else for(var f=g.charCodeAt(0);f<=m.charCodeAt(0);f++)r.push(String.fromCharCode(f))}else r.push(u)}for(l=0;l<r.length;l++)t.push(n+r[l]+i)}else e.match(/^https?:\/\/.*$/)&&t.push(e);return t}function openPage(e){if(!(e.length<1)){var t=[];$(e).each(function(e,r){if(""!=r)for(var a=translateUrl(r),o=0;o<a.length;o++)t.push(a[o]),chrome.tabs.create({url:a[o]})})}}chrome.browserAction.onClicked.addListener(function(e){getCurrentTabImage()});var _imgList=[];function myOnMessage(e,t,r){switch(e.cmd){case"ADD_PIC":var a=e.imgList;outputTabId=e.outputTabId,_imgList=_imgList.concat(a),setTimeout(function(){chromeTabSender(outputTabId,{cmd:"ADD_PIC",imgList:a,title:t.tab.title,url:t.tab.url},function(e){}),r({})},1e3);break;case"ADD_PIC_BY_DRAG":getOuputTab({callback:function(a){localStorage.title=t.tab.title,localStorage.url=t.tab.url;var o=a.id;setTimeout(function(){chromeTabSender(o,{cmd:"ADD_PIC",imgList:e.imgList,title:t.tab.title,url:t.tab.url},function(e){}),r({})},1e3)}});break;case"ADD_PIC_AI":getOuputTab({callback:function(a){chrome.tabs.highlight({windowId:a.windowId,tabs:[a.index]},function(){}),localStorage.title=t.tab.title,localStorage.url=t.tab.url;var o=a.id;setTimeout(function(){chromeTabSender(o,{cmd:"ADD_PIC",imgList:e.imgList,title:t.tab.title,url:t.tab.url},function(e){}),r({})},1e3)}});break;case"IS_USE_HOTKEY":void 0==localStorage.useHotkey&&(localStorage.useHotkey="1"),r({on:"1"==localStorage.useHotkey,key:localStorage.hotKey||"Z"});break;case"GET_CURRENT_TAB_IMAGE":getCurrentTabImage(),r({});break;case"GET_ALL_TAB_IMAGE":getAllTabImage(),r({});break;case"OPEN_PAGE":openPage(e.pageUrls),r({});break;case"GET_CONFIG":var o={rules:G_CONFIG.getRules(),tabIndex:t.tab.index,bg_more:bg_more,aidownload:aidownload.getStatusFromUrl(t.tab.url),showNumber:localStorage.showNumber};r(o)}return!0}function isNeedUpdateRule(){var e=localStorage.ruleLastUpdateTime,t=new Date(e),r=new Date;return t.setSeconds(t.getSeconds()+1),void 0==e||t<r}var reciver=chrome.extension.onMessage;function clearLogin(){gConfig={},chrome.storage.local.set({access_token:"",username:"",userId:""})}void 0==reciver&&(reciver=chrome.extension.onRequest),reciver.addListener(function(e,t,r){myOnMessage(e,t,r)}),$(function(){isNeedUpdateRule()&&G_CONFIG.updateCommonRule(),$.getJSON(chrome.extension.getURL("manifest.json"),function(e){var t=e.version;_gaq.push(["_trackEvent","version",t,null,null,!1]);var r=localStorage.version;null!=r&&r==t||(localStorage.version=t)})}),chrome.storage.local.get(["access_token","username","userId","currentCat"],function(e){gConfig.access_token=e.access_token,gConfig.username=e.username,gConfig.userId=e.userId,e.currentCat?gConfig.currentCat=JSON.parse(JSON.stringify(e.currentCat)):chrome.storage.local.set({currentCat:JSON.parse(JSON.stringify(gConfig.currentCat))})}),chrome.storage.onChanged.addListener(function(e){e.access_token&&(gConfig.access_token=e.access_token.newValue),e.username&&(gConfig.username=e.username.newValue),e.userId&&(gConfig.userId=e.userId.newValue),e.currentCat&&(gConfig.currentCat=e.currentCat.newValue)});var openingLoginPage=!1;function openLoginPage(){openingLoginPage||(openingLoginPage=!0,setTimeout(function(){openingLoginPage=!1},3e3),chrome.tabs.query({url:config.server+"/*"},function(e){_.find(e,function(e){e.url.match("user/login")})?chrome.tabs.update(e[0].id,{active:!0}):chrome.tabs.create({url:config.server+"/#/user/login"})}))}function getUploadProcessTab(e){chrome.tabs.query({url:chrome.extension.getURL("upload-process/index.html")},function(t){e(t[0])})}function insertCt(e,t,r){["lib/jQuery.js","js/utils.js","js/parsers.js","js/tj.js","js/config.js","js/content.js"].forEach(function(r){chrome.tabs.executeScript(e.id,{file:r,frameId:t||0})}),chrome.tabs.executeScript(e.id,{file:"js/content2.js",frameId:t||0},function(){r&&r()})}!function(e){var t="Batch Download";navigator.language.match(/zh/)&&(t="批量下载"),chrome.contextMenus.create({title:t,type:"normal",contexts:["all"],onclick:function(e){getCurrentTabImage(e,"just-collect")}});chrome.storage.local.get("dl-list",function(e){dlList=e["dl-list"]||{}})}(jQuery),setTimeout(function(){tj.send("active")},5e3),$.ajax({url:gConfig.server+"/ftk/rules",dataType:"json",success:function(e){localStorage.rules2=JSON.stringify(e)}}),$.ajax({url:chrome.extension.getURL("dropPanel.html"),success:function(e){chrome.storage.local.set({dropPanelHtml:e})}}),chrome.browserAction.setPopup({popup:"popup.html"}),chrome.runtime.onMessage.addListener(function(e,t,r){switch(e.cmd){case"INSERT_CT":insertCt(t.tab,t.frameId,r)}return!0});