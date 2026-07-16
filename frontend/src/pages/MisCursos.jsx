import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ContentCard from '../components/ContentCard';
import { IoSchoolOutline } from 'react-icons/io5';

const MisCursos = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCursos = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [coursesRes, workshopsRes] = await Promise.all([
          api.get('/content?type=course'),
          api.get('/content?type=workshop')
        ]);

        const allContent = [
          ...(coursesRes.data?.success ? coursesRes.data.data : []),
          ...(workshopsRes.data?.success ? workshopsRes.data.data : [])
        ];

        // Filter contents to only those the user has access to
        const isPrivileged = user && ['admin', 'professor', 'profe', 'instructor'].includes(user.role);
        const isPremium = user && (user.membership === 'premium' || user.isSubscribed === true);
        const ownedIds = user && user.purchasedItems ? user.purchasedItems.map(item => item._id || item) : [];

        const filtered = allContent.filter(item => {
          if (isPrivileged) return true;
          if (item.accessType === 'free') return true;
          if (item.accessType === 'subscription' && isPremium) return true;
          if (item.accessType === 'one-time-purchase' && ownedIds.includes(item._id)) return true;
          return false;
        });

        setCourses(filtered);
      } catch (error) {
        console.error('Error fetching user courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, [user]);

  if (authLoading || (loading && !user)) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--gray-500)' }}>
        Cargando tus formaciones...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
        <div className="premium-card" style={{ padding: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--dark)', marginBottom: '16px' }}>
            Acceso Restringido
          </h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: '24px' }}>
            Inicia sesión para ver tus cursos y workshops guardados.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px 20px', fontFamily: 'var(--font-sans)' }}>
      <header style={{ textAlign: 'center', padding: '60px 0 40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontSize: '80px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.5px', marginBottom: '12px', color: 'var(--dark)' }}>
          Mis Workshops & Cursos
        </h1>
        <div className="accent-divider"></div>
        <p style={{ color: 'var(--gray-500)', fontSize: '16px', maxWidth: '640px', lineHeight: '1.6', textAlign: 'center' }}>
          Accede a todos los cursos y talleres prácticos en los que estás inscrito.
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-500)' }}>
          Cargando formaciones...
        </div>
      ) : courses.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--gray-500)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <IoSchoolOutline size={56} color="#94a3b8" />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--dark)', marginBottom: '10px' }}>
            Aún no estás inscrito en ninguna formación
          </h3>
          <p style={{ color: 'var(--gray-500)', marginBottom: '24px', fontSize: '14px', lineHeight: '1.6' }}>
            Explora nuestros cursos prácticos de biomecánica y workshops en vivo para potenciar tu carrera.
          </p>
          <button onClick={() => navigate('/cursos')} className="btn-primary">
            Ver Cursos Disponibles
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' }}>
          {courses.map((content) => (
            <ContentCard key={content._id} content={content} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MisCursos;
