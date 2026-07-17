import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IoChevronDown, IoSchool, IoFolderOpen, IoPerson, IoLogOut, IoShieldHalf, IoPeople, IoMenu, IoClose, IoNotificationsOutline, IoCheckmarkCircleOutline, IoNewspaperOutline, IoVideocamOutline, IoCalendarOutline } from 'react-icons/io5';
import api from '../services/api';

import logoImg from '../assets/logob.webp';
import omiLogo from '../assets/omi.png';
import kiventLogo from '../assets/kinvent largo.png';
import grbLogo from '../assets/grb.png';
import backgroundImg from '../assets/background.png';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, refreshUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [capacitacionesHover, setCapacitacionesHover] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setNotifDropdownOpen(false);
    setCapacitacionesHover(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkNotificationsRead = async () => {
    try {
      await api.put('/users/notifications/read');
      if (refreshUser) refreshUser();
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHome = location.pathname === '/' || location.pathname === '/evaluaciones';

  const dropdownItemStyle = {
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    display: 'block',
    textAlign: 'left'
  };

  const isAdminPage = location.pathname.includes('nico-sesma');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      ...(!isAdminPage ? {
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      } : {})
    }}>
      <style>{`
        .sponsor-link {
          display: inline-flex;
          align-items: center;
          opacity: 0.7;
          transition: all 0.5s ease;
        }
        .sponsor-link:hover {
          opacity: 1;
          transform: scale(1.1);
        }
      `}</style>
      {/* Navbar */}
      <nav className="glass-nav navbar-main">
        <div className="navbar-left">
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={logoImg}
              alt="Nico Sesma Logo"
              className="navbar-logo-img"
            />
          </Link>
          <div className="nav-sponsors-desktop">
            <span style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginRight: '4px' }}>
              sponsored by
            </span>
            <a href="https://kinvent.com/" target="_blank" rel="noreferrer" className="sponsor-link">
              <img src={kiventLogo} alt="Kivent" style={{ height: '46px', objectFit: 'contain' }} />
            </a>
            <a href="https://gruporoan.com.ar/" target="_blank" rel="noreferrer" className="sponsor-link">
              <img src={grbLogo} alt="GRB" style={{ height: '52px', objectFit: 'contain' }} />
            </a>
            <a href="https://www.instagram.com/omi_arg/" target="_blank" rel="noreferrer" className="sponsor-link">
              <img src={omiLogo} alt="Omi" style={{ height: '54px', objectFit: 'contain' }} />
            </a>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="nav-menu-desktop">
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            end
          >
            Inicio
          </NavLink>
          <NavLink
            to="/entrenamiento-a-distancia"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Entrenamiento a Distancia
          </NavLink>
          <NavLink
            to="/evaluaciones"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            Evaluaciones
          </NavLink>
          <div
            style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
            onMouseEnter={() => setCapacitacionesHover(true)}
            onMouseLeave={() => setCapacitacionesHover(false)}
          >
            <NavLink
              to="/capacitaciones"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Capacitaciones
              <IoChevronDown size={14} style={{
                transition: 'transform 0.2s ease',
                transform: capacitacionesHover ? 'rotate(180deg)' : 'rotate(0deg)'
              }} />
            </NavLink>

            {capacitacionesHover && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                paddingTop: '10px',
                zIndex: 400,
                minWidth: '220px'
              }}>
                <div style={{
                  backgroundColor: '#010d19f5',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '14px',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.6)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <Link
                    to="/blogs"
                    onClick={() => setCapacitacionesHover(false)}
                    style={{ ...dropdownItemStyle, display: 'flex', alignItems: 'center', gap: '10px' }}
                    className="user-dropdown-item"
                  >
                    Artículos & Blogs
                  </Link>
                  <Link
                    to="/videoteca"
                    onClick={() => setCapacitacionesHover(false)}
                    style={{ ...dropdownItemStyle, display: 'flex', alignItems: 'center', gap: '10px' }}
                    className="user-dropdown-item"
                  >
                    Videoteca
                  </Link>
                  <Link
                    to="/cursos"
                    onClick={() => setCapacitacionesHover(false)}
                    style={{ ...dropdownItemStyle, display: 'flex', alignItems: 'center', gap: '10px' }}
                    className="user-dropdown-item"
                  >
                    Workshops & Capacitaciones
                  </Link>
                </div>
              </div>
            )}
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Notification Bell */}
              <div
                ref={notifRef}
                style={{ position: 'relative', display: 'inline-block' }}
              >
                <div
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: notifDropdownOpen ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                  title="Notificaciones de nuevos módulos o lecciones"
                >
                  <IoNotificationsOutline size={20} color="#ffffff" />
                  {user.notifications && user.notifications.filter(n => !n.read).length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: '900',
                      padding: '2px 5px',
                      borderRadius: '10px',
                      border: '2px solid #010d19'
                    }}>
                      {user.notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </div>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '10px',
                    backgroundColor: '#010d19f5',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                    zIndex: 300,
                    width: '320px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <strong style={{ fontSize: '13px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IoNotificationsOutline size={16} color="#38bdf8" /> Notificaciones
                      </strong>
                      {user.notifications && user.notifications.filter(n => !n.read).length > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkNotificationsRead}
                          style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Marcar leídas
                        </button>
                      )}
                    </div>

                    {!user.notifications || user.notifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px 10px', color: '#9ca3af', fontSize: '12px' }}>
                        No tienes notificaciones recientes.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {user.notifications.map((n, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setNotifDropdownOpen(false);
                              if (n.link) navigate(n.link);
                            }}
                            style={{
                              padding: '10px',
                              borderRadius: '10px',
                              backgroundColor: n.read ? 'rgba(255,255,255,0.03)' : 'rgba(31, 117, 245, 0.15)',
                              border: n.read ? '1px solid transparent' : '1px solid rgba(31, 117, 245, 0.3)',
                              cursor: n.link ? 'pointer' : 'default',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '12px', color: '#ffffff' }}>{n.title}</strong>
                              {!n.read && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />}
                            </div>
                            <p style={{ fontSize: '11px', color: '#cbd5e1', margin: 0, lineHeight: '1.4' }}>{n.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div
                ref={dropdownRef}
                style={{ position: 'relative', display: 'inline-block' }}
              >
                <div
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    backgroundColor: dropdownOpen ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    transition: 'all 0.2s ease',
                    border: dropdownOpen ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>
                      {user.name}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      letterSpacing: '1px',
                      color: (user.membership === 'premium' || user.isSubscribed) ? '#1f75f5' : '#9ca3af',
                      textTransform: 'uppercase',
                    }}>
                      {(user.membership === 'premium' || user.isSubscribed) ? 'MIEMBRO' : 'ENTRENADOR'}
                    </span>
                  </div>
                  <IoChevronDown style={{
                    color: '#ffffff',
                    fontSize: '14px',
                    transition: 'transform 0.2s ease',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)'
                  }} />
                </div>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '10px',
                    backgroundColor: '#010d19f5',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                    zIndex: 200,
                    minWidth: '220px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '6px'
                  }}>
                    {user.role === 'admin' ? (
                      <>
                        <Link
                          to="/nico-sesma-dashboard-privado"
                          onClick={() => setDropdownOpen(false)}
                          style={{ ...dropdownItemStyle, display: 'flex', alignItems: 'center', gap: '10px' }}
                          className="user-dropdown-item"
                        >
                          <IoShieldHalf size={16} /> Dashboard
                        </Link>
                        <Link
                          to="/nico-sesma-alumnos"
                          onClick={() => setDropdownOpen(false)}
                          style={{ ...dropdownItemStyle, display: 'flex', alignItems: 'center', gap: '10px' }}
                          className="user-dropdown-item"
                        >
                          <IoPeople size={16} /> Mis Alumnos
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/noticias"
                          onClick={() => setDropdownOpen(false)}
                          style={{ ...dropdownItemStyle, display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', fontWeight: '800' }}
                          className="user-dropdown-item"
                        >
                          <IoNewspaperOutline size={16} /> Noticias
                        </Link>
                        <Link
                          to="/agenda"
                          onClick={() => setDropdownOpen(false)}
                          style={{ ...dropdownItemStyle, display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', fontWeight: '800' }}
                          className="user-dropdown-item"
                        >
                          <IoCalendarOutline size={16} /> Agenda
                        </Link>
                        <Link
                          to="/mis-cursos"
                          onClick={() => setDropdownOpen(false)}
                          style={{ ...dropdownItemStyle, display: 'flex', alignItems: 'center', gap: '10px' }}
                          className="user-dropdown-item"
                        >
                          <IoSchool size={16} /> Mis Cursos & Workshops
                        </Link>
                        <Link
                          to="/mis-carpetas"
                          onClick={() => setDropdownOpen(false)}
                          style={{ ...dropdownItemStyle, display: 'flex', alignItems: 'center', gap: '10px' }}
                          className="user-dropdown-item"
                        >
                          <IoFolderOpen size={16} /> Mis Carpetas
                        </Link>
                        <Link
                          to="/mi-perfil"
                          onClick={() => setDropdownOpen(false)}
                          style={{ ...dropdownItemStyle, display: 'flex', alignItems: 'center', gap: '10px' }}
                          className="user-dropdown-item"
                        >
                          <IoPerson size={16} /> Mi Perfil
                        </Link>
                      </>
                    )}
                    <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '4px 8px' }}></div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      style={{
                        ...dropdownItemStyle,
                        border: 'none',
                        background: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                      className="user-dropdown-item-logout"
                    >
                      <IoLogOut size={16} /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Link
                to="/login"
                className="nav-link"
                style={{ fontSize: '13px' }}
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                className="btn-primary"
                style={{ padding: '8px 20px', fontSize: '12px', background: '#ffffff', color: '#051020', borderColor: '#ffffff' }}
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>

        {/* Burger Button for Mobile */}
        <button
          className="burger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <IoClose size={32} /> : <IoMenu size={32} />}
        </button>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div className={`mobile-menu-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <NavLink to="/" className="nav-link" style={{ fontSize: '18px' }}>
            Inicio
          </NavLink>
          <NavLink to="/entrenamiento-a-distancia" className="nav-link" style={{ fontSize: '18px' }}>
            Entrenamiento a Distancia
          </NavLink>
          <NavLink to="/evaluaciones" className="nav-link" style={{ fontSize: '18px' }}>
            Evaluaciones
          </NavLink>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <NavLink to="/capacitaciones" className="nav-link" style={{ fontSize: '18px' }}>
              Capacitaciones
            </NavLink>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '16px', borderLeft: '2px solid rgba(31, 117, 245, 0.3)', marginLeft: '4px' }}>
              <NavLink to="/blogs" className="nav-link" style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Artículos & Blogs
              </NavLink>
              <NavLink to="/videoteca" className="nav-link" style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Videoteca
              </NavLink>
              <NavLink to="/cursos" className="nav-link" style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Workshops & Capacitaciones
              </NavLink>
            </div>
          </div>

          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
              <div style={{ padding: '0 8px', marginBottom: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>{user.name}</div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#1f75f5', textTransform: 'uppercase' }}>
                  {(user.membership === 'premium' || user.isSubscribed) ? 'MIEMBRO' : 'ENTRENADOR'}
                </div>
              </div>
              {user.role === 'admin' ? (
                <>
                  <Link to="/nico-sesma-dashboard-privado" style={{ ...dropdownItemStyle, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }} className="user-dropdown-item">
                    <IoShieldHalf size={18} /> Dashboard
                  </Link>
                  <Link to="/nico-sesma-alumnos" style={{ ...dropdownItemStyle, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }} className="user-dropdown-item">
                    <IoPeople size={18} /> Mis Alumnos
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/noticias" onClick={() => setMobileMenuOpen(false)} style={{ ...dropdownItemStyle, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', fontWeight: '800' }} className="user-dropdown-item">
                    <IoNewspaperOutline size={18} /> Noticias
                  </Link>
                  <Link to="/agenda" onClick={() => setMobileMenuOpen(false)} style={{ ...dropdownItemStyle, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', fontWeight: '800' }} className="user-dropdown-item">
                    <IoCalendarOutline size={18} /> Agenda
                  </Link>
                  <Link to="/mis-cursos" style={{ ...dropdownItemStyle, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }} className="user-dropdown-item">
                    <IoSchool size={18} /> Mis Cursos & Workshops
                  </Link>
                  <Link to="/mis-carpetas" style={{ ...dropdownItemStyle, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }} className="user-dropdown-item">
                    <IoFolderOpen size={18} /> Mis Carpetas
                  </Link>
                  <Link to="/mi-perfil" style={{ ...dropdownItemStyle, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }} className="user-dropdown-item">
                    <IoPerson size={18} /> Mi Perfil
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                style={{
                  ...dropdownItemStyle,
                  fontSize: '16px',
                  border: 'none',
                  background: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                className="user-dropdown-item-logout"
              >
                <IoLogOut size={18} /> Cerrar Sesión
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
              <Link to="/login" className="nav-link" style={{ fontSize: '18px' }}>
                Ingresar
              </Link>
              <Link to="/register" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px', background: '#ffffff', color: '#051020', borderColor: '#ffffff' }}>
                Registrarse
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Sponsors */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            sponsored by
          </span>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="https://kinvent.com/" target="_blank" rel="noreferrer" className="sponsor-link">
              <img src={kiventLogo} alt="Kivent" style={{ height: '40px', objectFit: 'contain' }} />
            </a>
            <a href="https://gruporoan.com.ar/" target="_blank" rel="noreferrer" className="sponsor-link">
              <img src={grbLogo} alt="GRB" style={{ height: '44px', objectFit: 'contain' }} />
            </a>
            <a href="https://www.instagram.com/omi_arg/" target="_blank" rel="noreferrer" className="sponsor-link">
              <img src={omiLogo} alt="Omi" style={{ height: '48px', objectFit: 'contain' }} />
            </a>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <main style={{
        flex: '1',
        width: '100%',
        maxWidth: isHome ? 'none' : '1600px',
        margin: isHome ? '0' : '0 auto',
        padding: isHome ? '0' : '40px 2.5%'
      }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#010d19',
        borderTop: '1px solid rgba(43, 45, 47, 0.9)',
        margin: '40px 0 0 0',
        padding: '50px 5% 30px 5%',
        color: '#ffffff',
        fontFamily: 'var(--font-sans)',
      }}>
        {/* Three Columns Container */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          alignItems: 'start',
          textAlign: 'left',
          marginBottom: '30px'
        }}>
          {/* Column 1: Logo & Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link to="/" style={{ display: 'inline-block', alignSelf: 'flex-start' }}>
              <img
                src={logoImg}
                alt="Nico Sesma Logo"
                style={{
                  height: '75px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </Link>
          </div>

          {/* Column 2: Links in a column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', color: '#ffffff' }}>Enlaces</h4>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '13px', fontWeight: '600', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>Inicio</Link>
            <Link to="/evaluaciones" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '13px', fontWeight: '600', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>Evaluaciones</Link>
            <Link to="/capacitaciones" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '13px', fontWeight: '600', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>Capacitaciones</Link>
          </div>

          {/* Column 3: Contact on the right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end', textAlign: 'right' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', color: '#ffffff' }}>Contacto</h4>
            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.65)' }}>¿Tienes alguna duda o consulta?</span>
            <a href="mailto:contacto@nsentrenamiento.com" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>contacto@nsentrenamiento.com</a>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px', letterSpacing: '0.5px', margin: 0 }}>
            &copy; 2026 ffdigitallab. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
