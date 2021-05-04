(function(){
	
	$('form#settings').on('submit', function(){
		var input = $(this).serializeArray();
		for(var i=0; i<input.length; ++i){
			localStorage[input[i].name] = input[i].value;
		};
		$('#savemessage').show();
		window.setTimeout(function(){
			$('#savemessage').fadeOut('fast');
		}, 2500);
		return false;
	});
	
	for(var i in DebugSettings){
		$('form#settings').find(':input[name="'+i+'"]').val(DebugSettings[i]);
	};
	
})(jQuery);