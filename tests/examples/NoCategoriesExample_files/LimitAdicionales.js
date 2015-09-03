define(function(require) {
    
    function LimitAdicionales() {
	$('.item-group input:checkbox').live('click',function(e){
//	     e.preventDefault();
//	     e.stopPropagation();
//	    
//	    var _extras = $(this).parent().parent();
//	    var _options = _extras.children('label').children('input');
//	    var selected_max = _extras.attr('data-max');
//	    var selected_min = _extras.attr('data-min');
//	    var selected_multiple = _extras.attr('data-multiple');
//
//	    if(selected_multiple == '1'){
//		var _checked = 0;
//		$.each(_options,function(k,v){
//		    if($(v).is(':checked')){
//			console.log($(this));
//			_checked++;
//		    }
//		});
//
//		if(_checked<=selected_max){
//		    
//		    $(this).attr('checked', true);
//		     console.log(_checked +' '+ selected_max );
//	    	}
//	    }
	});
    }
	
    return LimitAdicionales
});


