# Sistema Bella Ótica - Documentação Completa

## Índice

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Arquitetura e Tecnologias](#arquitetura-e-tecnologias)
3. [Funcionalidades Principais](#funcionalidades-principais)
4. [Manual de Instalação](#manual-de-instalação)
5. [Manual do Usuário](#manual-do-usuário)
6. [Manual do Administrador](#manual-do-administrador)
7. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
8. [Políticas de Segurança](#políticas-de-segurança)
9. [Funcionalidade Offline](#funcionalidade-offline)
10. [Manutenção e Suporte](#manutenção-e-suporte)

---

## Visão Geral do Sistema

O Sistema Bella Ótica é uma solução completa de gerenciamento para redes de óticas, desenvolvido especificamente para atender às necessidades de 5 lojas com CNPJs distintos, mas operação integrada. O sistema oferece controle total sobre vendas, estoque, funcionários, clientes, ordens de serviço, notas fiscais, metas, comissões e muito mais.

### Características Principais

- **Multi-loja**: Gerenciamento centralizado de 5 lojas com dados integrados
- **Controle de Acesso**: Perfis diferenciados (Administrador e Usuário) com permissões específicas
- **Funcionalidade Offline**: Operação contínua mesmo sem conexão com a internet
- **Vitrine Virtual**: Exposição de produtos com QR codes para acesso público
- **Sistema de Metas**: Controle de metas individuais e por loja com cálculo automático de comissões
- **Chat Interno**: Comunicação em tempo real entre funcionários
- **Relatórios Avançados**: Geração de relatórios detalhados em múltiplos formatos

### Benefícios

- Centralização de informações de todas as lojas
- Controle rigoroso de permissões por usuário
- Operação ininterrupta com sincronização automática
- Aumento da produtividade com ferramentas integradas
- Transparência nas metas e comissões
- Facilidade na gestão de estoque entre lojas

---

## Arquitetura e Tecnologias

### Stack Tecnológica

**Frontend:**
- React 18 com TypeScript
- Tailwind CSS para estilização
- Lucide React para ícones
- React Router para navegação
- Dexie.js para banco de dados local (offline)

**Backend:**
- Supabase (Backend-as-a-Service)
- PostgreSQL como banco de dados
- Row Level Security (RLS) para controle de acesso
- Edge Functions para lógicas específicas

**Infraestrutura:**
- Hospedagem na plataforma Manus
- CDN para otimização de performance
- SSL/TLS para segurança

### Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   Banco Local   │
│   (React)       │◄──►│   (Backend)     │    │   (IndexedDB)   │
│                 │    │                 │    │                 │
│ - Interface     │    │ - Autenticação  │    │ - Cache Offline │
│ - Validações    │    │ - APIs          │    │ - Sincronização │
│ - Estado Local  │    │ - RLS           │    │ - Backup Local  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Funcionalidades Principais

### 1. Dashboard Executivo
- Visão geral das atividades do sistema
- Estatísticas em tempo real (vendas, estoque, OS, clientes)
- Atividades recentes
- Ações rápidas para funcionalidades principais
- Seção especial para administradores com dados consolidados

### 2. Gestão de Funcionários
- Cadastro completo de funcionários
- Controle de perfis (Admin/User)
- Vinculação com lojas específicas
- Controle de status (Ativo/Inativo)
- Histórico de atividades

### 3. Gestão de Lojas
- Cadastro das 5 lojas com CNPJs únicos
- Informações completas (endereço, telefone, responsável)
- Controle de status e configurações específicas

### 4. Catálogo de Produtos
- Cadastro detalhado de produtos
- Categorização (Óculos de Sol, Armações, Lentes, Acessórios)
- Controle de preços (custo, venda, margem)
- Galeria de fotos
- Códigos únicos e códigos de barras

### 5. Controle de Estoque
- Estoque por loja em tempo real
- Controle de estoque mínimo
- Transferências entre lojas
- Histórico de movimentações
- Alertas de estoque baixo

### 6. Ordens de Serviço
- Criação e gestão de OS
- Vinculação com clientes e produtos
- Controle de status (Aberta, Em Andamento, Concluída)
- Cálculo automático de valores
- Impressão de OS

### 7. Notas Fiscais
- Emissão de NF de entrada, saída, devolução e garantia
- Importação via XML ou PDF
- Vinculação com OS e clientes
- Controle fiscal completo
- Arquivo digital das notas

### 8. Controle de Caixa
- Registro de entradas e saídas
- Categorização de movimentações
- Controle por forma de pagamento
- Relatórios financeiros
- Fechamento de caixa

### 9. Vitrine Virtual
- Exposição de produtos selecionados
- Geração automática de QR codes
- Acesso público aos produtos
- Estatísticas de visualização
- Compartilhamento em redes sociais

### 10. Sistema de Metas
- Definição de metas por funcionário e loja
- Acompanhamento em tempo real
- Cálculo automático de percentuais
- Histórico de performance
- Alertas de atingimento

### 11. Cálculo de Comissões
- Comissões por tipo de produto
- Cálculo automático baseado em vendas
- Relatórios de comissões por período
- Controle de pagamentos
- Histórico detalhado

### 12. Relatórios Avançados
- Relatórios de vendas, estoque, financeiro
- Filtros avançados (período, loja, funcionário)
- Exportação em PDF, Excel e CSV
- Agendamento de relatórios
- Relatórios personalizados

### 13. Chat Interno
- Comunicação em tempo real
- Conversas individuais e em grupo
- Histórico de mensagens
- Status online/offline
- Notificações

---



## Manual de Instalação

### Pré-requisitos

- Conta no Supabase (supabase.com)
- Domínio próprio (opcional)
- Conhecimentos básicos de SQL

### Passo 1: Configuração do Supabase

1. **Criar Projeto no Supabase**
   - Acesse supabase.com e crie uma nova conta
   - Crie um novo projeto
   - Anote a URL do projeto e a chave anônima (anon key)

2. **Executar Script SQL**
   - Acesse o SQL Editor no painel do Supabase
   - Execute o arquivo `supabase_schema_final.sql` fornecido
   - Verifique se todas as tabelas foram criadas corretamente

3. **Configurar Autenticação**
   - Ative a autenticação por email/senha
   - Configure as URLs de redirecionamento
   - Defina as políticas de senha

### Passo 2: Configuração do Sistema

1. **Variáveis de Ambiente**
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

2. **Primeiro Acesso**
   - Use as credenciais padrão: admin@bellaotica.com / 123456
   - Altere a senha imediatamente após o primeiro login
   - Configure os dados das lojas

### Passo 3: Configuração Inicial

1. **Cadastro das Lojas**
   - Acesse o módulo "Lojas"
   - Cadastre as 5 lojas com seus respectivos CNPJs
   - Preencha todas as informações obrigatórias

2. **Cadastro de Funcionários**
   - Acesse o módulo "Funcionários"
   - Cadastre os funcionários de cada loja
   - Defina os perfis (Admin/User) adequadamente

3. **Configuração de Categorias**
   - As categorias padrão já estão criadas
   - Adicione novas categorias se necessário

---

## Manual do Usuário

### Acesso ao Sistema

1. **Login**
   - Acesse a URL do sistema
   - Digite seu email e senha
   - Clique em "Entrar"

2. **Navegação**
   - Use o menu lateral para navegar entre módulos
   - O dashboard mostra um resumo das atividades
   - Use a busca global no topo da tela

### Funcionalidades por Perfil

#### Usuário Comum

**Produtos:**
- Visualizar catálogo completo
- Criar novos produtos
- Editar produtos existentes
- Adicionar fotos aos produtos

**Estoque:**
- Consultar estoque de todas as lojas
- Solicitar transferências entre lojas
- Registrar entradas e saídas

**Ordens de Serviço:**
- Criar novas OS
- Visualizar apenas suas próprias OS
- Atualizar status das OS
- Imprimir OS

**Clientes:**
- Cadastrar novos clientes
- Visualizar todos os clientes
- Editar informações de clientes

**Caixa:**
- Visualizar apenas movimentações da sua loja
- Registrar entradas e saídas
- Consultar saldo atual

**Metas:**
- Visualizar suas próprias metas
- Acompanhar progresso em tempo real
- Consultar histórico de performance

**Chat:**
- Participar de conversas
- Enviar mensagens
- Visualizar histórico

#### Administrador

Todas as funcionalidades do usuário comum, mais:

**Funcionários:**
- Cadastrar novos funcionários
- Editar perfis e permissões
- Ativar/desativar funcionários

**Lojas:**
- Gerenciar informações das lojas
- Configurar parâmetros específicos

**Caixa:**
- Visualizar movimentações de todas as lojas
- Gerar relatórios consolidados

**Metas:**
- Definir metas para funcionários e lojas
- Acompanhar performance geral
- Configurar comissões

**Relatórios:**
- Gerar todos os tipos de relatórios
- Acessar dados de todas as lojas
- Exportar em múltiplos formatos

### Operações Básicas

#### Cadastro de Produto

1. Acesse "Produtos" no menu lateral
2. Clique em "Novo Produto"
3. Preencha as informações obrigatórias:
   - Código único
   - Nome do produto
   - Categoria
   - Preços (custo e venda)
4. Adicione fotos se disponível
5. Clique em "Salvar"

#### Criação de Ordem de Serviço

1. Acesse "Ordens de Serviço"
2. Clique em "Nova OS"
3. Selecione o cliente (ou cadastre novo)
4. Adicione produtos/serviços
5. Defina data de entrega
6. Salve a OS

#### Transferência de Estoque

1. Acesse "Estoque"
2. Localize o produto desejado
3. Clique em "Solicitar Transferência"
4. Selecione loja origem e destino
5. Informe quantidade e motivo
6. Aguarde aprovação

---

## Manual do Administrador

### Configurações Iniciais

#### Configuração de Lojas

1. **Dados Básicos**
   - Nome da loja
   - CNPJ (único por loja)
   - Endereço completo
   - Telefones de contato
   - Email institucional
   - Nome do responsável

2. **Configurações Específicas**
   - Horário de funcionamento
   - Configurações de caixa
   - Parâmetros de estoque mínimo

#### Gestão de Funcionários

1. **Cadastro**
   - Dados pessoais completos
   - Vinculação com loja específica
   - Definição de perfil (Admin/User)
   - Configuração de acesso

2. **Controle de Permissões**
   - Administradores: acesso total ao sistema
   - Usuários: acesso limitado à sua loja e criações próprias

#### Sistema de Metas

1. **Definição de Metas**
   - Metas individuais por funcionário
   - Metas coletivas por loja
   - Períodos mensais
   - Valores em vendas e quantidade

2. **Configuração de Comissões**
   - Percentuais por categoria de produto
   - Regras de cálculo
   - Períodos de pagamento

### Relatórios Gerenciais

#### Tipos de Relatórios Disponíveis

1. **Relatório de Vendas**
   - Vendas por período
   - Performance por funcionário
   - Análise por loja
   - Produtos mais vendidos

2. **Relatório de Estoque**
   - Posição atual por loja
   - Produtos com estoque baixo
   - Movimentações do período
   - Transferências entre lojas

3. **Relatório Financeiro**
   - Fluxo de caixa consolidado
   - Entradas e saídas por categoria
   - Comparativo entre lojas
   - Análise de margem

4. **Relatório de Funcionários**
   - Performance individual
   - Atingimento de metas
   - Comissões geradas
   - Produtividade

#### Configuração de Relatórios

1. **Filtros Disponíveis**
   - Período (predefinido ou personalizado)
   - Loja específica ou todas
   - Funcionário específico ou todos
   - Categoria de produto

2. **Formatos de Exportação**
   - PDF para apresentações
   - Excel para análises
   - CSV para importação

### Monitoramento do Sistema

#### Dashboard Administrativo

1. **Métricas Principais**
   - Total de vendas do dia
   - Ordens de serviço abertas
   - Produtos com estoque baixo
   - Clientes ativos

2. **Visão Consolidada**
   - Dados de todas as lojas
   - Comparativos de performance
   - Alertas importantes

#### Gestão de Usuários

1. **Monitoramento de Atividades**
   - Últimos logins
   - Ações realizadas
   - Performance individual

2. **Controle de Acesso**
   - Ativação/desativação de usuários
   - Alteração de permissões
   - Reset de senhas

---

## Configuração do Banco de Dados

### Estrutura das Tabelas

O sistema utiliza 19 tabelas principais organizadas da seguinte forma:

#### Tabelas Principais

1. **lojas**: Informações das 5 lojas
2. **funcionarios**: Dados dos funcionários vinculados ao auth.users
3. **categorias_produtos**: Categorias de produtos
4. **produtos**: Catálogo completo de produtos
5. **estoque**: Controle de estoque por loja
6. **clientes**: Base de clientes
7. **ordens_servico**: Ordens de serviço
8. **itens_ordem_servico**: Itens das OS
9. **notas_fiscais**: Controle fiscal
10. **itens_nota_fiscal**: Itens das NF

#### Tabelas de Controle

11. **caixa**: Movimentações financeiras
12. **transferencias_estoque**: Transferências entre lojas
13. **metas**: Sistema de metas
14. **comissoes**: Cálculo de comissões
15. **fotos_produto**: Galeria de produtos

#### Tabelas de Funcionalidades Avançadas

16. **vitrine_virtual**: Produtos na vitrine online
17. **chat_mensagens**: Sistema de chat
18. **chat_conversas**: Conversas do chat
19. **chat_participantes**: Participantes das conversas

### Relacionamentos

```sql
-- Exemplo de relacionamentos principais
funcionarios.loja_id → lojas.id
produtos.categoria_id → categorias_produtos.id
estoque.produto_id → produtos.id
estoque.loja_id → lojas.id
ordens_servico.cliente_id → clientes.id
ordens_servico.funcionario_id → funcionarios.id
```

### Índices para Performance

O sistema inclui índices otimizados para:
- Consultas por loja
- Buscas por funcionário
- Filtros por período
- Relacionamentos entre tabelas

---


## Políticas de Segurança

### Row Level Security (RLS)

O sistema implementa políticas rigorosas de segurança a nível de linha para garantir que cada usuário acesse apenas os dados permitidos.

#### Princípios de Segurança

1. **Segregação por Perfil**
   - Administradores: acesso total a todos os dados
   - Usuários: acesso limitado conforme regras específicas

2. **Segregação por Loja**
   - Usuários veem apenas dados da sua loja
   - Exceção: estoque (visível de todas as lojas para transferências)

3. **Segregação por Criação**
   - Usuários veem apenas registros que criaram
   - Exceção: dados compartilhados (produtos, clientes)

#### Políticas Implementadas

**Funcionários:**
- Todos podem visualizar lista de funcionários
- Apenas admins podem criar/editar funcionários

**Produtos:**
- Todos podem visualizar produtos
- Todos podem criar/editar produtos

**Estoque:**
- Todos podem visualizar estoque de todas as lojas
- Necessário para transferências entre lojas

**Ordens de Serviço:**
- Admins: visualizam todas as OS
- Usuários: apenas OS da sua loja
- Criação: apenas com funcionario_id = auth.uid()

**Caixa:**
- Admins: visualizam movimentações de todas as lojas
- Usuários: apenas movimentações da sua loja

**Metas:**
- Admins: visualizam todas as metas
- Usuários: apenas suas metas e da sua loja

**Chat:**
- Usuários veem apenas conversas que participam
- Podem enviar mensagens apenas em conversas ativas

### Autenticação

1. **Supabase Auth**
   - Autenticação segura via email/senha
   - Tokens JWT com expiração automática
   - Refresh tokens para sessões longas

2. **Controle de Sessão**
   - Logout automático por inatividade
   - Controle de sessões simultâneas
   - Logs de acesso

### Criptografia

1. **Dados em Trânsito**
   - HTTPS/TLS 1.3 obrigatório
   - Certificados SSL válidos
   - Headers de segurança

2. **Dados em Repouso**
   - Criptografia AES-256 no Supabase
   - Backup criptografado
   - Chaves gerenciadas automaticamente

---

## Funcionalidade Offline

### Arquitetura Offline-First

O sistema foi desenvolvido com arquitetura offline-first, garantindo operação contínua mesmo sem conexão com a internet.

#### Componentes da Arquitetura

1. **Banco Local (IndexedDB)**
   - Armazenamento local usando Dexie.js
   - Sincronização bidirecional
   - Cache inteligente

2. **Fila de Sincronização**
   - Operações pendentes armazenadas localmente
   - Sincronização automática quando online
   - Resolução de conflitos

3. **Detecção de Conectividade**
   - Monitoramento automático da conexão
   - Interface visual do status
   - Retry automático

#### Funcionalidades Offline

**Operações Suportadas:**
- Consulta de produtos e estoque
- Criação de ordens de serviço
- Cadastro de clientes
- Registro de vendas
- Movimentações de caixa

**Limitações Offline:**
- Chat em tempo real
- Relatórios consolidados
- Transferências entre lojas
- Sincronização de metas

#### Sincronização

1. **Estratégia de Conflitos**
   - Last Write Wins (último a escrever vence)
   - Timestamp para ordenação
   - Logs de conflitos para auditoria

2. **Processo de Sincronização**
   ```javascript
   // Exemplo do processo
   1. Detectar conexão online
   2. Enviar dados locais para servidor
   3. Baixar atualizações do servidor
   4. Resolver conflitos se necessário
   5. Atualizar interface do usuário
   ```

3. **Indicadores Visuais**
   - Status de conexão no header
   - Indicador de sincronização em progresso
   - Timestamp da última sincronização

---

## Manutenção e Suporte

### Monitoramento do Sistema

#### Métricas Importantes

1. **Performance**
   - Tempo de resposta das páginas
   - Velocidade de sincronização
   - Uso de memória local

2. **Uso**
   - Número de usuários ativos
   - Operações por minuto
   - Dados sincronizados

3. **Erros**
   - Falhas de sincronização
   - Erros de autenticação
   - Problemas de conectividade

#### Logs do Sistema

1. **Logs de Aplicação**
   - Ações dos usuários
   - Operações de sincronização
   - Erros e exceções

2. **Logs de Segurança**
   - Tentativas de login
   - Alterações de permissões
   - Acessos não autorizados

### Backup e Recuperação

#### Estratégia de Backup

1. **Backup Automático**
   - Backup diário do Supabase
   - Retenção de 30 dias
   - Backup incremental

2. **Backup Local**
   - Dados offline em IndexedDB
   - Exportação manual disponível
   - Recuperação de dados locais

#### Procedimentos de Recuperação

1. **Recuperação de Dados**
   - Restore do backup do Supabase
   - Sincronização forçada
   - Validação de integridade

2. **Recuperação de Sistema**
   - Redeployment da aplicação
   - Configuração de variáveis
   - Teste de funcionalidades

### Atualizações do Sistema

#### Processo de Atualização

1. **Ambiente de Teste**
   - Deploy em ambiente de staging
   - Testes automatizados
   - Validação manual

2. **Deploy em Produção**
   - Backup antes da atualização
   - Deploy com zero downtime
   - Monitoramento pós-deploy

#### Versionamento

- Versionamento semântico (x.y.z)
- Changelog detalhado
- Compatibilidade com versões anteriores

### Suporte Técnico

#### Canais de Suporte

1. **Documentação**
   - Manual completo do usuário
   - FAQ com problemas comuns
   - Tutoriais em vídeo

2. **Suporte Direto**
   - Email de suporte técnico
   - Chat online durante horário comercial
   - Suporte remoto quando necessário

#### Problemas Comuns

1. **Problemas de Login**
   - Verificar credenciais
   - Reset de senha
   - Verificar status do usuário

2. **Problemas de Sincronização**
   - Verificar conectividade
   - Limpar cache local
   - Forçar sincronização

3. **Performance Lenta**
   - Verificar conexão de internet
   - Limpar dados locais antigos
   - Atualizar navegador

---

## Informações Técnicas Adicionais

### URLs do Sistema

- **Sistema Principal**: https://qwhrneqq.manus.space
- **Credenciais de Teste**: admin@bellaotica.com / 123456

### Arquivos Importantes

1. **supabase_schema_final.sql**: Esquema completo do banco de dados
2. **offline_architecture.md**: Documentação da arquitetura offline
3. **programming_model_recommendation.md**: Recomendações técnicas

### Requisitos do Sistema

**Navegadores Suportados:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Dispositivos:**
- Desktop (Windows, macOS, Linux)
- Tablets (iOS, Android)
- Smartphones (iOS, Android)

### Contato e Suporte

Para suporte técnico ou dúvidas sobre o sistema:
- Email: suporte@bellaotica.com
- Telefone: (11) 1234-5678
- Horário: Segunda a Sexta, 8h às 18h

---

*Documentação gerada automaticamente pelo Sistema Bella Ótica v1.0*
*Última atualização: 14 de junho de 2025*

