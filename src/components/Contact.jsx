import React, { useRef } from 'react';
import { useForm } from '@formspree/react';
import toast, { Toaster } from 'react-hot-toast';
import { FaGithub, FaDiscord, FaXbox, FaInstagram } from 'react-icons/fa';
import '../styles/Contact.css';

const Contact = () => {
  const [state, handleSubmit] = useForm("xqakqpro");
  const emailRef = useRef();
  const messageRef = useRef();

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    await handleSubmit(event);

    if (state.succeeded) {
      toast.success('Message sent successfully!', { autoClose: 3000, position: "bottom-center", hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, theme: 'colored', icon: '👏',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      
      if (emailRef.current) emailRef.current.value = '';
      if (messageRef.current) messageRef.current.value = '';
    }
  };

  return (
    <section id="contact">
      <h2>Contact</h2>

      <div className="social-links">
        <a href="https://github.com/Amitminer" target="_blank" rel="noopener noreferrer" title="GitHub">
          <FaGithub className="icon" />
        </a>
        <a href="https://discord.com/users/814660125511778315" target="_blank" rel="noopener noreferrer" title="Discord">
          <FaDiscord className="icon" />
        </a>
        <a href="https://account.xbox.com/en-in/profile?gamertag=Amitminer" target="_blank" rel="noopener noreferrer" title="Xbox">
          <FaXbox className="icon" />
        </a>
        <a href="https://www.instagram.com/amitminer" target="_blank" rel="noopener noreferrer" title="Instagram">
          <FaInstagram className="icon" />
        </a>
      </div>
      
      <form onSubmit={handleFormSubmit} className="contact-form">
        <input type="email" name="email" placeholder="Your Email" required ref={emailRef} />
        <textarea name="message" placeholder="Your Message" required ref={messageRef}></textarea>
        <button type="submit" disabled={state.submitting}>
          {state.submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      <Toaster />
    </section>
  );
};

export default Contact;
