import React, { useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [emailValido, setEmailValido] = useState(true);
  const [senhaValida, setSenhaValida] = useState(true);
  const navigate = useNavigate();

  const validarEmail = (valor) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValido(regex.test(valor));
  };

  const validarSenha = (valor) => {
    setSenhaValida(valor.length >= 6);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    validarEmail(email);
    validarSenha(senha);
    if (!emailValido || !senhaValida) return;

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro('Credenciais inválidas. Verifique e tente novamente.');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Login - Bella Ótica
        </h1>

        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 text-sm px-4 py-2 rounded mb-4">
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validarEmail(e.target.value);
              }}
              placeholder="exemplo@email.com"
              className={`w-full p-3 border ${
                emailValido ? 'border-gray-300' : 'border-red-500'
              } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
            {!emailValido && (
              <p className="text-xs text-red-600 mt-1">E-mail inválido</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-700">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                validarSenha(e.target.value);
              }}
              placeholder="mínimo 6 caracteres"
              className={`w-full p-3 border ${
                senhaValida ? 'border-gray-300' : 'border-red-500'
              } rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
            {!senhaValida && (
              <p className="text-xs text-red-600 mt-1">
                A senha deve ter pelo menos 6 caracteres.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
