/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate, useParams } from "react-router-dom";


export default function BugEditor({showError}) {


  const [bug, setBug] = useState({title: '', description: '', stepsToReproduce: '', assignedTo:'', classification:'', closed:''}); 
  

  const navigate = useNavigate();
  const { bugId } = useParams();
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
    console.log('Fetching Bug.......');
    
    const fetchBug = async () => {
      
      if(bugId){
        const axiosResult = await axios.get(`${import.meta.env.VITE_API_URL}/api/bug/${bugId}`);
        setBug(axiosResult.data);
    };};
    fetchBug();
  }, []); // Only run the first time this component is rendered

 
  // Call fetchComments after fetching the bug
  

  const addEditBug = async (evt) => {
    evt.preventDefault();
    try{
      if(bug._id){
        try{
          const axiosResult = await axios.patch(`${import.meta.env.VITE_API_URL}/api/bug/${bug._id}`, bug, {withCredentials:true});
          console.log(`Axios Result ${axiosResult.data}`);

        navigate('/listBugs');
        }catch(error){
          if(error.response.status === 403){
            showError(`You do not have permission to edit this bug`);
          }
        }
      }else{
        const axiosResult = await axios.post(`${import.meta.env.VITE_API_URL}/api/bug/new`, bug,{withCredentials:true});
        if(axiosResult.data.message){
          navigate('/listBugs');
        }
      }
    }catch(error){
      console.log(`Error: ${error}`);
    }

  };

  


  return(
    <>
      <h1>Add/Edit Form</h1>
      <form className="needs-validation" noValidate onSubmit={addEditBug}>
  <div className="row g-3">
    {/* Title Field */}
    <div className="col-md-6">
      <label htmlFor="txtTitle" className="form-label">Title</label>
      <input
        type="text"
        className="form-control"
        id="txtTitle"
        required
        value={bug.title}
        onChange={(evt) => setBug({ ...bug, title: evt.target.value })}
      />
      <div className="valid-feedback">Looks good!</div>
      <div className="invalid-feedback">Please enter a Title</div>
    </div>

    {/* Description Field */}
    <div className="col-md-6">
      <label htmlFor="txtDescription" className="form-label">Description</label>
      <input
        type="text"
        className="form-control"
        id="txtDescription"
        required
        value={bug.description}
        onChange={(evt) => setBug({ ...bug, description: evt.target.value })}
      />
      <div className="valid-feedback">Looks good!</div>
      <div className="invalid-feedback">Please enter a Description</div>
    </div>

    {/* Steps to Reproduce Field */}
    <div className="col-md-6">
      <label htmlFor="txtStepsToReproduce" className="form-label">Steps to Reproduce</label>
      <input
        type="text"
        className="form-control"
        id="txtStepsToReproduce"
        required
        value={bug.stepsToReproduce}
        onChange={(evt) => setBug({ ...bug, stepsToReproduce: evt.target.value })}
      />
      <div className="valid-feedback">Looks good!</div>
      <div className="invalid-feedback">Please enter the Steps to Reproduce the issue</div>
    </div>

    {/* Assign To Field */}
    <div className="col-md-6">
      <label htmlFor="txtAssignTo" className="form-label">Assign To:</label>
      <select
        className="form-select"
        id="txtAssignTo"
        value={bug.assignedTo}
        onChange={(evt) => setBug({ ...bug, assignedTo: evt.target.value })}
      >
        <option value="">Select Who this Bug is Assigned To</option>
        <option value="Developer">Developer</option>
        <option value="Business Analyst">Business Analyst</option>
        <option value="Quality Analyst">Quality Analyst</option>
      </select>
      <div className="valid-feedback">Looks good!</div>
      <div className="invalid-feedback">Please select an option</div>
    </div>

    {/* Classification Field */}
    <div className="col-md-6">
      <label htmlFor="txtClassification" className="form-label">Classification:</label>
      <select
        className="form-select"
        id="txtClassification"
        value={bug.classification}
        onChange={(evt) => setBug({ ...bug, classification: evt.target.value })}
      >
        <option value="Unclassified">Unclassified</option>
        <option value="Approved">Approved</option>
        <option value="Unapproved">Unapproved</option>
        <option value="Duplicate">Duplicate</option>
      </select>
      <div className="valid-feedback">Looks good!</div>
      <div className="invalid-feedback">Please select a Classification</div>
    </div>

    {/* Status Field */}
    <div className="col-md-6">
      <label htmlFor="txtStatus" className="form-label">Status:</label>
      <select
        className="form-select"
        id="txtStatus"
        value={bug.closed}
        onChange={(evt) => setBug({ ...bug, closed: evt.target.value })}
      >
        <option value="">Select a Status</option>
        <option value="true">Open</option>
        <option value="false">Closed</option>
      </select>
      <div className="valid-feedback">Looks good!</div>
      <div className="invalid-feedback">Please select a Status</div>
    </div>
  </div>

 

  {/* Buttons */}
  <div className="mt-4">
    <button type="submit" className="btn btn-primary me-2">Submit</button>
    <NavLink to="/listBugs" className="btn btn-outline-secondary">Cancel</NavLink>
  </div>
</form>
    </>
  )
};