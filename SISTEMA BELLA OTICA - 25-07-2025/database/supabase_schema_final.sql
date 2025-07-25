# Esquema SQL Atualizado para Supabase - Sistema Bella Ótica

-- Criação das tabelas principais com políticas RLS

-- 1. Tabela de Lojas
CREATE TABLE IF NOT EXISTS lojas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  endereco TEXT,
  telefone VARCHAR(20),
  email VARCHAR(255),
  responsavel VARCHAR(255),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Funcionários (integrada com auth.users)
CREATE TABLE IF NOT EXISTS funcionarios (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  loja_id UUID REFERENCES lojas(id),
  perfil VARCHAR(20) CHECK (perfil IN ('admin', 'user')) DEFAULT 'user',
  cargo VARCHAR(100),
  telefone VARCHAR(20),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Categorias de Produtos
CREATE TABLE IF NOT EXISTS categorias_produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(100) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria_id UUID REFERENCES categorias_produtos(id),
  marca VARCHAR(100),
  modelo VARCHAR(100),
  cor VARCHAR(50),
  tamanho VARCHAR(50),
  preco_custo DECIMAL(10,2),
  preco_venda DECIMAL(10,2),
  margem_lucro DECIMAL(5,2),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Estoque por Loja
CREATE TABLE IF NOT EXISTS estoque (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID REFERENCES produtos(id),
  loja_id UUID REFERENCES lojas(id),
  quantidade INTEGER DEFAULT 0,
  quantidade_minima INTEGER DEFAULT 0,
  localizacao VARCHAR(100),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(produto_id, loja_id)
);

-- 6. Tabela de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14),
  rg VARCHAR(20),
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco TEXT,
  data_nascimento DATE,
  loja_cadastro_id UUID REFERENCES lojas(id),
  funcionario_cadastro_id UUID REFERENCES funcionarios(id),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Ordens de Serviço
CREATE TABLE IF NOT EXISTS ordens_servico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_os VARCHAR(50) UNIQUE NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  loja_id UUID REFERENCES lojas(id),
  funcionario_id UUID REFERENCES funcionarios(id),
  tipo_servico VARCHAR(100),
  descricao TEXT,
  valor_servico DECIMAL(10,2),
  valor_produtos DECIMAL(10,2),
  valor_total DECIMAL(10,2),
  status VARCHAR(20) CHECK (status IN ('aberta', 'em_andamento', 'concluida', 'cancelada')) DEFAULT 'aberta',
  data_entrega DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabela de Itens da Ordem de Serviço
CREATE TABLE IF NOT EXISTS itens_ordem_servico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem_servico_id UUID REFERENCES ordens_servico(id),
  produto_id UUID REFERENCES produtos(id),
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2),
  preco_total DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Tabela de Notas Fiscais
CREATE TABLE IF NOT EXISTS notas_fiscais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_nf VARCHAR(50) UNIQUE NOT NULL,
  serie VARCHAR(10),
  tipo VARCHAR(20) CHECK (tipo IN ('entrada', 'saida', 'devolucao', 'garantia')),
  loja_id UUID REFERENCES lojas(id),
  cliente_id UUID REFERENCES clientes(id),
  funcionario_id UUID REFERENCES funcionarios(id),
  ordem_servico_id UUID REFERENCES ordens_servico(id),
  valor_produtos DECIMAL(10,2),
  valor_servicos DECIMAL(10,2),
  valor_desconto DECIMAL(10,2),
  valor_total DECIMAL(10,2),
  data_emissao DATE DEFAULT CURRENT_DATE,
  observacoes TEXT,
  xml_nf TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Tabela de Itens da Nota Fiscal
CREATE TABLE IF NOT EXISTS itens_nota_fiscal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nota_fiscal_id UUID REFERENCES notas_fiscais(id),
  produto_id UUID REFERENCES produtos(id),
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2),
  preco_total DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Tabela de Movimentações de Caixa
CREATE TABLE IF NOT EXISTS caixa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id),
  funcionario_id UUID REFERENCES funcionarios(id),
  tipo VARCHAR(20) CHECK (tipo IN ('entrada', 'saida')),
  categoria VARCHAR(100),
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL,
  forma_pagamento VARCHAR(50),
  nota_fiscal_id UUID REFERENCES notas_fiscais(id),
  ordem_servico_id UUID REFERENCES ordens_servico(id),
  data_movimento DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Tabela de Transferências de Estoque
CREATE TABLE IF NOT EXISTS transferencias_estoque (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID REFERENCES produtos(id),
  loja_origem_id UUID REFERENCES lojas(id),
  loja_destino_id UUID REFERENCES lojas(id),
  funcionario_solicitante_id UUID REFERENCES funcionarios(id),
  funcionario_aprovador_id UUID REFERENCES funcionarios(id),
  quantidade INTEGER NOT NULL,
  motivo TEXT,
  status VARCHAR(20) CHECK (status IN ('solicitada', 'aprovada', 'rejeitada', 'concluida')) DEFAULT 'solicitada',
  data_solicitacao DATE DEFAULT CURRENT_DATE,
  data_aprovacao DATE,
  data_conclusao DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Tabela de Metas
CREATE TABLE IF NOT EXISTS metas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo VARCHAR(20) CHECK (tipo IN ('funcionario', 'loja')),
  funcionario_id UUID REFERENCES funcionarios(id),
  loja_id UUID REFERENCES lojas(id),
  periodo VARCHAR(7), -- YYYY-MM
  meta_vendas DECIMAL(10,2),
  meta_quantidade INTEGER,
  vendas_realizadas DECIMAL(10,2) DEFAULT 0,
  quantidade_realizada INTEGER DEFAULT 0,
  percentual_vendas DECIMAL(5,2) DEFAULT 0,
  percentual_quantidade DECIMAL(5,2) DEFAULT 0,
  comissao_gerada DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('em_andamento', 'atingida', 'nao_atingida')) DEFAULT 'em_andamento',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Tabela de Comissões
CREATE TABLE IF NOT EXISTS comissoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funcionario_id UUID REFERENCES funcionarios(id),
  loja_id UUID REFERENCES lojas(id),
  nota_fiscal_id UUID REFERENCES notas_fiscais(id),
  produto_id UUID REFERENCES produtos(id),
  tipo_comissao VARCHAR(50), -- 'armacao', 'lente', 'acessorio', etc.
  percentual DECIMAL(5,2),
  valor_base DECIMAL(10,2),
  valor_comissao DECIMAL(10,2),
  periodo VARCHAR(7), -- YYYY-MM
  pago BOOLEAN DEFAULT false,
  data_pagamento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Tabela de Fotos de Produtos
CREATE TABLE IF NOT EXISTS fotos_produto (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID REFERENCES produtos(id),
  url_foto TEXT NOT NULL,
  descricao VARCHAR(255),
  principal BOOLEAN DEFAULT false,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Tabela de Vitrine Virtual
CREATE TABLE IF NOT EXISTS vitrine_virtual (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID REFERENCES produtos(id),
  loja_id UUID REFERENCES lojas(id),
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  qr_code TEXT,
  visualizacoes INTEGER DEFAULT 0,
  compartilhamentos INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. Tabela de Chat/Mensagens
CREATE TABLE IF NOT EXISTS chat_mensagens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversa_id UUID,
  remetente_id UUID REFERENCES funcionarios(id),
  conteudo TEXT NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('texto', 'imagem', 'arquivo')) DEFAULT 'texto',
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. Tabela de Conversas
CREATE TABLE IF NOT EXISTS chat_conversas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255),
  tipo VARCHAR(20) CHECK (tipo IN ('individual', 'grupo')),
  loja_id UUID REFERENCES lojas(id),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. Tabela de Participantes das Conversas
CREATE TABLE IF NOT EXISTS chat_participantes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversa_id UUID REFERENCES chat_conversas(id),
  funcionario_id UUID REFERENCES funcionarios(id),
  admin BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversa_id, funcionario_id)
);

-- Inserir dados iniciais
INSERT INTO categorias_produtos (nome, descricao) VALUES
('Óculos de Sol', 'Óculos de proteção solar'),
('Armações', 'Armações para lentes de grau'),
('Lentes', 'Lentes oftálmicas e de contato'),
('Acessórios', 'Acessórios para óculos');

-- Inserir lojas exemplo
INSERT INTO lojas (nome, cnpj, endereco, telefone, email, responsavel) VALUES
('Bella Ótica Centro', '12.345.678/0001-90', 'Rua Principal, 123 - Centro', '(11) 1234-5678', 'centro@bellaotica.com', 'Maria Santos'),
('Bella Ótica Shopping', '12.345.678/0002-71', 'Shopping Center, Loja 45', '(11) 2345-6789', 'shopping@bellaotica.com', 'Pedro Costa'),
('Bella Ótica Norte', '12.345.678/0003-52', 'Av. Norte, 456 - Zona Norte', '(11) 3456-7890', 'norte@bellaotica.com', 'Ana Silva'),
('Bella Ótica Sul', '12.345.678/0004-33', 'Rua Sul, 789 - Zona Sul', '(11) 4567-8901', 'sul@bellaotica.com', 'João Oliveira'),
('Bella Ótica Oeste', '12.345.678/0005-14', 'Av. Oeste, 321 - Zona Oeste', '(11) 5678-9012', 'oeste@bellaotica.com', 'Carlos Mendes');

-- Habilitar RLS em todas as tabelas
ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_ordem_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_nota_fiscal ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE transferencias_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos_produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitrine_virtual ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participantes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Funcionários
CREATE POLICY "Funcionários podem ver todos os funcionários" ON funcionarios
  FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem inserir funcionários" ON funcionarios
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE id = auth.uid() AND perfil = 'admin'
    )
  );

CREATE POLICY "Apenas admins podem atualizar funcionários" ON funcionarios
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE id = auth.uid() AND perfil = 'admin'
    )
  );

-- Políticas RLS para Lojas
CREATE POLICY "Todos podem ver lojas" ON lojas
  FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem modificar lojas" ON lojas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE id = auth.uid() AND perfil = 'admin'
    )
  );

-- Políticas RLS para Produtos
CREATE POLICY "Todos podem ver produtos" ON produtos
  FOR SELECT USING (true);

CREATE POLICY "Funcionários podem inserir produtos" ON produtos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Funcionários podem atualizar produtos" ON produtos
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Políticas RLS para Estoque
CREATE POLICY "Funcionários podem ver estoque de todas as lojas" ON estoque
  FOR SELECT USING (true);

CREATE POLICY "Funcionários podem atualizar estoque" ON estoque
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Políticas RLS para Clientes
CREATE POLICY "Funcionários podem ver todos os clientes" ON clientes
  FOR SELECT USING (true);

CREATE POLICY "Funcionários podem inserir clientes" ON clientes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Funcionários podem atualizar clientes" ON clientes
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Políticas RLS para Ordens de Serviço
CREATE POLICY "Admins podem ver todas as OS" ON ordens_servico
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE id = auth.uid() AND perfil = 'admin'
    )
  );

CREATE POLICY "Users podem ver OS da sua loja" ON ordens_servico
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE id = auth.uid() AND loja_id = ordens_servico.loja_id
    )
  );

CREATE POLICY "Funcionários podem inserir OS" ON ordens_servico
  FOR INSERT WITH CHECK (
    funcionario_id = auth.uid()
  );

CREATE POLICY "Funcionários podem atualizar suas OS" ON ordens_servico
  FOR UPDATE USING (
    funcionario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE id = auth.uid() AND perfil = 'admin'
    )
  );

-- Políticas RLS para Caixa
CREATE POLICY "Admins podem ver todo o caixa" ON caixa
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE id = auth.uid() AND perfil = 'admin'
    )
  );

CREATE POLICY "Users podem ver caixa da sua loja" ON caixa
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE id = auth.uid() AND loja_id = caixa.loja_id
    )
  );

CREATE POLICY "Funcionários podem inserir movimentações de caixa" ON caixa
  FOR INSERT WITH CHECK (
    funcionario_id = auth.uid()
  );

-- Políticas RLS para Metas
CREATE POLICY "Admins podem ver todas as metas" ON metas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE id = auth.uid() AND perfil = 'admin'
    )
  );

CREATE POLICY "Funcionários podem ver suas metas e da sua loja" ON metas
  FOR SELECT USING (
    funcionario_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM funcionarios 
      WHERE id = auth.uid() AND loja_id = metas.loja_id
    )
  );

-- Políticas RLS para Chat
CREATE POLICY "Funcionários podem ver mensagens das conversas que participam" ON chat_mensagens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_participantes 
      WHERE conversa_id = chat_mensagens.conversa_id 
      AND funcionario_id = auth.uid() 
      AND ativo = true
    )
  );

CREATE POLICY "Funcionários podem enviar mensagens" ON chat_mensagens
  FOR INSERT WITH CHECK (
    remetente_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_participantes 
      WHERE conversa_id = chat_mensagens.conversa_id 
      AND funcionario_id = auth.uid() 
      AND ativo = true
    )
  );

-- Funções para atualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_funcionarios_updated_at BEFORE UPDATE ON funcionarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estoque_updated_at BEFORE UPDATE ON estoque FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ordens_servico_updated_at BEFORE UPDATE ON ordens_servico FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_metas_updated_at BEFORE UPDATE ON metas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vitrine_virtual_updated_at BEFORE UPDATE ON vitrine_virtual FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX idx_funcionarios_loja_id ON funcionarios(loja_id);
CREATE INDEX idx_produtos_categoria_id ON produtos(categoria_id);
CREATE INDEX idx_estoque_produto_loja ON estoque(produto_id, loja_id);
CREATE INDEX idx_clientes_loja_cadastro ON clientes(loja_cadastro_id);
CREATE INDEX idx_ordens_servico_loja ON ordens_servico(loja_id);
CREATE INDEX idx_ordens_servico_funcionario ON ordens_servico(funcionario_id);
CREATE INDEX idx_notas_fiscais_loja ON notas_fiscais(loja_id);
CREATE INDEX idx_caixa_loja_data ON caixa(loja_id, data_movimento);
CREATE INDEX idx_metas_funcionario_periodo ON metas(funcionario_id, periodo);
CREATE INDEX idx_metas_loja_periodo ON metas(loja_id, periodo);
CREATE INDEX idx_chat_mensagens_conversa ON chat_mensagens(conversa_id);
CREATE INDEX idx_chat_participantes_conversa ON chat_participantes(conversa_id);

