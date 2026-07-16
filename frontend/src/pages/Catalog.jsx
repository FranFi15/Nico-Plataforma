import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ContentCard from '../components/ContentCard';

const Catalog = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const catalogSectionRef = useRef(null);

  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    type: '',
    accessType: '',
  });

  const fetchContents = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.accessType) queryParams.append('accessType', filters.accessType);

      const response = await api.get(`/content?${queryParams.toString()}`);
      if (response.data && response.data.success) {
        setContents(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching catalog data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const scrollToCatalog = () => {
    catalogSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px 20px' }}>
      {/* 1. Hero Section */}
      <section style={{ 
        textAlign: 'center', 
        padding: '80px 0 60px 0', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div className="lift-badge" style={{ marginBottom: '24px' }}>
          TU MEJOR INVERSIÓN EN EDUCACIÓN DEPORTIVA
        </div>
        <h1 style={{ 
          fontSize: '52px', 
          fontWeight: '900', 
          lineHeight: '1.1', 
          maxWidth: '800px',
          textTransform: 'uppercase',
          letterSpacing: '-1px',
          marginBottom: '16px',
          color: 'var(--dark)',
        }}>
          Domina el Entrenamiento de Fuerza y Rendimiento Deportivo
        </h1>
        
        <div className="accent-divider"></div>

        <p style={{ 
          color: 'var(--gray-500)', 
          fontSize: '17px', 
          maxWidth: '640px', 
          lineHeight: '1.6',
          marginBottom: '32px'
        }}>
          Accede a cursos prácticos, talleres de biomecánica y lecturas científicas sobre fisiología, dosificación de carga y preparación física de atletas.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={scrollToCatalog} className="btn-primary">
            Explorar Catálogo
          </button>
          {!user?.isSubscribed && (
            <button onClick={() => navigate('/checkout')} className="btn-secondary">
              Unirse a Premium
            </button>
          )}
        </div>
      </section>

      {/* 2. Benefits Grid */}
      <section style={{ padding: '40px 0 80px 0' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '900', textAlign: 'center', marginBottom: '40px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--dark)' }}>
          ¿Qué vas a encontrar en Nico Lift?
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div className="premium-card" style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '16px' }}>
              <IoFitnessOutline size={36} color="#1f75f5" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--dark)' }}>Formaciones de Fuerza</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '14px', lineHeight: '1.6' }}>
              Cursos en profundidad sobre biomecánica básica y avanzada, hipertrofia muscular y programación científica del entrenamiento de fuerza.
            </p>
          </div>
          
          <div className="premium-card" style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '16px' }}>
              <IoTimeOutline size={36} color="#1f75f5" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--dark)' }}>Workshops Biomecánicos</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '14px', lineHeight: '1.6' }}>
              Talleres en vivo y prácticos donde analizamos la técnica de levantamientos olímpicos, sentadilla y peso muerto en directo.
            </p>
          </div>

          <div className="premium-card" style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '16px' }}>
              <IoPeopleOutline size={36} color="#1f75f5" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--dark)' }}>Comunidad de Coaches</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '14px', lineHeight: '1.6' }}>
              Foros de debate y consultas técnicas directas con preparadores físicos, nutricionistas y kinesiólogos deportivos de alto rendimiento.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Membership CTA */}
      {!user?.isSubscribed && (
        <section style={{ marginBottom: '80px' }}>
          <div className="premium-card" style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: '30px',
            padding: '40px',
            borderLeft: '6px solid var(--primary)'
          }}>
            <div style={{ flex: '1', minWidth: '280px' }}>
              <div className="lift-badge" style={{ marginBottom: '12px' }}>MEMBRESÍA MENSUAL</div>
              <h3 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--dark)' }}>Desbloquea Todo el Contenido</h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '15px', lineHeight: '1.6', maxWidth: '600px' }}>
                Con la suscripción premium accedes a todos los cursos y lecturas científicas de forma ilimitada, y obtienes un 20% de descuento automático en cualquier workshop de especialización.
              </p>
            </div>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: '900', color: 'var(--dark)' }}>
                $19.90 <span style={{ fontSize: '14px', color: 'var(--gray-500)', fontWeight: '500' }}>/ mes</span>
              </div>
              <button onClick={() => navigate('/checkout')} className="btn-primary">
                Obtener Acceso Ilimitado
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. Catalog Grid & Filters */}
      <section ref={catalogSectionRef} style={{ scrollMarginTop: '80px', paddingTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--dark)' }}>
              Catálogo
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>
              Filtra las clases, guías de entrenamiento y talleres prácticos
            </p>
          </div>

          {/* Filter Controls */}
          <div style={{ 
            padding: '12px 20px', 
            display: 'flex', 
            gap: '16px', 
            flexWrap: 'wrap', 
            border: '1px solid var(--border)',
            borderRadius: '8px',
            backgroundColor: 'var(--gray-50)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--dark)', letterSpacing: '1px' }}>TIPO:</span>
              <select 
                name="type" 
                className="premium-input" 
                value={filters.type} 
                onChange={handleFilterChange}
                style={{ 
                  padding: '8px 12px', 
                  fontSize: '13px', 
                  minWidth: '150px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Todos</option>
                <option value="course">Cursos</option>
                <option value="blog">Blog</option>
                <option value="workshop">Workshops</option>
                <option value="videoteca">Videoteca</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--dark)', letterSpacing: '1px' }}>ACCESO:</span>
              <select 
                name="accessType" 
                className="premium-input" 
                value={filters.accessType} 
                onChange={handleFilterChange}
                style={{ 
                  padding: '8px 12px', 
                  fontSize: '13px', 
                  minWidth: '150px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Todos</option>
                <option value="free">Acceso Libre</option>
                <option value="subscription">Suscripción Premium</option>
                <option value="one-time-purchase">Pago Único</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-500)', fontSize: '16px' }}>
            Cargando catálogo...
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
            No se encontraron recursos que coincidan con los filtros seleccionados.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {contents.map((content) => (
              <ContentCard key={content._id} content={content} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Catalog;
