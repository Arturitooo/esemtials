import React from "react";
import "./App.scss";
import ProtectedRoute from "./components/ProtectedRoute";
import { Home } from "./components/Home";
import { Login } from "./components/Login";
import { Navbar } from "./components/navbar/Navbar";
import { Register } from "./components/Register";
import { Routes, Route, useLocation } from "react-router-dom";

import { Dashboard } from "./components/dashboard/Dashboard";
import { NotesFullScreen } from "./components/dashboard/dashboard/NotesFullScreen";
import { Team } from "./components/dashboard/Team";
import { TMDetailpage } from "./components/dashboard/team/TMDetailpage";
import { TMCreate } from "./components/dashboard/team/TMCreate";
import { TMUpdate } from "./components/dashboard/team/TMUpdate";
import { PasswordReset } from "./components/PasswordReset";
import { ConfirmPasswordReset } from "./components/ConfirmPasswordReset";
import { Projects } from "./components/dashboard/Projects";

function App() {
  const location = useLocation();
  const noNavbar =
    location.pathname === "/register" ||
    location.pathname === "/login" ||
    location.pathname.includes("password-reset");
  return (
    <div className="container">
      {noNavbar ? (
        // Pages withOUT navbar in them
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route
            path="/password-reset/:token"
            element={<ConfirmPasswordReset />}
          />
        </Routes>
      ) : (
        // Pages with the navbar in them
        <Navbar
          content={
            <Routes>
              <Route element={<ProtectedRoute />}>
                {/* THESE ARE LINKS UNAVAILABLE WITHOUT LOGGING IN - it redirects now to login - TO DO - CHANGE IT LATER */}
                <Route path="/projects" element={<Projects />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/notes" element={<NotesFullScreen />} />
                <Route path="/team" element={<Team />} />
                <Route path="/team/member/:id" element={<TMDetailpage />} />
                <Route path="/team/member/create" element={<TMCreate />} />
                <Route path="/team/member/update/:id" element={<TMUpdate />} />
              </Route>
              <Route path="/" element={<Home />} />
            </Routes>
          }
        />
      )}
    </div>
  );
}

export default App;
