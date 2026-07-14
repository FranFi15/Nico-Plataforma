import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  IoVideocamOutline,
  IoCalendarOutline,
  IoAddCircleOutline,
  IoTrashOutline,
  IoPencilOutline,
  IoPeopleOutline,
  IoNotificationsOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoOpenOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCloseOutline,
  IoNewspaperOutline
} from 'react-icons/io5';

const AdminZoomTab = ({ formMessage, setFormMessage }) => {
  const [events, setEvents] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [selectedListFilter, setSelectedListFilter] = useState('all'); // 'all' | 'zooms' | 'news'

  // Current month displayed in calendar
  const [currentDate, setCurrentDate] = useState(new Date());

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [type, setType] = useState('zoom'); // 'zoom' | 'news'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [zoomUrl, setZoomUrl] = useState('');
  const [eventDateInput, setEventDateInput] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [targetCourseId, setTargetCourseId] = useState('');
  const [sendNotification, setSendNotification] = useState(true);

  // Fetch Zoom Events and Courses
  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, contentRes] = await Promise.all([
        api.get('/zoomevents'),
        api.get('/content')
      ]);
      setEvents(eventsRes.data || []);
      const rawCourses = Array.isArray(contentRes.data) ? contentRes.data : (contentRes.data?.data || []);
      const courses = rawCourses.filter(
        c => c.contentType === 'course' || c.contentType === 'workshop'
      );
      setCoursesList(courses);
    } catch (err) {
      console.error('Error fetching zoom events:', err);
      if (setFormMessage) setFormMessage('Error al cargar las charlas de Zoom');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format date for datetime-local input
  const formatForInput = (dateObj) => {
    const d = new Date(dateObj);
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Open Add Modal
  const handleOpenAdd = (selectedDayDate = null) => {
    setEditingEvent(null);
    setType('zoom');
    setTitle('');
    setDescription('');
    setZoomUrl('');
    if (selectedDayDate) {
      const d = new Date(selectedDayDate);
      d.setHours(19, 0, 0, 0); // Default 19:00 HS
      setEventDateInput(formatForInput(d));
    } else {
      const d = new Date();
      d.setHours(19, 0, 0, 0);
      setEventDateInput(formatForInput(d));
    }
    setTargetAudience('all');
    setTargetCourseId('');
    setSendNotification(true);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (ev) => {
    setEditingEvent(ev);
    setType(ev.type || 'zoom');
    setTitle(ev.title || '');
    setDescription(ev.description || '');
    setZoomUrl(ev.zoomUrl || '');
    setEventDateInput(ev.eventDate ? formatForInput(ev.eventDate) : '');
    setTargetAudience(ev.targetAudience || 'all');
    setTargetCourseId(ev.targetCourseId?._id || ev.targetCourseId || '');
    setSendNotification(false); // Default false when editing unless checked
    setShowModal(true);
  };

  // Save Event
  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor ingresa un título');
      return;
    }

    if (type === 'zoom' && (!zoomUrl.trim() || !eventDateInput)) {
      alert('Para programar una Charla Zoom, el enlace y la fecha de reunión son obligatorios');
      return;
    }

    if (targetAudience === 'specific_course' && !targetCourseId) {
      alert('Por favor selecciona el curso específico al que deseas invitar y notificar');
      return;
    }

    setSaving(true);
    if (setFormMessage) setFormMessage('');

    try {
      const payload = {
        type,
        title: title.trim(),
        description: description.trim(),
        zoomUrl: type === 'zoom' ? zoomUrl.trim() : '',
        eventDate: eventDateInput ? new Date(eventDateInput).toISOString() : new Date().toISOString(),
        targetAudience,
        targetCourseId: targetAudience === 'specific_course' ? targetCourseId : null,
        sendNotification
      };

      if (editingEvent) {
        const res = await api.put(`/zoomevents/${editingEvent._id}`, payload);
        if (res.data?.success) {
          if (setFormMessage) setFormMessage('Charla Zoom actualizada con éxito');
          setShowModal(false);
          fetchData();
        }
      } else {
        const res = await api.post('/zoomevents', payload);
        if (res.data?.success) {
          if (setFormMessage) setFormMessage(res.data.message || 'Charla Zoom agendada con éxito');
          setShowModal(false);
          fetchData();
        }
      }
    } catch (err) {
      console.error('Error saving zoom event:', err);
      alert(err.response?.data?.message || 'Error al guardar la charla de Zoom');
    } finally {
      setSaving(false);
    }
  };

  // Delete Event
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta charla Zoom programada?')) return;
    try {
      await api.delete(`/zoomevents/${id}`);
      if (setFormMessage) setFormMessage('Charla Zoom eliminada con éxito');
      setEvents(events.filter(e => e._id !== id));
    } catch (err) {
      console.error('Error deleting zoom event:', err);
      alert('Error al eliminar el evento');
    }
  };

  // Audience Label Helper
  const getAudienceBadge = (ev) => {
    switch (ev.targetAudience) {
      case 'all':
        return { label: 'Todos los Usuarios', color: '#3b82f6', bg: '#eff6ff' };
      case 'members':
        return { label: 'Miembros Premium', color: '#8b5cf6', bg: '#f5f3ff' };
      case 'courses':
        return { label: 'Alumnos en Cursos', color: '#10b981', bg: '#ecfdf5' };
      case 'specific_course':
        const courseTitle = ev.targetCourseId?.title || 'Curso Específico';
        return { label: `Curso: ${courseTitle}`, color: '#f59e0b', bg: '#fffbeb' };
      default:
        return { label: 'General', color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust so Monday is day 0 (in JS getDay(): Sun=0, Mon=1...)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Group events by day string "YYYY-MM-DD"
  const eventsByDay = {};
  events.forEach(ev => {
    if (!ev.eventDate) return;
    const d = new Date(ev.eventDate);
    const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!eventsByDay[dayKey]) eventsByDay[dayKey] = [];
    eventsByDay[dayKey].push(ev);
  });

  const renderEventCard = (ev) => {
    const badge = getAudienceBadge(ev);
    const evDateObj = new Date(ev.eventDate || ev.createdAt);
    const formattedDate = evDateObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const formattedTime = evDateObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div
        key={ev._id}
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{
              backgroundColor: ev.type === 'news' ? '#ecfdf5' : '#eff6ff',
              color: ev.type === 'news' ? '#065f46' : '#1e3a8a',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '800',
              border: `1px solid ${ev.type === 'news' ? '#10b981' : '#3b82f6'}30`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {ev.type === 'news' ? <IoNewspaperOutline size={14} /> : <IoVideocamOutline size={14} />}
              {ev.type === 'news' ? 'Noticia / Anuncio' : 'Charla Zoom'}
            </span>

            <span style={{
              backgroundColor: badge.bg,
              color: badge.color,
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '800',
              border: `1px solid ${badge.color}30`
            }}>
              {badge.label}
            </span>

            {ev.notifiedCount > 0 && (
              <span style={{
                backgroundColor: '#fef3c7',
                color: '#d97706',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <IoNotificationsOutline size={14} /> Notificados: {ev.notifiedCount} alumnos
              </span>
            )}
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0' }}>
            {ev.title}
          </h3>

          {ev.description && (
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 12px 0', lineHeight: '1.5' }}>
              {ev.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#475569', fontWeight: '700' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IoCalendarOutline size={16} color="#64748b" /> {formattedDate}
            </span>
            {ev.type !== 'news' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IoTimeOutline size={16} color="#64748b" /> {formattedTime} hs
              </span>
            )}
            {ev.zoomUrl && (
              <a
                href={ev.zoomUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#1f75f5ff', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
              >
                Enlace / Más Info <IoOpenOutline />
              </a>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => handleOpenEdit(ev)}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '10px 16px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <IoPencilOutline size={16} /> Editar
          </button>
          <button
            type="button"
            onClick={() => handleDelete(ev._id)}
            style={{
              backgroundColor: '#fef2f2',
              color: '#ef4444',
              border: '1px solid #fca5a5',
              padding: '10px 16px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <IoTrashOutline size={16} /> Eliminar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: 'var(--font-sans)', color: '#0f172a' }}>

      {/* HEADER BANNER & CONTROLS */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '32px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 8px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IoVideocamOutline style={{ color: '#1f75f5ff' }} />
            Muro de Noticias & Charlas Zoom
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b', maxWidth: '750px', lineHeight: '1.5' }}>
            Publica novedades y anuncios en el muro para tus alumnos sin necesidad de elegir día ni enlace, o agenda reuniones en vivo en el calendario con notificaciones automáticas segmentadas.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: viewMode === 'calendar' ? '#ffffff' : 'transparent',
                color: viewMode === 'calendar' ? '#1f75f5ff' : '#64748b',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: viewMode === 'calendar' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <IoCalendarOutline /> Calendario
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent',
                color: viewMode === 'list' ? '#1f75f5ff' : '#64748b',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: viewMode === 'list' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              📋 Lista ({events.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleOpenAdd()}
            style={{
              backgroundColor: '#1f75f5ff',
              color: '#ffffff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(31, 117, 245, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <IoAddCircleOutline size={20} /> Agendar
          </button>
        </div>
      </div>

      {/* VIEW MODE: CALENDAR */}
      {viewMode === 'calendar' && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
        }}>
          {/* Calendar Month Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '900', margin: 0, color: '#0f172a', textTransform: 'capitalize' }}>
                {monthNames[month]} {year}
              </h3>
              <button
                type="button"
                onClick={handleToday}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Hoy
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handlePrevMonth}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: '700'
                }}
              >
                <IoChevronBackOutline /> Anterior
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: '700'
                }}
              >
                Siguiente <IoChevronForwardOutline />
              </button>
            </div>
          </div>

          {/* Calendar Week Days Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(dayName => (
              <div key={dayName} style={{
                fontSize: '13px',
                fontWeight: '800',
                color: '#64748b',
                textTransform: 'uppercase',
                padding: '8px 0'
              }}>
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '10px'
          }}>
            {/* Empty cells before start of month */}
            {Array.from({ length: startOffset }).map((_, idx) => (
              <div key={`empty-${idx}`} style={{
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                minHeight: '120px',
                border: '1px dashed #e2e8f0',
                opacity: 0.5
              }} />
            ))}

            {/* Actual Days of Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const cellDate = new Date(year, month, dayNum);
              const dayKey = `${year}-${month}-${dayNum}`;
              const dayEvents = eventsByDay[dayKey] || [];
              const isToday = new Date().toDateString() === cellDate.toDateString();

              return (
                <div
                  key={dayKey}
                  onClick={() => handleOpenAdd(cellDate)}
                  style={{
                    backgroundColor: isToday ? '#eff6ff' : '#ffffff',
                    border: isToday ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    minHeight: '120px',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1f75f5ff'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(31, 117, 245, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = isToday ? '#3b82f6' : '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: isToday ? '900' : '700',
                      color: isToday ? '#1d4ed8' : '#1e293b',
                      backgroundColor: isToday ? '#dbeafe' : 'transparent',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {dayNum}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                      + Agendar
                    </span>
                  </div>

                  {/* Events list in cell */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                    {dayEvents.map((ev, eIdx) => {
                      const badge = getAudienceBadge(ev);
                      const evTime = new Date(ev.eventDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                      return (
                        <div
                          key={ev._id || eIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(ev);
                          }}
                          style={{
                            backgroundColor: badge.bg,
                            borderLeft: `3px solid ${badge.color}`,
                            padding: '6px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#1e293b',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            cursor: 'pointer',
                            transition: 'transform 0.1s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: badge.color, fontSize: '10px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><IoTimeOutline /> {evTime} hs</span>
                          </div>
                          <span style={{ fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ev.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE: LIST */}
      {viewMode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
          {events.length === 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '60px 20px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <IoVideocamOutline size={48} color="#cbd5e1" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0' }}>
                No tienes charlas ni noticias agendadas
              </h4>
              <p style={{ fontSize: '14px', margin: '0 0 20px 0' }}>
                Comienza creando tu primera reunión de Zoom o Anuncio para el muro de la academia.
              </p>
              <button
                type="button"
                onClick={() => handleOpenAdd()}
                style={{
                  backgroundColor: '#1f75f5ff',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                + Crear Ahora
              </button>
            </div>
          ) : (
            <>
              {/* FILTER BAR FOR LIST */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '8px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <button
                  onClick={() => setSelectedListFilter('all')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: selectedListFilter === 'all' ? '#1f75f5ff' : 'transparent',
                    color: selectedListFilter === 'all' ? '#ffffff' : '#334155',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  Ambas Listas
                </button>
                <button
                  onClick={() => setSelectedListFilter('zooms')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: selectedListFilter === 'zooms' ? '#1f75f5ff' : 'transparent',
                    color: selectedListFilter === 'zooms' ? '#ffffff' : '#334155',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <IoVideocamOutline size={18} /> Solo Charlas Zoom ({events.filter(ev => ev.type !== 'news').length})
                </button>
                <button
                  onClick={() => setSelectedListFilter('news')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: selectedListFilter === 'news' ? '#1f75f5ff' : 'transparent',
                    color: selectedListFilter === 'news' ? '#ffffff' : '#334155',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <IoNewspaperOutline size={18} /> Solo Noticias & Anuncios ({events.filter(ev => ev.type === 'news').length})
                </button>
              </div>

              {/* LISTA DE CHARLAS / ZOOM */}
              {(selectedListFilter === 'all' || selectedListFilter === 'zooms') && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '2px solid #eff6ff', paddingBottom: '12px' }}>
                  <span style={{ backgroundColor: '#eff6ff', color: '#1e3a8a', padding: '8px', borderRadius: '12px', display: 'flex' }}>
                    <IoVideocamOutline size={22} />
                  </span>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                      Charlas & Reuniones de Zoom
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                      Encuentros en vivo, masterclasses y sesiones agendadas
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {events.filter(ev => ev.type !== 'news').length === 0 ? (
                    <div style={{ backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                      No hay charlas de Zoom agendadas por el momento.
                    </div>
                  ) : (
                    events.filter(ev => ev.type !== 'news').map(renderEventCard)
                  )}
                </div>
              </div>
              )}

              {/* LISTA DE NOTICIAS DEL MURO */}
              {(selectedListFilter === 'all' || selectedListFilter === 'news') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px' }}>
                  <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '8px', borderRadius: '12px', display: 'flex' }}>
                    <IoNewspaperOutline size={22} />
                  </span>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: '0 0' }}>
                      Noticias & Anuncios del Muro
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                      Comunicados oficiales visibles en el muro de noticias de la academia
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {events.filter(ev => ev.type === 'news').length === 0 ? (
                    <div style={{ backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                      No hay noticias publicadas en el muro por el momento.
                    </div>
                  ) : (
                    events.filter(ev => ev.type === 'news').map(renderEventCard)
                  )}
                </div>
              </div>
              )}
            </>
          )}
        </div>
      )}

      {/* FORM MODAL FOR CREATING / EDITING ZOOM EVENT */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '900', margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {editingEvent ? <IoPencilOutline color="#1f75f5ff" /> : <IoAddCircleOutline color="#1f75f5ff" />}
                {editingEvent ? 'Editar Charla Zoom' : 'Agendar Charla Zoom'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex'
                }}
              >
                <IoCloseOutline />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* TYPE SELECTOR */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Tipo de Publicación *
                </label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setType('zoom')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: `2px solid ${type === 'zoom' ? '#1f75f5ff' : '#e2e8f0'}`,
                      backgroundColor: type === 'zoom' ? '#eff6ff' : '#ffffff',
                      color: type === 'zoom' ? '#1e3a8a' : '#64748b',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <IoVideocamOutline size={18} /> Charla / Reunión Zoom
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('news')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: `2px solid ${type === 'news' ? '#10b981' : '#e2e8f0'}`,
                      backgroundColor: type === 'news' ? '#ecfdf5' : '#ffffff',
                      color: type === 'news' ? '#065f46' : '#64748b',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <IoNewspaperOutline size={18} /> Noticia / Anuncio del Muro
                  </button>
                </div>
              </div>

              {/* TITLE */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Título / Asunto *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={type === 'news' ? 'Ej: ¡Nuevo Módulo Desbloqueado en Planificación!' : 'Ej: Masterclass: Planificación Física en Fútbol'}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: '600',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* DATE AND TIME */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                  {type === 'zoom' ? 'Fecha y Hora de la Reunión *' : 'Fecha de la Noticia (Opcional, por defecto Hoy)'}
                </label>
                <input
                  type="datetime-local"
                  value={eventDateInput}
                  onChange={(e) => setEventDateInput(e.target.value)}
                  required={type === 'zoom'}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: '600',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* ZOOM URL */}
              {type === 'zoom' && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Enlace de la Reunión (Zoom / Google Meet / Teams) *
                  </label>
                  <input
                    type="url"
                    value={zoomUrl}
                    onChange={(e) => setZoomUrl(e.target.value)}
                    placeholder="https://zoom.us/j/123456789..."
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      fontWeight: '600',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {/* DESCRIPTION */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Temario / Descripción (Opcional)
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe qué temas se tratarán durante la reunión..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: '600',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* TARGET AUDIENCE */}
              <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '10px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IoPeopleOutline size={16} color="#1f75f5ff" /> Destinatarios de la Notificación *
                </label>

                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: '700',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                    marginBottom: targetAudience === 'specific_course' ? '14px' : '0'
                  }}
                >
                  <option value="all">🌐 A Todos los Usuarios (Comunidad entera)</option>
                  <option value="members">⭐ Solo Miembros Premium (Suscripción activa)</option>
                  <option value="courses">🎓 Alumnos Anotados en cualquier Curso/Workshop</option>
                  <option value="specific_course">📌 Alumnos de un Curso o Workshop Específico...</option>
                </select>

                {targetAudience === 'specific_course' && (
                  <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                      Selecciona el Curso / Workshop Específico:
                    </label>
                    <select
                      value={targetCourseId}
                      onChange={(e) => setTargetCourseId(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid #3b82f6',
                        fontSize: '14px',
                        fontWeight: '700',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">-- Elige una formación --</option>
                      {coursesList.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.contentType === 'workshop' ? '🛠️ Workshop:' : '📘 Curso:'} {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* NOTIFICATION CHECKBOX */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: '#fffbeb', padding: '14px', borderRadius: '14px', border: '1px solid #fde68a' }}>
                <input
                  type="checkbox"
                  id="sendNotif"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  style={{ marginTop: '3px', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="sendNotif" style={{ fontSize: '13px', color: '#92400e', fontWeight: '700', cursor: 'pointer', lineHeight: '1.4' }}>
                  <strong>🔔 Enviar notificación instantánea al guardar:</strong><br />
                  {sendNotification
                    ? `Se enviará una alerta en la plataforma a los destinatarios seleccionados con el enlace y horario.`
                    : `No se enviará notificación (el evento solo se agregará en el calendario).`}
                </label>
              </div>

              {/* ACTIONS */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    backgroundColor: '#1f75f5ff',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(31, 117, 245, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {saving ? 'Guardando...' : (editingEvent ? 'Guardar Cambios' : 'Agendar y Notificar')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminZoomTab;
