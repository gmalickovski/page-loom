import { Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./LandingPage";
import { AuthScreen } from "./AuthScreen";
import { LibraryApp } from "./LibraryApp";
import { StudioApp } from "./StudioApp";
import "./app.css";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthScreen />} />
      <Route path="/cadastro" element={<AuthScreen />} />
      <Route path="/app/*" element={<LibraryApp />} />
      <Route path="/studio/*" element={<StudioApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
