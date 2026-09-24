"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import gsap from "gsap";
import {
  type ChangeEvent,
  type SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DiscordIcon,
  EmailIcon,
  GitHubIcon,
  InstagramIcon,
  XIcon,
} from "@/components/icons";
import {
  DiscordLink,
  Email,
  GithubLink,
  InstagramLink,
  XLink,
} from "@/lib/config";
import type { FormErrors, FormFields, SubmitStatus, Toast } from "@/lib/types";

const socialLinks = [
  {
    href: GithubLink,
    icon: GitHubIcon,
    label: "GitHub",
  },
  {
    href: XLink,
    icon: XIcon,
    label: "X (Twitter)",
  },
  {
    href: `mailto:${Email}`,
    icon: EmailIcon,
    label: "Email",
  },
  {
    href: InstagramLink,
    icon: InstagramIcon,
    label: "Instagram",
  },
  {
    href: DiscordLink,
    icon: DiscordIcon,
    label: "Discord",
  },
];

export function ContactForm() {
  const [fields, setFields] = useState<FormFields>({
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>({ type: "idle" });
  const [toast, setToast] = useState<Toast | null>(null);

  function triggerToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }

  const [showCaptcha, setShowCaptcha] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID;
  const recipientEmail = process.env.NEXT_PUBLIC_EMAIL || Email;
  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from("[data-contact-animate='header']", {
        opacity: 0,
        y: 12,
        duration: 0.5,
        ease: "power2.out",
        clearProps: "opacity,transform",
      });

      gsap.from("[data-contact-animate='icon']", {
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
        stagger: 0.05,
        delay: 0.1,
        ease: "power2.out",
        clearProps: "opacity,transform",
      });

      gsap.from("[data-contact-animate='field']", {
        opacity: 0,
        y: 16,
        duration: 0.5,
        stagger: 0.08,
        delay: 0.15,
        ease: "power2.out",
        clearProps: "opacity,transform",
      });
    }, formRef);

    return () => ctx.revert();
  }, []);

  function validate(data: FormFields): FormErrors {
    const errs: FormErrors = {};

    if (!data.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errs.email = "Please enter a valid email address";
    }

    if (!data.message.trim()) {
      errs.message = "Message is required";
    } else if (data.message.trim().length < 6) {
      errs.message = "Message must be at least 6 characters";
    }

    return errs;
  }

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormFields]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!showCaptcha) {
      setShowCaptcha(true);
      setTurnstileError("Please complete the verification below to send.");
      return;
    }

    if (!turnstileToken) {
      setTurnstileError("Please complete the verification below to continue.");
      return;
    }

    setErrors({});
    setTurnstileError(null);
    setStatus({ type: "submitting" });

    const subject = encodeURIComponent("Portfolio message");
    const body = encodeURIComponent(
      `${fields.message.trim()}\n\nFrom: ${fields.email.trim()}`,
    );
    const mailtoFallback = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

    if (formspreeId) {
      try {
        const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: fields.email.trim(),
            message: fields.message.trim(),
            "cf-turnstile-response": turnstileToken,
          }),
        });

        if (response.ok) {
          setStatus({
            type: "success",
            message: "Message sent successfully. I'll get back to you soon.",
          });
          triggerToast(
            "success",
            "Message sent successfully! I'll get back to you soon.",
          );
          setFields({ email: "", message: "" });
          setShowCaptcha(false);
          setTurnstileToken(null);
          turnstileRef.current?.reset();
          return;
        }

        const data = await response.json().catch(() => null);
        const serverError =
          data?.errors?.[0]?.message ||
          "Failed to send message. Please try again.";
        setStatus({
          type: "error",
          message: serverError,
          mailtoUrl: mailtoFallback,
        });
        triggerToast("error", serverError);
        turnstileRef.current?.reset();
        setTurnstileToken(null);
      } catch {
        setStatus({
          type: "error",
          message: "Network error sending message.",
          mailtoUrl: mailtoFallback,
        });
        triggerToast("error", "Network error sending message.");
        turnstileRef.current?.reset();
        setTurnstileToken(null);
      }
    } else {
      window.location.href = mailtoFallback;
      setStatus({
        type: "success",
        message: "Opening your email client to send...",
      });
      triggerToast("success", "Opening your email client to send...");
      setShowCaptcha(false);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  }

  return (
    <div ref={formRef} className="mx-auto w-full max-w-xl">
      <div
        data-contact-animate="header"
        className="mb-6 flex items-center justify-center border-b border-line pb-3 text-center sm:mb-8"
      >
        <h2
          id="contact-heading"
          className="text-sm font-medium tracking-tight text-muted sm:text-base md:text-lg"
        >
          Contact
        </h2>
      </div>

      <div
        data-contact-animate="header"
        className="mb-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
      >
        {socialLinks.map(({ href, icon: Icon, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            data-contact-animate="icon"
            className="group flex size-10 sm:size-11 md:size-12 items-center justify-center rounded-full border border-line text-muted transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:border-ink/60 hover:text-ink hover:shadow-[0_0_12px_rgba(255,255,255,0.06)] active:scale-95 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <Icon className="size-4.5 sm:size-5 fill-current transition-transform duration-200 group-hover:scale-110" />
            <span className="sr-only">{label}</span>
          </a>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3.5 sm:gap-4"
        noValidate
      >
        <input
          type="text"
          name="_gotcha"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <div data-contact-animate="field" className="flex flex-col gap-1.5">
          <label htmlFor="contact-email" className="sr-only">
            Your email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            placeholder="Your email"
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            value={fields.email}
            onChange={handleChange}
            disabled={status.type === "submitting"}
            className="w-full rounded-lg border border-line bg-transparent px-4 py-3 text-sm sm:text-base text-ink placeholder:text-faint outline-none transition-colors focus:border-ink disabled:opacity-50"
          />
          {errors.email && (
            <span
              id="email-error"
              className="px-1 text-xs text-red-400 sm:text-sm"
              role="alert"
            >
              {errors.email}
            </span>
          )}
        </div>

        <div data-contact-animate="field" className="flex flex-col gap-1.5">
          <label htmlFor="contact-message" className="sr-only">
            Your message
          </label>
          <textarea
            id="contact-message"
            name="message"
            placeholder="Your message"
            rows={5}
            required
            aria-required="true"
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
            value={fields.message}
            onChange={handleChange}
            disabled={status.type === "submitting"}
            className="w-full resize-none rounded-lg border border-line bg-transparent px-4 py-3 text-sm sm:text-base text-ink placeholder:text-faint outline-none transition-colors focus:border-ink disabled:opacity-50"
          />
          {errors.message && (
            <span
              id="message-error"
              className="px-1 text-xs text-red-400 sm:text-sm"
              role="alert"
            >
              {errors.message}
            </span>
          )}
        </div>

        {showCaptcha && (
          <div className="my-1 flex flex-col items-center justify-center">
            <Turnstile
              ref={turnstileRef}
              siteKey={turnstileSiteKey}
              onSuccess={(token) => {
                setTurnstileToken(token);
                setTurnstileError(null);
              }}
              onError={() => {
                setTurnstileError("Verification failed. Please retry.");
                setTurnstileToken(null);
              }}
              onExpire={() => {
                setTurnstileToken(null);
                setTurnstileError("Verification expired. Please verify again.");
              }}
              options={{
                theme: "dark",
                size: "normal",
              }}
            />
            {turnstileError && (
              <span
                className="mt-1 text-xs text-red-400 sm:text-sm"
                role="alert"
              >
                {turnstileError}
              </span>
            )}
          </div>
        )}

        <div data-contact-animate="field">
          <button
            type="submit"
            disabled={status.type === "submitting"}
            className="flex w-full cursor-pointer items-center justify-center rounded-lg border border-line bg-ink py-3 px-5 text-sm sm:text-base font-medium text-bg shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-[0_4px_16px_rgba(255,255,255,0.08)] active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status.type === "submitting" ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-bg border-t-transparent" />
                <span>Sending...</span>
              </span>
            ) : showCaptcha && !turnstileToken ? (
              "Complete verification above"
            ) : (
              "Send Message"
            )}
          </button>
        </div>

        {status.type === "success" && (
          <output
            className="py-1 text-center text-xs sm:text-sm text-muted"
            aria-live="polite"
          >
            {status.message}
          </output>
        )}

        {status.type === "error" && (
          <output
            className="py-1 text-center text-xs sm:text-sm text-red-400"
            aria-live="assertive"
          >
            {status.message}{" "}
            {status.mailtoUrl && (
              <a
                href={status.mailtoUrl}
                className="text-ink underline decoration-line underline-offset-2 hover:opacity-75"
              >
                Click here to send via email client instead
              </a>
            )}
          </output>
        )}

        <p className="mt-1 text-center text-xs sm:text-sm text-faint">
          Your message will be sent securely. I typically respond within 24
          hours.
        </p>
      </form>

      {toast && (
        <output
          aria-live="polite"
          className="fixed bottom-4 inset-x-4 max-w-sm mx-auto sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-md z-50 flex items-center justify-between gap-3 rounded-lg border border-line bg-[#111215]/95 px-4 py-3 text-xs shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`size-2 shrink-0 rounded-full ${
                toast.type === "success" ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
            <p className="m-0 text-ink">{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="cursor-pointer text-muted transition-colors hover:text-ink text-sm leading-none pl-2"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </output>
      )}
    </div>
  );
}
