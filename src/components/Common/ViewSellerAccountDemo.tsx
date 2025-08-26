import React from 'react';
import ViewSellerAccount from './ViewSellerAccount';

const ViewSellerAccountDemo: React.FC = () => {
  // Sample seller data for demonstration
  const sampleSeller = {
    id: 1,
    username: 'designer_jane',
    first_name: 'Jane',
    last_name: 'Designer',
    avatar: 'https://via.placeholder.com/120x120/0A0A0A/FFFFFF?text=JD',
    bio: 'Professional furniture designer with 10+ years of experience creating beautiful, functional pieces that transform living spaces.',
    location: 'San Francisco, CA',
    website: 'www.janedesigner.com',
    job_title: 'Senior Furniture Designer',
    company: 'Designia Studios',
    instagram_url: 'https://instagram.com/janedesigner',
    twitter_url: 'https://twitter.com/janedesigner',
    linkedin_url: 'https://linkedin.com/in/janedesigner',
    facebook_url: 'https://facebook.com/janedesigner',
    is_verified_seller: true,
    seller_type: 'Professional Designer',
    profile_completion_percentage: 95,
    created_at: '2023-01-15T00:00:00Z'
  };

  const minimalSeller = {
    id: 2,
    username: 'craftsman_mike',
    first_name: 'Mike',
    last_name: 'Craftsman',
    bio: 'Handcrafted wooden furniture made with traditional techniques.',
    location: 'Portland, OR',
    is_verified_seller: false,
    profile_completion_percentage: 65,
    created_at: '2023-06-20T00:00:00Z'
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#0A0A0A', 
        fontFamily: 'Playfair Display, serif',
        fontSize: '36px',
        marginBottom: '48px'
      }}>
        ViewSellerAccount Component Demo
      </h1>

      {/* Full Featured Seller */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ 
          color: '#374151', 
          fontFamily: 'Inter, sans-serif',
          fontSize: '24px',
          marginBottom: '24px'
        }}>
          Full Featured Seller
        </h2>
        <ViewSellerAccount 
          seller={sampleSeller}
          showContactInfo={true}
          showSocialMedia={true}
          showProfessionalInfo={true}
        />
      </div>

      {/* Minimal Seller */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ 
          color: '#374151', 
          fontFamily: 'Inter, sans-serif',
          fontSize: '24px',
          marginBottom: '24px'
        }}>
          Minimal Seller (No Social Media)
        </h2>
        <ViewSellerAccount 
          seller={minimalSeller}
          showContactInfo={true}
          showSocialMedia={false}
          showProfessionalInfo={false}
        />
      </div>

      {/* Contact Info Only */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ 
          color: '#374151', 
          fontFamily: 'Inter, sans-serif',
          fontSize: '24px',
          marginBottom: '24px'
        }}>
          Contact Info Only
        </h2>
        <ViewSellerAccount 
          seller={sampleSeller}
          showContactInfo={true}
          showSocialMedia={false}
          showProfessionalInfo={false}
        />
      </div>

      {/* Professional Info Only */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ 
          color: '#374151', 
          fontFamily: 'Inter, sans-serif',
          fontSize: '24px',
          marginBottom: '24px'
        }}>
          Professional Info Only
        </h2>
        <ViewSellerAccount 
          seller={sampleSeller}
          showContactInfo={false}
          showSocialMedia={false}
          showProfessionalInfo={true}
        />
      </div>

      {/* Social Media Only */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ 
          color: '#374151', 
          fontFamily: 'Inter, sans-serif',
          fontSize: '24px',
          marginBottom: '24px'
        }}>
          Social Media Only
        </h2>
        <ViewSellerAccount 
          seller={sampleSeller}
          showContactInfo={false}
          showSocialMedia={true}
          showProfessionalInfo={false}
        />
      </div>
    </div>
  );
};

export default ViewSellerAccountDemo;
