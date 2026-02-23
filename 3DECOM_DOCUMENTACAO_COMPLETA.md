# 3DEcom — Documentação Completa do Sistema
> Versão: v3 (fevereiro 2026)  
> Arquivo principal: `precificadora.html` (single-file, ~112KB, HTML+CSS+JS puro, sem dependências externas)

---

## 1. VISÃO GERAL

Calculadora de precificação para vendedores de produtos em marketplaces brasileiros. Suporta dois tipos de produto (impressão 3D e produto normal de fornecedor) e três canais de venda (Mercado Livre, Shopee, Venda Direta). A calculadora é um único arquivo HTML standalone — não precisa de backend para funcionar. Ela é servida como arquivo estático (`public/precificadora.html`) dentro de uma aplicação Next.js e exibida via `<iframe>` no dashboard após autenticação.

---

## 2. STACK TÉCNICA

### Calculadora (frontend puro)
- HTML5 + CSS3 + JavaScript vanilla (sem frameworks, sem npm)
- Fontes: Google Fonts — `Syne` (headings/UI), `DM Mono` (números/badges)
- Layout: CSS Grid e Flexbox
- Persistência: `localStorage` (histórico e preferências)
- Sem dependências externas (zero imports)

### Aplicação Web (Next.js)
- Next.js 14.2.5 (App Router)
- NextAuth v4 (autenticação email+senha)
- Supabase (banco de dados PostgreSQL)
- bcryptjs (hash de senhas)
- Vercel (deploy)
- Lastlink (pagamento/assinatura)

---

## 3. DESIGN SYSTEM

### Paleta de Cores (CSS Variables)
```css
--bg: #080810          /* fundo principal */
--surface: #0f0f1a     /* superfície de inputs */
--card: #13131f        /* background dos cards */
--card2: #1a1a2a       /* card alternativo */
--border: #252538      /* borda padrão */
--border2: #303050     /* borda mais visível */
--accent: #00e5a0      /* verde principal (ações, lucro) */
--accent-dim: rgba(0,229,160,0.08)
--accent-glow: rgba(0,229,160,0.15)
--meli: #ffe600        /* amarelo Mercado Livre */
--meli-dim: rgba(255,230,0,0.08)
--shopee: #ff5126      /* laranja Shopee */
--shopee-dim: rgba(255,81,38,0.08)
--text: #ededf8        /* texto principal */
--text2: #a0a0c0       /* texto secundário */
--muted: #555578       /* texto apagado */
--success: #00e5a0
--warn: #ffb020        /* amarelo aviso */
--danger: #ff3f5e      /* vermelho perigo */
--promo: #c084fc       /* roxo promoção */
```

### Classes CSS Principais
- `.card` — container branco-escuro com borda e border-radius 20px
- `.ch` — cabeçalho do card (flex row com ícone + título)
- `.cn` — número/ícone do card (badge circular)
- `.chtag` — etiqueta pequena ao lado do título
- `.f` — field group (label + input)
- `.fg.c2` — grid de 2 colunas para campos
- `.iw` — input wrapper com prefixo/sufixo (R$, %, kWh)
- `.pfx` / `.sfx` — prefixo e sufixo do input
- `.iw.sr` — input com sufixo à direita
- `.ob` — option button (botão de seleção estilo card)
- `.ob.am` — ativo cor Mercado Livre (amarelo)
- `.ob.as` — ativo cor Shopee (laranja)
- `.ob.ag` — ativo cor accent (verde)
- `.ob.ac` — ativo genérico
- `.og.c2` — option group 2 colunas
- `.cbtn` — botão primário verde (call to action)
- `.tab` — botão de aba principal
- `.tab.active` — aba ativa
- `.hint` — texto de dica pequeno abaixo do campo
- `.layout` — grid de 2 colunas (esquerda inputs, direita resultados)
- `.mpt` — marketplace tab (card clicável de seleção)
- `.mp-grid` — grid dos cards de marketplace
- `.mpico`, `.mpl`, `.mprad` — ícone, label, radio do marketplace
- `.casc-row` — linha da cascata de breakdown de custos
- `.rmbadge` — badge colorido de resultado (meli/shopee)
- `.mbigv` — valor grande hero (lucro)
- `.msmv` — valor pequeno (margem)
- `.profit` / `.loss` / `.neutral` / `.warnc` — cores de resultado
- `.sbar` — barra de composição de custos
- `.pref-saved` — indicador "✓ Salvo!" nas preferências

---

## 4. ESTRUTURA DE ABAS (NAVEGAÇÃO PRINCIPAL)

Três abas no topo, controladas pela função `showTab(tab)`:

| Aba | ID panel | Conteúdo |
|-----|----------|----------|
| ⚡ Precificar | `calc-panel` | Calculadora principal |
| 📋 Histórico | `hist-panel` | Lista de precificações salvas |
| ⚙️ Preferências | `pref-panel` | Configurações padrão |

**Lógica de showTab:**
```javascript
function showTab(tab){
  if(tab==='hist') renderHistorico();
  ['calc','demanda','hist','pref'].forEach(t=>{
    const btn=el('tab-'+t); if(btn) btn.classList.toggle('active',tab===t);
    const panel=el(t+'-panel'); if(panel) panel.style.display=tab===t?'block':'none';
  });
}
```
O `demanda-panel` é especial: fica dentro do `calc-panel` quando marketplace = Venda Direta.

---

## 5. TIPO DE PRODUTO

Seletor no topo da calculadora (antes do marketplace):

| Tipo | ID button | Comportamento |
|------|-----------|---------------|
| 🖨️ Produto 3D | `btn-tipo-3d` | Mostra cards Impressora + Filamento. Oculta card Fornecedor |
| 📦 Produto Normal | `btn-tipo-normal` | Oculta Impressora + Filamento. Mostra card Fornecedor com 2 modos |

**Variável de estado:** `let tipoProduto = '3d'`

**Função:**
```javascript
function selectTipo(tipo){
  tipoProduto = tipo;
  el('btn-tipo-3d').className   = 'ob' + (tipo==='3d'     ? ' ag' : '');
  el('btn-tipo-normal').className = 'ob' + (tipo==='normal' ? ' ag' : '');
  el('card-impressora').style.display = tipo==='3d' ? 'block' : 'none';
  el('card-filamento').style.display  = tipo==='3d' ? 'block' : 'none';
  el('card-fornecedor').style.display = tipo==='normal' ? 'block' : 'none';
  if(tipo==='normal' && modoNormal==='pv') calcNormal();
  else calc();
}
```

### 5.1 Produto Normal — Modo PV (Calcular Preço de Venda)
**Variável:** `let modoNormal = 'pv'`

Usuário informa:
- Custo do fornecedor (R$) → ID `custo-fornecedor`
- Margem desejada (%) → ID `normal-margem-pct` (default 30%)

Sistema calcula o preço de venda por iteração (20–25 ciclos) que satisfaz a margem desejada já considerando todas as taxas do marketplace selecionado.

**Saída:** exibe em `normal-preco-calculado` e popula automaticamente o campo `preco`.

### 5.2 Produto Normal — Modo CF (Calcular Custo Máximo do Fornecedor)
Usuário informa:
- Preço de venda alvo (R$) → ID `normal-pv-alvo`
- Margem desejada (%) → ID `normal-margem-cf` (default 30%)

**Fórmula direta:**
```
custo_max_fornecedor = preco_venda − taxa_marketplace − frete − imposto − extras − lucro_desejado
onde lucro_desejado = preco_venda × (margem/100)
```

Exibe resultado em `cf-resultado` com breakdown linha a linha mostrando cada dedução.

---

## 6. MARKETPLACES

### 6.1 Estado Global
```javascript
let MP = null              // 'meli' | 'shopee' | 'direto'
let mlAnuncio = 'classico' // 'classico' | 'premium'
let mlParcel = false       // antecipação ML Premium
let shopeeConta = 'cpf'    // 'cpf' | 'cnpj'
let shopeeAlto = false     // CPF com +450 pedidos/90 dias → +R$3
let shopeeCamp = false     // Campanha Shopee → +2,5% comissão
let cuponTipo = 'pct'      // 'pct' | 'real'
let cuponValor = 0
let cuponOn = false
```

### 6.2 Mercado Livre 2026

**Tipos de anúncio:**
- Clássico: aplica porcentagem `c` da categoria
- Premium: aplica porcentagem `p` da categoria (maior)
- Premium parcelado: adiciona +2,99% sobre o preço (antecipação de recebíveis)

**Taxa fixa:** R$ 0,49 por unidade se produto < R$ 12,50

**Fórmula:**
```javascript
function calcML(preco){
  const{c,p} = mlPcts();
  const pp = mlAnuncio==='premium' ? p : c;
  const fixo = mlFixo(preco); // 0.49 se preco < 12.5
  let total = preco*pp + fixo;
  if(mlAnuncio==='premium' && mlParcel) total += preco*0.0299;
  return {total, com:preco*pp, fixo, pp, anticip:...};
}
```

**Categorias disponíveis (Clássico% / Premium%):**
| Categoria | Clássico | Premium |
|-----------|----------|---------|
| Casa, Móveis e Decoração | 12,5% | 17,5% |
| Utilidades Domésticas | 12,5% | 17,5% |
| Acessórios para Veículos | 11,5% | 16,5% |
| Ferramentas e Construção | 12% | 17% |
| Games | 11% | 16% |
| Festas e Lembrancinhas | 12% | 17% |
| Brinquedos e Hobbies | 12,5% | 17,5% |
| Eletrônicos | 11,5% | 16,5% |
| Categoria personalizada | input livre | input livre |

**Frete ML 2026 — Tabela oficial (válida a partir de 02/03/2026):**

29 faixas de peso (0,3kg até >150kg) × 8 colunas de preço de venda:

| Coluna | Faixa de Preço |
|--------|---------------|
| 0 | R$ 0 – R$ 18,99 |
| 1 | R$ 19 – R$ 48,99 |
| 2 | R$ 49 – R$ 78,99 |
| 3 | R$ 79 – R$ 99,99 |
| 4 | R$ 100 – R$ 119,99 |
| 5 | R$ 120 – R$ 149,99 |
| 6 | R$ 150 – R$ 199,99 |
| 7 | R$ 200+ |

Exemplos da tabela `ML_FRETE_TAB[pesoMax, col0..col7]`:
```
[0.3,  5.65,  6.55,  7.75, 12.35, 14.35, 16.45, 18.45, 20.95]
[0.5,  5.95,  6.65,  7.85, 13.25, 15.45, 17.65, 19.85, 22.55]
[1.0,  6.05,  6.75,  7.95, 13.85, 16.15, 18.45, 20.75, 23.65]
... 29 linhas total, última com pesoMax=-1 (acima de 150kg)
[−1,   8.75, 12.95, 14.35,166.15,192.45,217.55,242.55,261.95]
```

**Frete rápido (ML_FRETE_RAPIDO):** tabela separada com 29 faixas, apenas 1 coluna de valor (equivalente à coluna 3 da tabela principal). Usado quando produto < R$79 e toggle "Frete rápido" está ativado.

**Regras especiais de frete:**
- Produto < R$19: usa coluna 0, mas limitado a 50% do preço do produto
- Produto R$19–78,99: usa coluna 1 (padrão) ou ML_FRETE_RAPIDO (opcional)
- Produto ≥ R$79: usa coluna baseada na faixa, frete rápido automático
- Toggle Correios: sobrescreve o frete com valor manual inserido
- Toggle Frete Manual: sobrescreve com valor digitado pelo usuário

**Opções de frete (toggles):**
- `t-ml-rapido` → toggle frete rápido (R$19–78,99)
- `t-ml-frete-manual` → toggle frete manual (campo `ml-frete-manual`)
- `t-ml-correios` → toggle correios (campo `ml-frete-correios`)
- Campo de peso em gramas: `ml-peso` (necessário para cálculo automático)

### 6.3 Shopee 2026

**Tabela de faixas (const SH):**
| Faixa | Comissão % | Taxa Fixa |
|-------|-----------|-----------|
| Até R$79,99 | 20% | R$ 4,00 |
| R$80 – R$99,99 | 14% | R$ 16,00 |
| R$100 – R$199,99 | 14% | R$ 20,00 |
| R$200 – R$499,99 | 14% | R$ 26,00 |
| Acima de R$500 | 14% | R$ 26,00 |

**Teto de comissão:** R$ 100,00 (comissão % nunca ultrapassa)

**Regras especiais:**
- Produto < R$8: taxa fixa = metade do preço do produto (em vez do valor tabelado)
- CPF com +450 pedidos nos últimos 90 dias: `fixo += R$3,00`
- Campanha Shopee ativa: `pp += 2,5%` na comissão percentual
- CNPJ: sem adicional de R$3 (mesmo com alto volume)
- Frete: **embutido na taxa da plataforma** (não calculado separadamente)

**Fórmula:**
```javascript
function calcShopee(p){
  const f = shFaixa(p); // encontra a faixa pelo preço
  let pp = f.pct + (shopeeCamp ? 0.025 : 0);
  let com = Math.min(p*pp, SHOP_TETO); // teto R$100
  let fixo = f.fixo;
  if(shopeeConta==='cpf' && shopeeAlto) fixo += 3;
  if(p < 8) fixo = p/2;
  return {total: Math.max(0, com+fixo), com, fixo, faixa:f, pp, adicCPF:...};
}
```

**Cupom próprio Shopee (opcional):**
- Toggle `t-cupon` ativa o painel de cupom
- Tipo percentual: `cupon-pct` (%) aplicado sobre o preço
- Tipo valor fixo: `cupon-real` (R$) deduzido
- O cupom é subtraído do lucro (custo para o vendedor)

### 6.4 Venda Direta (Sob Demanda)

Ativado ao selecionar marketplace "Venda Direta". O `demanda-panel` é inserido inline dentro da aba Precificar (não em aba separada).

**Taxas de maquininha (SD_TAXAS):**
| Tipo | Taxa Base |
|------|-----------|
| Débito à vista | 1,99% |
| Crédito à vista | 2,99% |
| Crédito 2x | 4,49% |
| Crédito 3x | 5,49% |
| Crédito 4x | 6,49% |
| Crédito 6x | 7,99% |
| Crédito 12x | 11,99% |
| Taxa personalizada | digitada pelo usuário |

**Preço Pix:** calculado automaticamente como `preco_cartao × (1 − desconto_pix%)`. O desconto padrão é 5%, configurável em `sd-desc-pix-pct`.

**Campos de custo (Sob Demanda):**
- Mão de obra (R$/hora) → `sd-mao-obra`
- Tempo de trabalho em horas + minutos → `sd-tempo-h`, `sd-tempo-m`
- Material/filamento (R$) → `sd-material`
- Energia (R$) → `sd-energia`
- Embalagem (R$) → `sd-embalagem`
- Entrega/deslocamento (R$) → `sd-entrega`
- Imposto (%) → `sd-imposto`
- Outros custos (R$) → `sd-outros`

**Modos de cálculo:**
1. Manual: usuário informa o preço de venda no cartão
2. Por margem: slider de 5% a 90%, calcula o preço iterativamente

**Saúde da margem (SD_SAUDE):**
| Margem | Cor | Label |
|--------|-----|-------|
| ≥50% | #00e5a0 | 🏆 Excelente |
| ≥35% | #7fff00 | ✅ Muito boa |
| ≥25% | #ffb020 | 👍 Boa |
| ≥15% | #ff8800 | ⚠️ Apertada |
| ≥5% | #ff4444 | 🚨 Muito apertada |
| ≥0% | #ff0000 | 💀 Insustentável |
| <0% | #cc0000 | ⛔ Prejuízo |

---

## 7. CALCULADORA PRINCIPAL (Produto 3D)

### 7.1 Entradas de Produção

**Card 01 — Tipo de Produto** (seletor 3D / Normal)

**Card 02 — Marketplace** (ML / Shopee / Venda Direta)

**Card 03 — Impressora & Energia:**
- Select de modelo: `impressora`
- Impressoras Bambu Lab com consumo em kWh/h:
  - A1 Mini: 0,08 kWh/h
  - A1: 0,10 kWh/h
  - P1P: 0,10 kWh/h
  - P1S: 0,10 kWh/h
  - X1 Carbon: 0,11 kWh/h
  - H2D: 0,20 kWh/h
  - Outra (custom): usuário digita o consumo em kWh/h no campo `impressora-kwh-custom`
- Tempo de impressão: horas (`horas`) + minutos (`minutos`) — sincronizados automaticamente (60min → vira 1h)
- Valor do kWh (R$): `kwh`

**Fórmula energia:** `energia = consumo_kWh/h × horas_totais × valor_kwh`

**Card 04 — Filamento:**
- Custo do filamento R$/kg: `custo-kg`
- Peso da peça em gramas: `peso-g`

**Fórmula filamento:** `filamento = (custo_kg / 1000) × peso_gramas`

**Card 05 — Demais Custos:**
- Imposto (alíquota %): `imposto` → `preco × (aliq/100)`
- Embalagem (R$): `embalagem`
- Outros custos (R$): `outros`

### 7.2 Modos de Precificação

Select `modo-preco` com duas opções:

**Manual:** usuário digita o preço de venda em `preco`. Sistema calcula custos e lucro com base nesse preço.

**Por Margem:** slider `margem-slider` (5% a 80%, default 30%). Sistema calcula o preço de venda iterativamente (20 ciclos) para que o lucro seja exatamente a margem% do preço de venda, já considerando todas as taxas (que dependem do próprio preço — loop circular resolvido por iteração).

**Fórmula iterativa precoParaMargem:**
```javascript
// Estima inicial: custo_fixo / (1 - margem - 0.15)
// Loop 20x:
//   taxa = calcML(preco) ou calcShopee(preco)
//   frete = freteML(preco)
//   imposto = preco × (aliq/100)
//   custo_total = custo_fixo + taxa + frete + imposto
//   novo_preco = custo_total / (1 - margem)
//   se |novo_preco - preco| < 0.01 → convergiu → break
```

### 7.3 Promoção

Toggle `t-promo` ativa o painel de promoção. Usuário define o % de desconto em `promo-pct` (default 10%).

**Fórmula:** `preco_anuncio = preco_normal / (1 - desconto%)` — assim o cliente paga exatamente o preço normal após o desconto, preservando o lucro do vendedor intacto.

Exibe:
- Preço de anúncio (maior, com o desconto embutido)
- Preço final que o cliente paga (= preço original)
- Lucro preservado

### 7.4 Validações

Antes de calcular, verifica:
1. Se `custo-kg` preenchido mas `peso-g` vazio → erro
2. Se `peso-g` preenchido mas `custo-kg` vazio → erro
3. Se tempo de impressão > 0 mas `kwh` vazio → erro
4. Se impressora custom selecionada e `impressora-kwh-custom` vazio → erro
5. Se ML com categoria custom e taxas não preenchidas → erro
6. Se modo manual e `preco` ≤ 0 → erro

Erros aparecem no `empty-state` em vez do resultado.

### 7.5 Cálculo Principal (função `calc`)

```javascript
// Desestrutura calcCustos(preco):
const {energia, filamento, taxa, frete, imposto, extras, cupomDesc, custoTotal, taxaData, horas} = calcCustos(preco);

const lucro = preco - custoTotal;
const margem = (lucro / preco) * 100;
const lucroH = horas > 0 ? lucro / horas : null;

// Capacidade produtiva (base 20h/dia):
const pecasPorDia = horas > 0 ? (20 / horas) : 0;
const lucroDia = lucroHoraAbs * 20;
const lucroMes = lucroDia * 30;
```

### 7.6 Outputs do Resultado

**Hero (resultado principal):**
- Lucro líquido → `res-lucro` (verde se positivo, vermelho se negativo)
- Lucro por hora → `res-lh`
- Margem de contribuição → `res-margem`
- Custo total → `res-custo`
- Taxa marketplace → `res-taxa`
- Preço de venda → `res-preco`

**Capacidade produtiva:**
- Lucro/hora: `cap-lh`
- Lucro estimado/dia (20h): `cap-dia`
- Lucro estimado/mês (30 dias): `cap-mes`

**Cascata de custos (renderCascade):**
Breakdown visual em cascata mostrando: Preço → (deduz cada custo) → Lucro final. Cada item mostra o valor absoluto e o % sobre o preço. Itens com valor 0 são omitidos automaticamente.

Itens da cascata (ordem):
1. Taxa marketplace
2. Frete estimado
3. Imposto
4. Energia elétrica
5. Filamento (ou "Custo fornecedor" no modo normal)
6. Embalagem / extras
7. Cupom próprio (se ativo)

**Barra de composição de custos:**
Barra horizontal colorida mostrando proporção de cada custo. Segmentos:
- `se` = energia (azul)
- `sf` = filamento (rosa)
- `st` = taxa (amarelo)
- `sfr` = frete (roxo)
- `si` = imposto (vermelho)
- `sx` = extras (cinza)
- `sp` = lucro (verde ou vermelho)

**Alertas automáticos:**
- Prejuízo (`lucro < 0`): bloco vermelho com preço mínimo de equilíbrio
- Margem < 10%: aviso laranja
- Margem 10–20%: aviso amarelo

**Card de detalhes (Mercado Livre):**
Mostra: tipo do anúncio, comissão%, taxa fixa se aplicável, taxa antecipação se premium parcelado, custo de envio com descrição do tipo de frete, total ML.

**Card de detalhes (Shopee):**
Mostra: faixa de preço, comissão% (com +2,5% campanha se ativo), taxa fixa base, adicional CPF +R$3 se aplicável, cupom próprio se ativo, total Shopee.

---

## 8. HISTÓRICO

### Estrutura de dados (localStorage key: `3decom_hist`)
Array de objetos JSON, máximo 100 registros, ordenado do mais recente para o mais antigo:
```javascript
{
  id: Date.now(),        // timestamp como ID único
  nome: "string",        // nome do produto (obrigatório)
  mp: "Mercado Livre" | "Shopee" | "Venda Direta",
  preco: 49.90,          // preço de venda (float)
  margem: "28.3%",       // string formatada
  lucro: "R$ 14,12",     // string formatada
  data: "23/02/2026"     // toLocaleDateString('pt-BR')
}
```

### Fluxo de Salvar
1. Usuário clica em `btn-salvar` (aparece após cálculo bem-sucedido)
2. `abrirSalvar()` → abre modal `modal-salvar`, move modal para `document.body` (escapar de stacking context)
3. Usuário digita nome do produto em `modal-nome-produto`
4. Clica "Salvar" → `confirmarSalvar()`
5. Valida nome obrigatório, salva no localStorage, fecha modal, pisca "✅ Salvo!" no botão
6. Chama `renderHistorico()` para atualizar a lista

### renderHistorico
Lê o array do localStorage e renderiza HTML inline com cores fixas (`#ededf8`, `#666`, `#00e5a0`) — não usar `var(--text1)` que não existe no CSS.

---

## 9. PREFERÊNCIAS

### Estrutura de dados (localStorage key: `3decom_prefs_v1`)
```javascript
{
  filamento: "80",          // R$/kg
  kwh: "0.85",              // R$/kWh
  embalagem: "2.50",        // R$
  imposto: "6",             // %
  margem: "30",             // %
  promo: "10",              // %
  impressora: "0.08",       // valor do option (kWh/h)
  impressoraNome: "",       // nome se custom
  impressoraKwh: "",        // kWh/h se custom
  contaShopee: "cpf"        // 'cpf' | 'cnpj'
}
```

### Campos do Painel de Preferências
1. **Conta Shopee padrão** — botões CPF / CNPJ (classe `.ob.ag` quando ativo)
2. Custo do filamento R$/kg → `p-filamento`
3. Valor do kWh R$ → `p-kwh`
4. Embalagem padrão R$ → `p-embalagem`
5. Imposto padrão % → `p-imposto`
6. Margem padrão % → `p-margem`
7. Desconto promoção padrão % → `p-promo`
8. Impressora padrão → `p-impressora` (mesmo select das impressoras Bambu)
9. Se "custom": campos `p-impressora-nome` e `p-impressora-kwh-custom`

### Fluxo de Preferências
- `loadPrefs()`: chamado no INIT, lê localStorage e popula campos do painel E aplica nos campos da calculadora via `applyPrefs()`
- `savePrefs()`: salva tudo no localStorage, chama `applyPrefs()`, exibe indicador "✓ Salvo!" por 2,5s
- `applyPrefs(p)`: copia valores para os campos da calculadora (`custo-kg`, `kwh`, `impressora`, `embalagem`, `imposto`, `promo-pct`, `margem-slider`) e aplica a conta Shopee via `selectConta()`
- `resetPrefs()`: remove do localStorage, limpa campos, volta CPF
- `setPrefConta(conta)`: atualiza o hidden input `p-conta-shopee` e aplica classe `.ag` no botão correto

---

## 10. FUNÇÕES UTILITÁRIAS

```javascript
const el = id => document.getElementById(id)
const set = (id, v) => el(id).textContent = v
const fmt = v => 'R$ ' + v.toFixed(2).replace('.', ',')
const pct = v => v.toFixed(1) + '%'

function getTotalHoras(){
  const h = parseFloat(el('horas').value)||0;
  const m = parseFloat(el('minutos').value)||0;
  return h + (m/60);
}

function fmtTempo(hTotal){
  // Converte horas decimais para "Xh Ymin"
}

function syncTime(from){
  // Sincroniza campos horas/minutos
  // Se minutos >= 60: incrementa horas, zera minutos
}
```

---

## 11. VARIÁVEIS DE ESTADO GLOBAIS

```javascript
let MP = null              // marketplace selecionado
let mlAnuncio = 'classico'
let mlParcel = false
let shopeeConta = 'cpf'
let shopeeAlto = false
let shopeeCamp = false
let cuponTipo = 'pct'
let cuponValor = 0
let cuponOn = false
let modoPreco = 'manual'   // 'manual' | 'margem'
let margemSlider = 30
let promoOn = false
let tipoProduto = '3d'     // '3d' | 'normal'
let modoNormal = 'pv'      // 'pv' | 'cf'

// Sob Demanda
let sdCartaoTipo = 'debito'
let sdParcelas = 1
let sdModo = 'manual'
let sdMargemSlider = 40

// Constantes
const HIST_KEY = '3decom_hist'
const PREF_KEY = '3decom_prefs_v1'
const SHOP_TETO = 100      // teto de comissão Shopee R$100
```

---

## 12. SEQUÊNCIA DE INICIALIZAÇÃO (INIT)

```javascript
loadPrefs();          // carrega preferências do localStorage → aplica campos
selectTipo('3d');     // mostra cards 3D, oculta fornecedor, aplica cor ag
selectMP('shopee');   // seleciona Shopee por padrão, inicializa estado
// Init slider display
const sl = el('margem-slider');
sl.style.setProperty('--val', (sl.value-5)/(80-5)*100 + '%');
```

---

## 13. APLICAÇÃO NEXT.JS (BACKEND)

### Estrutura de Pastas
```
app/
  page.tsx                   → redirect para /auth/login ou /dashboard
  layout.tsx                 → SessionWrapper + globals.css
  globals.css                → reset CSS mínimo
  landing/page.tsx           → serve public/landing.html via iframe
  auth/
    login/page.tsx           → form email+senha, POST /api/auth/[...nextauth]
    cadastro/page.tsx        → form email+senha, POST /api/register
  dashboard/page.tsx         → verifica sessão + assinatura, serve iframe precificadora.html
  assinar/page.tsx           → página de assinatura (link Lastlink)
  api/
    auth/[...nextauth]/route.ts  → NextAuth config (CredentialsProvider)
    register/route.ts            → cadastro: valida, hash senha, insere Supabase
    webhook/lastlink/route.ts    → webhook Lastlink: ativa assinatura no Supabase
lib/
  auth.ts                    → authOptions (NextAuth config, session callback)
  supabase.ts                → getSupabaseAdmin() com lazy init
public/
  landing.html               → landing page estática
  precificadora.html         → a calculadora (3decom.html compilado)
```

### Tabela Supabase (users)
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  subscription_status TEXT DEFAULT 'inactive',
  lastlink_customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Variáveis de Ambiente
```env
NEXT_PUBLIC_SUPABASE_URL=https://goaqytqhvnkyrohuiznx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=...  # openssl rand -base64 32
LASTLINK_WEBHOOK_TOKEN=7777d813e6f74738ad4c4cd703079499
NEXT_PUBLIC_LASTLINK_URL=https://lastlink.com/p/SEU_PRODUTO_ID
```

### Fluxo de Autenticação
1. Usuário acessa `/` → middleware verifica sessão → redireciona para `/auth/login`
2. Cadastro (`/auth/cadastro`) → POST `/api/register` → bcrypt hash → insert Supabase → redirect login
3. Login → NextAuth CredentialsProvider → busca user no Supabase → verifica bcrypt → cria sessão JWT
4. Sessão JWT contém: `id`, `email`, `subscriptionStatus`
5. Dashboard verifica `session.user.subscriptionStatus === 'active'`, senão redireciona `/assinar`

### Webhook Lastlink
- Endpoint: `POST /api/webhook/lastlink`
- Valida token `LASTLINK_WEBHOOK_TOKEN` no header
- Ao receber evento de pagamento aprovado: UPDATE users SET subscription_status='active' WHERE email = payload.email

---

## 14. MODAL DE SALVAR

O modal `#modal-salvar` fica diretamente no `<body>` (fora de qualquer div wrapper) com:
- `position:fixed; top:0; left:0; width:100%; height:100%`
- `z-index:99999`
- `background: rgba(0,0,0,0.8)`
- `display:none` por padrão → `display:flex` ao abrir

**Importante:** a função `abrirSalvar()` usa `document.body.appendChild(modal)` para garantir que o modal saia de qualquer stacking context causado por ancestrais com `transform` ou `z-index`. Sem isso, o `position:fixed` pode ficar preso dentro de um contexto pai e não cobrir a tela inteira.

---

## 15. REGRAS DE NEGÓCIO IMPORTANTES

1. **Frete Shopee é R$0** — já embutido na taxa da plataforma. Nunca calcular frete separado para Shopee.

2. **CPF com +450 pedidos** — toggle ADICIONA R$3 (não remove). Só disponível para CPF, não CNPJ.

3. **Margem é sobre o preço de venda** — não sobre o custo. Margem 30% significa que 30% do preço vai para o vendedor como lucro.

4. **Iteração de preço** — qualquer cálculo de "preço a partir de margem" precisa de iteração porque a taxa do marketplace depende do preço, que depende da taxa (círculo). 20 iterações convergem com precisão de R$ 0,01.

5. **Cascata de custos** — só exibe itens com valor > 0. Não mostrar linha de R$0,00.

6. **Capacidade produtiva** — baseada em 20h/dia de impressão ativa, 30 dias/mês.

7. **Promoção** — o preço de anúncio é MAIOR que o preço real. A fórmula garante que após o desconto aplicado pelo marketplace, o vendedor recebe o preço alvo e preserva o lucro.

8. **Histórico máximo** — 100 registros. Se ultrapassar, descarta os mais antigos (slice(0,100)).

9. **CSS var(--text1) não existe** — usar sempre `var(--text)` ou cores fixas em HTML inline.

10. **Funções JS** — todas declaradas como `function foo(){}` (declarações, não expressões) para garantir hoisting e acesso global via `onclick`. NÃO usar `const foo = function(){}` para funções chamadas por onclick do HTML.

---

## 16. LISTA COMPLETA DE IDs HTML RELEVANTES

### Navegação
`tab-calc`, `tab-hist`, `tab-pref`, `calc-panel`, `hist-panel`, `pref-panel`

### Tipo de produto
`btn-tipo-3d`, `btn-tipo-normal`, `card-impressora`, `card-filamento`, `card-fornecedor`

### Marketplace
`tab-meli`, `tab-shopee`, `tab-direto`, `r-meli`, `r-shopee`, `r-direto`
`mp-section`, `shopee-section`, `demanda-panel`

### ML específico
`btn-classico`, `btn-premium`, `ml-cat`, `ml-custom-wrap`, `ml-tc`, `ml-tp`
`ml-parcel-row`, `t-parcel`, `t-ml-rapido`, `t-ml-frete-manual`, `t-ml-correios`
`wrap-ml-frete-manual`, `wrap-ml-correios`, `ml-frete-manual`, `ml-frete-correios`
`ml-peso`, `ml-frete-display`, `ml-frete-info`

### Shopee específico
`btn-cpf`, `btn-cnpj`, `t-450`, `t-camp`, `t-cupon`, `wrap-cupon`
`btn-cupon-pct`, `btn-cupon-real`, `cupon-wrap-pct`, `cupon-wrap-real`
`cupon-pct`, `cupon-real`, `cupon-val-label`

### Preço & Margem
`modo-preco`, `wrap-preco-manual`, `preco`, `wrap-margem`, `margem-slider`
`margem-pct-lbl`, `preco-auto`, `preco-auto-info`

### Promoção
`t-promo`, `wrap-promo`, `promo-pct`, `preco-promo`, `preco-promo-info`
`promo-box`, `pb-preco`, `pb-pct`, `pb-final`, `pb-info`

### Impressora (3D)
`impressora`, `wrap-impressora-custom`, `impressora-kwh-custom`
`horas`, `minutos`, `kwh`

### Filamento (3D)
`custo-kg`, `peso-g`

### Produto Normal
`custo-fornecedor`, `normal-margem-pct`, `btn-modo-pv`, `btn-modo-cf`
`wrap-modo-pv`, `wrap-modo-cf`, `normal-preco-calculado`, `normal-preco-info`
`normal-pv-alvo`, `normal-margem-cf`, `cf-resultado`, `cf-detalhe`, `cf-breakdown`

### Extras
`imposto`, `embalagem`, `outros`

### Resultado principal
`empty-state`, `rp`, `btn-salvar`, `res-badge`, `res-lucro`, `res-lh`
`res-margem`, `res-custo`, `res-taxa`, `res-preco`
`cap-lh`, `cap-dia`, `cap-mes`
`bd-preco-top`, `bd-cascade-rows`, `bd-luc`, `bd-result-box`, `bd-result-label`, `bd-result-pct`
`se`, `sf`, `st`, `sfr`, `si`, `sx`, `sp` (segmentos da barra)
`a-danger`, `a-warn`, `a-info`
`detail-card`, `detail-title`, `detail-body`

### Sob Demanda
`sd-btn-debito`, `sd-btn-credito`, `sd-btn-custom`
`sd-wrap-parcelas`, `sd-parcelas-btns`, `sd-wrap-taxa-custom`, `sd-taxa-custom-val`
`sd-modo`, `sd-wrap-manual`, `sd-wrap-margem`, `sd-margem-slider`, `sd-margem-lbl`
`sd-mao-obra`, `sd-tempo-h`, `sd-tempo-m`, `sd-material`, `sd-energia`
`sd-embalagem`, `sd-entrega`, `sd-imposto`, `sd-outros`, `sd-desc-pix-pct`
`sd-preco`, `sd-preco-auto`, `sd-preco-auto-info`
`sd-empty`, `sd-rp`, `sd-pgto-badge`, `sd-taxa-desc`, `sd-taxa-pct-display`
`sd-pix-preview`, `sd-pix-preview-info`, `sd-res-lucro`, `sd-res-lh`
`sd-res-margem`, `sd-res-custo`, `sd-res-taxa`, `sd-res-mao`
`sd-saude-bar`, `sd-saude-pct`, `sd-saude-label`, `sd-saude-dica`
`sd-pix-alt-box`, `sd-pix-cartao`, `sd-pix-preco`, `sd-pix-info`
`sd-a-danger`, `sd-a-warn`, `sd-a-info`
`sd-bd-preco-top`, `sd-bd-cascade-rows`, `sd-bd-luc`, `sd-bd-result-box`
`sd-bd-result-label`, `sd-bd-result-pct`, `sd-detail-title`, `sd-detail-body`

### Modal Salvar
`modal-salvar`, `modal-nome-produto`, `modal-nome-erro`

### Histórico
`hist-lista`

### Preferências
`p-btn-cpf`, `p-btn-cnpj`, `p-conta-shopee`
`p-filamento`, `p-kwh`, `p-embalagem`, `p-imposto`, `p-margem`, `p-promo`
`p-impressora`, `wrap-p-impressora-custom`, `p-impressora-nome`, `p-impressora-kwh-custom`
`saved-indicator`
