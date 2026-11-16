import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import {
  IoPeopleOutline,
  IoCheckmarkDoneCircleOutline,
  IoStarOutline,
  IoMegaphoneOutline,
  IoFastFoodOutline,
  IoStatsChartOutline,
  IoDocumentTextOutline,
  IoArrowForward,
} from 'react-icons/io5';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StarRating from '../../components/ui/StarRating';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminApi.getDashboard();
        if (res.success) {
          setDashboardData(res.data);
        }
      } catch (err) {
        toast.error('Failed to load admin metrics: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <Loader message="Compiling mess administration dashboard..." />;
  }

  const stats = dashboardData?.stats || {};
  const recentRatings = dashboardData?.recentRatings || [];
  const recentComplaints = dashboardData?.recentComplaints || [];

  return (
    <div className={styles.container}>
      {/* Top Welcome & KPI Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mess Administration Overview</h1>
          <p className={styles.subtitle}>
            Real-time management metrics, student onboarding queue, and operational health
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/admin/menus">
            <Button variant="primary" size="md">
              <IoFastFoodOutline size={18} /> Manage Menus
            </Button>
          </Link>
          <Link to="/admin/analytics">
            <Button variant="outline" size="md">
              <IoStatsChartOutline size={18} /> Analytics & Forecast
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <IoPeopleOutline size={28} />
          </div>
          <div>
            <div className={styles.kpiLabel}>Total Students</div>
            <div className={styles.kpiValue}>{stats.totalStudents || 0}</div>
          </div>
        </div>

        <Link to="/admin/verifications" className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
            <IoCheckmarkDoneCircleOutline size={28} />
          </div>
          <div>
            <div className={styles.kpiLabel}>Pending Approvals</div>
            <div className={styles.kpiValue}>{stats.pendingVerifications || 0}</div>
          </div>
        </Link>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
            <IoStarOutline size={28} />
          </div>
          <div>
            <div className={styles.kpiLabel}>Average Meal Rating</div>
            <div className={styles.kpiValue}>{stats.avgRating ? `${stats.avgRating} / 5` : 'N/A'}</div>
          </div>
        </div>

        <Link to="/admin/complaints" className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
            <IoMegaphoneOutline size={28} />
          </div>
          <div>
            <div className={styles.kpiLabel}>Open Grievances</div>
            <div className={styles.kpiValue}>{stats.openComplaints || 0}</div>
          </div>
        </Link>
      </div>

      {/* Quick Ops Grid */}
      <div className={styles.mainGrid}>
        {/* Recent Student Feedback */}
        <Card
          title="Recent Meal Feedback"
          subtitle="Real-time ratings and remarks submitted by students"
          action={
            <Link to="/admin/ratings">
              <Button variant="outline" size="sm">
                View All <IoArrowForward size={14} />
              </Button>
            </Link>
          }
        >
          {recentRatings.length === 0 ? (
            <p className={styles.emptyText}>No ratings recorded recently.</p>
          ) : (
            <div className={styles.feedList}>
              {recentRatings.map((r) => (
                <div key={r.id} className={styles.feedItem}>
                  <div className={styles.feedTop}>
                    <div className={styles.feedUser}>
                      <span className={styles.userName}>{r.students?.name || 'Student'}</span>
                      <span className={styles.userRoll}>({r.students?.roll_number || 'ID'})</span>
                    </div>
                    <span className={styles.mealPill}>{r.meal_type.toUpperCase()}</span>
                  </div>

                  <div className={styles.feedStars}>
                    <StarRating rating={r.rating} readOnly={true} size={15} />
                    <span className={styles.dateLabel}>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>

                  {r.comment && <p className={styles.commentSnippet}>"{r.comment}"</p>}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Grievances Requiring Action */}
        <Card
          title="Recent Complaints"
          subtitle="Tickets lodged requiring administrative investigation"
          action={
            <Link to="/admin/complaints">
              <Button variant="outline" size="sm">
                Manage <IoArrowForward size={14} />
              </Button>
            </Link>
          }
        >
          {recentComplaints.length === 0 ? (
            <p className={styles.emptyText}>No grievances pending action.</p>
          ) : (
            <div className={styles.feedList}>
              {recentComplaints.map((c) => (
                <div key={c.id} className={styles.feedItem}>
                  <div className={styles.feedTop}>
                    <span className={styles.complaintTitle}>{c.title}</span>
                    <span
                      className={`${styles.statusBadge} ${
                        c.status === 'resolved'
                          ? styles.statusResolved
                          : c.status === 'in_progress'
                          ? styles.statusProgress
                          : styles.statusPending
                      }`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className={styles.complaintDesc}>{c.description}</p>
                  <div className={styles.complaintFooter}>
                    <span>Student: {c.students?.name || 'Resident'}</span>
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
