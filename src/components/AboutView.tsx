import React from 'react';
import { Send, Github, Twitter, Mail, Code, Sparkles, Terminal, Award } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div id="about-page" className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-white">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-12 pb-12 border-b border-[#222222]">
        <div className="relative">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-[2px] bg-[#111111] text-[#F27D26] flex items-center justify-center font-black text-3xl sm:text-4xl shadow-xl border border-[#333333]">
            XQ
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center" title="Aktiv" />
        </div>

        <div className="text-center sm:text-left space-y-3 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] text-[10px] font-black uppercase tracking-wider bg-[#F27D26] text-black">
            <Sparkles className="w-3.5 h-3.5" />
            Dasturchi & Muallif
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            Xusniddin Qadamboyev
          </h1>
          <p className="text-sm text-[#888888] leading-relaxed max-w-xl uppercase tracking-wider">
            Zamonaviy veb-texnologiyalar, bulutli infratuzilma, sunʼiy intellekt modellarining integratsiyasi va toza dasturiy arxitekturalarga qiziquvchi dasturchi va muallif.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-start gap-3 pt-2 w-full sm:w-auto">
            <a
              href="https://t.me/qadamboyevxusniddin"
              target="_blank"
              rel="noreferrer"
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[2px] text-[11px] font-black uppercase tracking-wider bg-[#0088cc] hover:bg-[#0077b5] text-white transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Telegram kanal</span>
            </a>
            <a
              href="mailto:qadamboyevxusniddin105@gmail.com"
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[2px] text-[11px] font-black uppercase tracking-wider border border-[#333333] bg-[#121212] text-white hover:border-[#666666] transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Bog‘lanish</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mission & Philosophy */}
      <div className="space-y-8 text-[#cccccc]">
        <section className="space-y-3">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F27D26]">
            EDITORIAL MANIFESTO
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#F27D26]" />
            Blogning maqsadi va vazifasi
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-[#888888]">
            Ushbu platforma zamonaviy dasturlash olamidagi yangiliklar, ilg‘or arxitekturalar (Next.js, TypeScript, PostgreSQL, Drizzle ORM, Docker) hamda amaliy tajribalar bilan o‘zbek tilida sifatli va batafsil bo‘lishish uchun yaratilgan.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-[#888888]">
            Bugungi kunda texnologiyalar nihoyatda tez surʼatlarda o‘zgarmoqda. Sunʼiy intellekt inqilobi, katta hajmdagi maʼlumotlar bazalari va bulutli platformalar har bir dasturchidan doimiy ravishda yangilanib borishni talab qiladi. Biz shu o‘zgarishlarning markazida bo‘lishga intilamiz.
          </p>
        </section>

        {/* Tech Stack Pillars */}
        <section className="pt-6 border-t border-[#222222] space-y-4">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F27D26]">
            FOCUS DOMAINS
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Code className="w-5 h-5 text-[#F27D26]" />
            Asosiy texnologik yo‘nalishlar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-[2px] border border-[#222222] bg-[#0A0A0A] hover:border-[#F27D26]/60 transition-colors">
              <h4 className="font-black uppercase tracking-tight text-xs sm:text-sm text-white mb-2">
                ⚡ Full-Stack Web Development
              </h4>
              <p className="text-xs text-[#888888] leading-relaxed">
                React, Next.js, Node.js, Express, Tailwind CSS va TypeScript asosida yuqori tezlikka ega veb-ilovalarni yaratish.
              </p>
            </div>

            <div className="p-5 rounded-[2px] border border-[#222222] bg-[#0A0A0A] hover:border-[#F27D26]/60 transition-colors">
              <h4 className="font-black uppercase tracking-tight text-xs sm:text-sm text-white mb-2">
                🗄️ Database & Cloud Infrastructure
              </h4>
              <p className="text-xs text-[#888888] leading-relaxed">
                PostgreSQL, Google Cloud SQL, Drizzle ORM, Redis, va ishonchli kiberxavfsizlik protokollari.
              </p>
            </div>

            <div className="p-5 rounded-[2px] border border-[#222222] bg-[#0A0A0A] hover:border-[#F27D26]/60 transition-colors">
              <h4 className="font-black uppercase tracking-tight text-xs sm:text-sm text-white mb-2">
                🤖 Sunʼiy intellekt (AI) & LLM integratsiyasi
              </h4>
              <p className="text-xs text-[#888888] leading-relaxed">
                Gemini API, RAG (Retrieval-Augmented Generation) tizimlari va agentic AI arxitekturalari.
              </p>
            </div>

            <div className="p-5 rounded-[2px] border border-[#222222] bg-[#0A0A0A] hover:border-[#F27D26]/60 transition-colors">
              <h4 className="font-black uppercase tracking-tight text-xs sm:text-sm text-white mb-2">
                🔒 Kiberxavfsizlik & Autentifikatsiya
              </h4>
              <p className="text-xs text-[#888888] leading-relaxed">
                Firebase Auth, OAuth 2.0, RBAC (Role-Based Access Control) va zamonaviy xavfsizlik standartlari.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
