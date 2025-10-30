import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/app/layout';
import ImageUpload from '@/shared/ui/image-upload/ImageUpload';
import Select from '@/shared/ui/select/Select';
import { useTranslation } from 'react-i18next';
import { categoryService, productService } from '@/features/marketplace/api';
import { type Category } from '@/features/marketplace/model';
import { processImagesForUpload, type ImageInfo } from '@/utils/imageUtils';
import {
  FormContainer,
  FormSection,
  FormGrid,
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
  InputGroup,
  Checkbox,
  HelpText,
  FormActions,
  Button,
  Loading,
  type FormTranslations
} from '@/shared/ui/forms';

const ProductForm: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isEditing = Boolean(slug);
  
  // Form translations
  const formTranslations: FormTranslations = {
    selectOption: t('forms.select_option'),
    requiredField: t('forms.required_field'),
    optional: t('forms.optional'),
    loading: t('forms.loading'),
    save: t('forms.save'),
    cancel: t('forms.cancel'),
    submit: t('forms.submit'),
    edit: t('forms.edit'),
    delete: t('forms.delete'),
    confirm: t('forms.confirm'),
    back: t('forms.back'),
    next: t('forms.next'),
    previous: t('forms.previous'),
    finish: t('forms.finish'),
    close: t('forms.close'),
    search: t('forms.search'),
    clear: t('forms.clear'),
    upload: t('forms.upload'),
    download: t('forms.download'),
    browse: t('forms.browse'),
    chooseFile: t('forms.choose_file'),
    dragDrop: t('forms.drag_drop'),
    processing: t('forms.processing'),
    success: t('forms.success'),
    error: t('forms.error'),
    warning: t('forms.warning'),
    info: t('forms.info')
  };
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
        setError(t('products.form.errors.load_product'));
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

        // Safely determine category id from various backend shapes
        const rawCategory: any = (product as any).category;
        const categoryId = rawCategory && typeof rawCategory === 'object'
          ? String(rawCategory.id ?? '')
          : rawCategory != null
            ? String(rawCategory)
            : '';

        setFormData({
          name: product.name,
          description: product.description,
          short_description: product.short_description || '',
          price: product.price?.toString?.() ?? String(product.price ?? ''),
          original_price: product.original_price != null ? String(product.original_price) : '',
          stock_quantity: Number(product.stock_quantity ?? 0),
          category: categoryId,
          condition: (product as any).condition ?? 'new',
          brand: (product as any).brand ?? '',
          model: (product as any).model ?? '',
          weight: product.weight != null ? String(product.weight) : '',
          dimensions_length: product.dimensions_length != null ? String(product.dimensions_length) : '',
          dimensions_width: product.dimensions_width != null ? String(product.dimensions_width) : '',
          dimensions_height: product.dimensions_height != null ? String(product.dimensions_height) : '',
          materials: (product as any).materials ?? '',
          tags: Array.isArray((product as any).tags) ? (product as any).tags : [],
          is_featured: Boolean((product as any).is_featured),
          is_digital: Boolean((product as any).is_digital),
        });

        setSelectedColors(Array.isArray((product as any).colors) ? (product as any).colors : []);
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
    setError(null);
    setFieldErrors({});

    // Client-side validation: original_price must be greater than price if provided
    const priceNum = parseFloat(formData.price);
    const originalNum = parseFloat(formData.original_price);
    if (
      formData.original_price &&
      !Number.isNaN(priceNum) &&
      !Number.isNaN(originalNum) &&
      originalNum <= priceNum
    ) {
      setFieldErrors(prev => ({
        ...prev,
        original_price: 'Original price must be higher than current price',
      }));
      return;
    }

    setLoading(true);
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
      // Try to surface field-level validation errors from backend (DRF style)
      const anyErr = err as any;
      const data = anyErr?.data as Record<string, unknown> | undefined;
      if (data && typeof data === 'object') {
        // Handle original_price validation message, e.g. ["Original price must be higher than current price"]
        const op = (data as any).original_price;
        if (op) {
          const message = Array.isArray(op) ? String(op[0]) : String(op);
          setFieldErrors(prev => ({ ...prev, original_price: message }));
          setError('Product creation validation errors');
        } else {
          setError(t('products.form.errors.save_product'));
        }
      } else {
        setError(t('products.form.errors.save_product'));
      }
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
        <div style={{ padding: 'var(--space-3xl, 64px)' }}>
          <Loading text={t('products.form.loading_product')} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ 
        maxWidth: '1200px', 
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
            {isEditing ? t('products.edit_product_title') : t('products.create_product_title')}
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: 'var(--color-text-secondary, #6B7280)', 
            margin: 0,
            lineHeight: 1.5
          }}>
            {isEditing 
              ? t('products.form.edit_product_description')
              : t('products.form.create_product_description')
            }
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

        {/* Main Form */}
        <FormContainer>
          <form onSubmit={handleSubmit}>
            {/* Images Section */}
            <FormSection 
              title={t('products.form.images_label')}
              description={t('products.form.images_hint')}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
              }
            >
              <FormGroup>
                <ImageUpload 
                  files={imageFiles} 
                  setFiles={setImageFiles}
                  maxFiles={10}
                  maxFileSize={10 * 1024 * 1024}
                  allowedExtensions={['jpg', 'jpeg', 'png', 'webp']}
                />
                {isProcessingImages && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md, 16px)',
                    padding: 'var(--space-md, 16px)',
                    background: 'var(--surface-subtle, rgba(241, 243, 244, 0.5))',
                    borderRadius: '12px',
                    marginTop: 'var(--space-md, 16px)',
                    color: 'var(--color-text-secondary, #6B7280)',
                    fontSize: '14px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid var(--color-border, #E5E7EB)',
                      borderTop: '2px solid var(--color-primary, #3B82F6)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>{t('products.form.processing_images')}</span>
                  </div>
                )}
              </FormGroup>
            </FormSection>

            {/* Basic Information */}
            <FormSection 
              title={t('products.form.basic_info_title')}
              description={t('products.form.basic_info_description')}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H8"/>
                  <path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z"/>
                </svg>
              }
            >
              <FormGrid>
                <FormGroup fullWidth>
                  <FormLabel required htmlFor="name">{t('products.form.name_label')}</FormLabel>
                  <FormInput 
                    id="name" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                    maxLength={200}
                    placeholder={t('products.form.name_label')}
                  />
                </FormGroup>

                <FormGroup fullWidth>
                  <FormLabel htmlFor="short_description">{t('products.form.short_description_label')}</FormLabel>
                  <FormInput 
                    id="short_description" 
                    value={formData.short_description} 
                    onChange={e => setFormData({...formData, short_description: e.target.value})} 
                    maxLength={300}
                    placeholder={t('products.form.short_description_placeholder')}
                  />
                </FormGroup>

                <FormGroup fullWidth>
                  <FormLabel required htmlFor="description">{t('products.form.full_description_label')}</FormLabel>
                  <FormTextarea 
                    id="description" 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    required
                    showCharacterCounter
                    maxLength={2000}
                    value={formData.description}
                    placeholder={t('products.form.full_description_placeholder')}
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Pricing & Inventory */}
            <FormSection 
              title={t('products.form.pricing_inventory_title')}
              description={t('products.form.pricing_inventory_description')}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5A3.5 3.5 0 0 0 6 8.5V11A3.5 3.5 0 0 0 9.5 14.5H17"/>
                  <path d="M17 19H9.5A3.5 3.5 0 0 0 6 22.5V25A3.5 3.5 0 0 0 9.5 28.5H17"/>
                </svg>
              }
            >
              <FormGrid>
                <FormGroup error={fieldErrors.original_price}>
                  <FormLabel required htmlFor="price">{t('products.form.price_label')}</FormLabel>
                  <InputGroup prefix="$">
                    <FormInput 
                      type="number" 
                      id="price" 
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})} 
                      required 
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </InputGroup>
                </FormGroup>

                <FormGroup error={fieldErrors.original_price}>
                  <FormLabel htmlFor="original_price">{t('products.form.original_price_label')}</FormLabel>
                  <InputGroup prefix="$">
                    <FormInput 
                      type="number" 
                      id="original_price" 
                      value={formData.original_price} 
                      onChange={e => setFormData({...formData, original_price: e.target.value})} 
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </InputGroup>
                </FormGroup>

                <FormGroup>
                  <FormLabel required htmlFor="stock_quantity">{t('products.form.stock_quantity_label')}</FormLabel>
                  <FormInput 
                    type="number" 
                    id="stock_quantity" 
                    value={formData.stock_quantity} 
                    onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value) || 0})} 
                    required 
                    min="0"
                    placeholder="0"
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel required htmlFor="condition">{t('products.form.condition_label')}</FormLabel>
                  <FormSelect
                    id="condition"
                    value={formData.condition}
                    onChange={value => setFormData({...formData, condition: value})}
                    options={conditionOptions}
                    placeholder={t('products.form.condition_placeholder')}
                    translations={formTranslations}
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Category & Details */}
            <FormSection 
              title={t('products.form.category_details_title')}
              description={t('products.form.category_details_description')}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3H21V7H3V3Z"/>
                  <path d="M3 11H21V15H3V11Z"/>
                  <path d="M3 19H21V23H3V19Z"/>
                </svg>
              }
            >
              <FormGrid>
                <FormGroup>
                  <FormLabel required htmlFor="category">{t('products.form.category_label')}</FormLabel>
                  <FormSelect
                    id="category"
                    value={formData.category}
                    onChange={value => setFormData({...formData, category: value})}
                    options={categoryOptions}
                    placeholder={t('products.form.category_placeholder')}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="brand">{t('products.form.brand_label')}</FormLabel>
                  <FormInput 
                    id="brand" 
                    value={formData.brand} 
                    onChange={e => setFormData({...formData, brand: e.target.value})} 
                    placeholder={t('products.form.brand_placeholder')}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="model">{t('products.form.model_label')}</FormLabel>
                  <FormInput 
                    id="model" 
                    value={formData.model} 
                    onChange={e => setFormData({...formData, model: e.target.value})} 
                    placeholder={t('products.form.model_placeholder')}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="materials">{t('products.form.materials_label')}</FormLabel>
                  <FormInput 
                    id="materials" 
                    value={formData.materials} 
                    onChange={e => setFormData({...formData, materials: e.target.value})} 
                    placeholder={t('products.form.materials_placeholder')}
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Physical Properties */}
            <FormSection 
              title={t('products.form.physical_properties_title')}
              description={t('products.form.physical_properties_description')}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8A2 2 0 0 0 19 6H5A2 2 0 0 0 3 8V16A2 2 0 0 0 5 18H19A2 2 0 0 0 21 16Z"/>
                  <path d="M7 2V22"/>
                  <path d="M17 2V22"/>
                </svg>
              }
            >
              <FormGrid>
                <FormGroup>
                  <FormLabel htmlFor="weight">{t('products.form.weight_label')}</FormLabel>
                  <FormInput 
                    type="number" 
                    id="weight" 
                    value={formData.weight} 
                    onChange={e => setFormData({...formData, weight: e.target.value})} 
                    min="0"
                    step="0.1"
                    placeholder="0.0"
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="dimensions_length">Length (cm)</FormLabel>
                  <FormInput 
                    type="number" 
                    id="dimensions_length" 
                    value={formData.dimensions_length} 
                    onChange={e => setFormData({...formData, dimensions_length: e.target.value})} 
                    min="0"
                    step="0.1"
                    placeholder="0.0"
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="dimensions_width">Width (cm)</FormLabel>
                  <FormInput 
                    type="number" 
                    id="dimensions_width" 
                    value={formData.dimensions_width} 
                    onChange={e => setFormData({...formData, dimensions_width: e.target.value})} 
                    min="0"
                    step="0.1"
                    placeholder="0.0"
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="dimensions_height">Height (cm)</FormLabel>
                  <FormInput 
                    type="number" 
                    id="dimensions_height" 
                    value={formData.dimensions_height} 
                    onChange={e => setFormData({...formData, dimensions_height: e.target.value})} 
                    min="0"
                    step="0.1"
                    placeholder="0.0"
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Colors */}
            <FormSection 
              title="Available Colors"
              description="Select the colors available for this product"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="13.5" cy="6.5" r="1.5"/>
                  <circle cx="17.5" cy="10.5" r="1.5"/>
                  <circle cx="8.5" cy="7.5" r="1.5"/>
                  <circle cx="6.5" cy="12.5" r="1.5"/>
                  <path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2Z"/>
                </svg>
              }
            >
              <FormGroup>
                <FormSelect
                  value=""
                  onChange={handleAddColor}
                  options={colorOptions}
                  placeholder="Add a color"
                />
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 'var(--space-sm, 8px)', 
                  marginTop: 'var(--space-md, 16px)' 
                }}>
                  {selectedColors.map(color => (
                    <div key={color} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-sm, 8px)',
                      padding: 'var(--space-sm, 8px) var(--space-md, 16px)',
                      background: 'var(--surface-subtle, rgba(241, 243, 244, 0.5))',
                      borderRadius: '20px',
                      fontSize: '14px',
                      color: 'var(--color-text-primary, #1A1A1A)',
                      fontWeight: 500,
                      transition: 'all 0.3s ease'
                    }}>
                      <span 
                        style={{ 
                          width: '16px', 
                          height: '16px', 
                          borderRadius: '50%', 
                          border: '2px solid var(--color-surface, #FFFFFF)', 
                          boxShadow: '0 2px 4px rgba(0,0,0,.1)',
                          backgroundColor: color.toLowerCase() 
                        }} 
                      />
                      <span>{color}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveColor(color)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-text-secondary, #6B7280)',
                          cursor: 'pointer',
                          padding: '2px',
                          borderRadius: '50%',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--color-error, #EF4444)';
                          e.currentTarget.style.color = 'var(--color-surface, #FFFFFF)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'none';
                          e.currentTarget.style.color = 'var(--color-text-secondary, #6B7280)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </FormGroup>
            </FormSection>

            {/* Tags */}
            <FormSection 
              title={t('products.form.tags_title')}
              description={t('products.form.tags_description')}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2682 21.1666 12.005 21.1666C11.7418 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9625 21.1666 11.4645 21.1666 12C21.1666 12.5355 20.9625 13.0375 20.59 13.41Z"/>
                </svg>
              }
            >
              <FormGroup>
                <div style={{ 
                  display: 'flex', 
                  gap: 'var(--space-sm, 8px)', 
                  marginBottom: 'var(--space-md, 16px)' 
                }}>
                  <FormInput 
                    value={tagInput} 
                    onChange={e => setTagInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder={t('products.form.tags_placeholder')}
                    style={{ flex: 1 }}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddTag}
                    style={{ minWidth: '48px', padding: '12px' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </Button>
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 'var(--space-sm, 8px)' 
                }}>
                  {formData.tags.map(tag => (
                    <div key={tag} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-sm, 8px)',
                      padding: 'var(--space-sm, 8px) var(--space-md, 16px)',
                      background: 'var(--surface-subtle, rgba(241, 243, 244, 0.5))',
                      borderRadius: '20px',
                      fontSize: '14px',
                      color: 'var(--color-text-primary, #1A1A1A)',
                      fontWeight: 500,
                      transition: 'all 0.3s ease'
                    }}>
                      <span>{tag}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-text-secondary, #6B7280)',
                          cursor: 'pointer',
                          padding: '2px',
                          borderRadius: '50%',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--color-error, #EF4444)';
                          e.currentTarget.style.color = 'var(--color-surface, #FFFFFF)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'none';
                          e.currentTarget.style.color = 'var(--color-text-secondary, #6B7280)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </FormGroup>
            </FormSection>

            {/* Options */}
            <FormSection 
              title={t('products.form.options_title')}
              description={t('products.form.options_description')}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15A1.65 1.65 0 0 0 18 14.5C18 13.5 19 12 19 12C19 12 18 10.5 18 9.5A1.65 1.65 0 0 0 16.6 9C16.6 9 16 9.5 16 10.5C16 11.5 16.6 12 16.6 12C16.6 12 16 12.5 16 13.5C16 14.5 16.6 15 16.6 15"/>
                  <path d="M7.4 15A1.65 1.65 0 0 1 9 14.5C9 13.5 8 12 8 12C8 12 9 10.5 9 9.5A1.65 1.65 0 0 1 10.4 9C10.4 9 11 9.5 11 10.5C11 11.5 10.4 12 10.4 12C10.4 12 11 12.5 11 13.5C11 14.5 10.4 15 10.4 15"/>
                </svg>
              }
            >
              <FormGrid>
                <FormGroup>
                  <Checkbox
                    label={t('products.form.featured_label')}
                    checked={formData.is_featured}
                    onChange={(checked) => setFormData({...formData, is_featured: checked})}
                  />
                </FormGroup>
                 
                <FormGroup>
                  <Checkbox
                    label={t('products.form.digital_label')}
                    checked={formData.is_digital}
                    onChange={(checked) => setFormData({...formData, is_digital: checked})}
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Form Actions */}
            <FormActions>
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => navigate('/my-products')}
              >
                {t('products.form.cancel_button')}
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                loading={loading}
                disabled={loading}
              >
                {isEditing ? 'Update Product' : 'Create Product'}
              </Button>
            </FormActions>
          </form>
        </FormContainer>
      </div>
    </Layout>
  );
};

export default ProductForm;