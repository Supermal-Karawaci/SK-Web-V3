// src/components/Footer.tsx
// Fixed: Replaced all hardcoded colors with theme-aware CSS variables and semantic tokens

import React, { useState } from 'react';
import { Instagram, Mail, Phone, MapPin, Clock, Car, Wifi, Shield, User, Gift, CreditCard } from 'lucide-react';

// Custom TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  const quickLinks = [
    { name: "Store Directory", href: "/directory" },
    { name: "Events Calendar", href: "/event" },
    { name: "Promotions", href: "/promotions" },
    { name: "Career", href: "https://id.jobstreet.com/id/companies/supermal-karawaci-168555177482351" }
  ];

  const services = [
    {
      name: "Spacious Parking",
      description: "3000+ spaces",
      icon: Car
    },
    {
      name: "Free WiFi",
      description: "High-speed internet",
      icon: Wifi
    },
    {
      name: "Multiple Payment",
      description: "Cash, card, e-wallet",
      icon: CreditCard
    },
    {
      name: "24/7 Security",
      description: "Safe & secure",
      icon: Shield
    },
    {
      name: "Specialties Tenants",
      description: "Only at Supermal Karawaci",
      icon: Gift
    },
    {
      name: "Customer Service",
      description: "Always ready to help",
      icon: User
    }
  ];

  const socialLinks = [
    { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/supermalkarawaci/" },
    { name: "TikTok", icon: TikTokIcon, href: "https://www.tiktok.com/@supermalkarawaci" },
  ];

  return (
    <footer className="relative overflow-hidden bg-surface-secondary">
      {/* Accent background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface-tertiary via-surface-secondary to-surface-tertiary"></div>

      {/* Background pattern overlay with theme-aware accent */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent rounded-full -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full translate-x-48 translate-y-48"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent rounded-full -translate-x-32 -translate-y-32"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 md:mb-16 text-center md:text-left">
          <div className="mb-6 md:mb-0">
            <img
              src="https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Logo/Logo%20SK%20Putih-Compress.png"
              alt="Supermal Karawaci"
              className="h-16 md:h-20 w-auto mx-auto md:mx-0"
            />
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="text-center">
              <MapPin className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-xs text-text-secondary font-medium">Tangerang</p>
            </div>
            <div className="text-center">
              <Phone className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-xs text-text-secondary font-medium">+62 21 5466666</p>
            </div>
            <div className="text-center">
              <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-xs text-text-secondary font-medium">10 AM - 10 PM</p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold heading-accent mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-text-secondary hover:text-accent transition-colors text-sm font-medium">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Grid */}
          <div className="md:col-span-2 lg:col-span-2">
            <h4 className="text-lg font-semibold heading-accent mb-6">Our Services</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((service) => (
                <div key={service.name} className="flex items-start space-x-3 p-4 rounded-xl bg-accent-subtle hover:bg-accent-subtle/70 transition-colors border border-border-secondary">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <service.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h5 className="text-text-primary font-medium text-sm">{service.name}</h5>
                    <p className="text-text-secondary text-xs">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold heading-accent mb-6">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    105 Boulevard Diponegoro #00-00<br />
                    Klp. Dua, Kec. Kelapa Dua<br />
                    Kab. Tangerang, Banten 15811
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                <p className="text-sm text-text-secondary">contact.us@supermalkarawaci.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-border-primary pt-8 md:pt-12 mb-8 md:mb-12">
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-2">Stay Connected</h3>
            <p className="text-text-secondary">Subscribe to our newsletter for exclusive offers, events, and updates</p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-accent-subtle border border-border-primary text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                required
              />
              <button
                type="submit"
                disabled={isSubmitted}
                className="px-6 py-3 bg-accent text-text-inverse font-semibold rounded-lg hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isSubmitted ? 'Subscribed!' : 'Subscribe'}
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border-primary pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 mb-4 md:mb-0 text-center sm:text-left">
            <p className="text-text-secondary text-sm">© 2026 Supermal Karawaci. All rights reserved. Developed by <a href="https://algan.id" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover transition-colors">Marcomm</a></p>
          </div>

          <div className="flex items-center space-x-1 mt-4 md:mt-0">
            <span className="text-text-secondary text-sm mr-3">Follow us:</span>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="w-10 h-10 bg-accent-subtle border border-border-primary rounded-full flex items-center justify-center hover:bg-accent hover:border-accent hover:text-text-inverse transition-colors group"
              >
                <social.icon className="w-5 h-5 text-accent group-hover:text-text-inverse transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;