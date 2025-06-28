// src/Components/Navbar/Navbar.jsx
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [userName, setUserName] = useState(null);

    // Update userName whenever route changes or localStorage is updated
    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        setUserName(storedName);
    }, [location.pathname]);

    const handleLogout = () => {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        // Navigate to login/signup page
        navigate('/loginsignup');
        // Reload to reset app state and update Navbar display
        window.location.reload();
    };

    return (
        <div className='Navbar'>
            <div className='Navbar-Logo'>
                <Link to="/" className="navbar-title-link">
                    NextPage
                </Link>
            </div>
            <div className="nav-menu">
                <ul className="navbar-menu">
                    <li>
                        <Link to="/">
                            Home
                            {location.pathname === "/" && <hr />}
                        </Link>
                    </li>
                    <li>
                        <Link to="/recomended">
                            Recommended
                            {location.pathname === "/recomended" && <hr />}
                        </Link>
                    </li>
                    <li>
                        <Link to="/liked">
                            Liked
                            {location.pathname === "/liked" && <hr />}
                        </Link>
                    </li>
                </ul>
            </div>
            <div className="nav-login">
                {userName ? (
                    <div className="user-section">
                        <div className="welcome-message">
                            <span className="welcome-text">Welcome back,</span>
                            <span className="user-name">{userName}!</span>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/loginsignup">
                        <button>Login</button>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Navbar;
