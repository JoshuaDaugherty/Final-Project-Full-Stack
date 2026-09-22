/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserListItem from './UserListItem.jsx';
import { FaMagnifyingGlass } from "react-icons/fa6";

const UserList = ({ auth }) => { 
  const [users, setUser] = useState([]);
  const [deleteCounter, setDeleteCounter] = useState(0);
  const [keywords, setKeywords] = useState('');
  const [role, setRole] = useState('');
  const [sortBy, setSortBy] = useState('givenName');
  
  // 4. FIXED: Replaced invalid empty configuration strings with default numerical properties
  const [pageSize] = useState(10);
  const [pageNumber] = useState(1);
  const [maxAge, setMaxAge] = useState('');
  const [minAge, setMinAge] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('Fetching Users...');
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/user/list`, 
          { withCredentials: true }
        );
        setUser(data);
      } catch (error) {
        console.error("Error fetching users roster:", error);
      }
    };
    fetchUser();
  }, [deleteCounter]);

  // 1 & 3. FIXED: Added async/await parameters and optimized structural state calculations
  async function handleConfirmDelete(evt, userId) {
    evt.preventDefault();
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/user/${userId}`, 
        { withCredentials: true }
      );
      setDeleteCounter(prev => prev + 1);
    } catch (error) {
      console.error("Error deleting user document:", error);
    }
  }

  const onSubmitSearch = async (evt) => {
    evt.preventDefault();
    try {
      // 2. FIXED: Removed contradictory Bearer token definitions and added cookie permissions validation
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/list`, {
        withCredentials: true,
        params: {
          keywords, 
          role, 
          sortBy, 
          pageSize, 
          pageNumber, 
          minAge, 
          maxAge
        }
      });
      setUser(data);
    } catch (error) {
      console.error("Error running user filter mapping query:", error);
    }
  };
  
  return (
    <div className="container">
      <h1>Users</h1>
      <hr />
      
      {/* Structural Fix: Wrapped sections to support unified submission actions dynamically */}
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
                placeholder="Search user profile indexes..."
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
            <label className="form-label fw-bold">Filter by Role</label>
            <select className="form-select" onChange={(evt) => setRole(evt.target.value)}>
              <option value="">Select a Role</option>
              <option value="Technical Manager">Technical Manager</option>
              <option value="Developer">Developer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Quality Analyst">Quality Analyst</option>
              <option value="Business Analyst">Business Analyst</option>
            </select>
          </div>
          
          <div className="col-md-4">
            <label className="form-label fw-bold">Sort By</label>
            <select className="form-select" value={sortBy} onChange={(evt) => setSortBy(evt.target.value)}>
              <option value="givenName">Sort By</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="givenName">Name</option>
              <option value="role">Role</option>
            </select>
          </div>
        </div>

        {/* Age Filter Section */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3 mb-md-0">
            <label htmlFor="txtMinAge" className="form-label fw-bold">Minimum Age</label>
            <input
              type="number"
              name="txtMinAge"
              id="txtMinAge"
              className="form-control"
              onChange={(evt) => setMinAge(evt.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="txtMaxAge" className="form-label fw-bold">Maximum Age</label>
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

      <div className="row mt-4">
        {users.map((user) => (
          <UserListItem user={user} key={user._id} handleConfirmDelete={handleConfirmDelete} auth={auth} />
        ))}
      </div>
    </div>
  );
};

export { UserList };
