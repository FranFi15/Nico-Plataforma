import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import nsLogo from '../assets/ns.png';

const PaymentProcessing = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [dots, setDots] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Animar los puntos suspensivos
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Polling para revisar si la membresía se activó (cada 3 segundos)
  useEffect(() => {
    if (!user) return;

    // Si ya está activo, lo mandamos al perfil al instante
    if (user.membership === 'premium' || user.isSubscribed) {
      navigate('/mi-perfil', { replace: true });
      return;
    }

    const pollingInterval = setInterval(async () => {
      await refreshUser();
      setTimeElapsed((prev) => prev + 3);
    }, 3000);

    return () => clearInterval(pollingInterval);
  }, [user, navigate, refreshUser]);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'var(--font-sans)',
      textAlign: 'center',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '50px 40px',
        borderRadius: '24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <img src={nsLogo} alt="NS Entrenamiento" style={{ width: '80px', height: 'auto' }} />
        </div>

        <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--dark)', marginBottom: '16px' }}>
          Procesando Pago{dots}
        </h2>
        
        <p style={{ fontSize: '16px', color: 'var(--gray-500)', lineHeight: '1.6', marginBottom: '30px' }}>
          ¡Gracias por tu compra! Estamos esperando la confirmación de la pasarela. A la brevedad se activará tu acceso.
        </p>

        {/* Spinner animado usando CSS en línea */}
        <div style={{ margin: '0 auto 30px auto', position: 'relative', width: '60px', height: '60px' }}>
          <style>
            {`
              @keyframes spin { 100% { transform: rotate(360deg); } }
            `}
          </style>
          <div style={{
            width: '100%',
            height: '100%',
            border: '4px solid #e2e8f0',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>

        {timeElapsed > 15 && (
          <div style={{ marginTop: '20px', animation: 'fadeIn 0.5s ease' }}>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
              Si está tardando más de lo esperado, no te preocupes, el pago se acreditará pronto.
            </p>
            <button
              onClick={() => navigate('/mi-perfil', { replace: true })}
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '15px', borderRadius: '12px' }}
            >
              Ir a mi perfil
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentProcessing;
