import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import evaluacionesVideo from '../assets/Video presentacion Evaluaciones.mp4';

const Evaluaciones = () => {
  const detailsRef = useRef(null);

  const scrollToDetails = () => {
    detailsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in" style={{ margin: '0', padding: '0', width: '100%' }}>
      {/* Hero Video Section */}
      <section style={{
        position: 'relative',
        minHeight: '92vh',
        marginTop: '-106px', // Shift up under the navbar height
        paddingTop: '106px', // Keep content centered relative to screen
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#051020'
      }}>
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'translate(-50%, -50%)',
            opacity: '0.65',
            zIndex: 1
          }}
        >
          <source src={evaluacionesVideo} type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>

        {/* Blue Filter Overlay for readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(5, 24, 53, 0.70)',
          zIndex: 1.5,
          pointerEvents: 'none'
        }} />

        {/* Hero Content Over Video */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          color: '#ffffff',
          textAlign: 'center',
          maxWidth: '900px',
          padding: '60px 20px',
        }}>
          <h1 style={{
            fontSize: '42px',
            lineHeight: '1.25',
            fontWeight: '900',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}>
            Transformá datos en rendimiento: La diferencia entre entrenar y mejorar
          </h1>

          <p style={{
            fontSize: '20px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '40px',
            maxWidth: '780px',
            marginLeft: 'auto',
            marginRight: 'auto',
            fontWeight: '400',
            textShadow: '0 1px 5px rgba(0,0,0,0.4)'
          }}>
            Un sistema integral de evaluación que transforma datos en planes de entrenamiento inteligentes.
          </p>

          {/* Two Buttons Over Video */}
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/evaluaciones/individual"
              style={{
                padding: '16px 36px',
                fontSize: '16px',
                fontWeight: '800',
                borderRadius: '12px',
                textDecoration: 'none',
                background: '#ffffff',
                color: '#051020',
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s ease, background 0.2s ease'
              }}
            >
              Evaluación Individual
            </Link>

            <Link
              to="/evaluaciones/colectivo"
              style={{
                padding: '16px 36px',
                fontSize: '16px',
                fontWeight: '800',
                borderRadius: '12px',
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 25px rgba(2, 132, 199, 0.4)',
                transition: 'transform 0.2s ease, filter 0.2s ease'
              }}
            >
              Evaluación Colectiva
            </Link>
          </div>

          <div style={{ marginTop: '36px' }}>
            <button
              onClick={scrollToDetails}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '13px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              ↓ Conocé la tecnología Kinvent ↓
            </button>
          </div>
        </div>

        {/* Bottom Fade-out Gradient */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40px',
          background: 'linear-gradient(to bottom, transparent, #f3f4f6)',
          zIndex: 2,
          pointerEvents: 'none'
        }} />
      </section>

      {/* Details Section Below Video */}
      <section ref={detailsRef} style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#051020', marginBottom: '16px' }}>
            Tecnología Kinvent Biomécanique en Argentina
          </h2>
          <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563', maxWidth: '850px', margin: '0 auto' }}>
            Incorporamos dispositivos de vanguardia —K-Force Plates, K-Push, K-Power y K-Pull— para obtener datos de alta precisión sobre fuerza, potencia, velocidad y activación muscular. Cada evaluación incluye un dashboard personalizado que identifica fortalezas y debilidades de cada deportista.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px'
        }}>
          {/* Tarjeta Individual */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '36px',
            border: '1px solid rgba(5, 16, 32, 0.08)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                display: 'inline-block',
                padding: '6px 14px',
                background: '#e0f2fe',
                color: '#0369a1',
                borderRadius: '30px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '20px'
              }}>
                Modalidad 1 a 1
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#051020', marginBottom: '14px' }}>
                Evaluación Individual
              </h3>
              <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.6', marginBottom: '28px' }}>
                Pensada para deportistas amateurs o de alto rendimiento y personas que cursan procesos de rehabilitación. Análisis completo con reporte detallado.
              </p>
            </div>
            <Link
              to="/evaluaciones/individual"
              className="btn-primary"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '14px 24px',
                borderRadius: '12px',
                fontWeight: '700',
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #051020 0%, #1e3a5f 100%)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(5, 16, 32, 0.2)'
              }}
            >
              Explorar Individual →
            </Link>
          </div>

          {/* Tarjeta Colectiva */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '36px',
            border: '1px solid rgba(5, 16, 32, 0.08)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{
                display: 'inline-block',
                padding: '6px 14px',
                background: '#fef3c7',
                color: '#b45309',
                borderRadius: '30px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '20px'
              }}>
                Planteles y Clubes
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#051020', marginBottom: '14px' }}>
                Evaluación Colectiva
              </h3>
              <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.6', marginBottom: '28px' }}>
                Diseñada para clubes deportivos e instituciones. Evaluaciones grupales ágiles en campo o gimnasio para monitorear el estado físico de todo el equipo.
              </p>
            </div>
            <Link
              to="/evaluaciones/colectivo"
              className="btn-primary"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '14px 24px',
                borderRadius: '12px',
                fontWeight: '700',
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
              }}
            >
              Explorar Colectivo →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Evaluaciones;
