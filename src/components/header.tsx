"use client";

import { useState, useEffect } from "react";
import { useVideoStore } from "@/store/video-store";
import { Search, Menu, X, Flame } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  const { searchQuery, setSearchQuery, activeCategory, setActiveCategory } =
    useVideoStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl shadow-black/40"
          : "bg-gradient-to-b from-[#0a0a0a]/90 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10">
              <Image
                src="/logo.png"
                alt="PEKOB"
                width={40}
                height={40}
                className="rounded-xl object-cover ring-1 ring-white/10 group-hover:ring-red-500/30 transition-all duration-300"
              />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tighter bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              PEKOB
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6 lg:mx-10">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-red-400 transition-colors" />
              <input
                type="text"
                placeholder="Cari video..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-full text-sm text-white placeholder:text-muted-foreground/60 focus:outline-none focus:border-red-500/40 focus:bg-white/[0.07] focus:ring-2 focus:ring-red-500/10 transition-all duration-300"
              />
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink label="Beranda" onClick={() => setActiveCategory("")} />
            <NavLink label="Trending" icon={<Flame className="w-3.5 h-3.5" />} onClick={() => setActiveCategory("")} />
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors flex-shrink-0"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-5 pt-1 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari video..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-sm text-white placeholder:text-muted-foreground/60 focus:outline-none focus:border-red-500/40 transition-all"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-muted-foreground hover:text-white rounded-full hover:bg-white/[0.06] transition-all duration-200"
    >
      {icon}
      {label}
    </button>
  );
}
