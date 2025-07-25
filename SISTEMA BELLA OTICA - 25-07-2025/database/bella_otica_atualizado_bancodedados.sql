-- CRIAÇÃO DE TABELAS
-- Tabela: lojas
CREATE TABLE lojas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    endereco TEXT,
    bairro TEXT,
    cidade TEXT
);

-- Tabela: funcionarios
CREATE TABLE funcionarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    senha TEXT NOT NULL -- Deve ser armazenada com hash (bcrypt, etc)
);

-- Tabela: clientes
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    data_nascimento DATE,
    endereco TEXT,
    numero NUMERIC,
    bairro TEXT,
    cidade TEXT,
    telefone TEXT
);

-- Tabela: ordens_servico
CREATE TABLE ordens_servico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_os INT UNIQUE NOT NULL,
    data_pedido DATE NOT NULL,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    loja_id UUID NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE
);

-- Tabela: receitas
CREATE TABLE receitas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ordem_servico_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,

    esf_longe_od NUMERIC,
    cil_longe_od NUMERIC,
    eixo_longe_od NUMERIC,
    dnp_longe_od NUMERIC,
    alt_od NUMERIC,
    adicao_od NUMERIC,

    esf_longe_oe NUMERIC,
    cil_longe_oe NUMERIC,
    eixo_longe_oe NUMERIC,
    dnp_longe_oe NUMERIC,
    alt_oe NUMERIC,
    adicao_oe NUMERIC,

    esf_perto_od NUMERIC,
    cil_perto_od NUMERIC,
    eixo_perto_od NUMERIC,

    esf_perto_oe NUMERIC,
    cil_perto_oe NUMERIC,
    eixo_perto_oe NUMERIC
);

-- Tabela: armacao_lente
CREATE TABLE armacao_lente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ordem_servico_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
    
    ponte NUMERIC,
    horizontal NUMERIC,
    vertical NUMERIC,
    diagonal_maior NUMERIC,

    tipo_armacao TEXT,
    material TEXT,
    tipo_lente TEXT,
    tratamento TEXT,
    coloracao TEXT
);

-- Tabela: pagamentos
CREATE TABLE pagamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ordem_servico_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,

    valor_lente NUMERIC,
    valor_armacao NUMERIC,
    valor_total NUMERIC,
    entrada NUMERIC,
    parcelas INT,
    valor_parcelas NUMERIC,
    forma_pagamento TEXT,
    status TEXT
);

-- Tabela: produtos (cadastro geral)
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referencia TEXT NOT NULL UNIQUE,
    descricao TEXT,
    fornecedor TEXT,
    material TEXT,
    
    custo_medio NUMERIC,
    valor_maximo NUMERIC,
    valor_medio NUMERIC,
    valor_minimo NUMERIC,    
    foto TEXT
);

-- Tabela: estoque_lojas (controle por loja)
CREATE TABLE estoque_lojas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    loja_id UUID NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
    quantidade INT DEFAULT 0,
    UNIQUE(produto_id, loja_id)
);

-- Tabela: registo_ponto
CREATE TABLE registro_ponto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    data DATE NOT NULL, -- data do registro (para evitar duplicidade por dia)

    entrada TIMESTAMP,
    saida_almoco TIMESTAMP,
    retorno_almoco TIMESTAMP,
    saida_final TIMESTAMP,

    horas_trabalhadas TEXT,
    saldo_horas TEXT,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
