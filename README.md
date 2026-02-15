# J-final

Aplicação em JavaScript (Node.js) que simula um fluxo completo de vendas com catálogo, estoque, carrinho, motor de preços, cupom fiscal e relatório.

## Índice

- [Requisitos](#requisitos)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Execução Local](#execução-local)
- [Execução com Makefile](#execução-com-makefile)
- [Execução com Docker](#execução-com-docker)
- [Descrição do Script](#descrição-do-script)
- [Resumo do `index.js`](#resumo-do-indexjs)
- [Cenários Automáticos](#cenários-automáticos)
- [Solução de Problemas](#solução-de-problemas)

## Requisitos

- Node.js 18+ 
- npm 9+
- Docker 
- Make 

## Estrutura do Projeto

| Caminho | Descrição |
|---|---|
| `src/index.js` | Código principal e execução dos cenários de demonstração |
| `package.json` | Scripts do Node |
| `Makefile` | Atalhos para instalar e executar |
| `Dockerfile` | Ambiente Docker para rodar o projeto |

## Execução Local

1. Instalar dependências:

```bash
npm install
```

2. Executar o projeto:

```bash
npm start
```

Esse comando executa `node src/index.js` e imprime no terminal:
- cupons fiscais dos cenários válidos
- erros esperados (cupom inválido e estoque insuficiente)
- relatório final de vendas

## Execução com Makefile

Instalar dependências:

```bash
make install
```

Rodar o projeto (via Docker):

```bash
make run
```

Rodar comando npm específico no container:

```bash
make run COMMAND=start
```

Abrir shell no container:

```bash
make bash
```

## Execução com Docker

1. Build da imagem:

```bash
docker build -t g-javascript .
```

2. Rodar o projeto:

```bash
docker run -it -v "$(pwd)":/app g-javascript npm run start
```

3. Entrar no shell do container (opcional):

```bash
docker run -it -v "$(pwd)":/app g-javascript bash
```

## Descrição do Script

O projeto possui um script principal no `package.json`:

```json
"scripts": {
  "start": "node src/index.js"
}
```

### O que o `make run` faz

Quando você executa `make run`, o arquivo `src/index.js`:
- cria dados iniciais de catálogo e estoque
- executa cenários de compra com clientes diferentes
- aplica regras de desconto, imposto e frete
- gera cupom fiscal para pedidos pagos
- valida erros esperados (cupom inválido e estoque insuficiente)
- imprime um relatório final de vendas

### Instruções rápidas

1. Instale dependências:

```bash
make install
```

2. Execute:

```bash
make run
```

3. Verifique no terminal:
- blocos `=== CUPOM FISCAL ===`
- mensagens `(OK)` para erros esperados
- secção `Relatório` no final

### Resultado esperado (resumo)

- 2 pedidos válidos pagos
- 1 erro de cupom inválido
- 1 erro de estoque insuficiente
- 1 relatório consolidado com totais e ranking de produtos

## Resumo do `index.js`

O arquivo `src/index.js` implementa uma simulação completa de vendas em consola.

### Estrutura principal

- Utilitários e validações:
  - `round2`, `formatBRL`, `assertPositiveNumber`, `assertNonNegativeInt`, `assertCategoriaValida`

- Classes de domínio:
  - `Produto`: dados do produto e cálculo de valor por parcela
  - `Cliente`: tipo (`VIP`/`REGULAR`) e pontos
  - `ItemCarrinho`: item com preço unitário congelado no momento da adição

- Gestão de dados:
  - `Estoque`: controla quantidades por SKU com `Map`
  - `Catalogo`: armazena produtos e permite consulta/listagem/atualização
  - `CarrinhoDeCompras`: adiciona/remove/altera itens e calcula subtotal

- Regras de preço (`MotorDePrecos`):
  - aplica descontos e cupões (`VIP5`, `ETIC10`, `FRETEGRATIS`, `SEM-VIP`)
  - aplica regra `Leve 3 Pague 2` para vestuário
  - calcula breakdown final (subtotal, descontos, impostos, frete e total)

- Checkout e saída:
  - `CaixaRegistradora`: fecha compra, valida parcelas/estoque e cria pedido
  - `Pedido`: controla estado (`ABERTO`, `PAGO`, `CANCELADO`)
  - `CupomFiscal` + `Impressora`: geram e imprimem o cupom

- Relatórios:
  - `RelatorioVendas`: agrega pedidos pagos e calcula totais, ranking e arrecadação por categoria

### Fluxo executado no arranque

1. `seedCatalogoEEstoque()` cria catálogo e estoque iniciais.
2. `runDemo()` executa os cenários A-E.
3. O arquivo termina com `runDemo();`, por isso tudo corre ao executar `npm start`.

## Cenários Automáticos

Ao rodar `make run`, o sistema executa:

- Cenário A: cliente VIP sem cupom, com regra `Leve 3 Pague 2`
- Cenário B: cliente REGULAR com cupom `ETIC10`
- Cenário C: cupom inválido (erro esperado)
- Cenário D: compra acima do estoque (erro esperado)
- Cenário E: relatório consolidado dos pedidos pagos

## Solução de Problemas

- `npm: command not found`
  - instalar Node.js e npm

- `docker: command not found`
  - instalar Docker ou executar localmente com `npm start`

- Erro de permissão no Docker
  - usar um usuário com acesso ao daemon Docker

- `make up` falha
  - o alvo usa `docker compose up --build`, mas este repositório não contém `docker-compose.yml`


