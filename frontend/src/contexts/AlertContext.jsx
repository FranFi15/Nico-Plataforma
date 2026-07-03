import React, { createContext, useContext, useState, useEffect } from 'react';
import { IoWarning, IoCheckmarkCircle, IoInformationCircle, IoCloseOutline, IoHelpCircle } from 'react-icons/io5';

const AlertContext = createContext(null);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'alert', // 'alert' | 'confirm'
    message: '',
    type: 'info', // 'info' | 'success' | 'warning' | 'error' | 'confirm'
    title: 'Notificación',
    onResolve: null
  });

  const showAlert = (message, type = 'info', title = null) => {
    let resolvedType = type;
    if (!type || type === 'info') {
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('error') || lowerMsg.includes('falló') || lowerMsg.includes('no se pudo') || lowerMsg.includes('incorrecta') || lowerMsg.includes('requerido')) {
        resolvedType = 'error';
      } else if (lowerMsg.includes('éxito') || lowerMsg.includes('exitosamente') || lowerMsg.includes('concedido') || lowerMsg.includes('guardado') || lowerMsg.includes('agregado')) {
        resolvedType = 'success';
      } else if (lowerMsg.includes('inicia sesión') || lowerMsg.includes('atención') || lowerMsg.includes('advertencia')) {
        resolvedType = 'warning';
      }
    }

    const resolvedTitle = title || (
      resolvedType === 'error' ? 'Error' :
      resolvedType === 'success' ? 'Éxito' :
      resolvedType === 'warning' ? 'Atención' : 'Información'
    );

    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        mode: 'alert',
        message,
        type: resolvedType,
        title: resolvedTitle,
        onResolve: () => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        }
      });
    });
  };

  const showConfirm = (message, title = 'Confirmar Acción') => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        mode: 'confirm',
        message,
        type: 'confirm',
        title,
        onResolve: (value) => {
          setModalState(prev => ({ ...prev, isOpen: false }));
          resolve(value);
        }
      });
    });
  };

  // Override window.alert and window.confirm
  useEffect(() => {
    const nativeAlert = window.alert;
    const nativeConfirm = window.confirm;

    window.alert = (message) => {
      showAlert(message);
    };

    window.confirm = (message) => {
      // Caller should await this (since JS confirm override returns promise)
      return showConfirm(message);
    };

    return () => {
      window.alert = nativeAlert;
      window.confirm = nativeConfirm;
    };
  }, []);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'success':
        return <IoCheckmarkCircle size={48} style={{ color: '#10b981' }} />;
      case 'error':
        return <IoWarning size={48} style={{ color: '#ef4444' }} />;
      case 'warning':
        return <IoWarning size={48} style={{ color: '#f59e0b' }} />;
      case 'confirm':
        return <IoHelpCircle size={48} style={{ color: '#1f75f5' }} />;
      default:
        return <IoInformationCircle size={48} style={{ color: '#1f75f5' }} />;
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {modalState.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(1, 13, 25, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="premium-card" style={{
            width: '95%',
            maxWidth: '400px',
            padding: '30px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            animation: 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 20px 45px rgba(0,0,0,0.15)',
            border: '1px solid var(--border)'
          }}>
            <button 
              onClick={() => modalState.onResolve(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--gray-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                borderRadius: '50%',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--gray-100)'; e.currentTarget.style.color = 'var(--dark)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--gray-500)'; }}
            >
              <IoCloseOutline size={20} />
            </button>

            <div style={{ marginBottom: '4px' }}>
              {getAlertIcon(modalState.type)}
            </div>

            <h3 style={{
              fontSize: '20px',
              fontWeight: '800',
              color: 'var(--dark)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: 0
            }}>
              {modalState.title}
            </h3>

            <p style={{
              fontSize: '15px',
              color: 'var(--gray-600)',
              lineHeight: '1.6',
              margin: '0 0 10px 0',
              wordBreak: 'break-word'
            }}>
              {modalState.message}
            </p>

            {modalState.mode === 'confirm' ? (
              <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '4px' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => modalState.onResolve(false)}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    fontSize: '12px',
                    letterSpacing: '1px'
                  }}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => modalState.onResolve(true)}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    fontSize: '12px',
                    letterSpacing: '1px'
                  }}
                >
                  Aceptar
                </button>
              </div>
            ) : (
              <button 
                className="btn-primary" 
                onClick={() => modalState.onResolve(true)}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  fontSize: '12px',
                  letterSpacing: '1px',
                  marginTop: '4px'
                }}
              >
                Aceptar
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Styles for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </AlertContext.Provider>
  );
};
