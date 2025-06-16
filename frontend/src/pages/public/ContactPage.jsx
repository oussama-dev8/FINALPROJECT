import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Replace with actual API call
      // await api.sendContactMessage(formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      // No need to automatically clear status - let user see the message
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
            Get In Touch
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
            Have questions or feedback? We're here to help and would love to hear from you.
          </p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          {submitStatus === 'success' && (
            <div className="mb-8 p-4 bg-green-900/30 border border-green-700/50 text-green-100 rounded-lg flex items-center space-x-3">
              <FiCheckCircle className="h-6 w-6 text-green-400" />
              <span>Thank you for your message! We'll get back to you soon.</span>
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="mb-8 p-4 bg-red-900/30 border border-red-700/50 text-red-100 rounded-lg flex items-center space-x-3">
              <FiAlertCircle className="h-6 w-6 text-red-400" />
              <span>Something went wrong. Please try again later.</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-300">
                Subject <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="How can we help you?"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                Message <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Tell us about your project or question..."
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="group w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                <FiSend className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl shadow-lg hover:border-primary-500/30 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-primary-900/30 border border-primary-700/50 rounded-xl p-3">
                <FiMail className="h-6 w-6 text-primary-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">Email Us</h3>
                <p className="mt-1 text-gray-300">We'll respond as soon as possible</p>
                <a href="mailto:support@darsy.com" className="mt-2 text-primary-400 hover:text-primary-300 transition-colors duration-200 inline-flex items-center">
                  support@darsy.com
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl shadow-lg hover:border-primary-500/30 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-primary-900/30 border border-primary-700/50 rounded-xl p-3">
                <FiPhone className="h-6 w-6 text-primary-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">Call Us</h3>
                <p className="mt-1 text-gray-300">Mon-Fri from 9am to 5pm</p>
                <a href="tel:+15551234567" className="mt-2 text-primary-400 hover:text-primary-300 transition-colors duration-200 inline-flex items-center">
                  +1 (555) 123-4567
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl shadow-lg hover:border-primary-500/30 transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-primary-900/30 border border-primary-700/50 rounded-xl p-3">
                <FiMapPin className="h-6 w-6 text-primary-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">Visit Us</h3>
                <p className="mt-1 text-gray-300">Come say hello at our office</p>
                <p className="mt-2 text-gray-300">
                  123 Education St<br />
                  Learning City, 10101
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
