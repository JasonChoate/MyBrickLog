import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from './AuthContext';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const collectionUrl = user ? `/collection/${user.user_id}` : "/collection";

    return (
        <nav className="header">
            <div className="header-section logo-container">
                <Link to="/">
                    <img src="/images/mybricklog_logo.png" alt="Logo" className="logo" />
                </Link>
            </div>
            <div className="header-section nav-center">
                <ul className="nav-list">
                    <li className="nav-item">
                        <Link to="/" className="nav-link">
                            <FontAwesomeIcon icon="house" style={{ marginRight: '8px' }} />
                            Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to={collectionUrl} className="nav-link">
                            <FontAwesomeIcon icon="folder-open" style={{ marginRight: '8px' }} />
                            My Collection
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/themes" className="nav-link">
                            <FontAwesomeIcon icon="folder-plus" style={{ marginRight: '8px' }} />
                            Add Sets
                        </Link>
                    </li>
                    {user ? (
                        <>
                            <li className="nav-item">
                                <Link to="/profile" className="nav-link">
                                    <FontAwesomeIcon icon="user" style={{ marginRight: '8px' }} />
                                    {user.username}
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/" onClick={handleLogout} className="nav-link">
                                    <FontAwesomeIcon icon="right-from-bracket" style={{ marginRight: '8px' }} />
                                    Sign Out
                                </Link>
                            </li>
                        </>
                    ) : (
                        <li className="nav-item">
                            <Link to="/login" className="nav-link">
                                <FontAwesomeIcon icon="user" style={{ marginRight: '8px' }} />
                                Sign In
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
            <div className="header-section spacer"></div>
        </nav>
    );
};

export default Header;
