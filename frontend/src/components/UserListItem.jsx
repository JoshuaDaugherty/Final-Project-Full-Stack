import { useState } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { HiArchiveBoxXMark } from "react-icons/hi2";
import { FaRegEdit } from "react-icons/fa";




export default function UserListItem({user, handleConfirmDelete, auth}){
  
  const [showModal, setShowModal] = useState(false);
 // const navigate = useNavigate();


 return (
  <>
<div className="col-md-4" key={user._id}>
  <div className="card mb-4 shadow-lg" style={{ borderRadius: '15px', background: 'linear-gradient(to right, #f8f9fa, #e9ecef)' }}>
    <div className="card-body">
      <h5 className="card-title" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{user.name}</h5>
      <h6 className="card-subtitle mb-2 text-muted" style={{ fontSize: '1.2rem' }}>Role: {user.role}</h6>
      <p className="card-text"><strong>Full Name:</strong> {user.fullName}</p>
      <p className="card-text"><strong>Email:</strong> {user.email}</p>
     

      <div className="mt-3">
        {auth?.role?.includes('Technical Manager') && (
          <>
            <NavLink to={`/user/${user._id}`} className="btn btn-primary me-2" style={{ transition: '0.3s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}>
              <FaRegEdit className="mb-1" style={{ fontSize: '1.2rem' }}/>
              Edit
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
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirm Deactivation</h5>
            <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to deactivate <strong>{user.name}</strong>?</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="button" className="btn btn-danger" onClick={(evt) => handleConfirmDelete(evt, user._id)}>Deactivate</button>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
  </>
);

}