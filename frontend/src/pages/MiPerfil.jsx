import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MiPerfil = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--gray-500)' }}>
        Cargando perfil...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
        <div className="premium-card" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--dark)', marginBottom: '16px' }}>
            Acceso Restringido
          </h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>
            Inicia sesión para ver tu perfil de usuario.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  const roleText = user.role === 'admin' ? 'Administrador (Nico)' : 'Preparador Físico / Entrenador';
  const membershipText = (user.membership === 'premium' || user.isSubscribed)
    ? '★ Membresía Premium Activa'
    : 'Acceso Gratuito';

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : 'No disponible';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px 60px 20px', fontFamily: 'var(--font-sans)' }}>
      <header style={{ textAlign: 'center', padding: '60px 0 40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontSize: '80px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.5px', marginBottom: '12px', color: 'var(--dark)' }}>
          Mi Perfil
        </h1>
        <div className="accent-divider"></div>
        <p style={{ color: 'var(--gray-500)', fontSize: '16px', maxWidth: '640px', lineHeight: '1.6', textAlign: 'center' }}>
          Visualiza y administra tus datos de usuario y el estado de tu suscripción.
        </p>
      </header>

      <div className="premium-card" style={{
        padding: '40px',
        maxWidth: '600px',
        margin: '0 auto',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
        border: '1px solid var(--border)'
      }}>
        {/* Profile Header Block */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '24px',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: '900',
            textTransform: 'uppercase'
          }}>
            {user.name ? user.name.charAt(0) : 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--dark)', margin: 0 }}>
              {user.name}
            </h2>
            <span style={{
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--primary)'
            }}>
              {roleText}
            </span>
          </div>
        </div>

        {/* Profile Details List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'baseline' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Email:
            </span>
            <span style={{ fontSize: '15px', color: 'var(--dark)', fontWeight: '600' }}>
              {user.email}
            </span>
          </div>

          {/* Membership Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Membresía:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                fontSize: '13px',
                color: (user.membership === 'premium' || user.isSubscribed) ? '#ffffff' : 'var(--dark)',
                backgroundColor: (user.membership === 'premium' || user.isSubscribed) ? 'var(--primary)' : 'var(--gray-100)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {membershipText}
              </span>
            </div>
          </div>

          {/* Joined Date Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'baseline' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Miembro desde:
            </span>
            <span style={{ fontSize: '15px', color: 'var(--dark)', fontWeight: '600' }}>
              {joinedDate}
            </span>
          </div>
        </div>

        {/* Membership Upgrade CTA */}
        {!(user.membership === 'premium' || user.isSubscribed) && (
          <div style={{
            marginTop: '32px',
            padding: '24px',
            backgroundColor: 'rgba(31, 117, 245, 0.04)',
            border: '1px solid rgba(31, 117, 245, 0.15)',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--dark)', marginBottom: '8px', textTransform: 'uppercase' }}>
              ¡Pásate a Premium hoy!
            </h4>
            <p style={{ color: 'var(--gray-500)', fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>
              Accede de forma ilimitada a toda nuestra videoteca técnica de ejercicios, lecturas científicas especiales y obtén 20% de descuento en workshops.
            </p>
            <button onClick={() => navigate('/checkout')} className="btn-primary" style={{ padding: '12px 28px', fontSize: '12px' }}>
              Suscribirse a Premium
            </button>
          </div>
        )}

        {(user.membership === 'premium' || user.isSubscribed) && (
          <div style={{
            marginTop: '32px',
            padding: '20px',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#10b981',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            ✓ Tienes acceso completo a la videoteca y blogs exclusivos de Nico Lift.
          </div>
        )}
      </div>
    </div>
  );
};

export default MiPerfil;
