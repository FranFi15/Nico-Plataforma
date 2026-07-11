import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { IoChevronDown, IoChevronUp, IoClose, IoTrashOutline, IoPencil } from 'react-icons/io5';

const AdminTrainingsTab = ({ formMessage, setFormMessage }) => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing state
  const [editingItem, setEditingItem] = useState(null);

  // Form states - Trainings
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [youtubeShortLink, setYoutubeShortLink] = useState('');
  const [googleFormLink, setGoogleFormLink] = useState('');
  const [athletePhotos, setAthletePhotos] = useState([]);

  // Status flags
  const [uploading, setUploading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/trainings');
      if (response.data && response.data.success) {
        setTrainings(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching trainings:', err);
      setError('No se pudieron cargar los programas de entrenamiento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const resetTrainingForm = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setSubDescription('');
    setYoutubeShortLink('');
    setGoogleFormLink('');
    setAthletePhotos([]);
  };

  const startEditTraining = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setSubDescription(item.subDescription || '');
    setYoutubeShortLink(item.youtubeShortLink || '');
    setGoogleFormLink(item.googleFormLink || '');
    const normalizedPhotos = (item.athletePhotos || []).map((p) => {
      if (typeof p === 'string') {
        return { url: p, fullname: '' };
      }
      return { url: p.url || '', fullname: p.fullname || '' };
    });
    setAthletePhotos(normalizedPhotos);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const base64String = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });

        const res = await api.post('/trainings/upload', { image: base64String });
        if (res.data && res.data.url) {
          uploadedUrls.push(res.data.url);
        }
      }
      const uploadedObjects = uploadedUrls.map((url) => ({ url, fullname: '' }));
      setAthletePhotos((prev) => [...prev, ...uploadedObjects]);
    } catch (err) {
      console.error('Error uploading photos:', err);
      alert('Error al subir las imágenes. Verifica las credenciales en el servidor.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (indexToRemove) => {
    setAthletePhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleTrainingSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !googleFormLink) {
      alert('Por favor, completa todos los campos requeridos (Título, Descripción y Formulario).');
      return;
    }

    setSubmitLoading(true);
    if (setFormMessage) setFormMessage('');

    try {
      let response;
      const payload = {
        title,
        description,
        subDescription,
        youtubeShortLink,
        googleFormLink,
        athletePhotos
      };

      if (editingItem) {
        response = await api.put(`/trainings/${editingItem._id}`, payload);
      } else {
        response = await api.post('/trainings', payload);
      }

      if (response.data && response.data.success) {
        if (setFormMessage) {
          setFormMessage(
            editingItem
              ? '¡Programa de entrenamiento actualizado con éxito!'
              : '¡Programa de entrenamiento creado con éxito!'
          );
        }
        resetTrainingForm();
        fetchTrainings();
      }
    } catch (err) {
      console.error('Error saving training:', err);
      const msg = err.response?.data?.message || 'Error al guardar el programa de entrenamiento.';
      if (setFormMessage) setFormMessage(`Error: ${msg}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const moveTrainingOrder = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= trainings.length) return;

    const newTrainings = [...trainings];
    const temp = newTrainings[index];
    newTrainings[index] = newTrainings[newIndex];
    newTrainings[newIndex] = temp;

    setTrainings(newTrainings);

    const orderedIds = newTrainings.map((t) => t._id);
    try {
      await api.put('/trainings/reorder', { orderedIds });
    } catch (err) {
      console.error('Error saving order:', err);
      alert('No se pudo guardar el nuevo orden.');
      fetchTrainings();
    }
  };

  const handleDeleteTraining = async (id) => {
    if (!await window.confirm('¿Estás seguro de que deseas eliminar este programa de entrenamiento?')) {
      return;
    }

    try {
      const response = await api.delete(`/trainings/${id}`);
      if (response.data && response.data.success) {
        setTrainings((prev) => prev.filter((t) => t._id !== id));
        if (editingItem && editingItem._id === id) {
          resetTrainingForm();
        }
      }
    } catch (err) {
      console.error('Error deleting training:', err);
      alert('No se pudo eliminar el programa.');
    }
  };

  return (
    <div>
      {/* FORM SECTION: TRAINING PROGRAMS */}
      <div className="admin-panel-card">
        <h2 style={{
          fontSize: '22px',
          fontWeight: '900',
          color: '#2B2D2F',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '24px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '12px'
        }}>
          {editingItem ? 'Editar Programa de Entrenamiento' : 'Crear Nuevo Programa de Entrenamiento'}
        </h2>

        <form onSubmit={handleTrainingSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>

            {/* 1. Título */}
            <div className="form-group">
              <label className="form-label">Título del Programa *</label>
              <input
                type="text"
                className="premium-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Plan de Fuerza Pura y Acondicionamiento (12 Semanas)"
                required
              />
            </div>

            {/* 2. Descripción */}
            <div className="form-group">
              <label className="form-label">Descripción Principal *</label>
              <textarea
                className="premium-input"
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el objetivo, la metodología y las semanas de este plan de entrenamiento..."
                required
              />
            </div>

            {/* 3. Sub-Descripción */}
            <div className="form-group">
              <label className="form-label">Sub-Descripción (Opcional)</label>
              <input
                type="text"
                className="premium-input"
                value={subDescription}
                onChange={(e) => setSubDescription(e.target.value)}
                placeholder="Ej. Nivel Avanzado • Frecuencia 4x Semana • Incluye guía de movilidad"
              />
            </div>

            {/* 4. YouTube Short Link */}
            <div className="form-group">
              <label className="form-label">Link a YouTube Short de Presentación</label>
              <input
                type="url"
                className="premium-input"
                value={youtubeShortLink}
                onChange={(e) => setYoutubeShortLink(e.target.value)}
                placeholder="https://youtube.com/shorts/..."
              />
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                Si se agrega un video vertical o short, reemplazará al carrusel de imágenes estáticas por un reproductor tipo TikTok.
              </p>
            </div>

            {/* 5. Google Form Link */}
            <div className="form-group">
              <label className="form-label">Link de Formulario de Google (Evaluación Inicial) *</label>
              <input
                type="url"
                className="premium-input"
                value={googleFormLink}
                onChange={(e) => setGoogleFormLink(e.target.value)}
                placeholder="https://docs.google.com/forms/..."
                required
              />
            </div>

            {/* 6. Fotos de Atletas */}
            <div className="form-group">
              <label className="form-label">Imágenes de Atletas (Carrusel Horizontal)</label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                multiple
                onChange={handlePhotoUpload}
                disabled={uploading}
                style={{ display: 'block', margin: '8px 0' }}
              />
              {uploading && <p style={{ fontSize: '14px', color: '#1f75f5ff', fontWeight: 'bold' }}>Subiendo imágenes...</p>}

              {athletePhotos.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px', marginTop: '16px' }}>
                  {athletePhotos.map((photoObj, index) => (
                    <div key={index} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                      <img
                        src={photoObj.url}
                        alt={`Atleta ${index + 1}`}
                        style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
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
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={uploading}
            >
              {editingItem ? 'Actualizar Programa' : 'Crear Programa'}
            </button>
            {editingItem && (
              <button
                type="button"
                onClick={resetTrainingForm}
                className="btn-danger"
              >
                <IoClose style={{ marginRight: '6px', fontSize: '16px' }} /> Cancelar Edición
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ========================================================
          LIST SECTION: TRAINING PROGRAMS
          ======================================================== */}
      <div className="admin-panel-card" style={{ marginTop: '30px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '900',
          color: '#2B2D2F',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '20px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '10px'
        }}>
          Programas Existentes ({trainings.length})
        </h3>

        {loading ? (
          <p style={{ color: '#64748b' }}>Cargando programas de entrenamiento...</p>
        ) : trainings.length === 0 ? (
          <p style={{ color: '#64748b' }}>
            No hay programas de entrenamiento creados en esta sección todavía.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {trainings.map((t, index) => (
              <div key={t._id} style={{
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                padding: '20px',
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                transition: 'all 0.2s ease'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                    {t.title}
                  </h4>
                  <p style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px', maxWidth: '800px', lineHeight: '1.5' }}>
                    {t.description}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    {t.athletePhotos.length} Fotos subidas • Link de Formulario: <a href={t.googleFormLink} target="_blank" rel="noreferrer" style={{ color: '#2B2D2F', fontWeight: 'bold' }}>Ver enlace</a>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {/* Order Up/Down Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', backgroundColor: '#e2e8f0', borderRadius: '8px', padding: '2px' }}>
                    <button
                      onClick={() => moveTrainingOrder(index, -1)}
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
                      onClick={() => moveTrainingOrder(index, 1)}
                      disabled={index === trainings.length - 1}
                      title="Mover hacia abajo"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: index === trainings.length - 1 ? 'not-allowed' : 'pointer',
                        padding: '2px 4px'
                      }}
                    >
                      <IoChevronDown size={18} />
                    </button>
                  </div>
                  <button
                    onClick={() => startEditTraining(t)}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center' }}
                  >
                    <IoPencil style={{ marginRight: '6px', fontSize: '14px' }} /> Editar
                  </button>
                  <button
                    onClick={() => handleDeleteTraining(t._id)}
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

export default AdminTrainingsTab;
