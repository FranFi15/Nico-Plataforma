import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { IoWarningOutline, IoTicketOutline, IoCloseCircleOutline } from 'react-icons/io5';

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

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [subscriptionPlan, setSubscriptionPlan] = useState(null);

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
    } else {
      // Load subscription plan details for Flow B
      const fetchPlan = async () => {
        try {
          const res = await api.get('/subscription-plan');
          if (res.data && res.data.data) {
            setSubscriptionPlan(res.data.data);
          }
        } catch (err) {
          console.error('Error cargando plan de suscripción:', err);
        }
      };
      fetchPlan();
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
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api.post('/coupons/validate', { code: couponCodeInput.trim(), courseId: contentId });
      if (res.data && res.data.valid) {
        setAppliedCoupon(res.data);
        setCouponError('');
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || 'Cupón inválido o expirado.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePurchase = async (gateway) => {
    setProcessingGateway(gateway);
    try {
      const endpoint = gateway === 'mp'
        ? '/payments/mercadopago/checkout'
        : '/payments/paypal/checkout';

      const response = await api.post(endpoint, {
        contentId,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined
      });
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
          <div style={{ marginBottom: '20px' }}>
            <IoWarningOutline size={44} color="#ef4444" />
          </div>
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
                <span className={`lift-badge ${content.contentType === 'course' ? 'badge-course' : content.contentType === 'workshop' ? '' : 'badge-blog'
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
              {(() => {
                const memberPct = content.memberDiscountPercentage !== undefined && content.memberDiscountPercentage !== null && content.memberDiscountPercentage !== '' ? Number(content.memberDiscountPercentage) : 0;
                const hasMemberDiscount = isSubscribed && memberPct > 0;
                const couponPct = appliedCoupon ? Number(appliedCoupon.discountPercentage) : 0;

                const origUsd = content.priceUsd !== undefined ? content.priceUsd : (content.price || 0);
                const origArs = content.priceArs || 0;

                let calcUsd = origUsd;
                let calcArs = origArs;
                if (hasMemberDiscount) {
                  calcUsd = calcUsd * (1 - memberPct / 100);
                  calcArs = calcArs * (1 - memberPct / 100);
                }
                if (couponPct > 0) {
                  calcUsd = calcUsd * (1 - couponPct / 100);
                  calcArs = calcArs * (1 - couponPct / 100);
                }

                return (
                  <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#6b7280', marginTop: '4px' }}>Total a facturar:</span>
                    <div>
                      {hasMemberDiscount || couponPct > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                              <span style={{ fontSize: '22px', fontWeight: '900', color: '#051020' }}>
                                USD ${calcUsd.toFixed(2)}
                              </span>
                              <span style={{ fontSize: '14px', color: '#9ca3af', textDecoration: 'line-through' }}>
                                ${origUsd.toFixed(2)}
                              </span>
                            </div>
                            {origArs > 0 && (
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <span style={{ fontSize: '18px', fontWeight: '800', color: '#6b7280' }}>
                                  ARS ${Math.round(calcArs).toLocaleString()}
                                </span>
                                <span style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through' }}>
                                  ${origArs.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                          {hasMemberDiscount && (
                            <span className="lift-badge " style={{ fontSize: '9px', fontWeight: '800', background: 'rgba(249, 115, 22, 0.12)', color: '#051020', borderColor: 'rgba(249, 115, 22, 0.3)' }}>
                              ✓ Descuento del {memberPct}% por ser Miembro Premium
                            </span>
                          )}
                          {couponPct > 0 && (
                            <span className="lift-badge " style={{ fontSize: '10px', fontWeight: '800', background: 'rgba(16, 185, 129, 0.12)', color: '#047857', borderColor: 'rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <IoTicketOutline size={13} /> Cupón {appliedCoupon.code} aplicado (-{couponPct}%)
                            </span>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{ fontSize: '22px', fontWeight: '900', color: '#051020' }}>
                            USD ${origUsd.toFixed(2)}
                          </span>
                          {origArs > 0 && (
                            <span style={{ fontSize: '18px', fontWeight: '800', color: '#6b7280' }}>
                              ARS ${origArs.toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Coupon Code Input Section */}
            <div style={{
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '24px'
            }}>
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="¿Tienes un código de descuento?"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  disabled={appliedCoupon !== null || couponLoading}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: '800',
                    color: '#0f172a',
                    textTransform: 'uppercase'
                  }}
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={() => { setAppliedCoupon(null); setCouponCodeInput(''); }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '12px',
                      border: '1px solid #fecaca',
                      backgroundColor: '#fff1f2',
                      color: '#ef4444',
                      fontWeight: '800',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Quitar Cupón
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCodeInput.trim()}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: '#1f75f5ff',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    {couponLoading ? 'Verificando...' : 'Aplicar'}
                  </button>
                )}
              </form>
              {couponError && (
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#ef4444', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IoCloseCircleOutline size={16} /> {couponError}
                </p>
              )}
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
              {subscriptionPlan?.title || 'Suscripción Mensual'}
            </h2>
            <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '30px', textAlign: 'center' }}>
              {subscriptionPlan?.description || 'Acceso exclusivo de la plataforma con todos los contenidos desbloqueados'}
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

              <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#051020', marginBottom: '8px', letterSpacing: '0.5px' }}>
                ACCESO MENSUAL
              </h3>

              <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>
                  <span style={{ fontSize: '42px', fontWeight: '900', color: '#009ee3' }}>${subscriptionPlan?.mpAmount ?? 1990}</span>
                  <span style={{ color: '#6b7280', fontSize: '16px', fontWeight: '700' }}> ARS / mes</span>
                </div>
                <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>
                  <strong style={{ color: '#003087' }}>US${subscriptionPlan?.paypalAmount ?? 15} USD</strong> / mes
                </div>
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
                  Acceso a workshops, artículos y otros contenidos para miembros.
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '10px', lineHeight: '1.4' }}>
                  <span style={{ color: '#051020', fontWeight: 'bold', fontSize: '16px' }}>✓</span>
                  Descuentos excluisvos, en marcas asociadas.
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
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {processingGateway === 'mp' ? 'Procesando conexión...' : `Suscribirse con Mercado Pago ($${subscriptionPlan?.mpAmount ?? 1990} ARS)`}
              </button>

              <button
                onClick={() => handleSubscribe('paypal')}
                disabled={processingGateway !== null}
                className="btn-primary"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0079c1 0%, #00457c 100%)',
                  boxShadow: '0 4px 15px rgba(0, 121, 193, 0.2)',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {processingGateway === 'paypal' ? 'Procesando conexión...' : `Suscribirse con PayPal (US$${subscriptionPlan?.paypalAmount ?? 15} USD)`}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutPage;
