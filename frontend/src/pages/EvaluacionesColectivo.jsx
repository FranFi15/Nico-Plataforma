import React from 'react';
import { Link } from 'react-router-dom';

const EvaluacionesColectivo = () => {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/evaluaciones" style={{ color: '#0284c7', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>
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
          background: '#fef3c7',
          color: '#b45309',
          borderRadius: '30px',
          fontSize: '12px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '20px'
        }}>
          Planteles y Clubes
        </div>

        <h1 style={{
          fontSize: '38px',
          fontWeight: '900',
          color: '#051020',
          lineHeight: '1.2',
          marginBottom: '20px'
        }}>
          Evaluación Biomecánica Colectiva
        </h1>

        <p style={{ fontSize: '18px', lineHeight: '1.7', color: '#4b5563', marginBottom: '36px', maxWidth: '800px' }}>
          Llevamos el laboratorio de biomecánica a tu club o centro de entrenamiento. Diseñado para cuerpos técnicos y coordinadores que necesitan evaluar de forma ágil y masiva a sus planteles.
        </p>

        <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#051020', marginBottom: '20px' }}>
          Beneficios para Instituciones y Equipos
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '17px', fontWeight: '700', color: '#051020', marginBottom: '10px' }}>
              🏟️ Evaluación en Campo o Gimnasio
            </h4>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
              Dispositivos 100% portátiles e inalámbricos Kinvent que permiten testear a más de 20 jugadores en tiempos récord sin alterar la dinámica habitual de entrenamiento.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '17px', fontWeight: '700', color: '#051020', marginBottom: '10px' }}>
              🛡️ Prevención Masiva de Lesiones
            </h4>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
              Detectá déficits musculares ocultos, desbalances isquios/cuádriceps y fatiga acumulada para prevenir lesiones musculares en pretemporada y competición.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '17px', fontWeight: '700', color: '#051020', marginBottom: '10px' }}>
              📈 Reportes por Jugador y Plantel
            </h4>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
              Informes comparativos por posición en el campo y análisis longitudinales para medir la evolución física del equipo a lo largo del torneo.
            </p>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
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
              ¿Querés evaluar a tu plantel?
            </h3>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
              Coordinemos una visita técnica o sesión de diagnóstico para tu institución.
            </p>
          </div>
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSeAJwoKDSgk7M03ZwGfbyfE1KuM4PEAQlJNlhlFov5MlKXf0Q/viewform" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              padding: '16px 32px',
              background: '#fff',
              color: '#0284c7',
              fontWeight: '800',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '15px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s ease'
            }}
          >
            Solicitar Turno Colectivo →
          </a>
        </div>
      </div>
    </div>
  );
};

export default EvaluacionesColectivo;
