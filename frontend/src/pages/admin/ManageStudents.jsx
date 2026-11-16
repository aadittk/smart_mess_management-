import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import {
  IoSearchOutline,
  IoCheckmarkCircle,
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoTrashOutline,
  IoFilterOutline,
} from 'react-icons/io5';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import styles from './ManageStudents.module.css';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'verified', 'unverified', 'blocked'
  const [hostelFilter, setHostelFilter] = useState('all');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter === 'verified') params.verified = true;
      if (statusFilter === 'unverified') params.verified = false;
      if (statusFilter === 'blocked') params.blocked = true;
      if (hostelFilter !== 'all') params.hostel = hostelFilter;

      const res = await adminApi.getStudents(params);
      if (res.success) {
        setStudents(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load student directory: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [statusFilter, hostelFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleVerify = async (id, name) => {
    try {
      const res = await adminApi.verifyStudent(id);
      if (res.success) {
        toast.success(`${name} verified.`);
        await fetchStudents();
      }
    } catch (err) {
      toast.error(err.message || 'Verification failed.');
    }
  };

  const handleBlock = async (id, name) => {
    if (!window.confirm(`Block ${name} from accessing the mess platform?`)) return;
    try {
      const res = await adminApi.blockStudent(id);
      if (res.success) {
        toast.success(`${name} has been suspended.`);
        await fetchStudents();
      }
    } catch (err) {
      toast.error(err.message || 'Block action failed.');
    }
  };

  const handleUnblock = async (id, name) => {
    try {
      const res = await adminApi.unblockStudent(id);
      if (res.success) {
        toast.success(`${name} account reinstated.`);
        await fetchStudents();
      }
    } catch (err) {
      toast.error(err.message || 'Unblock failed.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete ${name}? All ratings and attendance logs will be removed.`)) return;
    try {
      const res = await adminApi.deleteStudent(id);
      if (res.success) {
        toast.success(`${name} record deleted.`);
        setStudents((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Student Directory & Account Controls</h1>
          <p className={styles.subtitle}>
            Search, inspect credentials, verify, block, or remove resident students ({students.length} found)
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className={styles.searchBar}>
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <div className={styles.searchWrapper}>
            <IoSearchOutline className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Search by name, roll number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Search
          </Button>
        </form>

        <div className={styles.filtersGroup}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Account Statuses</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Pending Approvals</option>
            <option value="blocked">Suspended / Blocked</option>
          </select>

          <select
            value={hostelFilter}
            onChange={(e) => setHostelFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Hostels</option>
            <option value="Aryabhatta Hostel">Aryabhatta Hostel</option>
            <option value="Bhaskara Hostel">Bhaskara Hostel</option>
            <option value="Charaka Hostel">Charaka Hostel</option>
            <option value="Gargi Girls Hostel">Gargi Girls Hostel</option>
            <option value="Maitreyi Girls Hostel">Maitreyi Girls Hostel</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader message="Filtering student records..." />
      ) : students.length === 0 ? (
        <EmptyState
          title="No Students Matched Criteria"
          description="Try adjusting your search query or reset the status filters to view student records."
        />
      ) : (
        <Card className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Hostel & Room</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className={styles.nameBlock}>
                        <span className={styles.name}>{student.name}</span>
                        <span className={styles.email}>{student.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.rollBadge}>{student.roll_number}</span>
                    </td>
                    <td>
                      <div className={styles.hostelInfo}>
                        <span>{student.hostel_name}</span>
                        <span className={styles.room}>Room: {student.room_number}</span>
                      </div>
                    </td>
                    <td className={styles.phoneText}>{student.phone_number}</td>
                    <td>
                      {student.is_blocked ? (
                        <span className={`${styles.statusBadge} ${styles.blockedBadge}`}>
                          Blocked
                        </span>
                      ) : student.is_verified ? (
                        <span className={`${styles.statusBadge} ${styles.verifiedBadge}`}>
                          Verified
                        </span>
                      ) : (
                        <span className={`${styles.statusBadge} ${styles.pendingBadge}`}>
                          Unverified
                        </span>
                      )}
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        {!student.is_verified && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleVerify(student.id, student.name)}
                            title="Approve verification"
                          >
                            <IoCheckmarkCircle size={15} /> Verify
                          </Button>
                        )}

                        {student.is_blocked ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleUnblock(student.id, student.name)}
                            title="Reinstate account"
                          >
                            <IoLockOpenOutline size={15} /> Unblock
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBlock(student.id, student.name)}
                            title="Suspend account"
                          >
                            <IoLockClosedOutline size={15} /> Block
                          </Button>
                        )}

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(student.id, student.name)}
                          title="Delete student"
                        >
                          <IoTrashOutline size={15} />
                        </Button>
                      </div>
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
