import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react';
import './assets/css/App.css';


export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [emailValido, setEmailValido] = useState(true);
  const [senhaValida, setSenhaValida] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const validarEmail = (valor) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValido(regex.test(valor));
  };

  const validarSenha = (valor) => {
    setSenhaValida(valor.length >= 6);
  };

  const simularLogin = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'admin@bellaotica.com' && senha === '123456') {
          resolve();
        } else {
          reject(new Error('Credenciais inválidas. Verifique e tente novamente.'));
        }
      }, 2000);
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    
    validarEmail(email);
    validarSenha(senha);
    
    if (!emailValido || !senhaValida) {
      setCarregando(false);
      return;
    }

    try {
      await simularLogin();
      alert('Login realizado com sucesso! Bem-vindo ao sistema Bella Ótica.');
    } catch (error) {
      setErro(error.message);
      setTimeout(() => setErro(''), 5000);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Container principal */}
      <div className="relative w-full max-w-md">
        {/* Card de login */}
        <div className="glass-effect rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-105">
          {/* Logo/Ícone */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Bella Ótica
            </h1>
            <p className="text-gray-600 text-sm">Faça login para acessar sua conta</p>
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 animate-shake">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">{erro}</span>
              </div>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Campo E-mail */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validarEmail(e.target.value);
                  }}
                  placeholder="seu@email.com"
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    emailValido 
                      ? 'border-gray-200 focus:border-blue-500' 
                      : 'border-red-300 focus:border-red-500'
                  } bg-gray-50/50 backdrop-blur-sm`}
                  required
                />
              </div>
              {!emailValido && (
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  E-mail inválido
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    validarSenha(e.target.value);
                  }}
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    senhaValida 
                      ? 'border-gray-200 focus:border-blue-500' 
                      : 'border-red-300 focus:border-red-500'
                  } bg-gray-50/50 backdrop-blur-sm`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {mostrarSenha ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {!senhaValida && (
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  A senha deve ter pelo menos 6 caracteres
                </p>
              )}
            </div>

            {/* Botão de login */}
            <button
              type="submit"
              disabled={carregando || !emailValido || !senhaValida || !email || !senha}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              {carregando ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </form>

          {/* Links adicionais */}
          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline">
              Esqueceu sua senha?
            </a>
          </div>

          {/* Informações de teste */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800 font-medium mb-1">Credenciais de teste:</p>
            <p className="text-xs text-blue-700">Email: admin@bellaotica.com</p>
            <p className="text-xs text-blue-700">Senha: 123456</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            © 2025 Bella Ótica. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

