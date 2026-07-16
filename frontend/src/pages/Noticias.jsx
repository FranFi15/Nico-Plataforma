import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  IoNewspaperOutline,
  IoCalendarOutline,
  IoLockClosedOutline,
  IoOpenOutline,
  IoCheckmarkCircle,
  IoCloseOutline
} from 'react-icons/io5';

const Noticias = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNewsModal, setSelectedNewsModal] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await api.get('/zoomevents');
        setEvents(res.data || []);
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const checkUserAccess = (ev) => {
    if (!ev) return false;
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

  const newsEvents = events.filter(ev => ev.type === 'news');

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--gray-400)', fontFamily: 'var(--font-sans)' }}>
        Cargando muro de noticias...
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
      <div style={{
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
            Noticias & Anuncios
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--gray-400)', maxWidth: '700px', margin: 0, lineHeight: '1.6' }}>
            Mantente informado con los comunicados oficiales, avisos y novedades del programa en el muro de noticias de la academia.
          </p>
        </div>
      </div>

      {/* NEWS WALL */}
      <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <IoNewspaperOutline size={26} color="var(--primary)" /> Muro de Noticias Oficiales ({newsEvents.length})
      </h2>

      {newsEvents.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          padding: '60px 20px',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <IoNewspaperOutline size={48} color="#cbd5e1" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
            No hay noticias publicadas en este momento
          </h3>
          <p style={{ fontSize: '14px', margin: 0 }}>
            Cuando se publiquen nuevos comunicados o avisos, aparecerán en este muro.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {newsEvents.map(news => {
            const hasAccess = checkUserAccess(news);
            const newsDate = new Date(news.eventDate || news.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });

            return (
              <div key={news._id} style={{
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
              }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{
                      backgroundColor: '#ecfdf5',
                      color: '#065f46',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '800',
                      border: '1px solid #10b98130',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <IoNewspaperOutline size={13} /> COMUNICADO OFICIAL
                    </span>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <IoCalendarOutline size={15} /> {newsDate}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                    {news.title}
                  </h3>

                  {hasAccess ? (
                    <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                      {news.description || 'Sin descripción adicional.'}
                    </p>
                  ) : (
                    <div style={{
                      backgroundColor: '#fef2f2',
                      border: '1px dashed #ef4444',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      marginTop: '8px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <IoLockClosedOutline color="#ef4444" size={18} />
                      <p style={{ color: '#ef4444', fontSize: '13px', margin: 0, fontWeight: '700' }}>
                        Anuncio reservado para {news.targetAudience === 'members' ? 'Miembros Premium' : 'alumnos inscritos en un curso específico'}.
                      </p>
                    </div>
                  )}
                </div>

                {news.zoomUrl && hasAccess && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <a
                      href={news.zoomUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        fontWeight: '800',
                        fontSize: '13px',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Enlace / Adjunto <IoOpenOutline size={16} />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Noticias;
