// src/pages/Chat.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Send, Users, Search, MoreVertical, Phone, Video } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { useConversas, useMensagens, useFuncionarios } from '../hooks/useSupabaseData'
import { createMensagem, updateConversa, supabase } from '../lib/supabase'

export function Chat() {
  const [conversaSelecionada, setConversaSelecionada] = useState(null)
  const [novaMensagem, setNovaMensagem] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef(null)
  const { funcionario } = useAuth()

  const { conversas, loading: loadingConversas, error: errorConversas, refetch: refetchConversas } = useConversas()
  const { mensagens, loading: loadingMensagens, error: errorMensagens, refetch: refetchMensagens } = useMensagens(conversaSelecionada?.id)
  const { funcionarios } = useFuncionarios()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensagens])

  useEffect(() => {
    if (conversaSelecionada) {
      refetchMensagens()
      // Setup real-time subscription for messages in the selected conversation
      const subscription = supabase
        .channel(`chat_messages_${conversaSelecionada.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens',
          filter: `conversa_id=eq.${conversaSelecionada.id}`
        }, payload => {
          refetchMensagens() // Refetch messages when a new one arrives
        })
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    }
  }, [conversaSelecionada, refetchMensagens])

  // Filter conversations based on search term and user's access
  const filteredConversas = conversas.filter(conversa => {
    const matchesSearch = conversa.nome.toLowerCase().includes(searchTerm.toLowerCase())
    // Implement access control for conversations if needed (e.g., only show conversations user is part of)
    return matchesSearch
  })

  const handleEnviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaSelecionada || !funcionario) return

    try {
      const payload = {
        conversa_id: conversaSelecionada.id,
        remetente_id: funcionario.id,
        conteudo: novaMensagem,
        tipo: 'texto'
      }
      await createMensagem(payload)
      setNovaMensagem('')
      refetchMensagens()
      // Update last message and activity in conversation
      await updateConversa(conversaSelecionada.id, {
        ultima_mensagem: novaMensagem,
        ultima_atividade: new Date().toISOString()
      })
      refetchConversas()
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err)
      alert('Erro ao enviar mensagem: ' + err.message)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEnviarMensagem()
    }
  }

  const formatarHora = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatarUltimaAtividade = (timestamp) => {
    const agora = new Date()
    const data = new Date(timestamp)
    const diffMs = agora - data
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    return `${diffDays}d`
  }

  if (loadingConversas || loadingMensagens) {
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

  if (errorConversas || errorMensagens) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Erro ao carregar chat: {errorConversas?.message || errorMensagens?.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Lista de Conversas */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Chat Interno</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversas.map((conversa) => (
            <div
              key={conversa.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                conversaSelecionada?.id === conversa.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => setConversaSelecionada(conversa)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">{conversa.nome || (conversa.tipo === 'individual' ? funcionarios.find(f => f.id === conversa.participantes.find(p => p !== funcionario?.id))?.nome : 'Grupo')}</h3>
                    {/* Online status would need real-time presence, which is more complex */}
                    {/* {conversa.online && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )} */}
                  </div>
                  {conversa.tipo === 'individual' && conversa.loja_id && (
                    <p className="text-xs text-gray-500">{funcionarios.find(f => f.id === conversa.participantes.find(p => p !== funcionario?.id))?.loja_nome}</p>
                  )}
                  {conversa.tipo === 'grupo' && conversa.participantes && (
                    <p className="text-xs text-gray-500">
                      {conversa.participantes.length} participantes
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {conversa.ultima_mensagem}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {formatarUltimaAtividade(conversa.ultima_atividade)}
                  </p>
                  {/* Nao lidas would need a read receipt system */}
                  {/* {conversa.nao_lidas > 0 && (
                    <Badge className="bg-blue-600 text-white mt-1">
                      {conversa.nao_lidas}
                    </Badge>
                  )} */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área de Chat */}
      <div className="flex-1 flex flex-col">
        {conversaSelecionada ? (
          <>
            {/* Header da Conversa */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div>
                  <h3 className="font-medium text-gray-900">{conversaSelecionada.nome || (conversaSelecionada.tipo === 'individual' ? funcionarios.find(f => f.id === conversaSelecionada.participantes.find(p => p !== funcionario?.id))?.nome : 'Grupo')}</h3>
                  {conversaSelecionada.tipo === 'individual' ? (
                    <p className="text-sm text-gray-600">
                      {/* Online status would need real-time presence */}
                      {/* {conversaSelecionada.online ? 'Online' : 'Offline'} */}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {conversaSelecionada.participantes?.map(pId => funcionarios.find(f => f.id === pId)?.nome).join(', ')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {conversaSelecionada.tipo === 'individual' && (
                  <>
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mensagens.map((mensagem) => {
                const isOwn = mensagem.remetente_id === funcionario?.id
                const remetenteNome = funcionarios.find(f => f.id === mensagem.remetente_id)?.nome || 'Desconhecido'
                
                return (
                  <div
                    key={mensagem.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwn 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {!isOwn && conversaSelecionada.tipo === 'grupo' && (
                        <p className="text-xs font-medium mb-1 opacity-75">
                          {remetenteNome}
                        </p>
                      )}
                      <p className="text-sm">{mensagem.conteudo}</p>
                      <p className={`text-xs mt-1 ${
                        isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatarHora(mensagem.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Nova Mensagem */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={handleEnviarMensagem}
                  disabled={!novaMensagem.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-gray-600">
                Escolha uma conversa da lista para começar a conversar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

