import React, { useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Upload, X, Check } from 'lucide-react';
import ProgressTracker from './ProgressTracker';
import LoadingButton from './LoadingButton';

// TypeScript interfaces
interface FormData {
  service: string;
  targetAudience: string;
  industry: string;
  coreServices: string;
  logo: File | null;
  email: string;
  phone?: string;
  domain?: string;
}

interface Question {
  id: keyof FormData;
  title: string;
  placeholder?: string;
  type: 'text' | 'textarea' | 'select' | 'email' | 'tel' | 'file';
  required: boolean;
  options?: string[];
  validation?: (value: any) => string | null;
  maxLength?: number;
  minLength?: number;
}

// Validation functions
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

const validatePhone = (phone: string): string | null => {
  if (!phone) return null; // Optional field
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    return 'Please enter a valid phone number';
  }
  return null;
};

const validateDomain = (domain: string): string | null => {
  if (!domain) return null; // Optional field
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain)) {
    return 'Please enter a valid domain (e.g., yourdomain.com)';
  }
  return null;
};

const validateFile = (file: File | null): string | null => {
  if (!file) return null; // Optional field

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    return 'Please upload a PNG, JPG, or SVG file';
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return 'File size must be less than 5MB';
  }

  return null;
};

// Question configuration
const questions: Question[] = [
  {
    id: 'service',
    title: 'What service do you offer?',
    placeholder: 'e.g., Fractional CFO for startups',
    type: 'text',
    required: true,
    minLength: 10,
    maxLength: 200,
    validation: (value: string) => {
      if (value.length < 10) return 'Please provide at least 10 characters';
      if (value.length > 200) return 'Please keep it under 200 characters';
      return null;
    }
  },
  {
    id: 'targetAudience',
    title: 'Who do you mainly work with?',
    placeholder: 'e.g., healthcare clinics, SaaS founders, law firms',
    type: 'text',
    required: true,
    maxLength: 200
  },
  {
    id: 'industry',
    title: 'Which industry best describes your work?',
    type: 'select',
    required: true,
    options: [
      'Technology',
      'Healthcare',
      'Finance',
      'Consulting',
      'Legal',
      'Real Estate',
      'Marketing',
      'Other'
    ]
  },
  {
    id: 'coreServices',
    title: 'What are your core services?',
    placeholder: 'e.g., cash flow planning, fundraising support, board reporting',
    type: 'textarea',
    required: true,
    minLength: 20,
    maxLength: 500,
    validation: (value: string) => {
      if (value.length < 20) return 'Please provide at least 20 characters';
      if (value.length > 500) return 'Please keep it under 500 characters';
      return null;
    }
  },
  {
    id: 'logo',
    title: 'Do you have a logo you\'d like us to use?',
    type: 'file',
    required: false,
    validation: validateFile
  },
  {
    id: 'email',
    title: 'What email should new clients reach you at?',
    placeholder: 'your@email.com',
    type: 'email',
    required: true,
    validation: validateEmail
  },
  {
    id: 'phone',
    title: 'Do you want us to include a phone number?',
    placeholder: '+1 (555) 123-4567',
    type: 'tel',
    required: false,
    validation: validatePhone
  },
  {
    id: 'domain',
    title: 'Do you already have a domain?',
    placeholder: 'yourdomain.com',
    type: 'text',
    required: false,
    validation: validateDomain
  }
];

export default function GeneratorForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    service: '',
    targetAudience: '',
    industry: '',
    coreServices: '',
    logo: null,
    email: '',
    phone: '',
    domain: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const totalSteps = questions.length;

  // Handle input changes
  const handleInputChange = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    handleInputChange('logo', file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [handleInputChange]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const question = currentQuestion;
    const value = formData[question.id];

    // Check if required field is empty
    if (question.required && (!value || (typeof value === 'string' && !value.trim()))) {
      setErrors(prev => ({ ...prev, [question.id]: 'This field is required' }));
      return false;
    }

    // Run custom validation
    if (question.validation && value) {
      const error = question.validation(value);
      if (error) {
        setErrors(prev => ({ ...prev, [question.id]: error }));
        return false;
      }
    }

    return true;
  };

  // Navigate to next step
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (isLastStep) {
        handleSubmit();
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  // Navigate to previous step
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Generate unique client ID for this generation session
      const newClientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Here you would typically send the data to your API
      console.log('Form submitted:', formData);
      console.log('Generated client ID:', newClientId);

      // Simulate API call to initiate generation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Transition to progress tracking
      setClientId(newClientId);
      setIsGenerating(true);

    } catch (error) {
      console.error('Submission error:', error);
      alert('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Remove logo
  const removeLogo = () => {
    handleInputChange('logo', null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get current field value
  const getCurrentValue = () => {
    return formData[currentQuestion.id];
  };

  // Handle generation completion
  const handleGenerationComplete = (previewUrl: string) => {
    console.log('Generation completed!', previewUrl);
    // In a real app, you might redirect to the preview or show a success modal
  };

  // Handle generation error
  const handleGenerationError = (error: string) => {
    console.error('Generation failed:', error);
    // Allow user to go back to form or retry
    setIsGenerating(false);
    setClientId(null);
    setIsSubmitting(false);
  };

  // Handle retry - go back to form
  const handleRetry = () => {
    setIsGenerating(false);
    setClientId(null);
    setIsSubmitting(false);
  };

  // Show progress tracker if generation is in progress
  if (isGenerating && clientId) {
    return (
      <ProgressTracker
        clientId={clientId}
        onComplete={handleGenerationComplete}
        onError={handleGenerationError}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {currentQuestion.title}
        </h2>

        {/* Input Fields */}
        <div className="space-y-4">
          {currentQuestion.type === 'text' && (
            <input
              type="text"
              value={getCurrentValue() as string || ''}
              onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              maxLength={currentQuestion.maxLength}
            />
          )}

          {currentQuestion.type === 'textarea' && (
            <textarea
              value={getCurrentValue() as string || ''}
              onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
              placeholder={currentQuestion.placeholder}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              maxLength={currentQuestion.maxLength}
            />
          )}

          {currentQuestion.type === 'select' && (
            <select
              value={getCurrentValue() as string || ''}
              onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">Select an industry...</option>
              {currentQuestion.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}

          {currentQuestion.type === 'email' && (
            <input
              type="email"
              value={getCurrentValue() as string || ''}
              onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          )}

          {currentQuestion.type === 'tel' && (
            <input
              type="tel"
              value={getCurrentValue() as string || ''}
              onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          )}

          {currentQuestion.type === 'file' && (
            <div className="space-y-4">
              {/* File Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drop your logo here, or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, or SVG (max 5MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                />
              </div>

              {/* Logo Preview */}
              {logoPreview && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Logo Preview</span>
                    <button
                      onClick={removeLogo}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-w-full max-h-32 object-contain mx-auto"
                  />
                </div>
              )}

              {/* Skip Option */}
              <p className="text-sm text-gray-500 text-center">
                Skip for now, and we'll generate a simple style from your business name
              </p>
            </div>
          )}

          {/* Character Count */}
          {(currentQuestion.maxLength && currentQuestion.type !== 'file') && (
            <div className="text-right">
              <span className="text-xs text-gray-500">
                {(getCurrentValue() as string || '').length} / {currentQuestion.maxLength}
              </span>
            </div>
          )}

          {/* Domain Note */}
          {currentQuestion.id === 'domain' && (
            <p className="text-sm text-gray-500">
              If not provided, we'll launch on a Webler subdomain
            </p>
          )}
        </div>

        {/* Error Message */}
        {errors[currentQuestion.id] && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors[currentQuestion.id]}</p>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            currentStep === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>

        <LoadingButton
          onClick={handleNext}
          loading={isSubmitting}
          loadingText="Generating..."
          size="large"
          className="px-6 py-3"
        >
          {isLastStep ? (
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Generate Website
            </div>
          ) : (
            <div className="flex items-center">
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          )}
        </LoadingButton>
      </div>
    </div>
  );
}