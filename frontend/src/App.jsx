import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/home/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import LevelSelect from "./pages/levelselect/LevelSelect.jsx";
import Learn from "./pages/learn/Learn.jsx";
import Lesson from "./pages/lesson/Lesson.jsx";

import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/level" element={<LevelSelect />} />

                <Route path="/learn" element={<Learn />} />
                <Route path="/lesson/:id" element={<Lesson />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;