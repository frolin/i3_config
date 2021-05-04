/*!
   This file is part of ColorZilla
  
   Written by Alex Sirota (alex @ iosart.com)
  
   Copyright (c) iosart labs llc 2011, All Rights Reserved
   
   Please do not use without permission
*/
function translateUI(){var a=ColorZilla.ChromeUtils.i18nReplace;a("head title","colorzilla_options"),a("div.heading h1","colorzilla_options"),a("#eyedropper-options th","eyedropper"),a("label.cz-autostart","auto_start_eyedropper_when_button_clicked"),a("#cz-outline-label","outline_hovered_elements"),a("#cz-cursor-crosshair-label","change_cursor_to_crosshair"),a("#autocopy-options th","auto_copy"),a("#cz-autocopy-label","auto_copy_picked_to_clipboard"),a("#cz-autocopy-format-label","auto_copy_format"),a("#color-format-options th","color_format"),a("#cz-hex-lowercase-label","show_hex_codes_lowercase"),a("#keyboard-shortcut-options th","keyboard_shortcuts"),a("#cz-keyboard-shortcuts-enabled-label","enable_keyboard_shortcuts"),a("#cz-keyboard-shortcuts-char-label","keyboard_shortcut_label"),a("#save-button","save_button_label")}function get(a){return document.getElementById(a)}function readOption(a,b){return a in localStorage?localStorage[a]:b}function loadOptions(){function a(){var a=get("cz-autocopy").checked;get("cz-autocopy-format").disabled=!a,get("cz-autocopy-show-message").disabled=!a,a?$("#cz-autocopy-format-label").removeClass("disabled"):$("#cz-autocopy-format-label").addClass("disabled")}function b(){var a=get("cz-hex-lowercase").checked;$('#cz-autocopy-format option[value="hex"]').text(a?"#rrggbb":"#RRGGBB"),$('#cz-autocopy-format option[value="hex-no-hash"]').text(a?"rrggbb":"RRGGBB")}function c(){var a=get("cz-keyboard-shortcuts-enabled").checked;get("cz-keyboard-shortcuts-char").disabled=!a,a?$("#cz-keyboard-shortcuts-char-label, #cz-keyboard-shortcut-modifier-label").removeClass("disabled"):$("#cz-keyboard-shortcuts-char-label, #cz-keyboard-shortcut-modifier-label").addClass("disabled")}get("cz-autostart").checked="true"==readOption("option-autostart-eyedropper","true"),ColorZilla.ChromeUtils.platformSupportsNonForegroundHover()||$(".cz-autostart").hide(),get("cz-outline").checked="true"==readOption("option-outline-hovered","true"),get("cz-cursor-crosshair").checked="true"==readOption("option-cursor-crosshair","true"),get("cz-autocopy").checked="true"==readOption("option-autocopy-to-clipboard","true"),get("cz-autocopy-show-message").checked="true"==readOption("option-autocopy-show-message","true"),get("cz-autocopy-format").value=readOption("option-autocopy-color-format","hex"),a(),get("cz-autocopy").onchange=a,get("cz-hex-lowercase").checked="true"==readOption("option-lowercase-hexa","false"),get("cz-hex-lowercase").onchange=b,b(),get("cz-keyboard-shortcuts-enabled").checked="true"==readOption("option-keyboard-shortcuts-enabled","false");var d="mac"==ColorZilla.ChromeUtils.getPlatform();get("cz-keyboard-shortcut-modifier-label").innerHTML=d?"Cmd+Opt+":"Ctrl+Alt+";for(var e=$("#cz-keyboard-shortcuts-char"),f=65,g=90,h=f;g>=h;h++){var i=String.fromCharCode(h);$('<option value="'+i+'">'+i+"</option>").appendTo(e)}e.val(readOption("option-keyboard-shortcuts-char","Z")),c(),get("cz-keyboard-shortcuts-enabled").onchange=c}function saveOptions(){localStorage["option-autostart-eyedropper"]=get("cz-autostart").checked?"true":"false",localStorage["option-outline-hovered"]=get("cz-outline").checked?"true":"false",localStorage["option-cursor-crosshair"]=get("cz-cursor-crosshair").checked?"true":"false",localStorage["option-autocopy-to-clipboard"]=get("cz-autocopy").checked?"true":"false",localStorage["option-autocopy-show-message"]=get("cz-autocopy-show-message").checked?"true":"false",localStorage["option-autocopy-color-format"]=get("cz-autocopy-format").value,localStorage["option-lowercase-hexa"]=get("cz-hex-lowercase").checked?"true":"false",localStorage["option-keyboard-shortcuts-enabled"]=get("cz-keyboard-shortcuts-enabled").checked?"true":"false",localStorage["option-keyboard-shortcuts-char"]=get("cz-keyboard-shortcuts-char").value;var a=document.getElementById("status");a.innerHTML=chrome.i18n.getMessage("options_saved"),setTimeout(function(){a.innerHTML=""},2e3),chrome.extension.sendRequest({"op":"options-changed"})}translateUI(),loadOptions(),document.getElementById("save-button").addEventListener("click",function(){saveOptions()},!1);