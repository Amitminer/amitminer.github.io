/**
 * Contact Component
 * 
 * A contact form section that provides:
 * - Email contact form using Formspree
 * - Social media links with enhanced styling
 * - Toast notifications for form status
 * - Cloudflare Turnstile captcha
 */

'use client';

import { useForm } from '@formspree/react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';

import { XIcon, DiscordIcon, InstagramIcon, GitHubIcon, EmailIcon } from '../icons/index';
import { DiscordLink, GithubLink, InstagramLink, XLink } from '@/app/utils/Links';
import { ContactState, FormState } from '@/app/lib/types';
import Turnstile from 'react-turnstile';

const Contact = () => {
  // === Refs ===
  const contactRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const turnstileRef = useRef<any>(null);

  // === Form Configuration ===
  const FormspreeId = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID || '';
  const TurnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const Email = process.env.NEXT_PUBLIC_EMAIL || '';
  const [formspreeState, handleSubmit] = useForm(FormspreeId);

  // === State Management ===
  const [state, setState] = useState<ContactState>({
    isVisible: false,
    formState: {
      email: '',
      message: ''
    },
    errors: {},
    isSubmitting: false
  });

  const [captchaState, setCaptchaState] = useState({
    showCaptcha: false,
    token: null as string | null,
    isLoading: false,
    error: null as string | null,
    attempts: 0
  });

  const [submitStatus, setSubmitStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  // === Form Validation ===
  const validateForm = useCallback((formData: FormState): Partial<FormState> => {
    const errors: Partial<FormState> = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    if (!formData.message) {
      errors.message = 'Message is required';
    } else if (formData.message.length < 6) {
      errors.message = 'Message must be at least 6 characters';
    }

    return errors;
  }, []);

  // === Captcha Handlers ===
  const handleCaptchaSuccess = useCallback((token: string) => {
    setCaptchaState(prev => ({
      ...prev,
      token,
      isLoading: false,
      error: null
    }));
  }, []);

  const handleCaptchaError = useCallback((error: string) => {
    console.error('Turnstile error:', error);
    setCaptchaState(prev => ({
      ...prev,
      token: null,
      isLoading: false,
      error: 'Captcha verification failed. Please try again.',
      attempts: prev.attempts + 1
    }));
  }, []);

  const handleCaptchaExpire = useCallback(() => {
    setCaptchaState(prev => ({
      ...prev,
      token: null,
      error: 'Captcha expired. Please verify again.'
    }));
  }, []);

  const handleCaptchaLoad = useCallback(() => {
    setCaptchaState(prev => ({
      ...prev,
      isLoading: false,
      error: null
    }));
  }, []);

  const resetCaptcha = useCallback(() => {
    if (turnstileRef.current) {
      turnstileRef.current.reset();
    }
    setCaptchaState(prev => ({
      ...prev,
      token: null,
      error: null,
      isLoading: false
    }));
  }, []);

  // === Animation Effects ===
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState(prev => ({ ...prev, isVisible: true }));
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (contactRef.current) {
      observer.observe(contactRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // === Form Submission Effects ===
  useEffect(() => {
    if (formspreeState.succeeded) {
      setSubmitStatus({
        type: 'success',
        message: 'Message sent successfully! We\'ll get back to you soon.'
      });

      // Reset form and captcha after a delay
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          formState: { email: '', message: '' },
          errors: {},
          isSubmitting: false
        }));

        setCaptchaState(prev => ({
          ...prev,
          showCaptcha: false,
          token: null,
          error: null,
          attempts: 0
        }));

        setSubmitStatus({ type: 'idle', message: '' });

        // Clear form fields
        if (emailRef.current) emailRef.current.value = '';
        if (messageRef.current) messageRef.current.value = '';
      }, 3000);
    }

    if (formspreeState.errors && Object.keys(formspreeState.errors).length > 0) {
      const errorMessage = Object.values(formspreeState.errors)[0]?.message || "Failed to send message. Please try again.";
      
      setSubmitStatus({
        type: 'error',
        message: errorMessage
      });

      setState(prev => ({ ...prev, isSubmitting: false }));
      resetCaptcha();
    }
  }, [formspreeState.succeeded, formspreeState.errors, resetCaptcha]);

  // === Event Handlers ===
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      formState: { ...prev.formState, [name]: value },
      errors: { ...prev.errors, [name]: undefined }
    }));
  }, []);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm(state.formState);
    if (Object.keys(errors).length > 0) {
      setState(prev => ({ ...prev, errors }));
      
      // Focus first error field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField === 'email' && emailRef.current) {
        emailRef.current.focus();
      } else if (firstErrorField === 'message' && messageRef.current) {
        messageRef.current.focus();
      }
      
      return;
    }

    // Show captcha if not already shown
    if (!captchaState.showCaptcha) {
      setCaptchaState(prev => ({ 
        ...prev, 
        showCaptcha: true, 
        isLoading: true,
        error: null 
      }));
      
      setSubmitStatus({
        type: 'idle',
        message: 'Please complete the security verification below'
      });
      
      return;
    }

    // Check for captcha token
    if (!captchaState.token) {
      setCaptchaState(prev => ({
        ...prev,
        error: 'Please complete the security verification to continue'
      }));
      return;
    }

    // Prevent multiple submissions
    if (state.isSubmitting) {
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));
    setSubmitStatus({ type: 'loading', message: 'Sending your message...' });

    try {
      // Create form data with captcha token
      const formData = new FormData(e.currentTarget);
      formData.append('cf-turnstile-response', captchaState.token);

      // Submit form
      await handleSubmit(e);

    } catch (error) {
      console.error('Form submission error:', error);
      
      setSubmitStatus({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.'
      });

      setState(prev => ({ ...prev, isSubmitting: false }));
      resetCaptcha();
    }
  };

  // === Social Media Links ===
  const socialLinks = [
    { href: GithubLink, icon: GitHubIcon, label: 'GitHub' },
    { href: XLink, icon: XIcon, label: 'Twitter' },
    { href: `mailto:${Email}`, icon: EmailIcon, label: 'Email' },
    { href: InstagramLink, icon: InstagramIcon, label: 'Instagram' },
    { href: DiscordLink, icon: DiscordIcon, label: 'Discord' },
  ];

  // === Render ===
  return (
    <section 
      id="contact" 
      ref={contactRef}
      className={`pb-11 w-full transition-all duration-1000 ${
        state.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text text-center">
          Get in Touch
        </h2>

        <div className="max-w-2xl mx-auto">
          {/* Social Media Links */}
          <div className="flex justify-center mb-10 space-x-4">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a 
                key={label}
                href={href} 
                target="_blank" 
                className="social-icon group scale-75 border-2 border-gray-700/50 hover:border-pink-500/70" 
                aria-label={label}
                rel="noopener noreferrer"
              >
                <Icon className="w-4 h-4 group-hover:text-pink-500 transition-colors duration-300" />
              </a>
            ))}
          </div>

          {/* Contact Form with Enhanced Styling */}
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  className={`contact-input bg-gray-900/40 ${state.errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                  ref={emailRef}
                  value={state.formState.email}
                  onChange={handleInputChange}
                  disabled={state.isSubmitting}
                />
                {state.errors.email && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {state.errors.email}
                  </p>
                )}
              </div>

              {/* Message Textarea */}
              <div className="space-y-2">
                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows={5}
                  className={`contact-input bg-gray-900/40 resize-none ${state.errors.message ? 'border-red-500 focus:border-red-500' : ''}`}
                  required
                  ref={messageRef}
                  value={state.formState.message}
                  onChange={handleInputChange}
                  disabled={state.isSubmitting}
                />
                {state.errors.message && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {state.errors.message}
                  </p>
                )}
              </div>
            </div>

            {/* Enhanced Cloudflare Turnstile Widget */}
            {captchaState.showCaptcha && (
              <div className="space-y-4">
                {/* Captcha Header */}
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-300 mb-2">
                    Security Verification
                  </h3>
                  <p className="text-sm text-gray-400">
                    Please complete the verification below to send your message
                  </p>
                </div>

                {/* Captcha Container */}
                <div className="flex flex-col items-center space-y-3">
                  <div className={`
                    relative p-4 rounded-xl border-2 transition-all duration-300
                    ${captchaState.token ? 'border-green-500/50 bg-green-500/10' : 
                      captchaState.error ? 'border-red-500/50 bg-red-500/10' : 
                      'border-gray-600/50 bg-gray-800/50'}
                  `}>
                    {captchaState.isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-300">Loading verification...</span>
                        </div>
                      </div>
                    )}
                    
                    <Turnstile
                      sitekey={TurnstileSiteKey}
                      onSuccess={handleCaptchaSuccess}
                      onError={handleCaptchaError}
                      onExpire={handleCaptchaExpire}
                      onLoad={handleCaptchaLoad}
                      theme="dark"
                      size="normal"
                      className="turnstile-widget"
                      retry="auto"
                      refreshExpired="auto"
                    />
                  </div>

                  {/* Captcha Status Messages */}
                  {captchaState.token && (
                    <div className="flex items-center space-x-2 text-green-400 text-sm">
                      <span className="text-green-400">✓</span>
                      <span>Verification successful!</span>
                    </div>
                  )}

                  {captchaState.error && (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex items-center space-x-2 text-red-400 text-sm">
                        <span className="text-red-400">⚠</span>
                        <span>{captchaState.error}</span>
                      </div>
                      {captchaState.attempts > 1 && (
                        <button
                          type="button"
                          onClick={resetCaptcha}
                          className="text-xs text-blue-400 hover:text-blue-300 underline transition-colors"
                        >
                          Reset verification
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Message Display */}
            {submitStatus.message && (
              <div className={`
                p-4 rounded-xl border transition-all duration-300 text-center
                ${submitStatus.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                  submitStatus.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                  submitStatus.type === 'loading' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                  'bg-gray-500/10 border-gray-500/30 text-gray-400'}
              `}>
                <div className="flex items-center justify-center space-x-2">
                  {submitStatus.type === 'loading' && (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {submitStatus.type === 'success' && <span>🎉</span>}
                  {submitStatus.type === 'error' && <span>⚠</span>}
                  <span>{submitStatus.message}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={state.isSubmitting || (captchaState.showCaptcha && !captchaState.token)}
            >
              {state.isSubmitting ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </span>
              ) : captchaState.showCaptcha && !captchaState.token ? (
                'Complete Verification First'
              ) : (
                'Send Message'
              )}
            </Button>

            {/* Form Help Text */}
            <p className="text-center text-xs text-gray-500">
              Your message will be encrypted and sent securely. We typically respond within 24 hours.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;