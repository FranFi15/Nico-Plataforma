import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { IoCardOutline, IoLogoPaypal, IoCashOutline, IoSaveOutline, IoInformationCircleOutline } from 'react-icons/io5';

const AdminSubscriptionsTab = ({ formMessage, setFormMessage }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState('Suscripción Premium Mensual');
  const [description, setDescription] = useState('Acceso total e ilimitado a todos los entrenamientos, workshops, videoteca y descuentos exclusivos por un mes.');
  
  // Mercado Pago & PayPal Precios
  const [mpAmount, setMpAmount] = useState(1990);
  const [paypalAmount, setPaypalAmount] = useState(15);

  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchSubscriptionPlan();
  }, []);

  const fetchSubscriptionPlan = async () => {
    setLoading(true);
    try {
      const res = await api.get('/subscription-plan');
      if (res.data && res.data.data) {
        const p = res.data.data;
        setTitle(p.title || 'Suscripción Premium Mensual');
        setDescription(p.description || '');
        setMpAmount(p.mpAmount ?? 1990);
        setPaypalAmount(p.paypalAmount ?? 15);
        setIsActive(p.isActive ?? true);
      }
    } catch (err) {
      console.error('Error cargando configuración de suscripción:', err);
      if (setFormMessage) setFormMessage('Error al cargar la configuración de la suscripción');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (setFormMessage) setFormMessage('');

    try {
      const res = await api.put('/subscription-plan', {
        title,
        description,
        mpAmount: Number(mpAmount),
        paypalAmount: Number(paypalAmount),
        isActive
      });

      if (res.data && res.data.success) {
        if (setFormMessage) setFormMessage('¡Precios de la suscripción mensual actualizados con éxito!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Error al guardar suscripción:', err);
      if (setFormMessage) setFormMessage(err.response?.data?.message || 'Error al guardar los cambios en el servidor.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280', fontSize: '16px', fontWeight: 'bold' }}>
        Cargando configuración de la suscripción...
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Cabecera explicativa */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '2px solid #e2e8f0',
        borderRadius: '20px',
        padding: '24px 30px',
        marginBottom: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: 'rgba(31, 117, 245, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          fontSize: '28px',
          flexShrink: 0
        }}>
          <IoCardOutline />
        </div>
        <div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>
            Precios de Suscripción Premium Mensual
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
            Ajusta los precios mensuales en <strong>Mercado Pago (ARS $)</strong> para alumnos de Argentina y en <strong>PayPal (USD $)</strong> para alumnos internacionales.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Tarjetas de Precios (MP vs PayPal) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '30px', marginBottom: '30px' }}>
          
          {/* Tarjeta Mercado Pago */}
          <div className="admin-panel-card" style={{ margin: 0, borderTop: '6px solid #009ee3', display: 'flex', flexDirection: 'column', justifyItems: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <span style={{ fontSize: '26px', color: '#009ee3', display: 'flex' }}><IoCashOutline /></span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>
                  Mercado Pago (Argentina)
                </h3>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Precio Membresía Mensual ($ ARS)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '22px', fontWeight: '900', color: '#009ee3' }}>$</span>
                  <input
                    type="number"
                    className="premium-input"
                    value={mpAmount}
                    onChange={(e) => setMpAmount(e.target.value)}
                    placeholder="1990"
                    required
                    min="0"
                    step="1"
                    style={{ fontWeight: '800', fontSize: '20px', color: '#009ee3' }}
                  />
                  <span style={{ fontWeight: '800', color: '#64748b' }}>ARS</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', padding: '12px 16px', backgroundColor: 'rgba(0, 158, 227, 0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IoInformationCircleOutline style={{ fontSize: '20px', color: '#009ee3', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600' }}>
                Se cobrará automáticamente <strong>${mpAmount} ARS</strong> cada mes a los alumnos que se suscriban por Mercado Pago.
              </span>
            </div>
          </div>

          {/* Tarjeta PayPal */}
          <div className="admin-panel-card" style={{ margin: 0, borderTop: '6px solid #003087', display: 'flex', flexDirection: 'column', justifyItems: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <span style={{ fontSize: '26px', color: '#003087', display: 'flex' }}><IoLogoPaypal /></span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>
                  PayPal (Internacional)
                </h3>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Precio Membresía Mensual ($ USD)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '22px', fontWeight: '900', color: '#003087' }}>US$</span>
                  <input
                    type="number"
                    className="premium-input"
                    value={paypalAmount}
                    onChange={(e) => setPaypalAmount(e.target.value)}
                    placeholder="15"
                    required
                    min="0"
                    step="0.01"
                    style={{ fontWeight: '800', fontSize: '20px', color: '#003087' }}
                  />
                  <span style={{ fontWeight: '800', color: '#64748b' }}>USD</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', padding: '12px 16px', backgroundColor: 'rgba(0, 48, 135, 0.08)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IoInformationCircleOutline style={{ fontSize: '20px', color: '#003087', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: '600' }}>
                Los usuarios extranjeros que elijan PayPal pagarán <strong>US${paypalAmount} USD</strong> por su membresía mensual.
              </span>
            </div>
          </div>

        </div>

        {/* Tarjeta General (Título / Descripción en Checkout) */}
        <div className="admin-panel-card" style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', textTransform: 'uppercase' }}>
            Información mostrada en página de Checkout (`/checkout`)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Título Público del Plan</label>
              <input
                type="text"
                className="premium-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Suscripción Premium Mensual"
                required
              />
            </div>
            <div>
              <label className="form-label">Descripción del Plan</label>
              <textarea
                className="premium-input"
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Acceso ilimitado a todos los cursos..."
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '6px' }}>
              <input
                type="checkbox"
                id="isActivePlan"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="isActivePlan" style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', cursor: 'pointer' }}>
                Venta de Membresía habilitada y visible para los usuarios
              </label>
            </div>
          </div>
        </div>

        {/* Botón Guardar Cambios */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 36px',
              fontSize: '15px',
              boxShadow: '0 6px 16px rgba(31, 117, 245, 0.3)',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            <IoSaveOutline style={{ fontSize: '20px' }} />
            {saving ? 'Guardando cambios...' : 'Guardar Precios de Suscripción'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSubscriptionsTab;
