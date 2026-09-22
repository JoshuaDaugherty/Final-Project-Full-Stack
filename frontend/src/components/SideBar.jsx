import { NavLink } from "react-router-dom";

const SideBar = () => {
  return (
    <aside id="sidebar" className="sidebar bg-light border-end" style={{ minWidth: '250px', minHeight: '100vh' }}>
      <ul className="sidebar-nav list-unstyled p-3" id="sidebar-nav">
        
        {/* Core Dashboard / Home link */}
        <li className="nav-item mb-2">
          <NavLink 
            className={({ isActive }) => isActive ? "nav-link d-flex align-items-center p-2 rounded bg-primary text-white" : "nav-link d-flex align-items-center p-2 rounded text-dark text-decoration-none"} 
            to="/"
          >
            <i className="bi bi-grid me-2"></i>
            <span>Dashboard</span>
          </NavLink>
        </li>

        <li className="nav-heading text-uppercase text-muted small fw-bold my-3">Management</li>

        {/* Bugs Management Submenu Links */}
        <li className="nav-item mb-2">
          <NavLink 
            className={({ isActive }) => isActive ? "nav-link d-flex align-items-center p-2 rounded bg-primary text-white" : "nav-link d-flex align-items-center p-2 rounded text-dark text-decoration-none"} 
            to="/listBugs"
          >
            <i className="bi bi-bug me-2"></i>
            <span>All Bugs</span>
          </NavLink>
        </li>

        <li className="nav-item mb-2">
          <NavLink 
            className={({ isActive }) => isActive ? "nav-link d-flex align-items-center p-2 rounded bg-primary text-white" : "nav-link d-flex align-items-center p-2 rounded text-dark text-decoration-none"} 
            to="/bug/new"
          >
            <i className="bi bi-plus-circle me-2"></i>
            <span>Report New Bug</span>
          </NavLink>
        </li>

        {/* Users Directory Management Links */}
        <li className="nav-item mb-2">
          <NavLink 
            className={({ isActive }) => isActive ? "nav-link d-flex align-items-center p-2 rounded bg-primary text-white" : "nav-link d-flex align-items-center p-2 rounded text-dark text-decoration-none"} 
            to="/list"
          >
            <i className="bi bi-people me-2"></i>
            <span>All Users</span>
          </NavLink>
        </li>

        <li className="nav-heading text-uppercase text-muted small fw-bold my-3">Account</li>

        {/* User Profile Path Configuration Link */}
        <li className="nav-item mb-2">
          <NavLink 
            className={({ isActive }) => isActive ? "nav-link d-flex align-items-center p-2 rounded bg-primary text-white" : "nav-link d-flex align-items-center p-2 rounded text-dark text-decoration-none"} 
            to="/me"
          >
            <i className="bi bi-person me-2"></i>
            <span>My Profile</span>
          </NavLink>
        </li>

        {/* Authentication Fallback Navigation Links */}
        <li className="nav-item mb-2">
          <NavLink 
            className={({ isActive }) => isActive ? "nav-link d-flex align-items-center p-2 rounded bg-primary text-white" : "nav-link d-flex align-items-center p-2 rounded text-dark text-decoration-none"} 
            to="/login"
          >
            <i className="bi bi-box-arrow-in-right me-2"></i>
            <span>Login</span>
          </NavLink>
        </li>

        <li className="nav-item mb-2">
          <NavLink 
            className={({ isActive }) => isActive ? "nav-link d-flex align-items-center p-2 rounded bg-primary text-white" : "nav-link d-flex align-items-center p-2 rounded text-dark text-decoration-none"} 
            to="/register"
          >
            <i className="bi bi-card-list me-2"></i>
            <span>Register</span>
          </NavLink>
        </li>

      </ul>
    </aside>
  );
};

export default SideBar;
