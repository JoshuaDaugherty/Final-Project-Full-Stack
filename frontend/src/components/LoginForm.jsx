import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import 'react-toastify/dist/ReactToastify.css';
import { NavLink } from 'react-router-dom';





export default function LoginForm({ showSuccess, showError, setAuth }) {



  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //const [message, setMessage] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const navigate = useNavigate();


  useEffect(() => {
    (() => {
      "use strict";
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      const forms = document.querySelectorAll(".needs-validation");

      // Loop over them and prevent submission
      Array.from(forms).forEach((form) => {
        form.addEventListener(
          "submit",
          (event) => {
            if (!form.checkValidity()) {
              event.preventDefault();
              event.stopPropagation();
            }

            form.classList.add("was-validated");
          },
          false
        );
      });
    })();
  }, []); // Run only once when the component loads

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    try{
      let response = await axios.post(`http://localhost:5000/api/user/login`, { email, password }, { withCredentials: true });
      console.log(import.meta.env.VITE_API_URL);
      if(response.status === 200){
        if(response.data.message == 'Invalid email or password'){
         //setMessage(response.data.message);
          showError(response.data.message);
        }else{
          //setMessage(response.data.message);
          showSuccess(response.data.message);
          setAuth(response.data);
          localStorage.setItem('auth', JSON.stringify(response.data)); //Save auth to local storage
          navigate('/list');
        }
      }
      
      //setMessage(response.data.message);
    }catch(e){
      console.log(`Catch Block: ${e.response.data}`);
    }
   
  };

 

  return (
    <div className="container">

      <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">

              <div className="d-flex justify-content-center py-4">
                <a href="index.html" className="logo d-flex align-items-center w-auto">
                  <img src="assets/img/logo.png" alt=""/>
                  <span className="d-none d-lg-block">Login</span>
                </a>
              </div>

              <div className="card mb-3">

                <div className="card-body">

                  <div className="pt-4 pb-2">
                    <h5 className="card-title text-center pb-0 fs-4">Login to Your Account</h5>
                    <p className="text-center small">Enter your username & password to login</p>
                  </div>

                  <form className="row g-3 needs-validation" noValidate onSubmit={handleSubmit}>

                    <div className="col-12">
                      <label htmlFor="yourUsername" className="form-label">Username </label>
                      <div className="input-group has-validation">
                        <span className="input-group-text" id="inputGroupPrepend">@</span>
                        <input type="text" name="username" className="form-control" id="yourUsername" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                        <div className="invalid-feedback">Please enter your username.</div>
                      </div>
                    </div>

                    <div className="col-12">
                      <label htmlFor="yourPassword" className="form-label">Password</label>
                      <input type="password" name="password" className="form-control" id="yourPassword" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                      <div className="invalid-feedback">Please enter your password!</div>
                    </div>

                    <div className="col-12">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" name="remember" value="true" id="rememberMe"/>
                        <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <button className="btn btn-primary w-100" type="submit">Login</button>
                    </div>
                    <div className="col-12">
                    <NavLink to={`/register`} className="btn btn-primary me-2">
                    Dont have account? Create an account
                        </NavLink>
                    </div>
                  </form>

                </div>
              </div>

              <div className="credits">
                
              </div>

            </div>
          </div>
        </div>

      </section>

    </div>
  )
}
 
