import React from 'react';
import { Send, Github, Twitter, Database } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer
      id="site-footer"
      className="border-t border-[#222222] bg-[#050505] text-[#555555] mt-16 transition-colors"
    >
      {/* Upper Footer section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Editorial Description */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xl font-black tracking-tighter italic text-[#F27D26]">
                UX.EDITION
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] border-l border-[#222222] pl-3">
                XUSNIDDIN.DEV
              </span>
            </div>
            <p className="text-xs text-[#888888] max-w-sm leading-relaxed uppercase tracking-wider">
              Dasturlash, zamonaviy veb-arxitekturalar, sunʼiy intellekt va texnologik yangiliklar yoritiluvchi shaxsiy editorial platforma.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] font-bold uppercase tracking-widest text-[#777777]">
              <a
                href="https://t.me/qadamboyevxusniddin"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#F27D26] active:text-[#ff8f3d] transition-colors min-h-[38px] flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#F27D26] active:text-[#ff8f3d] transition-colors min-h-[38px] flex items-center gap-1.5"
              >
                <Twitter className="w-3.5 h-3.5" />
                <span>X (Twitter)</span>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white active:text-[#dddddd] transition-colors min-h-[38px] flex items-center gap-1.5"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F27D26]">
              Bo‘limlar
            </h4>
            <ul className="space-y-1 text-xs font-semibold uppercase tracking-wider text-[#777777]">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white active:text-[#F27D26] transition-colors cursor-pointer min-h-[36px] flex items-center"
                >
                  Bosh sahifa
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('news')}
                  className="hover:text-white active:text-[#F27D26] transition-colors cursor-pointer min-h-[36px] flex items-center"
                >
                  Barcha maqolalar
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('categories')}
                  className="hover:text-white active:text-[#F27D26] transition-colors cursor-pointer min-h-[36px] flex items-center"
                >
                  Kategoriyalar
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white active:text-[#F27D26] transition-colors cursor-pointer min-h-[36px] flex items-center"
                >
                  Muallif haqida
                </button>
              </li>
            </ul>
          </div>

          {/* System & Architecture */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F27D26]">
              Infratuzilma
            </h4>
            <ul className="space-y-1 text-xs font-semibold uppercase tracking-wider text-[#777777]">
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="hover:text-white active:text-[#F27D26] transition-colors cursor-pointer min-h-[36px] flex items-center"
                >
                  Admin Boshqaruvi
                </button>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  className="hover:text-white active:text-[#F27D26] transition-colors min-h-[36px] flex items-center"
                >
                  Sitemap XML
                </a>
              </li>
              <li>
                <a
                  href="/robots.txt"
                  target="_blank"
                  className="hover:text-white active:text-[#F27D26] transition-colors min-h-[36px] flex items-center"
                >
                  Robots TXT
                </a>
              </li>
              <li className="flex items-center gap-2 text-white pt-1 min-h-[36px]">
                <Database className="w-3.5 h-3.5 text-[#F27D26]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#aaaaaa]">
                  Cloud SQL Online
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Minimalist Bar matching Design HTML */}
      <div className="border-t border-[#222222] py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] font-medium text-[#555555] uppercase tracking-[0.2em]">
          <div className="flex flex-wrap items-center gap-4 sm:gap-8">
            <span>&copy; 2026 Personal Editorial</span>
            <span>Maxfiylik siyosati</span>
            <span>Foydalanish shartlari</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <span>PostgreSQL &bull; Drizzle</span>
            <div className="flex items-center gap-2 text-white">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>System Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
