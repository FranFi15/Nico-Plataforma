import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ContentCard from '../components/ContentCard';
import { IoFolder, IoFolderOpen, IoTrash, IoWarning, IoAddOutline } from 'react-icons/io5';

const MisCarpetas = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchFolders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/folders');
      if (response.data && response.data.success) {
        setFolders(response.data.data);
        // Sync active folder with fresh data if already selected
        if (activeFolder) {
          const freshActive = response.data.data.find(f => f._id === activeFolder._id);
          setActiveFolder(freshActive || null);
        }
      }
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError('No se pudieron cargar tus carpetas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setCreating(true);
    setError('');
    try {
      const response = await api.post('/folders', { name: newFolderName.trim() });
      if (response.data && response.data.success) {
        setNewFolderName('');
        await fetchFolders();
      }
    } catch (err) {
      console.error('Error creating folder:', err);
      setError(err.response?.data?.message || 'Error al crear la carpeta.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteFolder = async (folderId, e) => {
    e.stopPropagation(); // Avoid opening the folder when clicking delete
    if (!await window.confirm('¿Estás seguro de que deseas eliminar esta carpeta?')) return;

    setError('');
    try {
      const response = await api.delete(`/folders/${folderId}`);
      if (response.data && response.data.success) {
        if (activeFolder && activeFolder._id === folderId) {
          setActiveFolder(null);
        }
        await fetchFolders();
      }
    } catch (err) {
      console.error('Error deleting folder:', err);
      setError('Error al eliminar la carpeta.');
    }
  };

  const handleRemoveItem = async (folderId, contentId, e) => {
    e.preventDefault();
    if (!await window.confirm('¿Deseas quitar este elemento de la carpeta?')) return;

    setError('');
    try {
      const response = await api.delete(`/folders/${folderId}/items/${contentId}`);
      if (response.data && response.data.success) {
        // Update local folder list and keep active folder sync
        const updatedFolder = response.data.data;
        setFolders(prev => prev.map(f => f._id === folderId ? updatedFolder : f));
        setActiveFolder(updatedFolder);
      }
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Error al quitar el elemento de la carpeta.');
    }
  };

  if (authLoading || (loading && !user)) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--gray-500)' }}>
        Cargando tus carpetas...
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
            Inicia sesión para ver y organizar tus carpetas guardadas.
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
          Mis Carpetas
        </h1>
        <div className="accent-divider"></div>
        <p style={{ color: 'var(--gray-500)', fontSize: '16px', maxWidth: '640px', lineHeight: '1.6', textAlign: 'center' }}>
          Organiza tus contenidos favoritos en carpetas temáticas.
        </p>
      </header>

      {error && (
        <div className="premium-alert premium-alert-error" style={{ maxWidth: '600px', margin: '0 auto 30px auto' }}>
          <IoWarning size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Create & list folders */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '40px', alignItems: 'start' }}>
        {/* Left Side: Create Folder & Folder list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Create Folder Box */}
          <div className="premium-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--dark)', marginBottom: '16px' }}>
              Nueva Carpeta
            </h3>
            <form onSubmit={handleCreateFolder} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Nombre de la carpeta"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="premium-input"
                style={{ padding: '10px 14px', fontSize: '14px' }}
                disabled={creating}
                required
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '12px', fontSize: '13px', width: '100%' }}
                disabled={creating || !newFolderName.trim()}
              >
                {creating ? 'Creando...' : 'Crear Carpeta'}
              </button>
            </form>
          </div>

          {/* List of Folders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gray-500)', marginBottom: '6px' }}>
              Carpetas ({folders.length})
            </h3>
            {folders.length === 0 ? (
              <div style={{ color: 'var(--gray-500)', fontSize: '14px', fontStyle: 'italic', padding: '10px 0' }}>
                No tienes carpetas creadas.
              </div>
            ) : (
              folders.map((folder) => {
                const isActive = activeFolder && activeFolder._id === folder._id;
                return (
                  <div
                    key={folder._id}
                    onClick={() => setActiveFolder(folder)}
                    style={{
                      padding: '16px 20px',
                      backgroundColor: isActive ? 'var(--gray-100)' : '#ffffff',
                      border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', fontWeight: '700', fontSize: '15px', color: 'var(--dark)' }}>
                        <IoFolder size={18} color="var(--primary)" style={{ marginRight: '8px' }} /> {folder.name}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: '600' }}>
                        {folder.items?.length || 0} elementos guardados
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteFolder(folder._id, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--gray-400)',
                        fontSize: '18px',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '6px',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray-400)'}
                      title="Eliminar carpeta"
                    >
                      <IoTrash size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Folder contents */}
        <div>
          {activeFolder ? (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border)',
                paddingBottom: '16px',
                marginBottom: '30px'
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', color: 'var(--dark)' }}>
                  Carpeta: {activeFolder.name}
                </h2>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '800',
                  color: 'var(--primary)',
                  backgroundColor: 'rgba(31, 117, 245, 0.1)',
                  padding: '6px 14px',
                  borderRadius: '20px'
                }}>
                  {activeFolder.items?.length || 0} guardados
                </span>
              </div>

              {activeFolder.items?.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: 'var(--gray-500)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff'
                }}>
                  <div style={{ color: 'var(--gray-400)', marginBottom: '14px', display: 'flex', justifyContent: 'center' }}><IoFolderOpen size={40} /></div>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--dark)', marginBottom: '8px' }}>
                    Esta carpeta está vacía
                  </h4>
                  <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
                    Explora la <span style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }} onClick={() => navigate('/blogs')}>videoteca</span> o los <span style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }} onClick={() => navigate('/blogs')}>artículos científicos</span> y guárdalos aquí.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                  {activeFolder.items.map((item) => (
                    <div key={item._id} style={{ position: 'relative' }}>
                      <ContentCard content={item} />
                      <button
                        onClick={(e) => handleRemoveItem(activeFolder._id, item._id, e)}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          zIndex: 15,
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '100px 20px',
              color: 'var(--gray-500)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{ color: 'var(--primary)', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}><IoFolder size={64} /></div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--dark)', marginBottom: '10px' }}>
                Selecciona una carpeta
              </h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '15px', maxWidth: '400px', lineHeight: '1.6' }}>
                Elige una carpeta de la izquierda para visualizar los artículos y videos que has guardado en ella.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MisCarpetas;
