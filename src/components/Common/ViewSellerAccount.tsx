import React from 'react';
import './ViewSellerAccount.css';

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

const ViewSellerAccount: React.FC<ViewSellerAccountProps> = ({
  seller,
  showContactInfo = true,
  showSocialMedia = true,
  showProfessionalInfo = true,
  className = ''
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
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
    <div className={`seller-account-view ${className}`}>
      {/* Header Section */}
      <div className="seller-header">
        <div className="seller-avatar-section">
          <div className="seller-avatar">
            {seller.avatar ? (
              <img src={seller.avatar} alt={`${seller.first_name || seller.username} avatar`} />
            ) : (
              <div className="seller-avatar-placeholder">
                {(seller.first_name?.[0] || seller.username[0]).toUpperCase()}
              </div>
            )}
          </div>
          <div className="seller-verification-badge">
            {seller.is_verified_seller && (
              <span className="verified-badge">
                ✓ Verified Seller
              </span>
            )}
          </div>
        </div>
        
        <div className="seller-info">
          <h2 className="seller-name">
            {seller.first_name && seller.last_name 
              ? `${seller.first_name} ${seller.last_name}`
              : seller.username
            }
          </h2>
          {seller.username !== (seller.first_name || '') && (
            <p className="seller-username">@{seller.username}</p>
          )}
          {seller.bio && (
            <p className="seller-bio">{seller.bio}</p>
          )}
        </div>


      </div>

      {/* Professional Information */}
      {showProfessionalInfo && hasProfessionalInfo && (
        <div className="seller-section">
          <h3 className="section-title">Professional Information</h3>
          <div className="section-content">
            {seller.job_title && (
              <div className="info-item">
                <span className="info-label">Job Title</span>
                <span className="info-value">{seller.job_title}</span>
              </div>
            )}
            {seller.company && (
              <div className="info-item">
                <span className="info-label">Company</span>
                <span className="info-value">{seller.company}</span>
              </div>
            )}
            {seller.seller_type && (
              <div className="info-item">
                <span className="info-label">Seller Type</span>
                <span className="info-value">{seller.seller_type}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Information */}
      {showContactInfo && hasContactInfo && (
        <div className="seller-section">
          <h3 className="section-title">Contact Information</h3>
          <div className="section-content">
            {seller.location && (
              <div className="info-item">
                <span className="info-label">Location</span>
                <span className="info-value">📍 {seller.location}</span>
              </div>
            )}
            {seller.website && (
              <div className="info-item">
                <span className="info-label">Website</span>
                <a 
                  href={formatUrl(seller.website)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="info-link"
                >
                  🌐 {seller.website}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Social Media Links */}
      {showSocialMedia && hasSocialMedia && (
        <div className="seller-section">
          <h3 className="section-title">Social Media</h3>
          <div className="social-media-grid">
            {seller.instagram_url && (
              <a 
                href={formatUrl(seller.instagram_url)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link instagram"
              >
                <span className="social-icon">{getSocialMediaIcon('instagram')}</span>
                <span className="social-label">Instagram</span>
              </a>
            )}
            {seller.twitter_url && (
              <a 
                href={formatUrl(seller.twitter_url)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link twitter"
              >
                <span className="social-icon">{getSocialMediaIcon('twitter')}</span>
                <span className="social-label">Twitter</span>
              </a>
            )}
            {seller.linkedin_url && (
              <a 
                href={formatUrl(seller.linkedin_url)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link linkedin"
              >
                <span className="social-icon">{getSocialMediaIcon('linkedin')}</span>
                <span className="social-label">LinkedIn</span>
              </a>
            )}
            {seller.facebook_url && (
              <a 
                href={formatUrl(seller.facebook_url)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link facebook"
              >
                <span className="social-icon">{getSocialMediaIcon('facebook')}</span>
                <span className="social-label">Facebook</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Member Since */}
      {seller.created_at && (
        <div className="seller-section">
          <div className="member-since">
            <span className="member-label">Member since</span>
            <span className="member-date">{formatDate(seller.created_at)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSellerAccount;
