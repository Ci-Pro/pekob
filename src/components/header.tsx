"use client";

import { useState, useEffect } from "react";
import { useVideoStore } from "@/store/video-store";
import { Search, Menu, Flame, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

export function Header() {
  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    categories,
  } = useVideoStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setMobileMenuOpen(false);
  };

  return (
    <>
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
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0"
            >
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

            {/* Nav Links - Desktop */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                label="Beranda"
                onClick={() => setActiveCategory("")}
              />
              <NavLink
                label="Trending"
                icon={<Flame className="w-3.5 h-3.5" />}
                onClick={() => setActiveCategory("")}
              />
            </nav>

            {/* Mobile Search Bar */}
            <div className="md:hidden flex-1 mx-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-full text-[13px] text-white placeholder:text-muted-foreground/40 focus:outline-none focus:border-red-500/30 focus:bg-white/[0.06] transition-all duration-300"
                />
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors flex-shrink-0"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[85vw] max-w-sm bg-[#0f0f0f] border-r border-white/[0.06] p-0 overflow-y-auto"
        >
          {/* Header */}
          <SheetHeader className="p-5 pb-3 border-b border-white/[0.06]">
            <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9">
                <Image
                  src="/logo.png"
                  alt="PEKOB"
                  width={36}
                  height={36}
                  className="rounded-xl object-cover ring-1 ring-white/10"
                />
              </div>
              <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                PEKOB
              </span>
            </div>
          </SheetHeader>

          {/* Navigation Links */}
          <div className="px-3 py-1">
            <MobileNavLink
              icon={<Home className="w-4.5 h-4.5" />}
              label="Beranda"
              isActive={!activeCategory && !searchQuery}
              onClick={() => handleCategoryClick("")}
            />
            <MobileNavLink
              icon={<Flame className="w-4.5 h-4.5" />}
              label="Trending"
              isActive={false}
              onClick={() => handleCategoryClick("")}
            />
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <>
              <Separator className="bg-white/[0.04] mx-4 my-2" />
              <div className="px-4 pb-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 px-2 mb-2">
                  Kategori
                </p>
                <div className="space-y-0.5">
                  <MobileNavLink
                    label="Semua"
                    isActive={!activeCategory && !searchQuery}
                    onClick={() => handleCategoryClick("")}
                  />
                  {categories.map((category) => (
                    <MobileNavLink
                      key={category}
                      label={category}
                      isActive={activeCategory === category}
                      onClick={() =>
                        handleCategoryClick(
                          activeCategory === category ? "" : category
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Footer info inside sheet */}
          <div className="mt-auto p-4 border-t border-white/[0.04]">
            <p className="text-[11px] text-muted-foreground/40">
              © {new Date().getFullYear()} PEKOB
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
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

function MobileNavLink({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon?: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-red-600/15 text-red-400 border border-red-500/20"
          : "text-white/70 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      {icon && <span className="opacity-70">{icon}</span>}
      <span className="flex-1 text-left">{label}</span>
      {isActive && (
        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
      )}
    </motion.button>
  );
}
