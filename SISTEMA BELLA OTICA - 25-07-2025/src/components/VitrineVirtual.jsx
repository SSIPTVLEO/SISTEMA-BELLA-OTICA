// src/pages/VitrineVirtual.jsx
import React, { useState, useEffect } from 'react'
import { Search, QrCode, Eye, Share2, Camera, Filter, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { useProdutos, useLojas } from '../hooks/useSupabaseData'
import { updateProduto, deleteProduto, uploadProdutoImage } from '../lib/supabase'

const categorias = ['Todos', 'Óculos de Sol', 'Armações', 'Lentes', 'Acessórios']

export function VitrineVirtual() {
  const { isAdmin } = useAuth()
  const { produtos, loading, error, refetch } = useProdutos()
  const { lojas } = useLojas()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [showOnlyActive, setShowOnlyActive] = useState(true)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(i => (
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
          <p className="text-red-700">Erro ao carregar produtos da vitrine: {error.message}</p>
        </div>
      </div>
    )
  }

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.marca.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'Todos' || produto.categoria === selectedCategory
    const matchesActive = !showOnlyActive || produto.ativo_vitrine
    
    return matchesSearch && matchesCategory && matchesActive
  })

  const getCategoryBadge = (categoria) => {
    const colors = {
      'Óculos de Sol': 'bg-blue-100 text-blue-800',
      'Armações': 'bg-purple-100 text-purple-800',
      'Lentes': 'bg-green-100 text-green-800',
      'Acessórios': 'bg-orange-100 text-orange-800'
    }
    
    return (
      <Badge className={colors[categoria] || 'bg-gray-100 text-gray-800'}>
        {categoria}
      </Badge>
    )
  }

  const handleToggleVitrine = async (produto) => {
    try {
      await updateProduto(produto.id, { ativo_vitrine: !produto.ativo_vitrine })
      refetch()
    } catch (err) {
      console.error('Erro ao alternar status da vitrine:', err)
      alert('Erro ao alternar status da vitrine: ' + err.message)
    }
  }

  const handleGenerateQR = async (produto) => {
    // A geração de QR Code será feita no backend ou via um serviço externo
    // Por enquanto, apenas um placeholder
    alert(`Gerar QR Code para: ${produto.nome} (${produto.codigo})`)
    console.log('Gerar novo QR Code para produto:', produto)
  }

  const handleShare = (produto) => {
    const productUrl = `https://seusistema.com/vitrine/${produto.id}` // URL real do produto na vitrine
    if (navigator.share) {
      navigator.share({
        title: produto.nome,
        text: produto.descricao,
        url: productUrl
      })
    } else {
      navigator.clipboard.writeText(productUrl)
      alert('Link copiado para a área de transferência!')
    }
  }

  const handleViewProduct = async (produto) => {
    try {
      // Incrementar visualizações no banco de dados
      await updateProduto(produto.id, { visualizacoes: (produto.visualizacoes || 0) + 1 })
      refetch()
      alert(`Visualizar produto: ${produto.nome}`)
    } catch (err) {
      console.error('Erro ao visualizar produto:', err)
      alert('Erro ao visualizar produto: ' + err.message)
    }
  }

  const getVitrineStats = () => {
    const totalProdutos = produtos.length
    const produtosAtivos = produtos.filter(p => p.ativo_vitrine).length
    const totalVisualizacoes = produtos.reduce((acc, p) => acc + (p.visualizacoes || 0), 0)
    const totalCompartilhamentos = produtos.reduce((acc, p) => acc + (p.compartilhamentos || 0), 0)

    return { totalProdutos, produtosAtivos, totalVisualizacoes, totalCompartilhamentos }
  }

  const stats = getVitrineStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vitrine Virtual</h1>
          <p className="text-gray-600">Gerencie os produtos disponíveis na vitrine online com QR Code</p>
        </div>
        {isAdmin() && (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Camera className="w-4 h-4 mr-2" />
            Adicionar à Vitrine
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.produtosAtivos}</p>
                <p className="text-sm text-gray-600">Produtos na Vitrine</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <QrCode className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalProdutos}</p>
                <p className="text-sm text-gray-600">Produtos Cadastrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalVisualizacoes}</p>
                <p className="text-sm text-gray-600">Visualizações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Share2 className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalCompartilhamentos}</p>
                <p className="text-sm text-gray-600">Compartilhamentos</p>
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
                  placeholder="Buscar por nome, código ou marca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              {categorias.map((categoria) => (
                <Button
                  key={categoria}
                  variant={selectedCategory === categoria ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(categoria)}
                >
                  {categoria}
                </Button>
              ))}
              <Button
                variant={showOnlyActive ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyActive(!showOnlyActive)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Apenas Ativos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Produtos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProdutos.map((produto) => (
          <Card key={produto.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center relative">
                {produto.fotos && produto.fotos.length > 0 ? (
                  <img 
                    src={produto.fotos[0]} 
                    alt={produto.nome}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Camera className="w-12 h-12 text-gray-400" />
                )}
                {produto.ativo_vitrine && (
                  <Badge className="absolute top-2 right-2 bg-green-100 text-green-800">
                    Na Vitrine
                  </Badge>
                )}
              </div>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{produto.nome}</CardTitle>
                  <CardDescription>Código: {produto.codigo}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  {getCategoryBadge(produto.categoria)}
                  <span className="text-sm text-gray-600">{produto.marca}</span>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    R$ {produto.preco_venda.toFixed(2)}
                  </p>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {produto.descricao}
                </p>

                {/* QR Code */}
                {produto.qr_code && (
                  <div className="flex justify-center">
                    <div className="bg-white p-2 rounded-lg border">
                      <img 
                        src={produto.qr_code} 
                        alt={`QR Code ${produto.codigo}`}
                        className="w-24 h-24"
                      />
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{produto.visualizacoes || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Share2 className="w-4 h-4" />
                    <span>{produto.compartilhamentos || 0}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewProduct(produto)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(produto)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  {isAdmin() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGenerateQR(produto)}
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                  )}
                  {isAdmin() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleVitrine(produto)}
                      className={produto.ativo_vitrine ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {produto.ativo_vitrine ? 'Remover' : 'Adicionar'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProdutos.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-600 mb-4">Tente ajustar os filtros de busca ou adicione produtos à vitrine.</p>
            {isAdmin() && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Camera className="w-4 h-4 mr-2" />
                Adicionar Produto à Vitrine
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}


