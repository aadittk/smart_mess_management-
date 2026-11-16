import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import {
  IoCheckmarkDoneCircleOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoPersonOutline,
  IoMailOutline,
  IoSchoolOutline,
} from 'react-icons/io5';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import styles from './StudentVerification.module.css';

export default function StudentVerification() {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchPending = async () => {
    try {
      const res = await adminApi.getStudents({ verified: false });
      if (res.success) {
        setPendingStudents(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load pending registrations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id, name) => {
    setProcessingId(id);
    try {
      const res = await adminApi.verifyStudent(id);
      if (res.success) {
        toast.success(`Account for ${name} verified and granted access!`);
        setPendingStudents((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Verification failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject registration for ${name}? The pending account will be deleted.`)) {
      return;
    }
    setProcessingId(id);
    try {
      const res = await adminApi.rejectStudent(id);
      if (res.success) {
        toast.success(`Registration for ${name} rejected.`);
        setPendingStudents((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Rejection failed.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Loader message="Fetching pending student registration queue..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Student Registration Approvals</h1>
          <p className={styles.subtitle}>
            Review and grant dining hall privileges to newly registered resident students ({pendingStudents.length} pending)
          </p>
        </div>
      </div>

      {pendingStudents.length === 0 ? (
        <EmptyState
          title="All Registrations Cleared"
          description="There are currently no student accounts waiting for administrative approval. Check back as new students register."
          icon={IoCheckmarkDoneCircleOutline}
        />
      ) : (
        <div className={styles.grid}>
          {pendingStudents.map((student) => (
            <Card key={student.id} className={styles.studentCard}>
              <div className={styles.cardTop}>
                <div className={styles.avatar}>
                  <IoPersonOutline size={24} />
                </div>
                <div>
                  <h3 className={styles.studentName}>{student.name}</h3>
                  <span className={styles.rollBadge}>{student.roll_number}</span>
                </div>
              </div>

              <div className={styles.detailsList}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Email:</span>
                  <span className={styles.detailValue}>{student.email}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Hostel & Room:</span>
                  <span className={styles.detailValue}>
                    {student.hostel_name} (Room {student.room_number})
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Phone:</span>
                  <span className={styles.detailValue}>{student.phone_number}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Registered:</span>
                  <span className={styles.detailValue}>
                    {new Date(student.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={processingId === student.id}
                  onClick={() => handleReject(student.id, student.name)}
                >
                  <IoCloseCircle size={16} /> Reject
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  loading={processingId === student.id}
                  onClick={() => handleApprove(student.id, student.name)}
                >
                  <IoCheckmarkCircle size={16} /> Approve Access
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
