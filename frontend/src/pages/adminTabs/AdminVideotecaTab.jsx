import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { IoFolderOutline, IoFolderOpen, IoClose, IoTrashOutline, IoPencil, IoPlayOutline, IoAdd } from 'react-icons/io5';

const AdminVideotecaTab = ({ formMessage, setFormMessage }) => {
  const [contents, setContents] = useState([]);
  const [videoFolders, setVideoFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing & Form state
  const [editingItem, setEditingItem] = useState(null);
  const [showContentForm, setShowContentForm] = useState(false);

  // Form fields
  const [cTitle, setCTitle] = useState('');
  const [cDescription, setCDescription] = useState('');
  const [cAccessType, setCAccessType] = useState('free');
  const [cPriceUsd, setCPriceUsd] = useState(0);
  const [cPriceArs, setCPriceArs] = useState(0);
  const [cVideoFolder, setCVideoFolder] = useState('');
  const [cVideoLink, setCVideoLink] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Folder Management states
  const [showVideoFolderManager, setShowVideoFolderManager] = useState(false);
  const [showQuickVideoFolder, setShowQuickVideoFolder] = useState(false);
  const [newVideoFolderName, setNewVideoFolderName] = useState('');
  const [editingVideoFolder, setEditingVideoFolder] = useState(null);
  const [editVideoFolderName, setEditVideoFolderName] = useState('');
  const [newVideoFolderCoverImage, setNewVideoFolderCoverImage] = useState('');
  const [editVideoFolderCoverImage, setEditVideoFolderCoverImage] = useState('');
  const [folderUploading, setFolderUploading] = useState(false);

  // Filtering states
  const [adminVideoSearchText, setAdminVideoSearchText] = useState('');
  const [adminVideoFolder, setAdminVideoFolder] = useState('all');
  const [adminVideoAccess, setAdminVideoAccess] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [videosRes, foldersRes] = await Promise.all([
        api.get('/content?type=videoteca'),
        api.get('/videoteca-folders')
      ]);
      if (videosRes.data && videosRes.data.success) {
        setContents(videosRes.data.data);
      }
      if (foldersRes.data && foldersRes.data.success) {
        setVideoFolders(foldersRes.data.data);
      }
    } catch (err) {
      console.error('Error loading videoteca data:', err);
      setError('No se pudieron cargar los videos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetContentForm = () => {
    setEditingItem(null);
    setCTitle('');
    setCDescription('');
    setCAccessType('free');
    setCPriceUsd(0);
    setCPriceArs(0);
    setCVideoFolder('');
    setCVideoLink('');
    setShowContentForm(false);
  };

  const startEditContent = (item) => {
    setEditingItem(item);
    setCTitle(item.title);
    setCDescription(item.description);
    setCAccessType(item.accessType || 'free');
    setCPriceUsd(item.priceUsd !== undefined ? item.priceUsd : (item.price || 0));
    setCPriceArs(item.priceArs !== undefined ? item.priceArs : 0);
    setCVideoFolder(item.videoFolder?._id || item.videoFolder || '');
    setCVideoLink(item.videoLink || '');
    setShowContentForm(true);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleCreateVideoFolder = async () => {
    if (!newVideoFolderName.trim()) return;
    try {
      const res = await api.post('/video-folders', {
        name: newVideoFolderName.trim(),
        coverImage: newVideoFolderCoverImage
      });
      if (res.data && res.data.success) {
        setNewVideoFolderName('');
        setNewVideoFolderCoverImage('');
        const foldersRes = await api.get('/video-folders');
        if (foldersRes.data?.success) setVideoFolders(foldersRes.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear la carpeta.');
    }
  };

  const handleUpdateVideoFolder = async (id) => {
    if (!editVideoFolderName.trim()) return;
    try {
      const res = await api.put(`/video-folders/${id}`, {
        name: editVideoFolderName.trim(),
        coverImage: editVideoFolderCoverImage
      });
      if (res.data && res.data.success) {
        setEditingVideoFolder(null);
        setEditVideoFolderName('');
        setEditVideoFolderCoverImage('');
        const foldersRes = await api.get('/video-folders');
        if (foldersRes.data?.success) setVideoFolders(foldersRes.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar la carpeta.');
    }
  };

  const handleDeleteVideoFolder = async (id) => {
    if (!await window.confirm('¿Estás seguro de que deseas eliminar esta carpeta?')) return;
    try {
      const res = await api.delete(`/video-folders/${id}`);
      if (res.data && res.data.success) {
        const foldersRes = await api.get('/video-folders');
        if (foldersRes.data?.success) setVideoFolders(foldersRes.data.data);
        if (cVideoFolder === id) setCVideoFolder('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar la carpeta.');
    }
  };

  const handleFolderImageUpload = async (e, isEditing) => {
    const file = e.target.files[0];
    if (!file) return;

    setFolderUploading(true);
    try {
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

      const res = await api.post('/trainings/upload', { image: base64String });
      if (res.data && res.data.url) {
        if (isEditing) {
          setEditVideoFolderCoverImage(res.data.url);
        } else {
          setNewVideoFolderCoverImage(res.data.url);
        }
      }
    } catch (err) {
      console.error('Error uploading folder image:', err);
      alert('Error al subir la imagen.');
    } finally {
      setFolderUploading(false);
    }
  };

  const handleContentSubmit = async (e) => {
    e.preventDefault();
    if (!cTitle || !cDescription) {
      alert('Por favor, completa todos los campos requeridos (Título y Descripción).');
      return;
    }

    setSubmitLoading(true);
    if (setFormMessage) setFormMessage('');

    try {
      let response;
      const payload = {
        title: cTitle,
        description: cDescription,
        contentType: 'videoteca',
        accessType: cAccessType,
        priceUsd: cAccessType === 'one-time-purchase' ? Number(cPriceUsd) : 0,
        priceArs: cAccessType === 'one-time-purchase' ? Number(cPriceArs) : 0,
        price: cAccessType === 'one-time-purchase' ? Number(cPriceUsd) : 0,
        videoFolder: cVideoFolder || undefined,
        videoLink: cVideoLink,
        body: cDescription
      };

      if (editingItem) {
        response = await api.put(`/content/${editingItem._id}`, payload);
      } else {
        response = await api.post('/content', payload);
      }

      if (response.data && response.data.success) {
        if (setFormMessage) {
          setFormMessage(
            editingItem
              ? '¡Video actualizado con éxito!'
              : '¡Video creado y agregado con éxito!'
          );
        }
        resetContentForm();
        fetchData();
      }
    } catch (err) {
      console.error('Error saving videoteca item:', err);
      const msg = err.response?.data?.message || 'Error al guardar el video.';
      if (setFormMessage) setFormMessage(`Error: ${msg}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteContent = async (id) => {
    if (!await window.confirm('¿Estás seguro de que deseas eliminar este video?')) return;
    try {
      const response = await api.delete(`/content/${id}`);
      if (response.data && response.data.success) {
        setContents((prev) => prev.filter((c) => c._id !== id));
        if (editingItem && editingItem._id === id) {
          resetContentForm();
        }
      }
    } catch (err) {
      console.error('Error deleting video:', err);
      alert('No se pudo eliminar el video.');
    }
  };

  const filteredContents = contents.filter((item) => {
    if (adminVideoSearchText) {
      const searchLower = adminVideoSearchText.toLowerCase();
      const titleMatch = item.title?.toLowerCase().includes(searchLower);
      const descMatch = item.description?.toLowerCase().includes(searchLower);
      if (!titleMatch && !descMatch) return false;
    }
    if (adminVideoFolder !== 'all') {
      const folderId = item.videoFolder?._id || item.videoFolder;
      if (folderId !== adminVideoFolder) return false;
    }
    if (adminVideoAccess !== 'all' && item.accessType !== adminVideoAccess) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <div className="admin-panel-card">
        {/* Header and Toggle Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '900',
            color: '#2B2D2F',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            margin: 0
          }}>
            {editingItem ? 'Editar Video' : showContentForm ? 'Subir Nuevo Video a la Videoteca' : 'Gestión de Videoteca & Transmisiones'}
          </h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowVideoFolderManager(!showVideoFolderManager)}
              className="btn-translucent"
              style={{ padding: '8px 16px', fontSize: '13px', border: '1px solid #1f75f5ff', color: '#1f75f5ff', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {showVideoFolderManager ? <><IoClose size={16} /> Ocultar Carpetas</> : <><IoFolderOpen size={16} /> Administrar Carpetas</>}
            </button>
            {!showContentForm && !editingItem && (
              <button
                type="button"
                onClick={() => setShowContentForm(true)}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <IoAdd size={18} /> Subir Video
              </button>
            )}
          </div>
        </div>

        {/* Video Folder Manager Section */}
        {showVideoFolderManager && (
          <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#051020', marginBottom: '16px' }}>
              Carpetas de la Videoteca
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
              <div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (editingVideoFolder) {
                    handleUpdateVideoFolder(editingVideoFolder._id);
                  } else {
                    handleCreateVideoFolder();
                  }
                }}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">
                      {editingVideoFolder ? 'Editar Carpeta' : 'Nueva Carpeta'}
                    </label>
                    <input
                      type="text"
                      className="premium-input"
                      value={editingVideoFolder ? editVideoFolderName : newVideoFolderName}
                      onChange={(e) => editingVideoFolder ? setEditVideoFolderName(e.target.value) : setNewVideoFolderName(e.target.value)}
                      placeholder="Ej. Biomecánica Avanzada"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Imagen de Portada (Carpeta)</label>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={(e) => handleFolderImageUpload(e, !!editingVideoFolder)}
                      style={{ display: 'block', margin: '8px 0' }}
                    />
                    {folderUploading && <p style={{ fontSize: '12px', color: '#051020', fontWeight: 'bold' }}>Subiendo portada...</p>}
                    {(editingVideoFolder ? editVideoFolderCoverImage : newVideoFolderCoverImage) && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}>
                          <img
                            src={editingVideoFolder ? editVideoFolderCoverImage : newVideoFolderCoverImage}
                            alt="Preview carpeta"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => editingVideoFolder ? setEditVideoFolderCoverImage('') : setNewVideoFolderCoverImage('')}
                          style={{
                            marginTop: '8px',
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Quitar Portada
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className="btn-primary" disabled={folderUploading} style={{ flex: 1, fontSize: '13px' }}>
                      {editingVideoFolder ? 'Guardar Cambios' : 'Crear Carpeta'}
                    </button>
                    {editingVideoFolder && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVideoFolder(null);
                          setEditVideoFolderName('');
                          setEditVideoFolderCoverImage('');
                        }}
                        className="btn-secondary"
                        style={{ fontSize: '13px' }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: '12px' }}>Carpetas Existentes ({videoFolders.length})</label>
                {videoFolders.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No has creado carpetas en la videoteca aún.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
                    {videoFolders.map((folder) => (
                      <div
                        key={folder._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {folder.coverImage ? (
                            <img
                              src={folder.coverImage}
                              alt={folder.name}
                              style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <IoFolderOutline size={22} color="#1f75f5ff" />
                            </div>
                          )}
                          <div>
                            <span style={{ fontWeight: '700', color: '#0f172a', display: 'block', fontSize: '14px' }}>
                              {folder.name}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingVideoFolder(folder);
                              setEditVideoFolderName(folder.name);
                              setEditVideoFolderCoverImage(folder.coverImage || '');
                            }}
                            style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <IoPencil size={14} /> Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVideoFolder(folder._id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <IoTrashOutline size={15} /> Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form section */}
        {showContentForm && (
          <form onSubmit={handleContentSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              <div>
                <div className="form-group">
                  <label className="form-label">Título del Video *</label>
                  <input
                    type="text"
                    value={cTitle}
                    onChange={(e) => setCTitle(e.target.value)}
                    placeholder="Ej. Análisis Biomecánico de Sentadilla"
                    required
                    className="premium-input"
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Carpeta de Video</label>
                    <button
                      type="button"
                      onClick={() => setShowQuickVideoFolder(!showQuickVideoFolder)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#1f75f5ff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {showQuickVideoFolder ? <><IoClose size={14} /> Cerrar</> : <><IoAdd size={14} /> Nueva Carpeta</>}
                    </button>
                  </div>

                  {showQuickVideoFolder && (
                    <div style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          className="premium-input"
                          placeholder="Ej. Biomecánica Básica"
                          value={newVideoFolderName}
                          onChange={(e) => setNewVideoFolderName(e.target.value)}
                          style={{ height: '36px', fontSize: '13px', padding: '8px 12px' }}
                        />
                        <button
                          type="button"
                          onClick={handleCreateVideoFolder}
                          className="btn-primary"
                          style={{ padding: '0 12px', height: '36px', fontSize: '11px', textTransform: 'none' }}
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  )}

                  <select
                    className="premium-input"
                    value={cVideoFolder}
                    onChange={(e) => setCVideoFolder(e.target.value)}
                    style={{ backgroundColor: '#ffffff', color: '#051020', cursor: 'pointer' }}
                    required
                  >
                    <option value="">Selecciona una Carpeta</option>
                    {videoFolders.map((folder) => (
                      <option key={folder._id} value={folder._id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Acceso *</label>
                  <select
                    className="premium-input"
                    value={cAccessType}
                    onChange={(e) => setCAccessType(e.target.value)}
                    style={{ backgroundColor: '#ffffff', color: '#051020', cursor: 'pointer' }}
                  >
                    <option value="free">Acceso Libre</option>
                    <option value="subscription">Membresía Premium (Suscritos)</option>
                    <option value="one-time-purchase">Pago Único (Compra Directa)</option>
                  </select>
                </div>

                {cAccessType === 'one-time-purchase' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Precio en USD</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="premium-input"
                        value={cPriceUsd}
                        onChange={(e) => setCPriceUsd(e.target.value)}
                        placeholder="Ej. 14.99"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Precio en ARS</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="premium-input"
                        value={cPriceArs}
                        onChange={(e) => setCPriceArs(e.target.value)}
                        placeholder="Ej. 18000"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="form-group">
                  <label className="form-label">Enlace o ID de Video (YouTube / Vimeo / Google Drive / MP4) *</label>
                  <input
                    type="url"
                    className="premium-input"
                    value={cVideoLink}
                    onChange={(e) => setCVideoLink(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción / Resumen del Video *</label>
                  <textarea
                    className="premium-input"
                    rows="6"
                    value={cDescription}
                    onChange={(e) => setCDescription(e.target.value)}
                    placeholder="Escribe un resumen o puntos clave explicados en esta sesión..."
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitLoading}
                style={{ flex: '1 1 auto', minWidth: '200px' }}
              >
                {submitLoading ? 'Guardando...' : editingItem ? 'Actualizar Video' : 'Subir Video'}
              </button>
              <button
                type="button"
                onClick={resetContentForm}
                className="btn-danger"
                style={{ flex: '0 1 auto', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <IoClose size={16} /> Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Filter bar for Videoteca */}
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginTop: '30px',
          marginBottom: '24px',
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ flex: '2 1 200px' }}>
            <input
              type="text"
              placeholder="Buscar video por título o descripción..."
              value={adminVideoSearchText}
              onChange={(e) => setAdminVideoSearchText(e.target.value)}
              className="premium-input"
              style={{ height: '40px', fontSize: '13px', padding: '8px 12px' }}
            />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <select
              value={adminVideoFolder}
              onChange={(e) => setAdminVideoFolder(e.target.value)}
              className="premium-input"
              style={{ height: '40px', fontSize: '13px', backgroundColor: '#ffffff', cursor: 'pointer', padding: '8px 12px' }}
            >
              <option value="all">Todas las carpetas</option>
              {videoFolders.map((folder) => (
                <option key={folder._id} value={folder._id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <select
              value={adminVideoAccess}
              onChange={(e) => setAdminVideoAccess(e.target.value)}
              className="premium-input"
              style={{ height: '40px', fontSize: '13px', backgroundColor: '#ffffff', cursor: 'pointer', padding: '8px 12px' }}
            >
              <option value="all">Todos los accesos</option>
              <option value="free">Acceso Libre</option>
              <option value="subscription">Membresía Premium</option>
              <option value="one-time-purchase">Pago Único</option>
            </select>
          </div>
        </div>

        {/* LIST SECTION: VIDEOTECA */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
            Cargando videos de la videoteca...
          </div>
        ) : error ? (
          <div style={{ color: '#ef4444', fontWeight: 'bold', textAlign: 'center', padding: '20px' }}>
            {error}
          </div>
        ) : filteredContents.length === 0 ? (
          <div style={{ padding: '40px', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', backgroundColor: '#ffffff' }}>
            No se encontraron videos que coincidan con los criterios de búsqueda.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredContents.map((c) => (
              <div
                key={c._id}
                className="premium-card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '24px',
                  borderRadius: '20px',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0', color: '#2B2D2F' }}>{c.title}</h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    Acceso: <strong style={{ textTransform: 'uppercase' }}>{c.accessType === 'free' ? 'Acceso Libre' : c.accessType === 'subscription' ? 'Membresía' : `Pago Único (USD $${c.priceUsd !== undefined ? c.priceUsd : (c.price || 0)} / ARS $${(c.priceArs || 0).toLocaleString()})`}</strong>
                    {c.videoFolder && ` • Carpeta: ${c.videoFolder?.name || 'Sin asignar'}`}
                    {c.videoLink && (
                      <> • <a href={c.videoLink} target="_blank" rel="noreferrer" style={{ color: '#1f75f5ff', fontWeight: 'bold' }}>Ver Video</a></>
                    )}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => startEditContent(c)}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <IoPencil size={14} /> Editar
                  </button>
                  <button
                    onClick={() => handleDeleteContent(c._id)}
                    className="btn-danger"
                    style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <IoTrashOutline size={15} /> Eliminar
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

export default AdminVideotecaTab;
