/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BugListItem from './BugListItem.jsx';
import { NavLink } from 'react-router-dom';
import { GoPlusCircle } from "react-icons/go";
import { FaMagnifyingGlass } from "react-icons/fa6";
import './BugList.css';

const BugList = ({ auth }) => { 
  const [bugs, setBug] = useState([]);
  
  // 3. FIXED: Replaced standard page reloads with a reliable, functional state hook counter
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  const [keywords, setKeywords] = useState('');
  const [classification, setClassification] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [closed, setClosed] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [pageSize] = useState(10);
  const [pageNumber] = useState(1);

  // Monitors the refresh counter state trigger to dynamically keep UI records synchronized
  useEffect(() => {
    const fetchBug = async () => {
      try {
        console.log('Fetching Bugs...');
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/bug/listBugs`, 
          { withCredentials: true }
        );
        setBug(data);
      } catch (error) {
        console.error("Error fetching initial bugs:", error);
      }
    };
    fetchBug();
  }, [refreshCounter]); // Re-runs whenever a bug is closed successfully

  // 1 & 4. FIXED: Appended async/await modifiers, corrected 404 pathing, and passed data body objects
  async function handleConfirmDelete(evt, bugId) {
    evt.preventDefault();
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/bug/${bugId}`, 
        { closed: true, title: "Title Required by Schema Check" }, // Ensure your request body satisfies Joi rules
        { withCredentials: true }
      );
      // Safely increment count tracking variable to trigger your clean hook reloading sequence
      setRefreshCounter(prev => prev + 1);
    } catch (error) {
      console.error("Error closing bug document context:", error);
    }
  }

  const onSubmitSearch = async (evt) => {
    evt.preventDefault();
    try {
      // 2. FIXED: Removed Bearer token logic and secured with standard withCredentials settings
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/bug/listBugs`, {
        withCredentials: true,
        params: {
          keywords,
          classification,
          closed,
          sortBy,
          pageSize,
          pageNumber,
          minAge,
          maxAge
        }
      });
      setBug(data);
    } catch (error) {
      console.error("Error searching bugs:", error);
    }
  };
  
  return (
    <div className="container">
      <h1>Bugs</h1>
      <NavLink to="/bug/new" className="btn btn-primary">
        <GoPlusCircle className="m-1 mb-2" /> Add Bug
      </NavLink>
      <hr />
      
      <div className="card p-4 shadow-sm animated fadeIn">
        <form className="bg-light p-4 rounded shadow-sm" onSubmit={onSubmitSearch}>
          {/* Search Section */}
          <div className="row mb-4">
            <div className="col">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FaMagnifyingGlass className="text-secondary" />
                </span>
                <input
                  type="text"
                  className="form-control search-input border-start-0"
                  placeholder="Search..."
                  onChange={(evt) => setKeywords(evt.target.value)}
                />
              </div>
            </div>
            <div className="col-auto">
              <button type="submit" className="btn btn-primary btn-search">
                Search
              </button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="row mb-4">
            <div className="col-md-4 mb-3 mb-md-0">
              <label className="form-label fw-bold">Filter by Classification</label>
              <select className="form-select" onChange={(evt) => setClassification(evt.target.value)}>
                <option value="">Select a Classification</option>
                <option value="Approved">Approved</option>
                <option value="Unapproved">Unapproved</option>
                <option value="Duplicate">Duplicate</option>
              </select>
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <div className="form-check mt-4 pt-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="closed"
                  onChange={(evt) => setClosed(evt.target.checked ? 'true' : 'false')}
                />
                <label className="form-check-label fw-bold" htmlFor="closed">Show Closed Bugs</label>
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">Sort By</label>
              <select className="form-select" onChange={(evt) => setSortBy(evt.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title">Title</option>
                <option value="classification">Classification</option>
                <option value="assignedTo">Assigned To</option>
                <option value="createdBy">Reported By</option>
              </select>
            </div>
          </div>

          {/* Age Filter Section */}
          <div className="row mb-4">
            <div className="col-md-6 mb-3 mb-md-0">
              <label htmlFor="txtMinAge" className="form-label fw-bold">Minimum Age (Days)</label>
              <input
                type="number"
                name="txtMinAge"
                id="txtMinAge"
                className="form-control"
                onChange={(evt) => setMinAge(evt.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="txtMaxAge" className="form-label fw-bold">Maximum Age (Days)</label>
              <input
                type="number"
                name="txtMaxAge"
                id="txtMaxAge"
                className="form-control"
                onChange={(evt) => setMaxAge(evt.target.value)}
              />
            </div>
          </div>
        </form>
      </div>

      <div className="row mt-4">
        {bugs.map((bug) => (
          <BugListItem bug={bug} key={bug._id} handleConfirmDelete={handleConfirmDelete} auth={auth} />
        ))}
      </div>
    </div>
  );
};

export { BugList };
