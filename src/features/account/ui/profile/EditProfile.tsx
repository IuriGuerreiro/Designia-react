import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/app/layout';
import ImageUpload from '@/shared/ui/image-upload/ImageUpload';
import { useAuth } from '@/features/auth/state/AuthContext';
import styles from './Profile.module.css';

const EditProfile: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateProfile, isSeller, isAdmin } = useAuth();
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
      
      // Account Settings (preferences moved to Settings)
      account_type: user?.profile?.account_type || 'personal'
    }
  });

  // Helper: determine if user has full access to all profile fields
  const hasFullAccess = Boolean(
    (typeof isSeller === 'function' && isSeller()) ||
    (typeof isAdmin === 'function' && isAdmin()) ||
    user?.profile?.is_verified_seller
  );

  // Effect to handle tab switching when access level changes
  useEffect(() => {
    // If user lacks access and is on a restricted tab, switch to basic
    if (!hasFullAccess && ['contact', 'professional', 'social'].includes(activeTab)) {
      setActiveTab('basic');
    }
  }, [hasFullAccess, activeTab]);

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
          alert(t('account.profile.edit.messages.no_changes'));
          return;
        }
        
        console.log('Submitting changed fields:', changedFields);
        await updateProfile(changedFields);
        alert(t('account.profile.edit.messages.update_success'));
        
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
          alert(`${t('account.profile.edit.messages.validation_errors')}\n${errorMessages.join('\n')}`);
        } else {
          alert(error.message || t('account.profile.edit.messages.update_failed'));
        }
    }
  };

  const renderBasicTab = () => (
    <div className={styles.tabContent}>
              <div className={`${styles.profileFormGroup} ${styles.profilePictureSection}`}>
          <label className={styles.profileFormLabel}>{t('account.profile.edit.fields.profile_picture')}</label>
        <ImageUpload files={profileImage} setFiles={setProfileImage} />
      </div>

      <div className={styles.profileFormRow}>
        <div className={styles.profileFormGroup}>
          <label htmlFor="first_name" className={styles.profileFormLabel}>{t('account.profile.edit.fields.first_name')}</label>
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
          <label htmlFor="last_name" className={styles.profileFormLabel}>{t('account.profile.edit.fields.last_name')}</label>
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
        <label htmlFor="username" className={styles.profileFormLabel}>{t('account.profile.edit.fields.username')}</label>
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
          <label htmlFor="gender" className={styles.profileFormLabel}>{t('account.profile.edit.fields.gender')}</label>
          <select 
            id="gender" 
            name="gender" 
            value={formData.profile.gender} 
            onChange={handleChange}
            className={styles.profileInputField}
          >
            <option value="">{t('account.profile.edit.fields.gender_select')}</option>
            <option value="male">{t('account.profile.edit.fields.gender_options.male')}</option>
            <option value="female">{t('account.profile.edit.fields.gender_options.female')}</option>
            <option value="non_binary">{t('account.profile.edit.fields.gender_options.non_binary')}</option>
            <option value="prefer_not_to_say">{t('account.profile.edit.fields.gender_options.prefer_not_to_say')}</option>
            <option value="other">{t('account.profile.edit.fields.gender_options.other')}</option>
          </select>
        </div>
        <div className={styles.profileFormGroup}>
          <label htmlFor="pronouns" className={styles.profileFormLabel}>{t('account.profile.edit.fields.pronouns')}</label>
          <input 
            type="text" 
            id="pronouns" 
            name="pronouns" 
            value={formData.profile.pronouns} 
            onChange={handleChange} 
            placeholder={t('account.profile.edit.placeholders.pronouns')}
            className={styles.profileInputField}
          />
        </div>
      </div>

      <div className={styles.profileFormGroup}>
        <label htmlFor="birth_date" className={styles.profileFormLabel}>{t('account.profile.edit.fields.birth_date')}</label>
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
        <label htmlFor="bio" className={styles.profileFormLabel}>{t('account.profile.edit.fields.bio')}</label>
        <textarea 
          id="bio" 
          name="bio" 
          value={formData.profile.bio} 
          onChange={handleChange} 
          rows={4} 
          maxLength={500} 
          placeholder={t('account.profile.edit.placeholders.bio')}
          className={`${styles.profileInputField} ${styles.profileTextareaField}`}
        />
        <small className={styles.profileFormHint}>{formData.profile.bio.length}/500 {t('account.profile.edit.misc.characters')}</small>
      </div>
    </div>
  );

  const renderContactTab = () => (
    <div className={styles.tabContent}>
      {!hasFullAccess ? (
        <div className={styles.restrictedTabMessage}>
          <h3 className={styles.restrictedTabTitle}>{t('account.profile.edit.restricted.contact_title')}</h3>
          <p className={styles.restrictedTabText}>
            {t('account.profile.edit.restricted.contact_text')}
          </p>
          <button 
            className={`${styles.profileBtn} ${styles.profileBtnPrimary}`}
            onClick={() => navigate('/settings/become-seller')}
          >
            {t('account.profile.edit.actions.become_verified_seller')}
          </button>
        </div>
      ) : (
        <>
          <div className={styles.profileFormRow}>
            <div className={styles.profileFormGroup} style={{flex: '0 0 120px'}}>
              <label htmlFor="country_code" className={styles.profileFormLabel}>{t('account.profile.edit.fields.country_code')}</label>
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
              <label htmlFor="phone_number" className={styles.profileFormLabel}>{t('account.profile.edit.fields.phone_number')}</label>
              <input 
                type="tel" 
                id="phone_number" 
                name="phone_number" 
                value={formData.profile.phone_number} 
                onChange={handleChange} 
                placeholder={t('account.profile.edit.placeholders.phone')}
                className={styles.profileInputField}
              />
            </div>
          </div>

          <div className={styles.profileFormGroup}>
            <label htmlFor="website" className={styles.profileFormLabel}>{t('account.profile.edit.fields.website')}</label>
            <input 
              type="url" 
              id="website" 
              name="website" 
              value={formData.profile.website} 
              onChange={handleChange} 
              onBlur={handleUrlBlur} 
              placeholder={t('account.profile.edit.placeholders.website')}
              className={styles.profileInputField}
            />
          </div>

          <div className={styles.profileFormGroup}>
            <label htmlFor="location" className={styles.profileFormLabel}>{t('account.profile.edit.fields.location')}</label>
            <input 
              type="text" 
              id="location" 
              name="location" 
              value={formData.profile.location} 
              onChange={handleChange} 
              placeholder={t('account.profile.edit.placeholders.location')}
              className={styles.profileInputField}
            />
          </div>
        </>
      )}
    </div>
  );

  const renderProfessionalTab = () => (
    <div className={styles.tabContent}>
      {!hasFullAccess ? (
        <div className={styles.restrictedTabMessage}>
          <h3 className={styles.restrictedTabTitle}>{t('account.profile.edit.restricted.professional_title')}</h3>
          <p className={styles.restrictedTabText}>
            {t('account.profile.edit.restricted.professional_text')}
          </p>
          <button 
            className={`${styles.profileBtn} ${styles.profileBtnPrimary}`}
            onClick={() => navigate('/settings/become-seller')}
          >
            {t('account.profile.edit.actions.become_verified_seller')}
          </button>
        </div>
      ) : (
        <>
          <div className={styles.profileFormGroup}>
            <label htmlFor="job_title" className={styles.profileFormLabel}>{t('account.profile.edit.fields.job_title')}</label>
            <input 
              type="text" 
              id="job_title" 
              name="job_title" 
              value={formData.profile.job_title} 
              onChange={handleChange} 
              placeholder={t('account.profile.edit.placeholders.job_title')}
              className={styles.profileInputField}
            />
          </div>

          <div className={styles.profileFormGroup}>
            <label htmlFor="company" className={styles.profileFormLabel}>{t('account.profile.edit.fields.company')}</label>
            <input 
              type="text" 
              id="company" 
              name="company" 
              value={formData.profile.company} 
              onChange={handleChange} 
              placeholder={t('account.profile.edit.placeholders.company')}
              className={styles.profileInputField}
            />
          </div>

          <div className={styles.profileFormGroup}>
            <label htmlFor="account_type" className={styles.profileFormLabel}>{t('account.profile.edit.fields.account_type')}</label>
            <select 
              id="account_type" 
              name="account_type" 
              value={formData.profile.account_type} 
              onChange={handleChange}
              className={styles.profileInputField}
            >
              <option value="personal">{t('account.profile.edit.fields.account_type_options.personal')}</option>
              <option value="business">{t('account.profile.edit.fields.account_type_options.business')}</option>
              <option value="creator">{t('account.profile.edit.fields.account_type_options.creator')}</option>
            </select>
          </div>
        </>
      )}
    </div>
  );

  const renderAddressTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.profileFormGroup}>
        <label htmlFor="street_address" className={styles.profileFormLabel}>{t('account.profile.edit.fields.street_address')}</label>
        <input 
          type="text" 
          id="street_address" 
          name="street_address" 
          value={formData.profile.street_address} 
          onChange={handleChange} 
          placeholder={t('account.profile.edit.placeholders.street_address')}
          className={styles.profileInputField}
        />
      </div>

      <div className={styles.profileFormRow}>
        <div className={styles.profileFormGroup}>
          <label htmlFor="city" className={styles.profileFormLabel}>{t('account.profile.edit.fields.city')}</label>
          <input 
            type="text" 
            id="city" 
            name="city" 
            value={formData.profile.city} 
            onChange={handleChange} 
            placeholder={t('account.profile.edit.placeholders.city')}
            className={styles.profileInputField}
          />
        </div>
        <div className={styles.profileFormGroup}>
          <label htmlFor="state_province" className={styles.profileFormLabel}>{t('account.profile.edit.fields.state_province')}</label>
          <input 
            type="text" 
            id="state_province" 
            name="state_province" 
            value={formData.profile.state_province} 
            onChange={handleChange} 
            placeholder={t('account.profile.edit.placeholders.state_province')}
            className={styles.profileInputField}
          />
        </div>
      </div>

      <div className={styles.profileFormRow}>
        <div className={styles.profileFormGroup}>
          <label htmlFor="country" className={styles.profileFormLabel}>{t('account.profile.edit.fields.country')}</label>
          <input 
            type="text" 
            id="country" 
            name="country" 
            value={formData.profile.country} 
            onChange={handleChange} 
            placeholder={t('account.profile.edit.placeholders.country')}
            className={styles.profileInputField}
          />
        </div>
        <div className={styles.profileFormGroup}>
          <label htmlFor="postal_code" className={styles.profileFormLabel}>{t('account.profile.edit.fields.postal_code')}</label>
                      <input 
              type="text" 
              id="postal_code" 
              name="postal_code" 
              value={formData.profile.postal_code} 
              onChange={handleChange} 
              placeholder={t('account.profile.edit.placeholders.postal_code')}
              className={styles.profileInputField}
            />
        </div>
      </div>
    </div>
  );

  const renderSocialTab = () => (
    <div className={styles.tabContent}>
      {!hasFullAccess ? (
        <div className={styles.restrictedTabMessage}>
          <h3 className={styles.restrictedTabTitle}>{t('account.profile.edit.restricted.social_title')}</h3>
          <p className={styles.restrictedTabText}>
            {t('account.profile.edit.restricted.social_text')}
          </p>
          <button 
            className={`${styles.profileBtn} ${styles.profileBtnPrimary}`}
            onClick={() => navigate('/settings/become-seller')}
          >
            {t('account.profile.edit.actions.become_verified_seller')}
          </button>
        </div>
      ) : (
        <>
          <div className={styles.profileFormGroup}>
            <label htmlFor="instagram_url" className={styles.profileFormLabel}>{t('account.profile.edit.fields.instagram')}</label>
            <input 
              type="url" 
              id="instagram_url" 
              name="instagram_url" 
              value={formData.profile.instagram_url} 
              onChange={handleChange} 
              onBlur={handleUrlBlur} 
              placeholder={t('account.profile.edit.placeholders.instagram')}
              className={styles.profileInputField}
            />
          </div>

          <div className={styles.profileFormGroup}>
            <label htmlFor="twitter_url" className={styles.profileFormLabel}>{t('account.profile.edit.fields.twitter')}</label>
            <input 
              type="url" 
              id="twitter_url" 
              name="twitter_url" 
              value={formData.profile.twitter_url} 
              onChange={handleChange} 
              onBlur={handleUrlBlur} 
              placeholder={t('account.profile.edit.placeholders.twitter')}
              className={styles.profileInputField}
            />
          </div>

          <div className={styles.profileFormGroup}>
            <label htmlFor="linkedin_url" className={styles.profileFormLabel}>{t('account.profile.edit.fields.linkedin')}</label>
            <input 
              type="url" 
              id="linkedin_url" 
              name="linkedin_url" 
              value={formData.profile.linkedin_url} 
              onChange={handleChange} 
              onBlur={handleUrlBlur} 
              placeholder={t('account.profile.edit.placeholders.linkedin')}
              className={styles.profileInputField}
            />
          </div>

          <div className={styles.profileFormGroup}>
            <label htmlFor="facebook_url" className={styles.profileFormLabel}>{t('account.profile.edit.fields.facebook')}</label>
            <input 
              type="url" 
              id="facebook_url" 
              name="facebook_url" 
              value={formData.profile.facebook_url} 
              onChange={handleChange} 
              onBlur={handleUrlBlur} 
              placeholder={t('account.profile.edit.placeholders.facebook')}
              className={styles.profileInputField}
            />
          </div>
        </>
      )}
    </div>
  );


  return (
    <Layout>
      <div className={styles.editProfilePage}>
        <div className={styles.profileFormHeader}>
                      <h1 className={styles.headingLg}>{t('account.profile.edit.title')}</h1>
            <p className={styles.bodyLg}>{t('account.profile.edit.subtitle')}</p>
          {user?.profile?.profile_completion_percentage !== undefined && (
            <div className={styles.profileCompletion}>
              <span className={styles.completionText}>{t('account.profile.edit.completion_label')} {user.profile.profile_completion_percentage}%</span>
              <div className={styles.profileProgressBar}>
                <div 
                  className={styles.profileProgressFill} 
                  style={{width: `${user.profile.profile_completion_percentage}%`}}
                ></div>
              </div>
            </div>
          )}
          
          {!hasFullAccess && (
            <div className={styles.sellerRestrictionNote}>
              <p className={styles.restrictionText}>
                <strong>{t('account.profile.edit.note_label')}</strong> {t('account.profile.edit.restriction_note')}
                <button 
                  className={styles.becomeSellerLink}
                  onClick={() => navigate('/settings/become-seller')}
                >
                  {t('account.profile.edit.actions.become_verified_seller')}
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
              {t('account.profile.edit.tabs.basic')}
            </button>
            {hasFullAccess && (
              <button 
                type="button" 
                className={`${styles.profileTabBtn} ${activeTab === 'contact' ? styles.active : ''}`}
                onClick={() => setActiveTab('contact')}
              >
                {t('account.profile.edit.tabs.contact')}
              </button>
            )}
            {hasFullAccess && (
              <button 
                type="button" 
                className={`${styles.profileTabBtn} ${activeTab === 'professional' ? styles.active : ''}`}
                onClick={() => setActiveTab('professional')}
              >
                {t('account.profile.edit.tabs.professional')}
              </button>
            )}
            <button 
              type="button" 
              className={`${styles.profileTabBtn} ${activeTab === 'address' ? styles.active : ''}`}
              onClick={() => setActiveTab('address')}
            >
              {t('account.profile.edit.tabs.address')}
            </button>
            {hasFullAccess && (
              <button 
                type="button" 
                className={`${styles.profileTabBtn} ${activeTab === 'social' ? styles.active : ''}`}
                onClick={() => setActiveTab('social')}
              >
                {t('account.profile.edit.tabs.social')}
              </button>
            )}
            {/* Preferences moved to Settings; tab removed */}
          </div>

          <div className={styles.profileTabContainer}>
            {activeTab === 'basic' && renderBasicTab()}
            {activeTab === 'contact' && renderContactTab()}
            {activeTab === 'professional' && renderProfessionalTab()}
            {activeTab === 'address' && renderAddressTab()}
            {activeTab === 'social' && renderSocialTab()}
            {/* Preferences moved to Settings; no render in profile editor */}
          </div>

          <div className={styles.profileFormActions}>
            <button 
              type="button" 
              className={`${styles.profileBtn} ${styles.profileBtnSecondary}`} 
              onClick={() => navigate('/settings')}
            >
              {t('account.profile.edit.actions.cancel')}
            </button>
            <button 
              type="submit" 
              className={`${styles.profileBtn} ${styles.profileBtnPrimary}`}
            >
              {t('account.profile.edit.actions.save')}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditProfile;
