import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ContentCard from '../components/ContentCard';
import { IoArrowBack } from 'react-icons/io5';

const Cursos = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      alert("Por favor, inicia sesión para acceder a la sección de Cursos y Workshops.");
      navigate('/login');
      return;
    }

    const fetchContent = async () => {
      setLoading(true);
      try {
        // Fetch both courses and workshops
        const [coursesRes, workshopsRes] = await Promise.all([
          api.get('/content?type=course'),
          api.get('/content?type=workshop'),
        ]);
        const courses = coursesRes.data?.success ? coursesRes.data.data : [];
        const workshops = workshopsRes.data?.success ? workshopsRes.data.data : [];
        setContents([...courses, ...workshops]);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '18px', color: 'var(--gray-500)', fontFamily: 'var(--font-sans)' }}>
        Cargando...
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 20px 60px 20px' }}>
      <button
        onClick={() => navigate('/capacitaciones')}
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
        <IoArrowBack size={16} /> Volver a Capacitaciones
      </button>
      <header style={{ textAlign: 'center', padding: '60px 0 40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 className="premium-title">
          Workshops & Capacitaciones
        </h1>
        <div className="accent-divider"></div>
        <p style={{ color: 'var(--gray-500)', fontSize: '16px', maxWidth: '640px', lineHeight: '1.6', textAlign: 'center' }}>
          Talleres intensivos de biomecánica aplicada y cursos de especialización en hipertrofia, fuerza y programación del entrenamiento deportivo.
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-500)' }}>
          Cargando contenido...
        </div>
      ) : contents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--gray-500)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          backgroundColor: '#ffffff'
        }}>
          No hay workshops ni cursos disponibles en este momento. Vuelve a consultar más tarde.
        </div>
      ) : (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' }}>
          {contents.map((content) => (
            <ContentCard key={content._id} content={content} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Cursos;
