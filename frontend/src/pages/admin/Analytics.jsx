import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import {
  IoStatsChartOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoFastFoodOutline,
  IoCalendarOutline,
  IoSparklesOutline,
  IoStar,
} from 'react-icons/io5';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import toast from 'react-hot-toast';
import styles from './Analytics.module.css';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await adminApi.getAnalytics();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        toast.error('Failed to load mess analytics: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <Loader message="Compiling statistical analytics and predictive attendance model..." />;
  }

  const mealRatings = data?.mealRatings || { breakfast: 0, lunch: 0, snacks: 0, dinner: 0 };
  const topDishes = data?.topDishes || [];
  const bottomDishes = data?.bottomDishes || [];
  const attendanceTrends = data?.attendanceTrends || [];
  const forecast = data?.forecast || {};

  // Meal bar chart calculations (max scale 5.0)
  const mealBars = [
    { label: 'Breakfast', score: mealRatings.breakfast, color: '#3b82f6' },
    { label: 'Lunch', score: mealRatings.lunch, color: '#10b981' },
    { label: 'Snacks', score: mealRatings.snacks, color: '#f59e0b' },
    { label: 'Dinner', score: mealRatings.dinner, color: '#8b5cf6' },
  ];

  // SVG dimensions for Line Chart
  const svgWidth = 600;
  const svgHeight = 220;
  const padding = 35;

  const maxAttendance = Math.max(...attendanceTrends.map((t) => t.total), 10);
  const points = attendanceTrends.map((t, idx) => {
    const x = padding + (idx / Math.max(attendanceTrends.length - 1, 1)) * (svgWidth - padding * 2);
    const y = svgHeight - padding - (t.total / maxAttendance) * (svgHeight - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Mess Intelligence & Demand Analytics</h1>
          <p className={styles.subtitle}>
            Data-driven insights into student culinary preferences, quality trends, and predictive attendance
          </p>
        </div>
      </div>

      {/* Demand Forecast Highlight Tile */}
      <Card
        title="Predictive Demand Forecast (Next Day)"
        subtitle="7-day moving-average forecasting algorithm to support kitchen procurement and prevent food wastage"
        className={styles.forecastCard}
      >
        <div className={styles.forecastGrid}>
          <div className={styles.forecastMain}>
            <div className={styles.forecastIcon}>
              <IoSparklesOutline size={32} />
            </div>
            <div>
              <span className={styles.forecastTargetDate}>
                Target: {forecast.forecastDate || 'Tomorrow'}
              </span>
              <div className={styles.forecastTotal}>
                ~{forecast.forecastTotal || 0} <span>Meals Expected</span>
              </div>
              <span className={styles.forecastBasis}>
                Calculated over {forecast.historicalBasisDays || 7} days of verified dining logs
              </span>
            </div>
          </div>

          <div className={styles.mealBreakdownGrid}>
            <div className={styles.mealForecastBox}>
              <span className={styles.mfLabel}>Breakfast</span>
              <span className={styles.mfNum}>~{forecast.forecastMealWise?.breakfast || 0}</span>
              <span className={styles.mfSub}>students</span>
            </div>
            <div className={styles.mealForecastBox}>
              <span className={styles.mfLabel}>Lunch</span>
              <span className={styles.mfNum}>~{forecast.forecastMealWise?.lunch || 0}</span>
              <span className={styles.mfSub}>students</span>
            </div>
            <div className={styles.mealForecastBox}>
              <span className={styles.mfLabel}>Evening Snacks</span>
              <span className={styles.mfNum}>~{forecast.forecastMealWise?.snacks || 0}</span>
              <span className={styles.mfSub}>students</span>
            </div>
            <div className={styles.mealForecastBox}>
              <span className={styles.mfLabel}>Dinner</span>
              <span className={styles.mfNum}>~{forecast.forecastMealWise?.dinner || 0}</span>
              <span className={styles.mfSub}>students</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Visual Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Chart 1: Average Rating per Meal (Pure SVG Bar Chart) */}
        <Card
          title="Average Rating by Meal Course"
          subtitle="Score distribution across daily meal shifts (out of 5.0)"
        >
          <div className={styles.svgWrapper}>
            <svg viewBox="0 0 450 220" className={styles.barSvg}>
              {/* Grid Lines */}
              {[1, 2, 3, 4, 5].map((level) => {
                const y = 180 - (level / 5) * 140;
                return (
                  <g key={level}>
                    <line x1="45" y1={y} x2="420" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                    <text x="35" y={y + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
                      {level}.0
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {mealBars.map((bar, i) => {
                const barWidth = 48;
                const x = 75 + i * 90;
                const barHeight = (bar.score / 5) * 140;
                const y = 180 - barHeight;

                return (
                  <g key={bar.label}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      fill={bar.color}
                      className={styles.svgBar}
                    />
                    <text
                      x={x + barWidth / 2}
                      y={y - 8}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="#0f172a"
                    >
                      {bar.score > 0 ? bar.score.toFixed(1) : '0'}
                    </text>
                    <text
                      x={x + barWidth / 2}
                      y="200"
                      textAnchor="middle"
                      fontSize="11"
                      fill="#475569"
                      fontWeight="500"
                    >
                      {bar.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </Card>

        {/* Chart 2: Daily Attendance Trend (Pure SVG Line Graph) */}
        <Card
          title="Daily Attendance Trend"
          subtitle="Total meals served across the previous 7–14 days"
        >
          {attendanceTrends.length === 0 ? (
            <p className={styles.emptyText}>No historical attendance trend data available.</p>
          ) : (
            <div className={styles.svgWrapper}>
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className={styles.lineSvg}>
                {/* Horizontal gridlines */}
                {[0, 0.5, 1].map((ratio, idx) => {
                  const y = svgHeight - padding - ratio * (svgHeight - padding * 2);
                  const val = Math.round(ratio * maxAttendance);
                  return (
                    <g key={idx}>
                      <line
                        x1={padding}
                        y1={y}
                        x2={svgWidth - padding}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="3 3"
                      />
                      <text x={padding - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Line Path */}
                {points && (
                  <polyline
                    fill="none"
                    stroke="var(--primary-color)"
                    strokeWidth="3"
                    points={points}
                  />
                )}

                {/* Data Points */}
                {attendanceTrends.map((t, idx) => {
                  const x = padding + (idx / Math.max(attendanceTrends.length - 1, 1)) * (svgWidth - padding * 2);
                  const y = svgHeight - padding - (t.total / maxAttendance) * (svgHeight - padding * 2);
                  return (
                    <g key={t.date}>
                      <circle cx={x} cy={y} r="4" fill="#ffffff" stroke="var(--primary-color)" strokeWidth="2" />
                      <text x={x} y={svgHeight - 12} textAnchor="middle" fontSize="9" fill="#64748b">
                        {t.date.slice(5)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </Card>
      </div>

      {/* Top & Bottom Dishes Sentiment Ranking */}
      <div className={styles.dishesGrid}>
        {/* Top 5 Dishes */}
        <Card
          title="Top 5 Rated Dishes"
          subtitle="Highest student satisfaction dishes according to rating feedback"
        >
          {topDishes.length === 0 ? (
            <p className={styles.emptyText}>Need more ratings to rank dishes.</p>
          ) : (
            <div className={styles.dishRankList}>
              {topDishes.map((item, idx) => (
                <div key={idx} className={styles.dishRankItem}>
                  <div className={styles.rankBadgeTop}>#{idx + 1}</div>
                  <div className={styles.dishMeta}>
                    <span className={styles.dishTitleText}>{item.dish}</span>
                    <span className={styles.dishReviewCount}>
                      Based on {item.ratingsCount} review{item.ratingsCount > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className={styles.scorePillTop}>
                    <IoStar size={14} color="#f59e0b" />
                    <span>{item.average.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Bottom 5 Dishes */}
        <Card
          title="Bottom 5 Rated Dishes"
          subtitle="Dishes with lowest satisfaction scores requiring recipe / vendor adjustment"
        >
          {bottomDishes.length === 0 ? (
            <p className={styles.emptyText}>Need more ratings to rank dishes.</p>
          ) : (
            <div className={styles.dishRankList}>
              {bottomDishes.map((item, idx) => (
                <div key={idx} className={styles.dishRankItem}>
                  <div className={styles.rankBadgeBottom}>#{idx + 1}</div>
                  <div className={styles.dishMeta}>
                    <span className={styles.dishTitleText}>{item.dish}</span>
                    <span className={styles.dishReviewCount}>
                      Based on {item.ratingsCount} review{item.ratingsCount > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className={styles.scorePillBottom}>
                    <IoStar size={14} color="#ef4444" />
                    <span>{item.average.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
