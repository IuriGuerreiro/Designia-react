import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import GoogleOAuth from './GoogleOAuth';
import ErrorMessage from './ErrorMessage';
import './Auth.css';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async () => {
    setError('');
    if (Object.values(formData).some(field => field === '')) {
      setError('Please fill in all fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register({ ...registerData, password_confirm: confirmPassword });
      if (result.success) {
        navigate('/verify-email-pending', {
          state: { email: result.email || formData.email }
        });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>Create an Account</h2>
        <p>Join our community of design lovers.</p>
      </div>

      <div className="auth-form">
        {error && <ErrorMessage message={error} onClose={() => setError('')} />}
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input id="first_name" name="first_name" type="text" value={formData.first_name} onChange={handleChange} placeholder="John" disabled={isLoading} />
          </div>
          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input id="last_name" name="last_name" type="text" value={formData.last_name} onChange={handleChange} placeholder="Doe" disabled={isLoading} />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" type="text" value={formData.username} onChange={handleChange} placeholder="johndoe" disabled={isLoading} />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" disabled={isLoading} />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" disabled={isLoading} />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" disabled={isLoading} onKeyPress={(e) => e.key === 'Enter' && handleRegister()} />
        </div>

        <button type="button" className="auth-button" disabled={isLoading} onClick={handleRegister}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>

      <GoogleOAuth onError={setError} />

      <div className="auth-switch">
        <p>
          Already have an account?{' '}
          <button type="button" className="link-button" onClick={onSwitchToLogin}>
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
