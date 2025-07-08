
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import DashboardPage from './components/DashboardPage';
import Homepage from './components/Homepage';
import AboutUsPage from './components/AboutUsPage';
import ContactUsPage from './components/ContactUsPage';
import ManageUsersPage from './components/ManageUsersPage';
import ProfilePage from './components/ProfilePage';

function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/homepage" element={<Homepage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/about-us" element={<AboutUsPage />} />
      <Route path="/contact-us" element={<ContactUsPage />} />
      <Route path="/dashboard/manage-users" element={<ManageUsersPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
