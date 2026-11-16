import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import {
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoCheckmarkCircle,
  IoFilterOutline,
  IoCalendarOutline,
} from 'react-icons/io5';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import styles from './AttendanceReports.module.css';

export default function AttendanceReports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const res = await adminApi.getAttendanceReport(params);
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      toast.error('Failed to compile attendance report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateFrom, dateTo]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      await adminApi.exportAttendanceCSV(params);
      toast.success('Attendance CSV export downloaded successfully!');
    } catch (err) {
      toast.error('Failed to export CSV: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const records = reportData?.records || [];
  const summary = reportData?.summary || {};

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dining Attendance Reports & Exports</h1>
          <p className={styles.subtitle}>
            Meal-wise reconciliation, headcounts, and downloadable CSV records for university audits
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          loading={exporting}
          onClick={handleExportCSV}
          disabled={records.length === 0}
        >
          <IoDownloadOutline size={18} /> Export Attendance CSV
        </Button>
      </div>

      {/* Summary KPI Tiles */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryTile}>
          <span className={styles.summaryLabel}>Total Student Logins</span>
          <span className={styles.summaryValue}>{summary.totalRecords || 0}</span>
        </div>
        <div className={styles.summaryTile}>
          <span className={styles.summaryLabel}>Breakfast Served</span>
          <span className={styles.summaryValue}>{summary.breakfastCount || 0}</span>
        </div>
        <div className={styles.summaryTile}>
          <span className={styles.summaryLabel}>Lunch Served</span>
          <span className={styles.summaryValue}>{summary.lunchCount || 0}</span>
        </div>
        <div className={styles.summaryTile}>
          <span className={styles.summaryLabel}>Evening Snacks</span>
          <span className={styles.summaryValue}>{summary.snacksCount || 0}</span>
        </div>
        <div className={styles.summaryTile}>
          <span className={styles.summaryLabel}>Dinner Served</span>
          <span className={styles.summaryValue}>{summary.dinnerCount || 0}</span>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Date From:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={styles.dateInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Date To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={styles.dateInput}
          />
        </div>

        {(dateFrom || dateTo) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDateFrom('');
              setDateTo('');
            }}
          >
            Clear Dates
          </Button>
        )}
      </div>

      {/* Records Table */}
      {loading ? (
        <Loader message="Aggregating attendance records..." />
      ) : records.length === 0 ? (
        <EmptyState
          title="No Attendance Data Found"
          description="There are no attendance records for the selected date range."
        />
      ) : (
        <Card className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Hostel / Room</th>
                  <th>Breakfast</th>
                  <th>Lunch</th>
                  <th>Snacks</th>
                  <th>Dinner</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className={styles.dateText}>{r.date}</td>
                    <td className={styles.studentName}>{r.students?.name || 'Resident'}</td>
                    <td>
                      <span className={styles.rollBadge}>{r.students?.roll_number}</span>
                    </td>
                    <td className={styles.hostelText}>
                      {r.students?.hostel_name} ({r.students?.room_number})
                    </td>
                    <td>
                      {r.breakfast ? (
                        <span className={styles.checkIcon}><IoCheckmarkCircle size={18} /></span>
                      ) : (
                        <span className={styles.dashIcon}>—</span>
                      )}
                    </td>
                    <td>
                      {r.lunch ? (
                        <span className={styles.checkIcon}><IoCheckmarkCircle size={18} /></span>
                      ) : (
                        <span className={styles.dashIcon}>—</span>
                      )}
                    </td>
                    <td>
                      {r.snacks ? (
                        <span className={styles.checkIcon}><IoCheckmarkCircle size={18} /></span>
                      ) : (
                        <span className={styles.dashIcon}>—</span>
                      )}
                    </td>
                    <td>
                      {r.dinner ? (
                        <span className={styles.checkIcon}><IoCheckmarkCircle size={18} /></span>
                      ) : (
                        <span className={styles.dashIcon}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
