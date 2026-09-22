/* eslint-disable react/prop-types */
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HiArchiveBoxXMark } from "react-icons/hi2";
import { FaRegEdit } from "react-icons/fa";

export default function BugListItem({ bug, handleConfirmDelete, auth }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* FIXED: Removed key attribute wrapper string from child root level component */}
      <div className="col-md-4">
        <div className="card mb-4 shadow-lg position-relative" style={{ borderRadius: '15px', background: 'linear-gradient(to right, #f8f9fa, #e9ecef)' }}>
          {/* Status Color Dot */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: bug.closed ? '#dc3545' : '#007bff',
              border: '2px solid white',
              boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)'
            }}
          ></div>

          <div className="card-body">
            <h5 className="card-title" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{bug.title}</h5>
            <h6 className="card-subtitle mb-2 text-muted" style={{ fontSize: '1.2rem' }}>Classification: {bug.classification}</h6>
            <p className="card-text"><strong>Description:</strong> {bug.description}</p>
            <p className="card-text"><strong>Steps to Reproduce:</strong> {bug.stepsToReproduce}</p>
            <p className="card-text"><strong>Assigned To:</strong> {bug.assignedTo}</p>
            <p className="card-text"><strong>Hours Logged:</strong> {bug.hoursLogged}</p>
            <p className="card-text"><strong>Software Version:</strong> {bug.softwareVersion}</p>
            <p className="card-text">
              <strong>Status:</strong>
              <span className="ms-2" style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: bug.closed ? '#dc3545' : '#007bff'
              }}></span>
              {bug.closed ?
                <span className="badge bg-danger ms-2" style={{ borderRadius: '12px' }}>Closed</span> :
                <span className="badge bg-primary ms-2" style={{ borderRadius: '12px' }}>Open</span>
              }
            </p>

            <div className="mt-3">
              {auth?.role?.includes('Business Analyst') && (
                <>
                  <NavLink to={`/bug/${bug._id}`} className="btn btn-primary me-2" style={{ transition: '0.3s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}>
                    <FaRegEdit className="mb-1" style={{ fontSize: '1.2rem' }}/> Edit
                  </NavLink>
                  <button className="btn btn-danger" style={{ transition: '0.3s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#c82333'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#dc3545'} onClick={() => setShowModal(true)}>
                    <HiArchiveBoxXMark className="mb-1" style={{ fontSize: '1.2rem' }} /> Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {showModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Close</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to Close <strong>{bug.title}</strong>?</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  {/* FIXED: Form backdrop is safely dismissed instantly upon confirming close operation */}
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={(evt) => {
                      handleConfirmDelete(evt, bug._id);
                      setShowModal(false);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
