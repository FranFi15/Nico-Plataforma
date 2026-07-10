import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoDownloadOutline } from 'react-icons/io5';
import tobilloImg from '../assets/tobilloi.webp';
import hombroImg from '../assets/hombro.webp';
import imtpImg from '../assets/imtpi.webp';
import rodillaImg from '../assets/rodillai.webp';
import saltoImg from '../assets/saltoi.webp';
import api from '../services/api';

const EvaluacionesIndividual = () => {
  const navigate = useNavigate();
  const [evalConfig, setEvalConfig] = useState({
    individualPdfUrl: '/Evaluaciones_Kinvent.pdf',
    individualFormLink: 'https://docs.google.com/forms/d/e/1FAIpQLSeAJwoKDSgk7M03ZwGfbyfE1KuM4PEAQlJNlhlFov5MlKXf0Q/viewform'
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
      a.download = defaultFilename || 'Evaluaciones_Biomecanicas_Individuales.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    try {
      setIsDownloading(true);
      const downloadEndpoint = `/evaluations/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(defaultFilename || 'Evaluaciones_Biomecanicas_Individuales.pdf')}`;
      const response = await api.get(downloadEndpoint, { responseType: 'blob' });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = defaultFilename || 'Evaluaciones_Biomecanicas_Individuales.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn('Descarga por proxy falló, abriendo enlace directamente:', err);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFilename || 'Evaluaciones_Biomecanicas_Individuales.pdf';
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

      {/* Hero Header */}
      <header style={{ textAlign: 'center', padding: '40px 0 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 className="premium-title" style={{ maxWidth: '1400px' }}>
          Sistema de evaluación integral diseñado para corredores, ciclistas y triatletas
        </h1>
        <div className="accent-divider"></div>
        <a
          href={evalConfig.individualFormLink || 'https://docs.google.com/forms/d/e/1FAIpQLSeAJwoKDSgk7M03ZwGfbyfE1KuM4PEAQlJNlhlFov5MlKXf0Q/viewform'}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ padding: '16px 36px', fontSize: '14px' }}
        >
          Solicitar Evaluación Individual
        </a>
      </header>

      {/* Intro Section - Vertical Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', margin: '40px auto 60px auto', maxWidth: '1000px' }}>

        {/* Card 1: ¿Por qué evaluar? */}
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
              ¿Por qué evaluar?
            </h3>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563', marginBottom: '16px' }}>
              Si ya incorporaste el gimnasio a tu rutina como triatleta, vas un paso adelante. Sabés que la fuerza importa. Pero entrenar sin datos de base te deja trabajando sobre suposiciones: creés que estás mejorando lo que más necesitás, cuando quizás estás invirtiendo tiempo en lo que ya tenés resuelto.
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563', marginBottom: '16px', fontWeight: '700' }}>
              Sin una evaluación, no sabes qué mejorar. Solo supones.
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563', marginBottom: '16px' }}>
              La batería de evaluaciones te da información concreta sobre tus puntos débiles y tus puntos fuertes: qué capacidades necesitás desarrollar antes de la próxima temporada y cuáles ya están en buen nivel. Esos datos son el punto de partida real para que vos o tu entrenador armen una planificación con objetivos precisos.
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563', marginBottom: '24px' }}>
              Con esta batería vas a conocer tu nivel de fuerza máxima y explosiva, detectar asimetrías entre piernas que afectan tu rendimiento sin que lo notes, identificar restricciones de movilidad que limitan tu mecánica y medir tu capacidad reactiva, uno de los factores más determinantes en la economía de carrera.
            </p>
          </div>
          <div style={{
            background: 'var(--light)',
            borderLeft: '4px solid var(--primary)',
            padding: '18px 20px',
            borderRadius: '0 12px 12px 0'
          }}>
            <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--dark)', margin: 0, fontStyle: 'italic' }}>
              «Sabés exactamente dónde poner el foco en la pretemporada.»
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
              Tecnología Kinvent: Precisión de laboratorio en el mundo real
            </h3>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563', marginBottom: '16px' }}>
              Todas las evaluaciones se realizan con sensores <strong>Kinvent Biomecanique</strong>, empresa presente en más de 80 países, utilizada por más de 6.000 profesionales del rendimiento y la salud, y con más de 213.000 atletas evaluados en todo el mundo.
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563', marginBottom: '24px' }}>
              La tecnología Kinvent combina sensores conectados a una sola aplicación, permitiendo cuantificar fuerza, potencia, equilibrio y movilidad articular en tiempo real. Estos datos son igual de valiosos para un kinesiólogo que sigue una readaptación al deporte de un atleta lesionado, para un entrenador que busca aumentar rendimiento, o para un profesional de la salud que necesita objetivar la evolución funcional de un paciente. En este caso, para medir la capacidad física de deportistas que realizan su actividad de manera profesional o amateur.
            </p>
            <h4 style={{
              fontSize: '20px',
              fontWeight: '800',
              color: 'var(--dark)',
              marginBottom: '12px'
            }}>
              ¿Cuál es mi rol con Kinvent?
            </h4>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563', marginBottom: '24px' }}>
              Como profesional del entrenamiento físico vinculado al ámbito del rendimiento deportivo, se estableció una colaboración con Kinvent en calidad de embajador oficial en Argentina.
            </p>
          </div>
          <div style={{
            background: 'var(--light)',
            borderLeft: '4px solid var(--dark)',
            padding: '18px 20px',
            borderRadius: '0 12px 12px 0'
          }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-600)', margin: 0 }}>
              «En este rol, mi compromiso es garantizar que recibís tecnología validada científicamente, feedback técnico de primer nivel y resultados comparables con estándares dentro del rendimiento deportivo.»
            </p>
          </div>
        </div>

      </div>

      {/* Batería de Evaluaciones Section Header */}
      <header style={{ textAlign: 'center', padding: '20px 0 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 className="premium-title" style={{ fontSize: '32px' }}>
          Batería de Evaluaciones
        </h2>
        <div className="accent-divider"></div>
        <p style={{ color: 'var(--gray-500)', fontSize: '16px', maxWidth: '850px', lineHeight: '1.6', textAlign: 'center', margin: '0' }}>
          Te muestro las distintas evaluaciones que pueden realizarse utilizando los sensores Kinvent. La batería de tests se adapta según el perfil del evaluado (deportista amateur, adolescente en proyección, atleta profesional) y los objetivos específicos de cada deporte.
        </p>
      </header>

      {/* Batería de Evaluaciones */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '50px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '45px',
        maxWidth: '1200px',
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
            </ul>
          </div>
        </div>

        {/* 3. Fuerza Máxima Isométrica (Texto Izq, Imagen Der) */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <h3 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--dark)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, textAlign: 'center' }}>
            Fuerza Máxima Isométrica
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
            <ul style={{ listStyleType: 'disc', paddingLeft: '28px', margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                Flexión de rodilla en decúbito prono con flexión de 90°
              </li>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                Extensión de rodilla en sedestación con flexión de 90°
              </li>
            </ul>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={rodillaImg} alt="Salud de Rodilla" style={{ width: '100%', maxWidth: '340px', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }} />
            </div>
          </div>
        </div>

        {/* 4. Fuerza Isométrica Multiarticular (Imagen Izq, Texto Der) */}
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <h3 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--dark)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, textAlign: 'center' }}>
            Fuerza Isométrica Multiarticular
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={imtpImg} alt="Fuerza Isométrica Multiarticular" style={{ width: '100%', maxWidth: '340px', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }} />
            </div>
            <ul style={{ listStyleType: 'disc', paddingLeft: '28px', margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                IMTP (Mid-Thigh Pull)
              </li>
            </ul>
          </div>
        </div>

        {/* 5. Fuerza Reactiva & Explosiva (Texto Izq, Imagen Der) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <h3 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--dark)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, textAlign: 'center' }}>
            Fuerza Reactiva & Explosiva
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
            <ul style={{ listStyleType: 'disc', paddingLeft: '28px', margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                CMJ (Salto con contramovimiento)
              </li>
              <li style={{ fontSize: '19px', fontWeight: '600', color: '#334155', lineHeight: '1.5' }}>
                Prueba de Skipping / Prueba 10/5 RJT o RSI
              </li>
            </ul>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={saltoImg} alt="Fuerza Reactiva & Explosiva" style={{ width: '100%', maxWidth: '340px', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }} />
            </div>
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
          ¿Querés conocer tu perfil físico y optimizar tu rendimiento?
        </h3>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.85)', maxWidth: '650px', margin: '0 0 32px 0', lineHeight: '1.6' }}>
          Coordiná tu sesión de evaluación individual con tecnología Kinvent. Obtené datos precisos, identifica tus puntos de mejora y elevá tu preparación física al siguiente nivel.
        </p>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => handleDownload(evalConfig.individualPdfUrl || '/Evaluaciones_Kinvent.pdf', 'Evaluaciones_Biomecanicas_Individuales.pdf')}
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
            href={evalConfig.individualFormLink || 'https://docs.google.com/forms/d/e/1FAIpQLSeAJwoKDSgk7M03ZwGfbyfE1KuM4PEAQlJNlhlFov5MlKXf0Q/viewform'}
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
            Solicitar Turno Individual
          </a>
        </div>
      </div>

    </div>
  );
};

export default EvaluacionesIndividual;
