import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import AddToFolderModal from '../components/AddToFolderModal';
import ReviewModal from '../components/ReviewModal';
import { IoArrowBack, IoFolderOpen, IoLockClosed, IoCheckmarkCircle, IoPlay, IoDocumentText, IoSchool, IoTime, IoChevronDown, IoChevronUp, IoCheckmarkDone, IoDownloadOutline, IoHelpCircleOutline, IoStar, IoSchoolOutline, IoMegaphoneOutline, IoDocumentTextOutline, IoInformationCircleOutline, IoTrophyOutline, IoCloseCircleOutline, IoRefreshOutline, IoChatbubbleOutline, IoVideocamOutline } from 'react-icons/io5';

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

const CursoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser, loading: authLoading } = useAuth();

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Skool Player Navigation State
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [completedItems, setCompletedItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`skool_completed_${id}`) || '[]');
    } catch (e) {
      return [];
    }
  });

  // Skool Lesson View Tab ('notes' vs 'attachments')
  const [lessonTab, setLessonTab] = useState('notes');

  // Skool Quiz State
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/content/${id}`);
        if (response.data && response.data.success && response.data.data) {
          setContent(response.data.data);
          // Set initial lesson if modules exist
          if (response.data.data.modules && response.data.data.modules.length > 0) {
            setActiveModuleIdx(0);
            setActiveLessonIdx(0);
          }
        } else {
          setError('No se pudo cargar la información del curso o workshop.');
        }
      } catch (err) {
        console.error('Error fetching course detail:', err);
        setError(err.response?.data?.message || 'Error al cargar el curso. Es posible que no exista o no esté disponible.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  // Save completed items to local storage
  const toggleItemCompleted = (itemId) => {
    setCompletedItems((prev) => {
      const updated = prev.includes(itemId)
        ? prev.filter((i) => i !== itemId)
        : [...prev, itemId];
      localStorage.setItem(`skool_completed_${id}`, JSON.stringify(updated));
      localStorage.setItem(`nico_completed_${id}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Reset quiz state when switching lessons
  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setLessonTab('notes');
  }, [activeModuleIdx, activeLessonIdx]);

  // Calculate overall progress safely at top level for hook rules
  const hasModules = content?.modules && content.modules.length > 0;
  const totalItemsCount = hasModules
    ? content.modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0)
    : 1;
  const completedCount = hasModules
    ? content.modules.reduce(
      (acc, mod) => acc + (mod.lessons || []).filter((l) => completedItems.includes(l.id)).length,
      0
    )
    : 0;
  const progressPercent = Math.round((completedCount / totalItemsCount) * 100) || 0;

  // Auto trigger Review Modal upon 100% course completion if not reviewed yet
  useEffect(() => {
    if (progressPercent === 100 && content && user) {
      const alreadyReviewedLocal = localStorage.getItem(`reviewed_course_${id}`);
      const alreadyReviewedBackend = content.reviews?.some((r) => r.user === user._id || r.user?._id === user._id);
      if (!alreadyReviewedLocal && !alreadyReviewedBackend) {
        const timer = setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'instant' });
          setShowReviewModal(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [progressPercent, content, user, id]);

  // Access check logic calculated safely at top level
  const isPrivileged = user && ['admin', 'professor', 'profe', 'instructor'].includes(user.role);
  const isFree = content?.accessType === 'free';
  const isSubscribed = user && (user.membership === 'premium' || user.isSubscribed === true);
  const isOwned = user && user.purchasedItems && content && user.purchasedItems.some(
    (item) => (item._id || item) === content._id
  );
  const hasAccess = isPrivileged || isFree || (content?.accessType === 'subscription' && isSubscribed) || (content?.accessType === 'one-time-purchase' && isOwned);

  useEffect(() => {
    if (content && user && !isPrivileged && !isOwned && hasAccess && (content.contentType === 'course' || content.contentType === 'workshop')) {
      api.post(`/content/${content._id}/enroll`)
        .then(res => {
          if (res.data?.success && refreshUser) {
            refreshUser();
          }
        })
        .catch(err => console.error('Error auto-enrolling in course detail:', err));
    }
  }, [content, user, isPrivileged, isOwned, hasAccess, refreshUser]);

  if (loading || authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0', fontSize: '18px', color: 'var(--gray-500)', fontFamily: 'var(--font-sans)' }}>
        <IoSchoolOutline size={48} color="#1f75f5ff" style={{ marginBottom: '16px' }} />
        Cargando aula virtual y contenidos...
      </div>
    );
  }

  if (error || !content) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
        <div style={{ padding: '40px', border: '1px solid var(--border)', borderRadius: '24px', backgroundColor: '#ffffff', boxShadow: '0 8px 25px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444', marginBottom: '16px', textTransform: 'uppercase' }}>
            Formación No Disponible
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '16px', marginBottom: '24px' }}>
            {error || 'El curso o workshop que buscas no existe o ha sido retirado.'}
          </p>
          <button onClick={() => navigate('/cursos')} className="btn-primary">
            Explora Todos los Cursos
          </button>
        </div>
      </div>
    );
  }

  // Access calculation already defined at top level for hook rules

  const handleEnrollManual = async () => {
    if (!user) {
      alert('Por favor, inicia sesión para anotarte en este curso.');
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/content/${content._id}/enroll`);
      if (res.data?.success && refreshUser) {
        await refreshUser();
        alert('✔ ¡Te has inscrito/anotado exitosamente en esta formación! Ahora recibirás las invitaciones a charlas Zoom y notificaciones de nuevos módulos.');
      }
    } catch (err) {
      console.error('Error manual enrollment:', err);
      alert('Hubo un error al registrar la inscripción.');
    }
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

  const getEmbedUrl = (url) => {
    if (!url) return '';
    try {
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtube.com/shorts/')) {
        const videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtube.com/embed/')) {
        return url;
      }
      if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/').pop()?.split('?')[0];
        if (videoId && /^\d+$/.test(videoId)) {
          return `https://player.vimeo.com/video/${videoId}`;
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

  const isCourse = content.contentType === 'course';
  const typeLabel = isCourse ? 'Curso de Especialización' : 'Taller Práctico (Workshop)';
  const coverImage = content.cardImage || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop';

  const currentModule = hasModules ? content.modules[activeModuleIdx] : null;
  const currentItem = currentModule && currentModule.lessons ? currentModule.lessons[activeLessonIdx] : null;

  useEffect(() => {
    if (currentItem && currentItem.type !== 'quiz') {
      if (currentItem.videoLink && lessonTab !== 'video') {
         setLessonTab('video');
      } else if (!currentItem.videoLink && lessonTab === 'video') {
         setLessonTab('notes');
      }
    }
  }, [currentItem?.id]);

  const handleReviewSubmit = async (reviewData) => {
    try {
      const response = await api.post(`/content/${id}/reviews`, reviewData);
      if (response.data && response.data.success) {
        setContent(response.data.data);
        localStorage.setItem(`reviewed_course_${id}`, 'true');
        return { success: true };
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      return { success: false, error: error.response?.data?.message || 'Error al enviar reseña' };
    }
    return { success: false, error: 'Error desconocido' };
  };

  // Quiz submission handler
  const handleQuizSubmit = () => {
    if (!currentItem || !currentItem.questions) return;
    let correct = 0;
    currentItem.questions.forEach((q, idx) => {
      if (quizAnswers[q.id] === q.correctOptionIndex) {
        correct++;
      }
    });
    const score = Math.round((correct / currentItem.questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    if (score >= (currentItem.passingScore || 70) && !completedItems.includes(currentItem.id)) {
      toggleItemCompleted(currentItem.id);
    }
  };

  // Next item navigation
  const goToNextItem = () => {
    if (!hasModules) return;
    if (activeLessonIdx + 1 < (currentModule.lessons?.length || 0)) {
      setActiveLessonIdx(activeLessonIdx + 1);
      window.scrollTo({ top: 350, behavior: 'smooth' });
    } else if (activeModuleIdx + 1 < content.modules.length) {
      setActiveModuleIdx(activeModuleIdx + 1);
      setActiveLessonIdx(0);
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '100%', margin: '20px auto', padding: '0 3vw 80px 3vw', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' }}>
      <style>{`
        @keyframes headerFadeSlideIn {
          0% { opacity: 0; transform: translateY(-30px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes coverPulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
        @keyframes sidebarPopIn {
          0% { opacity: 0; transform: translateX(-25px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes accordionExpand {
          0% { opacity: 0; transform: translateY(-10px); max-height: 0; }
          100% { opacity: 1; transform: translateY(0); max-height: 2000px; }
        }
        @keyframes lessonContentPop {
          0% { opacity: 0; transform: translateY(20px) scale(0.99); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes attachmentCardPop {
          0% { opacity: 0; transform: translateY(15px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes reviewCardEntry {
          0% { opacity: 0; transform: translateY(30px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes starPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
        }
        @keyframes floatInBottom {
          0% { opacity: 0; transform: translateY(40px) scale(0.85); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animated-course-header {
          animation: headerFadeSlideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animated-cover-img {
          animation: coverPulse 12s infinite alternate ease-in-out;
        }
        .animated-sidebar {
          animation: sidebarPopIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
          opacity: 0;
        }
        .animated-accordion-body {
          animation: accordionExpand 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animated-lesson-container {
          animation: lessonContentPop 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animated-attachment-card {
          animation: attachmentCardPop 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .animated-review-card {
          animation: reviewCardEntry 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .animated-star-btn {
          animation: starPulse 2.5s infinite;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animated-star-btn:hover {
          transform: translateY(-3px) scale(1.03);
          background-color: #dbeafe !important;
        }
        .animated-lesson-btn {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animated-lesson-btn:hover {
          transform: translateX(4px);
        }
      `}</style>

      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <button
          onClick={() => navigate('/cursos')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--dark)',
            textDecoration: 'none',
            fontWeight: '800',
            fontSize: '14px',
            backgroundColor: '#ffffff',
            padding: '10px 18px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1f75f5ff'; e.currentTarget.style.transform = 'translateX(-3px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateX(0)'; }}
        >
          <IoArrowBack size={18} />
          Volver al Catálogo
        </button>

        {user && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { window.scrollTo({ top: 0, behavior: 'instant' }); setShowReviewModal(true); }}
              className="animated-star-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                fontSize: '14px',
                margin: 0,
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                color: '#1f75f5ff',
                border: '1px solid #bfdbfe',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              <IoStar size={18} color="#f59e0b" />
              Dejar mi Reseña
            </button>
            <button
              onClick={handleAddToFolderClick}
              className="btn-translucent"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '14px', margin: 0, transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <IoFolderOpen size={18} color="#1f75f5ff" />
              Guardar en mi carpeta de estudio
            </button>
          </div>
        )}
      </div>

      {/* Course Header Banner */}
      <div className="animated-course-header" style={{
        backgroundColor: '#051020',
        borderRadius: '24px',
        padding: '32px 40px',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 15px 35px rgba(5, 16, 32, 0.2)',
        marginBottom: '32px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div className="animated-cover-img" style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '45%',
          backgroundImage: `url(${coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: `center ${content.cardImagePosition || '50%'}`,
          opacity: 0.15,
          pointerEvents: 'none',
          maskImage: 'linear-gradient(to right, transparent, black)'
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{
              backgroundColor: isCourse ? '#1f75f5ff' : '#38bdf8',
              color: '#ffffff',
              fontWeight: '900',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '5px 14px',
              borderRadius: '20px'
            }}>
              {typeLabel}
            </span>

            <span style={{
              backgroundColor: hasAccess ? 'rgba(31, 117, 245, 0.15)' : 'rgba(255, 255, 255, 0.1)',
              color: hasAccess ? '#38bdf8' : '#cbd5e1',
              border: `1px solid ${hasAccess ? '#38bdf8' : 'rgba(255,255,255,0.2)'}`,
              fontWeight: '800',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '4px 12px',
              borderRadius: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {hasAccess ? <IoCheckmarkCircle size={14} /> : <IoLockClosed size={14} />}
              {isFree ? 'Acceso Libre' : content.accessType === 'subscription' ? 'Membresía' : `USD $${content.priceUsd !== undefined ? content.priceUsd : (content.price || 0)} / ARS $${(content.priceArs || 0).toLocaleString()}`}
            </span>
          </div>

          <h1 style={{ fontSize: '36px', fontWeight: '900', lineHeight: '1.15', marginBottom: '12px', color: '#ffffff' }}>
            {content.title}
          </h1>

          <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#cbd5e1', maxWidth: '700px', margin: 0 }}>
            {content.description}
          </p>

          {/* Skool Progress Bar Header */}
          {hasAccess && hasModules && (
            <div style={{ marginTop: '24px', maxWidth: '400px', backgroundColor: 'rgba(255,255,255,0.06)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '12px', fontWeight: '800' }}>
                <span style={{ color: '#cbd5e1' }}>Progreso de la Formación</span>
                <span style={{ color: '#38bdf8' }}>{completedCount} de {totalItemsCount} ({progressPercent}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#1f75f5ff', borderRadius: '4px', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PAYWALL / LOCKED STATE IF NO ACCESS */}
      {!hasAccess ? (
        <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', border: '2px solid var(--border)', boxShadow: '0 12px 30px rgba(0,0,0,0.06)', marginBottom: '40px' }}>
          <div style={{ height: '420px', backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: `center ${content.cardImagePosition || '50%'}`, filter: 'blur(10px) brightness(0.35)', transform: 'scale(1.05)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '20px' }}>
              <IoLockClosed size={36} />
            </div>
            <h3 style={{ fontSize: '30px', fontWeight: '900', color: '#ffffff', marginBottom: '12px', maxWidth: '650px' }}>
              Acceso Exclusivo a {typeLabel}
            </h3>
            <p style={{ fontSize: '16px', color: '#cbd5e1', marginBottom: '28px', maxWidth: '580px', lineHeight: '1.6' }}>
              {content.accessType === 'subscription'
                ? 'Este contenido está reservado para miembros de la Membresía de NS. Actívala para desbloquear todos los módulos, lecciones, material de descarga y videoteca ilimitada.'
                : `Adquiere acceso permanente a esta formación técnica por un pago único de USD $${content.priceUsd !== undefined ? content.priceUsd : (content.price || 0)} / ARS $${(content.priceArs || 0).toLocaleString()}.`}
            </p>
            <button
              onClick={handleAction}
              className="btn-primary"
              style={{ padding: '16px 36px', fontSize: '16px', fontWeight: '900', boxShadow: '0 8px 25px rgba(31, 117, 245, 0.4)' }}
            >
              {content.accessType === 'subscription' ? 'Activar Membresía Ahora' : 'Comprar Formación Ahora'}
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================
           SKOOL CLASSROOM MAIN INTERFACE (Has Access)
           ======================================================== */
        hasModules ? (
          <div className="skool-classroom-layout">

            {/* LEFT SIDEBAR: Skool Curriculum Accordion */}
            <div className="animated-sidebar" style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.03)', position: 'sticky', top: '24px', maxHeight: '82vh', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                Módulos y Lecciones
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {content.modules.map((mod, modIndex) => {
                  const isActiveMod = activeModuleIdx === modIndex;
                  return (
                    <div key={mod.id} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', backgroundColor: isActiveMod ? '#f8fafc' : '#ffffff' }}>
                      {/* Module Header button */}
                      <button
                        onClick={() => { setActiveModuleIdx(modIndex); setActiveLessonIdx(0); }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '14px 16px',
                          background: isActiveMod ? '#051020' : '#ffffff',
                          color: isActiveMod ? '#ffffff' : '#0f172a',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontWeight: '800',
                          fontSize: '14px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: isActiveMod ? '#38bdf8' : '#64748b' }}>#{modIndex + 1}</span>
                          <span>{mod.title}</span>
                        </div>
                        {isActiveMod ? <IoChevronUp size={16} color="#38bdf8" /> : <IoChevronDown size={16} color="#64748b" />}
                      </button>

                      {/* Lessons inside Module */}
                      {isActiveMod && (
                        <div className="animated-accordion-body" style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: '#f8fafc' }}>
                          {(mod.lessons || []).map((item, itemIndex) => {
                            const isSelected = activeModuleIdx === modIndex && activeLessonIdx === itemIndex;
                            const isDone = completedItems.includes(item.id);
                            const isQuiz = item.type === 'quiz';

                            return (
                              <button
                                key={item.id}
                                onClick={() => setActiveLessonIdx(itemIndex)}
                                className="animated-lesson-btn"
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '10px 12px',
                                  borderRadius: '10px',
                                  border: isSelected ? '1px solid #051020' : '1px solid transparent',
                                  backgroundColor: isSelected ? '#ffffff' : 'transparent',
                                  color: isSelected ? '#0f172a' : '#475569',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                  {isDone ? (
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#10b981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      <IoCheckmarkDone size={12} />
                                    </div>
                                  ) : isQuiz ? (
                                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', backgroundColor: isSelected ? '#38bdf8' : '#e0f2fe', color: '#051020', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px' }}>
                                      <IoHelpCircleOutline size={14} />
                                    </div>
                                  ) : (
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: isSelected ? '#051020' : '#e2e8f0', color: isSelected ? '#38bdf8' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      <IoPlay size={10} />
                                    </div>
                                  )}

                                  <span style={{ fontSize: '13px', fontWeight: isSelected ? '800' : '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.title}
                                  </span>
                                </div>

                                <span style={{ fontSize: '11px', color: '#94a3b8', flexShrink: 0 }}>
                                  {item.duration || ''}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT MAIN PANEL: Skool Active Lesson / Quiz Player */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              {/* ENROLLMENT BANNER FOR COURSES / WORKSHOPS */}
              {user && !isPrivileged && (
                <div style={{
                  backgroundColor: isOwned ? '#ecfdf5' : '#eff6ff',
                  border: `1px solid ${isOwned ? '#10b981' : '#3b82f6'}`,
                  borderRadius: '16px',
                  padding: '16px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>{isOwned ? <IoSchoolOutline size={26} color="#065f46" /> : <IoMegaphoneOutline size={26} color="#1e3a8a" />}</span>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 4px 0', color: isOwned ? '#065f46' : '#1e3a8a' }}>
                        {isOwned ? 'Estás oficialmente inscrito en esta formación' : 'Estado de inscripción oficial'}
                      </h4>
                      <p style={{ fontSize: '13px', margin: 0, color: isOwned ? '#047857' : '#1d4ed8' }}>
                        {isOwned
                          ? 'Recibirás las notificaciones de nuevos módulos y accesos directos a charlas Zoom de este curso.'
                          : 'Haz clic en "Anotarme" para registrarte formalmente y recibir alertas de reuniones Zoom en vivo.'}
                      </p>
                    </div>
                  </div>
                  {!isOwned && (
                    <button
                      onClick={handleEnrollManual}
                      style={{
                        backgroundColor: '#1f75f5ff',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontWeight: '800',
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(31, 117, 245, 0.35)',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <IoSchoolOutline size={16} /> Anotarme en este curso
                    </button>
                  )}
                </div>
              )}

              {currentItem ? (
                <div key={currentItem.id} className="animated-lesson-container" style={{ backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>

                  {/* Breadcrumb & Item Title */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      <span>{currentModule.title}</span>
                      <span>›</span>
                      <span style={{ color: '#1f75f5ff' }}>{currentItem.type === 'quiz' ? 'Evaluación' : 'Lección'}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                        {currentItem.title}
                      </h2>

                      <button
                        onClick={() => toggleItemCompleted(currentItem.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          borderRadius: '10px',
                          border: `2px solid ${completedItems.includes(currentItem.id) ? '#10b981' : '#cbd5e1'}`,
                          backgroundColor: completedItems.includes(currentItem.id) ? '#ecfdf5' : '#ffffff',
                          color: completedItems.includes(currentItem.id) ? '#059669' : '#475569',
                          fontWeight: '800',
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <IoCheckmarkCircle size={18} color={completedItems.includes(currentItem.id) ? '#10b981' : '#94a3b8'} />
                        {completedItems.includes(currentItem.id) ? 'Completada' : 'Marcar como Completada'}
                      </button>
                    </div>
                  </div>

                  {/* =======================================================
                      RENDER ITEM: LESSON (VIDEO + TIPTAP + ATTACHMENTS)
                      ======================================================= */}
                  {currentItem.type !== 'quiz' ? (
                    <>
                      {/* Skool Lesson Tabs: Notes vs Resources */}
                      <div style={{ borderBottom: '2px solid #f1f5f9', marginBottom: '24px', display: 'flex', gap: '24px' }}>
                        {currentItem.videoLink && (
                          <button
                            onClick={() => setLessonTab('video')}
                            style={{
                              padding: '12px 4px',
                              border: 'none',
                              background: 'none',
                              borderBottom: `3px solid ${lessonTab === 'video' ? '#051020' : 'transparent'}`,
                              fontWeight: lessonTab === 'video' ? '900' : '700',
                              color: lessonTab === 'video' ? '#051020' : '#64748b',
                              fontSize: '15px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <IoVideocamOutline size={18} /> Video Análisis
                          </button>
                        )}
                        <button
                          onClick={() => setLessonTab('notes')}
                          style={{
                            padding: '12px 4px',
                            border: 'none',
                            background: 'none',
                            borderBottom: `3px solid ${lessonTab === 'notes' ? '#051020' : 'transparent'}`,
                            fontWeight: lessonTab === 'notes' ? '900' : '700',
                            color: lessonTab === 'notes' ? '#051020' : '#64748b',
                            fontSize: '15px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <IoDocumentTextOutline size={18} /> Notas - Artículos
                        </button>
                        <button
                          onClick={() => setLessonTab('attachments')}
                          style={{
                            padding: '12px 4px',
                            border: 'none',
                            background: 'none',
                            borderBottom: `3px solid ${lessonTab === 'attachments' ? '#051020' : 'transparent'}`,
                            fontWeight: lessonTab === 'attachments' ? '900' : '700',
                            color: lessonTab === 'attachments' ? '#051020' : '#64748b',
                            fontSize: '15px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <IoFolderOpen size={18} /> Recursos Descargables ({((currentItem.attachments || []).length + (content.attachments || []).length)})
                        </button>
                      </div>

                      {/* Tab Content */}
                      {lessonTab === 'video' && currentItem.videoLink ? (
                        <div style={{ marginBottom: '32px', animation: 'fadeIn 0.4s ease' }}>
                          <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#000', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                            <iframe
                              src={getEmbedUrl(currentItem.videoLink)}
                              title="Video Análisis"
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        </div>
                      ) : lessonTab === 'notes' ? (
                        <div className="blog-content" style={{ lineHeight: '1.8', fontSize: '16px', color: '#334155', animation: 'fadeIn 0.4s ease' }}>
                          {currentItem.body ? (
                            <div dangerouslySetInnerHTML={{ __html: currentItem.body }} />
                          ) : (
                            <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>El instructor no agregó notas adicionales para esta lección.</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#051020', marginBottom: '16px' }}>
                            Archivos y Enlaces Adjuntos (Recursos Descargables)
                          </h4>
                          {((currentItem.attachments || []).length === 0 && (content.attachments || []).length === 0) ? (
                            <p style={{ color: '#94a3b8', fontStyle: 'italic', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
                              No hay archivos adjuntos disponibles en este momento.
                            </p>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                              {[...(currentItem.attachments || []), ...(content.attachments || [])].map((att, attIdx) => (
                                <a
                                  key={attIdx}
                                  href={att.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="animated-attachment-card"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    backgroundColor: '#f8fafc',
                                    border: '2px solid #cbd5e1',
                                    textDecoration: 'none',
                                    color: '#0f172a',
                                    fontWeight: '800',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                                    animationDelay: `${attIdx * 0.1}s`
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#051020', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <IoDownloadOutline size={22} />
                                  </div>
                                  <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{att.title}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>Descargar archivo / Abrir enlace</div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    /* =======================================================
                       RENDER ITEM: QUIZ / MULTIPLE CHOICE EVALUATION
                       ======================================================= */
                    <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '18px', border: '1px solid #cbd5e1' }}>
                      <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontSize: '15px', color: '#475569', marginBottom: '8px' }}>
                          {currentItem.description || 'Responde el siguiente cuestionario para evaluar tus conocimientos.'}
                        </p>
                        <div style={{ display: 'inline-block', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: '800', fontSize: '12px', padding: '4px 12px', borderRadius: '20px' }}>
                          Puntaje mínimo de aprobación: {currentItem.passingScore || 70}%
                        </div>
                      </div>

                      {(currentItem.questions || []).length === 0 ? (
                        <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '30px' }}>
                          Este examen aún no tiene preguntas configuradas por el instructor.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                          {currentItem.questions.map((q, qIndex) => {
                            const selectedIndex = quizAnswers[q.id];
                            const isCorrect = selectedIndex === q.correctOptionIndex;

                            return (
                              <div key={q.id} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: `2px solid ${quizSubmitted ? (isCorrect ? '#10b981' : '#ef4444') : '#e2e8f0'}` }}>
                                <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>
                                  {qIndex + 1}. {q.questionText}
                                </h4>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  {(q.options || []).map((opt, optIdx) => {
                                    const isThisSelected = selectedIndex === optIdx;
                                    const isThisCorrectOption = q.correctOptionIndex === optIdx;

                                    let optBg = isThisSelected ? '#eff6ff' : '#f8fafc';
                                    let optBorder = isThisSelected ? '#3b82f6' : '#cbd5e1';
                                    if (quizSubmitted) {
                                      if (isThisCorrectOption) {
                                        optBg = '#ecfdf5';
                                        optBorder = '#10b981';
                                      } else if (isThisSelected && !isThisCorrectOption) {
                                        optBg = '#fef2f2';
                                        optBorder = '#ef4444';
                                      }
                                    }

                                    return (
                                      <label
                                        key={optIdx}
                                        onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '12px',
                                          padding: '12px 16px',
                                          borderRadius: '12px',
                                          border: `2px solid ${optBorder}`,
                                          backgroundColor: optBg,
                                          cursor: quizSubmitted ? 'default' : 'pointer',
                                          fontWeight: isThisSelected ? '700' : '500',
                                          fontSize: '14px',
                                          transition: 'all 0.15s ease'
                                        }}
                                      >
                                        <input
                                          type="radio"
                                          name={`student_q_${q.id}`}
                                          checked={isThisSelected}
                                          onChange={() => { }}
                                          disabled={quizSubmitted}
                                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span>{opt}</span>
                                      </label>
                                    );
                                  })}
                                </div>

                                {quizSubmitted && q.explanation && (
                                  <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: '#f1f5f9', borderRadius: '10px', fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                    <IoInformationCircleOutline size={18} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div><b>Explicación:</b> {q.explanation}</div>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Quiz Submit Bar */}
                          {!quizSubmitted ? (
                            <button
                              onClick={handleQuizSubmit}
                              disabled={Object.keys(quizAnswers).length < currentItem.questions.length}
                              className="btn-primary"
                              style={{
                                padding: '14px 28px',
                                fontSize: '15px',
                                fontWeight: '900',
                                alignSelf: 'flex-start',
                                opacity: Object.keys(quizAnswers).length < currentItem.questions.length ? 0.6 : 1
                              }}
                            >
                              Enviar Examen / Validar Respuestas
                            </button>
                          ) : (
                            <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: quizScore >= (currentItem.passingScore || 70) ? '#ecfdf5' : '#fef2f2', border: `2px solid ${quizScore >= (currentItem.passingScore || 70) ? '#10b981' : '#ef4444'}` }}>
                              <h4 style={{ fontSize: '18px', fontWeight: '900', color: quizScore >= (currentItem.passingScore || 70) ? '#059669' : '#dc2626', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {quizScore >= (currentItem.passingScore || 70) ? (
                                  <><IoTrophyOutline size={22} /> ¡Felicitaciones! Has aprobado el examen</>
                                ) : (
                                  <><IoCloseCircleOutline size={22} /> No alcanzaste el puntaje mínimo de aprobación</>
                                )}
                              </h4>
                              <p style={{ fontSize: '14px', color: '#334155', margin: '0 0 14px 0' }}>
                                Tu puntaje obtenido fue <b>{quizScore}%</b> (Mínimo requerido: {currentItem.passingScore || 70}%).
                              </p>
                              <button
                                onClick={() => setQuizSubmitted(false)}
                                style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                              >
                                <IoRefreshOutline size={16} /> Reintentar Examen
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Skool Next Lesson Button Footer */}
                  <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <button
                      onClick={() => toggleItemCompleted(currentItem.id)}
                      className={completedItems.includes(currentItem.id) ? 'btn-translucent' : 'btn-primary'}
                      style={{ padding: '12px 24px', fontSize: '14px', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <IoCheckmarkCircle size={18} />
                      {completedItems.includes(currentItem.id) ? 'Completada' : 'Marcar como Completada'}
                    </button>

                    <button
                      onClick={goToNextItem}
                      style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        backgroundColor: '#051020',
                        color: '#38bdf8',
                        fontWeight: '800',
                        fontSize: '14px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Siguiente Lección ›
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--dark)' }}>Selecciona una lección del panel izquierdo</h3>
                  <p style={{ color: 'var(--gray-500)' }}>Haz clic en cualquier lección o examen de la lista para comenzar el estudio.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Fallback: Old single video/body course if no modules defined */
          <div>
            {content.videoLink && (
              <div style={{ borderRadius: '20px', overflow: 'hidden', backgroundColor: '#000000', boxShadow: '0 12px 35px rgba(0,0,0,0.2)', border: '2px solid #051020', marginBottom: '32px' }}>
                <iframe src={getEmbedUrl(content.videoLink)} title={content.title} style={{ width: '100%', height: '550px', border: 'none' }} allowFullScreen />
              </div>
            )}
            {content.body && (
              <div className="premium-card" style={{ padding: '40px', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  Temario y Materiales
                </h3>
                <div dangerouslySetInnerHTML={{ __html: content.body }} />
              </div>
            )}
          </div>
        )
      )}

      {/* Sección de Reseñas / Opiniones de Alumnos */}
      <div style={{
        marginTop: '60px',
        paddingTop: '40px',
        borderTop: '2px solid var(--border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IoStar size={28} color="#f59e0b" />
              Reseñas y Experiencias de Alumnos
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
              {content.reviews && content.reviews.length > 0
                ? `Valoración media: ${(content.rating || 5).toFixed(1)} ★ (${content.reviews.length} ${content.reviews.length === 1 ? 'opinión' : 'opiniones'})`
                : 'Conoce las opiniones de quienes ya completaron esta formación.'}
            </p>
          </div>
          {user && (
            <button
              onClick={() => { window.scrollTo({ top: 0, behavior: 'instant' }); setShowReviewModal(true); }}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '14px' }}
            >
              <IoStar size={18} />
              + Dejar mi Reseña
            </button>
          )}
        </div>

        {content.reviews && content.reviews.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {content.reviews.map((r, idx) => (
              <div
                key={idx}
                className="animated-review-card"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  transition: 'all 0.2s ease',
                  animationDelay: `${idx * 0.12}s`
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(31, 117, 245, 0.08)'; e.currentTarget.style.borderColor = '#1f75f5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                      {r.name || 'Alumno'}
                    </strong>
                    {r.profession ? (
                      <span style={{ display: 'inline-block', marginTop: '4px', padding: '3px 10px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#1f75f5', fontSize: '12px', fontWeight: '700' }}>
                        {r.profession}
                      </span>
                    ) : (
                      <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '12px', color: '#94a3b8' }}>
                        Alumno certificado
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#f59e0b', fontSize: '16px', letterSpacing: '2px', fontWeight: '800', flexShrink: 0 }}>
                    {'★'.repeat(r.rating || 5)}
                    <span style={{ color: '#e2e8f0' }}>{'★'.repeat(Math.max(0, 5 - (r.rating || 5)))}</span>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "{r.comment}"
                </p>

                {r.createdAt && (
                  <span style={{ fontSize: '11px', color: '#94a3b8', alignSelf: 'flex-end', marginTop: 'auto' }}>
                    {new Date(r.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#f8fafc',
            border: '2px dashed #cbd5e1',
            borderRadius: '20px',
            color: '#64748b'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <IoChatbubbleOutline size={44} color="#94a3b8" />
            </div>
            <strong style={{ display: 'block', fontSize: '16px', color: '#334155', marginBottom: '4px' }}>
              Aún no hay reseñas publicadas para esta formación
            </strong>
            <p style={{ margin: 0, fontSize: '13px' }}>
              ¡Sé el primero en completar las lecciones y dejar tu valoración para ayudar a otros alumnos!
            </p>
          </div>
        )}
      </div>

      <AddToFolderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        contentId={content._id}
      />

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmitReview={handleReviewSubmit}
        user={user}
        contentTitle={content?.title}
      />

      {/* Floating Back to Top Button positioned exactly on the far right edge of viewport via Portal */}
      {showScrollTop && ReactDOM.createPortal(
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Volver arriba"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '10px',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 18px',
            borderRadius: '24px',
            backgroundColor: '#051020',
            color: '#38bdf8',
            border: '2px solid #38bdf8',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
            fontWeight: '800',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            animation: 'floatInBottom 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#38bdf8'; e.currentTarget.style.color = '#051020'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#051020'; e.currentTarget.style.color = '#38bdf8'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <IoChevronUp size={18} />
          Volver arriba
        </button>,
        document.body
      )}
    </div>
  );
};

export default CursoDetail;
