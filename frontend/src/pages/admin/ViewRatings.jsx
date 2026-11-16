import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import {
  IoStar,
  IoFilterOutline,
  IoCalendarOutline,
  IoRestaurantOutline,
  IoPersonOutline,
} from 'react-icons/io5';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StarRating from '../../components/ui/StarRating';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import styles from './ViewRatings.module.css';

export default function ViewRatings() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [mealType, setMealType] = useState('');
  const [ratingVal, setRatingVal] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (mealType) params.meal_type = mealType;
      if (ratingVal) params.rating = ratingVal;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const res = await adminApi.getRatings(params);
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
  }, [mealType, ratingVal, dateFrom, dateTo]);

  const handleResetFilters = () => {
    setMealType('');
    setRatingVal('');
    setDateFrom('');
    setDateTo('');
  };

  // Compute stats on current filtered dataset
  const totalCount = ratings.length;
  const avgRating = totalCount > 0
    ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalCount).toFixed(2)
    : '0.00';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Student Meal Ratings & Sentiment</h1>
          <p className={styles.subtitle}>
            Analyze qualitative comments and star evaluations across all mess meal courses
          </p>
        </div>
      </div>

      {/* Summary Stat Tiles */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Total Reviews</span>
          <span className={styles.statNum}>{totalCount}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Average Score</span>
          <div className={styles.scoreGroup}>
            <IoStar size={20} color="#f59e0b" />
            <span className={styles.statNum}>{avgRating}</span>
            <span className={styles.outOf}>/ 5.0</span>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Meal Course:</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className={styles.select}
          >
            <option value="">All Meals</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="snacks">Evening Snacks</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Star Rating:</label>
          <select
            value={ratingVal}
            onChange={(e) => setRatingVal(e.target.value)}
            className={styles.select}
          >
            <option value="">All Stars (1-5)</option>
            <option value="5">5 Stars (Excellent)</option>
            <option value="4">4 Stars (Good)</option>
            <option value="3">3 Stars (Fair)</option>
            <option value="2">2 Stars (Poor)</option>
            <option value="1">1 Star (Very Poor)</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Date From:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={styles.dateInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Date To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={styles.dateInput}
          />
        </div>

        {(mealType || ratingVal || dateFrom || dateTo) && (
          <Button variant="outline" size="sm" onClick={handleResetFilters} className={styles.resetBtn}>
            Reset Filters
          </Button>
        )}
      </div>

      {/* Ratings Cards / List */}
      {loading ? (
        <Loader message="Filtering ratings..." />
      ) : ratings.length === 0 ? (
        <EmptyState
          title="No Ratings Found"
          description="No student evaluations match the selected filter criteria."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className={styles.ratingsGrid}>
          {ratings.map((r) => (
            <Card key={r.id} className={styles.ratingCard}>
              <div className={styles.cardHeader}>
                <div className={styles.userSection}>
                  <div className={styles.avatar}>
                    <IoPersonOutline size={18} />
                  </div>
                  <div>
                    <h4 className={styles.userName}>{r.students?.name || 'Anonymous Student'}</h4>
                    <span className={styles.userMeta}>
                      {r.students?.roll_number} &bull; {r.students?.hostel_name}
                    </span>
                  </div>
                </div>

                <div className={styles.mealMeta}>
                  <span className={styles.mealPill}>{r.meal_type.toUpperCase()}</span>
                  <span className={styles.dateText}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className={styles.scoreRow}>
                <StarRating rating={r.rating} readOnly={true} size={18} />
                <span className={styles.ratingNum}>({r.rating} / 5)</span>
              </div>

              {r.comment ? (
                <div className={styles.commentBlock}>
                  <p>"{r.comment}"</p>
                </div>
              ) : (
                <p className={styles.noComment}>No written remark provided.</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
