import Link from 'next/link';
import {
  Mail,
  MapPin,
  Navigation,
  Briefcase,
  Users,
  Map,
  Brain,
  Rocket,
} from 'lucide-react';
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaGithub,
  FaLinkedin,
} from 'react-icons/fa';

const LEARNING_PATHS = [
  { label: 'Frontend Development',  href: '/learning-paths' },
  { label: 'Backend Development',   href: '/learning-paths' },
  { label: 'Full-Stack Engineering',href: '/learning-paths' },
  { label: 'Data Science & AI/ML',  href: '/learning-paths' },
  { label: 'UI/UX Design',          href: '/learning-paths' },
];

const PLATFORM_LINKS = [
  { label: 'Community Feed',       href: '/community/feed', icon: Users },
  { label: 'Roadmaps',             href: '/learning-paths', icon: Map },
  { label: 'Projects',             href: '/learning-paths', icon: Rocket },
  { label: 'Job Board',            href: '/learning-paths', icon: Briefcase },
  { label: 'AI Recommendations',  href: '/learning-paths', icon: Brain },
];

const ACCOUNT_LINKS = [
  { label: 'My Profile',       href: '/profile' },
  { label: 'Login',            href: '/login' },
  { label: 'Register',         href: '/register' },
  { label: 'Admin Dashboard',  href: '/admin/dashboard' },
];

const SOCIAL_LINKS = [
  { icon: FaFacebook,  href: '#', label: 'Facebook',  hover: 'hover:text-blue-600' },
  { icon: FaInstagram, href: '#', label: 'Instagram', hover: 'hover:text-pink-500' },
  { icon: FaTwitter,   href: '#', label: 'Twitter',   hover: 'hover:text-sky-400' },
  { icon: FaGithub,    href: '#', label: 'GitHub',    hover: 'hover:text-gray-900' },
  { icon: FaLinkedin,  href: '#', label: 'LinkedIn',  hover: 'hover:text-blue-700' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FFFDF7] text-gray-600 border-t border-amber-100">
      {/* Top gradient accent */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">

          {/* ── Brand ───────────────────────────────────── */}
          <div className="lg:col-span-1">
            {/* Logo — same as Header */}
            <Link href="/" className="inline-flex items-center gap-2">
              <Navigation size={24} className="text-blue-600" />
              <span className="text-xl font-bold text-gray-800">Guidfy</span>
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-gray-500 max-w-xs">
              Your all-in-one platform to learn, build, and launch your tech
              career. Join thousands of students transforming their futures
              with Guidfy.
            </p>

            {/* Contact */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Mail className="h-4 w-4 shrink-0 text-blue-500" />
                <span>support@guidfy.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <MapPin className="h-4 w-4 shrink-0 text-blue-500" />
                <span>Cairo, Egypt 🇪🇬</span>
              </div>
            </div>

            {/* Social */}
            <ul className="mt-8 flex gap-4">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label, hover }) => (
                <li key={label}>
                  <a
                    href={href}
                    className={`text-gray-400 transition-colors duration-200 ${hover}`}
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Learning Paths ───────────────────────────── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Learning Paths
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {LEARNING_PATHS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-gray-500 transition-colors duration-150 hover:text-blue-600"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Platform ─────────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Platform
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {PLATFORM_LINKS.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 text-gray-500 transition-colors duration-150 hover:text-blue-600"
                  >
                    <Icon className="h-3.5 w-3.5 text-blue-400" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Account ──────────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Account
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {ACCOUNT_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-gray-500 transition-colors duration-150 hover:text-blue-600"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 active:scale-95"
              >
                <Rocket size={15} />
                Get Started Free
              </Link>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ─────────────────────────────────── */}
        <div className="mt-12 border-t border-amber-100 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-400">
              © {currentYear} Guidfy. All rights reserved.
            </p>

            <div className="flex flex-wrap justify-center gap-5 text-xs text-gray-400">
              <a href="#" className="transition hover:text-blue-600">Terms of Service</a>
              <a href="#" className="transition hover:text-blue-600">Privacy Policy</a>
              <a href="#" className="transition hover:text-blue-600">Cookie Policy</a>
            </div>

            <p className="text-xs font-medium text-blue-600">
              Built with ❤️ by Karim
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}