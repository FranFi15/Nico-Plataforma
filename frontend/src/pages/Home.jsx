import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import presentationVideo from '../assets/Video Presentacion.mp4';
import nicoImg from '../assets/nico.webp';
import micaImg from '../assets/mica.webp';
import tomiImg from '../assets/tomi.webp';
import fedeImg from '../assets/fede.webp';
import bg1 from '../assets/1.webp';
import bg2 from '../assets/2.webp';
import bg3 from '../assets/3.webp';
import bg4 from '../assets/4.webp';
import kiventLogo from '../assets/kinvent.png';

const HomeAthleteCarousel = ({ photos }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  if (!photos || photos.length === 0) return null;

  // Repeat items to form a rich scrollable track
  const repeatCount = photos.length < 6 ? 6 : 3;
  const marqueeList = [];
  for (let i = 0; i < repeatCount; i++) {
    marqueeList.push(...photos);
  }

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.8; // Speed multiplier for dragging
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    let animationFrameId;
    const scroll = () => {
      if (containerRef.current && !isDragging) {
        containerRef.current.scrollLeft += 0.8;
        // Seamless loop reset when reaching near the end
        if (containerRef.current.scrollLeft >= (containerRef.current.scrollWidth - containerRef.current.clientWidth) - 10) {
          containerRef.current.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };
    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isDragging]);

  return (
    <div className="home-carousel-container" style={{ overflow: 'hidden', width: '100%', padding: '20px 0', position: 'relative' }}>
      <style>{`
        .home-carousel-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 120px;
          height: 100%;
          background: linear-gradient(to right, #f3f4f6 15%, rgba(255, 255, 255, 0) 100%);
          z-index: 3;
          pointer-events: none;
        }
        .home-carousel-container::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 120px;
          height: 100%;
          background: linear-gradient(to left, #f3f4f6 15%, rgba(255, 255, 255, 0) 100%);
          z-index: 3;
          pointer-events: none;
        }
        .home-marquee-track {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 10px 0;
          user-select: none;
        }
        .home-marquee-track::-webkit-scrollbar {
          display: none;
        }
        .home-athlete-card {
          width: 200px;
          height: 260px;
          background: #f3f4f6;
          border: 1px solid var(--border);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
          position: relative;
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          flex-shrink: 0;
        }
        .home-athlete-card:hover {
          transform: translateY(-6px);
          border-color: var(--primary);
          box-shadow: 0 16px 35px rgba(31, 117, 245, 0.18);
        }
        .home-athlete-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
          pointer-events: none;
        }
        .home-athlete-card:hover .home-athlete-card-img {
          transform: scale(1.06);
        }
        .home-athlete-card-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(5, 16, 32, 0.95) 20%, rgba(5, 16, 32, 0) 100%);
          padding: 16px 12px 12px 12px;
          color: #ffffff;
          text-align: center;
          z-index: 2;
          pointer-events: none;
        }
      `}</style>

      <div
        ref={containerRef}
        className="home-marquee-track"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {marqueeList.map((photo, idx) => {
          const url = typeof photo === 'string' ? photo : (photo.url || '');
          const fullname = typeof photo === 'string' ? '' : (photo.fullname || '');
          return (
            <div key={idx} className="home-athlete-card">
              <img
                src={url}
                alt={fullname || `Athlete ${idx}`}
                className="home-athlete-card-img"
              />
              {fullname && (
                <div className="home-athlete-card-overlay">
                  <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {fullname}
                  </h5>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Custom Hook to trigger fade-in scroll animation
const useScrollFadeIn = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.30 // triggers when 15% of the element is visible
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return [ref, isVisible];
};

const Home = () => {
  const navigate = useNavigate();
  const servicesRef = useRef(null);
  const [athletePhotos, setAthletePhotos] = useState([]);

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        // 1. Intentar cargar los atletas propios del carrusel de Home
        const homeResponse = await api.get('/home-athletes');
        if (homeResponse.data && homeResponse.data.success && homeResponse.data.data.length > 0) {
          setAthletePhotos(homeResponse.data.data);
          return;
        }

        // 2. Fallback: Si todavía no se subieron atletas a Home, tomar las fotos de los planes de entrenamiento
        const response = await api.get('/trainings');
        if (response.data && response.data.success) {
          const allPhotos = response.data.data.reduce((acc, training) => {
            if (training.athletePhotos && training.athletePhotos.length > 0) {
              acc.push(...training.athletePhotos);
            }
            return acc;
          }, []);

          const uniquePhotos = [];
          const seenUrls = new Set();
          for (const photo of allPhotos) {
            const url = typeof photo === 'string' ? photo : (photo.url || '');
            if (url && !seenUrls.has(url)) {
              seenUrls.add(url);
              uniquePhotos.push(photo);
            }
          }

          const shuffledPhotos = [...uniquePhotos].sort(() => Math.random() - 0.5);
          setAthletePhotos(shuffledPhotos);
        }
      } catch (err) {
        console.error('Error fetching athletes for Home:', err);
      }
    };
    fetchAthletes();
  }, []);

  // Apply scroll fade-in to the different sections
  const [bioRef, bioVisible] = useScrollFadeIn();
  const [teamTitleRef, teamTitleVisible] = useScrollFadeIn();
  const [teamGridRef, teamGridVisible] = useScrollFadeIn();
  const [servicesHeaderRef, servicesHeaderVisible] = useScrollFadeIn();
  const [servicesGridRef, servicesGridVisible] = useScrollFadeIn();

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getFadeInStyle = (isVisible) => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
  });

  return (
    <div className="animate-fade-in" style={{ margin: '0', padding: '0', width: '100%' }}>
      {/* 1 - Hero Video Section */}
      <section style={{
        position: 'relative',
        height: '100vh',
        marginTop: '-106px', // Shift up under the navbar height (approx 106px)
        paddingTop: '106px', // Keep content centered relative to screen
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
        background: '#000'
      }}>
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'translate(-50%, -50%)',
            opacity: '0.60',
            zIndex: 1
          }}
        >
          <source src={presentationVideo} type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>

        {/* Blue Filter Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(5, 24, 53, 0.68)', // Blue-dark semi-transparent overlay
          zIndex: 1.5,
          pointerEvents: 'none'
        }} />

        {/* Hero Content Over Video */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          color: '#ffffff',
          textAlign: 'left',
          maxWidth: '700px',
          padding: '0 20px',
          marginLeft: '7%',
        }}>
          <h1 style={{
            fontSize: '38px',
            lineHeight: '1.25',
            fontWeight: '900',
            marginBottom: '20px',
            fontFamily: 'var(--font-sans)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Detrás de cada resultado hay un sistema, un equipo y un compromiso genuino con tu proceso sin importar dónde estés.
          </h1>

          <p style={{
            fontSize: '19px',
            lineHeight: '1.6',
            fontWeight: '600',
            color: '#e2e8f0',
            marginBottom: '36px',
            fontFamily: 'var(--font-sans)'
          }}>
            Un entrenamiento inteligente para atletas y preparadores físicos que quieren ir más lejos.
          </p>

          <button
            onClick={scrollToServices}
            className="btn-primary"
            style={{
              padding: '16px 36px',
              fontSize: '14px',
              background: '#ffffff',
              color: '#051020',
              borderColor: '#ffffff',
              boxShadow: 'none'
            }}
          >
            Nuestros Servicios
          </button>
        </div>

        {/* Bottom Fade-out Gradient */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '15px',
          background: 'linear-gradient(to bottom, transparent, #f3f4f6)',
          zIndex: 2,
          pointerEvents: 'none'
        }} />
      </section>

      {/* 2 - Presentación Nicolás Sesma */}

      {/* 3 - Servicios */}
      <section ref={servicesRef} style={{
        padding: '80px 0',
        backgroundColor: 'transparent',
      }}>
        <div style={{ maxWidth: '85%', margin: 'auto', padding: '0' }}>
          <h2
            ref={servicesHeaderRef}
            style={{
              fontSize: '36px',
              fontWeight: '900',
              color: '#051020',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              textAlign: 'center',
              marginBottom: '50px',
              ...getFadeInStyle(servicesHeaderVisible)
            }}
          >
            Nuestros Servicios
          </h2>

          <div
            ref={servicesGridRef}
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '850px',
              gap: '16px',
              ...getFadeInStyle(servicesGridVisible)
            }}
          >
            {[
              {
                title: 'Entrenamiento a distancia',
                desc: 'Ofrecemos un programa de monitoreo a distancia que va más allá de los métodos tradicionales. Dejamos atrás los PDF mensuales estáticos para implementar una app de entrenamiento dinámica donde planificamos y ajustamos tu preparación semana a semana, sincronizada con tu calendario deportivo. Garantizamos un acompañamiento constante y personalizado sin importar tu ubicación. Trabajamos con atletas que se desempeñan a nivel nacional e internacional.',
                bgImage: bg1,
                link: '/entrenamiento-a-distancia',
                external: false
              },
              {
                title: 'Capacitaciones',
                desc: 'Un espacio pensado para entrenadores y preparadores físicos que quieren profundizar su metodología. Encontrarás blog, charlas, material descargable, herramientas prácticas, workshops y capacitaciones, todo construido desde la experiencia real con deportistas. Todo construido desde adentro, con la misma metodología que usamos con nuestros atletas. La idea es simple: entender el porqué detrás de cada decisión, para poder aplicarlo con cualquier atleta, en cualquier disciplina.',
                bgImage: bg2,
                link: '/capacitaciones',
                external: false
              },
              {
                title: 'Evaluaciones',
                desc: 'Medimos lo que otros no miden. Realizamos evaluaciones físicas individuales o grupales con tecnología de vanguardia. Como embajadores internacionales de Kinvent Biomécanique en Argentina, incorporamos sus dispositivos —K-Force Plates, K-Push, K-Power y K-Pull— para obtener datos de alta precisión sobre fuerza, potencia, velocidad y activación muscular. Cada evaluación incluye un dashboard personalizado que identifica fortalezas y debilidades de cada deportista, permitiendo tomar decisiones de entrenamiento basadas en datos reales.',
                bgImage: bg3,
                link: '/evaluaciones',
                external: false
              },
              {
                title: 'Asesorías 1a1',
                desc: 'Asesoría personalizada para entrenadores, preparadores físicos y dueños de gimnasios que buscan optimizar o construir su metodología de entrenamiento deportivo. Trabajamos juntos en dos encuentros: en el primero analizamos tus objetivos, desafíos y estructura de trabajo; en el segundo desarrollamos soluciones prácticas, protocolos y estrategias aplicables desde el día uno. Para gimnasios, también ofrecemos el diseño de un modelo de entrenamiento deportivo propio: un sistema claro, diferenciado y sostenible en el tiempo.',
                bgImage: bg4,
                link: 'https://docs.google.com/forms/d/e/1FAIpQLSfkknmDUEueRUQZSJyHsub0Zl0SPp9YbsOCW_q2yvFkNi-4fA/viewform',
                external: true
              }
            ].map((service, index) => {
              const [isHovered, setIsHovered] = useState(false);
              return (
                <div
                  key={index}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  onClick={() => {
                    if (service.external) {
                      window.open(service.link, '_blank', 'noopener,noreferrer');
                    } else {
                      navigate(service.link);
                    }
                  }}
                  style={{
                    position: 'relative',
                    flex: isHovered ? '5 1 0%' : '1 1 0%',
                    width: '100%',
                    backgroundImage: `url(${service.bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: '#ffffff',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    transition: 'flex 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '28px 36px'
                  }}
                >
                  {/* Dark overlay for readability */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#051020bf',
                    transition: 'background-color 0.3s ease',
                    zIndex: 1
                  }} />

                  <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      {/* Title */}
                      <h3
                        style={{
                          fontSize: '24px',
                          fontWeight: '900',
                          textTransform: 'uppercase',
                          lineHeight: '1.2',
                          margin: 0
                        }}
                      >
                        {service.title}
                      </h3>

                      {/* Expandable Description */}
                      <div
                        style={{
                          flex: '1 1 500px',
                          opacity: isHovered ? 1 : 0,
                          maxHeight: isHovered ? '450px' : '0px',
                          overflow: 'hidden',
                          transition: 'opacity 0.4s ease 0.1s, maxHeight 0.4s ease',
                          pointerEvents: isHovered ? 'auto' : 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px'
                        }}
                      >
                        <p style={{
                          fontSize: '17px',
                          lineHeight: '1.65',
                          fontWeight: '600',
                          color: '#ffffff',
                          margin: 0
                        }}>
                          {service.desc}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                          <button
                            className="btn-primary"
                            style={{
                              padding: '8px 20px',
                              fontSize: '11px',
                              background: '#ffffff',
                              color: '#051020',
                              borderColor: '#ffffff',
                              fontWeight: '800'
                            }}
                          >
                            {service.external ? 'Ir al formulario' : 'Ver más detalles'}
                          </button>
                          {service.title === 'Evaluaciones' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                              <img src={kiventLogo} alt="Kivent Logo" style={{ height: '62px', objectFit: 'contain' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section style={{
        padding: '80px 0',
        backgroundColor: 'transparent',
      }}>
        <div
          ref={bioRef}
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 3%',
            display: 'flex',
            gap: '48px',
            alignItems: 'center',
            flexWrap: 'wrap',
            ...getFadeInStyle(bioVisible)
          }}
        >
          <div style={{ flex: '1 1 420px', minWidth: '280px', height: '500px', overflow: 'hidden', borderRadius: '20px' }}>
            <img
              src={nicoImg}
              alt="Nicolás Sesma"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 40%',
                transform: 'scale(1.3)',
                display: 'block'
              }}
            />
          </div>
          <div style={{ flex: '2 1 500px', minWidth: '320px' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '900',
              color: '#051020',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '24px'
            }}>
              Nicolás Sesma
            </h2>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.8',
              color: '#051020',
              fontWeight: '400',
              whiteSpace: 'pre-line'
            }}>
              Soy el coordinador y creador de mi propio sistema de entrenamiento. Más de 10 años formando deportistas de distintas disciplinas que hoy se destacan en todas partes del mundo.
              {"\n\n"}
              Mi recorrido incluye la liga profesional de vóley femenino, pasos por clubes de básquet y hockey, disciplina en la que continúo trabajando con los seleccionados en concentraciones locales y regionales. Soy embajador internacional de Kinvent Biomécanique en Argentina, lo que me permite incorporar evaluación biomecánica de alto nivel a cada proceso. Hoy mi equipo acompaña a futbolistas profesionales, jugadores de hockey en el país y en el exterior, corredores, nadadores y triatletas que buscan superar sus marcas. La base siempre es la misma: un sistema claro, tecnología como herramienta y un compromiso genuino con el progreso de cada deportista.
            </p>
          </div>

          {/* Team Section */}
          <div style={{ width: '100%', maxWidth: '100%', margin: '60px', padding: '0' }}>
            <h3
              ref={teamTitleRef}
              style={{
                fontSize: '24px',
                fontWeight: '900',
                color: '#051020',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '30px',
                textAlign: 'center',
                ...getFadeInStyle(teamTitleVisible)
              }}
            >
              Nuestro Equipo
            </h3>
            <div
              ref={teamGridRef}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '24px',
                flexWrap: 'nowrap',
                width: '100%',
                ...getFadeInStyle(teamGridVisible)
              }}
            >
              {[
                { name: 'Mica Merino', img: micaImg },
                { name: 'Tomi Biondo', img: tomiImg },
                { name: 'Fede Best', img: fedeImg }
              ].map((member, index) => {
                const [isHovered, setIsHovered] = useState(false);
                return (
                  <div
                    key={index}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                      position: 'relative',
                      flex: '1 1 33%',
                      height: '340px',
                      overflow: 'hidden',
                      borderRadius: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    <img
                      src={member.img}
                      alt={member.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                        display: 'block'
                      }}
                    />
                    {/* Name overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: '#051020',
                      color: '#ffffff',
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: '900',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontSize: '14px',
                      transition: 'transform 0.3s ease',
                      transform: isHovered ? 'translateY(0)' : 'translateY(100%)'
                    }}>
                      {member.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>


      {/* 4 - Carrusel de Atletas */}
      {athletePhotos.length > 0 && (
        <section style={{
          padding: '80px 0',
          backgroundColor: 'transparent',
          width: '100%',
          overflow: 'hidden'
        }}>
          <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 20px' }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '900',
              color: '#051020',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              textAlign: 'center',
              marginBottom: '10px'
            }}>
              Ellos ya forman parte del equipo NS
            </h2>
            <div className="accent-divider" style={{ margin: '0 auto 40px auto' }}></div>
            <HomeAthleteCarousel photos={athletePhotos} />
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
