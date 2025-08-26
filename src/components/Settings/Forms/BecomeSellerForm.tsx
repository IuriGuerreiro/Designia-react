import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import ImageUpload from '../../Common/ImageUpload';
import Select from '../../Common/Select';
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
  const [workshopFiles, setWorkshopFiles] = useState<File[]>([]);
  const [sellerType, setSellerType] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Seller application submitted with files:', workshopFiles.map(f => f.name));
    alert('Application submitted! Our team will review your application shortly.');
    navigate('/settings');
  };

  return (
    <Layout>
      <div className="become-seller-page">
        <div className="seller-form-header">
          <h1 className="heading-lg">Become a Verified Seller</h1>
          <p className="body-lg">
            Tell us about your business. Your application will be reviewed by our team to ensure the quality of our marketplace.
          </p>
        </div>
        
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
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default BecomeSellerForm;
