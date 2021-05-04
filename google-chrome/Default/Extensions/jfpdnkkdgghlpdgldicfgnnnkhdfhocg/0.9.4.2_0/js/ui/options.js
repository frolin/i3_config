document.title='Spell Checker for Chrome '+chrome.i18n.getMessage('msg_option');
var bgmodule=chrome.extension.getBackgroundPage();
location.href=bgmodule.g_optionsurl;