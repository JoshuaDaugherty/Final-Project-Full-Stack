/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import './UserEditor.css';

export default function UserEditor({ showError, auth }) {
  const [user, setUser] = useState({ 
    fullName: '', 
    givenName: '', 
    familyName: '', 
    email: '',  
    role: '' 
  }); 

  // State hook to manage Bootstrap's client-side validation class natively
  const [validatedClassName, setValidatedClassName] = useState("");

  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {
        try {
          console.log('Fetching User.......');
          // FIXED: Added withCredentials to avoid 401 errors during view initialization
          const axiosResult = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/user/${userId}`,
            { withCredentials: true }
          );
          
          // Re-normalize roles data array mapping back down into a single string selector for display if needed
          const fetchedUserData = axiosResult.data;
          if (Array.isArray(fetchedUserData.role)) {
            fetchedUserData.role = fetchedUserData.role[0] || '';
          }
          setUser(fetchedUserData);
        } catch (error) {
          console.error("Error retrieving user records:", error);
          showError("Could not retrieve account details safely.");
        }
      }
    };
    fetchUser();
  }, [userId, showError]);

  const addEditUser = async (evt) => {
    evt.preventDefault();
    const form = evt.currentTarget;

    // FIXED: Clean React state-controlled validation interception checks without breaking listeners
    if (form.checkValidity() === false) {
      evt.stopPropagation();
      setValidatedClassName("was-validated");
      return;
    }
    setValidatedClassName("was-validated");

    // FIXED: Package string value back safely into role array wrapper context matching database schemas
    const payload = {
      ...user,
      role: Array.isArray(user.role) ? user.role : [user.role]
    };

    try {
      if (user._id) {
        try {
          const axiosResult = await axios.patch(
            `${import.meta.env.VITE_API_URL}/api/user/${user._id}`, 
            payload, 
            { withCredentials: true }
          );
          console.log(`Axios Result ${axiosResult.data}`);
          navigate('/list');
        } catch (error) {
          // FIXED: Safe optional property chaining reading evaluation updates
          if (error.response?.status === 403) {
            showError(`You do not have permission to edit this User`);
          } else {
            console.error(error);
          }
        }
      } else {
        const axiosResult = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/user/register`, 
          payload,
          { withCredentials: true }
        );
        if (axiosResult.data.message) {
          navigate('/list');
        }
      }
    } catch (error) {
      console.error("Error executing submission route operation:", error);
    }
  };

  return (
    <section className="section">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title fs-4 mb-4">Add / Edit User</h5>
              
              {/* FIXED: Form applies state-controlled validation class dynamically */}
              <form className={`needs-validation ${validatedClassName}`} noValidate onSubmit={addEditUser}>
                
                {/* Full Name Field */}
                <div className="row mb-3">
                  <label htmlFor="txtFullName" className="col-sm-3 col-form-label fw-bold">Full Name:</label>
                  <div className="col-sm-9">
                    <input
                      type="text"
                      className="form-control"
                      id="txtFullName"
                      required
                      value={user.fullName}
                      onChange={(evt) => setUser({ ...user, fullName: evt.target.value })}
                    />
                    <div className="invalid-feedback">Full name value field required.</div>
                  </div>
                </div>

                {/* Given Name Field */}
                <div className="row mb-3">
                  <label htmlFor="txtGivenName" className="col-sm-3 col-form-label fw-bold">Given Name:</label>
                  <div className="col-sm-9">
                    <input
                      type="text"
                      className="form-control"
                      id="txtGivenName"
                      required
                      value={user.givenName}
                      onChange={(evt) => setUser({ ...user, givenName: evt.target.value })}
                    />
                    <div className="invalid-feedback">Given name value field required.</div>
                  </div>
                </div>

                {/* Family Name Field */}
                <div className="row mb-3">
                  <label htmlFor="txtFamilyName" className="col-sm-3 col-form-label fw-bold">Family Name:</label>
                  <div className="col-sm-9">
                    <input
                      type="text"
                      className="form-control"
                      id="txtFamilyName"
                      required
                      value={user.familyName}
                      onChange={(evt) => setUser({ ...user, familyName: evt.target.value })}
                    />
                    <div className="invalid-feedback">Family name value field required.</div>
                  </div>
                </div>

                {/* Email Field */}
                <div className="row mb-3">
                  <label htmlFor="txtEmail" className="col-sm-3 col-form-label fw-bold">Email Address:</label>
                  <div className="col-sm-9">
                    <input
                      type="email"
                      className="form-control"
                      id="txtEmail"
                      required
                      value={user.email}
                      onChange={(evt) => setUser({ ...user, email: evt.target.value })}
                    />
                    <div className="invalid-feedback">Please input a valid email registration identifier string.</div>
                  </div>
                </div>

                {/* Role Field Dropdown */}
                <div className="row mb-4">
                  <label htmlFor="txtRole" className="col-sm-3 col-form-label fw-bold">Role Assignment:</label>
                  <div className="col-sm-9">
                    <select 
                      className="form-select" 
                      id="txtRole" 
                      required
                      value={Array.isArray(user.role) ? (user.role[0] || "") : user.role} 
                      onChange={(evt) => setUser({ ...user, role: evt.target.value })}
                    >
                      <option value="" disabled>Select a role...</option>
                      <option value="Technical Manager">Technical Manager</option>
                      <option value="Developer">Developer</option>
                      <option value="Product Manager">Product Manager</option>
                      <option value="Quality Analyst">Quality Analyst</option>
                      <option value="Business Analyst">Business Analyst</option>
                    </select>
                    <div className="invalid-feedback">Please choose an active system user role tier string identifier.</div>
                  </div>
                </div>

                {/* Submit Controls Block */}
                <div className="row mb-3">
                  <div className="col-sm-9 offset-sm-3">
                    <button type="submit" className="btn btn-primary me-2 px-4">Submit Changes</button>
                    <NavLink to="/list" className="btn btn-outline-secondary px-4">Cancel</NavLink>
                  </div>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
