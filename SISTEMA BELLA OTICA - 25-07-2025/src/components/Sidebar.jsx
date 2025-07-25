// src/components/Layout/Sidebar.jsx
import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Users, 
  Store, 
  Package, 
  Warehouse, 
  FileText, 
  Receipt, 
  DollarSign,
  Eye,
  LogOut,
  Settings,
  Camera,
  Target,
  BarChart3,
  MessageCircle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Funcionários', path: '/funcionarios', adminOnly: true },
  { icon: Store, label: 'Lojas', path: '/lojas', adminOnly: true },
  { icon: Package, label: 'Produtos', path: '/produtos' },
  { icon: Warehouse, label: 'Estoque', path: '/estoque' },
  { icon: FileText, label: 'Ordens de Serviço', path: '/ordens-servico' },
  { icon: Receipt, label: 'Notas Fiscais', path: '/notas-fiscais' },
  { icon: DollarSign, label: 'Caixa', path: '/caixa' },
  { icon: Camera, label: 'Vitrine Virtual', path: '/vitrine-virtual' },
  { icon: Target, label: 'Metas', path: '/metas' },
  { icon: BarChart3, label: 'Relatórios', path: '/relatorios' },
  { icon: MessageCircle, label: 'Chat', path: '/chat' },
]

export function Sidebar() {
  const { funcionario, isAdmin, signOut } = useAuth()

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || isAdmin()
  )

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Bella Ótica</h1>
            <p className="text-sm text-gray-500">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {funcionario?.nome || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500">
              {isAdmin() ? 'Administrador' : 'Usuário'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => {/* TODO: Implementar configurações */}}
        >
          <Settings className="w-4 h-4 mr-3" />
          Configurações
        </Button>
        
        <Separator />
        
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  )
}

