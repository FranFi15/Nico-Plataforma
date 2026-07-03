import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { IoArrowBack } from 'react-icons/io5';

const AthleteCarousel = ({ photos }) => {
  if (!photos || photos.length === 0) return null;

  // Repeat items to form a seamless infinite loop track
  const repeatCount = photos.length < 4 ? 4 : 2;
  const marqueeList = [];
  for (let i = 0; i < repeatCount; i++) {
    marqueeList.push(...photos);
  }

  // Calculate dynamic animation duration to keep speed uniform across all carousels
  const cardWidth = 260;
  const gap = 24;
  const itemWidth = cardWidth + gap; // 284px
  const totalItems = marqueeList.length;
  const pixelsPerSecond = 35; // Constant speed in pixels per second
  const duration = (totalItems * itemWidth / 2) / pixelsPerSecond;

  return (
    <div style={{ overflow: 'hidden', width: '100%', padding: '10px 0', position: 'relative' }}>
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          gap: 24px;
          animation: marquee linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        .athlete-card {
          width: 260px;
          height: 320px;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
          position: relative;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        .athlete-card:hover {
          transform: translateY(-8px);
          border-color: var(--primary);
          box-shadow: 0 16px 35px rgba(31, 117, 245, 0.15);
        }
        .athlete-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .athlete-card:hover .athlete-card-img {
          transform: scale(1.06);
        }
        .athlete-card-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(5, 16, 32, 0.95) 20%, rgba(5, 16, 32, 0) 100%);
          padding: 24px 16px 16px 16px;
          color: #ffffff;
          text-align: center;
          z-index: 2;
        }
      `}</style>

      <div className="marquee-track" style={{ animationDuration: `${duration}s` }}>
        {marqueeList.map((photo, idx) => {
          const url = typeof photo === 'string' ? photo : (photo.url || '');
          const fullname = typeof photo === 'string' ? '' : (photo.fullname || '');
          return (
            <div key={idx} className="athlete-card">
              <img
                src={url}
                alt={fullname || `Athlete ${idx}`}
                className="athlete-card-img"
              />
              {fullname && (
                <div className="athlete-card-overlay">
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
        <h1 className="premium-title">
          Entrenamiento a Distancia
        </h1>
        <div className="accent-divider"></div>
        <p style={{ color: 'var(--gray-500)', fontSize: '16px', maxWidth: '680px', lineHeight: '1.6', textAlign: 'center', margin: '0 0 20px 0' }}>
          Visualiza nuestra planificación inteligente, los resultados de nuestros atletas y postúlate para entrenar directamente con Nicolás Sesma y su equipo.
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
          <button
            onClick={() => setSelectedPlanTitle('all')}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              backgroundColor: selectedPlanTitle === 'all' ? 'var(--dark)' : '#ffffff',
              color: selectedPlanTitle === 'all' ? '#ffffff' : 'var(--dark)',
              fontWeight: '700',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              outline: 'none'
            }}
          >
            Todos los Planes
          </button>
          {uniquePlanTitles.map((title) => (
            <button
              key={title}
              onClick={() => setSelectedPlanTitle(title)}
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
                transition: 'all 0.25s ease',
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
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '60px', marginTop: '20px' }}>
            {filteredTrainings.map((training) => {
              const embedUrl = getEmbedUrl(training.youtubeShortLink);
              return (
                <div
                  key={training._id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '24px',
                    padding: '40px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '40px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '40px' }}>

                    {/* YouTube embed (Left side) */}
                    {embedUrl && (
                      <div style={{
                        flex: '1 1 300px',
                        maxWidth: '360px',
                        width: '100%',
                        height: '480px',
                        border: '1px solid var(--border)',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        backgroundColor: '#000000',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.05)'
                      }}>
                        <iframe
                          src={embedUrl}
                          title="Presentación YouTube Short"
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}

                    {/* Info Column (Right side) */}
                    <div style={{ flex: '2 1 450px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <h3 style={{
                        fontSize: '28px',
                        fontWeight: '900',
                        color: 'var(--dark)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '16px'
                      }}>
                        {training.title}
                      </h3>
                      <p style={{
                        fontSize: '16px',
                        lineHeight: '1.7',
                        color: '#4b5563',
                        whiteSpace: 'pre-line',
                        marginBottom: '20px'
                      }}>
                        {training.description}
                      </p>

                      {training.subDescription && (
                        <p style={{
                          fontSize: '14px',
                          lineHeight: '1.6',
                          color: '#6b7280',
                          whiteSpace: 'pre-line',
                          marginBottom: '24px',
                          fontStyle: 'italic'
                        }}>
                          {training.subDescription}
                        </p>
                      )}

                      <a
                        href={training.googleFormLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ padding: '14px 28px', fontSize: '13px', marginTop: 'auto' }}
                      >
                        Aplicar a este Plan
                      </a>
                    </div>
                  </div>

                  {/* Athlete gallery (Under all this) */}
                  {training.athletePhotos && training.athletePhotos.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '30px' }}>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: '900',
                        color: 'var(--dark)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '24px',
                        textAlign: 'center'
                      }}>
                        Atletas en Acción
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

    </div>
  );
};

export default EntrenamientoADistancia;
