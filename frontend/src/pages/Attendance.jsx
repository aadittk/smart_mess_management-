import React, { useState, useEffect } from 'react';
import { studentApi } from '../services/api';
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTimeOutline,
  IoCalendarOutline,
  IoAlertCircleOutline,
  IoFingerPrintOutline,
} from 'react-icons/io5';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';
import styles from './Attendance.module.css';

export default function Attendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [markingMeal, setMarkingMeal] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchAttendance = async () => {
    try {
      const res = await studentApi.getAttendance(selectedMonth, selectedYear);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load attendance records: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  const handleMarkMeal = async (mealType) => {
    setMarkingMeal(mealType);
    try {
      const res = await studentApi.markAttendance(mealType);
      if (res.success) {
        toast.success(`Attendance successfully logged for ${mealType}!`);
        await fetchAttendance();
      }
    } catch (err) {
      toast.error(err.message || `Failed to mark ${mealType} attendance.`);
    } finally {
      setMarkingMeal(null);
    }
  };

  if (loading) {
    return <Loader message="Verifying meal schedules and attendance logs..." />;
  }

  const today = data?.today || {};
  const activeMeal = data?.activeMeal;
  const windows = data?.mealWindows || {};
  const history = data?.history || [];

  const meals = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'snacks', label: 'Snacks' },
    { key: 'dinner', label: 'Dinner' },
  ];

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Digital Mess Attendance</h1>
          <p className={styles.subtitle}>
            Secure, time-window-validated meal check-in for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Today's 4-Meal Check-in Cards */}
      <div className={styles.todayGrid}>
        {meals.map(({ key, label }) => {
          const isMarked = today[key] === true;
          const isCurrent = activeMeal === key;
          const win = windows[key];

          return (
            <Card
              key={key}
              title={label}
              subtitle={win ? `Operating Hours: ${win.start} - ${win.end}` : ''}
              className={`${styles.mealCard} ${isCurrent ? styles.activeMealCard : ''}`}
            >
              <div className={styles.cardInner}>
                <div className={styles.statusIndicator}>
                  {isMarked ? (
                    <div className={styles.markedBadge}>
                      <IoCheckmarkCircle size={28} />
                      <span>Attendance Confirmed</span>
                    </div>
                  ) : isCurrent ? (
                    <div className={styles.openBadge}>
                      <IoTimeOutline size={28} />
                      <span>Counter Currently Open</span>
                    </div>
                  ) : (
                    <div className={styles.closedBadge}>
                      <IoTimeOutline size={28} />
                      <span>Window Inactive</span>
                    </div>
                  )}
                </div>

                <div className={styles.buttonWrapper}>
                  {isMarked ? (
                    <Button variant="outline" size="md" disabled={true} className={styles.fullWidth}>
                      Already Logged
                    </Button>
                  ) : isCurrent ? (
                    <Button
                      variant="success"
                      size="md"
                      loading={markingMeal === key}
                      onClick={() => handleMarkMeal(key)}
                      className={styles.fullWidth}
                    >
                      <IoFingerPrintOutline size={18} /> Mark Attendance Now
                    </Button>
                  ) : (
                    <Button variant="outline" size="md" disabled={true} className={styles.fullWidth}>
                      Check-in Unavailable
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Attendance History Section */}
      <Card
        title="Personal Attendance History"
        subtitle="Review your logged dining entries for the selected billing period"
        action={
          <div className={styles.monthFilter}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className={styles.select}
            >
              {[
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
              ].map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className={styles.select}
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        }
      >
        {history.length === 0 ? (
          <div className={styles.noHistory}>
            <IoCalendarOutline size={36} color="var(--text-subtle)" />
            <p>No attendance records logged for this month.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Breakfast</th>
                  <th>Lunch</th>
                  <th>Snacks</th>
                  <th>Dinner</th>
                  <th>Total Meals</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => {
                  const count = (row.breakfast ? 1 : 0) + (row.lunch ? 1 : 0) + (row.snacks ? 1 : 0) + (row.dinner ? 1 : 0);
                  return (
                    <tr key={row.id}>
                      <td className={styles.dateCell}>{row.date}</td>
                      <td>
                        {row.breakfast ? (
                          <span className={styles.checkIcon}><IoCheckmarkCircle size={18} /></span>
                        ) : (
                          <span className={styles.dashIcon}>—</span>
                        )}
                      </td>
                      <td>
                        {row.lunch ? (
                          <span className={styles.checkIcon}><IoCheckmarkCircle size={18} /></span>
                        ) : (
                          <span className={styles.dashIcon}>—</span>
                        )}
                      </td>
                      <td>
                        {row.snacks ? (
                          <span className={styles.checkIcon}><IoCheckmarkCircle size={18} /></span>
                        ) : (
                          <span className={styles.dashIcon}>—</span>
                        )}
                      </td>
                      <td>
                        {row.dinner ? (
                          <span className={styles.checkIcon}><IoCheckmarkCircle size={18} /></span>
                        ) : (
                          <span className={styles.dashIcon}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={styles.countBadge}>{count} / 4</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
