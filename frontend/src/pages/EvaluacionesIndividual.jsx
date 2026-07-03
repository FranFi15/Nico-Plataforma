import React from 'react';
import { Link } from 'react-router-dom';

const EvaluacionesIndividual = () => {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/evaluaciones" style={{ color: '#0369a1', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>
          ← Volver a Evaluaciones
        </Link>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '48px',
        border: '1px solid rgba(5, 16, 32, 0.08)',
        boxShadow: '0 15px 35px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          display: 'inline-block',
          padding: '6px 16px',
          background: '#e0f2fe',
          color: '#0369a1',
          borderRadius: '30px',
          fontSize: '12px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '20px'
        }}>
          Modalidad 1 a 1
        </div>

        <h1 style={{
          fontSize: '38px',
          fontWeight: '900',
          color: '#051020',
          lineHeight: '1.2',
          marginBottom: '20px'
        }}>
          Evaluación Biomecánica Individual
        </h1>

        <p style={{ fontSize: '18px', lineHeight: '1.7', color: '#4b5563', marginBottom: '36px', maxWidth: '800px' }}>
          Un diagnóstico de alta precisión personalizado para deportistas que buscan optimizar su rendimiento físico, superar estancamientos o transitar un proceso de rehabilitación deportiva de forma segura.
        </p>

        <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#051020', marginBottom: '20px' }}>
          ¿Qué analizamos durante tu sesión?
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '17px', fontWeight: '700', color: '#051020', marginBottom: '10px' }}>
              ⚡ Fuerza y Asimetrías Bilaterales
            </h4>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
              Utilizamos las plataformas de fuerza K-Force Plates para cuantificar diferencias exactas entre hemicuerpo izquierdo y derecho en saltos (CMJ, SJ) y empujes.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '17px', fontWeight: '700', color: '#051020', marginBottom: '10px' }}>
              🚀 Potencia y Velocidad
            </h4>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
              Medición en tiempo real de picos de fuerza (RFD - Rate of Force Development) con dispositivos K-Push y K-Pull para maximizar tu explosividad en competencia.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '17px', fontWeight: '700', color: '#051020', marginBottom: '10px' }}>
              📊 Dashboard Personalizado
            </h4>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
              Recibís un informe completo y claro con tus métricas de referencia y recomendaciones prácticas para tu preparador físico o kinesiólogo.
            </p>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #051020 0%, #1e3a5f 100%)',
          padding: '36px',
          borderRadius: '20px',
          color: '#fff',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>
              ¿Listo para medir tu potencial?
            </h3>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
              Reserva tu turno en nuestro centro o coordina una evaluación personalizada.
            </p>
          </div>
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSeAJwoKDSgk7M03ZwGfbyfE1KuM4PEAQlJNlhlFov5MlKXf0Q/viewform" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              padding: '16px 32px',
              background: '#fff',
              color: '#051020',
              fontWeight: '800',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '15px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s ease'
            }}
          >
            Reservar Turno Individual →
          </a>
        </div>
      </div>
    </div>
  );
};

export default EvaluacionesIndividual;
