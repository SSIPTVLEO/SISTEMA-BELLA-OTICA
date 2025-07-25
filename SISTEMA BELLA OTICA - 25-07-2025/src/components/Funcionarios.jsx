// src/pages/Funcionarios.jsx
import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Shield,
  User
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAuth } from '../contexts/AuthContext'
import { useFuncionarios, useLojas } from '../hooks/useSupabaseData'
import { createFuncionario, updateFuncionario } from '../lib/supabase'

export function Funcionarios() {
  const { isAdmin } = useAuth()
  const { funcionarios, loading, error, refetch } = useFuncionarios()
  const { lojas } = useLojas()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingFuncionario, setEditingFuncionario] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    loja_id: '',
    perfil: 'user',
    cargo: '',
    telefone: '',
    ativo: true
  })

  // Verificar se é admin
  if (!isAdmin()) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Acesso negado. Apenas administradores podem gerenciar funcionários.</p>
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
          <p className="text-red-700">Erro ao carregar funcionários: {error}</p>
        </div>
      </div>
    )
  }

  // Filtrar funcionários
  const filteredFuncionarios = funcionarios.filter(funcionario => {
    const matchesSearch = funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         funcionario.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'ativo' && funcionario.ativo) ||
                         (filterStatus === 'inativo' && !funcionario.ativo)
    
    return matchesSearch && matchesStatus
  })

  // Estatísticas
  const stats = {
    total: funcionarios.length,
    ativos: funcionarios.filter(f => f.ativo).length,
    inativos: funcionarios.filter(f => !f.ativo).length,
    admins: funcionarios.filter(f => f.perfil === 'admin').length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingFuncionario) {
        await updateFuncionario(editingFuncionario.id, formData)
      } else {
        await createFuncionario(formData)
      }
      setShowModal(false)
      setEditingFuncionario(null)
      setFormData({
        nome: '',
        email: '',
        loja_id: '',
        perfil: 'user',
        cargo: '',
        telefone: '',
        ativo: true
      })
      refetch()
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error)
      alert('Erro ao salvar funcionário: ' + error.message)
    }
  }

  const handleEdit = (funcionario) => {
    setEditingFuncionario(funcionario)
    setFormData({
      nome: funcionario.nome,
      email: funcionario.email,
      loja_id: funcionario.loja_id,
      perfil: funcionario.perfil,
      cargo: funcionario.cargo || '',
      telefone: funcionario.telefone || '',
      ativo: funcionario.ativo
    })
    setShowModal(true)
  }

  const handleToggleStatus = async (funcionario) => {
    try {
      await updateFuncionario(funcionario.id, { ativo: !funcionario.ativo })
      refetch()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      alert('Erro ao alterar status: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
          <p className="text-gray-600">Gerencie os funcionários de todas as lojas</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Novo Funcionário</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.ativos}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inativos</p>
                <p className="text-2xl font-bold text-red-600">{stats.inativos}</p>
              </div>
              <UserX className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funcionários List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Funcionários</CardTitle>
          <CardDescription>
            {filteredFuncionarios.length} funcionário(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFuncionarios.map((funcionario) => (
              <div key={funcionario.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{funcionario.nome}</h3>
                    <p className="text-sm text-gray-500">{funcionario.email}</p>
                    <p className="text-sm text-gray-500">{funcionario.lojas?.nome || 'Loja não definida'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge variant={funcionario.ativo ? "default" : "secondary"}>
                    {funcionario.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Badge variant={funcionario.perfil === 'admin' ? "destructive" : "outline"}>
                    {funcionario.perfil === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(funcionario)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(funcionario)}
                    >
                      {funcionario.ativo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                <select
                  value={formData.perfil}
                  onChange={(e) => setFormData({...formData, perfil: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <Input
                  value={formData.cargo}
                  onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <Input
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                />
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
                    setEditingFuncionario(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingFuncionario ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

