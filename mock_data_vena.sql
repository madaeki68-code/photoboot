-- Mock Data for Vena Pictures Portfolio (CLEAN - TEXT ONLY)
-- Run this in your Supabase SQL Editor
-- This script ONLY populates text content. 
-- No image references are included so you can upload them manually via Dashboard.

-- 1. Insert Global Settings (Text Content Only)
INSERT INTO settings (key, value) VALUES 
('site_title', '"Vena Pictures | Narasi Visual & Fotografi Seni"'),
('site_logo_text', '"VENA"'),
('site_footer_text', '"VENA PICTURES"'),
('hero_title', '"MENANGKAP ESENSI"'),
('hero_subtitle', '"Fotografi Naratif oleh Vena Pictures"'),

-- About & Philosophy (Text Only)
('about_title', '"Setiap foto adalah cerita yang menunggu untuk diceritakan kembali."'),
('about_description', '"Vena Pictures hadir untuk mengabadikan momen-momen paling murni dan emosional dalam hidup Anda melalui pendekatan artistik dan dokumenter."'),
('about_location', '"Jakarta, Indonesia"'),
('about_philosophy_title', '"SENI DALAM PENGAMATAN"'),
('about_philosophy_desc', '"Kami percaya bahwa fotografi terbaik tidak direncanakan, melainkan diamati. Kami berfokus pada hubungan antar manusia, cahaya alami, dan emosi yang jujur untuk menciptakan kenangan yang abadi."'),

-- Gallery Settings (Text Only)
('gallery_hero_title', '"ARSIP VISUAL"'),
('gallery_hero_subtitle', '"Koleksi cerita pilihan yang dirangkum dalam bingkai waktu."'),
('gallery_featured_title', '"The Sacred Union"'),
('gallery_featured_subtitle', '"Eksplorasi emosi dalam pernikahan tradisional Indonesia."'),

-- Contact & Socials
('contact_email', '"halo@venapictures.com"'),
('contact_address', '"Berdasarkan di Jakarta Selatan, melayani seluruh Indonesia."'),
('social_instagram', '"venapictures"'),
('social_twitter', '"venapictures"'),
('social_pexels', '"venapictures"'),

-- Complex Content (JSONB Arrays - NO IMAGES)
('site_services', '[
  {"num": "01", "title": "Pernikahan & Elopement", "desc": "Mendokumentasikan hari bahagia Anda dengan gaya sinematik dan jujur."},
  {"num": "02", "title": "Potret Editorial", "desc": "Sesi foto kreatif untuk branding pribadi atau kebutuhan publikasi mode."},
  {"num": "03", "title": "Dokumentasi Acara", "desc": "Menangkap atmosfer dan interaksi penting dalam acara spesial Anda."},
  {"num": "04", "title": "Foto Produk & Komersial", "desc": "Visual berkualitas tinggi untuk meningkatkan nilai estetika brand Anda."}
]'),
('site_testimonials', '[
  {"name": "Adinda Putri", "location": "Bali", "quote": "Tim Vena benar-benar tahu cara membuat kami nyaman di depan kamera. Hasilnya sangat luar biasa dan terasa sangat personal."},
  {"name": "Bima Arya", "location": "Jakarta", "quote": "Pendekatan mereka sangat profesional namun tetap hangat. Foto pernikahan kami terlihat seperti cuplikan film klasik."}
]'),
('site_stats', '[
  {"label": "Tahun Pengalaman", "value": "07+"},
  {"label": "Pernikahan Abadi", "value": "300+"},
  {"label": "Klien Bahagia", "value": "500+"},
  {"label": "Penghargaan", "value": "12"}
]'),
('services_process', '[
  {"step": "01", "title": "Konsultasi", "desc": "Berbagi ide dan visi untuk menentukan konsep yang paling sesuai."},
  {"step": "02", "title": "Eksekusi", "desc": "Proses pemotretan dengan arahan yang santai namun tetap artistik."},
  {"step": "03", "title": "Kurasi", "desc": "Pemilihan dan penyuntingan foto dengan palet warna khas Vena."}
]'),
('services_packages', '[
  {"name": "Essential", "price": "5.500.000", "features": ["6 Jam Pemotretan", "1 Fotografer", "100 Foto Diedit", "Galeri Online"]},
  {"name": "Legacy", "price": "12.500.000", "features": ["12 Jam Pemotretan", "2 Fotografer", "Semua Foto Terbaik", "Album Fisik Premium", "Cinematic Video Preview"]}
]'),
('contact_faq', '[
  {"q": "Berapa lama hasil fotonya jadi?", "a": "Pratinjau dikirim dalam 48 jam, dan galeri lengkap dalam 4-6 minggu."},
  {"q": "Apakah bisa ke luar kota?", "a": "Tentu, kami senang menjelajahi tempat baru. Biaya akomodasi akan disesuaikan."},
  {"q": "Bagaimana cara booking?", "a": "Anda bisa mengisi formulir atau WhatsApp kami untuk mengecek ketersediaan tanggal."}
]')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 3. Insert Projects (Text Only)
INSERT INTO projects (title, location, tag, description, "order") VALUES 
('The Minimalist Bride', 'Jakarta', 'Wedding', 'Eksplorasi kesederhanaan dan keanggunan dalam pernikahan modern di tengah kota.', 0),
('Java Heritage', 'Yogyakarta', 'Traditional', 'Mengabadikan kekayaan budaya Jawa dalam upacara siraman yang khidmat.', 1),
('Editorial Flow', 'Bandung', 'Editorial', 'Sesi foto mode dengan pencahayaan dramatis dan komposisi geometris.', 2);
