import "./Footer.css";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div><strong>Local Guide</strong><span>Find practical places around you.</span></div>
      <nav aria-label="Footer navigation"><Link to="/search">Search</Link><Link to="/map">Map</Link><Link to="/profile">Profile</Link></nav>
    </footer>
  );
}

export default Footer;
