import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/state/AuthContext';
import Layout from '@/app/layout/Layout';
import ImageUpload from '@/components/Common/ImageUpload';
import SelectRS, { type Option } from '@/shared/ui/SelectRS';
import {
  FormContainer,
  FormSection,
  FormGrid,
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  Button,
  FormActions,
  type FormTranslations
} from '@/shared/ui/forms';

// Options will be translated within component using i18n
const getSellerTypeOptions = (t: any): Option[] => [
  { value: 'manufacturer', label: t('account.seller.seller_types.manufacturer') },
  { value: 'designer', label: t('account.seller.seller_types.designer') },
  { value: 'restorer', label: t('account.seller.seller_types.restorer') },
  { value: 'retailer', label: t('account.seller.seller_types.retailer') },
  { value: 'artisan', label: t('account.seller.seller_types.artisan') },
];

const BecomeSellerForm: React.FC = () => {
  const { t } = useTranslation();
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

      // Create seller application request object
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
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: 'var(--space-xl, 32px) var(--space-lg, 24px)',
          fontFamily: 'var(--font-sans, "Inter", sans-serif)'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--space-3xl, 64px) var(--space-xl, 32px)', 
            background: 'var(--surface-glass, rgba(255, 255, 255, 0.95))',
            border: '1px solid var(--border-soft, rgba(229, 231, 235, 0.6))',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-md, 0 4px 16px rgba(15, 23, 42, 0.12))'
          }}>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 600, 
              color: 'var(--color-text-primary, #1A1A1A)', 
              margin: '0 0 var(--space-md, 16px) 0',
              fontFamily: 'var(--font-serif, "Playfair Display", serif)'
            }}>
              Become a Seller
            </h1>
            <p style={{ 
              fontSize: '18px', 
              color: 'var(--color-text-secondary, #6B7280)', 
              margin: '0 0 var(--space-xl, 32px) 0',
              lineHeight: 1.6
            }}>
              Two‑factor authentication (2FA) is required to apply.
            </p>
            <Button
              onClick={() => navigate('/settings')}
              variant="primary"
              style={{ fontSize: '16px', padding: '14px 28px' }}
            >
              Activate 2FA to become a seller
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: 'var(--space-xl, 32px) var(--space-lg, 24px)',
        fontFamily: 'var(--font-sans, "Inter", sans-serif)'
      }}>
        {/* Header Section */}
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--space-xl, 32px) 0 var(--space-lg, 24px)', 
          borderBottom: '1px solid var(--color-border, #E5E7EB)', 
          marginBottom: 'var(--space-xl, 32px)' 
        }}>
          <h1 style={{ 
            fontFamily: 'var(--font-serif, "Playfair Display", serif)', 
            fontSize: '36px', 
            fontWeight: 600, 
            color: 'var(--color-text-primary, #1A1A1A)', 
            margin: '0 0 var(--space-sm, 8px) 0',
            lineHeight: 1.2
          }}>
            Become a Seller
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: 'var(--color-text-secondary, #6B7280)', 
            margin: 0,
            lineHeight: 1.5,
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Tell us about your business. Your application will be reviewed by our team to ensure the quality of our marketplace.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            borderRadius: '16px',
            border: '1px solid color-mix(in srgb, var(--color-error, #EF4444) 45%, transparent)',
            background: 'color-mix(in srgb, var(--color-error, #EF4444) 12%, var(--color-surface, #FFFFFF) 88%)',
            padding: '16px 24px',
            marginBottom: 'var(--space-lg, 24px)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--color-error, #EF4444)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="18"/>
              </svg>
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: '16px', color: 'var(--color-error, #EF4444)', fontWeight: 600 }}>
                Error
              </h4>
              <p style={{ margin: 0, color: 'var(--color-text-secondary, #6B7280)', lineHeight: 1.5 }}>
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {success && (
          <div style={{
            borderRadius: '16px',
            border: '1px solid color-mix(in srgb, var(--color-success, #10B981) 45%, transparent)',
            background: 'color-mix(in srgb, var(--color-success, #10B981) 12%, var(--color-surface, #FFFFFF) 88%)',
            padding: '16px 24px',
            marginBottom: 'var(--space-lg, 24px)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--color-success, #10B981)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: '16px', color: 'var(--color-success, #10B981)', fontWeight: 600 }}>
                Success
              </h4>
              <p style={{ margin: 0, color: 'var(--color-text-secondary, #6B7280)', lineHeight: 1.5 }}>
                Application submitted successfully! Our team will review your application shortly. Redirecting...
              </p>
            </div>
          </div>
        )}
        
        {/* Main Form */}
        <FormContainer>
          <form onSubmit={handleSubmit}>
            {/* Business Information Section */}
            <FormSection 
              title="Business Information"
              description="Help us understand your business and expertise"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H8"/>
                  <path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z"/>
                </svg>
              }
            >
              <FormGrid>
                <FormGroup fullWidth>
                  <FormLabel required htmlFor="businessName">Business Name</FormLabel>
                  <FormInput 
                    id="businessName" 
                    name="businessName" 
                    required 
                    placeholder="Enter your business name"
                  />
                </FormGroup>

                <FormGroup fullWidth>
                  <FormLabel required htmlFor="sellerType">What best describes you?</FormLabel>
                  <SelectRS
                    name="sellerType"
                    options={getSellerTypeOptions(t)}
                    value={sellerType}
                    onChange={setSellerType}
                    placeholder="Select a type..."
                    fullWidth
                    isClearable
                  />
                </FormGroup>

                <FormGroup fullWidth>
                  <FormLabel required htmlFor="motivation">Why do you want to sell on Designia?</FormLabel>
                  <FormTextarea 
                    id="motivation" 
                    name="motivation" 
                    showCharacterCounter
                    maxLength={1000}
                    placeholder="Describe your passion for furniture, your business mission, and why you're a good fit for our platform." 
                    required
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Verification & Portfolio Section */}
            <FormSection 
              title="Verification & Portfolio"
              description="Showcase your work and establish credibility"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              }
            >
              <FormGrid>
                <FormGroup fullWidth>
                  <FormLabel required htmlFor="portfolio">Portfolio or Website Link</FormLabel>
                  <FormInput 
                    type="url" 
                    id="portfolio" 
                    name="portfolio" 
                    placeholder="https://your-brand.com" 
                    required 
                  />
                </FormGroup>

                <FormGroup fullWidth>
                  <FormLabel htmlFor="socialMedia">Social Media (Optional)</FormLabel>
                  <FormInput 
                    type="url" 
                    id="socialMedia" 
                    name="socialMedia" 
                    placeholder="https://instagram.com/your-brand" 
                  />
                </FormGroup>

                <FormGroup fullWidth>
                  <FormLabel required htmlFor="workshopPhotos">Photos of Your Workshop/Products</FormLabel>
                  <div style={{ 
                    fontSize: '14px', 
                    color: 'var(--color-text-muted, #9CA3AF)', 
                    margin: '0 0 var(--space-md, 16px) 0',
                    lineHeight: 1.4
                  }}>
                    Please upload at least 3 photos. This helps us verify your work.
                  </div>
                  <ImageUpload 
                    files={workshopFiles} 
                    setFiles={setWorkshopFiles}
                    minFiles={3}
                    maxFiles={10}
                    maxFileSize={10 * 1024 * 1024}
                    allowedExtensions={['jpg', 'jpeg', 'png', 'webp']}
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Form Actions */}
            <FormActions>
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => navigate('/settings')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                disabled={isLoading || success || !has2FAEnabled}
              >
                {!has2FAEnabled
                  ? 'Enable 2FA to Submit'
                  : isLoading
                  ? 'Submitting...'
                  : success
                  ? 'Submitted!'
                  : 'Submit Application'}
              </Button>
            </FormActions>
          </form>
        </FormContainer>
      </div>
    </Layout>
  );
};

export default BecomeSellerForm;
