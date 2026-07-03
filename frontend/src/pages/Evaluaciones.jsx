import React from 'react';

const Evaluaciones = () => {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{
        fontSize: '36px',
        fontWeight: '900',
        color: '#051020',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '24px'
      }}>
        Evaluaciones Biomecánicas
      </h1>
      <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#051020', marginBottom: '24px' }}>
        Medimos lo que otros no miden. Realizamos evaluaciones físicas individuales o grupales con tecnología de vanguardia.
      </p>
      <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4b5563', marginBottom: '32px' }}>
        Como embajadores internacionales de Kinvent Biomécanique en Argentina, incorporamos sus dispositivos —K-Force Plates, K-Push, K-Power y K-Pull— para obtener datos de alta precisión sobre fuerza, potencia, velocidad y activación muscular. Cada evaluación incluye un dashboard personalizado que identifica fortalezas y debilidades de cada deportista, permitiendo tomar decisiones de entrenamiento basadas en datos reales.
      </p>
      <a 
        href="https://docs.google.com/forms/d/e/1FAIpQLSeAJwoKDSgk7M03ZwGfbyfE1KuM4PEAQlJNlhlFov5MlKXf0Q/viewform" 
        target="_blank" 
        rel="noopener noreferrer"
        className="btn-primary"
      >
        Reservar Turno de Evaluación
      </a>
    </div>
  );
};

export default Evaluaciones;
