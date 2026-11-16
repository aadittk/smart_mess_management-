import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  IoRestaurant,
  IoCalendarOutline,
  IoStarOutline,
  IoCheckmarkCircleOutline,
  IoChatbubbleEllipsesOutline,
  IoPersonOutline,
  IoLogOutOutline,
  IoMenu,
  IoClose,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to={isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/'} className={styles.logo} onClick={closeMenu}>
          <div className={styles.logoIcon}>
            <IoRestaurant size={22} />
          </div>
          <span className={styles.logoText}>
            Smart<span className={styles.logoAccent}>Mess</span>
          </span>
          {isAdmin && <span className={styles.adminBadge}>Admin</span>}
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          {isAuthenticated ? (
            isAdmin ? (
              <>
                <NavLink to="/admin/dashboard" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                  Dashboard
                </NavLink>
                <NavLink to="/admin/menus" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                  Menus
                </NavLink>
                <NavLink to="/admin/verifications" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                  Approvals
                </NavLink>
                <NavLink to="/admin/complaints" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                  Complaints
                </NavLink>
                <NavLink to="/admin/analytics" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                  Analytics
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                  Dashboard
                </NavLink>
                <NavLink to="/menu/today" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                  Today's Menu
                </NavLink>
                <NavLink to="/menu/weekly" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                  Weekly Menu
                </NavLink>
                <NavLink to="/attendance" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                  Attendance
                </NavLink>
                <NavLink to="/ratings" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                  My Ratings
                </NavLink>
                <NavLink to="/complaints" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                  Complaints
                </NavLink>
              </>
            )
          ) : (
            <>
              <Link to="/login" className={styles.navLink}>
                Student Login
              </Link>
              <Link to="/register" className={styles.registerBtn}>
                Register
              </Link>
              <Link to="/admin/login" className={styles.adminLink}>
                Admin Portal
              </Link>
            </>
          )}
        </nav>

        {/* User profile / Logout */}
        {isAuthenticated && (
          <div className={styles.userSection}>
            <Link to={isAdmin ? '/admin/dashboard' : '/profile'} className={styles.profileChip}>
              <div className={styles.avatar}>
                {isAdmin ? <IoShieldCheckmarkOutline size={16} /> : <IoPersonOutline size={16} />}
              </div>
              <span className={styles.userName}>{user?.name?.split(' ')[0]}</span>
            </Link>
            <button onClick={handleLogout} className={styles.logoutBtn} title="Log Out">
              <IoLogOutOutline size={20} />
            </button>
          </div>
        )}

        {/* Mobile Hamburger Toggle */}
        <button
          className={styles.mobileToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <IoClose size={26} /> : <IoMenu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileDrawer}>
          <div className={styles.mobileNavLinks}>
            {isAuthenticated ? (
              isAdmin ? (
                <>
                  <NavLink to="/admin/dashboard" onClick={closeMenu} className={styles.mobileNavLink}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/admin/menus" onClick={closeMenu} className={styles.mobileNavLink}>
                    Menu Management
                  </NavLink>
                  <NavLink to="/admin/verifications" onClick={closeMenu} className={styles.mobileNavLink}>
                    Student Approvals
                  </NavLink>
                  <NavLink to="/admin/students" onClick={closeMenu} className={styles.mobileNavLink}>
                    Manage Students
                  </NavLink>
                  <NavLink to="/admin/ratings" onClick={closeMenu} className={styles.mobileNavLink}>
                    View Ratings
                  </NavLink>
                  <NavLink to="/admin/complaints" onClick={closeMenu} className={styles.mobileNavLink}>
                    Complaint Redressal
                  </NavLink>
                  <NavLink to="/admin/attendance" onClick={closeMenu} className={styles.mobileNavLink}>
                    Attendance Reports
                  </NavLink>
                  <NavLink to="/admin/analytics" onClick={closeMenu} className={styles.mobileNavLink}>
                    Analytics & Forecast
                  </NavLink>
                  <button onClick={() => { closeMenu(); handleLogout(); }} className={styles.mobileLogoutBtn}>
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/dashboard" onClick={closeMenu} className={styles.mobileNavLink}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/menu/today" onClick={closeMenu} className={styles.mobileNavLink}>
                    Today's Menu
                  </NavLink>
                  <NavLink to="/menu/weekly" onClick={closeMenu} className={styles.mobileNavLink}>
                    Weekly Menu
                  </NavLink>
                  <NavLink to="/attendance" onClick={closeMenu} className={styles.mobileNavLink}>
                    Attendance Check-in
                  </NavLink>
                  <NavLink to="/ratings" onClick={closeMenu} className={styles.mobileNavLink}>
                    My Ratings
                  </NavLink>
                  <NavLink to="/complaints" onClick={closeMenu} className={styles.mobileNavLink}>
                    Grievance Portal
                  </NavLink>
                  <NavLink to="/profile" onClick={closeMenu} className={styles.mobileNavLink}>
                    Profile & Password
                  </NavLink>
                  <button onClick={() => { closeMenu(); handleLogout(); }} className={styles.mobileLogoutBtn}>
                    Log Out
                  </button>
                </>
              )
            ) : (
              <>
                <Link to="/login" onClick={closeMenu} className={styles.mobileNavLink}>
                  Student Login
                </Link>
                <Link to="/register" onClick={closeMenu} className={styles.mobileNavLink}>
                  Register Account
                </Link>
                <Link to="/admin/login" onClick={closeMenu} className={styles.mobileNavLink}>
                  Administrator Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
