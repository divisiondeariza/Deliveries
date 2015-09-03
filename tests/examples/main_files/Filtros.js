define(function(require) {

  var Filtros = function(elementos, resultados) {
    this.resultados = resultados;
    var self = this;
    // Implementa el filtro por tipo en las listas de expand..
	  elementos.click(function() {
			var filtro = this.id;
			// Busca y ordena los restaurantes por este filtro
			self.filtrarResultados(filtro);

			var el = $('.selected', this.parentNode);
			if(el.el === undefined) el = $('.selected', this.parentNode.parentNode);

			el.removeClass('selected');
			$(this).addClass('selected');

			setTimeout(function() {
				$(window).trigger('lazyload');
			}, 1000);
		});

  };

  Filtros.prototype = {
    resultados: null,
    filtrarResultados: function(filtro) {
      filtro = filtro.split('-');
      switch(filtro[0]) {
        case 'categoria':
          this.resultados.each(function() {
            var resultado = $(this);
            if(filtro[1] == 'todas') resultado.removeClass('hidden');
            else {
              var dataCategoria = resultado.attr('data-categorias') || '';
              var index = dataCategoria.split(',').indexOf(filtro[1]);
              if(index == -1) {
                resultado.addClass('hidden');
              } else {
                resultado.removeClass('hidden');
              }
            }
          });
        break;
        case 'precio':
          /*resultados.sort(function(a, b) {
            var aord = +a.getAttribute('data-precio');
              var bord = +b.getAttribute('data-precio');
              // two elements never have the same ID hence this is sufficient:
              return (aord > bord) ? 1 : -1;
          })*/
        break;
      }
    }
  }


  return Filtros;
})
