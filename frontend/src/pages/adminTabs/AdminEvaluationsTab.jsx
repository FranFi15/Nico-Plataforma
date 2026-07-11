import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { IoSaveOutline } from 'react-icons/io5';

const AdminEvaluationsTab = () => {
  const navigate = useNavigate();
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
