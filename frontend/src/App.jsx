import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/home/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import LevelSelect from "./pages/levelselect/LevelSelect.jsx";
import Learn from "./pages/learn/Learn.jsx";
import Lesson from "./pages/lesson/Lesson.jsx";
import LessonRoute from "./pages/lesson/LessonRoute.jsx";

import { getSupabaseHealth } from "./lib/supabase.js";
import "./App.css";

function App() {
    useEffect(() => {
        (async () => {
            const result = await getSupabaseHealth();
            if (result.ok) {
                console.info("[Supabase] 연결 OK:", result.detail || "OK");
            } else {
                console.error("[Supabase] 연결 실패:", result.error || "Unknown error");
            }
        })();
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/level" element={<LevelSelect />} />

                <Route path="/learn" element={<Learn />} />
                {/* 중급/고급 하이픈 패턴은 항상 초급 1번으로 */}
                <Route path="/lesson/mid-:id" element={<Navigate to="/lesson/1" replace />} />
                <Route path="/lesson/adv-:id" element={<Navigate to="/lesson/1" replace />} />
                {/* 중급/고급 슬래시 패턴도 대응 */}
                <Route path="/lesson/mid/:id" element={<Navigate to="/lesson/1" replace />} />
                <Route path="/lesson/adv/:id" element={<Navigate to="/lesson/1" replace />} />
                {/* 일반 학습 라우트 */}
                <Route path="/lesson/:id" element={<LessonRoute />} />
                {/* 예외 캐치올 */}
                <Route path="/lesson/*" element={<Navigate to="/lesson/1" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;