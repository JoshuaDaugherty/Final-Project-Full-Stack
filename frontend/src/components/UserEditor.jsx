import { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import './UserEditor.css'

export default function UserEditor ({showError, auth}){

  const [user, setUser] = useState({fullName: '', givenName: '', familyName: '', email: '',  role:''}); 

  const navigate = useNavigate();
  const { userId } = useParams();
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
    console.log('Fetching User.......');
    
    const fetchUser = async () => {
      
      if(userId){
        const axiosResult = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/${userId}`);
        setUser(axiosResult.data);
    };};
    fetchUser();
  }, []); // Only run the first time this component is rendered


  const addEditUser = async (evt) => {
    evt.preventDefault();
    try{
      if(user._id){
        try{
          
          const axiosResult = await axios.patch(`${import.meta.env.VITE_API_URL}/api/user/${user._id}`, user, {withCredentials:true});
          console.log(`Axios Result ${axiosResult.data}`);

        navigate('/list');
        }catch(error){
          if(error.response.status === 403){
            showError(`You do not have permission to edit this User`);
          }
        }
      }else{
        const axiosResult = await axios.post('http://localhost:5000/api/user/register', user,{withCredentials:true});
        if(axiosResult.data.message){
          navigate('/list');
        }
      }
    }catch(error){
      console.log(error);
    }
  };
  

  return (
    <section className="section">
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Add/Edit User</h5>
            <form className="needs-validation" noValidate onSubmit={addEditUser }>
              {/* Full Name Field */}
              <div className="row mb-3">
                <label htmlFor="txtFullName" className="col-sm-3 col-form-label">Full Name:</label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control"
                    id="txtFullName"
                    required
                    value={user.fullName}
                    onChange={(evt) => setUser ({ ...user, fullName: evt.target.value })}
                  />
                </div>
              </div>

              {/* Given Name Field */}
              <div className="row mb-3">
                <label htmlFor="txtGivenName" className="col-sm-3 col-form-label">Given Name:</label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control"
                    id="txtGivenName"
                    required
                    value={user.givenName}
                    onChange={(evt) => setUser ({ ...user, givenName: evt.target.value })}
                  />
                </div>
              </div>

              {/* Family Name Field */}
              <div className="row mb-3">
                <label htmlFor="txtFamilyName" className="col-sm-3 col-form-label">Family Name:</label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control"
                    id="txtFamilyName"
                    required
                    value={user.familyName}
                    onChange={(evt) => setUser ({ ...user, familyName: evt.target.value })}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="row mb-3">
                <label htmlFor="txtEmail" className="col-sm-3 col-form-label">Email:</label>
                <div className="col-sm-9">
                  <input
                    type="email"
                    className="form-control"
                    id="txtEmail"
                    required
                    value={user.email}
                    onChange={(evt) => setUser ({ ...user, email: evt.target.value })}
                  />
                </div>
              </div>

              {/* Role Field */}
              <div className="row mb-3">
                <label htmlFor="txtRole" className="col-sm-3 col-form-label">Role:</label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className="form-control"
                    id="txtRole"
                    required
                    value={user.role}
                    onChange={(evt) => setUser ({ ...user, role: evt.target.value })}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="row mb-3">
                <div className="col-sm-9 offset-sm-3">
                  <button type="submit" className="btn btn-primary me-2">Submit</button>
                  <NavLink to="/list" className="btn btn-secondary">Cancel</NavLink>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
  )
};

