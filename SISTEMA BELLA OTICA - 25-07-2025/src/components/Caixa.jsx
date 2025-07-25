// src/pages/Caixa.jsx
import React, { useState } from 'react'
import { Plus, Search, DollarSign, TrendingUp, TrendingDown, Calendar, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { useMovimentacoesCaixa, useLojas, useFuncionarios } from '../hooks/useSupabaseData'
import { createMovimentacaoCaixa, updateMovimentacaoCaixa, deleteMovimentacaoCaixa } from '../lib/supabase'

const categorias = [
  { value: 'venda', label: 'Venda', tipo: 'entrada' },
  { value: 'servico', label: 'Serviço', tipo: 'entrada' },
  { value: 'outros_creditos', label: 'Outros Créditos', tipo: 'entrada' },
  { value: 'despesa', label: 'Despesa', tipo: 'saida' },
  { value: 'operacional', label: 'Operacional', tipo: 'saida' },
  { value: 'impostos', label: 'Impostos', tipo: 'saida' },
  { value: 'outros_debitos', label: 'Outros Débitos', tipo: 'saida' }
]

const formasPagamento = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'pix', label: 'PIX' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'cheque', label: 'Cheque' }
]

export function Caixa() {
  const { isAdmin, funcionario } = useAuth()
  const { movimentacoes, loading, error, refetch } = useMovimentacoesCaixa()
  const { lojas } = useLojas()
  const { funcionarios } = useFuncionarios()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTipo, setSelectedTipo] = useState('Todos')
  const [selectedCategoria, setSelectedCategoria] = useState('Todas')
  const [selectedData, setSelectedData] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingMov, setEditingMov] = useState(null)
  const [formData, setFormData] = useState({
    tipo: 'entrada',
    categoria: '',
    descricao: '',
    valor: 0,
    forma_pagamento: '',
    loja_id: '',
    funcionario_id: '',
    data_movimento: '',
    hora_movimento: '',
    observacoes: ''
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Erro ao carregar movimentações: {error.message}</p>
        </div>
      </div>
    )
  }

  const filteredMovimentacoes = movimentacoes.filter(mov => {
    const matchesSearch = mov.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mov.funcionario_nome.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTipo = selectedTipo === 'Todos' || mov.tipo === selectedTipo
    const matchesCategoria = selectedCategoria === 'Todas' || mov.categoria === selectedCategoria
    const matchesData = !selectedData || mov.data_movimento === selectedData
    
    const matchesUserAccess = isAdmin() || mov.loja_id === funcionario?.loja_id
    
    return matchesSearch && matchesTipo && matchesCategoria && matchesData && matchesUserAccess
  })

  const getTipoBadge = (tipo) => {
    return tipo === 'entrada' ? (
      <Badge className="bg-green-100 text-green-800">
        <TrendingUp className="w-3 h-3 mr-1" />
        Entrada
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <TrendingDown className="w-3 h-3 mr-1" />
        Saída
      </Badge>
    )
  }

  const getCategoriaBadge = (categoria) => {
    const colors = {
      'venda': 'bg-blue-100 text-blue-800',
      'servico': 'bg-purple-100 text-purple-800',
      'outros_creditos': 'bg-green-100 text-green-800',
      'despesa': 'bg-orange-100 text-orange-800',
      'operacional': 'bg-red-100 text-red-800',
      'impostos': 'bg-yellow-100 text-yellow-800',
      'outros_debitos': 'bg-gray-100 text-gray-800'
    }
    
    const categoriaObj = categorias.find(c => c.value === categoria)
    return (
      <Badge className={colors[categoria] || 'bg-gray-100 text-gray-800'}>
        {categoriaObj?.label || categoria}
      </Badge>
    )
  }

  const getFormaPagamentoBadge = (forma) => {
    const formaObj = formasPagamento.find(f => f.value === forma)
    return (
      <span className="text-sm text-gray-600">
        {formaObj?.label || forma}
      </span>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        valor: parseFloat(formData.valor),
        data_movimento: formData.data_movimento ? new Date(formData.data_movimento).toISOString() : null,
        ...(editingMov ? {} : (isAdmin() ? {} : { funcionario_id: funcionario?.id, loja_id: funcionario?.loja_id }))
      }

      if (editingMov) {
        await updateMovimentacaoCaixa(editingMov.id, payload)
      } else {
        await createMovimentacaoCaixa(payload)
      }
      setShowModal(false)
      setEditingMov(null)
      setFormData({
        tipo: 'entrada',
        categoria: '',
        descricao: '',
        valor: 0,
        forma_pagamento: '',
        loja_id: '',
        funcionario_id: '',
        data_movimento: '',
        hora_movimento: '',
        observacoes: ''
      })
      refetch()
    } catch (error) {
      console.error('Erro ao salvar movimentação:', error)
      alert('Erro ao salvar movimentação: ' + error.message)
    }
  }

  const handleEdit = (mov) => {
    setEditingMov(mov)
    setFormData({
      tipo: mov.tipo,
      categoria: mov.categoria,
      descricao: mov.descricao,
      valor: mov.valor,
      forma_pagamento: mov.forma_pagamento,
      loja_id: mov.loja_id,
      funcionario_id: mov.funcionario_id,
      data_movimento: mov.data_movimento ? mov.data_movimento.split('T')[0] : '',
      hora_movimento: mov.hora_movimento,
      observacoes: mov.observacoes || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (movId) => {
    if (window.confirm('Tem certeza que deseja excluir esta movimentação?')) {
      try {
        await deleteMovimentacaoCaixa(movId)
        refetch()
      } catch (error) {
        console.error('Erro ao excluir movimentação:', error)
        alert('Erro ao excluir movimentação: ' + error.message)
      }
    }
  }

  const canCreate = () => {
    return isAdmin() || funcionario?.role === 'user'
  }

  const canViewAll = () => {
    return isAdmin()
  }

  const getCaixaStats = () => {
    const entradas = filteredMovimentacoes
      .filter(mov => mov.tipo === 'entrada')
      .reduce((acc, mov) => acc + mov.valor, 0)
    
    const saidas = filteredMovimentacoes
      .filter(mov => mov.tipo === 'saida')
      .reduce((acc, mov) => acc + mov.valor, 0)
    
    const saldo = entradas - saidas
    const totalMovimentacoes = filteredMovimentacoes.length

    return { entradas, saidas, saldo, totalMovimentacoes }
  }

  const stats = getCaixaStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Caixa</h1>
          <p className="text-gray-600">
            {canViewAll() ? 'Controle financeiro de todas as lojas' : 'Controle financeiro da sua loja'}
          </p>
        </div>
        {canCreate() && (
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Movimentação
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-green-600">
                  R$ {stats.entradas.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Total Entradas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingDown className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-red-600">
                  R$ {stats.saidas.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Total Saídas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className={`w-8 h-8 ${stats.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <div className="ml-4">
                <p className={`text-2xl font-bold ${stats.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {stats.saldo.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Saldo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalMovimentacoes}
                </p>
                <p className="text-sm text-gray-600">Movimentações</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por descrição ou funcionário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="Todos">Todos os Tipos</option>
                <option value="entrada">Entradas</option>
                <option value="saida">Saídas</option>
              </select>
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="Todas">Todas as Categorias</option>
                {categorias.map((categoria) => (
                  <option key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </option>
                ))}
              </select>
              <Input
                type="date"
                value={selectedData}
                onChange={(e) => setSelectedData(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Movimentações Table */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações do Caixa</CardTitle>
          <CardDescription>
            {filteredMovimentacoes.length} movimentação(ões) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando movimentações...</p>
            </div>
          ) : filteredMovimentacoes.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma movimentação encontrada</h3>
              <p className="text-gray-600">Tente ajustar os filtros de busca.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Data/Hora</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Categoria</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Descrição</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Valor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Forma Pagamento</th>
                    {canViewAll() && (
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Loja</th>
                    )}
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Funcionário</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovimentacoes.map((mov) => {
                    const loja = lojas.find(l => l.id === mov.loja_id)
                    const funcionarioMov = funcionarios.find(f => f.id === mov.funcionario_id)
                    return (
                      <tr key={mov.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(mov.data_movimento).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-600">{mov.hora_movimento}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getTipoBadge(mov.tipo)}
                        </td>
                        <td className="py-4 px-4">
                          {getCategoriaBadge(mov.categoria)}
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{mov.descricao}</p>
                            {mov.observacoes && (
                              <p className="text-sm text-gray-600">{mov.observacoes}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className={`font-bold text-lg ${mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                            {mov.tipo === 'entrada' ? '+' : '-'} R$ {mov.valor.toFixed(2)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          {getFormaPagamentoBadge(mov.forma_pagamento)}
                        </td>
                        {canViewAll() && (
                          <td className="py-4 px-4">
                            <p className="text-sm text-gray-900">{loja?.nome}</p>
                          </td>
                        )}
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{funcionarioMov?.nome}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(mov)}
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(mov.id)}
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingMov ? 'Editar Movimentação' : 'Nova Movimentação'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.filter(cat => cat.tipo === formData.tipo).map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <Input
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({...formData, valor: parseFloat(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                <select
                  value={formData.forma_pagamento}
                  onChange={(e) => setFormData({...formData, forma_pagamento: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Selecione uma forma de pagamento</option>
                  {formasPagamento.map(fp => (
                    <option key={fp.value} value={fp.value}>{fp.label}</option>
                  ))}
                </select>
              </div>
              
              {isAdmin() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loja</label>
                  <select
                    value={formData.loja_id}
                    onChange={(e) => setFormData({...formData, loja_id: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Selecione uma loja</option>
                    {lojas.map(loja => (
                      <option key={loja.id} value={loja.id}>{loja.nome}</option>
                    ))}
                  </select>
                </div>
              )}

              {isAdmin() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Funcionário Responsável</label>
                  <select
                    value={formData.funcionario_id}
                    onChange={(e) => setFormData({...formData, funcionario_id: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Selecione um funcionário</option>
                    {funcionarios.map(func => (
                      <option key={func.id} value={func.id}>{func.nome}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data do Movimento</label>
                <Input
                  type="date"
                  value={formData.data_movimento}
                  onChange={(e) => setFormData({...formData, data_movimento: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora do Movimento</label>
                <Input
                  type="time"
                  value={formData.hora_movimento}
                  onChange={(e) => setFormData({...formData, hora_movimento: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false)
                    setEditingMov(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingMov ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

