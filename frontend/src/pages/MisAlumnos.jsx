import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { IoPerson, IoMail, IoCalendar, IoSchool, IoStar, IoCheckmarkCircle, IoSearch, IoCloseCircle, IoChevronDown, IoChevronUp } from 'react-icons/io5';

const MisAlumnos = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  useEffect(() => {
    // Redirect if not admin
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, coursesRes, workshopsRes] = await Promise.all([
          api.get('/users'),
          api.get('/content?type=course'),
          api.get('/content?type=workshop')
        ]);

        if (usersRes.data?.success) {
          setStudents(usersRes.data.data);
        }

        const allContent = [
          ...(coursesRes.data?.success ? coursesRes.data.data : []),
          ...(workshopsRes.data?.success ? workshopsRes.data.data : [])
        ];
        setCourses(allContent);
      } catch (error) {
        console.error('Error fetching students data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  if (authLoading || (loading && students.length === 0)) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--gray-500)', fontFamily: 'var(--font-sans)' }}>
        Cargando listado de alumnos...
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null; // Will redirect in useEffect
  }

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id) => {
    setExpandedStudentId(expandedStudentId === id ? null : id);
  };

  const getStudentAccessDetails = (student) => {
    const isPremium = student.membership === 'premium' || student.isSubscribed === true;
    const ownedIds = student.purchasedItems ? student.purchasedItems.map(item => (item._id || item).toString()) : [];

    const accessedCourses = [];
    const accessedWorkshops = [];

    courses.forEach(content => {
      let hasAccess = false;
      let accessReason = '';

      if (content.accessType === 'free') {
        hasAccess = true;
        accessReason = 'Gratuito';
      } else if (content.accessType === 'subscription' && isPremium) {
        hasAccess = true;
        accessReason = 'Suscripción Premium';
      } else if (ownedIds.includes(content._id.toString())) {
        hasAccess = true;
        accessReason = 'Compra Única';
      }

      if (hasAccess) {
        const itemDetail = {
          title: content.title,
          reason: accessReason,
          subtype: content.subtype || 'course'
        };
        if (content.type === 'workshop' || content.subtype === 'workshop') {
          accessedWorkshops.push(itemDetail);
        } else {
          accessedCourses.push(itemDetail);
        }
      }
    });

    return { accessedCourses, accessedWorkshops };
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 80px 20px', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', padding: '60px 0 30px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ fontSize: '40px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.5px', marginBottom: '12px', color: 'var(--dark)' }}>
          Gestión de Alumnos
        </h1>
        <div className="accent-divider"></div>
        <p style={{ color: 'var(--gray-500)', fontSize: '16px', maxWidth: '640px', lineHeight: '1.6' }}>
          Monitorea el progreso, suscripciones y formaciones adquiridas por tus alumnos inscritos.
        </p>
      </header>

      {/* Search Input Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
          <IoSearch style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--gray-400)',
            fontSize: '18px'
          }} />
          <input
            type="text"
            placeholder="Buscar alumno por nombre o correo electrónico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="premium-input"
            style={{
              paddingLeft: '48px',
              paddingRight: '16px',
              height: '48px',
              fontSize: '14px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)'
            }}
          />
        </div>
      </div>

      {/* Alumnos List */}
      {filteredStudents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '50px 20px',
          color: 'var(--gray-500)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <IoCloseCircle size={48} style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--dark)', marginBottom: '8px' }}>
            No se encontraron alumnos
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--gray-500)' }}>
            Intenta buscando con otro término de búsqueda.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredStudents.map((student) => {
            const isExpanded = expandedStudentId === student._id;
            const { accessedCourses, accessedWorkshops } = getStudentAccessDetails(student);
            const isPremium = student.membership === 'premium' || student.isSubscribed;
            const formattedDate = student.createdAt
              ? new Date(student.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
              : 'Fecha no disponible';

            return (
              <div
                key={student._id}
                className="premium-card"
                style={{
                  padding: '24px 30px',
                  borderRadius: '16px',
                  border: isExpanded ? '1px solid var(--primary)' : '1px solid var(--border)',
                  boxShadow: isExpanded ? '0 10px 25px rgba(31, 117, 245, 0.08)' : '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff'
                }}
              >
                {/* Collapsed view header */}
                <div
                  onClick={() => toggleExpand(student._id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: isPremium ? 'rgba(31, 117, 245, 0.08)' : 'var(--gray-100)',
                      color: isPremium ? 'var(--primary)' : 'var(--gray-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      flexShrink: 0
                    }}>
                      <IoPerson />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--dark)', margin: 0, textTransform: 'capitalize' }}>
                        {student.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--gray-500)' }}>
                          <IoMail style={{ color: 'var(--gray-400)' }} /> {student.email}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--gray-500)' }}>
                          <IoCalendar style={{ color: 'var(--gray-400)' }} /> Registro: {formattedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Subscription status badge */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      backgroundColor: isPremium ? 'rgba(31, 117, 245, 0.1)' : 'var(--gray-100)',
                      color: isPremium ? 'var(--primary)' : 'var(--gray-600)',
                      letterSpacing: '1px'
                    }}>
                      {isPremium ? <IoStar /> : null}
                      {isPremium ? 'Membresía Premium' : 'Plan Gratuito'}
                    </div>

                    {/* Expand indicator icon */}
                    <div>
                      {isExpanded ? (
                        <IoChevronUp style={{ color: 'var(--gray-400)', fontSize: '20px' }} />
                      ) : (
                        <IoChevronDown style={{ color: 'var(--gray-400)', fontSize: '20px' }} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded details view */}
                {isExpanded && (
                  <div style={{
                    marginTop: '24px',
                    paddingTop: '24px',
                    borderTop: '1px solid var(--border)',
                    animation: 'fadeIn 0.2s ease-out'
                  }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--primary)', marginBottom: '16px' }}>
                      Cursos y Workshops Activos
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                      {/* Courses Column */}
                      <div>
                        <h5 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          <IoSchool style={{ color: 'var(--primary)' }} /> Cursos ({accessedCourses.length})
                        </h5>
                        {accessedCourses.length === 0 ? (
                          <p style={{ fontSize: '13px', color: 'var(--gray-400)', fontStyle: 'italic' }}>
                            Ningún curso activo.
                          </p>
                        ) : (
                          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {accessedCourses.map((c, idx) => (
                              <li key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 14px',
                                backgroundColor: 'var(--gray-50)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: 'var(--dark)'
                              }}>
                                <span>{c.title}</span>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: '800',
                                  backgroundColor: c.reason === 'Gratuito' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(31, 117, 245, 0.08)',
                                  color: c.reason === 'Gratuito' ? '#10b981' : 'var(--primary)',
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  textTransform: 'uppercase'
                                }}>
                                  {c.reason}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Workshops Column */}
                      <div>
                        <h5 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          <IoStar style={{ color: '#f59e0b' }} /> Workshops ({accessedWorkshops.length})
                        </h5>
                        {accessedWorkshops.length === 0 ? (
                          <p style={{ fontSize: '13px', color: 'var(--gray-400)', fontStyle: 'italic' }}>
                            Ningún workshop activo.
                          </p>
                        ) : (
                          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {accessedWorkshops.map((w, idx) => (
                              <li key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 14px',
                                backgroundColor: 'var(--gray-50)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: 'var(--dark)'
                              }}>
                                <span>{w.title}</span>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: '800',
                                  backgroundColor: w.reason === 'Gratuito' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(31, 117, 245, 0.08)',
                                  color: w.reason === 'Gratuito' ? '#10b981' : 'var(--primary)',
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  textTransform: 'uppercase'
                                }}>
                                  {w.reason}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
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

export default MisAlumnos;
