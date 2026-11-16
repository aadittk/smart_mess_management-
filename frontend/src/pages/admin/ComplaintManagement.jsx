import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import {
  IoMegaphoneOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoCloseCircle,
  IoChatboxEllipsesOutline,
  IoPencilOutline,
} from 'react-icons/io5';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import styles from './ComplaintManagement.module.css';

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Response Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('resolved');
  const [adminResponseText, setAdminResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await adminApi.getComplaints(params);
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
  }, [statusFilter]);

  const handleOpenResponseModal = (complaint) => {
    setActiveComplaint(complaint);
    setNewStatus(complaint.status === 'pending' ? 'in_progress' : complaint.status);
    setAdminResponseText(complaint.admin_response || '');
    setModalOpen(true);
  };

  const handleSaveResponse = async (e) => {
    e.preventDefault();
    if (!adminResponseText.trim()) {
      toast.error('Please enter an official admin response message.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminApi.respondComplaint(activeComplaint.id, {
        status: newStatus,
        admin_response: adminResponseText,
      });

      if (res.success) {
        toast.success(`Complaint status updated to ${newStatus}.`);
        setModalOpen(false);
        await fetchComplaints();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update complaint.');
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
            <IoTimeOutline size={14} /> Pending
          </span>
        );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Student Grievance Redressal</h1>
          <p className={styles.subtitle}>
            Investigate reported issues, update resolution status, and post official responses
          </p>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.statusSelect}
          >
            <option value="">All Complaints</option>
            <option value="pending">Pending Only</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader message="Fetching grievance tickets..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No Grievances Match Selection"
          description="There are currently no complaints in the chosen status category."
        />
      ) : (
        <div className={styles.complaintList}>
          {complaints.map((item) => (
            <Card key={item.id} className={styles.complaintCard}>
              <div className={styles.cardHeader}>
                <div className={styles.titleArea}>
                  <div className={styles.badgeRow}>
                    {getStatusBadge(item.status)}
                    <span className={styles.dateStamp}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className={styles.complaintTitle}>{item.title}</h3>
                  <div className={styles.studentInfo}>
                    <span>Student: <strong>{item.students?.name || 'Resident'}</strong></span>
                    <span>&bull;</span>
                    <span>Roll: {item.students?.roll_number}</span>
                    <span>&bull;</span>
                    <span>{item.students?.hostel_name} ({item.students?.room_number})</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenResponseModal(item)}
                >
                  <IoPencilOutline size={15} /> Respond / Update
                </Button>
              </div>

              <div className={styles.bodySection}>
                <p className={styles.description}>{item.description}</p>
              </div>

              {item.admin_response ? (
                <div className={styles.responseBox}>
                  <div className={styles.responseHead}>
                    <IoChatboxEllipsesOutline size={18} color="var(--primary-color)" />
                    <span className={styles.responseHeadText}>Official Warden Response</span>
                    {item.updated_at && (
                      <span className={styles.responseDate}>
                        &bull; {new Date(item.updated_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className={styles.responseText}>{item.admin_response}</p>
                </div>
              ) : (
                <div className={styles.noResponse}>
                  <span>No response posted yet. Action needed.</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Response / Status Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Resolve Grievance & Publish Response"
      >
        <form onSubmit={handleSaveResponse} className={styles.modalForm}>
          {activeComplaint && (
            <div className={styles.modalTicketSummary}>
              <strong>Ticket:</strong> {activeComplaint.title}
              <p className={styles.modalDesc}>{activeComplaint.description}</p>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.modalLabel}>Resolution Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className={styles.modalSelect}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress (Under Investigation)</option>
              <option value="resolved">Resolved (Corrective Action Taken)</option>
              <option value="rejected">Rejected (Invalid / Non-mess issue)</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.modalLabel}>Admin Remarks / Response to Student</label>
            <textarea
              rows={5}
              value={adminResponseText}
              onChange={(e) => setAdminResponseText(e.target.value)}
              placeholder="Detail the corrective actions taken (e.g. food temperature recalibrated, catering staff warned)..."
              required
            />
          </div>

          <div className={styles.modalActions}>
            <Button variant="outline" size="md" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={submitting}>
              Submit Response
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
