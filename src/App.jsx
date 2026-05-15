import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Habits from "./pages/Habits";
import Goals from "./pages/Goals";
import CalendarPage from "./pages/CalendarPage";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import Badges from "./pages/Badges";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      {/* Navbar her sayfada görünsün diye Routes'un dışına, Router'ın içine koyuyoruz */}
      <Navbar />

      <div style={{ paddingTop: '20px' }}> {/* Navbar'ın altında boşluk kalsın diye */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Korumalı Rotalar */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/badges" element={<ProtectedRoute><Badges /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;