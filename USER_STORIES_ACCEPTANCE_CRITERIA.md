# USER STORIES & ACCEPTANCE CRITERIA (Neo FMS v1.22)
## Bank Sahabat Sampoerna (BSS) - Bento Engine Architecture

---

## RINGKASAN ROLE (ACTORS)
1. **AFC L1 (Anti-Fraud Center L1 / Fraud Maker):** Tim operasional investigasi kasus fraud harian, pembuat draft rule fraud, dan inputer list management fraud.
2. **AFC L2 (Anti-Fraud Center L2 / Fraud Checker):** Supervisor/Team Lead Fraud yang memvalidasi resolusi kasus L1, menyetujui rule/list fraud, serta mengelola jadwal shift.
3. **Analyst L1 (AML Analyst L1 / AML Maker):** Staf kepatuhan/AML untuk investigasi indikasi pencucian uang, pendaftaran DTTOT, dan pembuat draft rule AML.
4. **Analyst L2 (AML Analyst L2 / AML Checker):** Supervisor/Team Lead AML yang menyetujui penutupan kasus AML, memvalidasi list DTTOT, dan menyetujui rule AML.
5. **Sysadmin:** Administrator teknis pengelola parameter global, akses menu, proses background, dan audit trail sistem.

---

## DAFTAR MODUL & SPESIFIKASI MENGGUNAKAN MULTI-ROLE POV

### 1. Dashboard Overview
**Nama Menu:** Dashboard Overview
**Actor:** AFC L1, AFC L2, Analyst L1, Analyst L2, Sysadmin
**Object:** Metrik Kasus, Alert SLA, Status Resolusi, Channel Breakdown

**Story POV AFC L1:** Sebagai AFC L1, saya ingin melihat ringkasan kasus fraud harian (6-card view) dengan rincian 5 kanal (MB, OB, VA, QRIS, CARD) untuk memantau beban kerja investigasi dan mendeteksi alert yang mendekati batas SLA agar tidak terjadi *breach*.
**Story POV AFC L2:** Sebagai AFC L2, saya ingin memantau metrik keseluruhan tim AFC melalui 6-card view dan rincian kanal transaksi, guna mengawasi performa operasional, beban penanganan SLA Over, dan memastikan penutupan kasus berjalan efektif.
**Story POV Analyst L1:** Sebagai Analyst L1, saya ingin melihat tampilan ringkasan 4-card legacy view khusus AML (Total, Low, Med, High) untuk fokus memantau antrean investigasi pencucian uang tanpa gangguan metrik kanal transaksional harian.
**Story POV Analyst L2:** Sebagai Analyst L2, saya ingin memantau dashboard 4-card legacy AML untuk mengawasi sebaran tingkat risiko kepatuhan dan memastikan volume kasus AML tertangani dengan baik oleh tim Analyst L1.
**Story POV Sysadmin:** Sebagai Sysadmin, saya ingin memastikan seluruh widget dashboard merender data dengan benar sesuai RBAC (6-card untuk AFC/Sysadmin dan 4-card untuk Analyst).

**Acceptance Criteria:**
* **AC 1:** Sistem harus secara dinamis me-render *6-card view* jika role yang login adalah AFC L1/L2 atau Sysadmin.
* **AC 2:** Sistem harus me-render *legacy 4-card view* jika role yang login adalah Analyst L1/L2.
* **AC 3:** Pada kartu SLA Over (Tampilan AFC), kalkulasi over SLA memisahkan metrik berdasarkan channel MB, OB, VA, QRIS, dan CARD.
* **AC 4:** Parameter perhitungan SLA (VA > 7 hari, channel lain > 24 jam) diambil secara dinamis dari Application Parameter.

---

### 2. Report & Analytics
**Nama Menu:** Report & Analytics
**Actor:** AFC L1, AFC L2, Analyst L1, Analyst L2, Sysadmin
**Object:** Statistik Kinerja Tim, Efektivitas Rule, Laporan Rekapitulasi Kasus

**Story POV AFC L1:** Sebagai AFC L1, saya ingin melihat laporan produktivitas harian dan riwayat penyelesaian kasus saya sendiri untuk mengevaluasi kinerja investigasi mandiri.
**Story POV AFC L2:** Sebagai AFC L2, saya ingin mengakses laporan analitikal kinerja tim AFC, rasio *False Positive vs True Positive* per rule, serta mengekspor laporan ke Excel/PDF untuk evaluasi manajerial.
**Story POV Analyst L1:** Sebagai Analyst L1, saya ingin melihat statistik volume penanganan kasus AML dan tren alert kepatuhan untuk mengukur efektivitas investigasi AML saya.
**Story POV Analyst L2:** Sebagai Analyst L2, saya ingin mengakses laporan analitikal domain AML, mengevaluasi efektivitas rule kepatuhan, serta mendownload rekapitulasi laporan berkala untuk manajemen dan regulator.
**Story POV Sysadmin:** Sebagai Sysadmin, saya ingin memastikan modul reporting berjalan stabil, terisolasi ketat antar domain, dan mendukung ekspor eksekutif tanpa kendala memori.

**Acceptance Criteria:**
* **AC 1:** Sistem dapat menampilkan grafik tren volume alert/kasus berdasarkan rentang waktu yang dapat difilter (Harian, Mingguan, Bulanan).
* **AC 2:** Terdapat laporan *Rule Effectiveness* yang menampilkan rasio *False Positive* vs *True Positive* per rule.
* **AC 3:** Pengguna memiliki opsi untuk mengekspor laporan ke dalam format *Excel* dan *PDF*.
* **AC 4:** Data pelaporan terisolasi ketat (AFC hanya melihat statistik Fraud, Analyst hanya melihat statistik AML).

---

### 3. Case Management - System Alert
**Nama Menu:** Case Management (System Alert)
**Actor:** AFC L1, AFC L2, Analyst L1, Analyst L2
**Object:** Alert Kasus Otomatis Hasil Screening Engine (Fraud & AML)

**Story POV AFC L1:** Sebagai AFC L1, saya ingin menyelidiki alert transaksi fraud yang ditangkap engine, memeriksa detail nasabah, lalu menekan tombol *Resolve* yang akan meneruskan kasus ke status `Pending L2 Review`.
**Story POV AFC L2:** As AFC L2, saya ingin meninjau antrean kasus berstatus `Pending L2 Review` dari AFC L1, untuk kemudian memberikan *Approve* (Closed) atau *Reject/Return* dengan catatan perbaikan (*mandatory notes*).
**Story POV Analyst L1:** Sebagai Analyst L1, saya ingin menyelidiki alert indikasi pencucian uang (AML) hasil tangkapan sistem di menu AML, lalu melakukan *Resolve* untuk diteruskan ke antrean persetujuan Analyst L2.
**Story POV Analyst L2:** Sebagai Analyst L2, saya ingin meninjau antrean persetujuan kasus AML dari Analyst L1, memvalidasi hasil investigasi pencucian uang, dan menyetujui atau mengembalikannya.
**Story POV Sysadmin:** Tidak Memiliki Akses / Restricted

**Acceptance Criteria:**
* **AC 1:** Isolasi menu total: Antrean Fraud hanya dapat diakses AFC, antrean AML hanya oleh Analyst.
* **AC 2:** *Dual Control Flow*: Resolusi L1 mengubah status menjadi `Pending L2 Review` dan baru benar-benar ditutup jika L2 melakukan *Approve*.
* **AC 3:** Terdapat perhitungan waktu mundur SLA (*Countdown Timer*) visual pada baris kasus berdasarkan parameter channel (VA vs Non-VA).
* **AC 4:** L2 dapat melakukan aksi *Reject/Return* yang mengembalikan kasus ke L1 dengan keterangan perbaikan wajib.

---

### 4. Case Management - Manual Alert
**Nama Menu:** Case Management (Manual Alert)
**Actor:** AFC L1, AFC L2, Analyst L1, Analyst L2
**Object:** Alert Kasus Buatan Pengguna (Manual Intake dari Regulator/Eksternal)

**Story POV AFC L1:** Sebagai AFC L1, saya ingin menginput alert fraud secara manual bersumber dari laporan eksternal (polisi/OJK) dengan melengkapi field wajib, severity, dan melampirkan dokumen bukti PDF/Gambar.
**Story POV AFC L2:** Sebagai AFC L2, saya ingin memverifikasi dan menyetujui (*Approve*) pendaftaran manual alert yang diajukan oleh AFC L1 agar tercatat resmi dan terintegrasi ke profil nasabah.
**Story POV Analyst L1:** Sebagai Analyst L1, saya ingin mencatat alert AML manual dari laporan PPATK/Bank lain dengan melengkapi informasi referensi, alasan, dan file lampiran bukti pendukung.
**Story POV Analyst L2:** Sebagai Analyst L2, saya ingin memvalidasi dan menyetujui pendaftaran manual alert AML yang dibuat oleh Analyst L1 agar terintegrasi ke sistem pemantauan profil CIF.
**Story POV Sysadmin:** Tidak Memiliki Akses / Restricted

**Acceptance Criteria:**
* **AC 1:** Form input mendata alert manual dengan field wajib: Sumber Eksternal, Alasan, No Tiket Referensi, dan Severity.
* **AC 2:** Pembuatan Manual Alert tunduk pada alur *Dual Control* (L1 Create $\rightarrow$ L2 Approve).
* **AC 3:** Dokumen lampiran (Surat Polisi/Regulator format PDF/Image) dapat diunggah sebagai *evidence*.
* **AC 4:** Alert manual yang disetujui terintegrasi dalam perhitungan profil nasabah di menu Profil.

---

### 5. Investigation History
**Nama Menu:** Investigation History
**Actor:** AFC L1, AFC L2, Analyst L1, Analyst L2
**Object:** Arsip Kasus Berstatus Closed

**Story POV AFC L1:** Sebagai AFC L1, saya ingin mencari arsip kasus fraud yang sudah *Closed* untuk peninjauan pola masa lalu dan menambahkan lampiran dokumen susulan (*post-closure attachment*).
**Story POV AFC L2:** Sebagai AFC L2, saya ingin meninjau riwayat kasus closed fraud, memfilter berdasarkan CIF/tanggal, dan mengevaluasi kelengkapan dokumen arsip tim.
**Story POV Analyst L1:** Sebagai Analyst L1, saya ingin menelusuri arsip kasus AML yang sudah closed dan menyematkan dokumen tambahan jika diperlukan penyidikan lanjutan.
**Story POV Analyst L2:** Sebagai Analyst L2, saya ingin memeriksa histori kasus AML closed untuk keperluan audit internal/eksternal dan penelusuran rekam jejak kepatuhan.
**Story POV Sysadmin:** Tidak Memiliki Akses / Restricted

**Acceptance Criteria:**
* **AC 1:** Data pada grid bersifat *Read-Only* secara *default* (tidak bisa ubah severity atau ubah status kembali ke open).
* **AC 2:** Fitur penambahan *Attachment* susulan tersedia pada kasus yang sudah ditutup tanpa merubah status penyelesaian.
* **AC 3:** Sistem menyediakan filter pencarian lanjutan (berdasarkan CIF, Norek, Tanggal Close, dan Alasan Close).
* **AC 4:** Histori Fraud dan AML diisolasi penuh berdasarkan akses Role pengguna.

---

### 6. Jadwal Shifting
**Nama Menu:** Jadwal Shifting
**Actor:** AFC L1, AFC L2
**Object:** Kalender Jadwal Operasional Tim Piket

**Story POV AFC L1:** Sebagai AFC L1, saya ingin melihat jadwal piket/shift operasional saya sendiri melalui tampilan kalender mingguan/bulanan.
**Story POV AFC L2:** Sebagai AFC L2, saya ingin mengatur, mendistribusikan, dan mengubah plot jadwal *shifting* tim operasional AFC L1, serta memantau peringatan jika ada slot shift malam yang kosong.
**Story POV Analyst L1:** Tidak Memiliki Akses / Restricted
**Story POV Analyst L2:** Tidak Memiliki Akses / Restricted
**Story POV Sysadmin:** Tidak Memiliki Akses / Restricted (Dikelola khusus oleh Divisi AFC L2)

**Acceptance Criteria:**
* **AC 1:** HANYA AFC L2 yang memiliki hak akses (*Write/Update*) untuk mengatur jadwal agen. AFC L1 hanya akses *View*.
* **AC 2:** Tampilan menggunakan format *Calendar View* (Harian, Mingguan, Bulanan).
* **AC 3:** Sistem menampilkan indikator visual/peringatan (Alert) jika terdapat slot *shift* operasional yang kosong.
* **AC 4:** Tersedia fitur ekspor jadwal *shift* ke bentuk PDF atau Excel.

---

### 7. Profile (Customer, Debit Card, Transaction, Card Transaction)
**Nama Menu:** Profile Analytics
**Actor:** AFC L1, AFC L2, Analyst L1, Analyst L2, Sysadmin
**Object:** Profil Nasabah BSS dan Data Transaksi Historis

**Story POV AFC L1:** Sebagai AFC L1, saya ingin menganalisis profil 360 derajat nasabah (multi-rekening per CIF) dan memeriksa riwayat transaksi dengan *flagging* merah pada transaksi yang melanggar rule untuk keperluan investigasi fraud.
**Story POV AFC L2:** Sebagai AFC L2, saya ingin meninjau profil nasabah dan detail 14 field transaksi pada laporan investigasi L1 untuk memvalidasi tingkat akurasi sebelum menyetujui kasus.
**Story POV Analyst L1:** Sebagai Analyst L1, saya ingin meneliti profil nasabah CIF dan histori transaksinya untuk mendeteksi anomali pencucian uang dan pola struktur penarikan dana.
**Story POV Analyst L2:** As Analyst L2, saya ingin memeriksa data profil dan riwayat transaksi nasabah terindikasi AML untuk memastikan validitas keputusan kepatuhan.
**Story POV Sysadmin:** Sebagai Sysadmin, saya ingin memastikan modul profil nasabah menampilkan data secara *view-only* dengan integritas tinggi dan relasi 1-to-N yang akurat.

**Acceptance Criteria:**
* **AC 1:** *Customer Profile* menampilkan tabel pemetaan 1-to-N (Satu CIF memiliki banyak rekening / Source Account).
* **AC 2:** *Transaction History* wajib menampilkan kolom *Flagging/Badge* warna merah jika transaksi memicu Rule Engine.
* **AC 3:** Baris transaksi yang di-klik memunculkan popup detail dalam format *Vertical Key-Value List* memuat 14 Field Wajib berurutan.
* **AC 4:** Akses data bersifat *View-Only* (tidak memperkenankan pengguna memanipulasi saldo atau profil).

---

### 8. Rule Engine - Rule Template (Fraud & AML)
**Nama Menu:** Rule Template (View & Approval)
**Actor:** AFC L1, AFC L2, Analyst L1, Analyst L2
**Object:** Kerangka Kuari (Query Skeleton) Rule Fraud & AML

**Story POV AFC L1:** Sebagai AFC L1, saya ingin merumuskan sintaks query template rule fraud baru dengan placeholder parameter, lalu mengajukannya ke antrean checker.
**Story POV AFC L2:** Sebagai AFC L2, saya ingin meninjau sintaks query template fraud buatan L1 dan menyetujuinya agar template dapat digunakan di Rule Basic.
**Story POV Analyst L1:** Sebagai Analyst L1, saya ingin membuat kerangka query template rule AML beserta placeholder parameter, lalu mengirimkannya untuk disetujui checker.
**Story POV Analyst L2:** As Analyst L2, saya ingin memvalidasi dan menyetujui kerangka rule template AML buatan Analyst L1.
**Story POV Sysadmin:** Tidak Memiliki Akses / Restricted

**Acceptance Criteria:**
* **AC 1:** Formulir pembuatan menyediakan *Editor Scripting/Query* dengan fitur *syntax highlight*.
* **AC 2:** Sistem mendeteksi dan memvalidasi *placeholder parameter* (misal: `<THRESHOLD_AMOUNT>` atau `{{THRESHOLD_AMOUNT}}`).
* **AC 3:** Seluruh pembuatan/perubahan *Rule Template* berstatus `Pending Approval` (Maker-Checker).
* **AC 4:** Template yang sudah diikat oleh *Rule Basic* aktif otomatis terkunci (*Locked*) dari penghapusan.
* **AC 5:** **AI Rule Copilot Integration**: Tersedia fitur interaktif *AI Copilot Assistant* yang dapat menerjemahkan deskripsi kejahatan dalam bahasa alami menjadi sintaks kueri database (SQL/CQL) yang valid, mengekstraksi variabel *placeholder* dinamis, melakukan *Syntax Audit & Performance Optimizer*, serta menghasilkan ringkasan teknis berbahasa Indonesia.
* **AC 6:** **Dual Control & Governance Guardrail**: Output kueri dan variabel dari AI murni berstatus *Draft (Unverified)* yang diinjeksikan ke editor milik L1 (Maker) untuk verifikasi manual. AI tidak memiliki hak merilis atau mengaktifkan template secara mandiri; template tetap wajib melalui alur *Pending Approval*, pengujian *Rule Backtesting*, dan otorisasi *L2 Checker*.

---

### 9. Rule Engine - Rule Basic (Fraud & AML)
**Nama Menu:** Rule Basic (View & Approval)
**Actor:** AFC L1, AFC L2, Analyst L1, Analyst L2
**Object:** Konfigurasi Parameter Operasional Rule

**Story POV AFC L1:** Sebagai AFC L1, saya ingin meracik rule operasional fraud dengan memilih template, mengisi placeholder, menetapkan aksi (Block/Alert), severity, dan memilih kanal transaksi (MB, OB, VA, QRIS, CARD), lalu mengajukannya ke L2.
**Story POV AFC L2:** Sebagai AFC L2, saya ingin meninjau konfigurasi rule basic fraud yang dibuat L1 dan memberikan persetujuan (*Approve*) untuk pengujian backtesting/live.
**Story POV Analyst L1:** Sebagai Analyst L1, saya ingin membuat konfigurasi rule basic AML dengan memilih template AML, menentukan parameter threshold, aksi respon, severity, dan kanal, lalu mengajukannya ke Analyst L2.
**Story POV Analyst L2:** Sebagai Analyst L2, saya ingin memvalidasi dan menyetujui konfigurasi rule basic AML buatan Analyst L1.
**Story POV Sysadmin:** Tidak Memiliki Akses / Restricted

**Acceptance Criteria:**
* **AC 1:** Pengguna L1 memilih *Rule Template* aktif; sistem otomatis memunculkan form input berdasarkan *placeholder*.
* **AC 2:** L1 dapat mengatur respon mesin (`Block`, `Hold`, `Create Alert Only`) dan *Severity Level*.
* **AC 3:** Harus melewati persetujuan L2 Checker via antrean khusus (Rule Engine Approval).
* **AC 4:** Parameter channel transaksi (MB, OB, VA, QRIS, CARD) wajib dipilih minimal 1 (*Checkbox multiselect*).

---

### 10. Rule Backtesting
**Nama Menu:** Rule Backtesting
**Actor:** AFC L1, AFC L2, Analyst L1, Analyst L2
**Object:** Simulasi Performa Rule Baru (Shadow Mode)

**Story POV AFC L1:** Sebagai AFC L1, saya ingin menguji rule basic fraud (draft) terhadap data histori transaksi masa lalu (hingga 30 hari) dalam *Shadow Mode* untuk melihat jumlah hit dan false positive ratio.
**Story POV AFC L2:** Sebagai AFC L2, saya ingin mengevaluasi laporan hasil backtesting rule fraud sebagai syarat wajib sebelum rule di-approve ke production.
**Story POV Analyst L1:** Sebagai Analyst L1, saya ingin menjalankan backtesting pada rule AML draft menggunakan data historis AML untuk menguji performa akurasi deteksi pencucian uang.
**Story POV Analyst L2:** Sebagai Analyst L2, saya ingin memeriksa metrik hasil backtesting rule AML sebelum memberikan otorisasi live.
**Story POV Sysadmin:** Tidak Memiliki Akses / Restricted

**Acceptance Criteria:**
* **AC 1:** Pengguna dapat memilih *Rule Basic* (Draft) dan menentukan rentang waktu historis maksimal 30 hari ke belakang.
* **AC 2:** Eksekusi mesin FMS bersifat isolasi penuh (*Shadow Mode*) tanpa men-trigger notifikasi/blokir nyata.
* **AC 3:** Menghasilkan metrik simulasi: Jumlah Hit (True Positive estimasi) dan False Positive Ratio.
* **AC 4:** Rule baru HANYA bisa diajukan ke L2 Checker (Approve untuk Live) apabila Backtesting telah dijalankan minimal 1 kali.

---

### 11. Risk Engine - Formula Risk Engine
**Nama Menu:** Formula Risk Engine
**Actor:** AFC L1, AFC L2, Analyst L1, Analyst L2, Sysadmin
**Object:** Algoritma Skoring CIF / Rekening

**Story POV AFC L1:** Sebagai AFC L1, saya ingin mengajukan bobot pengali risiko (*Weight Multiplier*) berdasarkan severity kasus fraud untuk memperkaya akurasi skoring nasabah.
**Story POV AFC L2:** Sebagai AFC L2, saya ingin menyetujui perubahan formula skoring risiko fraud yang diajukan oleh tim L1.
**Story POV Analyst L1:** Sebagai Analyst L1, saya ingin mengusulkan penyesuaian formula pembobotan risiko AML dan melakukan uji simulasi skoring (*Test Formula*) pada CIF tertentu.
**Story POV Analyst L2:** Sebagai Analyst L2, saya ingin memvalidasi dan menyetujui formula skoring risiko kepatuhan yang diajukan oleh Analyst L1.
**Story POV Sysadmin:** Sebagai Sysadmin, saya ingin memastikan implementasi kalkulasi formula risk engine berjalan optimal dan terintegrasi ke seluruh profil nasabah.

**Acceptance Criteria:**
* **AC 1:** Terdapat form untuk mendefinisikan *Weight Multiplier* (Pengali Bobot) berdasarkan kombinasi *Severity Case*.
* **AC 2:** Tunduk pada alur persetujuan Maker-Checker.
* **AC 3:** Menyediakan tombol "Test Formula" untuk mensimulasikan hasil skoring ke 1 CIF spesifik.
* **AC 4:** Menampilkan indikator visibilitas level batas rentang risiko (0-30 Low, 31-70 Med, 71-100 High).

---

### 12. List Management (Blacklist, Watchlist, Whitelist)
**Nama Menu:** List Management (Fraud & AML)
**Actor:** AFC L1, AFC L2, Analyst L1, Analyst L2
**Object:** Entitas Rekening / CIF / Device / No HP

**Story POV AFC L1:** Sebagai AFC L1, saya ingin mendaftarkan entitas mencurigakan ke Fraud Blacklist/Watchlist/Whitelist (dengan opsi Permanent, Duration Based, atau Specific Payroll Dates) secara satuan atau bulk CSV, serta memantau tab *Pending Approval*.
**Story POV AFC L2:** Sebagai AFC L2, saya ingin meninjau dan menyetujui/menolak pengajuan list management fraud dari AFC L1 melalui antrean Approval.
**Story POV Analyst L1:** Sebagai Analyst L1, saya ingin mendaftarkan entitas ke AML Watchlist/Whitelist dengan domain isolasi AML serta memantau status pengajuannya di Pending tab.
**Story POV Analyst L2:** Sebagai Analyst L2, saya ingin memvalidasi dan menyetujui antrean pengajuan list management AML dari Analyst L1.
**Story POV Sysadmin:** Tidak Memiliki Akses / Restricted

**Acceptance Criteria:**
* **AC 1:** *Strict Domain Isolation*: AFC L1 hanya melihat Fraud List, Analyst L1 hanya AML List.
* **AC 2:** Pendaftaran Whitelist memiliki 3 tipe: `Permanent`, `Duration Based`, dan `Specific Dates` (payroll multi-date).
* **AC 3:** Entri tunggal maupun *Bulk Upload CSV* masuk berstatus `Pending Approval` ke antrean L2.
* **AC 4:** Pengguna L1 disediakan tab *Tracker* berlabel `Pending Approval` di halaman utama.

---

### 13. External Blacklist / DTTOT
**Nama Menu:** External Blacklist / DTTOT
**Actor:** Analyst L1, Analyst L2
**Object:** Daftar Terduga Teroris (DTTOT / PPATK)

**Story POV AFC L1:** Tidak Memiliki Akses / Restricted (Sepenuhnya disembunyikan dari peran AFC)
**Story POV AFC L2:** Tidak Memiliki Akses / Restricted (Sepenuhnya disembunyikan dari peran AFC)
**Story POV Analyst L1:** Sebagai Analyst L1, saya ingin mengunggah file bulk CSV/Excel daftar DTTOT resmi dari regulator PPATK untuk memperbarui database blacklist kepatuhan.
**Story POV Analyst L2:** Sebagai Analyst L2, saya ingin me-review *preview data parsing* DTTOT yang diunggah Analyst L1 sebelum menyetujui pembaruan database master.
**Story POV Sysadmin:** Tidak Memiliki Akses / Restricted (Eksklusif domain Kepatuhan AML)

**Acceptance Criteria:**
* **AC 1:** Menu ini sepenuhnya disembunyikan/terkunci dari role AFC (Fraud) dan Sysadmin.
* **AC 2:** Mendukung unggah format *CSV/Excel template* standar dari regulator.
* **AC 3:** L2 AML Checker harus me-review *preview data parsing* sebelum menyetujui pembaruan *database*.
* **AC 4:** Entitas yang berhasil terdaftar otomatis diberi status tag khusus (`DTTOT`) pada profil nasabah dan risk engine.

---

### 14. System Parameter
**Nama Menu:** System Parameter (User, Group, Role, Access, App Param, User Def Param, Email, Session, Location)
**Actor:** AFC L2, Sysadmin
**Object:** Konfigurasi Basis Aplikasi FMS & Zona Geo-Fencing

**Story POV AFC L1:** Tidak Memiliki Akses / Restricted (Kecuali pengajuan Watchlist Location)
**Story POV AFC L2:** Sebagai AFC L2, saya ingin mengajukan penambahan titik zona merah (*Watchlist Location* berbasis Latitude, Longitude, dan Radius KM) untuk pengawasan fraud geografis.
**Story POV Analyst L1:** Tidak Memiliki Akses / Restricted
**Story POV Analyst L2:** Tidak Memiliki Akses / Restricted
**Story POV Sysadmin:** Sebagai Sysadmin, saya ingin mengelola User, Group, Role, Access Tree RBAC, Application Parameter (SLA jam/hari dinamis), User Defined Parameter, Email Template, User Session (Force Kick/Revoke), dan menyetujui Watchlist Location.

**Acceptance Criteria:**
* **AC 1:** `Application Parameter`: Tersedia form JSON/Key-Value untuk Sysadmin mengubah batas jam/hari SLA secara dinamis tanpa *deployment*.
* **AC 2:** `User Session & Lockout`: Menampilkan *Real-time active token* dan tombol `Force Kick/Revoke`.
* **AC 3:** `Watchlist Location`: Menyediakan input *Latitude, Longitude*, dan *Radius (KM)* dengan proses *Dual Control*.
* **AC 4:** `Access Menu Management`: Menyediakan antarmuka *Checkbox Tree* hierarki menu *View, Edit, Approve*.

---

### 15. Process
**Nama Menu:** Process (Task, List Process, Manual Execution)
**Actor:** Sysadmin
**Object:** Background Job / Scheduled Stored Procedures & EOD Tasks

**Story POV AFC L1:** Tidak Memiliki Akses / Restricted
**Story POV AFC L2:** Tidak Memiliki Akses / Restricted
**Story POV Analyst L1:** Tidak Memiliki Akses / Restricted
**Story POV Analyst L2:** Tidak Memiliki Akses / Restricted
**Story POV Sysadmin:** Sebagai Sysadmin, saya ingin mendaftarkan Stored Procedure DB menjadi Task, merangkainya secara sekuensial di List Process, memicu eksekusi on-demand via Run Now, serta memantau log status Success/Failed.

**Acceptance Criteria:**
* **AC 1:** `Task`: Dapat mendaftarkan nama/path eksekusi SP database (atau API call).
* **AC 2:** `List Process`: Menyediakan urutan angka (*Step 1, Step 2*) untuk merangkai Task sekuensial.
* **AC 3:** `Manual Execution`: Tombol "Run Now" untuk men-*trigger* proses secara *on-demand*.
* **AC 4:** Sistem wajib menyediakan log indikator sukses (Hijau/Success) atau gagal (Merah/Failed) beserta pesan error.

---

### 16. Audit Trail
**Nama Menu:** Audit Trail (System, Changes, Login, Access, Mail)
**Actor:** AFC L2, Analyst L2, Sysadmin
**Object:** Immutable Logs (Jejak Audit Aktivitas Sistem)

**Story POV AFC L1:** Tidak Memiliki Akses / Restricted
**Story POV AFC L2:** Sebagai AFC L2 (Auditor), saya ingin memeriksa log perubahan data dan aktivitas akses untuk kebutuhan audit internal penanganan kasus fraud.
**Story POV Analyst L1:** Tidak Memiliki Akses / Restricted
**Story POV Analyst L2:** Sebagai Analyst L2 (Auditor), saya ingin meninjau riwayat audit perubahan rule dan login guna memastikan kepatuhan standar audit perbankan.
**Story POV Sysadmin:** Sebagai Sysadmin, saya ingin memastikan seluruh log sistem tersimpan secara *immutable* (tidak dapat dihapus), menyediakan filter komprehensif, dan mendukung ekspor laporan Audit ke PDF/CSV terenkripsi.

**Acceptance Criteria:**
* **AC 1:** Seluruh entri pada menu *Audit Trail* bersifat *Immutable* (TIDAK BISA diedit atau dihapus dari *frontend*).
* **AC 2:** Pada `Audit Trail Changes`, grid menampilkan komparasi kolom `Nilai Sebelumnya (Old Value)` vs `Nilai Baru (New Value)` secara eksplisit.
* **AC 3:** Tersedia filter komprehensif (User ID, IP Address, Nama Modul, Rentang Tanggal).
* **AC 4:** Menyediakan fitur *Export to Encrypted PDF / CSV* guna memenuhi permintaan auditor/regulator.
