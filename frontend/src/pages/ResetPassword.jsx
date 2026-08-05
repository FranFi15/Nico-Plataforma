import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { IoWarning, IoCheckmarkCircleOutline } from 'react-icons/io5';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMsg({ text: 'Las contraseñas no coinciden.', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setMsg({ text: 'La contraseña debe tener al menos 6 caracteres.', type: 'error' });
      return;
    }

    setLoading(true);
    setMsg({ text: '', type: '' });

    try {
      const response = await api.put(`/users/reset-password/${token}`, { password });
      if (response.data && response.data.success) {
        setMsg({ text: '¡Contraseña actualizada con éxito!', type: 'success' });
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setMsg({ 
        text: err.response?.data?.message || 'Error al restablecer la contraseña. El enlace puede haber expirado.', 
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
          Nueva Contraseña
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '30px', textAlign: 'center', lineHeight: '1.5' }}>
          Ingresa tu nueva contraseña a continuación.
        </p>

        {msg.text && (
          <div className={`premium-alert ${msg.type === 'error' ? 'premium-alert-error' : 'premium-alert-success'}`}>
            {msg.type === 'error' ? <IoWarning size={18} style={{ flexShrink: 0 }} /> : <IoCheckmarkCircleOutline size={18} style={{ flexShrink: 0 }} />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Nueva Contraseña</label>
            <input
              type="password"
              name="password"
              id="password"
              className="premium-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || msg.type === 'success'}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="form-label" htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              className="premium-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Guardando...' : 'Restablecer Contraseña'}
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <Link to="/login" style={{ fontSize: '14px', color: '#64748b', textDecoration: 'none' }}>
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
