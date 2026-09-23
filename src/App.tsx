import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Lesson from './pages/Lesson';

export default function App() {
  return (
    <BrowserRouter basename="/italian-song-learn">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="lesson/:songId" element={<Lesson />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
