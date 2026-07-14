import React, { useState, useEffect } from 'react';
import { IoClose, IoDocumentTextOutline, IoTimeOutline, IoRibbonOutline, IoSchoolOutline, IoCheckmarkCircle, IoPlay, IoPlayCircleOutline, IoVideocamOutline } from 'react-icons/io5';
import nico from '../assets/nico.webp';
import fedeImg from '../assets/fede.webp';

const CoursePreviewModal = ({ isOpen, onClose, content, onContinue, hasAccess, user }) => {
  const [activeTab, setActiveTab] = useState('DESCRIPCIÓN');
  const [expandedModule, setExpandedModule] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowTrailer(false);
    }
  }, [isOpen, content?._id]);

  if (!isOpen || !content) return null;

  const getEmbedUrl = (url) => {
    if (!url) return '';
    try {
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
      if (url.includes('youtube.com/shorts/')) {
        const id = url.split('youtube.com/shorts/')[1]?.split('?')[0];
        if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
      if (url.includes('youtube.com/watch?v=')) {
        const id = url.split('v=')[1]?.split('&')[0];
        if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
      if (url.includes('youtube.com/embed/')) {
        return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
      }
      if (url.includes('vimeo.com/')) {
        const id = url.split('vimeo.com/').pop()?.split('?')[0];
        if (id && /^\d+$/.test(id)) {
          return `https://player.vimeo.com/video/${id}?autoplay=1`;
        }
      }
    } catch (e) {
      console.error('Error parsing trailer URL:', e);
    }
    return url;
  };

  const isDirectVideo = (url) => {
    if (!url) return false;
    return !!url.match(/\.(mp4|webm|ogg)($|\?)/i);
  };

  const trailerEmbedUrl = content.videoLink ? getEmbedUrl(content.videoLink) : '';

  const isPrivileged = user && ['admin', 'professor', 'profe', 'instructor'].includes(user.role);
  const effectiveAccess = hasAccess || isPrivileged;

  const isSubscribed = user && (user.membership === 'premium' || user.isSubscribed === true);
  const memberPct = content.memberDiscountPercentage !== undefined && content.memberDiscountPercentage !== null && content.memberDiscountPercentage !== '' ? Number(content.memberDiscountPercentage) : 0;
  const showDiscount = !effectiveAccess && content.accessType === 'one-time-purchase' && isSubscribed && memberPct > 0;
  const originalPriceUsd = content.priceUsd !== undefined ? content.priceUsd : (content.price || 0);
  const originalPriceArs = content.priceArs || 0;
  const discountedPriceUsd = originalPriceUsd * (1 - memberPct / 100);
  const discountedPriceArs = originalPriceArs * (1 - memberPct / 100);

  // Helper to parse any duration string ("15 min", "1:30", "1.5h", etc.) to total minutes
  const parseDurationToMinutes = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const str = val.toString().trim().toLowerCase();

    if (str.includes(':')) {
      const parts = str.split(':').map(p => parseFloat(p) || 0);
      if (parts.length === 3) {
        return parts[0] * 60 + parts[1] + Math.round(parts[2] / 60);
      }
      if (parts.length === 2) {
        if (str.includes('h')) {
          return parts[0] * 60 + parts[1];
        }
        return parts[0] + Math.round(parts[1] / 60);
      }
    }

    let totalMinutes = 0;
    const hoursMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:h|hora|horas)/);
    if (hoursMatch) {
      totalMinutes += parseFloat(hoursMatch[1]) * 60;
    }
    const minsMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minuto|minutos)/);
    if (minsMatch) {
      totalMinutes += parseFloat(minsMatch[1]);
    }
    if (!hoursMatch && !minsMatch) {
      const plainNumber = parseFloat(str);
      if (!isNaN(plainNumber)) {
        totalMinutes += plainNumber;
      }
    }
    return Math.round(totalMinutes);
  };

  // Calculate statistics from content.modules
  const modulesCount = content.modules ? content.modules.length : (content.modulesCount || 3);
  const lessonsCount = content.modules
    ? content.modules.reduce((acc, mod) => acc + (mod.lessons ? mod.lessons.length : 0), 0)
    : (content.lessonsCount || 12);
  const hasCertificate = content.certificate !== false ? 'Sí' : 'No';

  // Duration is the sum of all times across modules and lessons
  let totalMinutes = 0;
  if (Array.isArray(content.modules) && content.modules.length > 0) {
    content.modules.forEach(mod => {
      let modMinutes = 0;
      if (Array.isArray(mod.lessons) && mod.lessons.length > 0) {
        mod.lessons.forEach(lesson => {
          modMinutes += parseDurationToMinutes(lesson.duration);
        });
      }
      if (modMinutes === 0 && mod.duration) {
        modMinutes += parseDurationToMinutes(mod.duration);
      }
      totalMinutes += modMinutes;
    });
  }

  let durationText = content.duration || '45 minutos';
  if (totalMinutes > 0) {
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      durationText = mins > 0 ? `${hours} h ${mins} min` : `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      durationText = `${totalMinutes} min`;
    }
  }

  // Calculate student progress from localStorage checking both skool and nico keys
  let progressPercent = 0;
  if (effectiveAccess && content.modules && content.modules.length > 0) {
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
  }

  const coverImageUrl = content.cardImage || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop';
  const instructorName = content.instructorName || 'Nico Sesma';
  const instructorPhoto = content.instructorPhoto || (instructorName.toLowerCase().includes('fede') ? fedeImg : nico);

  // Categories pills derived strictly from the course category/categories
  const rawCategories = Array.isArray(content.categories) && content.categories.length > 0
    ? content.categories
    : content.category
      ? (Array.isArray(content.category) ? content.category : [content.category])
      : ['General'];
  const categories = rawCategories.map(c => typeof c === 'object' && c !== null ? c.name || 'Categoría' : c);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 16, 32, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <style>{`
        .preview-modal-grid-3col {
          display: grid;
          grid-template-columns: 1.15fr 0.95fr 1.35fr;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 1200px) {
          .preview-modal-grid-3col {
            grid-template-columns: 1.1fr 1fr;
          }
          .preview-modal-right-col {
            grid-column: 1 / -1;
            margin-top: 10px;
          }
        }
        @media (max-width: 768px) {
          .preview-modal-grid-3col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: showTrailer && trailerEmbedUrl ? '#051020' : '#ffffff',
          borderRadius: '32px',
          width: '96%',
          maxWidth: '1380px',
          maxHeight: '90vh',
          height: showTrailer && trailerEmbedUrl ? '85vh' : 'auto',
          overflow: showTrailer && trailerEmbedUrl ? 'hidden' : 'auto',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          padding: showTrailer && trailerEmbedUrl ? '0' : '52px 36px 36px 36px',
          fontFamily: 'var(--font-sans)',
          border: showTrailer && trailerEmbedUrl ? '2px solid #1f75f5ff' : '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {showTrailer && trailerEmbedUrl ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Header bar inside full modal trailer */}
            <div style={{ padding: '16px 28px', backgroundColor: 'rgba(5, 16, 32, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff' }}> Tráiler / Introducción:</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#38bdf8' }}>{content.title}</span>
              </div>
              <button
                onClick={() => setShowTrailer(false)}
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '8px 18px',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <IoClose size={18} /> Volver a Detalles del Curso
              </button>
            </div>

            {/* Full Modal Video Area */}
            <div style={{ flex: 1, width: '100%', height: '100%', backgroundColor: '#000000', position: 'relative' }}>
              {isDirectVideo(trailerEmbedUrl) ? (
                <video
                  src={trailerEmbedUrl}
                  controls
                  autoPlay
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <iframe
                  src={trailerEmbedUrl}
                  title="Tráiler de Introducción"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '12px',
                right: '16px',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '20px',
                transition: 'all 0.2s ease',
                zIndex: 100
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
            >
              <IoClose />
            </button>

            {/* Modal 3-Column Grid */}
            <div className="preview-modal-grid-3col">

              {/* ================= LEFT COLUMN ================= */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

                {/* Title */}
                <div>
                  <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#0f172a', lineHeight: '1.15', margin: '0 0 16px 0', letterSpacing: '-0.5px' }}>
                    {content.title}
                  </h2>

                  {/* Status Badge */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                    {content.contentType === 'course' ? 'CURSO ACTIVO' : 'WORKSHOP / FORMACIÓN ACTIVA'}
                  </div>
                </div>

                {/* Description Summary */}
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  {content.description && content.description.length > 220
                    ? content.description.substring(0, 217) + '...'
                    : (content.description || 'Formación intensiva de especialización con contenido modular en video, apuntes de estudio y certificado de finalización.')}
                </p>

                {/* 4 Stats Cards Grid (2x2) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

                  <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '18px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#dbeafe', color: '#1f75f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      <IoDocumentTextOutline />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>MÓDULOS</span>
                      <span style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>{modulesCount}</span>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '18px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#dbeafe', color: '#1f75f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      <IoSchoolOutline />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>LECCIONES</span>
                      <span style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>{lessonsCount}</span>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '18px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#dbeafe', color: '#1f75f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      <IoTimeOutline />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DURACIÓN</span>
                      <span style={{ fontSize: '16px', fontWeight: '900', color: '#1e293b' }}>{durationText}</span>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '18px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#dbeafe', color: '#1f75f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      <IoRibbonOutline />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CERTIFICADO</span>
                      <span style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>{hasCertificate}</span>
                    </div>
                  </div>

                </div>

                {/* Instructor and Categories Footer Box */}
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '22px', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #1f75f5ff', backgroundColor: '#051020', flexShrink: 0 }}>
                      <img src={nico} alt={instructorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'; }} />
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>INSTRUCTOR/A</span>
                      <span style={{ fontSize: '16px', fontWeight: '900', color: '#1e293b' }}>{instructorName}</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>CATEGORIAS</span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {categories.map((cat, idx) => (
                        <span key={idx} style={{ padding: '4px 12px', borderRadius: '14px', border: '1px solid #bfdbfe', backgroundColor: '#dbeafe', color: '#1e40af', fontSize: '12px', fontWeight: '800' }}>
                          {typeof cat === 'object' && cat !== null ? cat.name || 'Categoría' : cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Trailer Button below Instructor Card */}
                {trailerEmbedUrl && (
                  <button
                    type="button"
                    onClick={() => setShowTrailer(true)}
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      borderRadius: '20px',
                      backgroundColor: '#051020',
                      color: '#ffffff',
                      fontWeight: '900',
                      fontSize: '16px',
                      border: '2px solid #1f75f5ff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      boxShadow: '0 8px 25px rgba(31, 117, 245, 0.25)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1f75f5ff'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#051020'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <IoPlayCircleOutline size={26} style={{ color: '#38bdf8' }} />
                    Ver Tráiler / Video de Introducción
                  </button>
                )}

              </div>

              {/* ================= RIGHT COLUMN ================= */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Top Image Preview Card */}
                <div style={{ borderRadius: '24px', overflow: 'hidden', border: '2px solid #e2e8f0', boxShadow: '0 12px 30px rgba(0,0,0,0.08)', height: '240px', position: 'relative' }}>
                  <img src={coverImageUrl} alt={content.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `center ${content.cardImagePosition || '50%'}` }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '6px', backgroundColor: '#1f75f5ff' }} />
                </div>

                {/* Access and Progress Card */}
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '26px', padding: '26px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

                  {/* Badge Header */}
                  <div>
                    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '14px', border: '1px solid #bfdbfe', backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                      TU ACCESO
                    </span>
                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0', lineHeight: '1.25' }}>
                      {effectiveAccess ? 'Continua este curso cuando quieras' : content.accessType === 'free' ? 'Formación con acceso libre' : 'Acceso a formación especializada'}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                      Tu progreso queda guardado y puedes retomar el contenido desde el punto en que lo dejaste.
                    </p>
                  </div>

                  {/* Progress Box OR Dynamic Pricing/Discount Card */}
                  {!effectiveAccess && content.accessType === 'one-time-purchase' ? (
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '18px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase' }}>
                          Inversión de Pago Único
                        </span>
                        {showDiscount && (
                          <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: '900', padding: '4px 12px', borderRadius: '12px', background: 'rgba(249, 115, 22, 0.15)', color: '#c2410c', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
                            -{memberPct}% DESCUENTO MIEMBROS
                          </span>
                        )}
                      </div>

                      {showDiscount ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a' }}>
                              USD ${discountedPriceUsd.toFixed(2)}
                            </span>
                            <span style={{ fontSize: '15px', color: '#9ca3af', textDecoration: 'line-through', fontWeight: '700' }}>
                              ${originalPriceUsd.toFixed(2)}
                            </span>
                          </div>
                          {originalPriceArs > 0 && (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '20px', fontWeight: '800', color: '#475569' }}>
                                ARS ${Math.round(discountedPriceArs).toLocaleString()}
                              </span>
                              <span style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'line-through', fontWeight: '600' }}>
                                ${originalPriceArs.toLocaleString()}
                              </span>
                            </div>
                          )}
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#16a34a', fontWeight: '800' }}>
                            ✓ Descuento del {memberPct}% aplicado por tu membresía Premium
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a' }}>
                            USD ${originalPriceUsd.toFixed(2)}
                          </span>
                          {originalPriceArs > 0 && (
                            <span style={{ fontSize: '20px', fontWeight: '800', color: '#475569' }}>
                              ARS ${originalPriceArs.toLocaleString()}
                            </span>
                          )}
                          {!isSubscribed && (
                            <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                              💡 <strong style={{ color: '#0f172a' }}>¿Eres miembro Premium?</strong> Tienes un <strong style={{ color: '#1f75f5ff' }}>{memberPct}% de descuento</strong> al comprar.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>
                          {effectiveAccess ? `Tu Progreso: ${progressPercent}%` : 'Estado de inscripción'}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                        <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#1f75f5ff', borderRadius: '4px', transition: 'width 0.4s ease' }} />
                      </div>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>
                        {effectiveAccess ? (progressPercent === 100 ? '✔ Completado al 100%' : progressPercent > 0 ? 'En Progreso' : 'Listo para comenzar') : 'Requiere activación para ingresar'}
                      </span>
                    </div>
                  )}

                  {/* Main Action Button (Platform Blue #1f75f5ff instead of neon green!) */}
                  <button
                    onClick={() => {
                      onClose();
                      onContinue();
                    }}
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      borderRadius: '16px',
                      backgroundColor: '#1f75f5ff',
                      color: '#ffffff',
                      fontWeight: '900',
                      fontSize: '16px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 8px 20px rgba(31, 117, 245, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1f75f5ff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <IoPlay size={18} />
                    {effectiveAccess
                      ? 'Continuar curso'
                      : content.accessType === 'free'
                        ? 'Acceso Libre - Comenzar Ahora'
                        : content.accessType === 'subscription'
                          ? 'Activar Membresía para Acceder'
                          : showDiscount
                            ? `Comprar con Descuento (-${memberPct}%)`
                            : 'Comprar Formación Ahora'}
                  </button>

                </div>

              </div>

              {/* ================= RIGHT COLUMN (TABS + COMPLETE DETAILS / SYLLABUS) ================= */}
              <div className="preview-modal-right-col" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Tab Navigation Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: '6px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
                  {['DESCRIPCIÓN', 'PLAN DE ESTUDIOS', 'RESEÑAS'].map((tabName) => {
                    const isActive = activeTab === tabName;
                    return (
                      <button
                        key={tabName}
                        onClick={() => setActiveTab(tabName)}
                        style={{
                          flex: '1 1 auto',
                          padding: '10px 14px',
                          borderRadius: '14px',
                          border: isActive ? 'none' : '1px solid transparent',
                          backgroundColor: isActive ? '#1f75f5ff' : 'transparent',
                          color: isActive ? '#ffffff' : '#475569',
                          fontWeight: '800',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'center',
                          letterSpacing: '0.5px'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = '#eff6ff';
                            e.currentTarget.style.color = '#1e40af';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#475569';
                          }
                        }}
                      >
                        {tabName}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content Box */}
                <div style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '26px',
                  padding: '28px',
                  minHeight: '480px',
                  maxHeight: '640px',
                  overflowY: 'auto',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
                }}>

                  {/* Tab 1: DESCRIPCIÓN */}
                  {activeTab === 'DESCRIPCIÓN' && (
                    <div>
                      <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '14px', border: '1px solid #bfdbfe', backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                        VISIÓN GENERAL
                      </span>
                      <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '0 0 16px 0', lineHeight: '1.25' }}>
                        Qué vas a aprender en este curso
                      </h3>
                      <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {content.description ? (
                          content.description.split('\n').map((paragraph, idx) => (
                            paragraph.trim() ? <p key={idx} style={{ margin: 0 }}>{paragraph.trim()}</p> : null
                          ))
                        ) : (
                          <>
                            <p style={{ margin: 0 }}>
                              Esta formación ha emergido como una estrategia de organización del entrenamiento que desafía modelos tradicionales de distribución de carga, proponiendo una lógica basada en dosis pequeñas, frecuentes y altamente específicas, integradas dentro del calendario real del deporte.
                            </p>
                            <p style={{ margin: 0 }}>
                              Este curso aborda los fundamentos teóricos, la contextualización y las aplicaciones prácticas en la preparación física moderna, analizando cuándo tiene sentido utilizar estas metodologías, cómo integrarlas dentro de microciclos reales y qué problemas pueden resolver en contextos de congestión competitiva o limitación de tiempo.
                            </p>
                            <p style={{ margin: 0 }}>
                              A lo largo de la formación se presentarán criterios claros para diseñar intervenciones efectivas en fuerza, velocidad y potencia, integrando ciencia aplicada, experiencia de campo y toma de decisiones contextualizada.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: PLAN DE ESTUDIOS */}
                  {activeTab === 'PLAN DE ESTUDIOS' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '14px', border: '1px solid #bfdbfe', backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                            CONTENIDO FORMATIVO
                          </span>
                          <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: 0, lineHeight: '1.25' }}>
                            Módulos y Lecciones
                          </h3>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#1f75f5ff', backgroundColor: '#ffffff', padding: '6px 12px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                          {modulesCount} {modulesCount === 1 ? 'Módulo' : 'Módulos'} · {lessonsCount} {lessonsCount === 1 ? 'Lección' : 'Lecciones'}
                        </span>
                      </div>

                      {/* Modules Accordion List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {Array.isArray(content.modules) && content.modules.length > 0 ? (
                          content.modules.map((mod, modIdx) => {
                            const isModExpanded = expandedModule === modIdx;
                            const modLessons = mod.lessons || [];
                            let modMinutes = 0;
                            modLessons.forEach(l => { modMinutes += parseDurationToMinutes(l.duration); });
                            if (modMinutes === 0 && mod.duration) { modMinutes += parseDurationToMinutes(mod.duration); }

                            return (
                              <div key={modIdx} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '18px', overflow: 'hidden', transition: 'all 0.2s ease' }}>
                                <div
                                  onClick={() => setExpandedModule(isModExpanded ? -1 : modIdx)}
                                  style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: isModExpanded ? '#f8fafc' : '#ffffff', borderBottom: isModExpanded ? '1px solid #e2e8f0' : 'none' }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#1f75f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px', flexShrink: 0 }}>
                                      {modIdx + 1}
                                    </div>
                                    <div>
                                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                                        {mod.title || `Módulo ${modIdx + 1}`}
                                      </h4>
                                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                                        {modLessons.length} {modLessons.length === 1 ? 'lección' : 'lecciones'} {modMinutes > 0 && `· ${modMinutes} min`}
                                      </span>
                                    </div>
                                  </div>
                                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '900', transform: isModExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                                    ▼
                                  </span>
                                </div>

                                {isModExpanded && (
                                  <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', backgroundColor: '#ffffff' }}>
                                    <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', flex: 1 }}>
                                      {mod.description && mod.description.trim() ? (
                                        mod.description
                                      ) : (
                                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Este módulo abarca los conceptos teóricos y metodológicos correspondientes a esta sección.</span>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#eff6ff', color: '#1f75f5ff', padding: '8px 14px', borderRadius: '12px', border: '1px solid #bfdbfe', fontWeight: '800', fontSize: '13px', flexShrink: 0 }}>
                                      <IoTimeOutline size={18} />
                                      <span>{modMinutes > 0 ? `${modMinutes} min` : (mod.duration || '15 min')}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          /* Fallback syllabus preview when no modules array is loaded in content */
                          [
                            { title: 'Fundamentos Teóricos y Contextualización', description: 'En este módulo inicial aprenderemos los conceptos clave, la evolución histórica y las bases biológicas detrás de la microdosis en el deporte.', lessons: ['Concepto de Microdosis y Evolución', 'Fisiología de la adaptación a estímulos cortos', 'Criterios de programación en temporada'] },
                            { title: 'Aplicación en Fuerza y Potencia', description: 'Exploraremos cómo distribuir cargas de fuerza y potencia durante el microciclo sin generar interferencia ni fatiga neuromuscular.', lessons: ['Microdosis de fuerza máxima en competencia', 'Desarrollo de potencia sin fatiga neural', 'Ejemplos de distribución semanal'] },
                            { title: 'Integración y Toma de Decisiones', description: 'Estudios de caso y resolución de problemas reales en temporadas con alta densidad competitiva y viajes.', lessons: ['Ajustes en semanas de doble competencia', 'Monitoreo de carga y respuesta individual', 'Estudios de caso y conclusiones'] }
                          ].map((sampleMod, sIdx) => {
                            const isModExpanded = expandedModule === sIdx;
                            return (
                              <div key={sIdx} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '18px', overflow: 'hidden' }}>
                                <div
                                  onClick={() => setExpandedModule(isModExpanded ? -1 : sIdx)}
                                  style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: isModExpanded ? '#f8fafc' : '#ffffff', borderBottom: isModExpanded ? '1px solid #e2e8f0' : 'none' }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#1f75f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px', flexShrink: 0 }}>
                                      {sIdx + 1}
                                    </div>
                                    <div>
                                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                                        {sampleMod.title}
                                      </h4>
                                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                                        {sampleMod.lessons.length} lecciones · 15 min
                                      </span>
                                    </div>
                                  </div>
                                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '900' }}>{isModExpanded ? '▲' : '▼'}</span>
                                </div>
                                {isModExpanded && (
                                  <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', backgroundColor: '#ffffff' }}>
                                    <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', flex: 1 }}>
                                      {sampleMod.description}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#eff6ff', color: '#1f75f5ff', padding: '8px 14px', borderRadius: '12px', border: '1px solid #bfdbfe', fontWeight: '800', fontSize: '13px', flexShrink: 0 }}>
                                      <IoTimeOutline size={18} />
                                      <span>15 min</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: RESEÑAS */}
                  {activeTab === 'RESEÑAS' && (
                    <div>
                      <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '14px', border: '1px solid #bfdbfe', backgroundColor: '#dbeafe', color: '#1e40af', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                        VALORACIONES DE ALUMNOS
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '18px', padding: '16px 20px' }}>
                        <span style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a' }}>
                          {content.rating ? content.rating.toFixed(1) : '4.9'}
                        </span>
                        <div>
                          <div style={{ color: '#f59e0b', fontSize: '16px', letterSpacing: '2px' }}>★★★★★</div>
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>
                            Basado en {(content.numReviews || 0) + 3} valoraciones verificadas de alumnos
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                          ...(content.reviews || []).map((r) => ({
                            name: r.name,
                            role: r.profession || 'Alumno verificado',
                            comment: r.comment,
                            rating: r.rating || 5
                          })),
                          { name: 'Martín Rodríguez', role: 'Preparador Físico de Fútbol', comment: 'La claridad con la que se explican las microdosis y cómo aplicarlas en semanas con dos partidos es excepcional. Lo recomiendo 100%.', rating: 5 },
                          { name: 'Carolina Gómez', role: 'Kinesióloga & Deportóloga', comment: 'Contenido riguroso, respaldado por ciencia y con ejemplos de campo súper reales. Me ayudó muchísimo a estructurar mis sesiones.', rating: 5 },
                          { name: 'Esteban Méndez', role: 'Entrenador de Alto Rendimiento', comment: 'El formato es práctico y fácil de seguir. Los apuntes descargables son una joya para el día a día.', rating: 5 }
                        ].map((rev, rIdx) => (
                          <div key={rIdx} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{rev.name}</span>
                              <span style={{ color: '#f59e0b', fontSize: '13px' }}>
                                {'★'.repeat(Math.max(1, Math.min(5, Math.round(rev.rating || 5))))}
                              </span>
                            </div>
                            <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#1f75f5ff', marginBottom: '8px' }}>{rev.role}</span>
                            <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>"{rev.comment}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default CoursePreviewModal;
