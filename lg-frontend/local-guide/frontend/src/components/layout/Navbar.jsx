import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

import {
  FaMapMarkedAlt,
  FaMoon,
  FaBars,
  FaTimes
} from "react-icons/fa";

function Navbar() {

  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    document.body.classList.toggle("dark");
    setDarkMode(!darkMode);
  };

  return (
    <nav className="navbar">

      <div className="logo">
        <FaMapMarkedAlt />
        <span>Local Guide</span>
      </div>

      <div className={`nav-links ${menuOpen ? "active" : ""}`}>

        <Link
          to="/"
          className={
            location.pathname === "/"
              ? "active-link"
              : ""
          }
        >
          Home
        </Link>

        <Link
          to="/map"
          className={
            location.pathname === "/map"
              ? "active-link"
              : ""
          }
        >
          Map
        </Link>

        <Link
          to="/search"
          className={
            location.pathname === "/search"
              ? "active-link"
              : ""
          }
        >
          Search
        </Link>

        <Link
          to="/categories"
          className={
            location.pathname === "/categories"
              ? "active-link"
              : ""
          }
        >
          Categories
        </Link>

      </div>

      <div className="navbar-actions">

        <button
          className="theme-btn"
          onClick={toggleDarkMode}
        >
          <FaMoon />
        </button>

        <Link to="/login">
          <button className="login-btn">
            Login
          </button>
        </Link>

        <button
          className="menu-btn"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

      </div>

    </nav>
  );
}

export default Navbar;