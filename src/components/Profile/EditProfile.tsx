import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import ImageUpload from '../Forms/ImageUpload';
import { useAuth } from '../../contexts/AuthContext';
import './Profile.css';

const EditProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || '',
    profile: {
      // Basic Profile Information
      bio: user?.profile?.bio || '',
      location: user?.profile?.location || '',
      birth_date: user?.profile?.birth_date || '',
      gender: user?.profile?.gender || '',
      pronouns: user?.profile?.pronouns || '',
      
      // Contact Information
      phone_number: user?.profile?.phone_number || '',
      country_code: user?.profile?.country_code || '+1',
      website: user?.profile?.website || '',
      
      // Professional Information
      job_title: user?.profile?.job_title || '',
      company: user?.profile?.company || '',
      
      // Address Information
      street_address: user?.profile?.street_address || '',
      city: user?.profile?.city || '',
      state_province: user?.profile?.state_province || '',
      country: user?.profile?.country || '',
      postal_code: user?.profile?.postal_code || '',
      
      // Social Media Links
      instagram_url: user?.profile?.instagram_url || '',
      twitter_url: user?.profile?.twitter_url || '',
      linkedin_url: user?.profile?.linkedin_url || '',
      facebook_url: user?.profile?.facebook_url || '',
      
      // Preferences
      timezone: user?.profile?.timezone || 'UTC',
      language_preference: user?.profile?.language_preference || 'en',
      currency_preference: user?.profile?.currency_preference || 'USD',
      
      // Account Settings
      account_type: user?.profile?.account_type || 'personal',
      profile_visibility: user?.profile?.profile_visibility || 'public',
      
      // Marketing Preferences
      marketing_emails_enabled: user?.profile?.marketing_emails_enabled ?? true,
      newsletter_enabled: user?.profile?.newsletter_enabled ?? true,
      notifications_enabled: user?.profile?.notifications_enabled ?? true
    }
  });

  // Utility function to format URLs
  const formatUrl = (url: string, fieldName?: string): string => {
    if (!url || url.trim() === '') return '';
    
    const trimmedUrl = url.trim();
    
    // If it already has a protocol, return as is
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    
    // If it starts with www., add https://
    if (trimmedUrl.startsWith('www.')) {
      return `https://${trimmedUrl}`;
    }
    
    // For social media URLs, detect platform and format accordingly
    if (trimmedUrl.includes('instagram.com') || trimmedUrl.includes('twitter.com') || 
        trimmedUrl.includes('linkedin.com') || trimmedUrl.includes('facebook.com')) {
      return `https://${trimmedUrl}`;
    }
    
    // For website field, add https://www. if it doesn't have www.
    if (fieldName === 'website' && !trimmedUrl.includes('.')) {
      return trimmedUrl; // Return as is if it doesn't look like a domain
    }
    
    // Add https:// prefix for any other URL-like input
    if (trimmedUrl.includes('.')) {
      return `https://${trimmedUrl}`;
    }
    
    return trimmedUrl;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // URL fields that should be auto-formatted
    const urlFields = ['website', 'instagram_url', 'twitter_url', 'linkedin_url', 'facebook_url'];
    
    if (name in formData.profile) {
      if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, profile: { ...prev.profile, [name]: checked } }));
      } else {
        // Just store the raw value for now, formatting will happen on blur and submit
        setFormData(prev => ({ ...prev, profile: { ...prev.profile, [name]: value } }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle URL formatting on blur for better UX
  const handleUrlBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const urlFields = ['website', 'instagram_url', 'twitter_url', 'linkedin_url', 'facebook_url'];
    
    if (urlFields.includes(name) && value.trim() !== '') {
      const formattedUrl = formatUrl(value, name);
      if (formattedUrl !== value) {
        setFormData(prev => ({ ...prev, profile: { ...prev.profile, [name]: formattedUrl } }));
      }
    }
  };

  // Function to get only changed fields
  const getChangedFields = () => {
    const changes: any = {};
    const profileChanges: any = {};
    
    // URL fields that need formatting
    const urlFields = ['website', 'instagram_url', 'twitter_url', 'linkedin_url', 'facebook_url'];
    
    // Check user fields
    if (formData.first_name !== (user?.first_name || '')) {
      changes.first_name = formData.first_name;
    }
    if (formData.last_name !== (user?.last_name || '')) {
      changes.last_name = formData.last_name;
    }
    if (formData.username !== (user?.username || '')) {
      changes.username = formData.username;
    }
    
    // Check profile fields
    Object.keys(formData.profile).forEach(key => {
      let currentValue = formData.profile[key as keyof typeof formData.profile];
      const originalValue = user?.profile?.[key as keyof typeof user.profile];
      
      // Format URL fields before comparison and sending
      if (urlFields.includes(key) && typeof currentValue === 'string' && currentValue.trim() !== '') {
        currentValue = formatUrl(currentValue, key);
      }
      
      // Handle different data types properly
      if (typeof currentValue === 'boolean') {
        if (currentValue !== (originalValue ?? true)) {
          profileChanges[key] = currentValue;
        }
      } else {
        if (currentValue !== (originalValue || '')) {
          profileChanges[key] = currentValue;
        }
      }
    });
    
    // Only include profile in changes if there are profile changes
    if (Object.keys(profileChanges).length > 0) {
      changes.profile = profileChanges;
    }
    
    return changes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const changedFields = getChangedFields();
        
        // Only submit if there are actual changes
        if (Object.keys(changedFields).length === 0) {
          alert('No changes to save.');
          return;
        }
        
        console.log('Submitting changed fields:', changedFields);
        await updateProfile(changedFields);
        alert('Profile updated successfully.');
        
        // Update the form data with any formatted URLs to keep UI in sync
        if (changedFields.profile) {
          const urlFields = ['website', 'instagram_url', 'twitter_url', 'linkedin_url', 'facebook_url'];
          urlFields.forEach(field => {
            if (changedFields.profile[field]) {
              setFormData(prev => ({ 
                ...prev, 
                profile: { ...prev.profile, [field]: changedFields.profile[field] } 
              }));
            }
          });
        }
        
        navigate('/settings');
    } catch (error: any) {
        console.error('Profile update error:', error);
        
        // Handle detailed validation errors
        if (error.details && typeof error.details === 'object') {
          const errorMessages = [];
          Object.entries(error.details).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${messages}`);
            }
          });
          alert(`Validation errors:\n${errorMessages.join('\n')}`);
        } else {
          alert(error.message || 'Failed to update profile.');
        }
    }
  };

  const renderBasicTab = () => (
    <div className="tab-content">
      <div className="form-group profile-picture-section">
        <label>Profile Picture</label>
        <ImageUpload files={profileImage} setFiles={setProfileImage} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="first_name">First Name</label>
          <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Last Name</label>
          <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select id="gender" name="gender" value={formData.profile.gender} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non_binary">Non-binary</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="pronouns">Pronouns</label>
          <input type="text" id="pronouns" name="pronouns" value={formData.profile.pronouns} onChange={handleChange} placeholder="e.g., they/them" />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="birth_date">Birth Date</label>
        <input type="date" id="birth_date" name="birth_date" value={formData.profile.birth_date} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label htmlFor="bio">Bio</label>
        <textarea id="bio" name="bio" value={formData.profile.bio} onChange={handleChange} rows={4} maxLength={500} placeholder="Tell us a little about yourself..." />
        <small>{formData.profile.bio.length}/500 characters</small>
      </div>
    </div>
  );

  const renderContactTab = () => (
    <div className="tab-content">
      <div className="form-row">
        <div className="form-group" style={{flex: '0 0 120px'}}>
          <label htmlFor="country_code">Country Code</label>
          <select id="country_code" name="country_code" value={formData.profile.country_code} onChange={handleChange}>
            <option value="+1">+1 (US/CA)</option>
            <option value="+44">+44 (UK)</option>
            <option value="+33">+33 (FR)</option>
            <option value="+49">+49 (DE)</option>
            <option value="+34">+34 (ES)</option>
            <option value="+39">+39 (IT)</option>
            <option value="+81">+81 (JP)</option>
            <option value="+86">+86 (CN)</option>
            <option value="+91">+91 (IN)</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="phone_number">Phone Number</label>
          <input type="tel" id="phone_number" name="phone_number" value={formData.profile.phone_number} onChange={handleChange} placeholder="(555) 123-4567" />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="website">Website</label>
        <input type="url" id="website" name="website" value={formData.profile.website} onChange={handleChange} onBlur={handleUrlBlur} placeholder="yourwebsite.com" />
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input type="text" id="location" name="location" value={formData.profile.location} onChange={handleChange} placeholder="City, State" />
      </div>
    </div>
  );

  const renderProfessionalTab = () => (
    <div className="tab-content">
      <div className="form-group">
        <label htmlFor="job_title">Job Title</label>
        <input type="text" id="job_title" name="job_title" value={formData.profile.job_title} onChange={handleChange} placeholder="Software Engineer" />
      </div>

      <div className="form-group">
        <label htmlFor="company">Company</label>
        <input type="text" id="company" name="company" value={formData.profile.company} onChange={handleChange} placeholder="Company Name" />
      </div>

      <div className="form-group">
        <label htmlFor="account_type">Account Type</label>
        <select id="account_type" name="account_type" value={formData.profile.account_type} onChange={handleChange}>
          <option value="personal">Personal</option>
          <option value="business">Business</option>
          <option value="creator">Creator</option>
        </select>
      </div>
    </div>
  );

  const renderAddressTab = () => (
    <div className="tab-content">
      <div className="form-group">
        <label htmlFor="street_address">Street Address</label>
        <input type="text" id="street_address" name="street_address" value={formData.profile.street_address} onChange={handleChange} placeholder="123 Main St" />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input type="text" id="city" name="city" value={formData.profile.city} onChange={handleChange} placeholder="New York" />
        </div>
        <div className="form-group">
          <label htmlFor="state_province">State/Province</label>
          <input type="text" id="state_province" name="state_province" value={formData.profile.state_province} onChange={handleChange} placeholder="NY" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="country">Country</label>
          <input type="text" id="country" name="country" value={formData.profile.country} onChange={handleChange} placeholder="United States" />
        </div>
        <div className="form-group">
          <label htmlFor="postal_code">Postal Code</label>
          <input type="text" id="postal_code" name="postal_code" value={formData.profile.postal_code} onChange={handleChange} placeholder="10001" />
        </div>
      </div>
    </div>
  );

  const renderSocialTab = () => (
    <div className="tab-content">
      <div className="form-group">
        <label htmlFor="instagram_url">Instagram</label>
        <input type="url" id="instagram_url" name="instagram_url" value={formData.profile.instagram_url} onChange={handleChange} onBlur={handleUrlBlur} placeholder="instagram.com/username" />
      </div>

      <div className="form-group">
        <label htmlFor="twitter_url">Twitter</label>
        <input type="url" id="twitter_url" name="twitter_url" value={formData.profile.twitter_url} onChange={handleChange} onBlur={handleUrlBlur} placeholder="twitter.com/username" />
      </div>

      <div className="form-group">
        <label htmlFor="linkedin_url">LinkedIn</label>
        <input type="url" id="linkedin_url" name="linkedin_url" value={formData.profile.linkedin_url} onChange={handleChange} onBlur={handleUrlBlur} placeholder="linkedin.com/in/username" />
      </div>

      <div className="form-group">
        <label htmlFor="facebook_url">Facebook</label>
        <input type="url" id="facebook_url" name="facebook_url" value={formData.profile.facebook_url} onChange={handleChange} onBlur={handleUrlBlur} placeholder="facebook.com/username" />
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="tab-content">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="timezone">Timezone</label>
          <select id="timezone" name="timezone" value={formData.profile.timezone} onChange={handleChange}>
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="language_preference">Language</label>
          <select id="language_preference" name="language_preference" value={formData.profile.language_preference} onChange={handleChange}>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="currency_preference">Currency</label>
          <select id="currency_preference" name="currency_preference" value={formData.profile.currency_preference} onChange={handleChange}>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="profile_visibility">Profile Visibility</label>
          <select id="profile_visibility" name="profile_visibility" value={formData.profile.profile_visibility} onChange={handleChange}>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="friends_only">Friends Only</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Communication Preferences</label>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              name="marketing_emails_enabled" 
              checked={formData.profile.marketing_emails_enabled} 
              onChange={handleChange} 
            />
            Marketing Emails
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              name="newsletter_enabled" 
              checked={formData.profile.newsletter_enabled} 
              onChange={handleChange} 
            />
            Newsletter
          </label>
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              name="notifications_enabled" 
              checked={formData.profile.notifications_enabled} 
              onChange={handleChange} 
            />
            Push Notifications
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="form-page-container">
        <div className="profile-header">
          <h2>Edit Profile</h2>
          <p>Keep your profile information up to date.</p>
          {user?.profile?.profile_completion_percentage !== undefined && (
            <div className="profile-completion">
              <span>Profile completion: {user.profile.profile_completion_percentage}%</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{width: `${user.profile.profile_completion_percentage}%`}}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="tab-navigation">
            <button 
              type="button" 
              className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              Basic Info
            </button>
            <button 
              type="button" 
              className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveTab('contact')}
            >
              Contact
            </button>
            <button 
              type="button" 
              className={`tab-btn ${activeTab === 'professional' ? 'active' : ''}`}
              onClick={() => setActiveTab('professional')}
            >
              Professional
            </button>
            <button 
              type="button" 
              className={`tab-btn ${activeTab === 'address' ? 'active' : ''}`}
              onClick={() => setActiveTab('address')}
            >
              Address
            </button>
            <button 
              type="button" 
              className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
              onClick={() => setActiveTab('social')}
            >
              Social
            </button>
            <button 
              type="button" 
              className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              Preferences
            </button>
          </div>

          <div className="tab-container">
            {activeTab === 'basic' && renderBasicTab()}
            {activeTab === 'contact' && renderContactTab()}
            {activeTab === 'professional' && renderProfessionalTab()}
            {activeTab === 'address' && renderAddressTab()}
            {activeTab === 'social' && renderSocialTab()}
            {activeTab === 'preferences' && renderPreferencesTab()}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/settings')}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Profile</button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditProfile;