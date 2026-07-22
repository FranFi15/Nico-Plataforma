import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import TiptapEditor from '../../components/TiptapEditor';
import { IoClose, IoFolderOutline, IoFolderOpen, IoPencil, IoTrashOutline, IoAdd, IoEyeOutline, IoEyeOffOutline, IoCheckmarkCircleOutline, IoDocumentTextOutline, IoCloudUploadOutline, IoDocumentAttachOutline, IoDownloadOutline } from 'react-icons/io5';

const AdminBlogsTab = ({ formMessage, setFormMessage }) => {
  const [contents, setContents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing state
  const [editingItem, setEditingItem] = useState(null);
  const [showContentForm, setShowContentForm] = useState(false);

  // Form states - Blog
  const [cTitle, setCTitle] = useState('');
  const [cDescription, setCDescription] = useState('');
  const [cAccessType, setCAccessType] = useState('free');
  const [cPriceUsd, setCPriceUsd] = useState(0);
  const [cPriceArs, setCPriceArs] = useState(0);
  const [cMemberDiscountPercentage, setCMemberDiscountPercentage] = useState(0);
  const [cCardImage, setCCardImage] = useState('');
  const [cCardImagePosition, setCCardImagePosition] = useState('50%');
  const [cPublishDate, setCPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [cCategories, setCCategories] = useState([]);
  const [cBody, setCBody] = useState('');
  const [cIsPublished, setCIsPublished] = useState(true);
  const [cAttachments, setCAttachments] = useState([]);
  const [cardImageUploading, setCardImageUploading] = useState(false);
  const [attachmentUploading, setAttachmentUploading] = useState(false);
  const [showHtmlCode, setShowHtmlCode] = useState(false);
  const [cNotifyUsers, setCNotifyUsers] = useState('none');
  const editorRef = useRef(null);

  // Category Management states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showQuickCategory, setShowQuickCategory] = useState(false);

  // Filtering states
  const [adminBlogSearchText, setAdminBlogSearchText] = useState('');
  const [adminBlogCategory, setAdminBlogCategory] = useState('all');
  const [adminBlogAccess, setAdminBlogAccess] = useState('all');

  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [blogsRes, catsRes] = await Promise.all([
        api.get('/content?type=blog'),
        api.get('/categories?type=blog')
      ]);
      if (blogsRes.data && blogsRes.data.success) {
        setContents(blogsRes.data.data);
      }
      if (catsRes.data && catsRes.data.success) {
        setCategories(catsRes.data.data);
      }
    } catch (err) {
      console.error('Error loading blogs tab data:', err);
      setError('No se pudieron cargar los artículos.');
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
    setCMemberDiscountPercentage(0);
    setCCardImage('');
    setCCardImagePosition('50%');
    setCPublishDate(new Date().toISOString().split('T')[0]);
    setCCategories([]);
    setCBody('');
    setCIsPublished(true);
    setCAttachments([]);
    setCNotifyUsers('none');
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    setShowContentForm(false);
  };

  const startEditContent = (item) => {
    setEditingItem(item);
    setCTitle(item.title);
    setCDescription(item.description);
    setCAccessType(item.accessType || 'free');
    setCPriceUsd(item.priceUsd !== undefined ? item.priceUsd : (item.price || 0));
    setCPriceArs(item.priceArs !== undefined ? item.priceArs : 0);
    setCMemberDiscountPercentage(item.memberDiscountPercentage || 0);
    setCCardImage(item.cardImage || '');
    setCCardImagePosition(item.cardImagePosition || '50%');
    setCBody(item.body || '');
    setCIsPublished(item.isPublished !== undefined ? item.isPublished : (item.status !== 'draft'));
    setCAttachments(item.attachments || []);
    setCPublishDate(item.publishDate ? new Date(item.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setCCategories(item.categories?.map(c => c._id || c) || (item.category ? [item.category._id || item.category] : []));
    setCNotifyUsers('none'); // Reset to none when editing to avoid accidental re-sends
    setShowContentForm(true);
    if (editorRef.current) {
      editorRef.current.innerHTML = item.body || '';
    }
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleAttachmentFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAttachmentUploading(true);
    try {
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

      const res = await api.post('/content/upload-file', {
        file: base64String,
        filename: file.name,
        fileType: file.type
      });

      if (res.data && res.data.url) {
        const ext = (file.name.split('.').pop() || 'file').toLowerCase();
        setCAttachments((prev) => [
          ...prev,
          {
            title: file.name,
            url: res.data.url,
            fileType: ext
          }
        ]);
      }
    } catch (err) {
      console.error('Error uploading blog attachment:', err);
      alert('Error al subir el archivo/PDF al servidor.');
    } finally {
      setAttachmentUploading(false);
      e.target.value = '';
    }
  };

  const handleCardImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCardImageUploading(true);
    try {
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

      const res = await api.post('/trainings/upload', { image: base64String });
      if (res.data && res.data.url) {
        setCCardImage(res.data.url);
      }
    } catch (err) {
      console.error('Error uploading card image:', err);
      alert('Error al subir la imagen de portada.');
    } finally {
      setCardImageUploading(false);
    }
  };

  const insertTextAtCursor = (textToInsert) => {
    const textarea = document.getElementById('blog-body-textarea');
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = cBody;

    const newText = text.substring(0, startPos) + textToInsert + text.substring(endPos, text.length);
    setCBody(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = startPos + textToInsert.length;
      textarea.selectionEnd = startPos + textToInsert.length;
    }, 0);
  };

  const handleInsertYouTube = () => {
    const url = window.prompt('Introduce el enlace del video de YouTube (o Short):');
    if (!url) return;

    let videoId = '';
    if (url.includes('/shorts/')) {
      videoId = url.split('/shorts/')[1].split('?')[0].split('/')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0].split('/')[0];
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else {
      videoId = url;
    }

    if (videoId) {
      const embedHtml = `<div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:12px; margin:24px 0; border:2px solid #051020;"><iframe src="https://www.youtube.com/embed/${videoId}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      insertTextAtCursor(embedHtml);
    } else {
      alert('No se pudo identificar el ID del video de YouTube.');
    }
  };

  const handleEditorImageUpload = async (e) => {
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
        const imgHtml = `<img src="${res.data.url}" alt="Imagen del artículo" style="max-width:100%; border-radius:12px; margin:24px 0; border:2px solid #051020; display:block;" />`;
        insertTextAtCursor(imgHtml);
      }
    } catch (err) {
      console.error('Error uploading inline image:', err);
      alert('Error al subir la imagen.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Category Handlers
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const response = await api.post('/categories', { name: newCategoryName.trim(), type: 'blog' });
      if (response.data && response.data.success) {
        setNewCategoryName('');
        const catsRes = await api.get('/categories?type=blog');
        if (catsRes.data?.success) setCategories(catsRes.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al agregar categoría');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editCategoryName.trim() || !editingCategory) return;
    try {
      const response = await api.put(`/categories/${editingCategory._id}`, { name: editCategoryName.trim(), type: 'blog' });
      if (response.data && response.data.success) {
        setEditingCategory(null);
        setEditCategoryName('');
        const catsRes = await api.get('/categories?type=blog');
        if (catsRes.data?.success) setCategories(catsRes.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar categoría');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!await window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return;
    try {
      const response = await api.delete(`/categories/${id}`);
      if (response.data && response.data.success) {
        const catsRes = await api.get('/categories?type=blog');
        if (catsRes.data?.success) setCategories(catsRes.data.data);
        if (cCategories.includes(id)) setCCategories((prev) => prev.filter(c => c !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar categoría');
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
        contentType: 'blog',
        accessType: cAccessType,
        priceUsd: cAccessType === 'one-time-purchase' ? Number(cPriceUsd) : 0,
        priceArs: cAccessType === 'one-time-purchase' ? Number(cPriceArs) : 0,
        price: cAccessType === 'one-time-purchase' ? Number(cPriceUsd) : 0,
        memberDiscountPercentage: cAccessType === 'one-time-purchase' ? Number(cMemberDiscountPercentage) : 0,
        cardImage: cCardImage,
        cardImagePosition: cCardImagePosition,
        body: cBody,
        categories: cCategories,
        publishDate: cPublishDate,
        isPublished: cIsPublished,
        status: cIsPublished ? 'published' : 'draft',
        attachments: cAttachments,
        notifyUsers: cNotifyUsers
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
              ? '¡Artículo de blog actualizado con éxito!'
              : '¡Artículo de blog creado con éxito!'
          );
        }
        resetContentForm();
        fetchData();
      }
    } catch (err) {
      console.error('Error saving blog content:', err);
      const msg = err.response?.data?.message || 'Error al guardar el artículo.';
      if (setFormMessage) setFormMessage(`Error: ${msg}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteContent = async (id) => {
    if (!await window.confirm('¿Estás seguro de que deseas eliminar este artículo?')) return;
    try {
      const response = await api.delete(`/content/${id}`);
      if (response.data && response.data.success) {
        setContents((prev) => prev.filter((c) => c._id !== id));
        if (editingItem && editingItem._id === id) {
          resetContentForm();
        }
      }
    } catch (err) {
      console.error('Error deleting blog content:', err);
      alert('No se pudo eliminar el artículo.');
    }
  };

  const filteredContents = contents.filter((item) => {
    if (adminBlogSearchText) {
      const searchLower = adminBlogSearchText.toLowerCase();
      const titleMatch = item.title?.toLowerCase().includes(searchLower);
      const descMatch = item.description?.toLowerCase().includes(searchLower);
      if (!titleMatch && !descMatch) return false;
    }
    if (adminBlogCategory !== 'all') {
      const catId = item.category?._id || item.category;
      if (catId !== adminBlogCategory) return false;
    }
    if (adminBlogAccess !== 'all' && item.accessType !== adminBlogAccess) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <div className="admin-panel-card">
        {/* Header & Category Manager toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '900',
            color: '#2B2D2F',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            margin: 0
          }}>
            {editingItem ? 'Editar Artículo' : showContentForm ? 'Crear Nuevo Artículo' : 'Gestión de Blogs & Artículos'}
          </h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowCategoryManager(!showCategoryManager)}
              className="btn-translucent"
              style={{ padding: '8px 16px', fontSize: '13px', border: '1px solid #1f75f5ff', color: '#1f75f5ff', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {showCategoryManager ? <><IoClose size={16} /> Ocultar Categorías</> : <><IoFolderOpen size={16} /> Administrar Categorías</>}
            </button>
            {!showContentForm && !editingItem && (
              <button
                type="button"
                onClick={() => setShowContentForm(true)}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <IoAdd size={18} /> Nuevo Artículo
              </button>
            )}
          </div>
        </div>

        {/* Category Manager Section */}
        {showCategoryManager && (
          <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#051020', marginBottom: '16px' }}>
              Gestión de Categorías
            </h3>

            <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="premium-input"
                placeholder="Nombre de la categoría..."
                value={editingCategory ? editCategoryName : newCategoryName}
                onChange={(e) => editingCategory ? setEditCategoryName(e.target.value) : setNewCategoryName(e.target.value)}
                style={{ flex: '1 1 250px', backgroundColor: '#ffffff' }}
                required
              />
              <button type="submit" className="btn-primary" style={{ padding: '0 20px', fontSize: '13px' }}>
                {editingCategory ? 'Guardar Cambios' : 'Agregar Categoría'}
              </button>
              {editingCategory && (
                <button
                  type="button"
                  onClick={() => { setEditingCategory(null); setEditCategoryName(''); }}
                  className="btn-secondary"
                  style={{ padding: '0 20px', fontSize: '13px' }}
                >
                  Cancelar
                </button>
              )}
            </form>

            {categories.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No hay categorías creadas.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {categories.map((cat) => (
                  <div key={cat._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => { setEditingCategory(cat); setEditCategoryName(cat.name); }}
                      style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat._id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center' }}
                      title="Eliminar categoría"
                    >
                      <IoTrashOutline size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form section */}
        {showContentForm && (
          <form onSubmit={handleContentSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              <div>
                <div className="form-group">
                  <label className="form-label">Título *</label>
                  <input
                    type="text"
                    className="premium-input"
                    value={cTitle}
                    onChange={(e) => setCTitle(e.target.value)}
                    placeholder="Ej. Biomecánica en el Entrenamiento de Glúteos"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Acceso</label>
                  <select
                    className="premium-input"
                    value={cAccessType}
                    onChange={(e) => setCAccessType(e.target.value)}
                  >
                    <option value="free">Acceso Libre (Público)</option>
                    <option value="subscription">Membresía Premium (Suscritos)</option>
                    <option value="one-time-purchase">Pago Único (Compra Directa)</option>
                  </select>
                </div>

                {cAccessType === 'one-time-purchase' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', backgroundColor: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe', marginBottom: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Precio (USD) *</label>
                      <input
                        type="number"
                        className="premium-input"
                        placeholder="Ej. 15.00"
                        step="0.01"
                        min="0"
                        value={cPriceUsd}
                        onChange={(e) => setCPriceUsd(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Precio (ARS) *</label>
                      <input
                        type="number"
                        className="premium-input"
                        placeholder="Ej. 15000"
                        min="0"
                        value={cPriceArs}
                        onChange={(e) => setCPriceArs(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ color: '#1d4ed8' }}>Descuento Miembros (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        className="premium-input"
                        value={cMemberDiscountPercentage}
                        onChange={(e) => setCMemberDiscountPercentage(e.target.value)}
                        placeholder="Ej. 20 (20% OFF)"
                        style={{ border: '1.5px solid #3b82f6' }}
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Fecha de Publicación</label>
                  <input
                    type="date"
                    className="premium-input"
                    value={cPublishDate}
                    onChange={(e) => setCPublishDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Categoría</label>
                    <button
                      type="button"
                      onClick={() => setShowQuickCategory(!showQuickCategory)}
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
                      {showQuickCategory ? <><IoClose size={14} /> Cerrar</> : <><IoAdd size={14} /> Nueva Categoría</>}
                    </button>
                  </div>

                  {showQuickCategory && (
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
                          placeholder="Ej. Biomecánica"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          style={{ height: '36px', fontSize: '13px', padding: '8px 12px' }}
                        />
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          className="btn-primary"
                          style={{ padding: '0 12px', height: '36px', fontSize: '11px', textTransform: 'none' }}
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px 0' }}>
                    {categories.length === 0 ? (
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No hay categorías. Crea una arriba.</span>
                    ) : (
                      categories.map((cat) => {
                        const isSelected = cCategories.includes(cat._id);
                        return (
                          <div
                            key={cat._id}
                            onClick={() => {
                              if (isSelected) {
                                setCCategories(prev => prev.filter(id => id !== cat._id));
                              } else {
                                setCCategories(prev => [...prev, cat._id]);
                              }
                            }}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              border: isSelected ? '1px solid #2563eb' : '1px solid #cbd5e1',
                              backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                              color: isSelected ? '#1d4ed8' : '#475569',
                              transition: 'all 0.2s ease',
                              userSelect: 'none'
                            }}
                          >
                            {cat.name}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="form-group">
                  <label className="form-label">Descripción / Resumen *</label>
                  <textarea
                    className="premium-input"
                    rows="6"
                    style={{ resize: 'vertical', height: '140px' }}
                    value={cDescription}
                    onChange={(e) => setCDescription(e.target.value)}
                    placeholder="Escribe el resumen o introducción de este artículo..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Imagen de Portada (Card Image)</label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleCardImageUpload}
                    style={{ display: 'block', margin: '8px 0' }}
                  />
                  {cardImageUploading && <p style={{ fontSize: '12px', color: '#051020', fontWeight: 'bold' }}>Subiendo imagen de portada...</p>}
                  {cCardImage && (
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label className="form-label" style={{ margin: 0 }}>Vista Previa</label>
                        <button
                          type="button"
                          onClick={() => { setCCardImage(''); setCCardImagePosition('50%'); }}
                          style={{
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                          }}
                        >
                          Quitar Imagen
                        </button>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '200px',
                        borderRadius: '16px',
                        border: '1px solid #cbd5e1',
                        overflow: 'hidden',
                        position: 'relative',
                        backgroundColor: '#f1f5f9'
                      }}>
                        <img
                          src={cCardImage}
                          alt="Previsualización"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: `center ${cCardImagePosition}`
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b' }}>Posición Vertical:</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={parseInt(cCardImagePosition) || 50}
                          onChange={(e) => setCCardImagePosition(e.target.value + '%')}
                          style={{ flex: 1, cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '13px', fontWeight: '800', width: '40px', textAlign: 'right' }}>{cCardImagePosition}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ backgroundColor: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd', marginTop: '24px' }}>
                  <label className="form-label" style={{ color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Enviar Notificación por Email
                  </label>
                  <p style={{ fontSize: '12px', color: '#0284c7', margin: '0 0 12px 0' }}>¿Deseas avisarle a los usuarios sobre este blog?</p>
                  <select
                    className="premium-input"
                    value={cNotifyUsers}
                    onChange={(e) => setCNotifyUsers(e.target.value)}
                    style={{ borderColor: '#7dd3fc', backgroundColor: '#fff' }}
                  >
                    <option value="none">No enviar</option>
                    <option value="all">A todos</option>
                    <option value="premium">A miembros exclusivamente</option>
                    {editingItem && <option value="enrolled">A usuarios vinculados a este blog</option>}
                  </select>
                </div>
              </div>
            </div>

            {/* Switch de Estado: Borrador vs Publicado */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              backgroundColor: cIsPublished ? '#ecfdf5' : '#fffbeb',
              border: `1px solid ${cIsPublished ? '#6ee7b7' : '#fcd34d'}`,
              borderRadius: '16px',
              marginTop: '24px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {cIsPublished ? (
                  <IoEyeOutline size={22} color="#059669" />
                ) : (
                  <IoEyeOffOutline size={22} color="#d97706" />
                )}
                <div>
                  <strong style={{ fontSize: '15px', color: cIsPublished ? '#065f46' : '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {cIsPublished ? 'Estado: Publicado y Visible' : 'Estado: Borrador Oculto'}
                  </strong>
                  <span style={{ fontSize: '13px', color: cIsPublished ? '#047857' : '#b45309' }}>
                    {cIsPublished
                      ? 'El artículo será visible públicamente para los usuarios en la sección de blogs.'
                      : 'Guardado en borrador. No se mostrará al público hasta que actives la publicación.'}
                  </span>
                </div>
              </div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '14px',
                color: '#051020',
                backgroundColor: '#ffffff',
                padding: '10px 16px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
              }}>
                <input
                  type="checkbox"
                  checked={cIsPublished}
                  onChange={(e) => setCIsPublished(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1f75f5ff' }}
                />
                Publicar inmediatamente
              </label>
            </div>

            {/* Blog Body Editor */}
            <div className="form-group" style={{ marginTop: '24px' }}>
              <label className="form-label" style={{ marginBottom: '10px' }}>Contenido Completo del Artículo *</label>
              <div style={{ minHeight: '350px' }}>
                <TiptapEditor
                  content={cBody}
                  stickyTopOffset="115px"
                  onChange={(html) => {
                    setCBody(html);
                  }}
                  placeholder="Escribe el contenido del artículo, agrega subtítulos, imágenes, videos o enlaces..."
                />
              </div>
            </div>

            {/* Archivos Adjuntos / Descargables del Artículo */}
            <div className="form-group" style={{ marginTop: '28px', padding: '20px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IoDocumentAttachOutline size={20} color="#1f75f5" />
                    Archivos Descargables / Material Adjunto
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    Sube archivos PDF, videos o documentos que los clientes podrán descargar directamente desde este artículo.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('blog-attachment-input').click()}
                    disabled={attachmentUploading}
                    className="btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px', fontWeight: '700' }}
                  >
                    <IoCloudUploadOutline size={16} />
                    {attachmentUploading ? 'Subiendo...' : '+ Subir Archivo Adjunto'}
                  </button>
                  <input
                    id="blog-attachment-input"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.mp4,.webm,.mov,.avi"
                    onChange={handleAttachmentFileUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              {cAttachments && cAttachments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                  {cAttachments.map((att, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                        <span style={{ fontSize: '24px' }}>
                          {att.fileType === 'pdf' ? '📄' : (['mp4', 'webm', 'mov'].includes(att.fileType) ? '🎬' : '📎')}
                        </span>
                        <div style={{ overflow: 'hidden' }}>
                          <strong style={{ display: 'block', fontSize: '14px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {att.title}
                          </strong>
                          <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#1f75f5', textDecoration: 'underline' }}>
                            Ver archivo ({att.fileType?.toUpperCase()})
                          </a>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCAttachments((prev) => prev.filter((_, i) => i !== idx))}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', borderRadius: '6px' }}
                        title="Eliminar archivo adjunto"
                      >
                        <IoTrashOutline size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 12px', border: '2px dashed #cbd5e1', borderRadius: '10px', color: '#64748b', fontSize: '13px' }}>
                  No hay archivos adjuntos agregados aún a este artículo.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitLoading}
                style={{ flex: '1 1 auto', minWidth: '200px' }}
              >
                {submitLoading ? 'Guardando...' : editingItem ? 'Actualizar Artículo' : 'Publicar Artículo'}
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

        {/* Filter bar for Blogs */}
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
              placeholder="Buscar artículo por título o descripción..."
              value={adminBlogSearchText}
              onChange={(e) => setAdminBlogSearchText(e.target.value)}
              className="premium-input"
              style={{ height: '40px', fontSize: '13px', padding: '8px 12px' }}
            />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <select
              value={adminBlogCategory}
              onChange={(e) => setAdminBlogCategory(e.target.value)}
              className="premium-input"
              style={{ height: '40px', fontSize: '13px', backgroundColor: '#ffffff', cursor: 'pointer', padding: '8px 12px' }}
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <select
              value={adminBlogAccess}
              onChange={(e) => setAdminBlogAccess(e.target.value)}
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

        {/* LIST SECTION: BLOGS */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
            Cargando artículos...
          </div>
        ) : error ? (
          <div style={{ color: '#ef4444', fontWeight: 'bold', textAlign: 'center', padding: '20px' }}>
            {error}
          </div>
        ) : filteredContents.length === 0 ? (
          <div style={{ padding: '40px', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', backgroundColor: '#ffffff' }}>
            No se encontraron artículos de blog.
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
                  <h4 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0', color: '#2B2D2F', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {c.title}
                    {c.isPublished === false || c.status === 'draft' ? (
                      <span style={{ background: '#fef3c7', color: '#d97706', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', border: '1px solid #f59e0b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <IoDocumentTextOutline size={13} /> BORRADOR
                      </span>
                    ) : (
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', border: '1px solid #22c55e', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <IoCheckmarkCircleOutline size={13} /> PUBLICADO
                      </span>
                    )}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    Acceso: <strong style={{ textTransform: 'uppercase' }}>{c.accessType === 'free' ? 'Acceso Libre' : c.accessType === 'subscription' ? 'Membresía' : `Pago Único (USD $${c.priceUsd !== undefined ? c.priceUsd : (c.price || 0)} / ARS $${(c.priceArs || 0).toLocaleString()})`}</strong>
                    {c.category && ` • Categoría: ${typeof c.category === 'object' ? c.category.name : categories.find(cat => cat._id === c.category)?.name || 'General'}`}
                    {c.publishDate && ` • Publicado: ${new Date(c.publishDate).toLocaleDateString('es-ES')}`}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
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

export default AdminBlogsTab;
