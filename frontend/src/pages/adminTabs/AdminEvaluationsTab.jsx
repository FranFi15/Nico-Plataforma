import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { IoSaveOutline, IoTrashOutline, IoAddCircleOutline } from 'react-icons/io5';

const AdminEvaluationsTab = () => {
  const navigate = useNavigate();
  const [evalConfig, setEvalConfig] = useState({
    colectivoPdfUrl: '/Evaluaciones_Kinvent.pdf',
    colectivoFormLink: 'https://docs.google.com/forms/d/e/1FAIpQLSeAJwoKDSgk7M03ZwGfbyfE1KuM4PEAQlJNlhlFov5MlKXf0Q/viewform',
    colectivoVideos: [],
    individualPdfUrl: '/Evaluaciones_Kinvent.pdf',
    individualFormLink: 'https://docs.google.com/forms/d/e/1FAIpQLSeAJwoKDSgk7M03ZwGfbyfE1KuM4PEAQlJNlhlFov5MlKXf0Q/viewform',
    individualVideos: []
  });
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalUploading, setEvalUploading] = useState({ colectivo: false, individual: false });
  const [evalMessage, setEvalMessage] = useState('');

  const [newIndividualVideo, setNewIndividualVideo] = useState('');
  const [newColectivoVideo, setNewColectivoVideo] = useState('');

  const handleAddVideo = (type) => {
    if (type === 'individual' && newIndividualVideo.trim()) {
      setEvalConfig(prev => ({
        ...prev,
        individualVideos: [...(prev.individualVideos || []), newIndividualVideo.trim()]
      }));
      setNewIndividualVideo('');
    } else if (type === 'colectivo' && newColectivoVideo.trim()) {
      setEvalConfig(prev => ({
        ...prev,
        colectivoVideos: [...(prev.colectivoVideos || []), newColectivoVideo.trim()]
      }));
      setNewColectivoVideo('');
    }
  };

  const handleRemoveVideo = (type, indexToRemove) => {
    if (type === 'individual') {
      setEvalConfig(prev => ({
        ...prev,
        individualVideos: (prev.individualVideos || []).filter((_, idx) => idx !== indexToRemove)
      }));
    } else if (type === 'colectivo') {
      setEvalConfig(prev => ({
        ...prev,
        colectivoVideos: (prev.colectivoVideos || []).filter((_, idx) => idx !== indexToRemove)
      }));
    }
  };

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

  useEffect(() => {
    fetchEvalConfig();
  }, []);

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
          setEvalMessage(`PDF subido correctamente para ${type === 'colectivo' ? 'Colectivo' : 'Individual'}. Haz clic en Guardar Configuración para aplicar.`);
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

  return (
    <div>
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
          Gestión de Evaluaciones Kinvent & Protocolos
        </h2>

        {evalMessage && (
          <div style={{
            padding: '12px 18px',
            backgroundColor: evalMessage.includes('Error') ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${evalMessage.includes('Error') ? '#f87171' : '#4ade80'}`,
            color: evalMessage.includes('Error') ? '#dc2626' : '#16a34a',
            borderRadius: '10px',
            fontWeight: '700',
            marginBottom: '24px'
          }}>
            {evalMessage}
          </div>
        )}

        <form onSubmit={handleSaveEvalConfig}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 20px 0', paddingTop: '24px' }}>
            Configuración General de Documentos y Enlaces
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            {/* Evaluación Individual Configuration */}
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1f75f5ff', margin: '0 0 14px 0' }}>Configuración Individual</h4>

              <div className="form-group">
                <label className="form-label">Link de Google Form (Individual)</label>
                <input
                  type="url"
                  className="premium-input"
                  value={evalConfig.individualFormLink || ''}
                  onChange={(e) => setEvalConfig({ ...evalConfig, individualFormLink: e.target.value })}
                  placeholder="https://docs.google.com/forms/..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Archivo PDF de Protocolo (Individual)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleUploadEvalPdf('individual', e)}
                    style={{ flex: 1 }}
                    disabled={evalUploading.individual}
                  />
                </div>
                {evalUploading.individual && <p style={{ fontSize: '12px', color: '#1f75f5ff', fontWeight: 'bold' }}>Subiendo PDF...</p>}
                {evalConfig.individualPdfUrl && (
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                    Actual: <a href={evalConfig.individualPdfUrl} target="_blank" rel="noreferrer" style={{ color: '#1f75f5ff', fontWeight: 'bold' }}>Ver PDF asignado</a>
                  </p>
                )}
              </div>

              <div className="form-group" style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Videos Shorts (Demostración Individual)</span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>YouTube Shorts / Reels</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="url"
                    className="premium-input"
                    value={newIndividualVideo}
                    onChange={(e) => setNewIndividualVideo(e.target.value)}
                    placeholder="https://www.youtube.com/shorts/..."
                    style={{ flex: 1, fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddVideo('individual')}
                    className="btn-primary"
                    style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                  >
                    <IoAddCircleOutline size={16} /> Agregar URL
                  </button>
                </div>

                {(!evalConfig.individualVideos || evalConfig.individualVideos.length === 0) ? (
                  <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No hay videos cargados aún.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {evalConfig.individualVideos.map((url, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px' }}>
                        <span style={{ fontSize: '12px', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }} title={url}>
                          {url}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo('individual', idx)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                          title="Eliminar video"
                        >
                          <IoTrashOutline size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Evaluación Colectiva Configuration */}
            <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1f75f5ff', margin: '0 0 14px 0' }}>Configuración Colectiva</h4>

              <div className="form-group">
                <label className="form-label">Link de Google Form (Colectivo)</label>
                <input
                  type="url"
                  className="premium-input"
                  value={evalConfig.colectivoFormLink || ''}
                  onChange={(e) => setEvalConfig({ ...evalConfig, colectivoFormLink: e.target.value })}
                  placeholder="https://docs.google.com/forms/..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Archivo PDF de Protocolo (Colectivo)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleUploadEvalPdf('colectivo', e)}
                    style={{ flex: 1 }}
                    disabled={evalUploading.colectivo}
                  />
                </div>
                {evalUploading.colectivo && <p style={{ fontSize: '12px', color: '#1f75f5ff', fontWeight: 'bold' }}>Subiendo PDF...</p>}
                {evalConfig.colectivoPdfUrl && (
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                    Actual: <a href={evalConfig.colectivoPdfUrl} target="_blank" rel="noreferrer" style={{ color: '#1f75f5ff', fontWeight: 'bold' }}>Ver PDF asignado</a>
                  </p>
                )}
              </div>

              <div className="form-group" style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Videos Shorts (Demostración Colectiva)</span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>YouTube Shorts / Reels</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="url"
                    className="premium-input"
                    value={newColectivoVideo}
                    onChange={(e) => setNewColectivoVideo(e.target.value)}
                    placeholder="https://www.youtube.com/shorts/..."
                    style={{ flex: 1, fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddVideo('colectivo')}
                    className="btn-primary"
                    style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                  >
                    <IoAddCircleOutline size={16} /> Agregar URL
                  </button>
                </div>

                {(!evalConfig.colectivoVideos || evalConfig.colectivoVideos.length === 0) ? (
                  <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No hay videos cargados aún.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {evalConfig.colectivoVideos.map((url, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px' }}>
                        <span style={{ fontSize: '12px', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }} title={url}>
                          {url}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo('colectivo', idx)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                          title="Eliminar video"
                        >
                          <IoTrashOutline size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={evalLoading}
            style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <IoSaveOutline size={18} /> {evalLoading ? 'Guardando Configuración...' : 'Guardar Configuración de Evaluaciones'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminEvaluationsTab;
