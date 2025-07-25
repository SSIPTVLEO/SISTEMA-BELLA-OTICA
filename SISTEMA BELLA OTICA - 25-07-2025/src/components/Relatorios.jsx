// src/pages/Relatorios.jsx
import React, { useState } from 'react'
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAuth } from '../contexts/AuthContext'
import { useLojas, useFuncionarios, useProdutos, useMovimentacoesCaixa, useOrdensServico, useNotasFiscais } from '../hooks/useSupabaseData'
import { generateRelatorioVendas, generateRelatorioEstoque, generateRelatorioFinanceiro, generateRelatorioProdutos, generateRelatorioFuncionarios, generateRelatorioClientes } from '../lib/supabase'

const tiposRelatorio = [
  {
    id: 'vendas',
    nome: 'Relatório de Vendas',
    descricao: 'Vendas por período, funcionário e loja',
    icon: TrendingUp,
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'estoque',
    nome: 'Relatório de Estoque',
    descricao: 'Posição atual e movimentações de estoque',
    icon: BarChart3,
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'financeiro',
    nome: 'Relatório Financeiro',
    descricao: 'Fluxo de caixa e movimentações financeiras',
    icon: PieChart,
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'produtos',
    nome: 'Relatório de Produtos',
    descricao: 'Performance e análise de produtos',
    icon: FileText,
    color: 'bg-orange-100 text-orange-800'
  },
  {
    id: 'funcionarios',
    nome: 'Relatório de Funcionários',
    descricao: 'Performance e metas dos funcionários',
    icon: TrendingUp,
    color: 'bg-indigo-100 text-indigo-800'
  },
  {
    id: 'clientes',
    nome: 'Relatório de Clientes',
    descricao: 'Análise de clientes e comportamento de compra',
    icon: BarChart3,
    color: 'bg-pink-100 text-pink-800'
  }
]

const periodosPreDefinidos = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'ontem', label: 'Ontem' },
  { value: 'esta_semana', label: 'Esta Semana' },
  { value: 'semana_passada', label: 'Semana Passada' },
  { value: 'este_mes', label: 'Este Mês' },
  { value: 'mes_passado', label: 'Mês Passado' },
  { value: 'este_ano', label: 'Este Ano' },
  { value: 'personalizado', label: 'Período Personalizado' }
]

const formatosExportacao = [
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'excel', label: 'Excel', icon: BarChart3 },
  { value: 'csv', label: 'CSV', icon: FileText }
]

export function Relatorios() {
  const [selectedRelatorio, setSelectedRelatorio] = useState(null)
  const [selectedPeriodo, setSelectedPeriodo] = useState('este_mes')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [selectedFormato, setSelectedFormato] = useState('pdf')
  const [filtros, setFiltros] = useState({
    loja: 'todas',
    funcionario: 'todos',
    categoria: 'todas'
  })
  const [loading, setLoading] = useState(false)
  const { isAdmin, funcionario } = useAuth()
  const { lojas } = useLojas()
  const { funcionarios } = useFuncionarios()
  const { produtos } = useProdutos()

  const handleGerarRelatorio = async () => {
    if (!selectedRelatorio) return

    setLoading(true)
    
    try {
      const params = {
        periodo: selectedPeriodo,
        dataInicio: selectedPeriodo === 'personalizado' ? dataInicio : null,
        dataFim: selectedPeriodo === 'personalizado' ? dataFim : null,
        formato: selectedFormato,
        loja_id: filtros.loja === 'todas' ? null : filtros.loja,
        funcionario_id: filtros.funcionario === 'todos' ? null : filtros.funcionario,
        categoria: filtros.categoria === 'todas' ? null : filtros.categoria,
      }

      let relatorioData
      switch (selectedRelatorio) {
        case 'vendas':
          relatorioData = await generateRelatorioVendas(params)
          break
        case 'estoque':
          relatorioData = await generateRelatorioEstoque(params)
          break
        case 'financeiro':
          relatorioData = await generateRelatorioFinanceiro(params)
          break
        case 'produtos':
          relatorioData = await generateRelatorioProdutos(params)
          break
        case 'funcionarios':
          relatorioData = await generateRelatorioFuncionarios(params)
          break
        case 'clientes':
          relatorioData = await generateRelatorioClientes(params)
          break
        default:
          throw new Error('Tipo de relatório inválido')
      }

      console.log('Relatório gerado:', relatorioData)
      alert(`Relatório ${tiposRelatorio.find(r => r.id === selectedRelatorio)?.nome} gerado com sucesso! (Ver console para dados)`)
      // Em uma aplicação real, aqui você faria o download do arquivo gerado pelo backend

    } catch (err) {
      console.error('Erro ao gerar relatório:', err)
      alert('Erro ao gerar relatório: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadRelatorio = (relatorio) => {
    // Em uma aplicação real, você teria uma URL para download do relatório gerado
    alert(`Download do relatório ${relatorio.nome} iniciado! (Funcionalidade de download real a ser implementada no backend)`)
    console.log('Download relatório:', relatorio)
  }

  const canAccessAllLojas = () => {
    return isAdmin()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Gere relatórios detalhados do sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tipos de Relatório */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Relatório</CardTitle>
              <CardDescription>Selecione o tipo de relatório que deseja gerar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tiposRelatorio.map((relatorio) => {
                  const IconComponent = relatorio.icon
                  const isSelected = selectedRelatorio === relatorio.id
                  
                  return (
                    <div
                      key={relatorio.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRelatorio(relatorio.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${relatorio.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{relatorio.nome}</h3>
                          <p className="text-sm text-gray-600 mt-1">{relatorio.descricao}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configurações */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>Configure os parâmetros do relatório</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Período */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período
                </label>
                <select
                  value={selectedPeriodo}
                  onChange={(e) => setSelectedPeriodo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {periodosPreDefinidos.map((periodo) => (
                    <option key={periodo.value} value={periodo.value}>
                      {periodo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Datas Personalizadas */}
              {selectedPeriodo === 'personalizado' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Início
                    </label>
                    <Input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Fim
                    </label>
                    <Input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Filtros */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </h4>
                
                {canAccessAllLojas() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loja
                    </label>
                    <select
                      value={filtros.loja}
                      onChange={(e) => setFiltros(prev => ({ ...prev, loja: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="todas">Todas as Lojas</option>
                      {lojas.map(loja => (
                        <option key={loja.id} value={loja.id}>{loja.nome}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Funcionário
                  </label>
                  <select
                    value={filtros.funcionario}
                    onChange={(e) => setFiltros(prev => ({ ...prev, funcionario: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="todos">Todos os Funcionários</option>
                    {funcionarios.map(func => (
                      <option key={func.id} value={func.id}>{func.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria (Produtos)
                  </label>
                  <select
                    value={filtros.categoria}
                    onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="todas">Todas as Categorias</option>
                    <option value="oculos_sol">Óculos de Sol</option>
                    <option value="armacoes">Armações</option>
                    <option value="lentes">Lentes</option>
                    <option value="acessorios">Acessórios</option>
                  </select>
                </div>
              </div>

              {/* Formato de Exportação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formato de Exportação
                </label>
                <div className="space-y-2">
                  {formatosExportacao.map((formato) => {
                    const FormatoIcon = formato.icon
                    return (
                      <label key={formato.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value={formato.value}
                          checked={selectedFormato === formato.value}
                          onChange={(e) => setSelectedFormato(e.target.value)}
                          className="text-blue-600"
                        />
                        <FormatoIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{formato.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Botão Gerar */}
              <Button
                onClick={handleGerarRelatorio}
                disabled={!selectedRelatorio || loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gerando...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Gerar Relatório
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Relatórios Recentes - Esta seção dependeria de um armazenamento de relatórios gerados no Supabase */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Recentes</CardTitle>
          <CardDescription>Últimos relatórios gerados (funcionalidade a ser implementada no backend)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum relatório recente</h3>
              <p className="text-gray-600">Os relatórios gerados aparecerão aqui.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


