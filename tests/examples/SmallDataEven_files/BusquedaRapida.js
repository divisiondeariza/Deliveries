define(function(require) {
//	var Domicilio = require('PedirOnline/Domicilio')
//	var Format    = require('Utils/Format')
//	var FormSubmit = require('Utils/FormSubmit')
//	var Storage 	 = require('Utils/Storage')
//
//	var Storage   	 = require('Utils/Storage')
//	var BoundingBox  = require('Utils/BoundingBox')
//	var Scroll 		 = require('Utils/Scroll')
	
	function BusquedaRapida() {
	    
	    var busquedaElement = $('#buscar-producto-rapido');
	     
	   
	    busquedaElement.keyup(function(event){
		var busqueda = busquedaElement.value();
		var items = $('.product-item');
		$.each(items, function(k,v){
		    var _name = $(v).attr('data-nombre');
		    var _category = $(v).attr('data-category');
		    
		    var n = _name.indexOf(busqueda.toLowerCase());
		    if(n == -1){
			$(v).hide();
		    }else{
			$(v).show();
		    }
		    buscarOcultos(_category);
		});
		
		
	    });
	    $('#buscar-producto-rapido').blur(function(){
		$('html').click(function(){
		var menu_categories = $('.menu-categories').children('ul').children('li');
		
		$.each(menu_categories,function(k,v){
		    if(v == event.srcElement){
			$('.product-item').show();
			$('.categoria-menu-content').show();
			busquedaElement.value('');
			event.srcElement.click();
		    }
		});
		
	    });
	    });
	    
	    
	   
	    
	    
	    
	    
	}
	
	function buscarOcultos(category){
	    var element_category = $('#category-'+category);
	    var _hijos = element_category.children('ul').children('li');
	    var elementVisibles = 0;
	   
	    $.each(_hijos,function(k,v){
		if($(v).attr('style')!='display: none;'){
		    elementVisibles = elementVisibles + 1;
		}
	    });
	    if(elementVisibles > 0){
		element_category.show();
	    }else{
		element_category.hide();
	    }
	}
	
	
	

	return BusquedaRapida
})