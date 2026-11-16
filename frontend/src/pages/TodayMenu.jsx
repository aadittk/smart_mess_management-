import React, { useState, useEffect } from 'react';
import { studentApi } from '../services/api';
import {
  IoRestaurantOutline,
  IoTimeOutline,
  IoStar,
  IoPencilOutline,
  IoCheckmarkCircle,
  IoRefreshOutline,
} from 'react-icons/io5';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import StarRating from '../components/ui/StarRating';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import styles from './TodayMenu.module.css';

export default function TodayMenu() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Rating Modal state
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('');
  const [starValue, setStarValue] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [editingRatingId, setEditingRatingId] = useState(null);

  const fetchTodayMenu = async (showToast = false) => {
    try {
      const res = await studentApi.getTodayMenu();
      if (res.success) {
        setData(res.data);
        if (showToast) toast.success('Menu updated to latest version.');
      }
    } catch (err) {
      toast.error('Failed to load menu: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTodayMenu();
  }, []);

  const handleOpenRateModal = (mealType, existingRating = null) => {
    setSelectedMeal(mealType);
    if (existingRating) {
      setEditingRatingId(existingRating.id);
      setStarValue(existingRating.rating);
      setComment(existingRating.comment || '');
    } else {
      setEditingRatingId(null);
      setStarValue(5);
      setComment('');
    }
    setRatingModalOpen(true);
  };

  const handleSaveRating = async (e) => {
    e.preventDefault();
    if (!starValue) {
      toast.error('Please select at least 1 star.');
      return;
    }

    setSubmittingRating(true);
    try {
      if (editingRatingId) {
        await studentApi.updateRating(editingRatingId, {
          rating: starValue,
          comment,
        });
        toast.success('Your rating was updated successfully!');
      } else {
        await studentApi.createRating({
          menu_id: data.menu.id,
          meal_type: selectedMeal,
          rating: starValue,
          comment,
        });
        toast.success('Thank you for rating this meal!');
      }
      setRatingModalOpen(false);
      await fetchTodayMenu();
    } catch (err) {
      toast.error(err.message || 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return <Loader message="Fetching today's fresh menu..." />;
  }

  const menu = data?.menu;
  const activeMeal = data?.activeMeal;
  const mealWindows = data?.mealWindows || {};
  const studentRatings = data?.studentRatings || [];

  const meals = [
    { key: 'breakfast', label: 'Breakfast', badge: 'Morning Shift' },
    { key: 'lunch', label: 'Lunch', badge: 'Afternoon Shift' },
    { key: 'snacks', label: 'Evening Snacks', badge: 'Tea Shift' },
    { key: 'dinner', label: 'Dinner', badge: 'Night Shift' },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Today's Dining Hall Menu</h1>
          <p className={styles.subtitle}>
            {menu ? `${menu.day}, ${menu.date}` : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          loading={refreshing}
          onClick={() => {
            setRefreshing(true);
            fetchTodayMenu(true);
          }}
        >
          <IoRefreshOutline size={18} /> Refresh Menu
        </Button>
      </div>

      {!menu ? (
        <EmptyState
          title="No Menu Published for Today"
          description="The mess administrator has not yet scheduled or published the menu for today. Please check back shortly."
        />
      ) : (
        <div className={styles.mealsGrid}>
          {meals.map(({ key, label }) => {
            const dishes = menu[key] || [];
            const windowTime = mealWindows[key];
            const isCurrent = activeMeal === key;
            const existingRating = studentRatings.find((r) => r.meal_type === key);

            return (
              <Card
                key={key}
                title={label}
                subtitle={windowTime ? `${windowTime.start} - ${windowTime.end}` : undefined}
                action={
                  isCurrent && (
                    <span className={styles.activePill}>
                      <span className={styles.pulseDot} /> Active Now
                    </span>
                  )
                }
                className={`${styles.mealCard} ${isCurrent ? styles.activeCard : ''}`}
                footer={
                  <div className={styles.cardFooterContent}>
                    {existingRating ? (
                      <div className={styles.ratedSection}>
                        <div className={styles.ratedInfo}>
                          <span className={styles.ratedLabel}>Your Rating:</span>
                          <div className={styles.starsDisplay}>
                            {[...Array(5)].map((_, i) => (
                              <IoStar
                                key={i}
                                size={16}
                                color={i < existingRating.rating ? '#f59e0b' : '#cbd5e1'}
                              />
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRateModal(key, existingRating)}
                        >
                          <IoPencilOutline size={14} /> Edit
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant={isCurrent ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleOpenRateModal(key)}
                        className={styles.rateBtn}
                      >
                        <IoStar size={15} /> Rate This Meal
                      </Button>
                    )}
                  </div>
                }
              >
                {dishes.length === 0 ? (
                  <p className={styles.noDishes}>No dishes listed for this course.</p>
                ) : (
                  <ul className={styles.dishList}>
                    {dishes.map((dish, idx) => (
                      <li key={idx} className={styles.dishItem}>
                        <span className={styles.bulletDot} />
                        <span className={styles.dishName}>{dish}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Rating Modal */}
      <Modal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        title={`${editingRatingId ? 'Edit Rating for' : 'Rate Today\'s'} ${selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}`}
      >
        <form onSubmit={handleSaveRating} className={styles.modalForm}>
          <div className={styles.ratingPickerSection}>
            <label className={styles.fieldLabel}>How would you rate this meal?</label>
            <StarRating
              rating={starValue}
              onRatingChange={(newVal) => setStarValue(newVal)}
              size={32}
              showLabel={true}
            />
          </div>

          <div className={styles.commentSection}>
            <label htmlFor="meal-comment" className={styles.fieldLabel}>
              Feedback / Suggestions (Optional)
            </label>
            <textarea
              id="meal-comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell the mess committee about the taste, portion size, hygiene, or salt balance..."
            />
          </div>

          <div className={styles.modalActions}>
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={() => setRatingModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              loading={submittingRating}
            >
              {editingRatingId ? 'Update Rating' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
