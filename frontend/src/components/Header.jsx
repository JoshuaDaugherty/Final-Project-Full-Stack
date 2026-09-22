/* eslint-disable react/prop-types */
import { NavLink } from "react-router-dom";
import { IoPerson } from "react-icons/io5";
import { IoPersonAddOutline } from "react-icons/io5";

const Navbar = ({ auth, onLogout }) => {
  const onClickLogout = (evt) => {
    evt.preventDefault();
    onLogout();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        {/* FIXED: Replaced raw anchor href link with native framework NavLink */}
        <NavLink className="navbar-brand animate-issueTracker" to="/">IssueTracker</NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {auth && (
              <>
                <li className="nav-item">
                  {/* FIXED: Removed activeClassName and used modern framework styling logic */}
                  <NavLink className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} aria-current="page" to="/">Home</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/list">All Users</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/listBugs">All Bugs</NavLink>
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
                  {/* Styling adjustment: Ensuring custom button layout acts like a proper nav item link */}
                  <button className="nav-link btn btn-link text-danger text-decoration-none" onClick={(evt) => onClickLogout(evt)}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/login" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Login</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/register" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}><IoPersonAddOutline className="mb-1" /> Register</NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
