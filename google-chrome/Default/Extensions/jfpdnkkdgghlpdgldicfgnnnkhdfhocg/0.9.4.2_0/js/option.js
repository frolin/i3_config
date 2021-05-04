/*! 2011 Spell Checker for Chrome, All rights reserved. */
//////////////////////////////////////////
///Utils
//////////////////////////////////////////
function toBool(str){
  return ("false" === str) ? false : true;
}

function toSafeString(str){
	if (str==null) return '';
	else return str;
}

function safegetlang(s1,s2){
	var s=chrome.i18n.getMessage(s1);
	if (!s) s=s2;
	return s;
}

function safegetlang2(s1,s2){
	var s=chrome.i18n.getMessage(s1);
	if (!s) s=s2;
	s=s.replace(/(\r\n|\n\r|\r|\n)/g,"<br>");
	return s;
}

function getValue(s,s_find,s_end){
  s_find=s_find.toLowerCase();
  s_end=s_end.toLowerCase();
  
  ss=s.toLowerCase();    
  p1=ss.indexOf(s_find);
  if (p1<0) return;
  s1=s.substr(p1+s_find.length,s.length);
  
  ss=s1.toLowerCase();
  p1=ss.indexOf(s_end);
  if (p1<0) return;
  s1=s1.substr(0,p1);
  return s1;
}

var messagetimer=null;
function show_message(s,x,y,padding){
	if (!x) x=10;
	if (!y) y=10;
	if (!padding) padding=5;

	var kind=1;
	var obj=document.getElementById("layer_message");
	if (!obj) {
		var obj=document.getElementById("layer_message2");
		if (!obj) {
			var obj=document.getElementById("layer_message3");
			if (!obj) return;
			kind=3;
		} else {
			kind=2;
		}
	}
	
	obj.style.left="1px";
	obj.style.top="1px";		
	obj.innerHTML="<label2>"+s+"</label2>";
	obj.style.display="";	
	
	if (kind==1) {
		x=document.body.scrollLeft+x;	
		y=document.body.scrollTop+y;;
	} else if (kind==2) {
		x=document.body.scrollLeft+((window.innerWidth-obj.clientWidth) / 2);
		y=document.body.scrollTop+((window.innerHeight-obj.clientHeight) / 2);
	} else {
		x=document.body.offsetWidth-obj.clientWidth-5;
		y=document.body.scrollTop+y;;
	}
	x=parseInt(x);
	y=parseInt(y);
	
	obj.style.left=x+"px";
	obj.style.top=y+"px";		
	obj.style["background-color"]="#FFFFE1";
	obj.style["border"]="1px solid #000000";
	obj.style["padding"]=padding+"px";
	
	if (messagetimer) clearTimeout(messagetimer);
	messagetimer=setTimeout("hide_message()",2000);
}

function hide_message(){
	var obj=document.getElementById("layer_message");
	if (obj) obj.style.display="none";
	var obj=document.getElementById("layer_message2");
	if (obj) obj.style.display="none";
	var obj=document.getElementById("layer_message3");
	if (obj) obj.style.display="none";
}
//////////////////////////////////////////

var gisdefault=false;
var savedata=[];

function set_notsaved(){
	var a=document.getElementById("status");
	if (a) a.innerHTML = "&nbsp;"+safegetlang('conf_notsaved','Has not been saved');
	var a=document.getElementById("status2");
	if (a) a.innerHTML = "&nbsp;"+safegetlang('conf_notsaved','Has not been saved');
}

function set_saved(){
	var a=document.getElementById("status");
	if (a) a.innerHTML = "&nbsp;"+safegetlang('conf_saved','Has been saved');
	var a=document.getElementById("status2");
	if (a) a.innerHTML = "&nbsp;"+safegetlang('conf_saved','Has been saved');	
}   

function addsavedata(name,value){
	var a={};
	a.name=name;
	a.value=value;
	savedata[savedata.length]=a;
}	

function saveOptions(){
	window.postMessage({type: "btn_beforesave"}, "*");
	
	savedata=[];
	
	addsavedata('other_ko_spellopentype',document.getElementById("other_ko_spellopentype").value);
	addsavedata('other_ko_spellcontextmenu',document.getElementById("other_ko_spellcontextmenu").checked);
	addsavedata('other_newtablast',document.getElementById("other_newtablast").checked);
	addsavedata('other_maxwidth',document.getElementById("other_maxwidth").value);
	
	addsavedata('prev_hotkey',document.getElementById("prev_hotkey").value);
	addsavedata('prev_hotkey2',document.getElementById("prev_hotkey2").value);
	addsavedata('next_hotkey',document.getElementById("next_hotkey").value);
	addsavedata('next_hotkey2',document.getElementById("next_hotkey2").value);
	addsavedata('sourcechange_hotkey',document.getElementById("sourcechange_hotkey").value);
	addsavedata('sourcechange_hotkey2',document.getElementById("sourcechange_hotkey2").value);
	addsavedata('suggestchange_hotkey',document.getElementById("suggestchange_hotkey").value);
	addsavedata('suggestchange_hotkey2',document.getElementById("suggestchange_hotkey2").value);
	addsavedata('textchange_hotkey',document.getElementById("textchange_hotkey").value);
	addsavedata('textchange_hotkey2',document.getElementById("textchange_hotkey2").value);
	addsavedata('gospell_hotkey',document.getElementById("gospell_hotkey").value);
	addsavedata('gospell_hotkey2',document.getElementById("gospell_hotkey2").value);	
	addsavedata('copytext_hotkey',document.getElementById("copytext_hotkey").value);
	addsavedata('copytext_hotkey2',document.getElementById("copytext_hotkey2").value);	
	addsavedata('adduserdic_hotkey',document.getElementById("adduserdic_hotkey").value);
	addsavedata('adduserdic_hotkey2',document.getElementById("adduserdic_hotkey2").value);	
	
	addsavedata('color_corrected',document.getElementById("color_corrected").value);
	addsavedata('color_changed',document.getElementById("color_changed").value);
	addsavedata('color_userdic',document.getElementById("color_userdic").value);
	addsavedata('color_select',document.getElementById("color_select").value);

	chrome.extension.sendRequest({type:'saveoptall', data: savedata }, function(response) {
		savedata=[];	
		set_saved();
		show_message("<label2><font style='font-size:13px'>"+safegetlang('conf_saved','Has been saved')+"</font></label2>");		
	});	

}

function closeoption(){
	chrome.extension.sendRequest({type:'closecurrenttab'}, function(response) {});
}

function setdefault(){
	presetValues(true);
	set_notsaved();
}
		
function presetValues_bool(name1,name2,callback){	
	if (gisdefault) {
		chrome.extension.sendRequest({type:'getdefault', key:name2 }, function(response) {
			document.getElementById(name1).checked = response;
			if (callback) callback();
		});
	} else {
		chrome.extension.sendRequest({type:'get', key:name2 }, function(response) {
			document.getElementById(name1).checked = toBool(response);
			if (callback) callback();
		});
	}
	document.getElementById(name1).onchange = function(){
		set_notsaved();
	}
}
function presetValues2(name1,name2,callback){	
	if (gisdefault) {
		chrome.extension.sendRequest({type:'getdefault', key:name2 }, function(response) {
			document.getElementById(name1).value = toSafeString(response);
			if (callback) callback();
		});
	} else {
		chrome.extension.sendRequest({type:'get', key:name2 }, function(response) {		
			document.getElementById(name1).value = toSafeString(response);
			if (callback) callback();
		});
	}
	document.getElementById(name1).onchange = function(){
		set_notsaved();
	}
}

function presetValues3(name1,name2,callback){	
	if (gisdefault) {
		chrome.extension.sendRequest({type:'getdefault', key:name2 }, function(response) {
			document.getElementById(name1).value = toSafeString(response);
			if (callback) callback();
		});
	} else {
		chrome.extension.sendRequest({type:'get', key:name2 }, function(response) {		
			document.getElementById(name1).value = toSafeString(response);
			if (callback) callback();
		});
	}
}
		
function presetValues(isdefault){
	gisdefault=isdefault
	
	presetValues2("other_ko_spellopentype","other_ko_spellopentype");				
	presetValues_bool("other_ko_spellcontextmenu","other_ko_spellcontextmenu");
	presetValues_bool("other_newtablast","other_newtablast");	
	presetValues2("other_maxwidth","other_maxwidth");				
	
	presetValues2("prev_hotkey","prev_hotkey");				
	presetValues2("prev_hotkey2","prev_hotkey2");				
	presetValues2("next_hotkey","next_hotkey");				
	presetValues2("next_hotkey2","next_hotkey2");				
	presetValues2("sourcechange_hotkey","sourcechange_hotkey");				
	presetValues2("sourcechange_hotkey2","sourcechange_hotkey2");				
	presetValues2("suggestchange_hotkey","suggestchange_hotkey");				
	presetValues2("suggestchange_hotkey2","suggestchange_hotkey2");				
	presetValues2("textchange_hotkey","textchange_hotkey");				
	presetValues2("textchange_hotkey2","textchange_hotkey2");					
	presetValues2("gospell_hotkey","gospell_hotkey");				
	presetValues2("gospell_hotkey2","gospell_hotkey2");						
	presetValues2("copytext_hotkey","copytext_hotkey");				
	presetValues2("copytext_hotkey2","copytext_hotkey2");						
	presetValues2("adduserdic_hotkey","adduserdic_hotkey");				
	presetValues2("adduserdic_hotkey2","adduserdic_hotkey2");						
	
	presetValues2("color_corrected","color_corrected",function (){
		var obj=document.getElementById("color_corrected");	
		obj.style.backgroundColor="#"+obj.value;									
	});							
	presetValues2("color_changed","color_changed",function (){
		var obj=document.getElementById("color_changed");	
		obj.style.backgroundColor="#"+obj.value;									
	});							
	presetValues2("color_userdic","color_userdic",function (){
		var obj=document.getElementById("color_userdic");	
		obj.style.backgroundColor="#"+obj.value;									
	});								
	presetValues2("color_select","color_select",function (){
		var obj=document.getElementById("color_select");	
		obj.style.backgroundColor="#"+obj.value;									
	});								
}
   	
function other_onkeydown(e){ 
	var code=e.keyCode;
	var press_ctrl=typeof e.modifiers=='undefined'?e.ctrlKey:e.modifiers&Event.CONTROL_MASK;
	var press_alt=typeof e.modifiers=='undefined'?e.altKey:e.modifiers&Event.ALT_MASK;
	var press_shift=typeof e.modifiers=='undefined'?e.shiftKey:e.modifiers&Event.SHIFT_MASK;			
	if (press_alt){
		if (code==112) {
			saveOptions();
  			e.preventDefault();  
  			e.stopPropagation(); 
  			e.returnValue=false;  
			return;
		}
	}
}

function proc_setlang(){
	function setlang(name,s){
		var a=document.getElementById(name);
		if (a) a.innerHTML=s;
	}
	function setlangtitle(name,s){
		var a=document.getElementById(name);
		if (a) a.title=s;
	}

	var a=document.getElementsByTagName('*');
	var s,s1,s2;
	for(var i = 0; i < a.length; i++){    
		if (a[i].id=='i18n'){
			s=a[i].title;
			a[i].title='';
			
			if (!s) continue;
			if (s.indexOf('$')>=0) {
				while(true){
					s1=getValue(s,'$','$');
					if (!s1 || (s1=='')) break;
					s2=chrome.i18n.getMessage(s1);
					if (!s2){
						s='';
						break;
					}
					s=s.replace('$'+s1+'$', s2);
				}
			} else {
				s=chrome.i18n.getMessage(s);
			}
			
			if (s) a[i].innerHTML=s;
  		}
	}	
		
/*	var s;
	var a=document.getElementsByTagName('*');
	for(var i = 0; i < a.length; i++){    
		if (a[i].id=='i18n'){
			s=chrome.i18n.getMessage(a[i].title);
			if (s) a[i].innerHTML=s;
			a[i].title='';
  		}
	}*/			
	//document.title=chrome.i18n.getMessage('ext_name');
}

function getImageUrl(relurl){
  if(typeof(chrome) == "undefined"){
    return "."+relurl;
  } else {
    return chrome.extension.getURL(relurl); 
  }
}

window.addEventListener("message", function(event) {
	if(event.source != window) return;
	
	var a=event.data;
	if(!a.type) return;
	if(a.type=="btn_get"){
		chrome.extension.sendRequest({type:'get', key:a.name}, function(response) {
			window.postMessage({type: "re_btn_get", response:response, issort:a.issort}, "*");
		});
	}else if(a.type=="btn_set"){
		chrome.extension.sendRequest({type:'set', key:a.name, value:a.value}, function(response) {});
	}else if(a.type=="btn_notsaved"){
		set_notsaved();
	}
},false);

function init(){
	proc_setlang();
		
	var a=document.getElementById('btn_saveOptions1');
	if (a) a.addEventListener('click', saveOptions); 		
	var a=document.getElementById('btn_saveOptions2');
	if (a) a.addEventListener('click', saveOptions); 	
		
	var a=document.getElementById('btn_closeoption1');
	if (a) a.addEventListener('click', closeoption);
	var a=document.getElementById('btn_closeoption2');
	if (a) a.addEventListener('click', closeoption);

	var a=document.getElementById('btn_setdefault1');
	if (a) a.addEventListener('click', setdefault);
	var a=document.getElementById('btn_setdefault2');
	if (a) a.addEventListener('click', setdefault);
	
	presetValues(false);
	
	document.addEventListener('keydown', other_onkeydown, true); 	
	
	window.postMessage({type: "btn_afterinit"}, "*");

	/*chrome.windows.getCurrent(function (win){
		alert(win);
	});*/
}

init();
//window.onload = init;
