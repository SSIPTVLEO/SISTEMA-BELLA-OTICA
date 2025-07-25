// src/pages/Lojas.jsx
import React, { useState } from 'react'
import { Plus, Search, Edit, Trash2, Store, MapPin, Phone, Mail, Building } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { useLojas } from '../hooks/useSupabaseData'
import { createLoja, updateLoja, deleteLoja } from '../lib/supabase'

export function Lojas() {
  const { isAdmin } = useAuth()
  const { lojas, loading, error, refetch } = useLojas()
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingLoja, setEditingLoja] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    gerente: '',
    ativa: true
  })

  if (!isAdmin()) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Acesso negado. Apenas administradores podem gerenciar lojas.</p>
        </div>
      </div>
    )
  }

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
          <p className="text-red-700">Erro ao carregar lojas: {error.message}</p>
        </div>
      </div>
    )
  }

  const filteredLojas = lojas.filter(loja =>
    loja.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loja.cnpj.includes(searchTerm) ||
    loja.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loja.gerente.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (ativa) => {
    return ativa ? (
      <Badge className="bg-green-100 text-green-800">Ativa</Badge>
    ) : (
      <Badge variant="destructive">Inativa</Badge>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingLoja) {
        await updateLoja(editingLoja.id, formData)
      } else {
        await createLoja(formData)
      }
      setShowModal(false)
      setEditingLoja(null)
      setFormData({
        nome: '',
        cnpj: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        telefone: '',
        email: '',
        gerente: '',
        ativa: true
      })
      refetch()
    } catch (error) {
      console.error('Erro ao salvar loja:', error)
      alert('Erro ao salvar loja: ' + error.message)
    }
  }

  const handleEdit = (loja) => {
    setEditingLoja(loja)
    setFormData({
      nome: loja.nome,
      cnpj: loja.cnpj,
      endereco: loja.endereco,
      cidade: loja.cidade,
      estado: loja.estado,
      cep: loja.cep,
      telefone: loja.telefone,
      email: loja.email,
      gerente: loja.gerente,
      ativa: loja.ativa
    })
    setShowModal(true)
  }

  const handleToggleStatus = async (loja) => {
    try {
      await updateLoja(loja.id, { ativa: !loja.ativa })
      refetch()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      alert('Erro ao alterar status: ' + error.message)
    }
  }

  const handleDelete = async (lojaId) => {
    if (window.confirm('Tem certeza que deseja excluir esta loja?')) {
      try {
        await deleteLoja(lojaId)
        refetch()
      } catch (error) {
        console.error('Erro ao excluir loja:', error)
        alert('Erro ao excluir loja: ' + error.message)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lojas</h1>
          <p className="text-gray-600">Gerencie as unidades da Bella Ótica</p>
        </div>
        {isAdmin() && (
          <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Loja
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome, CNPJ, cidade ou gerente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lojas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLojas.map((loja) => (
          <Card key={loja.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Store className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{loja.nome}</CardTitle>
                    <CardDescription>CNPJ: {loja.cnpj}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(loja.ativa)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{loja.endereco}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building className="w-4 h-4" />
                  <span>{loja.cidade}, {loja.estado} - {loja.cep}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{loja.telefone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{loja.email}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium text-gray-900">
                    Gerente: {loja.gerente}
                  </p>
                </div>
                
                {isAdmin() && (
                  <div className="flex space-x-2 pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(loja)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(loja)}
                      className={`flex-1 ${loja.ativa ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                    >
                      {loja.ativa ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(loja.id)}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Store className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {lojas.filter(l => l.ativa).length}
                </p>
                <p className="text-sm text-gray-600">Lojas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {lojas.filter(l => !l.ativa).length}
                </p>
                <p className="text-sm text-gray-600">Lojas Inativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(lojas.map(l => l.cidade)).size}
                </p>
                <p className="text-sm text-gray-600">Cidades</p>
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
              {editingLoja ? 'Editar Loja' : 'Nova Loja'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                <Input
                  value={formData.cnpj}
                  onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <Input
                  value={formData.endereco}
                  onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <Input
                  value={formData.cidade}
                  onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <Input
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                <Input
                  value={formData.cep}
                  onChange={(e) => setFormData({...formData, cep: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <Input
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gerente</label>
                <Input
                  value={formData.gerente}
                  onChange={(e) => setFormData({...formData, gerente: e.target.value})}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativa"
                  checked={formData.ativa}
                  onChange={(e) => setFormData({...formData, ativa: e.target.checked})}
                />
                <label htmlFor="ativa" className="text-sm font-medium text-gray-700">Ativa</label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false)
                    setEditingLoja(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingLoja ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

