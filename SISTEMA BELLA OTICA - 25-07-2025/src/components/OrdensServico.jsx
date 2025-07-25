// src/pages/OrdensServico.jsx
import React, { useState } from 'react'
import { Plus, Search, Edit, Eye, FileText, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { useOrdensServico, useLojas, useFuncionarios } from '../hooks/useSupabaseData'
import { createOrdemServico, updateOrdemServico, deleteOrdemServico } from '../lib/supabase'

const statusOptions = [
  { value: 'aberta', label: 'Aberta', color: 'bg-blue-100 text-blue-800', icon: FileText },
  { value: 'em_andamento', label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  { value: 'aguardando_peca', label: 'Aguardando Peça', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  { value: 'concluida', label: 'Concluída', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'cancelada', label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: AlertCircle }
]

const prioridadeOptions = [
  { value: 'baixa', label: 'Baixa', color: 'bg-gray-100 text-gray-800' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  { value: 'alta', label: 'Alta', color: 'bg-red-100 text-red-800' }
]

export function OrdensServico() {
  const { isAdmin, funcionario } = useAuth()
  const { ordensServico, loading, error, refetch } = useOrdensServico()
  const { lojas } = useLojas()
  const { funcionarios } = useFuncionarios()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('Todos')
  const [showModal, setShowModal] = useState(false)
  const [editingOS, setEditingOS] = useState(null)
  const [formData, setFormData] = useState({
    numero: '',
    cliente_nome: '',
    cliente_telefone: '',
    loja_id: '',
    funcionario_id: '',
    tipo_servico: '',
    descricao: '',
    status: 'aberta',
    prioridade: 'normal',
    data_prevista: '',
    valor_servico: 0,
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
          <p className="text-red-700">Erro ao carregar ordens de serviço: {error.message}</p>
        </div>
      </div>
    )
  }

  const filteredOS = ordensServico.filter(os => {
    const matchesSearch = os.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         os.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         os.cliente_telefone.includes(searchTerm) ||
                         os.tipo_servico.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'Todos' || os.status === selectedStatus
    
    const matchesUserAccess = isAdmin() || 
                             os.loja_id === funcionario?.loja_id || 
                             os.funcionario_id === funcionario?.id
    
    return matchesSearch && matchesStatus && matchesUserAccess
  })

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status)
    if (!statusConfig) return null
    
    const StatusIcon = statusConfig.icon
    return (
      <Badge className={statusConfig.color}>
        <StatusIcon className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </Badge>
    )
  }

  const getPrioridadeBadge = (prioridade) => {
    const prioridadeConfig = prioridadeOptions.find(p => p.value === prioridade)
    if (!prioridadeConfig) return null
    
    return (
      <Badge className={prioridadeConfig.color}>
        {prioridadeConfig.label}
      </Badge>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        valor_servico: parseFloat(formData.valor_servico),
        data_prevista: formData.data_prevista ? new Date(formData.data_prevista).toISOString() : null,
        // Se for nova OS, definir funcionario_id e loja_id com base no usuário logado se não for admin
        ...(editingOS ? {} : (isAdmin() ? {} : { funcionario_id: funcionario?.id, loja_id: funcionario?.loja_id }))
      }

      if (editingOS) {
        await updateOrdemServico(editingOS.id, payload)
      } else {
        await createOrdemServico(payload)
      }
      setShowModal(false)
      setEditingOS(null)
      setFormData({
        numero: '',
        cliente_nome: '',
        cliente_telefone: '',
        loja_id: '',
        funcionario_id: '',
        tipo_servico: '',
        descricao: '',
        status: 'aberta',
        prioridade: 'normal',
        data_prevista: '',
        valor_servico: 0,
        observacoes: ''
      })
      refetch()
    } catch (error) {
      console.error('Erro ao salvar OS:', error)
      alert('Erro ao salvar OS: ' + error.message)
    }
  }

  const handleEdit = (os) => {
    setEditingOS(os)
    setFormData({
      numero: os.numero,
      cliente_nome: os.cliente_nome,
      cliente_telefone: os.cliente_telefone,
      loja_id: os.loja_id,
      funcionario_id: os.funcionario_id,
      tipo_servico: os.tipo_servico,
      descricao: os.descricao,
      status: os.status,
      prioridade: os.prioridade,
      data_prevista: os.data_prevista ? os.data_prevista.split('T')[0] : '', // Formato YYYY-MM-DD
      valor_servico: os.valor_servico,
      observacoes: os.observacoes || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (osId) => {
    if (window.confirm('Tem certeza que deseja excluir esta Ordem de Serviço?')) {
      try {
        await deleteOrdemServico(osId)
        refetch()
      } catch (error) {
        console.error('Erro ao excluir OS:', error)
        alert('Erro ao excluir OS: ' + error.message)
      }
    }
  }

  const handleView = (os) => {
    alert(`Visualizar OS: ${os.numero}\nCliente: ${os.cliente_nome}\nServiço: ${os.tipo_servico}`)
  }

  const handlePrint = (os) => {
    alert(`Imprimir OS: ${os.numero}`)
  }

  const canCreate = () => {
    return isAdmin() || funcionario?.role === 'user'
  }

  const getOSStats = () => {
    const total = filteredOS.length
    const abertas = filteredOS.filter(os => os.status === 'aberta').length
    const emAndamento = filteredOS.filter(os => os.status === 'em_andamento').length
    const concluidas = filteredOS.filter(os => os.status === 'concluida').length
    const atrasadas = filteredOS.filter(os => 
      os.status !== 'concluida' && 
      os.data_prevista && new Date(os.data_prevista) < new Date()
    ).length

    return { total, abertas, emAndamento, concluidas, atrasadas }
  }

  const stats = getOSStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
          <p className="text-gray-600">Gerencie as ordens de serviço</p>
        </div>
        {canCreate() && (
          <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova OS
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
                  placeholder="Buscar por número, cliente, telefone ou tipo de serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={selectedStatus === 'Todos' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus('Todos')}
              >
                Todos
              </Button>
              {statusOptions.map((status) => (
                <Button
                  key={status.value}
                  variant={selectedStatus === status.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(status.value)}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OS Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ordens de Serviço</CardTitle>
          <CardDescription>
            {filteredOS.length} ordem(ns) de serviço encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando ordens de serviço...</p>
            </div>
          ) : filteredOS.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma OS encontrada</h3>
              <p className="text-gray-600">Tente ajustar os filtros de busca.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Número</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Serviço</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Prioridade</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Previsão</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Valor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOS.map((os) => {
                    const loja = lojas.find(l => l.id === os.loja_id)
                    const funcionarioOS = funcionarios.find(f => f.id === os.funcionario_id)
                    return (
                      <tr key={os.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{os.numero}</p>
                            <p className="text-sm text-gray-600">{loja?.nome}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{os.cliente_nome}</p>
                            <p className="text-sm text-gray-600">{os.cliente_telefone}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{os.tipo_servico}</p>
                            <p className="text-sm text-gray-600 line-clamp-1">{os.descricao}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(os.status)}
                        </td>
                        <td className="py-4 px-4">
                          {getPrioridadeBadge(os.prioridade)}
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm text-gray-900">
                              {os.data_prevista ? new Date(os.data_prevista).toLocaleDateString() : 'N/A'}
                            </p>
                            {os.status !== 'concluida' && os.data_prevista && new Date(os.data_prevista) < new Date() && (
                              <p className="text-xs text-red-600">Atrasada</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-green-600">
                            R$ {os.valor_servico.toFixed(2)}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(os)}
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {(isAdmin() || os.funcionario_id === funcionario?.id) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(os)}
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {(isAdmin() || os.funcionario_id === funcionario?.id) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(os.id)}
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrint(os)}
                              title="Imprimir"
                            >
                              <FileText className="w-4 h-4" />
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total de OS</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.emAndamento}</p>
                <p className="text-sm text-gray-600">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.concluidas}</p>
                <p className="text-sm text-gray-600">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.atrasadas}</p>
                <p className="text-sm text-gray-600">Atrasadas</p>
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
              {editingOS ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número da OS</label>
                <Input
                  value={formData.numero}
                  onChange={(e) => setFormData({...formData, numero: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
                <Input
                  value={formData.cliente_nome}
                  onChange={(e) => setFormData({...formData, cliente_nome: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone do Cliente</label>
                <Input
                  value={formData.cliente_telefone}
                  onChange={(e) => setFormData({...formData, cliente_telefone: e.target.value})}
                  required
                />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Serviço</label>
                <Input
                  value={formData.tipo_servico}
                  onChange={(e) => setFormData({...formData, tipo_servico: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows="3"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  {statusOptions.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                <select
                  value={formData.prioridade}
                  onChange={(e) => setFormData({...formData, prioridade: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  {prioridadeOptions.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Prevista</label>
                <Input
                  type="date"
                  value={formData.data_prevista}
                  onChange={(e) => setFormData({...formData, data_prevista: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Serviço</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_servico}
                  onChange={(e) => setFormData({...formData, valor_servico: parseFloat(e.target.value)})}
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
                    setEditingOS(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingOS ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

