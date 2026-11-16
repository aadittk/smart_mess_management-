import React, { useState, useEffect } from 'react';
import { studentApi } from '../services/api';
import {
  IoMegaphoneOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoCloseCircle,
  IoChatboxEllipsesOutline,
  IoAddCircleOutline,
} from 'react-icons/io5';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import styles from './Complaints.module.css';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await studentApi.getComplaints();
      if (res.success) {
        setComplaints(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load complaints: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in both title and detailed description.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await studentApi.createComplaint({ title, description });
      if (res.success) {
        toast.success('Your complaint has been lodged for warden review.');
        setTitle('');
        setDescription('');
        setModalOpen(false);
        await fetchComplaints();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return (
          <span className={`${styles.badge} ${styles.resolved}`}>
            <IoCheckmarkCircle size={14} /> Resolved
          </span>
        );
      case 'in_progress':
        return (
          <span className={`${styles.badge} ${styles.inProgress}`}>
            <IoTimeOutline size={14} /> In Progress
          </span>
        );
      case 'rejected':
        return (
          <span className={`${styles.badge} ${styles.rejected}`}>
            <IoCloseCircle size={14} /> Rejected
          </span>
        );
      default:
        return (
          <span className={`${styles.badge} ${styles.pending}`}>
            <IoTimeOutline size={14} /> Pending Review
          </span>
        );
    }
  };

  if (loading) {
    return <Loader message="Fetching grievance and complaint records..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mess Grievances & Complaints</h1>
          <p className={styles.subtitle}>
            Submit and track issues regarding meal quality, hygiene, or mess facilities
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          <IoAddCircleOutline size={18} /> Lodge Complaint
        </Button>
      </div>

      {complaints.length === 0 ? (
        <EmptyState
          title="No Complaints Submitted"
          description="You haven't filed any mess complaints. If you encounter quality or hygiene issues, lodge a ticket here."
          actionLabel="Lodge Complaint"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className={styles.complaintList}>
          {complaints.map((item) => (
            <Card key={item.id} className={styles.complaintCard}>
              <div className={styles.cardHeader}>
                <div className={styles.titleGroup}>
                  <h3 className={styles.complaintTitle}>{item.title}</h3>
                  <span className={styles.dateText}>
                    Logged on {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div>{getStatusBadge(item.status)}</div>
              </div>

              <div className={styles.complaintBody}>
                <p className={styles.description}>{item.description}</p>
              </div>

              {item.admin_response ? (
                <div className={styles.responseBox}>
                  <div className={styles.responseHeader}>
                    <IoChatboxEllipsesOutline size={18} color="var(--primary-color)" />
                    <span className={styles.responseTitle}>Warden / Admin Response</span>
                    {item.updated_at && (
                      <span className={styles.responseTime}>
                        &bull; {new Date(item.updated_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className={styles.responseText}>{item.admin_response}</p>
                </div>
              ) : (
                <div className={styles.noResponse}>
                  <span>Awaiting administrative review and response from the mess warden.</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Lodge Complaint Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Lodge New Mess Complaint"
      >
        <form onSubmit={handleSubmitComplaint} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="complaint-title" className={styles.label}>
              Complaint Title
            </label>
            <input
              id="complaint-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Under-cooked rice served during Lunch"
              required
              maxLength={200}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="complaint-desc" className={styles.label}>
              Detailed Description
            </label>
            <textarea
              id="complaint-desc"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the incident, meal type, date, and any relevant details..."
              required
            />
          </div>

          <div className={styles.modalActions}>
            <Button variant="outline" size="md" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={submitting}>
              Submit Complaint
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
