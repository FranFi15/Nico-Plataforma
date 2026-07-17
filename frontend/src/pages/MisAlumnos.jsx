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

  const handleRoleChange = async (studentId, newRole) => {
    try {
      const response = await api.put(`/users/${studentId}/role`, { role: newRole });
      if (response.data?.success) {
        setStudents(students.map(s => s._id === studentId ? { ...s, role: newRole } : s));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar el rol de usuario');
    }
  };

  const handleMembershipUpdate = async (studentId, membershipData) => {
    try {
      const response = await api.put(`/users/${studentId}/membership`, membershipData);
      if (response.data?.success) {
        setStudents(students.map(s => s._id === studentId ? { ...s, ...response.data.data } : s));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar la membresía de usuario');
    }
  };

  const handleMembershipToggle = (student) => {
    const isCurrentlyPremium = student.membership === 'premium' || student.isSubscribed === true;
    if (isCurrentlyPremium) {
      handleMembershipUpdate(student._id, {
        membership: 'free',
        isSubscribed: false,
        membershipExpiresAt: null
      });
    } else {
      handleMembershipUpdate(student._id, {
        membership: 'premium',
        isSubscribed: true,
        membershipExpiresAt: student.membershipExpiresAt || null
      });
    }
  };

  const toggleExpand = (id) => {
    setExpandedStudentId(expandedStudentId === id ? null : id);
  };

  const getStudentAccessDetails = (student) => {
    const isPrivileged = student && ['admin', 'professor', 'profe', 'instructor'].includes(student.role);
    const isPremium = (student.membership === 'premium' || student.isSubscribed === true) &&
      (!student.membershipExpiresAt || new Date(student.membershipExpiresAt) > new Date());
    const ownedIds = student.purchasedItems ? student.purchasedItems.map(item => (item._id || item).toString()) : [];

    const accessedCourses = [];
    const accessedWorkshops = [];

    courses.forEach(content => {
      let hasAccess = false;
      let accessReason = '';

      if (isPrivileged) {
        hasAccess = true;
        accessReason = student.role === 'admin' ? 'Acceso Total (Admin)' : 'Acceso Total (Docente)';
      } else if (content.accessType === 'free') {
        hasAccess = true;
        accessReason = 'Acceso Libre';
      } else if (content.accessType === 'subscription' && isPremium) {
        hasAccess = true;
        const expiresStr = student.membershipExpiresAt
          ? `Suscripción (Hasta ${new Date(student.membershipExpiresAt).toLocaleDateString('es-ES')})`
          : 'Suscripción Premium (Sin límite)';
        accessReason = expiresStr;
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
        <h1 style={{ fontSize: '80px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.5px', marginBottom: '12px', color: 'var(--dark)' }}>
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    {/* Role selector dropdown */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <select
                        value={student.role || 'student'}
                        onChange={(e) => handleRoleChange(student._id, e.target.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          border: student.role === 'admin' || student.role === 'professor' ? '1px solid #1f75f5ff' : '1px solid var(--border)',
                          backgroundColor: student.role === 'admin' ? '#051020' : student.role === 'professor' || student.role === 'profe' ? '#eff6ff' : '#ffffff',
                          color: student.role === 'admin' ? '#ffffff' : student.role === 'professor' || student.role === 'profe' ? '#1d4ed8' : '#334155',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          outline: 'none',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                        }}
                      >
                        <option value="student">Alumno / Estudiante</option>
                        <option value="professor">Profesor / Docente (Acceso Total)</option>
                        <option value="admin">Administrador (Acceso Total)</option>
                      </select>
                    </div>

                    {/* Switch de Membresía y Selector de Expiración */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '6px 14px',
                        borderRadius: '24px',
                        backgroundColor: isPremium ? 'rgba(31, 117, 245, 0.08)' : 'var(--gray-100)',
                        border: isPremium ? '1.5px solid rgba(31, 117, 245, 0.3)' : '1px solid var(--border)',
                        transition: 'all 0.2s ease',
                        flexWrap: 'wrap'
                      }}
                    >
                      {/* Toggle Switch */}
                      <div
                        onClick={() => handleMembershipToggle(student)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{
                          width: '40px',
                          height: '22px',
                          borderRadius: '12px',
                          backgroundColor: isPremium ? 'var(--primary)' : '#cbd5e1',
                          position: 'relative',
                          transition: 'background-color 0.2s ease'
                        }}>
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            backgroundColor: '#ffffff',
                            position: 'absolute',
                            top: '2px',
                            left: isPremium ? '20px' : '2px',
                            transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                          }} />
                        </div>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '800',
                          color: isPremium ? 'var(--primary)' : 'var(--gray-600)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {isPremium ? 'Membresía Activa' : 'Sin Membresía'}
                        </span>
                      </div>

                      {/* Selector de Fecha de Expiración (Solo si Membresía Activa) */}
                      {isPremium && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          borderLeft: '1px solid rgba(31, 117, 245, 0.2)',
                          paddingLeft: '12px',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--gray-500)', textTransform: 'uppercase' }}>
                            {student.membershipExpiresAt ? 'Vence:' : 'Duración:'}
                          </span>
                          {student.membershipExpiresAt ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="date"
                                value={(typeof student.membershipExpiresAt === 'string' ? student.membershipExpiresAt : new Date(student.membershipExpiresAt).toISOString()).substring(0, 10)}
                                onChange={(e) => handleMembershipUpdate(student._id, {
                                  membership: 'premium',
                                  isSubscribed: true,
                                  membershipExpiresAt: e.target.value || null
                                })}
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--primary)',
                                  backgroundColor: '#ffffff',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  color: 'var(--dark)',
                                  cursor: 'pointer',
                                  outline: 'none'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleMembershipUpdate(student._id, {
                                  membership: 'premium',
                                  isSubscribed: true,
                                  membershipExpiresAt: null
                                })}
                                title="Quitar fecha (Dejar sin límite)"
                                style={{
                                  background: 'var(--primary)',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '3px 8px',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  cursor: 'pointer'
                                }}
                              >
                                Sin límite
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                fontSize: '11px',
                                fontWeight: '800',
                                color: '#065f46',
                                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                padding: '2px 8px',
                                borderRadius: '12px'
                              }}>
                                Sin límite de tiempo
                              </span>
                              <input
                                type="date"
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleMembershipUpdate(student._id, {
                                      membership: 'premium',
                                      isSubscribed: true,
                                      membershipExpiresAt: e.target.value
                                    });
                                  }
                                }}
                                title="Fijar fecha de expiración"
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '6px',
                                  border: '1px dashed var(--primary)',
                                  backgroundColor: '#ffffff',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  color: 'var(--primary)',
                                  cursor: 'pointer',
                                  outline: 'none',
                                  width: '120px'
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
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
                                  backgroundColor: c.reason === 'Acceso Libre' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(31, 117, 245, 0.08)',
                                  color: c.reason === 'Acceso Libre' ? '#10b981' : 'var(--primary)',
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
                                  backgroundColor: w.reason === 'Acceso Libre' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(31, 117, 245, 0.08)',
                                  color: w.reason === 'Acceso Libre' ? '#10b981' : 'var(--primary)',
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
