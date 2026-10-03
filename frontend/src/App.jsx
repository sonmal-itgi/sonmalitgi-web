import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LevelSelect from "./pages/LevelSelect";
import Learn from "./pages/Learn";
import Lesson from "./pages/Lesson";

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