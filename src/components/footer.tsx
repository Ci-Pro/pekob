"use client";

import { Flame, Tv, Heart, Film } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
                <Tv className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black tracking-tighter bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
                PEKOB
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Platform hiburan video terbaik. Tonton konten terbaru, film, musik,
              dan video viral hanya di PEKOB.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">
              Navigasi
            </h4>
            <ul className="space-y-2">
              {["Beranda", "Trending", "Film", "Musik"].map((item) => (
                <li key={item}>
                  <Link
                    href="/"
                    className="text-xs text-muted-foreground hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Kategori</h4>
            <ul className="space-y-2">
              {["Komedi", "Gaming", "Olahraga", "Kuliner"].map((item) => (
                <li key={item}>
                  <Link
                    href="/"
                    className="text-xs text-muted-foreground hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Tentang</h4>
            <ul className="space-y-2">
              {["Tentang Kami", "Kebijakan Privasi", "Ketentuan Layanan", "Kontak"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-xs text-muted-foreground">
                      {item}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PEKOB. Semua hak dilindungi.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Heart className="w-3 h-3 text-red-500" />
              Dibuat dengan <Film className="w-3 h-3" /> di Indonesia
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
