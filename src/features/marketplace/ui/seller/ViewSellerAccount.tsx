import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ViewSellerAccount.module.css';

interface SellerProfile {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  job_title?: string;
  company?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  facebook_url?: string;
  is_verified_seller?: boolean;
  seller_type?: string;
  created_at?: string;
}

interface ViewSellerAccountProps {
  seller: SellerProfile;
  showContactInfo?: boolean;
  showSocialMedia?: boolean;
  showProfessionalInfo?: boolean;
  className?: string;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

const ViewSellerAccount: React.FC<ViewSellerAccountProps> = ({
  seller,
  showContactInfo = true,
  showSocialMedia = true,
  showProfessionalInfo = true,
  className,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const formatUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const getSocialMediaIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return '📷';
      case 'twitter':
        return '🐦';
      case 'linkedin':
        return '💼';
      case 'facebook':
        return '📘';
      default:
        return '🔗';
    }
  };

  const hasSocialMedia = seller.instagram_url || seller.twitter_url || seller.linkedin_url || seller.facebook_url;
  const hasProfessionalInfo = seller.job_title || seller.company;
  const hasContactInfo = seller.website || seller.location;

  return (
    <div className={cx(styles['seller-account-view'], className)}>
      <div className={styles['seller-header']}>
        <div className={styles['seller-avatar-section']}>
          <Link to={`/seller/${seller.id}`} className={styles['seller-avatar']} aria-label={`View ${seller.username} profile`}>
            {seller.avatar ? (
              <img src={seller.avatar} alt={`${seller.first_name || seller.username} avatar`} />
            ) : (
              <div className={styles['seller-avatar-placeholder']}>
                {(seller.first_name?.[0] || seller.username[0]).toUpperCase()}
              </div>
            )}
          </Link>
          <div className={styles['seller-verification-badge']}>
            {seller.is_verified_seller && <span className={styles['verified-badge']}>✓ Verified Seller</span>}
          </div>
        </div>

        <div className={styles['seller-info']}>
          <h2 className={styles['seller-name']}>
            <Link to={`/seller/${seller.id}`} aria-label={`View ${seller.username} profile`} className={styles['info-link']}>
              {seller.first_name && seller.last_name
                ? `${seller.first_name} ${seller.last_name}`
                : seller.username}
            </Link>
          </h2>
          {seller.username !== (seller.first_name || '') && (
            <p className={styles['seller-username']}>@{seller.username}</p>
          )}
          {seller.bio && <p className={styles['seller-bio']}>{seller.bio}</p>}
        </div>
      </div>

      {showProfessionalInfo && hasProfessionalInfo && (
        <div className={styles['seller-section']}>
          <h3 className={styles['section-title']}>Professional Information</h3>
          <div className={styles['section-content']}>
            {seller.job_title && (
              <div className={styles['info-item']}>
                <span className={styles['info-label']}>Job Title</span>
                <span className={styles['info-value']}>{seller.job_title}</span>
              </div>
            )}
            {seller.company && (
              <div className={styles['info-item']}>
                <span className={styles['info-label']}>Company</span>
                <span className={styles['info-value']}>{seller.company}</span>
              </div>
            )}
            {seller.seller_type && (
              <div className={styles['info-item']}>
                <span className={styles['info-label']}>Seller Type</span>
                <span className={styles['info-value']}>{seller.seller_type}</span>
              </div>
            )}
            {seller.created_at && (
              <div className={styles['info-item']}>
                <span className={styles['info-label']}>Member Since</span>
                <span className={styles['info-value']}>{formatDate(seller.created_at)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {showContactInfo && hasContactInfo && (
        <div className={styles['seller-section']}>
          <h3 className={styles['section-title']}>Contact Information</h3>
          <div className={styles['section-content']}>
            {seller.location && (
              <div className={styles['info-item']}>
                <span className={styles['info-label']}>Location</span>
                <span className={styles['info-value']}>📍 {seller.location}</span>
              </div>
            )}
            {seller.website && (
              <div className={styles['info-item']}>
                <span className={styles['info-label']}>Website</span>
                <a
                  href={formatUrl(seller.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles['info-link']}
                >
                  🌐 {seller.website}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {showSocialMedia && hasSocialMedia && (
        <div className={styles['seller-section']}>
          <h3 className={styles['section-title']}>Social Media</h3>
          <div className={styles['social-media-grid']}>
            {seller.instagram_url && (
              <a
                href={formatUrl(seller.instagram_url)}
                target="_blank"
                rel="noopener noreferrer"
                className={cx(styles['social-link'], styles.instagram)}
              >
                <span className={styles['social-icon']}>{getSocialMediaIcon('instagram')}</span>
                <span className={styles['social-label']}>Instagram</span>
              </a>
            )}
            {seller.twitter_url && (
              <a
                href={formatUrl(seller.twitter_url)}
                target="_blank"
                rel="noopener noreferrer"
                className={cx(styles['social-link'], styles.twitter)}
              >
                <span className={styles['social-icon']}>{getSocialMediaIcon('twitter')}</span>
                <span className={styles['social-label']}>Twitter</span>
              </a>
            )}
            {seller.linkedin_url && (
              <a
                href={formatUrl(seller.linkedin_url)}
                target="_blank"
                rel="noopener noreferrer"
                className={cx(styles['social-link'], styles.linkedin)}
              >
                <span className={styles['social-icon']}>{getSocialMediaIcon('linkedin')}</span>
                <span className={styles['social-label']}>LinkedIn</span>
              </a>
            )}
            {seller.facebook_url && (
              <a
                href={formatUrl(seller.facebook_url)}
                target="_blank"
                rel="noopener noreferrer"
                className={cx(styles['social-link'], styles.facebook)}
              >
                <span className={styles['social-icon']}>{getSocialMediaIcon('facebook')}</span>
                <span className={styles['social-label']}>Facebook</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSellerAccount;
