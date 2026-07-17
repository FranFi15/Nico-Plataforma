import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { IoStorefrontOutline, IoTicketOutline, IoOpenOutline, IoCheckmarkCircleOutline, IoCreateOutline, IoCloseOutline, IoFolderOpenOutline, IoSchoolOutline, IoNewspaperOutline, IoCalendarOutline, IoLockClosedOutline } from 'react-icons/io5';
import nsLogo from '../assets/ns.png';

const MiPerfil = () => {
  const navigate = useNavigate();
  const { user, loading, updateProfile } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editProfession, setEditProfession] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [benefits, setBenefits] = useState([]);
  const [loadingBenefits, setLoadingBenefits] = useState(true);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
      setEditProfession(user.profession || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchBenefits = async () => {
      setLoadingBenefits(true);
      try {
        const res = await api.get('/benefits');
        if (res.data && Array.isArray(res.data)) {
          const activeOnly = res.data.filter((b) => b.active);
          setBenefits(activeOnly);
        }
      } catch (err) {
        console.error('Error al cargar beneficios:', err);
      } finally {
        setLoadingBenefits(false);
      }
    };
    fetchBenefits();
  }, []);

  const handleSaveAllProfile = async () => {
    setSavingProfile(true);
    setProfileError('');
    const updateData = {
      name: editName,
      email: editEmail,
      profession: editProfession,
    };
    if (editPassword && editPassword.trim() !== '') {
      updateData.password = editPassword.trim();
    }
    const res = await updateProfile(updateData);
    setSavingProfile(false);
    if (res.success) {
      setIsEditingProfile(false);
      setEditPassword('');
    } else {
      setProfileError(res.error || 'Ocurrió un error al guardar los datos.');
    }
  };

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

  const roleText = user.role === 'admin' ? 'Administrador' : 'Alumno';
  const hasMembership = user.membership === 'premium' || user.isSubscribed;
  const membershipText = hasMembership
    ? 'Membresía Activa'
    : 'Sin Membresía';

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : 'No disponible';

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 20px 80px 20px', fontFamily: 'var(--font-sans)' }}>
      <style>{`
        @keyframes profileHeroEntry {
          0% { opacity: 0; transform: translateY(-25px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes colLeftEntry {
          0% { opacity: 0; transform: translateX(-35px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes colRightEntry {
          0% { opacity: 0; transform: translateX(35px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes quickBtnEntry {
          0% { opacity: 0; transform: translateY(25px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes discountCardEntry {
          0% { opacity: 0; transform: translateY(30px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulseLogo {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .animated-profile-title {
          animation: profileHeroEntry 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animated-col-left {
          animation: colLeftEntry 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
          opacity: 0;
        }
        .animated-col-right {
          animation: colRightEntry 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards;
          opacity: 0;
        }
        .animated-quick-btn {
          animation: quickBtnEntry 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animated-quick-btn:hover {
          transform: translateY(-6px) scale(1.02) !important;
          box-shadow: 0 16px 32px rgba(31, 117, 245, 0.15) !important;
          border-color: var(--primary) !important;
        }
        .animated-discount-card {
          animation: discountCardEntry 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animated-discount-card:hover {
          transform: translateY(-5px) scale(1.01) !important;
          box-shadow: 0 16px 32px rgba(31, 117, 245, 0.15) !important;
          border-color: var(--primary) !important;
        }
        .animated-ns-logo {
          animation: pulseLogo 3.5s ease-in-out infinite;
        }
      `}</style>
      <header style={{ textAlign: 'center', padding: '10px 0 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 className="animated-profile-title" style={{ fontSize: '80px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.5px', marginBottom: '12px', color: 'var(--dark)' }}>
          Mi Perfil
        </h1>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* COLUMNA IZQUIERDA: Tarjeta de Usuario y Tarjeta Próximamente */}
        <div className="animated-col-left" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="premium-card" style={{
            padding: '40px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            border: '1px solid var(--border)',
            backgroundColor: '#ffffff'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '24px',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{ fontSize: '40px', fontWeight: '900', color: 'var(--dark)', margin: 0 }}>
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

              {/* Botón / Icono en la esquina superior derecha para editar todos los datos */}
              <button
                onClick={() => {
                  if (isEditingProfile) {
                    setIsEditingProfile(false);
                    setProfileError('');
                  } else {
                    setEditName(user.name || '');
                    setEditEmail(user.email || '');
                    setEditProfession(user.profession || '');
                    setEditPassword('');
                    setProfileError('');
                    setIsEditingProfile(true);
                  }
                }}
                title={isEditingProfile ? "Cancelar edición" : "Editar mis datos"}
                style={{
                  background: isEditingProfile ? '#fee2e2' : 'rgba(31, 117, 245, 0.08)',
                  color: isEditingProfile ? '#dc2626' : 'var(--primary)',
                  border: isEditingProfile ? '1px solid #fca5a5' : '1px solid rgba(31, 117, 245, 0.2)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                {isEditingProfile ? <IoCloseOutline size={24} /> : <IoCreateOutline size={24} />}
              </button>
            </div>

            {isEditingProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {profileError && (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    color: '#b91c1c',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    {profileError}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Tu nombre completo"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '15px',
                      fontWeight: '600',
                      color: 'var(--dark)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="tu@email.com"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '15px',
                      fontWeight: '600',
                      color: 'var(--dark)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Profesión / Cargo
                  </label>
                  <input
                    type="text"
                    value={editProfession}
                    onChange={(e) => setEditProfession(e.target.value)}
                    placeholder="Ej. Preparador Físico, Kinesiólogo..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '15px',
                      fontWeight: '600',
                      color: 'var(--dark)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Nueva Contraseña <span style={{ textTransform: 'none', fontWeight: '500', color: '#94a3b8' }}>(opcional)</span>
                  </label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Dejar en blanco para mantener actual"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '15px',
                      fontWeight: '600',
                      color: 'var(--dark)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    onClick={handleSaveAllProfile}
                    disabled={savingProfile}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '800',
                      fontSize: '14px',
                      cursor: savingProfile ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s ease',
                      boxShadow: '0 4px 12px rgba(31, 117, 245, 0.25)',
                      flex: 1
                    }}
                  >
                    {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button
                    onClick={() => { setIsEditingProfile(false); setProfileError(''); }}
                    disabled={savingProfile}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '12px',
                      fontWeight: '800',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Email:
                  </span>
                  <span style={{ fontSize: '15px', color: 'var(--dark)', fontWeight: '600' }}>
                    {user.email}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Profesión / Cargo:
                  </span>
                  <div>
                    <span style={{ fontSize: '15px', color: user.profession ? 'var(--dark)' : '#94a3b8', fontWeight: user.profession ? '700' : '400', fontStyle: user.profession ? 'normal' : 'italic' }}>
                      {user.profession || 'No especificada'}
                    </span>
                  </div>
                </div>

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

                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Miembro desde:
                  </span>
                  <span style={{ fontSize: '15px', color: 'var(--dark)', fontWeight: '600' }}>
                    {joinedDate}
                  </span>
                </div>
              </div>
            )}

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
                  ¡Hacete Miembro!
                </h4>
                <p style={{ color: 'var(--gray-500)', fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>
                  Accede a workshops y capacitaciones para miembros, y obtén descuentos exclusivos.
                </p>
                <button onClick={() => navigate('/checkout')} className="btn-primary" style={{ padding: '12px 28px', fontSize: '12px' }}>
                  Suscribirse a Membresía
                </button>
              </div>
            )}
          </div>

          {/* Tarjeta Próximamente - tarjeta independiente debajo de los datos del usuario */}
          <div className="premium-card" style={{
            padding: '32px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            border: '1px solid var(--border)',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '18px',
              border: '1px solid #f1f5f9',
              padding: '10px',
              backgroundColor: '#0e2033ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <img src={nsLogo} alt="Logo NS" className="animated-ns-logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <h4 style={{ fontSize: '40px', fontWeight: '900', color: 'var(--dark)', margin: 0 }}>
                  Próximamente
                </h4>
              </div>

            </div>
          </div>

          {/* 4 Botones Rápidos debajo de Próximamente */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px'
          }}>
            {/* Botón 1: Mis Carpetas */}
            <div
              onClick={() => navigate('/mis-carpetas')}
              className="animated-quick-btn"
              style={{
                border: '1.5px solid #e2e8f0',
                borderRadius: '20px',
                padding: '24px',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '14px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                animationDelay: '0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 16px 32px rgba(31, 117, 245, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.02)';
              }}
            >
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                backgroundColor: 'rgba(31, 117, 245, 0.08)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IoFolderOpenOutline size={26} />
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--dark)', margin: '0 0 4px 0' }}>
                  Mis Carpetas
                </h4>
                <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: '600' }}>
                  Ver archivos guardados
                </span>
              </div>
            </div>

            {/* Botón 2: Mis Cursos */}
            <div
              onClick={() => navigate('/mis-cursos')}
              className="animated-quick-btn"
              style={{
                border: '1.5px solid #e2e8f0',
                borderRadius: '20px',
                padding: '24px',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '14px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                animationDelay: '0.38s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 16px 32px rgba(31, 117, 245, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.02)';
              }}
            >
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                backgroundColor: 'rgba(31, 117, 245, 0.08)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IoSchoolOutline size={26} />
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--dark)', margin: '0 0 4px 0' }}>
                  Workshops & Capacitaciones
                </h4>
                <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: '600' }}>
                  Acceder a mis formaciones
                </span>
              </div>
            </div>

            {/* Botón 3: Noticias */}
            <div
              onClick={() => navigate('/noticias')}
              className="animated-quick-btn"
              style={{
                border: '1.5px solid #e2e8f0',
                borderRadius: '20px',
                padding: '24px',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '14px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                animationDelay: '0.46s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 16px 32px rgba(31, 117, 245, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.02)';
              }}
            >
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                backgroundColor: 'rgba(31, 117, 245, 0.08)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IoNewspaperOutline size={26} />
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--dark)', margin: '0 0 4px 0' }}>
                  Noticias
                </h4>
                <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: '600' }}>
                  Novedades de la comunidad
                </span>
              </div>
            </div>

            {/* Botón 4: Agenda */}
            <div
              onClick={() => navigate('/agenda')}
              className="animated-quick-btn"
              style={{
                border: '1.5px solid #e2e8f0',
                borderRadius: '20px',
                padding: '24px',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '14px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                animationDelay: '0.54s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 16px 32px rgba(31, 117, 245, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.02)';
              }}
            >
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                backgroundColor: 'rgba(31, 117, 245, 0.08)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IoCalendarOutline size={26} />
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--dark)', margin: '0 0 4px 0' }}>
                  Agenda
                </h4>
                <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: '600' }}>
                  Eventos y charlas en vivo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Listado de Descuentos Exclusivos */}
        <div className="animated-col-right premium-card" style={{
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
          border: '1px solid var(--border)',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '24px', marginBottom: '24px' }}>

            <div>
              <h3 style={{ fontSize: '40px', fontWeight: '900', color: 'var(--dark)', margin: 0 }}>
                Descuentos Exclusivos
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '4px 0 0 0' }}>
                Beneficios especiales en locales y marcas aliadas para la comunidad.
              </p>
            </div>
          </div>

          {loadingBenefits ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--gray-500)', fontSize: '15px' }}>
              Cargando descuentos disponibles...
            </div>
          ) : !hasMembership ? (
            <div className="discount-card" style={{
              textAlign: 'center',
              padding: '48px 32px',
              backgroundColor: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              borderRadius: '20px',
              margin: '10px 0'
            }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: 'rgba(31, 117, 245, 0.08)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}>
                <IoLockClosedOutline size={34} />
              </div>
              <h4 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--dark)', marginBottom: '10px' }}>
                Descuentos Exclusivos para Miembros
              </h4>
              <p style={{
                fontSize: '14px',
                color: 'var(--gray-500)',
                maxWidth: '420px',
                margin: '0 auto 24px auto',
                lineHeight: '1.6'
              }}>
                Suscríbete a nuestra membresía para desbloquear beneficios especiales.
              </p>
              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary"
                style={{ padding: '14px 32px', fontSize: '14px', borderRadius: '12px' }}
              >
                Desbloquear Descuentos
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {benefits.map((benefit, idx) => (
                <div
                  key={benefit._id}
                  onClick={() => benefit.linkUrl && window.open(benefit.linkUrl, '_blank', 'noopener,noreferrer')}
                  className="animated-discount-card"
                  style={{
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '18px',
                    padding: '15px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: benefit.linkUrl ? 'pointer' : 'default',
                    animationDelay: `${0.3 + idx * 0.08}s`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.01)';
                    e.currentTarget.style.boxShadow = '0 16px 32px rgba(31, 117, 245, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.02)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: benefit.description ? '16px' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {benefit.logoUrl ? (
                        <img
                          src={benefit.logoUrl}
                          alt={benefit.title}
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'contain',
                            borderRadius: '14px',
                            border: '1px solid #f1f5f9',
                            padding: '6px',
                            backgroundColor: '#ffffff',
                            flexShrink: 0
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '14px',
                          backgroundColor: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#64748b',
                          flexShrink: 0
                        }}>
                          <IoStorefrontOutline size={28} />
                        </div>
                      )}
                      <div>
                        <h4 style={{ fontSize: '25px', fontWeight: '900', color: 'var(--dark)', margin: '0 0 6px 0' }}>
                          {benefit.title}
                        </h4>
                        {benefit.discountText && (
                          <span style={{
                            color: '#065f46',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontWeight: '900',
                            fontSize: '18px',
                            display: 'inline-block'
                          }}>
                            {benefit.discountText}
                          </span>
                        )}
                      </div>
                    </div>

                    {benefit.linkUrl && (
                      <div style={{
                        color: 'var(--primary)',
                        backgroundColor: 'rgba(31, 117, 245, 0.08)',
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <IoOpenOutline size={18} />
                      </div>
                    )}
                  </div>

                  {benefit.description && (
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--gray-500)',
                      margin: 0,
                      lineHeight: '1.6',
                      whiteSpace: 'pre-line'
                    }}>
                      {benefit.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiPerfil;
