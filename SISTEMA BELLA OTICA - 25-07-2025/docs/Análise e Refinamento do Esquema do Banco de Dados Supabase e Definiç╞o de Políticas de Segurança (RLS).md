# Análise e Refinamento do Esquema do Banco de Dados Supabase e Definição de Políticas de Segurança (RLS)

## 1. Análise do Esquema Atual

O esquema fornecido (`bella_otica_atualizado_bancodedados.sql`) apresenta uma boa base para o sistema, com tabelas essenciais para `lojas`, `funcionarios`, `clientes`, `ordens_servico`, `produtos`, `estoque_lojas`, entre outras. No entanto, para atender aos requisitos de controle de acesso granular (RLS) e à arquitetura multi-loja, algumas modificações e adições são necessárias.

### Pontos Fortes do Esquema Atual:
- **Estrutura Multi-loja**: A presença de `loja_id` em `ordens_servico` e `estoque_lojas` é um bom começo para a segregação de dados por loja.
- **Relacionamentos**: As chaves estrangeiras estão bem definidas, garantindo a integridade referencial.
- **UUIDs**: O uso de UUIDs como chaves primárias é uma prática moderna e escalável.

### Pontos a Refinar/Adicionar:
- **Tabela `funcionarios`**: Atualmente, ela contém `email` e `senha`. No contexto do Supabase, a autenticação é gerenciada pela tabela `auth.users` (interna do Supabase). A tabela `funcionarios` deve ser vista como um perfil de usuário, vinculado ao `auth.users.id`, e deve conter informações adicionais como a `loja_id` e o `role` (papel/permissão) do funcionário.
- **Controle de Acesso por Usuário/Loja**: A necessidade de usuários verem apenas o que criaram e na loja em que criaram exige que as tabelas de dados transacionais (e.g., `clientes`, `ordens_servico`) registrem o `user_id` do criador.
- **Permissões de Estoque**: A regra de que 


todas os usuarios podem ver o que tem disponivel na outra loja e solicitar transferencia do item` requer políticas RLS que permitam leitura global na tabela `estoque_lojas`, mas com restrições para modificação.
- **Tabela `caixa`**: Não existe uma tabela `caixa` explícita no esquema. Será necessário criá-la para registrar entradas e saídas, e vincular as transações a `loja_id` e `user_id` para controle de permissões.
- **Metas e Comissões**: Não há tabelas para `metas` e `comissoes`. Será necessário criá-las, possivelmente vinculadas a `funcionarios` e `lojas`.
- **Vitrine Virtual**: A tabela `produtos` tem um campo `foto`, mas para uma vitrine virtual, pode ser necessário uma tabela `fotos_produto` separada para múltiplas imagens e metadados.
- **Notas Fiscais**: A descrição menciona `Notas fiscais (entrada, saída e NF de devolução ou remessa em garantia)`. A tabela `ordens_servico` não parece cobrir isso completamente. Uma tabela `notas_fiscais` separada, com `tipo_nf` e relacionamentos com `ordens_servico` ou `produtos`, seria mais adequada.
- **Chat Interno**: Requer uma tabela `mensagens_chat` com `remetente_id`, `destinatario_id` ou `canal_id`.
- **Offline-first**: A estratégia offline-first exigirá a implementação de `triggers` e `functions` no Supabase para lidar com a sincronização de dados e resolução de conflitos.

## 2. Refinamento do Esquema do Banco de Dados

Com base na análise, proponho as seguintes modificações e adições ao esquema:

### Modificações em Tabelas Existentes:

#### `lojas`
- Manter a estrutura atual.

#### `funcionarios`
- Adicionar `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE` para vincular ao sistema de autenticação do Supabase.
- Adicionar `loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE` para indicar a loja principal do funcionário.
- Adicionar `role TEXT NOT NULL DEFAULT 'user'` para definir o nível de permissão (`'admin'`, `'user'`).
- Remover `senha` da tabela, pois a autenticação será gerenciada pelo Supabase.

```sql
ALTER TABLE funcionarios
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE,
ADD COLUMN role TEXT NOT NULL DEFAULT 'user';

ALTER TABLE funcionarios
DROP COLUMN senha;
```

#### `clientes`
- Adicionar `criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL` para rastrear quem criou o cliente.
- Adicionar `loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE` para vincular o cliente a uma loja específica.

```sql
ALTER TABLE clientes
ADD COLUMN criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE;
```

#### `ordens_servico`
- Adicionar `criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL` para rastrear quem criou a OS.
- Adicionar `status TEXT NOT NULL DEFAULT 'aberta'` para controlar o fluxo da OS.

```sql
ALTER TABLE ordens_servico
ADD COLUMN criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN status TEXT NOT NULL DEFAULT 'aberta';
```

#### `produtos`
- Manter a estrutura atual, mas considerar uma tabela separada para fotos se houver muitas por produto.

#### `estoque_lojas`
- Manter a estrutura atual.

#### `pagamentos`
- Adicionar `criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL`.
- Adicionar `loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE`.

```sql
ALTER TABLE pagamentos
ADD COLUMN criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE;
```

### Novas Tabelas Propostas:

#### `notas_fiscais`
Para gerenciar as diferentes naturezas das notas fiscais.

```sql
CREATE TABLE notas_fiscais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_nf TEXT UNIQUE NOT NULL,
    tipo_nf TEXT NOT NULL, -- 'entrada', 'saida', 'devolucao', 'remessa_garantia'
    data_emissao DATE NOT NULL,
    loja_id UUID NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    ordem_servico_id UUID REFERENCES ordens_servico(id) ON DELETE SET NULL,
    valor_total NUMERIC NOT NULL,
    criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    xml_url TEXT, -- URL para o XML da NF
    pdf_url TEXT, -- URL para o PDF da NF
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

#### `itens_nota_fiscal`
Para detalhar os produtos em cada nota fiscal.

```sql
CREATE TABLE itens_nota_fiscal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nota_fiscal_id UUID NOT NULL REFERENCES notas_fiscais(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    quantidade INT NOT NULL,
    valor_unitario NUMERIC NOT NULL,
    valor_total NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

#### `caixa`
Para controle de entradas e saídas por loja.

```sql
CREATE TABLE caixa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    tipo_movimento TEXT NOT NULL, -- 'entrada', 'saida'
    descricao TEXT,
    valor NUMERIC NOT NULL,
    criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

#### `metas`
Para controle de metas por funcionário e/ou loja.

```sql
CREATE TABLE metas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE,
    funcionario_id UUID REFERENCES funcionarios(id) ON DELETE CASCADE,
    mes DATE NOT NULL, -- Mês de referência da meta
    tipo_meta TEXT NOT NULL, -- 'vendas', 'os', 'armacoes', 'lentes'
    valor_meta NUMERIC NOT NULL,
    valor_atingido NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(loja_id, funcionario_id, mes, tipo_meta) -- Garante meta única por período/tipo
);
```

#### `comissoes`
Para registro e cálculo de comissões.

```sql
CREATE TABLE comissoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    funcionario_id UUID NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    ordem_servico_id UUID REFERENCES ordens_servico(id) ON DELETE SET NULL,
    produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL, -- Para comissão por produto
    tipo_comissao TEXT NOT NULL, -- 'armacao', 'lente', 'venda_geral'
    percentual NUMERIC NOT NULL,
    valor_comissao NUMERIC NOT NULL,
    data_comissao DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

#### `fotos_produto`
Para vitrine virtual com múltiplas fotos por produto.

```sql
CREATE TABLE fotos_produto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    ordem INT DEFAULT 0, -- Ordem de exibição
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

#### `chat_mensagens`
Para o chat interno.

```sql
CREATE TABLE chat_mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    remetente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    destinatario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Para chat privado
    loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE, -- Para chat de grupo por loja
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

## 3. Definição de Políticas de Segurança (Row Level Security - RLS)

As políticas RLS no Supabase são cruciais para implementar o controle de acesso granular. Elas devem ser ativadas para cada tabela e as políticas definidas para `SELECT`, `INSERT`, `UPDATE` e `DELETE`.

### Funções Auxiliares (no Supabase)

Para simplificar as políticas RLS, podemos criar funções no Supabase que retornam o `role` e a `loja_id` do usuário autenticado.

```sql
-- Função para obter o role do usuário logado
CREATE OR REPLACE FUNCTION get_user_role() RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS $$
  DECLARE
    user_role text;
  BEGIN
    SELECT role FROM public.funcionarios WHERE user_id = auth.uid() INTO user_role;
    RETURN user_role;
  END;
$$;

-- Função para obter a loja_id do usuário logado
CREATE OR REPLACE FUNCTION get_user_loja_id() RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
  DECLARE
    user_loja_id uuid;
  BEGIN
    SELECT loja_id FROM public.funcionarios WHERE user_id = auth.uid() INTO user_loja_id;
    RETURN user_loja_id;
  END;
$$;
```

### Políticas RLS por Tabela:

#### `lojas`
- **Enable RLS**: ON
- **SELECT**: `(get_user_role() = 'admin') OR (id = get_user_loja_id())` (Admins veem todas, Users veem a sua)
- **INSERT**: `get_user_role() = 'admin'`
- **UPDATE**: `get_user_role() = 'admin'`
- **DELETE**: `get_user_role() = 'admin'`

#### `funcionarios`
- **Enable RLS**: ON
- **SELECT**: `(get_user_role() = 'admin') OR (loja_id = get_user_loja_id()) OR (user_id = auth.uid())` (Admins veem todos, Users veem da sua loja e o próprio perfil)
- **INSERT**: `get_user_role() = 'admin'`
- **UPDATE**: `(get_user_role() = 'admin') OR (user_id = auth.uid())` (Admins podem editar todos, Users podem editar o próprio perfil)
- **DELETE**: `get_user_role() = 'admin'`

#### `clientes`
- **Enable RLS**: ON
- **SELECT**: `(get_user_role() = 'admin') OR (loja_id = get_user_loja_id()) OR (criado_por = auth.uid())` (Admins veem todos, Users veem da sua loja e os que ele criou)
- **INSERT**: `(get_user_role() = 'admin') OR (get_user_role() = 'user')` (Todos podem criar, mas a política de `loja_id` e `criado_por` será aplicada automaticamente via `DEFAULT` ou `BEFORE INSERT` trigger)
- **UPDATE**: `(get_user_role() = 'admin') OR (loja_id = get_user_loja_id())` (Admins podem editar todos, Users podem editar da sua loja)
- **DELETE**: `get_user_role() = 'admin'`

#### `ordens_servico`
- **Enable RLS**: ON
- **SELECT**: `(get_user_role() = 'admin') OR (loja_id = get_user_loja_id()) OR (criado_por = auth.uid())` (Admins veem todas, Users veem da sua loja e as que ele criou)
- **INSERT**: `(get_user_role() = 'admin') OR (get_user_role() = 'user')`
- **UPDATE**: `(get_user_role() = 'admin') OR (loja_id = get_user_loja_id())`
- **DELETE**: `get_user_role() = 'admin'`

#### `receitas` e `armacao_lente`
- **Enable RLS**: ON
- **SELECT**: `(get_user_role() = 'admin') OR (EXISTS (SELECT 1 FROM ordens_servico WHERE id = ordem_servico_id AND (loja_id = get_user_loja_id() OR criado_por = auth.uid())))` (Permite acesso se a OS associada for da loja do usuário ou criada por ele)
- **INSERT**: `(get_user_role() = 'admin') OR (EXISTS (SELECT 1 FROM ordens_servico WHERE id = ordem_servico_id AND (loja_id = get_user_loja_id() OR criado_por = auth.uid())))`
- **UPDATE**: `(get_user_role() = 'admin') OR (EXISTS (SELECT 1 FROM ordens_servico WHERE id = ordem_servico_id AND (loja_id = get_user_loja_id())))`
- **DELETE**: `get_user_role() = 'admin'`

#### `pagamentos`
- **Enable RLS**: ON
- **SELECT**: `(get_user_role() = 'admin') OR (loja_id = get_user_loja_id())` (Admins veem todos, Users veem da sua loja)
- **INSERT**: `(get_user_role() = 'admin') OR (get_user_role() = 'user')`
- **UPDATE**: `(get_user_role() = 'admin') OR (loja_id = get_user_loja_id())`
- **DELETE**: `get_user_role() = 'admin'`

#### `produtos`
- **Enable RLS**: ON
- **SELECT**: `TRUE` (Todos podem ver todos os produtos)
- **INSERT**: `get_user_role() = 'admin'`
- **UPDATE**: `get_user_role() = 'admin'`
- **DELETE**: `get_user_role() = 'admin'`

#### `estoque_lojas`
- **Enable RLS**: ON
- **SELECT**: `TRUE` (Todos podem ver o estoque de todas as lojas)
- **INSERT**: `get_user_role() = 'admin'`
- **UPDATE**: `(get_user_role() = 'admin') OR (loja_id = get_user_loja_id())` (Admins podem editar todos, Users podem editar o estoque da sua loja)
- **DELETE**: `get_user_role() = 'admin'`

#### `registro_ponto`
- **Enable RLS**: ON
- **SELECT**: `(get_user_role() = 'admin') OR (funcionario_id = (SELECT id FROM funcionarios WHERE user_id = auth.uid()))` (Admins veem todos, Funcionários veem o próprio registro)
- **INSERT**: `(get_user_role() = 'admin') OR (funcionario_id = (SELECT id FROM funcionarios WHERE user_id = auth.uid()))`
- **UPDATE**: `(get_user_role() = 'admin') OR (funcionario_id = (SELECT id FROM funcionarios WHERE user_id = auth.uid()))`
- **DELETE**: `get_user_role() = 'admin'`

#### `notas_fiscais`
- **Enable RLS**: ON
- **SELECT**: `(get_user_role() = 'admin') OR (loja_id = get_user_loja_id())` (Admins veem todas, Users veem da sua loja)
- **INSERT**: `(get_user_role() = 'admin') OR (get_user_role() = 'user')`
- **UPDATE**: `(get_user_role() = 'admin') OR (loja_id = get_user_loja_id())`
- **DELETE**: `get_user_role() = 'admin'`

#### `itens_nota_fiscal`
- **Enable RLS**: ON
- **SELECT**: `(get_user_role() = 'admin') OR (EXISTS (SELECT 1 FROM notas_fiscais WHERE id = nota_fiscal_id AND loja_id = get_user_loja_id()))`
- **INSERT**: `(get_user_role() = 'admin') OR (EXISTS (SELECT 1 FROM notas_fiscais WHERE id = nota_fiscal_id AND loja_id = get_user_loja_id()))`
- **UPDATE**: `(get_user_role() = 'admin') OR (EXISTS (SELECT 1 FROM notas_fiscais WHERE id = nota_fiscal_id AND loja_id = get_user_loja_id()))`
- **DELETE**: `get_user_role() = 'admin'`

#### `caixa`
- **Enable RLS**: ON
- **SELECT**: `(get_user_role() = 'admin') OR (loja_id = get_user_loja_id())` (Admins veem todos, Users veem da sua loja)
- **INSERT**: `(get_user_role() = 'admin') OR (get_user_role() = 'user')`
- **UPDATE**: `(get_user_role() = 'admin') OR (loja_id = get_user_loja_id())`
- **DELETE**: `get_user_role() = 'admin'`

#### `metas`
- **Enable RLS**: ON
- **SELECT**: `(get_user_role() = 'admin') OR (loja_id = get_user_loja_id()) OR (funcionario_id = (SELECT id FROM funcionarios WHERE user_id = auth.uid()))`
- **INSERT**: `get_user_role() = 'admin'`
- **UPDATE**: `get_user_role() = 'admin'`
- **DELETE**: `get_user_role() = 'admin'`

#### `comissoes`
- **Enable RLS**: ON
- **SELECT**: `(get_user_role() = 'admin') OR (funcionario_id = (SELECT id FROM funcionarios WHERE user_id = auth.uid()))`
- **INSERT**: `get_user_role() = 'admin'`
- **UPDATE**: `get_user_role() = 'admin'`
- **DELETE**: `get_user_role() = 'admin'`

#### `fotos_produto`
- **Enable RLS**: ON
- **SELECT**: `TRUE` (Todos podem ver as fotos dos produtos)
- **INSERT**: `get_user_role() = 'admin'`
- **UPDATE**: `get_user_role() = 'admin'`
- **DELETE**: `get_user_role() = 'admin'`

#### `chat_mensagens`
- **Enable RLS**: ON
- **SELECT**: `(get_user_role() = 'admin') OR (remetente_id = auth.uid()) OR (destinatario_id = auth.uid()) OR (loja_id = get_user_loja_id())` (Admins veem tudo, Usuários veem suas mensagens, mensagens para eles e mensagens da sua loja)
- **INSERT**: `TRUE` (Qualquer usuário autenticado pode enviar mensagens)
- **UPDATE**: `(get_user_role() = 'admin') OR (remetente_id = auth.uid())` (Admins podem editar, Usuários podem editar suas próprias mensagens)
- **DELETE**: `get_user_role() = 'admin'`

## 4. Considerações Adicionais para o Supabase

- **Triggers e Funções**: Para garantir que `criado_por` e `loja_id` sejam preenchidos automaticamente em `INSERT`s, especialmente para usuários `USER`, será necessário criar `BEFORE INSERT` triggers que utilizem `auth.uid()` e `get_user_loja_id()`.
- **Autenticação**: O Supabase gerencia a autenticação. A tabela `funcionarios` será usada para armazenar metadados do usuário e seu `role` e `loja_id`.
- **Backup e Recuperação**: Implementar rotinas de backup regulares no Supabase.
- **Monitoramento**: Configurar monitoramento de logs e desempenho do banco de dados.

## 5. Próximos Passos no Desenvolvimento

Com o esquema do banco de dados refinado e as políticas RLS definidas, os próximos passos no desenvolvimento do sistema serão:

1. **Implementação do Esquema no Supabase**: Executar os scripts SQL para criar/modificar as tabelas e as funções auxiliares.
2. **Configuração das Políticas RLS**: Ativar RLS para as tabelas e aplicar as políticas definidas.
3. **Desenvolvimento da Arquitetura Offline-first**: Implementar a lógica de sincronização no frontend e backend.
4. **Desenvolvimento dos Módulos Principais**: Construir as interfaces e a lógica de negócio para Usuários, Lojas, Produtos, Estoque, OS, NF, Caixa.
5. **Desenvolvimento de Funcionalidades Avançadas**: Vitrine Virtual, Metas, Comissões, Relatórios, Chat Interno.
6. **Testes Abrangentes**: Testes de unidade, integração e segurança para garantir que as permissões RLS funcionem conforme o esperado.

Este plano detalhado garante que o banco de dados Supabase será a base sólida e segura para o seu sistema de gerenciamento de óticas, atendendo a todas as suas especificações de controle de acesso e funcionalidades.

