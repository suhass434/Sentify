import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { Mail, User, MessageSquare, Send, CheckCircle, XCircle } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setFormStatus('Your message has been sent successfully!');
    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

  const dismissStatus = () => {
    setFormStatus('');
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 from-gray-100 to-gray-200 flex items-center justify-center transition-colors duration-200">
      <Card className="w-full max-w-lg dark:bg-gray-800/70 bg-white/90 shadow-xl backdrop-blur-md dark:border-gray-700 border-gray-200 rounded-xl transition-all duration-200">
        <CardHeader className="space-y-2 text-center py-6">
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Contact Us
          </div>
          <p className="dark:text-gray-400 text-gray-600 text-lg transition-colors">
            We'd love to hear from you! Fill out the form below.
          </p>
        </CardHeader>
        <CardBody className="px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-gray-400 text-gray-500 h-6 w-6 transition-colors" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full pl-12 pr-4 py-4 rounded-lg dark:bg-gray-700/50 bg-gray-100 dark:text-gray-200 text-gray-900 dark:placeholder-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 dark:text-gray-400 text-gray-500 h-6 w-6 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  className="w-full pl-12 pr-4 py-4 rounded-lg dark:bg-gray-700/50 bg-gray-100 dark:text-gray-200 text-gray-900 dark:placeholder-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none transition-all"
                />
              </div>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 dark:text-gray-400 text-gray-500 h-6 w-6 transition-colors" />
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your Message"
                  rows="4"
                  className="w-full pl-12 pr-4 py-4 rounded-lg dark:bg-gray-700/50 bg-gray-100 dark:text-gray-200 text-gray-900 dark:placeholder-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-lg font-semibold shadow-md transition-all hover:shadow-lg transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          {formStatus && (
            <div
              className={`mt-6 flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${
                formStatus.includes('successfully')
                  ? 'dark:bg-green-500/10 bg-green-50 dark:text-green-400 text-green-600 dark:border-green-500/20 border-green-200'
                  : 'dark:bg-red-500/10 bg-red-50 dark:text-red-400 text-red-600 dark:border-red-500/20 border-red-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {formStatus.includes('successfully') ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <XCircle className="h-6 w-6" />
                )}
                <span>{formStatus}</span>
              </div>
              <button
                onClick={dismissStatus}
                className="text-sm font-semibold dark:text-gray-400 text-gray-600 dark:hover:text-gray-200 hover:text-gray-900 transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ContactUs;