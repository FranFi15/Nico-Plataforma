import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { IoChevronDown, IoChevronUp, IoClose, IoTrashOutline, IoPencil } from 'react-icons/io5';

const AdminHomeTab = ({ formMessage, setFormMessage }) => {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing state
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [fullname, setFullname] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Status flags
  const [uploading, setUploading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAthletes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/home-athletes');
      if (response.data && response.data.success) {
        setAthletes(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching home athletes:', err);
      setError('No se pudieron cargar los atletas del carrusel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  const resetForm = () => {
    setEditingItem(null);
    setFullname('');
    setPhotoUrl('');
  };

  const startEditAthlete = (item) => {
    setEditingItem(item);
    setFullname(item.fullname || '');
    setPhotoUrl(item.url || '');
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

      const res = await api.post('/trainings/upload', { image: base64String });
      if (res.data && res.data.url) {
        setPhotoUrl(res.data.url);
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      alert('Error al subir la imagen. Verifica las credenciales en el servidor o el tamaño de la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullname || !photoUrl) {
      alert('Por favor, completa el nombre del atleta y sube su fotografía.');
      return;
    }

    setSubmitLoading(true);
    if (setFormMessage) setFormMessage('');

    try {
      let response;
      const payload = {
        fullname,
        url: photoUrl
      };

      if (editingItem) {
        response = await api.put(`/home-athletes/${editingItem._id}`, payload);
      } else {
        response = await api.post('/home-athletes', payload);
      }

      if (response.data && response.data.success) {
        if (setFormMessage) {
          setFormMessage(
            editingItem
              ? '¡Atleta actualizado con éxito!'
              : '¡Atleta agregado al carrusel con éxito!'
          );
        }
        resetForm();
        fetchAthletes();
      }
    } catch (err) {
      console.error('Error saving athlete:', err);
      const msg = err.response?.data?.message || 'Error al guardar el atleta.';
      if (setFormMessage) setFormMessage(`Error: ${msg}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const moveAthleteOrder = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= athletes.length) return;

    const newAthletes = [...athletes];
    const temp = newAthletes[index];
    newAthletes[index] = newAthletes[newIndex];
    newAthletes[newIndex] = temp;

    setAthletes(newAthletes);

    const orderedIds = newAthletes.map((a) => a._id);
    try {
      await api.put('/home-athletes/reorder', { orderedIds });
    } catch (err) {
      console.error('Error saving order:', err);
      alert('No se pudo guardar el nuevo orden.');
      fetchAthletes();
    }
  };

  const handleDeleteAthlete = async (id) => {
    if (!await window.confirm('¿Estás seguro de que deseas eliminar a este atleta del carrusel de Home?')) {
      return;
    }

    try {
      const response = await api.delete(`/home-athletes/${id}`);
      if (response.data && response.data.success) {
        if (setFormMessage) setFormMessage('Atleta eliminado del carrusel con éxito.');
        fetchAthletes();
      }
    } catch (err) {
      console.error('Error deleting athlete:', err);
      alert('Hubo un error al eliminar el atleta.');
    }
  };

  return (
    <div>
      <div className="admin-panel-card">
        <h3 style={{
          fontSize: '22px',
          fontWeight: '900',
          color: '#0f172a',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '20px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '10px'
        }}>
          {editingItem ? 'Editar Atleta del Carrusel' : 'Agregar Atleta al Carrusel Home'}
        </h3>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
          Sube la fotografía y el nombre de los deportistas que aparecerán en el carrusel principal del fondo en la página de Inicio (Home).
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre del Atleta *</label>
            <input
              type="text"
              className="premium-input"
              placeholder="Ej: Mica Merino, Tomi Biondo..."
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Fotografía del Atleta *</label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handlePhotoUpload}
              disabled={uploading}
              style={{ display: 'block', margin: '8px 0' }}
            />
            {uploading && <p style={{ fontSize: '14px', color: '#1f75f5ff', fontWeight: 'bold' }}>Subiendo imagen...</p>}

            {photoUrl && (
              <div style={{ position: 'relative', width: '160px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', marginTop: '14px' }}>
                <img
                  src={photoUrl}
                  alt="Vista previa"
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}
                >
                  <IoClose size={14} />
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={uploading || submitLoading}
            >
              {submitLoading ? 'Guardando...' : (editingItem ? 'Actualizar Atleta' : 'Agregar Atleta al Carrusel')}
            </button>
            {editingItem && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-danger"
              >
                <IoClose style={{ marginRight: '6px', fontSize: '16px' }} /> Cancelar Edición
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-panel-card">
        <h3 style={{
          fontSize: '22px',
          fontWeight: '900',
          color: '#0f172a',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '20px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '10px'
        }}>
          Atletas en el Carrusel Home ({athletes.length})
        </h3>

        {loading ? (
          <p style={{ color: '#64748b' }}>Cargando atletas...</p>
        ) : athletes.length === 0 ? (
          <p style={{ color: '#64748b' }}>
            No hay atletas agregados al carrusel de Home todavía. Sube el primero usando el formulario de arriba.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {athletes.map((a, index) => (
              <div key={a._id} style={{
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                padding: '16px 20px',
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img
                    src={a.url}
                    alt={a.fullname}
                    style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                  />
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                      {a.fullname}
                    </h4>
                    <span style={{ fontSize: '12px', color: '#64748b', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                      Posición #{index + 1}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {/* Order Up/Down Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', backgroundColor: '#e2e8f0', borderRadius: '8px', padding: '2px' }}>
                    <button
                      type="button"
                      onClick={() => moveAthleteOrder(index, -1)}
                      disabled={index === 0}
                      title="Mover hacia arriba"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                        padding: '2px 4px'
                      }}
                    >
                      <IoChevronUp size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveAthleteOrder(index, 1)}
                      disabled={index === athletes.length - 1}
                      title="Mover hacia abajo"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: index === athletes.length - 1 ? 'not-allowed' : 'pointer',
                        padding: '2px 4px'
                      }}
                    >
                      <IoChevronDown size={18} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEditAthlete(a)}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center' }}
                  >
                    <IoPencil style={{ marginRight: '6px', fontSize: '14px' }} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAthlete(a._id)}
                    className="btn-danger"
                    style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center' }}
                  >
                    <IoTrashOutline style={{ marginRight: '6px', fontSize: '14px' }} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHomeTab;
