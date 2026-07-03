import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const contentId = searchParams.get('contentId');

  // Loading and State management
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingGateway, setProcessingGateway] = useState(null); // 'mp' or 'paypal'
  const [error, setError] = useState('');

  const isSubscribed = user && (user.membership === 'premium' || user.isSubscribed === true);

  // Load course details if contentId is provided
  useEffect(() => {
    if (contentId) {
      const fetchCourseDetails = async () => {
        setLoading(true);
        try {
          // Fetch catalog to bypass access validation checks
          const response = await api.get('/content');
          if (response.data && response.data.success) {
            const foundContent = response.data.data.find(item => item._id === contentId);
            if (foundContent) {
              setContent(foundContent);
            } else {
              setError('Contenido no encontrado');
            }
          }
        } catch (err) {
          setError('Error al cargar la información del contenido');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchCourseDetails();
    }
  }, [contentId]);

  // Subscription Actions
  const handleSubscribe = async (gateway) => {
    setProcessingGateway(gateway);
    try {
      const endpoint = gateway === 'mp' 
        ? '/payments/mercadopago/subscribe' 
        : '/payments/paypal/subscribe';

      const response = await api.post(endpoint);
      if (response.data && response.data.success) {
        // Redirect to gateway init URL
        const redirectUrl = gateway === 'mp'
          ? (response.data.sandboxInitPoint || response.data.initPoint)
          : response.data.approvalUrl;

        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          alert('Error: URL de redirección no disponible');
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al procesar la suscripción');
      console.error(err);
    } finally {
      setProcessingGateway(null);
    }
  };

  // One-time checkout actions
  const handlePurchase = async (gateway) => {
    setProcessingGateway(gateway);
    try {
      const endpoint = gateway === 'mp'
        ? '/payments/mercadopago/checkout'
        : '/payments/paypal/checkout';

      const response = await api.post(endpoint, { contentId });
      if (response.data && response.data.success) {
        // Redirect to gateway init URL
        const redirectUrl = gateway === 'mp'
          ? (response.data.sandboxInitPoint || response.data.initPoint)
          : response.data.approvalUrl;

        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          alert('Error: URL de redirección no disponible');
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al procesar la compra');
      console.error(err);
    } finally {
      setProcessingGateway(null);
    }
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="premium-card" style={{ width: '100%', maxWidth: '440px', textAlign: 'center', border: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>🔒</div>
          <h2 className="" style={{ fontSize: '28px', fontWeight: '900', marginBottom: '12px', textTransform: 'uppercase' }}>
            Acceso Restringido
          </h2>
          <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '24px', lineHeight: '1.5' }}>
            Por favor, inicia sesión con tu cuenta de estudiante para poder proceder con el pago de forma segura.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%' }}>
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: '#6b7280', fontSize: '16px' }}>
        <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite' }}>Cargando información de pago...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="premium-card" style={{ width: '100%', maxWidth: '440px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div style={{ fontSize: '40px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ color: '#ef4444', fontSize: '28px', fontWeight: '900', marginBottom: '12px', textTransform: 'uppercase' }}>
            Error de Pago
          </h2>
          <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '24px', lineHeight: '1.5' }}>
            {error}
          </p>
          <button onClick={() => navigate('/')} className="btn-secondary" style={{ width: '100%' }}>
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  // RENDER FLOWS
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
      <div className="premium-card" style={{ width: '100%', maxWidth: '680px', border: '1px solid #e5e5e5' }}>
        
        {contentId && content ? (
          /* FLOW A: SINGLE CONTENT PURCHASE CHECKOUT */
          <div>
            <h2 className="" style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
              Confirmar Compra
            </h2>
            <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '30px', textAlign: 'center' }}>
              Estás a un paso de obtener acceso de por vida a esta formación deportiva
            </p>

            {/* Course Breakdown Invoice Card */}
            <div style={{ 
              background: '#ffffff', 
              border: '1px solid #e5e5e5', 
              borderRadius: '16px', 
              padding: '24px', 
              marginBottom: '30px' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className={`lift-badge ${
                  content.contentType === 'course' ? 'badge-course' : content.contentType === 'workshop' ? '' : 'badge-blog'
                }`}>
                  {content.contentType === 'course' ? 'Curso Práctico' : content.contentType === 'workshop' ? 'Taller / Workshop' : 'Artículo Científico'}
                </span>
                <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' }}>
                  Pago Único
                </span>
              </div>
              
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '10px' }}>
                {content.title}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                {content.description}
              </p>
              
              {/* Pricing breakdown */}
              <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '15px', fontWeight: '600', color: '#6b7280', marginTop: '4px' }}>Total a facturar:</span>
                <div>
                  {isSubscribed ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '22px', fontWeight: '900', color: '#051020' }}>
                            USD ${( (content.priceUsd !== undefined ? content.priceUsd : (content.price || 0)) * 0.8).toFixed(2)}
                          </span>
                          <span style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'line-through' }}>
                            ${(content.priceUsd !== undefined ? content.priceUsd : (content.price || 0)).toFixed(2)}
                          </span>
                        </div>
                        {content.priceArs > 0 && (
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontSize: '18px', fontWeight: '800', color: '#6b7280' }}>
                              ARS ${Math.round(content.priceArs * 0.8).toLocaleString()}
                            </span>
                            <span style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through' }}>
                              ${content.priceArs.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="lift-badge " style={{ fontSize: '9px', fontWeight: '800', background: 'rgba(249, 115, 22, 0.12)', color: '#051020', borderColor: 'rgba(249, 115, 22, 0.3)' }}>
                        ✓ Ahorro del 20% aplicado por ser Miembro Nico Lift Premium
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{ fontSize: '22px', fontWeight: '900', color: '#051020' }}>
                        USD ${(content.priceUsd !== undefined ? content.priceUsd : (content.price || 0)).toFixed(2)}
                      </span>
                      {content.priceArs > 0 && (
                        <span style={{ fontSize: '18px', fontWeight: '800', color: '#6b7280' }}>
                          ARS ${content.priceArs.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gateway Buttons */}
            <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Selecciona tu pasarela de pago:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button 
                onClick={() => handlePurchase('mp')}
                disabled={processingGateway !== null}
                className="btn-primary" 
                style={{ 
                  width: '100%', 
                  background: 'linear-gradient(135deg, #00b1ea 0%, #009ee3 100%)', 
                  boxShadow: '0 4px 15px rgba(0, 158, 227, 0.2)',
                  padding: '14px'
                }}
              >
                {processingGateway === 'mp' ? 'Procesando conexión...' : 'Pagar de forma segura con Mercado Pago'}
              </button>
              
              <button 
                onClick={() => handlePurchase('paypal')}
                disabled={processingGateway !== null}
                className="btn-primary" 
                style={{ 
                  width: '100%', 
                  background: 'linear-gradient(135deg, #0079c1 0%, #00457c 100%)', 
                  boxShadow: '0 4px 15px rgba(0, 121, 193, 0.2)',
                  padding: '14px'
                }}
              >
                {processingGateway === 'paypal' ? 'Procesando conexión...' : 'Pagar de forma segura con PayPal'}
              </button>
            </div>
          </div>
        ) : (
          /* FLOW B: SUBSCRIPTION PLAN UPGRADE */
          <div>
            <h2 className="" style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
              Membresía Nico Lift
            </h2>
            <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '30px', textAlign: 'center' }}>
              Desbloquea accesos ilimitados y obtén descuentos exclusivos en workshops de biomecánica
            </p>

            {/* Plan Details Card */}
            <div style={{ 
              background: '#ffffff', 
              border: '2px solid rgba(249, 115, 22, 0.25)', 
              borderRadius: '20px', 
              padding: '30px 24px', 
              marginBottom: '30px', 
              textAlign: 'center',
              position: 'relative'
            }}>
              <div className="lift-badge " style={{ 
                position: 'absolute', 
                top: '-12px', 
                left: '50%', 
                transform: 'translateX(-50%)',
                fontSize: '10px',
                fontWeight: '900',
                padding: '6px 14px',
                background: '#051020',
                color: '#fff',
                border: 'none',
                boxShadow: '0 4px 10px rgba(249, 115, 22, 0.4)'
              }}>
                RECOMENDADO
              </div>
              
              <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#051020', marginBottom: '8px', letterSpacing: '0.5px' }}>
                ACCESO ANUAL / MENSUAL ILIMITADO
              </h3>
              
              <div style={{ margin: '20px 0' }}>
                <span style={{ fontSize: '48px', fontWeight: '900', color: '#fff' }}>$19.90</span>
                <span style={{ color: '#6b7280', fontSize: '16px', fontWeight: '600' }}> / mes</span>
              </div>
              
              <ul style={{ 
                listStyle: 'none', 
                padding: '0', 
                margin: '24px 0', 
                color: '#6b7280', 
                fontSize: '14px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px', 
                alignItems: 'flex-start',
                maxWidth: '440px',
                margin: '24px auto'
              }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', lineHeight: '1.4' }}>
                  <span style={{ color: '#051020', fontWeight: 'bold', fontSize: '16px' }}>✓</span>
                  Acceso completo e ilimitado a todos los cursos de preparación física.
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', lineHeight: '1.4' }}>
                  <span style={{ color: '#051020', fontWeight: 'bold', fontSize: '16px' }}>✓</span>
                  Descuento automático del 20% en talleres prácticos y de biomecánica.
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', lineHeight: '1.4' }}>
                  <span style={{ color: '#051020', fontWeight: 'bold', fontSize: '16px' }}>✓</span>
                  Foros de debate prioritario y consultas técnicas con entrenadores y kinesiólogos.
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', lineHeight: '1.4' }}>
                  <span style={{ color: '#051020', fontWeight: 'bold', fontSize: '16px' }}>✓</span>
                  Cancelación fácil en cualquier momento desde tu panel de usuario.
                </li>
              </ul>
            </div>

            {/* Gateway Buttons */}
            <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: '#6b7280', textAlign: 'center', textTransform: 'uppercase' }}>
              Selecciona tu método de pago para suscribirte:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button 
                onClick={() => handleSubscribe('mp')}
                disabled={processingGateway !== null}
                className="btn-primary" 
                style={{ 
                  width: '100%', 
                  background: 'linear-gradient(135deg, #00b1ea 0%, #009ee3 100%)', 
                  boxShadow: '0 4px 15px rgba(0, 158, 227, 0.2)',
                  padding: '14px'
                }}
              >
                {processingGateway === 'mp' ? 'Procesando conexión...' : 'Suscribirse de forma segura con Mercado Pago'}
              </button>
              
              <button 
                onClick={() => handleSubscribe('paypal')}
                disabled={processingGateway !== null}
                className="btn-primary" 
                style={{ 
                  width: '100%', 
                  background: 'linear-gradient(135deg, #0079c1 0%, #00457c 100%)', 
                  boxShadow: '0 4px 15px rgba(0, 121, 193, 0.2)',
                  padding: '14px'
                }}
              >
                {processingGateway === 'paypal' ? 'Procesando conexión...' : 'Suscribirse de forma segura con PayPal'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutPage;
