/* eslint-disable react/prop-types */
import { useState } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";

export default function RegisterForm({ showSuccess, showError, setAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [role, setRole] = useState('');

  // State hook to manage Bootstrap's client-side validation class natively
  const [validatedClassName, setValidatedClassName] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const form = evt.currentTarget;

    // FIXED: Form validation intercept prevents server payload delivery if empty fields exist
    if (form.checkValidity() === false) {
      evt.stopPropagation();
      setValidatedClassName("was-validated");
      return;
    }
    setValidatedClassName("was-validated");

    try {
      // FIXED: Wrapped single select string into an array context [role] to prevent auth runtime mapping faults
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/register`,
        { email, password, givenName, familyName, role: [role], fullName }, 
        { withCredentials: true }
      );
      
      showSuccess('User registered successfully');
      localStorage.setItem('auth', JSON.stringify(response.data));
      setAuth(response.data);
      navigate('/list');
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.error || 'Error registering user');
    }
  };

  return (
    <div className="container">
      <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">

              <div className="d-flex justify-content-center py-4">
                <NavLink to="/" className="logo d-flex align-items-center w-auto text-decoration-none">
                  <span className="fs-3 fw-bold text-dark">IssueTracker</span>
                </NavLink>
              </div>

              <div className="card mb-3">
                <div className="card-body">
                  <div className="pt-4 pb-2">
                    <h5 className="card-title text-center pb-0 fs-4">Create an Account</h5>
                    <p className="text-center small">Enter your personal details to create account</p>
                  </div>

                  {/* FIXED: Form applies state-controlled validation class dynamically */}
                  <form className={`row g-3 needs-validation ${validatedClassName}`} noValidate onSubmit={handleSubmit}>
                    
                    <div className="col-12">
                      <label htmlFor="txtFullName" className="form-label">Full Name</label>
                      <input type="text" className="form-control" id="txtFullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      <div className="invalid-feedback">Please enter your Full Name!</div>
                    </div>

                    <div className="col-12">
                      {/* FIXED: Changed type="email" to type="text" to prevent string parsing format crash */}
                      <label htmlFor="txtGivenName" className="form-label">First Name</label>
                      <input type="text" className="form-control" id="txtGivenName" required value={givenName} onChange={(e) => setGivenName(e.target.value)} />
                      <div className="invalid-feedback">Please enter a valid First Name!</div>
                    </div>

                    <div className="col-12">
                      <label htmlFor="txtFamilyName" className="form-label">Last Name</label>
                      <input type="text" className="form-control" id="txtFamilyName" required value={familyName} onChange={(e) => setFamilyName(e.target.value)}/>
                      <div className="invalid-feedback">Please enter a valid Last Name!</div>
                    </div>

                    <div className="col-12">
                      {/* FIXED: Changed type="text" to type="email" for accurate native client verification */}
                      <label htmlFor="txtEmail" className="form-label">Email</label>
                      <input type="email" className="form-control" id="txtEmail" required value={email} onChange={(e) => setEmail(e.target.value)}/>
                      <div className="invalid-feedback">Please enter a valid Email address</div>
                    </div>

                    <div className="col-12">
                      {/* FIXED: Changed type="text" to type="password" to securely mask input tokens */}
                      <label htmlFor="txtPassword" className="form-label">Password</label>
                      <input type="password" className="form-control" id="txtPassword" required value={password} onChange={(e) => setPassword(e.target.value)} />
                      <div className="invalid-feedback">Please enter a valid Password</div>
                    </div>

                    <div className="col-12">
                      <label htmlFor="txtRole" className="form-label">Role</label>
                      <select 
                        className="form-select" 
                        id="txtRole" 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)} 
                        required
                      >
                        <option value="" disabled>Select a role</option>
                        <option value="Technical Manager">Technical Manager</option>
                        <option value="Developer">Developer</option>
                        <option value="Product Manager">Product Manager</option>
                        <option value="Quality Analyst">Quality Analyst</option>
                        <option value="Business Analyst">Business Analyst</option>
                      </select>
                      <div className="invalid-feedback">Please select a valid Role</div>
                    </div>

                    <div className="col-12">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="acceptTerms" required/>
                        <label className="form-check-label" htmlFor="acceptTerms">I agree and accept the terms and conditions</label>
                        <div className="invalid-feedback">You must agree before submitting.</div>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <button className="btn btn-primary w-100" type="submit">Create Account</button>
                    </div>
                    
                    <div className="col-12 text-center mt-3">
                      <NavLink to="/login" className="small text-decoration-none">
                        Already have an account? Log in
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
