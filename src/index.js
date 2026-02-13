// ==========================================
// DESAFIO FINAL 01
// Tema: Mini-sistema de Loja + Caixa + Estoque
// ==========================================

// Objetivo
// Você vai construir um sistema completo (em memória, sem banco de dados) que:
// - mantém um catálogo de produtos e um estoque
// - cria carrinhos de compra, valida quantidades e calcula totais
// - aplica regras de preço (promoções/cupões) com prioridades e restrições
// - calcula impostos (IVA) por categoria
// - finaliza pedidos e imprime um cupom fiscal detalhado
// - gera relatórios simples de vendas

// Regras gerais
// - Não use bibliotecas externas.
// - Use apenas JavaScript (Node.js).
// - Não apague as assinaturas (nomes/params) dos métodos marcados como TODO.
// - Use estruturas de dados adequadas (Map/Array/Object).
// - Todas as validações devem lançar Error com mensagens claras.

// Como usar
// - Complete os TODOs.
// - Ao final, descomente a chamada de runDemo() no fim do arquivo.
// - O demo executa cenários que devem passar.

// ==========================================
// PARTE 0 - Dados e utilitários
// ==========================================

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

// ==========================================
// PARTE 1 - Modelos principais (classes)
// ==========================================

// 1) Crie a classe Produto
// Requisitos mínimos:
// - sku (string) único
// - nome (string)
// - preco (number > 0)
// - fabricante (string)
// - categoria (deve estar em CATEGORIAS)
// - numeroMaximoParcelas (int 1..24)
// Métodos:
// - getValorDeParcela(numeroDeParcelas) => number
//   - deve validar: numeroDeParcelas int >=1 e <= numeroMaximoParcelas
//   - retorna preco / numeroDeParcelas (2 casas)

class Produto {
	constructor({ sku, nome, preco, fabricante, categoria, numeroMaximoParcelas }) {
        
		if (!sku || !nome) throw new Error("SKU e Nome são obrigatórios.");
		assertPositiveNumber(preco, "preco");
		assertNonNegativeInt(numeroMaximoParcelas, "numeroMaximoParcelas");
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
		assertNonNegativeInt(numeroDeParcelas, "numeroDeParcelas");
		for (let i = 1; i <= this.numeroMaximoParcelas; i++) {
			if (numeroDeParcelas === i) {
				return round2(this.preco / numeroDeParcelas);
			}
		}
		throw new Error(`Número de parcelas inválido. Deve ser entre 1 e ${this.numeroMaximoParcelas}.`);
	}
}

// 2) Crie a classe Cliente
// Requisitos:
// - id (string)
// - nome (string)
// - tipo: "REGULAR" | "VIP"
// - saldoPontos (int >= 0)
// Métodos:
// - adicionarPontos(pontos)
// - resgatarPontos(pontos) => diminui saldo, valida

/**
 * Representa um cliente do sistema.
 * O cliente pode ser do tipo "REGULAR" ou "VIP", e possui um saldo de pontos que pode ser acumulado ou resgatado.
 * O tipo "VIP" concede um desconto especial, mas pode ser bloqueado por cupom.
 * O saldo de pontos deve ser um inteiro não negativo, e as operações de adicionar ou resgatar pontos devem validar os valores e o saldo disponível.
 */
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


// 3) Crie a classe ItemCarrinho
// Requisitos:
// - sku (string)
// - quantidade (int >= 1)
// - precoUnitario (number > 0) *congelado no momento de adicionar*
// Observação: o carrinho usa precoUnitario do momento (para simular mudança de preço no catálogo).

/**
 * Representa um item adicionado ao carrinho de compras, com SKU, quantidade e preço unitário congelado.
 * O preço unitário é capturado no momento da adição ao carrinho para garantir consistência, mesmo que o preço do produto mude posteriormente no catálogo.
 */
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
     * @returns {number}
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

/**
 * Representa o estoque do sistema, gerenciando quantidades de produtos por SKU.
 * Permite definir quantidades, adicionar ou remover itens, consultar a quantidade disponível e garantir que haja estoque suficiente para uma determinada operação.
 * Todas as operações de modificação de estoque validam os valores e lançam erros em casos de quantidades negativas ou insuficientes.
 * O método garantirDisponibilidade é especialmente importante para validar se uma compra pode ser realizada com base no estoque atual.
 * O uso de Map permite uma consulta eficiente por SKU, e a estrutura é flexível para futuras extensões (ex: múltiplos depósitos).
 */
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

// 5) Crie a classe Catalogo
// Use Map para guardar { sku -> Produto }
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// Métodos:
// - adicionarProduto(produto)
// - getProduto(sku)
// - listarPorCategoria(categoria)
// - atualizarPreco(sku, novoPreco)

/**
 * Representa o catálogo de produtos disponível na loja, permitindo adicionar, consultar e listar produtos por categoria.
 * O catálogo é responsável por garantir que cada produto tenha um SKU único e que os produtos sejam instâncias válidas da classe Produto.
 * Ele também permite atualizar o preço de um produto, o que pode ser necessário para promoções ou ajustes de mercado.
 * O uso de Map para armazenar os produtos por SKU garante uma consulta eficiente e fácil manutenção do catálogo.
 * Todas as operações de modificação do catálogo validam os dados e lançam erros em casos de inconsistências (ex: SKU duplicado, produto não encontrado, categoria inválida).
 */
class Catalogo  {
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

// 6) Crie a classe CarrinhoDeCompras
// Responsabilidades:
// - adicionar itens (validando estoque)
// - remover itens
// - alterar quantidade
// - calcular subtotal
// - consolidar itens por sku (sem duplicatas)
// Sugestão: use Map sku -> ItemCarrinho
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

/**
	* Representa um carrinho de compras, permitindo adicionar, remover e alterar itens, bem como calcular o subtotal.
	* O carrinho valida a disponibilidade de estoque ao adicionar ou alterar itens, garantindo que as quantidades solicitadas estejam disponíveis.
	* Ele consolida os itens por SKU, evitando duplicatas e facilitando a gestão dos produtos no carrinho.
	*/
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
		this.estoque.garantirDisponibilidade(sku,quantidade);

		const precoUnitario = produto.preco;
		const itemExistente = this.itens.get(sku);
 
		if (itemExistente){
			const novaQuantidade = itemExistente.quantidade + quantidade;
			this. estoque.garantirDisponibilidade(sku,novaQuantidade);
			itemExistente.quantidade = novaQuantidade
		}else {
			const novoItem = new ItemCarrinho({sku, quantidade, precoUnitario});
			this.itens.set(sku, novoItem);
		}
	}

	/* Remove um item do carrinho. Lança um erro se o SKU não for encontrado no carrinho.
	 * @param {string} sku - O SKU do produto a ser removido.
	 * @throws {Error} Se o SKU não for encontrado no carrinho.
	 */
	removerItem(sku) {
	 	if(!this.itens.has(sku)){
			throw new Error(`Item com SKU ${sku} não encontrado no carrinho.`);
	 	}
		this.itens.delete(sku);
	}

	/* Altera a quantidade de um item no carrinho, validando a disponibilidade no estoque. Lança um erro se o SKU não for encontrado ou se a nova quantidade for inválida.
	 * @param {string} sku - O SKU do produto cuja quantidade deve ser alterada.
	 * @param {number} novaQuantidade - A nova quantidade do produto. Deve ser um inteiro >= 1.
	 * @throws {Error} Se o SKU não for encontrado no carrinho, se a nova quantidade for inválida ou se o estoque for insuficiente.
	 */
	alterarQuantidade(sku, novaQuantidade) {
		if(!this.itens.has(sku)){
			throw new Error(`Item com SKU ${sku} não encontrado no carrinho.`);
	 	}else{
			const item = this.itens.get(sku);
			this.estoque.garantirDisponibilidade(sku, novaQuantidade);
			item.quantidade = novaQuantidade;

		}
		
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
		for(const item of this.itens.values()){
			subtotal += item.getTotal();
		}
		return round2(subtotal)
	}
}

// ==========================================
// PARTE 2 - Regras de preço (promoções)
// ==========================================

// Você implementará um motor de preços com as regras abaixo.
// Você deve conseguir produzir um “breakdown” (quebra) do total:
// - subtotal
// - descontos (lista com nome + valor)
// - base de imposto
// - imposto total
// - frete
// - total final

// Estrutura sugerida do breakdown (objeto):
// {
//   subtotal,
//   descontos: [{ codigo, descricao, valor }],
//   totalDescontos,
//   impostoPorCategoria: { [categoria]: valor },
//   totalImpostos,
//   frete,
//   total
// }

// 7) Regras obrigatórias (todas devem existir e ser testáveis):
// R1 - Desconto VIP:
// - Se cliente.tipo === "VIP", aplica 5% no subtotal (apenas uma vez).
// - Não pode ser aplicado se existir cupom "SEM-VIP".
//
// R2 - Cupom:
// - Cupom "ETIC10" => 10% no subtotal
// - Cupom "FRETEGRATIS" => frete zerado
// - Cupom "SEM-VIP" => bloqueia R1
// - Cupom inválido deve lançar Error
//
// R3 - Leve 3 pague 2 (vestuário):
// - Para produtos da categoria "vestuário": a cada 3 unidades (somando SKUs diferentes),
//   a unidade mais barata dentre as 3 sai grátis.
// - Ex: 3 camisetas (10), 1 calça (50), 1 meia (5) => total unidades=5 => aplica 1 grátis
//   (a mais barata dentro do grupo de 3) e sobram 2 sem promo.
//
// R4 - Desconto por valor:
// - Se subtotal >= 500, aplica desconto fixo de 30.
//
// Observação de dificuldade:
// - Você precisa decidir ordem de aplicação e documentar.
// - Você precisa impedir descontos maiores que o subtotal.
// - Deve ser determinístico.

// 8) Crie uma classe MotorDePrecos
// Método principal:
// - calcular({ cliente, itens, cupomCodigo }) => breakdown
// Onde itens é o resultado de carrinho.listarItens()

/**você pode criar métodos auxiliares para cada regra, mas o método calcular deve orquestrar a aplicação das regras e retornar o breakdown completo.
O breakdown deve conter todas as informações necessárias para o cliente entender como o preço final foi calculado, incluindo o subtotal, os descontos aplicados (com códigos e descrições), a base de cálculo dos impostos por categoria, o valor total dos impostos, o valor do frete e o total final a pagar.
A implementação deve garantir que as regras sejam aplicadas na ordem correta e que os descontos não excedam o subtotal, resultando em um preço final justo e transparente para o cliente.*/
class MotorDePrecos {
	constructor({ catalogo }) {
        this.catalogo = catalogo;
        this.FRETE_PADRAO = 20.00;
	}


	calcular({ cliente, itens, cupomCodigo }) {
		if (itens.length === 0) throw new Error("Carrinho vazio.");

        let subtotal = 0;
        const listaDescontos = [];
        const itensExpandidos = []; // Para a regra Leve 3 Pague 2

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
            .sort((a, b) => a.preco - b.preco); // Do mais barato ao mais caro

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

// ==========================================
// PARTE 3 - Checkout / Pedido / Cupom
// ==========================================

// 9) Crie a classe Pedido
// Requisitos:
// - id (string)
// - clienteId
// - itens (array)
// - breakdown (objeto)
// - status: "ABERTO" | "PAGO" | "CANCELADO"
// - createdAt (Date)
// Métodos:
// - pagar()
// - cancelar()

class Pedido {
	constructor({ id, clienteId, itens, breakdown }) {
		// TODO
		throw new Error("TODO: implementar Pedido");
	}

	pagar() {
		// TODO
		throw new Error("TODO: implementar pagar");
	}

	cancelar() {
		// TODO
		throw new Error("TODO: implementar cancelar");
	}
}

// 10) Crie a classe CaixaRegistradora
// Responsabilidades:
// - receber (catalogo, estoque, motorDePrecos)
// - fecharCompra({ cliente, carrinho, cupomCodigo, numeroDeParcelas }) => Pedido
// Regras:
// - Ao fechar compra, deve remover do estoque as quantidades compradas
// - Se numeroDeParcelas for informado, deve validar com base no Produto (máximo permitido)
// - Deve somar parcelas por item e imprimir um resumo no cupom (opcional, mas recomendado)

class CaixaRegistradora {
	constructor({ catalogo, estoque, motorDePrecos }) {
		// TODO
		throw new Error("TODO: implementar CaixaRegistradora");
	}

	fecharCompra({ cliente, carrinho, cupomCodigo = null, numeroDeParcelas = 1 }) {
		// TODO
		throw new Error("TODO: implementar fecharCompra");
	}
}

// 11) Crie a classe CupomFiscal
// Deve gerar texto em linhas (array de strings) contendo:
// - cabeçalho
// - itens: sku, quantidade, preço unitário, total do item
// - subtotal, descontos (linha por desconto), impostos (por categoria), frete, total
// - status do pedido

class CupomFiscal {
	constructor({ pedido, catalogo }) {
		// TODO
		throw new Error("TODO: implementar CupomFiscal");
	}

	gerarLinhas() {
		// TODO
		throw new Error("TODO: implementar gerarLinhas");
	}
}

class Impressora {
	imprimirLinhas(linhas) {
		for (const linha of linhas) {
			console.log(linha);
		}
	}
}

// ==========================================
// PARTE 4 - Relatórios (estruturas de dados + loops)
// ==========================================

// 12) Crie a classe RelatorioVendas
// - Deve armazenar pedidos pagos
// - Deve gerar:
//   - totalArrecadado()
//   - totalImpostos()
//   - totalDescontos()
//   - rankingProdutosPorQuantidade(topN)
//   - arrecadadoPorCategoria()
// Sugestão: use Map para acumular por sku/categoria.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map

class RelatorioVendas {
	constructor() {
		// TODO
		throw new Error("TODO: implementar RelatorioVendas");
	}

	registrarPedido(pedido) {
		// TODO
		throw new Error("TODO: implementar registrarPedido");
	}

	totalArrecadado() {
		// TODO
		throw new Error("TODO: implementar totalArrecadado");
	}

	totalImpostos() {
		// TODO
		throw new Error("TODO: implementar totalImpostos");
	}

	totalDescontos() {
		// TODO
		throw new Error("TODO: implementar totalDescontos");
	}

	rankingProdutosPorQuantidade(topN = 5) {
		// TODO
		throw new Error("TODO: implementar rankingProdutosPorQuantidade");
	}

	arrecadadoPorCategoria() {
		// TODO
		throw new Error("TODO: implementar arrecadadoPorCategoria");
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

// ==========================================
// DEMO (cenários obrigatórios)
// ==========================================

// Critérios de aceite (quando você terminar):
// - Cenário A: cliente VIP, sem cupom, compra vestuário com regra leve-3-pague-2
// - Cenário B: cliente REGULAR com cupom ETIC10
// - Cenário C: cupom inválido deve gerar erro
// - Cenário D: tentar comprar acima do estoque deve gerar erro
// - Cenário E: relatório deve refletir pedidos pagos

function runDemo() {
	const { catalogo, estoque } = seedCatalogoEEstoque();
	const motor = new MotorDePrecos({ catalogo });
	const caixa = new CaixaRegistradora({ catalogo, estoque, motorDePrecos: motor });
	const relatorio = new RelatorioVendas();
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
			numeroDeParcelas: 10
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

// Quando terminar tudo, descomente:
//runDemo();