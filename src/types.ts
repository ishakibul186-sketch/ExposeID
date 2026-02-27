export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  clicks: number;
  active: boolean;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
}

export interface ContactInfo {
  mobile?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string; // Base64
  url?: string;
}

export interface BusinessInfo {
  companyName?: string;
  companyLogo?: string; // Base64
  services?: string[];
  experience?: number;
  skills?: string[];
  portfolio?: PortfolioProject[];
}

export interface UserCard {
  id: string;
  uid: string;
  username: string;
  displayName: string;
  title?: string;
  bio: string;
  photoURL?: string; // Base64
  thumbnail?: string; // Base64 (Banner image)
  theme: string;
  links: LinkItem[];
  socialLinks: SocialLinks;
  contact: ContactInfo;
  business?: BusinessInfo;
  integrations?: Integrations;
  testimonials?: Testimonial[];
  views: number;
  createdAt: number;
  isTopRanked?: boolean;
  clickHistory?: Record<string, number>;
}

export interface UserAccount {
  uid: string;
  email: string;
  cards: Record<string, UserCard>;
  activeCardId?: string;
}

export interface AnalyticsData {
  date: string;
  views: number;
  clicks: number;
}

export type ThemeType = 'classic' | 'modern' | 'glass' | 'neon' | 'minimal';

export interface TeamMember {
  uid: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  members: Record<string, TeamMember>;
  createdAt: number;
}

export interface Integrations {
  youtubeVideoUrl?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  feedback: string;
  company?: string;
  avatar?: string; // Base64
}

