// src/components/Layout/Header.jsx
import React from 'react'
import { Bell, Search, Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'

export function Header() {
  // TODO: Implementar hook de status de conexão
  const isOnline = navigator.onLine
  const isSyncing = false
  const lastSyncTime = new Date()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar produtos, clientes, OS..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Connection Status */}
        <div className="flex items-center space-x-2 text-sm">
          {isOnline ? (
            <div className="flex items-center space-x-1 text-green-600">
              <Wifi className="w-4 h-4" />
              <span className="hidden sm:inline">Online</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-red-600">
              <WifiOff className="w-4 h-4" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}

          {isSyncing ? (
            <div className="flex items-center space-x-1 text-blue-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Sincronizando...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-gray-600">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">
                {lastSyncTime.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
            3
          </Badge>
        </Button>
      </div>
    </header>
  )
}

