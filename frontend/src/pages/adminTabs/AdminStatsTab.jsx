import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  IoPeopleOutline,
  IoStarOutline,
  IoBookOutline,
  IoVideocamOutline,
  IoStatsChartOutline,
  IoPersonAddOutline,
  IoFolderOpenOutline,
  IoNewspaperOutline,
  IoCloseOutline
} from 'react-icons/io5';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AdminStatsTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
  const [kinventCertifications, setKinventCertifications] = useState([]);
  const [kinventLoading, setKinventLoading] = useState(false);
  const [kinventSearch, setKinventSearch] = useState('');
  const [kinventTab, setKinventTab] = useState('pending'); // 'pending' or 'history'

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/stats');
      if (response.data && response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('No se pudieron cargar las estadísticas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchKinventCertifications();
  }, []);

  const fetchKinventCertifications = async () => {
    setKinventLoading(true);
    try {
      const response = await api.get('/content/kinvent-certifications');
      if (response.data && response.data.success) {
        setKinventCertifications(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching kinvent certifications:', err);
    } finally {
      setKinventLoading(false);
    }
  };

  const toggleKinventSentStatus = async (id) => {
    try {
      const response = await api.put(`/content/kinvent-certifications/${id}`);
      if (response.data && response.data.success) {
        setKinventCertifications((prev) =>
          prev.map((cert) => (cert._id === id ? response.data.data : cert))
        );
      }
    } catch (err) {
      console.error('Error toggling kinvent certification status:', err);
      alert('Error al actualizar el estado de envío.');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-500)', fontFamily: 'var(--font-sans)' }}>
        Cargando estadísticas de la plataforma...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#ef4444', fontFamily: 'var(--font-sans)' }}>
        {error}
      </div>
    );
  }

  if (!stats) return null;

  const statCardStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #f1f5f9',
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)',
    transition: 'all 0.3s ease',
  };

  const iconContainerStyle = (bgColor, color) => ({
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    backgroundColor: bgColor,
    color: color,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0
  });

  return (
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.5px' }}>
          <IoStatsChartOutline color="var(--primary)" size={28} /> Estadísticas Globales
        </h2>
        <button onClick={fetchStats} className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px', borderRadius: '12px' }}>
          Actualizar Datos
        </button>
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#334155', marginBottom: '20px', letterSpacing: '-0.3px' }}>Usuarios y Alumnos</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        <div style={statCardStyle} className="stat-card">
          <div style={iconContainerStyle('#f8fafc', '#3b82f6')}>
            <IoPeopleOutline size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', color: '#64748b', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Total Alumnos</h4>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', lineHeight: '1', letterSpacing: '-1px' }}>{stats.users.total}</div>
          </div>
        </div>

        <div style={statCardStyle} className="stat-card">
          <div style={iconContainerStyle('#f8fafc', '#eab308')}>
            <IoStarOutline size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', color: '#64748b', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Alumnos Premium</h4>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', lineHeight: '1', letterSpacing: '-1px' }}>{stats.users.premium}</div>
          </div>
        </div>

        <div 
          style={{...statCardStyle, cursor: 'pointer', border: '1px solid transparent'}} 
          className="stat-card clickable-card"
          onClick={() => setShowEnrollmentsModal(true)}
          title="Ver detalle de cursos"
        >
          <div style={iconContainerStyle('#f8fafc', '#10b981')}>
            <IoPersonAddOutline size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', color: '#64748b', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Inscriptos a Cursos</h4>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', lineHeight: '1', letterSpacing: '-1px' }}>{stats.users.enrolled}</div>
              <p style={{ fontSize: '12px', color: '#10b981', margin: 0, fontWeight: '500' }}>Ver detalle &rarr;</p>
            </div>
          </div>
        </div>
      </div>

      {stats.history && stats.history.length > 0 && (
        <>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#334155', marginBottom: '20px', letterSpacing: '-0.3px' }}>Crecimiento Mensual</h3>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '40px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)',
            height: '350px'
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line 
                  type="monotone" 
                  dataKey="NuevosAlumnos" 
                  name="Nuevos Alumnos" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2 }} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="NuevosPremium" 
                  name="Nuevos Premium" 
                  stroke="#eab308" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2 }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#334155', marginBottom: '20px', letterSpacing: '-0.3px' }}>Contenido de la Plataforma</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        <div style={statCardStyle} className="stat-card">
          <div style={iconContainerStyle('#f8fafc', '#8b5cf6')}>
            <IoBookOutline size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', color: '#64748b', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Cursos</h4>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1', letterSpacing: '-1px' }}>{stats.content.courses}</div>
          </div>
        </div>

        <div style={statCardStyle} className="stat-card">
          <div style={iconContainerStyle('#f8fafc', '#f43f5e')}>
            <IoFolderOpenOutline size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', color: '#64748b', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Workshops</h4>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1', letterSpacing: '-1px' }}>{stats.content.workshops}</div>
          </div>
        </div>

        <div style={statCardStyle} className="stat-card">
          <div style={iconContainerStyle('#f8fafc', '#14b8a6')}>
            <IoVideocamOutline size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', color: '#64748b', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Videoteca</h4>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1', letterSpacing: '-1px' }}>{stats.content.videoteca}</div>
          </div>
        </div>

        <div style={statCardStyle} className="stat-card">
          <div style={iconContainerStyle('#f8fafc', '#ef4444')}>
            <IoNewspaperOutline size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', color: '#64748b', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Blog</h4>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: '1', letterSpacing: '-1px' }}>{stats.content.blogs}</div>
          </div>
        </div>

      </div>

      <style>{`
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01) !important;
          border-color: #e2e8f0 !important;
        }
        .clickable-card:hover {
          border-color: #10b981 !important;
        }
      `}</style>

      {/* Enrollments Modal */}
      {showEnrollmentsModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          fontFamily: 'var(--font-sans)',
          backdropFilter: 'blur(8px)',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '32px',
            width: '100%',
            maxWidth: '520px',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Desglose de Inscripciones</h3>
              <button 
                onClick={() => setShowEnrollmentsModal(false)} 
                style={{ background: 'transparent', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', padding: 0 }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
              >
                <IoCloseOutline size={20} />
              </button>
            </div>
            
            {stats.enrollmentsBreakdown && stats.enrollmentsBreakdown.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.enrollmentsBreakdown.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '16px', 
                    backgroundColor: '#ffffff', 
                    borderRadius: '16px', 
                    border: '1px solid #f1f5f9', 
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'; }}
                  >
                    <div style={{ flex: 1, marginRight: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0,
                        backgroundColor: item.contentType === 'course' ? '#f5f3ff' : '#fff1f2',
                        color: item.contentType === 'course' ? '#8b5cf6' : '#f43f5e'
                      }}>
                        {item.contentType === 'course' ? <IoBookOutline size={20} /> : <IoFolderOpenOutline size={20} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px', marginBottom: '2px', lineHeight: '1.3' }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                          {item.contentType === 'course' ? 'Curso' : 'Workshop'}
                        </div>
                      </div>
                    </div>
                    <div style={{ 
                      backgroundColor: '#f8fafc', 
                      color: '#0f172a', 
                      fontWeight: '700', 
                      padding: '6px 12px', 
                      borderRadius: '8px', 
                      fontSize: '14px', 
                      minWidth: '80px', 
                      textAlign: 'center',
                      border: '1px solid #e2e8f0'
                    }}>
                      {item.count} <span style={{ color: '#64748b', fontWeight: '500', fontSize: '12px' }}>alumnos</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                <p style={{ fontWeight: '500', margin: 0 }}>No hay inscripciones registradas todavía.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Kinvent Certifications Table */}
      <div style={{ marginTop: '32px', backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 30px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <IoNewspaperOutline size={24} color="#1f75f5ff" />
          Certificaciones Kinvent Emitidas
        </h3>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
          Listado de alumnos que completaron el 100% de una formación con certificación oficial de Kinvent.
        </p>

        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Buscar por alumno, email o formación..."
            value={kinventSearch}
            onChange={(e) => setKinventSearch(e.target.value)}
            style={{ width: '100%', maxWidth: '400px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          />
        </div>

        {kinventLoading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Cargando certificaciones...</div>
        ) : kinventCertifications.length > 0 ? (
          <>
            {(() => {
              const filteredKinvent = kinventCertifications.filter((cert) => {
                const s = kinventSearch.toLowerCase();
                return cert.studentName?.toLowerCase().includes(s) || cert.studentEmail?.toLowerCase().includes(s) || cert.contentTitle?.toLowerCase().includes(s);
              });
              const pendingKinvent = filteredKinvent.filter(c => !c.isSent);
              const historyKinvent = filteredKinvent.filter(c => c.isSent);

              const renderTable = (items, title) => (
                <div style={{ marginBottom: '32px' }}>
                  {items.length === 0 ? (
                     <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                       <p style={{ color: '#64748b', fontSize: '15px', margin: 0, fontWeight: '500' }}>No se encontraron alumnos en esta categoría.</p>
                     </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ padding: '16px', color: '#475569', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase' }}>Fecha</th>
                            <th style={{ padding: '16px', color: '#475569', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase' }}>Alumno</th>
                            <th style={{ padding: '16px', color: '#475569', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase' }}>Email</th>
                            <th style={{ padding: '16px', color: '#475569', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase' }}>Formación</th>
                            <th style={{ padding: '16px', color: '#475569', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase' }}>Estado</th>
                            <th style={{ padding: '16px', color: '#475569', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase' }}>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((cert) => (
                            <tr key={cert._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                                {new Date(cert.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </td>
                              <td style={{ padding: '16px', color: '#0f172a', fontSize: '14px', fontWeight: '600' }}>
                                {cert.studentName}
                              </td>
                              <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                                {cert.studentEmail}
                              </td>
                              <td style={{ padding: '16px', color: '#0f172a', fontSize: '14px', fontWeight: '500' }}>
                                {cert.contentTitle}
                              </td>
                              <td style={{ padding: '16px' }}>
                                <span style={{ 
                                  padding: '6px 12px', 
                                  borderRadius: '20px', 
                                  fontSize: '12px', 
                                  fontWeight: '800',
                                  backgroundColor: cert.isSent ? '#dcfce7' : '#fee2e2',
                                  color: cert.isSent ? '#166534' : '#991b1b'
                                }}>
                                  {cert.isSent ? 'Mail Enviado' : 'Pendiente'}
                                </span>
                              </td>
                              <td style={{ padding: '16px' }}>
                                <button
                                  onClick={() => toggleKinventSentStatus(cert._id)}
                                  style={{
                                    padding: '6px 12px',
                                    backgroundColor: cert.isSent ? '#f1f5f9' : '#1f75f5ff',
                                    color: cert.isSent ? '#64748b' : '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: '700',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                  }}
                                >
                                  {cert.isSent ? 'Mover a Pendiente' : 'Marcar como Enviado'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );

              return (
                <>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <button
                      onClick={() => setKinventTab('pending')}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '20px',
                        border: 'none',
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: kinventTab === 'pending' ? '#0f172a' : '#f1f5f9',
                        color: kinventTab === 'pending' ? '#ffffff' : '#64748b'
                      }}
                    >
                      Pendientes ({pendingKinvent.length})
                    </button>
                    <button
                      onClick={() => setKinventTab('history')}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '20px',
                        border: 'none',
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: kinventTab === 'history' ? '#0f172a' : '#f1f5f9',
                        color: kinventTab === 'history' ? '#ffffff' : '#64748b'
                      }}
                    >
                      Historial ({historyKinvent.length})
                    </button>
                  </div>

                  {kinventTab === 'pending' 
                    ? renderTable(pendingKinvent, 'Pendientes')
                    : renderTable(historyKinvent, 'Historial (Enviados)')
                  }
                </>
              );
            })()}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b', margin: 0, fontWeight: '500' }}>Aún no hay alumnos con certificación Kinvent completada.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStatsTab;
