/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate, useParams } from "react-router-dom";

export default function BugEditor({ showError }) {
  const [bug, setBug] = useState({
    title: '', 
    description: '', 
    stepsToReproduce: '', 
    assignedTo: '', 
    classification: 'Unclassified', 
    closed: ''
  }); 
  
  // State hook to manage Bootstrap's client-side validation class natively
  const [validatedClassName, setValidatedClassName] = useState("");

  const navigate = useNavigate();
  const { bugId } = useParams();

  useEffect(() => {
    const fetchBug = async () => {
      if (bugId) {
        try {
          console.log('Fetching Bug.......');
          // FIXED: Added withCredentials to safely transmit auth session cookies
          const axiosResult = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/bug/${bugId}`,
            { withCredentials: true }
          );
          setBug(axiosResult.data);
        } catch (error) {
          console.error("Error fetching bug data:", error);
          if (error.response?.status === 403 || error.response?.status === 401) {
            showError("You do not have permission to view this bug details.");
          }
        }
      }
    };
    fetchBug();
  }, [bugId, showError]);

  const addEditBug = async (evt) => {
    evt.preventDefault();
    const form = evt.currentTarget;

    // FIXED: Standard React-friendly way to intercept validity state without raw DOM listeners
    if (form.checkValidity() === false) {
      evt.stopPropagation();
      setValidatedClassName("was-validated");
      return; // Stop form submission execution if fields are invalid
    }
    setValidatedClassName("was-validated");

    try {
      if (bug._id) {
        try {
          const axiosResult = await axios.patch(
            `${import.meta.env.VITE_API_URL}/api/bug/${bug._id}`, 
            bug, 
            { withCredentials: true }
          );
          console.log(`Axios Result ${axiosResult.data}`);
          navigate('/listBugs');
        } catch (error) {
          // FIXED: Safe property chaining evaluation checks
          if (error.response?.status === 403) {
            showError(`You do not have permission to edit this bug`);
          } else {
            console.error(error);
          }
        }
      } else {
        const axiosResult = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/bug/new`, 
          bug,
          { withCredentials: true }
        );
        if (axiosResult.data.message) {
          navigate('/listBugs');
        }
      }
    } catch (error) {
      console.log(`Error running request: ${error}`);
    }
  };

  return (
    <>
      <h1>{bug._id ? "Edit Bug" : "Add New Bug"}</h1>
      {/* FIXED: Form applies state-controlled validation class dynamically */}
      <form className={`needs-validation ${validatedClassName}`} noValidate onSubmit={addEditBug}>
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
              value={bug.closed !== undefined ? String(bug.closed) : ""}
              onChange={(evt) => setBug({ ...bug, closed: evt.target.value === "true" })}
            >
              <option value="">Select a Status</option>
              <option value="false">Open</option>
              <option value="true">Closed</option>
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
  );
}
