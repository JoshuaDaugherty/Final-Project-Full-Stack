/* eslint-disable react/prop-types */
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HiArchiveBoxXMark } from "react-icons/hi2";
import { FaRegEdit } from "react-icons/fa";

export default function UserListItem({ user, handleConfirmDelete, auth }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* FIXED: Removed key assignment from child component template root */}
      <div className="col-md-4">
        <div className="card mb-4 shadow-lg" style={{ borderRadius: '15px', background: 'linear-gradient(to right, #f8f9fa, #e9ecef)' }}>
          <div className="card-body">
            {/* FIXED: Changed broken user.name references to valid user.fullName */}
            <h5 className="card-title" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{user.fullName || `${user.givenName} ${user.familyName}`}</h5>
            
            {/* Array safe normalization: renders role cleanly whether backend treats it as string or array */}
            <h6 className="card-subtitle mb-2 text-muted" style={{ fontSize: '1.2rem' }}>
              Role: {Array.isArray(user.role) ? user.role.join(', ') : user.role}
            </h6>
            
            <p className="card-text"><strong>First Name:</strong> {user.givenName}</p>
            <p className="card-text"><strong>Last Name:</strong> {user.familyName}</p>
            <p className="card-text"><strong>Email:</strong> {user.email}</p>
           
            <div className="mt-3">
              {auth?.role?.includes('Technical Manager') && (
                <>
                  <NavLink to={`/user/${user._id}`} className="btn btn-primary me-2" style={{ transition: '0.3s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}>
                    <FaRegEdit className="mb-1" style={{ fontSize: '1.2rem' }}/> Edit
                  </NavLink>
                  <button className="btn btn-danger" style={{ transition: '0.3s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#c82333'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#dc3545'} onClick={() => setShowModal(true)}>
                    <HiArchiveBoxXMark className="mb-1" style={{ fontSize: '1.2rem' }} /> Deactivate 
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
                  <h5 className="modal-title">Confirm Deactivation</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  {/* FIXED: Replaced user.name with full name representation */}
                  <p>Are you sure you want to deactivate <strong>{user.fullName}</strong>?</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  {/* FIXED: Clear modal view state hook instantly upon action confirmation trigger */}
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={(evt) => {
                      handleConfirmDelete(evt, user._id);
                      setShowModal(false);
                    }}
                  >
                    Deactivate
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
