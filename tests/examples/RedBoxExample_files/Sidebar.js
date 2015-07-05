/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


define(function(require) {
   var Scroll = require('Utils/Scroll');
   var Storage = require('Utils/Storage');

   var Sidebar = function() {
      if(app.usuario_registrado == 0) return;
       var sidemenu = $('#sidebar_menu');

       function headerScroll(ev) {
      	 if(ev.top > 44) {
      	    $('.sidebar-header > .bar').css('height', 38);
      	    $('.sidebar-menu').css('top', 38);
      	    $('.hamburger-menu').css('top', 6);
      	    return false;
      	  }

      	  $('.sidebar-header > .bar').css('height', 82 - ev.top);
      	  $('.sidebar-menu').css('top', 82 - ev.top);
      	  if(ev.top > 18) return false;
      	  $('.hamburger-menu').css('top', 26 - ev.top);
       }

       function sidebarScroll(ev) {
    	   var footer_box = $('.footer').box();
      	 if(footer_box.top - $(window).innerHeight() <= 0) {
      	       sidemenu.css({top: footer_box.top - sidemenu.height() })
      	 }
      }

       Scroll.add(headerScroll);
       Scroll.add(sidebarScroll);

       var status = Storage.value('sidebar-open');
       if(typeof status == 'string' && status == 'yes') {

	   //sidemenu.css('left', 0)
	   Storage.value('sidebar-open', 'yes');
       }else{
	        sidemenu.addClass('open')
          $('body').addClass('visible-navbar')
       }

  	$('.hamburger-menu').on('click', function () {
	    sidemenu.addClass('transition');
	    
  	    if (!sidemenu.hasClass('open')) {
  		Storage.value('sidebar-open', 'no');
  		sidemenu.addClass('open')
      $('body').addClass('visible-navbar')
  	    } else {
  		Storage.value('sidebar-open', 'yes');
  		sidemenu.removeClass('open')
      $('body').removeClass('visible-navbar')
  	    }
	    setTimeout(function(){
		sidemenu.removeClass('transition');
	    },400);
  	});
   }

   return Sidebar;
});
