'use client';

import { useForm } from '@formspree/react';
import { useRef, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { useToast } from '@/app/hooks/use-toast';
import { Toaster } from '@/app/components/ui/toaster';
import { XIcon, DiscordIcon, InstagramIcon, GitHubIcon} from '../icons/index';
import { DiscordLink, GithubLink, InstagramLink, XLink } from '@/app/utils/Links';

const Contact = () => {
  const contactRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const [state, handleSubmit] = useForm("mldrereq");
  const { toast } = useToast();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('slide-up');
        }
      },
      { threshold: 0.1 }
    );

    if (contactRef.current) observer.observe(contactRef.current);

    return () => {
      if (contactRef.current) observer.unobserve(contactRef.current);
    };
  }, []);

  // Handle form submission result with shadcn toast
  useEffect(() => {
    if (state.succeeded) {
      toast({
        title: "Success! 🎉",
        description: "Your message has been sent successfully!",
        duration: 3000,
        className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none",
      });
      
      // Clear form fields
      if (emailRef.current) emailRef.current.value = '';
      if (messageRef.current) messageRef.current.value = '';
    }
    
    // Handle errors
    if (state.errors && Object.keys(state.errors).length > 0) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
        duration: 3000,
        className: "bg-gradient-to-r from-red-500 to-rose-600 text-white border-none",
      });
    }
  }, [state.succeeded, state.errors, toast]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Show loading toast and store its ID
    const loadingToastId = toast({
      title: "Sending...",
      description: "Please wait while we send your message.",
      className: "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none",
      duration: Infinity, // Keep loading toast until manually dismissed
    });

    await handleSubmit(e);
    
    // Dismiss loading toast after form submission
    if (loadingToastId.dismiss) {
      loadingToastId.dismiss();
    }
  };

  return (
    <section 
      id="contact" 
      ref={contactRef}
      className="py-11 w-full opacity-0"
    >
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 gradient-text text-center">
          Get in Touch
        </h2>
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-10 space-x-8">
            <a href={GithubLink} target="_blank" className="social-icon group" aria-label="GitHub" rel="noopener noreferrer">
              <GitHubIcon className="w-5 h-5 group-hover:text-pink-500" />
            </a>
            <a href={XLink} target="_blank" className="social-icon group" aria-label="Twitter" rel="noopener noreferrer">
              <XIcon className="w-5 h-5 group-hover:text-pink-500" />
            </a>
            <a href={InstagramLink} target="_blank" className="social-icon group" aria-label="Instagram" rel="noopener noreferrer">
              <InstagramIcon className="w-5 h-5 group-hover:text-pink-500" />
            </a>
            <a href={DiscordLink} target="_blank" className="social-icon group" aria-label="Discord" rel="noopener noreferrer">
              <DiscordIcon className="w-5 h-5 group-hover:text-pink-500" />
            </a>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                className="contact-input"
                required
                ref={emailRef}
              />

              <textarea
                name="message"
                placeholder="Your Message"
                rows={5}
                className="contact-input resize-none"
                required
                ref={messageRef}
              ></textarea>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
              disabled={state.submitting}
            >
              {state.submitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </div>

      <Toaster />
    </section>
  );
};

export default Contact;