import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/app/layout';
import { useAuth } from '@/features/auth/state/AuthContext';
import ImageUpload from '@/shared/ui/image-upload/ImageUpload';
import Select from '@/shared/ui/select/Select';
import type { Option } from '@/shared/ui/select/Select';
import styles from './BecomeSellerForm.module.css';

const sellerTypeOptions: Option[] = [
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

  const has2FAEnabled = user?.two_factor_enabled || false;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!has2FAEnabled) {
        throw new Error(
          'Two-factor authentication (2FA) must be enabled before applying to become a seller. Please enable 2FA in your settings.',
        );
      }

      const formData = new FormData(event.currentTarget);
      const businessName = formData.get('businessName') as string;
      const motivation = formData.get('motivation') as string;
      const portfolio = formData.get('portfolio') as string;

      if (!businessName || !sellerType || !motivation || !portfolio) {
        throw new Error('Please fill in all required fields.');
      }

      if (workshopFiles.length < 3) {
        throw new Error('Please upload at least 3 workshop/product photos.');
      }

      await submitSellerApplication({
        businessName,
        sellerType,
        motivation,
        portfolio,
        socialMedia: (formData.get('socialMedia') as string) || undefined,
        workshopPhotos: workshopFiles,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/settings');
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit application. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className={styles['become-seller-page']}>
        <div className={styles['seller-form-header']}>
          <h1 className="heading-lg">Become a Seller</h1>
          <p className="body-lg">
            Tell us about your business. Your application will be reviewed by our team to ensure the quality of our marketplace.
          </p>
        </div>

        {!has2FAEnabled && (
          <div className={styles.alertError}>
            <strong>⚠️ Two-Factor Authentication Required</strong>
            <p>
              You must enable two-factor authentication (2FA) before applying to become a seller. This additional security measure helps protect your account and your customers.
            </p>
            <button
              type="button"
              className={styles['seller-btn-secondary']}
              onClick={() => navigate('/settings')}
            >
              Go to Settings to Enable 2FA
            </button>
          </div>
        )}

        {error && <div className={styles.alertError}>{error}</div>}

        {success && (
          <div className={styles.alertSuccess}>
            Application submitted successfully! Our team will review your application shortly. Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles['premium-form']}>
          <div className={styles['form-section']}>
            <div className={styles['seller-section-header']}>
              <h2 className="heading-md">Business Information</h2>
              <p className="body-md">Help us understand your business and expertise</p>
            </div>

            <div className={styles['seller-form-group']}>
              <label htmlFor="businessName" className={styles['form-label']}>Business Name</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                className={styles['input-field']}
                required
                placeholder="Enter your business name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="sellerType" className={styles['form-label']}>What best describes you?</label>
              <Select
                options={sellerTypeOptions}
                value={sellerType}
                onChange={setSellerType}
                placeholder="Select a type..."
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="motivation" className={styles['form-label']}>Why do you want to sell on Designia?</label>
              <textarea
                id="motivation"
                name="motivation"
                rows={5}
                className={cx(styles['input-field'], styles['textarea-field'])}
                placeholder="Describe your passion for furniture, your business mission, and why you're a good fit for our platform."
                required
              ></textarea>
            </div>
          </div>

          <div className={styles['form-section']}>
            <div className={styles['seller-section-header']}>
              <h2 className="heading-md">Verification &amp; Portfolio</h2>
              <p className="body-md">Showcase your work and establish credibility</p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="portfolio" className={styles['form-label']}>Portfolio or Website Link</label>
              <input
                type="url"
                id="portfolio"
                name="portfolio"
                className={styles['input-field']}
                placeholder="https://your-brand.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="socialMedia" className={styles['form-label']}>Social Media (Optional)</label>
              <input
                type="url"
                id="socialMedia"
                name="socialMedia"
                className={styles['input-field']}
                placeholder="https://instagram.com/your-brand"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="workshopPhotos" className={styles['form-label']}>Photos of Your Workshop/Products</label>
              <p className={styles['form-hint']}>Please upload at least 3 photos. This helps us verify your work.</p>
              <div className={styles['upload-container']}>
                <ImageUpload files={workshopFiles} setFiles={setWorkshopFiles} />
              </div>
            </div>
          </div>

          <div className={styles['seller-form-actions']}>
            <button
              type="button"
              className={styles['seller-btn-secondary']}
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles['seller-btn-primary']}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

export default BecomeSellerForm;
