import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ContentCard from '../components/ContentCard';
import { IoFolderOpen, IoArrowBack, IoPlayCircleOutline } from 'react-icons/io5';

const Videoteca = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState(null); // null, 'general', or folder ID

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [foldersRes, videosRes] = await Promise.all([
          api.get('/videoteca-folders'),
          api.get('/content?type=videoteca')
        ]);

        if (foldersRes.data && foldersRes.data.success) {
          setFolders(foldersRes.data.data);
        }
        if (videosRes.data && videosRes.data.success) {
          setVideos(videosRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching videoteca data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to count videos in a folder
  const getVideosByFolder = (folderId) => {
    return videos.filter((video) => {
      const folderRef = video.videoFolder?._id || video.videoFolder;
      if (!folderId) {
        return !folderRef; // General videos (no folder)
      }
      return folderRef === folderId;
    });
  };

  // Folders that actually have videos, or just all folders
  const generalVideos = getVideosByFolder(null);

  const getSelectedFolderTitle = () => {
    if (selectedFolderId === 'general') return 'Videos Generales';
    const folder = folders.find(f => f._id === selectedFolderId);
    return folder ? folder.name : '';
  };

  const getSelectedFolderVideos = () => {
    if (selectedFolderId === 'general') return generalVideos;
    return getVideosByFolder(selectedFolderId);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 20px 60px 20px', fontFamily: 'var(--font-sans)' }}>
      <style>{`
        .videoteca-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 30px;
          margin-top: 20px;
        }
        .folder-card {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 40px 28px;
          min-height: 280px;
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          color: #ffffff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .folder-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(31, 117, 245, 0.25);
          border-color: rgba(31, 117, 245, 0.4);
        }
        .folder-card-img {
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
        .folder-card:hover .folder-card-img {
          transform: scale(1.08);
        }
        .folder-card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, rgba(1, 13, 25, 0.95) 15%, rgba(1, 13, 25, 0.55) 60%, rgba(1, 13, 25, 0.15) 100%);
          z-index: 2;
          transition: background 0.4s ease;
        }
        .folder-card:hover .folder-card-overlay {
          background: linear-gradient(to top, rgba(31, 117, 245, 0.75) 10%, rgba(1, 13, 25, 0.7) 60%, rgba(1, 13, 25, 0.2) 100%);
        }
        .folder-card-content {
          position: relative;
          z-index: 3;
        }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: var(--gray-600);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 13px;
          letter-spacing: 1px;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s ease;
          outline: none;
          margin-bottom: 30px;
        }
        .back-btn:hover {
          color: var(--primary);
        }
      `}</style>

      {selectedFolderId ? (
        <button
          onClick={() => setSelectedFolderId(null)}
          className="back-btn"
          style={{
            padding: '20px 0 0 0',
            marginBottom: '0'
          }}
        >
          <IoArrowBack size={16} /> Volver a Carpetas
        </button>
      ) : (
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
      )}

      {/* Hero Header */}
      <header style={{ textAlign: 'center', padding: '60px 0 40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 className="premium-title">
          {selectedFolderId ? getSelectedFolderTitle() : 'Videoteca'}
        </h1>
        <div className="accent-divider"></div>
        <p style={{ color: 'var(--gray-500)', fontSize: '16px', maxWidth: '640px', lineHeight: '1.6', textAlign: 'center', margin: 0 }}>
          {selectedFolderId
            ? `Explora los videos organizados en la categoría ${getSelectedFolderTitle()}.`
            : 'Accede a nuestra colección de videos técnicos, demostraciones de ejercicios, análisis biomecánicos y contenido audiovisual exclusivo.'}
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-500)' }}>
          Cargando videoteca...
        </div>
      ) : selectedFolderId ? (
        /* Folder detail view (videos within selected folder) */
        <div className="animate-fade-in">

          {getSelectedFolderVideos().length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--gray-500)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              backgroundColor: '#ffffff'
            }}>
              No hay videos disponibles en esta carpeta en este momento.
            </div>
          ) : (
            <div className="videoteca-grid animate-fade-in">
              {getSelectedFolderVideos().map((video) => (
                <ContentCard key={video._id} content={video} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Folders list view */
        <div>
          {folders.length === 0 && generalVideos.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--gray-500)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              backgroundColor: '#ffffff'
            }}>
              No hay videos disponibles en este momento. Vuelve a consultar más tarde.
            </div>
          ) : (
            <div className="videoteca-grid animate-fade-in">
              {/* Folders Cards */}
              {folders.map((folder) => {
                const folderVideos = getVideosByFolder(folder._id);
                const bgImg = folder.coverImage || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop';
                const truncatedFolderName = folder.name && folder.name.length > 45 ? folder.name.substring(0, 42) + '...' : folder.name;
                return (
                  <div
                    key={folder._id}
                    className="folder-card"
                    onClick={() => setSelectedFolderId(folder._id)}
                  >
                    <div className="folder-card-img" style={{ backgroundImage: `url(${bgImg})` }} />
                    <div className="folder-card-overlay" />
                    <div className="folder-card-content">
                      <h2 style={{ fontSize: '22px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', color: '#ffffff', lineHeight: '1.2' }}>
                        {truncatedFolderName}
                      </h2>
                      <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', margin: 0, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IoPlayCircleOutline size={16} /> {folderVideos.length} {folderVideos.length === 1 ? 'Video' : 'Videos'}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* General Folder Card (if general videos exist) */}
              {generalVideos.length > 0 && (
                <div
                  className="folder-card"
                  onClick={() => setSelectedFolderId('general')}
                >
                  <div className="folder-card-img" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop')` }} />
                  <div className="folder-card-overlay" />
                  <div className="folder-card-content">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255, 255, 255, 0.25)', marginBottom: '12px', letterSpacing: '0.5px' }}>
                      <IoFolderOpen size={12} /> Carpeta
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', color: '#ffffff', lineHeight: '1.2' }}>
                      Videos Generales
                    </h2>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', margin: 0, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IoPlayCircleOutline size={16} /> {generalVideos.length} {generalVideos.length === 1 ? 'Video' : 'Videos'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Videoteca;
