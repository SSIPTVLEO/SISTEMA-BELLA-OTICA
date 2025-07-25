// src/pages/Produtos.jsx
import React, { useState } from 'react'
import { Plus, Search, Edit, Trash2, Package, Eye, Camera, QrCode, Upload } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { useProdutos } from '../hooks/useSupabaseData'
import { createProduto, updateProduto, deleteProduto, uploadProdutoImage } from '../lib/supabase'

export function Produtos() {
  const { isAdmin } = useAuth()
  const { produtos, loading, error, refetch } = useProdutos()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [showModal, setShowModal] = useState(false)
  const [showImageUploadModal, setShowImageUploadModal] = useState(false)
  const [editingProduto, setEditingProduto] = useState(null)
  const [currentProdutoIdForImage, setCurrentProdutoIdForImage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    categoria: '',
    marca: '',
    preco_custo: 0,
    preco_venda: 0,
    descricao: '',
    ativo: true,
    fotos: []
  })

  const categorias = ['Todos', 'Óculos de Sol', 'Armações', 'Lentes', 'Acessórios']

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
          <p className="text-red-700">Erro ao carregar produtos: {error.message}</p>
        </div>
      </div>
    )
  }

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.marca.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'Todos' || produto.categoria === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const getStatusBadge = (ativo) => {
    return ativo ? (
      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
    ) : (
      <Badge variant="destructive">Inativo</Badge>
    )
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProduto) {
        await updateProduto(editingProduto.id, formData)
      } else {
        await createProduto(formData)
      }
      setShowModal(false)
      setEditingProduto(null)
      setFormData({
        codigo: '',
        nome: '',
        categoria: '',
        marca: '',
        preco_custo: 0,
        preco_venda: 0,
        descricao: '',
        ativo: true,
        fotos: []
      })
      refetch()
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      alert('Erro ao salvar produto: ' + error.message)
    }
  }

  const handleEdit = (produto) => {
    setEditingProduto(produto)
    setFormData({
      codigo: produto.codigo,
      nome: produto.nome,
      categoria: produto.categoria,
      marca: produto.marca,
      preco_custo: produto.preco_custo,
      preco_venda: produto.preco_venda,
      descricao: produto.descricao,
      ativo: produto.ativo,
      fotos: produto.fotos || []
    })
    setShowModal(true)
  }

  const handleToggleStatus = async (produto) => {
    try {
      await updateProduto(produto.id, { ativo: !produto.ativo })
      refetch()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      alert('Erro ao alterar status: ' + error.message)
    }
  }

  const handleDelete = async (produtoId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduto(produtoId)
        refetch()
      } catch (error) {
        console.error('Erro ao excluir produto:', error)
        alert('Erro ao excluir produto: ' + error.message)
      }
    }
  }

  const handleImageUpload = async () => {
    if (!selectedFile || !currentProdutoIdForImage) {
      alert('Selecione um arquivo e um produto.')
      return
    }
    try {
      await uploadProdutoImage(currentProdutoIdForImage, selectedFile)
      setSelectedFile(null)
      setShowImageUploadModal(false)
      refetch()
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error)
      alert('Erro ao fazer upload da imagem: ' + error.message)
    }
  }

  const handleAddPhotoClick = (produtoId) => {
    setCurrentProdutoIdForImage(produtoId)
    setShowImageUploadModal(true)
  }

  const handleGenerateQR = (produto) => {
    // Implementar lógica de geração de QR Code aqui
    alert(`Gerar QR Code para o produto: ${produto.nome} (ID: ${produto.id})`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Gerencie o catálogo de produtos</p>
        </div>
        {isAdmin() && (
          <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Produtos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProdutos.map((produto) => (
          <Card key={produto.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                {produto.fotos && produto.fotos.length > 0 ? (
                  <img 
                    src={produto.fotos[0]} 
                    alt={produto.nome}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Package className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{produto.nome}</CardTitle>
                  <CardDescription>Código: {produto.codigo}</CardDescription>
                </div>
                {getStatusBadge(produto.ativo)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  {getCategoryBadge(produto.categoria)}
                  <span className="text-sm text-gray-600">{produto.marca}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Custo:</span>
                    <span className="font-medium">R$ {produto.preco_custo.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Venda:</span>
                    <span className="font-bold text-green-600">R$ {produto.preco_venda.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Margem:</span>
                    <span className="font-medium text-blue-600">
                      {(((produto.preco_venda - produto.preco_custo) / produto.preco_custo) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {produto.descricao}
                </p>
                
                {isAdmin() && (
                  <div className="flex space-x-1 pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(produto)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddPhotoClick(produto.id)}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGenerateQR(produto)}
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(produto)}
                      className={produto.ativo ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {produto.ativo ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(produto.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {produtos.filter(p => p.ativo).length}
                </p>
                <p className="text-sm text-gray-600">Produtos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(produtos.map(p => p.categoria)).size}
                </p>
                <p className="text-sm text-gray-600">Categorias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Camera className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {produtos.filter(p => p.fotos && p.fotos.length > 0).length}
                </p>
                <p className="text-sm text-gray-600">Com Fotos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <QrCode className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  R$ {produtos.reduce((acc, p) => acc + p.preco_venda, 0).toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">Valor Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Produto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingProduto ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <Input
                  value={formData.codigo}
                  onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                />
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
                  {categorias.filter(c => c !== 'Todos').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                <Input
                  value={formData.marca}
                  onChange={(e) => setFormData({...formData, marca: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço de Custo</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.preco_custo}
                  onChange={(e) => setFormData({...formData, preco_custo: parseFloat(e.target.value)})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço de Venda</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.preco_venda}
                  onChange={(e) => setFormData({...formData, preco_venda: parseFloat(e.target.value)})}
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
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                />
                <label htmlFor="ativo" className="text-sm font-medium text-gray-700">Ativo</label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false)
                    setEditingProduto(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProduto ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Upload de Imagem */}
      {showImageUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Upload de Imagem</h2>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="mb-4"
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowImageUploadModal(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleImageUpload} disabled={!selectedFile}>
                <Upload className="w-4 h-4 mr-2" /> Upload
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

