
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'; 
import { loginUsuario } from '../services/apiExternaService';
import { useAuth } from '../contexts/AuthContext';

function Login(){
    const { login } = useAuth();
    const navigate = useNavigate(); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            
            const usuario = await loginUsuario(email, password);
            if (usuario) {
                console.log('Login exitoso:', usuario);
                login(usuario);
                navigate('/home'); 
            } else {
                console.warn('Login fallido');
                alert('Login fallido');
            }
        } catch (error) {
            alert('Credenciales incorrectas o error en el servidor');
        }

            
            
        
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                {/* Header con logo */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🏞</div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">CAMINO</h1>
                    <p className="text-gray-600 text-sm">Sistema de Proyección Académica</p>
                </div>

                {/* Formulario */}
                <form className="space-y-6" onSubmit={onSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correo UCN
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="usuario@alumnos.ucn.cl"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    >
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;