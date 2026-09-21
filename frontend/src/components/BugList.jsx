/* eslint-disable react/prop-types */
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import BugListItem from './BugListItem.jsx';
import { NavLink } from 'react-router-dom';
import { GoPlusCircle } from "react-icons/go";
import { FaMagnifyingGlass } from "react-icons/fa6";
import './BugList.css';






const BugList = ({auth}) =>{ 
//   const [selectedBug, setSelectedBug] = useState(null);
  const [bugs, setBug] = useState([]);
  const [deleteCounter] = useState(0);
  const [keywords, setKeywords] = useState('');
  const [classification, setClassification] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [closed, setClosed] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [pageSize] = useState(10);
  const [pageNumber] = useState(1);

  useEffect(() => {
   
    const fetchBug = async () => {
      try{
        console.log('Fetching Bugs...')
        const {data} = await axios.get(`${import.meta.env.VITE_API_URL}/api/bug/listBugs`, { withCredentials: true });
        console.log(data);
        setBug(data);
        
      }catch(error){
        console.log(error);
      }
    };
    fetchBug();
  }, [deleteCounter]);

  function handleConfirmDelete(evt, bugId, ){
    evt.preventDefault();
    try{
     const data = axios.patch(`${import.meta.env.VITE_API_URL}/api/bug/${bugId}/close`, { withCredentials: true });
     window.location.reload();
    }catch(error){
      console.log(error);
    }
  }
  

  const onSubmitSearch = async (evt) => {
    evt.preventDefault();

    try{
      const {data} = await axios.get(`${import.meta.env.VITE_API_URL}/api/bug/listBugs`, {
        headers: {authorization: `Bearer ${auth?.token}`},
        params: {keywords:keywords, classification: classification, closed:closed, sortBy:sortBy, pageSize:pageSize, pageNumber:pageNumber, minAge:minAge, maxAge:maxAge}}
      );
      console.log(data);
      setBug(data);
    }catch(error){
      console.log(error);
    }
  }
  
 
    return (
        <div className="container">
          
            
            <h1>Bugs</h1>
          
              
            <NavLink to="/bug/new" className="btn btn-primary"><GoPlusCircle className="m-1 mb-2" />Add Bug</NavLink>
              
            
            <hr />
            
        
            <div className="card p-4 shadow-sm animated fadeIn">
            <form className="bg-light p-4 rounded shadow-sm">
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
                    placeholder="Search"
                    onChange={(evt) => setKeywords(evt.target.value)}
                />
            </div>
        </div>
        <div className="col-auto">
            <button
                className="btn btn-primary btn-search"
                onClick={(evt) => onSubmitSearch(evt)}
            >
                Search
            </button>
        </div>
    </div>

    {/* Filter Section */}
    <div className="row mb-4">
        <div className="col-md-4 mb-3 mb-md-0">
            <label className="form-label fw-bold">Filter by Classification</label>
            <select
                className="form-select"
                onChange={(evt) => setClassification(evt.target.value)}
            >
                <option value="">Select a Classification</option>
                <option value="Approved">Approved</option>
                <option value="Unapproved">Unapproved</option>
                <option value="Duplicate">Duplicate</option>
            </select>
        </div>
        <div className="col-md-4 mb-3 mb-md-0">
            <div className="form-check">
                <input
                    type="checkbox"
                    className="form-check-input"
                    id="closed"
                    onChange={(evt) => setClosed(evt.target.checked ? 'true' : 'false')}
                />
                <label className="form-check-label fw-bold">Show Open Bugs</label>
            </div>
        </div>
        <div className="col-md-4">
            <label className="form-label fw-bold">Sort By</label>
            <select
                className="form-select"
                onChange={(evt) => setSortBy(evt.target.value)}
            >
                <option value="newest">Sort By</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title">Title</option>
                <option value="classification">Classification</option>
                <option value="assignTo">Assigned To</option>
                <option value="createdBy">Reported By</option>
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
</div>
            <div className="row">
              {bugs.map((bug) => (
                <BugListItem bug={bug} key={bug._id} handleConfirmDelete={handleConfirmDelete} auth={auth} />
              ))}
            </div>
            
        </div>
    )
};

export {BugList} ;