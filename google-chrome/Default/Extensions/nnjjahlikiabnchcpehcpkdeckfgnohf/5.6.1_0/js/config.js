var gConfig={brand:"Fatkun",qq:"2141740095",qqg:"",mail:"aituxiu@gmail.com",server:"https://f.8fenxiang.com",tjServer:"https://tj.fatkun.cn",staticServer:"http://static.fatkun.cn",webServer:"http://web.fatkun.cn",tjPaths:{page:"/14.gif",install:"/11.gif",active:"/10.gif",btn:"/12.gif",config:"/13.gif",dl:"/15.gif",duplicate:"/16.gif"},ga:"UA-172659890-2",topOrLeft:"top",popupMode:"normal",name:"ftk"};gConfig.rpt=gConfig.server+"/sr1";var gParams={extid:chrome.runtime.id,v:chrome.runtime.getManifest().version,name:"ftk",source:"chrome"};chrome.storage.local.get(["uuid","installTime"],function(t){t.installTime||(t.installTime=Date.now(),chrome.storage.local.set({installTime:t.installTime})),gParams.hy=parseInt((Date.now()-t.installTime)/864e5),t.uuid?(gParams.uuid=t.uuid,chrome.storage.local.set({gParams:gParams}),tj.init(gConfig.tjServer,gConfig.tjPaths,gParams)):setTimeout(function(){(new Fingerprint2).get(function(t){gParams.uuid=t,chrome.storage.local.set({uuid:t}),chrome.storage.local.set({gParams:gParams}),tj.init(gConfig.tjServer,gConfig.tjPaths,gParams)})},1e3)});