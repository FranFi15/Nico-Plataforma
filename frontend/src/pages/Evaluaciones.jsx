import React from 'react';
import { Link } from 'react-router-dom';
import evaluacionesVideo from '../assets/Video presentacion Evaluaciones.mp4';
import nsLogo from '../assets/ns.png';

const Evaluaciones = () => {
  return (
    <div className="animate-fade-in" style={{ margin: 0, padding: 0, width: '100%', overflow: 'hidden' }}>
      {/* Full Screen Hero Video Presentation (100% Width & Height) */}
      <section style={{
        position: 'relative',
        height: '100vh',
        marginTop: '-106px', // Shift up under the navbar height
        paddingTop: '106px', // Keep content centered relative to screen
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#051020'
      }}>
        {/* Background Video occupying 100% width & height */}
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

        {/* Blue Filter Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(5, 24, 53, 0.72)',
          zIndex: 1.5,
          pointerEvents: 'none'
        }} />

        {/* Hero Content Over Video */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          color: '#ffffff',
          textAlign: 'center',
          maxWidth: '950px',
          padding: '20px',
        }}>
          <img
            src={nsLogo}
            alt="Nicolás Sesma"
            style={{
              height: '90px',
              objectFit: 'contain',
              marginBottom: '28px',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'
            }}
          />
          <h1 style={{
            fontSize: '44px',
            lineHeight: '1.25',
            fontWeight: '900',
            marginBottom: '24px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textShadow: '0 2px 12px rgba(0,0,0,0.6)'
          }}>
            Transformá datos en rendimiento: La diferencia entre entrenar y mejorar
          </h1>

          <p style={{
            fontSize: '21px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.92)',
            marginBottom: '48px',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto',
            fontWeight: '400',
            textShadow: '0 1px 6px rgba(0,0,0,0.5)'
          }}>
            Un sistema integral de evaluación que transforma datos en planes de entrenamiento inteligentes.
          </p>

          {/* Two Navigation Buttons Over Video */}
          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/evaluaciones/individual"
              style={{
                padding: '18px 42px',
                fontSize: '17px',
                fontWeight: '800',
                borderRadius: '14px',
                textDecoration: 'none',
                background: '#ffffff',
                color: '#051020',
                boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                transition: 'transform 0.2s ease, background 0.2s ease',
                display: 'inline-block'
              }}
            >
              EVALUACIÓN INDIVIDUAL
            </Link>

            <Link
              to="/evaluaciones/colectivo"
              style={{
                padding: '18px 42px',
                fontSize: '17px',
                fontWeight: '800',
                borderRadius: '14px',
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.25)',
                boxShadow: '0 10px 30px rgba(2, 132, 199, 0.45)',
                transition: 'transform 0.2s ease, filter 0.2s ease',
                display: 'inline-block'
              }}
            >
              EVALUACIÓN COLECTIVA
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Evaluaciones;
