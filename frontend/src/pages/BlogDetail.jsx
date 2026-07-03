import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import AddToFolderModal from '../components/AddToFolderModal';
import { IoArrowBack, IoFolder, IoLockClosed, IoCheckmarkCircle } from 'react-icons/io5';

const BlogDetail = () => {
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
          setError('No se pudo cargar el artículo.');
        }
      } catch (err) {
        console.error('Error fetching blog detail:', err);
        setError(err.response?.data?.message || 'Error al cargar el artículo. Es posible que no exista o no tengas permisos.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  if (loading || authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '18px', color: 'var(--gray-500)', fontFamily: 'var(--font-sans)' }}>
        Cargando contenido...
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
            {error || 'El artículo que buscas no existe o ha sido removido.'}
          </p>
          <button onClick={() => navigate('/blogs')} className="btn-primary">
            Volver a Artículos
          </button>
        </div>
      </div>
    );
  }

  // Access check logic
  const isFree = content.accessType === 'free';
  const isSubscribed = user && (user.membership === 'premium' || user.isSubscribed === true);
  const isOwned = user && user.purchasedItems && user.purchasedItems.some(
    (item) => (item._id || item) === content._id
  );
  const hasAccess = isFree || (content.accessType === 'subscription' && isSubscribed) || (content.accessType === 'one-time-purchase' && isOwned);

  // Formatter for publish date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

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

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '60px', fontFamily: 'var(--font-sans)', backgroundColor: '#ffffffff' }}>
      {/* Back Link & Add to Folder */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button
          onClick={() => navigate('/blogs')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--gray-600)',
            fontWeight: '700',
            textTransform: 'uppercase',
            fontSize: '13px',
            letterSpacing: '1px',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray-600)'}
        >
          <IoArrowBack size={16} /> Volver al Listado
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
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          {content.category && (
            <span className="lift-badge">
              {content.category.name || content.category}
            </span>
          )}
          <span style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: '600' }}>
            Publicado el {formatDate(content.publishDate || content.createdAt)}
          </span>
        </div>

        <h1 style={{
          fontSize: '38px',
          fontWeight: '900',
          color: 'var(--dark)',
          lineHeight: '1.25',
          textTransform: 'uppercase',
          letterSpacing: '-0.5px',
          marginBottom: '16px'
        }}>
          {content.title}
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--gray-500)', lineHeight: '1.6', margin: 0, fontWeight: '400', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
          {content.description}
        </p>
      </div>

      {/* Main Cover Banner */}
      <div style={{
        width: '100%',
        height: '420px',
        borderRadius: '24px',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        marginBottom: '40px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)'
      }}>
        <img
          src={content.cardImage || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop'}
          alt={content.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `center ${content.cardImagePosition || '50%'}`
          }}
        />
      </div>

      {/* Content Body / Paywall Block */}
      {!hasAccess ? (
        <div style={{
          border: '1px solid var(--border)',
          borderRadius: '24px',
          padding: '48px 32px',
          textAlign: 'center',
          backgroundColor: '#ffffff',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          marginBottom: '60px',
          marginTop: '20px'
        }}>
          <div style={{ color: 'var(--primary)', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}><IoLockClosed size={48} /></div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '900',
            color: 'var(--dark)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px'
          }}>
            Contenido Exclusivo
          </h2>
          <p style={{
            color: 'var(--gray-500)',
            fontSize: '16px',
            lineHeight: '1.6',
            maxWidth: '540px',
            margin: '0 auto 30px auto'
          }}>
            {content.accessType === 'subscription'
              ? 'Este artículo de investigación científica es exclusivo para miembros con Membresía Nico Lift Activa.'
              : 'Este artículo especial requiere la compra de pago único para desbloquear el acceso permanente.'}
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleAction} className="btn-primary" style={{ padding: '14px 36px' }}>
              {content.accessType === 'subscription' ? 'Suscribirse Ahora' : `Comprar Artículo ($${content.price || 0})`}
            </button>
            <button onClick={() => navigate('/login')} className="btn-secondary" style={{ padding: '14px 36px' }}>
              Iniciar Sesión
            </button>
          </div>
        </div>
      ) : (
        <article
          className="article-body"
          style={{
            fontSize: '18px',
            color: 'var(--dark)',
            lineHeight: '1.8',
            fontFamily: 'var(--font-sans)',
            marginBottom: '80px',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            maxWidth: '100%'
          }}
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
      )}

      {/* Add To Folder Modal */}
      <AddToFolderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        contentId={content._id}
      />

      {/* Custom Styles for Injected HTML elements */}
      <style>{`
        .article-body {
          word-break: break-word;
          overflow-wrap: break-word;
          max-width: 100%;
        }
        .article-body h2 {
          font-size: 26px;
          font-weight: 900;
          color: var(--dark);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 40px;
          margin-bottom: 16px;
          border-bottom: 2px solid var(--border);
          padding-bottom: 8px;
        }
        .article-body h3 {
          font-size: 22px;
          font-weight: 800;
          color: var(--dark);
          margin-top: 30px;
          margin-bottom: 12px;
        }
        .article-body p {
          margin-bottom: 24px;
        }
        .article-body strong {
          font-weight: 800;
        }
        .article-body em {
          font-style: italic;
        }
        .article-body img {
          max-width: 100%;
          height: auto;
          border-radius: 16px;
          border: 1px solid var(--border);
          margin: 32px 0;
          display: block;
        }
        .article-body iframe {
          max-width: 100%;
          border-radius: 16px;
          margin: 24px 0;
          display: block;
        }
        .article-body pre {
          max-width: 100%;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
          background-color: var(--gray-50);
          padding: 16px;
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        .article-body table {
          max-width: 100%;
          overflow-x: auto;
          display: block;
          border-collapse: collapse;
          margin: 24px 0;
        }
        .article-body blockquote {
          border-left: 4px solid var(--primary);
          padding-left: 20px;
          font-style: italic;
          color: var(--gray-500);
          margin: 30px 0;
        }
      `}</style>
    </div>
  );
};

export default BlogDetail;
