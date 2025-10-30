import React from 'react';
import {
  FormContainer,
  FormSection,
  FormGrid,
  FormGroup,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
  Button,
  FormActions
} from '@/shared/ui/forms';

const TestForms: React.FC = () => {
  return (
    <div style={{ padding: '2rem', background: 'var(--color-background)', minHeight: '100vh' }}>
      <FormContainer>
        <FormSection
          title="Test Form Section"
          description="This is a test to verify the form styling matches the website theme"
          icon="📝"
        >
          <FormGrid>
            <FormGroup>
              <FormLabel required>Product Name</FormLabel>
              <FormInput placeholder="Enter product name" />
            </FormGroup>
            
            <FormGroup>
              <FormLabel>Category</FormLabel>
              <FormSelect>
                <option value="">Select category</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
              </FormSelect>
            </FormGroup>
            
            <FormGroup fullWidth>
              <FormLabel>Description</FormLabel>
              <FormTextarea placeholder="Enter product description" rows={4} />
            </FormGroup>
          </FormGrid>
          
          <FormActions>
            <Button variant="secondary">Cancel</Button>
            <Button variant="primary">Save Product</Button>
          </FormActions>
        </FormSection>
      </FormContainer>
    </div>
  );
};

export default TestForms;