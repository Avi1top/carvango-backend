import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/session/AuthContext ";
import classes from "./nav.module.css";
import logo from "../../../assets/imgs/logologo.png";
import cartLogo from "../../../assets/imgs/cart.ico";
import { FaBars, FaTimes } from "react-icons/fa"; // Import icons for menu toggle

function CustomLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li className={isActive ? classes.active : ""}>
      <Link to={to}>{children}</Link>
    </li>
  );
}

export default function Nav() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage menu visibility
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    console.log("Nav component re-rendered. isAuthenticated:", isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) { // Adjust the scroll threshold as needed
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogin = () => {
    navigate("/logIn");
  };

  const handleOrderOnline = () => {
    navigate("/menu");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle menu visibility
  };

  return (
    <div className={`${classes.nav} ${isScrolled ? classes.scrolled : ""}`}>
      <div className={classes.logo}>
        <Link to="/home">
          <img src={logo} alt="Logo" />
        </Link>
      </div>
      <div className={classes.menuIcon} onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </div>
      <nav
        className={`${classes.navContent} ${isMenuOpen ? classes.show : ""}`}
      >
        <ul>
          <CustomLink to="/home">Home</CustomLink>
          <CustomLink to="/menu">Menu</CustomLink>
          <CustomLink to="/find-truck">Find Truck</CustomLink>
          <CustomLink to="/bookTruck">Book Truck</CustomLink>
          <CustomLink to="/catering">Catering</CustomLink>
          <CustomLink to="/contactUs">Contact Us</CustomLink>
        </ul>
        <div className={classes.buttonGroup}>
          {isAuthenticated ? (
            <button onClick={logout} className={classes.authButton}>
              Log out
            </button>
          ) : (
            <button onClick={handleLogin} className={classes.authButton}>
              Log In
            </button>
          )}
          <button onClick={handleOrderOnline} className={classes.authButton}>
            Order Online
          </button>
        </div>
      </nav>
      <div className={classes.cart}>
        <Link to="/cart">
          <img src={cartLogo} alt="Cart" className={classes.cartLogo} />
        </Link>
      </div>
    </div>
  );
}
