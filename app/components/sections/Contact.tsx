/**
 * Contact Component
 * 
 * A contact form section that provides:
 * - Email contact form using Formspree
 * - Social media links with enhanced styling
 * - Toast notifications for form status
 */

'use client';

import { useForm } from '@formspree/react';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import { useToast } from '@/app/hooks/use-toast';
import { Toaster } from '@/app/components/ui/toaster';
import { XIcon, DiscordIcon, InstagramIcon, GitHubIcon } from '../icons/index';
import { DiscordLink, GithubLink, InstagramLink, XLink } from '@/app/utils/Links';
import { ContactState, FormState } from '@/app/lib/types';

const Contact = () => {
  // === Refs ===
  const contactRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // === Form Configuration ===
  const FormspreeId = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID || 'mldrereq';
  const [formspreeState, handleSubmit] = useForm(FormspreeId);
  const { toast } = useToast();

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
      if (contactRef.current) {
        observer.unobserve(contactRef.current);
      }
    };
  }, []);

  // === Form Submission Effects ===
  useEffect(() => {
    if (formspreeState.succeeded) {
      toast({
        title: "Success! 🎉",
        description: "Your message has been sent successfully!",
        duration: 3000,
        className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none",
      });

      // Reset form
      setState(prev => ({
        ...prev,
        formState: { email: '', message: '' },
        errors: {},
        isSubmitting: false
      }));

      // Clear form fields
      if (emailRef.current) emailRef.current.value = '';
      if (messageRef.current) messageRef.current.value = '';
    }

    if (formspreeState.errors && Object.keys(formspreeState.errors).length > 0) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
        duration: 3000,
        className: "bg-gradient-to-r from-red-500 to-rose-600 text-white border-none",
      });

      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [formspreeState.succeeded, formspreeState.errors, toast]);

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
      return;
    }

    // Show loading toast
    const loadingToastId = toast({
      title: "Sending...",
      description: "Please wait while we send your message.",
      className: "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none",
      duration: Infinity,
    });

    setState(prev => ({ ...prev, isSubmitting: true }));

    // Submit form
    await handleSubmit(e);

    // Dismiss loading toast
    if (loadingToastId.dismiss) {
      loadingToastId.dismiss();
    }
  };

  // === Social Media Links ===
  const socialLinks = [
    { href: GithubLink, icon: GitHubIcon, label: 'GitHub' },
    { href: XLink, icon: XIcon, label: 'Twitter' },
    { href: InstagramLink, icon: InstagramIcon, label: 'Instagram' },
    { href: DiscordLink, icon: DiscordIcon, label: 'Discord' }
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
                className={`contact-input bg-gray-900/40 ${state.errors.email ? 'border-red-500' : ''}`}
                required
                ref={emailRef}
                value={state.formState.email}
                onChange={handleInputChange}
              />
                {state.errors.email && (
                  <p className="text-red-500 text-sm">{state.errors.email}</p>
                )}
              </div>

              {/* Message Textarea */}
              <div className="space-y-2">
              <textarea
                name="message"
                placeholder="Your Message"
                rows={5}
                className={`contact-input bg-gray-900/40 resize-none ${state.errors.message ? 'border-red-500' : ''}`}
                required
                ref={messageRef}
                value={state.formState.message}
                onChange={handleInputChange}
              />
                {state.errors.message && (
                  <p className="text-red-500 text-sm">{state.errors.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={state.isSubmitting}
            >
              {state.isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </div>

      {/* Toast Container */}
      <Toaster />
    </section>
  );
};

export default Contact;