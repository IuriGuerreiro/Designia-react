import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/app/layout';
import ImageUpload from '@/shared/ui/image-upload/ImageUpload';
import { useAuth } from '@/features/auth/state/AuthContext';
import styles from './Profile.module.css';

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

  // Effect to handle tab switching when seller status changes
  useEffect(() => {
    // If user is not a verified seller and is on a restricted tab, switch to basic
    if (!user?.profile?.is_verified_seller && ['contact', 'professional', 'social'].includes(activeTab)) {
      setActiveTab('basic');
    }
  }, [user?.profile?.is_verified_seller, activeTab]);

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
    <div className={styles.tabContent}>
              <div className={`${styles.profileFormGroup} ${styles.profilePictureSection}`}>
          <label className={styles.profileFormLabel}>Profile Picture</label>
        <ImageUpload files={profileImage} setFiles={setProfileImage} />
      </div>

      <div className={styles.profileFormRow}>
        <div className={styles.profileFormGroup}>
          <label htmlFor="first_name" className={styles.profileFormLabel}>First Name</label>
          <input 
            type="text" 
            id="first_name" 
            name="first_name" 
            value={formData.first_name} 
            onChange={handleChange}
            className={styles.profileInputField}
          />
        </div>
        <div className={styles.profileFormGroup}>
          <label htmlFor="last_name" className={styles.profileFormLabel}>Last Name</label>
          <input 
            type="text" 
            id="last_name" 
            name="last_name" 
            value={formData.last_name} 
            onChange={handleChange}
            className={styles.profileInputField}
          />
        </div>
      </div>

      <div className={styles.profileFormGroup}>
        <label htmlFor="username" className={styles.profileFormLabel}>Username</label>
        <input 
          type="text" 
          id="username" 
          name="username" 
          value={formData.username} 
          onChange={handleChange}
          className={styles.profileInputField}
        />
      </div>

      <div className={styles.profileFormRow}>
        <div className={styles.profileFormGroup}>
          <label htmlFor="gender" className={styles.profileFormLabel}>Gender</label>
          <select 
            id="gender" 
            name="gender" 
            value={formData.profile.gender} 
            onChange={handleChange}
            className={styles.profileInputField}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non_binary">Non-binary</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className={styles.profileFormGroup}>
          <label htmlFor="pronouns" className={styles.profileFormLabel}>Pronouns</label>
          <input 
            type="text" 
            id="pronouns" 
            name="pronouns" 
            value={formData.profile.pronouns} 
            onChange={handleChange} 
            placeholder="e.g., they/them"
            className={styles.profileInputField}
          />
        </div>
      </div>

      <div className={styles.profileFormGroup}>
        <label htmlFor="birth_date" className={styles.profileFormLabel}>Birth Date</label>
        <input 
          type="date" 
          id="birth_date" 
          name="birth_date" 
          value={formData.profile.birth_date} 
          onChange={handleChange}
          className={styles.profileInputField}
        />
      </div>

      <div className={styles.profileFormGroup}>
        <label htmlFor="bio" className={styles.profileFormLabel}>Bio</label>
        <textarea 
          id="bio" 
          name="bio" 
          value={formData.profile.bio} 
          onChange={handleChange} 
          rows={4} 
          maxLength={500} 
          placeholder="Tell us a little about yourself..."
          className={`${styles.profileInputField} ${styles.profileTextareaField}`}
        />
        <small className={styles.profileFormHint}>{formData.profile.bio.length}/500 characters</small>
      </div>
    </div>
  );

  const renderContactTab = () => (
    <div className={styles.tabContent}>
      {!user?.profile?.is_verified_seller ? (
        <div className={styles.restrictedTabMessage}>
          <h3 className={styles.restrictedTabTitle}>Contact Information Restricted</h3>
          <p className={styles.restrictedTabText}>
            Contact information fields are only available to verified sellers. This helps maintain the quality of our marketplace.
          </p>
          <button 
            className={`${styles.profileBtn} ${styles.profileBtnPrimary}`}
            onClick={() => navigate('/settings/become-seller')}
          >
            Become a Verified Seller
          </button>
        </div>
      ) : (
        <>
          <div className={styles.profileFormRow}>
            <div className={styles.profileFormGroup} style={{flex: '0 0 120px'}}>
              <label htmlFor="country_code" className={styles.profileFormLabel}>Country Code</label>
              <select 
                id="country_code" 
                name="country_code" 
                value={formData.profile.country_code} 
                onChange={handleChange}
                className={styles.profileInputField}
              >
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
            <div className={styles.profileFormGroup}>
              <label htmlFor="phone_number" className={styles.profileFormLabel}>Phone Number</label>
              <input 
                type="tel" 
                id="phone_number" 
                name="phone_number" 
                value={formData.profile.phone_number} 
                onChange={handleChange} 
                placeholder="(555) 123-4567"
                className={styles.profileInputField}
              />
            </div>
          </div>

          <div className={styles.profileFormGroup}>
            <label htmlFor="website" className={styles.profileFormLabel}>Website</label>
            <input 
              type="url" 
              id="website" 
              name="website" 
              value={formData.profile.website} 
              onChange={handleChange} 
              onBlur={handleUrlBlur} 
              placeholder="yourwebsite.com"
              className={styles.profileInputField}
            />
          </div>

          <div className={styles.profileFormGroup}>
            <label htmlFor="location" className={styles.profileFormLabel}>Location</label>
            <input 
              type="text" 
              id="location" 
              name="location" 
              value={formData.profile.location} 
              onChange={handleChange} 
              placeholder="City, State"
              className={styles.profileInputField}
            />
          </div>
        </>
      )}
    </div>
  );

  const renderProfessionalTab = () => (
    <div className={styles.tabContent}>
      {!user?.profile?.is_verified_seller ? (
        <div className={styles.restrictedTabMessage}>
          <h3 className={styles.restrictedTabTitle}>Professional Information Restricted</h3>
          <p className={styles.restrictedTabText}>
            Professional information fields are only available to verified sellers. This helps maintain the quality of our marketplace.
          </p>
          <button 
            className={`${styles.profileBtn} ${styles.profileBtnPrimary}`}
            onClick={() => navigate('/settings/become-seller')}
          >
            Become a Verified Seller
          </button>
        </div>
      ) : (
        <>
          <div className={styles.profileFormGroup}>
            <label htmlFor="job_title" className={styles.profileFormLabel}>Job Title</label>
            <input 
              type="text" 
              id="job_title" 
              name="job_title" 
              value={formData.profile.job_title} 
              onChange={handleChange} 
              placeholder="Software Engineer"
              className={styles.profileInputField}
            />
          </div>

          <div className={styles.profileFormGroup}>
            <label htmlFor="company" className={styles.profileFormLabel}>Company</label>
            <input 
              type="text" 
              id="company" 
              name="company" 
              value={formData.profile.company} 
              onChange={handleChange} 
              placeholder="Company Name"
              className={styles.profileInputField}
            />
          </div>

          <div className={styles.profileFormGroup}>
            <label htmlFor="account_type" className={styles.profileFormLabel}>Account Type</label>
            <select 
              id="account_type" 
              name="account_type" 
              value={formData.profile.account_type} 
              onChange={handleChange}
              className={styles.profileInputField}
            >
              <option value="personal">Personal</option>
              <option value="business">Business</option>
              <option value="creator">Creator</option>
            </select>
          </div>
        </>
      )}
    </div>
  );

  const renderAddressTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.profileFormGroup}>
        <label htmlFor="street_address" className={styles.profileFormLabel}>Street Address</label>
        <input 
          type="text" 
          id="street_address" 
          name="street_address" 
          value={formData.profile.street_address} 
          onChange={handleChange} 
          placeholder="123 Main St"
          className={styles.profileInputField}
        />
      </div>

      <div className={styles.profileFormRow}>
        <div className={styles.profileFormGroup}>
          <label htmlFor="city" className={styles.profileFormLabel}>City</label>
          <input 
            type="text" 
            id="city" 
            name="city" 
            value={formData.profile.city} 
            onChange={handleChange} 
            placeholder="New York"
            className={styles.profileInputField}
          />
        </div>
        <div className={styles.profileFormGroup}>
          <label htmlFor="state_province" className={styles.profileFormLabel}>State/Province</label>
          <input 
            type="text" 
            id="state_province" 
            name="state_province" 
            value={formData.profile.state_province} 
            onChange={handleChange} 
            placeholder="NY"
            className={styles.profileInputField}
          />
        </div>
      </div>

      <div className={styles.profileFormRow}>
        <div className={styles.profileFormGroup}>
          <label htmlFor="country" className={styles.profileFormLabel}>Country</label>
          <input 
            type="text" 
            id="country" 
            name="country" 
            value={formData.profile.country} 
            onChange={handleChange} 
            placeholder="United States"
            className={styles.profileInputField}
          />
        </div>
        <div className={styles.profileFormGroup}>
          <label htmlFor="postal_code" className={styles.profileFormLabel}>Postal Code</label>
                      <input 
              type="text" 
              id="postal_code" 
              name="postal_code" 
              value={formData.profile.postal_code} 
              onChange={handleChange} 
              placeholder="10001"
              className={styles.profileInputField}
            />
        </div>
      </div>
    </div>
  );

  const renderSocialTab = () => (
    <div className={styles.tabContent}>
      {!user?.profile?.is_verified_seller ? (
        <div className={styles.restrictedTabMessage}>
          <h3 className={styles.restrictedTabTitle}>Social Media Links Restricted</h3>
          <p className={styles.restrictedTabText}>
            Social media link fields are only available to verified sellers. This helps maintain the quality of our marketplace.
          </p>
          <button 
            className={`${styles.profileBtn} ${styles.profileBtnPrimary}`}
            onClick={() => navigate('/settings/become-seller')}
          >
            Become a Verified Seller
          </button>
        </div>
      ) : (
        <>
          <div className={styles.profileFormGroup}>
            <label htmlFor="instagram_url" className={styles.profileFormLabel}>Instagram</label>
            <input 
              type="url" 
              id="instagram_url" 
              name="instagram_url" 
              value={formData.profile.instagram_url} 
              onChange={handleChange} 
              onBlur={handleUrlBlur} 
              placeholder="instagram.com/username"
              className={styles.profileInputField}
            />
          </div>

          <div className={styles.profileFormGroup}>
            <label htmlFor="twitter_url" className={styles.profileFormLabel}>Twitter</label>
            <input 
              type="url" 
              id="twitter_url" 
              name="twitter_url" 
              value={formData.profile.twitter_url} 
              onChange={handleChange} 
              onBlur={handleUrlBlur} 
              placeholder="twitter.com/username"
              className={styles.profileInputField}
            />
          </div>

          <div className={styles.profileFormGroup}>
            <label htmlFor="linkedin_url" className={styles.profileFormLabel}>LinkedIn</label>
            <input 
              type="url" 
              id="linkedin_url" 
              name="linkedin_url" 
              value={formData.profile.linkedin_url} 
              onChange={handleChange} 
              onBlur={handleUrlBlur} 
              placeholder="linkedin.com/in/username"
              className={styles.profileInputField}
            />
          </div>

          <div className={styles.profileFormGroup}>
            <label htmlFor="facebook_url" className={styles.profileFormLabel}>Facebook</label>
            <input 
              type="url" 
              id="facebook_url" 
              name="facebook_url" 
              value={formData.profile.facebook_url} 
              onChange={handleChange} 
              onBlur={handleUrlBlur} 
              placeholder="facebook.com/username"
              className={styles.profileInputField}
            />
          </div>
        </>
      )}
    </div>
  );

  const renderPreferencesTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.profileFormRow}>
        <div className={styles.profileFormGroup}>
          <label htmlFor="timezone" className={styles.profileFormLabel}>Timezone</label>
          <select 
            id="timezone" 
            name="timezone" 
            value={formData.profile.timezone} 
            onChange={handleChange}
            className={styles.profileInputField}
          >
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
        <div className={styles.profileFormGroup}>
          <label htmlFor="language_preference" className={styles.profileFormLabel}>Language</label>
          <select 
            id="language_preference" 
            name="language_preference" 
            value={formData.profile.language_preference} 
            onChange={handleChange}
            className={styles.profileInputField}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
          </select>
        </div>
      </div>

      <div className={styles.profileFormRow}>
        <div className={styles.profileFormGroup}>
          <label htmlFor="currency_preference" className={styles.profileFormLabel}>Currency</label>
          <select 
            id="currency_preference" 
            name="currency_preference" 
            value={formData.profile.currency_preference} 
            onChange={handleChange}
            className={styles.profileInputField}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>
        <div className={styles.profileFormGroup}>
          <label htmlFor="profile_visibility" className={styles.profileFormLabel}>Profile Visibility</label>
          <select 
            id="profile_visibility" 
            name="profile_visibility" 
            value={formData.profile.profile_visibility} 
            onChange={handleChange}
            className={styles.profileInputField}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="friends_only">Friends Only</option>
          </select>
        </div>
      </div>

      <div className={styles.profileFormGroup}>
        <label className={styles.profileFormLabel}>Communication Preferences</label>
        <div className={styles.profileCheckboxGroup}>
          <label className={styles.profileCheckboxLabel}>
            <input 
              type="checkbox" 
              name="marketing_emails_enabled" 
              checked={formData.profile.marketing_emails_enabled} 
              onChange={handleChange} 
            />
            Marketing Emails
          </label>
          <label className={styles.profileCheckboxLabel}>
            <input 
              type="checkbox" 
              name="newsletter_enabled" 
              checked={formData.profile.newsletter_enabled} 
              onChange={handleChange} 
            />
            Newsletter
          </label>
          <label className={styles.profileCheckboxLabel}>
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
      <div className={styles.editProfilePage}>
        <div className={styles.profileFormHeader}>
                      <h1 className={styles.headingLg}>Edit Profile</h1>
            <p className={styles.bodyLg}>Keep your profile information up to date.</p>
          {user?.profile?.profile_completion_percentage !== undefined && (
            <div className={styles.profileCompletion}>
              <span className={styles.completionText}>Profile completion: {user.profile.profile_completion_percentage}%</span>
              <div className={styles.profileProgressBar}>
                <div 
                  className={styles.profileProgressFill} 
                  style={{width: `${user.profile.profile_completion_percentage}%`}}
                ></div>
              </div>
            </div>
          )}
          
          {!user?.profile?.is_verified_seller && (
            <div className={styles.sellerRestrictionNote}>
              <p className={styles.restrictionText}>
                <strong>Note:</strong> Professional, contact, and social media fields are only available to verified sellers. 
                <button 
                  className={styles.becomeSellerLink}
                  onClick={() => navigate('/settings/become-seller')}
                >
                  Become a Verified Seller
                </button>
              </p>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className={styles.profilePremiumForm}>
          <div className={styles.profileTabNavigation}>
            <button 
              type="button" 
              className={`${styles.profileTabBtn} ${activeTab === 'basic' ? styles.active : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              Basic Info
            </button>
            {user?.profile?.is_verified_seller && (
              <button 
                type="button" 
                className={`${styles.profileTabBtn} ${activeTab === 'contact' ? styles.active : ''}`}
                onClick={() => setActiveTab('contact')}
              >
                Contact
              </button>
            )}
            {user?.profile?.is_verified_seller && (
              <button 
                type="button" 
                className={`${styles.profileTabBtn} ${activeTab === 'professional' ? styles.active : ''}`}
                onClick={() => setActiveTab('professional')}
              >
                Professional
              </button>
            )}
            <button 
              type="button" 
              className={`${styles.profileTabBtn} ${activeTab === 'address' ? styles.active : ''}`}
              onClick={() => setActiveTab('address')}
            >
              Address
            </button>
            {user?.profile?.is_verified_seller && (
              <button 
                type="button" 
                className={`${styles.profileTabBtn} ${activeTab === 'social' ? styles.active : ''}`}
                onClick={() => setActiveTab('social')}
              >
                Social
              </button>
            )}
            <button 
              type="button" 
              className={`${styles.profileTabBtn} ${activeTab === 'preferences' ? styles.active : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              Preferences
            </button>
          </div>

          <div className={styles.profileTabContainer}>
            {activeTab === 'basic' && renderBasicTab()}
            {activeTab === 'contact' && renderContactTab()}
            {activeTab === 'professional' && renderProfessionalTab()}
            {activeTab === 'address' && renderAddressTab()}
            {activeTab === 'social' && renderSocialTab()}
            {activeTab === 'preferences' && renderPreferencesTab()}
          </div>

          <div className={styles.profileFormActions}>
            <button 
              type="button" 
              className={`${styles.profileBtn} ${styles.profileBtnSecondary}`} 
              onClick={() => navigate('/settings')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`${styles.profileBtn} ${styles.profileBtnPrimary}`}
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditProfile;