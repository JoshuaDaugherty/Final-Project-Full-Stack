import {useState } from "react"
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { NavLink } from 'react-router-dom';


export default function RegisterForm ({showSuccess, showError, setAuth}){

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [givenName, setGivenName] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [role, setRole] = useState('')

  const navigate = useNavigate(); // Hook for navigation

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    try{
      const response = await axios.post('http://localhost:5000/api/user/register',{email,password,givenName,familyName,role,fullName}, {withCredentials: true});
      showSuccess('User registered successfully');
      navigate('/list'); // Redirect to home page
      localStorage.setItem('auth', JSON.stringify(response.data)); //Save auth to local storage
      setAuth(response.data);
  }catch(err){
    console.log(err);
    showError('Error registering user');
  }
  }
  

    return(
        <div className="container">

        <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">
  
                <div className="d-flex justify-content-center py-4">
                  <a href="index.html" className="logo d-flex align-items-center w-auto">
                    <img src="assets/img/logo.png" alt=""/>
                    <span className="d-none d-lg-block">Register</span>
                  </a>
                </div>
  
                <div className="card mb-3">
  
                  <div className="card-body">
  
                    <div className="pt-4 pb-2">
                      <h5 className="card-title text-center pb-0 fs-4">Create an Account</h5>
                      <p className="text-center small">Enter your personal details to create account</p>
                    </div>
  
                    <form className="row g-3 needs-validation" noValidate onSubmit={(evt) => handleSubmit(evt)}>
                      <div className="col-12">
                        <label htmlFor="txtFullName" className="form-label">Full Name</label>
                        <input type="text" name="name" className="form-control" id="txtFullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                        <div className="invalid-feedback">Please, enter your  Full Name!</div>
                      </div>
  
                      <div className="col-12">
                        <label htmlFor="txtGivenName" className="form-label">First Name</label>
                        <input type="email" name="email" className="form-control" id="txtGivenName" required value={givenName} onChange={(e) => setGivenName(e.target.value)} />
                        <div className="invalid-feedback">Please enter a valid First Name!</div>
                      </div>
  
                      <div className="col-12">
                        <label htmlFor="txtFamilyName" className="form-label">Last Name</label>
                        <div className="input-group has-validation">
                          <input type="text" name="username" className="form-control" id="txtFamilyName" required value={familyName} onChange={(e) => setFamilyName(e.target.value)}/>
                          <div className="invalid-feedback">Please enter a valid Last Name!</div>
                        </div>
                      </div>
  
                      <div className="col-12">
                        <label htmlFor="txtEmail" className="form-label">Email</label>
                        <input type="text" name="email" className="form-control" id="txtEmail" required value={email} onChange={(e) => setEmail(e.target.value)}/>
                        <div className="invalid-feedback">Please enter an Email</div>
                      </div>

                      <div className="col-12">
                        <label htmlFor="txtPassword" className="form-label">Password</label>
                        <input type="text" name="password" className="form-control" id="txtPassword" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        <div className="invalid-feedback">Please enter a valid Password</div>
                      </div>

                      <div className="col-12">
            <label htmlFor="txtRole" className="form-label">Role</label>
            <select 
                name="role" 
                className="form-control" 
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
                          <input className="form-check-input" name="terms" type="checkbox" value="" id="acceptTerms" required/>
                          <label className="form-check-label" htmlFor="acceptTerms">I agree and accept the <a href="#">terms and conditions</a></label>
                          <div className="invalid-feedback">You must agree before submitting.</div>
                        </div>
                      </div>
                      <div className="col-12">
                        <button className="btn btn-primary w-100" type="submit">Create Account</button>
                      </div>
                      <div className="col-12">
                      <NavLink to={`/login`} className="btn btn-primary me-2">
                      Already have an account? Log in
                        </NavLink>                      </div>
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

