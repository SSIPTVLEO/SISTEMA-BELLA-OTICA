// src/hooks/useSupabaseData.js
import { useState, useEffect } from 'react'
import { 
  getFuncionarios, 
  getLojas, 
  getProdutos, 
  getEstoque, 
  getClientes, 
  getOrdensServico, 
  getMovimentacoesCaixa,
  getMetas,
  getVitrineVirtual,
  getDashboardStats,
  getCategorias,
  getNotasFiscais,
  getConversas,
  getMensagens
} from '../lib/supabase'

// Hook para funcionários
export const useFuncionarios = () => {
  const [funcionarios, setFuncionarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFuncionarios = async () => {
    try {
      setLoading(true)
      const data = await getFuncionarios()
      setFuncionarios(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao buscar funcionários:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFuncionarios()
  }, [])

  return { funcionarios, loading, error, refetch: fetchFuncionarios }
}

// Hook para lojas
export const useLojas = () => {
  const [lojas, setLojas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLojas = async () => {
    try {
      setLoading(true)
      const data = await getLojas()
      setLojas(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao buscar lojas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLojas()
  }, [])

  return { lojas, loading, error, refetch: fetchLojas }
}

// Hook para produtos
export const useProdutos = (filters = {}) => {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProdutos = async () => {
    try {
      setLoading(true)
      const data = await getProdutos(filters)
      setProdutos(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao buscar produtos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProdutos()
  }, [JSON.stringify(filters)])

  return { produtos, loading, error, refetch: fetchProdutos }
}

// Hook para categorias
export const useCategorias = () => {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategorias = async () => {
    try {
      setLoading(true)
      const data = await getCategorias()
      setCategorias(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao buscar categorias:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  return { categorias, loading, error, refetch: fetchCategorias }
}

// Hook para estoque
export const useEstoque = (filters = {}) => {
  const [estoque, setEstoque] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEstoque = async () => {
    try {
      setLoading(true)
      const data = await getEstoque(filters)
      setEstoque(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao buscar estoque:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEstoque()
  }, [JSON.stringify(filters)])

  return { estoque, loading, error, refetch: fetchEstoque }
}

// Hook para clientes
export const useClientes = (filters = {}) => {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchClientes = async () => {
    try {
      setLoading(true)
      const data = await getClientes(filters)
      setClientes(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao buscar clientes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [JSON.stringify(filters)])

  return { clientes, loading, error, refetch: fetchClientes }
}

// Hook para ordens de serviço
export const useOrdensServico = (filters = {}) => {
  const [ordensServico, setOrdensServico] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrdensServico = async () => {
    try {
      setLoading(true)
      const data = await getOrdensServico(filters)
      setOrdensServico(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao buscar ordens de serviço:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrdensServico()
  }, [JSON.stringify(filters)])

  return { ordensServico, loading, error, refetch: fetchOrdensServico }
}

// Hook para movimentações de caixa
export const useMovimentacoesCaixa = (filters = {}) => {
  const [movimentacoes, setMovimentacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMovimentacoes = async () => {
    try {
      setLoading(true)
      const data = await getMovimentacoesCaixa(filters)
      setMovimentacoes(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao buscar movimentações de caixa:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovimentacoes()
  }, [JSON.stringify(filters)])

  return { movimentacoes, loading, error, refetch: fetchMovimentacoes }
}

// Hook para metas
export const useMetas = (filters = {}) => {
  const [metas, setMetas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMetas = async () => {
    try {
      setLoading(true)
      const data = await getMetas(filters)
      setMetas(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao buscar metas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetas()
  }, [JSON.stringify(filters)])

  return { metas, loading, error, refetch: fetchMetas }
}

// Hook para vitrine virtual
export const useVitrineVirtual = (filters = {}) => {
  const [vitrine, setVitrine] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchVitrine = async () => {
    try {
      setLoading(true)
      const data = await getVitrineVirtual(filters)
      setVitrine(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao buscar vitrine virtual:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVitrine()
  }, [JSON.stringify(filters)])

  return { vitrine, loading, error, refetch: fetchVitrine }
}

// Hook para estatísticas do dashboard
export const useDashboardStats = (loja_id = null) => {
  const [stats, setStats] = useState({
    ordensServico: { total: 0, abertas: 0 },
    vendas: { total: 0, quantidade: 0 },
    estoque: { total: 0, baixo: 0 },
    clientes: { total: 0, novos: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await getDashboardStats(loja_id)
      setStats(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao buscar estatísticas do dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [loja_id])

  return { stats, loading, error, refetch: fetchStats }
}

// Hook para notas fiscais
export const useNotasFiscais = (filters = {}) => {
  const [notasFiscais, setNotasFiscais] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNotasFiscais = async () => {
    try {
      setLoading(true)
      const data = await getNotasFiscais(filters)
      setNotasFiscais(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao buscar notas fiscais:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotasFiscais()
  }, [JSON.stringify(filters)])

  return { notasFiscais, loading, error, refetch: fetchNotasFiscais }
}

// Hook para conversas do chat
export const useConversas = (filters = {}) => {
  const [conversas, setConversas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchConversas = async () => {
    try {
      setLoading(true)
      const data = await getConversas(filters)
      setConversas(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao buscar conversas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversas()
  }, [JSON.stringify(filters)])

  return { conversas, loading, error, refetch: fetchConversas }
}

// Hook para mensagens do chat
export const useMensagens = (conversa_id) => {
  const [mensagens, setMensagens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMensagens = async () => {
    if (!conversa_id) {
      setMensagens([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await getMensagens(conversa_id)
      setMensagens(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Erro ao buscar mensagens:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMensagens()
  }, [conversa_id])

  return { mensagens, loading, error, refetch: fetchMensagens }
}


