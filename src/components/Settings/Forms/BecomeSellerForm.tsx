import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/state/AuthContext';
import Layout from '@/app/layout/Layout';
import ImageUpload from '@/components/Common/ImageUpload';
import Select from '@/shared/ui/select/Select';
import type { Option } from '@/shared/ui/select/Select';
import './BecomeSellerForm.css';

const sellerTypeOptions = [
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'designer', label: 'Furniture Designer' },
  { value: 'restorer', label: 'Furniture Restorer/Fixer' },
  { value: 'retailer', label: 'Retailer/Curator' },
  { value: 'artisan', label: 'Artisan/Craftsman' },
];

const BecomeSellerForm: React.FC = () => {
  const navigate = useNavigate();
  const { submitSellerApplication, user } = useAuth();
  const [workshopFiles, setWorkshopFiles] = useState<File[]>([]);
  const [sellerType, setSellerType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if user has 2FA enabled
  const has2FAEnabled = user?.two_factor_enabled || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Check if 2FA is enabled before proceeding
      if (!has2FAEnabled) {
        throw new Error('Two-factor authentication (2FA) must be enabled before applying to become a seller. Please enable 2FA in your settings.');
      }

      const formData = new FormData(e.target as HTMLFormElement);

      // Validate required fields
      const businessName = formData.get('businessName') as string;
      const motivation = formData.get('motivation') as string;
      const portfolio = formData.get('portfolio') as string;

      if (!businessName || !sellerType || !motivation || !portfolio) {
        throw new Error('Please fill in all required fields.');
      }

      if (workshopFiles.length < 3) {
        throw new Error('Please upload at least 3 workshop/product photos.');
      }

      // Create the seller application request object
      const sellerApplicationData = {
        businessName,
        sellerType,
        motivation,
        portfolio,
        socialMedia: formData.get('socialMedia') as string || undefined,
        workshopPhotos: workshopFiles,
      };

      await submitSellerApplication(sellerApplicationData);

      setSuccess(true);
      setTimeout(() => {
        navigate('/settings');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If 2FA is not enabled, show only the warning/CTA and hide the form
  if (!has2FAEnabled) {
    return (
      <Layout>
        <div className="become-seller-page">
          <div className="seller-form-header">
            <h1 className="heading-lg">Become a Seller</h1>
            <p className="body-lg">Two‑factor authentication (2FA) is required to apply.</p>
          </div>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-start' }}>
            <button
              onClick={() => navigate('/settings')}
              className="seller-btn seller-btn-primary"
              type="button"
            >
              Activate 2FA to become a seller
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="become-seller-page">
        <div className="seller-form-header">
          <h1 className="heading-lg">Become a Seller</h1>
          <p className="body-lg">
            Tell us about your business. Your application will be reviewed by our team to ensure the quality of our marketplace.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            Application submitted successfully! Our team will review your application shortly. Redirecting...
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="premium-form">
          <div className="form-section">
            <div className="seller-section-header">
              <h2 className="heading-md">Business Information</h2>
              <p className="body-md">Help us understand your business and expertise</p>
            </div>
            
            <div className="seller-form-group">
              <label htmlFor="businessName" className="form-label">Business Name</label>
              <input 
                type="text" 
                id="businessName" 
                name="businessName" 
                className="input-field" 
                required 
                placeholder="Enter your business name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="sellerType" className="form-label">What best describes you?</label>
              <Select
                options={sellerTypeOptions}
                value={sellerType}
                onChange={setSellerType}
                placeholder="Select a type..."
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="motivation" className="form-label">Why do you want to sell on Designia?</label>
              <textarea 
                id="motivation" 
                name="motivation" 
                rows={5} 
                className="input-field textarea-field"
                placeholder="Describe your passion for furniture, your business mission, and why you're a good fit for our platform." 
                required
              ></textarea>
            </div>
          </div>

          <div className="form-section">
            <div className="seller-section-header">
              <h2 className="heading-md">Verification & Portfolio</h2>
              <p className="body-md">Showcase your work and establish credibility</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="portfolio" className="form-label">Portfolio or Website Link</label>
              <input 
                type="url" 
                id="portfolio" 
                name="portfolio" 
                className="input-field" 
                placeholder="https://your-brand.com" 
                required 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="socialMedia" className="form-label">Social Media (Optional)</label>
              <input 
                type="url" 
                id="socialMedia" 
                name="socialMedia" 
                className="input-field" 
                placeholder="https://instagram.com/your-brand" 
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="workshopPhotos" className="form-label">Photos of Your Workshop/Products</label>
              <p className="form-hint">Please upload at least 3 photos. This helps us verify your work.</p>
              <div className="upload-container">
                <ImageUpload files={workshopFiles} setFiles={setWorkshopFiles} />
              </div>
            </div>
          </div>

          <div className="seller-form-actions">
            <button 
              type="button" 
              className="seller-btn seller-btn-secondary" 
              onClick={() => navigate('/settings')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="seller-btn seller-btn-primary"
              disabled={isLoading || success || !has2FAEnabled}
            >
              {!has2FAEnabled
                ? 'Enable 2FA to Submit'
                : isLoading
                ? 'Submitting...'
                : success
                ? 'Submitted!'
                : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default BecomeSellerForm;
