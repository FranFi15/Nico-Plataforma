import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import axios from 'axios';
import TiptapEditor from '../components/TiptapEditor';
import { IoAdd, IoChevronDown, IoChevronUp, IoEye, IoEyeOff, IoDocumentText, IoClose } from 'react-icons/io5';

const AdminTraining = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Active Tab: 'trainings', 'blogs', 'workshops', 'videoteca'
  const [activeTab, setActiveTab] = useState('trainings');

  // Lists state
  const [trainings, setTrainings] = useState([]);
  const [contents, setContents] = useState([]);
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

  // Form states - Generic Contents (Blogs, Workshops, Videoteca)
  const [cTitle, setCTitle] = useState('');
  const [cDescription, setCDescription] = useState('');
  const [cAccessType, setCAccessType] = useState('free'); // 'free', 'subscription', 'one-time-purchase'
  const [cPrice, setCPrice] = useState(0);
  const [cPriceUsd, setCPriceUsd] = useState(0);
  const [cPriceArs, setCPriceArs] = useState(0);
  const [cSubtype, setCSubtype] = useState('course'); // 'course', 'workshop' (only used for Workshops tab)

  // Advanced Blog States
  const [cCardImage, setCCardImage] = useState('');
  const [cCardImagePosition, setCCardImagePosition] = useState('50%');
  const [cPublishDate, setCPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [cCategory, setCCategory] = useState('');
  const [cBody, setCBody] = useState('');
  const [cardImageUploading, setCardImageUploading] = useState(false);
  const editorRef = useRef(null);
  const [showHtmlCode, setShowHtmlCode] = useState(false);

  // Category States
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  // Admin Blog Filtering States
  const [adminBlogSearchText, setAdminBlogSearchText] = useState('');
  const [adminBlogCategory, setAdminBlogCategory] = useState('all');
  const [adminBlogAccess, setAdminBlogAccess] = useState('all');

  // Admin Videoteca Filtering States
  const [adminVideoSearchText, setAdminVideoSearchText] = useState('');
  const [adminVideoFolder, setAdminVideoFolder] = useState('all');
  const [adminVideoAccess, setAdminVideoAccess] = useState('all');

  // Quick Category Accordion state
  const [showQuickCategory, setShowQuickCategory] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);

  // Videoteca Folder States
  const [videoFolders, setVideoFolders] = useState([]);
  const [cVideoFolder, setCVideoFolder] = useState('');
  const [cVideoLink, setCVideoLink] = useState('');
  const [showQuickVideoFolder, setShowQuickVideoFolder] = useState(false);
  const [showVideoFolderManager, setShowVideoFolderManager] = useState(false);
  const [newVideoFolderName, setNewVideoFolderName] = useState('');
  const [editingVideoFolder, setEditingVideoFolder] = useState(null);
  const [editVideoFolderName, setEditVideoFolderName] = useState('');
  const [newVideoFolderCoverImage, setNewVideoFolderCoverImage] = useState('');
  const [editVideoFolderCoverImage, setEditVideoFolderCoverImage] = useState('');
  const [folderUploading, setFolderUploading] = useState(false);

  // Status flags
  const [uploading, setUploading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  // Fetch trainings list
  const fetchTrainings = async () => {
    try {
      const response = await api.get('/trainings');
      if (response.data && response.data.success) {
        setTrainings(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching trainings:', err);
      setError('No se pudieron cargar los programas de entrenamiento.');
    }
  };

  // Fetch generic contents list
  const fetchContents = async () => {
    try {
      const response = await api.get('/content');
      if (response.data && response.data.success) {
        setContents(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching contents:', err);
      setError('No se pudieron cargar los contenidos generales.');
    }
  };

  // Fetch Categories list
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data && response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch Videoteca Folders list
  const fetchVideoFolders = async () => {
    try {
      const response = await api.get('/videoteca-folders');
      if (response.data && response.data.success) {
        setVideoFolders(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching video folders:', err);
    }
  };

  // Evaluations Config State & Handlers
  const [evalConfig, setEvalConfig] = useState({
    colectivoPdfUrl: '/Evaluaciones_Kinvent.pdf',
    colectivoFormLink: 'https://docs.google.com/forms/d/e/1FAIpQLSeAJwoKDSgk7M03ZwGfbyfE1KuM4PEAQlJNlhlFov5MlKXf0Q/viewform',
    individualPdfUrl: '/Evaluaciones_Kinvent.pdf',
    individualFormLink: 'https://docs.google.com/forms/d/e/1FAIpQLSeAJwoKDSgk7M03ZwGfbyfE1KuM4PEAQlJNlhlFov5MlKXf0Q/viewform'
  });
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalUploading, setEvalUploading] = useState({ colectivo: false, individual: false });
  const [evalMessage, setEvalMessage] = useState('');

  const fetchEvalConfig = async () => {
    try {
      const response = await api.get('/evaluations');
      if (response.data && response.data.success && response.data.data) {
        setEvalConfig(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching eval config:', err);
    }
  };

  const handleUploadEvalPdf = async (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64String = reader.result;
      setEvalUploading(prev => ({ ...prev, [type]: true }));
      try {
        const res = await api.post('/evaluations/upload-pdf', { file: base64String });
        if (res.data && res.data.url) {
          if (type === 'colectivo') {
            setEvalConfig(prev => ({ ...prev, colectivoPdfUrl: res.data.url }));
          } else {
            setEvalConfig(prev => ({ ...prev, individualPdfUrl: res.data.url }));
          }
          setEvalMessage(`PDF subido correctamente para ${type === 'colectivo' ? 'Colectivo' : 'Individual'}. Haz clic en Guardar Cambios para aplicar.`);
        }
      } catch (err) {
        console.error('Error uploading PDF:', err);
        alert('Error al subir el archivo PDF.');
      } finally {
        setEvalUploading(prev => ({ ...prev, [type]: false }));
        e.target.value = '';
      }
    };
  };

  const handleSaveEvalConfig = async (e) => {
    e.preventDefault();
    setEvalLoading(true);
    setEvalMessage('');
    try {
      const res = await api.put('/evaluations', evalConfig);
      if (res.data && res.data.success) {
        setEvalMessage('¡Configuración de Evaluaciones guardada con éxito!');
        if (res.data.data) {
          setEvalConfig(res.data.data);
        }
      }
    } catch (err) {
      console.error('Error saving eval config:', err);
      setEvalMessage('Error al guardar la configuración de Evaluaciones.');
    } finally {
      setEvalLoading(false);
    }
  };

  // Initial load
  const loadData = async () => {
    setLoading(true);
    setError('');
    await Promise.all([fetchTrainings(), fetchContents(), fetchCategories(), fetchVideoFolders(), fetchEvalConfig()]);
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        navigate('/');
      } else {
        loadData();
      }
    }
  }, [user, authLoading, navigate]);

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetTrainingForm();
    resetContentForm();
    setFormMessage('');
  };

  // Reset training form
  const resetTrainingForm = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setSubDescription('');
    setYoutubeShortLink('');
    setGoogleFormLink('');
    setAthletePhotos([]);
  };

  // Reset generic content form
  const resetContentForm = () => {
    setEditingItem(null);
    setCTitle('');
    setCDescription('');
    setCAccessType('free');
    setCPrice(0);
    setCPriceUsd(0);
    setCPriceArs(0);
    setCSubtype('course');
    setCCardImage('');
    setCCardImagePosition('50%');
    setCPublishDate(new Date().toISOString().split('T')[0]);
    setCCategory('');
    setCBody('');
    setCVideoFolder('');
    setCVideoLink('');
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    setShowContentForm(false);
  };

  // Handle uploading photos to Cloudinary (via backend proxy)
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        // Read file as base64
        const base64String = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });

        // Send base64 data to backend endpoint
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

  // Handle Card Image Upload for Blogs
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

  // Insert Rich Text helper for textarea
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

  // Toolbar Actions
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

  // Category Management Handlers
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const response = await api.post('/categories', { name: newCategoryName.trim() });
      if (response.data && response.data.success) {
        setNewCategoryName('');
        fetchCategories();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al agregar categoría');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editCategoryName.trim() || !editingCategory) return;
    try {
      const response = await api.put(`/categories/${editingCategory._id}`, { name: editCategoryName.trim() });
      if (response.data && response.data.success) {
        setEditingCategory(null);
        setEditCategoryName('');
        fetchCategories();
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
        fetchCategories();
        // Clear references
        if (cCategory === id) setCCategory('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar categoría');
    }
  };

  // Submit Training Program (Create or Update)
  const handleTrainingSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !googleFormLink) {
      alert('Por favor, completa todos los campos requeridos (Título, Descripción y Formulario).');
      return;
    }

    setSubmitLoading(true);
    setFormMessage('');

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
        setFormMessage(
          editingItem
            ? '¡Programa de entrenamiento actualizado con éxito!'
            : '¡Programa de entrenamiento creado con éxito!'
        );
        resetTrainingForm();
        fetchTrainings();
      }
    } catch (err) {
      console.error('Error saving training:', err);
      const msg = err.response?.data?.message || 'Error al guardar el programa de entrenamiento.';
      setFormMessage(`Error: ${msg}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Submit Generic Content (Create or Update)
  const handleContentSubmit = async (e) => {
    e.preventDefault();
    if (!cTitle || !cDescription) {
      alert('Por favor, completa todos los campos requeridos (Título y Descripción).');
      return;
    }

    setSubmitLoading(true);
    setFormMessage('');

    let contentType = 'blog';
    if (activeTab === 'workshops') {
      contentType = cSubtype;
    } else if (activeTab === 'videoteca') {
      contentType = 'videoteca';
    }

    try {
      let response;
      const payload = {
        title: cTitle,
        description: cDescription,
        contentType,
        accessType: cAccessType,
        priceUsd: cAccessType === 'one-time-purchase' ? Number(cPriceUsd) : 0,
        priceArs: cAccessType === 'one-time-purchase' ? Number(cPriceArs) : 0,
        price: cAccessType === 'one-time-purchase' ? Number(cPriceUsd) : 0
      };

      if (contentType === 'blog') {
        payload.cardImage = cCardImage;
        payload.cardImagePosition = cCardImagePosition;
        payload.publishDate = cPublishDate;
        payload.category = cCategory || undefined;
        payload.body = cBody;
      }

      if (contentType === 'videoteca') {
        payload.videoFolder = cVideoFolder || undefined;
        payload.videoLink = cVideoLink;
        payload.body = cDescription; // Use description as body for videos
      }

      if (editingItem) {
        response = await api.put(`/content/${editingItem._id}`, payload);
      } else {
        response = await api.post('/content', payload);
      }

      if (response.data && response.data.success) {
        setFormMessage(
          editingItem
            ? 'Contenido actualizado con éxito!'
            : 'Contenido creado con éxito!'
        );
        resetContentForm();
        fetchContents();
      }
    } catch (err) {
      console.error('Error saving content:', err);
      const msg = err.response?.data?.message || 'Error al guardar el contenido.';
      setFormMessage(`Error: ${msg}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Start Editing Training Program
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

  // Start Editing Generic Content
  const startEditContent = (item) => {
    setEditingItem(item);
    setCTitle(item.title);
    setCDescription(item.description);
    setCAccessType(item.accessType || 'free');
    setCPrice(item.price || 0);
    setCPriceUsd(item.priceUsd !== undefined ? item.priceUsd : (item.price || 0));
    setCPriceArs(item.priceArs !== undefined ? item.priceArs : 0);

    // Blog fields
    setCCardImage(item.cardImage || '');
    setCCardImagePosition(item.cardImagePosition || '50%');
    setCPublishDate(item.publishDate ? new Date(item.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setCCategory(item.category?._id || item.category || '');
    setCBody(item.body || '');
    if (editorRef.current) {
      editorRef.current.innerHTML = item.body || '';
    }

    if (activeTab === 'workshops') {
      setCSubtype(item.contentType === 'workshop' ? 'workshop' : 'course');
    }

    // Videoteca fields
    if (activeTab === 'videoteca') {
      setCVideoFolder(item.videoFolder?._id || item.videoFolder || '');
      setCVideoLink(item.videoLink || '');
    }

    setShowContentForm(true);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  // Move Training Order (Up/Down)
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

  // Delete Training Program
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

  // Delete Generic Content
  const handleDeleteContent = async (id) => {
    if (!await window.confirm('¿Estás seguro de que deseas eliminar este contenido?')) {
      return;
    }

    try {
      const response = await api.delete(`/content/${id}`);
      if (response.data && response.data.success) {
        setContents((prev) => prev.filter((c) => c._id !== id));
        if (editingItem && editingItem._id === id) {
          resetContentForm();
        }
      }
    } catch (err) {
      console.error('Error deleting content:', err);
      alert('No se pudo eliminar el contenido.');
    }
  };

  // Handle Folder Image Upload
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
      alert('Error al subir la imagen de la carpeta.');
    } finally {
      setFolderUploading(false);
    }
  };

  // Create Videoteca Folder
  const handleCreateVideoFolder = async () => {
    if (!newVideoFolderName.trim()) return;
    try {
      const response = await api.post('/videoteca-folders', {
        name: newVideoFolderName.trim(),
        coverImage: newVideoFolderCoverImage
      });
      if (response.data && response.data.success) {
        setVideoFolders((prev) => [...prev, response.data.data]);
        setNewVideoFolderName('');
        setNewVideoFolderCoverImage('');
      }
    } catch (err) {
      console.error('Error creating video folder:', err);
      alert(err.response?.data?.message || 'Error al crear la carpeta.');
    }
  };

  // Update Videoteca Folder
  const handleUpdateVideoFolder = async (id) => {
    if (!editVideoFolderName.trim()) return;
    try {
      const response = await api.put(`/videoteca-folders/${id}`, {
        name: editVideoFolderName.trim(),
        coverImage: editVideoFolderCoverImage
      });
      if (response.data && response.data.success) {
        setVideoFolders((prev) => prev.map((f) => f._id === id ? response.data.data : f));
        setEditingVideoFolder(null);
        setEditVideoFolderName('');
        setEditVideoFolderCoverImage('');
      }
    } catch (err) {
      console.error('Error updating video folder:', err);
      alert(err.response?.data?.message || 'Error al actualizar la carpeta.');
    }
  };

  // Delete Videoteca Folder
  const handleDeleteVideoFolder = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta carpeta?')) return;
    try {
      const response = await api.delete(`/videoteca-folders/${id}`);
      if (response.data && response.data.success) {
        setVideoFolders((prev) => prev.filter((f) => f._id !== id));
      }
    } catch (err) {
      console.error('Error deleting video folder:', err);
      alert('No se pudo eliminar la carpeta.');
    }
  };

  if (authLoading || (!user || user.role !== 'admin')) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '18px', color: '#6b7280' }}>
        Verificando credenciales de administrador...
      </div>
    );
  }

  // Filter contents list based on activeTab and search/category/access filters
  const filteredContents = contents.filter((item) => {
    if (activeTab === 'blogs') {
      if (item.contentType !== 'blog') return false;

      // 1. Search text filter
      if (adminBlogSearchText) {
        const searchLower = adminBlogSearchText.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(searchLower);
        const descMatch = item.description?.toLowerCase().includes(searchLower);
        if (!titleMatch && !descMatch) return false;
      }

      // 2. Category filter
      if (adminBlogCategory !== 'all') {
        const catId = item.category?._id || item.category;
        if (catId !== adminBlogCategory) return false;
      }

      // 3. Access filter
      if (adminBlogAccess !== 'all' && item.accessType !== adminBlogAccess) {
        return false;
      }

      return true;
    }
    if (activeTab === 'workshops') {
      return item.contentType === 'course' || item.contentType === 'workshop';
    }
    if (activeTab === 'videoteca') {
      if (item.contentType !== 'videoteca') return false;

      // 1. Search text filter
      if (adminVideoSearchText) {
        const searchLower = adminVideoSearchText.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(searchLower);
        const descMatch = item.description?.toLowerCase().includes(searchLower);
        if (!titleMatch && !descMatch) return false;
      }

      // 2. Folder filter
      if (adminVideoFolder !== 'all') {
        const folderId = item.videoFolder?._id || item.videoFolder;
        if (adminVideoFolder === 'none') {
          if (folderId) return false;
        } else {
          if (folderId !== adminVideoFolder) return false;
        }
      }

      // 3. Access filter
      if (adminVideoAccess !== 'all' && item.accessType !== adminVideoAccess) {
        return false;
      }

      return true;
    }
    return false;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', fontFamily: 'var(--font-sans)' }}>
      <style>{`
        /* Overrides for inputs to match the codepen pen MoKLob style */
        .premium-input {
          background-color: #f8fafc !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 8px !important;
          padding: 12px 16px !important;
          color: #0f172a !important;
          font-family: inherit !important;
          font-size: 15px !important;
          width: 100% !important;
          box-sizing: border-box !important;
          transition: all 0.2s ease !important;
          box-shadow: none !important;
        }
        .premium-input:focus {
          outline: none !important;
          border-color: #1f75f5ff !important;
          background-color: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(113, 223, 190, 0.15) !important;
        }

        /* Overrides for buttons to match MoKLob Submit Button style */
        .btn-primary {
          background-color: #2B2D2F !important;
          color: #ffffffff !important;
          border: none !important;
          font-family: 'Poppins', 'Outfit', sans-serif !important;
          font-weight: bold !important;
          font-size: 13px !important;
          border-radius: 8px !important;
          padding: 14px 28px !important;
          cursor: pointer !important;
          transition: all 0.25s ease !important;
          text-transform: uppercase !important;
          letter-spacing: 1.5px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: none !important;
          transform: none !important;
        }
        .btn-primary:hover {
          background-color: #1f75f5ff !important;
          color: #ffffffff !important;
          box-shadow: 0 4px 12px rgba(113, 223, 190, 0.3) !important;
        }
        .btn-primary:disabled {
          background-color: #cbd5e1 !important;
          color: #94a3b8 !important;
          cursor: not-allowed !important;
          box-shadow: none !important;
        }

        /* Overrides for translucent/secondary buttons */
        .btn-translucent {
          background-color: transparent !important;
          color: #64748b !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 8px !important;
          padding: 10px 22px !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
        }
        .btn-translucent:hover {
          background-color: #f1f5f9 !important;
          color: #0f172a !important;
          border-color: #94a3b8 !important;
        }

        /* Redefined danger button for premium feel */
        .btn-danger {
          background-color: transparent !important;
          color: #ef4444 !important;
          border: 1px solid #fecaca !important;
          border-radius: 8px !important;
          padding: 10px 22px !important;
          font-family: 'Poppins', 'Outfit', sans-serif !important;
          font-weight: bold !important;
          font-size: 13px !important;
          cursor: pointer !important;
          transition: all 0.25s ease !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .btn-danger:hover {
          background-color: #ef4444 !important;
          color: #ffffff !important;
          border-color: #ef4444 !important;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2) !important;
        }

        /* Clean modern tabs buttons */
        .admin-tab-btn {
          background-color: transparent !important;
          color: #64748b !important;
          border: 1px solid transparent !important;
          border-radius: 24px !important;
          padding: 12px 24px !important;
          font-family: 'Poppins', 'Outfit', sans-serif !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }
        .admin-tab-btn:hover {
          color: #0f172a !important;
          background-color: #f1f5f9 !important;
        }
        .admin-tab-btn.active {
          background-color: #1f75f5ff  !important;
          color: #ffffffff !important;
          border-color: #2B2D2F !important;
          box-shadow: 0 4px 12px #1f75f55f  !important;
        }

        /* Redefined panel cards for clean look */
        .admin-panel-card {
          background-color: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          padding: 40px !important;
          margin-bottom: 40px !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
        }

        /* Redefined list item cards at the bottom */
        .premium-card {
          background-color: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          padding: 24px !important;
          transition: all 0.25s ease !important;
          box-shadow: none !important;
        }
        .premium-card:hover {
          transform: translateY(-2px) !important;
          border-color: #1f75f5ff !important;
          box-shadow: 0 4px 12px rgba(113, 223, 190, 0.1) !important;
        }

        .form-label {
          display: block !important;
          margin-bottom: 8px !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          color: #475569 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }
        .form-group {
          margin-bottom: 24px !important;
        }
      `}</style>

      {/* Header Banner */}
      <div style={{
        backgroundColor: '#2B2D2F',
        color: '#ffffff',
        padding: '40px',
        borderRadius: '16px',
        marginBottom: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        borderLeft: '6px solid #1f75f5ff'
      }}>
        <div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginBottom: '8px',
          }}>
            Panel de Control Privado
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
            Administrador: {user.name} • Sube planes, escribe artículos, gestiona workshops y organiza la videoteca.
          </p>
        </div>
        <button
          onClick={() => navigate('/entrenamiento-a-distancia')}
          className="btn-translucent"
          style={{ backgroundColor: '#ffffff', color: '#2B2D2F', borderColor: '#ffffff', fontWeight: 'bold' }}
        >
          Ver Vista Pública
        </button>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '40px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '16px',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'trainings', label: 'Entrenamiento a Distancia' },
          { id: 'blogs', label: 'Blogs & Artículos' },
          { id: 'workshops', label: 'Workshops & Capacitaciones' },
          { id: 'videoteca', label: 'Videoteca' },
          { id: 'evaluations', label: 'Evaluaciones' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Message Banner */}
      {formMessage && (
        <div style={{
          backgroundColor: formMessage.startsWith('Error') ? 'rgba(239, 68, 68, 0.08)' : 'rgba(113, 223, 190, 0.08)',
          border: `1px solid ${formMessage.startsWith('Error') ? '#ef4444' : '#71DFBE'}`,
          color: formMessage.startsWith('Error') ? '#ef4444' : '#2B2D2F',
          padding: '16px 24px',
          borderRadius: '8px',
          fontWeight: '700',
          marginBottom: '30px'
        }}>
          {formMessage}
        </div>
      )}

      {/* ========================================================
          FORM SECTION: TRAINING PROGRAMS
          ======================================================== */}
      {activeTab === 'trainings' && (
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
                  placeholder="Ej. Plan Pro Hockey Femenino"
                  required
                />
              </div>

              {/* 2. Descripción */}
              <div className="form-group">
                <label className="form-label">Descripción / Metodología *</label>
                <textarea
                  className="premium-input"
                  rows="4"
                  style={{ resize: 'vertical', height: '110px' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe los objetivos, frecuencia de entrenamiento y perfil de atletas..."
                  required
                />
              </div>

              {/* Texto adicional debajo de la descripción */}
              <div className="form-group">
                <label className="form-label">Texto Adicional (bajo la descripción)</label>
                <textarea
                  className="premium-input"
                  rows="3"
                  style={{ resize: 'vertical', height: '80px' }}
                  value={subDescription}
                  onChange={(e) => setSubDescription(e.target.value)}
                  placeholder="Información adicional relevante, requisitos o aclaraciones que van debajo de la descripción..."
                />
              </div>

              {/* 3. Link de YouTube */}
              <div className="form-group">
                <label className="form-label">Link de YouTube (Video/Short)</label>
                <input
                  type="text"
                  className="premium-input"
                  value={youtubeShortLink}
                  onChange={(e) => setYoutubeShortLink(e.target.value)}
                  placeholder="Ej. https://youtube.com/shorts/..."
                />
              </div>

              {/* 4. Link de Google Form */}
              <div className="form-group">
                <label className="form-label">Link de Google Form para Postulación *</label>
                <input
                  type="text"
                  className="premium-input"
                  value={googleFormLink}
                  onChange={(e) => setGoogleFormLink(e.target.value)}
                  placeholder="Ej. https://docs.google.com/forms/..."
                  required
                />
              </div>

              {/* 5. Subir Fotos */}
              <div className="form-group">
                <label className="form-label">Subir Fotos de Atletas</label>
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handlePhotoUpload}
                  style={{ display: 'block', margin: '8px 0' }}
                />
                {uploading && <p style={{ fontSize: '12px', color: '#051020', fontWeight: 'bold' }}>Subiendo imágenes a Cloudinary...</p>}

                {/* Thumbnail Previews with Fullname Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px', marginTop: '12px' }}>
                  {athletePhotos.map((photo, idx) => {
                    const url = typeof photo === 'string' ? photo : (photo.url || '');
                    const fullname = typeof photo === 'string' ? '' : (photo.fullname || '');
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '8px', position: 'relative', backgroundColor: '#f8fafc' }}>
                        <div style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                          <img src={url} alt="Athlete preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <input
                          type="text"
                          className="premium-input"
                          style={{ padding: '6px 8px !important', fontSize: '12px !important', height: 'auto !important' }}
                          value={fullname}
                          placeholder="Nombre del atleta"
                          onChange={(e) => {
                            const val = e.target.value;
                            setAthletePhotos((prev) => prev.map((p, i) => i === idx ? { ...p, fullname: val } : p));
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            backgroundColor: '#2B2D2F',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '22px',
                            height: '22px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitLoading || uploading}
                style={{ flex: 1 }}
              >
                {submitLoading ? 'Guardando...' : editingItem ? 'Guardar Cambios' : 'Crear Programa de Entrenamiento'}
              </button>
              {editingItem && (
                <button
                  type="button"
                  onClick={resetTrainingForm}
                  className="btn-translucent"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          FORM SECTION: GENERIC CONTENT (BLOGS, WORKSHOPS, VIDEOTECA)
          ======================================================== */}
      {(activeTab !== 'trainings' && activeTab !== 'evaluations') && (
        <div className="admin-panel-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '12px',
              marginBottom: showContentForm ? '24px' : '0'
            }}
            onClick={() => {
              if (editingItem) {
                resetContentForm();
              } else {
                setShowContentForm(!showContentForm);
              }
            }}
          >
            <h2 style={{
              fontSize: '22px',
              fontWeight: '900',
              color: '#2B2D2F',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {editingItem ? ' Editar ' : ' Crear Nuevo '}
              {activeTab === 'blogs' && 'Artículo en el Blog'}
              {activeTab === 'workshops' && 'Workshop o Curso'}
              {activeTab === 'videoteca' && 'Video en la Videoteca'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1f75f5ff', fontWeight: 'bold', fontSize: '14px' }}>
              {editingItem ? (
                <>
                  <span style={{ color: '#ef4444' }}>Editando (Cancelar)</span>
                  <IoClose size={18} style={{ color: '#ef4444' }} />
                </>
              ) : (
                <>
                  <span>{showContentForm ? 'Ocultar Formulario' : 'Abrir Formulario'}</span>
                  {showContentForm ? <IoChevronUp size={18} /> : <IoChevronDown size={18} />}
                </>
              )}
            </div>
          </div>

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
                      placeholder="Ej. Análisis de la Sentadilla Profunda en Levantadores"
                      required
                    />
                  </div>

                  {activeTab === 'workshops' && (
                    <div className="form-group">
                      <label className="form-label">Tipo de Formación *</label>
                      <select
                        className="premium-input"
                        value={cSubtype}
                        onChange={(e) => setCSubtype(e.target.value)}
                        style={{ backgroundColor: '#ffffff', color: '#051020', cursor: 'pointer' }}
                      >
                        <option value="course">Curso de Especialización (Curso)</option>
                        <option value="workshop">Taller Práctico (Workshop)</option>
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Tipo de Acceso *</label>
                    <select
                      className="premium-input"
                      value={cAccessType}
                      onChange={(e) => setCAccessType(e.target.value)}
                      style={{ backgroundColor: '#ffffff', color: '#051020', cursor: 'pointer' }}
                    >
                      <option value="free">Acceso Gratuito (Público)</option>
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
                          placeholder="Ej. 29.99"
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
                          placeholder="Ej. 45000"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Blog-specific fields (Col 1) */}
                  {activeTab === 'blogs' && (
                    <>
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
                              padding: 0
                            }}
                          >
                            {showQuickCategory ? '✕ Cerrar' : '+ Nueva Categoría'}
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
                                onClick={async () => {
                                  if (!newCategoryName.trim()) return;
                                  try {
                                    const response = await api.post('/categories', { name: newCategoryName.trim() });
                                    if (response.data && response.data.success) {
                                      setNewCategoryName('');
                                      await fetchCategories();
                                      setCCategory(response.data.data._id);
                                      setShowQuickCategory(false);
                                    }
                                  } catch (err) {
                                    alert(err.response?.data?.message || 'Error al agregar categoría');
                                  }
                                }}
                                className="btn-primary"
                                style={{ padding: '0 12px', height: '36px', fontSize: '11px', textTransform: 'none', letterSpacing: 'normal' }}
                              >
                                Agregar
                              </button>
                            </div>
                          </div>
                        )}

                        <select
                          className="premium-input"
                          value={cCategory}
                          onChange={(e) => setCCategory(e.target.value)}
                          style={{ backgroundColor: '#ffffff', color: '#051020', cursor: 'pointer' }}
                        >
                          <option value="">Selecciona una Categoría</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
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
                      placeholder="Escribe la descripción o los temas principales que cubre este material..."
                      required
                    />
                  </div>

                  {/* Blog-specific fields (Col 2) */}
                  {activeTab === 'blogs' && (
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
                            <label className="form-label" style={{ margin: 0 }}>Vista Previa de Portada (Detalle del Blog)</label>
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
                            border: '1px solid var(--border)',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
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
                            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--gray-600)' }}>Posición Vertical:</span>
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
                  )}

                  {/* Videoteca-specific fields (Col 2) */}
                  {activeTab === 'videoteca' && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Enlace del Video *</label>
                        <input
                          type="url"
                          className="premium-input"
                          value={cVideoLink}
                          onChange={(e) => setCVideoLink(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                          Pega el link de YouTube, Vimeo o cualquier otra plataforma.
                        </p>
                      </div>

                      <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label className="form-label" style={{ margin: 0 }}>Carpeta</label>
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
                              padding: 0
                            }}
                          >
                            {showQuickVideoFolder ? '✕ Cerrar' : '+ Nueva Carpeta'}
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
                                placeholder="Ej. Biomecánica Avanzada"
                                value={newVideoFolderName}
                                onChange={(e) => setNewVideoFolderName(e.target.value)}
                                style={{ height: '36px', fontSize: '13px', padding: '8px 12px' }}
                              />
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!newVideoFolderName.trim()) return;
                                  try {
                                    const response = await api.post('/videoteca-folders', { name: newVideoFolderName.trim() });
                                    if (response.data && response.data.success) {
                                      setNewVideoFolderName('');
                                      await fetchVideoFolders();
                                      setCVideoFolder(response.data.data._id);
                                      setShowQuickVideoFolder(false);
                                    }
                                  } catch (err) {
                                    alert(err.response?.data?.message || 'Error al agregar carpeta');
                                  }
                                }}
                                className="btn-primary"
                                style={{ padding: '0 12px', height: '36px', fontSize: '11px', textTransform: 'none', letterSpacing: 'normal' }}
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
                        >
                          <option value="">Sin Carpeta (General)</option>
                          {videoFolders.map((folder) => (
                            <option key={folder._id} value={folder._id}>
                              {folder.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                {/* Full-width Rich Text Editor (only for Blogs) */}
                {activeTab === 'blogs' && (
                  <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                      <label className="form-label">Cuerpo del Artículo *</label>
                      <TiptapEditor
                        content={cBody}
                        onChange={setCBody}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitLoading}
                  style={{ flex: 1 }}
                >
                  {submitLoading ? 'Guardando...' : editingItem ? 'Guardar Cambios' : 'Crear Contenido'}
                </button>
                {editingItem && (
                  <button
                    type="button"
                    onClick={resetContentForm}
                    className="btn-translucent"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {/* ========================================================
          CATEGORY MANAGEMENT PANEL (ONLY IN BLOGS TAB)
          ======================================================== */}
      {activeTab === 'blogs' && (
        <div className="admin-panel-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '12px',
              marginBottom: showCategoryManager ? '24px' : '0'
            }}
            onClick={() => setShowCategoryManager(!showCategoryManager)}
          >
            <h2 style={{
              fontSize: '22px',
              fontWeight: '900',
              color: '#2B2D2F',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: 0
            }}>
              Gestión de Categorías
            </h2>
            <span style={{ color: '#1f75f5ff', fontWeight: 'bold', fontSize: '14px' }}>
              {showCategoryManager ? '✕ Ocultar Panel' : 'Abrir Panel'}
            </span>
          </div>

          {showCategoryManager && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
              {/* Create / Edit Category Form */}
              <div>
                <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">
                      {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                    </label>
                    <input
                      type="text"
                      className="premium-input"
                      value={editingCategory ? editCategoryName : newCategoryName}
                      onChange={(e) => editingCategory ? setEditCategoryName(e.target.value) : setNewCategoryName(e.target.value)}
                      placeholder="Ej. Biomecánica"
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
                      {editingCategory ? 'Actualizar' : 'Agregar'}
                    </button>
                    {editingCategory && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(null);
                          setEditCategoryName('');
                        }}
                        className="btn-translucent"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* List of existing categories */}
              <div>
                <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Categorías Existentes</label>
                {categories.length === 0 ? (
                  <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0 }}>No hay categorías registradas.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
                    {categories.map((cat) => (
                      <div
                        key={cat._id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 16px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          backgroundColor: '#f8fafc'
                        }}
                      >
                        <span style={{ fontWeight: '600', color: '#2B2D2F' }}>{cat.name}</span>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory(cat);
                              setEditCategoryName(cat.name);
                            }}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: '#64748b',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '13px',
                              textDecoration: 'underline',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#1f75f5ff'}
                            onMouseLeave={(e) => e.target.style.color = '#64748b'}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat._id)}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: '#ef4444',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '13px',
                              textDecoration: 'underline',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#dc2626'}
                            onMouseLeave={(e) => e.target.style.color = '#ef4444'}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          FOLDER MANAGER: VIDEOTECA FOLDERS
          ======================================================== */}
      {activeTab === 'videoteca' && (
        <div className="admin-panel-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '12px',
              marginBottom: showVideoFolderManager ? '24px' : '0'
            }}
            onClick={() => setShowVideoFolderManager(!showVideoFolderManager)}
          >
            <h2 style={{
              fontSize: '22px',
              fontWeight: '900',
              color: '#2B2D2F',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: 0
            }}>
              Gestión de Carpetas de Videoteca
            </h2>
            <span style={{ color: '#1f75f5ff', fontWeight: 'bold', fontSize: '14px' }}>
              {showVideoFolderManager ? '✕ Ocultar Panel' : 'Abrir Panel'}
            </span>
          </div>

          {showVideoFolderManager && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
              {/* Create / Edit Folder Form */}
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
                    {folderUploading && (
                      <p style={{ fontSize: '12px', color: '#051020', fontWeight: 'bold' }}>
                        Subiendo imagen de portada de carpeta...
                      </p>
                    )}
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
                          onClick={() => {
                            if (editingVideoFolder) {
                              setEditVideoFolderCoverImage('');
                            } else {
                              setNewVideoFolderCoverImage('');
                            }
                          }}
                          style={{
                            marginTop: '8px',
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                          }}
                        >
                          Quitar Imagen
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
                      {editingVideoFolder ? 'Actualizar' : 'Agregar'}
                    </button>
                    {editingVideoFolder && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVideoFolder(null);
                          setEditVideoFolderName('');
                          setEditVideoFolderCoverImage('');
                        }}
                        className="btn-translucent"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* List of existing folders */}
              <div>
                <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Carpetas Existentes</label>
                {videoFolders.length === 0 ? (
                  <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0 }}>No hay carpetas registradas.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
                    {videoFolders.map((folder) => (
                      <div
                        key={folder._id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 16px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          backgroundColor: '#f8fafc'
                        }}
                      >
                        <span style={{ fontWeight: '600', color: '#2B2D2F' }}>{folder.name}</span>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingVideoFolder(folder);
                              setEditVideoFolderName(folder.name);
                              setEditVideoFolderCoverImage(folder.coverImage || '');
                            }}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: '#64748b',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '13px',
                              textDecoration: 'underline',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#1f75f5ff'}
                            onMouseLeave={(e) => e.target.style.color = '#64748b'}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVideoFolder(folder._id)}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: '#ef4444',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '13px',
                              textDecoration: 'underline',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#dc2626'}
                            onMouseLeave={(e) => e.target.style.color = '#ef4444'}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          FORM SECTION: EVALUATIONS CONFIG
          ======================================================== */}
      {activeTab === 'evaluations' && (
        <div className="admin-panel-card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '900',
            color: '#2B2D2F',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '10px'
          }}>
            Configuración de Evaluaciones
          </h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '15px', marginBottom: '30px', lineHeight: '1.5' }}>
            Aquí puedes administrar los archivos PDF descargables y los enlaces a formularios o turnos que aparecen en las secciones pública e individual de Evaluaciones.
          </p>

          {evalMessage && (
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              backgroundColor: evalMessage.includes('Error') ? 'rgba(239, 68, 68, 0.08)' : 'rgba(113, 223, 190, 0.15)',
              border: `1px solid ${evalMessage.includes('Error') ? '#ef4444' : '#71DFBE'}`,
              color: evalMessage.includes('Error') ? '#dc2626' : '#047857',
              fontWeight: '600'
            }}>
              {evalMessage}
            </div>
          )}

          <form onSubmit={handleSaveEvalConfig} style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
            
            {/* 1. Evaluaciones para Deportes de Equipo (Colectivo) */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--dark)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                1. Evaluaciones para Deportes de Equipo (Colectivo)
              </h3>
              
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '700', color: '#334155' }}>Archivo PDF de Descarga</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="premium-input"
                    style={{ flex: '1', minWidth: '280px' }}
                    placeholder="/Evaluaciones_Kinvent.pdf o URL"
                    value={evalConfig.colectivoPdfUrl || ''}
                    onChange={(e) => setEvalConfig({ ...evalConfig, colectivoPdfUrl: e.target.value })}
                  />
                  <label className="btn-translucent" style={{ cursor: evalUploading.colectivo ? 'wait' : 'pointer', margin: 0, padding: '12px 20px', whiteSpace: 'nowrap' }}>
                    {evalUploading.colectivo ? 'Subiendo PDF...' : 'Subir PDF'}
                    <input
                      type="file"
                      accept=".pdf"
                      style={{ display: 'none' }}
                      disabled={evalUploading.colectivo}
                      onChange={(e) => handleUploadEvalPdf('colectivo', e)}
                    />
                  </label>
                </div>
                <small style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
                  Puedes pegar una URL existente o usar el botón para subir un nuevo PDF al servidor.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '700', color: '#334155' }}>Link del Formulario (o Google Form)</label>
                <input
                  type="url"
                  className="premium-input"
                  placeholder="https://docs.google.com/forms/..."
                  value={evalConfig.colectivoFormLink || ''}
                  onChange={(e) => setEvalConfig({ ...evalConfig, colectivoFormLink: e.target.value })}
                />
              </div>
            </div>

            {/* 2. Evaluación Biomecánica Individual */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--dark)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                2. Evaluación Biomecánica Individual (1 a 1)
              </h3>
              
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '700', color: '#334155' }}>Archivo PDF de Descarga</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="premium-input"
                    style={{ flex: '1', minWidth: '280px' }}
                    placeholder="/Evaluaciones_Kinvent.pdf o URL"
                    value={evalConfig.individualPdfUrl || ''}
                    onChange={(e) => setEvalConfig({ ...evalConfig, individualPdfUrl: e.target.value })}
                  />
                  <label className="btn-translucent" style={{ cursor: evalUploading.individual ? 'wait' : 'pointer', margin: 0, padding: '12px 20px', whiteSpace: 'nowrap' }}>
                    {evalUploading.individual ? 'Subiendo PDF...' : 'Subir PDF'}
                    <input
                      type="file"
                      accept=".pdf"
                      style={{ display: 'none' }}
                      disabled={evalUploading.individual}
                      onChange={(e) => handleUploadEvalPdf('individual', e)}
                    />
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '700', color: '#334155' }}>Link del Formulario de Turnos</label>
                <input
                  type="url"
                  className="premium-input"
                  placeholder="https://docs.google.com/forms/..."
                  value={evalConfig.individualFormLink || ''}
                  onChange={(e) => setEvalConfig({ ...evalConfig, individualFormLink: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={evalLoading || evalUploading.colectivo || evalUploading.individual}
              style={{ padding: '16px', fontSize: '16px', fontWeight: '800' }}
            >
              {evalLoading ? 'Guardando Configuración...' : 'Guardar Configuración de Evaluaciones'}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================
          LIST SECTION
          ======================================================== */}
      {activeTab !== 'evaluations' && (
      <div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '900',
          color: '#2B2D2F',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '24px'
        }}>
          {activeTab === 'trainings' && 'Programas Creados'}
          {activeTab === 'blogs' && 'Artículos Publicados'}
          {activeTab === 'workshops' && 'Workshops y Cursos Activos'}
          {activeTab === 'videoteca' && 'Videos en Biblioteca'}
        </h2>

        {/* Filter bar for Blogs */}
        {activeTab === 'blogs' && (
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '24px',
            backgroundColor: '#ffffff',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            {/* Search Input */}
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
            {/* Category Filter */}
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
            {/* Access Filter */}
            <div style={{ flex: '1 1 150px' }}>
              <select
                value={adminBlogAccess}
                onChange={(e) => setAdminBlogAccess(e.target.value)}
                className="premium-input"
                style={{ height: '40px', fontSize: '13px', backgroundColor: '#ffffff', cursor: 'pointer', padding: '8px 12px' }}
              >
                <option value="all">Todos los accesos</option>
                <option value="free">Acceso Gratuito</option>
                <option value="subscription">Membresía Premium</option>
                <option value="one-time-purchase">Pago Único</option>
              </select>
            </div>
          </div>
        )}

        {/* Filter bar for Videos */}
        {activeTab === 'videoteca' && (
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '24px',
            backgroundColor: '#ffffff',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            {/* Search Input */}
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
            {/* Folder Filter */}
            <div style={{ flex: '1 1 150px' }}>
              <select
                value={adminVideoFolder}
                onChange={(e) => setAdminVideoFolder(e.target.value)}
                className="premium-input"
                style={{ height: '40px', fontSize: '13px', backgroundColor: '#ffffff', cursor: 'pointer', padding: '8px 12px' }}
              >
                <option value="all">Todas las carpetas</option>
                <option value="none">Sin Carpeta (General)</option>
                {videoFolders.map((folder) => (
                  <option key={folder._id} value={folder._id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Access Filter */}
            <div style={{ flex: '1 1 150px' }}>
              <select
                value={adminVideoAccess}
                onChange={(e) => setAdminVideoAccess(e.target.value)}
                className="premium-input"
                style={{ height: '40px', fontSize: '13px', backgroundColor: '#ffffff', cursor: 'pointer', padding: '8px 12px' }}
              >
                <option value="all">Todos los accesos</option>
                <option value="free">Acceso Gratuito</option>
                <option value="subscription">Membresía Premium</option>
                <option value="one-time-purchase">Pago Único</option>
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
            Cargando lista de elementos...
          </div>
        ) : error ? (
          <div style={{ color: '#ef4444', fontWeight: 'bold', textAlign: 'center', padding: '20px' }}>
            {error}
          </div>
        ) : (activeTab === 'trainings' ? trainings.length === 0 : filteredContents.length === 0) ? (
          <div style={{ padding: '40px', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', backgroundColor: '#ffffff' }}>
            No hay elementos creados en esta sección todavía.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activeTab === 'trainings'
              ? trainings.map((t, index) => (
                <div
                  key={t._id}
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
                    <h4 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0', color: '#2B2D2F' }}>{t.title}</h4>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                      {t.athletePhotos.length} Fotos subidas • Link de Formulario: <a href={t.googleFormLink} target="_blank" rel="noreferrer" style={{ color: '#2B2D2F', fontWeight: 'bold' }}>Ver enlace</a>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '4px', marginRight: '8px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <button
                        onClick={() => moveTrainingOrder(index, -1)}
                        disabled={index === 0}
                        title="Mover hacia arriba"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          opacity: index === 0 ? 0.3 : 1,
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          color: '#0f172a'
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
                          opacity: index === trainings.length - 1 ? 0.3 : 1,
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          color: '#0f172a'
                        }}
                      >
                        <IoChevronDown size={18} />
                      </button>
                    </div>
                    <button
                      onClick={() => startEditTraining(t)}
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteTraining(t._id)}
                      className="btn-danger"
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
              : filteredContents.map((c) => (
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
                      Acceso: <strong style={{ textTransform: 'uppercase' }}>{c.accessType === 'free' ? 'Gratuito' : c.accessType === 'subscription' ? 'Membresía' : `Pago Único (USD $${c.priceUsd !== undefined ? c.priceUsd : (c.price || 0)} / ARS $${(c.priceArs || 0).toLocaleString()})`}</strong>
                      {activeTab === 'workshops' && ` • Tipo: ${c.contentType === 'workshop' ? 'Taller / Workshop' : 'Curso de Especialización'}`}
                      {activeTab === 'videoteca' && c.videoFolder && ` • Carpeta: ${c.videoFolder?.name || 'Sin asignar'}`}
                      {activeTab === 'videoteca' && c.videoLink && (
                        <> • <a href={c.videoLink} target="_blank" rel="noreferrer" style={{ color: '#1f75f5ff', fontWeight: 'bold' }}>Ver Video</a></>
                      )}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => startEditContent(c)}
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteContent(c._id)}
                      className="btn-danger"
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
      )}

    </div>
  );
};

export default AdminTraining;
