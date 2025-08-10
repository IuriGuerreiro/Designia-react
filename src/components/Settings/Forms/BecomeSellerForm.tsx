import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import ImageUpload from '../../Common/ImageUpload';
import Select from '../../Common/Select';
import './Forms.css';

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
      <div className="form-page-container">
        <h2>Become a Verified Seller</h2>
        <p>Tell us about your business. Your application will be reviewed by our team to ensure the quality of our marketplace.</p>
        
        <form onSubmit={handleSubmit} className="standard-form">
          <fieldset>
            <legend>Business Information</legend>
            <div className="form-group">
              <label htmlFor="businessName">Business Name</label>
              <input type="text" id="businessName" name="businessName" required />
            </div>
            <div className="form-group">
              <label htmlFor="sellerType">What best describes you?</label>
              <Select
                options={sellerTypeOptions}
                value={sellerType}
                onChange={setSellerType}
                placeholder="Select a type..."
              />
            </div>
             <div className="form-group">
              <label htmlFor="motivation">Why do you want to sell on Designia?</label>
              <textarea id="motivation" name="motivation" rows={5} placeholder="Describe your passion for furniture, your business mission, and why you're a good fit for our platform." required></textarea>
            </div>
          </fieldset>

          <fieldset>
            <legend>Verification & Portfolio</legend>
            <div className="form-group">
              <label htmlFor="portfolio">Portfolio or Website Link</label>
              <input type="url" id="portfolio" name="portfolio" placeholder="https://your-brand.com" required />
            </div>
             <div className="form-group">
              <label htmlFor="socialMedia">Social Media (Optional)</label>
              <input type="url" id="socialMedia" name="socialMedia" placeholder="https://instagram.com/your-brand" />
            </div>
            <div className="form-group">
              <label htmlFor="workshopPhotos">Photos of Your Workshop/Products</label>
              <p className="form-hint">Please upload at least 3 photos. This helps us verify your work.</p>
              <ImageUpload files={workshopFiles} setFiles={setWorkshopFiles} />
            </div>
          </fieldset>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/settings')}>Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Application</button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default BecomeSellerForm;
