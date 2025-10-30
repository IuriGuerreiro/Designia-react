import React from 'react';
import styles from './Form.module.css';

// Translation interface for form components
export interface FormTranslations {
  selectOption?: string;
  requiredField?: string;
  optional?: string;
  loading?: string;
  save?: string;
  cancel?: string;
  submit?: string;
  edit?: string;
  delete?: string;
  confirm?: string;
  back?: string;
  next?: string;
  previous?: string;
  finish?: string;
  close?: string;
  search?: string;
  clear?: string;
  upload?: string;
  download?: string;
  browse?: string;
  chooseFile?: string;
  dragDrop?: string;
  processing?: string;
  success?: string;
  error?: string;
  warning?: string;
  info?: string;
}

// Default translations (fallback)
const defaultTranslations: FormTranslations = {
  selectOption: 'Select an option',
  requiredField: 'Required field',
  optional: 'Optional',
  loading: 'Loading...',
  save: 'Save',
  cancel: 'Cancel',
  submit: 'Submit',
  edit: 'Edit',
  delete: 'Delete',
  confirm: 'Confirm',
  back: 'Back',
  next: 'Next',
  previous: 'Previous',
  finish: 'Finish',
  close: 'Close',
  search: 'Search',
  clear: 'Clear',
  upload: 'Upload',
  download: 'Download',
  browse: 'Browse',
  chooseFile: 'Choose File',
  dragDrop: 'Drag and drop files here',
  processing: 'Processing...',
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Information'
};

// Form Container Component
export interface FormContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const FormContainer: React.FC<FormContainerProps> = ({ children, className }) => {
  return (
    <div className={`${styles.formContainer} ${className || ''}`}>
      {children}
    </div>
  );
};

// Form Section Component
export interface FormSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({ 
  children, 
  title, 
  description, 
  icon,
  className 
}) => {
  return (
    <div className={`${styles.formSection} ${className || ''}`}>
      {(title || description || icon) && (
        <div className={styles.sectionHeader}>
          {icon && <div className={styles.sectionIcon}>{icon}</div>}
          {(title || description) && (
            <div className={styles.sectionContent}>
              {title && <h3 className={styles.sectionTitle}>{title}</h3>}
              {description && <p className={styles.sectionDescription}>{description}</p>}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

// Form Grid Component
export interface FormGridProps {
  children: React.ReactNode;
  className?: string;
}

export const FormGrid: React.FC<FormGridProps> = ({ children, className }) => {
  return (
    <div className={`${styles.formGrid} ${className || ''}`}>
      {children}
    </div>
  );
};

// Form Group Component
export interface FormGroupProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  error?: string;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({ 
  children, 
  fullWidth, 
  error,
  className 
}) => {
  return (
    <div className={`
      ${styles.formGroup} 
      ${fullWidth ? styles.fullWidth : ''} 
      ${error ? styles.error : ''} 
      ${className || ''}
    `}>
      {children}
      {error && (
        <div className={styles.errorMessage}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

// Form Label Component
export interface FormLabelProps {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}

export const FormLabel: React.FC<FormLabelProps> = ({ 
  children, 
  required, 
  htmlFor,
  className 
}) => {
  return (
    <label 
      htmlFor={htmlFor} 
      className={`
        ${styles.formLabel} 
        ${required ? styles.required : ''} 
        ${className || ''}
      `}
    >
      {children}
    </label>
  );
};

// Form Input Component
export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const FormInput: React.FC<FormInputProps> = ({ 
  error, 
  icon,
  className,
  ...props 
}) => {
  if (icon) {
    return (
      <div className={styles.inputWithIcon}>
        <span className={styles.inputIcon}>{icon}</span>
        <input 
          className={`${styles.formInput} ${error ? styles.error : ''} ${className || ''}`}
          {...props} 
        />
      </div>
    );
  }

  return (
    <input 
      className={`${styles.formInput} ${error ? styles.error : ''} ${className || ''}`}
      {...props} 
    />
  );
};

// Form Textarea Component
export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  showCharacterCounter?: boolean;
  maxLength?: number;
  value?: string;
  className?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({ 
  error,
  showCharacterCounter = false,
  maxLength,
  value = '',
  className,
  ...props 
}) => {
  const characterCount = value.length;
  const isNearLimit = maxLength && characterCount > maxLength * 0.9;
  const isAtLimit = maxLength && characterCount >= maxLength;

  return (
    <div>
      <textarea 
        className={`${styles.formTextarea} ${error ? styles.error : ''} ${className || ''}`}
        maxLength={maxLength}
        value={value}
        {...props} 
      />
      {showCharacterCounter && maxLength && (
        <div className={`
          ${styles.characterCounter} 
          ${isAtLimit ? styles.error : ''} 
          ${isNearLimit && !isAtLimit ? styles.warning : ''}
        `}>
          {characterCount}/{maxLength}
        </div>
      )}
    </div>
  );
};

// Form Select Component
export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options?: { value: string; label: string }[];
  className?: string;
  name?: string;
  translations?: FormTranslations;
}

export const FormSelect: React.FC<FormSelectProps> = ({ 
  error,
  options = [],
  children,
  className,
  translations = defaultTranslations,
  ...props 
}) => {
  return (
    <select 
      className={`${styles.formSelect} ${error ? styles.error : ''} ${className || ''}`}
      {...props}
    >
      {options.length > 0 ? (
        <>
          <option value="">{props.placeholder || translations.selectOption}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </>
      ) : (
        children
      )}
    </select>
  );
};

// Input Group Component
export interface InputGroupProps {
  children: React.ReactNode;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({ 
  children, 
  prefix, 
  suffix,
  className 
}) => {
  return (
    <div className={`${styles.inputGroup} ${className || ''}`}>
      {prefix && <span className={styles.inputPrefix}>{prefix}</span>}
      {children}
      {suffix && <span className={styles.inputSuffix}>{suffix}</span>}
    </div>
  );
};

// Checkbox Component
export interface CheckboxProps {
  label: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ 
  label, 
  checked = false, 
  onChange,
  disabled = false,
  className 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <label className={`${styles.checkboxLabel} ${disabled ? 'disabled' : ''} ${className || ''}`}>
      <input
        type="checkbox"
        className={styles.checkboxInput}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
      />
      <span className={styles.checkboxCustom}></span>
      <span>{label}</span>
    </label>
  );
};

// Radio Component
export interface RadioProps {
  label: React.ReactNode;
  name: string;
  value: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const Radio: React.FC<RadioProps> = ({ 
  label, 
  name, 
  value, 
  checked = false, 
  onChange,
  disabled = false,
  className 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <label className={`${styles.radioLabel} ${disabled ? 'disabled' : ''} ${className || ''}`}>
      <input
        type="radio"
        className={styles.radioInput}
        name={name}
        value={value}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
      />
      <span className={styles.radioCustom}></span>
      <span>{label}</span>
    </label>
  );
};

// Help Text Component
export interface HelpTextProps {
  children: React.ReactNode;
  className?: string;
}

export const HelpText: React.FC<HelpTextProps> = ({ children, className }) => {
  return (
    <div className={`${styles.helpText} ${className || ''}`}>
      {children}
    </div>
  );
};

// Form Actions Component
export interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({ children, className }) => {
  return (
    <div className={`${styles.formActions} ${className || ''}`}>
      {children}
    </div>
  );
};

// Button Component
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  loading = false,
  icon,
  children,
  disabled,
  className,
  ...props 
}) => {
  return (
    <button 
      className={`
        ${styles.button} 
        ${styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`]} 
        ${loading ? 'loading' : ''} 
        ${className || ''}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className={styles.buttonSpinner}></span>}
      {!loading && icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

// Loading Component
export interface LoadingProps {
  text?: string;
  className?: string;
  translations?: FormTranslations;
}

export const Loading: React.FC<LoadingProps> = ({ 
  text, 
  className,
  translations = defaultTranslations 
}) => {
  const loadingText = text || translations.loading || defaultTranslations.loading;
  
  return (
    <div className={`${styles.loadingContainer} ${className || ''}`}>
      <div className={styles.loadingSpinner}></div>
      <div className={styles.loadingText}>{loadingText}</div>
    </div>
  );
};

// Export all components
export {
  styles as formStyles,
};