import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ContentCard from '../components/ContentCard';
import { IoSearch, IoArrowBack } from 'react-icons/io5';

const Cursos = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [contents, setContents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [accessFilter, setAccessFilter] = useState('all');
  const [subtypeFilter, setSubtypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      alert("Por favor, inicia sesión para acceder a la sección de Cursos y Workshops.");
      navigate('/login');
      return;
    }

    const fetchContentAndCategories = async () => {
      setLoading(true);
      try {
        const [coursesRes, workshopsRes, catsRes] = await Promise.all([
          api.get('/content?type=course'),
          api.get('/content?type=workshop'),
          api.get('/categories?type=course')
        ]);
        const courses = coursesRes.data?.success ? coursesRes.data.data : [];
        const workshops = workshopsRes.data?.success ? workshopsRes.data.data : [];
        setContents([...courses, ...workshops]);

        if (catsRes.data && catsRes.data.success) {
          setCategories(catsRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContentAndCategories();
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '18px', color: 'var(--gray-500)', fontFamily: 'var(--font-sans)' }}>
        Cargando...
      </div>
    );
  }

  const filteredContents = contents.filter(c => {
    // 1. Category check
    if (activeCategory !== 'all') {
      const catId = c.category?._id || c.category;
      if (catId !== activeCategory) return false;
    }
    // 2. Search check (title or description)
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const titleMatch = c.title?.toLowerCase().includes(searchLower);
      const descMatch = c.description?.toLowerCase().includes(searchLower);
      if (!titleMatch && !descMatch) return false;
    }
    // 3. Access check
    if (accessFilter !== 'all' && c.accessType !== accessFilter) {
      return false;
    }
    // 4. Subtype check (course vs workshop)
    if (subtypeFilter !== 'all' && c.contentType !== subtypeFilter) {
      return false;
    }
    return true;
  });

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
      <header style={{ textAlign: 'center', padding: '60px 0 30px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 className="premium-title">
          Workshops & Capacitaciones
        </h1>
        <div className="accent-divider"></div>
        <p style={{ color: 'var(--gray-500)', fontSize: '16px', maxWidth: '640px', lineHeight: '1.6', textAlign: 'center' }}>
          Talleres intensivos de biomecánica aplicada y cursos de especialización en hipertrofia, fuerza y programación del entrenamiento deportivo.
        </p>
      </header>

      {/* Search and Filters Bar */}
      <div style={{
        display: 'flex',
        gap: '14px',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        maxWidth: '1050px',
        margin: '0 auto 40px auto',
        padding: '0 10px'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '2 1 260px' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', display: 'flex', alignItems: 'center' }}>
            <IoSearch size={18} />
          </span>
          <input
            type="text"
            placeholder="Buscar por título o tema del curso..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="premium-input"
            style={{ paddingLeft: '48px', height: '44px', fontSize: '14px' }}
          />
        </div>

        {/* Modalidad / Subtype Filter Dropdown */}
        <div style={{ flex: '1 1 180px' }}>
          <select
            value={subtypeFilter}
            onChange={(e) => setSubtypeFilter(e.target.value)}
            className="premium-input"
            style={{ height: '44px', fontSize: '14px', backgroundColor: '#ffffff', cursor: 'pointer' }}
          >
            <option value="all">Todas las modalidades</option>
            <option value="course">Cursos de Especialización</option>
            <option value="workshop">Workshops Prácticos</option>
          </select>
        </div>

        {/* Category Filter Dropdown */}
        <div style={{ flex: '1 1 180px' }}>
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="premium-input"
            style={{ height: '44px', fontSize: '14px', backgroundColor: '#ffffff', cursor: 'pointer' }}
          >
            <option value="all">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Access Filter Dropdown */}
        <div style={{ flex: '1 1 180px' }}>
          <select
            value={accessFilter}
            onChange={(e) => setAccessFilter(e.target.value)}
            className="premium-input"
            style={{ height: '44px', fontSize: '14px', backgroundColor: '#ffffff', cursor: 'pointer' }}
          >
            <option value="all">Todos los accesos</option>
            <option value="free">Acceso Gratuito</option>
            <option value="subscription">Membresía Premium</option>
            <option value="one-time-purchase">Pago Único</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-500)' }}>
          Cargando contenido...
        </div>
      ) : filteredContents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--gray-500)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
        }}>
          No se encontraron cursos ni workshops que coincidan con los filtros seleccionados.
        </div>
      ) : (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' }}>
          {filteredContents.map((content) => (
            <ContentCard key={content._id} content={content} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Cursos;
