# Neo Fraud & AML Management System (Neo FMS) v1.22
### *Enterprise Real-Time Fraud Defense, Anti-Money Laundering & Compliance Intelligence Platform*
**Bank Sahabat Sampoerna (BSS)** • *Bento Engine Architecture*

---

## 1. EXECUTIVE REVIEW

**Neo FMS v1.22** adalah platform pertahanan fraud dan anti-pencucian uang (*Anti-Money Laundering* / AML) berstandar perbankan (*enterprise-grade*) yang dirancang untuk menangani pemantauan transaksi finansial berkecepatan tinggi, investigasi kasus multi-kanal, penegakan kepatuhan regulasi APU-PPT, serta orkestrasi aturan (*rule engine*) secara adaptif.

```
+----------------------------------------------------------------------------------------------------+
|                                      NEO FMS v1.22 ECOSYSTEM                                       |
+----------------------------------------------------------------------------------------------------+
|  [ INGESTION ]     Mobile Banking (MB) • Online Banking (OB) • Virtual Account (VA) • QRIS • CARD  |
|  [ DETECTION ]     Real-Time Screening Engine • Shadow-Mode Backtesting • Geo-Fencing Radius       |
|  [ GOVERNANCE ]    Dual Control (Maker-Checker) • Dynamic SLA Engine • Strict Domain Isolation      |
|  [ AUDITABILITY ]  Immutable Audit Trail Logs • Multi-Account CIF Profiling • Executive Analytics  |
+----------------------------------------------------------------------------------------------------+
```

### Nilai Strategis Utama (*Core Value Propositions*):
1. **Penegakan Dual Control (Maker-Checker):**  
   Seluruh aksi operasional berisiko tinggi (resolusi investigasi kasus, pendaftaran *blacklist/watchlist/whitelist*, aktivasi *rule*, pembaruan formula risiko, dan perubahan parameter sistem) wajib melalui otorisasi berjenjang (L1 Maker $\rightarrow$ L2 Checker).
2. **Dynamic SLA Engine (Zero-Downtime Configuration):**  
   Ambang batas SLA per kanal transaksi (contoh: *Virtual Account > 7 hari / 168 jam, Kanal Non-VA > 24 jam*) dikelola terpusat melalui *Application Parameter*, sehingga dapat disesuaikan sewaktu-waktu tanpa memerlukan proses *deployment* ulang.
3. **Pemisahan Domain Ketat (*Strict Domain Isolation*):**  
   Isolasi data, antrean kasus, daftar entitas, dan pelaporan antara fungsi operasional **Anti-Fraud Center (AFC)** dan **Kepatuhan AML (Analyst)**. AFC hanya memiliki visibilitas atas domain Fraud, sedangkan Analyst berfokus pada regulasi APU-PPT/AML.
4. **Antarmuka Berbasis Peran Adaptif (*RBAC-Driven Interface Adaptation*):**  
   Pengalaman pengguna (UX), komponen kartu ringkasan, dan menu navigasi beradaptasi otomatis sesuai peran pengguna yang masuk (*logged-in user*).

---

## 2. ARSITEKTUR & STACK TEKNOLOGI

```
+----------------------------------------------------------------------------------------------------+
|                                    APPLICATION ARCHITECTURE STACK                                  |
+-------------------+--------------------------------------------------------------------------------+
| Framework         | React 18 (Single Page Application Architecture)                                |
| Bahasa & Runtime  | TypeScript (Strict Typing) • Vite Build Tooling                                |
| Desain & Styling  | Tailwind CSS • Lucide Icons • Bento Grid Aesthetics                            |
| State Management  | React Context API (AuthContext, FMSContext, CustomerContext)                   |
| Data Persistence  | Reactive Session Storage & In-Memory State Hydration                           |
| Export Engines    | Client-Side PDF Generator & Excel (.xlsx) Exporter                             |
+-------------------+--------------------------------------------------------------------------------+
```

### Keunggulan Arsitektur Teknis (*Architectural Highlights*):
* **Pemetaan Relasi 1-to-N (Single CIF to Multi-Source Account):**  
  Modul Profil Nasabah menghubungkan satu Nomor Identitas Nasabah (*Customer Information File* / CIF) ke banyak nomor rekening tabungan, giro, deposito, maupun kartu debit aktif.
* **Shadow-Mode Backtesting Engine:**  
  Simulasi performa calon aturan baru pada data transaksi riwayat hingga 30 hari ke belakang yang terisolasi penuh dari sistem produksi (*Shadow Mode*), mencegah terjadinya pemblokiran rekening atau pengiriman notifikasi palsu ke nasabah.
* **Geo-Fencing Radius Engine:**  
  Pendeteksian anomali lokasi transaksi menggunakan kalkulasi koordinat geografis (*Latitude*, *Longitude*, dan radius jangkauan dalam satuan Kilometer).

---

## 3. MATRIKS KONTROL AKSES BERBASIS PERAN (RBAC MATRIX)

Neo FMS v1.22 membedakan hak akses pengguna menjadi 5 peran aktor utama:
1. **AFC L1:** Staf Operasional Anti-Fraud (Maker Investigasi Kasus Fraud & Usulan Rule/List).
2. **AFC L2:** Supervisor Anti-Fraud (Checker Otorisasi Fraud, Pengawas SLA & Admin Shifting).
3. **Analyst L1:** Staf Kepatuhan AML (Maker Investigasi AML, DTTOT, & Usulan Rule AML).
4. **Analyst L2:** Supervisor Kepatuhan AML (Checker Otorisasi Kasus & List AML).
5. **Sysadmin:** Administrator IT (Pengelola Parameter Global, User Session, RBAC, & Process Engine).

| Modul / Sub-Menu | AFC L1 (Fraud Maker) | AFC L2 (Fraud Checker) | Analyst L1 (AML Maker) | Analyst L2 (AML Checker) | Sysadmin |
|---|:---:|:---:|:---:|:---:|:---:|
| **Dashboard Overview** | 6-Card View | 6-Card View | 4-Card View | 4-Card View | 6-Card View |
| **Report & Analytics** | Fraud Only | Fraud Only | AML Only | AML Only | Full Access |
| **Case Management (System Alert Fraud)** | Maker / Resolve | Checker / Approve | ❌ Terkunci | ❌ Terkunci | View / Super Admin |
| **Case Management (System Alert AML)** | ❌ Terkunci | ❌ Terkunci | Maker / Resolve | Checker / Approve | View / Super Admin |
| **Case Management (Manual Alert)** | Create (Fraud) | Approve (Fraud) | Create (AML) | Approve (AML) | View / Super Admin |
| **Investigation History** | Read-Only (Fraud) | Read-Only (Fraud) | Read-Only (AML) | Read-Only (AML) | Read-Only (Full) |
| **Jadwal Shifting** | View-Only | Write / Manage | ❌ Terkunci | ❌ Terkunci | Full Access |
| **Profile Analytics (CIF/Account/Trx)** | View-Only | View-Only | View-Only | View-Only | View-Only |
| **Rule Template & Basic (Fraud)** | Maker (Draft) | Checker (Approve) | ❌ Terkunci | ❌ Terkunci | Technical Access |
| **Rule Template & Basic (AML)** | ❌ Terkunci | ❌ Terkunci | Maker (Draft) | Checker (Approve) | Technical Access |
| **Rule Backtesting** | Execute Simulation | Execute Simulation | Execute Simulation | Execute Simulation | Technical Access |
| **Formula Risk Engine** | Draft Matrix | Approve Matrix | Draft Matrix | Approve Matrix | Full Access |
| **List Management (Black/Watch/White)** | Maker (Fraud) | Checker (Fraud) | Maker (AML) | Checker (AML) | Technical Access |
| **External Blacklist / DTTOT** | ❌ Terkunci | ❌ Terkunci | Import / Maker | Review / Checker | ❌ Terkunci |
| **System Parameter (9 Sub-Menus)** | ❌ Terkunci | Partial (Location) | ❌ Terkunci | ❌ Terkunci | Full Configuration |
| **Process Engine (Task/List/Manual)** | ❌ Terkunci | ❌ Terkunci | ❌ Terkunci | ❌ Terkunci | Full Control |
| **Audit Trail (5 Sub-Menus)** | ❌ Terkunci | View (Auditor) | ❌ Terkunci | View (Auditor) | Full Immutable Logs |

---

## 4. PENJELASAN KONSEP & SPESIFIKASI 16 MODUL UTAMA

```
+----------------------------------------------------------------------------------------------------+
|                                    16 CORE OPERATIONAL MODULES                                     |
+------------------------------------+------------------------------------+--------------------------+
| 1. Dashboard Overview              | 7. Profile Analytics               | 13. External Blacklist   |
| 2. Report & Analytics              | 8. Rule Template                   | 14. System Parameter     |
| 3. Case Management (System Alert)  | 9. Rule Basic                      | 15. Process Engine       |
| 4. Case Management (Manual Alert)  | 10. Rule Backtesting               | 16. Audit Trail          |
| 5. Investigation History           | 11. Formula Risk Engine            |                          |
| 6. Jadwal Shifting                 | 12. List Management                |                          |
+------------------------------------+------------------------------------+--------------------------+
```

---

### 1. Dashboard Overview
* **Tampilan Adaptif:**
  * **AFC & Sysadmin (6-Card View):** Menampilkan metrik *Total Case*, *Low Severity*, *Medium Severity*, *High Severity*, *SLA Over (Breach)*, dan *Closed Case*.
  * **Analyst (4-Card Legacy View):** Menampilkan metrik terfokus *Total Case*, *Low*, *Medium*, dan *High*.
* **5-Channel SLA Breakdown:** Kartu *SLA Over* menyajikan rincian kasus kadaluarsa per kanal: **Mobile Banking (MB)**, **Online Banking (OB)**, **Virtual Account (VA)**, **QRIS**, dan **Card (Debit/Credit/ATM)**.
* **Dynamic SLA Config:** Parameter ambang batas dibaca langsung dari *Application Parameter* (VA default 7 hari / 168 jam, Non-VA default 24 jam).

---

### 2. Report & Analytics
* **Analisis Kinerja:** Menghitung waktu penyelesaian investigasi kasus, produktivitas harian analis, serta volume penyelesaian kasus.
* **Evaluasi Efektivitas Rule:** Menyajikan grafik rasio *False Positive* vs *True Positive* per aturan untuk mengidentifikasi aturan yang terlalu sensitif atau tidak efektif.
* **Ekspor Eksekutif:** Mendukung ekspor data tabular ke **Excel (.xlsx)** dan pembuatan laporan format ringkas **PDF Eksekutif**.
* **Isolasi Domain:** Statistik pelaporan terpisah secara penuh antara divisi Fraud dan AML.

---

### 3. Case Management - System Alert (Fraud & AML)
* **Screening Engine Ingestion:** Menerima kasus transaksi yang tertangkap oleh aturan penyaringan secara *real-time*.
* **Alur Dual Control:**
  1. **L1 Maker:** Memeriksa detail transaksi, histori CIF, dan menyusun rekomendasi investigasi $\rightarrow$ Menekan *Submit Follow Up* $\rightarrow$ Status berubah menjadi `Pending Approval`.
  2. **L2 Checker:** Memvalidasi keputusan $\rightarrow$ Memilih *Approve* (Status menjadi `Close`) atau *Reject/Return* (Wajib mengisi alasan perbaikan).
* **Live SLA Countdown Timer:** Menampilkan waktu mundur sisa SLA pada setiap baris kasus sesuai kanal transaksi yang bersangkutan.

---

### 4. Case Management - Manual Alert
* **Pencatatan Eksternal:** Formulir khusus untuk merekam laporan kasus fraud/AML yang bersumber dari luar sistem (Surat Perintah Kepolisian, Laporan Regulator OJK/PPATK, Eskalasi Kantor Cabang, atau Aduan Nasabah).
* **Field Wajib:** *Sumber Laporan*, *Indikasi Insiden*, *Nomor Tiket/Referensi Eksternal*, dan *Tingkat Keparahan (Severity)*.
* **Evidence Attachment:** Mendukung pengunggahan dokumen bukti pendukung (PDF, JPG, PNG).
* **Sinkronisasi Profil:** Kasus manual yang disetujui langsung terhubung ke histori dan skor risiko nasabah (CIF).

---

### 5. Investigation History
* **Arsip Kasus Selesai:** Menyimpan seluruh jejak kasus yang berstatus `Close` (disetujui penyelesaiannya).
* **Read-Only Grid:** Data yang ditampilkan bersifat permanen dan tidak dapat dimanipulasi statusnya dari tabel utama.
* **Post-Closure Attachments:** Memungkinkan investigator menyematkan dokumen tambahan/susulan pada kasus yang sudah ditutup tanpa membuka kembali status kasus.
* **Pencarian Lanjutan:** Filter berdasarkan Nomor CIF, Nomor Rekening, Rentang Tanggal Penutupan, dan Alasan Penyelesaian.

---

### 6. Jadwal Shifting & Duty Roster
* **Pengelolaan Kalender 24/7:** Pengaturan jadwal piket dinas tim operasional AFC L1 (*Shift Pagi: 07.00–15.00, Shift Siang: 15.00–23.00, Shift Malam: 23.00–07.00*).
* **Otoritas Khusus:** Hak modifikasi dan *bulk plotting* eksklusif dipegang oleh **AFC L2**. AFC L1 hanya memiliki akses melihat jadwal pribadi (*View-Only*).
* **Empty Shift Alert:** Indikator peringatan visual jika terdapat slot shift jaga yang belum terisi agen.
* **Ekspor Jadwal:** Fitur unduh roster kerja ke format PDF dan Excel.

---

### 7. Profile Analytics (Customer, Debit Card, Transaction, Card Transaction)
* **360° Customer View:** Menampilkan data demografi nasabah, status kepatuhan, serta pemetaan relasi **1 CIF ke N Nomor Rekening**.
* **Hit-Rule Red Flagging:** Transaksi finansial yang melanggar aturan screening diberi penanda **Badge Merah** secara eksplisit pada tabel histori.
* **14 Field Wajib Transaksi:** Klik pada baris transaksi memunculkan modal pop-up rincian dalam format *Vertical Key-Value List* 14 atribut standar perbankan.

---

### 8. Rule Engine - Rule Template (Fraud & AML)
* **Query Skeleton Formulation:** Pembuatan kerangka logika aturan menggunakan editor sintaks dengan *syntax highlighting*.
* **Placeholder Recognition:** Mendeteksi dan memvalidasi variabel *placeholder* (seperti `<THRESHOLD_AMOUNT>`, `<TIME_WINDOW>`, `<MAX_COUNT>`).
* **Maker-Checker & Locking:** Setiap perubahan template berstatus `Pending Approval`. Template yang telah terikat pada Rule Basic aktif otomatis terkunci (*Locked*) dari penghapusan.

---

### 9. Rule Engine - Rule Basic (Fraud & AML)
* **Konfigurasi Operasional:** Mengikat Rule Template aktif dan mengisi nilai parameter *placeholder*.
* **Aksi Respon Mesin:** Penentuan tindakan sistem terhadap transaksi pelanggar: `Block`, `Hold`, atau `Create Alert Only`.
* **Multi-Channel Mapping:** Wajib memilih minimal 1 kanal transaksi terkait (**MB, OB, VA, QRIS, CARD**).
* **Approval Queue:** Perubahan tersimpan dalam antrean persetujuan L2 Checker.

---

### 10. Rule Backtesting
* **Simulasi Shadow Mode:** Pengujian calon aturan baru pada data transaksi historis hingga 30 hari ke belakang tanpa dampak operasional nyata.
* **Metrik Evaluasi:** Menghasilkan kalkulasi *Estimated Hits (True Positive)* dan *False Positive Ratio*.
* **Prasyarat Live (Mandatory Gate):** Aturan baru HANYA dapat diajukan ke L2 Checker untuk diaktifkan ke produksi jika telah melewati proses backtesting minimal 1 kali.

---

### 11. Risk Engine - Formula Risk Engine
* **Matrix Weight Multipliers:** Perumusan bobot risiko dinamis berdasarkan kombinasi keparahan kasus (*Low, Medium, High*).
* **Interactive Test Formula:** Fitur simulasi kalkulasi skor risiko secara instan terhadap 1 Nomor CIF spesifik sebelum formula diajukan ke L2 Checker.
* **Risk Threshold Boundaries:** Visualisasi level risiko nasabah (*0–30 Low, 31–70 Medium, 71–100 High*).

---

### 12. List Management (Blacklist, Watchlist, Whitelist)
* **Strict Domain Isolation:** Pendaftaran entitas (*CIF, Nomor Rekening, Device ID, Nomor Telepon*) terisolasi antara domain Fraud dan AML.
* **3 Tipe Whitelist:**
  1. `Permanent`: Pengecualian permanen.
  2. `Duration Based`: Pengecualian berbatas waktu dengan *Date Range Picker*.
  3. `Specific Dates`: Pengecualian pada tanggal-tanggal tertentu (dioptimasi untuk jadwal *payroll* korporasi).
* **Pending Approval Tracker:** Tab khusus bagi Maker (L1) untuk memantau status pengajuan entri daftar.

---

### 13. External Blacklist / DTTOT
* **Daftar Terduga Teroris (APU-PPT):** Sub-modul eksklusif tim Kepatuhan AML untuk mengunggah dan merawat master data DTTOT dari PPATK / PBB.
* **Akses Terisolasi:** Disembunyikan sepenuhnya dari peran AFC dan Sysadmin.
* **Review Parsing Data:** Supervisor AML (L2) meninjau *preview* parsing berkas CSV/Excel sebelum menyetujui pembaruan basis data.
* **Tagging Otomatis:** Entitas yang lolos verifikasi otomatis mendapatkan penanda `Tag: DTTOT` pada profil nasabah.

---

### 14. System Parameter (9 Sub-Menus)
Pusat kontrol konfigurasi teknis global yang dikelola oleh Sysadmin:
1. **User Management:** Pembuatan akun, penugasan peran (*role assignment*), dan reset kredensial.
2. **Group Management:** Pengelompokan unit kerja operasional dan kepatuhan.
3. **Role Management:** Definisi tingkatan wewenang pengguna.
4. **Access Menu Management:** Konfigurasi hierarki menu interaktif (*Checkbox Tree*) untuk hak akses *View, Edit, Approve*.
5. **Application Parameter:** Konfigurasi nilai batas SLA jam/hari per kanal transaksi secara dinamis.
6. **User Defined Parameter (UDP):** Parameter konfigurasi kustom untuk kebutuhan bisnis ad-hoc.
7. **Email Template:** Pembuatan dan penyesuaian template notifikasi email sistem.
8. **User Session & Lockout:** Pemantauan sesi aktif secara *real-time* disertai tombol **Force Kick / Revoke**.
9. **Watchlist Location:** Pemetaan zona merah koordinat (*Latitude, Longitude, Radius KM*) dengan *Dual Control*.

---

### 15. Process Engine (Task, List Process, Manual Execution)
* **Task Registration:** Pendaftaran prosedur tersimpan database (*Stored Procedure*) atau pemanggilan endpoint API background.
* **List Process (Sequential Orchestration):** Perangkaian beberapa Task menjadi alur tahapan eksekusi berkala / End-Of-Day (EOD).
* **Manual Execution:** Tombol **"Run Now"** untuk memicu eksekusi proses background secara langsung jika terjadi kegagalan jadwal otomatis.
* **Telemetry Logging:** Log status eksekusi (*Success - Hijau / Failed - Merah*) beserta pencatatan rincian pesan error teknis.

---

### 16. Audit Trail (5 Sub-Menus)
Pencatatan jejak audit kepatuhan perbankan yang bersifat **Immutable** (tidak dapat dimanipulasi atau dihapus):
1. **Audit Trail System:** Log aktivitas teknis sistem dan pemicu otomatis background.
2. **Audit Trail Changes:** Menyajikan komparasi nilai lama (*Old Value*) vs nilai baru (*New Value*) secara eksplisit per kolom data yang diubah.
3. **Audit Trail Login:** Jejak otentikasi masuk dan keluar pengguna beserta alamat IP dan agen browser.
4. **Audit Trail Access:** Jejak pembukaan dan navigasi menu oleh seluruh pengguna.
5. **Audit Trail Mail:** Log pengiriman notifikasi email sistem ke pihak terkait.
* **Fitur Ekspor:** Mendukung ekspor log ke dokumen terenkripsi **PDF dan CSV** untuk kebutuhan audit regulator.

---

## 5. PANDUAN PENGEMBANGAN & PENGUJIAN

### Instalasi & Menjalankan Aplikasi:
```bash
# 1. Clone repositori & masuk ke direktori proyek
cd fms-project

# 2. Instal dependensi aplikasi
npm install

# 3. Jalankan server pengembangan lokal (Port 3000)
npm run dev

# 4. Validasi tipe TypeScript (Zero-Error Verification)
npm run lint

# 5. Kompilasi build produksi
npm run build
```

---
*Dokumen ini merupakan spesifikasi resmi arsitektur perangkat lunak Neo FMS v1.22 Bank Sahabat Sampoerna.*
