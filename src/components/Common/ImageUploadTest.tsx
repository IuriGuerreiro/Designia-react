import React, { useState } from 'react';
import ImageUpload from './ImageUpload';

/**
 * Test component to verify ImageUpload functionality
 * This can be temporarily added to any route to test image upload
 */
const ImageUploadTest: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Selected files:', files);
    
    // Log file details for debugging
    files.forEach((file, index) => {
      console.log(`File ${index + 1}:`, {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      });
    });
  };

  const clearFiles = () => {
    setFiles([]);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Image Upload Test</h2>
      <p>This component tests the fixed ImageUpload functionality with blob URL support.</p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Upload Images:</label>
          <ImageUpload files={files} setFiles={setFiles} />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" disabled={files.length === 0}>
            Log Files ({files.length})
          </button>
          <button type="button" onClick={clearFiles} disabled={files.length === 0}>
            Clear All
          </button>
        </div>
      </form>

      {files.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Selected Files:</h3>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                <strong>{file.name}</strong> - {(file.size / 1024).toFixed(1)}KB - {file.type}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageUploadTest;