import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import AddToFolderModal from '../components/AddToFolderModal';
import { IoArrowBack, IoFolder, IoLockClosed, IoCheckmarkCircle, IoPlay } from 'react-icons/io5';

const VideotecaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/content/${id}`);
        if (response.data && response.data.success) {
          setContent(response.data.data);
        } else {
          setError('No se pudo cargar el video.');
        }
      } catch (err) {
        console.error('Error fetching video detail:', err);
        setError(err.response?.data?.message || 'Error al cargar el video. Es posible que no exista o no tengas permisos.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  if (loading || authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '18px', color: 'var(--gray-500)', fontFamily: 'var(--font-sans)' }}>
        Cargando video...
      </div>
    );
  }

  if (error || !content) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
        <div style={{ padding: '40px', border: '1px solid var(--border)', borderRadius: '24px', backgroundColor: '#ffffff', boxShadow: '0 8px 25px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444', marginBottom: '16px', textTransform: 'uppercase' }}>
            Error al Cargar
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '16px', marginBottom: '24px' }}>
            {error || 'El video que buscas no existe o ha sido removido.'}
          </p>
          <button onClick={() => navigate('/videoteca')} className="btn-primary">
            Volver a Videoteca
          </button>
        </div>
      </div>
    );
  }

  // Access check logic
  const isPrivileged = user && ['admin', 'professor', 'profe', 'instructor'].includes(user.role);
  const isFree = content.accessType === 'free';
  const isSubscribed = user && (user.membership === 'premium' || user.isSubscribed === true);
  const isOwned = user && user.purchasedItems && user.purchasedItems.some(
    (item) => (item._id || item) === content._id
  );
  const hasAccess = isPrivileged || isFree || (content.accessType === 'subscription' && isSubscribed) || (content.accessType === 'one-time-purchase' && isOwned);

  const handleAction = () => {
    if (!user) {
      alert('Por favor, inicia sesión para continuar.');
      navigate('/login');
      return;
    }
    if (content.accessType === 'subscription') {
      navigate('/checkout');
    } else if (content.accessType === 'one-time-purchase') {
      navigate(`/checkout?contentId=${content._id}`);
    }
  };

  const handleAddToFolderClick = () => {
    if (!user) {
      alert('Por favor, inicia sesión para guardar en tus carpetas.');
      navigate('/login');
      return;
    }
    setModalOpen(true);
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    try {
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes('youtube.com/shorts/')) {
        const id = url.split('youtube.com/shorts/')[1]?.split('?')[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes('youtube.com/watch?v=')) {
        const id = url.split('v=')[1]?.split('&')[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes('youtube.com/embed/')) {
        return url;
      }
      if (url.includes('vimeo.com/')) {
        const id = url.split('vimeo.com/').pop()?.split('?')[0];
        if (id && /^\d+$/.test(id)) {
          return `https://player.vimeo.com/video/${id}`;
        }
      }
    } catch (e) {
      console.error('Error parsing video URL:', e);
    }
    return url;
  };

  const isDirectVideo = (url) => {
    if (!url) return false;
    return !!url.match(/\.(mp4|webm|ogg)($|\?)/i);
  };

  const embedUrl = getEmbedUrl(content.videoLink);
  const directVideo = isDirectVideo(content.videoLink);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '950px', margin: '40px auto', padding: '0 20px', fontFamily: 'var(--font-sans)' }}>
      {/* Back Link & Add to Folder */}
      <div className="detail-actions-bar">
        <button
          onClick={() => navigate('/videoteca')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--dark)',
            fontWeight: '700',
            textTransform: 'uppercase',
            fontSize: '13px',
            letterSpacing: '1px',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <IoArrowBack size={16} /> Volver a Videoteca
        </button>

        <button
          onClick={handleAddToFolderClick}
          className="btn-secondary"
          style={{
            padding: '10px 18px',
            fontSize: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            textTransform: 'uppercase',
            fontWeight: '700',
            letterSpacing: '0.5px'
          }}
        >
          <IoFolder size={14} /> Guardar en carpeta
        </button>
      </div>

      {/* Header Info */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          {content.videoFolder && (
            <span className="lift-badge">
              {content.videoFolder.name || content.videoFolder}
            </span>
          )}
          <span style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <IoPlay size={12} /> Video {content.accessType === 'free' ? 'con Acceso Libre' : content.accessType === 'subscription' ? 'Membresía' : 'Pago Único'}
          </span>
        </div>

        <h1 className="detail-title">
          {content.title}
        </h1>
        <p style={{ fontSize: '17px', color: 'var(--gray-500)', lineHeight: '1.6', margin: 0, fontWeight: '400', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
          {content.description}
        </p>
      </div>

      {/* Video Player or Paywall Banner */}
      <div style={{
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: '24px',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        marginBottom: '40px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        backgroundColor: '#000000',
        position: 'relative'
      }}>
        {!hasAccess ? (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#010d19f2',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px',
            boxSizing: 'border-box',
            textAlign: 'center'
          }}>
            <div style={{ color: 'var(--primary)', marginBottom: '20px' }}>
              <IoLockClosed size={54} />
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '900',
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px'
            }}>
              Video Exclusivo
            </h2>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '15px',
              lineHeight: '1.6',
              maxWidth: '500px',
              margin: '0 auto 28px auto'
            }}>
              {content.accessType === 'subscription'
                ? 'Este video de entrenamiento técnico es exclusivo para miembros con Membresía Nico Lift Activa.'
                : 'Este video especial requiere la compra de pago único para desbloquear el acceso permanente.'}
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={handleAction} className="btn-primary" style={{ padding: '14px 36px' }}>
                {content.accessType === 'subscription' ? 'Suscribirse Ahora' : `Comprar Video ($${content.price || 0})`}
              </button>
              <button onClick={() => navigate('/login')} className="btn-secondary" style={{ padding: '14px 36px', borderColor: 'rgba(255, 255, 255, 0.3)', color: '#ffffff' }}>
                Iniciar Sesión
              </button>
            </div>
          </div>
        ) : (
          /* Render Video Player */
          directVideo ? (
            <video
              src={content.videoLink}
              controls
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : embedUrl ? (
            <iframe
              src={embedUrl}
              title={content.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: '#ffffff',
              padding: '20px'
            }}>
              <IoPlay size={48} style={{ marginBottom: '16px', color: 'var(--primary)' }} />
              <p style={{ fontSize: '16px', marginBottom: '20px' }}>Enlace de video externo listo para reproducir</p>
              <a
                href={content.videoLink}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ padding: '12px 28px', textDecoration: 'none' }}
              >
                Abrir Video Externo
              </a>
            </div>
          )
        )}
      </div>

      {/* Add To Folder Modal */}
      <AddToFolderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        contentId={content._id}
      />
    </div>
  );
};

export default VideotecaDetail;
