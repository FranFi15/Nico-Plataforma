import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import TiptapEditor from '../../components/TiptapEditor';
import { IoSchoolOutline, IoConstructOutline, IoDocumentTextOutline, IoPlayCircleOutline, IoClose, IoTrashOutline, IoPencil, IoAdd, IoFolderOpen, IoEyeOutline, IoEyeOffOutline, IoNotificationsOutline, IoSend, IoCheckmarkCircleOutline, IoHelpCircleOutline, IoListOutline, IoChevronDown, IoChevronUp, IoInformationCircleOutline, IoPricetagOutline, IoImageOutline, IoBookmarkOutline, IoDownloadOutline, IoCloudUploadOutline, IoLinkOutline } from 'react-icons/io5';

const AdminWorkshopsTab = ({ formMessage, setFormMessage }) => {
  const [contents, setContents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing & Form state
  const [editingItem, setEditingItem] = useState(null);
  const [showContentForm, setShowContentForm] = useState(false);

  // Accordion / Dropdown section state for compact editing
  const [openSections, setOpenSections] = useState({ card1: true, card2: false, card3: false, card4: true, card5: false });
  const toggleSection = (sectionKey) => {
    setOpenSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  // Form fields
  const [cTitle, setCTitle] = useState('');
  const [cDescription, setCDescription] = useState('');
  const [cAccessType, setCAccessType] = useState('free');
  const [cPriceUsd, setCPriceUsd] = useState(0);
  const [cPriceArs, setCPriceArs] = useState(0);
  const [cMemberDiscountPercentage, setCMemberDiscountPercentage] = useState(0);
  const [cSubtype, setCSubtype] = useState('course'); // 'course' or 'workshop'
  const [cModules, setCModules] = useState([]);
  const [cCertificate, setCCertificate] = useState(true);
  const [cDuration, setCDuration] = useState('');
  const [activeEditingLessonId, setActiveEditingLessonId] = useState(null);
  const [cCardImage, setCCardImage] = useState('');
  const [cCardImagePosition, setCCardImagePosition] = useState('50%');
  const [cVideoLink, setCVideoLink] = useState('');
  const [cCategory, setCCCategory] = useState('');
  const [cardImageUploading, setCardImageUploading] = useState(false);
  const [lessonAttachmentUploading, setLessonAttachmentUploading] = useState(false);
  const [newAttTitle, setNewAttTitle] = useState('');
  const [newAttUrl, setNewAttUrl] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [cIsPublished, setCIsPublished] = useState(true);
  const [cNotifyUsers, setCNotifyUsers] = useState('none');

  // Notify students state
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifyingLoading, setNotifyingLoading] = useState(false);

  // Category Manager & Quick Category states
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [showQuickCategory, setShowQuickCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Filtering states
  const [adminWorkshopSearchText, setAdminWorkshopSearchText] = useState('');
  const [adminWorkshopCategory, setAdminWorkshopCategory] = useState('all');
  const [adminWorkshopAccess, setAdminWorkshopAccess] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, workshopsRes, catsRes] = await Promise.all([
        api.get('/content?type=course'),
        api.get('/content?type=workshop'),
        api.get('/categories?type=course')
      ]);
      const courses = coursesRes.data?.success ? coursesRes.data.data : [];
      const workshops = workshopsRes.data?.success ? workshopsRes.data.data : [];
      setContents([...courses, ...workshops]);

      if (catsRes.data && catsRes.data.success) {
        setCategories(catsRes.data.data);
      }
    } catch (err) {
      console.error('Error loading workshops data:', err);
      setError('No se pudieron cargar los cursos y workshops.');
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
    setCSubtype('course');
    setCModules([]);
    setCCertificate(true);
    setCDuration('');
    setActiveEditingLessonId(null);
    setCCardImage('');
    setCCardImagePosition('50%');
    setCVideoLink('');
    setCCCategory('');
    setCIsPublished(true);
    setCNotifyUsers('none');
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
    setCSubtype(item.contentType === 'workshop' ? 'workshop' : 'course');
    setCModules(item.modules || []);
    setCCertificate(item.certificate !== undefined ? item.certificate : true);
    setCDuration(item.duration || '');
    setActiveEditingLessonId(null);
    setCCardImage(item.cardImage || '');
    setCCardImagePosition(item.cardImagePosition || '50%');
    setCVideoLink(item.videoLink || '');
    setCCCategory(item.category?._id || item.category || (item.categories?.length > 0 ? item.categories[0]?._id : ''));
    setCIsPublished(item.isPublished !== undefined ? item.isPublished : (item.status !== 'draft'));
    setCNotifyUsers('none');
    setShowContentForm(true);
    setOpenSections({ card1: false, card2: false, card3: false, card4: true, card5: false });
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!notifyTitle.trim() || !notifyMessage.trim() || !editingItem) return;
    setNotifyingLoading(true);
    try {
      const res = await api.post(`/content/${editingItem._id}/notify-students`, {
        title: notifyTitle.trim(),
        message: notifyMessage.trim()
      });
      if (res.data?.success) {
        alert(res.data.message || 'Alumnos notificados con éxito');
        setShowNotifyModal(false);
        setNotifyTitle('');
        setNotifyMessage('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al enviar la notificación');
    } finally {
      setNotifyingLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const response = await api.post('/categories', { name: newCategoryName.trim(), type: 'course' });
      if (response.data && response.data.success) {
        setNewCategoryName('');
        const catsRes = await api.get('/categories?type=course');
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
      const response = await api.put(`/categories/${editingCategory._id}`, { name: editCategoryName.trim(), type: 'course' });
      if (response.data && response.data.success) {
        setEditingCategory(null);
        setEditCategoryName('');
        const catsRes = await api.get('/categories?type=course');
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
        const catsRes = await api.get('/categories?type=course');
        if (catsRes.data?.success) setCategories(catsRes.data.data);
        if (cCategory === id) setCCCategory('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar categoría');
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

  const handleLessonAttachmentUpload = async (e, modId, lesId, currentAttachments = []) => {
    const file = e.target.files[0];
    if (!file) return;

    setLessonAttachmentUploading(true);
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
        handleUpdateLesson(modId, lesId, {
          attachments: [
            ...currentAttachments,
            {
              title: file.name,
              url: res.data.url
            }
          ]
        });
      }
    } catch (err) {
      console.error('Error uploading lesson attachment:', err);
      alert('Error al subir el archivo adjunto al servidor.');
    } finally {
      setLessonAttachmentUploading(false);
      e.target.value = '';
    }
  };

  const handleAddCustomAttachment = (modId, lesId, currentAttachments = []) => {
    if (!newAttTitle.trim() || !newAttUrl.trim()) {
      alert('Por favor, ingresa el título y la URL del recurso.');
      return;
    }
    handleUpdateLesson(modId, lesId, {
      attachments: [
        ...currentAttachments,
        {
          title: newAttTitle.trim(),
          url: newAttUrl.trim()
        }
      ]
    });
    setNewAttTitle('');
    setNewAttUrl('');
  };

  // Skool Module & Lesson / Quiz Handlers
  const handleAddModule = () => {
    const newMod = {
      id: 'mod_' + Date.now(),
      title: `Módulo ${cModules.length + 1}: Nuevo Módulo`,
      description: '',
      lessons: []
    };
    setCModules([...cModules, newMod]);
  };

  const handleUpdateModule = (modId, updatedProps) => {
    setCModules(cModules.map(m => m.id === modId ? { ...m, ...updatedProps } : m));
  };

  const handleDeleteModule = (modId) => {
    if (!window.confirm('¿Eliminar este módulo y todo su contenido?')) return;
    setCModules(cModules.filter(m => m.id !== modId));
    if (activeEditingLessonId && activeEditingLessonId.moduleId === modId) {
      setActiveEditingLessonId(null);
    }
  };

  const handleAddLesson = (modId, itemType = 'lesson') => {
    const mod = cModules.find(m => m.id === modId);
    const count = mod ? mod.lessons.length : 0;
    const newItem = itemType === 'quiz' ? {
      id: 'quiz_' + Date.now(),
      type: 'quiz',
      title: `Evaluación ${count + 1}: Multiple Choice`,
      description: 'Responde correctamente para aprobar este módulo.',
      duration: '10 min',
      passingScore: 70,
      questions: [
        {
          id: 'q_' + Date.now(),
          questionText: '¿Primera pregunta de ejemplo?',
          options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
          correctOptionIndex: 0,
          explanation: ''
        }
      ]
    } : {
      id: 'les_' + Date.now(),
      type: 'lesson',
      title: `Lección ${count + 1}: Nueva Lección`,
      description: '',
      duration: '15 min',
      videoLink: '',
      body: '',
      isPublished: true,
      attachments: []
    };

    setCModules(cModules.map(m => m.id === modId ? { ...m, lessons: [...m.lessons, newItem] } : m));
    setActiveEditingLessonId({ moduleId: modId, lessonId: newItem.id });
  };

  const handleUpdateLesson = (modId, lesId, updatedProps) => {
    setCModules(cModules.map(m => {
      if (m.id !== modId) return m;
      return {
        ...m,
        lessons: m.lessons.map(l => l.id === lesId ? { ...l, ...updatedProps } : l)
      };
    }));
  };

  // Helper para actualizar propiedades de una pregunta dentro de un examen/evaluación
  const handleUpdateLessonQuestion = (modId, lesId, questionId, updatedQuestionProps) => {
    setCModules(cModules.map(m => {
      if (m.id !== modId) return m;
      return {
        ...m,
        lessons: m.lessons.map(l => {
          if (l.id !== lesId) return l;
          const currentQuestions = l.questions || [];
          return {
            ...l,
            questions: currentQuestions.map(q => q.id === questionId ? { ...q, ...updatedQuestionProps } : q)
          };
        })
      };
    }));
  };

  const handleAddQuestionToLesson = (modId, lesId) => {
    const newQuestion = {
      id: 'q_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      questionText: '¿Nueva pregunta del examen?',
      options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
      correctOptionIndex: 0,
      explanation: ''
    };
    setCModules(cModules.map(m => {
      if (m.id !== modId) return m;
      return {
        ...m,
        lessons: m.lessons.map(l => {
          if (l.id !== lesId) return l;
          return {
            ...l,
            questions: [...(l.questions || []), newQuestion]
          };
        })
      };
    }));
  };

  const handleDeleteQuestionFromLesson = (modId, lesId, questionId) => {
    if (!window.confirm('¿Eliminar esta pregunta del examen múltiple choice?')) return;
    setCModules(cModules.map(m => {
      if (m.id !== modId) return m;
      return {
        ...m,
        lessons: m.lessons.map(l => {
          if (l.id !== lesId) return l;
          return {
            ...l,
            questions: (l.questions || []).filter(q => q.id !== questionId)
          };
        })
      };
    }));
  };

  const handleAddOptionToQuestion = (modId, lesId, questionId) => {
    setCModules(cModules.map(m => {
      if (m.id !== modId) return m;
      return {
        ...m,
        lessons: m.lessons.map(l => {
          if (l.id !== lesId) return l;
          return {
            ...l,
            questions: (l.questions || []).map(q => {
              if (q.id !== questionId) return q;
              const opts = q.options || [];
              return {
                ...q,
                options: [...opts, `Opción ${opts.length + 1}`]
              };
            })
          };
        })
      };
    }));
  };

  const handleUpdateOptionInQuestion = (modId, lesId, questionId, optionIndex, newOptionText) => {
    setCModules(cModules.map(m => {
      if (m.id !== modId) return m;
      return {
        ...m,
        lessons: m.lessons.map(l => {
          if (l.id !== lesId) return l;
          return {
            ...l,
            questions: (l.questions || []).map(q => {
              if (q.id !== questionId) return q;
              const opts = [...(q.options || [])];
              opts[optionIndex] = newOptionText;
              return { ...q, options: opts };
            })
          };
        })
      };
    }));
  };

  const handleDeleteOptionFromQuestion = (modId, lesId, questionId, optionIndex) => {
    setCModules(cModules.map(m => {
      if (m.id !== modId) return m;
      return {
        ...m,
        lessons: m.lessons.map(l => {
          if (l.id !== lesId) return l;
          return {
            ...l,
            questions: (l.questions || []).map(q => {
              if (q.id !== questionId) return q;
              const opts = [...(q.options || [])];
              if (opts.length <= 2) {
                alert('La pregunta debe tener al menos 2 opciones de respuesta.');
                return q;
              }
              opts.splice(optionIndex, 1);
              let newCorrectIdx = q.correctOptionIndex || 0;
              if (newCorrectIdx === optionIndex) {
                newCorrectIdx = 0;
              } else if (newCorrectIdx > optionIndex) {
                newCorrectIdx = newCorrectIdx - 1;
              }
              return { ...q, options: opts, correctOptionIndex: newCorrectIdx };
            })
          };
        })
      };
    }));
  };

  const handleDeleteLesson = (modId, lesId) => {
    if (!window.confirm('¿Eliminar este ítem del módulo?')) return;
    setCModules(cModules.map(m => {
      if (m.id !== modId) return m;
      return { ...m, lessons: m.lessons.filter(l => l.id !== lesId) };
    }));
    if (activeEditingLessonId && activeEditingLessonId.lessonId === lesId) {
      setActiveEditingLessonId(null);
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

    const contentType = cSubtype;

    try {
      let response;
      const payload = {
        title: cTitle,
        description: cDescription,
        contentType,
        accessType: cAccessType,
        priceUsd: cAccessType === 'one-time-purchase' ? Number(cPriceUsd) : 0,
        priceArs: cAccessType === 'one-time-purchase' ? Number(cPriceArs) : 0,
        price: cAccessType === 'one-time-purchase' ? Number(cPriceUsd) : 0,
        memberDiscountPercentage: cAccessType === 'one-time-purchase' ? Number(cMemberDiscountPercentage) : 0,
        cardImage: cCardImage,
        cardImagePosition: cCardImagePosition,
        videoLink: cVideoLink,
        category: cCategory || undefined,
        modules: cModules,
        certificate: cCertificate,
        duration: cDuration,
        status: cIsPublished ? 'published' : 'draft',
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
              ? '¡Workshop / Curso actualizado con éxito!'
              : '¡Workshop / Curso creado con éxito!'
          );
        }
        resetContentForm();
        fetchData();
      }
    } catch (err) {
      console.error('Error saving workshop:', err);
      const msg = err.response?.data?.message || 'Error al guardar el curso o workshop.';
      if (setFormMessage) setFormMessage(`Error: ${msg}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteContent = async (id) => {
    if (!await window.confirm('¿Estás seguro de que deseas eliminar este contenido?')) return;
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

  const filteredContents = contents.filter((item) => {
    if (adminWorkshopSearchText) {
      const searchLower = adminWorkshopSearchText.toLowerCase();
      const titleMatch = item.title?.toLowerCase().includes(searchLower);
      const descMatch = item.description?.toLowerCase().includes(searchLower);
      if (!titleMatch && !descMatch) return false;
    }
    if (adminWorkshopCategory !== 'all') {
      const catId = item.category?._id || item.category;
      if (catId !== adminWorkshopCategory) return false;
    }
    if (adminWorkshopAccess !== 'all' && item.accessType !== adminWorkshopAccess) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <div className="admin-panel-card">
        {/* Header and Toggle Form Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '900',
            color: '#2B2D2F',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            margin: 0
          }}>
            {editingItem ? 'Editar Workshop / Curso' : showContentForm ? 'Crear Nuevo Workshop o Curso' : 'Gestión de Workshops & Capacitaciones'}
          </h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
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
                onClick={() => { resetContentForm(); setShowContentForm(true); setOpenSections({ card1: true, card2: false, card3: false, card4: true, card5: false }); }}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <IoAdd size={18} /> Nuevo Workshop / Curso
              </button>
            )}
          </div>
        </div>

        {/* Category Manager Section */}
        {showCategoryManager && (
          <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#051020', marginBottom: '16px' }}>
              Gestión de Categorías de Formación (Cursos & Workshops)
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
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No hay categorías creadas para Cursos/Workshops.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {categories.map((cat) => (
                  <div key={cat._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => { setEditingCategory(cat); setEditCategoryName(cat.name); }}
                      style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <IoPencil size={14} /> Editar
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

        {showContentForm && (
          <form onSubmit={handleContentSubmit}>
            {/* ACCORDION QUICK CONTROLS BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', color: '#ffffff', padding: '18px 24px', borderRadius: '16px', marginBottom: '24px', flexWrap: 'wrap', gap: '14px', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)' }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '900', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IoInformationCircleOutline size={22} />
                  {editingItem ? `Editando: ${editingItem.title}` : 'Crear Nuevo Curso / Workshop'}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                  Las secciones funcionan como dropdowns (acordeón) para que edites de forma enfocada sin hacer scroll por toda la pantalla.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setOpenSections({ card1: true, card2: true, card3: true, card4: true, card5: true })}
                  style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  ↓ Desplegar Todas
                </button>
                <button
                  type="button"
                  onClick={() => setOpenSections({ card1: false, card2: false, card3: false, card4: false, card5: false })}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  ↑ Contraer Todas
                </button>
              </div>
            </div>

            {/* ========================================================
                CARD 1: TIPO DE FORMACIÓN, TÍTULO Y CATEGORÍA
                ======================================================== */}
            <div style={{
              backgroundColor: openSections.card1 ? '#f8fafc' : '#ffffff',
              border: `1px solid ${openSections.card1 ? '#3b82f6' : '#cbd5e1'}`,
              borderRadius: '16px',
              padding: openSections.card1 ? '24px' : '16px 24px',
              marginBottom: '20px',
              transition: 'all 0.2s ease',
              boxShadow: openSections.card1 ? '0 8px 24px rgba(31, 117, 245, 0.06)' : '0 2px 6px rgba(0,0,0,0.02)'
            }}>
              <div
                onClick={() => toggleSection('card1')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  marginBottom: openSections.card1 ? '20px' : '0',
                  paddingBottom: openSections.card1 ? '16px' : '0',
                  borderBottom: openSections.card1 ? '1px solid #cbd5e1' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ backgroundColor: openSections.card1 ? '#1f75f5ff' : '#64748b', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800' }}>1</span>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Tipo de Formación, Título y Categoría
                    </h3>
                    {!openSections.card1 && (
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '2px', display: 'block' }}>
                        {cTitle ? `Resumen: [${cSubtype.toUpperCase()}] ${cTitle}` : 'Click para desplegar y editar título y tipo'}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: openSections.card1 ? '#1f75f5ff' : '#64748b', fontWeight: '800', fontSize: '13px' }}>
                  <span>{openSections.card1 ? 'Contraer' : 'Desplegar'}</span>
                  {openSections.card1 ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
                </div>
              </div>

              {openSections.card1 && (
                <div>
                  {/* Selector de Tipo (Curso o Workshop) */}
                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>¿Qué tipo de programa estás creando? *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                      <div
                        onClick={() => setCSubtype('course')}
                        style={{
                          border: `2px solid ${cSubtype === 'course' ? '#1f75f5ff' : '#cbd5e1'}`,
                          backgroundColor: cSubtype === 'course' ? '#eff6ff' : '#ffffff',
                          padding: '16px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}
                      >
                        <div style={{ fontSize: '24px', color: cSubtype === 'course' ? '#1f75f5ff' : '#64748b' }}>
                          <IoSchoolOutline />
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: cSubtype === 'course' ? '#1e3a8a' : '#0f172a' }}>Curso de Especialización</h4>
                          <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>Formación integral estructurada por módulos y lecciones de estudio.</p>
                        </div>
                      </div>

                      <div
                        onClick={() => setCSubtype('workshop')}
                        style={{
                          border: `2px solid ${cSubtype === 'workshop' ? '#1f75f5ff' : '#cbd5e1'}`,
                          backgroundColor: cSubtype === 'workshop' ? '#eff6ff' : '#ffffff',
                          padding: '16px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}
                      >
                        <div style={{ fontSize: '24px', color: cSubtype === 'workshop' ? '#1f75f5ff' : '#64748b' }}>
                          <IoConstructOutline />
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: cSubtype === 'workshop' ? '#1e3a8a' : '#0f172a' }}>Taller Práctico / Workshop</h4>
                          <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>Capacitación intensiva sobre una temática específica y aplicación biomecánica.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Título del Programa *</label>
                      <input
                        type="text"
                        className="premium-input"
                        value={cTitle}
                        onChange={(e) => setCTitle(e.target.value)}
                        placeholder={cSubtype === 'course' ? "Ej. Especialización en Hipertrofia y Biomecánica" : "Ej. Workshop: Selección de Ejercicios de Glúteos"}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label className="form-label" style={{ margin: 0 }}>Categoría *</label>
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
                          backgroundColor: '#ffffff',
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
                              placeholder="Ej. Glúteos y Piernas"
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

                      <select
                        className="premium-input"
                        value={cCategory}
                        onChange={(e) => setCCCategory(e.target.value)}
                        style={{ backgroundColor: '#ffffff', color: '#051020', cursor: 'pointer' }}
                        required
                      >
                        <option value="">Selecciona una Categoría...</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ backgroundColor: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd', marginTop: '24px' }}>
                    <label className="form-label" style={{ color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Enviar Notificación por Email
                    </label>
                    <p style={{ fontSize: '12px', color: '#0284c7', margin: '0 0 12px 0' }}>¿Deseas avisarle a los usuarios sobre este curso/workshop?</p>
                    <select
                      className="premium-input"
                      value={cNotifyUsers}
                      onChange={(e) => setCNotifyUsers(e.target.value)}
                      style={{ borderColor: '#7dd3fc', backgroundColor: '#fff' }}
                    >
                      <option value="none">No enviar</option>
                      <option value="all">A todos</option>
                      <option value="premium">A miembros </option>
                      {editingItem && <option value="enrolled">A usuarios inscriptos en este curso/workshop</option>}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: '20px 0 0 0' }}>
                    <label className="form-label">Descripción / Resumen de la Capacitación *</label>
                    <textarea
                      className="premium-input"
                      rows="3"
                      value={cDescription}
                      onChange={(e) => setCDescription(e.target.value)}
                      placeholder="Describe de qué trata esta formación, a quién va dirigida y qué aprenderá el alumno..."
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================
                CARD 2: ACCESO, PRECIO, DURACIÓN Y CERTIFICACIÓN
                ======================================================== */}
            <div style={{
              backgroundColor: openSections.card2 ? '#f8fafc' : '#ffffff',
              border: `1px solid ${openSections.card2 ? '#3b82f6' : '#cbd5e1'}`,
              borderRadius: '16px',
              padding: openSections.card2 ? '24px' : '16px 24px',
              marginBottom: '20px',
              transition: 'all 0.2s ease',
              boxShadow: openSections.card2 ? '0 8px 24px rgba(31, 117, 245, 0.06)' : '0 2px 6px rgba(0,0,0,0.02)'
            }}>
              <div
                onClick={() => toggleSection('card2')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  marginBottom: openSections.card2 ? '20px' : '0',
                  paddingBottom: openSections.card2 ? '16px' : '0',
                  borderBottom: openSections.card2 ? '1px solid #cbd5e1' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ backgroundColor: openSections.card2 ? '#1f75f5ff' : '#64748b', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800' }}>2</span>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Acceso, Precio, Duración y Certificación
                    </h3>
                    {!openSections.card2 && (
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '2px', display: 'block' }}>
                        {cAccessType === 'free' ? 'Acceso Libre (Gratuito)' : cAccessType === 'subscription' ? 'Membresía Premium (Suscritos)' : `Pago Único ($${cPriceUsd} USD)`} • {cDuration || 'Sin duración especificada'} • {cCertificate ? 'Certificado incluido' : 'Sin certificado'}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: openSections.card2 ? '#1f75f5ff' : '#64748b', fontWeight: '800', fontSize: '13px' }}>
                  <span>{openSections.card2 ? 'Contraer' : 'Desplegar'}</span>
                  {openSections.card2 ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
                </div>
              </div>

              {openSections.card2 && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
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

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Duración Total Estimada</label>
                      <input
                        type="text"
                        className="premium-input"
                        value={cDuration}
                        onChange={(e) => setCDuration(e.target.value)}
                        placeholder="Ej. 45 minutos / 4 módulos / 12 horas"
                      />
                    </div>
                  </div>

                  {cAccessType === 'one-time-purchase' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px', backgroundColor: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Precio en USD ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="premium-input"
                          value={cPriceUsd}
                          onChange={(e) => setCPriceUsd(parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          style={{ border: '1.5px solid #3b82f6' }}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Precio en ARS ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="premium-input"
                          value={cPriceArs}
                          onChange={(e) => setCPriceArs(parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          style={{ border: '1.5px solid #3b82f6' }}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">% Descuento Suscriptores</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="premium-input"
                          value={cMemberDiscountPercentage}
                          onChange={(e) => setCMemberDiscountPercentage(e.target.value)}
                          placeholder="Ej. 20 (20% OFF)"
                          style={{ border: '1.5px solid #3b82f6' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Switch de Certificación */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>¿Incluye Certificación Oficial?</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Si se activa, el alumno podrá descargar un certificado digital al completar las lecciones/exámenes.</p>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: cCertificate ? '#1f75f5ff' : '#64748b' }}>
                        {cCertificate ? 'Sí, incluye' : 'No incluye'}
                      </span>
                      <div
                        onClick={() => setCCertificate(!cCertificate)}
                        style={{
                          width: '48px',
                          height: '26px',
                          backgroundColor: cCertificate ? '#1f75f5ff' : '#cbd5e1',
                          borderRadius: '13px',
                          position: 'relative',
                          transition: 'background-color 0.2s ease',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          backgroundColor: '#ffffff',
                          borderRadius: '50%',
                          position: 'absolute',
                          top: '3px',
                          left: cCertificate ? '25px' : '3px',
                          transition: 'left 0.2s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                      </div>
                    </label>
                  </div>
                </div>
              )}
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
              marginBottom: '24px',
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
                      ? 'El curso/workshop será visible públicamente para los usuarios en el catálogo y su panel.'
                      : 'Guardado en borrador. No se mostrará al público ni en el listado de cursos hasta que actives la publicación.'}
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

            {/* ========================================================
                CARD 3: PORTADA VISUAL Y VIDEO INTRODUCTORIO
                ======================================================== */}
            <div style={{
              backgroundColor: openSections.card3 ? '#f8fafc' : '#ffffff',
              border: `1px solid ${openSections.card3 ? '#3b82f6' : '#cbd5e1'}`,
              borderRadius: '16px',
              padding: openSections.card3 ? '24px' : '16px 24px',
              marginBottom: '20px',
              transition: 'all 0.2s ease',
              boxShadow: openSections.card3 ? '0 8px 24px rgba(31, 117, 245, 0.06)' : '0 2px 6px rgba(0,0,0,0.02)'
            }}>
              <div
                onClick={() => toggleSection('card3')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  marginBottom: openSections.card3 ? '20px' : '0',
                  paddingBottom: openSections.card3 ? '16px' : '0',
                  borderBottom: openSections.card3 ? '1px solid #cbd5e1' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ backgroundColor: openSections.card3 ? '#1f75f5ff' : '#64748b', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800' }}>3</span>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Portada Visual y Video Introductorio
                    </h3>
                    {!openSections.card3 && (
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '2px', display: 'block' }}>
                        {cCardImage ? 'Imagen de portada cargada' : 'Sin imagen de portada'} • {cVideoLink ? 'Video introductorio cargado' : 'Sin video introductorio'}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: openSections.card3 ? '#1f75f5ff' : '#64748b', fontWeight: '800', fontSize: '13px' }}>
                  <span>{openSections.card3 ? 'Contraer' : 'Desplegar'}</span>
                  {openSections.card3 ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
                </div>
              </div>

              {openSections.card3 && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Imagen de Portada (Card Image)</label>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleCardImageUpload}
                        style={{ display: 'block', margin: '8px 0' }}
                      />
                      {cardImageUploading && <p style={{ fontSize: '12px', color: '#051020', fontWeight: 'bold' }}>Subiendo imagen de portada...</p>}
                      {cCardImage && (
                        <div style={{ marginTop: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label className="form-label" style={{ margin: 0 }}>Previsualización de Portada</label>
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
                              Eliminar Portada
                            </button>
                          </div>
                          <div style={{
                            width: '100%',
                            height: '180px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid #cbd5e1',
                            position: 'relative'
                          }}>
                            <img
                              src={cCardImage}
                              alt="Previsualización Portada"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: `50% ${cCardImagePosition}`
                              }}
                            />
                          </div>
                          <div style={{ marginTop: '12px', backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>
                              Encuadre Vertical del Rostro / Elemento ({cCardImagePosition})
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={parseInt(cCardImagePosition) || 50}
                              onChange={(e) => setCCardImagePosition(`${e.target.value}%`)}
                              style={{ width: '100%', cursor: 'pointer' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              <span>Arriba (0%)</span>
                              <span>Centro (50%)</span>
                              <span>Abajo (100%)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Video de Introducción o Presentación (Opcional)</label>
                      <input
                        type="text"
                        className="premium-input"
                        placeholder="Ej. https://www.youtube.com/watch?v=... o https://vimeo.com/..."
                        value={cVideoLink}
                        onChange={(e) => setCVideoLink(e.target.value)}
                      />
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 0 0' }}>
                        Se mostrará en la cabecera de la capacitación como presentación del curso antes de que el usuario comience con los módulos.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================
                CARD 4: PLAN DE ESTUDIOS Y MÓDULOS (ESTILO SKOOL)
                ======================================================== */}
            <div style={{
              backgroundColor: openSections.card4 ? '#ffffff' : '#f8fafc',
              border: `2px solid ${openSections.card4 ? '#1f75f5ff' : '#cbd5e1'}`,
              borderRadius: '16px',
              padding: openSections.card4 ? '24px' : '18px 24px',
              marginBottom: '30px',
              transition: 'all 0.2s ease',
              boxShadow: openSections.card4 ? '0 12px 30px rgba(31, 117, 245, 0.08)' : '0 2px 6px rgba(0,0,0,0.02)'
            }}>
              <div
                onClick={() => toggleSection('card4')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  marginBottom: openSections.card4 ? '20px' : '0',
                  paddingBottom: openSections.card4 ? '16px' : '0',
                  borderBottom: openSections.card4 ? '1px solid #e2e8f0' : 'none',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 300px' }}>
                  <span style={{ backgroundColor: openSections.card4 ? '#1f75f5ff' : '#64748b', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800' }}>4</span>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Plan de Estudios y Módulos
                    </h3>
                    {openSections.card4 ? (
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Estructura las clases por módulos y lecciones a la izquierda, y edita el contenido del ítem seleccionado a la derecha.</p>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#1f75f5ff', fontWeight: '700', marginTop: '2px', display: 'block' }}>
                        {cModules.length === 0 ? 'Sin módulos aún • Click para expandir y agregar módulos' : `${cModules.length} módulo(s) configurado(s) • Click para desplegar plan de estudios`}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {openSections.card4 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleAddModule(); }}
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      + Agregar Módulo
                    </button>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: openSections.card4 ? '#1f75f5ff' : '#64748b', fontWeight: '800', fontSize: '13px' }}>
                    <span>{openSections.card4 ? 'Contraer' : 'Desplegar'}</span>
                    {openSections.card4 ? <IoChevronUp size={22} /> : <IoChevronDown size={22} />}
                  </div>
                </div>
              </div>

              {openSections.card4 && (
                <div>

                  {cModules.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed #cbd5e1', borderRadius: '12px', color: '#64748b' }}>
                      Aún no has creado ningún módulo. Haz clic en <strong>+ Agregar Módulo</strong> para comenzar a construir el plan de estudios.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
                      {/* Top Column: Module & Lesson Tree */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto', paddingRight: '4px', width: '100%' }}>
                        {cModules.map((mod, modIdx) => (
                          <div key={mod.id} style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
                              <input
                                type="text"
                                value={mod.title}
                                onChange={(e) => handleUpdateModule(mod.id, { title: e.target.value })}
                                className="premium-input"
                                style={{ fontWeight: '800', fontSize: '14px', height: '36px', flex: 1 }}
                                placeholder="Nombre del Módulo"
                              />
                              <button
                                type="button"
                                onClick={() => handleDeleteModule(mod.id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', padding: '4px', display: 'flex', alignItems: 'center' }}
                                title="Eliminar módulo"
                              >
                                <IoTrashOutline size={18} />
                              </button>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                              <textarea
                                value={mod.description || ''}
                                onChange={(e) => handleUpdateModule(mod.id, { description: e.target.value })}
                                className="premium-input"
                                rows={2}
                                style={{ fontSize: '13px', width: '100%', resize: 'vertical', padding: '8px 12px', color: '#334155', minHeight: '48px' }}
                                placeholder="Descripción o temario del módulo que se mostrará en el plan de estudios..."
                              />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '12px', borderLeft: '2px solid #e2e8f0' }}>
                              {mod.lessons && mod.lessons.map((les) => {
                                const isSelected = activeEditingLessonId && activeEditingLessonId.lessonId === les.id;
                                return (
                                  <div
                                    key={les.id}
                                    onClick={() => setActiveEditingLessonId({ moduleId: mod.id, lessonId: les.id })}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '10px 14px',
                                      borderRadius: '8px',
                                      backgroundColor: isSelected ? '#1f75f5ff' : '#ffffff',
                                      color: isSelected ? '#ffffff' : '#0f172a',
                                      border: '1px solid #e2e8f0',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                      <span style={{ display: 'flex', alignItems: 'center' }}>
                                        {les.type === 'quiz' ? <IoDocumentTextOutline size={16} /> : <IoPlayCircleOutline size={16} />}
                                      </span>
                                      <span style={{ fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {les.title || 'Sin título'}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleDeleteLesson(mod.id, les.id); }}
                                      style={{ background: 'none', border: 'none', color: isSelected ? '#ffffff' : '#ef4444', cursor: 'pointer', fontSize: '14px', padding: '2px', display: 'flex', alignItems: 'center' }}
                                      title="Eliminar ítem"
                                    >
                                      <IoClose size={16} />
                                    </button>
                                  </div>
                                );
                              })}

                              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleAddLesson(mod.id, 'lesson')}
                                  style={{ flex: 1, background: '#ffffff', border: '1px dashed #cbd5e1', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', color: '#1f75f5ff', cursor: 'pointer' }}
                                >
                                  + Lección
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddLesson(mod.id, 'quiz')}
                                  style={{ flex: 1, background: '#ffffff', border: '1px dashed #cbd5e1', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', color: '#d97706', cursor: 'pointer' }}
                                >
                                  + Examen
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Column: Selected Lesson / Quiz Editor */}
                      <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', backgroundColor: '#ffffff', minHeight: '380px', width: '100%' }}>
                        {!activeEditingLessonId ? (
                          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                            Selecciona una lección o evaluación en la parte superior para editar su contenido (videos, texto enriquecido y recursos descargables).
                          </div>
                        ) : (() => {
                          const mod = cModules.find(m => m.id === activeEditingLessonId.moduleId);
                          const les = mod ? mod.lessons.find(l => l.id === activeEditingLessonId.lessonId) : null;
                          if (!les) return <div style={{ color: '#64748b' }}>El ítem seleccionado ya no existe.</div>;

                          return (
                            <div>
                              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
                                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    {les.type === 'quiz' ? <><IoDocumentTextOutline size={20} color="#d97706" /> Evaluación</> : <><IoPlayCircleOutline size={20} color="#1f75f5ff" /> Lección</>}
                                  </span> • <span style={{ color: '#1f75f5ff' }}>{les.title || 'Sin título'}</span>
                                </h4>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                  <label className="form-label">Título del Ítem</label>
                                  <input
                                    type="text"
                                    value={les.title}
                                    onChange={(e) => handleUpdateLesson(mod.id, les.id, { title: e.target.value })}
                                    className="premium-input"
                                    placeholder="Ej. Lección 1: Introducción biomecánica"
                                  />
                                </div>

                                <div className="form-group" style={{ margin: 0 }}>
                                  <label className="form-label">Duración Estimada</label>
                                  <input
                                    type="text"
                                    value={les.duration}
                                    onChange={(e) => handleUpdateLesson(mod.id, les.id, { duration: e.target.value })}
                                    className="premium-input"
                                    placeholder="Ej. 15 min"
                                  />
                                </div>
                              </div>

                              {les.type === 'quiz' ? (
                                <div style={{ marginTop: '24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px' }}>

                                  {/* ENCABEZADO Y CONFIGURACIÓN GENERAL DEL EXAMEN */}
                                  <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '20px', marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <IoCheckmarkCircleOutline size={22} color="#d97706" />
                                      Configuración de la Evaluación (Multiple Choice)
                                    </h3>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                                      <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Puntaje Mínimo de Aprobación (%)</label>
                                        <input
                                          type="number"
                                          min="10"
                                          max="100"
                                          value={les.passingScore || 70}
                                          onChange={(e) => handleUpdateLesson(mod.id, les.id, { passingScore: parseInt(e.target.value) || 70 })}
                                          className="premium-input"
                                          style={{ fontWeight: '800', color: '#d97706' }}
                                        />
                                        <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                                          Porcentaje de respuestas correctas para aprobar el módulo.
                                        </span>
                                      </div>

                                      <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Instrucciones / Descripción del Examen</label>
                                        <input
                                          type="text"
                                          value={les.description || ''}
                                          onChange={(e) => handleUpdateLesson(mod.id, les.id, { description: e.target.value })}
                                          className="premium-input"
                                          placeholder="Ej. Responde correctamente cada pregunta para desbloquear la siguiente clase."
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* LISTADO DE PREGUNTAS */}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <IoListOutline size={20} color="#1f75f5" />
                                      Preguntas Configuradas ({(les.questions || []).length})
                                    </h4>
                                    <button
                                      type="button"
                                      onClick={() => handleAddQuestionToLesson(mod.id, les.id)}
                                      style={{
                                        backgroundColor: '#1f75f5',
                                        color: '#ffffff',
                                        border: 'none',
                                        padding: '10px 18px',
                                        borderRadius: '12px',
                                        fontWeight: '800',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        boxShadow: '0 4px 12px rgba(31, 117, 245, 0.3)'
                                      }}
                                    >
                                      <IoAdd size={18} /> Agregar Pregunta
                                    </button>
                                  </div>

                                  {(les.questions || []).length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                      <IoHelpCircleOutline size={48} color="#94a3b8" style={{ marginBottom: '12px' }} />
                                      <h5 style={{ fontSize: '16px', fontWeight: '800', color: '#334155', margin: '0 0 8px 0' }}>
                                        No hay preguntas creadas
                                      </h5>
                                      <p style={{ color: '#64748b', fontSize: '13px', maxWidth: '420px', margin: '0 auto 18px auto' }}>
                                        Haz clic en el botón para agregar tu primera pregunta de opción múltiple a esta evaluación.
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => handleAddQuestionToLesson(mod.id, les.id)}
                                        className="btn-primary"
                                        style={{ padding: '10px 20px', fontSize: '13px' }}
                                      >
                                        + Crear Primera Pregunta
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                      {(les.questions || []).map((q, qIdx) => (
                                        <div
                                          key={q.id || qIdx}
                                          style={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '16px',
                                            padding: '20px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                                            position: 'relative'
                                          }}
                                        >
                                          {/* Cabecera de la Pregunta */}
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '16px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '900', color: '#1f75f5', backgroundColor: '#eff6ff', padding: '4px 12px', borderRadius: '8px' }}>
                                              Pregunta #{qIdx + 1}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteQuestionFromLesson(mod.id, les.id, q.id)}
                                              style={{
                                                backgroundColor: '#fef2f2',
                                                color: '#ef4444',
                                                border: '1px solid #fecaca',
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                              }}
                                            >
                                              <IoTrashOutline /> Eliminar Pregunta
                                            </button>
                                          </div>

                                          {/* Enunciado */}
                                          <div className="form-group" style={{ marginBottom: '18px' }}>
                                            <label className="form-label" style={{ fontWeight: '800' }}>Enunciado de la Pregunta</label>
                                            <input
                                              type="text"
                                              value={q.questionText || ''}
                                              onChange={(e) => handleUpdateLessonQuestion(mod.id, les.id, q.id, { questionText: e.target.value })}
                                              className="premium-input"
                                              placeholder="Ej. ¿Cuál es el principal motor flexor de la cadera en el sprint?"
                                            />
                                          </div>

                                          {/* Opciones de Respuesta */}
                                          <div style={{ marginBottom: '18px' }}>
                                            <label className="form-label" style={{ fontWeight: '800', marginBottom: '10px', display: 'block' }}>
                                              Opciones de Respuesta (Selecciona la opción correcta haciendo clic en el círculo o botón)
                                            </label>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                              {(q.options || []).map((opt, optIdx) => {
                                                const isCorrect = q.correctOptionIndex === optIdx;
                                                return (
                                                  <div
                                                    key={optIdx}
                                                    style={{
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      gap: '10px',
                                                      backgroundColor: isCorrect ? '#ecfdf5' : '#f8fafc',
                                                      border: `2px solid ${isCorrect ? '#10b981' : '#e2e8f0'}`,
                                                      padding: '10px 14px',
                                                      borderRadius: '12px',
                                                      transition: 'all 0.15s ease'
                                                    }}
                                                  >
                                                    {/* Botón de Respuesta Correcta */}
                                                    <button
                                                      type="button"
                                                      onClick={() => handleUpdateLessonQuestion(mod.id, les.id, q.id, { correctOptionIndex: optIdx })}
                                                      style={{
                                                        backgroundColor: isCorrect ? '#10b981' : '#ffffff',
                                                        color: isCorrect ? '#ffffff' : '#64748b',
                                                        border: `2px solid ${isCorrect ? '#10b981' : '#cbd5e1'}`,
                                                        borderRadius: '8px',
                                                        padding: '6px 12px',
                                                        fontSize: '11px',
                                                        fontWeight: '800',
                                                        cursor: 'pointer',
                                                        whiteSpace: 'nowrap',
                                                        transition: 'all 0.15s ease'
                                                      }}
                                                      title="Marcar como respuesta correcta"
                                                    >
                                                      {isCorrect ? '✓ Correcta' : 'Marcar Correcta'}
                                                    </button>

                                                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#475569', minWidth: '22px' }}>
                                                      {String.fromCharCode(65 + optIdx)})
                                                    </span>

                                                    <input
                                                      type="text"
                                                      value={opt}
                                                      onChange={(e) => handleUpdateOptionInQuestion(mod.id, les.id, q.id, optIdx, e.target.value)}
                                                      className="premium-input"
                                                      style={{ margin: 0, padding: '8px 12px', fontSize: '14px', flex: 1 }}
                                                      placeholder={`Escribe el texto para la Opción ${String.fromCharCode(65 + optIdx)}...`}
                                                    />

                                                    <button
                                                      type="button"
                                                      onClick={() => handleDeleteOptionFromQuestion(mod.id, les.id, q.id, optIdx)}
                                                      style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#94a3b8',
                                                        fontSize: '18px',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                      }}
                                                      title="Eliminar esta opción"
                                                    >
                                                      ×
                                                    </button>
                                                  </div>
                                                );
                                              })}
                                            </div>

                                            <button
                                              type="button"
                                              onClick={() => handleAddOptionToQuestion(mod.id, les.id, q.id)}
                                              style={{
                                                marginTop: '10px',
                                                backgroundColor: '#ffffff',
                                                color: '#1f75f5',
                                                border: '1px dashed #3b82f6',
                                                padding: '8px 14px',
                                                borderRadius: '10px',
                                                fontSize: '12px',
                                                fontWeight: '800',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                              }}
                                            >
                                              + Añadir otra opción
                                            </button>
                                          </div>

                                          {/* Explicación / Justificación */}
                                          <div className="form-group" style={{ margin: 0 }}>
                                            <label className="form-label" style={{ fontSize: '12px', color: '#475569' }}>
                                              💡 Explicación de la Respuesta Correcta (Opcional - se muestra al alumno al calificar)
                                            </label>
                                            <input
                                              type="text"
                                              value={q.explanation || ''}
                                              onChange={(e) => handleUpdateLessonQuestion(mod.id, les.id, q.id, { explanation: e.target.value })}
                                              className="premium-input"
                                              style={{ fontSize: '13px' }}
                                              placeholder="Ej. La opción correcta es B porque la articulación coxofemoral..."
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <div className="form-group" style={{ marginBottom: '24px' }}>
                                    <label className="form-label">Enlace de Video (YouTube / Vimeo / Cloudinary)</label>
                                    <input
                                      type="url"
                                      value={les.videoLink || ''}
                                      onChange={(e) => handleUpdateLesson(mod.id, les.id, { videoLink: e.target.value })}
                                      className="premium-input"
                                      placeholder="https://youtube.com/watch?v=..."
                                    />
                                  </div>

                                  <div className="form-group" style={{ marginBottom: '24px' }}>
                                    <label className="form-label" style={{ marginBottom: '10px' }}>Contenido de Texto / Apuntes de la Lección</label>
                                    <div style={{ minHeight: '320px' }}>
                                      <TiptapEditor
                                        content={les.body || ''}
                                        onChange={(html) => handleUpdateLesson(mod.id, les.id, { body: html })}
                                        placeholder="Escribe aquí notas adicionales, explicaciones, inserta videos o imágenes y puntos clave..."
                                      />
                                    </div>
                                  </div>

                                  {/* SECCIÓN DE RECURSOS DESCARGABLES DE LA LECCIÓN */}
                                  <div style={{ marginTop: '30px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px' }}>
                                    <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '16px', marginBottom: '20px' }}>
                                      <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <IoFolderOpen size={20} color="#1f75f5" />
                                        Recursos Descargables para esta Lección
                                      </h3>
                                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                                        Sube archivos PDF, documentos o añade enlaces de descarga (Drive, Dropbox) para que el alumno pueda acceder desde la pestaña "Recursos Descargables".
                                      </p>
                                    </div>

                                    {/* Lista de Recursos Existentes */}
                                    {(les.attachments || []).length > 0 ? (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                          Archivos adjuntos actuales ({(les.attachments || []).length}):
                                        </label>
                                        {(les.attachments || []).map((att, attIdx) => (
                                          <div
                                            key={attIdx}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              padding: '12px 16px',
                                              backgroundColor: '#ffffff',
                                              border: '1px solid #cbd5e1',
                                              borderRadius: '12px',
                                              gap: '12px'
                                            }}
                                          >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#051020', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <IoDownloadOutline size={18} />
                                              </div>
                                              <div style={{ overflow: 'hidden' }}>
                                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                  {att.title}
                                                </div>
                                                <a href={att.url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#1f75f5', textDecoration: 'underline', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                                                  {att.url}
                                                </a>
                                              </div>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updated = (les.attachments || []).filter((_, idx) => idx !== attIdx);
                                                handleUpdateLesson(mod.id, les.id, { attachments: updated });
                                              }}
                                              style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                padding: '6px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                borderRadius: '6px'
                                              }}
                                              title="Eliminar este recurso"
                                            >
                                              <IoTrashOutline size={18} />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div style={{ padding: '16px', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>
                                        No hay recursos descargables adjuntos a esta lección todavía.
                                      </div>
                                    )}

                                    {/* Botones y Formulario de Agregar Recurso */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                      {/* Subida Directa de Archivo */}
                                      <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #cbd5e1' }}>
                                        <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <IoCloudUploadOutline size={16} color="#1f75f5" />
                                          Subir Archivo al Servidor (PDF, Doc, ZIP)
                                        </h4>
                                        <input
                                          type="file"
                                          id={`attachment-file-${les.id}`}
                                          style={{ display: 'none' }}
                                          onChange={(e) => handleLessonAttachmentUpload(e, mod.id, les.id, les.attachments || [])}
                                          disabled={lessonAttachmentUploading}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => document.getElementById(`attachment-file-${les.id}`).click()}
                                          disabled={lessonAttachmentUploading}
                                          style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            backgroundColor: '#051020',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontWeight: '800',
                                            fontSize: '13px',
                                            cursor: lessonAttachmentUploading ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                          }}
                                        >
                                          <IoCloudUploadOutline size={18} />
                                          {lessonAttachmentUploading ? 'Subiendo archivo...' : '+ Seleccionar y Subir Archivo'}
                                        </button>
                                      </div>

                                      {/* Enlace Externo */}
                                      <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid #cbd5e1' }}>
                                        <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <IoLinkOutline size={16} color="#1f75f5" />
                                          O Agregar Enlace Externo (Drive, Dropbox, etc.)
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                          <input
                                            type="text"
                                            value={newAttTitle}
                                            onChange={(e) => setNewAttTitle(e.target.value)}
                                            placeholder="Título (Ej. Temario en PDF)"
                                            className="premium-input"
                                            style={{ padding: '8px 12px', fontSize: '13px' }}
                                          />
                                          <input
                                            type="url"
                                            value={newAttUrl}
                                            onChange={(e) => setNewAttUrl(e.target.value)}
                                            placeholder="https://drive.google.com/..."
                                            className="premium-input"
                                            style={{ padding: '8px 12px', fontSize: '13px' }}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => handleAddCustomAttachment(mod.id, les.id, les.attachments || [])}
                                            style={{
                                              padding: '10px 14px',
                                              backgroundColor: '#1f75f5',
                                              color: '#ffffff',
                                              border: 'none',
                                              borderRadius: '10px',
                                              fontWeight: '800',
                                              fontSize: '13px',
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              gap: '6px'
                                            }}
                                          >
                                            <IoAdd size={18} /> Añadir Enlace a Recursos
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ========================================================
                CARD 5: NOTIFICACIONES PROGRESIVAS A ALUMNOS
                ======================================================== */}
            {editingItem && (
              <div style={{
                backgroundColor: openSections.card5 ? '#fefeef' : '#ffffff',
                border: `1px solid ${openSections.card5 ? '#ca8a04' : '#fde047'}`,
                borderRadius: '16px',
                padding: openSections.card5 ? '24px' : '16px 24px',
                marginBottom: '24px',
                transition: 'all 0.2s ease',
                boxShadow: openSections.card5 ? '0 8px 24px rgba(202, 138, 4, 0.08)' : '0 2px 6px rgba(0,0,0,0.02)'
              }}>
                <div
                  onClick={() => toggleSection('card5')}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    marginBottom: openSections.card5 ? '20px' : '0',
                    paddingBottom: openSections.card5 ? '16px' : '0',
                    borderBottom: openSections.card5 ? '1px solid #fef08a' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ backgroundColor: openSections.card5 ? '#ca8a04' : '#a16207', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800' }}>5</span>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#854d0e', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IoNotificationsOutline size={20} color="#ca8a04" />
                        Notificar a Alumnos sobre Nuevas Lecciones / Contenido
                      </h3>
                      {!openSections.card5 && (
                        <span style={{ fontSize: '12px', color: '#a16207', fontWeight: '600', marginTop: '2px', display: 'block' }}>
                          Click para desplegar y enviar una alerta por correo / plataforma a los alumnos del curso
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: openSections.card5 ? '#ca8a04' : '#a16207', fontWeight: '800', fontSize: '13px' }}>
                    <span>{openSections.card5 ? 'Contraer' : 'Desplegar'}</span>
                    {openSections.card5 ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
                  </div>
                </div>

                {openSections.card5 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: '1 1 300px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#854d0e', margin: '0 0 6px 0' }}>
                        ¿Subiste un nuevo módulo o lección a este curso?
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#a16207', lineHeight: '1.4' }}>
                        Envía una notificación instantánea y alerta en la plataforma a todos los alumnos que tienen acceso a este curso para avisarles de las nuevas clases disponibles.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNotifyTitle(`¡Nuevo contenido en: ${editingItem.title}!`);
                        setNotifyMessage('Hemos agregado nuevas lecciones y material al curso. ¡Entra ahora para continuar tu aprendizaje!');
                        setShowNotifyModal(true);
                      }}
                      style={{
                        backgroundColor: '#ca8a04',
                        color: '#ffffff',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        fontWeight: '800',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(202, 138, 4, 0.3)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <IoSend size={16} /> Notificar a Alumnos
                    </button>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitLoading}
                style={{ flex: '1 1 auto', minWidth: '200px' }}
              >
                {submitLoading ? 'Guardando...' : editingItem ? 'Actualizar Workshop/Curso' : 'Crear Workshop/Curso'}
              </button>
              <button
                type="button"
                onClick={resetContentForm}
                className="btn-secondary"
                style={{ flex: '0 1 auto' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Filter bar for Workshops and Courses */}
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
              placeholder="Buscar por título o descripción..."
              value={adminWorkshopSearchText}
              onChange={(e) => setAdminWorkshopSearchText(e.target.value)}
              className="premium-input"
              style={{ height: '40px', fontSize: '13px', padding: '8px 12px' }}
            />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <select
              value={adminWorkshopCategory}
              onChange={(e) => setAdminWorkshopCategory(e.target.value)}
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
              value={adminWorkshopAccess}
              onChange={(e) => setAdminWorkshopAccess(e.target.value)}
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

        {/* LIST SECTION: WORKSHOPS & COURSES */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
            Cargando cursos y workshops...
          </div>
        ) : error ? (
          <div style={{ color: '#ef4444', fontWeight: 'bold', textAlign: 'center', padding: '20px' }}>
            {error}
          </div>
        ) : filteredContents.length === 0 ? (
          <div style={{ padding: '40px', border: '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'center', backgroundColor: '#ffffff' }}>
            No se encontraron cursos ni workshops en esta sección.
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#2B2D2F' }}>{c.title}</h4>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      backgroundColor: c.isPublished !== false && c.status !== 'draft' ? '#ecfdf5' : '#fffbeb',
                      color: c.isPublished !== false && c.status !== 'draft' ? '#059669' : '#d97706',
                      border: `1px solid ${c.isPublished !== false && c.status !== 'draft' ? '#6ee7b7' : '#fcd34d'}`
                    }}>
                      {c.isPublished !== false && c.status !== 'draft' ? '🟢 Publicado' : '🟡 Borrador Oculto'}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    Acceso: <strong style={{ textTransform: 'uppercase' }}>{c.accessType === 'free' ? 'Acceso Libre' : c.accessType === 'subscription' ? 'Membresía' : `Pago Único (USD $${c.priceUsd !== undefined ? c.priceUsd : (c.price || 0)} / ARS $${(c.priceArs || 0).toLocaleString()})`}</strong>
                    {c.category && ` • Categoría: ${typeof c.category === 'object' ? c.category.name : categories.find(cat => cat._id === c.category)?.name || 'Especialización'}`}
                    {` • Tipo: ${c.contentType === 'workshop' ? 'Taller / Workshop' : 'Curso de Especialización'}`}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setEditingItem(c);
                      setNotifyTitle(`¡Nuevo contenido en: ${c.title}!`);
                      setNotifyMessage('Hemos subido nuevas lecciones y material para que continúes tu formación.');
                      setShowNotifyModal(true);
                    }}
                    style={{
                      backgroundColor: '#ca8a04',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontWeight: '800',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    title="Notificar a los alumnos que tienen este curso"
                  >
                    <IoNotificationsOutline size={15} /> Notificar Alumnos
                  </button>
                  <button
                    onClick={() => startEditContent(c)}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center' }}
                  >
                    <IoPencil style={{ marginRight: '6px', fontSize: '14px' }} /> Editar
                  </button>
                  <button
                    onClick={() => handleDeleteContent(c._id)}
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

      {/* Modal para Enviar Notificación Progresiva a Alumnos */}
      {showNotifyModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '30px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IoNotificationsOutline size={22} color="#ca8a04" /> Notificar a los Alumnos
              </h3>
              <button
                type="button"
                onClick={() => setShowNotifyModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '20px' }}
              >
                <IoClose />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: '1.5' }}>
              Esta alerta se enviará directamente a la plataforma para todos los alumnos que tienen acceso al curso <strong>{editingItem?.title}</strong>. Puedes usarlo cuando subes un nuevo módulo, lección o material de estudio progresivo.
            </p>
            <form onSubmit={handleNotifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '6px' }}>Título de la Notificación *</label>
                <input
                  type="text"
                  className="premium-input"
                  value={notifyTitle}
                  onChange={(e) => setNotifyTitle(e.target.value)}
                  placeholder="Ej: ¡Nuevo Módulo Disponible!"
                  required
                />
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: '6px' }}>Mensaje para el Alumno *</label>
                <textarea
                  className="premium-input"
                  rows={4}
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  placeholder="Ej: Hemos publicado la Lección 3 sobre Evaluación Práctica. ¡Accede ahora para continuar con el curso!"
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={notifyingLoading}
                  style={{
                    flex: 1,
                    backgroundColor: '#1f75f5ff',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {notifyingLoading ? 'Enviando alerta...' : <><IoSend /> Enviar Notificación Ahora</>}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotifyModal(false)}
                  className="btn-secondary"
                  style={{ padding: '12px 20px', fontSize: '14px' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWorkshopsTab;

