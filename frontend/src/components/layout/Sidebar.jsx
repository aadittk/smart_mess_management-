import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  IoGridOutline,
  IoFastFoodOutline,
  IoCheckmarkDoneCircleOutline,
  IoPeopleOutline,
  IoStarHalfOutline,
  IoMegaphoneOutline,
  IoDocumentTextOutline,
  IoStatsChartOutline,
} from 'react-icons/io5';
import styles from './Sidebar.module.css';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Overview', icon: IoGridOutline },
  { to: '/admin/menus', label: 'Menu Management', icon: IoFastFoodOutline },
  { to: '/admin/verifications', label: 'Student Approvals', icon: IoCheckmarkDoneCircleOutline },
  { to: '/admin/students', label: 'Student Directory', icon: IoPeopleOutline },
  { to: '/admin/ratings', label: 'Ratings Explorer', icon: IoStarHalfOutline },
  { to: '/admin/complaints', label: 'Complaint Redressal', icon: IoMegaphoneOutline },
  { to: '/admin/attendance', label: 'Attendance Reports', icon: IoDocumentTextOutline },
  { to: '/admin/analytics', label: 'Analytics & Forecast', icon: IoStatsChartOutline },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.badge}>Admin Workspace</span>
      </div>
      <nav className={styles.nav}>
        {adminLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              <Icon size={18} className={styles.icon} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
