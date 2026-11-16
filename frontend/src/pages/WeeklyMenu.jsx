import React, { useState, useEffect } from 'react';
import { studentApi } from '../services/api';
import { IoChevronBack, IoChevronForward, IoCalendarOutline, IoFastFoodOutline } from 'react-icons/io5';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import styles from './WeeklyMenu.module.css';

export default function WeeklyMenu() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  });

  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeek = async (weekStart) => {
    setLoading(true);
    try {
      const res = await studentApi.getWeeklyMenu(weekStart);
      if (res.success) {
        setWeeklyData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load weekly schedule: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeek(currentWeekStart);
  }, [currentWeekStart]);

  const handlePrevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d.toISOString().split('T')[0]);
  };

  const handleCurrentWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    setCurrentWeekStart(monday.toISOString().split('T')[0]);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Map each day of the week to date & menu
  const weekDays = daysOfWeek.map((dayName, idx) => {
    const dayDate = new Date(currentWeekStart);
    dayDate.setDate(dayDate.getDate() + idx);
    const dateStr = dayDate.toISOString().split('T')[0];
    const menu = weeklyData?.menus?.find((m) => m.date === dateStr);
    return {
      dayName,
      dateStr,
      isToday: dateStr === todayStr,
      menu,
    };
  });

  return (
    <div className={styles.container}>
      {/* Header & Controls */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>7-Day Weekly Dining Schedule</h1>
          <p className={styles.subtitle}>
            Week of {weeklyData?.weekStart || currentWeekStart} to {weeklyData?.weekEnd || ''}
          </p>
        </div>

        <div className={styles.navControls}>
          <Button variant="outline" size="sm" onClick={handlePrevWeek} title="Previous Week">
            <IoChevronBack size={18} /> Prev Week
          </Button>
          <Button variant="outline" size="sm" onClick={handleCurrentWeek}>
            Current Week
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextWeek} title="Next Week">
            Next Week <IoChevronForward size={18} />
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading weekly dining calendar..." />
      ) : weeklyData?.menus?.length === 0 ? (
        <EmptyState
          title="No Menus Scheduled for This Week"
          description="The mess management has not published menus for this specific week yet."
          actionLabel="View Current Week"
          onAction={handleCurrentWeek}
        />
      ) : (
        <div className={styles.weekGrid}>
          {weekDays.map(({ dayName, dateStr, isToday, menu }) => (
            <div
              key={dateStr}
              className={`${styles.dayColumn} ${isToday ? styles.todayColumn : ''}`}
            >
              <div className={styles.dayHeader}>
                <div className={styles.dayTitleGroup}>
                  <span className={styles.dayName}>{dayName}</span>
                  <span className={styles.dayDate}>{dateStr.slice(5)}</span>
                </div>
                {isToday && <span className={styles.todayPill}>Today</span>}
              </div>

              {menu ? (
                <div className={styles.mealsContainer}>
                  <div className={styles.mealBlock}>
                    <div className={styles.mealLabel}>Breakfast</div>
                    <ul className={styles.dishList}>
                      {menu.breakfast?.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.mealBlock}>
                    <div className={styles.mealLabel}>Lunch</div>
                    <ul className={styles.dishList}>
                      {menu.lunch?.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.mealBlock}>
                    <div className={styles.mealLabel}>Snacks</div>
                    <ul className={styles.dishList}>
                      {menu.snacks?.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.mealBlock}>
                    <div className={styles.mealLabel}>Dinner</div>
                    <ul className={styles.dishList}>
                      {menu.dinner?.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className={styles.noMenuBlock}>
                  <span>Menu Not Scheduled</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
