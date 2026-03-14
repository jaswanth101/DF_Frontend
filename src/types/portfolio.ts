export interface PersonalLinks {
  github: string | null;
  linkedin: string | null;
  portfolio: string | null;
}

export interface PersonalInfo {
  full_name: string;
  headline: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  profile_image_url: string | null;
  links: PersonalLinks;
  summary: string | null;
}

export interface ExperienceItem {
  company_name: string | null;
  role: string | null;
  start_date: string | null;
  end_date: string | null; // "Present" or a date string
  location: string | null;
  description: string[];
}

export interface ProjectItem {
  title: string | null;
  role: string | null;
  description: string | null;
  tech_stack: string[];
  live_url: string | null;
  github_url: string | null;
  start_date: string | null;
  end_date: string | null;
  context: string | null;
}

export interface EducationItem {
  institution: string | null;
  degree: string | null;
  cgpa: string | null;
  percentage: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface CertificationItem {
  name: string | null;
  issuer: string | null;
  url: string | null;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface LanguageItem {
  language: string;
  proficiency: string | null;
}

export interface PortfolioData {
  username: string;
  personal_info: PersonalInfo;
  skills: SkillGroup[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  achievements: string[];
  languages: LanguageItem[];
  additional_info: string[];
}
