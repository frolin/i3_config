﻿function toCdnUrl(e){var t=pfData.config.hosts.cdn;return 0===e.indexOf(t)?e:t+e}Element.prototype.matches||(Element.prototype.matches=Element.prototype.matchesSelector||Element.prototype.mozMatchesSelector||Element.prototype.msMatchesSelector||Element.prototype.oMatchesSelector||Element.prototype.webkitMatchesSelector||function(e){for(var t=(this.document||this.ownerDocument).querySelectorAll(e),n=t.length;--n>=0&&t.item(n)!==this;);return n>-1}),String.prototype.startsWith||(String.prototype.startsWith=function(e,t){return t=!t||t<0?0:+t,this.substring(t,t+e.length)===e});var commonUtils={hasClass:function(e,t){return e.nodeType===Node.ELEMENT_NODE&&(e.classList?e.classList.contains(t):(e.getAttribute("class")||"").split(/\s/).indexOf(t)>=0)},addClassTo:function(e,t){e.nodeType===Node.ELEMENT_NODE&&(commonUtils.hasClass(e,t)||(e.classList?e.classList.add(t):e.className=(e.className||"")+" "+t))},removeClassFrom:function(e,t){if(e.nodeType===Node.ELEMENT_NODE&&commonUtils.hasClass(e,t))if(e.classList)e.classList.remove(t);else{var n=(e.getAttribute("class")||"").split(" "),i=n.indexOf(t);i>=0&&n.splice(i,1),e.setAttribute("class",n.join(" "))}},getImageWidth:function(e,t){e.jquery&&(e=e[0]);var n=null;if(t){var i=e.getAttribute("pf-data-width");i&&(n=parseInt(i,10))}else e.getAttribute("data-pf_rect_width")&&(n=parseInt(e.getAttribute("data-pf_rect_width"),10));return(null===n||0===n||"number"!=typeof n||isNaN(n))&&(n=e.getBoundingClientRect().width),n},getImageHeight:function(e,t){e.jquery&&(e=e[0]);var n=null;if(t){var i=e.getAttribute("pf-data-height");i&&(n=parseInt(i,10))}else e.getAttribute("data-pf_rect_height")&&(n=parseInt(e.getAttribute("data-pf_rect_height"),10));return(null===n||0===n||"number"!=typeof n||isNaN(n))&&(n=e.getBoundingClientRect().height),n},MAX_SVG_SIZE:200,MAX_SVG_ICON_SIZE:21,ICON_REGEXP:/icon/i,svgMaxValue:function(e){return this.ICON_REGEXP.test(e.getAttribute("class")||"")?this.MAX_SVG_ICON_SIZE:this.MAX_SVG_SIZE},svgViewBox:function(e){var t=e.getAttribute("viewBox");if(t){var n=t.split(" ");if(4===n.length)return{width:parseInt(n[2],10),height:parseInt(n[3],10)}}return{}},INFINITY:1e6,getSvgImageWidth:function(e,t){var n=this.getImageWidth(e,t)||this.INFINITY,i=this.svgMaxValue(e),o=this.svgViewBox(e).width||this.INFINITY;return Math.min(n,i,o)},getSvgImageHeight:function(e,t){var n=this.getImageHeight(e,t),i=this.svgMaxValue(e),o=this.svgViewBox(e).height||this.INFINITY;return Math.min(n,i,o)},getTopWrapper:function(e){var t=e.parentNode;return t.childNodes.length>1?e:this.getTopWrapper(t)},isDeletableElement:function(){return function(e){return!commonUtils.hasClass(e,"non-delete")&&(e.matches("small, footer, header, aside, details, dialog, figure, nav, summary, twitter-widget, p, img, blockquote, h1, h2, h3, h4, h5, h6, ol, ul, li, a, table, td, pre, span, code, dl, dt, dd, hr, div.pf-caption, video, figcaption, data")||$(e).find("*:visible").length<=15)}}(),resizeImageCssClass:function(e){return"pf-size-"+e.replace("-size","").replace("-images","")},addCSS:function(e,t,n){var i=n?"body":"head",o=t.getElementsByTagName(i)[0],r=t.createElement("style");r.type="text/css",r.setAttribute("name","pf-style"),r.styleSheet?r.styleSheet.cssText=e:r.appendChild(t.createTextNode(e)),o.appendChild(r)},createIframe:function(e){var t=e.createElement("iframe");return t.frameBorder="0",t.allowTransparency="true",t},loadHtmlInIframe:function(e,t,n){var i,o;try{o=t.contentWindow.document}catch(n){i=e.domain,t.src="javascript:var d=document.open();d.domain='"+i+"';void(0);",o=t.contentWindow.document}o.write(n),o.close()}},analytics=function(){return{sendEvent:function(e,t,n){messageBus.postMessage("core","PfGaEvent",{category:e,action:t,label:n})}}}(),exTracker=function(){function e(){return"production"===h.environment}function t(){return"development"===h.environment}function n(){return!!d.Raven}function i(){try{d.frames["pf-core"]&&d.frames["pf-core"].document&&(d=d.frames["pf-core"],l=d.document)}catch(e){}}function o(){if(f)return!0;if(f=!0,i(),null===l)return!1;var e=l.createElement("script"),t=l.getElementsByTagName("script")[0];e.src=this.config.urls.js.raven,t.parentNode.appendChild(e),r()}function r(){if(!n())return setTimeout(r,100);s(),a()}function a(){for(var e=0,t=m.length;e<t;e++){var n=m[e];c(n.err,n.opts)}}function s(){var e={dataCallback:function(e){try{var t=e.stacktrace.frames[0];t.filename.match(u)&&"onload"!==t["function"]||e.stacktrace.frames.shift()}catch(e){}return e},shouldSendCallback:function(e){return!!(e&&e.extra&&e.extra.file)},release:g};d.Raven.config(h.hosts.ravenDsn,e).install()}function c(t,n){n=n?{file:n.file}:{file:"printfriendly.js"},n.usingBM=h.usingBM,n.url=h.urls.page,e()&&d.Raven.captureException(t,{extra:n})}var d=window.top,l=null,f=!1,u=/d3nekkt1lmmhms|printfriendly\.com|printnicer\.com|algo\.js|printfriendly\.js|core\.js/,m=[],p=[],h={},g=null;return{init:function(e,t){h=e.config,g=e.version,"production"!==e.config.environment||e.onServer?t():Raven.context(t)},log:function(e,i){t()&&(console.error(e),console.error(e.stack)),i=i||{file:"printfriendly.js"};try{n()?c(e,i):(m.push({err:e,opts:i}),o(),p.push(e.name+" : "+e.message),p.push(e.stack))}catch(e){}}}}(),persistComputedStylesAndRect=function(){function e(e,t,n,o){for(var r=0,a=n.length;r<a;r++){var s=n[r],c=[i,o,s].join("_");e.dataset[c]=t[s]}}var t=["display","visibility"],n=["width","height"],i="pf";return function(i){var o=i.currentStyle||window.getComputedStyle(i);o&&e(i,o,t,"style");var r=i.getBoundingClientRect&&i.getBoundingClientRect();return"IMG"!==i.nodeName&&"SVG"!==i.nodeName&&"IFRAME"!==i.nodeName||r&&e(i,r,n,"rect"),{style:o,rect:r}}}(),toAbsoluteUrl=function(){var e=/^https?:\/\//i;return function(t,n){if(!t)return t;if(e.test(t))return t;if(t.startsWith("//"))return n.protocol+t;var i=n.protocol+"//"+n.hosts.page;return t.startsWith("/")||(t="/"+t),i+t}}(),messageBus=function(){var e=!1;return{postMessage:function(e,t,n){"root"===e?chrome.tabs.sendMessage(window.extensionRootTabId,{type:t,payload:n}):chrome.runtime.sendMessage({type:t,payload:n})},listen:function(t,n){e||(chrome.runtime.onMessage.addListener(function(e){try{if(!e)return;var i=e.type;if(!i)return;var o=t[i];if(!o)return;o(e.payload)}catch(e){if(!n)throw e;n(e)}}),e=!0)}}}(),PF_VERSION="client";!function(){var e=document.getElementById("printfriendly-data");if(e){var t=JSON.parse(e.getAttribute("data"));window.pfstyle=t.pfstyle,window.pfOptions=t.pfOptions,window.pfShowHiddenContent=t.pfShowHiddenContent}if(window.wrappedJSObject&&window.wrappedJSObject.extensionPath){var n=window.wrappedJSObject;window.extensionId=n.extensionId,window.extensionRootTabId=n.extensionRootTabId,window.extensionPath=n.extensionPath,window.pfstyle=n.pfstyle,window.pfOptions=n.pfOptions,window.pfShowHiddenContent=n.pfShowHiddenContent}}();var pfMod=window.pfMod||function(e){var t=e.document,n="https:";messageBus.listen({PfCoreLoaded:function(){messageBus.postMessage("core","PfStartCore",{pfData:f.pfData})},PfExtensionCoreLoaded:function(){messageBus.postMessage("core","PfLoadCore",{pfData:f.pfData})},PfClosePreview:function(){f.closePreview()},PfAddCSS:function(e){commonUtils.addCSS(e.css,t,e.useBody)},PfRestoreStyles:function(){c.restoreStyles()},PfAddViewPortTag:function(){c.addViewPortTag()},PfScrollTop:function(){e.scrollTo(0,0)},PfTwitterCopyEmbeded:function(){m.copyEmbeded()},PfCreateByAdType:function(e){r.createAdByType(e.adType)},PfShowAds:function(){r.show()},PfHideAds:function(){r.hide()},PfFinished:function(e){f.hasContent=e.hasContent,f.finished=!0},PfRunRedirectChecks:function(){var e=f.runRedirectChecks();analytics.sendNoRedirectEvent(e.reason)},PfRedirectIfNecessary:function(e){f.dsData=e.dsData,f.runRedirectChecks().redirect?f.redirect():messageBus.postMessage("core","PfLaunchCore")}},function(e){exTracker.log(e),f.finished=!0});var o={};o.uncategorized_mobile="/assets/client/ads/uncategorized_mobile-3346da6cc710f1689585ef20f45779c3efce1bf2cad73fb96fdef033f71666b9.html",o.uncategorized="/assets/client/ads/uncategorized-1ad175518ecfda0e4c8012fddb8cbed99ffda4200423f52c4c7a3c22401296f8.html";var r={createAdByType:function(e){if(!document.getElementById("gaiframe")){var n=r.isMobile()?"_mobile":"",i=o[e+n];i.startsWith("/assets")&&(i=f.config.hosts.cdn+i);var a=document.createElement("iframe");a.id="gaiframe",a.name="gaiframe",a.style="border: 0!important; position:absolute!important; height:280px!important; margin-left: auto!important; margin-right: auto!important; left: 0!important; right:0!important; z-index: 2147483647!important; display:none;",a.src=i,a.scrolling="no",t.body.appendChild(a),r.setupSetStyle()}},isMobile:function(){return e.innerWidth<=700},setupSetStyle:function(){r.setStyle(),e.addEventListener("resize",function(){r.setStyle()})},setStyle:function(){var t=document.getElementById("gaiframe");if(t){var n=e.innerWidth>860?"284px":"250px",i=e.innerWidth>730?"700px":e.innerWidth;t.style.removeProperty("width"),t.style.removeProperty("top"),t.style.setProperty("width",i,"important"),t.style.setProperty("top",n,"important")}},show:function(){var e=document.getElementById("gaiframe");e&&(e.style.display="block")},hide:function(){var e=document.getElementById("gaiframe");e&&(e.style.display="none")}},a={environment:"production",disableUI:!1,protocol:n,dir:"ltr",usingBM:!1,maxImageWidth:750,filePath:"/assets/",platform:"unknown",enablePrintOnly:!1,hosts:{cdn:n+"//cdn.printfriendly.com/extension",pf:"https://www.printfriendly.com",ds:"https://www.printfriendly.com",translations:"https://www.printfriendly.com",ds_cdn:"https://key-cdn.printfriendly.com",pdf:"https://pdf.printfriendly.com",email:"https://www.printfriendly.com",page:e.location.host.split(":")[0],ravenDsn:"https://5463b49718cd4266911eab9e5c0e114d@sentry.io/22091"},domains:{page:e.location.host.split(":")[0].split("www.").pop()}},s={isBookmarklet:function(){return e.pfstyle&&"wp"!=e.pfstyle},removeEmailsFromUrl:function(e){e=e.split("?")[0];for(var t=e.split("/"),n=t.length;n-- >0;){t[n].indexOf("@")>0&&t.splice(n,1)}return t.join("/")},isDynamicPage:function(){return!!(e.React||e.ko||e.Polymer||e.m||e.angular||e.ng&&e.ng.coreTokens||e.Backbone||e.Ember||e.Vue||document.querySelector&&document.querySelector('[ng-version],[data-reactroot],[data-bind],[class*="svelte-"],.__meteor-css__'))},ogImageUrl:function(){var e="",t=document.querySelector&&document.querySelector('meta[property="og:image"]');return t&&t.content&&(e=t.content),e},isWix:function(){return-1!==s.ogImageUrl().indexOf("wixstatic.com")},isOverBlog:function(){return-1!==s.ogImageUrl().indexOf("over-blog-kiwi.com")},isLocalHost:function(){var t=e.location.host,n=e.location.hostname;return-1!==t.indexOf(":")||!!n.match(/\d+\.\d+\.\d+\.\d+/)||"localhost"===n||!!n.split(".").pop().match(/invalid|test|example|localhost|dev/)}},c={addViewPortTag:function(){var e=t.getElementsByTagName("head")[0],n=t.querySelector("meta[name=viewport]");n||(n=t.createElement("meta"),n.name="viewport"),n.content="width=device-width, initial-scale=1",e.appendChild(n)},restoreStyles:function(){for(var e=document.getElementsByName("pf-style"),t=e.length-1;t>=0;t--)e[t].parentNode.removeChild(e[t])}},d={isReady:!1,readyBound:!1,ready:function(){if(!d.isReady){if(!document.body)return setTimeout(d.ready,13);d.isReady=!0,d.readyFunc.call()}},doScrollCheck:function(){if(!d.isReady){try{document.documentElement.doScroll("left")}catch(e){return setTimeout(d.doScrollCheck,50)}d.detach(),d.ready()}},detach:function(){document.addEventListener?(document.removeEventListener("DOMContentLoaded",d.completed,!1),e.removeEventListener("load",d.completed,!1)):document.attachEvent&&"complete"===document.readyState&&(document.detachEvent("onreadystatechange",d.completed),e.detachEvent("onload",d.completed))},completed:function(e){(document.addEventListener||"load"===e.type||"complete"===document.readyState)&&(d.detach(),d.ready())},bindReady:function(){if(!d.readyBound){if(d.readyBound=!0,"complete"===document.readyState)return d.ready();if(document.addEventListener)document.addEventListener("DOMContentLoaded",d.completed,!1),e.addEventListener("load",d.completed,!1);else if(document.attachEvent){document.attachEvent("onreadystatechange",d.completed),e.attachEvent("onload",d.completed);var t=!1;try{t=null==e.frameElement&&document.documentElement}catch(e){}t&&t.doScroll&&d.doScrollCheck()}}},domReady:function(e){this.readyFunc=e,this.bindReady()},canonicalize:function(t){if(t){var n=document.createElement("div");n.innerHTML="<a></a>",n.firstChild.href=t,n.innerHTML=n.innerHTML,t=n.firstChild.href,-1!==t.indexOf("//")&&(t=e.location.protocol+"//"+n.firstChild.href.split("//")[1])}return t}},l={headerImageUrl:d.canonicalize(e.pfHeaderImgUrl),headerTagline:e.pfHeaderTagline,imageDisplayStyle:e.pfImageDisplayStyle,customCSSURL:d.canonicalize(e.pfCustomCSS),disableClickToDel:e.pfdisableClickToDel,disablePDF:e.pfDisablePDF,encodeImages:1===parseInt(e.pfEncodeImages),disablePrint:e.pfDisablePrint,disableEmail:e.pfDisableEmail};-1!=="|full-size|remove-images|large|medium|small|".indexOf("|"+e.pfImagesSize+"|")?l.imagesSize=e.pfImagesSize:l.imagesSize=1==e.pfHideImages?"remove-images":"full-size";var f={version:PF_VERSION,initialized:!1,finished:!1,onServer:!1,hasContent:!1,messages:[],errors:[],waitDsCounter:0,autoStart:!1,stats:{},init:function(t){try{this.initialized=!0,this.configure(t),this.onServerSetup(),f.onServer||this.config.isExtension||this.getAdSettingsFromPFServer(),this.setVariables(),this.detectBrowser(),this.setStats(),this.startIfNecessary(),e.print=function(){f.start()}}catch(e){exTracker.log(e),f.finished=!0}},configure:function(t){if(this.config=a,t){this.config.environment=t.environment||"development";for(var n in t.hosts)this.config.hosts[n]=t.hosts[n];t.filePath&&(this.config.filePath=t.filePath),t.ssLocation&&(this.config.ssLocation=t.ssLocation),t.ssStyleSheetHrefs&&(this.config.ssStyleSheetHrefs=t.ssStyleSheetHrefs),t.enablePrintOnly&&(this.config.enablePrintOnly=t.enablePrintOnly)}this.config.enableLog="development"===this.config.environment||"test"===this.config.environment||e.pfEnableLog,this.config.isExtension=!!e.extensionPath},getVal:function(e,t){for(var n=t.split(".");void 0!==e&&n.length;)e=e[n.shift()];return e},startIfNecessary:function(){(e.pfstyle||this.autoStart)&&this.start()},urlHasAutoStartParams:function(){return-1!==this.config.urls.page.indexOf("pfstyle=wp")},start:function(){if(f.onServer||f.config.isExtension)f.launch();else{if(f.waitDsCounter+=1,f.waitDsCounter<20&&!f.dsData)return setTimeout(function(){f.start()},100);f.runRedirectChecks().redirect?f.redirect():f.supportedSiteType()&&f.launch()}},launch:function(){d.domReady(function(){try{f.startTime=(new Date).getTime(),p.run(),f.pfData=u.get(),f.config.disableUI||(f.sanitizeLocation(),f.createMask()),f.loadCore()}catch(e){exTracker.log(e),f.finished=!0}})},sanitizeLocation:function(){url=document.location.href.split("?")[0],url=s.removeEmailsFromUrl(url),url!==document.location.href&&(history&&"function"==typeof history.pushState?history.pushState({pf:"sanitized"},document.title,url):f.urlHasPII=!0)},unsanitizeLocation:function(){history&&history.state&&"sanitized"==history.state.pf&&history.back()},onServerSetup:function(){e.onServer&&(this.onServer=!0,this.config.disableUI=!0)},setVariables:function(){var t,n=this,i=n.config.hosts.cdn+n.config.filePath+n.version,o=this.config.disableUI?"":"https://cdn.printfriendly.com/extension/assets/pf-app/main.css",r=this.config.disableUI?"":"https://cdn.printfriendly.com/extension/assets/content/main.css",a={jquery:"/assets/unversioned/jquery/3.6.0.min-a342abd7aecd3858be981ddeb5008f3c5ccda7d9458c2d54bb44bdd853747581.js",raven:"/assets/unversioned/raven/3.19.1.min-4615298b8370384c06482f8da1411b3762d9046b1e0c812b795f7c6c6a4d1cd9.js",core:"/assets/client/core-297c6de55e4257653948819eb5db64e6ddc79e722236e7605472615a1cfd9515.js",algo:"/assets/client/algo-c170c023f0bece4143f9ba4a1644efa68b577aaad83ac244fe2b9a87f203a212.js"};this.config.urls={version:i,js:a,css:{pfApp:o,content:r},pdfMake:n.config.hosts.pdf+"/pdfs/make",email:n.config.hosts.email+"/email/new"};try{t=top.location.href}catch(n){t=e.location.href}this.config.urls.page=t,this.userSettings=l,this.config.pfstyle=e.pfstyle,!e.pfstyle||"bk"!==e.pfstyle&&"nbk"!==e.pfstyle&&"cbk"!==e.pfstyle||(this.config.usingBM=!0),this.autoStart=this.urlHasAutoStartParams()},detectBrowser:function(){this.browser={};var e=navigator.appVersion;e&&-1!==e.indexOf("MSIE")?(this.browser.version=parseFloat(e.split("MSIE")[1]),this.browser.isIE=!0):this.browser.isIE=!1},loadScript:function(e,t){var n=document.getElementsByTagName("head")[0],i=document.createElement("script");i.type="text/javascript",i.src=e,i.onreadystatechange=t,i.onload=t,n.appendChild(i)},redirect:function(){var e=["source=cs","url="+encodeURIComponent(top.location.href)];for(var t in l)"undefined"!=typeof l[t]&&e.push(t+"="+encodeURIComponent(l[t]));var n=this.config.hosts.pf+"/print/?"+e.join("&");this.autoStart?top.location.replace(n):top.location.href=n},supportedSiteType:function(){return"about:blank"!==f.config.urls.page&&("http:"===f.config.protocol||"https:"===f.config.protocol)},setStats:function(){f.stats.page={bm:s.isBookmarklet(),dynamic:s.isDynamicPage(),local:s.isLocalHost(),unSupported:s.isWix()||s.isOverBlog()}},skipRedirectReasons:[{name:"noApiResponse",check:function(){return!f.dsData}},{name:"adFree",check:function(){return f.dsData.domain_settings.ad_free}},{name:"isDynamicPage",check:function(){return s.isDynamicPage()}},{name:"isLocalHost",check:function(){return s.isLocalHost()}},{name:"unSupportedBySS",check:function(){return s.isWix()||s.isOverBlog()}},{name:"ApiButtonOrExtensionRedirectFalse",check:function(){return!s.isBookmarklet()&&!f.dsData.domain_settings.redirect}},{name:"BMExt",check:function(){return s.isBookmarklet()}}],forceRedirectReasons:[{name:"unSupportedBrowser",check:function(){try{var e=navigator.userAgent.match(/Edge\/(\d+.\d+)/),t=e&&e[1]&&parseFloat(e[1])<79,n=/^((.+\.)?jhana-dev\.com|(.+\.)?jhana-stage\.com|(.+\.)?jhana\.com|guide\.matrix\.ip\.com|guide\.ip\.com|componentagro\.test\.huss\.nl|componentagro\.nl|hansa-online\.de|binnenschifffahrt-online\.de|mikrooek-apotheke\.de)$/;return!(!t||n.test(f.config.domains.page))||!(s.isBookmarklet()||history&&"function"==typeof history.pushState&&!navigator.userAgent.match(/(ipod|opera.mini|blackberry|playbook|bb10)/i)&&!f.browser.isIE)}catch(e){return exTracker.log(e),!1}}},{name:"printRestrictedByCSP",check:function(){return f.config.domains.page.match(/yahoo\.com|techcrunch\.com/)}}],runChecksFor:function(e){for(var t=0,n=e.length;t<n;t++){var i=e[t];if(i.check())return i}},__redirectChecksResult:null,runRedirectChecks:function(){if(this.__redirectChecksResult)return this.__redirectChecksResult;var e=this.runChecksFor(this.skipRedirectReasons);if(!e)return{redirect:!0};var t=this.runChecksFor(this.forceRedirectReasons);return t?{reason:t.name,redirect:!0}:(this.__redirectChecksResult={reason:e.name,redirect:!1},this.__redirectChecksResult)},createMask:function(){var e=document.createElement("div");e.innerHTML='<div id="pf-mask" style="z-index: 2147483627!important; position: fixed !important; top: 0pt !important; left: 0pt !important; background-color: rgb(0, 0, 0) !important; opacity: 0.8 !important;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=80); height: 100% !important; width: 100% !important;"></div>',document.body.appendChild(e.firstChild)},closePreview:function(){d.readyBound=!1,d.isReady=!1,f.unsanitizeLocation();var e=document.getElementById("pf-core");e&&e.parentElement&&e.parentElement.removeChild(e);var t=document.getElementById("pf-mask");t&&t.parentElement&&t.parentElement.removeChild(t);var n=document.getElementById("gaiframe");n&&n.parentElement&&n.parentElement.removeChild(n)},removeDoubleSemiColon:function(e){return e.replace(/;{2}/g,";")},loadCore:function(){e.coreIframe=commonUtils.createIframe(document),coreIframe.id="pf-core",coreIframe.name="pf-core",document.body.appendChild(coreIframe);var t=coreIframe.style.cssText+";width: 100% !important;max-width:100vw !important;height: 100% !important; max-height:100vh !important; display: block !important; overflow: hidden !important; position: absolute !important; top: 0px !important; left: 0px !important; background-color: transparent !important; z-index: 2147483647!important";if(coreIframe.style.cssText=this.removeDoubleSemiColon(t),this.config.isExtension)coreIframe.src=extensionPath+"/core.html",coreIframe.onload=function(){messageBus.postMessage("core","PfInitCoreExtension",{extensionRootTabId:e.extensionRootTabId})};else{var n='<!DOCTYPE html><html><head><base target="_parent"><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="viewport" content="width=device-width, initial-scale=1"><script src="'+this.config.urls.js.jquery+'"></script>';f.onServer||(n+='<script src="'+this.config.urls.js.raven+'"></script>'),n+='<script src="'+this.config.urls.js.core+'"></script><link media="screen" type="text/css" rel="stylesheet" href="'+this.config.urls.css.pfApp+'"></head><body class="cs-core-iframe" style="visibility: hidden;" onload="core.init();"></body>',commonUtils.loadHtmlInIframe(document,coreIframe,n)}},getAdSettingsFromPFServer:function(){var e=document.createElement("script");e.src=f.config.hosts.ds_cdn+"/api/v3/domain_settings/a?callback=pfMod.saveAdSettings&hostname="+f.config.hosts.page+"&client_version="+f.version,document.getElementsByTagName("head")[0].appendChild(e)},saveAdSettings:function(t){f.dsData=t,e.coreIframe&&coreIframe.contentWindow&&messageBus.postMessage("core","PfConfigureAdSettings",{dsData:t})}},u={emailText:function(){var e=document.getElementsByClassName("pf-email");return e.length?e[0].textContent:""},csStyleSheetHrefs:function(){var e=[];for(i=0;i<t.styleSheets.length;i++)e.push(t.styleSheets[i].href);return e},metas:function(){var e=t.getElementsByTagName("meta"),n=[];for(i=0;i<e.length;i++)n.push({name:e[i].getAttribute("name"),content:e[i].getAttribute("content"),property:e[i].getAttribute("property"),itemprop:e[i].getAttribute("itemprop")});return n},screen:function(){return{x:"undefined"!=typeof e.top.screenX?e.top.screenX:e.top.screenLeft,y:"undefined"!=typeof e.top.screenY?e.top.screenY:e.top.screenTop,width:"undefined"!=typeof e.top.outerWidth?e.top.outerWidth:e.top.document.documentElement.clientWidth,height:"undefined"!=typeof e.top.outerHeight?e.top.outerHeight:e.top.document.documentElement.clientHeight-22}},language:function(){var e=document.getElementsByTagName("html")[0].getAttribute("lang");if(!e){var t=document.querySelector("meta[http-equiv=Content-Language]");t&&(e=t.getAttribute("content"))}return e},canvasDataUrls:function(){for(var e=[],n=t.getElementsByTagName("canvas"),i=0;i<n.length;i++)try{var o=n[i],r=o.toDataURL("image/png");o.setAttribute("pf-dataurl-index",e.length),e.push(r)}catch(e){}return e},favicon:function(){return"https://s2.googleusercontent.com/s2/favicons?domain="+e.location.host},enablePrintOnly:function(e){return!!e.querySelector('.at-svc-printfriendly, a[href*="printfriendly.com"], script[src*="//cdn.printfriendly.com"], img[src*="//cdn.printfriendly.com"]')||f.config.enablePrintOnly},get:function(){f.config.extensionId=e.extensionId,f.config.extensionRootTabId=e.extensionRootTabId,f.config.extensionPath=e.extensionPath;var n=this.canvasDataUrls(),i=document.location;return page={dir:t.body.getAttribute("dir")||t.querySelector("html").getAttribute("dir")||getComputedStyle(t.body).getPropertyValue("direction")||"ltr",bodyClassList:[].slice.call(t.body.classList||t.body.className.split(" ")),emailText:this.emailText(),screen:this.screen(),metas:this.metas(),csStyleSheetHrefs:this.csStyleSheetHrefs(),location:{href:i.href,host:i.host,pathname:i.pathname,protocol:i.protocol},enablePrintOnly:this.enablePrintOnly(t),hasPrintOnly:!!t.querySelector("#print-only, .print-only"),title:document.title,body:document.body.innerHTML,language:this.language(),canvasDataUrls:n,favicon:this.favicon()},{startTime:f.startTime,config:f.config,userSettings:f.userSettings,version:f.version,onServer:f.onServer,browser:f.browser,urlHasPII:f.urlHasPII,dsData:f.dsData,stats:f.stats,page:page}}},m={copyEmbeded:function(){var e,n,i;for(e=t.querySelectorAll("twitter-widget.twitter-tweet-rendered"),i=e.length-1;i>=0;i--)n=e[i],messageBus.postMessage("core","PfTwitterWidgetShadowDom",{id:n.id,innerHTML:n.shadowRoot.innerHTML,cssText:n.style.cssText});for(e=t.querySelectorAll("iframe.twitter-tweet-rendered, .twitter-tweet-rendered iframe"),i=e.length-1;i>=0;i--)e=e[i],messageBus.postMessage("core","PfTwitterTweetRendered",{id:n.id,head:n.contentDocument.head.innerHTML,body:n.contentDocument.body.innerHTML,cssText:n.style.cssText})}},p={LARGE_IMAGE_WIDTH:300,LARGE_IMAGE_HEIGHT:200,run:function(){this.processChildren(document.body)},processChildren:function(t){var n,i,o=[];if(t.children&&t.children.length)for(var r=0,a=t.children.length;r<a;r++)o.push(t.children[r]);for(var s=null;s=o.shift();)if(!commonUtils.hasClass(s,"comment-list")){if(s.nodeType===Node.ELEMENT_NODE)try{n=s.nodeName.toLowerCase();var c=persistComputedStylesAndRect(s);if(i=c.style,e.pfShowHiddenContent||"none"!==i.display&&"hidden"!==i.visibility?commonUtils.hasClass(s,"hidden-originally")&&commonUtils.removeClassFrom(s,"hidden-originally"):commonUtils.addClassTo(s,"hidden-originally"),"a"===n)href=s.getAttribute("href"),href&&"#"!==href.charAt(0)&&(s.href=s.href);else if("input"!==n&&"textarea"!==n||pfMod.onServer)if("select"!==n||pfMod.onServer){if("img"===n||"svg"===n){s.src=s.src;var d=s.getAttribute("srcset");if(d){for(var l=d.split(/,\s?/),u=[],m=0;m<l.length;m++){var p=l[m];u.push(toAbsoluteUrl(p,f.config))}s.setAttribute("pf-data-srcset",u.join(", "))}if("img"===n&&!commonUtils.hasClass(s,"hidden-originally")){var h=commonUtils.getImageHeight(s,pfMod.onServer),g=commonUtils.getImageWidth(s,pfMod.onServer);g*h>this.LARGE_IMAGE_WIDTH*this.LARGE_IMAGE_HEIGHT&&commonUtils.addClassTo(s,"pf-large-image")}}}else s.options[s.selectedIndex].setAttribute("selected","selected");else"radio"===s.type||"checkbox"===s.type?s.checked&&s.setAttribute("checked","checked"):s.setAttribute("value",s.value)}catch(e){}if(s.children&&s.children.length)for(var r=0,a=s.children.length;r<a;r++)o.push(s.children[r])}}};return f}(window);window.pfMod=pfMod;var priFri=pfMod;pfMod.initialized&&(document.getElementById("printfriendly-data")||window.extensionPath)?pfMod.start():"algo"===window.name||"pf-core"===window.name||pfMod.initialized||pfMod.init(window.pfOptions);