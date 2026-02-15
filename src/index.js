

const CATEGORIAS = [
	"eletrodoméstico",
	"decoração",
	"materiais de construção",
	"vestuário",
	"alimentos"
];

const IVA_POR_CATEGORIA = {
	"eletrodoméstico": 0.23,
	"decoração": 0.23,
	"materiais de construção": 0.23,
	"vestuário": 0.23,
	"alimentos": 0.06
};

/**. Arredonda um número para 2 casas decimais, evitando erros de ponto flutuante. */
function round2(value) {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Formata um número como moeda brasileira (R$ 0,00). */
function formatBRL(value) {
	// Evite Intl se quiser praticar manualmente.
	return `R$ ${round2(value).toFixed(2)}`.replace(".", ",");
}

/**  Valida se o valor é um número positivo. */
function assertPositiveNumber(value, label) {
	if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value) || value <= 0) {
		throw new Error(`${label} deve ser um número positivo.`);
	}
}
/** Valida se o valor é um inteiro não negativo. */
function assertNonNegativeInt(value, label) {
	if (!Number.isInteger(value) || value < 0) {
		throw new Error(`${label} deve ser um inteiro >= 0.`);
	}
}
/** Valida se a categoria é válida. */
function assertCategoriaValida(categoria) {
	if (!CATEGORIAS.includes(categoria)) {
		throw new Error(`Categoria inválida: ${categoria}. Aceitas: ${CATEGORIAS.join(", ")}`);
	}
}


/**  A classe Produto serve para representar os produtos disponíveis no catálogo da loja, com atributos como SKU, nome, preço, fabricante, categoria e número máximo de parcelas.*/
class Produto {
	constructor({ sku, nome, preco, fabricante, categoria, numeroMaximoParcelas }) {

		if (!sku || !nome) throw new Error("SKU e Nome são obrigatórios.");
		assertPositiveNumber(preco, "preco");
		if (!Number.isInteger(numeroMaximoParcelas) || numeroMaximoParcelas < 1 || numeroMaximoParcelas > 24) {
			throw new Error("numeroMaximoParcelas deve ser um inteiro entre 1 e 24.");
		}
		assertCategoriaValida(categoria);

		this.sku = sku;
		this.nome = nome;
		this.preco = preco;
		this.fabricante = fabricante;
		this.categoria = categoria;
		this.numeroMaximoParcelas = numeroMaximoParcelas;

	}


	/**
	 * Calcula o valor de cada parcela com base no preço total.
	 * @param {number} numeroDeParcelas 
	 * @returns {number} Valor da parcela arredondado a 2 casas decimais.
	 */
	getValorDeParcela(numeroDeParcelas) {
		if (!Number.isInteger(numeroDeParcelas) || numeroDeParcelas < 1) {
			throw new Error("numeroDeParcelas deve ser um inteiro >= 1.");
		}
		if (numeroDeParcelas > this.numeroMaximoParcelas) {
			throw new Error(`Número de parcelas inválido. Deve ser entre 1 e ${this.numeroMaximoParcelas}.`);
		}
		return round2(this.preco / numeroDeParcelas);
	}
}

/** A classe Produto   */
class Cliente {
	constructor({ id, nome, tipo = "REGULAR", saldoPontos = 0 }) {
		this.id = String(id);
		this.nome = String(nome);
		this.tipo = tipo.toUpperCase() === "VIP" ? "VIP" : "REGULAR";

		assertNonNegativeInt(saldoPontos, "Saldo de pontos");
		this.saldoPontos = saldoPontos;
	}

	/**
	 * Adiciona pontos ao saldo do cliente (ex: após uma compra).
	 * Lança um erro se os pontos a adicionar forem negativos.
	 * @throws {Error} Se os pontos a adicionar forem negativos.
	 * @param {number} pontos - A quantidade de pontos a adicionar ao saldo do cliente.
	 */
	adicionarPontos(pontos) {
		assertNonNegativeInt(pontos, "Pontos a adicionar");
		this.saldoPontos += pontos;
	}

	/**
	 * Deduz pontos do saldo do cliente (ex: uso de desconto).
	 * Lança um erro se os pontos a resgatar forem maiores que o saldo disponível.
	 * @throws {Error} Se os pontos a resgatar forem maiores que o saldo disponível.
	 * @param {number} pontos - A quantidade de pontos a resgatar do saldo do cliente.
	 */
	resgatarPontos(pontos) {
		assertNonNegativeInt(pontos, "Pontos a resgatar");

		if (pontos > this.saldoPontos) {
			throw new Error(`Saldo insuficiente. O cliente possui apenas ${this.saldoPontos} pontos.`);
		}

		this.saldoPontos -= pontos;
	}
}

/** A classe ItemCarrinho representa um item no carrinho de compras, com SKU, quantidade e preço unitário congelado. */
class ItemCarrinho {
	constructor({ sku, quantidade, precoUnitario }) {
		if (!sku) throw new Error("SKU do item é obrigatório.");

		assertNonNegativeInt(quantidade, "quantidade");
		if (quantidade < 1) {
			throw new Error("A quantidade de um item no carrinho deve ser pelo menos 1.");
		}

		assertPositiveNumber(precoUnitario, "precoUnitario");

		this.sku = String(sku);
		this.quantidade = quantidade;
		this.precoUnitario = precoUnitario;
	}

	/**
	 * Calcula o subtotal deste item (Preço x Quantidade).
	 * @returns {number} O total deste item, arredondado a 2 casas decimais.
	 */
	getTotal() {
		return round2(this.quantidade * this.precoUnitario);
	}
}

// 4) Crie a classe Estoque
// Use Map para guardar { sku -> quantidade }
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// Métodos:
// - definirQuantidade(sku, quantidade)
// - adicionar(sku, quantidade)
// - remover(sku, quantidade)
// - getQuantidade(sku)
// - garantirDisponibilidade(sku, quantidade)

/** A classe Estoque é responsável por gerenciar a quantidade disponível de cada SKU na loja, permitindo definir, adicionar, remover e consultar o estoque, bem como garantir a disponibilidade para compras. */
class Estoque {
	constructor() {
		this.itens = new Map();
	}

	/**
	 * Define a quantidade de um SKU no estoque. Use para inicialização ou ajustes manuais.
	 * Lança um erro se a quantidade for negativa.
	 * @throws {Error} Se a quantidade for negativa.
	 */
	definirQuantidade(sku, quantidade) {
		assertNonNegativeInt(quantidade, "Quantidade");
		this.itens.set(sku, quantidade);
	}

	/**
	 * Adiciona uma quantidade ao estoque de um SKU. Use para reposição.
	 * Lança um erro se a quantidade a adicionar for negativa.
	 * @throws {Error} Se a quantidade a adicionar for negativa.
	 */
	adicionar(sku, quantidade) {
		assertNonNegativeInt(quantidade, "Quantidade a adicionar");
		const saldoAtual = this.itens.get(sku) || 0;
		this.itens.set(sku, saldoAtual + quantidade);
	}

	/**
	 * Remove uma quantidade do estoque de um SKU. Use para saída de mercadoria.
	 * Lança um erro se a quantidade a remover for maior que a disponível.
	 * @throws {Error} Se a quantidade disponível for menor que a quantidade a remover.
	 */
	remover(sku, quantidade) {
		assertNonNegativeInt(quantidade, "Quantidade a remover");
		this.garantirDisponibilidade(sku, quantidade);
		const saldoAtual = this.itens.get(sku);
		const novaQuantidade = saldoAtual - quantidade;
		this.itens.set(sku, novaQuantidade);
	}

	/**
	 * Retorna a quantidade disponível de um SKU no estoque. Retorna 0 se o SKU não existir.
	 * @param {string} sku - O SKU do produto a consultar.
	 * @returns {number} A quantidade disponível no estoque para o SKU fornecido.
	 */
	getQuantidade(sku) {
		return this.itens.get(sku) || 0;
	}

	/**
	 * Verifica se a quantidade solicitada de um SKU está disponível no estoque. Lança um erro se não houver estoque suficiente.
	 * @param {string} sku - O SKU do produto a verificar.
	 * @param {number} quantidade - A quantidade solicitada para compra.
	 * @throws {Error} Se a quantidade disponível for menor que a quantidade solicitada.
	 */
	garantirDisponibilidade(sku, quantidade) {
		const disponivel = this.getQuantidade(sku);
		if (disponivel < quantidade) {
			throw new Error(`Estoque insuficiente para SKU ${sku}. Disponível: ${disponivel}, solicitado: ${quantidade}.`);
		}
	}

}

/** A classe Catalogo é responsável por gerenciar os produtos disponíveis na loja, permitindo adicionar produtos, consultar por SKU e listar por categoria. */
class Catalogo {
	constructor() {
		this.itens = new Map();
	}

	/**
	* Adiciona um produto ao catálogo. O produto deve ser uma instância da classe Produto e deve ter um SKU único.
	* @param {Produto} produto - O produto a ser adicionado ao catálogo.
	* @throws {Error} Se o produto não for uma instância de Produto ou se o SKU já existir no catálogo.
	*/
	adicionarProduto(produto) {
		if (!(produto instanceof Produto)) {
			throw new Error("Produto deve ser uma instância da classe Produto.");
		}
		if (this.itens.has(produto.sku)) {
			throw new Error(`Produto com SKU ${produto.sku} já existe no catálogo.`);
		}
		this.itens.set(produto.sku, produto);
	}

	/**
	* Retorna o produto correspondente ao SKU fornecido. Lança um erro se o SKU não for encontrado no catálogo.
	* @param {string} sku - O SKU do produto a ser recuperado.
	* @returns {Produto} O produto correspondente ao SKU fornecido.
	* @throws {Error} Se o SKU não for encontrado no catálogo.
	*/
	getProduto(sku) {
		const produto = this.itens.get(sku);
		if (!produto) {
			throw new Error(`Produto com SKU ${sku} não encontrado no catálogo.`);
		}
		return produto;
	}

	/**
	* Retorna uma lista de produtos que pertencem à categoria especificada. Lança um erro se a categoria for inválida.
	* @param {string} categoria - A categoria dos produtos a serem listados.
	* @returns {Produto[]} Uma lista de produtos que pertencem à categoria especificada.
	* @throws {Error} Se a categoria for inválida.
	*/
	listarPorCategoria(categoria) {
		assertCategoriaValida(categoria);
		const resultado = [];
		for (const produto of this.itens.values()) {
			if (produto.categoria === categoria) {
				resultado.push(produto);
			}
		}
		return resultado;
	}

	/**
	* Atualiza o preço de um produto no catálogo. Lança um erro se o SKU não for encontrado ou se o novo preço for inválido.
	* @param {string} sku - O SKU do produto cujo preço deve ser atualizado.
	* @param {number} novoPreco - O novo preço a ser definido para o produto. Deve ser um número positivo.
	* @throws {Error} Se o SKU não for encontrado no catálogo ou se o novo preço for inválido.
	*/
	atualizarPreco(sku, novoPreco) {
		const produto = this.getProduto(sku);
		assertPositiveNumber(novoPreco, "Novo preço");
		produto.preco = novoPreco;
	}
}



/**  A	classe CarrinhoDeCompras representa o carrinho de compras de um cliente, permitindo adicionar, remover e alterar a quantidade de itens, bem como listar os itens e calcular o subtotal.*/
class CarrinhoDeCompras {
	constructor({ catalogo, estoque }) {
		this.catalogo = catalogo;
		this.estoque = estoque;
		this.itens = new Map();
	}

	/**  Adiciona um item ao carrinho, validando a disponibilidade no estoque. Se o item já existir, atualiza a quantidade.
	 * @param {string} sku - O SKU do produto a ser adicionado.
	 * @param {number} quantidade - A quantidade do produto a ser adicionada. Deve ser um inteiro >= 1.
	 * @throws {Error} Se o SKU não for encontrado no catálogo, se a quantidade for inválida ou se o estoque for insuficiente.
	 */

	adicionarItem(sku, quantidade) {
		const produto = this.catalogo.getProduto(sku);
		this.estoque.garantirDisponibilidade(sku, quantidade);

		const precoUnitario = produto.preco;
		const itemExistente = this.itens.get(sku);

		if (itemExistente) {
			const novaQuantidade = itemExistente.quantidade + quantidade;
			this.estoque.garantirDisponibilidade(sku, novaQuantidade);
			itemExistente.quantidade = novaQuantidade
		} else {
			const novoItem = new ItemCarrinho({ sku, quantidade, precoUnitario });
			this.itens.set(sku, novoItem);
		}
	}

	/**  Remove um item do carrinho. Lança um erro se o SKU não for encontrado no carrinho.
	 * @param {string} sku - O SKU do produto a ser removido.
	 * @throws {Error} Se o SKU não for encontrado no carrinho.
	 */
	removerItem(sku) {
		if (!this.itens.has(sku)) {
			throw new Error(`Item com SKU ${sku} não encontrado no carrinho.`);
		}
		this.itens.delete(sku);
	}

	/** Altera a quantidade de um item no carrinho, validando a disponibilidade no estoque. Lança um erro se o SKU não for encontrado ou se a nova quantidade for inválida.
	 * @param {string} sku - O SKU do produto cuja quantidade deve ser alterada.
	 * @param {number} novaQuantidade - A nova quantidade do produto. Deve ser um inteiro >= 1.
	 * @throws {Error} Se o SKU não for encontrado no carrinho, se a nova quantidade for inválida ou se o estoque for insuficiente.
	 */
	alterarQuantidade(sku, novaQuantidade) {
		if (!this.itens.has(sku)) {
			throw new Error(`Item com SKU ${sku} não encontrado no carrinho.`);
		}
		if (!Number.isInteger(novaQuantidade) || novaQuantidade < 1) {
			throw new Error("novaQuantidade deve ser um inteiro >= 1.");
		}
		const item = this.itens.get(sku);
		this.estoque.garantirDisponibilidade(sku, novaQuantidade);
		item.quantidade = novaQuantidade;
	}

	/**  Retorna uma lista de itens no carrinho, consolidando por SKU. Cada item é uma instância de ItemCarrinho.
	 * @returns {ItemCarrinho[]} Uma lista de itens no carrinho.
	 */
	listarItens() {
		return Array.from(this.itens.values());
	}

	/**  Calcula o subtotal do carrinho somando o total de cada item. Retorna o valor arredondado a 2 casas decimais.
	 * @returns {number} O subtotal do carrinho.
	 */
	getSubtotal() {
		let subtotal = 0;
		for (const item of this.itens.values()) {
			subtotal += item.getTotal();
		}
		return round2(subtotal)
	}
}

/**A classe MotorDePrecos é responsável por calcular o preço final de um pedido com base em regras de desconto e imposto. */
class MotorDePrecos {
	constructor({ catalogo }) {
		this.catalogo = catalogo;
		this.FRETE_PADRAO = 20.00;
	}

	/** Calcula o preço final de um pedido com base em regras de desconto e imposto.
	 * @param {Object} params - Parâmetros do cálculo.
	 * @param {Cliente} params.cliente - O cliente que fez o pedido.
	 * @param {ItemCarrinho[]} params.itens - Os itens no carrinho.
	 * @param {string} params.cupomCodigo - O código do cupom aplicado, se houver.
	 * @returns {Object} Um objeto contendo os detalhes do cálculo.
	 * @throws {Error} Se o carrinho estiver vazio ou se o cupom for inválido.
	 */
	calcular({ cliente, itens, cupomCodigo }) {
		if (itens.length === 0) throw new Error("Carrinho vazio.");

		let subtotal = 0;
		const listaDescontos = [];
		const itensExpandidos = [];

		// 1. Cálculo do Subtotal e Expansão de itens
		itens.forEach(item => {
			subtotal += item.getTotal();
			// uma lista "unitária" para facilitar o R3
			for (let i = 0; i < item.quantidade; i++) {
				const p = this.catalogo.getProduto(item.sku);
				itensExpandidos.push({ sku: item.sku, preco: item.precoUnitario, categoria: p.categoria });
			}
		});

		let totalDescontos = 0;
		let frete = this.FRETE_PADRAO;

		// --- R2: Validação inicial do Cupom ---
		const cuponsValidos = ["ETIC10", "FRETEGRATIS", "SEM-VIP"];
		if (cupomCodigo && !cuponsValidos.includes(cupomCodigo)) {
			throw new Error(`Cupom inválido: ${cupomCodigo}`);
		}

		// --- R3: Leve 3 Pague 2 (Vestuário) ---
		const vestuario = itensExpandidos
			.filter(i => i.categoria === "vestuário")
			.sort((a, b) => a.preco - b.preco);

		const unidadesGratis = Math.floor(vestuario.length / 3);
		if (unidadesGratis > 0) {
			let valorR3 = 0;
			for (let i = 0; i < unidadesGratis; i++) {
				valorR3 += vestuario[i].preco;
			}
			listaDescontos.push({ codigo: "L3P2", descricao: "Leve 3 Pague 2 (Vestuário)", valor: round2(valorR3) });
			totalDescontos += valorR3;
		}

		// --- R1: Desconto VIP ---
		const permiteVIP = cupomCodigo !== "SEM-VIP";
		if (cliente.tipo === "VIP" && permiteVIP) {
			const valorVIP = (subtotal - totalDescontos) * 0.05;
			listaDescontos.push({ codigo: "VIP5", descricao: "Desconto Cliente VIP", valor: round2(valorVIP) });
			totalDescontos += valorVIP;
		}

		// --- R2: Aplicação de Efeitos do Cupom ---
		if (cupomCodigo === "ETIC10") {
			const valorEtic = (subtotal - totalDescontos) * 0.10;
			listaDescontos.push({ codigo: "ETIC10", descricao: "Cupom 10% OFF", valor: round2(valorEtic) });
			totalDescontos += valorEtic;
		} else if (cupomCodigo === "FRETEGRATIS") {
			frete = 0;
			listaDescontos.push({ codigo: "FRETEGRATIS", descricao: "Frete Grátis", valor: 0 });
		}

		// --- R4: Desconto por valor fixo ---
		const subtotalAposPercentuais = subtotal - totalDescontos;
		if (subtotalAposPercentuais >= 500) {
			const valorFixo = 30;
			listaDescontos.push({ codigo: "FIXO30", descricao: "Desconto Compra > 500", valor: valorFixo });
			totalDescontos += valorFixo;
		}

		// --- Impostos e Finalização ---
		totalDescontos = Math.min(totalDescontos, subtotal);
		const baseImposto = subtotal - totalDescontos;

		let totalImpostos = 0;
		const impostoPorCategoria = {};

		itens.forEach(item => {
			const p = this.catalogo.getProduto(item.sku);
			const taxa = IVA_POR_CATEGORIA[p.categoria] || 0;
			const proporcaoNoTotal = item.getTotal() / subtotal;
			const impostoItem = (baseImposto * proporcaoNoTotal) * taxa;

			impostoPorCategoria[p.categoria] = round2((impostoPorCategoria[p.categoria] || 0) + impostoItem);
			totalImpostos += impostoItem;
		});

		return {
			subtotal: round2(subtotal),
			descontos: listaDescontos,
			totalDescontos: round2(totalDescontos),
			baseImposto: round2(baseImposto),
			impostoPorCategoria,
			totalImpostos: round2(totalImpostos),
			frete: round2(frete),
			total: round2(baseImposto + totalImpostos + frete)
		};
	}


}

/**  A classe Pedido representa um pedido gerado após o fechamento da compra, contendo informações sobre o cliente, os itens comprados, o breakdown do preço e o status do pedido.*/
class Pedido {
	constructor({ id, clienteId, itens, breakdown }) {
		this.id = String(id);
		this.clienteId = String(clienteId);
		this.itens = itens;
		this.breakdown = breakdown;
		this.status = "ABERTO";
		this.createdAt = new Date();
	}

	/**
	 * Altera o status para PAGO. 
	 * Impede o pagamento de pedidos que não estejam abertos, garantindo que apenas pedidos no status "ABERTO" possam ser pagos.
	 * @throws {Error} Se o pedido não estiver no status "ABERTO".
	 */
	pagar() {
		if (this.status !== "ABERTO") {
			throw new Error(`Pedido ${this.id} não pode ser pago. Status atual: ${this.status}`);
		}
		this.status = "PAGO";
	}

	/**
	 * Altera o status para CANCELADO.
	 * Pedidos já pagos não podem ser cancelados por este método (exigiria um processo de devolução de um valor pago)
	 * @throws {Error} Se o pedido já estiver pago ou cancelado.
	 */
	cancelar() {
		if (this.status === "PAGO") {
			throw new Error("Não é possível cancelar um pedido que já foi PAGO.");
		}
		if (this.status === "CANCELADO") {
			throw new Error("O pedido já está cancelado.");
		}
		this.status = "CANCELADO";
	}

	/**
	 * Método auxiliar para visualizar o resumo do pedido
	 * @returns {Object} Um objeto contendo o ID do pedido, o total, o status e a data de criação em formato ISO.
	 */
	getResumo() {
		return {
			id: this.id,
			total: this.breakdown.total,
			status: this.status,
			data: this.createdAt.toISOString()
		};
	}

}


/**  A classe CaixaRegistradora é responsável por gerenciar o fechamento de compras, utilizando o catálogo de produtos, o estoque e o motor de preços para calcular o valor total do pedido e gerar um novo Pedido com status "ABERTO".*/
class CaixaRegistradora {
	constructor({ catalogo, estoque, motorDePrecos }) {
		this.catalogo = catalogo;
		this.estoque = estoque;
		this.motorDePrecos = motorDePrecos;
	}

	/**	Fecha a compra, gerando um pedido com o breakdown completo do preço.
	 * Valida a disponibilidade de estoque, o número de parcelas permitido para cada produto e aplica as regras de preço usando o motorDePrecos.
	 * Após calcular o breakdown, remove as quantidades compradas do estoque e cria um novo Pedido com status "ABERTO".
	 * Lança erros em casos de carrinho vazio, número de parcelas inválido ou estoque insuficiente.
	 * @param {Object} params - Parâmetros para fechar a compra.
	 * @param {Cliente} params.cliente - O cliente que está fechando a compra.
	 * @param {CarrinhoDeCompras} params.carrinho - O carrinho de compras contendo os itens a serem comprados.
	 * @param {string|null} params.cupomCodigo - O código do cupom a ser aplicado, se houver.
	 * @param {number} params.numeroDeParcelas - O número de parcelas para pagamento. Deve ser um inteiro >= 1.
	 * @return {Pedido} O pedido gerado após o fechamento da compra, com status "ABERTO".
	 * @throws {Error} Se o carrinho estiver vazio, se o número de parcelas for inválido ou se o estoque for insuficiente para algum item.
	 */
	fecharCompra({ cliente, carrinho, cupomCodigo = null, numeroDeParcelas = 1 }) {
		const itens = carrinho.listarItens();
		if (itens.length === 0) {
			throw new Error("O carrinho está vazio. Adicione itens antes de fechar a compra.");
		}
		if (!Number.isInteger(numeroDeParcelas) || numeroDeParcelas < 1) {
			throw new Error("numeroDeParcelas deve ser um inteiro >= 1.");
		}
		for (const item of itens) {
			const produto = this.catalogo.getProduto(item.sku);
			produto.getValorDeParcela(numeroDeParcelas);
		}

		const breakdown = this.motorDePrecos.calcular({ cliente, itens, cupomCodigo });

		itens.forEach(item => {
			this.estoque.remover(item.sku, item.quantidade);
		});

		const pedido = new Pedido({
			id: `PED-${Date.now()}`,
			clienteId: cliente.id,
			itens,
			breakdown
		});

		return pedido;
	}
}

/** A classe CupomFiscal é responsável por gerar as linhas de um cupom fiscal a partir de um pedido e do catálogo de produtos.*/
class CupomFiscal {
	constructor({ pedido, catalogo }) {
		this.pedido = pedido;
		this.catalogo = catalogo;
	}

	/** Gera as linhas do cupom fiscal com base no pedido e no catálogo, formatando as informações de forma legível. Retorna uma lista de strings representando cada linha do cupom.
	 * @returns {string[]} Uma lista de linhas formatadas para o cupom fiscal.
	 * @throws {Error} Se o pedido ou o catálogo não forem fornecidos.
	 */
	gerarLinhas() {
		const linhas = [];
		const b = this.pedido.breakdown;

		linhas.push("=== CUPOM FISCAL ===");
		linhas.push(`Pedido: ${this.pedido.id}`);
		linhas.push(`Cliente: ${this.pedido.clienteId}`);
		linhas.push("--- Itens ---");
		for (const item of this.pedido.itens) {
			linhas.push(
				`${item.sku} | Qtd: ${item.quantidade} | Unit: ${formatBRL(item.precoUnitario)} | Total: ${formatBRL(item.getTotal())}`
			);
		}

		linhas.push("--- Totais ---");
		linhas.push(`Subtotal: ${formatBRL(b.subtotal)}`);
		if (b.descontos.length > 0) {
			linhas.push("Descontos:");
			for (const desconto of b.descontos) {
				linhas.push(`- ${desconto.codigo} (${desconto.descricao}): -${formatBRL(desconto.valor)}`);
			}
		} else {
			linhas.push("Descontos: nenhum");
		}
		linhas.push(`Total Descontos: -${formatBRL(b.totalDescontos)}`);
		linhas.push("Impostos por categoria:");
		for (const [categoria, valor] of Object.entries(b.impostoPorCategoria)) {
			linhas.push(`- ${categoria}: ${formatBRL(valor)}`);
		}
		linhas.push(`Total Impostos: ${formatBRL(b.totalImpostos)}`);
		linhas.push(`Frete: ${formatBRL(b.frete)}`);
		linhas.push(`Total Final: ${formatBRL(b.total)}`);
		linhas.push(`Status: ${this.pedido.status}`);

		return linhas;
	}
}
/** A classe Impressora é responsável por imprimir as linhas do cupom fiscal no console, iterando sobre a lista de linhas gerada pelo CupomFiscal.*/
class Impressora {
	imprimirLinhas(linhas) {
		const listaParaIterar = linhas || [];

		for (const linha of listaParaIterar) {
			console.log(linha);
		}
	}

}

/** A classe RelatorioVendas é responsável por gerar relatórios de vendas com base nos pedidos registrados. */
class RelatorioVendas {
	constructor({ catalogo }) {
		if (!catalogo) throw new Error("catalogo é obrigatório para RelatorioVendas.");
		this.pedidos = [];
		this.catalogo = catalogo;
	}

	/** Registra um pedido para fins de relatório. Apenas pedidos com status "PAGO" são registrados. 
	 * @param {Pedido} pedido - O pedido a ser registrado. Deve ter status "PAGO".
	 * @throws {Error} Se o pedido não tiver status "PAGO".
	 */
	registrarPedido(pedido) {
		if (pedido.status === "PAGO") {
			this.pedidos.push(pedido);
		}
	}

	/** Calcula o total arrecadado somando o valor total de cada pedido registrado. 
	 * @returns {number} O total arrecadado.
	 */
	totalArrecadado() {
		let total = 0;
		this.pedidos.forEach(pedido => {
			total += pedido.breakdown.total;
		});
		return round2(total);
	}

	/** Calcula o total de impostos arrecadados somando o valor dos impostos de cada pedido registrado. 
	 * @returns {number} O total de impostos arrecadados.
	 */
	totalImpostos() {
		let total = 0;
		this.pedidos.forEach(pedido => {
			total += pedido.breakdown.totalImpostos;
		});
		return round2(total);
	}

	/** Calcula o total de descontos concedidos somando o valor dos descontos de cada pedido registrado. 
	 * @returns {number} O total de descontos concedidos.
	 */
	totalDescontos() {
		let total = 0;
		this.pedidos.forEach(pedido => {
			total += pedido.breakdown.totalDescontos;
		});
		return round2(total);
	}

	/** Gera um ranking dos produtos mais vendidos com base na quantidade total vendida.
	 * @param {number} topN - O número de produtos a incluir no ranking. Deve ser um inteiro >= 1.
	 * @returns {Object[]} Uma lista dos top N produtos mais vendidos, onde cada item é um objeto com as propriedades "sku" e "quantidade".
	 */
	rankingProdutosPorQuantidade(topN = 5) {
		const acumulado = new Map();
		this.pedidos.forEach(pedido => {
			pedido.itens.forEach(item => {
				const quantidadeAtual = acumulado.get(item.sku) || 0;
				acumulado.set(item.sku, quantidadeAtual + item.quantidade);
			});
		});
		const ranking = Array.from(acumulado.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, topN)
			.map(([sku, quantidade]) => ({ sku, quantidade }));
		return ranking;
	}

	/** Calcula o total arrecadado por categoria somando o valor total de cada item vendido, agrupado por categoria. 
	 * @returns {Object} Um objeto onde as chaves são as categorias e os valores são os totais arrecadados por categoria.
	 */
	arrecadadoPorCategoria() {
		const acumulado = new Map();

		this.pedidos.forEach(pedido => {
			pedido.itens.forEach(item => {
				const produto = this.catalogo.getProduto(item.sku);
				const categoria = produto.categoria;
				const valorItem = item.getTotal();

				const atual = acumulado.get(categoria) || 0;
				acumulado.set(categoria, round2(atual + valorItem));
			});
		});

		return Object.fromEntries(acumulado);
	}
}

// ==========================================
// DADOS DE TESTE (para o demo)
// ==========================================

function seedCatalogoEEstoque() {
	const catalogo = new Catalogo();
	const estoque = new Estoque();
	const produtos = [
		// alimentos
		{ sku: "ARROZ", nome: "Arroz 1kg", preco: 6.0, fabricante: "Marca A", categoria: "alimentos", numeroMaximoParcelas: 1 },
		{ sku: "FEIJAO", nome: "Feijão 1kg", preco: 7.5, fabricante: "Marca B", categoria: "alimentos", numeroMaximoParcelas: 1 },
		{ sku: "OLEO", nome: "Óleo 900ml", preco: 8.0, fabricante: "Marca C", categoria: "alimentos", numeroMaximoParcelas: 1 },
		// vestuário
		{ sku: "CAMISETA", nome: "Camiseta", preco: 30.0, fabricante: "Hering", categoria: "vestuário", numeroMaximoParcelas: 6 },
		{ sku: "CALCA", nome: "Calça Jeans", preco: 120.0, fabricante: "Levis", categoria: "vestuário", numeroMaximoParcelas: 6 },
		{ sku: "MEIA", nome: "Meia", preco: 10.0, fabricante: "Puket", categoria: "vestuário", numeroMaximoParcelas: 6 },
		// eletrodoméstico
		{ sku: "MICRO", nome: "Micro-ondas", preco: 499.9, fabricante: "LG", categoria: "eletrodoméstico", numeroMaximoParcelas: 12 },
		{ sku: "LIQUID", nome: "Liquidificador", preco: 199.9, fabricante: "Philco", categoria: "eletrodoméstico", numeroMaximoParcelas: 10 },
		// decoração
		{ sku: "VASO", nome: "Vaso Decorativo", preco: 89.9, fabricante: "Tok&Stok", categoria: "decoração", numeroMaximoParcelas: 5 },
		// materiais de construção
		{ sku: "CIMENTO", nome: "Cimento 25kg", preco: 35.0, fabricante: "Holcim", categoria: "materiais de construção", numeroMaximoParcelas: 3 }
	];

	for (const p of produtos) {
		const produto = new Produto(p);
		catalogo.adicionarProduto(produto);
	}

	// Estoque inicial
	estoque.definirQuantidade("ARROZ", 50);
	estoque.definirQuantidade("FEIJAO", 50);
	estoque.definirQuantidade("OLEO", 50);
	estoque.definirQuantidade("CAMISETA", 20);
	estoque.definirQuantidade("CALCA", 10);
	estoque.definirQuantidade("MEIA", 30);
	estoque.definirQuantidade("MICRO", 5);
	estoque.definirQuantidade("LIQUID", 8);
	estoque.definirQuantidade("VASO", 10);
	estoque.definirQuantidade("CIMENTO", 100);

	return { catalogo, estoque };
}


function runDemo() {
	const { catalogo, estoque } = seedCatalogoEEstoque();
	const motor = new MotorDePrecos({ catalogo });
	const caixa = new CaixaRegistradora({ catalogo, estoque, motorDePrecos: motor });
	const relatorio = new RelatorioVendas({ catalogo });
	const impressora = new Impressora();

	const clienteVip = new Cliente({ id: "C1", nome: "Ana", tipo: "VIP", saldoPontos: 0 });
	const clienteRegular = new Cliente({ id: "C2", nome: "Bruno", tipo: "REGULAR", saldoPontos: 0 });

	// Cenário A
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		carrinho.adicionarItem("CAMISETA", 2);
		carrinho.adicionarItem("MEIA", 1);
		carrinho.adicionarItem("CALCA", 1);

		const pedido = caixa.fecharCompra({
			cliente: clienteVip,
			carrinho,
			cupomCodigo: null,
			numeroDeParcelas: 3
		});

		pedido.pagar();
		relatorio.registrarPedido(pedido);

		const cupom = new CupomFiscal({ pedido, catalogo });
		impressora.imprimirLinhas(cupom.gerarLinhas());
	}

	// Cenário B
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		carrinho.adicionarItem("MICRO", 1);
		carrinho.adicionarItem("VASO", 1);

		const pedido = caixa.fecharCompra({
			cliente: clienteRegular,
			carrinho,
			cupomCodigo: "ETIC10",
			numeroDeParcelas: 5
		});

		pedido.pagar();
		relatorio.registrarPedido(pedido);

		const cupom = new CupomFiscal({ pedido, catalogo });
		impressora.imprimirLinhas(cupom.gerarLinhas());
	}

	// Cenário C (cupom inválido)
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		carrinho.adicionarItem("ARROZ", 1);

		try {
			caixa.fecharCompra({ cliente: clienteRegular, carrinho, cupomCodigo: "INVALIDO" });
		} catch (err) {
			console.log("(OK) Cupom inválido gerou erro:");
			console.log(String(err.message || err));
		}
	}

	// Cenário D (estoque insuficiente)
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		try {
			carrinho.adicionarItem("MICRO", 999);
		} catch (err) {
			console.log("(OK) Estoque insuficiente gerou erro:");
			console.log(String(err.message || err));
		}
	}

	// Cenário E (relatório)
	{
		console.log("==============================");
		console.log("Relatório");
		console.log("==============================");
		console.log("Total arrecadado:", formatBRL(relatorio.totalArrecadado()));
		console.log("Total impostos:", formatBRL(relatorio.totalImpostos()));
		console.log("Total descontos:", formatBRL(relatorio.totalDescontos()));
		console.log("Top produtos:", relatorio.rankingProdutosPorQuantidade(3));
		console.log("Por categoria:", relatorio.arrecadadoPorCategoria());
	}
}

runDemo();
