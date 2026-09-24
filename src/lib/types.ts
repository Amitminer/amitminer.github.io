export type Project = {
  name: string;
  description: string;
  href: string;
  isPrivate?: boolean;
};

export type GitHubApiRepo = {
  name: string;
  description: string | null;
  html_url: string;
  fork: boolean;
  pushed_at?: string;
  updated_at?: string;
};

export type FormFields = {
  email: string;
  message: string;
};

export type FormErrors = Partial<Record<keyof FormFields, string>>;

export type SubmitStatus =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "success"; message: string }
  | { type: "error"; message: string; mailtoUrl?: string };

export type Toast = {
  type: "success" | "error";
  message: string;
};

export type SocialLink = {
  href: string;
  icon: string;
  label: string;
};
