import { ProcessTask, ProcessItem, ProcessExecutionLog } from '../types/process';

export const INITIAL_PROCESS_TASKS: ProcessTask[] = [
  {
    id: 'TSK-001',
    taskName: 'Transform Customer Individu from STG',
    taskDescription: 'Mengambil data staging nasabah perorangan dari Core Banking dan melakukan normalisasi ke database DWH Fraud.',
    isActive: true,
    createdAt: '2026-08-15 10:00:00',
    updatedAt: '2026-09-02 14:30:00',
    createdBy: 'yoseph.sanjaya',
    details: [
      {
        id: 'TD-001-1',
        orderNo: 1,
        taskDetailType: 'SSIS File',
        spOrSsisFileName: 'SSIS_STG_Customer_Extract.dtsx',
        useParameter: true,
        parameterDetails: '@CutOffDate, @BatchID',
        description: 'Extract bulk dump CIF dari Core Banking SFTP ke Staging'
      },
      {
        id: 'TD-001-2',
        orderNo: 2,
        taskDetailType: 'Store Procedure',
        spOrSsisFileName: 'sp_transform_customer_individu_stg',
        useParameter: true,
        parameterDetails: '@BatchID, @CutOffDate',
        description: 'Transformasi kolom KYC, status PEP, dan normalisasi NIK'
      },
      {
        id: 'TD-001-3',
        orderNo: 3,
        taskDetailType: 'Store Procedure',
        spOrSsisFileName: 'sp_load_dim_customer_fms',
        useParameter: true,
        parameterDetails: '@BatchID',
        description: 'Load hasil transformasi ke table DIM_CUSTOMER_FMS'
      }
    ]
  },
  {
    id: 'TSK-002',
    taskName: 'Screening Daily',
    taskDescription: 'Eksekusi batch rule screening AML & Fraud harian untuk seluruh mutasi rekening 24 jam terakhir.',
    isActive: true,
    createdAt: '2026-08-15 10:30:00',
    updatedAt: '2026-09-03 09:15:00',
    createdBy: 'siti.aminah',
    details: [
      {
        id: 'TD-002-1',
        orderNo: 1,
        taskDetailType: 'Store Procedure',
        spOrSsisFileName: 'sp_aml_daily_screening_engine',
        useParameter: true,
        parameterDetails: '@ProcessDate, @RiskLevel',
        description: 'Evaluasi rule AML agregasi mutasi > 500 Juta dan High Velocity'
      },
      {
        id: 'TD-002-2',
        orderNo: 2,
        taskDetailType: 'Store Procedure',
        spOrSsisFileName: 'sp_fraud_daily_card_screening',
        useParameter: true,
        parameterDetails: '@ProcessDate',
        description: 'Evaluasi transaksi ATM & POS mencurigakan dan multiple decline'
      },
      {
        id: 'TD-002-3',
        orderNo: 3,
        taskDetailType: 'Store Procedure',
        spOrSsisFileName: 'sp_generate_daily_screening_alerts',
        useParameter: true,
        parameterDetails: '@ProcessDate, @ThresholdLevel',
        description: 'Generate case baru ke antrean Fraud Case & AML Case'
      }
    ]
  },
  {
    id: 'TSK-003',
    taskName: 'EOD Card Transaction Aggregation',
    taskDescription: 'Agregasi harian transaksi kartu debit/ATM, rekonsiliasi switching Alto/Bersama/Prima, dan kalkulasi risk score per kartu.',
    isActive: true,
    createdAt: '2026-08-16 11:20:00',
    updatedAt: '2026-09-01 16:45:00',
    createdBy: 'hendra.wijaya',
    details: [
      {
        id: 'TD-003-1',
        orderNo: 1,
        taskDetailType: 'Store Procedure',
        spOrSsisFileName: 'sp_aggregate_eod_debit_transactions',
        useParameter: true,
        parameterDetails: '@CutOffDate',
        description: 'Menghitung total volume dan frekuensi transaksi per PAN kartu'
      },
      {
        id: 'TD-003-2',
        orderNo: 2,
        taskDetailType: 'Store Procedure',
        spOrSsisFileName: 'sp_reconcile_switching_network',
        useParameter: true,
        parameterDetails: '@CutOffDate, @NetworkId',
        description: 'Cross-match authorization log dengan switching clearing file'
      }
    ]
  },
  {
    id: 'TSK-004',
    taskName: 'External Blacklist Delta Sync (DTTOT / PPATK / OJK)',
    taskDescription: 'Sinkronisasi otomatis daftar terduga teroris dan PEP dari portal regulator ke database FMS.',
    isActive: true,
    createdAt: '2026-08-20 09:00:00',
    updatedAt: '2026-09-04 01:00:00',
    createdBy: 'system.admin',
    details: [
      {
        id: 'TD-004-1',
        orderNo: 1,
        taskDetailType: 'SSIS File',
        spOrSsisFileName: 'SSIS_Download_Regulator_Blacklist.dtsx',
        useParameter: false,
        parameterDetails: '',
        description: 'Download XML/CSV delta feed dari secure portal BI / PPATK'
      },
      {
        id: 'TD-004-2',
        orderNo: 2,
        taskDetailType: 'Store Procedure',
        spOrSsisFileName: 'sp_ingest_external_blacklist_delta',
        useParameter: true,
        parameterDetails: '@SourceRegulator, @EffectiveDate',
        description: 'Sinkronisasi nama, NIK, dan alias ke Master External Blacklist'
      }
    ]
  },
  {
    id: 'TSK-005',
    taskName: 'Export BI Antasena Monthly STG',
    taskDescription: 'Ekstraksi data kepatuhan anti-fraud dan agregat nasabah berisiko tinggi untuk pelaporan bulanan BI Antasena.',
    isActive: false,
    createdAt: '2026-08-25 14:00:00',
    updatedAt: '2026-09-02 18:00:00',
    createdBy: 'yoseph.sanjaya',
    details: [
      {
        id: 'TD-005-1',
        orderNo: 1,
        taskDetailType: 'Store Procedure',
        spOrSsisFileName: 'sp_generate_bi_antasena_stg_report',
        useParameter: true,
        parameterDetails: '@ReportingPeriod, @BranchFilter',
        description: 'Generate format TXT/CSV sesuai spesifikasi Bank Indonesia'
      },
      {
        id: 'TD-005-2',
        orderNo: 2,
        taskDetailType: 'SSIS File',
        spOrSsisFileName: 'SSIS_Upload_Antasena_SecureDrop.dtsx',
        useParameter: true,
        parameterDetails: '@ReportingPeriod',
        description: 'Upload terenkripsi ke direktori SFTP integrasi'
      }
    ]
  }
];

export const INITIAL_PROCESS_LIST: ProcessItem[] = [
  {
    id: 'PRC-EOD-001',
    processName: 'Daily EOD Engine Batch Processing',
    description: 'Rangkaian proses penutupan harian (End of Day) untuk transformasi data staging nasabah, agregasi transaksi debit/kartu, dan batch screening rule AML & Fraud.',
    hasPeriodicalScheduler: true,
    schedulerPeriod: 1,
    periodType: 'Days',
    startDate: '2026-09-01',
    executionTime: '23:30',
    nextSchedule: '2026-09-04 23:30:00 WIB',
    isActive: true,
    createdAt: '2026-08-15 12:00:00',
    updatedAt: '2026-09-03 14:00:00',
    createdBy: 'yoseph.sanjaya',
    sequenceTasks: [
      {
        id: 'SEQ-001-1',
        orderNo: 1,
        taskId: 'TSK-001',
        taskName: 'Transform Customer Individu from STG',
        taskDetailCount: 3
      },
      {
        id: 'SEQ-001-2',
        orderNo: 2,
        taskId: 'TSK-003',
        taskName: 'EOD Card Transaction Aggregation',
        taskDetailCount: 2
      },
      {
        id: 'SEQ-001-3',
        orderNo: 3,
        taskId: 'TSK-002',
        taskName: 'Screening Daily',
        taskDetailCount: 3
      }
    ]
  },
  {
    id: 'PRC-DAILY-002',
    processName: 'Morning Screening & Blacklist Delta Sync',
    description: 'Proses pagi hari untuk sinkronisasi delta daftar hitam eksternal (DTTOT/PPATK) dan evaluasi ulang screening harian nasabah baru.',
    hasPeriodicalScheduler: true,
    schedulerPeriod: 1,
    periodType: 'Days',
    startDate: '2026-09-01',
    executionTime: '05:00',
    nextSchedule: '2026-09-05 05:00:00 WIB',
    isActive: true,
    createdAt: '2026-08-18 09:00:00',
    updatedAt: '2026-09-04 01:20:00',
    createdBy: 'system.admin',
    sequenceTasks: [
      {
        id: 'SEQ-002-1',
        orderNo: 1,
        taskId: 'TSK-004',
        taskName: 'External Blacklist Delta Sync (DTTOT / PPATK / OJK)',
        taskDetailCount: 2
      },
      {
        id: 'SEQ-002-2',
        orderNo: 2,
        taskId: 'TSK-002',
        taskName: 'Screening Daily',
        taskDetailCount: 3
      }
    ]
  },
  {
    id: 'PRC-MONTHLY-003',
    processName: 'Monthly BI Antasena Regulatory Reporting',
    description: 'Proses bulanan ekstraksi dataset kepatuhan anti-fraud dan upload ke Bank Indonesia Antasena.',
    hasPeriodicalScheduler: true,
    schedulerPeriod: 1,
    periodType: 'Months',
    startDate: '2026-09-01',
    executionTime: '01:00',
    nextSchedule: '2026-10-01 01:00:00 WIB',
    isActive: false,
    createdAt: '2026-08-25 15:30:00',
    updatedAt: '2026-09-02 11:10:00',
    createdBy: 'siti.aminah',
    sequenceTasks: [
      {
        id: 'SEQ-003-1',
        orderNo: 1,
        taskId: 'TSK-005',
        taskName: 'Export BI Antasena Monthly STG',
        taskDetailCount: 2
      }
    ]
  },
  {
    id: 'PRC-ADHOC-004',
    processName: 'On-Demand Full Transaction Re-Screening',
    description: 'Eksekusi manual on-demand re-evaluasi seluruh transaksi jika terdapat perubahan aturan threshold atau emergency blacklist update.',
    hasPeriodicalScheduler: false,
    nextSchedule: '-',
    isActive: true,
    createdAt: '2026-08-28 16:00:00',
    updatedAt: '2026-09-03 17:00:00',
    createdBy: 'yoseph.sanjaya',
    sequenceTasks: [
      {
        id: 'SEQ-004-1',
        orderNo: 1,
        taskId: 'TSK-002',
        taskName: 'Screening Daily',
        taskDetailCount: 3
      }
    ]
  }
];

export const INITIAL_PROCESS_EXECUTIONS: ProcessExecutionLog[] = [
  {
    id: 'EXE-20260904-001',
    type: 'Process',
    targetId: 'PRC-EOD-001',
    name: 'Daily EOD Engine Batch Processing [PRC-EOD-001]',
    triggeredBy: 'SYSTEM_SCHEDULER',
    triggerMode: 'Scheduled',
    executionDate: '2026-09-04',
    startTime: '2026-09-04 00:00:05',
    endTime: '2026-09-04 00:18:42',
    duration: '00:18:37',
    status: 'Success',
    remarks: 'EOD batch processing sukses memproses 184,920 transaksi tanpa kendala.',
    totalSteps: 8,
    completedSteps: 8,
    databaseTarget: 'SQL_SRV_FMS_PROD (10.10.20.15)',
    steps: [
      {
        stepNo: 1,
        stepName: 'SSIS_STG_Customer_Extract.dtsx',
        stepType: 'SSIS File',
        status: 'Success',
        duration: '00:03:12',
        rowsAffected: 12450,
        outputLog: '[SSIS] Successfully extracted 12,450 customer records from Core SFTP.'
      },
      {
        stepNo: 2,
        stepName: 'sp_transform_customer_individu_stg',
        stepType: 'Store Procedure',
        status: 'Success',
        duration: '00:02:40',
        rowsAffected: 12450,
        outputLog: '[SQL] Transformed 12,450 rows into STG_TRANSFORMED_CUST.'
      },
      {
        stepNo: 3,
        stepName: 'sp_load_dim_customer_fms',
        stepType: 'Store Procedure',
        status: 'Success',
        duration: '00:01:10',
        rowsAffected: 12450,
        outputLog: '[SQL] Upserted into DIM_CUSTOMER_FMS successfully.'
      },
      {
        stepNo: 4,
        stepName: 'sp_aggregate_eod_debit_transactions',
        stepType: 'Store Procedure',
        status: 'Success',
        duration: '00:04:15',
        rowsAffected: 184920,
        outputLog: '[SQL] Aggregated 184,920 card transactions across 12,300 active PANs.'
      },
      {
        stepNo: 5,
        stepName: 'sp_reconcile_switching_network',
        stepType: 'Store Procedure',
        status: 'Success',
        duration: '00:02:05',
        rowsAffected: 184920,
        outputLog: '[SQL] Switching reconciliation balanced 100% matched.'
      },
      {
        stepNo: 6,
        stepName: 'sp_aml_daily_screening_engine',
        stepType: 'Store Procedure',
        status: 'Success',
        duration: '00:02:50',
        rowsAffected: 42,
        outputLog: '[SQL] AML screening evaluated 184,920 records. 42 matched AML rules.'
      },
      {
        stepNo: 7,
        stepName: 'sp_fraud_daily_card_screening',
        stepType: 'Store Procedure',
        status: 'Success',
        duration: '00:01:45',
        rowsAffected: 18,
        outputLog: '[SQL] Fraud card screening evaluated 184,920 records. 18 potential cases flagged.'
      },
      {
        stepNo: 8,
        stepName: 'sp_generate_daily_screening_alerts',
        stepType: 'Store Procedure',
        status: 'Success',
        duration: '00:00:40',
        rowsAffected: 60,
        outputLog: '[SQL] Generated 60 alerts into Case Management Queue.'
      }
    ],
    logs: [
      '[00:00:05] SchedJobWorker: Initializing Daily EOD Engine Batch Processing (PRC-EOD-001)...',
      '[00:00:08] Connecting to database SQL_SRV_FMS_PROD (10.10.20.15) with schema dbo...',
      '[00:00:10] Executing Task 1/3: Transform Customer Individu from STG (TSK-001)...',
      '[00:03:22] Task 1 completed in 00:07:02 with status: SUCCESS.',
      '[00:03:25] Executing Task 2/3: EOD Card Transaction Aggregation (TSK-003)...',
      '[00:09:45] Task 2 completed in 00:06:20 with status: SUCCESS.',
      '[00:09:50] Executing Task 3/3: Screening Daily (TSK-002)...',
      '[00:18:35] Task 3 completed in 00:05:15 with status: SUCCESS.',
      '[00:18:42] Process completed successfully. Total duration: 00:18:37. Exit code: 0.'
    ]
  },
  {
    id: 'EXE-20260904-002',
    type: 'Process',
    targetId: 'PRC-DAILY-002',
    name: 'Morning Screening & Blacklist Delta Sync [PRC-DAILY-002]',
    triggeredBy: 'SYSTEM_SCHEDULER',
    triggerMode: 'Scheduled',
    executionDate: '2026-09-04',
    startTime: '2026-09-04 05:00:02',
    endTime: '2026-09-04 05:06:19',
    duration: '00:06:17',
    status: 'Success',
    remarks: 'Sinkronisasi delta DTTOT 14 entri baru selesai.',
    totalSteps: 5,
    completedSteps: 5,
    databaseTarget: 'SQL_SRV_FMS_PROD (10.10.20.15)',
    steps: [
      {
        stepNo: 1,
        stepName: 'SSIS_Download_Regulator_Blacklist.dtsx',
        stepType: 'SSIS File',
        status: 'Success',
        duration: '00:01:25',
        rowsAffected: 14,
        outputLog: '[SSIS] Downloaded 14 delta records from PPATK / OJK feed.'
      },
      {
        stepNo: 2,
        stepName: 'sp_ingest_external_blacklist_delta',
        stepType: 'Store Procedure',
        status: 'Success',
        duration: '00:00:52',
        rowsAffected: 14,
        outputLog: '[SQL] Ingested 14 records into EXTERNAL_BLACKLIST_FEED.'
      },
      {
        stepNo: 3,
        stepName: 'sp_aml_daily_screening_engine',
        stepType: 'Store Procedure',
        status: 'Success',
        duration: '00:02:10',
        rowsAffected: 6,
        outputLog: '[SQL] Matched 6 potential matches against delta entries.'
      },
      {
        stepNo: 4,
        stepName: 'sp_fraud_daily_card_screening',
        stepType: 'Store Procedure',
        status: 'Success',
        duration: '00:01:20',
        rowsAffected: 2,
        outputLog: '[SQL] Card screening matched 2 suspicious records.'
      },
      {
        stepNo: 5,
        stepName: 'sp_generate_daily_screening_alerts',
        stepType: 'Store Procedure',
        status: 'Success',
        duration: '00:00:30',
        rowsAffected: 8,
        outputLog: '[SQL] Generated 8 new alerts into Case Review.'
      }
    ],
    logs: [
      '[05:00:02] SchedJobWorker: Inisialisasi Morning Screening & Blacklist Delta Sync...',
      '[05:00:05] Memulai download feed regulator XML...',
      '[05:01:30] Feed regulator terverifikasi checksum SHA256.',
      '[05:02:22] Delta 14 records berhasil di-ingest.',
      '[05:06:19] Screening Morning selesai tanpa kegagalan.'
    ]
  },
  {
    id: 'EXE-20260904-003',
    type: 'Task',
    targetId: 'TSK-001',
    name: 'Transform Customer Individu from STG [TSK-001]',
    triggeredBy: 'yoseph.sanjaya (Senior Fraud Lead)',
    triggerMode: 'Manual',
    executionDate: '2026-09-04',
    startTime: '2026-09-04 08:12:10',
    endTime: '2026-09-04 08:15:35',
    duration: '00:03:25',
    status: 'Success',
    remarks: 'Manual incremental transform CIF individual dari Core Banking.',
    totalSteps: 3,
    completedSteps: 3,
    databaseTarget: 'SQL_SRV_FMS_PROD (10.10.20.15)',
    steps: [
      {
        stepNo: 1,
        stepName: 'SSIS_STG_Customer_Extract.dtsx',
        stepType: 'SSIS File',
        status: 'Success',
        duration: '00:01:15',
        rowsAffected: 840,
        outputLog: '[SSIS] Extracted 840 CIF records.'
      },
      {
        stepNo: 2,
        stepName: 'sp_transform_customer_individu_stg',
        stepType: 'Store Procedure',
        status: 'Success',
        duration: '00:01:20',
        rowsAffected: 840,
        outputLog: '[SQL] Transformed 840 CIF records.'
      },
      {
        stepNo: 3,
        stepName: 'sp_load_dim_customer_fms',
        stepType: 'Store Procedure',
        status: 'Success',
        duration: '00:00:50',
        rowsAffected: 840,
        outputLog: '[SQL] Loaded 840 CIF records into DIM_CUSTOMER_FMS.'
      }
    ],
    logs: [
      '[08:12:10] Manual Trigger received from user: yoseph.sanjaya (IP: 10.10.20.101)',
      '[08:12:12] Parameter CutOffDate = 2026-09-04',
      '[08:13:27] SSIS execution completed.',
      '[08:14:47] Stored Procedure sp_transform_customer_individu_stg completed.',
      '[08:15:35] Finished. 840 rows affected. Return code: 0.'
    ]
  },
  {
    id: 'EXE-20260903-004',
    type: 'Task',
    targetId: 'TSK-005',
    name: 'Export BI Antasena Monthly STG [TSK-005]',
    triggeredBy: 'siti.aminah (AML Compliance Head)',
    triggerMode: 'Manual',
    executionDate: '2026-09-03',
    startTime: '2026-09-03 16:20:00',
    endTime: '2026-09-03 16:22:15',
    duration: '00:02:15',
    status: 'Failed',
    remarks: 'SFTP Connection timeout ke server Bank Indonesia saat upload package.',
    totalSteps: 2,
    completedSteps: 1,
    databaseTarget: 'SQL_SRV_FMS_PROD (10.10.20.15)',
    stackTrace: `System.Net.Sockets.SocketException (0x80004005): A connection attempt failed because the connected party did not properly respond after a period of time (10.20.50.88:22).
   at Renci.SshNet.Session.Connect()
   at BankSampoerna.FMS.SSIS.SecureUploader.Execute(TaskContext ctx) in /opt/fms/engine/ssis/UploadAntasena.cs:line 142
   at BankSampoerna.FMS.Engine.ProcessExecutor.RunStep(ProcessTaskDetail step) in /opt/fms/engine/ProcessExecutor.cs:line 289`,
    steps: [
      {
        stepNo: 1,
        stepName: 'sp_generate_bi_antasena_stg_report',
        stepType: 'Store Procedure',
        status: 'Success',
        duration: '00:01:30',
        rowsAffected: 4200,
        outputLog: '[SQL] Generated Antasena dataset 4,200 rows into temp storage.'
      },
      {
        stepNo: 2,
        stepName: 'SSIS_Upload_Antasena_SecureDrop.dtsx',
        stepType: 'SSIS File',
        status: 'Failed',
        duration: '00:00:45',
        outputLog: '[ERROR] Connection to remote SFTP 10.20.50.88 timed out after 45 seconds.'
      }
    ],
    logs: [
      '[16:20:00] Manual Execution triggered by siti.aminah',
      '[16:20:03] Running Step 1: sp_generate_bi_antasena_stg_report...',
      '[16:21:33] Step 1 finished successfully (4,200 rows)',
      '[16:21:34] Running Step 2: SSIS_Upload_Antasena_SecureDrop.dtsx...',
      '[16:22:15] [ERROR] SFTP handshake failed. Host 10.20.50.88 not reachable.',
      '[16:22:15] Process aborted with Exit Code -1.'
    ]
  }
];
