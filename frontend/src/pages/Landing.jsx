import React from 'react';
import { Link } from 'react-router-dom';
import {
  IoRestaurantOutline,
  IoStarOutline,
  IoCheckmarkCircleOutline,
  IoMegaphoneOutline,
  IoAnalyticsOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5';
import Button from '../components/ui/Button';
import styles from './Landing.module.css';

export default function Landing() {
  return (
    <div className={styles.landing}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>Next-Gen Hostel Dining</div>
          <h1 className={styles.heroTitle}>
            Transparent, Predictable & Nutritious <br />
            <span className={styles.gradientText}>Hostel Mess Management</span>
          </h1>
          <p className={styles.heroSubtitle}>
            SmartMess replaces paper registers, blind meal queues, and lost feedback with real-time digital menus,
            verified attendance, meal ratings, and smart demand analytics.
          </p>
          <div className={styles.ctaGroup}>
            <Link to="/register">
              <Button variant="primary" size="lg">
                Student Registration
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Engineered for Students & Mess Wardens</h2>
          <p className={styles.sectionSubtitle}>
            An integrated software ecosystem tackling university dining bottlenecks end to end.
          </p>
        </div>

        <div className={styles.grid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <IoRestaurantOutline size={28} />
            </div>
            <h3>Real-Time Menus</h3>
            <p>
              Instantly check breakfast, lunch, snacks, and dinner schedules from your phone. No more walking blindly to the mess.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <IoCheckmarkCircleOutline size={28} />
            </div>
            <h3>Digital Attendance</h3>
            <p>
              One-click attendance within configurable meal time windows eliminates paper lines and provides verifiable meal counts.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <IoStarOutline size={28} />
            </div>
            <h3>1–5 Star Meal Ratings</h3>
            <p>
              Rate each meal and share qualitative remarks. Direct student feedback empowers mess committees to maintain food quality.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <IoMegaphoneOutline size={28} />
            </div>
            <h3>Grievance Tracking</h3>
            <p>
              Submit hygiene, dietary, or quality complaints and monitor administrative resolution with transparent status updates.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <IoAnalyticsOutline size={28} />
            </div>
            <h3>Demand Analytics</h3>
            <p>
              Predictive moving-average attendance forecasting enables catering staff to procure accurately and curb food wastage.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <IoShieldCheckmarkOutline size={28} />
            </div>
            <h3>Verified Security</h3>
            <p>
              Strict two-tier verification prevents unauthorized access; role-based route guards and encrypted credentials safeguard data.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
