﻿function toCdnUrl(e){var t=pfData.config.hosts.cdn;return 0===e.indexOf(t)?e:t+e}var logger=function(){var e={init:function(t){$.each(["log","error","time","timeEnd"],function(n,a){t.config.enableLog?e[a]=Function.prototype.bind.call(console[a],console):e[a]=$.noop})}};return e}(),commonUtils={hasClass:function(e,t){return e.nodeType===Node.ELEMENT_NODE&&(e.classList?e.classList.contains(t):(e.getAttribute("class")||"").split(/\s/).indexOf(t)>=0)},addClassTo:function(e,t){e.nodeType===Node.ELEMENT_NODE&&(commonUtils.hasClass(e,t)||(e.classList?e.classList.add(t):e.className=(e.className||"")+" "+t))},removeClassFrom:function(e,t){if(e.nodeType===Node.ELEMENT_NODE&&commonUtils.hasClass(e,t))if(e.classList)e.classList.remove(t);else{var n=(e.getAttribute("class")||"").split(" "),a=n.indexOf(t);a>=0&&n.splice(a,1),e.setAttribute("class",n.join(" "))}},getImageWidth:function(e,t){e.jquery&&(e=e[0]);var n=null;if(t){var a=e.getAttribute("pf-data-width");a&&(n=parseInt(a,10))}else e.getAttribute("data-pf_rect_width")&&(n=parseInt(e.getAttribute("data-pf_rect_width"),10));return(null===n||0===n||"number"!=typeof n||isNaN(n))&&(n=e.getBoundingClientRect().width),n},getImageHeight:function(e,t){e.jquery&&(e=e[0]);var n=null;if(t){var a=e.getAttribute("pf-data-height");a&&(n=parseInt(a,10))}else e.getAttribute("data-pf_rect_height")&&(n=parseInt(e.getAttribute("data-pf_rect_height"),10));return(null===n||0===n||"number"!=typeof n||isNaN(n))&&(n=e.getBoundingClientRect().height),n},MAX_SVG_SIZE:200,MAX_SVG_ICON_SIZE:21,ICON_REGEXP:/icon/i,svgMaxValue:function(e){return this.ICON_REGEXP.test(e.getAttribute("class")||"")?this.MAX_SVG_ICON_SIZE:this.MAX_SVG_SIZE},svgViewBox:function(e){var t=e.getAttribute("viewBox");if(t){var n=t.split(" ");if(4===n.length)return{width:parseInt(n[2],10),height:parseInt(n[3],10)}}return{}},INFINITY:1e6,getSvgImageWidth:function(e,t){var n=this.getImageWidth(e,t)||this.INFINITY,a=this.svgMaxValue(e),i=this.svgViewBox(e).width||this.INFINITY;return Math.min(n,a,i)},getSvgImageHeight:function(e,t){var n=this.getImageHeight(e,t),a=this.svgMaxValue(e),i=this.svgViewBox(e).height||this.INFINITY;return Math.min(n,a,i)},getTopWrapper:function(e){var t=e.parentNode;return t.childNodes.length>1?e:this.getTopWrapper(t)},isDeletableElement:function(){return function(e){return!commonUtils.hasClass(e,"non-delete")&&(e.matches("small, footer, header, aside, details, dialog, figure, nav, summary, twitter-widget, p, img, blockquote, h1, h2, h3, h4, h5, h6, ol, ul, li, a, table, td, pre, span, code, dl, dt, dd, hr, div.pf-caption, video, figcaption, data")||$(e).find("*:visible").length<=15)}}(),resizeImageCssClass:function(e){return"pf-size-"+e.replace("-size","").replace("-images","")},addCSS:function(e,t,n){var a=n?"body":"head",i=t.getElementsByTagName(a)[0],s=t.createElement("style");s.type="text/css",s.setAttribute("name","pf-style"),s.styleSheet?s.styleSheet.cssText=e:s.appendChild(t.createTextNode(e)),i.appendChild(s)},createIframe:function(e){var t=e.createElement("iframe");return t.frameBorder="0",t.allowTransparency="true",t},loadHtmlInIframe:function(e,t,n){var a,i;try{i=t.contentWindow.document}catch(n){a=e.domain,t.src="javascript:var d=document.open();d.domain='"+a+"';void(0);",i=t.contentWindow.document}i.write(n),i.close()}};Element.prototype.matches||(Element.prototype.matches=Element.prototype.matchesSelector||Element.prototype.mozMatchesSelector||Element.prototype.msMatchesSelector||Element.prototype.oMatchesSelector||Element.prototype.webkitMatchesSelector||function(e){for(var t=(this.document||this.ownerDocument).querySelectorAll(e),n=t.length;--n>=0&&t.item(n)!==this;);return n>-1}),String.prototype.startsWith||(String.prototype.startsWith=function(e,t){return t=!t||t<0?0:+t,this.substring(t,t+e.length)===e});var exTracker=function(){function e(){return"production"===m.environment}function t(){return"development"===m.environment}function n(){return!!c.Raven}function a(){try{c.frames["pf-core"]&&c.frames["pf-core"].document&&(c=c.frames["pf-core"],d=c.document)}catch(e){}}function i(){if(p)return!0;if(p=!0,a(),null===d)return!1;var e=d.createElement("script"),t=d.getElementsByTagName("script")[0];e.src=this.config.urls.js.raven,t.parentNode.appendChild(e),s()}function s(){if(!n())return setTimeout(s,100);r(),o()}function o(){for(var e=0,t=u.length;e<t;e++){var n=u[e];l(n.err,n.opts)}}function r(){var e={dataCallback:function(e){try{var t=e.stacktrace.frames[0];t.filename.match(f)&&"onload"!==t["function"]||e.stacktrace.frames.shift()}catch(e){}return e},shouldSendCallback:function(e){return!!(e&&e.extra&&e.extra.file)},release:h};c.Raven.config(m.hosts.ravenDsn,e).install()}function l(t,n){n=n?{file:n.file}:{file:"printfriendly.js"},n.usingBM=m.usingBM,n.url=m.urls.page,e()&&c.Raven.captureException(t,{extra:n})}var c=window.top,d=null,p=!1,f=/d3nekkt1lmmhms|printfriendly\.com|printnicer\.com|algo\.js|printfriendly\.js|core\.js/,u=[],g=[],m={},h=null;return{init:function(e,t){m=e.config,h=e.version,"production"!==e.config.environment||e.onServer?t():Raven.context(t)},log:function(e,a){t()&&(console.error(e),console.error(e.stack)),a=a||{file:"printfriendly.js"};try{n()?l(e,a):(u.push({err:e,opts:a}),i(),g.push(e.name+" : "+e.message),g.push(e.stack))}catch(e){}}}}(),pdfUtils=function(){var e=function(e){var t=[],n=$.Deferred(),a=$(e);return $("twitter-widget, iframe.twitter-tweet-rendered, .twitter-tweet-rendered iframe",a).each(function(e,n){var a=n.getAttribute("data-tweet-id");t.push($.ajax({url:"https://api.twitter.com/1/statuses/oembed.json?omit_script=t&id="+a,dataType:"jsonp",timeout:5e3,success:function(e){$(n).replaceWith(e.html)}}))}),$.when.apply($,t).always(function(){var e=$("<div>").append(a).html();n.resolve(e)}),n};return{extractContent:function(t){return e(t)}}}(),messageBus=function(){var e=!1;return{postMessage:function(e,t,n){"root"===e?chrome.tabs.sendMessage(window.extensionRootTabId,{type:t,payload:n}):chrome.runtime.sendMessage({type:t,payload:n})},listen:function(t,n){e||(chrome.runtime.onMessage.addListener(function(e){try{if(!e)return;var a=e.type;if(!a)return;var i=t[a];if(!i)return;i(e.payload)}catch(e){if(!n)throw e;n(e)}}),e=!0)}}}(),originalWindow=window.parent,pfData={},algoData={},nativeTrim="".trim;"function"==typeof nativeTrim&&($.trim=function(e){return null!=e?nativeTrim.call(e):""}),String.prototype.removeSpaces=function(){return this.replace(/&nbsp;/g,"").replace(/\s+/g,"")},Cookie={set:function(e,t,n){var a;if(n){var i=new Date;i.setTime(i.getTime()+24*n*60*60*1e3),a="; expires="+i.toGMTString()}else a="";document.cookie=e+"="+t+a+"; path=/"},get:function(e){for(var t=e+"=",n=document.cookie.split(";"),a=0;a<n.length;a++){for(var i=n[a];" "==i.charAt(0);)i=i.substring(1,i.length);if(0==i.indexOf(t))return i.substring(t.length,i.length)}return null},erase:function(e){createCookie(e,"",-1)}};var PfStartCoreHandler=function(e){e.pfData&&($.extend(pfData,e.pfData),exTracker.init(pfData,function(){core.start()}))};messageBus.listen({PfStartCore:PfStartCoreHandler,PfLaunchCore:function(){core.launch()},PfAlgoLoaded:function(){messageBus.postMessage("algo","PfStartAlgo",{pfData:pfData})},PfExtensionAlgoLoaded:function(){messageBus.postMessage("algo","PfLoadAlgo",{pfData:pfData})},PfRunPostAlgoProcesses:function(e){core.contentData=e.contentData,core.runPostAlgoProcesses()},PfGaEvent:function(e){analytics.sendEvent(e.category,e.action,e.label)},PfTwitterWidgetShadowDom:function(e){messageBus.postMessage("algo","PfTwitterWidgetShadowDom",e)},PfTwitterTweetRendered:function(e){messageBus.postMessage("algo","PfTwitterTweetRendered",e)},PfConfigureAdSettings:function(e){pfData.dsData=e.dsData,ad.configureAdSettings()},PfNSFWChecked:function(e){core.nsfwResult={state:e.state,matchedPhrase:e.matchedPhrase},core.runPostAlgoProcesses()},PfPdfOkEvent:function(){utils.formSubmitted=!0,0!=utils.pdfFailedSubmit&&librato.sendPDFResubmitStatus("cs.pdf.resubmit.success")}});var BrowserDetect={init:function(){this.browser=this.searchString(this.dataBrowser)||"An unknown browser",this.version=this.searchVersion(navigator.userAgent)||this.searchVersion(navigator.appVersion)||"an unknown version",this.OS=this.searchString(this.dataOS)||"an unknown OS"},searchString:function(e){for(var t=0;t<e.length;t++){var n=e[t].string,a=e[t].prop;if(this.versionSearchString=e[t].versionSearch||e[t].identity,n){if(-1!=n.indexOf(e[t].subString))return e[t].identity}else if(a)return e[t].identity}},searchVersion:function(e){var t=e.indexOf(this.versionSearchString);if(-1!=t)return parseFloat(e.substring(t+this.versionSearchString.length+1))},dataBrowser:[{string:navigator.userAgent,subString:"Chrome",identity:"Chrome"},{string:navigator.userAgent,subString:"OmniWeb",versionSearch:"OmniWeb/",identity:"OmniWeb"},{string:navigator.vendor,subString:"Apple",identity:"Safari",versionSearch:"Version"},{prop:window.opera,identity:"Opera",versionSearch:"Version"},{string:navigator.vendor,subString:"iCab",identity:"iCab"},{string:navigator.vendor,subString:"KDE",identity:"Konqueror"},{string:navigator.userAgent,subString:"Firefox",identity:"Firefox"},{string:navigator.vendor,subString:"Camino",identity:"Camino"},{string:navigator.userAgent,subString:"Netscape",identity:"Netscape"},{string:navigator.userAgent,subString:"MSIE",identity:"Explorer",versionSearch:"MSIE"},{string:navigator.userAgent,subString:"Gecko",identity:"Mozilla",versionSearch:"rv"},{string:navigator.userAgent,subString:"Mozilla",identity:"Netscape",versionSearch:"Mozilla"}],dataOS:[{string:navigator.platform,subString:"Win",identity:"Windows"},{string:navigator.platform,subString:"Mac",identity:"Mac"},{string:navigator.userAgent,subString:"iPhone",identity:"iPhone/iPod"},{string:navigator.platform,subString:"Linux",identity:"Linux"}]};try{BrowserDetect.init()}catch(e){}var imageFreeDomains=["naturesgarden.co.za","cehd.gmu.edu","azaleafalls.com","americantrails.org"],deleteDisabledDomains=["tourismresearchmt.org","equalvoiceforfamilies.org","mansmith.net","matthewlberg.com","qrgtx.com","withoutreservation.org","knitting-and.com","sbdcnet.org","inglesonline.com.br","courtroomlogic.com","rachaelcampbell.com","cateringbyanne.com","fundschoolhouse.com","shulamitgallery.com","thekitchencousins.com","prouds.com.fj","lawnow.org","rohanphoto.com","kerrygoldusa.com"],settings={hideImages:!1,disableClickToDel:!1,infoFetchedFromServer:!1,algoRunFinished:!1,localizedClickToDelTitle:"click to delete",clickToDelElements:"small, footer, header, aside, details, dialog, figure, nav, summary, twitter-widget, p, img, blockquote, h1, h2, h3, h4, h5, h6, ol, ul, li, a, table, td, pre, span, code, dl, dt, dd, hr, div.pf-caption, video, figcaption, data",nonClickToDelElements:"#pf-title, #pf-src, #pf-src-icon, .pf-src-icon, .pf-src-name, .pf-src-url",publisherNonClickToDelElements:"#copyright, .copyright, .delete-off, .delete-no",useGA:!1,setup:function(){var e=this;$.each(imageFreeDomains,function(t,n){if(-1!=pfData.config.domains.page.indexOf(n))return e.hideImages=!0,!1}),$.each(deleteDisabledDomains,function(t,n){if(-1!=pfData.config.domains.page.indexOf(n))return e.disableClickToDel=!0,!1}),1===parseInt(pfData.userSettings.disableClickToDel)&&(this.disableClickToDel=!0),"remove-images"===pfData.userSettings.imagesSize&&(this.hideImages=!0),this.setupUseGA()},setupUseGA:function(){if(pfData.dsData){var e=!pfData.dsData.domain_settings.ad_free;"production"===pfData.config.environment&&!pfData.onServer&&e&&(this.useGA=!0)}}},utils={formSubmitted:!1,pdfSubmitCheckInterval:15e3,pdfFailedSubmit:0,pdfFailedSubmitLimit:1,checkFormSubmission:function(){if(utils.pdfFailedSubmit>=utils.pdfFailedSubmitLimit)return void librato.sendPDFResubmitStatus("cs.pdf.resubmit.failed");utils.formSubmitted||(utils.pdfFailedSubmit++,$("#pf-pdf-form").submit(),setTimeout(function(){utils.checkFormSubmission()},utils.pdfSubmitCheckInterval))}},ad={created:!1,adSettings:{status:"not-loaded",adFree:!0,brandFree:!0},configureAdSettings:function(){if(pfData.dsData){var e=pfData.dsData;try{ad.adSettings.adFree=e.domain_settings.ad_free,ad.adSettings.adType=e.domain_settings.ad_type,ad.adSettings.brandFree=e.domain_settings.brand_free,ad.adSettings.classification=e.domain_settings.classification,ad.adSettings.adsense_account=e.adsense_account,"not-loaded"!==ad.adSettings.status&&"loading"!==ad.adSettings.status||(ad.adSettings.status="loaded"),("gray"===e.domain_settings.classification||ui.dialogVisible)&&ad.create(),ui.dialogVisible&&ad.show(),ui.showBrandingIfAllowed(),ad.adSettings.adFree&&analytics.sendEvent("Monetization","Ad-Free"),ad.adSettings.brandFree&&analytics.sendEvent("Monetization","Brand-Free"),librato.sendStats()}catch(e){exTracker.log(e)}}},create:function(){!this.created&&this.canShow()&&(this.created=!0,ad.adSettings.adType=-1!==ad.adSettings.adType.indexOf("adsense")?"uncategorized":ad.adSettings.adType,ad.createAdByType(ad.adSettings.adType))},createAdByType:function(e){messageBus.postMessage("root","PfCreateByAdType",{adType:e})},show:function(){this.canShow()&&($("#pf-dialog-content").show(),messageBus.postMessage("root","PfShowAds"))},hide:function(){messageBus.postMessage("root","PfHideAds"),$("#pf-dialog-content").hide()},canShow:function(){return"test"!==pfData.config.environment&&"loaded"===this.adSettings.status&&!pfData.urlHasPII&&!this.adSettings.adFree}},core={deletedNodes:[],deletedNodesCss:[],waitBodyCounter:0,waitDsCounter:0,launched:!1,init:function(){if(this.waitBodyCounter+=1,this.waitBodyCounter<30&&!document.body)return setTimeout(function(){core.init()},13*this.waitBodyCounter);messageBus.postMessage("root","PfCoreLoaded")},start:function(){if(pfData.config.isExtension&&(0===this.waitDsCounter&&this.getAdSettingsFromPFServer(),this.waitDsCounter+=1,this.waitDsCounter<20))return setTimeout(function(){core.start()},100);this.launch()},launch:function(){if(!this.launched){this.launched=!0;try{logger.init(pfData),logger.time("Core.js Time"),settings.setup(),pfData.onServer||(pfData.config.isExtension||ad.configureAdSettings(),this.checkPII(),analytics.init(),this.getTranslationsFromPFServer(),this.resetStyles(),this.addViewPortTag()),ui.setup(),this.createAlgoIframe(),logger.timeEnd("Core.js Time"),analytics.sendPageView("preview"),pfData.config.pfstyle&&analytics.sendEvent("PfStyle",pfData.config.pfstyle),pfData.config.usingBM?analytics.sendEvent("Product","Bookmarklet or Extension"):analytics.sendEvent("Product","Publisher"),messageBus.postMessage("root","PfRunRedirectChecks")}catch(e){exTracker.log(e)}}},resetStyles:function(){var e="body, body * { z-index: 0 !important; }html, body {overflow: hidden !important;height: 100% !important;margin: 0 !important;position: static !important;margin: 0px !important;padding: 0px !important;overflow: hidden !important;}";pfData.browser.isIE&&(e+="body {overflow-y: hidden !important;background-color: transparent !important;}"),messageBus.postMessage("root","PfAddCSS",{css:e})},restoreStyles:function(){messageBus.postMessage("root","PfRestoreStyles")},addViewPortTag:function(){messageBus.postMessage("root","PfAddViewPortTag")},showOriginalPage:function(){algoData.doc.body.innerHTML="",document.getElementById("algo-iframe").contentWindow.location.replace(pfData.config.urls.page.replace("pfstyle=wp","").replace(/#(.*)$/,"")),this.enableOnlyPrint()},enableOnlyPrint:function(){$(".pf-edit, .pf-actions #w-pdf, .pf-actions #w-email").remove(),toolbar.printOnlySetup()},createAlgoIframe:function(){var e=pfData.page.title,t="";""!==$.trim(pfData.userSettings.customCSSURL)&&(t='<link media="screen,print" type="text/css" rel="stylesheet" href="'+$.trim(pfData.userSettings.customCSSURL)+'">');var n=commonUtils.createIframe(document);if(n.id="algo-iframe",n.name="algo",commonUtils.addClassTo(n,"js-print-area"),commonUtils.addClassTo(n,"flex-auto"),pfData.config.disableUI?(n.height="500px",n.width="80%",document.body.appendChild(n)):document.getElementById("insert-content").appendChild(n),pfData.config.isExtension)n.src=pfData.config.extensionPath+"/algo.html",n.onload=function(){messageBus.postMessage("algo","PfInitAlgoExtension",{extensionRootTabId:window.extensionRootTabId});try{algoWindow=n.contentWindow,algoWindow&&algoWindow.document&&(algoWindow.document.title=e),messageBus.postMessage("algo","PfLoadAlgo",{pfData:pfData},function(){messageBus.postMessage("root","PfExtensionAlgoLoaded")})}catch(e){}};else{algoWindow=n.contentWindow;var a='<!DOCTYPE html><html><head><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+e+'</title><script src="'+pfData.config.urls.js.jquery+'"></script>';pfData.onServer||(a+='<script src="'+pfData.config.urls.js.raven+'"></script>'),a+='<script src="'+pfData.config.urls.js.algo+'"></script><link media="screen,print" type="text/css" rel="stylesheet" href="'+pfData.config.urls.css.content+'">'+t+'</head><body class="content-unmask cs-algo-iframe px-2 px-sm-4 px-md-5 pt-2 pt-sm-3" onload="setup.init();"></body>',commonUtils.loadHtmlInIframe(document,n,a)}},checkPII:function(){var e,t=[];if(document.location&&document.location.ancestorOrigins){var n=document.location.ancestorOrigins;for(e=n.length-1;e>=0;e--)t.push(n[e])}for(document.location&&document.location.href&&t.push(document.location.href),document.referrer&&t.push(document.referrer),e=t.length-1;e>=0;e--)if(-1!==t[e].indexOf("?")){pfData.urlHasPII=!0,ad.adSettings.status="pii-detected";break}},configureTranslations:function(e){try{$(".localize").map(function(){this.innerHTML=e.translations[this.id]||e.translations[this.getAttribute("translationKey")]||this.innerHTML}),settings.localizedClickToDelTitle=e.translations["delete"],settings.infoFetchedFromServer=!0}catch(e){exTracker.log(e)}},getTranslationsFromPFServer:function(){$.ajax({url:pfData.config.hosts.translations+"/api/v3/translations/all",dataType:"jsonp",jsonpCallback:"core.configureTranslations"})},runPostAlgoProcesses:function(){if(core.contentData&&core.nsfwResult){contentData=core.contentData,contentData.nsfwState=core.nsfwResult.state,contentData.nsfwMatchedPhrase=core.nsfwResult.matchedPhrase,logger.time("Post Algo Process Time"),settings.algoRunFinished=!0;try{pfData.page.dir="rtl"===pfData.page.dir.toLowerCase()?"rtl":contentData.dir,algoData.doc=algoWindow.document,contentData.hasContent?(this.processText(),pfData.onServer||(toolbar.setup(),settings.hideImages&&this.hideImages(!0),this.setupFontSize(),messageBus.postMessage("root","PfTwitterCopyEmbeded"))):pfData.onServer||this.showOriginalPage(),messageBus.postMessage("root","PfScrollTop"),ui.hideLoader(),messageBus.postMessage("root","PfFinished",{hasContent:contentData.hasContent}),ad.created&&analytics.sendEvent("CreatedAd",ad.adSettings.adType+": class="+ad.adSettings.classification+" nsfw="+core.nsfwResult.state,core.nsfwResult.matchedPhrase),logger.timeEnd("Post Algo Process Time"),logger.log("Total Time: "+((new Date).getTime()-pfData.startTime)+" ms")}catch(e){exTracker.log(e)}}},customPrint:function(){var e=frames.algo;e.focus(),pfData.browser.isIE?e.document.execCommand("print",!1,null):e.print()},resizeImages:function(e){var t=commonUtils.resizeImageCssClass(e);$(".flex-width",algoData.doc).removeClass("pf-size-full pf-size-large pf-size-medium pf-size-small pf-size-remove").addClass(t)},hideImages:function(e){var t="#pf-content";$(t+" img",algoData.doc).toggleClass("pf-hidden",e),$(t+" img.thumbimage",algoData.doc).parents(".thumbinner").toggleClass("pf-hidden",e),$(t+" img",algoData.doc).parents(".img-separator").toggleClass("pf-hidden",e)},processText:function(){$("body",algoData.doc).append('<br style="clear:both">').addClass("direction-"+pfData.page.dir),$("body",algoData.doc).append('<br style="clear:both">'),$("#pf-content, #pf-title",algoData.doc).css({direction:pfData.page.dir});try{$("#pf-content a, #pf-content li",algoData.doc).each(function(){var e=$(this);""===e.text().removeSpaces()&&0===e.find("img,canvas,svg").length&&e.remove()}),$("#pf-content div.separator",algoData.doc).each(function(){var e=$(this),t=e.next(),n=e.prev();e.children().length==e.find("a,br").length&&(e.addClass("img-separator"),0===n.find("img").length&&""===n.text().removeSpaces()&&n.remove(),0===t.find("img").length&&""===t.text().removeSpaces()&&t.remove()),0===e.find("a,img").length&&""===e.text().removeSpaces()&&e.remove()})}catch(e){logger.log("processText failed")}},setupFontSize:function(){var e=Cookie.get("printfriendly-font-class");e||(e="pf-12"),$("#text-size").val(e).trigger("change")},getAdSettingsFromPFServer:function(){var e=document.createElement("script");e.src=pfData.config.hosts.ds_cdn+"/api/v3/domain_settings/a?callback=core.saveAdSettings&hostname="+pfData.config.hosts.page+"&client_version="+pfData.version,document.getElementsByTagName("head")[0].appendChild(e)},saveAdSettings:function(e){this.launched||messageBus.postMessage("root","PfRedirectIfNecessary",{dsData:e}),pfData.dsData=e,ad.configureAdSettings()}},ui={dialogVisible:!1,setup:function(){this.fillBody()},showBrandingIfAllowed:function(){ad.adSettings.brandFree||$("body").addClass("show-pf-branding")},fillBody:function(){document.body.innerHTML=pfData.config.disableUI?"":this.bodyHTML()},bodyHTML:function(){return['<form id="pf-pdf-form" method="post" action="'+pfData.config.urls.pdfMake+'" target="pdf_iframe" accept-charset="UTF-8">','<input type="hidden" name="hostname" value="">','<input type="hidden" name="url" value="">','<input type="hidden" name="platform" value="">','<input type="hidden" name="source" value="cs">','<input type="hidden" name="code" value="" >','<input name="iehack" type="hidden" value="&#9760;">','<input type="hidden" name="title" value="" >','<input type="hidden" name="content_css_url" value="" >','<input type="hidden" name="custom_css_url" value="" >','<input type="hidden" name="dir" value="" >','<input type="hidden" name="cs_adfree" value="" >',"</form>",'<svg style="position: absolute; overflow: hidden;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs>','<symbol id="icon-reply" viewBox="0 0 32 32"><path d="M4.687 11.119l9.287 8.933v-5.412c2.813 0 9.973 0.062 9.973 7.426 0 3.855-2.734 7.072-6.369 7.816 5.842-0.792 10.359-5.747 10.359-11.806 0-11.256-12.026-11.352-13.963-11.352v-4.606l-9.287 9.001z"></path></symbol>','<symbol id="icon-download" viewBox="0 0 26 28"><path d="M20 21c0-0.547-0.453-1-1-1s-1 0.453-1 1 0.453 1 1 1 1-0.453 1-1zM24 21c0-0.547-0.453-1-1-1s-1 0.453-1 1 0.453 1 1 1 1-0.453 1-1zM26 17.5v5c0 0.828-0.672 1.5-1.5 1.5h-23c-0.828 0-1.5-0.672-1.5-1.5v-5c0-0.828 0.672-1.5 1.5-1.5h7.266l2.109 2.125c0.578 0.562 1.328 0.875 2.125 0.875s1.547-0.313 2.125-0.875l2.125-2.125h7.25c0.828 0 1.5 0.672 1.5 1.5zM20.922 8.609c0.156 0.375 0.078 0.812-0.219 1.094l-7 7c-0.187 0.203-0.453 0.297-0.703 0.297s-0.516-0.094-0.703-0.297l-7-7c-0.297-0.281-0.375-0.719-0.219-1.094 0.156-0.359 0.516-0.609 0.922-0.609h4v-7c0-0.547 0.453-1 1-1h4c0.547 0 1 0.453 1 1v7h4c0.406 0 0.766 0.25 0.922 0.609z"></path></symbol>','<symbol id="icon-text-height" viewBox="0 0 28 28"><path d="M27.25 22c0.688 0 0.906 0.438 0.484 0.984l-1.969 2.531c-0.422 0.547-1.109 0.547-1.531 0l-1.969-2.531c-0.422-0.547-0.203-0.984 0.484-0.984h1.25v-16h-1.25c-0.688 0-0.906-0.438-0.484-0.984l1.969-2.531c0.422-0.547 1.109-0.547 1.531 0l1.969 2.531c0.422 0.547 0.203 0.984-0.484 0.984h-1.25v16h1.25zM1.266 2.016l0.844 0.422c0.109 0.047 2.969 0.078 3.297 0.078 1.375 0 2.75-0.063 4.125-0.063 1.125 0 2.234 0.016 3.359 0.016h4.578c0.625 0 0.984 0.141 1.406-0.453l0.656-0.016c0.141 0 0.297 0.016 0.438 0.016 0.031 1.75 0.031 3.5 0.031 5.25 0 0.547 0.016 1.156-0.078 1.703-0.344 0.125-0.703 0.234-1.062 0.281-0.359-0.625-0.609-1.313-0.844-2-0.109-0.313-0.484-2.422-0.516-2.453-0.328-0.406-0.688-0.328-1.172-0.328-1.422 0-2.906-0.063-4.312 0.109-0.078 0.688-0.141 1.422-0.125 2.125 0.016 4.391 0.063 8.781 0.063 13.172 0 1.203-0.187 2.469 0.156 3.625 1.188 0.609 2.594 0.703 3.813 1.25 0.031 0.25 0.078 0.516 0.078 0.781 0 0.141-0.016 0.297-0.047 0.453l-0.531 0.016c-2.219 0.063-4.406-0.281-6.641-0.281-1.578 0-3.156 0.281-4.734 0.281-0.016-0.266-0.047-0.547-0.047-0.812v-0.141c0.594-0.953 2.734-0.969 3.719-1.547 0.344-0.766 0.297-5 0.297-5.984 0-3.156-0.094-6.312-0.094-9.469v-1.828c0-0.281 0.063-1.406-0.125-1.625-0.219-0.234-2.266-0.187-2.531-0.187-0.578 0-2.25 0.266-2.703 0.594-0.75 0.516-0.75 3.641-1.687 3.703-0.281-0.172-0.672-0.422-0.875-0.688v-5.984z"></path></symbol>','<symbol id="icon-image" viewBox="0 0 30 28"><path d="M10 9c0 1.656-1.344 3-3 3s-3-1.344-3-3 1.344-3 3-3 3 1.344 3 3zM26 15v7h-22v-3l5-5 2.5 2.5 8-8zM27.5 4h-25c-0.266 0-0.5 0.234-0.5 0.5v19c0 0.266 0.234 0.5 0.5 0.5h25c0.266 0 0.5-0.234 0.5-0.5v-19c0-0.266-0.234-0.5-0.5-0.5zM30 4.5v19c0 1.375-1.125 2.5-2.5 2.5h-25c-1.375 0-2.5-1.125-2.5-2.5v-19c0-1.375 1.125-2.5 2.5-2.5h25c1.375 0 2.5 1.125 2.5 2.5z"></path></symbol>',"</defs></svg>",'<div class="pf-app-container d-flex flex-column">','<div id="pf-app" class="container d-flex flex-column pf-app-wrapper">','<div class="pf-header d-none d-sm-flex"></div>','<div class="pf-app-inner d-flex flex-column">','<div class="pf-toolbar d-flex flex-row">','<div class="pf-actions d-flex flex-row">','<button type="button" class="btn-pf d-flex flex-sm-row flex-column align-items-center justify-content-center px-lg-3 px-xl-4" id="w-print"><span class="pf-sprite"></span><strong id="print" class="localize ml-1">Print</strong></button>','<button type="button" id="w-pdf" class="btn-pf d-flex flex-sm-row flex-column align-items-center justify-content-center px-lg-3 px-xl-4"><span class="pf-sprite"></span><strong id="pdf" class="localize ml-1">PDF</strong></button>','<button type="button" class="btn-pf d-flex flex-sm-row flex-column align-items-center justify-content-center px-lg-3 px-xl-4" id="w-email"><span class="pf-sprite"></span><strong id="email" class="localize ml-1">Email</strong></button>','<div class="b-l-white"></div>',"</div>",'<div class="pf-edit d-flex flex-row justify-content-center mx-auto">','<div id="w-txtsize" class="pf-text-size d-flex flex-row align-items-center mx-1 mx-sm-2 mx-md-3"><svg class="icon icon-text-height d-none d-sm-inline-block mr-2"><use xlink:href="#icon-text-height"></svg><select class="form-control" id="text-size" name="txtsize"><option value="pf-15">130%</option><option value="pf-14">120%</option><option value="pf-13">110%</option><option value="pf-12">100%</option><option value="pf-11">90%</option><option value="pf-10">80%</option><option value="pf-9">70%</option></select></div>','<div id="w-imagesize" class="pf-image-size d-flex flex-row align-items-center mx-1 mx-md-4"><svg class="icon icon-image d-none d-sm-inline-block mr-2"><use xlink:href="#icon-image"></svg><select class="form-control" id="imagesize" name="imgsize"><option class="small" value="full-size">100%</option><option value="large">75%</option><option value="medium">50%</option><option value="small">25%</option><option value="remove-images">0</option></select></div>','<button type="button" id="w-undo" class="btn-pf js-undo-button d-inline-flex flex-row align-items-center mx-1 mx-sm-2 mx-md-3"><svg class="icon icon-undo"><use xlink:href="#icon-reply"></svg><span id="undo" class="localize d-none d-sm-inline-block ml-1">Undo</span></button>',"</div>",'<button id="pf-app-close" aria-label="Close" class="d-block close btn-pf align-self-start px-2 py-1" type="button"><span aria-hidden="true">&times;</span></button></div>','<div id="pf-dialog-frame" class="pf-dialog-mask js-dialog-container">','<div class="pf-dialog-container p-2 mx-auto my-4">','<div class="pf-dialog-header px-3 px-sm-5 rounded-top ">','<button aria-label="Close" class="close btn-pf align-self-start p-2 js-dialog-close-button fs-5" id="pf-d-close-wrap" type="button"><span aria-hidden="true" class="fs-5">&times;</span></button>','<div id="pf-dialog-print" class="js-dialog js-dialog-print">','<div class="pf-sprite float-left mr-3"></div>','<h2 id="dialog-title" class="localize">Printing Your Page</h2>','<div id="dialog-text" class="localize">We\'ve sent your page to your printer <button class="btn btn-pf btn-secondary btn-sm" type="button">re-send</button></div></div>','<div id="pf-dialog-pdf" class="js-dialog js-dialog-pdf"><div id="pdf-iframe-container"></div></div>',"</div>",'<div id="pf-dialog-content" class="pf-dialog-content"></div>',"</div>","</div>",'<div id="insert-content" class="pf-content-wrapper d-flex pf-content-scroll">','<div id="pf_loading"><div class="pf-loading-mask d-flex align-items-center justify-content-center"><div class="pf-spinner pf-spinner-success pf-spinner-lg"></div></div></div>',"</div>","</div>",'<div id="pf-ft" class="pf-ft text-center"><a href="http://www.printfriendly.com" class="pf-branding js-pf-branding" title="PrintFriendly & PDF" target="_blank">Powered by PrintFriendly.com</a></div>',"</div>","</div>",'<form id="pf-email-form" accept-charset="UTF-8" target="email" method="post" action="'+pfData.config.urls.email+'">','<input type="hidden" name="content" value="" >','<input name="iehack" type="hidden" value="&#9760;">','<input type="hidden" name="title" value="" >','<input type="hidden" name="url" value="" >','<input type="hidden" name="cs_adfree" value="" >',"</form>"].join("\n")},hideLoader:function(){$("#pf_loading").fadeOut(500)},showDialog:function(e){this.dialogVisible=!0,messageBus.postMessage("algo","PfContentMaskAndScrollTop"),$(".js-dialog-container").show(),$(".js-dialog").hide(),"print"===e?$(".js-dialog-print").show():$(".js-dialog-pdf").show(),ad.create(),ad.show()},hideDialog:function(){this.dialogVisible=!1,messageBus.postMessage("algo","PfContentUnMask"),$(".js-dialog-container").hide(),ad.hide()}},toolbar={setup:function(){this.setupResizeImages(),this.hideUIElements(),this.setupClickToDelete(),this.setupPrint(),this.setupPdf(),this.setupEmail(),this.setupTextSize(),this.setupUndo(),this.setupDialogClose(),this.setupCloseButton(),this.setupHamburgerMenu()},setupHamburgerMenu:function(){function e(e){$textSize=$("#text-size");var t=parseInt($textSize.val().replace("pf-","")),n=t+e;n>=9&&n<=15&&($textSize.val("pf-"+n).trigger("change"),$("#menu-text-sm").prop("disabled",9==n),$("#menu-text-lg").prop("disabled",15==n))}$("#menu-w-undo").click(function(){$("#w-undo").trigger("click")}),$("#menu-text-sm").click(function(){e(-1)}),$("#menu-text-lg").click(function(){e(1)})},printOnlySetup:function(){this.setupPrint(),this.setupDialogClose(),this.setupCloseButton()},setupClickToDelete:function(){var e;settings.disableClickToDel?($("#w-undo").hide(),$("#w-undo").removeClass("d-inline-flex flex-row"),$("#menu-w-undo").hide()):(e=pfData.config.usingBM?settings.nonClickToDelElements:settings.nonClickToDelElements+", "+settings.publisherNonClickToDelElements,$(e,algoData.doc).addClass("non-delete").find("*").addClass("non-delete"),$("#printfriendly",algoData.doc).on("mouseover mouseout","*",function(e){var t=commonUtils.getTopWrapper(e.target);if(commonUtils.isDeletableElement(t)){e.stopPropagation();var n=$(t);n.hasClass("non-delete")||("mouseover"==e.type?n.addClass("pf-delete"):(n.removeClass("pf-delete"),""===n.attr("class")&&n.removeAttr("class")))}}),$("#printfriendly",algoData.doc).on("click","*",function(e){e.preventDefault();var t=commonUtils.getTopWrapper(e.target);if(commonUtils.isDeletableElement(t)){e.stopPropagation();var n=$(t);n.hasClass("non-delete")||(core.deletedNodes.push(n),core.deletedNodesCss.push(n.css("display")),t.style.setProperty?t.style.setProperty("display","none","important"):n.hide())}})),$("body",algoData.doc).on("click",function(e){e.preventDefault()})},setupPrint:function(){$("#w-print").on("click",function(e){ui.showDialog("print"),window.setTimeout(core.customPrint,500),e.preventDefault()}),$("body").on("click",".re-send",function(e){e.preventDefault(),core.customPrint()})},setupPdf:function(){$("#w-pdf").on("click",function(e){pdfUtils.extractContent(algoData.doc.body.innerHTML).always(function(t){var n=pfData.config.urls.css.content;pfData.config.isExtension&&(n=toCdnUrl(n)),$("#pdf-iframe-container").html(""),$('<iframe class="pdf-iframe" name="pdf_iframe" src="'+pfData.config.hosts.cdn+'/IEneeds/iframe_blank.html" allowtransparency="true" />').appendTo($("#pdf-iframe-container")),ui.showDialog("pdf");var a=$("h1#pf-title",algoData.doc).html();$("#pf-pdf-form input[name=title]").val(a),$("#pf-pdf-form input[name=code]").val(t),$("#pf-pdf-form input[name=dir]").val(pfData.page.dir),$("#pf-pdf-form input[name=hostname]").val(pfData.config.hosts.page),$("#pf-pdf-form input[name=url]").val(pfData.config.urls.page),$("#pf-pdf-form input[name=platform]").val(pfData.config.platform),$("#pf-pdf-form input[name=content_css_url]").val(n)
;var i=!(!pfData.dsData||!pfData.dsData.domain_settings.ad_free);$("#pf-pdf-form input[name=cs_adfree]").val(i),""!==$.trim(pfData.userSettings.customCSSURL)&&$("#pf-pdf-form input[name=custom_css_url]").val($.trim(pfData.userSettings.customCSSURL)),setTimeout(function(){utils.checkFormSubmission()},utils.pdfSubmitCheckInterval),$("#pf-pdf-form").submit(),frames.algo.focus(),e.preventDefault()})})},setupEmail:function(){$("#w-email").on("click",function(e){$("#pf-menu").removeClass("pf-menu-open");var t=$("h1#pf-title",algoData.doc).html(),n=pfData.page.screen,a=n.x,i=n.y,s=n.width,o=n.height,r=parseInt(a+(s-750)/2,10),l=parseInt(i+(o-480)/2.5,10),c="chrome=yes,centerscreen=yes,width=750,height=480,top="+l+",left="+r,d=window.open(pfData.config.urls.email,"email",c);d.focus();try{var p=pfData.page.emailText;if(""===p){var f=$("#pf-content",algoData.doc).clone();f.find("*").filter(function(){return"none"==$(this).css("display")}).remove(),p=f.text()}var u=encodeURIComponent(pfData.config.urls.page);$("#pf-email-form input[name=title]").val(t),$("#pf-email-form input[name=url]").val(u),$("#pf-email-form input[name=content]").val(p);var g=!(!pfData.dsData||!pfData.dsData.domain_settings.ad_free);$("#pf-email-form input[name=cs_adfree]").val(g),setTimeout(function(){$("#pf-email-form").submit()})}catch(e){d.location.href=pfData.config.urls.email+"?error=1",exTracker.log(e)}e.preventDefault()})},setupTextSize:function(){$("#text-size").change(function(e){var t=$(this).val();Cookie.set("printfriendly-font-class",t,365),$("#printfriendly",algoData.doc).removeClass("pf-9 pf-10 pf-11 pf-12 pf-13 pf-14 pf-15").addClass(t),e.preventDefault()})},setupResizeImages:function(){$("#imagesize, #menu-imagesize").change(function(){var e=$(this).val();core.hideImages("remove-images"===e),core.resizeImages(e)}),$("#imagesize, #menu-imagesize").val(pfData.userSettings.imagesSize).change()},setupUndo:function(){$("#w-undo").on("click",function(e){if(core.deletedNodes.length>0){var t=core.deletedNodes.pop();t.show();var n=core.deletedNodesCss.pop();t[0].style.setProperty?t[0].style.setProperty("display",n):t.css("display",n)}e.preventDefault()})},setupDialogClose:function(){$("#pf-d-close-wrap").on("click",function(e){ui.hideDialog(),e.preventDefault()})},setupCloseButton:function(){$("#pf-app-close").on("click",function(e){core.restoreStyles(),messageBus.postMessage("root","PfClosePreview"),e.preventDefault()})},hideUIElements:function(){var e=pfData.userSettings;1===parseInt(e.disablePDF)&&($("#w-pdf").hide(),$("#w-pdf").removeClass("d-flex flex-sm-row flex-column")),1===parseInt(e.disableEmail)&&($("#w-email").hide(),$("#w-email").removeClass("d-flex flex-sm-row flex-column")),1===parseInt(e.disablePrint)&&($("#w-print").hide(),$("#w-print").removeClass("d-flex flex-sm-row flex-column"))}},analytics={init:function(){settings.useGA&&"undefined"==typeof ga&&(!function(e,t,n,a,i,s,o){e.GoogleAnalyticsObject=i,e[i]=e[i]||function(){(e[i].q=e[i].q||[]).push(arguments)},e[i].l=1*new Date,s=t.createElement(n),o=t.getElementsByTagName(n)[0],s.async=1,s.src=a,o.parentNode.insertBefore(s,o)}(window,document,"script","https://www.google-analytics.com/analytics.js","ga"),ga("create","UA-2407788-4","auto"),ga("set","appName","PrintFriendly CS"),ga("set","appVersion","1.0.1"),ga("set","location","https://cdn.printfriendly.com/preview"),ga("set","checkProtocolTask",null),ga("set","referrer",pfData.page.location.href))},sendEvent:function(e,t,n){settings.useGA&&ga("send","event",e,t,n,{nonInteraction:!0})},sendPageView:function(e){settings.useGA&&ga("send","pageview",e)},sendNoRedirectEvent:function(e){var t;t=pfData.config.isExtension?"extension":pfData.stats.page.bm?"bookmarklet":"button",this.sendEvent("NoRedirect",t,e)}},librato={sendStats:function(){if("production"===pfData.config.environment&&!pfData.onServer){events=[],pfData.config.pfstyle&&events.push("cs.pfstyle."+pfData.config.pfstyle),ad.adSettings.adFree&&events.push("cs.page.adfree");for(var e in pfData.stats.page)pfData.stats.page[e]&&events.push("cs.page."+e);"nbk"===pfData.config.pfstyle&&BrowserDetect.browser&&events.push("cs.bm.browser."+BrowserDetect.browser),$.post(pfData.config.hosts.pf+"/stats",{events:events})}},sendPDFResubmitStatus:function(e){$.post(pfData.config.hosts.pf+"/stats",{events:[e]})}};