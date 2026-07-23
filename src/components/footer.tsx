"use client";

import { Tv, Heart, Film } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:shadow-red-600/40 transition-shadow duration-300">
              <Tv className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-black tracking-tighter bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
              PEKOB
            </span>
          </Link>

          {/* Copyright */}
          <p className="text-[11px] text-muted-foreground/60">
            © {new Date().getFullYear()} PEKOB. Semua hak dilindungi.
          </p>

          {/* Credit */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
            <Heart className="w-3 h-3 text-red-500/70" />
            <span>Dibuat dengan</span>
            <Film className="w-3 h-3 text-red-500/70" />
            <span>di Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
