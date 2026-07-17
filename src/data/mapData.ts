export interface MachineData {
  id: string;
  name: string;
  type: 'circle' | 'bar' | 'cell';
  left: number; // in pixels
  top: number;
  width?: number; // in pixels
  height?: number;
  status: 'running' | 'idle' | 'maintenance';
  hasDot?: boolean;
  isPink?: boolean;
  details: string;
  operator: string;
  efficiency: number; // percentage
}

export interface ZoneData {
  id: string;
  name: string;
  left: number; // in pixels
  top: number;
  width: number;
  height: number;
  backgroundColor?: string;
  machines: MachineData[];
  details: string;
}

export interface BuildingData {
  id: string;
  name: string;
  code: string;
  points: string; // SVG percentage polygon points
  width: number; // meters
  length: number; // meters
  area: number; // m²
  details: string;
  zones: string[];
  operationalStatus: string;
}

export const buildings: BuildingData[] = [
  {
    id: "bld-office",
    name: "OFFICE (Gedung Kantor Utama)",
    code: "Gedung Kantor",
    points: "12,76 34,76 34,85 12,85",
    width: 25,
    length: 15,
    area: 375,
    details: "Pusat administrasi, manajemen, divisi HRD, keuangan, dan ruang pertemuan utama PT Menara Terus Makmur.",
    zones: [],
    operationalStatus: "Aktif (Jam Kantor)"
  },
  {
    id: "bld-dies",
    name: "PRODUCTION 1 (Gedung Produksi 1)",
    code: "Production 1",
    points: "12,45 34,45 34,76 12,76",
    width: 25,
    length: 60,
    area: 1500,
    details: "Gedung khusus fabrikasi, penyimpanan, dan perawatan cetakan presisi tinggi (dies) untuk forging dan stamping.",
    zones: ["PJ"],
    operationalStatus: "Normal Operasional"
  },
  {
    id: "bld-forging",
    name: "FORGING (Gedung Penempaan)",
    code: "Area Forging",
    points: "12,24 34,24 34,43 12,43",
    width: 25,
    length: 30,
    area: 750,
    details: "Area utama proses hot and cold forging untuk pembentukan dasar material logam suku cadang otomotif.",
    zones: ["F-LINE"],
    operationalStatus: "Normal Operasional"
  },
  {
    id: "bld-cutting",
    name: "CUTTING (Gedung Pemotongan Bahan)",
    code: "Area Cutting",
    points: "13,15 48,15 48,23 13,23",
    width: 10,
    length: 35,
    area: 350,
    details: "Fasilitas pemotongan awal raw material (kawat baja/rod) sesuai ukuran standar produksi.",
    zones: ["GUDANG-KORIDOR"],
    operationalStatus: "Normal Operasional"
  },
  {
    id: "bld-shotblasting",
    name: "SHOTBLASTING (Gedung Pembersihan Logam)",
    code: "Area Blasting",
    points: "40,24 50,24 50,39 40,39",
    width: 10,
    length: 20,
    area: 200,
    details: "Area pembersihan kerak hasil penempaan menggunakan tembakan partikel baja (steel shot) untuk finishing permukaan.",
    zones: ["TW"],
    operationalStatus: "Normal Operasional"
  },
  {
    id: "bld-admin-delivery",
    name: "admin delivery (Gedung Logistik & Pengiriman)",
    code: "Admin Delivery",
    points: "49,37 69,37 69,57 49,57",
    width: 20,
    length: 30,
    area: 600,
    details: "Kantor admin logistik, perencanaan pengiriman barang jadi, dan koordinasi armada truk ekspedisi.",
    zones: [],
    operationalStatus: "Sibuk (Bongkar Muat)"
  },
  {
    id: "bld-packaging",
    name: "PACKAGING (Gedung Pengemasan)",
    code: "Area Packing",
    points: "42,60 63,60 63,77 42,77",
    width: 25,
    length: 30,
    area: 750,
    details: "Stasiun akhir perakitan kecil, inspeksi visual kualitas akhir (QC), pengemasan boks, pelabelan, dan palletizing ekspor.",
    zones: [],
    operationalStatus: "Normal Operasional"
  },
  {
    id: "bld-pos-satpam",
    name: "POS SATPAM",
    code: "Pos Satpam",
    points: "37,80 43,80 43,84 37,84",
    width: 6,
    length: 6,
    area: 36,
    details: "Pos penjagaan utama pintu gerbang pabrik untuk kontrol masuk/keluar karyawan, tamu, dan truk logistik.",
    zones: [],
    operationalStatus: "Siaga 24 Jam"
  },
  {
    id: "bld-masjid",
    name: "MASJID",
    code: "Fasilitas Masjid",
    points: "57,79 65,79 67,84 61,88 55,84",
    width: 12,
    length: 15,
    area: 180,
    details: "Masjid utama kompleks pabrik PT MTM untuk sarana ibadah karyawan dan kegiatan keagamaan.",
    zones: [],
    operationalStatus: "Buka"
  },
  {
    id: "bld-tps",
    name: "TPS (Tempat Penampungan Sementara)",
    code: "Area TPS",
    points: "57,14 70,14 70,18 57,18",
    width: 5,
    length: 15,
    area: 75,
    details: "Area penampungan sampah umum dan pemilahan limbah produksi sebelum diangkut dinas kebersihan luar.",
    zones: [],
    operationalStatus: "Aktif"
  },
  {
    id: "bld-kebun",
    name: "KEBUN (Ruang Terbuka Hijau)",
    code: "Taman Hijau",
    points: "58,20 70,20 70,36 58,36",
    width: 15,
    length: 25,
    area: 375,
    details: "Area penghijauan, taman santai karyawan saat jam istirahat, dan resapan air pabrik.",
    zones: [],
    operationalStatus: "Buka"
  },
  {
    id: "bld-b3",
    name: "B3 (Gudang Bahan Berbahaya & Beracun)",
    code: "Gudang Limbah B3",
    points: "74,13 97,13 97,16 74,16",
    width: 4,
    length: 25,
    area: 100,
    details: "Gudang penyimpanan khusus bahan kimia dan limbah beracun B3 industri dengan standar keselamatan tinggi.",
    zones: [],
    operationalStatus: "Normal Terkontrol"
  },
  {
    id: "bld-gardu-listrik",
    name: "GARDU LISTRIK (Substasiun Listrik Pabrik)",
    code: "Gardu Listrik",
    points: "40,42 48,42 48,50 40,50",
    width: 10,
    length: 10,
    area: 100,
    details: "Pusat pembagi daya listrik tegangan tinggi PLN untuk menyuplai seluruh kebutuhan mesin penempa dan kantor.",
    zones: [],
    operationalStatus: "Normal Terkontrol"
  },
  {
    id: "bld-production-2",
    name: "PRODUCTION 2 (Gedung Produksi 2)",
    code: "Gedung Produksi 2",
    points: "73,25 99,25 99,43 73,43",
    width: 20,
    length: 35,
    area: 700,
    details: "Lini pemesinan tahap akhir, penguliran sekunder, pengeboran, dan pengujian kekuatan.",
    zones: ["F-11"],
    operationalStatus: "Normal Operasional"
  },
  {
    id: "bld-production-1",
    name: "PRODUCTION 3 (Gedung Produksi 3)",
    code: "Production 3",
    points: "73,46 99,46 99,66 73,66",
    width: 25,
    length: 35,
    area: 875,
    details: "Pusat perbautan otomotif, mesin CNC Machine Shop, dan penempatan lini mesin pemesinan utama (UB-67, LBJ, dll).",
    zones: ["MACHINE SHOP"],
    operationalStatus: "Normal Operasional"
  },
  {
    id: "bld-dojo",
    name: "DOJO (Pusat Pelatihan Karyawan)",
    code: "Gedung Dojo",
    points: "79,66 90,66 90,83 79,83",
    width: 12,
    length: 20,
    area: 240,
    details: "Tempat training keselamatan kerja (safety training), pelatihan teknik dasar karyawan baru, dan sertifikasi keahlian.",
    zones: [],
    operationalStatus: "Aktif (Sesi Pelatihan)"
  },
  {
    id: "bld-parkir-mobil",
    name: "PARKIR MOBIL (Fasilitas Parkir Staf/Tamu)",
    code: "Parkir Mobil",
    points: "73,69 79,69 79,83 73,83",
    width: 6,
    length: 20,
    area: 120,
    details: "Area parkir kendaraan roda empat untuk staf manajemen, direksi, tamu perusahaan, dan operasional.",
    zones: [],
    operationalStatus: "Normal"
  },
  {
    id: "bld-parkir-motor",
    name: "PARKIR MOTOR (Fasilitas Parkir Karyawan)",
    code: "Parkir Motor",
    points: "73,84 93,84 93,89 73,89",
    width: 6,
    length: 25,
    area: 150,
    details: "Fasilitas parkir beratap luas khusus untuk sepeda motor seluruh operator dan staf pabrik PT MTM.",
    zones: [],
    operationalStatus: "Normal"
  },
  {
    id: "bld-trafo",
    name: "TRAFO (Transformator Listrik Pabrik)",
    code: "Gedung Trafo",
    points: "74,17 81,17 81,23 74,23",
    width: 8,
    length: 8,
    area: 64,
    details: "Transformator daya listrik pembagi tegangan utama pabrik.",
    zones: [],
    operationalStatus: "Normal Terkontrol"
  },
  {
    id: "bld-kompresor",
    name: "KOMPRESOR (Stasiun Udara Bertekanan)",
    code: "Stasiun Kompresor",
    points: "82,17 89,17 89,23 82,23",
    width: 8,
    length: 8,
    area: 64,
    details: "Stasiun kompresor udara bertekanan tinggi untuk mensuplai sistem pneumatik mesin produksi.",
    zones: [],
    operationalStatus: "Normal Operasional"
  },
  {
    id: "bld-docking",
    name: "DOCKING AREA (Area Bongkar Muat)",
    code: "Area Docking",
    points: "40,51 48,51 48,57 40,57",
    width: 10,
    length: 15,
    area: 150,
    details: "Area parkir truk dan kontainer untuk kegiatan bongkar muat raw material dan barang jadi.",
    zones: [],
    operationalStatus: "Aktif (Bongkar Muat)"
  }
];

export const zones: ZoneData[] = [
  {
    id: "F-LINE",
    name: "F-LINE (Production Line F)",
    left: 177,
    top: 176,
    width: 228,
    height: 338,
    details: "Lini produksi utama untuk pembentukan logam awal, pemotongan dingin, dan proses perataan fastener.",
    machines: [
      { id: "F-9", name: "F-9", type: "circle", left: 12, top: 20, status: "running", efficiency: 94, operator: "Ahmad Subarjo", details: "Cold-heading machine tipe otomatis untuk baut ukuran sedang." },
      { id: "F-8", name: "F-8", type: "bar", left: 85, top: 20, width: 42, height: 148, status: "running", efficiency: 88, operator: "Budi Santoso", details: "Belt conveyor line untuk transportasi blank bolt dari F-9." },
      { id: "F-10", name: "F-10", type: "bar", left: 154, top: 20, width: 42, height: 148, status: "idle", efficiency: 72, operator: "Cecep Sunandar", details: "Lini penyortiran magnetik otomatis untuk mendeteksi cacat bentuk." },
      { id: "F-5", name: "F-5", type: "circle", left: 12, top: 101, status: "running", efficiency: 91, operator: "Dedi Kusnadi", details: "Rotary metal puncher untuk plat pengunci washer." },
      { id: "F-1", name: "F-1", type: "circle", left: 12, top: 182, status: "maintenance", efficiency: 0, operator: "Rian Hidayat (Teknisi)", details: "Pembersih ultrasonik. Sedang dalam perawatan berkala sensor suhu." },
      { id: "F-4", name: "F-4", type: "circle", left: 12, top: 263, status: "running", isPink: true, efficiency: 85, operator: "Eko Prasetyo", details: "Mesin cold heading khusus presisi tinggi dengan sistem deteksi tekanan piezoelektrik." },
      { id: "F-6", name: "F-6", type: "bar", left: 85, top: 182, width: 42, height: 122, status: "running", efficiency: 86, operator: "Fahri Hamzah", details: "Mesin rolling ulir (Thread Roller) untuk pembuat drat luar." },
      { id: "F-7", name: "F-7", type: "bar", left: 154, top: 182, width: 42, height: 122, status: "running", efficiency: 89, operator: "Gunawan Wibisono", details: "Thread roller sekunder untuk ulir kasar pitch tinggi." }
    ]
  },
  {
    id: "TW",
    name: "TW (Tool Workshop)",
    left: 428,
    top: 182,
    width: 116,
    height: 243,
    backgroundColor: "#cfe4e0",
    details: "Area khusus fabrikasi cetakan (molds/dies), pengasahan cutter, perbaikan clamping, dan kalibrasi mikrometer.",
    machines: [
      { id: "Peralatan-TW", name: "Peralatan", type: "cell", left: 12, top: 20, width: 69, height: 47, status: "running", efficiency: 95, operator: "Heri Hermawan", details: "Gantungan perkakas pneumatik dan stasiun kunci torsi digital." },
      { id: "TW-Circle", name: "TW", type: "circle", left: 77, top: 81, status: "running", efficiency: 92, operator: "Indra Wijaya", details: "Mesin gerinda silindris presisi tinggi untuk dies punch." }
    ]
  },
  {
    id: "F-11",
    name: "F-11 Line",
    left: 725,
    top: 236,
    width: 131,
    height: 142,
    details: "Lini sekunder penempaan khusus dan pengecekan QC cepat untuk part custom industri otomotif.",
    machines: [
      { id: "F-11-Cell", name: "F-11", type: "cell", left: 8, top: 47, width: 54, height: 49, status: "running", efficiency: 87, operator: "Joko Susilo", details: "Mesin pemanas induksi frekuensi tinggi untuk pengerasan lokal fastener." }
    ]
  },
  {
    id: "PJ",
    name: "PJ / ASSY LINE",
    left: 177,
    top: 567,
    width: 228,
    height: 351,
    details: "Area perakitan komponen multi-proses, penggabungan baut/ring (washer assembly), dan pengepakan semi-otomatis.",
    machines: [
      { id: "Peralatan Kerja", name: "Peralatan Kerja", type: "cell", left: 8, top: 14, width: 85, height: 176, status: "running", efficiency: 90, operator: "Kurniawan", details: "Stasiun perakitan manual ergonomis yang dilengkapi dengan obeng torsi elektrik gantung." },
      { id: "PJ SFG", name: "PJ SFG", type: "cell", left: 108, top: 14, width: 69, height: 51, status: "running", efficiency: 89, operator: "Lukman Hakim", details: "Tempat penampungan sementara komponen setengah jadi sebelum dirakit." },
      { id: "PJ-Dot-1", name: "PJ-1", type: "circle", left: 185, top: 11, status: "running", isPink: true, efficiency: 93, operator: "Mulyadi", details: "Rotary washer assembler & presser untuk baut flange." },
      { id: "PJ FG1", name: "PJ FG1", type: "cell", left: 108, top: 78, width: 69, height: 51, status: "running", efficiency: 91, operator: "Nurdin", details: "Stasiun packing karton Finished Goods 1 untuk pasar domestik." },
      { id: "PJ-Dot-2", name: "PJ-2", type: "circle", left: 185, top: 76, status: "running", efficiency: 88, operator: "Oki Rahmat", details: "Mesin strapping karton otomatis dengan heat sealer." },
      { id: "PJ FG2", name: "PJ FG2", type: "cell", left: 108, top: 143, width: 69, height: 51, status: "running", efficiency: 94, operator: "Prabowo Subianto", details: "Stasiun packing Finished Goods 2 untuk pesanan ekspor (palletizing)." },
      { id: "PJ-Dot-3", name: "PJ-3", type: "circle", left: 185, top: 140, status: "running", efficiency: 92, operator: "Qomarudin", details: "Mesin timbangan digital otomatis dengan print barcode label." },
      { id: "SJ", name: "SJ", type: "cell", left: 8, top: 208, width: 54, height: 51, status: "running", efficiency: 90, operator: "Ridwan Kamil", details: "Stasiun inspeksi visual defect permukaan produk dengan kamera 4K AI." },
      { id: "PJ-Dot-4", name: "PJ-4", type: "circle", left: 68, top: 205, status: "running", isPink: true, efficiency: 96, operator: "Sandiaga Uno", details: "Mesin sorting otomatis berkecepatan tinggi dengan laser scanner." },
      { id: "Assy AC", name: "Assy AC", type: "cell", left: 108, top: 208, width: 69, height: 51, status: "running", efficiency: 85, operator: "Taufik Hidayat", details: "Stasiun perakitan baut bracket kompresor AC mobil." }
    ]
  },
  {
    id: "MACHINE SHOP",
    name: "MACHINE SHOP",
    left: 725,
    top: 412,
    width: 293,
    height: 392,
    details: "Pusat pemesinan sekunder termasuk threading, drilling, chamfering, pemotongan presisi, dan uji beban patah.",
    machines: [
      // Row 1
      { id: "LBJ", name: "LBJ", type: "cell", left: 8, top: 20, width: 42, height: 49, status: "running", efficiency: 90, operator: "Ujang", details: "Mesin bubut presisi tinggi untuk pembuatan ujung runcing baut." },
      { id: "Ball", name: "Ball", type: "cell", left: 56, top: 20, width: 42, height: 49, status: "running", efficiency: 86, operator: "Vicky", details: "Mesin milling untuk pembentukan kepala baut bola (ball joint bolt)." },
      { id: "Cone", name: "Cone", type: "cell", left: 105, top: 20, width: 42, height: 49, status: "running", hasDot: true, efficiency: 92, operator: "Wawan", details: "Mesin bubut lancip untuk pembuatan anchor cone bolt." },
      { id: "HCA", name: "HCA", type: "cell", left: 154, top: 20, width: 42, height: 49, status: "running", efficiency: 89, operator: "Xaverius", details: "High-capacity chamfering machine A untuk pemotong sudut baut M16." },
      { id: "HCB", name: "HCB", type: "cell", left: 202, top: 20, width: 42, height: 49, status: "running", efficiency: 91, operator: "Yudi", details: "High-capacity chamfering machine B untuk pemotong sudut baut M12." },
      { id: "BRC", name: "BRC", type: "cell", left: 251, top: 20, width: 42, height: 49, status: "running", efficiency: 88, operator: "Zainal", details: "Bar chamfering machine untuk material kawat gulung." },

      // Row 2
      { id: "Shaft", name: "Shaft", type: "cell", left: 56, top: 95, width: 42, height: 49, status: "running", efficiency: 93, operator: "Agus", details: "Mesin bubut centerless untuk penghalusan poros shaft." },
      { id: "R1", name: "R1", type: "cell", left: 154, top: 95, width: 42, height: 49, status: "running", hasDot: true, efficiency: 87, operator: "Bambang", details: "Mesin drilling radial tipe 1 untuk pembuatan lubang pin pengunci." },
      { id: "R2", name: "R2", type: "cell", left: 202, top: 95, width: 42, height: 49, status: "idle", efficiency: 74, operator: "Chandra", details: "Mesin drilling radial tipe 2 untuk pembuatan lubang pin ganda." },

      // Row 3
      { id: "UB-67", name: "UB-67", type: "cell", left: 8, top: 169, width: 42, height: 49, status: "running", hasDot: true, efficiency: 95, operator: "Dodit", details: "Universal Boring & Milling machine model UB-67 untuk perbaikan cetakan besar." },
      { id: "UB-5", name: "UB-5", type: "cell", left: 56, top: 169, width: 42, height: 49, status: "running", efficiency: 91, operator: "Endro", details: "Universal Boring & Milling machine model UB-5 untuk pembuatan slot klem." },
      { id: "D14", name: "D14", type: "cell", left: 154, top: 169, width: 42, height: 49, status: "running", hasDot: true, efficiency: 92, operator: "Fajar", details: "Mesin multi-spindle drilling model D14 untuk melubangi flange baut sekaligus." },
      { id: "HPM", name: "HPM", type: "cell", left: 202, top: 169, width: 42, height: 49, status: "maintenance", efficiency: 0, operator: "Gani (Teknisi)", details: "Hydraulic Press Machine. Mengalami kebocoran oli seal silinder utama." },

      // Row 4
      { id: "Assy A", name: "Assy A", type: "cell", left: 8, top: 243, width: 42, height: 49, status: "running", hasDot: true, efficiency: 89, operator: "Hendra", details: "Stasiun perakitan sub-mesin otomatis tipe A." },
      { id: "Assy B", name: "Assy B", type: "cell", left: 56, top: 243, width: 42, height: 49, status: "running", efficiency: 87, operator: "Iqbal", details: "Stasiun perakitan sub-mesin otomatis tipe B." },
      { id: "Spdl", name: "Spdl", type: "cell", left: 154, top: 243, width: 42, height: 49, status: "running", efficiency: 94, operator: "Jamal", details: "Mesin bubut spidel ganda berkopling magnetik." },
      { id: "D80", name: "D80", type: "cell", left: 202, top: 243, width: 42, height: 49, status: "running", hasDot: true, efficiency: 91, operator: "Kadir", details: "Mesin deep-hole drilling model D80 untuk mengebor poros panjang." },
      { id: "D34", name: "D34", type: "cell", left: 251, top: 243, width: 42, height: 49, status: "running", efficiency: 90, operator: "Latif", details: "Mesin tapping otomatis model D34 untuk pembuatan drat mur M24." },

      // Row 5
      { id: "UB-23", name: "UB-23", type: "cell", left: 8, top: 317, width: 42, height: 49, status: "running", hasDot: true, efficiency: 93, operator: "Maman", details: "Boring machine model UB-23 untuk pengerjaan logam paduan nikel." },
      { id: "UB-14", name: "UB-14", type: "cell", left: 56, top: 317, width: 42, height: 49, status: "running", efficiency: 88, operator: "Nanang", details: "Boring machine model UB-14 untuk pengerjaan logam paduan kuningan." }
    ]
  },
  {
    id: "GUDANG-KORIDOR",
    name: "GUDANG / KORIDOR",
    left: 50,
    top: 61,
    width: 85,
    height: 1228,
    details: "Koridor utama untuk lalu lintas Forklift dan Automated Guided Vehicles (AGV), sekaligus berfungsi sebagai penyimpanan bahan baku kawat gulung (wire rod) dan rak penyimpanan rak barang jadi siap kirim.",
    machines: []
  }
];

export interface RoadData {
  id: string;
  name: string;
  points: string;
  markingPoints: string;
}

export const roads: RoadData[] = [
  {
    id: "road-top",
    name: "Jalan Utama Utara (North Boulevard)",
    points: "2,7 98,7 98,12 2,12",
    markingPoints: "2,9.5 98,9.5"
  },
  {
    id: "road-west-mid",
    name: "Akses Jalan Barat (West Lane)",
    points: "34,12 40,12 37,81 31,81",
    markingPoints: "37,12 34,81"
  },
  {
    id: "road-east-mid",
    name: "Akses Jalan Timur (East Lane)",
    points: "69,12 73,12 73,87.1 69,87.1",
    markingPoints: "71,12 71,87.1"
  },
  {
    id: "road-bottom",
    name: "Jalan Penghubung Selatan (South Lane)",
    points: "2,85.1 73,85.1 73,87.1 2,87.1",
    markingPoints: "2,86.1 73,86.1"
  }
];
