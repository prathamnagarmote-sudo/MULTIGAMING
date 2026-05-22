"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, Bell, User } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Browse Games", href: "/browse" },
  { name: "Multiplayer", href: "/multiplayer" },
  { name: "Esports", href: "/esports" },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setScrolled(latest > 50);
  });

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "glass border-b border-white/10 shadow-lg shadow-black/50 py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group relative z-10">
          <div className="text-2xl font-heading font-black text-white tracking-widest uppercase">
            Nexus<span className="text-electric-blue text-glow-blue">.</span>
          </div>
          <div className="absolute -inset-2 bg-electric-blue/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center space-x-8 z-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group font-sans tracking-wide uppercase"
            >
              {link.name}
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-electric-blue group-hover:w-full transition-all duration-300 shadow-[0_0_10px_#00F0FF]" />
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-6 z-10">
          <div className="relative group hidden lg:block">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-48 bg-white/5 border border-white/10 rounded-full py-1.5 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-electric-blue/50 transition-all group-hover:bg-white/10"
            />
            <Search className="w-4 h-4 text-white/50 absolute right-3 top-1/2 -translate-y-1/2 group-hover:text-electric-blue transition-colors" />
            <div className="absolute inset-0 bg-electric-blue/10 blur-md opacity-0 group-focus-within:opacity-100 rounded-full -z-10 transition-opacity" />
          </div>

          <button className="text-white/70 hover:text-white hover:text-glow-purple transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-neon-pink rounded-full box-glow-purple" />
          </button>
          
          <button className="w-10 h-10 rounded-full glass border border-white/20 flex items-center justify-center hover:border-electric-blue transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-electric-blue to-neon-purple opacity-0 group-hover:opacity-20 transition-opacity" />
            <User className="w-5 h-5 text-white/80 group-hover:text-white transition-colors relative z-10" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
