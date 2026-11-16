import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentApi } from '../services/api';
import {
  IoPersonOutline,
  IoMailOutline,
  IoSchoolOutline,
  IoBusinessOutline,
  IoCallOutline,
  IoKeyOutline,
  IoLockClosedOutline,
  IoCheckmarkCircle,
} from 'react-icons/io5';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [roomNumber, setRoomNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await studentApi.getProfile();
        if (res.success && res.data) {
          setProfile(res.data);
          setRoomNumber(res.data.room_number || '');
          setPhoneNumber(res.data.phone_number || '');
        }
      } catch (err) {
        toast.error('Failed to load profile details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await studentApi.updateProfile({
        room_number: roomNumber,
        phone_number: phoneNumber,
      });
      if (res.success) {
        toast.success('Contact information updated successfully.');
        updateUser({ room_number: roomNumber, phone_number: phoneNumber });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update contact info.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await studentApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (res.success) {
        toast.success('Your password has been changed.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <Loader message="Loading student profile details..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Student Profile & Security</h1>
        <p className={styles.subtitle}>
          Manage your personal details and account authentication credentials
        </p>
      </div>

      <div className={styles.grid}>
        {/* Read-Only Academic Identity Card */}
        <Card title="Academic Identity" subtitle="Verified university dining registry credentials">
          <div className={styles.identityList}>
            <div className={styles.identityItem}>
              <div className={styles.iconCircle}>
                <IoPersonOutline size={18} />
              </div>
              <div className={styles.identityMeta}>
                <span className={styles.metaLabel}>Full Name</span>
                <span className={styles.metaValue}>{profile?.name}</span>
              </div>
            </div>

            <div className={styles.identityItem}>
              <div className={styles.iconCircle}>
                <IoMailOutline size={18} />
              </div>
              <div className={styles.identityMeta}>
                <span className={styles.metaLabel}>University Email</span>
                <span className={styles.metaValue}>{profile?.email}</span>
              </div>
            </div>

            <div className={styles.identityItem}>
              <div className={styles.iconCircle}>
                <IoSchoolOutline size={18} />
              </div>
              <div className={styles.identityMeta}>
                <span className={styles.metaLabel}>Roll / Student ID</span>
                <span className={styles.metaValue}>{profile?.roll_number}</span>
              </div>
            </div>

            <div className={styles.identityItem}>
              <div className={styles.iconCircle}>
                <IoBusinessOutline size={18} />
              </div>
              <div className={styles.identityMeta}>
                <span className={styles.metaLabel}>Hostel Wing</span>
                <span className={styles.metaValue}>{profile?.hostel_name}</span>
              </div>
            </div>

            <div className={styles.identityItem}>
              <div className={styles.iconCircle}>
                <IoCheckmarkCircle size={18} color="var(--success-color)" />
              </div>
              <div className={styles.identityMeta}>
                <span className={styles.metaLabel}>Status</span>
                <span className={styles.metaValue} style={{ color: 'var(--success-color)', fontWeight: 600 }}>
                  Verified Resident
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Update Contact Details */}
        <Card title="Hostel Contact Info" subtitle="Update room number and phone for mess communications">
          <form onSubmit={handleUpdateContact} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="room-input" className={styles.label}>
                Room Number
              </label>
              <div className={styles.inputWrapper}>
                <IoKeyOutline className={styles.fieldIcon} size={18} />
                <input
                  id="room-input"
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. B-204"
                  required
                  className={styles.inputWithIcon}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="phone-input" className={styles.label}>
                Phone Number
              </label>
              <div className={styles.inputWrapper}>
                <IoCallOutline className={styles.fieldIcon} size={18} />
                <input
                  id="phone-input"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  className={styles.inputWithIcon}
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" loading={savingProfile}>
              Save Contact Info
            </Button>
          </form>
        </Card>

        {/* Security & Password */}
        <Card title="Security & Password" subtitle="Update your account login password" className={styles.fullWidthCard}>
          <form onSubmit={handleChangePassword} className={styles.passwordForm}>
            <div className={styles.field}>
              <label htmlFor="curr-pass" className={styles.label}>Current Password</label>
              <div className={styles.inputWrapper}>
                <IoLockClosedOutline className={styles.fieldIcon} size={18} />
                <input
                  id="curr-pass"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={styles.inputWithIcon}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="new-pass" className={styles.label}>New Password (min 6 chars)</label>
              <div className={styles.inputWrapper}>
                <IoLockClosedOutline className={styles.fieldIcon} size={18} />
                <input
                  id="new-pass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={styles.inputWithIcon}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="conf-pass" className={styles.label}>Confirm New Password</label>
              <div className={styles.inputWrapper}>
                <IoLockClosedOutline className={styles.fieldIcon} size={18} />
                <input
                  id="conf-pass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={styles.inputWithIcon}
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" loading={savingPassword} style={{ alignSelf: 'flex-start' }}>
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
