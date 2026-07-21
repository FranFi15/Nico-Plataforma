import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { IoArrowBack, IoPlayCircleOutline } from 'react-icons/io5';

const AthleteCarousel = ({ photos }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  if (!photos || photos.length === 0) return null;

  const repeatCount = photos.length < 6 ? 6 : 3;
  const marqueeList = [];
  for (let i = 0; i < repeatCount; i++) {
    marqueeList.push(...photos);
  }

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.8;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    let animationFrameId;
    const scroll = () => {
      if (containerRef.current && !isDragging) {
        containerRef.current.scrollLeft += 0.8;
        if (containerRef.current.scrollLeft >= (containerRef.current.scrollWidth - containerRef.current.clientWidth) - 10) {
          containerRef.current.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };
    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isDragging]);

  return (
    <div className="home-carousel-container" style={{ overflow: 'hidden', width: '100%', padding: '20px 0', position: 'relative' }}>
      <style>{`
        .home-carousel-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 80px;
          height: 100%;
          background: linear-gradient(to right, #ffffff 15%, rgba(255, 255, 255, 0) 100%);
          z-index: 3;
          pointer-events: none;
        }
        .home-carousel-container::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 80px;
          height: 100%;
          background: linear-gradient(to left, #ffffff 15%, rgba(255, 255, 255, 0) 100%);
          z-index: 3;
          pointer-events: none;
        }
        .distancia-marquee-track {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 10px 0;
          user-select: none;
          cursor: grab;
        }
        .distancia-marquee-track.dragging {
          cursor: grabbing;
        }
        .distancia-marquee-track::-webkit-scrollbar {
          display: none;
        }
        .distancia-athlete-card {
          width: 260px;
          height: 320px;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
          position: relative;
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          flex-shrink: 0;
          pointer-events: auto;
        }
        .distancia-marquee-track:not(.dragging) .distancia-athlete-card:hover {
          transform: translateY(-8px);
          border-color: var(--primary);
          box-shadow: 0 16px 35px rgba(31, 117, 245, 0.15);
        }
        .distancia-athlete-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
          pointer-events: none;
        }
        .distancia-marquee-track:not(.dragging) .distancia-athlete-card:hover .distancia-athlete-card-img {
          transform: scale(1.06);
        }
        .distancia-athlete-card-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(5, 16, 32, 0.95) 20%, rgba(5, 16, 32, 0) 100%);
          padding: 24px 16px 16px 16px;
          color: #ffffff;
          text-align: center;
          z-index: 2;
          pointer-events: none;
        }
      `}</style>

      <div
        ref={containerRef}
        className={`distancia-marquee-track ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {marqueeList.map((photo, idx) => {
          const url = typeof photo === 'string' ? photo : (photo.url || '');
          const fullname = typeof photo === 'string' ? '' : (photo.fullname || '');
          return (
            <div key={idx} className="distancia-athlete-card">
              <img
                src={url}
                alt={fullname || `Athlete ${idx}`}
                className="distancia-athlete-card-img"
              />
              {fullname && (
                <div className="distancia-athlete-card-overlay">
                  <h5 style={{ margin: 0, fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {fullname}
                  </h5>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EntrenamientoADistancia = () => {
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlanTitle, setSelectedPlanTitle] = useState('all');
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/trainings');
      if (response.data && response.data.success) {
        setTrainings(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching trainings:', err);
      setError('No se pudieron cargar los programas de entrenamiento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const getEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('/shorts/')) {
      videoId = url.split('/shorts/')[1].split('?')[0].split('/')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0].split('/')[0];
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  // Extract unique training plan titles
  const planTitles = trainings.map(t => t.title).filter(Boolean);
  const uniquePlanTitles = Array.from(new Set(planTitles));

  // Filter trainings based on selected plan title
  const filteredTrainings = trainings.filter(t => {
    if (selectedPlanTitle === 'all') return true;
    return t.title === selectedPlanTitle;
  });

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 20px 60px 20px', fontFamily: 'var(--font-sans)' }}>
      <style>{`
        @keyframes heroTitleEntry {
          0% { opacity: 0; transform: translateY(-25px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes heroTextEntry {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardEntry {
          0% { opacity: 0; transform: translateY(40px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulsePlayBtn {
          0% { box-shadow: 0 0 0 0 rgba(15, 23, 42, 0.35); }
          70% { box-shadow: 0 0 0 12px rgba(15, 23, 42, 0); }
          100% { box-shadow: 0 0 0 0 rgba(15, 23, 42, 0); }
        }
        @keyframes modalPop {
          0% { opacity: 0; transform: scale(0.8) translateY(30px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animated-hero-title {
          animation: heroTitleEntry 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animated-hero-text {
          animation: heroTextEntry 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
          opacity: 0;
        }
        .animated-training-card {
          animation: cardEntry 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease;
        }
        .animated-training-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 60px rgba(15, 23, 42, 0.12);
          border-color: rgba(31, 117, 245, 0.45);
        }
        .animated-video-btn {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          animation: pulsePlayBtn 2.5s infinite;
        }
        .animated-video-btn:hover {
          transform: translateY(-4px) scale(1.04);
          background-color: #0f172a !important;
          color: #ffffff !important;
          box-shadow: 0 12px 25px rgba(15, 23, 42, 0.25);
        }
        .animated-apply-btn {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animated-apply-btn:hover {
          transform: translateY(-4px) scale(1.04);
          box-shadow: 0 14px 30px rgba(31, 117, 245, 0.4);
        }
        .animated-filter-btn {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animated-filter-btn:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
        }
        .animated-modal-box {
          animation: modalPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/')}
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
          padding: '20px 0 0 0',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray-600)'}
      >
        <IoArrowBack size={16} /> Volver a Inicio
      </button>

      {/* Hero Header centered like Blogs */}
      <header style={{ textAlign: 'center', padding: '40px 0 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 className="premium-title animated-hero-title">
          Entrenamiento a Distancia
        </h1>
        <div className="accent-divider animated-hero-title"></div>
        <p className="animated-hero-text" style={{ color: 'var(--gray-500)', fontSize: '16px', maxWidth: '680px', lineHeight: '1.6', textAlign: 'center', margin: '0 0 20px 0' }}>
          Conocé nuestra metodología, los resultados reales de nuestros atletas y postulate para ser parte del equipo NS.
        </p>
      </header>

      {/* Plan Title Buttons Filter */}
      {uniquePlanTitles.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '40px',
          padding: '0 20px'
        }}>

          {uniquePlanTitles.map((title) => (
            <button
              key={title}
              onClick={() => setSelectedPlanTitle(title)}
              className="animated-filter-btn"
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                backgroundColor: selectedPlanTitle === title ? 'var(--dark)' : '#ffffff',
                color: selectedPlanTitle === title ? '#ffffff' : 'var(--dark)',
                fontWeight: '700',
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {title}
            </button>
          ))}
        </div>
      )}

      {/* Trainings List */}
      <div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', fontSize: '18px', color: '#6b7280' }}>
            Cargando programas de entrenamiento...
          </div>
        ) : error ? (
          <div style={{ color: '#ef4444', fontWeight: 'bold', textAlign: 'center', padding: '40px 0' }}>
            {error}
          </div>
        ) : filteredTrainings.length === 0 ? (
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: '24px',
            padding: '50px',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--dark)', marginBottom: '12px' }}>
              No se encontraron programas
            </h3>
            <p style={{ color: '#6b7280' }}>
              No hay programas de entrenamiento cargados o ninguno coincide con el atleta seleccionado.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '60px', marginTop: '20px' }}>
            {filteredTrainings.map((training, idx) => {
              const embedUrl = getEmbedUrl(training.youtubeShortLink);
              return (
                <div
                  key={training._id}
                  className="animated-training-card"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '24px',
                    padding: '50px 30px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '40px',
                    animationDelay: `${idx * 0.15}s`
                  }}
                >
                  {/* Info Column (Centered & Larger) */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '100%', margin: '0 auto' }}>
                    <h3 style={{
                      fontSize: '90px',
                      fontWeight: '900',
                      color: 'var(--dark)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '20px'
                    }}>
                      {training.title}
                    </h3>
                    <p style={{
                      fontSize: '25px',
                      lineHeight: '1.7',
                      color: '#334155',
                      whiteSpace: 'pre-line',
                      marginBottom: '20px',
                      fontWeight: '500'
                    }}>
                      {training.description}
                    </p>

                    {training.subDescription && (
                      <p style={{
                        fontSize: '16px',
                        lineHeight: '1.6',
                        color: '#6b7280',
                        whiteSpace: 'pre-line',
                        marginBottom: '32px',
                        fontStyle: 'italic',
                        maxWidth: '800px'
                      }}>
                        {training.subDescription}
                      </p>
                    )}

                    {/* Action Buttons: Video Modal Toggle next to Apply Button */}
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                      {embedUrl && (
                        <button
                          onClick={() => setActiveVideoUrl(embedUrl)}
                          className="animated-video-btn"
                          style={{
                            padding: '16px 32px',
                            fontSize: '15px',
                            fontWeight: '800',
                            borderRadius: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: '2px solid #0f172a',
                            backgroundColor: 'transparent',
                            color: '#0f172a',
                            cursor: 'pointer'
                          }}
                        >
                          <IoPlayCircleOutline size={22} /> Ver Video del Plan
                        </button>
                      )}
                      <a
                        href={training.googleFormLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary animated-apply-btn"
                        style={{ padding: '16px 36px', fontSize: '15px', fontWeight: '800', display: 'inline-flex', alignItems: 'center' }}
                      >
                        Aplicar a este Plan
                      </a>
                    </div>
                  </div>

                  {/* Athlete gallery (Under all this) */}
                  {training.athletePhotos && training.athletePhotos.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '40px', marginTop: '10px' }}>
                      <h4 style={{
                        fontSize: '18px',
                        fontWeight: '900',
                        color: 'var(--dark)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '24px',
                        textAlign: 'center'
                      }}>
                        Atletas que confiaron en Nosotros
                      </h4>
                      <AthleteCarousel photos={training.athletePhotos} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Modal Overlay */}
      {activeVideoUrl && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setActiveVideoUrl(null)}
        >
          <div
            className="animated-modal-box"
            style={{
              position: 'relative',
              width: '320px',
              height: '570px',
              backgroundColor: '#000000',
              borderRadius: '24px',
              overflow: 'hidden',
              border: '3px solid var(--primary)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveVideoUrl(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0, 0, 0, 0.7)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
            <iframe
              src={activeVideoUrl}
              title="Presentación YouTube Short"
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

    </div>
  );
};

export default EntrenamientoADistancia;
