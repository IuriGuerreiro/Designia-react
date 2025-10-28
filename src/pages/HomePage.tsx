import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../Layout/Layout';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
  return (
    <Layout padding="minimal" maxWidth="xl">
      <div className={styles.homePage}>
        <header className={styles.hero}>
          <div className={styles.heroSurface}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>Designia Marketplace</span>
              <h1 className={styles.heroTitle}>
                Monochrome statement pieces for visionary interiors.
              </h1>
              <p className={styles.heroSubtitle}>
                Explore a curated universe of sculptural furniture, ambient lighting, and modular accents rendered in precise black, white, and grey palettes. Try every piece in augmented reality before you commit.
              </p>

              <div className={styles.heroActions}>
                <Link to="/products" className={`${styles.ctaButton} ${styles.ctaPrimary}`}>
                  Browse the collection
                </Link>
                <Link to="/ar-experience" className={`${styles.ctaButton} ${styles.ctaGhost}`}>
                  Preview in your space
                </Link>
              </div>

              <dl className={styles.heroStats}>
                <div>
                  <dt>Pieces catalogued</dt>
                  <dd>1,009</dd>
                </div>
                <div>
                  <dt>Curated designers</dt>
                  <dd>57</dd>
                </div>
                <div>
                  <dt>Try-before-you-buy sessions</dt>
                  <dd>24K+</dd>
                </div>
              </dl>
            </div>

            <div className={styles.heroMedia}>
              <div className={styles.mediaCard}>
                <div className={styles.mediaBadge}>Live AR preview</div>
                <div className={styles.mediaContent}>
                  <p>Layer pieces, adjust scale, and capture renders directly from your phone.</p>
                  <span>Works on iOS, Android &amp; desktop viewers.</span>
                </div>
              </div>
              <div className={styles.mediaStack}>
                <div className={styles.mediaImage} aria-hidden="true"></div>
                <div className={styles.mediaShadow} aria-hidden="true"></div>
              </div>
            </div>
          </div>
        </header>

        <section className={styles.collectionSection}>
          <div className={styles.sectionHeader}>
            <h2>Collections we curate</h2>
            <p>Every series is composed with a tonal story, tactile textures, and modular proportions for modern lofts and studios.</p>
          </div>

          <div className={styles.collectionGrid}>
            <Link to="/products?category=living-room" className={styles.collectionCard}>
              <div className={`${styles.collectionMedia} ${styles.collectionLiving}`}></div>
              <div className={styles.collectionContent}>
                <h3>Living installations</h3>
                <p>Low-slung sectionals, marble plinths, and atmospheric lighting to anchor conversation zones.</p>
              </div>
            </Link>
            <Link to="/products?category=dining" className={styles.collectionCard}>
              <div className={`${styles.collectionMedia} ${styles.collectionDining}`}></div>
              <div className={styles.collectionContent}>
                <h3>Dining rituals</h3>
                <p>Expandable tables, cantilever seating, and monochrome dinnerware for immersive hosting.</p>
              </div>
            </Link>
            <Link to="/products?category=bedroom" className={styles.collectionCard}>
              <div className={`${styles.collectionMedia} ${styles.collectionBedroom}`}></div>
              <div className={styles.collectionContent}>
                <h3>Sanctuary suites</h3>
                <p>Architectural headboards, ambient panels, and layered textiles for restorative retreats.</p>
              </div>
            </Link>
          </div>
        </section>

        <section className={styles.experienceSection}>
          <div className={styles.experienceIntro}>
            <h2>How the monochrome experience works</h2>
            <p>Guided flows help you discover pieces, stage them in augmented reality, and coordinate logistics without leaving the app.</p>
          </div>

          <div className={styles.timeline}>
            <article>
              <span>01</span>
              <h3>Discover &amp; shortlist</h3>
              <p>Filter by materiality, designer, and availability while the catalogue learns your aesthetic.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Visualize in AR</h3>
              <p>Project true-to-scale renders into your environment, adjust finishes, and save multiple layouts.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Checkout with concierge</h3>
              <p>Coordinate white-glove delivery, installation, and sustainable removal directly with our team.</p>
            </article>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;
