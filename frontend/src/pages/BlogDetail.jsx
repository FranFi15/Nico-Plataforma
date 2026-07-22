import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import AddToFolderModal from '../components/AddToFolderModal';
import ContentCard from '../components/ContentCard';
import { IoArrowBack, IoFolder, IoLockClosed, IoCheckmarkCircle, IoEyeOffOutline, IoDocumentAttachOutline, IoDownloadOutline } from 'react-icons/io5';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [content, setContent] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchContent = async () => {
      setLoading(true);
      setError('');
      try {
        const [response, blogsRes] = await Promise.all([
          api.get(`/content/${id}`),
          api.get('/content?type=blog').catch(() => ({ data: { success: false } }))
        ]);

        if (response.data && response.data.success) {
          const currentContent = response.data.data;
          setContent(currentContent);

          if (blogsRes.data && blogsRes.data.success) {
            const allBlogs = (blogsRes.data.data || [])
              .filter(c => c.isPublished !== false && c.status !== 'draft')
              .sort((a, b) => {
                const dateA = new Date(a.publishDate || a.createdAt || 0);
                const dateB = new Date(b.publishDate || b.createdAt || 0);
                return dateB - dateA;
              });

            const currentCatIds = currentContent.categories?.length > 0 
              ? currentContent.categories.map(c => c._id || c) 
              : (currentContent.category ? [currentContent.category._id || currentContent.category] : []);
            
            const currentIndex = allBlogs.findIndex(b => b._id === currentContent._id);
            
            // "creados más tarde" = newer blogs. In the descending list, these are before currentIndex.
            // Reverse to get the immediately newer one first.
            const newerBlogs = currentIndex !== -1 ? allBlogs.slice(0, currentIndex).reverse() : [];
            const olderBlogs = currentIndex !== -1 ? allBlogs.slice(currentIndex + 1) : allBlogs.filter(b => b._id !== currentContent._id);
            
            const candidateOrder = [...newerBlogs, ...olderBlogs];

            const matchingBlogs = [];
            const otherBlogs = [];

            candidateOrder.forEach(b => {
              const bCatIds = b.categories?.length > 0 
                ? b.categories.map(c => c._id || c) 
                : (b.category ? [b.category._id || b.category] : []);
              
              const hasMatch = bCatIds.some(id => currentCatIds.includes(id));
              if (hasMatch) {
                matchingBlogs.push(b);
              } else {
                otherBlogs.push(b);
              }
            });

            const nextThree = [...matchingBlogs, ...otherBlogs].slice(0, 3);
            setRelatedBlogs(nextThree);
          }
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

  const isDraft = content && (content.isPublished === false || content.status === 'draft');
  const canAccessDraft = user && user.role === 'admin';

  if (error || !content || (isDraft && !canAccessDraft)) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
        <div style={{ padding: '40px', border: '1px solid var(--border)', borderRadius: '24px', backgroundColor: '#ffffff', boxShadow: '0 8px 25px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444', marginBottom: '16px', textTransform: 'uppercase' }}>
            {isDraft ? 'Artículo en Borrador' : 'Error al Cargar'}
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '16px', marginBottom: '24px' }}>
            {isDraft
              ? 'Este artículo se encuentra actualmente en borrador y no está disponible públicamente.'
              : error || 'El artículo que buscas no existe o ha sido removido.'}
          </p>
          <button onClick={() => navigate('/blogs')} className="btn-primary">
            Volver a Artículos
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
    <>
      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '60px', fontFamily: 'var(--font-sans)', backgroundColor: '#ffffffff' }}>
      {isDraft && (
        <div style={{ padding: '16px 20px', backgroundColor: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <IoEyeOffOutline size={28} color="#d97706" />
          <div>
            <strong style={{ color: '#b45309', fontSize: '15px', display: 'block' }}>Modo Vista Previa de Borrador (Solo para Administrador)</strong>
            <span style={{ color: '#92400e', fontSize: '13px' }}>Este artículo está guardado como borrador y está oculto al público. Puedes verlo aquí porque tienes permisos de administrador.</span>
          </div>
        </div>
      )}
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
              {typeof content.category === 'object' && content.category !== null ? content.category.name || 'Categoría' : content.category}
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
        <>
          <article
            className="blog-content"
            style={{
              fontSize: '18px',
              color: 'var(--dark)',
              lineHeight: '1.8',
              fontFamily: 'var(--font-sans)',
              marginBottom: content.attachments && content.attachments.length > 0 ? '40px' : '80px',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%'
            }}
            dangerouslySetInnerHTML={{ __html: content.body }}
          />

          {content.attachments && content.attachments.length > 0 && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '2px solid #cbd5e1',
              borderRadius: '20px',
              padding: '32px',
              marginBottom: '80px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '900',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                margin: '0 0 8px 0'
              }}>
                <IoDocumentAttachOutline size={26} color="#1f75f5" />
                Material Descargable del Artículo
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#64748b' }}>
                A continuación encontrarás los archivos adjuntos en PDF, videos o documentos listos para ver o descargar:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {content.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '16px 20px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '14px',
                      textDecoration: 'none',
                      color: '#0f172a',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#1f75f5';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(31, 117, 245, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                    }}
                  >
                    <span style={{ fontSize: '32px', flexShrink: 0 }}>
                      {att.fileType === 'pdf' ? '📄' : (['mp4', 'webm', 'mov'].includes(att.fileType) ? '🎬' : '📎')}
                    </span>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <strong style={{ display: 'block', fontSize: '15px', fontWeight: '800', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {att.title}
                      </strong>
                      <span style={{ fontSize: '12px', color: '#1f75f5', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <IoDownloadOutline size={14} /> Descargar / Ver ({att.fileType?.toUpperCase() || 'ARCHIVO'})
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>

    {/* Sección Te Puede Interesar Full Width */}
    {relatedBlogs && relatedBlogs.length > 0 && (
      <div style={{ width: '100%', backgroundColor: '#f8fafc', padding: '80px 40px', borderTop: '1px solid var(--border)', marginTop: '40px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '26px', fontWeight: '900', color: '#2B2D2F', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '36px', textAlign: 'center' }}>
            Te puede interesar
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
            {relatedBlogs.map((b) => (
              <ContentCard key={b._id} content={b} />
            ))}
          </div>
        </div>
      </div>
    )}

    {/* Add To Folder Modal */}
    <AddToFolderModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      contentId={content._id}
    />
  </>
  );
};

export default BlogDetail;
