$.fn.checkbox = function(options){
	return this.each(function(){
		var ui = $(this);
		if(options === undefined) options = false;
		if(options === 'toggle') options = (!ui.is('.checkboxon'));
		if(options === true) ui.removeClass('checkboxoff').addClass('checkboxon').find('span').text(ui.data('ontext'));
		if(options === false) ui.removeClass('checkboxon').addClass('checkboxoff').find('span').text(ui.data('offtext'));
	});
};
	
(function($){

	var disableControls = function(on){
		if(on) $('.control').attr('disabled', 'disabled'); else $('.control').removeAttr('disabled');
	};
	
	var initControls = function(){
		$('#debugall,#debugnext,#debugpost').checkbox(false);
		disableControls(false);
		if(ZendDebug.state == 'start'){
			$('#debugall').checkbox(true);
			return;
		};
		if(ZendDebug.state == 'next'){
			$('#debugnext').checkbox(true);
			return;
		};
		if(ZendDebug.state == 'post'){
			$('#debugpost').checkbox(true);
			return;
		};
	};
	
	/**
	 * @param object tab
	 * @param object url
	 **/
	var initUI = function(tab, url){
	
		// Events for when a user clicks one of the controls
		$('.control').on('click', function(){
			var ui = $(this), 
			action = ui.data('action'),
			check = ui.find('.checkbox').checkbox('toggle'),
			controlState = check.hasClass('checkboxon');
			
			// Debugging current page always refreshes
			if(action == 'current'){
				ZendDebug.current(url, function(){
					initControls();
					chrome.tabs.reload(tab.id);
					window.close();
				});
				return;
			};
			
			// If the checkbox is valid and off, stop debug
			if(check.get(0) != null && !controlState){
				ZendDebug.stop(url);
				initControls();
				return;
			};
			
			// Run what ever action we have.
			ZendDebug[action](url, function(){
				initControls();
			});
		});
		$('.checkbox').checkbox();
		initControls(url);
	};
	
	// Open settings tab
	$('#settingsicon').on('click', function(){
		chrome.tabs.create({url: 'options.html'});
		return false;
	});
	
	// Disable default context menu
	if(DebugSettings['disable_rightclick'] == '1'){
		$(window).on('contextmenu', function(event) {
			event.preventDefault();
			event.stopPropagation();
			return false;
		});
	};
	
	// Reset and Disable the tools until we know we have a valid tab
	disableControls(true);
	
	// Check if the current tab has a ZDE cookie
	chrome.windows.getCurrent(function(w) {
		chrome.tabs.getSelected(w.id, function(tab){
			var url = parseUrl(tab.url);
			if(DebugSettings['zend_debugger_check'] == '1'){
				DebugCookie.get(url, ['ZDEDebuggerPresent', 'debug_start_session', 'debug_new_session', 'start_debug'], function (cookies){
					// Find the Zend Debug cookie
					if(typeof cookies['ZDEDebuggerPresent'] == 'undefined'){
						return console.error('ZDE debugger not present');
					};
					// Set the state of the debug using cookies during load up
					if(typeof cookies['debug_start_session'] == 'object'){
						if(cookies.debug_start_session.value === '1'){
							ZendDebug.state = 'start';
						};
						if(cookies.debug_start_session.value === 'POST'){
							ZendDebug.state = 'post';
						};
					}else if(typeof cookies['debug_new_session'] == 'object' && typeof cookies['start_debug'] == 'object'){
						if(cookies.debug_new_session.value == '1' && cookies.start_debug.value == '1'){
							ZendDebug.state = 'next';
						};
					};
					initUI(tab, url);
					return true;
				});
			}else{
				initUI(tab, url);
				return true;
			};
		});
	});	
	
		
})(jQuery);