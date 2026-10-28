import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
import { GuestOnly, RequireAuth } from './auth/AuthGate.jsx';
import Home from './pages/home/Home.jsx';
import AuthPage from './pages/auth/AuthPage.jsx';
import LevelSelect from './pages/levelselect/LevelSelect.jsx';
import Learn from './pages/learn/Learn.jsx';
import LessonRoute from './pages/lesson/LessonRoute.jsx';
import Header from './components/Header.jsx';
import MyPage from './pages/mypage/MyPage.jsx';
import Practice from './pages/practice/Practice.jsx';
import './App.css';

export default function App() {
  return <BrowserRouter><AuthProvider><Routes>
    <Route path="/" element={<Home />} />
    <Route element={<GuestOnly />}>
      <Route path="/login" element={<AuthPage key="login" />} />
      <Route path="/signup" element={<AuthPage key="signup" signup />} />
    </Route>
    <Route element={<RequireAuth />}><Route element={<Header />}>
      <Route path="/level" element={<LevelSelect />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/practice" element={<Practice />} />
      <Route path="/learn" element={<Learn />} />
      <Route path="/lesson/:id" element={<LessonRoute />} />
      <Route path="/lesson/mid/:id" element={<LessonRoute />} />
      <Route path="/lesson/adv/:id" element={<LessonRoute />} />
    </Route></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AuthProvider></BrowserRouter>;
}
