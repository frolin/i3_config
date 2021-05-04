/**
 * @param string url
 * @return object
 */
var parseUrl = function(url){var a=document.createElement('a');a.href=url;a.protocol;a.hostname;a.port;a.pathname;a.search;a.hash;a.host;return a;};

/**
 * Default debug options
 * @param object
 **/
var DebugSettings = $.extend({
	debug_host: 'localhost',
	debug_port: '10137',
	debug_remote: '1',
	debug_use_fastfile: '1',
	disable_rightclick: '1',
	zend_debugger_check: '1'
}, localStorage);