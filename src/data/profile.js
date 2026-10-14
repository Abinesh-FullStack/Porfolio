// ─────────────────────────────────────────────────────────────
// Central profile config — edit these values to update the site.
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: 'Abinesh V',
  brand: 'ABINESH V.',
  role: 'Full Stack Developer',
  positioning: 'Full Stack Developer | Automation Testing | Data Analytics',
  focusAreas: ['Full Stack Development', 'Automation Testing', 'Data Analytics'],
  company: 'Kenshin Systems Pvt Ltd',
  experienceLabel: '~2 years',
  status: 'Full Stack Developer at Kenshin Systems',

  // EMAIL — replace the placeholder with your real address.
  // While it still contains "your-email", the Email buttons show as "Email coming soon"
  // and are not clickable, so visitors never see a fake address.
  email: 'your-email@example.com',

  links: {
    linkedin: 'https://www.linkedin.com/in/abinesh-v-7496b32b2/',
    github: 'https://github.com/Abinesh-FullStack',
  },

  // Place your photo at: public/images/abinesh-profile.jpg
  photo: 'images/abinesh-profile.jpg',

}

export const hasRealEmail = () => !!profile.email && !profile.email.includes('your-email')

// Resolves a public/ asset against Vite's base path (needed for GitHub Pages).
export const asset = (path) => `${import.meta.env.BASE_URL}${path}`

export const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'automation', label: 'Automation' },
  { id: 'contact', label: 'Contact' },
]
