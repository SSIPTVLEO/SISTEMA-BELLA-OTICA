// src/pages/Metas.jsx
import React, { useState } from 'react'
import { Target, TrendingUp, Calendar, Award, Users, DollarSign, Plus, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { useAuth } from '../contexts/AuthContext'
import { useMetas, useLojas, useFuncionarios } from '../hooks/useSupabaseData'
import { createMeta, updateMeta, deleteMeta } from '../lib/supabase'

const statusColors = {
  'em_andamento': 'bg-yellow-100 text-yellow-800',
  'atingida': 'bg-green-100 text-green-800',
  'nao_atingida': 'bg-red-100 text-red-800'
}

export function Metas() {
  const { isAdmin, funcionario } = useAuth()
  const { metas, loading, error, refetch } = useMetas()
  const { lojas } = useLojas()
  const { funcionarios } = useFuncionarios()
  const [selectedPeriodo, setSelectedPeriodo] = useState('2024-06') // Default para o mês atual
  const [selectedTipo, setSelectedTipo] = useState('Todos')
  const [showModal, setShowModal] = useState(false)
  const [editingMeta, setEditingMeta] = useState(null)
  const [formData, setFormData] = useState({
    tipo: 'funcionario',
    funcionario_id: '',
    loja_id: '',
    periodo: selectedPeriodo,
    meta_vendas: 0,
    meta_quantidade: 0,
    comissao_por_armacao: 0,
    comissao_por_lente: 0
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
          <p className="text-red-700">Erro ao carregar metas: {error.message}</p>
        </div>
      </div>
    )
  }

  const filteredMetas = metas.filter(meta => {
    const matchesPeriodo = meta.periodo === selectedPeriodo
    const matchesTipo = selectedTipo === 'Todos' || meta.tipo === selectedTipo
    
    const matchesUserAccess = isAdmin() || 
                             (meta.loja_id === funcionario?.loja_id && meta.tipo === 'loja') ||
                             (meta.funcionario_id === funcionario?.id && meta.tipo === 'funcionario')
    
    return matchesPeriodo && matchesTipo && matchesUserAccess
  })

  const getStatusBadge = (percentual) => {
    let status = 'em_andamento'
    if (percentual >= 100) status = 'atingida'
    else if (percentual < 80) status = 'nao_atingida'

    const labels = {
      'em_andamento': 'Em Andamento',
      'atingida': 'Atingida',
      'nao_atingida': 'Não Atingida'
    }
    
    return (
      <Badge className={statusColors[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const getProgressColor = (percentual) => {
    if (percentual >= 100) return 'bg-green-500'
    if (percentual >= 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        meta_vendas: parseFloat(formData.meta_vendas),
        meta_quantidade: parseInt(formData.meta_quantidade),
        comissao_por_armacao: parseFloat(formData.comissao_por_armacao),
        comissao_por_lente: parseFloat(formData.comissao_por_lente),
        // Vendas e quantidades realizadas serão calculadas no backend ou via triggers
        vendas_realizadas: editingMeta ? editingMeta.vendas_realizadas : 0,
        quantidade_realizada: editingMeta ? editingMeta.quantidade_realizada : 0,
        // Periodo já está no formato YYYY-MM
      }

      if (editingMeta) {
        await updateMeta(editingMeta.id, payload)
      } else {
        await createMeta(payload)
      }
      setShowModal(false)
      setEditingMeta(null)
      setFormData({
        tipo: 'funcionario',
        funcionario_id: '',
        loja_id: '',
        periodo: selectedPeriodo,
        meta_vendas: 0,
        meta_quantidade: 0,
        comissao_por_armacao: 0,
        comissao_por_lente: 0
      })
      refetch()
    } catch (err) {
      console.error('Erro ao salvar meta:', err)
      alert('Erro ao salvar meta: ' + err.message)
    }
  }

  const handleEdit = (meta) => {
    setEditingMeta(meta)
    setFormData({
      tipo: meta.tipo,
      funcionario_id: meta.funcionario_id || '',
      loja_id: meta.loja_id || '',
      periodo: meta.periodo,
      meta_vendas: meta.meta_vendas,
      meta_quantidade: meta.meta_quantidade,
      comissao_por_armacao: meta.comissao_por_armacao || 0,
      comissao_por_lente: meta.comissao_por_lente || 0
    })
    setShowModal(true)
  }

  const handleDelete = async (metaId) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      try {
        await deleteMeta(metaId)
        refetch()
      } catch (err) {
        console.error('Erro ao excluir meta:', err)
        alert('Erro ao excluir meta: ' + err.message)
      }
    }
  }

  const canDefineMeta = () => {
    return isAdmin()
  }

  const getMetasStats = () => {
    const metasFuncionarios = filteredMetas.filter(m => m.tipo === 'funcionario')
    const metasLojas = filteredMetas.filter(m => m.tipo === 'loja')
    
    const funcionariosAtingidas = metasFuncionarios.filter(m => (m.vendas_realizadas / m.meta_vendas) * 100 >= 100).length
    const lojasAtingidas = metasLojas.filter(m => (m.vendas_realizadas / m.meta_vendas) * 100 >= 100).length
    
    const totalComissoes = metasFuncionarios.reduce((acc, m) => acc + (m.comissao_gerada || 0), 0)
    const mediaPercentual = filteredMetas.length > 0 
      ? filteredMetas.reduce((acc, m) => acc + ((m.vendas_realizadas / m.meta_vendas) * 100), 0) / filteredMetas.length 
      : 0

    return { 
      funcionariosAtingidas, 
      lojasAtingidas, 
      totalComissoes, 
      mediaPercentual: Math.round(mediaPercentual) 
    }
  }

  const stats = getMetasStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Metas e Comissões</h1>
          <p className="text-gray-600">Acompanhe o desempenho de funcionários e lojas</p>
        </div>
        {canDefineMeta() && (
          <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Definir Meta
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.funcionariosAtingidas}</p>
                <p className="text-sm text-gray-600">Funcionários com Meta Atingida</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.lojasAtingidas}</p>
                <p className="text-sm text-gray-600">Lojas com Meta Atingida</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  R$ {stats.totalComissoes.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Total em Comissões</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.mediaPercentual}%</p>
                <p className="text-sm text-gray-600">Média de Atingimento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <Input
                type="month"
                value={selectedPeriodo}
                onChange={(e) => setSelectedPeriodo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="Todos">Todos</option>
                <option value="funcionario">Funcionários</option>
                <option value="loja">Lojas</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMetas.map((meta) => {
          const percentualVendas = (meta.vendas_realizadas / meta.meta_vendas) * 100
          const percentualQuantidade = (meta.quantidade_realizada / meta.meta_quantidade) * 100
          const funcionarioMeta = funcionarios.find(f => f.id === meta.funcionario_id)
          const lojaMeta = lojas.find(l => l.id === meta.loja_id)

          return (
            <Card key={meta.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {meta.tipo === 'funcionario' ? funcionarioMeta?.nome : lojaMeta?.nome}
                    </CardTitle>
                    <CardDescription>
                      {meta.tipo === 'funcionario' ? `Funcionário - ${lojaMeta?.nome}` : 'Meta da Loja'}
                    </CardDescription>
                  </div>
                  {getStatusBadge(percentualVendas)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Meta de Vendas */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Meta de Vendas</span>
                      <span className="text-sm text-gray-600">
                        {percentualVendas.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(percentualVendas)}`}
                        style={{ width: `${Math.min(percentualVendas, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>R$ {meta.vendas_realizadas.toFixed(2)}</span>
                      <span>R$ {meta.meta_vendas.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Meta de Quantidade */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Meta de Quantidade</span>
                      <span className="text-sm text-gray-600">
                        {percentualQuantidade.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(percentualQuantidade)}`}
                        style={{ width: `${Math.min(percentualQuantidade, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>{meta.quantidade_realizada} unidades</span>
                      <span>{meta.meta_quantidade} unidades</span>
                    </div>
                  </div>

                  {/* Comissão (apenas para funcionários) */}
                  {meta.tipo === 'funcionario' && (meta.comissao_gerada !== undefined) && (
                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Comissão Gerada</span>
                        <span className="text-lg font-bold text-green-600">
                          R$ {meta.comissao_gerada.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Período */}
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Período: {meta.periodo}</span>
                  </div>

                  {/* Actions */}
                  {isAdmin() && (
                    <div className="flex space-x-2 mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(meta)}
                        title="Editar Meta"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(meta.id)}
                        title="Excluir Meta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredMetas.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma meta encontrada</h3>
            <p className="text-gray-600 mb-4">
              Não há metas definidas para o período selecionado.
            </p>
            {isAdmin() && (
              <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Definir Nova Meta
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingMeta ? 'Editar Meta' : 'Definir Nova Meta'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Meta</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="funcionario">Funcionário</option>
                  <option value="loja">Loja</option>
                </select>
              </div>
              
              {formData.tipo === 'funcionario' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Funcionário</label>
                  <select
                    value={formData.funcionario_id}
                    onChange={(e) => setFormData({...formData, funcionario_id: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Selecione um funcionário</option>
                    {funcionarios.map(func => (
                      <option key={func.id} value={func.id}>{func.nome} ({lojas.find(l => l.id === func.loja_id)?.nome})</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.tipo === 'loja' && (
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Período (Mês/Ano)</label>
                <Input
                  type="month"
                  value={formData.periodo}
                  onChange={(e) => setFormData({...formData, periodo: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta de Vendas (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.meta_vendas}
                  onChange={(e) => setFormData({...formData, meta_vendas: parseFloat(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta de Quantidade (unidades)</label>
                <Input
                  type="number"
                  step="1"
                  value={formData.meta_quantidade}
                  onChange={(e) => setFormData({...formData, meta_quantidade: parseInt(e.target.value)})}
                  required
                />
              </div>

              {formData.tipo === 'funcionario' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comissão por Armação (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.comissao_por_armacao}
                      onChange={(e) => setFormData({...formData, comissao_por_armacao: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comissão por Lente (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.comissao_por_lente}
                      onChange={(e) => setFormData({...formData, comissao_por_lente: parseFloat(e.target.value)})}
                    />
                  </div>
                </>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false)
                    setEditingMeta(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingMeta ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

