function trim(str) {
	if (!str || !str.replace) str='';
  	return str.replace(/^\s*|\s*$/g,"");
}

function makequeryescape(str) {
	if (!str || !str.replace) str='';
  	str=str.replace(/&/gi, "%26");  	
  	return str;
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
  return str;
}

function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function toBool(str){
  return ("false" === str) ? false : true;
}

function sprintf ( ) {
    // Return a formatted string  
    // 
    // version: 1006.1915
    // discuss at: http://phpjs.org/functions/sprintf
    // +   original by: Ash Searle (http://hexmen.com/blog/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +    tweaked by: Jack
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Paulo Freitas
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: sprintf("%01.2f", 123.1);
    // *     returns 1: 123.10
    // *     example 2: sprintf("[%10s]", 'monkey');
    // *     returns 2: '[    monkey]'
    // *     example 3: sprintf("[%'#10s]", 'monkey');
    // *     returns 3: '[####monkey]'
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

function get_domainfromurl(url){
    var f="";
    try {
      if (url && url.trim()) {               
        var b = url.trim();
        var h = b.indexOf("//");
        if (h == -1) {
          h = 0
        } else {
          h += 2
        }
        if (h < b.length){
          var c = b.indexOf("/", h);
          if (c == -1) {
            c = b.length
          }
          f = b.substring(h, c);
          if (!f || f.indexOf(".") == -1) 
            f="";
        }
      }
    } catch (g) {}            
  return f;
}  

function get_shorturl(url){
		try {
			if (url && url.trim()) {           		
				var b = url.trim();
				var h = b.indexOf("//");
				if (h == -1) {
					h = 0
				} else {
					h += 2
				}
				if (h < b.length){
					var c = b.indexOf("?", h);
					if (c == -1) {
						c = b.lastIndexOf("/");
						if ((c == -1) || (c <= h)) {
							c = b.length
						}
					}
					var f = b.substring(h, c);
					if (!f || f.indexOf(".") == -1) 
						f="";
				}
			}
		} catch (g) {}            
	return f;
}	

function open_newtab(surl,last,nosel){
	var ulast=false;
	if (toBool(localStorage["other_newtablast"])){
		ulast=true;
		last=true;
	}
		
	chrome.windows.getLastFocused(function(win) {				
		if (last || ulast || nosel || (win && win.incognito)){		
		}else{
			window.open(surl);
			return;
		}	
		
		var sel=true;
		if (nosel) sel=false;	
		var param={url:surl, selected:sel};	
	
		function openit(){
			chrome.tabs.create(param, function(tab){
				if (tab) chrome.windows.update(tab.windowId, {focused:true});
			});		
		}
	
		if (!win) openit();
		if (win.type=="popup") last=true;
		chrome.tabs.getSelected(win.id, function(tab) {			
			if (tab){
				if (last){
					//chrome crash
					//param.openerTabId=tab.id; 
				}else{
					//param.openerTabId=tab.id;
					param.index=tab.index+1;
					//param.index=tab.index;
				}
			}
			openit();
		});
	});
}

function open_newtab_exist2(surl,last,id,openurl){
  /*search_opentab_reuse=toBool(localStorage["search_opentab_reuse"]);
  if (!search_opentab_reuse) {
    open_newtab(surl,last);
    return;	
  }*/
  if (toBool(localStorage["other_newtablast"])) last=true;	
  chrome.tabs.query({windowId:chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
  		var surl2=surl.toLowerCase();
  		var sdomain=get_shorturl(surl2);
		for (var i = 0, tab; tab = tabs[i]; i++) {
			if (!tab.url) continue;			
			var s=tab.url;
			s=s.toLowerCase();
			var sdomain2=get_shorturl(s);						
			if ( ((sdomain2=="") && (surl2!="") && (s.indexOf(surl2)==0)) || ((sdomain2!="") && (sdomain!="") && (sdomain2.indexOf(sdomain)==0)) ) {
				if (tab.id!=id) {
					if (openurl!=null){
						if (openurl) chrome.tabs.update(tab.id, {url: surl, active:true});
						else chrome.tabs.update(tab.id, {active:true});
					} else {
						chrome.tabs.update(tab.id, {url: surl, active:true});
					}
					return;
				}
			}
		}		
		open_newtab(surl,last);
  });	
}

function open_newtab_exist(surl,last,dup,openurl){
	if (toBool(localStorage["other_newtablast"])) last=true;	
	if (dup) {
		chrome.tabs.getSelected(null, function(tab) {
			open_newtab_exist2(surl,last,tab.id,openurl);			
		});
	} else {
		open_newtab_exist2(surl,last,-1,openurl);
	}
}

function getextensionUrl(relurl){
  if(typeof(chrome) == "undefined"){
    return "."+relurl;
  } else {
    return chrome.extension.getURL(relurl); 
  }
}

function open_newtab_extension(s){	
	s=getextensionUrl(s);
	open_newtab_exist(s,false,false);
}

function find_tab(surl,select,last){
  if (toBool(localStorage["other_newtablast"])) last=true;	
  chrome.tabs.query({windowId:chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
  		var surl2=surl.toLowerCase();
  		var sdomain=get_shorturl(surl2);
		for (var i = 0, tab; tab = tabs[i]; i++) {
			if (!tab.url) continue;			
			var s=tab.url;
			s=s.toLowerCase();
			var sdomain2=get_shorturl(s);
			if ( ((sdomain2=="") && (surl2==s)) || ((sdomain2!="") && (sdomain==sdomain2)) ) {
				chrome.tabs.update(tab.id, {active:select});
				return;
			}
		}		
		open_newtab(surl,last);
  });	
}

Date.prototype.setISO8601 = function (timestamp) {
 var match = timestamp.match(
  "^([-+]?)(\\d{4,})(?:-?(\\d{2})(?:-?(\\d{2})" +
  "(?:[Tt ](\\d{2})(?::?(\\d{2})(?::?(\\d{2})(?:\\.(\\d{1,3})(?:\\d+)?)?)?)?" +
  "(?:[Zz]|(?:([-+])(\\d{2})(?::?(\\d{2}))?)?)?)?)?)?$");
 if (match) {
  for (var ints = [2, 3, 4, 5, 6, 7, 8, 10, 11], i = ints.length - 1; i >= 0; --i)
   match[ints[i]] = (typeof match[ints[i]] != "undefined"
    && match[ints[i]].length > 0) ? parseInt(match[ints[i]], 10) : 0;
  if (match[1] == '-') // BC/AD
   match[2] *= -1;
  var ms = Date.UTC(
   match[2], // Y
   match[3] - 1, // M
   //match[3], // M
   match[4], // D
   match[5], // h
   match[6], // m
   match[7], // s
   match[8] // ms
  );
  if (typeof match[9] != "undefined" && match[9].length > 0) // offset
   ms += (match[9] == '+' ? -1 : 1) *
    (match[10]*3600*1000 + match[11]*60*1000); // oh om
  if (match[2] >= 0 && match[2] <= 99) // 1-99 AD
   ms -= 59958144000000;
  this.setTime(ms);
  return this;
 }
 else
  return null;
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

function get_chrome_major_version(){
	var s=navigator.userAgent;
	s=getValue(s,"Chrome/"," ");
	if (s==null) s="";
	s=s.split(".");	
	var v=0;	
	if (s.length > 0) {
		v=parseInt(s[0]);
	}
	if (isNaN(v)) v=0;		
	return v;
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
	messagetimer=setTimeout("hide_message()",2000);
}

function hide_message(){
	obj=document.getElementById("layer_message");
	obj.style.display="none";
}

function changebox(c){
	var f=c.previousSibling;
	if (f) {
		if (f.type=="checkbox") {
			f.checked = !f.checked;
			if (f.onchange) f.onchange();
			if (f.onclick) f.onclick();
		}
	}
}

function changeboxbyid(c){
	var f=document.getElementById(c);
	if (f){
		if (f.type=="checkbox") {
			f.checked = !f.checked;
			if (f.onchange) f.onchange();
			if (f.onclick) f.onclick();
		}
	}
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

function open_currenttab(surl,select,response) {
	chrome.windows.getLastFocused( function(win) {
		var windowId=win.id;							
		chrome.tabs.getSelected(windowId, function(tab) { 				
			chrome.tabs.update(tab.id, {'url': surl, active:select});
			if (response!=null) response();
		});		
	});		
}

function getparam(s,name){
	name=name+"=";
	name=name.toLowerCase();
	var p1=s.toLowerCase().indexOf(name);
	if (p1<0) return "";
	s=s.substr(p1+name.length);
	var p2=s.toLowerCase().indexOf("&");
	if (p2>=0) {
		return s.substr(0,p2);
	} else {
		return s;
	}
}	

function fillnumber(s){
	s=String(s);
	if ( s.length==1 ) { 
		return '0'+s;  
	}
	return s;
}	

function isurl_links(s) {
	//var regexp = /^(?:http:\/\/)?(?:[\w-]+\.)+[a-z]{2,6}/i;
	var regexp = /^(?:(ftp|http|https):\/\/)?(?:[\w-]+\.)+[a-z]{2,6}/i;	
	return regexp.test(s);
}

function r13( s ) {
function rot( t, u, v ) {
 return String.fromCharCode( ( ( t - u + v ) % ( v * 2 ) ) + u );
}
 var b = [], c, i = s.length,
  a = 'a'.charCodeAt(), z = a + 26,
  A = 'A'.charCodeAt(), Z = A + 26;
 while(i--) {
  c = s.charCodeAt( i );
  if( c>=a && c<z ) { b[i] = rot( c, a, 13 ); }
  else if( c>=A && c<Z ) { b[i] = rot( c, A, 13 ); }
  else { b[i] = s.charAt( i ); }
 }
 return b.join( '' );
}
/*
var Base64 = { 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = Base64._utf8_encode(input);
 
		while (i < input.length) {
 
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
		}
 
		return output;
	},
 
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output = output + String.fromCharCode(chr1);
 
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
 
		}
 
		output = Base64._utf8_decode(output);
 
		return output;
 
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
 
}
*/