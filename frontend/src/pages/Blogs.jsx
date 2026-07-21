import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ContentCard from '../components/ContentCard';
import { IoSearch, IoArrowBack, IoChevronBack, IoChevronForward } from 'react-icons/io5';

const Blogs = () => {
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [accessFilter, setAccessFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchBlogsAndCategories = async () => {
      setLoading(true);
      try {
        const [blogsRes, catsRes] = await Promise.all([
          api.get('/content?type=blog&minimal=true'),
          api.get('/categories?type=blog')
        ]);

        if (blogsRes.data && blogsRes.data.success) {
          setContents(blogsRes.data.data);
        }
        if (catsRes.data && catsRes.data.success) {
          setCategories(catsRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching data for blogs page:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogsAndCategories();
  }, []);

  const filteredContents = contents.filter(c => {
    // 0. Published check (exclude drafts)
    if (c.isPublished === false || c.status === 'draft') {
      return false;
    }
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
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.publishDate || a.createdAt || 0);
    const dateB = new Date(b.publishDate || b.createdAt || 0);
    return dateB - dateA; // del más nuevo al más viejo
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredContents.length / itemsPerPage);
  const paginatedContents = filteredContents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchText, accessFilter]);

  return (
    <div className="animate-fade-in">
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
      <header style={{ textAlign: 'center', padding: '40px 0 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 className="premium-title">
          Artículos & Blogs
        </h1>
        <div className="accent-divider"></div>
      </header>

      {/* Search and Filters Bar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        maxWidth: '850px',
        margin: '0 auto 40px auto',
        padding: '0 20px'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '2 1 300px' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', display: 'flex', alignItems: 'center' }}>
            <IoSearch size={18} />
          </span>
          <input
            type="text"
            placeholder="Buscar artículo por título o descripción..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="premium-input"
            style={{ paddingLeft: '48px', height: '44px', fontSize: '14px' }}
          />
        </div>

        {/* Category Filter Dropdown */}
        <div style={{ flex: '1 1 200px' }}>
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
        <div style={{ flex: '1 1 200px' }}>
          <select
            value={accessFilter}
            onChange={(e) => setAccessFilter(e.target.value)}
            className="premium-input"
            style={{ height: '44px', fontSize: '14px', backgroundColor: '#ffffff', cursor: 'pointer' }}
          >
            <option value="all">Todos los accesos</option>
            <option value="free">Acceso Libre</option>
            <option value="subscription">Membresía Premium</option>
            <option value="one-time-purchase">Pago Único</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-500)' }}>
          Cargando lecturas...
        </div>
      ) : filteredContents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gray-500)', border: '1px solid var(--border)', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          No hay artículos publicados en esta categoría en este momento.
        </div>
      ) : (
        <>
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' }}>
            {paginatedContents.map((content) => (
              <ContentCard key={content._id} content={content} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '60px', marginBottom: '20px' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', borderRadius: '12px',
                  backgroundColor: currentPage === 1 ? '#f1f5f9' : '#1f75f5ff',
                  color: currentPage === 1 ? '#94a3b8' : '#ffffff',
                  fontWeight: '800', border: 'none',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  boxShadow: currentPage === 1 ? 'none' : '0 4px 14px rgba(31, 117, 245, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                <IoChevronBack size={18} /> Anterior
              </button>

              <div style={{ padding: '10px 20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: '800', color: '#0f172a' }}>
                Página <span>{currentPage}</span> de {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', borderRadius: '12px',
                  backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#1f75f5ff',
                  color: currentPage === totalPages ? '#94a3b8' : '#ffffff',
                  fontWeight: '800', border: 'none',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  boxShadow: currentPage === totalPages ? 'none' : '0 4px 14px rgba(31, 117, 245, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                Siguiente <IoChevronForward size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Blogs;
