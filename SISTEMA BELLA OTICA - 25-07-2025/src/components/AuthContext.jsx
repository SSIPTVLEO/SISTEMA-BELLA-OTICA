// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getCurrentUser, getFuncionarioPerfil, signInWithPassword, signOut as supabaseSignOut } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [funcionario, setFuncionario] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar usuário atual
    getCurrentUser().then(async (user) => {
      if (user) {
        setUser(user)
        try {
          const funcionarioData = await getFuncionarioPerfil(user.id)
          setFuncionario(funcionarioData)
        } catch (error) {
          console.error('Erro ao buscar perfil do funcionário:', error)
        }
      }
      setLoading(false)
    })

    // Escutar mudanças de autenticação (simulado para desenvolvimento)
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(
    //   async (event, session) => {
    //     if (session?.user) {
    //       setUser(session.user)
    //       try {
    //         const funcionarioData = await getFuncionarioPerfil(session.user.id)
    //         setFuncionario(funcionarioData)
    //       } catch (error) {
    //         console.error('Erro ao buscar perfil do funcionário:', error)
    //       }
    //     } else {
    //       setUser(null)
    //       setFuncionario(null)
    //     }
    //     setLoading(false)
    //   }
    // )

    // return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await signInWithPassword(email, password)
    
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabaseSignOut()
    if (error) throw error
    setUser(null)
    setFuncionario(null)
  }

  const isAdmin = () => {
    return funcionario?.role === 'admin'
  }

  const getUserLoja = () => {
    return funcionario?.loja_id
  }

  const value = {
    user,
    funcionario,
    loading,
    signIn,
    signOut,
    isAdmin,
    getUserLoja
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

