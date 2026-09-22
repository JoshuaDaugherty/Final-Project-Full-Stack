import React, { useState, useEffect } from 'react';
import axios from 'axios';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import Header from './components/Header.jsx';
// 1. FIXED: Corrected capitalization to match your physical LoginForm.jsx file name
import LoginForm from './components/LoginForm.jsx'; 
import RegisterForm from './components/RegisterForm.jsx'; 
import { BugList } from './components/BugList.jsx'; 
import BugEditor from './components/BugEditor.jsx'; 
import { UserList } from './components/UserList.jsx'; 
import UserEditor from './components/UserEditor.jsx'; 
import { Route, Routes, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

function App() {
  const [auth, setAuth] = useState(null);
  const navigate = useNavigate();

  function showSuccess(message) {
    toast(message, { type: 'success', position: 'top-left', autoClose: 3000 });
  }

  function showError(message) {
    toast(message, { type: 'error', position: 'top-left', autoClose: 3000 });
  }

  function onLogout() {
    setAuth(null);
    // 4. FIXED: Prefixed the logout path with the environment variable template string 
    axios.post(`${import.meta.env.VITE_API_URL}/api/user/logout`, {}, { withCredentials: true })
      .then((response) => {
        console.log(response.data);
        navigate('/');
        showSuccess('Logged out!');
      })
      .catch((error) => {
        console.error(error);
        showError('Logout failed cleanly.');
      });
    localStorage.removeItem('auth');
  }

  useEffect(() => {
    const savedAuth = JSON.parse(localStorage.getItem('auth'));
    if (savedAuth) {
      setAuth(savedAuth);
    }
  }, []);

  return (
    <div className="container">
      <ToastContainer />
      <header>
        <Header auth={auth} onLogout={onLogout} />
      </header>
      
      <main className="py-4">
        <Routes>
          {/* Authentication Routes */}
          <Route path='/' element={<LoginForm showSuccess={showSuccess} showError={showError} setAuth={setAuth} />} />
          <Route path='/login' element={<LoginForm showSuccess={showSuccess} showError={showError} setAuth={setAuth} />} />
          <Route path='/register' element={<RegisterForm showSuccess={showSuccess} showError={showError} setAuth={setAuth} />} />
          
          {/* User Directories & Editing Roster Routes (2 & 3. FIXED props passing) */}
          <Route path='/list' element={<UserList showSuccess={showSuccess} auth={auth} />} />
          <Route path='/user/register' element={<UserEditor auth={auth} showError={showError} />} /> 
          <Route path='/user/:userId' element={<UserEditor auth={auth} showError={showError} />} /> 
          
          {/* Bugs Directories & Editing Core Components (3. FIXED props passing) */}
          <Route path='/listBugs' element={<BugList showSuccess={showSuccess} auth={auth} />} /> 
          <Route path='/bug/new' element={<BugEditor auth={auth} showError={showError} />} /> 
          <Route path='/bug/:bugId' element={<BugEditor auth={auth} showError={showError} />} /> 
        </Routes>
      </main>
    </div>
  );
}

export default App;
