// MUST all be empty - this is used to clear all related cookies
var ZendDebugDefault = {
	_bm: '',
	ZendDebuggerCookie: '',
	debug_line_bp: '',
	debug_file_bp: '',
	start_debug: '',
	start_profile: '',
	debug_port: '',
	debug_host: '',
	send_debug_header: '',
	debug_stop: '',
	debug_coverage: '',
	send_sess_end: '',
	debug_jit: '',
	debug_start_session: '',
	debug_new_session: '',
	original_url: '',
	use_ssl: '',
	debug_fastfile: '',
	debug_protocol: '',
	debug_session_id: '',
	no_remote: '',
	use_remote: ''
};

// Defaults - some are configured, some static
var ZendDebugCookie = $.extend({}, ZendDebugDefault, {
	ZendDebuggerCookie: 'php',
	debug_host: DebugSettings['debug_host'],
	debug_port: DebugSettings['debug_port'],
	debug_fastfile: DebugSettings['debug_fastfile'],
	
	// Defaults
	send_debug_header: '1',
	send_sess_end: '1',
	start_debug: '1',
	debug_jit: '1',
	debug_stop: '1',
	
	// Note: This is renewed each time the popup is opened
	debug_session_id: (Math.floor(Math.random() * 147483648) + 2000)
});

// Odd switch between two vars - ZendDebugger wants it this way
if(DebugSettings['debug_remote'] == '1'){
	ZendDebugCookie.use_remote = '1';
}else if(DebugSettings['debug_remote'] == '0'){
	ZendDebugCookie.no_remote = '1';
};

/**
 * Debugging interface
 **/
var ZendDebug = {

	state: 'stop',

	current: function(url, fn) {
		this.state = 'current';
		DebugCookie.update($.extend({}, ZendDebugCookie, {
			original_url: url.href,
			debug_new_session: '1'
		}), url);
		fn();
	},
	
	next: function(url, fn){
		this.state = 'next';
		DebugCookie.update($.extend({}, ZendDebugCookie, {
			original_url: url.href,
			debug_start_session: '1',
			send_debug_header: '1'
		}), url);
		fn();
	},
	
	post: function(url, fn){
		this.state = 'post';
		DebugCookie.update($.extend({}, ZendDebugCookie, {
			original_url: url.href,
			debug_start_session: 'POST'
		}), url);
		fn();
	},
	
	next: function(url, fn){
		this.state = 'next';
		DebugCookie.update($.extend({}, ZendDebugCookie, {
			original_url: url.href,
			debug_new_session: '1'
		}), url);
		fn();
	},
	
	start: function(url, fn){
		this.state = 'start';
		DebugCookie.update($.extend({}, ZendDebugCookie, {
			original_url: url.href,
			debug_start_session: '1'
		}), url);
		fn();
	},
	
	stop: function(url, fn){
		this.state = 'stop';
		DebugCookie.update(ZendDebugDefault, url);
		fn();
	}
	
};