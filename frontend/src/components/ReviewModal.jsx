import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { IoClose, IoStar, IoCheckmarkCircle, IoDownloadOutline, IoTrophyOutline } from 'react-icons/io5';
import logoB from '../assets/logob.webp';
import kinventLogo from '../assets/kinvent largo.png';

const ReviewModal = ({ isOpen, onClose, onSubmitReview, user, contentTitle, certificateType, onDownloadDiploma, progressPercent }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [profession, setProfession] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.profession !== undefined) {
      setProfession(user.profession);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment || comment.trim().length < 3) {
      setError('Por favor, escribe una reseña de al menos 3 caracteres.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await onSubmitReview({ rating, comment, profession });
      if (res && res.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 2200);
      } else {
        setError(res?.error || 'Error al enviar la reseña.');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado.');
    } finally {
      setSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 16, 32, 0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '60px 20px 20px 20px',
        overflowY: 'auto',
        animation: 'fadeIn 0.2s ease-out',
        fontFamily: 'var(--font-sans)'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '28px',
          width: '100%',
          maxWidth: progressPercent === 100 ? '900px' : '540px',
          padding: '36px',
          position: 'relative',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
        >
          <IoClose />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IoCheckmarkCircle size={38} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
              ¡Muchas gracias por tu reseña!
            </h3>
            <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
              Tu valoración ha sido guardada y ya se encuentra visible para la comunidad.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: progressPercent === 100 ? 'row' : 'column', gap: '40px' }}>
            {/* Columna Izquierda: Felicitaciones y Certificado (solo si completó el curso) */}
            {progressPercent === 100 && (
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '30px', backgroundColor: '#0f172a', borderRadius: '20px', border: '1px solid #1e293b' }}>
                {(!certificateType || certificateType === 'none') && (
                  <>
                    <img src={logoB} alt="Logo" style={{ width: '120px', marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', marginBottom: '12px' }}>¡Felicitaciones!</h2>
                    <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6' }}>
                      Has completado exitosamente esta formación. ¡Excelente trabajo!
                    </p>
                  </>
                )}

                {certificateType === 'standard' && (
                  <>
                    <img src={logoB} alt="Logo" style={{ width: '120px', marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', marginBottom: '12px' }}>¡Felicitaciones!</h2>
                    <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                      Has completado exitosamente esta formación. Ya podés descargar tu certificado oficial.
                    </p>
                    <button
                      onClick={onDownloadDiploma}
                      style={{ padding: '12px 20px', backgroundColor: '#10b981', color: '#fff', borderRadius: '12px', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)', transition: 'background-color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                    >
                      <IoDownloadOutline size={22} />
                      Descargar Certificado
                    </button>
                  </>
                )}

                {certificateType === 'kinvent' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                      <img src={logoB} alt="Logo" style={{ width: '120px' }} />
                      <img src={kinventLogo} alt="Kinvent Logo" style={{ width: '120px' }} />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', marginBottom: '12px' }}>¡Felicitaciones!</h2>
                    <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6' }}>
                      Has completado exitosamente esta formación. En los próximos días se te mandará el certificado oficial por mail.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Columna Derecha: Formulario de Reseña */}
            <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column' }}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
                  ¿Qué te pareció esta formación?
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  {contentTitle ? `Comparte tu experiencia tras completar "${contentTitle}"` : 'Ayuda a otros alumnos compartiendo tu experiencia.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Star rating selector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#334155', textTransform: 'uppercase' }}>
                    Selecciona tu calificación
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (hoverRating || rating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            fontSize: '32px',
                            color: active ? '#f59e0b' : '#cbd5e1',
                            transition: 'transform 0.15s ease, color 0.15s ease',
                            transform: active ? 'scale(1.15)' : 'scale(1)'
                          }}
                        >
                          <IoStar />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Profession field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                    Tu profesión o especialidad (aparecerá en la reseña):
                  </label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="Ej. Preparador Físico, Kinesiólogo, Estudiante EF..."
                    style={{
                      padding: '12px 16px',
                      borderRadius: '14px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      color: '#0f172a'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1f75f5ff'}
                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                  />
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Esto también actualizará tu perfil para que no tengas que escribirlo cada vez.
                  </span>
                </div>

                {/* Comment field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                    Tu reseña / comentarios:
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="¿Qué fue lo que más te sirvió? ¿Cómo aplicaste los conocimientos?"
                    style={{
                      padding: '12px 16px',
                      borderRadius: '14px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      lineHeight: '1.5',
                      color: '#0f172a'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1f75f5ff'}
                    onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                  />
                </div>

                {error && (
                  <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', color: '#dc2626', fontSize: '13px', fontWeight: '600' }}>
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '14px 24px',
                    borderRadius: '16px',
                    backgroundColor: '#1f75f5ff',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '15px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 20px rgba(31, 117, 245, 0.3)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
                  onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#1f75f5ff'; }}
                >
                  {submitting ? 'Enviando valoración...' : 'Publicar mi Reseña'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ReviewModal;
