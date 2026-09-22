/* eslint-disable react/prop-types */
import axios from "axios";
import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';

export default function LoginForm({ showSuccess, showError, setAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // State hook to manage Bootstrap's client-side validation class natively
  const [validatedClassName, setValidatedClassName] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    // FIXED: Clean React state management intercept checks without breaking on re-renders
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidatedClassName("was-validated");
      return;
    }
    setValidatedClassName("was-validated");
   
    try {
      let response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/login`, 
        { email, password }, 
        { withCredentials: true }
      );
      
      if (response.status === 200) {
        if (response.data.message === 'Invalid email or password') {
          showError(response.data.message);
        } else {
          showSuccess(response.data.message || "Logged in successfully!");
          setAuth(response.data);
          localStorage.setItem('auth', JSON.stringify(response.data)); 
          navigate('/list');
        }
      }
    } catch (err) {
      // FIXED: Optional chaining prevents UI crash if network response details are absent
      console.log("Catch Block Error:", err.response?.data || err.message);
      showError(err.response?.data?.error || "A connection error occurred. Please try again.");
    }
  };

  return (
    <div className="container">
      <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">

              <div className="d-flex justify-content-center py-4">
                {/* FIXED: Replaced raw href asset with clear framework header tag context */}
                <NavLink to="/" className="logo d-flex align-items-center w-auto text-decoration-none">
                  <span className="fs-3 fw-bold text-dark">IssueTracker</span>
                </NavLink>
              </div>

              <div className="card mb-3">
                <div className="card-body">
                  <div className="pt-4 pb-2">
                    <h5 className="card-title text-center pb-0 fs-4">Login to Your Account</h5>
                    <p className="text-center small">Enter your email & password to login</p>
                  </div>

                  {/* FIXED: Form applies state-controlled validation class dynamically */}
                  <form className={`row g-3 needs-validation ${validatedClassName}`} noValidate onSubmit={handleSubmit}>
                    
                    <div className="col-12">
                      {/* FIXED: Changed text to matching Email structure to match state variables context */}
                      <label htmlFor="yourEmail" className="form-label">Email Address</label>
                      <div className="input-group has-validation">
                        <span className="input-group-text" id="inputGroupPrepend">@</span>
                        <input 
                          type="email" 
                          name="email" 
                          className="form-control" 
                          id="yourEmail" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          required
                        />
                        <div className="invalid-feedback">Please enter a valid email address.</div>
                      </div>
                    </div>

                    <div className="col-12">
                      <label htmlFor="yourPassword" className="form-label">Password</label>
                      <input 
                        type="password" 
                        name="password" 
                        className="form-control" 
                        id="yourPassword" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required
                      />
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
                    
                    <div className="col-12 text-center mt-3">
                      <NavLink to="/register" className="small text-decoration-none">
                        Don't have an account? Create an account
                      </NavLink>
                    </div>
                  </form>

                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
