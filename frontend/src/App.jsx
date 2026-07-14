import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import Register from './pages/Register';
import CheckoutPage from './pages/CheckoutPage';
import CapacitacionesHub from './pages/CapacitacionesHub';
import Cursos from './pages/Cursos';
import Workshops from './pages/Workshops';
import CursoDetail from './pages/CursoDetail';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import Videoteca from './pages/Videoteca';
import VideotecaDetail from './pages/VideotecaDetail';
import MisCursos from './pages/MisCursos';
import MisCarpetas from './pages/MisCarpetas';
import MiPerfil from './pages/MiPerfil';

import Home from './pages/Home';
import EntrenamientoADistancia from './pages/EntrenamientoADistancia';
import Evaluaciones from './pages/Evaluaciones';
import EvaluacionesIndividual from './pages/EvaluacionesIndividual';
import EvaluacionesColectivo from './pages/EvaluacionesColectivo';
import AdminTraining from './pages/AdminTraining';
import MisAlumnos from './pages/MisAlumnos';
import CharlasZoom from './pages/CharlasZoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="capacitaciones" element={<CapacitacionesHub />} />
          <Route path="entrenamiento-a-distancia" element={<EntrenamientoADistancia />} />
          <Route path="evaluaciones" element={<Evaluaciones />} />
          <Route path="evaluaciones/individual" element={<EvaluacionesIndividual />} />
          <Route path="evaluaciones/colectivo" element={<EvaluacionesColectivo />} />
          <Route path="nico-sesma-dashboard-privado" element={<AdminTraining />} />
          <Route path="nico-sesma-alumnos" element={<MisAlumnos />} />
          <Route path="cursos" element={<Cursos />} />
          <Route path="cursos/:id" element={<CursoDetail />} />
          <Route path="workshops" element={<Workshops />} />
          <Route path="workshops/:id" element={<CursoDetail />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="blogs/:id" element={<BlogDetail />} />
          <Route path="videoteca" element={<Videoteca />} />
          <Route path="videoteca/:id" element={<VideotecaDetail />} />
          <Route path="mis-cursos" element={<MisCursos />} />
          <Route path="mis-carpetas" element={<MisCarpetas />} />
          <Route path="mi-perfil" element={<MiPerfil />} />
          <Route path="charlas-zoom" element={<CharlasZoom />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
