import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import img1c from '../assets/1c.webp';
import img2c from '../assets/1.webp';
import img3c from '../assets/3c.webp';

const categories = [
  {
    title: 'Blog',
    description: 'Revisiones científicas, guías de entrenamiento y artículos técnicos de preparación física.',
    path: '/blogs',
    image: img1c,
  },
  {
    title: 'Videoteca',
    description: 'Videos técnicos, demostraciones de ejercicios, análisis biomecánicos y contenido exclusivo de rendimiento deportivo.',
    path: '/videoteca',
    image: img2c,
  },
  {
    title: 'Workshops & Capacitaciones',
    description: 'Talleres y cursos de especialización en hipertrofia, fuerza y programación del entrenamiento deportivo.',
    path: '/cursos',
    image: img3c,
  },
];

const CapacitacionesHub = () => {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '100%', margin: '0', padding: '0 20px' }}>
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
      <style>{`
        .hub-card-bg {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 50px 36px;
          min-height: 400px;
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          color: #ffffff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .hub-card-bg:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 36px rgba(31, 117, 245, 0.25);
        }
        .hub-card-bg-img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }
        .hub-card-bg:hover .hub-card-bg-img {
          transform: scale(1.08);
        }
        .hub-card-bg-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, rgba(1, 13, 25, 0.95) 15%, rgba(1, 13, 25, 0.55) 60%, rgba(1, 13, 25, 0.1) 100%);
          z-index: 2;
          transition: background 0.4s ease;
        }
        .hub-card-bg:hover .hub-card-bg-overlay {
          background: linear-gradient(to top, rgba(16, 60, 125, 0.95) 15%, rgba(1, 13, 25, 0.65) 60%, rgba(1, 13, 25, 0.1) 100%);
        }
        .hub-card-bg-content {
          position: relative;
          z-index: 3;
        }
      `}</style>

      {/* Hero Header */}
      <header style={{
        textAlign: 'center',
        padding: '60px 0 40px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <h1 className="premium-title" style={{
          maxWidth: '1400px',
          color: 'var(--dark)',
        }}>
          Elige tu camino
        </h1>
        <div className="accent-divider"></div>
      </header>

      {/* Category Cards Grid */}
      <section className="hub-grid grid-1-mobile" style={{ gap: '30px' }}>
        {categories.map((cat) => (
          <Link
            key={cat.path}
            to={cat.path}
            className="hub-card-bg"
          >
            <div className="hub-card-bg-img" style={{ backgroundImage: `url(${cat.image})` }} />
            <div className="hub-card-bg-overlay" />
            <div className="hub-card-bg-content">
              <h2 style={{
                fontSize: '24px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '12px',
                color: '#ffffff',
                lineHeight: '1.2'
              }}>
                {cat.title}
              </h2>
              <p style={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '14px',
                lineHeight: '1.6',
                margin: 0
              }}>
                {cat.description}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default CapacitacionesHub;
