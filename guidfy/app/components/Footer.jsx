import Link from 'next/link';
import { 
  Droplet, 
  Mail, 
  MapPin, 
  Phone, 
  Facebook, 
  Instagram, 
  Twitter, 
  Github,
  Youtube,
  Linkedin
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:space-y-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3">
              <Droplet 
                size={32} 
                className="text-blue-500"
              />
              <span className="text-2xl font-bold text-gray-800">Guidfy</span>
            </div>

            <p className="mt-4 max-w-xs text-gray-600 leading-relaxed">
              Your all-in-one platform to learn, build, and launch your tech career. 
              Join thousands of students transforming their futures with Guidfy.
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">support@guidfy.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">San Francisco, CA</span>
              </div>
            </div>

            {/* Social Links */}
            <ul className="mt-8 flex gap-4">
              <li>
                <a href="#" className="text-gray-400 transition hover:text-blue-600">
                  <span className="sr-only">Facebook</span>
                  <Facebook className="size-5" />
                </a>
              </li>

              <li>
                <a href="#" className="text-gray-400 transition hover:text-pink-500">
                  <span className="sr-only">Instagram</span>
                  <Instagram className="size-5" />
                </a>
              </li>

              <li>
                <a href="#" className="text-gray-400 transition hover:text-blue-400">
                  <span className="sr-only">Twitter</span>
                  <Twitter className="size-5" />
                </a>
              </li>

              <li>
                <a href="#" className="text-gray-400 transition hover:text-gray-700">
                  <span className="sr-only">GitHub</span>
                  <Github className="size-5" />
                </a>
              </li>

              <li>
                <a href="#" className="text-gray-400 transition hover:text-red-600">
                  <span className="sr-only">YouTube</span>
                  <Youtube className="size-5" />
                </a>
              </li>

              <li>
                <a href="#" className="text-gray-400 transition hover:text-blue-700">
                  <span className="sr-only">LinkedIn</span>
                  <Linkedin className="size-5" />
                </a>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
            {/* Learning Paths */}
            <div>
              <p className="font-medium text-gray-900">Learning Paths</p>

              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <a href="#" className="text-gray-600 transition hover:text-blue-600">
                    Frontend Development
                  </a>
                </li>

                <li>
                  <a href="#" className="text-gray-600 transition hover:text-blue-600">
                    Backend Development
                  </a>
                </li>

                <li>
                  <a href="#" className="text-gray-600 transition hover:text-blue-600">
                    Full-Stack Engineering
                  </a>
                </li>

                <li>
                  <a href="#" className="text-gray-600 transition hover:text-blue-600">
                    Data Science
                  </a>
                </li>

                <li>
                  <a href="#" className="text-gray-600 transition hover:text-blue-600">
                    UI/UX Design
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <p className="font-medium text-gray-900">Resources</p>

              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <a href="#" className="text-gray-600 transition hover:text-blue-600">
                    Documentation
                  </a>
                </li>

                <li>
                  <a href="#" className="text-gray-600 transition hover:text-blue-600">
                    Tutorials
                  </a>
                </li>

                <li>
                  <a href="#" className="text-gray-600 transition hover:text-blue-600">
                    Blog
                  </a>
                </li>

                <li>
                  <a href="#" className="text-gray-600 transition hover:text-blue-600">
                    Community
                  </a>
                </li>

                <li>
                  <a href="#" className="text-gray-600 transition hover:text-blue-600">
                    Webinars
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <p className="font-medium text-gray-900">Support</p>

              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <a href="#" className="text-gray-600 transition hover:text-blue-600">
                    Help Center
                  </a>
                </li>

                <li>
                  <a href="#" className="text-gray-600 transition hover:text-blue-600">
                    Contact Us
                  </a>
                </li>

                <li>
                  <a href="#" className="text-gray-600 transition hover:text-blue-600">
                    FAQ
                  </a>
                </li>

                <li>
                  <a href="#" className="text-gray-600 transition hover:text-blue-600">
                    Careers
                  </a>
                </li>

                <li>
                  <a href="#" className="text-gray-600 transition hover:text-blue-600">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500">
              © 2024 Guidfy. All rights reserved.
            </p>
            
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="transition hover:text-blue-600">
                Terms of Service
              </a>
              <a href="#" className="transition hover:text-blue-600">
                Privacy Policy
              </a>
              <a href="#" className="transition hover:text-blue-600">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}