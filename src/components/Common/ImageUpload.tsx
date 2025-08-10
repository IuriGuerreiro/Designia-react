import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './ImageUpload.css';

interface ImageUploadProps {
  files: File[];
  setFiles: (files: File[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ files, setFiles }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles([...files, ...acceptedFiles]);
  }, [files, setFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  const previews = files.map((file, index) => (
    <div className="thumbnail" key={index}>
      <img src={URL.createObjectURL(file)} alt={file.name} />
      <button type="button" className="remove-btn" onClick={() => removeFile(file)}>×</button>
    </div>
  ));

  return (
    <div className="image-upload-container">
      <div {...getRootProps({ className: `dropzone ${isDragActive ? 'active' : ''}` })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
      <aside className="thumbnails-container">{previews}</aside>
    </div>
  );
};

export default ImageUpload;
