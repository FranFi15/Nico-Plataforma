import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { IoWarning, IoCheckmarkCircleOutline, IoArrowBack } from 'react-icons/io5';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: '', type: '' });

    try {
      const response = await api.post('/users/forgot-password', { email });
      if (response.data && response.data.success) {
        setMsg({ text: response.data.message, type: 'success' });
        setEmail('');
      } else {
        setMsg({ text: 'No se pudo procesar la solicitud.', type: 'error' });
      }
    } catch (err) {
      setMsg({ 
        text: err.response?.data?.message || 'Error de conexión. Intenta de nuevo más tarde.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh', padding: '20px 0' }}>
      <div className="premium-card" style={{ width: '100%', maxWidth: '440px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px', textAlign: 'center', color: '#051020' }}>
          Recuperar Contraseña
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '30px', textAlign: 'center', lineHeight: '1.5' }}>
          Ingresa tu correo electrónico y te enviaremos un enlace para crear una nueva contraseña.
        </p>

        {msg.text && (
          <div className={`premium-alert ${msg.type === 'error' ? 'premium-alert-error' : 'premium-alert-success'}`}>
            {msg.type === 'error' ? <IoWarning size={18} style={{ flexShrink: 0 }} /> : <IoCheckmarkCircleOutline size={18} style={{ flexShrink: 0 }} />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              id="email"
              className="premium-input"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || msg.type === 'success'}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginBottom: '20px' }}
            disabled={loading || msg.type === 'success'}
          >
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <Link to="/login" style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <IoArrowBack /> Volver al Inicio de Sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
