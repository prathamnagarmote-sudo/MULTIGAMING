"use client";

import { Gamepad2, Globe, MessageCircle, Video, Tv } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/[0.06] bg-[#08080c]/60">
      <div className="py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-heading font-black text-white tracking-wider uppercase">ZyloGames</span>
            </div>
            <p className="text-sm text-white/30 leading-relaxed mb-4">
              The next generation gaming platform. Play thousands of games instantly in your browser.
            </p>
            <div className="flex gap-3">
              {[Globe, MessageCircle, Video, Tv].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] transition-all">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: "Platform", links: ["Browse Games", "New Releases", "Trending", "Multiplayer", "Mobile Games"] },
            { title: "Community", links: ["Discord", "Forums", "Developers", "Blog", "Tournaments"] },
            { title: "Support", links: ["Help Center", "Contact Us", "Privacy Policy", "Terms of Service", "Cookie Policy"] },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-white/30 hover:text-white/60 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-white/20">
            © 2026 ZyloGames. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-xs text-white/20">
              <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
