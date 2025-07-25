// src/pages/NotasFiscais.jsx
import React, { useState } from 'react'
import { Plus, Search, Eye, Download, FileText, ArrowUp, ArrowDown, RotateCcw, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { useNotasFiscais, useLojas, useFuncionarios } from '../hooks/useSupabaseData'
import { createNotaFiscal, updateNotaFiscal, deleteNotaFiscal } from '../lib/supabase'

const tipoOptions = [
  { value: 'entrada', label: 'Entrada', color: 'bg-green-100 text-green-800', icon: ArrowDown },
  { value: 'saida', label: 'Saída', color: 'bg-blue-100 text-blue-800', icon: ArrowUp },
  { value: 'devolucao', label: 'Devolução', color: 'bg-orange-100 text-orange-800', icon: RotateCcw },
  { value: 'garantia', label: 'Garantia', color: 'bg-purple-100 text-purple-800', icon: FileText }
]

const statusOptions = [
  { value: 'pendente', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'emitida', label: 'Emitida', color: 'bg-blue-100 text-blue-800' },
  { value: 'processada', label: 'Processada', color: 'bg-green-100 text-green-800' },
  { value: 'cancelada', label: 'Cancelada', color: 'bg-red-100 text-red-800' }
]

export function NotasFiscais() {
  const { isAdmin, funcionario } = useAuth()
  const { notasFiscais, loading, error, refetch } = useNotasFiscais()
  const { lojas } = useLojas()
  const { funcionarios } = useFuncionarios()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTipo, setSelectedTipo] = useState('Todos')
  const [selectedStatus, setSelectedStatus] = useState('Todos')
  const [showModal, setShowModal] = useState(false)
  const [editingNF, setEditingNF] = useState(null)
  const [formData, setFormData] = useState({
    numero: '',
    serie: '',
    tipo: 'entrada',
    fornecedor_cliente: '',
    cnpj_cpf: '',
    loja_id: '',
    funcionario_id: '',
    data_emissao: '',
    data_vencimento: '',
    valor_total: 0,
    valor_impostos: 0,
    status: 'pendente',
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
          <p className="text-red-700">Erro ao carregar notas fiscais: {error.message}</p>
        </div>
      </div>
    )
  }

  const filteredNFs = notasFiscais.filter(nf => {
    const matchesSearch = nf.numero.includes(searchTerm) ||
                         nf.fornecedor_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nf.cnpj_cpf.includes(searchTerm)
    
    const matchesTipo = selectedTipo === 'Todos' || nf.tipo === selectedTipo
    const matchesStatus = selectedStatus === 'Todos' || nf.status === selectedStatus
    
    const matchesUserAccess = isAdmin() || nf.loja_id === funcionario?.loja_id
    
    return matchesSearch && matchesTipo && matchesStatus && matchesUserAccess
  })

  const getTipoBadge = (tipo) => {
    const tipoConfig = tipoOptions.find(t => t.value === tipo)
    if (!tipoConfig) return null
    
    const TipoIcon = tipoConfig.icon
    return (
      <Badge className={tipoConfig.color}>
        <TipoIcon className="w-3 h-3 mr-1" />
        {tipoConfig.label}
      </Badge>
    )
  }

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status)
    if (!statusConfig) return null
    
    return (
      <Badge className={statusConfig.color}>
        {statusConfig.label}
      </Badge>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        valor_total: parseFloat(formData.valor_total),
        valor_impostos: parseFloat(formData.valor_impostos),
        data_emissao: formData.data_emissao ? new Date(formData.data_emissao).toISOString() : null,
        data_vencimento: formData.data_vencimento ? new Date(formData.data_vencimento).toISOString() : null,
        ...(editingNF ? {} : (isAdmin() ? {} : { funcionario_id: funcionario?.id, loja_id: funcionario?.loja_id }))
      }

      if (editingNF) {
        await updateNotaFiscal(editingNF.id, payload)
      } else {
        await createNotaFiscal(payload)
      }
      setShowModal(false)
      setEditingNF(null)
      setFormData({
        numero: '',
        serie: '',
        tipo: 'entrada',
        fornecedor_cliente: '',
        cnpj_cpf: '',
        loja_id: '',
        funcionario_id: '',
        data_emissao: '',
        data_vencimento: '',
        valor_total: 0,
        valor_impostos: 0,
        status: 'pendente',
        observacoes: ''
      })
      refetch()
    } catch (error) {
      console.error('Erro ao salvar NF:', error)
      alert('Erro ao salvar NF: ' + error.message)
    }
  }

  const handleEdit = (nf) => {
    setEditingNF(nf)
    setFormData({
      numero: nf.numero,
      serie: nf.serie,
      tipo: nf.tipo,
      fornecedor_cliente: nf.fornecedor_cliente,
      cnpj_cpf: nf.cnpj_cpf,
      loja_id: nf.loja_id,
      funcionario_id: nf.funcionario_id,
      data_emissao: nf.data_emissao ? nf.data_emissao.split('T')[0] : '',
      data_vencimento: nf.data_vencimento ? nf.data_vencimento.split('T')[0] : '',
      valor_total: nf.valor_total,
      valor_impostos: nf.valor_impostos,
      status: nf.status,
      observacoes: nf.observacoes || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (nfId) => {
    if (window.confirm('Tem certeza que deseja excluir esta Nota Fiscal?')) {
      try {
        await deleteNotaFiscal(nfId)
        refetch()
      } catch (error) {
        console.error('Erro ao excluir NF:', error)
        alert('Erro ao excluir NF: ' + error.message)
      }
    }
  }

  const handleView = (nf) => {
    alert(`Visualizar NF: ${nf.numero}\nTipo: ${nf.tipo}\nFornecedor/Cliente: ${nf.fornecedor_cliente}`)
  }

  const handleDownload = (nf) => {
    alert(`Download NF: ${nf.numero}`)
  }

  const handlePrint = (nf) => {
    alert(`Imprimir NF: ${nf.numero}`)
  }

  const canCreate = () => {
    return isAdmin() || funcionario?.role === 'user'
  }

  const getNFStats = () => {
    const total = filteredNFs.length
    const entradas = filteredNFs.filter(nf => nf.tipo === 'entrada').length
    const saidas = filteredNFs.filter(nf => nf.tipo === 'saida').length
    const valorTotal = filteredNFs.reduce((acc, nf) => acc + nf.valor_total, 0)

    return { total, entradas, saidas, valorTotal }
  }

  const stats = getNFStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notas Fiscais</h1>
          <p className="text-gray-600">Gerencie as notas fiscais de entrada, saída, devolução e garantia</p>
        </div>
        {canCreate() && (
          <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova NF
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
                  placeholder="Buscar por número, fornecedor/cliente ou CNPJ/CPF..."
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
                {tipoOptions.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="Todos">Todos os Status</option>
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NFs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Notas Fiscais</CardTitle>
          <CardDescription>
            {filteredNFs.length} nota(s) fiscal(is) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando notas fiscais...</p>
            </div>
          ) : filteredNFs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma NF encontrada</h3>
              <p className="text-gray-600">Tente ajustar os filtros de busca.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Número/Série</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Tipo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Fornecedor/Cliente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Data Emissão</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Valor Total</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNFs.map((nf) => {
                    const loja = lojas.find(l => l.id === nf.loja_id)
                    return (
                      <tr key={nf.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{nf.numero}/{nf.serie}</p>
                            <p className="text-sm text-gray-600">{loja?.nome}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getTipoBadge(nf.tipo)}
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{nf.fornecedor_cliente}</p>
                            <p className="text-sm text-gray-600">{nf.cnpj_cpf}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-900">
                            {new Date(nf.data_emissao).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className={`font-bold ${nf.valor_total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              R$ {Math.abs(nf.valor_total).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Impostos: R$ {Math.abs(nf.valor_impostos).toFixed(2)}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(nf.status)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(nf)}
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(nf)}
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrint(nf)}
                              title="Imprimir"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            {(isAdmin() || nf.funcionario_id === funcionario?.id) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(nf)}
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {(isAdmin() || nf.funcionario_id === funcionario?.id) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(nf.id)}
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
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
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total de NFs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ArrowDown className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.entradas}</p>
                <p className="text-sm text-gray-600">NFs de Entrada</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ArrowUp className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.saidas}</p>
                <p className="text-sm text-gray-600">NFs de Saída</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold">R$</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.valorTotal.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Valor Total</p>
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
              {editingNF ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <Input
                  value={formData.numero}
                  onChange={(e) => setFormData({...formData, numero: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Série</label>
                <Input
                  value={formData.serie}
                  onChange={(e) => setFormData({...formData, serie: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  {tipoOptions.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor/Cliente</label>
                <Input
                  value={formData.fornecedor_cliente}
                  onChange={(e) => setFormData({...formData, fornecedor_cliente: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ/CPF</label>
                <Input
                  value={formData.cnpj_cpf}
                  onChange={(e) => setFormData({...formData, cnpj_cpf: e.target.value})}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Emissão</label>
                <Input
                  type="date"
                  value={formData.data_emissao}
                  onChange={(e) => setFormData({...formData, data_emissao: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento (Opcional)</label>
                <Input
                  type="date"
                  value={formData.data_vencimento}
                  onChange={(e) => setFormData({...formData, data_vencimento: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_total}
                  onChange={(e) => setFormData({...formData, valor_total: parseFloat(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor dos Impostos</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_impostos}
                  onChange={(e) => setFormData({...formData, valor_impostos: parseFloat(e.target.value)})}
                />
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
                    setEditingNF(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingNF ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

