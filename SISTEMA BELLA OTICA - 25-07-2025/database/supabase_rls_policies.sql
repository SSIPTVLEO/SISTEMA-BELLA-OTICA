-- Políticas de Row Level Security (RLS) para o Sistema Bella Ótica

-- Funções Auxiliares para RLS
-- Estas funções ajudam a determinar o papel (role) e a loja_id do usuário autenticado.

CREATE OR REPLACE FUNCTION get_user_role() RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
  DECLARE
    user_role text;
  BEGIN
    SELECT role FROM public.funcionarios WHERE user_id = auth.uid() INTO user_role;
    RETURN user_role;
  END;
$$;

CREATE OR REPLACE FUNCTION get_user_loja_id() RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
  DECLARE
    user_loja_id uuid;
  BEGIN
    SELECT loja_id FROM public.funcionarios WHERE user_id = auth.uid() INTO user_loja_id;
    RETURN user_loja_id;
  END;
$$;

-- Habilitar RLS e Definir Políticas para cada Tabela

-- Tabela: lojas
-- ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all lojas" ON lojas
  FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Users can view their own loja" ON lojas
  FOR SELECT USING (id = get_user_loja_id());

-- Tabela: funcionarios
-- ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all funcionarios" ON funcionarios
  FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Users can view their own profile and other users in their store" ON funcionarios
  FOR SELECT USING ((loja_id = get_user_loja_id()) OR (user_id = auth.uid()));

CREATE POLICY "Users can update their own profile" ON funcionarios
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Tabela: clientes
-- ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all clientes" ON clientes
  FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Users can view clients from their store or created by them" ON clientes
  FOR SELECT USING ((loja_id = get_user_loja_id()) OR (criado_por = auth.uid()));

CREATE POLICY "Users can insert clients" ON clientes
  FOR INSERT WITH CHECK ((get_user_role() = 'admin') OR (get_user_role() = 'user'));

CREATE POLICY "Users can update clients in their store" ON clientes
  FOR UPDATE USING (loja_id = get_user_loja_id()) WITH CHECK (loja_id = get_user_loja_id());

-- Tabela: ordens_servico
-- ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all ordens_servico" ON ordens_servico
  FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Users can view OS from their store or created by them" ON ordens_servico
  FOR SELECT USING ((loja_id = get_user_loja_id()) OR (criado_por = auth.uid()));

CREATE POLICY "Users can insert OS" ON ordens_servico
  FOR INSERT WITH CHECK ((get_user_role() = 'admin') OR (get_user_role() = 'user'));

CREATE POLICY "Users can update OS in their store" ON ordens_servico
  FOR UPDATE USING (loja_id = get_user_loja_id()) WITH CHECK (loja_id = get_user_loja_id());

-- Tabela: receitas
-- ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all receitas" ON receitas
  FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Users can view receitas related to their store's OS" ON receitas
  FOR SELECT USING (EXISTS (SELECT 1 FROM ordens_servico WHERE id = ordem_servico_id AND (loja_id = get_user_loja_id() OR criado_por = auth.uid())));

CREATE POLICY "Users can insert receitas related to their store's OS" ON receitas
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM ordens_servico WHERE id = ordem_servico_id AND (loja_id = get_user_loja_id() OR criado_por = auth.uid())));

CREATE POLICY "Users can update receitas related to their store's OS" ON receitas
  FOR UPDATE USING (EXISTS (SELECT 1 FROM ordens_servico WHERE id = ordem_servico_id AND (loja_id = get_user_loja_id()))) WITH CHECK (EXISTS (SELECT 1 FROM ordens_servico WHERE id = ordem_servico_id AND (loja_id = get_user_loja_id())));

-- Tabela: armacao_lente
-- ALTER TABLE armacao_lente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all armacao_lente" ON armacao_lente
  FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Users can view armacao_lente related to their store's OS" ON armacao_lente
  FOR SELECT USING (EXISTS (SELECT 1 FROM ordens_servico WHERE id = ordem_servico_id AND (loja_id = get_user_loja_id() OR criado_por = auth.uid())));

CREATE POLICY "Users can insert armacao_lente related to their store's OS" ON armacao_lente
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM ordens_servico WHERE id = ordem_servico_id AND (loja_id = get_user_loja_id() OR criado_por = auth.uid())));

CREATE POLICY "Users can update armacao_lente related to their store's OS" ON armacao_lente
  FOR UPDATE USING (EXISTS (SELECT 1 FROM ordens_servico WHERE id = ordem_servico_id AND (loja_id = get_user_loja_id()))) WITH CHECK (EXISTS (SELECT 1 FROM ordens_servico WHERE id = ordem_servico_id AND (loja_id = get_user_loja_id())));

-- Tabela: pagamentos
-- ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all pagamentos" ON pagamentos
  FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Users can view pagamentos from their store" ON pagamentos
  FOR SELECT USING (loja_id = get_user_loja_id());

CREATE POLICY "Users can insert pagamentos" ON pagamentos
  FOR INSERT WITH CHECK ((get_user_role() = 'admin') OR (get_user_role() = 'user'));

CREATE POLICY "Users can update pagamentos in their store" ON pagamentos
  FOR UPDATE USING (loja_id = get_user_loja_id()) WITH CHECK (loja_id = get_user_loja_id());

-- Tabela: produtos
-- ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view products" ON produtos
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage products" ON produtos
  FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

-- Tabela: estoque_lojas
-- ALTER TABLE estoque_lojas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view estoque_lojas" ON estoque_lojas
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage estoque_lojas" ON estoque_lojas
  FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Users can update estoque in their store" ON estoque_lojas
  FOR UPDATE USING (loja_id = get_user_loja_id()) WITH CHECK (loja_id = get_user_loja_id());

-- Tabela: registro_ponto
-- ALTER TABLE registro_ponto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all registro_ponto" ON registro_ponto
  FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Users can view their own registro_ponto" ON registro_ponto
  FOR SELECT USING (funcionario_id = (SELECT id FROM funcionarios WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own registro_ponto" ON registro_ponto
  FOR INSERT WITH CHECK (funcionario_id = (SELECT id FROM funcionarios WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own registro_ponto" ON registro_ponto
  FOR UPDATE USING (funcionario_id = (SELECT id FROM funcionarios WHERE user_id = auth.uid())) WITH CHECK (funcionario_id = (SELECT id FROM funcionarios WHERE user_id = auth.uid()));

-- Tabela: notas_fiscais
-- ALTER TABLE notas_fiscais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all notas_fiscais" ON notas_fiscais
  FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Users can view notas_fiscais from their store" ON notas_fiscais
  FOR SELECT USING (loja_id = get_user_loja_id());

CREATE POLICY "Users can insert notas_fiscais" ON notas_fiscais
  FOR INSERT WITH CHECK ((get_user_role() = 'admin') OR (get_user_role() = 'user'));

CREATE POLICY "Users can update notas_fiscais in their store" ON notas_fiscais
  FOR UPDATE USING (loja_id = get_user_loja_id()) WITH CHECK (loja_id = get_user_loja_id());

-- Tabela: itens_nota_fiscal
-- ALTER TABLE itens_nota_fiscal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all itens_nota_fiscal" ON itens_nota_fiscal
  FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Users can view itens_nota_fiscal related to their store's NF" ON itens_nota_fiscal
  FOR SELECT USING (EXISTS (SELECT 1 FROM notas_fiscais WHERE id = nota_fiscal_id AND loja_id = get_user_loja_id()));

CREATE POLICY "Users can insert itens_nota_fiscal related to their store's NF" ON itens_nota_fiscal
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM notas_fiscais WHERE id = nota_fiscal_id AND loja_id = get_user_loja_id()));

CREATE POLICY "Users can update itens_nota_fiscal related to their store's NF" ON itens_nota_fiscal
  FOR UPDATE USING (EXISTS (SELECT 1 FROM notas_fiscais WHERE id = nota_fiscal_id AND loja_id = get_user_loja_id())) WITH CHECK (EXISTS (SELECT 1 FROM notas_fiscais WHERE id = nota_fiscal_id AND loja_id = get_user_loja_id()));

-- Tabela: caixa
-- ALTER TABLE caixa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all caixa" ON caixa
  FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Users can view caixa from their store" ON caixa
  FOR SELECT USING (loja_id = get_user_loja_id());

CREATE POLICY "Users can insert caixa" ON caixa
  FOR INSERT WITH CHECK ((get_user_role() = 'admin') OR (get_user_role() = 'user'));

CREATE POLICY "Users can update caixa in their store" ON caixa
  FOR UPDATE USING (loja_id = get_user_loja_id()) WITH CHECK (loja_id = get_user_loja_id());

-- Tabela: metas
-- ALTER TABLE metas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all metas" ON metas
  FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Users can view metas from their store or their own" ON metas
  FOR SELECT USING ((loja_id = get_user_loja_id()) OR (funcionario_id = (SELECT id FROM funcionarios WHERE user_id = auth.uid())));

CREATE POLICY "Users can insert metas" ON metas
  FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Users can update metas" ON metas
  FOR UPDATE USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

-- Tabela: comissoes
-- ALTER TABLE comissoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all comissoes" ON comissoes
  FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Users can view their own comissoes" ON comissoes
  FOR SELECT USING (funcionario_id = (SELECT id FROM funcionarios WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert comissoes" ON comissoes
  FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Users can update comissoes" ON comissoes
  FOR UPDATE USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

-- Tabela: fotos_produto
-- ALTER TABLE fotos_produto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view fotos_produto" ON fotos_produto
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage fotos_produto" ON fotos_produto
  FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

-- Tabela: chat_mensagens
-- ALTER TABLE chat_mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all chat_mensagens" ON chat_mensagens
  FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "Users can view their own chat_mensagens or from their store" ON chat_mensagens
  FOR SELECT USING ((remetente_id = auth.uid()) OR (destinatario_id = auth.uid()) OR (loja_id = get_user_loja_id()));

CREATE POLICY "Users can insert chat_mensagens" ON chat_mensagens
  FOR INSERT WITH CHECK ((remetente_id = auth.uid()) OR (loja_id = get_user_loja_id()));

CREATE POLICY "Users can update their own chat_mensagens" ON chat_mensagens
  FOR UPDATE USING (remetente_id = auth.uid()) WITH CHECK (remetente_id = auth.uid());


