/* eslint-disable react/prop-types */
import { NavLink } from "react-router-dom";
import { IoPerson } from "react-icons/io5";
import { IoPersonAddOutline } from "react-icons/io5";



const Navbar = ({ auth, onLogout }) => {
  const onClickLogout = (evt) => {
    evt.preventDefault();
    onLogout();
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
    <div className="container-fluid">
      <a className="navbar-brand animate-issueTracker" href="#">IssueTracker</a>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav me-auto">
          {auth && (
            <>
              <li className="nav-item">
                <NavLink className="nav-link" aria-current="page" to="/" activeClassName="active">Home</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/list" activeClassName="active">All Users</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/listBugs" activeClassName="active">All Bugs</NavLink>
              </li>
            </>
          )}
        </ul>
        <ul className="navbar-nav ms-auto">
          {auth ? (
            <>
              <li className="nav-item">
                <NavLink className="nav-link" to="/me" id="userDropdown" role="button">
                  
                  <IoPerson className="mb-1"/> Welcome {auth.email} - {auth.role.join(', ')}
                </NavLink>
              </li>
              <li className="nav-item">
                <button className="nav-link btn btn-danger" onClick={(evt) => onClickLogout(evt)}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <NavLink to="/login" className='nav-link' activeClassName="active">Login</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/register" className='nav-link'><IoPersonAddOutline className="mb-1" /> Register</NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  </nav>  );
};

export default Navbar;