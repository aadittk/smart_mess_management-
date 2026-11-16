import React, { useState, useEffect } from 'react';
import { studentApi } from '../services/api';
import { IoStar, IoPencilOutline, IoTrashOutline, IoCalendarOutline } from 'react-icons/io5';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import StarRating from '../components/ui/StarRating';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import styles from './MyRatings.module.css';

export default function MyRatings() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentRating, setCurrentRating] = useState(null);
  const [editStars, setEditStars] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRatings = async () => {
    try {
      const res = await studentApi.getRatings();
      if (res.success) {
        setRatings(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load ratings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const handleOpenEdit = (item) => {
    setCurrentRating(item);
    setEditStars(item.rating);
    setEditComment(item.comment || '');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!currentRating) return;

    setSaving(true);
    try {
      const res = await studentApi.updateRating(currentRating.id, {
        rating: editStars,
        comment: editComment,
      });
      if (res.success) {
        toast.success('Rating updated successfully.');
        setEditModalOpen(false);
        await fetchRatings();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update rating.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rating?')) {
      return;
    }

    try {
      const res = await studentApi.deleteRating(id);
      if (res.success) {
        toast.success('Rating deleted.');
        setRatings((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete rating.');
    }
  };

  if (loading) {
    return <Loader message="Loading your meal feedback log..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Meal Ratings & Feedback</h1>
          <p className={styles.subtitle}>
            Review and manage all your historical ratings ({ratings.length} total)
          </p>
        </div>
      </div>

      {ratings.length === 0 ? (
        <EmptyState
          title="No Ratings Submitted Yet"
          description="You haven't rated any hostel meals yet. Visit Today's Menu to review your meals."
        />
      ) : (
        <div className={styles.ratingsList}>
          {ratings.map((item) => (
            <Card key={item.id} className={styles.ratingCard}>
              <div className={styles.cardContent}>
                <div className={styles.mainInfo}>
                  <div className={styles.topRow}>
                    <span className={styles.mealBadge}>
                      {item.meal_type.toUpperCase()}
                    </span>
                    <span className={styles.dateInfo}>
                      <IoCalendarOutline size={14} />
                      {item.menus?.date || new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className={styles.starsWrapper}>
                    <StarRating rating={item.rating} readOnly={true} size={18} />
                    <span className={styles.scoreText}>({item.rating}/5)</span>
                  </div>

                  {item.comment ? (
                    <p className={styles.commentText}>"{item.comment}"</p>
                  ) : (
                    <p className={styles.noComment}>No text comment provided.</p>
                  )}
                </div>

                <div className={styles.actions}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(item)}
                    title="Edit Rating"
                  >
                    <IoPencilOutline size={16} /> Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    title="Delete Rating"
                  >
                    <IoTrashOutline size={16} /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Rating Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Your Meal Rating"
      >
        <form onSubmit={handleSaveEdit} className={styles.editForm}>
          <div className={styles.modalStars}>
            <label className={styles.modalLabel}>Update Star Score</label>
            <StarRating
              rating={editStars}
              onRatingChange={(v) => setEditStars(v)}
              size={32}
              showLabel={true}
            />
          </div>

          <div className={styles.modalComment}>
            <label htmlFor="edit-comment" className={styles.modalLabel}>
              Comments & Feedback
            </label>
            <textarea
              id="edit-comment"
              rows={4}
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder="Update your qualitative feedback..."
            />
          </div>

          <div className={styles.modalActions}>
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
