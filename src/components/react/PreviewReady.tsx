import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  ExternalLink,
  Palette,
  FileText,
  Smartphone,
  Search,
  Mail,
  Zap,
  ArrowRight,
  Copy,
  Check,
  Star,
  MessageCircle,
  Twitter,
  Linkedin,
  Facebook
} from 'lucide-react';

// TypeScript interfaces
interface PreviewReadyProps {
  clientId: string;
  previewUrl: string;
  businessName: string;
  generatedAt: string;
}

interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface FeedbackData {
  rating: number;
  comment: string;
}

export default function PreviewReady({
  clientId,
  previewUrl,
  businessName,
  generatedAt
}: PreviewReadyProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>({ rating: 0, comment: '' });
  const [showCelebration, setShowCelebration] = useState(false);

  // Features that were included in the generated website
  const includedFeatures: FeatureItem[] = [
    {
      icon: Palette,
      title: 'Custom theme from your logo colors',
      description: 'Brand-consistent color palette extracted from your logo'
    },
    {
      icon: FileText,
      title: 'Professional copy tailored to your business',
      description: 'AI-generated content optimized for your target audience'
    },
    {
      icon: Smartphone,
      title: 'Optimized for all devices',
      description: 'Mobile-first responsive design that works perfectly everywhere'
    },
    {
      icon: Search,
      title: 'SEO-ready meta tags',
      description: 'Search engine optimized with proper titles and descriptions'
    },
    {
      icon: Mail,
      title: 'Contact form configured',
      description: 'Ready-to-use contact form with spam protection'
    },
    {
      icon: Zap,
      title: 'Fast, reliable hosting',
      description: 'Lightning-fast loading with global CDN and 99.9% uptime'
    }
  ];

  // Subscription benefits
  const subscriptionBenefits = [
    'Unlimited content and design updates',
    'Custom domain connection & SSL',
    'Priority support and consultation',
    'Marketing add-ons and integrations',
    'Analytics and performance tracking',
    'Backup and security monitoring'
  ];

  // Trigger celebration animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCelebration(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Copy URL to clipboard
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  // Handle feedback submission
  const handleFeedbackSubmit = () => {
    console.log('Feedback submitted:', feedback);
    // In real implementation, this would send to analytics/backend
    alert('Thank you for your feedback!');
  };

  // Social sharing
  const handleShare = (platform: string) => {
    const shareText = `Check out my new website created with Webler! ${previewUrl}`;
    const shareUrl = encodeURIComponent(previewUrl);
    const shareTextEncoded = encodeURIComponent(shareText);

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${shareTextEncoded}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
    };

    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* 1. Celebration Header */}
      <div className="text-center py-12 px-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-t-lg">
        <div
          className={`transition-all duration-1000 transform ${
            showCelebration ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Your Website is Ready!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your personalized website for <strong>{businessName}</strong> has been generated successfully
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Generated on {formatDate(generatedAt)}
          </p>
        </div>
      </div>

      {/* 2. Preview Section */}
      <div className="p-8 border-b border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Preview</h2>

          {/* Preview URL Display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex-1 truncate">{previewUrl}</span>
              <button
                onClick={handleCopyUrl}
                className="ml-4 flex items-center px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Primary CTA */}
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ExternalLink className="w-6 h-6 mr-3" />
            View Your Website
          </a>
        </div>
      </div>

      {/* 3. What's Included */}
      <div className="p-8 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          What's Included in Your Website
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {includedFeatures.map((feature, index) => (
            <div
              key={index}
              className="flex items-start p-4 bg-green-50 rounded-lg border border-green-200"
            >
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Subscription CTA */}
      <div className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Love it? Activate for $99/month</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Take your website live with professional features and ongoing support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Benefits */}
          <div>
            <h3 className="text-xl font-semibold mb-4">What You Get:</h3>
            <ul className="space-y-3">
              {subscriptionBenefits.map((benefit, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-300 mr-3 flex-shrink-0" />
                  <span className="text-blue-100">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col justify-center space-y-4">
            <button className="bg-white text-blue-600 font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center">
              <ArrowRight className="w-6 h-6 mr-2" />
              Activate My Website
            </button>
            <a
              href="/pricing"
              className="text-center text-blue-200 hover:text-white transition-colors underline"
            >
              View pricing details →
            </a>
          </div>
        </div>
      </div>

      {/* 5. Next Steps */}
      <div className="p-8 border-b border-gray-200 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Next Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Review Your Website</h3>
            <p className="text-sm text-gray-600">
              Take your time to explore and test all features
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Contact Our Team</h3>
            <p className="text-sm text-gray-600">
              We'll reach out to set up your subscription and domain
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Go Live!</h3>
            <p className="text-sm text-gray-600">
              Your website goes live on your custom domain
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-700 mb-4">
            <strong>Questions?</strong> Our team will contact you within 24 hours to discuss next steps.
          </p>
          <p className="text-sm text-gray-600">
            Email: <a href="mailto:hello@webler.io" className="text-blue-600 hover:underline">hello@webler.io</a> |
            Phone: <a href="tel:+1-555-WEBLER" className="text-blue-600 hover:underline ml-2">+1 (555) WEBLER</a>
          </p>
        </div>
      </div>

      {/* 6. Social Sharing */}
      <div className="p-8 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Share Your New Website
        </h2>
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Show your colleagues and network your professional new website
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              <Twitter className="w-5 h-5 mr-2" />
              Twitter
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Linkedin className="w-5 h-5 mr-2" />
              LinkedIn
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
            >
              <Facebook className="w-5 h-5 mr-2" />
              Facebook
            </button>
          </div>
        </div>
      </div>

      {/* 7. Feedback Section */}
      <div className="p-8 bg-gray-50 rounded-b-lg">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          How was your experience?
        </h2>
        <div className="max-w-2xl mx-auto">
          {/* Star Rating */}
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">Rate your website generation experience:</p>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                  className="transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= feedback.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    } hover:text-yellow-400`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <textarea
              value={feedback.comment}
              onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Tell us about your experience (optional)"
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit */}
          <div className="text-center">
            <button
              onClick={handleFeedbackSubmit}
              disabled={feedback.rating === 0}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mx-auto"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}