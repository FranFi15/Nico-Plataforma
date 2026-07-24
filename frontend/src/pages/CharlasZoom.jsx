import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  IoVideocamOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoLockClosedOutline,
  IoOpenOutline,
  IoCheckmarkCircle,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoPeopleOutline,
  IoStar,
  IoNewspaperOutline,
  IoCloseOutline,
  IoListOutline,
  IoRocketOutline
} from 'react-icons/io5';

const CharlasZoom = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEventModal, setSelectedEventModal] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await api.get('/zoomevents');
        setEvents(res.data || []);
      } catch (err) {
        console.error('Error fetching zoom talks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Check if current user has access to a specific zoom event
  const checkUserAccess = (ev) => {
    if (!ev) return false;
    // Admins and professors always have access
    if (user && ['admin', 'professor', 'profe', 'instructor'].includes(user.role)) return true;

    if (ev.targetAudience === 'all') return true;

    const isPremium = user && (user.membership === 'premium' || user.isSubscribed === true);
    if (ev.targetAudience === 'members') return isPremium;

    const hasCourses = user && user.purchasedItems && user.purchasedItems.length > 0;
    if (ev.targetAudience === 'courses') return isPremium || hasCourses;

    if (ev.targetAudience === 'specific_course') {
      const courseId = ev.targetCourseId?._id || ev.targetCourseId;
      const ownsSpecific = user && user.purchasedItems && user.purchasedItems.some(item => (item._id || item) === courseId);
      return ownsSpecific;
    }

    return true;
  };

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const zoomEvents = events.filter(ev => ev.type !== 'news');

  const eventsByDay = {};
  zoomEvents.forEach(ev => {
    if (!ev.eventDate) return;
    const d = new Date(ev.eventDate);
    const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!eventsByDay[dayKey]) eventsByDay[dayKey] = [];
    eventsByDay[dayKey].push(ev);
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--gray-400)', fontFamily: 'var(--font-sans)' }}>
        Cargando agenda de charlas Zoom...
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1300px',
      margin: '0 auto',
      padding: '40px 20px 80px 20px',
      fontFamily: 'var(--font-sans)',
      color: '#0f172a'
    }}>
      {/* HERO BANNER */}
      <div className="p-20-mobile" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '40px',
        marginBottom: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
        <div>

          <h1 style={{ fontSize: '36px', fontWeight: '900', margin: '0 0 12px 0', color: '#ffffff', lineHeight: '1.2' }}>
            Agenda Zoom
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--gray-400)', maxWidth: '700px', margin: 0, lineHeight: '1.6' }}>
            Explora el calendario y la lista de eventos para unirte a las próximas reuniones en Zoom.
          </p>
        </div>
      </div>

      {/* AGENDA ZOOM (CALENDARIO O LISTA) */}
      <div>
        {/* SECTION HEADER & VIEW MODE TOGGLE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <IoVideocamOutline size={26} color="var(--primary)" /> Agenda & Calendario de Zooms
          </h2>

          <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: viewMode === 'calendar' ? '#1f75f5ff' : 'transparent',
                color: viewMode === 'calendar' ? '#ffffff' : '#334155',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <IoCalendarOutline size={16} /> Calendario
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: viewMode === 'list' ? '#1f75f5ff' : 'transparent',
                color: viewMode === 'list' ? '#ffffff' : '#334155',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <IoListOutline size={16} /> Lista
            </button>
          </div>
        </div>

        {/* CALENDAR SECTION */}
        {viewMode === 'calendar' && (
          <div className="p-16-mobile" style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
          }}>
            {/* Calendar Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h3 style={{ fontSize: '26px', fontWeight: '900', margin: 0, color: '#0f172a', textTransform: 'capitalize' }}>
                  {monthNames[month]} {year}
                </h3>
                <button
                  onClick={handleToday}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Hoy
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handlePrevMonth}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: '700'
                  }}
                >
                  <IoChevronBackOutline /> Mes Anterior
                </button>
                <button
                  onClick={handleNextMonth}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: '700'
                  }}
                >
                  Mes Siguiente <IoChevronForwardOutline />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto-mobile" style={{ width: '100%' }}>
              <div style={{ minWidth: '700px' }}>
                {/* Calendar Grid Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px', marginBottom: '16px' }}>
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontWeight: '800', color: '#64748b', fontSize: '13px', paddingBy: '8px' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid Cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
              {/* Empty cells for start offset */}
              {Array.from({ length: startOffset }).map((_, idx) => (
                <div key={`empty-${idx}`} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', minHeight: '130px', opacity: 0.5 }} />
              ))}

              {/* Days cells */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const cellDate = new Date(year, month, dayNum);
                const dayKey = `${year}-${month}-${dayNum}`;
                const dayEvents = eventsByDay[dayKey] || [];
                const isToday = new Date().toDateString() === cellDate.toDateString();

                return (
                  <div
                    key={dayKey}
                    style={{
                      backgroundColor: isToday ? '#eff6ff' : '#ffffff',
                      border: isToday ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                      borderRadius: '16px',
                      minHeight: '130px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: isToday ? '900' : '700',
                        color: isToday ? '#1d4ed8' : '#0f172a',
                        backgroundColor: isToday ? '#dbeafe' : 'transparent',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {dayNum}
                      </span>
                    </div>

                    {/* Day Events */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                      {dayEvents.map((ev) => {
                        const hasAccess = checkUserAccess(ev);
                        const evTime = new Date(ev.eventDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

                        return (
                          <div
                            key={ev._id}
                            onClick={() => setSelectedEventModal(ev)}
                            style={{
                              backgroundColor: hasAccess ? '#eff6ff' : '#f8fafc',
                              borderLeft: `3px solid ${hasAccess ? '#3b82f6' : '#94a3b8'}`,
                              padding: '8px 10px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: hasAccess ? '#1d4ed8' : '#64748b', marginBottom: '2px', fontWeight: '800' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><IoTimeOutline /> {evTime} hs</span>
                              {hasAccess ? <IoVideocamOutline /> : <IoLockClosedOutline />}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {ev.title}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    )}

        {/* LIST VIEW SECTION */}
        {viewMode === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {events.filter(ev => ev.type !== 'news').length === 0 ? (
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '60px 20px',
                textAlign: 'center',
                color: '#64748b'
              }}>
                <IoVideocamOutline size={48} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
                  No hay charlas agendadas en la lista
                </h4>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  Las próximas reuniones en vivo y masterclasses aparecerán listadas aquí.
                </p>
              </div>
            ) : (
              events.filter(ev => ev.type !== 'news').map((ev) => {
                const hasAccess = checkUserAccess(ev);
                const evDateObj = new Date(ev.eventDate);
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
                      borderRadius: '20px',
                      padding: '24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '20px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                        <span style={{
                          backgroundColor: '#eff6ff',
                          color: '#1e3a8a',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '800',
                          border: '1px solid #3b82f630',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <IoVideocamOutline size={13} /> CLASE / EN VIVO
                        </span>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <IoCalendarOutline size={15} /> {formattedDate} — {formattedTime} hs
                        </span>
                      </div>

                      <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>
                        {ev.title}
                      </h3>

                      {ev.description && (
                        <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                          {ev.description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={() => setSelectedEventModal(ev)}
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#0f172a',
                          border: '1px solid #cbd5e1',
                          padding: '12px 20px',
                          borderRadius: '12px',
                          fontWeight: '800',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        Ver Detalle
                      </button>

                      {hasAccess ? (
                        ev.zoomUrl && (
                          <a
                            href={ev.zoomUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              backgroundColor: '#1f75f5ff',
                              color: '#ffffff',
                              padding: '12px 22px',
                              borderRadius: '12px',
                              fontWeight: '800',
                              fontSize: '13px',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              boxShadow: '0 4px 12px rgba(31, 117, 245, 0.4)'
                            }}
                          >
                            <IoVideocamOutline size={16} /> Unirse a la Charla <IoOpenOutline />
                          </a>
                        )
                      ) : (
                        <div style={{
                          backgroundColor: '#fef2f2',
                          border: '1px solid #ef444430',
                          padding: '10px 16px',
                          borderRadius: '12px',
                          color: '#ef4444',
                          fontSize: '12px',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <IoLockClosedOutline size={16} /> Reservado para {ev.targetAudience === 'members' ? 'Premium' : 'Curso Específico'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* EVENT DETAILS MODAL */}
      {selectedEventModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 16, 32, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#111827',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '550px',
            padding: '36px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {(() => {
              const ev = selectedEventModal;
              const hasAccess = checkUserAccess(ev);
              const formattedDate = new Date(ev.eventDate).toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });
              const formattedTime = new Date(ev.eventDate).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span style={{
                      backgroundColor: hasAccess ? 'rgba(31, 117, 245, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: hasAccess ? 'var(--primary)' : '#ef4444',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '800',
                      border: `1px solid ${hasAccess ? 'var(--primary)' : '#ef4444'}30`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {hasAccess ? <IoCheckmarkCircle /> : <IoLockClosedOutline />} {hasAccess ? 'Acceso Concedido' : 'Acceso Restringido'}
                    </span>
                    <button
                      onClick={() => setSelectedEventModal(null)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--gray-400)', fontSize: '24px', cursor: 'pointer', display: 'flex' }}
                    >
                      <IoCloseOutline />
                    </button>
                  </div>

                  <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', margin: '0 0 12px 0', lineHeight: '1.3' }}>
                    {ev.title}
                  </h3>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: 'var(--gray-400)', fontWeight: '700', marginBottom: '20px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IoCalendarOutline /> {formattedDate}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IoTimeOutline /> {formattedTime} hs</span>
                  </div>

                  {ev.description && (
                    <p style={{ fontSize: '15px', color: 'var(--gray-300)', lineHeight: '1.6', margin: '0 0 24px 0', backgroundColor: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                      {ev.description}
                    </p>
                  )}

                  {hasAccess ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <a
                        href={ev.zoomUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          backgroundColor: 'var(--primary)',
                          color: '#ffffff',
                          padding: '16px 24px',
                          borderRadius: '16px',
                          fontWeight: '800',
                          fontSize: '16px',
                          textAlign: 'center',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          boxShadow: '0 8px 25px rgba(31, 117, 245, 0.4)'
                        }}
                      >
                        <IoVideocamOutline size={22} /> Unirse a la Charla en Zoom
                      </a>
                      <p style={{ fontSize: '12px', color: 'var(--gray-400)', textAlign: 'center', margin: 0 }}>
                        Asegúrate de entrar unos minutos antes del inicio programado.
                      </p>
                    </div>
                  ) : (
                    <div style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '16px',
                      padding: '24px',
                      textAlign: 'center'
                    }}>
                      <IoLockClosedOutline size={36} color="#ef4444" style={{ marginBottom: '10px' }} />
                      <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: '0 0 8px 0' }}>
                        Esta reunión es exclusiva
                      </h4>
                      <p style={{ fontSize: '14px', color: 'var(--gray-300)', margin: '0 0 20px 0' }}>
                        {ev.targetAudience === 'members'
                          ? 'Esta charla está reservada para usuarios con Membresía Premium activa.'
                          : 'Esta charla es exclusiva para alumnos inscriptos en formaciones especializadas de Nico Sesma.'}
                      </p>
                      <button
                        onClick={() => {
                          setSelectedEventModal(null);
                          navigate('/checkout');
                        }}
                        style={{
                          backgroundColor: 'var(--primary)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '14px 24px',
                          borderRadius: '12px',
                          fontWeight: '800',
                          fontSize: '14px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(31, 117, 245, 0.35)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <IoRocketOutline size={18} /> Activar Acceso Premium
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharlasZoom;
