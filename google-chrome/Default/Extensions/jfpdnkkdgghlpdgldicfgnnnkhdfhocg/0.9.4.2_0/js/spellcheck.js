/*! 2011 Spell Checker for Chrome, All rights reserved. */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Utils 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
function sprintf() {
    var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
    var a = arguments, i = 0, format = a[i++];
 
    // pad()
    var pad = function (str, len, chr, leftJustify) {
        if (!chr) {chr = ' ';}
        var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
        return leftJustify ? str + padding : padding + str;
    };
 
    // justify()
    var justify = function (value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
        var diff = minWidth - value.length;
        if (diff > 0) {
            if (leftJustify || !zeroPad) {
                value = pad(value, minWidth, customPadChar, leftJustify);
            } else {
                value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
            }
        }
        return value;
    };
 
    // formatBaseX()
    var formatBaseX = function (value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        // Note: casts negative numbers to positive ones
        var number = value >>> 0;
        prefix = prefix && number && {'2': '0b', '8': '0', '16': '0x'}[base] || '';
        value = prefix + pad(number.toString(base), precision || 0, '0', false);
        return justify(value, prefix, leftJustify, minWidth, zeroPad);
    };
 
    // formatString()
    var formatString = function (value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
        if (precision != null) {
            value = value.slice(0, precision);
        }
        return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
    };
 
    // doFormat()
    var doFormat = function (substring, valueIndex, flags, minWidth, _, precision, type) {
        var number;
        var prefix;
        var method;
        var textTransform;
        var value;
 
        if (substring == '%%') {return '%';}
 
        // parse flags
        var leftJustify = false, positivePrefix = '', zeroPad = false, prefixBaseX = false, customPadChar = ' ';
        var flagsl = flags.length;
        for (var j = 0; flags && j < flagsl; j++) {
            switch (flags.charAt(j)) {
                case ' ': positivePrefix = ' '; break;
                case '+': positivePrefix = '+'; break;
                case '-': leftJustify = true; break;
                case "'": customPadChar = flags.charAt(j+1); break;
                case '0': zeroPad = true; break;
                case '#': prefixBaseX = true; break;
            }
        }
 
        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values
        if (!minWidth) {
            minWidth = 0;
        } else if (minWidth == '*') {
            minWidth = +a[i++];
        } else if (minWidth.charAt(0) == '*') {
            minWidth = +a[minWidth.slice(1, -1)];
        } else {
            minWidth = +minWidth;
        }
 
        // Note: undocumented perl feature:
        if (minWidth < 0) {
            minWidth = -minWidth;
            leftJustify = true;
        }
 
        if (!isFinite(minWidth)) {
            throw new Error('sprintf: (minimum-)width must be finite');
        }
 
        if (!precision) {
            precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : undefined;
        } else if (precision == '*') {
            precision = +a[i++];
        } else if (precision.charAt(0) == '*') {
            precision = +a[precision.slice(1, -1)];
        } else {
            precision = +precision;
        }
 
        // grab value using valueIndex if required?
        value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];
 
        switch (type) {
            case 's': return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
            case 'c': return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
            case 'b': return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'o': return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'x': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'X': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
            case 'u': return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'i':
            case 'd':
                number = parseInt(+value, 10);
                prefix = number < 0 ? '-' : positivePrefix;
                value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                return justify(value, prefix, leftJustify, minWidth, zeroPad);
            case 'e':
            case 'E':
            case 'f':
            case 'F':
            case 'g':
            case 'G':
                number = +value;
                prefix = number < 0 ? '-' : positivePrefix;
                method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                value = prefix + Math.abs(number)[method](precision);
                return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
            default: return substring;
        }
    };
 
    return format.replace(regex, doFormat);
}

function trim(str) {
	if (!str || !str.replace) str='';
  	return str.replace(/^\s*|\s*$/g,"");
}

function toBool(str){
	if (typeof(str)=='boolean'){
		return str;
	}
  return ("false" === str) ? false : true;
}

function regex_decode(str){
  str = str.replace(/\\/gi, "\\\\");
  str = str.replace(/\^/gi, "\\^");
  str = str.replace(/\$/gi, "\\$");
  str = str.replace(/\*/gi, "\\*");
  str = str.replace(/\+/gi, "\\+");
  str = str.replace(/\?/gi, "\\?");
  str = str.replace(/\./gi, "\\.");
  str = str.replace(/\(/gi, "\\(");
  str = str.replace(/\)/gi, "\\)");
  str = str.replace(/\|/gi, "\\|");
  str = str.replace(/\{/gi, "\\{");
  str = str.replace(/\}/gi, "\\}");
  str = str.replace(/\[/gi, "\\[");		
  str = str.replace(/\]/gi, "\\]");
  return str;
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

function _getid(id){
	return document.getElementById(id);
}

function _i18n(s1){
	return chrome.i18n.getMessage(s1);
}

function proc_spell_getlang(s1,s2){
	var s=chrome.i18n.getMessage(s1);
	if (!s) s=s2;
	return s;
}

var messagetimer=null;
function show_message(s,x,y,padding){
	var obj=document.getElementById("layer_message");
	
	if (!x) x=10;
	if (!y) y=10;
	if (!padding) padding=5;

	x=document.body.scrollLeft+x;	
	y=document.body.scrollTop+y;;

	obj.style.left=x+"px";
	obj.style.top=y+"px";		
	obj.style["background-color"]="#FFFFE1";
	obj.style["border"]="1px solid #000000";
	obj.style["padding"]=padding+"px";
	
	obj.innerHTML="<label2>"+s+"</label2>";
	obj.style.display="";
	if (messagetimer) clearTimeout(messagetimer);
	messagetimer=setTimeout(function(){
		hide_message();
	},2000);
}

function hide_message(){
	obj=document.getElementById("layer_message");
	obj.style.display="none";
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Inject init
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
var supportlang = new Array(["da","Danish"],["nl","Dutch"],["en","English"],["fi","Finnish"],["fr","French"],["de","German"],["it","Italian"],["ko","Korean"],["pl","Polish"],["pt","Portuguese"],["ru","Russian"],["es","Spanish"],["sv","Swedish"]);
var bgstorage;
var g_config;
var g_enspellurl;
var g_optionsurl;
var ko_spellcheck_text;
var g_uniqid=getparamfromurl(location.href,'id');
var g_maxwordlength;

function proc_get_start_data(count){
	if(!count) count=0;
	if(count>30) return;	
//chrome.extension.sendRequest({type:'set_storagedefault'}, function(response) {
chrome.extension.sendRequest({type:'get_bgstorage', setdefault:true, id:g_uniqid}, function(r) {
	if(!r){
		count++;		
		setTimeout(function(){
			proc_get_start_data(count);
		},300);
		return;
	}
	//console.log(r);
	//console.log(JSON.stringify(r));	
	bgstorage=r.bgstorage;
	g_enspellurl=r.g_enspellurl;
	g_optionsurl=r.g_optionsurl;
	ko_spellcheck_text=r.ko_spellcheck_text;
	g_maxwordlength=r.maxwordlength;
	
	start();
});
//});
}
proc_get_start_data();

function proc_set_bgstorage(name,value){
	bgstorage[name]=value;
	chrome.extension.sendRequest({type:'set', key:name, value:value}, function(response) {});	
}

function get_actionkey(hotkey,hotkey2){
	var control="";
	if (hotkey=="ctrl+shift") control="Ctrl+Shift+";
	else if (hotkey=="ctrl+alt") control="Ctrl+Alt+";
	else if (hotkey=="ctrl") control="Ctrl+";
	else if (hotkey=="alt") control="Alt+";
	else if (hotkey=="shift") control="Shift+";
	
	if ((hotkey2>=65) && (hotkey2<=90)) {
		control=control+String.fromCharCode(hotkey2);
	} else if ((hotkey2>=112) && (hotkey2<=121)) {
		control=control+"F"+(hotkey2-111);
	} else if ((hotkey2>=48) && (hotkey2<=57)) {
		control=control+String.fromCharCode(hotkey2);
	} else if ((hotkey2>=188) && (hotkey2<=191)) {
		control=control+String.fromCharCode(hotkey2-188+44);
	} else if ((hotkey2>=219) && (hotkey2<=221)) {		
		control=control+String.fromCharCode(hotkey2-219+91);
	} else if (hotkey2==37) {		
		control=control+'Left';
	} else if (hotkey2==38) {		
		control=control+'Up';
	} else if (hotkey2==39) {		
		control=control+'Right';
	} else if (hotkey2==40) {		
		control=control+'Down';
	} else if (hotkey2==33) {		
		control=control+'PageUp';
	} else if (hotkey2==34) {		
		control=control+'PageDown';
	} else if (hotkey2==35) {		
		control=control+'End';
	} else if (hotkey2==36) {		
		control=control+'Home';
	} else {
		control="";
	}	
	if (control=="") control=chrome.i18n.getMessage('conf_none');
	return control;
}

function start(){
	

//other_newtablast=toBool(bgstorage["other_newtablast"]);						
	
var config = function () {
	var prev_hotkey=bgstorage['prev_hotkey'];
	this.prev_hotkey=prev_hotkey.toLowerCase();
	this.prev_hotkey2=bgstorage['prev_hotkey2'];
	this.prev_hotkey_name=get_actionkey(this.prev_hotkey,this.prev_hotkey2);	

	var next_hotkey=bgstorage['next_hotkey'];
	this.next_hotkey=next_hotkey.toLowerCase();
	this.next_hotkey2=bgstorage['next_hotkey2'];
	this.next_hotkey_name=get_actionkey(this.next_hotkey,this.next_hotkey2);	

	var sourcechange_hotkey=bgstorage['sourcechange_hotkey'];
	this.sourcechange_hotkey=sourcechange_hotkey.toLowerCase();
	this.sourcechange_hotkey2=bgstorage['sourcechange_hotkey2'];
	this.sourcechange_hotkey_name=get_actionkey(this.sourcechange_hotkey,this.sourcechange_hotkey2);	

	var suggestchange_hotkey=bgstorage['suggestchange_hotkey'];
	this.suggestchange_hotkey=suggestchange_hotkey.toLowerCase();
	this.suggestchange_hotkey2=bgstorage['suggestchange_hotkey2'];
	this.suggestchange_hotkey_name=get_actionkey(this.suggestchange_hotkey,this.suggestchange_hotkey2);	

	var textchange_hotkey=bgstorage['textchange_hotkey'];
	this.textchange_hotkey=textchange_hotkey.toLowerCase();
	this.textchange_hotkey2=bgstorage['textchange_hotkey2'];
	this.textchange_hotkey_name=get_actionkey(this.textchange_hotkey,this.textchange_hotkey2);	

	var gospell_hotkey=bgstorage['gospell_hotkey'];
	this.gospell_hotkey=gospell_hotkey.toLowerCase();
	this.gospell_hotkey2=bgstorage['gospell_hotkey2'];
	this.gospell_hotkey_name=get_actionkey(this.gospell_hotkey,this.gospell_hotkey2);	
	
	var copytext_hotkey=bgstorage['copytext_hotkey'];
	this.copytext_hotkey=copytext_hotkey.toLowerCase();
	this.copytext_hotkey2=bgstorage['copytext_hotkey2'];
	this.copytext_hotkey_name=get_actionkey(this.copytext_hotkey,this.copytext_hotkey2);	

	var adduserdic_hotkey=bgstorage['adduserdic_hotkey'];
	this.adduserdic_hotkey=adduserdic_hotkey.toLowerCase();
	this.adduserdic_hotkey2=bgstorage['adduserdic_hotkey2'];
	this.adduserdic_hotkey_name=get_actionkey(this.adduserdic_hotkey,this.adduserdic_hotkey2);		

	this.color_corrected='#'+bgstorage['color_corrected'];
	this.color_changed='#'+bgstorage['color_changed'];
	this.color_userdic='#'+bgstorage['color_userdic'];
	this.color_select='#'+bgstorage['color_select'];
}

try{
	g_config = new config();
}catch(err){}
	
try{	
	proc_setlang();	
}catch(err){}

try{
	user_dic_data=JSON.parse(bgstorage['user_dic_data']);
}catch(err){}
	
init();	

/*chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	try{	
		if (request.action=="disableunload") {
			window.onbeforeunload=null;
			sendResponse();
		}
	}catch(s){}    
});*/

}

window.addEventListener("message", function(event) {
	if(event.source != window) return;
	
	var a=event.data;
	if(!a.type) return;
	if(a.type=="bg_proc_change"){
		var obj=document.getElementById(a.id);
		if(obj) proc_change2(obj, a.x, a.y, scroll);
	}else if(a.type=="bg_proc_change_ok"){
		proc_change_ok();
	}
},false);

function proc_setlang(){
	function setlang(name,s){
		var a=document.getElementById(name);
		if (a) a.innerHTML=s;
	}
	function setlangtitle(name,s){
		var a=document.getElementById(name);
		if (a) a.title=s;
	}
	
	var s;
	var a=document.getElementsByTagName('*');
	for(var i = 0; i < a.length; i++){    
		if (a[i].id=='i18n'){
			s=chrome.i18n.getMessage(a[i].title);
			if (s) a[i].innerHTML=s;
			a[i].title='';
  		} else if (a[i].title){
  			if (a[i].title.indexOf('@')==0){
  				s=chrome.i18n.getMessage(a[i].title.substr(1,a[i].title.length));
  				if (s) a[i].title=s;
  			}
  		}
	}			
	
	var a=_getid('en_script');
	if (a){
		try{
			eval(a.value);
		}catch(err){}
	}
	var a=_getid('ko_script');
	if (a){
		try{
			eval(a.value);
		}catch(err){}
	}
	
	//document.title=chrome.i18n.getMessage('ext_name');
	
	var a=document.getElementById('i18n_msg_prev');
	if (a) a.innerHTML=chrome.i18n.getMessage('msg_prev')+'('+g_config.prev_hotkey_name+')';
	var a=document.getElementById('i18n_msg_next');
	if (a) a.innerHTML=chrome.i18n.getMessage('msg_next')+'('+g_config.next_hotkey_name+')';
	var a=document.getElementById('i18n_msg_prev2');
	if (a) a.innerHTML=chrome.i18n.getMessage('msg_prev')+'('+g_config.prev_hotkey_name+')';
	var a=document.getElementById('i18n_msg_next2');
	if (a) a.innerHTML=chrome.i18n.getMessage('msg_next')+'('+g_config.next_hotkey_name+')';
	
	var a=document.getElementById('i18n_msg_change');
	if (a) a.innerHTML=chrome.i18n.getMessage('msg_change')+'('+g_config.sourcechange_hotkey_name+')';
	var a=document.getElementById('i18n_msg_change2');
	if (a) a.innerHTML=chrome.i18n.getMessage('msg_change')+'('+g_config.textchange_hotkey_name+')';

	var a=document.getElementById('i18n_msg_gospellcheck');
	if (a) a.innerHTML=chrome.i18n.getMessage('msg_gospellcheck')+'('+g_config.gospell_hotkey_name+')';

	var a=document.getElementById('i18n_msg_openeditwindow');
	if (a) a.innerHTML=chrome.i18n.getMessage('msg_openeditwindow')+'('+g_config.prev_hotkey_name+','+g_config.next_hotkey_name+')';	
	
	var a=document.getElementById('btn_proc_copy');
	if (a) a.innerHTML=chrome.i18n.getMessage('msg_copytext')+'('+g_config.copytext_hotkey_name+')';	
	
	var a=document.getElementById('btn_add_userdic');
	if (a) {
		var s=a.innerText;
		a.innerHTML=s+'('+g_config.adduserdic_hotkey_name+')';		
	}
	
	var a=document.getElementById('btn_proc_change_prev');
	if (a) a.onclick=proc_change_prev;
	var a=document.getElementById('btn_proc_change_next');
	if (a) a.onclick=proc_change_next;
	var a=document.getElementById('btn_proc_change_prev2');
	if (a) a.onclick=proc_change_prev;
	var a=document.getElementById('btn_proc_change_next2');
	if (a) a.onclick=proc_change_next;
	
	var a=document.getElementById('btn_proc_change_ok_source');
	if (a) a.onclick=proc_change_ok_source;
	var a=document.getElementById('btn_add_userdic');
	if (a) a.onclick=proc_add_userdic;
	var a=document.getElementById('btn_proc_del_userdic');
	if (a) a.onclick=proc_del_userdic;

	var a=document.getElementById('btn_proc_go2');
	if (a) a.onclick=proc_go2;
	var a=document.getElementById('btn_proc_stop');
	if (a) a.onclick=proc_stop;	
	var a=document.getElementById('btn_proc_savedata');
	if (a) a.onclick=proc_savedata;
	var a=document.getElementById('btn_proc_opendata');
	if (a) a.onclick=proc_opendata;
	//var a=document.getElementById('btn_proc_lastload');
	//if (a) a.onclick=proc_lastload;
	
	var a=document.getElementById('btn_proc_copy');
	if (a) a.onclick=proc_copy;
	var a=document.getElementById('spell_copy_close');
	if (a) a.onclick=proc_copy_close;
	var a=document.getElementById('spell_open_edit');
	if (a) a.onclick=proc_open_edit_window;	
	var a=document.getElementById('other_ko_autocorrection');
	if (a){
		a.onclick=function(){
			proc_set_bgstorage('other_ko_autocorrection',this.checked);
		}
	}	
	var a=document.getElementById('other_ko_spellautoclose');
	if (a){
		a.onclick=function(){
			proc_set_bgstorage('other_ko_spellautoclose',this.checked);
			var b=_getid("nav_1");
			var c=_getid("nav_2");
			if (this.checked){
				b.style.display="none";
				c.style.display="";
			}else{
				b.style.display="";
				c.style.display="none";
			}
		}
	}
	var a=document.getElementById('other_ko_spellchangeall');
	if (a){
		a.onclick=function(){
			proc_set_bgstorage('other_ko_spellchangeall',this.checked);
		}	
	}
	
	var a=document.getElementById('other_ko_showdesc');
	if (a) a.onclick=other_ko_showdesc_click;
	var a=document.getElementById('btn_proc_change_ok_text');
	if (a) a.onclick=function (){ proc_change_ok_text(2); };	
	
	var a=document.getElementById('maincontainer');
	if (a) a.style['max-width']=bgstorage['other_maxwidth']+'px';
	
	var a=document.getElementById('btn_option');
	if (a) {
		a.onclick=function (){ 
			//window.open(g_optionsurl);
			var openlast=false;
			if (bgstorage['other_ko_spellopentype']==0) openlast=true;
			chrome.extension.sendRequest({type:'open_tabexist', surl:g_optionsurl, last:openlast, id:true, openurl:false}, function(response) {});
	 	};	
	}
	
	var a=document.getElementById('other_ko_spell_lang');
	if (a) a.onchange=other_ko_spell_lang_onchange;	
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////// Spell Check
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
var user_dic_data={};
var srctext;
var controlfocused=false;
var spells=[];
var current_edit_id;
var g_resized=false;
var g_working=false;	
//var xhr=new XMLHttpRequest();
var xhr;

function init(){
	function addevent(name){
		var a=document.getElementById(name);
		if (a){
			//a.addEventListener('keydown', control_onkeydown, true); 	
			a.addEventListener('focus', function() {
				controlfocused=true;
			}, true); 	
			a.addEventListener('blur', function() {
				controlfocused=false;
			}, true); 	
		}
	}

	//var obj=document.getElementById('btn_proc_copy');
	//if (obj) obj.focus();
		
	addevent('content');
	addevent('spell_copy_text');
	addevent('other_ko_spell_lang');
	//addevent('spell_edit_text');
	addevent('spell_edit_userdic');
	//addevent('sel_change');	
	
	var obj=document.getElementById('content');
	if (obj){
		obj.focus();
		controlfocused=true;
	}
	
	var obj=document.getElementById('spell_edit_userdic');
	if (obj) obj.onkeydown=spell_edit_userdic_onkeydown;	
    	
	//savewinposition_timer=setInterval("proc_savewinposition()", 2000);
		
	srctext=ko_spellcheck_text;
	//var srctext=decodeURIComponent(getparamfromurl(location.href,'text'));
	//bgmodule.ko_spellcheck_text="";
	//if (srctext=='') srctext=localStorage["last_savedata"];
	//if (!srctext) srctext='';
	
	//window.onbeforeunload=deinit;
				
	/*document.getElementById('striphtml').innerHTML=srctext;
	srctext=document.getElementById('striphtml').innerText;
	document.getElementById('striphtml').innerHTML="";*/

	document.getElementById('content').value=srctext;

	
	document.addEventListener("mousedown",doc_eventMousedown,true);	
	document.addEventListener('keydown', doc_onkeydown, true); 		
	window.onresize=function(){		
		g_resized=true;
		if (current_edit_id){
			var obj=document.getElementById("spell_edit");
			if (obj.style.display==''){
				var idx=parseInt(current_edit_id.replace("spell_",""));
				if (idx>=0 && (idx<=spells.length-1)){
					proc_edit_fill(idx,false);
				}
			}
		}
	}
	
	var a=document.getElementById('spell_edit_desc');
	if (a){ 
		a.addEventListener('mousewheel', function(event){
			var delta = 0;
			if (!event) return;
			if (event.wheelDelta) {
				delta = event.wheelDelta/120;
				if (window.opera) delta = -delta;
			} else if (event.detail) delta = -event.detail/3;
			delta=parseInt(delta);
			if (!delta) return;
	
			var flag=false;
			var obj=document.getElementById('spell_edit_desc'); //event.target
			if (!obj) return;
	
			if (delta>0){
				if (obj.scrollTop<=0) flag=true;
			} else {
				if (obj.scrollTop+obj.offsetHeight >= obj.scrollHeight) flag=true;
			}	
			if (flag) {
		    	if (event.preventDefault) {event.preventDefault(); event.stopPropagation();}
    			else {event.returnValue = false; event.cancelBubble = true;}		
			}		
		},true); 
		
		a.addEventListener('keydown', function(e){
			var code=e.keyCode;				
			
			var flag=false;
			var obj=document.getElementById('spell_edit_desc'); //event.target
			if (!obj) return;
	
			if (code==38 || code==36 || code==33){
				if (obj.scrollTop<=0) flag=true;
			}else if (code==40 || code==35 || code==34){
				if (obj.scrollTop+obj.offsetHeight >= obj.scrollHeight) flag=true;
			}else{
				return;
			}
	
			if (flag) {
		    	if (e.preventDefault) {e.preventDefault(); e.stopPropagation();}
    			else {e.returnValue = false; e.cancelBubble = true;}		
			}			
		},true); 	
	}
	
	var obj=document.getElementById("other_ko_autocorrection");
	if (obj) obj.checked=toBool(bgstorage["other_ko_autocorrection"]);	

	var obj=document.getElementById("other_ko_spellautoclose");
	if (obj){
		obj.checked=toBool(bgstorage["other_ko_spellautoclose"]);	
		var b=_getid("nav_1");
		var c=_getid("nav_2");
		if (obj.checked){
			b.style.display="none";
			c.style.display="";
		}else{
			b.style.display="";
			c.style.display="none";
		}		
	}
	
	var obj=document.getElementById("other_ko_spellchangeall");
	if (obj) obj.checked=toBool(bgstorage["other_ko_spellchangeall"]);		

	var obj=document.getElementById("other_ko_showdesc");
	if (obj) obj.checked=toBool(bgstorage["other_ko_showdesc"]);	

	var obj=document.getElementById("other_ko_spell_lang");
	if (obj) {
		var s=bgstorage["other_ko_spell_lang"];
		if (s==''){
			var s1=window.navigator.language;
			for (var i = 0 ; i < supportlang.length; i++) {
				if (s1==supportlang[i][0]){
					proc_set_bgstorage('other_ko_spell_lang',s1);
					break;
				}
			}
		}
		var s=bgstorage["other_ko_spell_lang"];
		if (s=='') proc_set_bgstorage('other_ko_spell_lang','en');
		obj.value=bgstorage["other_ko_spell_lang"];	
		if (obj.value!='') proc_go2();
	}	
}

function deinit(){
	//chrome.extension.sendRequest({type:'set_ko_spellcheck_text', text:ko_spellcheck_text, id:g_uniqid}, function(r) {});	
	//if (savewinposition_timer) clearInterval(savewinposition_timer);
}

function find_user_dic_data(org){
	for (var a in user_dic_data){	
		if (a==org){
			return user_dic_data[a];
		}
	}
/*	
	if (!org) return;
	var s=org.toLowerCase();
	
	for (var a in user_dic_data){	
		if (a==s){
			var s2=user_dic_data[a];
			if (!s2) return;
			
			var s1=org.substr(0,1);
			if (s1==s1.toUpperCase()){
				s2=s2.substr(0,1).toUpperCase()+s2.substr(1,s2.length);
			} else {
				s2=s2.substr(0,1).toLowerCase()+s2.substr(1,s2.length);
			}
						
			return s2;
		}
	}*/
}

/*var savewinposition_timer=null;
var lastwinposition={left:-1,top:-1,width:-1,height:-1};
function proc_savewinposition(){
	chrome.windows.getCurrent(function (win){
		if (win) {
			if ((win.width >= screen.availWidth) && (win.height >= screen.availHeight)) return;			
			if ((lastwinposition.left==win.left) && (lastwinposition.top==win.top) && (lastwinposition.width==win.width) && (lastwinposition.height==win.height)) return;
			var a={};
			a.left=win.left;
			a.top=win.top;
			a.width=win.width;
			a.height=win.height;
			lastwinposition=a;
			localStorage["other_ko_spellwinpos"]=JSON.stringify(a);	
		}
	});	
}*/

/*function control_onkeydown(e){ 
	var code=e.keyCode;
	var press_ctrl=typeof e.modifiers=='undefined'?e.ctrlKey:e.modifiers&Event.CONTROL_MASK;
	var press_alt=typeof e.modifiers=='undefined'?e.altKey:e.modifiers&Event.ALT_MASK;
	var press_shift=typeof e.modifiers=='undefined'?e.shiftKey:e.modifiers&Event.SHIFT_MASK;		
	
	var control="";
	if ((press_ctrl) && (press_shift)) control="ctrl+shift";
	else if ((press_ctrl) && (press_alt)) control="ctrl+alt";
	else if (press_ctrl) control="ctrl";
	else if (press_alt) control="alt";
	else if (press_shift) control="shift";	
	
	if ((code < 112) || (code > 121)) { //f1~f10
		if ((control=='alt') || (control=='ctrl+alt')){
		} else {
			e.stopPropagation();
		}
	}
}*/

function spell_edit_userdic_onkeydown(e){ 
	var code=e.keyCode;
	var press_ctrl=typeof e.modifiers=='undefined'?e.ctrlKey:e.modifiers&Event.CONTROL_MASK;
	var press_alt=typeof e.modifiers=='undefined'?e.altKey:e.modifiers&Event.ALT_MASK;
	var press_shift=typeof e.modifiers=='undefined'?e.shiftKey:e.modifiers&Event.SHIFT_MASK;		
	if (!press_ctrl && !press_alt && !press_shift){
		if (code==13){
			proc_change_ok_text(2);
			e.stopPropagation();
		}
	}
}

function sel_change_onkeydown(e){ 
	var code=e.keyCode;
	var press_ctrl=typeof e.modifiers=='undefined'?e.ctrlKey:e.modifiers&Event.CONTROL_MASK;
	var press_alt=typeof e.modifiers=='undefined'?e.altKey:e.modifiers&Event.ALT_MASK;
	var press_shift=typeof e.modifiers=='undefined'?e.shiftKey:e.modifiers&Event.SHIFT_MASK;		
	if (!press_ctrl && !press_alt && !press_shift){
		if (code==13){
			proc_change_ok();
			e.stopPropagation();
		}
	}
}

function sel_change_onclick(){
	proc_change_ok();
	//proc_change_ok(true);
}
	
function fnSelect(objId)
{
   fnDeSelect();
   if (document.selection) {
      var range = document.body.createTextRange();
      range.moveToElementText(document.getElementById(objId));
      range.select();
   } else if (window.getSelection) {
      var range = document.createRange();
      range.selectNode(document.getElementById(objId));
      window.getSelection().addRange(range);
   }
}

function fnDeSelect() {
   if (document.selection)
             document.selection.empty();
   else if (window.getSelection)
              window.getSelection().removeAllRanges();
} 
	
function html_entity_decode(str){
	if (!str || !str.replace) str='';
  str = str.replace(/&amp;/gi, "&");
  str = str.replace(/&gt;/gi, ">");
  str = str.replace(/&lt;/gi, "<");
  str = str.replace(/&quot;/gi, "\"");
  str = str.replace(/&#039;/gi, "'");
  return str;
}

function html_entity_encode(str){
	if (!str || !str.replace) str='';
  str = str.replace(/&/gi, "&amp;");
  str = str.replace(/>/gi, "&gt;");
  str = str.replace(/</gi, "&lt;");
  str = str.replace(/\"/gi, "&quot;");
  str = str.replace(/\'/gi, "&#039;");
  str = str.replace(/\r\n|\n/g, "<br>");
  return str;
}

function html_entity_encode_org(str){
	if (!str || !str.replace) str='';
  str = str.replace(/&/gi, "&amp;");
  str = str.replace(/>/gi, "&gt;");
  str = str.replace(/</gi, "&lt;");
  str = str.replace(/\"/gi, "&quot;");
  str = str.replace(/\'/gi, "&#039;");
  return str;
}

function showloading(){
	var obj=document.getElementById("processing");

	var x=document.body.scrollLeft+10;	
	var y=document.body.scrollTop+10;;

	obj.style.left=x+"px";
	obj.style.top=y+"px";		
	obj.style["background-color"]="#FFFFE1";
	obj.style["border"]="1px solid #000000";
	obj.style["padding"]="5px";
	obj.style.display="";
}

function hideloading(){
	var obj=document.getElementById("processing");
	obj.style.display="none";
}
	
/*function proc_striphtml(oldString) {
   var newString = "";
   var inTag = false;
   for(var i = 0; i < oldString.length; i++) { 
        if(oldString.charAt(i) == '<') inTag = true;
        if(oldString.charAt(i) == '>') {
           if(oldString.charAt(i+1)=="<") {

			 } else	{
				inTag = false;
				i++;
			}
       }   
       if(!inTag) newString += oldString.charAt(i);
   }
   return newString;
}*/

function getparamfromurl(s,name){
	name=name+"=";
	var p1=s.indexOf(name);
	if (p1<0) return "";
	s=s.substr(p1+name.length,s.length);
	var p2=s.indexOf("&");
	if (p2>=0) {
		return s.substr(0,p2);
	} else {
		return s;
	}
}
	
//var btn_go_timer;
function proc_go_timer(enable){
try{	
	g_working=enable;
	if (enable){
		var a=_getid("div_error");
		if(a) a.style.display="none";
		_getid("btn_proc_go2").disabled=true;
		_getid("btn_proc_stop").disabled=false;
	}else{
		_getid("btn_proc_go2").disabled=false;
		_getid("btn_proc_stop").disabled=true;
	}
	/*if (enable){
		clearTimeout(btn_go_timer);
		_getid("btn_proc_go2").disabled=true;
		btn_go_timer=setTimeout(function(){
			_getid("btn_proc_go2").disabled=false;
		},2500);
	}else{
		clearTimeout(btn_go_timer);
		_getid("btn_proc_go2").disabled=false;
	}*/
}catch(err){}
}	

function proc_go2(){
	if (_getid("btn_proc_go2").disabled) return;
	
	current_edit_id=null;	
	hide_spell_edit();
	var obj3=document.getElementById("fakescroll");
	if (obj3) obj3.style.top='0px';	
	
	document.getElementById('suggest_content').innerHTML='';
	//bgmodule.ko_spellcheck_text=document.getElementById('content').value;
	//srctext=bgmodule.ko_spellcheck_text;
	srctext=document.getElementById('content').value;
	proc_go();
/*	
	bgmodule.ko_spellcheck_text=document.getElementById('content').value;
	if (bgmodule.ko_spellcheck_text==''){
		return;
	}
	location.href='spellcheck_ko.html';*/
}

function proc_go(){
	
	document.getElementById('div_extra').style.display='none';
	proc_copy_close();

	if (srctext=="") {
		document.getElementById('suggest_content').innerHTML='<font color="blue">'+chrome.i18n.getMessage('msg_noinput')+'</font>';
		return;	
	}

	//chrome.extension.sendRequest({type:'set', key:'last_spelldata', value:srctext}, function(response){});
	
	var obj=document.getElementById("other_ko_spell_lang");
	var s=obj.value;
/*	
	var maxwordlength=30000;
	if (s=='ko') maxwordlength=5000;
	
	if (srctext.length > maxwordlength) {
		srctext=srctext.substr(0, maxwordlength);
		show_message("<label2><font style='font-size:13px'>"+sprintf(chrome.i18n.getMessage('msg_maxword'),maxwordlength)+"</font></label2>");		
	}*/
	//document.getElementById('content').value=srctext;
	
	if (s=='ko') {
		if (window.proc_spell_ko_inf) proc_spell_ko_inf();	
	} else {
		if (window.proc_spell_en_inf) proc_spell_en_inf();	
		//proc_spell_en();
	}
}

var label_current_spell;
var edit_scroll_timer=null;

function proc_edit_fill(idx,scroll){
	var b=spells[idx];
	
	var obj=document.getElementById('spell_edit_nav');
	if (obj) obj.innerHTML=(idx+1)+'/'+(spells.length);
	var obj=document.getElementById('spell_edit_nav2');
	if (obj) obj.innerHTML=(idx+1)+'/'+(spells.length);
		
	var cstr;
	var obj=document.getElementById('spell_edit_current');
	var obj2=document.getElementById('spell_'+idx);
	if (obj2){
		if (label_current_spell) label_current_spell.style["background-color"]="";
		//obj2.style["border"]="1px solid red";
		obj2.style["background-color"]=g_config.color_select;		
		label_current_spell=obj2;
		cstr=obj2.innerText;
		obj.innerHTML='&nbsp;'+html_entity_encode(cstr);
	}
	
	var obj=document.getElementById('spell_edit_source');
	obj.innerHTML='&nbsp;'+html_entity_encode(b.source);
	
	var obj=document.getElementById('spell_edit_userdic');	
	var userdicdata=find_user_dic_data(b.source);	
	if (userdicdata){
		obj.value=userdicdata;
		_getid("btn_proc_del_userdic").disabled=false;
	}else{
		obj.value='';
		_getid("btn_proc_del_userdic").disabled=true;
	}
	
	//var obj=document.getElementById('spell_edit_text');
	//obj.value=b.source;	
		
	var s1="";
	var s2="";		
	var s3;
	for (var i = 0 ; i < b.correct.length ; i++) {
		//if (!cstr && i==0) s2=' selected '; 
		if (cstr==b.correct[i]) s2=' selected '; 
		else s2='';
		s3=html_entity_encode(b.correct[i]);
		s1=s1+'<option '+s2+'value="'+s3+'">'+s3;
	}
	var obj=document.getElementById('spell_edit_list');
	if (s1!='') {
		obj.innerHTML='<select id="sel_change" style="min-width:150px;font-size:13px" size="5" multiple="multiple">'+s1+'</select><button onClick="proc_change_ok();">'+chrome.i18n.getMessage('msg_change')+'('+g_config.suggestchange_hotkey_name+')</button>';		
	} else {
		obj.innerHTML='&nbsp;<font style="font-size:13px;color:red">'+chrome.i18n.getMessage('msg_nosuggest')+'</font>';
	}
		
	var obj=document.getElementById('sel_change');
	if (obj) {
		obj.onkeydown=sel_change_onkeydown;	
		obj.onclick=sel_change_onclick;
	}
		
	var obj=document.getElementById('spell_edit_desc');	
	var sd=toBool(bgstorage["other_ko_showdesc"]);
	
	if (b.desc) obj.innerHTML=b.desc;
	else obj.innerHTML='';
		
	if (b.desc && sd) obj.style.display='';	
	else obj.style.display='none';
		
	var obj=document.getElementById('spell_edit_showdesc');	
	if (b.desc) obj.style.display='';
	else obj.style.display='none';
	
	//set position
	var x=obj2.offsetLeft;
	var y=obj2.offsetTop+obj2.offsetHeight;
	
	var obj=document.getElementById("spell_edit");
	obj.style.display='';
		
	var w1=obj.clientWidth;
	var h1=obj.clientHeight;
	if ((x+w1) > document.body.offsetWidth)
		x=document.body.offsetWidth-w1;				
		
	/*var x=cx+document.body.scrollLeft+5;
	var y=cy+document.body.scrollTop+10;
	var w1=obj.clientWidth;
	var h1=obj.clientHeight;
	
	if ((fix==null) || fix){
		if ((x+w1) > (window.innerWidth-22))
			x=(window.innerWidth-22)-w1;				
		var h=document.body.scrollTop+window.innerHeight;
		if ((y+h1+15) > h) y=h-h1-15;
	
		if (x<0) x=0;
		if (y<0) y=0;
	}*/
	
	obj.style.left=x+'px';
	obj.style.top=y+'px';
	
	var obj3=document.getElementById("fakescroll");
	var h2=y+h1;
	if (g_resized){
		g_resized=false;
		obj3.style.top=h2+'px';
	}else{
		if (obj3.offsetTop<h2){
			obj3.style.top=h2+'px';
		}
	}
	
	//set scroll
	if (scroll) {
		var y1=obj2.offsetTop;
		var y2=y+h1;	
		if (edit_scroll_timer) clearTimeout(edit_scroll_timer);
		edit_scroll_timer=setTimeout(function(){
			proc_edit_scroll(y1,y2);
		},10);
	}
}

function proc_edit_scroll(y1,y2){
	if (y2>document.body.scrollTop+window.innerHeight){
		window.scrollTo(0, y2);	
	}
	if ((y1<document.body.scrollTop) || (y1>document.body.scrollTop+window.innerHeight)){
		window.scrollTo(0, y1);
	}
	var obj=document.getElementById('sel_change');
	if (obj) obj.focus();			
}

function proc_change(f,e,scroll){
	proc_change2(f,e.clientX,e.clientY,scroll);
}

function proc_change2(f,cx,cy,scroll){
	var s=f.id;
	current_edit_id=s;
	var idx=parseInt(s.replace("spell_",""));
	if ((idx<0) || (idx>spells.length-1)) return;
	
	var obj=document.getElementById("spell_edit");
	obj.style.border="1px solid black";
	obj.style["background-color"]="#FFFFE1";
	obj.style["padding"]="5px";	

	proc_edit_fill(idx,scroll);		
	//document.getElementById('other_ko_spellchangeall').checked=false;	
}

function proc_open_edit_window(){
	var obj=document.getElementById(current_edit_id);
	if (!obj){
		var idx=-1;
		while (true){
			idx=idx+1;	
			obj=document.getElementById('spell_'+idx);
			if (obj) break;
			if ((idx<0) || (idx>spells.length-1)) {	
				alert(chrome.i18n.getMessage('msg_nodata'));
				return;
			}
		}
	}
	var obj2=document.getElementById('spell_open_edit');
	var cx=obj2.offsetLeft;
	var cy=obj2.offsetTop+obj2.clientHeight-document.body.scrollTop;
	
	proc_change2(obj,cx,cy,true);
}
////////////////////////////////////////////////////////
function set_lastchangeword(idx,s){
	if (idx==null){
		idx=parseInt(current_edit_id.replace("spell_",""));
	}
	if ((idx>=0) && (idx<=spells.length-1)) {
		var b=spells[idx];	
		b.lastchangeword=s;
	}
}
	
function proc_change_ok(onlycurrent){
	var obj=document.getElementById('sel_change');
	var obj2=document.getElementById(current_edit_id);
	if (!obj) return;
	if (!obj2) return;
	if (obj.value=="") {
		show_message("<label2><font style='font-size:13px'>"+chrome.i18n.getMessage('msg_notselected')+"</font></label2>");
		return;
	}
	
	if (!onlycurrent && document.getElementById('other_ko_spellchangeall').checked){
		if (proc_change_all(obj.value,true)){
			if (!onlycurrent){
				if (document.getElementById('other_ko_spellautoclose').checked) hide_spell_edit();
			}				
			return;
		}
	}
	
	obj2.innerHTML='<font color="'+g_config.color_changed+'">'+obj.value+'</font>';
	
	set_lastchangeword(null, obj.value);
	
	if (!onlycurrent){
		if (document.getElementById('other_ko_spellautoclose').checked) hide_spell_edit();
	}
	//proc_setfocus2();
}

function proc_change_ok_source(){	
	if (!current_edit_id) return;
	var idx=parseInt(current_edit_id.replace("spell_",""));
	if ((idx<0) || (idx>spells.length-1)) return;
	var b=spells[idx];
	
	if (document.getElementById('other_ko_spellchangeall').checked){
		if (proc_change_all(b.source)){
			if (document.getElementById('other_ko_spellautoclose').checked) hide_spell_edit();
			return;
		}
	}
	
	var obj2=document.getElementById(current_edit_id);
	obj2.innerHTML='<font color="'+g_config.color_changed+'">'+html_entity_encode(b.source)+'</font>';
	
	set_lastchangeword(null, b.source);
	
	if (document.getElementById('other_ko_spellautoclose').checked) hide_spell_edit();
	//proc_setfocus2();
}

function proc_change_ok_text(id){
	if (id==1) var obj=document.getElementById('spell_edit_text');
	else var obj=document.getElementById('spell_edit_userdic');
		
	var obj2=document.getElementById(current_edit_id);
	if (!obj) return;
	if (!obj2) return;
	if (obj.value=='') {
		show_message("<label2><font style='font-size:13px'>"+chrome.i18n.getMessage('msg_noinput')+"</font></label2>");		
		return;
	}	
	
	if (document.getElementById('other_ko_spellchangeall').checked){
		if (proc_change_all(obj.value)){
			if (document.getElementById('other_ko_spellautoclose').checked) hide_spell_edit();
			return;
		}
	}
	
	obj2.innerHTML='<font color="'+g_config.color_changed+'">'+html_entity_encode(obj.value)+'</font>';
	
	set_lastchangeword(null, obj.value);
	
	if (document.getElementById('other_ko_spellautoclose').checked) hide_spell_edit();
}

function proc_setfocus(){
	chrome.extension.sendRequest({type:'set_focustab'}, function(){
		var obj=document.getElementById('sel_change');
		if (obj) obj.focus();						
	});
}	

/*function proc_setfocus2(){
	var obj=document.getElementById("spell_edit");
	if (obj.style.display==''){
		var obj=document.getElementById('sel_change');
		if (obj) obj.focus();						
	}
}*/

function proc_add_userdic(){
	if (!current_edit_id) return;
	var idx=parseInt(current_edit_id.replace("spell_",""));
	if ((idx<0) || (idx>spells.length-1)) return;
	var b=spells[idx];
	var s1=b.source;
	
	s1=prompt('Enter the source word.',s1);
	if (s1) s1=trim(s1);
	if (!s1) {
		proc_setfocus();
		return;
	}
	if (s1.indexOf("->")>=0) {
		alert(sprintf(_i18n('msg_wrongword'),"->"));
		proc_setfocus();
		return;	
	}

	var obj=document.getElementById('spell_edit_userdic');
	var s2=b.lastchangeword;
	if (!s2) s2=obj.value;
	if (!s2) s2=b.source;
	
	s2=prompt('Enter the replace word.',s2);
	if (s2) s2=trim(s2);
	if (!s2) {
		proc_setfocus();
		return;	
	}
	if (s2.indexOf("->")>=0) {
		alert(sprintf(_i18n('msg_wrongword'),"->"));
		proc_setfocus();
		return;	
	}

	/*try{
		user_dic_data=JSON.parse(bgstorage['user_dic_data']);
	}catch(err){}*/	
	var k=0;	
	for (var a in user_dic_data){	
		k++;
		if (k>=1500) {
			alert("You can not add to user dictionary anymore.\nThe maximum possible number is 1500.");
			proc_setfocus();
			return;
		}
	}
				
	user_dic_data[s1]=s2;
	proc_set_bgstorage('user_dic_data',JSON.stringify(user_dic_data));
	if (b.source==s1){
		//b.userdicdata=s2;
		if (!obj.value) obj.value=s2;
		_getid("btn_proc_del_userdic").disabled=false;
	}
	
	show_message("<label2><font style='font-size:13px'>"+"It was added to user dictionary."+"</font></label2>");
	proc_setfocus();
}

function proc_del_userdic(){
	if (!current_edit_id) return;
	var idx=parseInt(current_edit_id.replace("spell_",""));
	if ((idx<0) || (idx>spells.length-1)) return;
	var b=spells[idx];
	var s1=b.source;
	
	var answer=confirm(s1+'\n\nDo you want to delete this word from user dictionary?');				
	if (!answer) {
		proc_setfocus();
		return;		
	}
		
	/*try{
		user_dic_data=JSON.parse(bgstorage['user_dic_data']);
	}catch(err){}*/
	delete user_dic_data[s1];
	proc_set_bgstorage('user_dic_data',JSON.stringify(user_dic_data));
	//b.userdicdata="";
	_getid("btn_proc_del_userdic").disabled=true;
		
	show_message("<label2><font style='font-size:13px'>"+"It was deleted from user dictionary."+"</font></label2>");
	proc_setfocus();
}

function proc_change_all(target,encodeoff){
	/*var a=confirm('Do you want to change all the words like this?');				
	if (!a) {
		//proc_setfocus2();
		return false;
	}*/
	
	if (!current_edit_id) return true;
	var idx=parseInt(current_edit_id.replace("spell_",""));
	if ((idx<0) || (idx>spells.length-1)) return true;
	var b=spells[idx];
	
	var src=b.source;
	if (!encodeoff) target2=html_entity_encode(target);
	else target2=target;
	
	var k=0;
	for (var i = 0 ; i < spells.length ; i++) {	
		var b=spells[i];
		if (b.source==src){
			var id='spell_'+i;
			var obj=document.getElementById(id);
			if (obj){
				obj.innerHTML='<font color="'+g_config.color_changed+'">'+target2+'</font>';
				k++;
				set_lastchangeword(i, target);
			}
		}
	}
		
	var s=k+' source has changed.';
	show_message("<label2><font style='font-size:13px'>"+s+"</font></label2>");
	
	//proc_setfocus2();
	return true;
}

function proc_change_prev(){
	if (!current_edit_id) return;
	var idx=parseInt(current_edit_id.replace("spell_",""));
	
	var id;
	while (true) {
		idx=idx-1;
		id='spell_'+idx;
		var obj=document.getElementById(id);
		if (obj)	break;
		if ((idx<0) || (idx>spells.length-1)) {
			if (_getid("spell_edit").style.display=='') 
				show_message("<label2><font style='font-size:13px'>"+chrome.i18n.getMessage('msg_first')+"</font></label2>");
			else 
				proc_open_edit_window();
			return;
		}
	}	
	current_edit_id=id;
	proc_edit_fill(idx,true);
}

function proc_change_next(){
	if (!current_edit_id) return;
	var idx=parseInt(current_edit_id.replace("spell_",""));
	
	var id;
	while (true){
		idx=idx+1;	
		id='spell_'+idx;
		var obj=document.getElementById(id);
		if (obj) break;
		if ((idx<0) || (idx>spells.length-1)) {
			if (_getid("spell_edit").style.display=='') 
				show_message("<label2><font style='font-size:13px'>"+chrome.i18n.getMessage('msg_last')+"</font></label2>");
			else 
				proc_open_edit_window();
			return;
		}
	}
	
	current_edit_id=id;
	proc_edit_fill(idx,true);	
}

////////////////////////////////////////////////////////
function other_ko_spell_lang_onchange(){
	proc_set_bgstorage('other_ko_spell_lang',this.value);
	proc_go2();
}

//proc_go();

function other_ko_showdesc_click(){
	proc_set_bgstorage('other_ko_showdesc',this.checked);
	var obj=document.getElementById('spell_edit_desc');	
	if (this.checked) obj.style.display='';
	else obj.style.display='none';	
}

function hide_spell_edit(){
	var obj=document.getElementById("spell_edit");
	obj.style.display='none';
	if (label_current_spell) label_current_spell.style["background-color"]="";
}

function doc_eventMousedown(e){
	var s=e.target.nodeName;
	s=s.toLowerCase();
	
	var obj=document.getElementById("spell_edit");
	if (obj.style.display!='') return;
	
	var x=e.clientX+document.body.scrollLeft;
	var y=e.clientY+document.body.scrollTop;
	
	if ((x>=obj.offsetLeft) && (x<=obj.offsetLeft+obj.clientWidth) && (y>=obj.offsetTop) && (y<=obj.offsetTop+obj.clientHeight)){
	} else {	
		hide_spell_edit();
	}
}

function doc_onkeydown(e){ 	
	var code=e.keyCode;
	var press_ctrl=typeof e.modifiers=='undefined'?e.ctrlKey:e.modifiers&Event.CONTROL_MASK;
	var press_alt=typeof e.modifiers=='undefined'?e.altKey:e.modifiers&Event.ALT_MASK;
	var press_shift=typeof e.modifiers=='undefined'?e.shiftKey:e.modifiers&Event.SHIFT_MASK;		
	
	var control="";
	if ((press_ctrl) && (press_shift)) control="ctrl+shift";
	else if ((press_ctrl) && (press_alt)) control="ctrl+alt";
	else if (press_ctrl) control="ctrl";
	else if (press_alt) control="alt";
	else if (press_shift) control="shift";	
		
	if (controlfocused){
		//console.error('controlfocused');
		if ((code < 112) || (code > 121)) { //except f1~f10 
			if ((control=='') || (control=='shift'))
				 return;
		}		
	}
	
	function keystop(){
    	if (e.preventDefault) {e.preventDefault(); e.stopPropagation();}
    	else {e.returnValue = false; e.cancelBubble = true;}				
	}
	
	if ((code==g_config.prev_hotkey2) && (control==g_config.prev_hotkey)) { //f6
		var obj2=document.getElementById('spell_open_edit');
		if (!obj2.disabled){
			if (current_edit_id) proc_change_prev();
			else proc_open_edit_window();
		}
		keystop();
		return;
	}else if ((code==g_config.next_hotkey2) && (control==g_config.next_hotkey)) { //f7
		var obj2=document.getElementById('spell_open_edit');
		if (!obj2.disabled){		
			if (current_edit_id) proc_change_next();
			else proc_open_edit_window();			
		}
		keystop();
		return;
	}
			
	var flag=false;		
	var obj=document.getElementById('spell_edit');
	if (obj.style.display==''){
		flag=true;
		if ((control=='') && (code==27)) {
			hide_spell_edit();
		} else if ((code==g_config.sourcechange_hotkey2) && (control==g_config.sourcechange_hotkey)) { //f8
			proc_change_ok_source();
		} else if ((code==g_config.suggestchange_hotkey2) && (control==g_config.suggestchange_hotkey)) { //f9
			proc_change_ok();
		} else if ((code==g_config.textchange_hotkey2) && (control==g_config.textchange_hotkey)) { //f10
			proc_change_ok_text(2);
		} else if ((code==g_config.gospell_hotkey2) && (control==g_config.gospell_hotkey)) { //f2
			proc_go2();
		} else if ((code==g_config.copytext_hotkey2) && (control==g_config.copytext_hotkey)) { //ctrl+f6
			proc_copy();
		} else if ((code==g_config.adduserdic_hotkey2) && (control==g_config.adduserdic_hotkey)) { //ctrl+f7
			proc_add_userdic();	
		} else {
			flag=false;
		}
	} else {
		flag=true;
		if ((code==g_config.gospell_hotkey2) && (control==g_config.gospell_hotkey)) { //f2
			proc_go2();
		} else if ((code==g_config.copytext_hotkey2) && (control==g_config.copytext_hotkey)) { //ctrl+f6
			proc_copy();			
		} else {
			flag=false;
		}
	}			
	
/*	
	var flag=false;
	if ((!press_ctrl) && (!press_alt) && (!press_shift)) {
		var obj=document.getElementById('spell_edit');
		if (obj.style.display==''){
			flag=true;
			if (code==27) {
				hide_spell_edit();
			} else if (code==117) { //f6
				proc_change_prev();
			} else if (code==118) { //f7
				proc_change_next();
			} else if (code==119) { //f8
				proc_change_ok_source();
			} else if (code==120) { //f9
				proc_change_ok();
			} else if (code==121) { //f10
				proc_change_ok_text();
			} else {
				flag=false;
			}
		} else {
			flag=true;
			if ((code==117) || (code==118)){ //f7
				var obj2=document.getElementById('spell_open_edit');
				if (!obj2.disabled) proc_open_edit_window();
			} else {
				flag=false;
			}
		}		
	}
*/	

	if (flag){
		keystop();
	}	
}

function proc_copy(){
	var obj2=document.getElementById("suggest_content");
	var s=obj2.innerText;
	
	//fnSelect('suggest_content');
	var obj3=document.getElementById("spell_copy_text");
	obj3.value=s;
	obj3.style.display='';
	//obj3.focus();
	obj3.select();
	
	chrome.extension.sendRequest({type:'copytoclipboard', text :s}, function(response) {});	
	
	show_message("<label2><font style='font-size:13px'>"+chrome.i18n.getMessage('msg_copyclipboard')+"</font></label2>");		
	
	var obj3=document.getElementById("spell_copy_close");
	obj3.disabled=	false;	
}  

function proc_copy_close(){
	var obj3=document.getElementById("spell_copy_text");
	obj3.style.display='none';
	obj3.value='';	
	var obj3=document.getElementById("spell_copy_close");
	obj3.disabled=	true;
} 
	
function proc_error(err,err2){
	var s=chrome.i18n.getMessage('msg_error');
	if(err) s=s+' ('+err+')';
	if(err2) s=s+err2;
	var a=_getid("div_error");
	if(a){
		a.innerHTML='<font color="red">'+s+'</font>';
		a.style.display="";
	}
}

var jobarr=[];
function proc_stop(){
	proc_go_timer(false);
	chrome.extension.sendRequest({type:'get_stop'}, function(response){
	});				
	/*for(var i=0; i < jobarr.length; i++){	
		if(jobarr[i].xhr) jobarr[i].xhr.abort();
	}	
	if(xhr) xhr.abort();*/
}
function fetchRemotePost(surl, param, callback) {
	showloading();

	var request={};
	request.idx=0;
	request.type='get_url';
	request.url=surl;
	request.method='POST';
	request.header=[];
	request.header.push({name:'Content-Type', value:'application/x-www-form-urlencoded'});
	request.body=param;
	request.readystate=true;

	chrome.extension.sendRequest(request, function(response){
		if(!response) response={};
		if(response){
			callback(response.response || '');
		}
	});				

  /*xhr.abort();   
  showloading();
 
  xhr.open("POST", surl);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(param);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var data = xhr.responseText;
      callback(data);
    }
  };*/
}


var g_en_param="https://www.googleapis.com/rpc";
function proc_en_getparam(src,lang){
	var param={};
	param.method="spelling.check";
	param.apiVersion="v2";
	param.params={};
	param.params.text=src;
	param.params.language=lang;
	param.params.key="AIzaSyCLlKc60a3z7lo8deV-hAyDU7rHYgL4HZg";
	return param;
}

function proc_savedata(){
	var answer = confirm(chrome.i18n.getMessage('msg_areyousure'));
	if (answer){
		var s=document.getElementById("content").value;
		chrome.extension.sendRequest({type:'set', key:'last_savedata', value:s}, function(response){
			show_message("<label2><font style='font-size:13px'>"+chrome.i18n.getMessage('conf_saved')+"</font></label2>");
		});
	}
}	

function proc_opendata(){
	chrome.extension.sendRequest({type:'get', key:'last_savedata'}, function(response){
		if (response) {
			document.getElementById("content").value=response;
			show_message("<label2><font style='font-size:13px'>"+chrome.i18n.getMessage('msg_loadcomplete')+"</font></label2>");
		} else {
			show_message("<label2><font style='font-size:13px'>"+chrome.i18n.getMessage('conf_none')+"</font></label2>");
		}
	});
}	

/*function proc_lastload(){
	chrome.extension.sendRequest({type:'get', key:'last_spelldata'}, function(response){
		if (response) {
			document.getElementById("content").value=response;
			show_message("<label2><font style='font-size:13px'>"+chrome.i18n.getMessage('msg_loadcomplete')+"</font></label2>");
		} else {
			show_message("<label2><font style='font-size:13px'>"+chrome.i18n.getMessage('conf_none')+"</font></label2>");
		}
	});
}*/
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////Interface with webpage
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function proc_spell_en_inf(){
}
function proc_spell_ko_inf(){
}
