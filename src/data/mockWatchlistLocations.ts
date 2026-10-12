import { WatchlistLocation } from '../types/watchlistLocation';
import { RuleApprovalTicket } from '../types/fms';

export const INITIAL_WATCHLIST_LOCATIONS: WatchlistLocation[] = [
  {
    id: 'WLOC-001',
    name: 'Kabupaten Ogan Ilir, Sumatera Selatan',
    latitude: -3.4285,
    longitude: 104.6465,
    status: 'Active',
    approvalStatus: 'Active',
    createdDate: '2026-08-10 09:15:00',
    lastUpdateDate: '2026-09-01 14:20:00',
    createdBy: 'Yoseph Sanjaya (Sysadmin)',
    lastUpdatedBy: 'Hendrawan Kusuma (AFC L2)',
    notes: 'Hotspot anomali konsentrasi transaksi pengambilalihan akun (social engineering & phishing SMS/APK penipuan).',
    radiusKm: 25
  },
  {
    id: 'WLOC-002',
    name: 'Kecamatan Tulung Selapan, Kabupaten OKI, Sumatera Selatan',
    latitude: -3.3980,
    longitude: 105.7892,
    status: 'Active',
    approvalStatus: 'Active',
    createdDate: '2026-08-15 11:30:00',
    lastUpdateDate: '2026-09-05 10:15:00',
    createdBy: 'Fahmi Irawan (AFC L1)',
    lastUpdatedBy: 'Hendrawan Kusuma (AFC L2)',
    notes: 'Kluster teridentifikasi sindikat penampung rekening bodong dan penarikan tunai serentak via agen bank.',
    radiusKm: 15
  },
  {
    id: 'WLOC-003',
    name: 'Kecamatan Cengkareng, Kota Jakarta Barat, DKI Jakarta',
    latitude: -6.1528,
    longitude: 106.7350,
    status: 'Active',
    approvalStatus: 'Active',
    createdDate: '2026-08-20 13:45:00',
    lastUpdateDate: '2026-09-08 16:30:00',
    createdBy: 'Yoseph Sanjaya (Sysadmin)',
    lastUpdatedBy: 'Yoseph Sanjaya (Sysadmin)',
    notes: 'Frekuensi pendaftaran merchant QRIS fiktif dan perangkat mobile berulang (Device Fingerprint spoofing).',
    radiusKm: 10
  },
  {
    id: 'WLOC-004',
    name: 'Kecamatan Pontianak Kota, Kota Pontianak, Kalimantan Barat',
    latitude: -0.0263,
    longitude: 109.3425,
    status: 'Active',
    approvalStatus: 'Active',
    createdDate: '2026-08-22 15:20:00',
    lastUpdateDate: '2026-09-10 11:00:00',
    createdBy: 'Ahmad Subagyo (AFC L1)',
    lastUpdatedBy: 'Hendrawan Kusuma (AFC L2)',
    notes: 'Indikasi IP routing VPN anomali dan aktivitas transfer keluar dana mule account lintas batas.',
    radiusKm: 12
  },
  {
    id: 'WLOC-005',
    name: 'Kecamatan Medan Sunggal, Kota Medan, Sumatera Utara',
    latitude: 3.5786,
    longitude: 98.6253,
    status: 'Active',
    approvalStatus: 'Active',
    createdDate: '2026-08-28 08:45:00',
    lastUpdateDate: '2026-09-12 13:10:00',
    createdBy: 'Fahmi Irawan (AFC L1)',
    lastUpdatedBy: 'Hendrawan Kusuma (AFC L2)',
    notes: 'Area deteksi penarikan tunai kartu debit skimmed dan tampering terminal EDC merchant.',
    radiusKm: 8
  },
  {
    id: 'WLOC-006',
    name: 'Kecamatan Denpasar Selatan, Kota Denpasar, Bali',
    latitude: -8.6945,
    longitude: 115.2280,
    status: 'Inactive',
    approvalStatus: 'Active',
    createdDate: '2026-07-15 10:00:00',
    lastUpdateDate: '2026-09-02 09:30:00',
    createdBy: 'Yoseph Sanjaya (Sysadmin)',
    lastUpdatedBy: 'Hendrawan Kusuma (AFC L2)',
    notes: 'Terminal ATM off-us yang pernah dipasangi deep insert skimmer; dinonaktifkan pasca penggantian perangkat.',
    radiusKm: 5
  },
  {
    id: 'WLOC-007',
    name: 'Kecamatan Kelapa Gading, Kota Jakarta Utara, DKI Jakarta',
    latitude: -6.1583,
    longitude: 106.9090,
    status: 'Active',
    approvalStatus: 'Pending Approval - New',
    createdDate: '2026-09-18 10:20:00',
    lastUpdateDate: '2026-09-18 10:20:00',
    createdBy: 'Fahmi Irawan (AFC L1)',
    notes: 'Usulan penambahan lokasi watchlist: Dugaan ruko operasi trading P2P crypto ilegal dan pembukaan rekening rekening nominee.',
    radiusKm: 8,
    ticketId: 'TKT-WLOC-202609-001'
  },
  {
    id: 'WLOC-008',
    name: 'Kecamatan Depok, Kabupaten Sleman, D.I. Yogyakarta',
    latitude: -7.7712,
    longitude: 110.3956,
    status: 'Active',
    approvalStatus: 'Pending Approval - Edit',
    createdDate: '2026-08-05 14:10:00',
    lastUpdateDate: '2026-09-19 16:45:00',
    createdBy: 'Ahmad Subagyo (AFC L1)',
    lastUpdatedBy: 'Ahmad Subagyo (AFC L1)',
    notes: 'Usulan penyesuaian radius koordinat dari 5 km ke 15 km mencakup area kos penampung rekening mahasiswa.',
    radiusKm: 5,
    proposedChanges: {
      name: 'Kecamatan Depok & Mlati, Kabupaten Sleman, D.I. Yogyakarta',
      latitude: -7.7680,
      longitude: 110.3910,
      radiusKm: 15,
      notes: 'Ekspansi radius pemantauan terkoordinasi sindikat rekening mule mahasiswa kos-kosan.'
    },
    ticketId: 'TKT-WLOC-202609-002'
  }
];

export const INITIAL_WATCHLIST_LOCATION_TICKETS: RuleApprovalTicket[] = [
  {
    id: 'TKT-WLOC-202609-001',
    ticketNo: 'TKT-WLOC-001',
    targetType: 'Watchlist Location',
    domain: 'Fraud',
    actionType: 'CREATE',
    targetCode: 'WLOC-007',
    targetName: 'Kecamatan Kelapa Gading, Kota Jakarta Utara, DKI Jakarta',
    status: 'PENDING',
    makerName: 'Fahmi Irawan',
    makerRole: 'L1 Maker (Fraud Ops)',
    createdAt: '2026-09-18 10:20 WIB',
    makerNotes: 'Penambahan lokasi baru berbasis eskalasi intelijen investigasi: Ruko dugaan operasi sindikat P2P crypto dan nominee account aggregator.',
    changeSummary: 'Penambahan entitas Watchlist Location baru: WLOC-007 (Kelapa Gading, Lat: -6.1583, Long: 106.9090, Status: Active).',
    versionFrom: '-',
    versionTo: '1.0',
    previousData: null,
    proposedData: INITIAL_WATCHLIST_LOCATIONS.find(l => l.id === 'WLOC-007') || null
  },
  {
    id: 'TKT-WLOC-202609-002',
    ticketNo: 'TKT-WLOC-002',
    targetType: 'Watchlist Location',
    domain: 'Fraud',
    actionType: 'UPDATE',
    targetCode: 'WLOC-008',
    targetName: 'Kecamatan Depok, Kabupaten Sleman, D.I. Yogyakarta',
    status: 'PENDING',
    makerName: 'Ahmad Subagyo',
    makerRole: 'L1 Maker (Fraud Ops)',
    createdAt: '2026-09-19 16:45 WIB',
    makerNotes: 'Perluasan cakupan geografis dan penyesuaian titik centroid koordinat untuk mencakup wilayah Mlati yang menjadi kluster penyebaran rekening mule baru.',
    changeSummary: 'Pembaruan nama lokasi, koordinat Latitude (-7.7712 -> -7.7680), Longitude (110.3956 -> 110.3910), dan perluasan radius deteksi.',
    versionFrom: '1.0',
    versionTo: '1.1',
    previousData: {
      id: 'WLOC-008',
      name: 'Kecamatan Depok, Kabupaten Sleman, D.I. Yogyakarta',
      latitude: -7.7712,
      longitude: 110.3956,
      status: 'Active',
      radiusKm: 5
    },
    proposedData: {
      id: 'WLOC-008',
      name: 'Kecamatan Depok & Mlati, Kabupaten Sleman, D.I. Yogyakarta',
      latitude: -7.7680,
      longitude: 110.3910,
      status: 'Active',
      radiusKm: 15,
      notes: 'Ekspansi radius pemantauan terkoordinasi sindikat rekening mule mahasiswa kos-kosan.'
    }
  }
];
