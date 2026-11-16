import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentApi } from '../services/api';
import {
  IoRestaurantOutline,
  IoCalendarOutline,
  IoStarOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoMegaphoneOutline,
  IoFlameOutline,
} from 'react-icons/io5';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [todayData, setTodayData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingMeal, setMarkingMeal] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [todayRes, attRes, compRes, rateRes] = await Promise.all([
        studentApi.getTodayMenu().catch(() => ({ data: null })),
        studentApi.getAttendance().catch(() => ({ data: null })),
        studentApi.getComplaints().catch(() => ({ data: [] })),
        studentApi.getRatings().catch(() => ({ data: [] })),
      ]);

      if (todayRes?.data) setTodayData(todayRes.data);
      if (attRes?.data) setAttendanceData(attRes.data);
      if (compRes?.data) setComplaintsCount(compRes.data.filter((c) => c.status === 'pending' || c.status === 'in_progress').length);
      if (rateRes?.data) setRatingsCount(rateRes.data.length);
    } catch (err) {
      toast.error('Failed to load dashboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickAttendance = async (mealType) => {
    setMarkingMeal(mealType);
    try {
      const res = await studentApi.markAttendance(mealType);
      if (res.success) {
        toast.success(`Attendance marked for ${mealType}!`);
        await fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.message || `Failed to mark ${mealType} attendance.`);
    } finally {
      setMarkingMeal(null);
    }
  };

  if (loading) {
    return <Loader message="Loading your mess dashboard..." />;
  }

  const activeMeal = todayData?.activeMeal;
  const menu = todayData?.menu;
  const todayAttendance = attendanceData?.today || {};
  const activeDishes = menu && activeMeal ? menu[activeMeal] || [] : [];

  return (
    <div className={styles.dashboard}>
      {/* Welcome Hero */}
      <div className={styles.welcomeBanner}>
        <div>
          <h1 className={styles.welcomeTitle}>
            Hello, {user?.name}! 👋
          </h1>
          <p className={styles.welcomeSubtitle}>
            {user?.hostel_name} &bull; Room {user?.room_number} &bull; Roll: {user?.roll_number}
          </p>
        </div>
        <div className={styles.dateBadge}>
          <IoCalendarOutline size={16} />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}>
            <IoRestaurantOutline size={24} />
          </div>
          <div>
            <div className={styles.statLabel}>Today's Active Meal</div>
            <div className={styles.statValue}>
              {activeMeal ? activeMeal.toUpperCase() : 'Closed'}
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--success-light)', color: 'var(--success-color)' }}>
            <IoCheckmarkCircle size={24} />
          </div>
          <div>
            <div className={styles.statLabel}>Monthly Attendance</div>
            <div className={styles.statValue}>
              {attendanceData?.history?.length || 0} Days Logged
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning-color)' }}>
            <IoStarOutline size={24} />
          </div>
          <div>
            <div className={styles.statLabel}>Meals Rated</div>
            <div className={styles.statValue}>{ratingsCount} Submissions</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger-color)' }}>
            <IoMegaphoneOutline size={24} />
          </div>
          <div>
            <div className={styles.statLabel}>Open Complaints</div>
            <div className={styles.statValue}>{complaintsCount} In Review</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Meal & Attendance */}
      <div className={styles.mainGrid}>
        {/* Active Meal Highlight */}
        <Card
          title={activeMeal ? `Now Serving: ${activeMeal.toUpperCase()}` : "Today's Mess Schedule"}
          subtitle={
            activeMeal && todayData?.mealWindows?.[activeMeal]
              ? `Operating Window: ${todayData.mealWindows[activeMeal].start} - ${todayData.mealWindows[activeMeal].end}`
              : 'Mess counter is currently between meal shifts'
          }
          action={
            <Link to="/menu/today">
              <Button variant="outline" size="sm">
                Full Menu &rarr;
              </Button>
            </Link>
          }
          className={styles.activeMealCard}
        >
          {activeMeal && activeDishes.length > 0 ? (
            <div>
              <div className={styles.dishesList}>
                {activeDishes.map((dish, idx) => (
                  <div key={idx} className={styles.dishChip}>
                    <IoFlameOutline className={styles.dishIcon} />
                    <span>{dish}</span>
                  </div>
                ))}
              </div>

              <div className={styles.activeMealActions}>
                <Link to="/menu/today">
                  <Button variant="primary" size="md">
                    Rate This Meal (1–5 Stars)
                  </Button>
                </Link>
                {todayAttendance[activeMeal] ? (
                  <span className={styles.markedBadge}>
                    <IoCheckmarkCircle size={18} /> Attendance Marked
                  </span>
                ) : (
                  <Button
                    variant="success"
                    size="md"
                    loading={markingMeal === activeMeal}
                    onClick={() => handleQuickAttendance(activeMeal)}
                  >
                    Mark {activeMeal} Attendance
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.inactiveState}>
              <IoTimeOutline size={48} className={styles.inactiveIcon} />
              <p className={styles.inactiveText}>
                No meal is currently active. Check the full menu to see what's planned for upcoming meals today.
              </p>
              <Link to="/menu/today">
                <Button variant="primary" size="md">
                  View All Meals for Today
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Today's 4-Meal Attendance Tracker */}
        <Card
          title="Today's Meal Check-in"
          subtitle="One-click attendance within configured meal hours"
          action={
            <Link to="/attendance">
              <Button variant="outline" size="sm">
                History
              </Button>
            </Link>
          }
        >
          <div className={styles.attendanceRows}>
            {['breakfast', 'lunch', 'snacks', 'dinner'].map((meal) => {
              const isMarked = todayAttendance[meal] === true;
              const isOngoing = activeMeal === meal;
              const windowTime = todayData?.mealWindows?.[meal];

              return (
                <div key={meal} className={`${styles.mealRow} ${isOngoing ? styles.ongoingRow : ''}`}>
                  <div className={styles.mealInfo}>
                    <span className={styles.mealName}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</span>
                    <span className={styles.mealWindow}>
                      {windowTime ? `${windowTime.start} - ${windowTime.end}` : ''}
                    </span>
                  </div>

                  <div className={styles.mealAction}>
                    {isMarked ? (
                      <span className={styles.attendanceConfirmed}>
                        <IoCheckmarkCircle size={20} /> Marked
                      </span>
                    ) : isOngoing ? (
                      <Button
                        variant="primary"
                        size="sm"
                        loading={markingMeal === meal}
                        onClick={() => handleQuickAttendance(meal)}
                      >
                        Check-In
                      </Button>
                    ) : (
                      <span className={styles.windowClosed}>Window Closed</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className={styles.quickLinksGrid}>
        <Link to="/menu/weekly" className={styles.quickLinkCard}>
          <div className={styles.quickIcon}>
            <IoCalendarOutline size={24} />
          </div>
          <h4>Weekly Menu</h4>
          <p>Explore 7-day breakfast, lunch, snacks, and dinner schedules</p>
        </Link>

        <Link to="/ratings" className={styles.quickLinkCard}>
          <div className={styles.quickIcon}>
            <IoStarOutline size={24} />
          </div>
          <h4>My Ratings</h4>
          <p>Review and edit your previous meal ratings and comments</p>
        </Link>

        <Link to="/complaints" className={styles.quickLinkCard}>
          <div className={styles.quickIcon}>
            <IoMegaphoneOutline size={24} />
          </div>
          <h4>Grievance Portal</h4>
          <p>Lodge mess issues, track status, and view warden responses</p>
        </Link>
      </div>
    </div>
  );
}
