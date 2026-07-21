import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { IoStorefrontOutline, IoTicketOutline, IoAdd, IoPencil, IoTrashOutline, IoCheckmarkCircle, IoCloseCircle, IoCloudUploadOutline } from 'react-icons/io5';

const AdminDiscountsTab = ({ formMessage, setFormMessage }) => {
  const [subTab, setSubTab] = useState('benefits'); // 'benefits' | 'coupons'

  // Benefits state
  const [benefits, setBenefits] = useState([]);
  const [loadingBenefits, setLoadingBenefits] = useState(true);
  const [showBenefitForm, setShowBenefitForm] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState(null);

  // Benefit form fields
  const [bTitle, setBTitle] = useState('');
  const [bDescription, setBDescription] = useState('');
  const [bLogoUrl, setBLogoUrl] = useState('');
  const [bDiscountText, setBDiscountText] = useState('');
  const [bLinkUrl, setBLinkUrl] = useState('');
  const [bActive, setBActive] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Coupons state
  const [coupons, setCoupons] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Coupon form fields
  const [cCode, setCCode] = useState('');
  const [cDiscountPercentage, setCDiscountPercentage] = useState(10);
  const [cApplyToAll, setCApplyToAll] = useState(true);
  const [cApplicableCourses, setCApplicableCourses] = useState([]);
  const [cActive, setCActive] = useState(true);
  const [cValidUntil, setCValidUntil] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBenefits();
    fetchCouponsAndCourses();
  }, []);

  const fetchBenefits = async () => {
    setLoadingBenefits(true);
    try {
      const res = await api.get('/benefits');
      setBenefits(res.data || []);
    } catch (err) {
      console.error('Error cargando beneficios:', err);
    } finally {
      setLoadingBenefits(false);
    }
  };

  const fetchCouponsAndCourses = async () => {
    setLoadingCoupons(true);
    try {
      const [couponsRes, coursesRes, workshopsRes] = await Promise.all([
        api.get('/coupons'),
        api.get('/content?type=course'),
        api.get('/content?type=workshop')
      ]);
      setCoupons(couponsRes.data || []);
      const combinedCourses = [...(coursesRes.data?.data || coursesRes.data || []), ...(workshopsRes.data?.data || workshopsRes.data || [])];
      setCoursesList(combinedCourses);
    } catch (err) {
      console.error('Error cargando cupones y cursos:', err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  // Handle Logo Upload via FileReader
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
      });

      const res = await api.post('/trainings/upload', { image: base64String });
      if (res.data && res.data.url) {
        setBLogoUrl(res.data.url);
      }
    } catch (err) {
      console.error('Error subiendo imagen/logo:', err);
      alert('Error al subir la imagen del local.');
    } finally {
      setUploadingLogo(false);
    }
  };

  // BENEFIT HANDLERS
  const handleOpenBenefitForm = (benefit = null) => {
    if (benefit) {
      setEditingBenefit(benefit);
      setBTitle(benefit.title || '');
      setBDescription(benefit.description || '');
      setBLogoUrl(benefit.logoUrl || '');
      setBDiscountText(benefit.discountText || '');
      setBLinkUrl(benefit.linkUrl || '');
      setBActive(benefit.active !== undefined ? benefit.active : true);
    } else {
      setEditingBenefit(null);
      setBTitle('');
      setBDescription('');
      setBLogoUrl('');
      setBDiscountText('');
      setBLinkUrl('');
      setBActive(true);
    }
    setShowBenefitForm(true);
  };

  const handleSaveBenefit = async (e) => {
    e.preventDefault();
    if (!bTitle || !bDescription || !bLogoUrl) {
      alert('Por favor completa el título, descripción e imagen del local.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: bTitle,
        description: bDescription,
        logoUrl: bLogoUrl,
        discountText: bDiscountText,
        linkUrl: bLinkUrl,
        active: bActive
      };

      if (editingBenefit) {
        await api.put(`/benefits/${editingBenefit._id}`, payload);
        if (setFormMessage) setFormMessage('✔ Beneficio actualizado correctamente');
      } else {
        await api.post('/benefits', payload);
        if (setFormMessage) setFormMessage('✔ Beneficio creado correctamente');
      }
      setShowBenefitForm(false);
      fetchBenefits();
      setTimeout(() => { if (setFormMessage) setFormMessage(''); }, 3000);
    } catch (err) {
      console.error('Error guardando beneficio:', err);
      alert(err.response?.data?.message || 'Error al guardar el beneficio');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBenefit = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este beneficio/local?')) return;
    try {
      await api.delete(`/benefits/${id}`);
      fetchBenefits();
    } catch (err) {
      alert('Error al eliminar el beneficio');
    }
  };

  // COUPON HANDLERS
  const handleOpenCouponForm = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCCode(coupon.code || '');
      setCDiscountPercentage(coupon.discountPercentage || 10);
      setCApplyToAll(coupon.applyToAll !== undefined ? coupon.applyToAll : true);
      const courseIds = (coupon.applicableCourses || []).map(c => typeof c === 'object' ? c._id : c);
      setCApplicableCourses(courseIds);
      setCActive(coupon.active !== undefined ? coupon.active : true);
      setCValidUntil(coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '');
    } else {
      setEditingCoupon(null);
      setCCode('');
      setCDiscountPercentage(10);
      setCApplyToAll(true);
      setCApplicableCourses([]);
      setCActive(true);
      setCValidUntil('');
    }
    setShowCouponForm(true);
  };

  const handleToggleCourseSelection = (courseId) => {
    if (cApplicableCourses.includes(courseId)) {
      setCApplicableCourses(cApplicableCourses.filter(id => id !== courseId));
    } else {
      setCApplicableCourses([...cApplicableCourses, courseId]);
    }
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!cCode || !cDiscountPercentage) {
      alert('Por favor completa el código de cupón y el porcentaje de descuento.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: cCode,
        discountPercentage: Number(cDiscountPercentage),
        applyToAll: cApplyToAll,
        applicableCourses: cApplyToAll ? [] : cApplicableCourses,
        active: cActive,
        validUntil: cValidUntil ? new Date(cValidUntil).toISOString() : null
      };

      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, payload);
        if (setFormMessage) setFormMessage('✔ Cupón actualizado correctamente');
      } else {
        await api.post('/coupons', payload);
        if (setFormMessage) setFormMessage('✔ Cupón creado correctamente');
      }
      setShowCouponForm(false);
      fetchCouponsAndCourses();
      setTimeout(() => { if (setFormMessage) setFormMessage(''); }, 3000);
    } catch (err) {
      console.error('Error guardando cupón:', err);
      alert(err.response?.data?.message || 'Error al guardar el cupón de descuento');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este código de descuento?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetchCouponsAndCourses();
    } catch (err) {
      alert('Error al eliminar el cupón');
    }
  };

  return (
    <div>
      {/* Sub-tabs switch */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSubTab('benefits')}
          style={{
            padding: '14px 28px',
            borderRadius: '16px',
            border: 'none',
            backgroundColor: subTab === 'benefits' ? '#1f75f5ff' : '#ffffff',
            color: subTab === 'benefits' ? '#ffffff' : '#0f172a',
            fontWeight: '900',
            fontSize: '15px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s ease',
            border: subTab === 'benefits' ? 'none' : '1px solid #cbd5e1'
          }}
        >
          <IoStorefrontOutline size={20} /> Beneficios & Locales ({benefits.length})
        </button>
        <button
          onClick={() => setSubTab('coupons')}
          style={{
            padding: '14px 28px',
            borderRadius: '16px',
            border: 'none',
            backgroundColor: subTab === 'coupons' ? '#1f75f5ff' : '#ffffff',
            color: subTab === 'coupons' ? '#ffffff' : '#0f172a',
            fontWeight: '900',
            fontSize: '15px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s ease',
            border: subTab === 'coupons' ? 'none' : '1px solid #cbd5e1'
          }}
        >
          <IoTicketOutline size={20} /> Códigos de Descuento ({coupons.length})
        </button>
      </div>

      {/* SECTION 1: BENEFICIOS EN LOCALES */}
      {subTab === 'benefits' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0' }}>
                Beneficios & Alianzas con Locales
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                Sube imágenes/logos, títulos y descripciones de descuentos en marcas y tiendas asociadas para tus alumnos.
              </p>
            </div>
            <button
              onClick={() => handleOpenBenefitForm()}
              style={{
                backgroundColor: '#1f75f5ff',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '14px',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(31,117,245,0.3)'
              }}
            >
              <IoAdd size={18} /> Nuevo Beneficio / Local
            </button>
          </div>

          {/* Benefit Form Modal / Box */}
          {showBenefitForm && (
            <div style={{ backgroundColor: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '20px', padding: '24px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                  {editingBenefit ? 'Editar Beneficio' : 'Nuevo Beneficio / Local'}
                </h3>
                <button onClick={() => setShowBenefitForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '800', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleSaveBenefit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>Título del Local / Beneficio *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. NutriFit Sport / 20% en Suplementos"
                    value={bTitle}
                    onChange={(e) => setBTitle(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>Descripción & Cómo usar el descuento *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Ej. Presenta tu carnet de alumno o menciona el código NICOFIT20 en caja para obtener un 20% de descuento en todos sus productos."
                    value={bDescription}
                    onChange={(e) => setBDescription(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>Texto de Descuento Destacado (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej. 20% OFF / 2x1"
                      value={bDiscountText}
                      onChange={(e) => setBDiscountText(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>Link / Web del Local (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej. https://instagram.com/local o https://tienda.com"
                      value={bLinkUrl}
                      onChange={(e) => setBLinkUrl(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>Imagen / Logo del Local *</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="URL de la imagen o sube un archivo abajo"
                      value={bLogoUrl}
                      onChange={(e) => setBLogoUrl(e.target.value)}
                      style={{ flex: 1, minWidth: '240px', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a' }}
                    />
                    <label style={{
                      backgroundColor: '#e2e8f0',
                      color: '#0f172a',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      fontWeight: '800',
                      fontSize: '13px',
                      cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <IoCloudUploadOutline size={18} /> {uploadingLogo ? 'Subiendo...' : 'Subir Imagen'}
                      <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} disabled={uploadingLogo} />
                    </label>
                  </div>
                  {bLogoUrl && (
                    <div style={{ marginTop: '10px' }}>
                      <img src={bLogoUrl} alt="Logo preview" style={{ height: '70px', borderRadius: '12px', objectFit: 'contain', border: '1px solid #e2e8f0', padding: '6px', backgroundColor: '#ffffff' }} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <input
                    type="checkbox"
                    id="bActive"
                    checked={bActive}
                    onChange={(e) => setBActive(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="bActive" style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', cursor: 'pointer' }}>Beneficio Activo / Visible para alumnos</label>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowBenefitForm(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: '800', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving || uploadingLogo} style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', backgroundColor: '#1f75f5ff', color: '#ffffff', fontWeight: '800', cursor: 'pointer' }}>
                    {saving ? 'Guardando...' : editingBenefit ? 'Guardar Cambios' : 'Crear Beneficio'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Benefits List */}
          {loadingBenefits ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Cargando beneficios...</div>
          ) : benefits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
              No hay beneficios cargados en esta sección aún.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {benefits.map((benefit) => (
                <div key={benefit._id} style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '20px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  opacity: benefit.active ? 1 : 0.6
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <img src={benefit.logoUrl} alt={benefit.title} style={{ width: '70px', height: '70px', objectFit: 'contain', borderRadius: '14px', border: '1px solid #f1f5f9', padding: '4px' }} />
                      {benefit.discountText && (
                        <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '6px 14px', borderRadius: '20px', fontWeight: '900', fontSize: '13px', border: '1px solid #a7f3d0' }}>
                          {benefit.discountText}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '19px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>
                      {benefit.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 16px 0', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                      {benefit.description}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: benefit.active ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {benefit.active ? <><IoCheckmarkCircle /> Activo</> : <><IoCloseCircle /> Inactivo</>}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleOpenBenefitForm(benefit)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '800' }}>
                        <IoPencil /> Editar
                      </button>
                      <button onClick={() => handleDeleteBenefit(benefit._id)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #fecaca', backgroundColor: '#fff1f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '800' }}>
                        <IoTrashOutline />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: CÓDIGOS DE DESCUENTO (CUPONES) */}
      {subTab === 'coupons' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0' }}>
                Códigos de Descuento (Cupones de Cursos)
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                Crea códigos de cupón para aplicarse a todos tus cursos o a capacitaciones específicas durante la compra de Pago Único.
              </p>
            </div>
            <button
              onClick={() => handleOpenCouponForm()}
              style={{
                backgroundColor: '#1f75f5ff',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '14px',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(31,117,245,0.3)'
              }}
            >
              <IoAdd size={18} /> Nuevo Código de Descuento
            </button>
          </div>

          {/* Coupon Form Modal / Box */}
          {showCouponForm && (
            <div style={{ backgroundColor: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '20px', padding: '24px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                  {editingCoupon ? 'Editar Código de Descuento' : 'Nuevo Código de Descuento'}
                </h3>
                <button onClick={() => setShowCouponForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: '800', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleSaveCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>Código de Descuento * (Sin espacios)</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. VERANO2026 / NICOFIT50"
                      value={cCode}
                      onChange={(e) => setCCode(e.target.value.toUpperCase().trim())}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '16px', fontWeight: '900', color: '#1f75f5ff', textTransform: 'uppercase' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>Porcentaje de Descuento (%) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      placeholder="Ej. 20 (para 20% OFF)"
                      value={cDiscountPercentage}
                      onChange={(e) => setCDiscountPercentage(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>Válido Hasta (Opcional)</label>
                    <input
                      type="date"
                      value={cValidUntil}
                      onChange={(e) => setCValidUntil(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Alcance del Cupón *</label>
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>
                      <input
                        type="radio"
                        name="applyToAll"
                        checked={cApplyToAll === true}
                        onChange={() => setCApplyToAll(true)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      Aplica a TODOS los cursos y workshops
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>
                      <input
                        type="radio"
                        name="applyToAll"
                        checked={cApplyToAll === false}
                        onChange={() => setCApplyToAll(false)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      Aplica a curso(s) específico(s)
                    </label>
                  </div>

                  {!cApplyToAll && (
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '16px', maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 6px 0', fontWeight: '700' }}>Selecciona en qué cursos / workshops es válido este cupón:</p>
                      {coursesList.map(course => (
                        <label key={course._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#0f172a', cursor: 'pointer', padding: '6px', borderRadius: '8px', backgroundColor: cApplicableCourses.includes(course._id) ? '#eff6ff' : 'transparent' }}>
                          <input
                            type="checkbox"
                            checked={cApplicableCourses.includes(course._id)}
                            onChange={() => handleToggleCourseSelection(course._id)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <span style={{ fontWeight: cApplicableCourses.includes(course._id) ? '800' : '600' }}>{course.title} ({course.contentType})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <input
                    type="checkbox"
                    id="cActive"
                    checked={cActive}
                    onChange={(e) => setCActive(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="cActive" style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', cursor: 'pointer' }}>Cupón Activo y listo para ser utilizado</label>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowCouponForm(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: '800', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving} style={{ padding: '12px 28px', borderRadius: '12px', border: 'none', backgroundColor: '#1f75f5ff', color: '#ffffff', fontWeight: '800', cursor: 'pointer' }}>
                    {saving ? 'Guardando...' : editingCoupon ? 'Guardar Cambios' : 'Crear Cupón'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Coupons List */}
          {loadingCoupons ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Cargando cupones...</div>
          ) : coupons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
              No hay códigos de descuento creados por el momento.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {coupons.map((coupon) => (
                <div key={coupon._id} style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  opacity: coupon.active ? 1 : 0.6
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{
                      backgroundColor: '#eff6ff',
                      color: '#1e3a8a',
                      padding: '10px 20px',
                      borderRadius: '14px',
                      border: '2px dashed #3b82f6',
                      fontWeight: '900',
                      fontSize: '20px',
                      letterSpacing: '1px'
                    }}>
                      {coupon.code}
                    </div>

                    <div>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginBottom: '4px' }}>
                        {coupon.discountPercentage}% de Descuento
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>
                        {coupon.applyToAll
                          ? '✅ Válido para TODOS los cursos y workshops'
                          : `🎯 Válido solo en ${(coupon.applicableCourses || []).length} curso(s) específico(s)`}
                      </div>
                      {coupon.validUntil && (
                        <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: '700', marginTop: '2px' }}>
                          ⏳ Válido hasta: {new Date(coupon.validUntil).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right', fontSize: '13px', color: '#64748b' }}>
                      Usado: <strong style={{ color: '#0f172a' }}>{coupon.usedCount || 0}</strong> veces
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: coupon.active ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {coupon.active ? <><IoCheckmarkCircle /> Activo</> : <><IoCloseCircle /> Inactivo</>}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleOpenCouponForm(coupon)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '800' }}>
                        <IoPencil /> Editar
                      </button>
                      <button onClick={() => handleDeleteCoupon(coupon._id)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #fecaca', backgroundColor: '#fff1f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '800' }}>
                        <IoTrashOutline />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDiscountsTab;
