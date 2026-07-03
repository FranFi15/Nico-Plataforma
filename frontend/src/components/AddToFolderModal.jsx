import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { IoClose, IoFolder, IoCheckmarkCircle, IoWarning } from 'react-icons/io5';

const AddToFolderModal = ({ isOpen, onClose, contentId }) => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchFolders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/folders');
      if (response.data && response.data.success) {
        setFolders(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError('Error al cargar las carpetas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFolders();
      setNewFolderName('');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddToFolder = async (folderId, folderName) => {
    setError('');
    setSuccess('');
    try {
      const response = await api.post(`/folders/${folderId}/items`, { contentId });
      if (response.data && response.data.success) {
        setSuccess(`¡Guardado en la carpeta "${folderName}"!`);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Error adding item to folder:', err);
      setError(err.response?.data?.message || 'Error al guardar en la carpeta.');
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setError('');
    setSuccess('');
    setCreating(true);
    try {
      // 1. Create the folder
      const folderResponse = await api.post('/folders', { name: newFolderName.trim() });
      if (folderResponse.data && folderResponse.data.success) {
        const newFolder = folderResponse.data.data;
        // 2. Add the item to the new folder
        const addResponse = await api.post(`/folders/${newFolder._id}/items`, { contentId });
        if (addResponse.data && addResponse.data.success) {
          setSuccess(`Carpeta creada y guardado con éxito.`);
          setNewFolderName('');
          // Refresh folders list
          await fetchFolders();
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      }
    } catch (err) {
      console.error('Error creating folder and adding item:', err);
      setError(err.response?.data?.message || 'Error al crear la carpeta.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(1, 13, 25, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      fontFamily: 'var(--font-sans)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '460px',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        border: '1px solid var(--border)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            color: 'var(--gray-500)',
            cursor: 'pointer',
            padding: '5px',
            lineHeight: 1
          }}
        >
          <IoClose />
        </button>

        <h3 style={{
          fontSize: '22px',
          fontWeight: '900',
          color: 'var(--dark)',
          marginBottom: '20px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Agregar a Carpeta
        </h3>

        {/* Success Alert */}
        {success && (
          <div className="premium-alert premium-alert-success" style={{ marginBottom: '20px' }}>
            <IoCheckmarkCircle size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="premium-alert premium-alert-error" style={{ marginBottom: '20px' }}>
            <IoWarning size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Folders List */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{
            fontSize: '12px',
            fontWeight: '800',
            color: 'var(--gray-500)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px'
          }}>
            Tus Carpetas Guardadas
          </h4>

          {loading ? (
            <div style={{ color: 'var(--gray-500)', fontSize: '14px', padding: '10px 0' }}>
              Cargando carpetas...
            </div>
          ) : folders.length === 0 ? (
            <div style={{
              color: 'var(--gray-500)',
              fontSize: '14px',
              padding: '16px',
              background: 'var(--gray-50)',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px dashed var(--border)'
            }}>
              No tienes carpetas creadas. ¡Crea una abajo para empezar!
            </div>
          ) : (
            <div style={{
              maxHeight: '180px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              paddingRight: '4px'
            }}>
              {folders.map((folder) => (
                <button
                  key={folder._id}
                  onClick={() => handleAddToFolder(folder._id, folder.name)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    backgroundColor: 'var(--gray-50)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--dark)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--gray-100)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--gray-50)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}><IoFolder size={16} color="var(--primary)" style={{ marginRight: '8px' }} /> {folder.name}</span>
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--gray-500)',
                    backgroundColor: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)'
                  }}>
                    {folder.items?.length || 0} ítems
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Create Folder Form */}
        <form onSubmit={handleCreateAndAdd} style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '20px'
        }}>
          <h4 style={{
            fontSize: '12px',
            fontWeight: '800',
            color: 'var(--gray-500)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px'
          }}>
            Crear Nueva Carpeta
          </h4>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Ej. Biomecánica de Fuerza"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="premium-input"
              style={{ flex: 1, padding: '10px 14px', fontSize: '14px' }}
              disabled={creating}
              required
            />
            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: '10px 18px',
                fontSize: '12px',
                whiteSpace: 'nowrap'
              }}
              disabled={creating || !newFolderName.trim()}
            >
              {creating ? 'Creando...' : 'Crear y Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToFolderModal;
