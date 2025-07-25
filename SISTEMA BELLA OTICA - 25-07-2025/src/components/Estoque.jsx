// src/pages/Estoque.jsx
import React, { useState } from 'react'
import { Search, Package, ArrowUpDown, AlertTriangle, CheckCircle, Send } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { useEstoque, useProdutos, useLojas } from '../hooks/useSupabaseData'
import { createMovimentacaoEstoque, updateMovimentacaoEstoque, deleteMovimentacaoEstoque } from '../lib/supabase'

export function Estoque() {
  const { isAdmin, funcionario } = useAuth()
  const { estoque, loading, error, refetch } = useEstoque()
  const { produtos } = useProdutos()
  const { lojas } = useLojas()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLoja, setSelectedLoja] = useState('Todas')
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingMovimentacao, setEditingMovimentacao] = useState(null)
  const [formData, setFormData] = useState({
    produto_id: '',
    loja_id: '',
    quantidade: 0,
    tipo_movimentacao: 'entrada',
    observacao: ''
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
          <p className="text-red-700">Erro ao carregar estoque: {error.message}</p>
        </div>
      </div>
    )
  }

  const filteredEstoque = estoque.filter(item => {
    const produto = produtos.find(p => p.id === item.produto_id)
    const loja = lojas.find(l => l.id === item.loja_id)

    const matchesSearch = produto?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto?.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLoja = selectedLoja === 'Todas' || loja?.nome === selectedLoja
    
    const matchesLowStock = !showOnlyLowStock || item.quantidade <= produto?.estoque_minimo
    
    const matchesUserLoja = isAdmin() || item.loja_id === funcionario?.loja_id
    
    return matchesSearch && matchesLoja && matchesLowStock && matchesUserLoja
  })

  const getStockStatus = (quantidade, minimo, maximo) => {
    if (quantidade <= minimo) {
      return { status: 'baixo', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    } else if (quantidade >= maximo * 0.8) {
      return { status: 'alto', color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
    } else {
      return { status: 'normal', color: 'bg-green-100 text-green-800', icon: CheckCircle }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingMovimentacao) {
        await updateMovimentacaoEstoque(editingMovimentacao.id, formData)
      } else {
        await createMovimentacaoEstoque(formData)
      }
      setShowModal(false)
      setEditingMovimentacao(null)
      setFormData({
        produto_id: '',
        loja_id: '',
        quantidade: 0,
        tipo_movimentacao: 'entrada',
        observacao: ''
      })
      refetch()
    } catch (error) {
      console.error('Erro ao salvar movimentação:', error)
      alert('Erro ao salvar movimentação: ' + error.message)
    }
  }

  const handleEdit = (movimentacao) => {
    setEditingMovimentacao(movimentacao)
    setFormData({
      produto_id: movimentacao.produto_id,
      loja_id: movimentacao.loja_id,
      quantidade: movimentacao.quantidade,
      tipo_movimentacao: movimentacao.tipo_movimentacao,
      observacao: movimentacao.observacao || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (movimentacaoId) => {
    if (window.confirm('Tem certeza que deseja excluir esta movimentação?')) {
      try {
        await deleteMovimentacaoEstoque(movimentacaoId)
        refetch()
      } catch (error) {
        console.error('Erro ao excluir movimentação:', error)
        alert('Erro ao excluir movimentação: ' + error.message)
      }
    }
  }

  const handleTransfer = (item) => {
    // Lógica para solicitar transferência
    alert(`Solicitar transferência de ${item.produto_nome} da ${item.loja_nome}`)
  }

  const handleMovement = (item, tipo) => {
    // Lógica para registrar movimentação
    alert(`Registrar ${tipo} de ${item.produto_nome} na ${item.loja_nome}`)
  }

  const getLowStockCount = () => {
    return estoque.filter(item => {
      const produto = produtos.find(p => p.id === item.produto_id)
      return item.quantidade <= produto?.estoque_minimo
    }).length
  }

  const getAvailableLojas = (currentLojaId, produtoId) => {
    return estoque
      .filter(item => item.produto_id === produtoId && item.loja_id !== currentLojaId && item.quantidade > 0)
      .map(item => ({ id: item.loja_id, nome: lojas.find(l => l.id === item.loja_id)?.nome, quantidade: item.quantidade }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estoque</h1>
          <p className="text-gray-600">Controle de estoque por loja</p>
        </div>
        {isAdmin() && (
          <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Movimentação
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por produto ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              {isAdmin() && (
                <select
                  value={selectedLoja}
                  onChange={(e) => setSelectedLoja(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="Todas">Todas as Lojas</option>
                  {lojas.map((loja) => (
                    <option key={loja.id} value={loja.nome}>{loja.nome}</option>
                  ))}
                </select>
              )}
              <Button
                variant={showOnlyLowStock ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Estoque Baixo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estoque Table */}
      <Card>
        <CardHeader>
          <CardTitle>Controle de Estoque</CardTitle>
          <CardDescription>
            {filteredEstoque.length} item(ns) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando estoque...</p>
            </div>
          ) : filteredEstoque.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item encontrado</h3>
              <p className="text-gray-600">Tente ajustar os filtros de busca.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Produto</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Loja</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Quantidade</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Última Mov.</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEstoque.map((item) => {
                    const produto = produtos.find(p => p.id === item.produto_id)
                    const loja = lojas.find(l => l.id === item.loja_id)
                    const stockStatus = getStockStatus(item.quantidade, produto?.estoque_minimo, produto?.estoque_maximo)
                    const StatusIcon = stockStatus.icon
                    const availableLojas = getAvailableLojas(item.loja_id, item.produto_id)
                    
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{produto?.nome}</p>
                            <p className="text-sm text-gray-600">Código: {produto?.codigo}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">{loja?.nome}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-bold text-lg">{item.quantidade}</p>
                            <p className="text-xs text-gray-500">
                              Min: {produto?.estoque_minimo} | Max: {produto?.estoque_maximo}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={stockStatus.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {stockStatus.status === 'baixo' ? 'Baixo' : 
                             stockStatus.status === 'alto' ? 'Alto' : 'Normal'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm text-gray-900">
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {item.tipo_movimentacao}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              title="Editar Movimentação"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              title="Excluir Movimentação"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            {availableLojas.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTransfer(item)}
                                title="Solicitar Transferência"
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {filteredEstoque.reduce((acc, item) => acc + item.quantidade, 0)}
                </p>
                <p className="text-sm text-gray-600">Total em Estoque</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {getLowStockCount()}
                </p>
                <p className="text-sm text-gray-600">Estoque Baixo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(filteredEstoque.map(item => item.produto_id)).size}
                </p>
                <p className="text-sm text-gray-600">Produtos Diferentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Send className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {isAdmin() ? lojas.length : 1}
                </p>
                <p className="text-sm text-gray-600">
                  {isAdmin() ? 'Lojas Monitoradas' : 'Minha Loja'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingMovimentacao ? 'Editar Movimentação' : 'Nova Movimentação'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
                <select
                  value={formData.produto_id}
                  onChange={(e) => setFormData({...formData, produto_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map(produto => (
                    <option key={produto.id} value={produto.id}>{produto.nome} ({produto.codigo})</option>
                  ))}
                </select>
              </div>
              
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                <Input
                  type="number"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimentação</label>
                <select
                  value={formData.tipo_movimentacao}
                  onChange={(e) => setFormData({...formData, tipo_movimentacao: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                  <option value="transferencia">Transferência</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                <textarea
                  value={formData.observacao}
                  onChange={(e) => setFormData({...formData, observacao: e.target.value})}
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
                    setEditingMovimentacao(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingMovimentacao ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

