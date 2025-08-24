import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../Layout/Layout';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
  return (
    <Layout>
      <div className={styles.homePage}>
        {/* Hero Section */}
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Luxury Furniture, Reimagined in Your Space
            </h1>
            <p className={styles.heroSubtitle}>
              Experience the future of furniture shopping with our premium AR marketplace. Visualize high-end pieces in your own home before you buy.
            </p>
            <div className={styles.heroActions}>
              <Link to="/products" className={`${styles.btn} ${styles.btnPrimary}`}>
                Explore The Collection
              </Link>
              <Link to="/ar-experience" className={`${styles.btn} ${styles.btnSecondary}`}>
                Learn About AR
              </Link>
            </div>
          </div>
        </header>

        {/* Featured Categories */}
        <section className={styles.featuredSection}>
          <h2 className={styles.sectionTitle}>Shop by Collection</h2>
          <div className={styles.categoryGrid}>
            {/* Placeholder Categories */}
            <Link to="/products?category=living-room" className={styles.categoryCard}>
              <div className={styles.categoryImage1}></div>
              <h3 className={styles.categoryName}>Living Room</h3>
            </Link>
            <Link to="/products?category=dining" className={styles.categoryCard}>
              <div className={styles.categoryImage2}></div>
              <h3 className={styles.categoryName}>Dining</h3>
            </Link>
            <Link to="/products?category=bedroom" className={styles.categoryCard}>
              <div className={styles.categoryImage3}></div>
              <h3 className={styles.categoryName}>Bedroom</h3>
            </Link>
          </div>
        </section>

        {/* How It Works Section */}
        <section className={`${styles.featuredSection} ${styles.howItWorks}`}>
          <h2 className={styles.sectionTitle}>Simple, Seamless, Sophisticated</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <div className={styles.stepIcon}>1</div>
              <h3 className={styles.stepTitle}>Discover</h3>
              <p className={styles.stepDescription}>Browse our curated collection of luxury furniture from top designers.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>2</div>
              <h3 className={styles.stepTitle}>Visualize</h3>
              <p className={styles.stepDescription}>Use our AR technology to see how any piece looks and fits in your space.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>3</div>
              <h3 className={styles.stepTitle}>Purchase</h3>
              <p className={styles.stepDescription}>Buy with confidence and have your new favorite piece delivered to your door.</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;
