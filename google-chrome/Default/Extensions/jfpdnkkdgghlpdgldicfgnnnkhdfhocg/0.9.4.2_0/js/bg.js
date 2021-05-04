//2011 Spell Checker for Chrome, All rights reserved.

var g_isapp=false;

var g_extensionid=chrome.i18n.getMessage("@@extension_id");
//var upgradealerted=false;
if (g_isapp){
	var g_optionsurl='http://iblogbox.com/chrome/spellcheck/app/option/v0.9.3.2.php?g_extensionid='+g_extensionid;
	var g_spellcheckurl='http://iblogbox.com/chrome/spellcheck/app/ext/spellcheck_0.9.4.1.php';
}else{
	var g_optionsurl='http://iblogbox.com/chrome/spellcheck/option/v0.9.3.2.php?g_extensionid='+g_extensionid;
	var g_spellcheckurl='http://iblogbox.com/chrome/spellcheck/ext/spellcheck_0.9.4.1.php';
}

var g_disable=false;
var default_maxwordlength=300000;

var storagedefault = {	
	"other_ko_spellcontextmenu": [true,0],
	"other_ko_spellopentype": [0,0],
	"other_ko_spellwinpos": ['{"left":0, "top":0, "width":0, "height":0}',0],	
	"other_ko_spellautoclose": [false,0],	
	"other_ko_spellchangeall": [false,0],	
	"other_ko_autocorrection": [false,0],	
	"other_ko_spell_lang": ["",0],
	"other_maxwidth": [900,1],
	"other_newtablast": [false,0],
	"other_ko_showdesc": [true,0],
	
	"prev_hotkey": ["",0],
	"prev_hotkey2": [117,0],	
	"next_hotkey": ["",0],
	"next_hotkey2": [118,0],	
	"sourcechange_hotkey": ["",0],
	"sourcechange_hotkey2": [119,0],	
	"suggestchange_hotkey": ["",0],
	"suggestchange_hotkey2": [120,0],	
	"textchange_hotkey": ["",0],
	"textchange_hotkey2": [121,0],		
	"gospell_hotkey": ["",0],
	"gospell_hotkey2": [113,0],
	"copytext_hotkey": ["ctrl",0],
	"copytext_hotkey2": [117,0],
	"adduserdic_hotkey": ["ctrl",0],
	"adduserdic_hotkey2": [118,0],
		
	"color_corrected": ["008000",0], //green
	"color_changed": ["0000FF",0], //blue
	"color_userdic": ["0A59A8",0], 
	"color_select": ["FFFF00",0],
	
	"last_savedata": ["",0],	
	"last_spelldata": ["",0],	
	//"auto_load_lastdata": [true,0],	
	
	"user_dic_data": ["{}",0],	
	
	"extension_lastcheck": [0,0],	
	"extension_version": ['',0],
	
	//"etc_kospellurl": [g_kospellurl,0],
	"etc_maxwordlength": [default_maxwordlength,0]	
}

function setStorageDefaults2(name){		
	var s=localStorage[name];		
	if ((s==null) || (s=='undefined')) localStorage[name]=storagedefault[name][0];
}
function setStorageDefaults_int(name){		
	var s=localStorage[name];
	if ((s==null) || isNaN(parseInt(s)) || (s=='undefined')) localStorage[name]=storagedefault[name][0];
}	

function getStorageDefaults(name){	
	return storagedefault[name][0];	
}

function setStorageDefaults(){	
	for (var a in storagedefault){
		if (storagedefault[a][1]==1)
			setStorageDefaults_int(a);
		else
			setStorageDefaults2(a);
	}		
}
	
try{
	setStorageDefaults();
} catch(err) {}	

function proc_init(){
}

function update_contextmenu(){
try{	
	chrome.contextMenus.removeAll(function(){});	
	if (toBool(localStorage["other_ko_spellcontextmenu"])){
		var s=chrome.i18n.getMessage("msg_spellcheck");
		if (g_isapp) s=s+' (App)';
		chrome.contextMenus.create({"type":"normal", "title":s, "contexts":["selection"], "onclick": proc_context2_click});
	}
}catch(err){}	
}

proc_init();
update_contextmenu();

var ko_spellwindowid;
var ko_spellcheck_arr=[];

function proc_open_kospell(openurl,text) {
	//if (localStorage["etc_disable"]=='1') return;
	//if (g_disable) return;

	var spellurl=g_spellcheckurl;//getextensionUrl("spellcheck.html");	
	
	if (ko_spellcheck_arr.length > 2) ko_spellcheck_arr.splice(0,1);
	
	var a={};
	a.id=(new Date()).getTime();
	a.ko_spellcheck_text=text;
	ko_spellcheck_arr[ko_spellcheck_arr.length]=a;	
	
	var s=spellurl+'?id='+a.id;
	//var s=spellurl+'?text='+encodeURIComponent(text);
	
	var t=localStorage["other_ko_spellopentype"];
	if (t==1) {
		open_newtab(s,false);			
		return;
	} else if (t==2) {

	  chrome.tabs.query({windowId:chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
			for (var i = 0, tab; tab = tabs[i]; i++) {
				if (!tab.url) continue;			
				if (tab.url.indexOf(spellurl)==0) {				
					if (openurl) chrome.tabs.update(tab.id, {'url': s, active:true});
					else chrome.tabs.update(tab.id, {active:true});										
					return;
				}			
			}		
			open_newtab(s,false);
  		});			
		
		return;
	} else if (t==3) {
		chrome.windows.create({url:s});
		return;
	} else if (t==4) {		
			chrome.windows.getLastFocused( function(win) {
				var windowId=win.id;				
				chrome.tabs.query({windowId:chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {			
					chrome.tabs.getSelected(windowId, function(tab) { 				
						
						if (openurl) {
							chrome.tabs.update(tab.id, {'url': s});
						} else { 
							if (tab.url.indexOf(spellurl)!=0) chrome.tabs.update(tab.id, {'url': s});
						}	
												
					});		
				});
			});		
		return;
	}
	
	//if (window.navigator.language=="ko") {
		/*var w= parseInt(localStorage["other_ko_spellwidth"]);
		var h= parseInt(localStorage["other_ko_spellheight"]);		
		var pos= parseInt(localStorage["other_ko_spellpos"]);
		var a=get_popup_position(w, h, pos);	*/
		
		var a=get_popup_position2('other_ko_spellwinpos',780,550);		
		var flag=false;
		try {
			proc_openpopupwin('ko_spellwindowid',openurl,s,a.left,a.top,a.width,a.height);
			flag=true;
		} catch(err){}
			
		if (!flag) {
			chrome.windows.create({url:s});
		}
	//}
}

function proc_context2_click(info,tab) {
try{	
	var s=trim(info.selectionText);
	if (s==''){
		alert(chrome.i18n.getMessage('msg_notselected'));
		return;
	}
	proc_open_kospell(true,s);
	
}catch(err){}
}

function get_popup_position2(name,dw,dh){
	var sw=screen.availWidth;
	var sh=screen.availHeight;	

	var flag=false;
	var a={};
	try{
		a=JSON.parse(localStorage[name]);
		if ((a.width > 0) && (a.height > 0))
			flag=true;
	}catch(err){	}
		
	if (!flag){
		a.width=dw;
		a.height=dh;		
		a.left=parseInt((sw-a.width) / 2);
		a.top=parseInt((sh-a.height) / 2);		
	}
	
	/*if (a.left < 0) a.left=0;
	if (a.top < 0) a.top=0;
	if ((a.left+a.width) > sw) a.left=sw-a.width;
	if ((a.top+a.height) > sh) a.top=sh-a.height;*/
	
	if (a.width > sw) a.width=sw;
	if (a.height > sh) a.height=sh;
	
	var diff=200;
	if ((a.left+a.width) < diff) a.left=diff-a.width;
	if (a.top < 0) a.top=0;
	if ((a.left+diff) > sw) a.left=sw-diff;
	if ((a.top+diff) > sh) a.top=sh-diff;
	
	return a;
}

var savewinposition_timer=null;
var lastwinposition={left:-1,top:-1,width:-1,height:-1};

function proc_savewinposition(){
	try{
		if (!ko_spellwindowid) return;
			
		chrome.windows.get(ko_spellwindowid, function(win){
			if (!win) return;
			if ((win.width >= screen.availWidth) && (win.height >= screen.availHeight)) return;			
			if ((lastwinposition.left==win.left) && (lastwinposition.top==win.top) && (lastwinposition.width==win.width) && (lastwinposition.height==win.height)) return;
			var a={};
			a.left=win.left;
			a.top=win.top;
			a.width=win.width;
			a.height=win.height;
			lastwinposition=a;
			localStorage["other_ko_spellwinpos"]=JSON.stringify(a);	
		});
			
	}catch(err){}
}

function proc_openpopupwin(kind,openurl,surl,aleft,atop,awidth,aheight){
	
	function setid(win){
		if (!win) return;
		var id=win.id;
		if (win.tabs && win.tabs.length > 1){ //for win8 metro
			id=null;
		  	chrome.tabs.query({windowId:win.id}, function(tabs){
				for (var i = 0, tab; tab = tabs[i]; i++) {
					if (!tab.url) continue;			
					if (tab.url.indexOf(surl)==0) {				
						chrome.tabs.update(tab.id, {active:true});						
						break;
					}
				}
  			});						
		}
		if (kind=='scriptwindowid') scriptwindowid=id;
		else if (kind=='ko_spellwindowid') {
			ko_spellwindowid=id;						
			if (savewinposition_timer) clearInterval(savewinposition_timer);
			savewinposition_timer=null;
			if (id!=null){
				savewinposition_timer=setInterval(proc_savewinposition, 2000);
			}
		}	
	}
	
	var windowid;
	if (kind=='scriptwindowid') windowid=scriptwindowid;
	else if (kind=='ko_spellwindowid') windowid=ko_spellwindowid;
	else return;
		
	
		if (windowid){
			chrome.windows.get(windowid, function (win){
				if (win)	{
					chrome.windows.update(win.id, {focused:true}, function (win){});
					if (!openurl) return;
					
					chrome.windows.getAll({"populate" : true}, function (windows) {     
						for (var i = 0; i < windows.length; i++) {
							var win2 = windows[i];        
							if (win.id==win2.id) {
								for (var j = 0; j < win2.tabs.length; j++) {
									var tab = win2.tabs[j];
									chrome.tabs.update(tab.id, {'url':surl});		
									return;
								}
							}
						}      
					});
					
				} else{
					chrome.windows.create({url:surl, type:'popup', left:aleft, top:atop, width:awidth, height:aheight}, function (win){
						setid(win);
					});
				}
			});
			return;
		}
		
		chrome.windows.create({url:surl, type:'popup', left:aleft, top:atop, width:awidth, height:aheight}, function (win){
			setid(win);
		});	
}

chrome.windows.onRemoved.addListener(function(id) {
	if (id==ko_spellwindowid) {
		ko_spellwindowid=null;
		if (savewinposition_timer) clearInterval(savewinposition_timer);
		savewinposition_timer=null;
	}
});


chrome.browserAction.onClicked.addListener(function(tab) {
	proc_open_kospell(false,'');
});


//////////////////////////////////////////////
///get data
//////////////////////////////////////////////
var manifest;
function getmanifest(){
/*
	if(chrome.runtime){
		manifest=chrome.runtime.getManifest();
	}else{
		manifest={'version':'1.0.0.6'};
	}
*/
	var xhr = new XMLHttpRequest();
	xhr.open("GET", chrome.extension.getURL('manifest.json'), true);
	xhr.onload = function(){
		manifest = JSON.parse(xhr.responseText);
		check_data(true);
	}
	xhr.send(null);
}
getmanifest();


function check_data(start){	    	  	
try{	

  var xmlobject;
  
function getxmlvalue(itemname,subname) {
 try{
   var root = xmlobject.getElementsByTagName('data')[0];
  
   var items = root.getElementsByTagName("item");
   for (var i = 0 ; i < items.length ; i++) {
       var item = items[i];
       if (item.getAttribute("name")==itemname) {
         if (!item.getElementsByTagName(subname)[0].firstChild)
           return "";
         else {
         	  var s=trim(item.getElementsByTagName(subname)[0].firstChild.nodeValue);     	
         	  if (s==null) s="";
	        return s;
	      }
      }
   }
 } catch(e) {}   
 return "";
}	

function proc_support(){
	if (start){	
		if (localStorage['extension_version']!=manifest.version){
			localStorage['extension_version']=manifest.version;
			localStorage['etc_maxwordlength']=getStorageDefaults('etc_maxwordlength');
		}
	}					
}
	
function getxmlvalue2(s1,s2,s3) {
	var a=getxmlvalue(s2,s3);
	if ((a!=null) && (a!="")) localStorage[s1]=a;
}

 var elaspetime = new Date();   	  	
 extension_lastcheck=localStorage["extension_lastcheck"];

 var timeelaspe=false;
 if (extension_lastcheck>0) {
   if ((elaspetime.getTime()-extension_lastcheck)/1000/60/60 > 20) timeelaspe=true;
 } else {
 	if (extension_lastcheck==-1) {
		localStorage["extension_lastcheck"]=elaspetime.getTime();
	} else { 		
		timeelaspe=true;	
		localStorage["extension_lastcheck"]=elaspetime.getTime();	
		setTimeout(function(){
			open_newtab('options.html',true);
		},700);		
	}
 }
 //timeelaspe=true;
 proc_support();

} catch(err){} 
}

/*function check_data2(){
	check_data(false);
}
window.setInterval(check_data2,1000*60*60*3);*/

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		switch (request.type) {
			case 'set':
				localStorage[request.key] = request.value;
				sendResponse();	
				break;
			case 'get':
				s=localStorage[request.key];
				if ((request.value!=null) && (s==null)) s=request.value;
				sendResponse(s);
				break;
			case 'getdefault':
				sendResponse(getStorageDefaults(request.key));
				break;
			case 'closecurrenttab':
				chrome.tabs.remove(sender.tab.id);
				break;
			case 'saveoptall':
				var context_enable;
				for (var i = 0; i < request.data.length; i++){	
					var a=request.data[i];					
					
					if (a.name=='other_ko_spellcontextmenu'){
						context_enable=toBool(localStorage["other_ko_spellcontextmenu"]);
					}					
					
					localStorage[a.name]=a.value;					
					
					if (a.name=='other_ko_spellcontextmenu'){
						if (context_enable!=a.value) update_contextmenu();
					}												
				}				
				
				setStorageDefaults();
				proc_init();
				
				sendResponse();
				break;
			/*case 'checkupgrade':
				var v=localStorage["version_ver"];
				if ((v!=null) && (v!='') &&  (v > manifest.version) && (!upgradealerted)) {
					upgradealerted=true;
					alert('Please, Upgrade this extesion.');
				}
				break;*/
			case "open_tab":
				if (request.last)
					open_newtab(request.surl, true);
				else
					open_newtab(request.surl, false);
				sendResponse();					
				break;				
			case 'get_bgstorage':
				if (request.setdefault) {
					setStorageDefaults();
				}
				
				var b={};
				for (var a in storagedefault){
					if (a=='extension_lastcheck') break;					
					if (a=='last_savedata' || a=='last_spelldata') continue;
					b[a]=localStorage[a];
				}
				
				var r={};
				r.bgstorage=b;
				//r.g_enspellurl=g_enspellurl;
				r.g_enspellurl="https://www.google.com/tbproxy/spell?hl=en&lang=";
				r.g_optionsurl=g_optionsurl;
				r.ko_spellcheck_text='';
				
				//localStorage['etc_maxwordlength']='';
				r.maxwordlength=parseInt(localStorage['etc_maxwordlength']);
				if ((!r.maxwordlength) || isNaN(r.maxwordlength) || (r.maxwordlength < 1000)) {
					r.maxwordlength=default_maxwordlength;
				}
				
				var a;
				for (var i = 0; i < ko_spellcheck_arr.length; i++) {
					a=ko_spellcheck_arr[i];
					if (a.id==request.id){
						r.ko_spellcheck_text=a.ko_spellcheck_text;
						//ko_spellcheck_arr.splice(i,1);
						break;
					}
				}
								
				sendResponse(r);
				break;
			/*case 'set_ko_spellcheck_text':
				var a;
				var b=false;
				
				for (var i = 0; i < ko_spellcheck_arr.length; i++) {
					a=ko_spellcheck_arr[i];
					if (a.id==request.id){
						b=true;
						a.ko_spellcheck_text=request.text;
						break;
					}
				}
				
				if (!b){
					a={};
					a.id=request.id;
					a.ko_spellcheck_text=request.text;
					ko_spellcheck_arr[ko_spellcheck_arr.length]=a;
				}
				break;*/
				
			case 'set_storagedefault':
				setStorageDefaults();
				sendResponse();
				break;
			case 'set_focustab':
				chrome.tabs.update(sender.tab.id, {active:true});	
				sendResponse();
				break;
			case "open_tabexist":
				open_newtab_exist(request.surl, request.last, request.id, request.openurl);
				break;
			case "copytoclipboard":
				var a=document.getElementById("copy");
				a.value=request.text;
				a.select();							
				document.execCommand('copy');
				a.value='';
				break;
			case 'get_url':
				proc_get_url(request, sender, sendResponse);
				/*setTimeout(function(){
					sendResponse({'ok':true});	
				},1000);*/
				break;
			case 'get_stop':
				proc_get_stop();
				break;
			default:
				sendResponse();
				break;
		}
	}
);

var xhrs=[];
function proc_get_stop(){
	for(var i = 0; i <= xhrs.length-1; i++){				
		if(xhrs[i]) xhrs[i].abort();
	}
	//console.log('stop');
}
function proc_get_url(request, sender, sendResponse){
	//console.log(request);
	if(!request.method || !request.url){
		sendResponse({error:'No parameters.'});
		return;
	}

	if(!request.idx) request.idx=0;
	if(!xhrs[request.idx]) xhrs[request.idx]=new XMLHttpRequest();
	else xhrs[request.idx].abort(); 
	var xhr=xhrs[request.idx];

	try{
		xhr.open(request.method, request.url, true);  
		if(request.header && request.header.length>0){
			for(var i = 0; i <= request.header.length-1; i++){				
				xhr.setRequestHeader(request.header[i].name, request.header[i].value);
			}
		}
		xhr.onload=null;
		xhr.onreadystatechange=null;
		if(request.readystate){
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					sendResponse({response: this.responseText});
				}
			}			
		}else{
			xhr.onload=function(){
				sendResponse({response: this.response});
			}
		}
		xhr.onerror=function(e){
			var status='-1';
			if(e && e.target && e.target.status) status=e.target.status;
			sendResponse({error:"Error "+ status+" occurred while receiving the data."});			
		}
		if(request.body) xhr.send(request.body);
		else xhr.send();
	}catch(err){
		err=err+'';
		if(!err) err='Unknown Error.';
		sendResponse({error: err});
	}
}

