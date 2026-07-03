import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IoWarning } from 'react-icons/io5';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear errors when typing
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/');
      } else {
        setErrorMsg(result.error || 'Correo electrónico o contraseña incorrectos.');
      }
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh', padding: '20px 0' }}>
      <div className="premium-card" style={{ width: '100%', maxWidth: '440px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '-0.5px', color: '#051020' }}>
          Iniciar Sesión
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '30px', textAlign: 'center' }}>
          Ingresa a tu cuenta.
        </p>

        {errorMsg && (
          <div className="premium-alert premium-alert-error">
            <IoWarning size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              id="email"
              className="premium-input"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="form-label" htmlFor="password">Contraseña</label>
            <input
              type="password"
              name="password"
              id="password"
              className="premium-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginBottom: '24px', padding: '14px' }}
            disabled={loading}
          >
            {loading ? 'Iniciando Sesión...' : 'Entrar'}
          </button>
        </form>

        <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center' }}>
          ¿No tienes una cuenta? <Link to="/register" style={{ color: '#051020', textDecoration: 'none', fontWeight: '700' }}>Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
