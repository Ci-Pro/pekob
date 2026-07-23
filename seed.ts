import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demoVideos = [
  {
    title: "Keajaiban Sunset di Pantai Nusa Dua - Cinematic 4K",
    description:
      "Nikmati keindahan matahari terbenam yang memukau di Pantai Nusa Dua, Bali. Potret sinematik yang menampilkan gradasi warna langit dari emas ke ungu di atas ombak yang tenang.",
    category: "Dokumenter",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "/uploads/thumbnails/thumb1.png",
    duration: "15:42",
    views: 245000,
    isFeatured: true,
  },
  {
    title: "Cyber City: Neon Nights - Film Pendek Sci-Fi",
    description:
      "Film pendek bergenre cyberpunk yang mengisahkan tentang seorang hacker di kota futuristik penuh neon. Visual efek memukau dan cerita yang menegangkan.",
    category: "Film",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "/uploads/thumbnails/thumb2.png",
    duration: "22:18",
    views: 187000,
    isFeatured: true,
  },
  {
    title: "Aurora Borealis: Cahaya Utara yang Misterius",
    description:
      "Dokumenter eksklusif tentang Aurora Borealis yang difilmkan di Norwegia utara. Saksikan tarian cahaya di langit malam yang memukau.",
    category: "Dokumenter",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnailUrl: "/uploads/thumbnails/thumb3.png",
    duration: "35:10",
    views: 312000,
    isFeatured: true,
  },
  {
    title: "Chef Bandung Masak Rendang Autentik - Masterclass",
    description:
      "Belajar memasak rendang autentik ala Minangkabau bersama Chef terkenal dari Bandung. Resep turun-temurun yang bikin nagih!",
    category: "Kuliner",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnailUrl: "/uploads/thumbnails/thumb4.png",
    duration: "18:55",
    views: 156000,
    isFeatured: false,
  },
  {
    title: "Kucing Lucu Bikin Ketawa Ngakak - Compilation #47",
    description:
      "Kompilasi kucing paling lucu dan menggemaskan minggu ini. Dari kucing tidur aneh sampai kucing yang salah tingkah. Wajib tonton!",
    category: "Komedi",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    thumbnailUrl: "/uploads/thumbnails/thumb5.png",
    duration: "12:30",
    views: 890000,
    isFeatured: false,
  },
  {
    title: "Dewa 19 Live Konser Reunion - Full Concert 2024",
    description:
      "Konser reuni spektakuler Dewa 19 di Jakarta. Menampilkan lagu-lagu hits dari era 90-an hingga sekarang. Atmosfer luar biasa!",
    category: "Musik",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    thumbnailUrl: "/uploads/thumbnails/thumb6.png",
    duration: "1:25:00",
    views: 1200000,
    isFeatured: false,
  },
  {
    title: "Timnas Indonesia vs Thailand - Highlight Pertandingan",
    description:
      "Highlight pertandingan seru antara Timnas Indonesia vs Thailand di kualifikasi Piala Dunia 2026. Gol-gol spektakuler dan momen tak terlupakan.",
    category: "Olahraga",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    thumbnailUrl: "/uploads/thumbnails/thumb7.png",
    duration: "10:45",
    views: 2100000,
    isFeatured: false,
  },
  {
    title: "Anak Anjing Lucu Bermain di Taman - Cute Overload",
    description:
      "Video menggemaskan anak-anak golden retriever bermain di taman. Sinterklas datang untuk memberikan kejutan spesial. Terlalu manis!",
    category: "Viral",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    thumbnailUrl: "/uploads/thumbnails/thumb8.png",
    duration: "8:20",
    views: 560000,
    isFeatured: false,
  },
];

async function seed() {
  console.log("🌱 Seeding demo videos to PEKOB...");

  // Clear existing videos
  await prisma.video.deleteMany({}).catch(() => {});

  for (const video of demoVideos) {
    const created = await prisma.video.create({ data: video });
    console.log(`  ✓ Created: ${created.title}`);
  }

  const count = await prisma.video.count();
  console.log(`\n🎉 Seeded ${count} videos successfully!`);
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
