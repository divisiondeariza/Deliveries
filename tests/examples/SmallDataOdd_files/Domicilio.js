define(function(require) {
	isArray = require('Utils/isArray')

	function Domicilio() {
		this.calcular = function(costo_pedido, funcion_domicilio) {
			return parseFloat(calcular(costo_pedido, funcion_domicilio))
		}
	}

	var domicilio = 0, limite = -1

	function calcular(pedido, str) {
		var partes = str.split('|'), domicilio = 0;
			partes.splice(0, 1)
                        
		for(var i in partes) {
                        if(typeof partes[i] === 'function') continue;
                        var regla = partes[i];
			regla = regla.replace(/P/g, pedido);
			regla = regla.replace(/ /g, '');
                       
			regla = regla.split(':');
			
			if(regla[0] == 'L') {
				limite = regla[1];
			} else {
				var validar = [], resultado = [];
				
				var match_if = regla[0].match(/\+|\*|\-|\/|<=|>=|=|>|<|o|y/g);
				var data_if  = regla[0].split(/\+|\*|\-|\/|<=|>=|=|>|<|o|y/g);
				
				var match_do = regla[1].match(/\+|\*|\-|\/|<=|>=|=|>|<|o|y/g);
				var data_do  = regla[1].split(/\+|\*|\-|\/|<=|>=|=|>|<|o|y/g);

				if(match_if) {
					//$.each(match_if, function(i, match) {
					for(var i in match_if) {
						match = match_if[i]
						var pos = i * 2, if_or = 0;
						if(match == 'o') if_or = 1;
						if(match == 'o' || match == 'y') match = match_if[i + 1];
						
						if(pos in data_if && (pos+1) in data_if) {
							validar.push([data_if[pos], match, data_if[pos+1], if_or]);
						}
					}//);			
				} else validar = [[data_if[0]]];

				if(match_do) {
					//$.each(match_do, function(i, match) {
					for(var i in match_do) {
						match = match_do[i]
						var pos = i * 2;
						if(pos in data_do) {
							if((pos+1) in data_do) resultado.push([data_do[pos], match, data_do[pos+1]]);
							else resultado.push([data_do[pos], match, false]);
						}
					}//);			
				} else resultado = [[data_do[0]]];

				if(calcularDomicilio(validar, false)) {
					var resultado_domicilio = calcularDomicilio(validar, resultado);
					if(resultado_domicilio) domicilio = resultado_domicilio;
				}
			}
		}
		
		if(limite != -1 && domicilio > limite) domicilio = limite;
		return parseFloat(domicilio);
	}
	
	function calcularDomicilio(validar, resultado) {
		if(typeof validar[1] != 'undefined') {
			if( validar[1][3] && validar.length == 1) { // Valida si existe un solo parámetro
				if(valida(validar[0], false)) {
					return (resultado) ? valida(resultado, true) : true;
				} if(valida(validar[1], false)) {
					return (resultado) ? valida(resultado, true) : true;
				}
			} else {
				if(valida(validar[0], false) && valida(validar[1], false)) {
					return (resultado) ? valida(resultado, true) : true;
				}
			}
		} else {
			if(valida(validar[0], false)) {
				return (resultado) ? valida(resultado, true) : true;
			}
		} return false;	
	}
	
	function valida(data, tipo) {
		if(tipo && ((isArray(data[0]) && data[0].length == 3) && (isArray(data[1]) && data[1].length))) {
			domicilio = valida(data[0]);
			return valida(data[1]);
		}

		if(isArray(data[0]) && data[0].length == 3) data = data[0];
		if(data.length == 1 || data.length == 2) return data[0];
		
		if(!data[2]) data[2] = domicilio;
		
		data[0] = parseFloat(data[0]);
		data[2] = parseFloat(data[2]);

		if(data[1] == '=')  return (data[0] == data[2]);
		if(data[1] == '>')  return (data[0] > data[2]);
		if(data[1] == '<')  return (data[0] < data[2]);
		if(data[1] == '>=') return (data[0] >= data[2]);
		if(data[1] == '<=') return (data[0] <= data[2]);
		if(data[1] == '+')  return (data[0] + data[2]);
		if(data[1] == '-')  return (data[0] - data[2]);
		if(data[1] == '*')  return (data[0] * data[2]);
		if(data[1] == '/')  return (data[0] / data[2]);
		
		return false;
	}

	return new Domicilio()
})