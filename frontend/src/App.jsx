import React, { useState, useEffect } from 'react';
import axios from 'axios';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import Header from './components/Header.jsx';
import LoginForm from './components/loginForm'; 
import RegisterForm from './components/RegisterForm.jsx'; 
{/*import BugListItem from './components/BugListItem.jsx'; */ }
 import {BugList} from './components/BugList.jsx'; 
import BugEditor from './components/BugEditor.jsx'; 
import {UserList} from './components/UserList.jsx'; 
{/*import UserListItem from './components/UserListItem.jsx'; */}
import UserEditor from './components/UserEditor.jsx'; 
{/*import SideBar from './components/SideBar.jsx'; */}
import {Route, Routes, useNavigate} from 'react-router-dom';

import {ToastContainer, toast } from 'react-toastify';

function App() {

    const [auth, setAuth] = useState(null);
    const navigate = useNavigate();

  function showSuccess(message) {
    toast(message, {type: 'success', position: 'top-left' ,duration: 3000, });
  }

  function showError(message) {
    toast(message, {type: 'error', position: 'top-left', duration: 3000, });
  }

  function onLogout() {
    setAuth(null);
   // navigate('/');

    //document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=http://localhost:2024/';
    axios.post('/api/user/logout',{},{withCredentials:true}).then(response => {
      console.log(response.data);
      navigate('/');
      showSuccess('Logged out!');
    }).catch(error => {
      console.log(error);
    });
    localStorage.removeItem('auth');
  }
  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('auth'));
    if(auth){
      setAuth(auth);
    }  // Check if auth token is present in local storage and set it as the auth state if it is.
  },[]);

  return(
    <div className="container">
      <ToastContainer />  {/* This will display the toast notifications */}
      <header>
        <Header auth={auth} onLogout={onLogout}/>
      </header>
      <main>
        <Routes>
          <Route path='/' element={<LoginForm showSuccess={showSuccess} showError={showError} setAuth={setAuth}/>} />
          <Route path='/login' element={<LoginForm showSuccess={showSuccess} showError={showError} setAuth={setAuth}/>} />
          <Route path='/register' element={<RegisterForm showSuccess={showSuccess} showError={showError} setAuth={setAuth}/>} />
          <Route path= '/list' element={<UserList showSuccess={showSuccess} auth={auth}/>}/>
          <Route path= '/user/register' element={<UserEditor/>} auth={auth} /> 
          <Route path='/user/:userId' element={<UserEditor showError={showError} />} /> 
          <Route path= '/listBugs' element={<BugList showSuccess={showSuccess} auth={auth}/>} /> 
          <Route path= '/bug/new' element={<BugEditor/>} /> 
          <Route path='/bug/:bugId' element={<BugEditor showError={showError} auth={auth} />} /> 


        </Routes>
      </main>

    </div>
  )
}


export default App;

