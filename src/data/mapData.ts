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
  icon?: string;
  color?: string;
  layer?: number;
  linkedShapeId?: string;
  parentShapeId?: string;
  hatched?: boolean;
  isRoad?: boolean;
  imageUrl?: string;
}

import rawShapes from '../../public/shapes.json';

export const buildings: BuildingData[] = (rawShapes as any[]).map((shape: any) => ({
  id: shape.id || shape.uuid,
  name: shape.name || shape.code || shape.id,
  code: shape.code || shape.name || '',
  points: Array.isArray(shape.points)
    ? shape.points.map((p: any) => `${p.x},${p.y}`).join(' ')
    : (shape.points || ''),
  width: shape.width || 0,
  length: shape.length || 0,
  area: shape.area || 0,
  details: shape.details || '',
  zones: shape.zones || [],
  operationalStatus: shape.operationalStatus || 'Aktif',
  icon: shape.icon,
  color: shape.color,
  layer: shape.layer,
  linkedShapeId: shape.linkedShapeId,
  parentShapeId: shape.parentShapeId,
  hatched: shape.hatched,
  isRoad: shape.isRoad,
  imageUrl: shape.imageUrl,
}));

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
