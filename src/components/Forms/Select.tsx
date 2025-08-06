import React, { useState } from 'react';
import './Select.css';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="custom-select-container">
      <div className="custom-select" onClick={() => setIsOpen(!isOpen)}>
        <div className="custom-select-value">{selectedOption ? selectedOption.label : placeholder}</div>
        <div className={`custom-select-arrow ${isOpen ? 'open' : ''}`}>▼</div>
      </div>
      {isOpen && (
        <div className="custom-select-options">
          {options.map(option => (
            <div
              key={option.value}
              className="custom-select-option"
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
