import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoStatsChart, IoShieldCheckmark, IoDocumentText, IoDownloadOutline, IoChevronDownOutline } from 'react-icons/io5';
import tobilloImg from '../assets/tobillo.webp';
import hombroImg from '../assets/hombro.webp';
import imtpImg from '../assets/imtp.webp';
import rodillaImg from '../assets/rodilla.webp';
import saltoImg from '../assets/salto.webp';
import sprintImg from '../assets/sprint.webp';
import api from '../services/api';

const ACCENT_COLORS = [
  '#1f75f5', // primary blue
  '#0284c7', // sky blue
  '#2563eb', // royal blue
  '#0d9488', // teal
  '#1e40af', // deep blue
  '#4f46e5', // indigo
];

const FEATURES = [
  {
    title: 'Rango Óptimo de Movimiento',
    description: 'Utilizamos el sensor K-Move para medir con precisión los ángulos de movilidad articular en tiempo real. Evaluamos tobillo, cadera y hombro, detectando restricciones que puedan comprometer el gesto deportivo o aumentar el riesgo de lesión. Cada dato es objetivo, reproducible y comparable entre sesiones.',
    image: tobilloImg
  },
  {
    title: 'Fuerza y Estabilidad de Hombro',
    description: 'Con el K-Push evaluamos la capacidad de fuerza de empuje de hombro y sus estabilizadores en distintos ángulos. Medimos fuerza máxima, velocidad de producción de fuerza (RFD) y asimetría entre ambos brazos. Un test clave para detectar desequilibrios en atletas con alta demanda de miembro superior.',
    image: hombroImg
  },
  {
    title: 'Fuerza Isométrica Multiarticular',
    description: 'Con las plataformas de fuerza K-Delta realizamos el IMTP (Isometric Mid-Thigh Pull), el test de referencia para la fuerza máxima del tren inferior en cadena cinética cerrada. Medimos la fuerza bilateral y su distribución entre ambas piernas.',
    image: imtpImg
  },
  {
    title: 'Rodilla & Fuerza Máxima Isométrica',
    description: 'El K-Pull mide la producción de fuerza isométrica máxima de tracción en distintos grupos musculares. Al no involucrar movimiento articular, es un test altamente sensible y reproducible, ideal para el seguimiento de la fuerza máxima y la evolución durante procesos de readaptación.',
    image: rodillaImg
  },
  {
    title: 'Fuerza Reactiva & Explosiva',
    description: 'Las plataformas K-Delta analizan en profundidad la capacidad de salto mediante CMJ, ABK y Drop Jump, entre otras evaluaciones de salto. Obtenemos altura, potencia relativa, tiempo de vuelo, tiempo de contacto y el Índice de Fuerza Reactiva (RSI): un perfil completo de la explosividad y la reactividad neuromuscular de cada atleta.',
    image: saltoImg
  },
  {
    title: 'Prueba de Velocidad 10m / 20m / 30m',
    description: 'Con el sensor K-Power el sprint va mucho más allá del cronómetro. Medimos fuerza horizontal, potencia mecánica, splits por sector y el perfil fuerza-velocidad individual (F0, V0, P0) de cada atleta. Identificamos si el déficit es de fuerza o de velocidad, para que el entrenamiento de sprint sea específico y no genérico.',
    image: sprintImg
  }
];

const getEmbedUrl = (url) => {
  if (!url) return '';
  let videoId = '';
  if (url.includes('/shorts/')) {
    videoId = url.split('/shorts/')[1].split('?')[0].split('/')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0].split('/')[0];
  } else if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1].split('&')[0];
  } else if (url.includes('instagram.com/reel/') || url.includes('instagram.com/p/')) {
    const parts = url.split('/');
    const codeIndex = parts.findIndex(p => p === 'reel' || p === 'p') + 1;
    if (parts[codeIndex]) return `https://www.instagram.com/p/${parts[codeIndex]}/embed/`;
  }
  if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  return url;
};

const EvaluacionesColectivo = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [openDropdowns, setOpenDropdowns] = useState({ porQue: false, kinvent: false });
  const [evalConfig, setEvalConfig] = useState({
    colectivoPdfUrl: '/Evaluaciones_Kinvent.pdf',
    colectivoFormLink: 'https://docs.google.com/forms/d/e/1FAIpQLSeAJwoKDSgk7M03ZwGfbyfE1KuM4PEAQlJNlhlFov5MlKXf0Q/viewform'
  });
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/evaluations');
        if (res.data && res.data.success && res.data.data) {
          setEvalConfig(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching eval config:', err);
      }
    };
    fetchConfig();
  }, []);

  const handleDownload = async (url, defaultFilename) => {
    if (!url) return;

    // If it's a simple local static asset (/something.pdf not in /uploads), download directly
    if (url.startsWith('/') && !url.startsWith('//') && !url.includes('/uploads/')) {
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFilename || 'Evaluaciones_Deportes_Equipo.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    try {
      setIsDownloading(true);
      const downloadEndpoint = `/evaluations/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(defaultFilename || 'Evaluaciones_Deportes_Equipo.pdf')}`;
      const response = await api.get(downloadEndpoint, { responseType: 'blob' });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = defaultFilename || 'Evaluaciones_Deportes_Equipo.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn('Descarga por proxy falló, abriendo enlace directamente:', err);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFilename || 'Evaluaciones_Deportes_Equipo.pdf';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 20px 60px 20px', fontFamily: 'var(--font-sans)' }}>

      {/* Back Button matching EntrenamientoADistancia */}
      <button
        onClick={() => navigate('/evaluaciones')}
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
        <IoArrowBack size={16} /> Volver a Evaluaciones
      </button>

      {/* Hero Header matching EntrenamientoADistancia */}
      <header style={{ textAlign: 'center', padding: '40px 0 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <h1 className="premium-title" style={{ maxWidth: '1400px' }}>
          Sistema de evaluación física para deportes de equipo
        </h1>
        <div className="accent-divider"></div>
        <a
          href={evalConfig.colectivoFormLink || 'https://docs.google.com/forms/d/e/1FAIpQLSeAJwoKDSgk7M03ZwGfbyfE1KuM4PEAQlJNlhlFov5MlKXf0Q/viewform'}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ padding: '16px 36px', fontSize: '14px' }}
        >
          Solicitar Evaluación para Plantel
        </a>
      </header>

      {/* Intro Section - Animated Dropdowns */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', margin: '40px auto 60px auto', maxWidth: '1240px' }}>

        {/* Card 1: ¿Por qué evaluar a tu plantel? */}
        <div className={`intro-dropdown${openDropdowns.porQue ? ' open' : ''}`}>
          <button
            type="button"
            className="intro-dropdown__header"
            onClick={() => setOpenDropdowns(prev => ({ ...prev, porQue: !prev.porQue }))}
            aria-expanded={openDropdowns.porQue}
          >
            <h3 className="intro-dropdown__title">
              ¿Por qué evaluar a tu plantel?
            </h3>
            <div className="intro-dropdown__chevron">
              <IoChevronDownOutline size={22} />
            </div>
          </button>
          <div className="intro-dropdown__content">
            <div className="intro-dropdown__inner">
              <div className="intro-dropdown__body">
                <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563', marginBottom: '16px', marginTop: 0 }}>
                  Como preparador físico o entrenador, tomamos decisiones de entrenamiento todos los días. Pero ¿cuántas de esas decisiones están respaldadas por datos objetivos y cuántas por observación o intuición?
                </p>
                <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563', marginBottom: '24px' }}>
                  Sin una evaluación del plantel, no sabemos cuáles son los jugadores con mayor riesgo de lesión, cuáles tienen déficits de fuerza que limitan su rendimiento en cancha, o al mismo tiempo dónde hacer foco para potenciar sus cualidades.
                </p>
                <div style={{
                  background: 'var(--light)',
                  borderLeft: '4px solid var(--primary)',
                  padding: '18px 20px',
                  borderRadius: '0 12px 12px 0'
                }}>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--dark)', margin: 0, fontStyle: 'italic' }}>
                    «Eso no es solo información. Es la base de un programa de entrenamiento eficaz.»
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Tecnología Kinvent & Rol */}
        <div className={`intro-dropdown${openDropdowns.kinvent ? ' open' : ''}`}>
          <button
            type="button"
            className="intro-dropdown__header"
            onClick={() => setOpenDropdowns(prev => ({ ...prev, kinvent: !prev.kinvent }))}
            aria-expanded={openDropdowns.kinvent}
          >
            <h3 className="intro-dropdown__title">
              Tecnología Kinvent
            </h3>
            <div className="intro-dropdown__chevron">
              <IoChevronDownOutline size={22} />
            </div>
          </button>
          <div className="intro-dropdown__content">
            <div className="intro-dropdown__inner">
              <div className="intro-dropdown__body">
                <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563', marginBottom: '16px', marginTop: 0 }}>
                  Todas las evaluaciones se realizan con sensores <strong>Kinvent Biomecanique</strong>, empresa presente en más de 80 países, utilizada por más de 6.000 profesionales del rendimiento y la salud, y con más de 213.000 atletas evaluados en todo el mundo.
                </p>
                <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563', marginBottom: '24px' }}>
                  En el contexto de un equipo deportivo, permite evaluar un plantel completo en una sola jornada, obtener resultados en tiempo real y generar un informe grupal comparativo que ordena a los jugadores por nivel de rendimiento en cada capacidad.
                </p>
                <div style={{
                  background: 'var(--light)',
                  borderLeft: '4px solid var(--dark)',
                  padding: '18px 20px',
                  borderRadius: '0 12px 12px 0'
                }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-600)', margin: 0 }}>
                    Garantía de tecnología validada científicamente, feedback técnico de primer nivel y resultados comparables con estándares del deporte de alto rendimiento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Batería de Evaluaciones Section Header */}
      <header style={{ textAlign: 'center', padding: '20px 0 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 className="premium-title" >
          Batería de Evaluaciones
        </h2>
        <div className="accent-divider"></div>
        <p style={{ color: 'var(--gray-500)', fontSize: '16px', maxWidth: '750px', lineHeight: '1.6', textAlign: 'center', margin: '0' }}>
          La batería de tests se adapta según el perfil del evaluado y los objetivos específicos de cada deporte.
        </p>
      </header>

      {/* Batería de Evaluaciones (Estilo Tarjetas Expandibles Accordion) */}
      <div className="features-accordion" role="tablist" aria-label="Batería de Evaluaciones" style={{ marginTop: '30px' }}>
        {FEATURES.map((feature, index) => {
          const isActive = activeIndex === index;

          return (
            <button
              key={feature.title}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`feature-panel-${index}`}
              id={`feature-tab-${index}`}
              className={`features-accordion__option${isActive ? ' active' : ''}`}
              style={{
                '--optionAccent': ACCENT_COLORS[index % ACCENT_COLORS.length],
                '--optionImage': `url("${feature.image}")`,
              }}
              onClick={() => setActiveIndex(index)}
            >
              <div className="features-accordion__label">
                <div
                  className="features-accordion__info"
                  id={`feature-panel-${index}`}
                  role="tabpanel"
                  aria-labelledby={`feature-tab-${index}`}
                >
                  <div className="features-accordion__main">{feature.title}</div>
                  <div className="features-accordion__sub">{feature.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Call to Action */}
      <div style={{
        marginTop: '60px',
        textAlign: 'center',
        padding: '50px 30px',
        backgroundColor: 'transparent',
        color: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '1000px',
        margin: '60px auto 0 auto'
      }}>
        <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
          ¿Querés llevar esta tecnología a tu club o plantel?
        </h3>
        <p style={{ fontSize: '16px', color: '#334155', maxWidth: '650px', margin: '0 0 32px 0', lineHeight: '1.6' }}>
          Coordinemos una jornada de evaluación para tu equipo. Obtené informes grupales inmediatos y elevá el estándar de tu preparación física.
        </p>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => handleDownload(evalConfig.colectivoPdfUrl || '/Evaluaciones_Kinvent.pdf', 'Evaluaciones_Deportes_Equipo.pdf')}
            disabled={isDownloading}
            style={{
              padding: '16px 32px',
              fontSize: '15px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              borderRadius: '12px',
              border: '2px solid #0f172a',
              backgroundColor: 'transparent',
              color: '#0f172a',
              fontWeight: '700',
              cursor: isDownloading ? 'wait' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <IoDownloadOutline size={20} /> {isDownloading ? 'Descargando PDF...' : 'Descargar PDF de Evaluaciones'}
          </button>
          <a
            href={evalConfig.colectivoFormLink || 'https://docs.google.com/forms/d/e/1FAIpQLSeAJwoKDSgk7M03ZwGfbyfE1KuM4PEAQlJNlhlFov5MlKXf0Q/viewform'}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '16px 36px',
              fontSize: '15px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontWeight: '800',
              borderRadius: '12px',
              textDecoration: 'none',
              boxShadow: '0 8px 25px rgba(15,23,42,0.25)',
              transition: 'transform 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            Solicitar Turno Colectivo
          </a>
        </div>
      </div>

      {/* Así evaluamos - Sección de Shorts */}
      <div style={{ marginTop: '80px', textAlign: 'center' }}>
        <h2 className="premium-title" style={{ marginBottom: '8px' }}>
          Así evaluamos
        </h2>
        <div className="accent-divider"></div>
        <p style={{ color: 'var(--gray-500)', fontSize: '18px', fontWeight: '600', maxWidth: '750px', lineHeight: '1.6', textAlign: 'center', margin: '0 auto 40px auto' }}>
          Cada test, un dato. Cada dato, una decisión de entrenamiento.
        </p>

        {evalConfig.colectivoVideos && evalConfig.colectivoVideos.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            padding: '10px 0'
          }}>
            {evalConfig.colectivoVideos.map((vidUrl, idx) => {
              const embedUrl = getEmbedUrl(vidUrl);
              const isMp4 = embedUrl.endsWith('.mp4') || embedUrl.endsWith('.webm') || embedUrl.endsWith('.mov');
              return (
                <div key={idx} style={{
                  width: '280px',
                  height: '500px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  backgroundColor: '#000000',
                  position: 'relative',
                  border: '3px solid var(--primary)',
                  flexShrink: 0
                }}>
                  {isMp4 ? (
                    <video
                      src={embedUrl}
                      controls
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <iframe
                      src={embedUrl}
                      title={`Video Demostración ${idx + 1}`}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
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

export default EvaluacionesColectivo;
