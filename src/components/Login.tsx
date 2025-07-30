import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      if (!isLogin && !name) {
        throw new Error('El nombre es requerido para el registro');
      }

      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@tvargentina.com');
    setPassword('demo123');
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">TV Argentina</h1>
          <p className="text-gray-400">Televisión en vivo</p>
        </div>

        {/* Form Container */}
        <div className="bg-black bg-opacity-75 rounded-lg p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>

          {error && (
            <div className="bg-red-600 text-white p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none transition-colors"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none transition-colors"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
                </>
              ) : (
                isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
              )}
            </button>
          </form>

          {/* Demo User Button */}
          {isLogin && (
            <button
              onClick={fillDemoCredentials}
              className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              🎭 Usar Usuario Demo
            </button>
          )}

          {/* Toggle between login and register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setName('');
                setEmail('');
                setPassword('');
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isLogin ? (
                <>
                  ¿No tienes cuenta? <span className="text-red-600 font-semibold">Regístrate</span>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta? <span className="text-red-600 font-semibold">Inicia sesión</span>
                </>
              )}
            </button>
          </div>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
            <h3 className="text-white font-semibold mb-2">👤 Usuario Demo</h3>
            <p className="text-gray-400 text-sm mb-2">
              Email: <span className="text-white">demo@tvargentina.com</span>
            </p>
            <p className="text-gray-400 text-sm">
              Contraseña: <span className="text-white">demo123</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2024 TV Argentina. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;