import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoStatsChart, IoShieldCheckmark, IoDocumentText, IoDownloadOutline } from 'react-icons/io5';
import tobilloImg from '../assets/tobillo.webp';
import hombroImg from '../assets/hombro.webp';
import imtpImg from '../assets/imtp.webp';
import rodillaImg from '../assets/rodilla.webp';
import saltoImg from '../assets/salto.webp';
import sprintImg from '../assets/sprint.webp';
import api from '../services/api';

const EvaluacionesColectivo = () => {
  const navigate = useNavigate();
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

      {/* Intro Section - Vertical Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', margin: '40px auto 60px auto', maxWidth: '1000px' }}>

        {/* Card 1: ¿Por qué evaluar a tu plantel? */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{
              fontSize: '26px',
              fontWeight: '900',
              color: 'var(--dark)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '16px'
            }}>
              ¿Por qué evaluar a tu plantel?
            </h3>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563', marginBottom: '16px' }}>
              Como preparador físico o entrenador, tomamos decisiones de entrenamiento todos los días. Pero ¿cuántas de esas decisiones están respaldadas por datos objetivos y cuántas por observación o intuición?
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563', marginBottom: '24px' }}>
              Sin una evaluación del plantel, no sabemos cuáles son los jugadores con mayor riesgo de lesión, cuáles tienen déficits de fuerza que limitan su rendimiento en cancha, o al mismo tiempo dónde hacer foco para potenciar sus cualidades.
            </p>
          </div>
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

        {/* Card 2: Tecnología Kinvent & Rol */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{
              fontSize: '26px',
              fontWeight: '900',
              color: 'var(--dark)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '16px'
            }}>
              Tecnología Kinvent
            </h3>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563', marginBottom: '16px' }}>
              Todas las evaluaciones se realizan con sensores <strong>Kinvent Biomecanique</strong>, empresa presente en más de 80 países, utilizada por más de 6.000 profesionales del rendimiento y la salud, y con más de 213.000 atletas evaluados en todo el mundo.
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563', marginBottom: '24px' }}>
              En el contexto de un equipo deportivo, permite evaluar un plantel completo en una sola jornada, obtener resultados en tiempo real y generar un informe grupal comparativo que ordena a los jugadores por nivel de rendimiento en cada capacidad.
            </p>
          </div>
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

      {/* Batería de Evaluaciones Section Header */}
      <header style={{ textAlign: 'center', padding: '20px 0 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 className="premium-title" style={{ fontSize: 'px' }}>
          Batería de Evaluaciones
        </h2>
        <div className="accent-divider"></div>
        <p style={{ color: 'var(--gray-500)', fontSize: '16px', maxWidth: '750px', lineHeight: '1.6', textAlign: 'center', margin: '0' }}>
          La batería de tests se adapta según el perfil del evaluado y los objetivos específicos de cada deporte.
        </p>
      </header>

      {/* Batería de Evaluaciones (Formato de Lista Limpia sin Checks ni Numeración) */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '50px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        maxWidth: '1000px',
        margin: '20px auto 0 auto'
      }}>

        {/* 1. Rango Óptimo de Movimiento (Texto Izq, Imagen Der) */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <h3 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--dark)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, textAlign: 'center' }}>
            Rango Óptimo de Movimiento (K-Move)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
            <ul style={{ listStyleType: 'disc', paddingLeft: '28px', margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                Dorsiflexión de tobillo
              </li>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                Elevación de pierna recta
              </li>
            </ul>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={tobilloImg} alt="Rango Óptimo de Movimiento" style={{ width: '100%', maxWidth: '340px', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }} />
            </div>
          </div>
        </div>

        {/* 2. Fuerza y Estabilidad de Hombro (Imagen Izq, Texto Der) */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <h3 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--dark)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, textAlign: 'center' }}>
            Fuerza y Estabilidad de Hombro
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={hombroImg} alt="Fuerza y Estabilidad de Hombro" style={{ width: '100%', maxWidth: '340px', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }} />
            </div>
            <ul style={{ listStyleType: 'disc', paddingLeft: '28px', margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                Test ASH (Athletic Shoulder Test)
              </li>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                Prensa de brazos con flexión a 90°
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Fuerza Isométrica Multiarticular (Texto Izq, Imagen Der) */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <h3 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--dark)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, textAlign: 'center' }}>
            Fuerza Isométrica Multiarticular
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
            <ul style={{ listStyleType: 'disc', paddingLeft: '28px', margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                IMTP (Mid-Thigh Pull)
              </li>
            </ul>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={imtpImg} alt="Fuerza Isométrica Multiarticular" style={{ width: '100%', maxWidth: '340px', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }} />
            </div>
          </div>
        </div>

        {/* 4. Fuerza Máxima Isométrica & Salud de Rodilla (Imagen Izq, Texto Der) */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <h3 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--dark)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, textAlign: 'center' }}>
            Fuerza Máxima Isométrica & Salud de Rodilla
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={rodillaImg} alt="Salud de Rodilla" style={{ width: '100%', maxWidth: '340px', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }} />
            </div>
            <ul style={{ listStyleType: 'disc', paddingLeft: '28px', margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                Flexión de rodilla en decúbito prono con flexión de 90°
              </li>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                Extensión de rodilla en sedestación con flexión de 90°
              </li>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                RATIO IQ (Isquiotibiales y Cuádriceps)
              </li>
            </ul>
          </div>
        </div>

        {/* 5. Fuerza Reactiva & Explosiva (Texto Izq, Imagen Der) */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <h3 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--dark)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, textAlign: 'center' }}>
            Fuerza Reactiva & Explosiva
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
            <ul style={{ listStyleType: 'disc', paddingLeft: '28px', margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                CMJ (Salto con contramovimiento)
              </li>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                ABK — Abalakov Jump (Salto con Brazos)
              </li>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                Drop Jump — RSI
              </li>
            </ul>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={saltoImg} alt="Fuerza Reactiva & Explosiva" style={{ width: '100%', maxWidth: '340px', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }} />
            </div>
          </div>
        </div>

        {/* 6. Test de Sprint 20m / 30m (Imagen Izq, Texto Der) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <h3 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--dark)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, textAlign: 'center' }}>
            Test de Sprint 20m / 30m (K-Power)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={sprintImg} alt="Test de Sprint" style={{ width: '100%', maxWidth: '340px', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }} />
            </div>
            <ul style={{ listStyleType: 'disc', paddingLeft: '28px', margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                Tiempos por sector (Splits: 10m, 20m, 30m)
              </li>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                Velocidad máxima (Vmax)
              </li>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                Fuerza horizontal máxima (F0)
              </li>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                Velocidad teórica máxima (V0) & Mejor ventana de 10m
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Bottom Call to Action */}
      <div style={{
        marginTop: '60px',
        textAlign: 'center',
        padding: '50px 30px',
        backgroundColor: 'var(--dark)',
        color: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 15px 35px rgba(5,16,32,0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '1000px',
        margin: '60px auto 0 auto'
      }}>
        <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
          ¿Querés llevar esta tecnología a tu club o plantel?
        </h3>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.85)', maxWidth: '650px', margin: '0 0 32px 0', lineHeight: '1.6' }}>
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
              border: '2px solid rgba(255, 255, 255, 0.3)',
              backgroundColor: 'transparent',
              color: '#ffffff',
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
              backgroundColor: '#ffffff',
              color: 'var(--dark)',
              fontWeight: '800',
              borderRadius: '12px',
              textDecoration: 'none',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            Solicitar Turno Colectivo
          </a>
        </div>
      </div>

    </div>
  );
};

export default EvaluacionesColectivo;
