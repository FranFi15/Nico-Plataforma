import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AddToFolderModal from './AddToFolderModal';
import CoursePreviewModal from './CoursePreviewModal';
import { IoFolderOpen, IoCheckmarkCircle, IoLockClosed } from 'react-icons/io5';

const getYouTubeThumbnail = (url) => {
  if (!url) return null;
  try {
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    if (url.includes('youtube.com/shorts/')) {
      const id = url.split('youtube.com/shorts/')[1]?.split('?')[0];
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
    if (url.includes('youtube.com/embed/')) {
      const id = url.split('youtube.com/embed/')[1]?.split('?')[0];
      if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    }
  } catch (e) {
    console.error(e);
  }
  return null;
};

const ContentCard = ({ content }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [buying, setBuying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Business Rules Checks
  const isPrivileged = user && ['admin', 'professor', 'profe', 'instructor'].includes(user.role);
  const isFree = content.accessType === 'free';
  const isCourseOrWorkshop = content.contentType === 'course' || content.contentType === 'workshop';
  const isSubscribed = user && (user.membership === 'premium' || user.isSubscribed === true);

  // Check if user already owns this content
  const isOwned = user && user.purchasedItems && user.purchasedItems.some(
    (item) => (item._id || item) === content._id
  );

  const hasAccess = isPrivileged || (isFree && (!isCourseOrWorkshop || !!user)) || (content.accessType === 'subscription' && isSubscribed) || (content.accessType === 'one-time-purchase' && isOwned);

  // Calculate course progress if started
  let progressPercent = 0;
  let hasStarted = false;
  if (isCourseOrWorkshop && content.modules && content.modules.length > 0) {
    let completedItems = [];
    try {
      const skool = JSON.parse(localStorage.getItem(`skool_completed_${content._id}`) || '[]');
      const nico = JSON.parse(localStorage.getItem(`nico_completed_${content._id}`) || '[]');
      completedItems = Array.from(new Set([...skool, ...nico]));
    } catch (e) {
      completedItems = [];
    }
    const totalItems = content.modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 1;
    const completedCount = content.modules.reduce(
      (acc, mod) => acc + (mod.lessons || []).filter((l) => completedItems.includes(l.id)).length,
      0
    );
    progressPercent = Math.round((completedCount / totalItems) * 100) || 0;
    hasStarted = completedCount > 0 || completedItems.length > 0;
  }

  // Determine what button action is needed
  let actionText = '';
  let handleAction = () => { };
  let buttonStyle = 'btn-primary';

  const navigateToDetail = () => {
    if (content.contentType === 'blog') {
      navigate(`/blogs/${content._id}`);
    } else if (content.contentType === 'videoteca') {
      navigate(`/videoteca/${content._id}`);
    } else if (content.contentType === 'course' || content.contentType === 'workshop') {
      navigate(`/cursos/${content._id}`);
    }
  };

  const handleCardInteraction = () => {
    if (isCourseOrWorkshop) {
      setPreviewModalOpen(true);
    } else if ((content.contentType === 'blog' || content.contentType === 'videoteca') && hasAccess) {
      navigateToDetail();
    } else {
      handleAction();
    }
  };

  const handleButtonClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isCourseOrWorkshop) {
      setPreviewModalOpen(true);
    } else {
      handleAction();
    }
  };

  if (isPrivileged || isFree) {
    actionText = content.contentType === 'blog' ? 'Leer artículo' : (isCourseOrWorkshop && hasStarted ? 'Continuar curso' : 'Ver ahora');
    handleAction = navigateToDetail;
  } else if (content.accessType === 'subscription') {
    if (isSubscribed) {
      actionText = content.contentType === 'blog' ? 'Leer artículo' : (isCourseOrWorkshop && hasStarted ? 'Continuar curso' : 'Ver ahora');
      handleAction = navigateToDetail;
    } else {
      actionText = 'Activar membresía';
      handleAction = () => {
        if (!user) {
          alert('Por favor, inicia sesión para suscribirte');
          navigate('/login');
          return;
        }
        navigate('/checkout');
      };
      buttonStyle = 'btn-secondary';
    }
  } else if (content.accessType === 'one-time-purchase') {
    if (isOwned) {
      actionText = content.contentType === 'blog' ? 'Leer artículo' : (isCourseOrWorkshop && hasStarted ? 'Continuar curso' : 'Ver ahora');
      handleAction = navigateToDetail;
    } else {
      actionText = 'Comprar ahora';
      handleAction = () => {
        if (!user) {
          alert('Por favor, inicia sesión para realizar la compra');
          navigate('/login');
          return;
        }
        navigate(`/checkout?contentId=${content._id}`);
      };
    }
  }

  // Price rendering calculation
  const showDiscount = content.accessType === 'one-time-purchase' && !isOwned && isSubscribed;
  const originalPriceUsd = content.priceUsd !== undefined ? content.priceUsd : (content.price || 0);
  const originalPriceArs = content.priceArs || 0;
  const discountedPriceUsd = originalPriceUsd * 0.8;
  const discountedPriceArs = originalPriceArs * 0.8;

  // Badge mapping
  const typeNameSp = content.contentType === 'course'
    ? 'Curso Práctico'
    : content.contentType === 'workshop'
      ? 'Taller / Workshop'
      : 'Artículo Científico';

  // Default fitness image if none provided
  const videoThumbnail = content.contentType === 'videoteca' ? getYouTubeThumbnail(content.videoLink) : null;
  const showCardImage = content.contentType !== 'videoteca' || !!videoThumbnail || !!content.cardImage;
  const cardImgUrl = videoThumbnail || content.cardImage || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop';

  const truncatedTitle = content.title && content.title.length > 55 ? content.title.substring(0, 52) + '...' : content.title;
  const truncatedDesc = content.description && content.description.length > 100 ? content.description.substring(0, 97) + '...' : content.description;
  const truncatedHoverTitle = content.title && content.title.length > 65 ? content.title.substring(0, 62) + '...' : content.title;

  return (
    <>
      <article
        className="premium-card"
        onMouseEnter={() => !isCourseOrWorkshop && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: showCardImage ? '440px' : '260px',
          padding: 0,
          overflow: 'hidden',
          position: 'relative',
          filter: hasAccess ? 'none' : 'grayscale(70%)',
          opacity: hasAccess ? 1 : 0.85,
          backgroundColor: hasAccess ? '#ffffff' : '#f8fafc',
          transition: 'all 0.3s ease'
        }}
      >
        {/* 1. Standard Content view */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div>
            {/* Card Image Header */}
            {showCardImage && (
              <div
                onClick={handleCardInteraction}
                style={{
                  width: '100%',
                  height: '180px',
                  borderBottom: '1px solid var(--border)',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <img
                  src={cardImgUrl}
                  alt={content.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: `center ${content.cardImagePosition || '50%'}`
                  }}
                />

                {/* Lock Icon overlay if no access */}
                {!hasAccess && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
                    color: '#ffffff',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    zIndex: 2
                  }}>
                    <IoLockClosed size={16} />
                  </div>
                )}

                {/* Top Left Badge for Courses and Workshops */}
                {isCourseOrWorkshop && (
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: content.contentType === 'course' ? 'var(--primary)' : '#f59e0b',
                    color: '#ffffff',
                    padding: '6px 12px',
                    fontSize: '10px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderRadius: '20px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    zIndex: 2
                  }}>
                    {typeNameSp}
                  </span>
                )}

                {content.category && (
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(43, 45, 47, 0.85)',
                    backdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px'
                  }}>
                    {typeof content.category === 'object' && content.category !== null ? content.category.name || 'Categoría' : content.category}
                  </span>
                )}
              </div>
            )}

            <div style={{ padding: '24px 24px 0 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', minHeight: '20px' }}>
                {!hasAccess && !showCardImage && (
                  <span style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    <IoLockClosed size={14} /> Bloqueado
                  </span>
                )}
                <span style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginLeft: 'auto' }}>
                  {content.accessType === 'subscription' && 'Membresía'}
                  {content.accessType === 'one-time-purchase' && 'Pago Único'}
                </span>
              </div>

              <h3
                onClick={handleCardInteraction}
                style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: 'var(--dark)',
                  marginBottom: '12px',
                  lineHeight: '1.4',
                  cursor: (content.contentType === 'blog' || content.contentType === 'videoteca') ? 'pointer' : 'default',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {truncatedTitle}
              </h3>
              <p style={{
                color: 'var(--gray-500)',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '24px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                wordWrap: 'break-word',
                whiteSpace: 'normal'
              }}>
                {truncatedDesc}
              </p>
            </div>
          </div>

          <div style={{ padding: '0 24px 24px 24px', marginTop: 'auto' }}>
            {/* Pricing section */}
            {content.accessType === 'one-time-purchase' && !isOwned && (
              <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {showDiscount ? (
                  <>
                    {originalPriceArs > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--dark)' }}>
                          ARS ${Math.round(discountedPriceArs).toLocaleString()}
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--gray-400)', textDecoration: 'line-through' }}>
                          ${originalPriceArs.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--gray-500)' }}>
                        USD ${discountedPriceUsd.toFixed(2)}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--gray-400)', textDecoration: 'line-through' }}>
                        ${originalPriceUsd.toFixed(2)}
                      </span>
                    </div>
                    <span className="lift-badge" style={{ fontSize: '9px', width: 'fit-content' }}>
                      -20% MIEMBROS
                    </span>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {originalPriceArs > 0 && (
                      <span style={{ fontSize: '22px', fontWeight: '900', color: 'var(--dark)' }}>
                        ARS ${originalPriceArs.toLocaleString()}
                      </span>
                    )}
                    <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--gray-500)' }}>
                      USD ${originalPriceUsd.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Free or already owned price tag spacer */}
            {isOwned && (
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IoCheckmarkCircle size={14} /> Acceso Concedido
                </span>
              </div>
            )}

            {/* Subscription content unlocked price tag spacer */}
            {content.accessType === 'subscription' && !isOwned && (
              <div style={{ marginBottom: '20px' }}>
                {isSubscribed ? (
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IoCheckmarkCircle size={14} /> Desbloqueado con Premium
                  </span>
                ) : (
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-400)' }}>
                    Membresía Requerida
                  </span>
                )}
              </div>
            )}

            {/* Course Progress Bar for started courses */}
            {isCourseOrWorkshop && hasStarted && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Tu Progreso
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '900', color: 'var(--dark)' }}>
                    {progressPercent}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            )}

            <button
              onClick={handleButtonClick}
              className={buttonStyle}
              disabled={buying}
              style={{ width: '100%', padding: '12px' }}
            >
              {buying ? 'Procesando...' : actionText}
            </button>
          </div>
        </div>

        {/* 2. Interactive Hover Overlay (Disabled for courses/workshops since preview modal handles details) */}
        {!isCourseOrWorkshop && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#010d19d9',
            backdropFilter: 'blur(4px)',
            zIndex: 10,
            padding: '30px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isHovered ? 'translateY(0)' : 'translateY(101%)',
            opacity: isHovered ? 1 : 0,
            pointerEvents: isHovered ? 'auto' : 'none',
            border: '1px solid var(--primary)',
            borderRadius: '12px',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', minHeight: '28px' }}>
                {isCourseOrWorkshop ? (
                  <span style={{
                    fontSize: '10px',
                    backgroundColor: content.contentType === 'course' ? 'var(--primary)' : '#f59e0b',
                    color: '#ffffff',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}>
                    {typeNameSp}
                  </span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user) {
                        alert('Por favor, inicia sesión para guardar en tus carpetas.');
                        navigate('/login');
                        return;
                      }
                      setModalOpen(true);
                    }}
                    style={{
                      fontSize: '11px',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    + Carpeta
                  </button>
                )}
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {content.accessType === 'subscription' && 'Premium'}
                  {content.accessType === 'one-time-purchase' && 'Compra'}
                  {content.accessType === 'free' && 'Gratis'}
                </span>
              </div>

              <h4 style={{
                fontSize: '18px',
                fontWeight: '800',
                color: 'var(--white)',
                marginBottom: '10px',
                lineHeight: '1.3',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {truncatedHoverTitle}
              </h4>
              <p style={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '13px',
                lineHeight: '1.5',
                marginBottom: '16px',
                maxHeight: '160px',
                overflowY: 'auto'
              }}>
                {content.description || 'Sin descripción detallada.'}
              </p>
            </div>

            <div style={{ marginTop: 'auto' }}>
              {content.accessType === 'one-time-purchase' && !isOwned && (
                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {showDiscount ? (
                    <>
                      {originalPriceArs > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--white)' }}>
                            ARS ${Math.round(discountedPriceArs).toLocaleString()}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--white)', textDecoration: 'line-through', opacity: 0.7 }}>
                            ${originalPriceArs.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.7)' }}>
                          USD ${discountedPriceUsd.toFixed(2)}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--white)', textDecoration: 'line-through', opacity: 0.7 }}>
                          ${originalPriceUsd.toFixed(2)}
                        </span>
                      </div>
                      <span className="lift-badge" style={{ fontSize: '9px', padding: '4px 10px', width: 'fit-content' }}>
                        -20% MIEMBROS
                      </span>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {originalPriceArs > 0 && (
                        <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--white)' }}>
                          ARS ${originalPriceArs.toLocaleString()}
                        </span>
                      )}
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.7)' }}>
                        USD ${originalPriceUsd.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {isOwned && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IoCheckmarkCircle size={14} /> Acceso Concedido
                  </span>
                </div>
              )}

              {content.accessType === 'subscription' && !isOwned && (
                <div style={{ marginBottom: '16px' }}>
                  {isSubscribed ? (
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IoCheckmarkCircle size={14} /> Desbloqueado con Premium
                    </span>
                  ) : (
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray-400)' }}>
                      Membresía Requerida
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={handleButtonClick}
                className={buttonStyle}
                disabled={buying}
                style={{ width: '100%', backgroundColor: 'var(--primary)', color: 'var(--white)', }}
              >
                {buying ? 'Procesando...' : actionText}
              </button>
            </div>
          </div>
        )}
      </article >
      <AddToFolderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        contentId={content._id}
      />
      <CoursePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        content={content}
        hasAccess={hasAccess}
        user={user}
        onContinue={() => {
          if (hasAccess) {
            navigateToDetail();
          } else {
            handleAction();
          }
        }}
      />
    </>
  );
};

export default ContentCard;
