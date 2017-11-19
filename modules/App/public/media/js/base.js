function toHttpString(obj) {
	var str = "";
	for ( var key in obj) {
		if (str != "") {
			str += "&";
		}
		str += key + "=" + encodeURIComponent(obj[key]);
	}
	return str;
}

var simulador = {
	taxas: [
		0.00526, // ate 250k
		0.007997046, // ate 1.5kk
		0.00873 // mais que 1.5kk
	],
	calcular: function(valor_total_imovel) {
		var total_meses = 360;
		var valor_financiamento = valor_total_imovel * .8;
		var capital = valor_financiamento / total_meses;
		var aliquota_seguro = 0.000178;
		var seguro = aliquota_seguro * valor_financiamento;
		var tarifa = 25;
		var prestacao = 0;
		var juros = 0;
		var result = {
			erro: false,
			mensagens: [],
			dados: {}
		};
		if (valor_total_imovel < 250000.01) {
			juros = valor_financiamento * this.taxas[0];
		} else if (valor_total_imovel < 1500000.01) {
			juros = valor_financiamento * this.taxas[1];
		} else {
			juros = valor_financiamento * this.taxas[2];
		}
		result.dados.prestacao = juros + capital + seguro + tarifa;
		result.dados.entrada = valor_total_imovel - valor_financiamento;
		result.dados.financiamento = valor_financiamento;
		result.dados.renda = result.dados.prestacao / .3;
		return result;
	}
}

Number.prototype.formatMoney = function(c, d, t) {
	var n = this,
		c = isNaN(c = Math.abs(c)) ? 2 : c,
		d = d == undefined ? "." : d,
		t = t == undefined ? "," : t,
		s = n < 0 ? "-" : "",
		i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
		j = (j = i.length) > 3 ? j % 3 : 0;
		return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};
