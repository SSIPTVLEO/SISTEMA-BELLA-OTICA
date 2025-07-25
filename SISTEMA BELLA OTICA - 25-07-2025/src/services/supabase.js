// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funções de autenticação
export const signInWithPassword = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getFuncionarioPerfil = async (userId) => {
  const { data, error } = await supabase
    .from('funcionarios')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

// Funções para Funcionários
export const getFuncionarios = async () => {
  const { data, error } = await supabase
    .from('funcionarios')
    .select(`
      *,
      lojas (
        nome
      )
    `)
    .order('nome')
  
  if (error) throw error
  return data
}

export const createFuncionario = async (funcionario) => {
  const { data, error } = await supabase
    .from('funcionarios')
    .insert([funcionario])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateFuncionario = async (id, updates) => {
  const { data, error } = await supabase
    .from('funcionarios')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export const deleteFuncionario = async (id) => {
  const { error } = await supabase
    .from('funcionarios')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Funções para Lojas
export const getLojas = async () => {
  const { data, error } = await supabase
    .from('lojas')
    .select('*')
    .order('nome')
  
  if (error) throw error
  return data
}

export const createLoja = async (loja) => {
  const { data, error } = await supabase
    .from('lojas')
    .insert([loja])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateLoja = async (id, updates) => {
  const { data, error } = await supabase
    .from('lojas')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export const deleteLoja = async (id) => {
  const { error } = await supabase
    .from('lojas')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Funções para Produtos
export const getProdutos = async (filters = {}) => {
  let query = supabase
    .from('produtos')
    .select(`
      *,
      categorias_produtos (
        nome
      ),
      fotos_produto (
        url_foto,
        principal
      )
    `)
  
  if (filters.categoria) {
    query = query.eq('categoria_id', filters.categoria)
  }
  
  if (filters.search) {
    query = query.or(`nome.ilike.%${filters.search}%,codigo.ilike.%${filters.search}%,marca.ilike.%${filters.search}%`)
  }
  
  if (filters.ativo !== undefined) {
    query = query.eq('ativo', filters.ativo)
  }
  
  query = query.order('nome')
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export const createProduto = async (produto) => {
  const { data, error } = await supabase
    .from('produtos')
    .insert([produto])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateProduto = async (id, updates) => {
  const { data, error } = await supabase
    .from('produtos')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export const deleteProduto = async (id) => {
  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

export const uploadProdutoImage = async (file, productId) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${productId}/${Math.random()}.${fileExt}`
  const filePath = `produtos/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('fotos_produtos')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  const { data: publicUrlData } = supabase.storage
    .from('fotos_produtos')
    .getPublicUrl(filePath)

  if (!publicUrlData) throw new Error('Não foi possível obter a URL pública da imagem.')

  const { error: insertError } = await supabase
    .from('fotos_produto')
    .insert({
      produto_id: productId,
      url_foto: publicUrlData.publicUrl,
      principal: true // Ou defina a lógica para principal
    })

  if (insertError) throw insertError

  return publicUrlData.publicUrl
}

// Funções para Categorias
export const getCategorias = async () => {
  const { data, error } = await supabase
    .from('categorias_produtos')
    .select('*')
    .eq('ativo', true)
    .order('nome')
  
  if (error) throw error
  return data
}

// Funções para Estoque
export const getEstoque = async (filters = {}) => {
  let query = supabase
    .from('estoque')
    .select(`
      *,
      produtos (
        codigo,
        nome,
        marca,
        modelo
      ),
      lojas (
        nome
      )
    `)
  
  if (filters.loja_id) {
    query = query.eq('loja_id', filters.loja_id)
  }
  
  if (filters.produto_id) {
    query = query.eq('produto_id', filters.produto_id)
  }
  
  query = query.order('updated_at', { ascending: false })
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export const createMovimentacaoEstoque = async (movimentacao) => {
  const { data, error } = await supabase
    .from('movimentacoes_estoque')
    .insert([movimentacao])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateMovimentacaoEstoque = async (id, updates) => {
  const { data, error } = await supabase
    .from('movimentacoes_estoque')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export const deleteMovimentacaoEstoque = async (id) => {
  const { error } = await supabase
    .from('movimentacoes_estoque')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

export const updateEstoque = async (produto_id, loja_id, quantidade) => {
  const { data, error } = await supabase
    .from('estoque')
    .upsert({
      produto_id,
      loja_id,
      quantidade,
      updated_at: new Date().toISOString()
    })
    .select()
  
  if (error) throw error
  return data[0]
}

// Funções para Clientes
export const getClientes = async (filters = {}) => {
  let query = supabase
    .from('clientes')
    .select(`
      *,
      lojas (
        nome
      )
    `)
  
  if (filters.search) {
    query = query.or(`nome.ilike.%${filters.search}%,cpf.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }
  
  if (filters.loja_id) {
    query = query.eq('loja_cadastro_id', filters.loja_id)
  }
  
  query = query.order('nome')
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export const createCliente = async (cliente) => {
  const { data, error } = await supabase
    .from('clientes')
    .insert([cliente])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateCliente = async (id, updates) => {
  const { data, error } = await supabase
    .from('clientes')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export const deleteCliente = async (id) => {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Funções para Ordens de Serviço
export const getOrdensServico = async (filters = {}) => {
  let query = supabase
    .from('ordens_servico')
    .select(`
      *,
      clientes (
        nome,
        telefone
      ),
      lojas (
        nome
      ),
      funcionarios (
        nome
      )
    `)
  
  if (filters.loja_id) {
    query = query.eq('loja_id', filters.loja_id)
  }
  
  if (filters.funcionario_id) {
    query = query.eq('funcionario_id', filters.funcionario_id)
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  
  query = query.order('created_at', { ascending: false })
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export const createOrdemServico = async (ordem) => {
  const { data, error } = await supabase
    .from('ordens_servico')
    .insert([ordem])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateOrdemServico = async (id, updates) => {
  const { data, error } = await supabase
    .from('ordens_servico')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export const deleteOrdemServico = async (id) => {
  const { error } = await supabase
    .from('ordens_servico')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Funções para Caixa
export const getMovimentacoesCaixa = async (filters = {}) => {
  let query = supabase
    .from('caixa')
    .select(`
      *,
      lojas (
        nome
      ),
      funcionarios (
        nome
      )
    `)
  
  if (filters.loja_id) {
    query = query.eq('loja_id', filters.loja_id)
  }
  
  if (filters.tipo) {
    query = query.eq('tipo', filters.tipo)
  }
  
  if (filters.data_inicio && filters.data_fim) {
    query = query.gte('data_movimento', filters.data_inicio)
                 .lte('data_movimento', filters.data_fim)
  }
  
  query = query.order('created_at', { ascending: false })
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export const createMovimentacaoCaixa = async (movimentacao) => {
  const { data, error } = await supabase
    .from('caixa')
    .insert([movimentacao])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateMovimentacaoCaixa = async (id, updates) => {
  const { data, error } = await supabase
    .from('caixa')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export const deleteMovimentacaoCaixa = async (id) => {
  const { error } = await supabase
    .from('caixa')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Funções para Metas
export const getMetas = async (filters = {}) => {
  let query = supabase
    .from('metas')
    .select(`
      *,
      funcionarios (
        nome
      ),
      lojas (
        nome
      )
    `)
  
  if (filters.funcionario_id) {
    query = query.eq('funcionario_id', filters.funcionario_id)
  }
  
  if (filters.loja_id) {
    query = query.eq('loja_id', filters.loja_id)
  }
  
  if (filters.periodo) {
    query = query.eq('periodo', filters.periodo)
  }
  
  query = query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const createMeta = async (meta) => {
  const { data, error } = await supabase
    .from('metas')
    .insert([meta])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateMeta = async (id, updates) => {
  const { data, error } = await supabase
    .from('metas')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export const deleteMeta = async (id) => {
  const { error } = await supabase
    .from('metas')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Funções para Vitrine Virtual
export const getVitrineVirtual = async (filters = {}) => {
  let query = supabase
    .from('vitrine_virtual')
    .select(`
      *,
      produtos (
        codigo,
        nome,
        marca,
        modelo,
        preco_venda,
        descricao,
        categorias_produtos (
          nome
        ),
        fotos_produto (
          url_foto,
          principal
        )
      ),
      lojas (
        nome
      )
    `)
  
  if (filters.loja_id) {
    query = query.eq('loja_id', filters.loja_id)
  }
  
  if (filters.ativo !== undefined) {
    query = query.eq('ativo', filters.ativo)
  }
  
  query = query.order('ordem')
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export const addToVitrine = async (produto_id, loja_id) => {
  const { data, error } = await supabase
    .from('vitrine_virtual')
    .insert([{
      produto_id,
      loja_id,
      ativo: true,
      qr_code: `https://qr-code-url/${produto_id}`,
      ordem: 0
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateVitrine = async (id, updates) => {
  const { data, error } = await supabase
    .from('vitrine_virtual')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export const deleteVitrine = async (id) => {
  const { error } = await supabase
    .from('vitrine_virtual')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Funções para Chat
export const getConversas = async (filters = {}) => {
  let query = supabase
    .from('conversas')
    .select(`
      *,
      participantes_conversas (
        funcionario_id
      )
    `)
  
  if (filters.funcionario_id) {
    query = query.contains('participantes', [filters.funcionario_id])
  }
  
  query = query.order('ultima_atividade', { ascending: false })
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export const getMensagens = async (conversa_id) => {
  const { data, error } = await supabase
    .from('mensagens')
    .select('*')
    .eq('conversa_id', conversa_id)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

export const createMensagem = async (mensagem) => {
  const { data, error } = await supabase
    .from('mensagens')
    .insert([mensagem])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateConversa = async (id, updates) => {
  const { data, error } = await supabase
    .from('conversas')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export const deleteConversa = async (id) => {
  const { error } = await supabase
    .from('conversas')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Funções para Notas Fiscais
export const getNotasFiscais = async (filters = {}) => {
  let query = supabase
    .from('notas_fiscais')
    .select(`
      *,
      lojas (
        nome
      ),
      clientes (
        nome
      )
    `)
  
  if (filters.loja_id) {
    query = query.eq('loja_id', filters.loja_id)
  }
  
  if (filters.tipo) {
    query = query.eq('tipo', filters.tipo)
  }
  
  if (filters.search) {
    query = query.or(`numero.ilike.%${filters.search}%,cliente_nome.ilike.%${filters.search}%`)
  }
  
  query = query.order('data_emissao', { ascending: false })
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export const createNotaFiscal = async (nf) => {
  const { data, error } = await supabase
    .from('notas_fiscais')
    .insert([nf])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateNotaFiscal = async (id, updates) => {
  const { data, error } = await supabase
    .from('notas_fiscais')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export const deleteNotaFiscal = async (id) => {
  const { error } = await supabase
    .from('notas_fiscais')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Funções para Dashboard
export const getDashboardStats = async (loja_id = null) => {
  try {
    // Estatísticas de OS
    let osQuery = supabase
      .from('ordens_servico')
      .select('id, status, valor_total')
    
    if (loja_id) {
      osQuery = osQuery.eq('loja_id', loja_id)
    }
    
    const { data: ordensServico } = await osQuery
    
    // Estatísticas de vendas do dia
    const hoje = new Date().toISOString().split('T')[0]
    let vendasQuery = supabase
      .from('caixa')
      .select('valor')
      .eq('tipo', 'entrada')
      .eq('data_movimento', hoje)
    
    if (loja_id) {
      vendasQuery = vendasQuery.eq('loja_id', loja_id)
    }
    
    const { data: vendas } = await vendasQuery
    
    // Estatísticas de estoque
    let estoqueQuery = supabase
      .from('estoque')
      .select('quantidade, quantidade_minima')
    
    if (loja_id) {
      estoqueQuery = estoqueQuery.eq('loja_id', loja_id)
    }
    
    const { data: estoque } = await estoqueQuery
    
    // Estatísticas de clientes
    let clientesQuery = supabase
      .from('clientes')
      .select('id')
      .eq('ativo', true)
    
    if (loja_id) {
      clientesQuery = clientesQuery.eq('loja_cadastro_id', loja_id)
    }
    
    const { data: clientes } = await clientesQuery
    
    return {
      ordensServico: {
        total: ordensServico?.length || 0,
        abertas: ordensServico?.filter(os => os.status === 'aberta').length || 0
      },
      vendas: {
        total: vendas?.reduce((acc, v) => acc + (v.valor || 0), 0) || 0,
        quantidade: vendas?.length || 0
      },
      estoque: {
        total: estoque?.reduce((acc, e) => acc + (e.quantidade || 0), 0) || 0,
        baixo: estoque?.filter(e => e.quantidade <= e.quantidade_minima).length || 0
      },
      clientes: {
        total: clientes?.length || 0,
        novos: 5 // Placeholder - implementar lógica de clientes novos
      }
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error)
    return {
      ordensServico: { total: 0, abertas: 0 },
      vendas: { total: 0, quantidade: 0 },
      estoque: { total: 0, baixo: 0 },
      clientes: { total: 0, novos: 0 }
    }
  }
}

// Funções para Relatórios (apenas placeholders, a lógica real estaria em Edge Functions ou no backend)
export const generateRelatorioVendas = async (params) => {
  console.log('Gerando Relatório de Vendas com params:', params)
  return { message: 'Relatório de Vendas gerado com sucesso', data: [] }
}

export const generateRelatorioEstoque = async (params) => {
  console.log('Gerando Relatório de Estoque com params:', params)
  return { message: 'Relatório de Estoque gerado com sucesso', data: [] }
}

export const generateRelatorioFinanceiro = async (params) => {
  console.log('Gerando Relatório Financeiro com params:', params)
  return { message: 'Relatório Financeiro gerado com sucesso', data: [] }
}

export const generateRelatorioProdutos = async (params) => {
  console.log('Gerando Relatório de Produtos com params:', params)
  return { message: 'Relatório de Produtos gerado com sucesso', data: [] }
}

export const generateRelatorioFuncionarios = async (params) => {
  console.log('Gerando Relatório de Funcionários com params:', params)
  return { message: 'Relatório de Funcionários gerado com sucesso', data: [] }
}

export const generateRelatorioClientes = async (params) => {
  console.log('Gerando Relatório de Clientes com params:', params)
  return { message: 'Relatório de Clientes gerado com sucesso', data: [] }
}


