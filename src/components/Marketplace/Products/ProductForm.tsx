import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import ImageUpload from '../../Common/ImageUpload';
import Select from '../../Common/Select';
import { useTranslation } from 'react-i18next';
import { productService, categoryService } from '../../../services';
import { type Category } from '../../../types/marketplace';
import './Products.css';

const ProductForm: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isEditing = Boolean(slug);
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    original_price: '',
    stock_quantity: 0,
    category: '',
    condition: 'new',
    brand: '',
    model: '',
    weight: '',
    dimensions_length: '',
    dimensions_width: '',
    dimensions_height: '',
    materials: '',
    tags: [] as string[],
    is_featured: false,
    is_digital: false,
  });
  
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState('');


  const availableColors = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Gray', 'Brown', 'Orange', 'Purple'];
  
  const conditionOptions = [
    { value: 'new', label: t('products.form.conditions.new') },
    { value: 'like_new', label: t('products.form.conditions.like_new') },
    { value: 'good', label: t('products.form.conditions.good') },
    { value: 'fair', label: t('products.form.conditions.fair') },
    { value: 'poor', label: t('products.form.conditions.poor') },
  ];

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Failed to load categories. Please refresh the page.');
      }
    };

    loadCategories();
  }, []);

  // Load product data for editing
  useEffect(() => {
    const loadProduct = async () => {
      if (!isEditing || !slug) return;

      setLoading(true);
      try {
        const product = await productService.getProduct(slug);
        
        setFormData({
          name: product.name,
          description: product.description,
          short_description: product.short_description || '',
          price: product.price.toString(),
          original_price: product.original_price?.toString() || '',
          stock_quantity: product.stock_quantity,
          category: product.category.id.toString(),
          condition: product.condition,
          brand: product.brand,
          model: product.model,
          weight: product.weight?.toString() || '',
          dimensions_length: product.dimensions_length?.toString() || '',
          dimensions_width: product.dimensions_width?.toString() || '',
          dimensions_height: product.dimensions_height?.toString() || '',
          materials: product.materials,
          tags: product.tags,
          is_featured: product.is_featured,
          is_digital: product.is_digital,
        });
        
        setSelectedColors(product.colors);
      } catch (err) {
        console.error('Failed to load product for editing:', err);
        setError(t('products.form.errors.load_product'));
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [isEditing, slug, t]);

  const handleAddColor = (color: string) => {
    if (color && !selectedColors.includes(color)) {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setSelectedColors(selectedColors.filter(color => color !== colorToRemove));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('short_description', formData.short_description);
      formDataToSend.append('price', formData.price);
      if (formData.original_price) {
        formDataToSend.append('original_price', formData.original_price);
      }
      formDataToSend.append('stock_quantity', formData.stock_quantity.toString());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('model', formData.model);
      if (formData.weight) formDataToSend.append('weight', formData.weight);
      if (formData.dimensions_length) formDataToSend.append('dimensions_length', formData.dimensions_length);
      if (formData.dimensions_width) formDataToSend.append('dimensions_width', formData.dimensions_width);
      if (formData.dimensions_height) formDataToSend.append('dimensions_height', formData.dimensions_height);
      formDataToSend.append('materials', formData.materials);
      formDataToSend.append('colors', JSON.stringify(selectedColors));
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('is_featured', formData.is_featured.toString());
      formDataToSend.append('is_digital', formData.is_digital.toString());

      // Add image files
      imageFiles.forEach((file) => {
        formDataToSend.append('uploaded_images', file);
      });

      if (isEditing && slug) {
        await productService.updateProduct(slug, formDataToSend);
      } else {
        await productService.createProduct(formDataToSend);
      }

      navigate('/my-products');
    } catch (err) {
      console.error('Failed to save product:', err);
      setError(t('products.form.errors.save_product'));
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.id.toString(),
    label: cat.name
  }));

  const colorOptions = availableColors
    .filter(c => !selectedColors.includes(c))
    .map(color => ({ value: color, label: color }));

  if (loading && isEditing) {
    return (
      <Layout>
        <div className="product-form-page">
          <div className="loading-message">
            <p>{t('products.form.loading_product')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="product-form-page">
        <div className="page-header">
          <h2>{isEditing ? t('products.edit_product_title') : t('products.create_product_title')}</h2>
          
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="product-form">
          {/* Images */}
          <div className="form-group">
            <label htmlFor="productImages">{t('products.form.images_label')}</label>
            <p className="form-hint">{t('products.form.images_hint')}</p>
            <ImageUpload files={imageFiles} setFiles={setImageFiles} />
          </div>

          {/* Basic Info */}
          <div className="form-section">
            <h3>{t('products.form.basic_info_title')}</h3>
            
            <div className="form-group">
              <label htmlFor="name">{t('products.form.name_label')} *</label>
              <input 
                type="text" 
                id="name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label htmlFor="short_description">{t('products.form.short_description_label')}</label>
              <input 
                type="text" 
                id="short_description" 
                value={formData.short_description} 
                onChange={e => setFormData({...formData, short_description: e.target.value})} 
                maxLength={300}
                placeholder={t('products.form.short_description_placeholder')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">{t('products.form.full_description_label')} *</label>
              <textarea 
                id="description" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                required
                rows={5}
                placeholder={t('products.form.full_description_placeholder')}
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="form-section">
            <h3>{t('products.form.pricing_inventory_title')}</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">{t('products.form.price_label')} *</label>
                <input 
                  type="number" 
                  id="price" 
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})} 
                  required 
                  min="0.01"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label htmlFor="original_price">{t('products.form.original_price_label')}</label>
                <input 
                  type="number" 
                  id="original_price" 
                  value={formData.original_price} 
                  onChange={e => setFormData({...formData, original_price: e.target.value})} 
                  min="0.01"
                  step="0.01"
                  placeholder={t('products.form.original_price_placeholder')}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="stock_quantity">{t('products.form.stock_quantity_label')} *</label>
                <input 
                  type="number" 
                  id="stock_quantity" 
                  value={formData.stock_quantity} 
                  onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value) || 0})} 
                  required 
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="condition">{t('products.form.condition_label')} *</label>
                <Select
                  value={formData.condition}
                  onChange={value => setFormData({...formData, condition: value})}
                  options={conditionOptions}
                  placeholder={t('products.form.condition_placeholder')}
                />
              </div>
            </div>
          </div>

          {/* Category & Details */}
          <div className="form-section">
            <h3>{t('products.form.category_details_title')}</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">{t('products.form.category_label')} *</label>
                <Select
                  value={formData.category}
                  onChange={value => setFormData({...formData, category: value})}
                  options={categoryOptions}
                  placeholder={t('products.form.category_placeholder')}
                />
              </div>
              <div className="form-group">
                <label htmlFor="brand">{t('products.form.brand_label')}</label>
                <input 
                  type="text" 
                  id="brand" 
                  value={formData.brand} 
                  onChange={e => setFormData({...formData, brand: e.target.value})} 
                  placeholder={t('products.form.brand_placeholder')}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="model">{t('products.form.model_label')}</label>
                <input 
                  type="text" 
                  id="model" 
                  value={formData.model} 
                  onChange={e => setFormData({...formData, model: e.target.value})} 
                  placeholder={t('products.form.model_placeholder')}
                />
              </div>
              <div className="form-group">
                <label htmlFor="materials">{t('products.form.materials_label')}</label>
                <input 
                  type="text" 
                  id="materials" 
                  value={formData.materials} 
                  onChange={e => setFormData({...formData, materials: e.target.value})} 
                  placeholder={t('products.form.materials_placeholder')}
                />
              </div>
            </div>
          </div>

          {/* Physical Properties */}
          <div className="form-section">
            <h3>{t('products.form.physical_properties_title')}</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="weight">{t('products.form.weight_label')}</label>
                <input 
                  type="number" 
                  id="weight" 
                  value={formData.weight} 
                  onChange={e => setFormData({...formData, weight: e.target.value})} 
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label htmlFor="dimensions_length">{t('products.form.length_label')}</label>
                <input 
                  type="number" 
                  id="dimensions_length" 
                  value={formData.dimensions_length} 
                  onChange={e => setFormData({...formData, dimensions_length: e.target.value})} 
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dimensions_width">{t('products.form.width_label')}</label>
                <input 
                  type="number" 
                  id="dimensions_width" 
                  value={formData.dimensions_width} 
                  onChange={e => setFormData({...formData, dimensions_width: e.target.value})} 
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label htmlFor="dimensions_height">{t('products.form.height_label')}</label>
                <input 
                  type="number" 
                  id="dimensions_height" 
                  value={formData.dimensions_height} 
                  onChange={e => setFormData({...formData, dimensions_height: e.target.value})} 
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="form-section">
            <h3>{t('products.form.colors_title')}</h3>
            <div className="form-group">
              <Select
                value=""
                onChange={handleAddColor}
                options={colorOptions}
                placeholder={t('products.form.add_color_placeholder')}
              />
              <div className="selected-items">
                {selectedColors.map(color => (
                  <div key={color} className="selected-item">
                    <span 
                      className="color-indicator" 
                      style={{ backgroundColor: color.toLowerCase() }}
                    />
                    {color}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveColor(color)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="form-section">
            <h3>{t('products.form.tags_title')}</h3>
            <div className="form-group">
              <div className="tag-input-container">
                <input 
                  type="text" 
                  value={tagInput} 
                  onChange={e => setTagInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder={t('products.form.tags_placeholder')}
                />
                <button type="button" onClick={handleAddTag}>{t('products.form.add_tag_button')}</button>
              </div>
              <div className="selected-items">
                {formData.tags.map(tag => (
                  <div key={tag} className="selected-item">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tag)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="form-section">
            <h3>{t('products.form.options_title')}</h3>
            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={formData.is_featured} 
                  onChange={e => setFormData({...formData, is_featured: e.target.checked})} 
                />
                {t('products.form.featured_label')}
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={formData.is_digital} 
                  onChange={e => setFormData({...formData, is_digital: e.target.checked})} 
                />
                {t('products.form.digital_label')}
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/my-products')} 
              className="btn btn-secondary"
            >
              {t('products.form.cancel_button')}
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? t('products.form.saving_button') : (isEditing ? t('products.form.update_button') : t('products.form.create_button'))}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ProductForm;