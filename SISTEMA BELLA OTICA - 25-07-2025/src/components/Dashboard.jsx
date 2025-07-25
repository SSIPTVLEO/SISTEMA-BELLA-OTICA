// src/pages/Dashboard.jsx
import React from 'react'
import { 
  Users, 
  Store, 
  Package, 
  FileText, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { useDashboardStats } from '../hooks/useSupabaseData'

const recentActivities = [
  {
    id: 1,
    type: 'OS',
    description: 'Nova OS #1234 criada para João Silva',
    time: '2 min atrás',
    status: 'new'
  },
  {
    id: 2,
    type: 'Estoque',
    description: 'Produto Ray-Ban RB3025 com estoque baixo',
    time: '15 min atrás',
    status: 'warning'
  },
  {
    id: 3,
    type: 'Venda',
    description: 'Venda de R$ 450,00 finalizada',
    time: '1h atrás',
    status: 'success'
  },
  {
    id: 4,
    type: 'NF',
    description: 'Nota fiscal #5678 emitida',
    time: '2h atrás',
    status: 'success'
  }
]

export function Dashboard() {
  const { funcionario, isAdmin } = useAuth()
  const lojaId = isAdmin() ? null : funcionario?.loja_id
  
  const { stats, loading, error } = useDashboardStats(lojaId)

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new':
        return <FileText className="w-4 h-4 text-blue-600" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <Badge variant="secondary">Novo</Badge>
      case 'warning':
        return <Badge variant="destructive">Atenção</Badge>
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluído</Badge>
      default:
        return <Badge variant="outline">Info</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
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
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-700">Erro ao carregar dados: {error}</span>
          </div>
        </div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Ordens de Serviço',
      value: stats.ordensServico.total.toString(),
      description: `${stats.ordensServico.abertas} abertas`,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Vendas do Dia',
      value: `R$ ${stats.vendas.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      description: `${stats.vendas.quantidade} transações`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Produtos em Estoque',
      value: stats.estoque.total.toString(),
      description: `${stats.estoque.baixo} com baixo estoque`,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Clientes Ativos',
      value: stats.clientes.total.toString(),
      description: `${stats.clientes.novos} novos este mês`,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Bem-vindo de volta, {funcionario?.nome}! Aqui está um resumo das atividades.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas movimentações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  {getStatusBadge(activity.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às funcionalidades principais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <FileText className="w-6 h-6 text-blue-600 mb-2" />
                <p className="font-medium text-sm">Nova OS</p>
                <p className="text-xs text-gray-500">Criar ordem de serviço</p>
              </button>
              
              <button className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Users className="w-6 h-6 text-green-600 mb-2" />
                <p className="font-medium text-sm">Novo Cliente</p>
                <p className="text-xs text-gray-500">Cadastrar cliente</p>
              </button>
              
              <button className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Package className="w-6 h-6 text-orange-600 mb-2" />
                <p className="font-medium text-sm">Consultar Estoque</p>
                <p className="text-xs text-gray-500">Ver disponibilidade</p>
              </button>
              
              <button className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <DollarSign className="w-6 h-6 text-purple-600 mb-2" />
                <p className="font-medium text-sm">Lançar Caixa</p>
                <p className="text-xs text-gray-500">Registrar movimento</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Only Section */}
      {isAdmin() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Visão Geral - Todas as Lojas</span>
            </CardTitle>
            <CardDescription>
              Dados consolidados de todas as unidades (apenas administradores)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Store className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">5</p>
                <p className="text-sm text-blue-700">Lojas Ativas</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">R$ {stats.vendas.total.toLocaleString('pt-BR')}</p>
                <p className="text-sm text-green-700">Vendas Hoje</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">{stats.clientes.total}</p>
                <p className="text-sm text-purple-700">Clientes Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

