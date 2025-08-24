import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../Layout/Layout';
import ImageUpload from '../../Common/ImageUpload';
import Select from '../../Common/Select';
import { useTranslation } from 'react-i18next';
import { productService, categoryService } from '../../../services';
import { type Category } from '../../../types/marketplace';
import { processImagesForUpload, type ImageInfo } from '../../../utils/imageUtils';

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
  const [isProcessingImages, setIsProcessingImages] = useState(false);


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
    setIsProcessingImages(true);

    try {
      // Process and encode images before sending
      let processedImages: ImageInfo[] = [];
      if (imageFiles.length > 0) {
        console.log('=== IMAGE PROCESSING START ===');
        console.log(`Starting to process ${imageFiles.length} image files:`);
        imageFiles.forEach((file, index) => {
          console.log(`  Original File ${index + 1}:`, {
            name: file.name,
            size: `${(file.size / 1024).toFixed(2)} KB`,
            type: file.type,
            lastModified: file.lastModified,
            isValidFile: file instanceof File
          });
        });
        
        try {
          processedImages = await processImagesForUpload(imageFiles, {
            maxSizeBytes: 10 * 1024 * 1024, // 10MB
            targetQuality: 0.8,
            maxWidth: 2048,
            maxHeight: 2048
          });
          
          console.log(`✅ Successfully processed ${processedImages.length} images:`);
          processedImages.forEach((imageInfo, index) => {
            console.log(`  Processed Image ${index + 1}:`, {
              originalName: imageInfo.originalFile.name,
              originalSize: `${(imageInfo.originalSize / 1024).toFixed(2)} KB`,
              encodedSize: `${(imageInfo.encodedSize / 1024).toFixed(2)} KB`,
              encoding: imageInfo.encoding,
              quality: imageInfo.quality,
              compressionRatio: imageInfo.compressionRatio.toFixed(2),
              encodedFileType: imageInfo.encodedFile.constructor.name,
              encodedFileSize: imageInfo.encodedFile.size,
              encodedFileIsBlob: imageInfo.encodedFile instanceof Blob
            });
          });
          console.log('=== IMAGE PROCESSING COMPLETE ===');
        } catch (imageError) {
          console.error('=== IMAGE PROCESSING FAILED ===');
          console.error('Image processing error:', imageError);
          setError(`Image processing failed: ${imageError instanceof Error ? imageError.message : String(imageError)}`);
          return;
        }
      }
      
      setIsProcessingImages(false);

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

      // Add processed image files with encoding metadata
      console.log('=== FILE CONVERSION START ===');
      processedImages.forEach((imageInfo, index) => {
        console.log(`Converting processed image ${index + 1} to File object:`);
        console.log(`  Source Blob:`, {
          size: imageInfo.encodedFile.size,
          type: imageInfo.encodedFile.type,
          constructor: imageInfo.encodedFile.constructor.name
        });
        
        // Create File object from encoded blob
        const encodedFile = new File(
          [imageInfo.encodedFile], 
          imageInfo.originalFile.name,
          { 
            type: `image/${imageInfo.encoding}`,
            lastModified: Date.now()
          }
        );
        
        console.log(`  Created File:`, {
          name: encodedFile.name,
          size: encodedFile.size,
          type: encodedFile.type,
          lastModified: encodedFile.lastModified,
          constructor: encodedFile.constructor.name,
          isFile: encodedFile instanceof File,
          isBlob: encodedFile instanceof Blob
        });
        
        // Verify the File is valid before appending
        if (encodedFile.size === 0) {
          console.error(`🚨 ERROR: Created File has 0 bytes! Original blob size: ${imageInfo.encodedFile.size}`);
        } else {
          console.log(`✅ File conversion successful for ${encodedFile.name}`);
        }
        
        formDataToSend.append('uploaded_images', encodedFile);
        
        // Add encoding metadata for backend validation
        formDataToSend.append(`image_${index}_encoding`, imageInfo.encoding);
        formDataToSend.append(`image_${index}_quality`, imageInfo.quality.toString());
        formDataToSend.append(`image_${index}_original_size`, imageInfo.originalSize.toString());
        formDataToSend.append(`image_${index}_encoded_size`, imageInfo.encodedSize.toString());
        formDataToSend.append(`image_${index}_compression_ratio`, imageInfo.compressionRatio.toString());
      });

      // Debug: Log FormData contents before sending
      console.log('=== FRONTEND FORMDATA DEBUG ===');
      console.log('FormData entries:');
      
      for (const [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, {
            name: value.name,
            size: value.size,
            type: value.type,
            lastModified: value.lastModified,
            isFile: true
          });
        } else {
          console.log(`${key}:`, value);
        }
      }
      
      // Count files specifically
      const fileEntries = Array.from(formDataToSend.entries()).filter(([key, value]) => value instanceof File);
      console.log(`Total files in FormData: ${fileEntries.length}`);
      
      if (fileEntries.length > 0) {
        console.log('File details:');
        fileEntries.forEach(([key, file], index) => {
          console.log(`  File ${index + 1} (${key}):`, {
            name: file.name,
            size: `${(file.size / 1024).toFixed(2)} KB`,
            type: file.type,
            blob: file instanceof File ? 'File object' : 'Other'
          });
        });
      } else {
        console.warn('No files found in FormData - this may explain the S3 upload issue');
      }
      
      console.log('=== END FORMDATA DEBUG ===');

      // ENHANCED DEBUG: Log the actual request that will be sent
      console.log('=== REQUEST BODY DEBUG ===');
      
      // Create a detailed inspection of what's being sent
      const requestInspection = {
        contentType: 'multipart/form-data (browser will set boundary)',
        formDataSize: Array.from(formDataToSend.entries()).length,
        hasFiles: Array.from(formDataToSend.entries()).some(([key, value]) => value instanceof File),
        totalFiles: Array.from(formDataToSend.entries()).filter(([key, value]) => value instanceof File).length,
        nonFileFields: Array.from(formDataToSend.entries()).filter(([key, value]) => !(value instanceof File)).length,
        estimatedTotalSize: Array.from(formDataToSend.entries())
          .reduce((size, [key, value]) => {
            if (value instanceof File) {
              return size + value.size;
            } else if (typeof value === 'string') {
              return size + new Blob([value]).size;
            }
            return size;
          }, 0)
      };
      
      console.log('Request inspection:', requestInspection);
      
      // Log all form fields being sent
      console.log('All FormData fields being sent to backend:');
      for (const [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`📎 FILE FIELD: ${key} = File {
            name: "${value.name}",
            size: ${value.size} bytes (${(value.size / 1024).toFixed(2)} KB),
            type: "${value.type}",
            lastModified: ${value.lastModified},
            constructor: ${value.constructor.name}
          }`);
          
          // Additional file validation
          if (value.size === 0) {
            console.warn(`⚠️ WARNING: File ${value.name} has 0 bytes - this may cause S3 upload issues`);
          }
          if (!value.type || value.type === '') {
            console.warn(`⚠️ WARNING: File ${value.name} has no MIME type - this may cause backend issues`);
          }
        } else {
          const valueStr = typeof value === 'string' ? value : String(value);
          console.log(`📝 TEXT FIELD: ${key} = "${valueStr}" (${valueStr.length} chars)`);
        }
      }
      
      // Verify the FormData is properly constructed for multipart upload
      if (requestInspection.totalFiles === 0) {
        console.error('🚨 CRITICAL ERROR: No files found in FormData - S3 upload will definitely fail');
        console.error('This indicates an issue with image processing or FormData construction');
      } else {
        console.log(`✅ FormData contains ${requestInspection.totalFiles} files - ready for S3 upload`);
      }
      
      console.log('=== END REQUEST BODY DEBUG ===');

      // FINAL DIAGNOSTIC: Verify FormData integrity just before sending
      console.log('=== FINAL FORMDATA DIAGNOSTIC ===');
      const finalDiagnostic = {
        timestamp: new Date().toISOString(),
        totalEntries: Array.from(formDataToSend.entries()).length,
        fileEntries: Array.from(formDataToSend.entries()).filter(([k, v]) => v instanceof File).length,
        textEntries: Array.from(formDataToSend.entries()).filter(([k, v]) => !(v instanceof File)).length,
        hasUploadedImages: formDataToSend.has('uploaded_images'),
        uploadedImagesCount: formDataToSend.getAll('uploaded_images').length
      };
      
      console.log('Final diagnostic before API call:', finalDiagnostic);
      
      // Test FormData completeness
      if (finalDiagnostic.fileEntries === 0 && imageFiles.length > 0) {
        console.error('🚨 CRITICAL: ImageFiles were provided but no File objects found in FormData!');
        console.error('This suggests image processing or File conversion failed');
      } else if (finalDiagnostic.fileEntries > 0) {
        console.log(`✅ FormData ready: ${finalDiagnostic.fileEntries} files will be sent to backend`);
      }
      
      console.log('=== SENDING REQUEST TO BACKEND ===');

      if (isEditing && slug) {
        console.log(`🔄 Sending UPDATE request to backend for product: ${slug}`);
        await productService.updateProduct(slug, formDataToSend);
      } else {
        console.log('🔄 Sending CREATE request to backend for new product');
        await productService.createProduct(formDataToSend);
      }

      navigate('/my-products');
    } catch (err) {
      console.error('Failed to save product:', err);
      setError(t('products.form.errors.save_product'));
    } finally {
      setLoading(false);
      setIsProcessingImages(false);
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
            <ImageUpload 
              files={imageFiles} 
              setFiles={setImageFiles}
              maxFiles={10}
              maxFileSize={10 * 1024 * 1024}
              allowedExtensions={['jpg', 'jpeg', 'png', 'webp']}
            />
            {isProcessingImages && (
              <div className="processing-images">
                <p>🔄 Processing images for upload...</p>
              </div>
            )}
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