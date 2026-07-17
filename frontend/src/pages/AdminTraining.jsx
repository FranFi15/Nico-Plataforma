import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import Modular Tabs
import AdminTrainingsTab from './adminTabs/AdminTrainingsTab';
import AdminHomeTab from './adminTabs/AdminHomeTab';
import AdminBlogsTab from './adminTabs/AdminBlogsTab';
import AdminWorkshopsTab from './adminTabs/AdminWorkshopsTab';
import AdminVideotecaTab from './adminTabs/AdminVideotecaTab';
import AdminEvaluationsTab from './adminTabs/AdminEvaluationsTab';
import AdminZoomTab from './adminTabs/AdminZoomTab';
import AdminDiscountsTab from './adminTabs/AdminDiscountsTab';
import AdminSubscriptionsTab from './adminTabs/AdminSubscriptionsTab';

const AdminTraining = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Active Tab: 'trainings', 'blogs', 'workshops', 'videoteca', 'evaluations'
  const [activeTab, setActiveTab] = useState('trainings');
  const [formMessage, setFormMessage] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        navigate('/');
      }
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '100px 0',
        fontSize: '18px',
        color: '#6b7280',
        fontFamily: 'var(--font-sans)'
      }}>
        Verificando sesión de administrador...
      </div>
    );
  }

  return (
    <div className="admin-panel animate-fade-in" style={{
      maxWidth: '1600px',
      margin: '0 auto',
      padding: '40px 20px 80px 20px',
      fontFamily: 'var(--font-sans)'
    }}>
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
            margin: '0 0 8px 0',
            color: '#ffffff'
          }}>
            Panel de Control Privado
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
            Administrador: {user?.name} • Sube planes, escribe artículos, gestiona workshops y organiza la videoteca.
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

      <style>{`
        .admin-tab-btn {
          padding: 12px 24px !important;
          font-size: 13px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
          cursor: pointer !important;
          border-radius: 24px !important;
          border: 2px solid #2B2D2F !important;
          background-color: #ffffff !important;
          color: #2B2D2F !important;
          transition: all 0.2s ease !important;
          font-family: var(--font-sans) !important;
        }
        .admin-tab-btn:hover {
          background-color: #f1f5f9 !important;
        }
        .admin-tab-btn.active {
          background-color: #2B2D2F !important;
          color: #ffffff !important;
          border-color: #2B2D2F !important;
          box-shadow: 0 4px 12px rgba(43, 45, 47, 0.2) !important;
        }
        .btn-primary {
          background-color: #1f75f5ff !important;
          color: #ffffff !important;
          border: none !important;
          border-radius: 12px !important;
          padding: 12px 24px !important;
          font-weight: 800 !important;
          font-size: 13px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }
        .btn-primary:hover {
          background-color: #165bb8 !important;
          box-shadow: 0 4px 12px rgba(31, 117, 245, 0.25) !important;
        }
        .btn-secondary {
          background-color: #e2e8f0 !important;
          color: #0f172a !important;
          border: none !important;
          border-radius: 12px !important;
          padding: 12px 24px !important;
          font-weight: 800 !important;
          font-size: 13px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          text-transform: uppercase !important;
        }
        .btn-secondary:hover {
          background-color: #cbd5e1 !important;
        }
        .btn-danger {
          background-color: transparent !important;
          color: #ef4444 !important;
          border: 1px solid #fecaca !important;
          border-radius: 10px !important;
          padding: 10px 20px !important;
          font-weight: bold !important;
          font-size: 13px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          text-transform: uppercase !important;
        }
        .btn-danger:hover {
          background-color: #ef4444 !important;
          color: #ffffff !important;
          border-color: #ef4444 !important;
        }
        .admin-panel-card {
          background-color: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
        }
        .premium-input {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          font-size: 14px;
          color: #0f172a;
          background-color: #ffffff;
          transition: all 0.2s ease;
          font-family: var(--font-sans);
          box-sizing: border-box;
        }
        .premium-input:focus {
          outline: none;
          border-color: #1f75f5ff;
          box-shadow: 0 0 0 3px rgba(31, 117, 245, 0.15);
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '40px',
        borderBottom: '2px solid #2B2D2F',
        paddingBottom: '16px',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'home', label: 'Home' },
          { id: 'trainings', label: 'Entrenamiento a Distancia' },
          { id: 'blogs', label: 'Blogs & Artículos' },
          { id: 'workshops', label: 'Workshops & Capacitaciones' },
          { id: 'videoteca', label: 'Videoteca' },
          { id: 'evaluations', label: 'Evaluaciones' },
          { id: 'zoomevents', label: 'Noticias & Zoom' },
          { id: 'discounts', label: 'Descuentos & Beneficios' },
          { id: 'subscriptions', label: 'Precios & Membresía' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setFormMessage('');
              }}
              className={`admin-tab-btn ${isActive ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Global Form Message Banner */}
      {formMessage && (
        <div style={{
          backgroundColor: formMessage.startsWith('Error') ? 'rgba(239, 68, 68, 0.08)' : 'rgba(113, 223, 190, 0.08)',
          border: `1px solid ${formMessage.startsWith('Error') ? '#ef4444' : '#3b82f6'}`,
          color: formMessage.startsWith('Error') ? '#ef4444' : '#0f172a',
          padding: '16px 24px',
          borderRadius: '12px',
          fontWeight: '700',
          marginBottom: '30px'
        }}>
          {formMessage}
        </div>
      )}

      {/* Render Active Tab Module */}
      <div className="tab-content animate-fade-in">
        {activeTab === 'home' && (
          <AdminHomeTab formMessage={formMessage} setFormMessage={setFormMessage} />
        )}
        {activeTab === 'trainings' && (
          <AdminTrainingsTab formMessage={formMessage} setFormMessage={setFormMessage} />
        )}
        {activeTab === 'blogs' && (
          <AdminBlogsTab formMessage={formMessage} setFormMessage={setFormMessage} />
        )}
        {activeTab === 'workshops' && (
          <AdminWorkshopsTab formMessage={formMessage} setFormMessage={setFormMessage} />
        )}
        {activeTab === 'videoteca' && (
          <AdminVideotecaTab formMessage={formMessage} setFormMessage={setFormMessage} />
        )}
        {activeTab === 'evaluations' && (
          <AdminEvaluationsTab />
        )}
        {activeTab === 'zoomevents' && (
          <AdminZoomTab formMessage={formMessage} setFormMessage={setFormMessage} />
        )}
        {activeTab === 'discounts' && (
          <AdminDiscountsTab formMessage={formMessage} setFormMessage={setFormMessage} />
        )}
        {activeTab === 'subscriptions' && (
          <AdminSubscriptionsTab formMessage={formMessage} setFormMessage={setFormMessage} />
        )}
      </div>
    </div>
  );
};

export default AdminTraining;
