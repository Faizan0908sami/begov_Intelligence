import { useState, useRef, useEffect } from "react";

// ── Palette (Light theme) ────────────────────────────────────────────────────
const C = {
  sidebar: "#0F172A", bg: "#F1F5F9", card: "#FFFFFF",
  navy: "#0F172A", amber: "#B45309", green: "#059669",
  red: "#DC2626", orange: "#D97706", blue: "#3B82F6", gray: "#64748B",
  border: "#E2E8F0", text: "#334155", textMuted: "#64748B",
  cardHover: "#F8FAFC", accent: "#3B82F6",
};

const STATUS = {
  critical:  { color: C.red,    bg: "rgba(220,38,38,0.08)",  label: "Critical"  },
  attention: { color: C.orange, bg: "rgba(217,119,6,0.08)",  label: "Attention" },
  improving: { color: C.green,  bg: "rgba(22,163,74,0.08)",  label: "Improving" },
  aligned:   { color: C.green,  bg: "rgba(22,163,74,0.08)",  label: "Aligned"   },
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const SCHEME = {
  name: "Ayushman Bharat", state: "Uttar Pradesh",
  week: "Week of Apr 7, 2026",
  avgKpi: 91.3, sentiment: -0.61, gap: 1.52,
  complaints: 4821, gapWeeks: 11,
};

const DISTRICTS = [
  {
    name: "Agra", official: "R. Sharma", designation: "District Collector", tenure: "14 mo",
    kpi: 96, sentiment: -0.78, citizenExp: 11, divergence: 1.74,
    trend: "down", feedback: 983, status: "critical", action: "Field audit",
    gamingFlag: true, missedCommitments: 2,
    diagnosis: "KPI 96% with sentiment −0.78 is a significant anomaly — highly negative citizen feedback sustained for three consecutive months. Two national investigations (Times of India, Amar Ujala) independently corroborate informal payment demands at empanelled hospitals. The CMHO has not submitted two consecutive audit reports committed in review meetings. This is no longer a data anomaly — it is a pattern.",
    recommended: "Order an independent SHA field audit of 10 randomly-selected hospitals before this month’s MIS submission is accepted. Issue a written explanation demand to the CMHO with a 7-day response window. ACR notation is now appropriate given tenure and consecutive performance record.",
  },
  {
    name: "Allahabad (Prayagraj)", official: "M. Verma", designation: "District Magistrate", tenure: "8 mo",
    kpi: 82, sentiment: -0.44, citizenExp: 28, divergence: 1.26,
    trend: "stable", feedback: 1055, status: "attention", action: "Explanation",
    gamingFlag: false, missedCommitments: 1,
    diagnosis: "6 hospitals non-compliant with the March fee transparency board requirement — and three of those are the same hospitals generating the highest volume of corruption-related feedback. Selective non-compliance at high-complaint sites is a pattern that warrants investigation, not a general advisory.",
    recommended: "Issue written explanation demand to CMHO. Direct field investigation of the 3 highest-complaint non-compliant hospitals.",
  },
  {
    name: "Lucknow", official: "P. Singh", designation: "District Magistrate", tenure: "22 mo",
    kpi: 89, sentiment: -0.42, citizenExp: 29, divergence: 1.31,
    trend: "up", feedback: 1247, status: "improving", action: "Monitor",
    gamingFlag: false, missedCommitments: 0,
    diagnosis: "Q4 2024 field officer activation programme is producing measurable results. Accessibility sentiment improved for three consecutive months. The processing gap (23 days vs 21-day target) is confirmed as a state-level software issue — not a district failure.",
    recommended: "Continue monitoring. Document field officer deployment model for replication consideration.",
  },
  {
    name: "Kanpur", official: "S. Verma", designation: "CMHO", tenure: "8 mo",
    kpi: 91, sentiment: -0.19, citizenExp: 40, divergence: 1.10,
    trend: "up", feedback: 945, status: "improving", action: "Replicate",
    gamingFlag: false, missedCommitments: 0,
    diagnosis: "Employer-partnership enrollment model delivered 7 new sign-ups this week. Real-time claims dashboard now live at 4 hospitals — processing time fell from 18 to 11 days in two weeks. SHA HQ has flagged this for potential state-wide rollout.",
    recommended: "Document and circulate replication brief to all district CMHOs. Present at next SHA review as a state-wide rollout candidate.",
  },
  {
    name: "Varanasi", official: "A. Mishra", designation: "CMHO", tenure: "31 mo",
    kpi: 74, sentiment: 0.31, citizenExp: 65, divergence: -0.57,
    trend: "up", feedback: 1188, status: "aligned", action: "Replicate",
    gamingFlag: false, missedCommitments: 0,
    diagnosis: "KPI and sentiment are aligned — rare in the reviewed set. Lower KPI (74%) reflects genuine NABH pre-certification infrastructure constraints, not local failure. Positive citizen experience despite capacity constraints makes this a useful reference case.",
    recommended: "Use as positive reference case. Continue monitoring NABH pre-cert progress.",
  },
  { name: "Aligarh", official: "R. Gupta", designation: "District Magistrate", tenure: "8 mo", kpi: 66, sentiment: 0.07, citizenExp: 53, divergence: 0.25, trend: "up", feedback: 657, status: "improving", action: "Escalate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 66% with citizen sentiment at 0.07. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Ambedkar Nagar", official: "P. Sharma", designation: "Chief Medical Officer", tenure: "17 mo", kpi: 79, sentiment: -0.7, citizenExp: 15, divergence: 1.28, trend: "up", feedback: 1349, status: "critical", action: "Replicate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 79% with citizen sentiment at -0.7. Requires immediate attention.", recommended: "Immediate review recommended." },
  { name: "Auraiya", official: "R. Gupta", designation: "Chief Development Officer", tenure: "24 mo", kpi: 75, sentiment: 0.35, citizenExp: 67, divergence: 0.15, trend: "down", feedback: 769, status: "aligned", action: "Monitor", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 75% with citizen sentiment at 0.35. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Azamgarh", official: "M. Srivastava", designation: "Addl. District Magistrate", tenure: "27 mo", kpi: 87, sentiment: 0.0, citizenExp: 50, divergence: 0.74, trend: "up", feedback: 1140, status: "improving", action: "Monitor", gamingFlag: false, missedCommitments: 2, diagnosis: "KPI at 87% with citizen sentiment at 0.0. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Badaun", official: "A. Kumar", designation: "District Programme Coordinator", tenure: "21 mo", kpi: 88, sentiment: 0.29, citizenExp: 64, divergence: 0.47, trend: "stable", feedback: 342, status: "aligned", action: "Monitor", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 88% with citizen sentiment at 0.29. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Baghpat", official: "N. Yadav", designation: "Joint Director (Health)", tenure: "16 mo", kpi: 94, sentiment: 0.02, citizenExp: 51, divergence: 0.86, trend: "down", feedback: 533, status: "improving", action: "Investigate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 94% with citizen sentiment at 0.02. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Bahraich", official: "K. Pandey", designation: "District Magistrate", tenure: "20 mo", kpi: 75, sentiment: -0.03, citizenExp: 48, divergence: 0.53, trend: "up", feedback: 534, status: "improving", action: "Escalate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 75% with citizen sentiment at -0.03. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Ballia", official: "D. Tiwari", designation: "Chief Medical Superintendent", tenure: "7 mo", kpi: 68, sentiment: 0.11, citizenExp: 55, divergence: 0.25, trend: "up", feedback: 846, status: "aligned", action: "Review", gamingFlag: false, missedCommitments: 2, diagnosis: "KPI at 68% with citizen sentiment at 0.11. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Balrampur", official: "G. Saxena", designation: "District Magistrate", tenure: "12 mo", kpi: 85, sentiment: 0.11, citizenExp: 55, divergence: 0.59, trend: "down", feedback: 1010, status: "aligned", action: "Investigate", gamingFlag: false, missedCommitments: 2, diagnosis: "KPI at 85% with citizen sentiment at 0.11. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Banda", official: "P. Sharma", designation: "District Health Officer", tenure: "35 mo", kpi: 92, sentiment: 0.15, citizenExp: 57, divergence: 0.69, trend: "down", feedback: 941, status: "improving", action: "Replicate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 92% with citizen sentiment at 0.15. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Barabanki", official: "B. Chauhan", designation: "Chief Development Officer", tenure: "27 mo", kpi: 74, sentiment: 0.31, citizenExp: 65, divergence: 0.17, trend: "stable", feedback: 1064, status: "aligned", action: "Replicate", gamingFlag: false, missedCommitments: 1, diagnosis: "KPI at 74% with citizen sentiment at 0.31. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Bareilly", official: "J. Rawat", designation: "Addl. Chief Medical Officer", tenure: "24 mo", kpi: 65, sentiment: 0.04, citizenExp: 52, divergence: 0.26, trend: "up", feedback: 1299, status: "improving", action: "Monitor", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 65% with citizen sentiment at 0.04. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Basti", official: "G. Saxena", designation: "District Magistrate", tenure: "22 mo", kpi: 81, sentiment: 0.19, citizenExp: 59, divergence: 0.43, trend: "up", feedback: 1239, status: "improving", action: "Escalate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 81% with citizen sentiment at 0.19. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Bijnor", official: "B. Chauhan", designation: "Chief Medical Officer", tenure: "34 mo", kpi: 75, sentiment: -0.03, citizenExp: 48, divergence: 0.53, trend: "stable", feedback: 201, status: "improving", action: "Monitor", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 75% with citizen sentiment at -0.03. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Bulandshahr", official: "S. Singh", designation: "District Programme Officer", tenure: "34 mo", kpi: 84, sentiment: 0.12, citizenExp: 56, divergence: 0.56, trend: "up", feedback: 1361, status: "aligned", action: "Monitor", gamingFlag: false, missedCommitments: 2, diagnosis: "KPI at 84% with citizen sentiment at 0.12. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Chandauli", official: "V. Mishra", designation: "Addl. District Magistrate (F&R)", tenure: "16 mo", kpi: 73, sentiment: 0.33, citizenExp: 66, divergence: 0.13, trend: "stable", feedback: 538, status: "aligned", action: "Escalate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 73% with citizen sentiment at 0.33. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Chitrakoot", official: "K. Pandey", designation: "District Magistrate", tenure: "10 mo", kpi: 90, sentiment: 0.5, citizenExp: 75, divergence: 0.3, trend: "stable", feedback: 964, status: "aligned", action: "Review", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 90% with citizen sentiment at 0.5. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Deoria", official: "T. Dubey", designation: "Chief Development Officer", tenure: "17 mo", kpi: 79, sentiment: -0.66, citizenExp: 17, divergence: 1.24, trend: "up", feedback: 345, status: "critical", action: "Monitor", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 79% with citizen sentiment at -0.66. Requires immediate attention.", recommended: "Immediate review recommended." },
  { name: "Etah", official: "M. Srivastava", designation: "District Health Officer", tenure: "33 mo", kpi: 80, sentiment: -0.79, citizenExp: 10, divergence: 1.39, trend: "down", feedback: 638, status: "critical", action: "Review", gamingFlag: false, missedCommitments: 1, diagnosis: "KPI at 80% with citizen sentiment at -0.79. Requires immediate attention.", recommended: "Immediate review recommended." },
  { name: "Etawah", official: "D. Tiwari", designation: "District Magistrate", tenure: "6 mo", kpi: 71, sentiment: -0.24, citizenExp: 38, divergence: 0.66, trend: "down", feedback: 1067, status: "attention", action: "Monitor", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 71% with citizen sentiment at -0.24. Requires immediate attention.", recommended: "Schedule review meeting." },
  { name: "Faizabad", official: "K. Pandey", designation: "CMHO", tenure: "30 mo", kpi: 71, sentiment: 0.12, citizenExp: 56, divergence: 0.3, trend: "up", feedback: 1298, status: "aligned", action: "Review", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 71% with citizen sentiment at 0.12. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Farrukhabad", official: "A. Kumar", designation: "District Magistrate", tenure: "8 mo", kpi: 69, sentiment: 0.22, citizenExp: 61, divergence: 0.16, trend: "stable", feedback: 400, status: "aligned", action: "Review", gamingFlag: false, missedCommitments: 1, diagnosis: "KPI at 69% with citizen sentiment at 0.22. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Fatehpur", official: "A. Kumar", designation: "District Magistrate", tenure: "19 mo", kpi: 90, sentiment: 0.15, citizenExp: 57, divergence: 0.65, trend: "up", feedback: 976, status: "improving", action: "Replicate", gamingFlag: false, missedCommitments: 2, diagnosis: "KPI at 90% with citizen sentiment at 0.15. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Firozabad", official: "A. Kumar", designation: "District Collector", tenure: "23 mo", kpi: 96, sentiment: -0.22, citizenExp: 39, divergence: 1.14, trend: "down", feedback: 645, status: "improving", action: "Monitor", gamingFlag: false, missedCommitments: 1, diagnosis: "KPI at 96% with citizen sentiment at -0.22. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Gautam Buddha Nagar", official: "L. Agarwal", designation: "CMHO", tenure: "7 mo", kpi: 75, sentiment: -0.27, citizenExp: 36, divergence: 0.77, trend: "stable", feedback: 364, status: "improving", action: "Escalate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 75% with citizen sentiment at -0.27. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Ghaziabad", official: "S. Singh", designation: "District Magistrate", tenure: "36 mo", kpi: 80, sentiment: -0.01, citizenExp: 49, divergence: 0.61, trend: "up", feedback: 1468, status: "improving", action: "Investigate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 80% with citizen sentiment at -0.01. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Ghazipur", official: "H. Verma", designation: "CDO", tenure: "32 mo", kpi: 85, sentiment: -0.18, citizenExp: 41, divergence: 0.88, trend: "down", feedback: 468, status: "improving", action: "Investigate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 85% with citizen sentiment at -0.18. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Gonda", official: "V. Mishra", designation: "CMHO", tenure: "25 mo", kpi: 71, sentiment: -0.87, citizenExp: 6, divergence: 1.29, trend: "up", feedback: 1236, status: "critical", action: "Monitor", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 71% with citizen sentiment at -0.87. Requires immediate attention.", recommended: "Immediate review recommended." },
  { name: "Gorakhpur", official: "B. Chauhan", designation: "District Magistrate", tenure: "22 mo", kpi: 93, sentiment: -0.17, citizenExp: 41, divergence: 1.03, trend: "stable", feedback: 819, status: "attention", action: "Monitor", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 93% with citizen sentiment at -0.17. Requires immediate attention.", recommended: "Schedule review meeting." },
  { name: "Hamirpur", official: "V. Mishra", designation: "Chief Development Officer", tenure: "24 mo", kpi: 71, sentiment: -0.2, citizenExp: 40, divergence: 0.62, trend: "up", feedback: 757, status: "attention", action: "Review", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 71% with citizen sentiment at -0.2. Requires immediate attention.", recommended: "Schedule review meeting." },
  { name: "Hardoi", official: "H. Verma", designation: "District Magistrate", tenure: "20 mo", kpi: 81, sentiment: 0.15, citizenExp: 57, divergence: 0.47, trend: "up", feedback: 389, status: "improving", action: "Monitor", gamingFlag: true, missedCommitments: 0, diagnosis: "KPI at 81% with citizen sentiment at 0.15. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Mahamaya Nagar", official: "T. Dubey", designation: "District Magistrate", tenure: "3 mo", kpi: 81, sentiment: -0.22, citizenExp: 39, divergence: 0.84, trend: "down", feedback: 1329, status: "improving", action: "Monitor", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 81% with citizen sentiment at -0.22. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Jalaun", official: "R. Gupta", designation: "District Magistrate", tenure: "22 mo", kpi: 88, sentiment: -0.01, citizenExp: 49, divergence: 0.77, trend: "up", feedback: 1080, status: "improving", action: "Investigate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 88% with citizen sentiment at -0.01. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Jaunpur", official: "N. Yadav", designation: "District Magistrate", tenure: "12 mo", kpi: 78, sentiment: 0.34, citizenExp: 67, divergence: 0.22, trend: "stable", feedback: 410, status: "aligned", action: "Review", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 78% with citizen sentiment at 0.34. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Lalitpur", official: "J. Rawat", designation: "CMHO", tenure: "20 mo", kpi: 66, sentiment: 0.09, citizenExp: 54, divergence: 0.23, trend: "down", feedback: 1043, status: "aligned", action: "Review", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 66% with citizen sentiment at 0.09. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Jyotiba Phule Nagar", official: "L. Agarwal", designation: "District Magistrate", tenure: "25 mo", kpi: 67, sentiment: 0.13, citizenExp: 56, divergence: 0.21, trend: "up", feedback: 608, status: "improving", action: "Investigate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 67% with citizen sentiment at 0.13. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Kannauj", official: "J. Rawat", designation: "CDO", tenure: "25 mo", kpi: 77, sentiment: -0.34, citizenExp: 32, divergence: 0.88, trend: "down", feedback: 342, status: "attention", action: "Escalate", gamingFlag: false, missedCommitments: 2, diagnosis: "KPI at 77% with citizen sentiment at -0.34. Requires immediate attention.", recommended: "Schedule review meeting." },
  { name: "Kaushambi", official: "B. Chauhan", designation: "CDO", tenure: "5 mo", kpi: 66, sentiment: -0.45, citizenExp: 27, divergence: 0.77, trend: "down", feedback: 565, status: "attention", action: "Monitor", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 66% with citizen sentiment at -0.45. Requires immediate attention.", recommended: "Schedule review meeting." },
  { name: "Kushinagar", official: "D. Tiwari", designation: "CMHO", tenure: "19 mo", kpi: 85, sentiment: 0.22, citizenExp: 61, divergence: 0.48, trend: "stable", feedback: 436, status: "aligned", action: "Monitor", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 85% with citizen sentiment at 0.22. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Kheri", official: "B. Chauhan", designation: "CDO", tenure: "10 mo", kpi: 77, sentiment: -0.12, citizenExp: 44, divergence: 0.66, trend: "up", feedback: 876, status: "improving", action: "Investigate", gamingFlag: false, missedCommitments: 1, diagnosis: "KPI at 77% with citizen sentiment at -0.12. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Jhansi", official: "H. Verma", designation: "District Magistrate", tenure: "14 mo", kpi: 83, sentiment: -0.28, citizenExp: 36, divergence: 0.94, trend: "up", feedback: 1061, status: "attention", action: "Escalate", gamingFlag: false, missedCommitments: 1, diagnosis: "KPI at 83% with citizen sentiment at -0.28. Requires immediate attention.", recommended: "Schedule review meeting." },
  { name: "Mahrajganj", official: "J. Rawat", designation: "CDO", tenure: "32 mo", kpi: 65, sentiment: -0.15, citizenExp: 42, divergence: 0.45, trend: "up", feedback: 1080, status: "improving", action: "Replicate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 65% with citizen sentiment at -0.15. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Mahoba", official: "H. Verma", designation: "CDO", tenure: "8 mo", kpi: 75, sentiment: 0.03, citizenExp: 51, divergence: 0.47, trend: "down", feedback: 1255, status: "improving", action: "Review", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 75% with citizen sentiment at 0.03. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Mainpuri", official: "B. Chauhan", designation: "District Collector", tenure: "32 mo", kpi: 74, sentiment: 0.01, citizenExp: 50, divergence: 0.47, trend: "up", feedback: 1173, status: "aligned", action: "Replicate", gamingFlag: false, missedCommitments: 2, diagnosis: "KPI at 74% with citizen sentiment at 0.01. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Mathura", official: "H. Verma", designation: "District Collector", tenure: "9 mo", kpi: 89, sentiment: -0.3, citizenExp: 35, divergence: 1.08, trend: "up", feedback: 502, status: "attention", action: "Replicate", gamingFlag: false, missedCommitments: 2, diagnosis: "KPI at 89% with citizen sentiment at -0.3. Requires immediate attention.", recommended: "Schedule review meeting." },
  { name: "Mau", official: "R. Gupta", designation: "District Magistrate", tenure: "36 mo", kpi: 80, sentiment: 0.16, citizenExp: 57, divergence: 0.44, trend: "up", feedback: 1134, status: "improving", action: "Escalate", gamingFlag: false, missedCommitments: 1, diagnosis: "KPI at 80% with citizen sentiment at 0.16. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Meerut", official: "G. Saxena", designation: "District Health Officer", tenure: "33 mo", kpi: 97, sentiment: -0.09, citizenExp: 45, divergence: 1.03, trend: "stable", feedback: 1113, status: "improving", action: "Replicate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 97% with citizen sentiment at -0.09. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Mirzapur", official: "H. Verma", designation: "CMHO", tenure: "20 mo", kpi: 82, sentiment: 0.38, citizenExp: 69, divergence: 0.26, trend: "stable", feedback: 1192, status: "aligned", action: "Replicate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 82% with citizen sentiment at 0.38. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Muradabad", official: "R. Gupta", designation: "CMHO", tenure: "17 mo", kpi: 86, sentiment: -0.37, citizenExp: 31, divergence: 1.09, trend: "stable", feedback: 365, status: "attention", action: "Replicate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 86% with citizen sentiment at -0.37. Requires immediate attention.", recommended: "Schedule review meeting." },
  { name: "Muzaffarnagar", official: "A. Kumar", designation: "CMHO", tenure: "29 mo", kpi: 91, sentiment: -0.77, citizenExp: 11, divergence: 1.59, trend: "down", feedback: 1051, status: "critical", action: "Replicate", gamingFlag: false, missedCommitments: 2, diagnosis: "KPI at 91% with citizen sentiment at -0.77. Requires immediate attention.", recommended: "Immediate review recommended." },
  { name: "Pilibhit", official: "K. Pandey", designation: "District Collector", tenure: "25 mo", kpi: 66, sentiment: 0.43, citizenExp: 71, divergence: -0.11, trend: "stable", feedback: 979, status: "aligned", action: "Investigate", gamingFlag: false, missedCommitments: 1, diagnosis: "KPI at 66% with citizen sentiment at 0.43. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Pratapgarh", official: "K. Pandey", designation: "District Collector", tenure: "27 mo", kpi: 79, sentiment: -0.06, citizenExp: 47, divergence: 0.64, trend: "down", feedback: 1092, status: "improving", action: "Investigate", gamingFlag: false, missedCommitments: 1, diagnosis: "KPI at 79% with citizen sentiment at -0.06. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Raebareli", official: "A. Kumar", designation: "District Magistrate", tenure: "4 mo", kpi: 94, sentiment: 0.46, citizenExp: 73, divergence: 0.42, trend: "stable", feedback: 1293, status: "aligned", action: "Monitor", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 94% with citizen sentiment at 0.46. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Rampur", official: "P. Sharma", designation: "District Magistrate", tenure: "23 mo", kpi: 76, sentiment: 0.03, citizenExp: 51, divergence: 0.49, trend: "down", feedback: 870, status: "aligned", action: "Investigate", gamingFlag: false, missedCommitments: 1, diagnosis: "KPI at 76% with citizen sentiment at 0.03. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Saharanpur", official: "A. Kumar", designation: "District Collector", tenure: "25 mo", kpi: 91, sentiment: -0.4, citizenExp: 30, divergence: 1.22, trend: "up", feedback: 1163, status: "attention", action: "Review", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 91% with citizen sentiment at -0.4. Requires immediate attention.", recommended: "Schedule review meeting." },
  { name: "Sant Kabir Nagar", official: "R. Gupta", designation: "CMHO", tenure: "11 mo", kpi: 80, sentiment: 0.1, citizenExp: 55, divergence: 0.5, trend: "up", feedback: 1472, status: "aligned", action: "Replicate", gamingFlag: false, missedCommitments: 2, diagnosis: "KPI at 80% with citizen sentiment at 0.1. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Sant Ravidas Nagar", official: "B. Chauhan", designation: "District Collector", tenure: "13 mo", kpi: 94, sentiment: 0.35, citizenExp: 67, divergence: 0.53, trend: "down", feedback: 543, status: "aligned", action: "Investigate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 94% with citizen sentiment at 0.35. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Shahjahanpur", official: "S. Singh", designation: "CMHO", tenure: "9 mo", kpi: 89, sentiment: 0.2, citizenExp: 60, divergence: 0.58, trend: "stable", feedback: 606, status: "aligned", action: "Investigate", gamingFlag: false, missedCommitments: 2, diagnosis: "KPI at 89% with citizen sentiment at 0.2. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Shrawasti", official: "S. Singh", designation: "CDO", tenure: "3 mo", kpi: 67, sentiment: 0.17, citizenExp: 58, divergence: 0.17, trend: "down", feedback: 958, status: "aligned", action: "Replicate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 67% with citizen sentiment at 0.17. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Siddharth Nagar", official: "D. Tiwari", designation: "CMHO", tenure: "36 mo", kpi: 88, sentiment: 0.02, citizenExp: 51, divergence: 0.74, trend: "down", feedback: 513, status: "improving", action: "Investigate", gamingFlag: false, missedCommitments: 2, diagnosis: "KPI at 88% with citizen sentiment at 0.02. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Sitapur", official: "V. Mishra", designation: "CDO", tenure: "18 mo", kpi: 94, sentiment: 0.22, citizenExp: 61, divergence: 0.66, trend: "stable", feedback: 1413, status: "aligned", action: "Monitor", gamingFlag: false, missedCommitments: 1, diagnosis: "KPI at 94% with citizen sentiment at 0.22. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Sonbhadra", official: "N. Yadav", designation: "District Collector", tenure: "34 mo", kpi: 94, sentiment: -0.27, citizenExp: 36, divergence: 1.15, trend: "stable", feedback: 976, status: "attention", action: "Investigate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 94% with citizen sentiment at -0.27. Requires immediate attention.", recommended: "Schedule review meeting." },
  { name: "Sultanpur", official: "M. Srivastava", designation: "District Collector", tenure: "36 mo", kpi: 81, sentiment: -0.13, citizenExp: 43, divergence: 0.75, trend: "stable", feedback: 765, status: "improving", action: "Review", gamingFlag: false, missedCommitments: 1, diagnosis: "KPI at 81% with citizen sentiment at -0.13. Tracking within parameters.", recommended: "Continue monitoring." },
  { name: "Unnao", official: "K. Pandey", designation: "District Magistrate", tenure: "8 mo", kpi: 80, sentiment: 0.05, citizenExp: 52, divergence: 0.55, trend: "stable", feedback: 1205, status: "improving", action: "Investigate", gamingFlag: false, missedCommitments: 0, diagnosis: "KPI at 80% with citizen sentiment at 0.05. Tracking within parameters.", recommended: "Continue monitoring." },
];

const CARRY_FORWARD = [
  { item: "Agra CMHO — Independent claims audit report", status: "NO RESPONSE", color: C.red, committedDate: "2026-03-31", daysOverdue: 28 },
  { item: "Varanasi — Hospital-beneficiary GIS analysis presented to SHA", status: "PARTIAL", color: C.orange, committedDate: "2026-04-07", daysOverdue: 21 },
  { item: "State-level — Vendor meeting on e-claims software upgrade (SHA procurement)", status: "SCHEDULED", color: C.blue, committedDate: "2026-04-14", daysOverdue: null },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const sentimentLabel = (s) => {
  if (s > 0.2) return { label: "Positive", color: C.green };
  if (s > 0) return { label: "Slightly Positive", color: C.green };
  if (s > -0.2) return { label: "Mixed", color: C.orange };
  if (s > -0.5) return { label: "Negative", color: C.orange };
  return { label: "Highly Negative", color: C.red };
};

const divergenceLabel = (d) => {
  if (d > 1.5) return "Highly Divergent";
  if (d > 1.0) return "Significantly Divergent";
  if (d > 0.5) return "Moderately Divergent";
  if (d > 0) return "Slight Gap";
  return "Aligned";
};

// ── Fonts ─────────────────────────────────────────────────────────────────────
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:6px;}
::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.15);border-radius:4px;}
::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,0.25);}
::-webkit-scrollbar-track{background:transparent;}
button{cursor:pointer;transition:opacity 0.15s;}
button:hover{opacity:0.82;}
input:focus{outline:none;}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:0.3;}}
@keyframes slideIn{from{transform:translateX(100%);opacity:0;}to{transform:translateX(0);opacity:1;}}
.fade{animation:fadeUp 0.3s ease both;}
.slide-in{animation:slideIn 0.3s ease both;}
`;

// ── Shared components ─────────────────────────────────────────────────────────
const Btn = ({ onClick, children, variant = "primary", style: sx = {} }) => (
  <button onClick={onClick} style={{
    padding: "8px 16px", borderRadius: 8, border: "none",
    background: variant === "ghost" ? "transparent" : C.accent,
    color: variant === "ghost" ? C.text : "#fff",
    fontSize: 12, fontWeight: 600, fontFamily: "'Lato', sans-serif",
    ...(variant === "ghost" ? { border: `1.5px solid ${C.border}` } : {}),
    ...sx,
  }}>
    {children}
  </button>
);

const Chip = ({ label, color, bg }) => (
  <span style={{
    fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
    background: bg || `${color}15`, color, letterSpacing: 0.3, whiteSpace: "nowrap",
  }}>
    {label}
  </span>
);

// ── UP District Map ──────────────────────────────────────────────────────────
const UP_DISTRICTS=[ {n:"Agra",p:"M98.2,265.5L101.3,267.0L103.6,262.4L103.8,266.7L106.9,266.5L106.2,264.7L110.4,266.0L110.7,271.7L116.4,269.8L128.5,271.4L127.9,276.3L130.9,280.0L134.0,279.4L132.5,277.2L136.5,279.5L138.0,276.3L145.2,276.1L139.7,278.3L139.4,281.7L144.6,279.5L151.2,282.1L153.6,287.1L156.7,286.3L161.0,292.1L163.1,291.5L160.5,287.7L166.0,288.8L168.8,292.2L168.9,289.9L171.1,290.4L173.3,295.4L176.2,295.5L176.5,292.4L180.9,293.9L183.2,292.3L183.3,294.6L185.8,293.4L194.4,301.2L188.5,301.9L187.0,305.0L181.4,302.2L167.1,305.7L154.4,302.4L151.8,299.6L148.2,300.2L144.2,296.3L137.2,297.1L134.5,300.6L129.8,299.3L127.8,295.6L131.5,295.6L135.0,291.7L122.1,289.7L119.4,290.3L118.7,293.8L112.7,293.0L113.3,296.2L110.6,297.4L109.1,293.4L102.5,294.3L98.2,292.3L97.2,295.1L83.2,291.2L79.4,295.7L68.0,299.6L59.5,300.4L57.2,298.4L56.7,304.8L52.1,306.4L53.7,304.6L50.1,304.6L49.4,296.9L72.6,288.4L81.5,287.2L83.4,284.5L80.5,283.8L78.1,286.3L75.0,282.2L70.4,285.1L63.2,283.4L64.1,280.1L59.5,280.9L57.2,278.7L66.6,276.5L68.1,272.9L74.2,271.5L71.6,266.6L85.4,267.2L92.0,262.7L94.5,266.1L95.5,262.3L98.4,263.0L98.2,265.5Z",x:118.2,y:286.3}, {n:"Aligarh",p:"M91.9,195.1L101.2,200.2L107.4,200.5L112.5,196.0L117.9,196.5L122.8,200.8L145.0,194.2L147.1,198.1L154.5,198.5L156.9,196.4L163.5,201.3L167.9,199.9L170.7,203.2L165.4,212.1L157.9,217.6L160.2,221.3L153.4,220.1L145.3,231.4L135.5,233.3L125.2,228.9L124.8,225.1L113.2,223.0L108.0,227.9L109.8,234.5L106.3,235.6L107.4,238.0L103.3,237.1L94.4,240.1L92.2,233.9L86.3,231.1L87.2,226.7L90.6,225.8L85.4,219.0L87.9,217.4L72.3,209.2L68.9,211.6L59.8,212.6L61.0,209.5L58.3,208.9L61.0,207.3L54.3,200.1L72.5,197.4L78.6,200.0L83.0,194.2L84.6,196.2L91.6,192.6L91.9,195.1Z",x:109.4,y:212.9}, {n:"Allahabad",p:"M510.1,386.2L518.0,386.1L519.7,387.5L516.8,389.6L522.5,391.1L521.9,392.7L531.6,390.8L528.0,393.9L531.4,397.3L541.4,399.0L550.3,404.4L546.6,403.6L548.0,405.3L544.7,406.0L551.7,411.8L547.7,414.2L548.0,418.6L538.4,423.2L535.6,427.9L537.2,430.3L546.5,432.7L549.2,439.0L543.1,447.6L527.1,455.0L528.0,457.3L524.3,458.5L526.8,460.5L509.9,457.2L506.0,453.9L505.5,444.3L504.9,445.9L495.1,444.6L489.3,441.5L484.1,441.9L481.7,439.0L476.2,440.5L475.1,439.0L479.0,437.1L474.8,435.6L477.1,431.8L466.8,429.7L467.3,426.4L471.2,426.1L469.8,422.0L477.3,417.6L486.9,417.0L494.8,419.7L497.0,417.9L495.3,414.4L506.8,408.1L502.4,404.3L495.1,407.7L481.7,404.2L479.8,399.0L476.3,397.9L475.8,392.0L479.2,392.4L480.9,396.4L487.8,395.4L484.8,392.0L490.2,391.9L491.0,386.5L495.9,385.5L504.4,388.5L510.1,386.2Z",x:507.1,y:416.6}, {n:"Ambedkar Nagar",p:"M575.4,317.5L583.4,317.4L588.4,321.4L598.7,319.9L619.6,327.5L626.2,334.3L631.4,335.0L629.0,343.0L624.8,343.2L620.3,338.8L615.4,338.5L615.1,335.4L610.8,334.7L614.3,330.4L608.5,330.4L609.5,334.2L605.9,335.1L604.7,337.0L607.2,338.0L603.8,339.7L606.1,345.5L603.3,349.2L606.5,350.9L604.0,352.8L595.3,350.1L592.5,344.5L580.7,346.0L572.0,343.0L564.3,343.4L556.7,339.5L554.6,335.4L538.1,333.1L547.9,325.2L550.2,319.6L556.1,322.3L562.5,320.2L564.4,313.6L575.4,317.5Z",x:592.7,y:334.3}, {n:"Auraiya",p:"M249.5,291.4L254.2,290.5L256.4,293.5L266.7,296.9L276.1,294.3L282.6,301.2L286.8,302.2L278.5,306.3L283.3,312.4L274.6,317.6L274.8,325.0L260.9,336.5L257.9,331.1L244.4,333.5L239.4,330.2L229.2,331.6L215.4,329.6L218.4,325.7L226.8,325.7L236.0,316.2L241.7,314.1L240.7,310.6L244.6,307.1L244.2,293.6L246.2,290.1L249.5,291.4Z",x:254.2,y:311.2}, {n:"Azamgarh",p:"M613.5,331.4L611.1,335.1L615.1,335.4L615.0,338.1L620.3,338.8L624.8,343.2L629.0,343.0L629.4,337.3L636.5,333.9L652.1,337.7L660.4,343.8L669.5,343.6L659.5,352.3L659.2,358.1L654.9,359.5L644.6,355.6L638.8,361.3L639.6,369.7L636.0,373.9L654.0,379.9L650.9,380.5L648.9,385.1L637.7,383.3L642.4,389.0L637.6,389.5L632.9,394.5L624.6,393.3L625.7,390.9L618.6,388.5L616.3,391.1L610.1,387.1L610.6,385.0L600.9,384.2L593.4,378.9L594.6,374.0L590.4,363.6L587.2,362.4L587.8,358.1L584.3,355.7L586.3,344.1L592.8,344.6L595.3,350.1L605.8,352.1L603.3,349.2L606.1,345.5L603.8,339.7L607.2,338.0L604.7,337.0L609.5,334.2L608.5,330.4L613.5,331.4Z",x:622.3,y:357.6}, {n:"Badaun",p:"M198.7,168.1L201.8,168.3L209.3,175.7L217.1,178.1L222.5,191.2L237.0,193.4L241.4,192.2L243.5,194.1L252.6,192.7L260.2,197.7L258.4,202.7L260.5,204.9L257.3,208.9L259.4,210.8L256.4,214.5L259.0,218.8L247.6,220.8L246.0,227.2L243.2,227.9L245.4,234.0L230.8,229.6L231.0,227.0L222.4,218.6L209.7,219.0L211.1,217.6L208.1,216.4L201.3,218.1L198.1,212.9L181.6,209.4L167.9,199.9L163.5,201.3L159.4,199.3L145.6,185.4L140.2,183.3L136.3,176.7L139.0,171.7L152.6,169.2L160.9,177.8L172.5,179.8L184.3,176.3L189.5,170.5L198.7,168.1Z",x:208.4,y:199.0}, {n:"Baghpat",p:"M55.1,111.1L51.2,117.7L54.4,129.4L47.0,136.7L47.4,144.1L36.7,143.4L34.6,140.0L28.5,140.3L24.5,136.3L28.9,134.8L25.7,130.7L28.2,126.7L18.8,118.8L20.9,103.2L47.1,107.3L55.1,111.1Z",x:37.8,y:127.0}, {n:"Bahraich",p:"M447.5,193.3L445.5,193.5L447.1,196.1L452.6,195.4L453.0,192.7L460.0,193.9L464.1,197.4L463.5,200.2L480.8,207.3L477.2,211.2L463.9,211.4L468.5,222.2L474.7,225.6L470.9,227.5L474.6,231.7L471.4,234.0L469.9,228.9L467.3,228.3L459.1,232.7L470.6,236.1L470.4,240.0L484.3,246.7L484.0,255.1L492.5,256.9L485.0,257.8L487.3,259.9L482.9,260.9L485.7,263.6L479.3,273.7L465.3,281.2L459.2,275.3L458.8,261.3L444.4,243.1L446.6,242.0L444.5,237.7L446.1,234.2L441.9,215.5L444.7,213.7L430.4,202.8L432.4,197.1L417.0,183.3L419.3,174.2L436.5,178.3L447.5,193.3Z",x:459.9,y:225.0}, {n:"Ballia",p:"M704.6,350.5L710.4,355.9L729.9,358.1L737.7,363.8L737.6,366.5L741.2,365.8L750.9,370.0L756.5,369.1L762.3,371.3L763.8,374.4L774.6,375.5L774.4,379.0L783.9,382.2L781.9,384.9L785.0,387.4L777.3,386.8L777.0,391.0L775.3,387.6L774.2,390.9L770.5,391.4L766.4,388.5L761.7,389.7L759.4,385.8L754.5,386.1L753.2,391.9L749.8,392.7L741.4,392.1L740.5,389.4L734.4,387.2L727.8,390.0L728.5,394.7L712.6,400.7L714.3,398.3L712.0,394.6L716.1,390.5L713.3,388.8L716.0,387.2L714.7,385.0L710.9,385.6L705.3,381.8L700.7,383.7L699.4,380.6L692.2,377.7L699.2,371.8L699.1,366.7L686.8,363.8L687.4,359.6L698.9,357.1L700.1,354.6L697.4,352.9L704.6,350.5Z",x:734.7,y:378.9}, {n:"Balrampur",p:"M542.6,221.9L562.6,232.3L589.0,228.9L593.9,239.6L593.2,244.7L589.1,248.9L593.1,253.4L574.5,252.0L570.9,256.3L565.9,257.3L563.6,259.9L567.7,260.3L565.1,262.0L568.2,261.5L565.7,263.6L569.3,265.7L566.4,266.8L573.7,271.1L568.6,271.9L564.9,269.7L561.4,271.2L561.9,273.8L566.2,273.5L556.3,282.3L539.9,274.0L540.7,268.1L546.9,267.4L531.3,260.1L526.9,256.0L527.6,253.7L523.5,254.2L521.2,241.9L518.0,239.5L524.4,235.1L529.2,229.3L528.2,227.3L536.8,218.9L542.6,221.9Z",x:556.1,y:253.6}, {n:"Banda",p:"M367.6,377.9L359.1,379.9L365.0,383.2L370.8,382.9L368.3,386.6L371.9,388.5L387.4,390.9L396.9,387.2L399.6,391.3L407.8,390.5L409.4,396.7L416.7,394.7L417.1,397.9L413.6,399.6L416.4,405.0L404.2,409.9L396.7,417.3L389.1,419.2L394.5,424.1L388.3,425.0L393.0,427.8L382.4,432.8L385.4,440.0L381.2,441.1L381.8,438.9L373.9,437.1L374.4,439.6L369.9,438.1L367.9,440.0L361.1,437.2L363.5,438.2L362.9,441.8L354.3,439.3L349.8,440.8L352.0,444.4L344.5,445.1L339.7,442.8L348.3,433.8L355.6,431.7L353.2,426.0L343.5,422.4L344.2,414.6L340.4,411.6L332.3,412.3L325.1,418.4L322.3,417.4L327.0,413.4L324.1,412.0L325.9,408.7L331.1,409.8L332.6,406.5L334.5,407.6L333.5,400.9L339.9,398.8L339.8,395.7L344.0,393.7L342.6,389.9L347.4,388.9L335.5,381.3L341.7,380.0L347.3,376.1L347.3,373.5L351.3,372.6L368.0,375.9L367.6,377.9Z",x:364.0,y:410.9}, {n:"Barabanki",p:"M444.3,259.4L448.5,265.6L452.7,263.9L453.7,258.6L458.4,260.7L460.6,270.8L458.9,273.7L462.5,280.3L472.0,282.2L472.5,284.9L478.8,284.8L480.7,288.9L487.9,289.4L486.7,292.3L490.2,294.8L501.0,299.1L501.4,301.4L495.8,303.1L499.5,305.1L499.4,310.4L495.5,312.0L495.9,310.3L491.2,309.3L490.4,316.2L487.0,318.6L480.0,319.2L479.9,317.2L482.8,317.7L481.5,316.1L471.7,312.6L468.9,324.0L452.7,318.8L450.0,322.0L445.8,322.6L436.0,317.9L430.5,318.3L430.6,314.3L435.9,309.3L432.8,304.9L435.6,303.2L430.3,303.9L431.0,301.2L423.1,298.8L423.3,292.7L417.9,290.8L420.2,288.5L416.1,288.1L410.7,281.5L419.2,279.1L414.7,274.7L408.3,274.5L406.1,270.8L410.5,266.8L422.3,267.7L425.5,264.0L435.0,266.9L438.2,264.5L436.6,260.3L443.4,257.5L444.3,259.4Z",x:454.3,y:292.1}, {n:"Bareilly",p:"M266.7,138.1L275.7,139.1L277.9,147.1L273.5,149.9L270.5,157.3L278.2,159.9L276.9,162.2L279.9,162.1L279.7,164.7L285.5,165.9L286.6,170.5L283.5,169.7L283.1,173.4L277.8,175.1L281.0,176.6L278.0,181.1L282.1,185.0L278.6,185.3L274.7,189.8L273.8,199.4L269.1,199.1L260.1,204.6L260.2,197.7L252.6,192.7L243.5,194.1L241.4,192.2L237.0,193.4L222.5,191.2L217.1,178.1L209.3,175.7L209.3,171.9L223.6,167.3L231.9,160.7L240.0,149.3L246.5,147.4L246.1,145.3L249.2,145.8L247.3,141.3L250.5,141.1L248.7,139.3L251.0,138.7L248.4,136.7L253.7,138.7L262.2,138.1L265.4,135.8L266.7,138.1Z",x:259.4,y:164.6}, {n:"Basti",p:"M588.2,284.6L591.4,287.6L598.7,287.9L597.3,290.5L599.3,291.3L607.6,286.6L610.6,291.8L604.3,290.7L602.5,292.3L604.6,295.6L600.1,297.4L605.6,299.4L605.7,303.1L610.9,302.3L609.7,304.9L615.4,309.0L614.7,312.0L609.3,313.4L610.9,316.1L608.4,315.0L606.3,317.0L608.1,322.8L598.7,319.9L588.4,321.4L583.4,317.4L574.7,317.5L563.7,313.2L556.8,314.0L547.7,307.8L539.7,305.7L538.5,301.3L541.7,300.7L540.0,291.7L547.9,287.8L552.3,291.4L556.2,290.2L564.6,293.6L575.4,285.9L588.2,284.6Z",x:586.9,y:301.2}, {n:"Bijnor",p:"M147.8,65.7L158.1,68.2L162.2,77.6L178.3,86.4L202.6,90.9L197.2,96.0L190.9,96.8L188.9,101.0L185.7,99.4L181.3,101.8L186.6,104.5L178.3,106.3L176.5,110.1L178.9,110.3L172.3,113.9L175.0,115.3L170.1,119.4L148.4,124.3L123.6,122.5L118.0,120.1L121.8,112.4L121.2,106.0L106.8,88.4L106.7,84.0L112.1,83.3L112.9,80.0L116.8,79.4L122.6,73.4L132.0,71.2L142.2,63.9L147.8,65.7Z",x:151.5,y:95.5}, {n:"Bulandshahr",p:"M105.1,150.0L116.7,155.9L128.7,157.3L129.7,166.5L138.4,169.8L136.0,172.8L139.1,181.8L156.9,196.4L154.5,198.5L147.1,198.1L145.0,194.2L123.7,200.8L120.0,197.2L112.5,196.0L107.4,200.5L101.2,200.2L91.5,195.7L91.6,192.6L84.3,196.1L74.2,185.6L73.2,177.6L66.1,172.1L75.7,165.9L75.5,162.4L82.1,161.8L92.8,154.5L97.4,156.1L100.9,150.5L105.1,150.0Z",x:109.4,y:177.8}, {n:"Chandauli",p:"M640.3,403.3L651.4,408.4L659.9,406.5L672.5,414.1L672.1,419.8L674.4,420.6L665.3,425.4L660.4,425.5L652.9,430.8L655.1,435.5L650.9,443.2L653.7,444.5L658.1,462.5L650.6,462.3L649.3,467.6L647.1,466.1L636.9,467.9L627.0,462.8L631.0,459.1L626.5,456.3L623.8,440.6L631.0,440.6L631.0,435.3L634.9,434.4L636.5,431.2L625.6,428.4L621.2,426.0L625.0,425.7L622.7,422.7L619.0,421.6L634.3,418.8L637.6,412.9L631.1,409.4L637.2,403.3L640.3,403.3Z",x:642.5,y:432.5}, {n:"Chitrakoot",p:"M420.6,403.6L433.2,406.3L429.1,413.5L440.7,419.2L453.1,418.4L453.4,423.4L460.6,424.5L469.8,422.0L471.2,426.1L466.8,427.0L466.8,429.7L469.4,430.0L466.3,430.6L468.1,433.9L462.7,434.6L466.3,436.9L463.9,439.4L455.4,436.8L459.2,436.6L458.4,434.7L454.4,435.6L448.2,431.6L446.6,436.1L445.8,432.2L442.0,432.0L439.6,437.0L441.2,439.9L435.1,445.7L436.2,450.6L431.0,448.7L428.0,453.9L422.3,449.2L409.9,451.3L408.1,447.5L404.3,450.2L394.3,449.8L393.1,447.6L399.0,445.5L396.8,442.2L401.3,439.7L400.7,435.5L404.8,432.6L402.1,429.8L397.8,430.0L396.9,436.6L394.1,433.7L383.9,434.5L391.7,440.5L385.4,440.0L381.9,434.7L384.5,430.3L393.0,427.8L387.9,426.5L394.5,424.1L389.1,419.2L396.7,417.3L407.9,407.7L413.5,407.2L415.9,401.8L420.6,403.6Z",x:425.9,y:431.8}, {n:"Deoria",p:"M704.9,306.2L715.7,312.2L716.3,315.7L725.6,322.1L716.8,325.4L710.7,324.6L710.7,330.0L721.8,330.2L728.0,335.2L738.1,336.1L736.7,346.4L732.2,345.0L728.7,348.2L721.2,347.2L723.1,349.8L721.0,351.6L725.5,358.4L716.1,355.2L709.4,355.5L705.8,350.9L699.4,350.0L693.9,344.8L682.5,347.9L685.8,340.6L681.1,341.8L683.0,339.6L679.1,338.0L680.1,336.3L677.0,336.6L677.3,334.0L673.7,334.7L676.0,335.8L673.1,337.5L670.1,335.1L671.5,333.9L667.5,334.1L669.8,332.5L666.6,328.9L668.2,326.6L679.1,324.7L682.1,313.3L687.4,309.9L694.1,310.6L700.5,306.2L704.9,306.2Z",x:698.5,y:333.9}, {n:"Etah",p:"M173.7,203.2L181.6,209.4L198.1,212.9L201.3,218.1L208.1,216.4L211.1,217.6L209.7,219.0L222.0,218.4L225.7,220.4L230.9,229.4L223.2,229.9L222.9,235.4L237.4,244.7L234.7,248.2L236.0,251.6L232.7,252.9L236.7,257.8L235.0,259.6L224.4,255.9L220.6,251.4L205.3,252.5L198.3,248.5L193.1,253.2L192.8,257.1L182.6,259.3L173.2,252.3L174.9,246.8L169.4,245.3L163.1,250.7L159.8,249.0L155.1,252.0L157.6,254.5L156.3,258.6L154.2,256.2L148.3,256.3L146.8,259.0L136.9,261.1L137.7,255.4L127.7,253.8L125.8,251.4L129.3,244.2L133.4,244.6L136.0,241.7L139.5,242.6L141.5,239.5L144.5,241.3L159.0,236.3L161.3,228.3L155.9,225.5L155.9,221.5L159.4,222.2L157.9,217.6L166.1,211.3L169.5,203.9L173.7,203.2Z",x:178.6,y:239.6}, {n:"Etawah",p:"M229.2,285.8L230.6,288.1L240.8,287.3L245.2,291.1L242.8,304.3L244.5,307.4L240.9,310.3L241.3,314.4L236.0,316.2L226.8,325.7L217.0,327.1L208.3,320.2L211.0,317.3L210.2,311.7L204.1,313.1L205.1,310.4L196.6,309.8L191.2,304.9L187.0,305.0L188.5,301.9L194.4,301.0L185.8,293.4L183.3,293.9L186.1,290.4L194.6,287.9L200.9,288.7L202.6,287.1L209.5,291.4L216.1,286.7L229.2,285.8Z",x:213.3,y:301.9}, {n:"Faizabad",p:"M505.9,300.9L513.6,303.6L536.5,299.6L540.2,306.0L548.0,308.0L555.7,313.6L564.4,313.6L563.4,319.2L556.1,322.3L550.2,319.6L547.9,325.2L538.1,333.1L531.0,331.2L529.3,328.5L504.9,325.2L503.4,323.0L500.1,324.8L490.9,322.2L486.1,325.1L482.8,323.7L490.4,316.2L491.2,309.3L495.9,310.3L495.5,312.0L499.4,310.4L499.5,305.1L496.2,302.1L501.4,301.4L501.4,299.0L505.9,300.9Z",x:520.0,y:315.4}, {n:"Farrukhabad",p:"M231.2,229.6L244.8,234.3L256.8,235.4L260.6,239.0L271.9,238.6L270.4,236.9L276.1,234.8L276.5,245.5L285.6,249.9L279.9,256.2L284.2,263.6L280.6,265.2L283.7,268.5L280.6,268.8L278.9,272.2L272.3,270.9L266.8,273.2L262.7,269.2L244.1,268.7L242.2,263.0L239.0,263.4L235.0,259.5L236.7,257.8L232.7,252.9L236.0,251.6L234.7,248.2L237.4,244.7L222.9,235.4L223.2,229.9L231.2,229.6Z",x:255.6,y:253.0}, {n:"Fatehpur",p:"M369.7,347.6L373.6,348.1L374.3,353.4L394.4,362.8L415.6,360.4L425.5,369.1L435.7,371.3L437.4,376.5L448.0,380.6L445.8,383.6L434.2,387.8L434.6,390.6L438.2,391.3L435.7,391.7L435.2,397.6L438.4,398.5L441.3,404.7L436.3,410.0L433.3,409.1L433.2,406.3L416.4,402.1L413.6,399.6L417.4,395.2L409.4,396.7L407.8,390.5L399.6,391.3L396.9,387.2L387.4,390.9L371.9,388.5L368.3,386.6L370.8,382.9L365.0,383.2L359.0,379.6L366.3,378.6L368.4,376.1L351.3,372.6L343.7,374.4L339.3,370.9L335.8,371.6L333.8,367.7L344.7,356.4L369.7,347.6Z",x:398.0,y:381.7}, {n:"Firozabad",p:"M171.3,246.3L175.3,247.5L173.3,252.4L180.6,255.9L181.1,262.6L177.9,264.9L185.0,268.3L181.6,270.2L191.4,274.5L188.3,274.6L188.7,278.1L185.7,277.3L189.9,289.1L181.3,293.9L176.5,292.4L176.2,295.5L172.7,295.2L170.7,290.1L168.8,292.2L166.3,288.9L160.5,287.7L161.5,292.4L156.7,286.3L153.6,287.1L151.2,282.1L144.6,279.5L139.4,281.7L139.7,278.3L145.2,276.1L138.0,276.3L136.5,279.5L132.5,277.2L134.0,279.4L130.9,280.0L127.9,276.3L128.5,271.4L116.4,269.8L111.1,271.8L110.0,265.7L103.5,266.4L105.9,259.9L115.0,259.1L116.2,257.4L112.8,256.5L115.8,254.6L121.4,256.8L125.8,253.3L136.1,254.5L138.1,261.3L140.5,259.0L146.8,259.0L148.3,256.3L154.2,256.2L156.3,258.6L157.6,254.5L155.1,252.0L159.8,249.0L163.1,250.7L168.5,245.5L171.3,246.3Z",x:150.4,y:269.5}, {n:"Gautam Buddha Nagar",p:"M44.0,152.1L47.2,152.7L46.7,156.3L58.9,154.9L69.1,160.5L72.2,159.0L74.3,160.5L75.7,165.9L66.1,172.7L73.2,177.6L74.2,185.6L83.1,193.8L79.5,199.7L72.5,197.4L54.3,200.1L57.0,194.0L61.7,192.3L56.6,192.0L56.2,189.9L59.3,190.7L61.6,187.0L54.0,185.3L56.9,182.3L53.7,179.9L56.8,178.3L54.8,173.9L36.5,162.1L40.6,158.3L38.8,152.7L44.0,152.1Z",x:59.3,y:175.3}, {n:"Ghaziabad",p:"M55.5,134.8L76.0,136.7L78.5,142.0L75.8,146.0L79.6,147.7L86.1,143.8L93.8,143.1L94.3,137.6L100.7,139.8L119.1,138.2L121.7,148.9L128.7,157.3L116.7,155.9L104.0,149.5L97.4,153.6L97.4,156.1L92.8,154.5L82.1,161.8L75.5,162.4L72.4,159.0L69.1,160.5L58.9,154.9L46.7,156.3L46.8,152.3L40.3,152.6L39.3,149.8L35.4,150.1L26.4,143.5L28.5,140.3L34.6,140.0L36.7,143.4L41.4,142.4L46.9,144.6L47.0,136.7L50.9,132.7L55.5,134.8Z",x:70.9,y:147.3}, {n:"Ghazipur",p:"M687.7,375.7L694.1,377.1L700.7,383.7L705.3,381.8L716.0,387.2L711.9,394.8L714.2,399.0L705.5,407.7L701.3,408.3L704.3,410.5L699.7,411.0L698.4,413.6L689.5,413.9L676.2,420.9L672.1,419.8L672.5,414.1L659.9,406.5L651.4,408.4L643.0,403.5L638.2,402.9L633.8,405.2L628.2,403.4L629.5,405.6L626.8,406.1L624.3,403.1L627.0,399.5L624.6,393.3L632.9,394.5L637.6,389.5L642.4,389.0L637.7,383.3L648.9,385.1L650.9,380.5L656.4,381.7L659.3,378.3L666.7,378.6L678.6,375.0L682.4,376.3L683.9,374.0L687.7,375.7Z",x:667.5,y:395.4}, {n:"Gonda",p:"M512.7,250.7L515.9,253.2L527.6,253.7L526.9,256.0L531.3,260.1L545.8,266.1L546.5,268.6L543.3,267.0L539.9,269.1L539.9,274.0L556.3,282.3L566.2,273.5L567.3,276.3L571.6,277.3L573.9,284.3L578.3,285.9L573.1,286.9L564.6,293.6L556.2,290.2L552.3,291.4L547.9,287.8L540.0,291.7L541.4,300.9L530.0,299.3L513.6,303.6L490.6,295.1L486.7,292.3L488.2,289.6L480.7,288.9L478.8,284.8L472.5,284.9L472.0,282.2L465.4,281.5L471.6,276.1L479.3,273.7L485.7,263.6L483.3,260.5L488.7,259.5L497.8,264.3L500.7,259.7L507.3,260.7L506.3,256.5L509.5,255.0L509.8,251.1L512.7,250.7Z",x:521.1,y:275.0}, {n:"Gorakhpur",p:"M642.1,288.0L647.4,289.7L649.6,293.9L654.2,289.1L666.3,290.9L668.1,294.1L673.5,294.8L671.5,297.6L678.1,302.4L677.4,305.0L680.9,305.7L682.1,319.3L679.1,324.7L668.7,326.3L666.6,328.9L669.8,332.5L667.7,334.4L671.5,333.9L670.1,335.1L673.1,337.5L676.0,335.8L673.7,334.7L677.3,334.0L677.0,336.6L680.1,336.3L679.1,338.0L683.0,339.6L681.1,341.8L685.8,340.6L681.9,348.3L672.2,343.6L660.4,343.8L652.3,337.9L641.2,334.3L624.9,333.1L627.5,331.7L627.5,327.1L634.9,325.3L637.0,326.7L638.6,323.9L632.0,320.8L628.8,316.6L631.2,313.5L626.4,309.8L632.5,306.2L627.8,301.3L631.6,295.0L639.8,295.2L640.8,290.7L637.9,290.7L637.6,288.6L640.7,286.0L642.1,288.0Z",x:656.4,y:318.0}, {n:"Hamirpur",p:"M309.3,359.9L321.3,359.2L323.2,361.8L320.2,365.5L333.5,372.0L339.3,370.9L343.0,374.3L347.3,373.5L345.4,377.7L335.2,381.5L347.4,388.9L342.6,389.9L344.0,393.7L339.8,395.7L339.9,398.8L333.5,400.9L334.5,407.6L332.6,406.5L331.1,409.8L325.9,408.7L322.6,413.1L314.8,410.6L315.3,405.9L311.3,405.9L312.4,403.6L309.9,402.4L314.3,398.2L307.0,393.9L306.3,397.6L293.7,401.5L292.6,405.4L287.5,402.3L285.3,403.4L282.5,399.9L277.0,401.2L275.2,406.5L263.8,406.7L249.3,403.5L252.6,399.0L249.3,399.0L246.4,393.8L251.0,393.0L247.7,389.3L250.4,386.1L246.8,383.4L250.3,383.1L251.3,380.5L256.6,382.2L256.5,379.4L260.8,376.7L266.1,379.5L268.4,376.5L263.8,376.2L263.2,374.2L272.2,373.5L273.0,370.8L277.1,373.0L279.9,371.1L285.1,372.4L289.0,376.1L292.4,375.9L293.5,372.4L298.4,374.8L296.4,367.7L298.3,369.4L303.7,368.3L307.2,364.2L302.7,364.4L306.1,363.1L303.6,358.2L305.7,352.7L308.3,353.2L307.2,358.8L309.3,359.9Z",x:297.3,y:384.2}, {n:"Hardoi",p:"M320.8,223.4L325.3,224.0L324.9,226.2L332.0,224.2L340.5,227.3L344.9,244.2L357.6,254.0L358.1,258.7L362.6,260.0L364.3,264.6L362.3,265.5L369.7,262.6L372.9,265.2L378.3,265.4L378.5,267.8L388.0,267.8L393.1,270.6L395.9,277.8L386.8,277.8L383.0,281.1L377.5,279.6L374.3,282.8L357.0,288.5L353.9,294.8L340.6,283.5L337.2,283.7L334.0,288.6L329.3,289.1L330.2,286.1L323.2,286.2L316.8,292.3L301.8,274.2L280.9,267.6L280.6,265.2L284.2,263.6L279.9,256.2L285.6,249.9L282.5,248.2L284.0,243.8L279.6,235.4L284.7,228.6L297.3,234.1L302.6,228.5L318.1,226.7L320.8,223.4Z",x:336.0,y:259.9}, {n:"Mahamaya Nagar",p:"M155.9,221.5L155.9,225.5L161.3,228.3L158.5,236.8L144.5,241.3L141.5,239.5L139.5,242.6L129.3,244.2L125.8,251.4L127.7,253.8L121.4,256.8L113.3,255.6L116.4,257.8L105.9,259.9L105.5,263.7L100.3,260.6L100.0,248.5L95.2,243.4L100.3,237.9L107.4,238.0L106.3,235.6L109.8,234.5L108.0,227.9L111.8,226.3L109.4,225.6L111.8,223.6L124.8,225.1L125.2,228.9L129.8,231.2L141.2,233.1L145.3,231.4L153.4,220.1L155.9,221.5Z",x:126.0,y:239.1}, {n:"Jalaun",p:"M240.4,330.7L244.4,333.5L258.1,331.2L262.0,337.7L268.2,337.2L263.5,340.4L265.6,343.5L276.1,346.1L275.9,348.6L287.7,350.8L285.6,354.7L289.8,356.8L303.6,358.2L306.1,363.1L302.8,364.5L307.2,364.2L303.7,368.3L298.3,369.4L296.4,367.7L298.4,374.8L293.5,372.4L292.4,375.9L289.0,376.1L285.1,372.4L279.9,371.1L277.1,373.0L273.0,370.8L272.2,373.5L263.2,374.2L263.8,376.2L268.4,376.5L266.1,379.5L260.8,376.7L256.5,379.4L256.6,382.2L251.3,380.5L242.3,383.7L239.8,380.1L231.4,382.1L223.3,380.2L222.6,376.1L219.6,376.4L220.6,374.1L217.6,374.1L217.4,376.6L213.8,375.9L212.8,373.1L218.4,372.0L203.0,369.4L204.7,362.9L210.9,358.7L204.6,354.8L210.5,353.5L208.1,350.3L212.0,350.1L212.2,347.4L216.8,346.2L214.2,344.6L223.3,340.7L224.1,338.4L218.3,337.0L219.3,332.6L223.4,330.4L240.4,330.7Z",x:251.0,y:360.4}, {n:"Jaunpur",p:"M579.6,351.1L585.2,353.5L584.3,355.7L587.8,358.1L587.2,362.4L590.4,363.6L594.6,374.0L593.0,378.5L600.9,384.2L610.6,385.0L610.1,387.1L616.3,391.1L618.6,388.5L625.7,390.9L624.7,397.8L627.0,399.5L622.2,402.2L619.9,399.4L613.4,403.4L610.6,399.8L604.1,399.0L595.2,403.1L590.6,401.7L588.2,406.8L590.8,408.4L587.7,408.8L589.2,410.6L585.9,410.9L586.4,413.8L578.8,413.8L580.9,412.8L576.8,412.0L577.6,409.3L575.0,409.2L574.2,412.1L572.1,408.5L571.9,410.3L568.2,410.0L561.0,404.0L557.7,406.1L556.1,403.6L551.9,404.4L541.4,399.0L534.3,398.9L528.0,393.9L535.0,388.5L534.4,379.1L541.8,378.9L545.9,374.2L556.1,372.7L551.1,369.1L553.5,367.0L560.2,367.0L559.8,364.8L565.1,365.5L565.8,367.8L569.1,365.5L567.2,362.4L563.3,362.0L564.5,359.9L560.3,357.7L561.0,355.0L573.8,355.1L575.3,350.6L579.6,351.1Z",x:578.6,y:386.3}, {n:"Lalitpur",p:"M204.5,369.6L218.4,372.0L212.8,373.1L213.8,375.9L217.4,376.6L217.6,374.1L220.6,374.1L219.6,376.4L222.6,376.1L223.6,380.3L231.4,382.1L239.8,380.1L242.3,383.7L250.5,381.9L246.7,383.5L250.4,386.1L247.7,389.3L251.0,393.0L246.4,393.8L249.3,399.0L252.6,399.0L236.6,422.2L237.5,424.2L239.8,422.3L245.6,424.3L244.4,429.4L238.3,425.6L242.5,433.3L238.6,435.8L233.4,432.8L234.9,436.0L231.5,436.3L229.3,433.3L228.7,436.0L223.6,436.6L222.7,432.3L219.0,430.0L213.3,434.2L212.9,430.5L216.2,427.4L209.7,423.3L207.5,425.9L210.0,429.8L205.2,427.8L197.6,432.4L197.8,425.0L207.4,422.7L205.9,417.7L197.8,418.0L194.3,427.1L191.2,421.5L188.3,421.2L194.5,418.9L197.6,414.5L205.3,413.5L199.5,415.5L203.1,417.4L208.2,415.5L206.4,410.5L200.6,409.8L203.9,407.2L201.9,403.9L204.5,401.5L198.7,400.8L197.8,403.7L192.9,404.8L195.9,408.2L193.5,411.0L191.4,409.9L194.7,409.2L193.1,408.3L183.1,405.5L182.3,408.5L185.4,410.9L191.3,411.1L184.2,412.5L186.4,416.9L181.2,417.3L180.7,415.2L175.5,414.5L175.4,411.9L176.7,413.2L180.0,411.3L175.0,410.0L172.5,413.0L165.6,413.9L167.2,417.4L162.0,416.5L162.0,421.0L158.6,419.6L156.0,422.1L152.8,421.3L153.7,423.9L159.1,422.0L166.4,424.8L162.1,430.4L153.6,435.1L151.1,433.2L153.7,431.6L147.7,429.8L149.0,428.0L144.6,425.8L143.6,421.7L139.8,420.6L142.2,418.6L139.0,414.8L143.9,409.2L151.3,407.4L152.2,400.5L154.8,401.5L158.0,399.1L167.7,400.5L170.5,398.5L174.6,400.4L190.5,395.7L191.2,391.7L184.6,385.8L192.1,381.8L191.2,379.3L196.3,381.8L194.8,376.9L198.5,376.1L197.8,372.5L204.5,369.6Z",x:197.4,y:409.6}, {n:"Jyotiba Phule Nagar",p:"M173.8,112.9L174.5,115.1L173.8,112.9Z M174.7,115.5L176.0,119.3L179.8,119.2L172.7,126.7L177.7,131.0L175.1,133.1L177.2,134.6L169.5,142.5L147.8,145.0L150.1,153.4L148.2,155.4L151.9,159.9L151.0,168.2L139.0,171.7L137.0,174.2L138.4,169.8L129.7,166.5L130.7,160.7L127.0,153.0L121.7,148.9L118.4,136.9L113.5,135.0L113.4,131.2L117.1,128.0L115.9,121.3L149.0,124.2L170.1,119.4L174.7,115.5Z",x:173.6,y:113.7}, {n:"Kannauj",p:"M254.5,269.0L262.7,269.2L266.8,273.2L272.3,270.9L278.4,272.4L281.3,268.5L291.6,272.5L297.1,272.1L308.7,280.1L313.6,289.6L311.0,289.1L309.8,291.7L305.9,290.3L306.3,298.1L301.0,297.8L301.1,300.6L297.3,299.6L295.9,303.8L289.0,304.2L276.1,294.3L266.7,296.9L256.4,293.5L254.2,290.5L244.5,291.3L242.2,289.7L245.8,289.1L253.7,280.5L254.4,278.4L249.6,277.6L251.5,274.9L249.5,273.1L251.5,267.9L254.5,269.0Z",x:275.8,y:284.7}, {n:"Kanpur",p:"M312.4,289.6L322.4,296.1L325.9,307.1L340.5,314.9L338.0,315.5L337.0,320.6L334.4,319.9L333.5,323.3L328.5,324.0L326.0,326.3L327.5,328.0L324.4,328.2L328.4,343.2L335.2,345.5L352.1,343.6L354.4,348.8L360.0,351.1L346.5,355.5L342.4,360.6L337.7,361.8L336.9,366.2L333.6,368.0L335.8,371.6L333.5,372.0L320.2,365.5L323.2,361.8L321.3,359.2L307.7,359.5L306.8,352.5L303.9,358.1L290.2,356.9L285.6,354.7L287.7,350.8L275.9,348.6L276.1,346.1L264.9,343.0L263.5,340.4L267.7,336.7L263.2,338.1L260.9,336.5L274.8,325.0L274.6,317.6L283.1,312.8L278.5,306.3L286.9,303.1L295.9,303.8L297.3,299.6L300.8,300.8L301.0,297.8L308.0,297.0L305.9,290.3L310.0,291.6L312.4,289.6Z",x:312.0,y:332.0}, {n:"Kanpur",p:"M340.5,314.9L343.1,323.6L366.0,337.0L369.4,347.4L366.9,349.6L360.6,351.3L354.9,349.2L350.2,343.2L335.2,345.5L328.4,343.2L324.4,328.2L327.5,328.0L326.0,326.3L328.5,324.0L333.5,323.3L334.4,319.9L337.0,320.6L338.0,315.5L340.5,314.9Z",x:341.7,y:331.5}, {n:"Kaushambi",p:"M448.3,381.1L454.9,384.4L451.7,389.6L467.8,395.8L470.6,399.7L477.3,397.9L481.7,404.2L487.5,404.4L493.4,407.7L502.4,404.3L506.8,407.7L505.9,409.8L497.2,412.6L494.8,419.7L489.5,417.4L478.6,417.2L460.6,424.5L453.4,423.4L453.1,418.4L446.8,417.4L441.1,419.3L430.4,414.6L429.1,411.2L436.3,410.0L441.2,405.4L438.4,398.5L435.2,397.6L435.7,391.7L438.2,391.3L434.6,390.6L434.2,387.8L437.1,388.1L439.3,384.5L448.3,381.1Z",x:460.0,y:403.2}, {n:"Kushinagar",p:"M707.6,263.4L718.5,270.3L714.5,278.9L722.8,278.7L719.7,280.8L724.8,282.7L725.4,289.3L723.2,290.8L726.0,294.9L735.0,295.2L734.1,297.8L737.9,299.5L742.0,296.5L745.3,297.2L744.5,307.0L751.1,305.9L753.9,311.4L761.7,312.4L762.9,315.9L748.4,318.2L729.0,314.7L725.6,322.1L716.3,315.7L715.7,312.2L703.7,305.4L698.4,309.3L688.8,311.4L687.4,309.9L682.1,313.3L680.9,305.7L677.4,305.0L678.1,302.4L671.6,297.2L675.9,291.4L679.6,293.1L681.2,289.6L691.5,289.9L696.1,286.0L692.1,281.7L695.7,281.8L693.8,280.1L699.6,277.2L701.9,272.1L697.4,272.9L700.3,271.3L699.2,269.0L702.5,269.3L698.8,266.6L704.0,266.2L703.8,263.2L707.6,263.4Z",x:711.3,y:292.1}, {n:"Kheri",p:"M373.4,154.8L380.8,155.7L383.1,160.1L391.0,161.8L398.8,167.3L404.1,166.5L406.1,170.4L412.6,170.6L412.6,172.2L416.5,170.8L419.6,179.0L417.0,183.3L432.4,197.1L430.4,202.8L444.2,212.8L441.9,215.5L444.9,220.6L442.1,221.8L444.4,231.7L439.2,232.0L441.0,230.0L438.5,227.9L432.3,227.3L436.9,225.4L428.7,223.6L428.2,221.7L424.6,223.1L420.8,220.2L412.2,220.0L414.4,215.8L411.2,213.8L406.5,218.7L402.9,218.1L395.9,222.9L392.1,220.8L387.2,223.2L376.8,219.1L373.2,226.2L369.2,226.3L364.4,221.5L343.3,231.9L335.2,224.6L324.9,226.2L325.3,224.0L317.8,224.6L314.0,212.7L319.8,212.1L324.0,206.6L336.7,201.8L337.0,194.3L342.1,194.2L342.7,185.7L349.2,179.0L342.0,170.2L344.4,168.0L349.7,169.7L355.5,166.3L350.1,159.2L342.3,157.2L342.4,155.3L345.5,151.9L350.6,156.7L358.7,156.7L365.5,162.9L364.3,153.4L368.8,151.8L373.4,154.8Z",x:386.6,y:195.8}, {n:"Jhansi",p:"M169.4,435.3L173.9,440.5L171.9,448.2L176.6,453.1L186.4,456.4L188.0,460.1L184.9,476.8L193.0,476.6L197.5,473.4L207.0,485.4L201.6,485.1L201.1,487.8L209.0,490.4L207.0,496.8L201.0,500.9L198.1,507.2L191.4,508.2L190.2,510.4L186.0,504.3L176.7,505.4L167.4,496.5L160.0,493.6L152.7,501.2L147.1,503.0L141.6,498.7L145.2,494.2L135.6,489.3L130.5,482.6L134.8,480.5L135.8,471.8L125.3,454.8L141.8,445.4L142.3,437.9L154.2,434.9L165.8,427.4L169.4,435.3Z",x:171.1,y:476.4}, {n:"Lucknow",p:"M407.7,273.8L414.7,274.7L419.2,279.1L410.7,281.5L416.1,288.1L420.2,288.5L417.9,290.8L423.3,292.7L423.1,298.8L431.0,301.2L430.3,303.9L435.6,303.2L432.8,304.9L435.9,309.3L430.6,314.3L432.3,316.2L418.8,325.5L402.5,317.9L397.5,312.7L392.6,314.0L388.8,310.8L384.4,312.3L382.2,305.0L388.6,303.9L382.3,297.8L375.6,295.4L376.9,293.6L373.7,290.3L368.7,290.9L372.7,287.1L368.7,285.0L378.5,280.9L377.5,279.6L383.0,281.1L386.4,277.9L396.2,278.0L407.7,273.8Z",x:402.3,y:295.5}, {n:"Mahrajganj",p:"M681.5,249.0L703.6,256.9L706.2,258.4L703.4,260.7L711.3,260.0L713.0,261.7L710.2,264.1L703.8,263.2L704.0,266.2L698.8,266.6L702.5,269.3L699.2,269.0L700.3,271.3L697.4,272.9L701.9,272.1L699.6,277.2L693.8,280.1L695.7,281.8L692.1,281.7L696.1,286.0L692.8,286.8L692.0,289.8L681.2,289.6L679.6,293.1L675.9,291.4L673.5,294.8L668.1,294.1L662.1,289.4L654.2,289.1L649.6,293.9L639.6,284.6L632.3,285.6L630.1,277.3L632.7,276.8L630.2,273.4L634.8,274.5L634.7,268.7L639.9,266.7L645.1,260.1L657.0,257.9L660.6,253.5L658.5,248.2L681.5,249.0Z",x:677.2,y:273.4}, {n:"Mahoba",p:"M312.4,397.7L313.1,400.9L309.9,402.4L312.4,403.6L311.3,405.9L315.3,405.9L314.4,410.3L327.0,413.4L322.3,417.4L314.6,418.1L312.1,424.0L306.6,423.7L303.6,426.8L302.5,424.9L296.9,426.3L299.4,433.4L296.9,434.8L297.8,437.5L286.5,433.9L271.4,434.9L268.1,431.2L260.4,438.8L257.4,437.7L258.2,434.7L255.0,436.8L253.9,434.4L250.3,436.0L252.1,428.9L254.9,429.1L255.2,425.6L260.5,423.9L257.1,422.8L252.8,424.7L247.9,422.0L247.0,424.4L244.2,422.0L245.6,418.8L237.9,418.2L244.4,413.0L243.6,410.7L249.3,403.5L263.8,406.7L275.2,406.5L277.0,401.2L282.5,399.9L285.3,403.4L287.5,402.3L292.2,405.4L293.7,401.5L306.3,397.6L306.8,393.9L312.4,397.7Z",x:280.9,y:417.9}, {n:"Mainpuri",p:"M201.7,250.0L205.3,252.5L220.6,251.4L224.4,255.9L235.5,259.6L239.0,263.4L242.2,263.0L241.8,266.5L249.7,270.2L249.9,278.0L254.4,278.4L245.8,289.1L237.5,286.6L229.9,287.9L228.3,285.3L216.1,286.7L209.5,291.4L202.6,287.1L189.9,289.1L185.7,277.3L189.2,277.8L188.3,274.6L191.0,273.6L183.4,271.4L181.7,269.7L185.0,268.0L177.8,264.5L180.7,263.6L181.0,258.5L191.7,257.7L198.0,248.6L201.7,250.0Z",x:211.2,y:270.2}, {n:"Mathura",p:"M74.6,210.9L80.6,211.9L84.1,216.7L87.9,217.4L85.4,219.0L90.6,225.8L87.2,226.7L86.3,231.1L92.2,233.9L94.2,240.0L98.1,241.0L95.1,243.9L100.0,248.5L100.3,260.6L103.4,262.5L100.8,267.2L95.5,262.3L94.5,266.1L92.0,262.7L85.4,267.2L71.5,266.6L66.7,262.4L69.0,259.0L65.0,260.3L50.4,254.5L50.2,249.5L40.5,244.1L42.1,239.1L38.1,237.6L41.3,234.0L40.4,230.0L36.7,229.1L35.8,220.3L48.4,218.0L48.4,215.0L53.1,215.9L55.8,211.2L62.5,213.3L71.1,209.1L74.6,210.9Z",x:71.5,y:236.9}, {n:"Mau",p:"M676.0,345.6L680.8,346.1L681.9,348.3L693.9,344.8L700.5,350.5L697.4,352.9L700.1,354.6L698.9,357.1L687.4,359.6L688.0,364.9L699.1,366.7L699.2,371.8L693.8,376.2L691.2,377.2L683.9,374.0L682.4,376.3L678.6,375.0L666.7,378.6L659.3,378.3L656.0,381.7L649.1,376.8L638.1,375.7L636.0,371.4L639.6,369.7L638.8,361.3L644.4,358.0L642.4,356.6L647.7,355.5L656.3,359.4L660.8,356.9L659.5,352.3L665.8,345.1L672.2,343.6L676.0,345.6Z",x:671.8,y:362.0}, {n:"Meerut",p:"M114.6,105.9L121.2,106.6L121.8,112.4L115.9,121.3L117.1,128.0L113.2,131.8L113.8,135.3L119.1,138.2L100.7,139.8L94.3,137.6L93.8,143.1L86.1,143.8L79.6,147.7L75.8,146.0L78.5,142.0L76.0,136.7L52.4,134.3L54.5,127.7L51.6,124.4L51.6,116.8L55.1,111.1L59.5,110.7L65.5,106.0L70.5,109.1L75.1,107.2L85.0,112.4L114.6,105.9Z",x:87.3,y:125.3}, {n:"Mirzapur",p:"M544.9,423.3L550.5,428.5L555.6,424.4L561.7,427.6L564.3,425.5L575.5,425.2L580.6,427.8L581.5,424.6L592.5,426.0L595.1,423.6L595.5,426.9L599.5,424.9L599.0,428.8L595.7,428.9L597.7,431.5L603.1,431.7L607.7,428.0L618.0,429.1L621.0,425.9L635.6,430.5L634.9,434.4L631.0,435.3L631.0,440.6L623.8,440.6L626.5,456.3L631.0,459.1L620.3,460.4L618.9,452.7L613.2,458.1L598.2,457.0L587.5,458.9L583.0,462.3L579.7,462.0L580.5,459.4L575.2,458.7L571.6,460.5L571.9,469.5L569.5,470.9L562.4,471.0L559.4,468.8L558.3,477.3L546.6,476.1L546.8,471.6L540.0,471.6L541.4,463.2L536.9,465.1L538.4,466.9L534.2,466.1L537.9,462.7L534.8,460.9L536.6,459.3L528.0,461.9L524.3,458.5L528.0,457.3L526.3,455.9L529.5,452.9L533.0,453.9L547.0,443.4L546.0,441.0L549.0,438.3L546.5,432.7L543.3,432.2L545.1,429.3L540.3,427.6L544.9,423.3Z",x:573.0,y:446.8}, {n:"Muradabad",p:"M184.9,104.6L195.4,106.4L200.1,111.1L200.3,115.2L206.4,114.4L202.6,120.4L203.8,125.1L197.4,129.9L199.4,131.6L197.8,134.9L206.4,140.6L204.3,144.1L206.8,145.6L203.8,149.6L197.0,151.4L193.6,148.7L192.9,153.8L202.9,161.5L201.2,168.1L189.5,170.5L184.3,176.3L172.5,179.8L160.9,177.8L153.9,170.1L149.7,169.6L151.9,159.9L148.2,155.4L150.1,153.4L147.8,145.0L169.5,142.5L175.4,136.9L177.7,131.0L172.7,126.7L179.8,119.2L175.3,118.7L174.6,112.1L178.9,110.3L176.6,108.7L179.3,105.5L184.9,104.6Z",x:183.8,y:138.3}, {n:"Muzaffarnagar",p:"M102.3,70.4L105.5,73.5L106.0,78.4L103.0,80.3L106.7,80.4L106.8,88.4L113.6,94.1L112.4,96.8L121.2,106.6L111.0,105.9L85.0,112.4L75.1,107.2L70.5,109.1L65.5,106.0L57.4,111.7L47.1,107.3L20.9,103.2L22.0,100.5L18.2,97.6L21.3,96.2L20.6,92.1L15.0,84.8L17.5,83.2L15.1,79.4L19.7,74.5L19.1,71.8L27.9,71.5L40.0,75.5L51.4,73.4L56.3,77.1L68.9,78.0L72.7,82.2L76.2,77.9L81.1,78.8L89.1,73.7L102.3,70.4Z",x:65.3,y:88.6}, {n:"Pilibhit",p:"M287.0,135.7L292.9,138.1L290.4,142.7L297.6,139.6L299.8,141.7L296.2,142.4L302.4,143.0L301.1,144.3L307.7,149.7L313.9,148.1L318.4,140.3L338.2,146.5L340.7,150.2L345.4,151.5L342.3,157.2L350.1,159.2L355.6,165.3L349.7,169.7L344.4,168.0L342.0,170.2L336.0,170.3L337.0,173.8L330.5,178.8L324.5,175.4L318.7,179.9L312.8,177.5L306.5,180.2L306.8,197.0L297.4,195.3L299.9,192.1L294.1,187.2L292.0,187.4L291.2,192.9L283.2,192.0L284.5,188.0L279.2,185.3L282.1,185.0L278.0,181.1L281.0,176.6L277.8,175.1L283.1,173.4L283.5,169.7L286.6,170.5L285.7,166.1L279.3,164.4L278.2,159.9L271.8,159.1L270.3,155.8L277.9,147.1L274.8,138.4L278.4,139.3L287.0,135.7Z",x:302.6,y:164.4}, {n:"Pratapgarh",p:"M480.5,354.3L483.8,359.4L489.3,358.7L493.9,363.4L501.5,361.8L503.9,359.1L508.8,361.4L512.1,359.3L522.4,361.4L526.8,359.5L536.4,364.3L540.9,361.0L548.3,362.3L551.1,365.1L555.9,363.0L560.2,367.0L551.1,368.7L555.9,372.7L551.0,372.3L545.9,374.2L544.1,378.1L534.0,379.4L535.0,388.5L527.0,393.1L516.9,389.7L519.7,387.5L517.0,385.8L508.7,385.3L504.4,388.5L494.6,385.5L490.6,386.7L490.2,391.9L484.8,392.0L487.8,395.4L480.9,396.4L479.2,392.4L475.8,392.0L476.3,397.9L471.7,399.9L467.8,395.8L451.7,389.6L454.9,384.4L448.3,381.1L449.7,378.8L447.0,376.9L459.3,370.5L463.4,371.0L465.3,367.6L474.4,368.2L470.6,365.4L471.5,363.2L466.5,362.8L471.7,359.7L468.8,356.0L476.8,351.3L480.5,354.3Z",x:499.0,y:374.5}, {n:"Raebareli",p:"M434.3,317.9L445.8,322.6L450.0,322.0L452.7,318.8L466.2,322.0L472.0,329.0L469.3,332.4L470.6,342.0L476.4,348.4L476.0,353.4L468.8,356.0L471.7,359.7L466.5,362.6L471.5,363.2L470.6,365.4L474.4,368.2L465.3,367.6L463.4,371.0L459.3,370.5L451.6,376.1L447.8,375.8L449.8,379.4L448.0,380.6L437.4,376.5L435.7,371.3L425.5,369.1L415.6,360.4L395.9,363.0L380.6,357.1L382.7,352.7L390.2,351.0L390.3,348.6L395.5,349.4L401.3,343.3L396.4,338.3L397.9,335.9L402.7,338.2L407.3,337.1L410.4,341.0L418.8,335.8L412.0,328.3L413.6,322.9L418.8,325.5L424.1,320.7L434.3,317.9Z",x:435.4,y:348.5}, {n:"Rampur",p:"M214.3,114.0L224.9,117.7L227.3,125.8L231.2,124.9L240.9,130.9L247.1,129.6L251.4,135.2L248.3,137.0L250.5,141.1L247.3,141.3L249.2,145.8L246.1,145.3L246.5,147.4L240.0,149.3L231.9,160.7L223.6,167.3L209.3,171.9L209.3,175.7L201.2,168.1L202.9,161.5L192.8,152.1L193.8,148.5L197.0,151.4L203.8,149.6L206.8,145.6L204.3,144.1L206.4,140.6L197.8,134.9L197.5,128.2L203.8,125.1L202.6,120.4L206.4,114.0L210.5,117.9L214.3,114.0Z",x:220.0,y:139.6}, {n:"Saharanpur",p:"M66.0,15.2L71.1,15.0L78.9,20.7L101.4,28.0L91.9,38.8L86.6,39.7L83.6,43.8L85.1,45.6L80.8,48.7L81.1,54.6L78.1,56.4L84.4,64.7L83.8,70.5L89.1,73.7L81.1,78.8L76.2,77.9L72.7,82.2L68.9,78.0L56.3,77.1L51.4,73.4L40.0,75.5L27.9,71.5L21.0,72.2L17.9,67.7L33.9,43.8L48.6,39.2L49.6,34.3L54.6,32.7L64.5,22.9L66.7,18.2L63.8,15.5L66.0,15.2Z",x:65.8,y:49.4}, {n:"Sant Kabir Nagar",p:"M631.2,282.3L632.6,285.7L639.7,284.7L640.7,287.7L637.6,290.4L640.8,291.0L639.8,295.2L631.6,295.0L627.8,301.3L632.5,306.2L626.4,309.8L631.2,313.5L628.8,316.6L632.0,320.8L638.6,323.9L637.0,326.7L634.9,325.3L627.5,327.1L627.5,331.7L624.9,333.1L620.2,327.9L607.8,322.5L609.3,321.1L606.3,317.0L608.4,315.0L610.9,316.1L609.3,313.4L614.7,312.0L615.4,309.0L609.7,304.9L610.9,302.3L605.7,303.1L605.6,299.4L600.1,297.4L604.6,295.6L602.5,292.3L604.3,290.7L618.1,293.0L623.2,285.4L631.2,282.3Z",x:622.4,y:306.5}, {n:"Sant Ravidas Nagar",p:"M556.1,403.6L557.7,406.1L561.0,404.0L568.2,410.0L572.3,408.6L573.9,412.1L575.0,409.2L577.8,409.4L576.8,412.0L580.9,412.8L578.8,413.8L588.2,414.3L584.3,425.4L581.5,424.6L580.7,427.8L575.5,425.2L564.3,425.5L561.7,427.6L555.6,424.4L551.0,428.5L544.3,423.3L540.3,427.6L545.2,429.9L536.6,430.0L538.4,423.2L546.5,420.6L547.8,414.0L551.7,411.8L544.6,406.3L548.1,405.2L545.9,404.0L549.5,405.5L549.4,402.5L553.1,404.7L556.1,403.6Z",x:560.9,y:415.2}, {n:"Shahjahanpur",p:"M347.9,175.8L349.1,179.6L342.7,185.7L342.1,194.2L336.3,195.6L336.7,201.8L324.0,206.6L319.8,212.1L314.0,212.7L318.9,226.4L302.6,228.5L297.3,234.1L284.7,228.6L279.6,235.4L284.0,243.8L282.5,248.2L276.5,245.5L276.1,234.8L270.4,236.9L271.9,238.6L260.6,239.0L256.3,235.3L244.8,234.3L243.2,227.9L246.0,227.2L245.8,223.0L250.9,218.9L259.0,218.8L256.4,214.5L259.4,210.8L258.0,207.5L263.3,201.6L273.8,199.4L272.8,194.0L278.6,185.3L284.5,188.0L283.2,192.0L291.2,192.9L292.0,187.4L294.1,187.2L299.9,192.1L297.4,195.3L306.8,197.0L306.7,180.1L312.8,177.5L318.7,179.9L324.5,175.4L330.5,178.8L337.0,173.8L336.4,170.1L342.0,170.2L347.9,175.8Z",x:294.8,y:206.1}, {n:"Shrawasti",p:"M496.6,214.3L506.8,218.4L513.5,212.4L523.7,212.8L529.3,217.5L536.8,218.9L528.2,227.3L529.2,229.3L524.4,235.1L518.2,239.1L521.2,241.9L523.2,253.5L509.8,251.1L509.5,255.0L506.3,256.5L507.7,260.3L500.7,259.7L496.7,264.7L484.8,258.5L492.5,256.9L484.0,255.1L484.3,246.7L470.4,240.0L470.3,235.9L459.1,232.2L467.3,228.3L469.9,228.9L471.4,234.0L474.6,231.7L470.9,227.5L474.7,225.6L468.5,222.2L463.9,211.4L477.2,211.2L480.8,207.3L485.4,207.6L496.6,214.3Z",x:496.0,y:233.8}, {n:"Siddharth Nagar",p:"M591.2,246.1L611.6,246.5L614.1,249.1L622.3,250.6L638.0,250.2L646.6,255.8L648.7,259.6L634.9,268.3L635.8,273.5L630.2,273.4L633.0,281.9L623.2,285.4L618.1,293.0L608.1,290.8L607.6,286.6L599.3,291.3L597.3,290.5L598.7,287.9L591.4,287.6L590.0,284.4L579.5,286.1L574.2,284.5L571.6,277.3L567.3,276.3L565.6,272.7L560.6,272.6L564.9,269.7L568.6,271.9L573.7,271.1L566.4,266.8L569.3,265.7L565.7,263.6L568.2,261.5L565.1,262.0L567.7,260.3L563.6,259.9L565.9,257.3L570.9,256.3L574.5,252.0L593.1,253.4L589.1,248.9L591.2,246.1Z",x:593.3,y:268.8}, {n:"Sitapur",p:"M411.9,215.4L414.4,215.8L412.2,220.0L420.8,220.2L424.6,223.1L428.2,221.7L428.7,223.6L436.9,225.4L432.3,227.3L438.5,227.9L441.0,230.0L439.2,232.0L445.4,232.2L446.6,242.0L444.4,243.1L446.8,243.8L449.3,251.9L456.1,257.6L448.9,265.7L443.4,257.5L436.6,260.3L438.2,264.5L435.0,266.9L425.5,264.0L420.3,268.3L410.5,266.8L406.6,273.0L396.2,278.0L393.1,270.6L388.0,267.8L378.5,267.8L378.3,265.4L372.9,265.2L369.7,262.6L362.3,265.5L364.3,264.6L362.6,260.0L358.1,258.7L357.6,254.0L344.9,244.2L343.1,232.3L364.4,221.5L369.2,226.3L373.2,226.2L376.8,219.1L387.2,223.2L392.1,220.8L395.9,222.9L402.9,218.1L406.5,218.7L409.6,214.2L411.9,215.4Z",x:408.8,y:243.2}, {n:"Sonbhadra",p:"M620.7,457.9L619.5,459.9L623.6,461.2L628.8,459.8L627.0,462.8L636.9,467.9L647.1,466.1L649.3,467.6L650.6,462.3L660.6,463.2L667.8,466.4L671.0,470.7L669.4,473.1L673.9,475.2L669.4,483.0L658.7,485.0L659.4,492.4L664.7,495.9L657.0,499.9L659.6,503.7L646.8,523.0L640.6,525.7L637.9,531.2L631.6,533.6L613.5,535.0L598.2,527.5L597.9,524.5L592.7,523.9L594.8,518.7L588.8,518.5L583.6,514.2L585.0,512.3L590.1,513.8L594.5,501.6L594.2,495.2L588.7,494.3L591.7,485.1L589.3,480.7L598.3,480.9L597.8,477.2L594.1,477.2L594.4,473.5L587.5,473.7L584.5,469.2L570.6,473.0L569.5,470.9L571.9,469.5L571.6,460.5L575.2,458.7L580.5,459.4L579.7,462.0L583.0,462.3L587.5,458.9L598.2,457.0L613.2,458.1L618.9,452.7L620.7,457.9Z",x:614.9,y:483.5}, {n:"Sultanpur",p:"M476.1,315.0L482.7,317.3L479.9,317.2L480.0,319.2L485.3,318.7L485.1,322.5L482.6,323.4L486.1,325.1L490.9,322.2L499.3,324.7L503.0,323.0L504.9,325.2L513.0,324.9L516.6,327.5L529.3,328.5L534.8,333.1L554.6,335.4L561.4,342.8L572.0,343.0L580.7,346.0L583.7,344.7L586.5,353.2L576.9,349.9L573.8,355.1L561.0,355.0L560.3,357.7L564.5,359.9L563.3,362.0L568.3,363.1L569.1,365.5L565.8,367.8L564.4,365.2L554.6,363.0L551.1,365.1L541.3,361.0L536.4,364.3L526.8,359.5L522.4,361.4L512.1,359.3L508.8,361.4L503.9,359.1L501.5,361.8L493.5,363.3L489.3,358.7L483.8,359.4L470.5,341.8L469.3,332.4L472.0,329.0L468.2,322.4L472.2,317.0L470.9,312.8L476.1,315.0Z",x:519.0,y:343.0}, {n:"Unnao",p:"M340.8,283.6L353.9,294.8L358.2,287.9L368.0,284.8L372.7,287.1L368.7,290.9L373.7,290.3L376.9,293.6L375.6,295.4L382.3,297.8L388.6,303.9L382.2,305.0L384.7,309.8L382.7,310.9L385.9,313.3L388.8,310.8L392.6,314.0L397.5,312.7L402.5,317.9L413.8,323.1L412.0,328.3L418.8,335.8L413.6,338.0L413.4,340.5L408.7,341.0L407.3,337.1L402.7,338.2L397.9,335.9L396.4,338.3L402.1,342.2L395.5,349.4L390.3,348.6L390.2,351.0L382.7,352.7L382.9,356.3L374.3,353.4L373.6,348.1L368.8,346.8L366.0,337.0L343.1,323.6L342.5,317.2L336.6,311.2L330.5,310.8L325.9,307.1L322.4,296.1L316.8,292.3L323.2,286.2L330.2,286.1L329.3,289.1L334.0,288.6L337.2,283.7L340.8,283.6Z",x:373.1,y:315.8}, {n:"Varanasi",p:"M625.1,401.4L626.8,406.1L629.5,405.6L628.2,403.4L633.8,405.2L635.5,403.5L631.1,409.8L637.6,412.9L632.6,419.9L626.9,418.9L619.5,421.1L625.0,425.7L618.0,429.1L607.7,428.0L602.2,431.9L595.7,428.9L599.0,428.8L599.4,424.8L595.8,426.9L595.3,423.6L592.5,426.0L584.3,425.4L587.5,419.7L585.4,417.1L588.2,414.5L585.6,411.8L590.8,408.4L588.2,406.8L588.7,402.7L595.2,403.1L604.1,399.0L610.6,399.8L613.1,403.4L619.9,399.4L622.2,402.2L625.1,401.4Z",x:609.0,y:414.8}, ];

const DISTRICT_NAME_MAP = {
  "Agra": "Agra",
  "Allahabad": "Allahabad (Prayagraj)",
  "Kanpur Nagar": "Kanpur",
  "Aligarh": "Aligarh",
  "Ambedkar Nagar": "Ambedkar Nagar",
  "Auraiya": "Auraiya",
  "Azamgarh": "Azamgarh",
  "Badaun": "Badaun",
  "Baghpat": "Baghpat",
  "Bahraich": "Bahraich",
  "Ballia": "Ballia",
  "Balrampur": "Balrampur",
  "Banda": "Banda",
  "Barabanki": "Barabanki",
  "Bareilly": "Bareilly",
  "Basti": "Basti",
  "Bijnor": "Bijnor",
  "Bulandshahr": "Bulandshahr",
  "Chandauli": "Chandauli",
  "Chitrakoot": "Chitrakoot",
  "Deoria": "Deoria",
  "Etah": "Etah",
  "Etawah": "Etawah",
  "Faizabad": "Faizabad",
  "Farrukhabad": "Farrukhabad",
  "Fatehpur": "Fatehpur",
  "Firozabad": "Firozabad",
  "Gautam Buddha Nagar": "Gautam Buddha Nagar",
  "Ghaziabad": "Ghaziabad",
  "Ghazipur": "Ghazipur",
  "Gonda": "Gonda",
  "Gorakhpur": "Gorakhpur",
  "Hamirpur": "Hamirpur",
  "Hardoi": "Hardoi",
  "Mahamaya Nagar": "Mahamaya Nagar",
  "Jalaun": "Jalaun",
  "Jaunpur": "Jaunpur",
  "Lalitpur": "Lalitpur",
  "Jyotiba Phule Nagar": "Jyotiba Phule Nagar",
  "Kannauj": "Kannauj",
  "Kaushambi": "Kaushambi",
  "Kushinagar": "Kushinagar",
  "Kheri": "Kheri",
  "Jhansi": "Jhansi",
  "Mahrajganj": "Mahrajganj",
  "Mahoba": "Mahoba",
  "Mainpuri": "Mainpuri",
  "Mathura": "Mathura",
  "Mau": "Mau",
  "Meerut": "Meerut",
  "Mirzapur": "Mirzapur",
  "Muradabad": "Muradabad",
  "Muzaffarnagar": "Muzaffarnagar",
  "Pilibhit": "Pilibhit",
  "Pratapgarh": "Pratapgarh",
  "Raebareli": "Raebareli",
  "Rampur": "Rampur",
  "Saharanpur": "Saharanpur",
  "Sant Kabir Nagar": "Sant Kabir Nagar",
  "Sant Ravidas Nagar": "Sant Ravidas Nagar",
  "Shahjahanpur": "Shahjahanpur",
  "Shrawasti": "Shrawasti",
  "Siddharth Nagar": "Siddharth Nagar",
  "Sitapur": "Sitapur",
  "Sonbhadra": "Sonbhadra",
  "Sultanpur": "Sultanpur",
  "Unnao": "Unnao",
  "Varanasi": "Varanasi",
};

const DATA_DISTRICT_NAMES = new Set(Object.keys(DISTRICT_NAME_MAP));

const UPMap = ({ districts, activeDistrict, onDistrictClick }) => {
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  const findDistrict = (geoName) => {
    const dataName = DISTRICT_NAME_MAP[geoName];
    return dataName ? districts.find(d => d.name === dataName) : null;
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg viewBox="0 0 800 550" style={{ width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
        {UP_DISTRICTS.map(({ n, p, x, y }) => {
          const d = findDistrict(n);
          const dataName = DISTRICT_NAME_MAP[n];
          const isActive = dataName && activeDistrict?.name === dataName;
          const isHovered = hovered === n;
          const color = d ? (STATUS[d.status]?.color || C.gray) : "#D1D5DB";
          const fillColor = d ? color : "#E5E7EB";

          return (
            <g key={n}
              style={{ cursor: d ? "pointer" : "default" }}
              onClick={() => { if (d) onDistrictClick(isActive ? null : d); }}
              onMouseEnter={() => { setHovered(n); if (d) setTooltip({ x, y, district: d }); }}
              onMouseLeave={() => { setHovered(null); setTooltip(null); }}
            >
              <path
                d={p}
                fill={fillColor}
                opacity={isActive ? 1 : isHovered && d ? 0.85 : d ? 0.6 : 0.35}
                stroke={isActive ? color : d ? "#fff" : "#D1D5DB"}
                strokeWidth={isActive ? 2.5 : d ? 1 : 0.5}
                style={{ transition: "all 0.15s ease" }}
              />
            </g>
          );
        })}
      </svg>

      {tooltip && tooltip.district && (
        <div style={{
          position: "absolute",
          left: `${(tooltip.x / 800) * 100}%`,
          top: `${(tooltip.y / 550) * 100 - 18}%`,
          transform: "translate(-50%, -100%)",
          background: "#fff",
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "10px 14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          zIndex: 20,
          pointerEvents: "none",
          minWidth: 170,
        }} className="fade">
          <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 6, display: "flex", alignItems: "center", gap: 7 }}>
            {tooltip.district.name}
            <Chip label={STATUS[tooltip.district.status]?.label} color={STATUS[tooltip.district.status]?.color} bg={STATUS[tooltip.district.status]?.bg} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", fontSize: 11 }}>
            <span style={{ color: C.gray }}>KPI</span>
            <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 600, color: C.navy }}>{tooltip.district.kpi}%</span>
            <span style={{ color: C.gray }}>Sentiment</span>
            <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 600, color: sentimentLabel(tooltip.district.sentiment).color }}>{sentimentLabel(tooltip.district.sentiment).label}</span>
            <span style={{ color: C.gray }}>Divergence</span>
            <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 600, color: tooltip.district.divergence > 1.0 ? C.red : tooltip.district.divergence > 0 ? C.orange : C.green }}>
              {divergenceLabel(tooltip.district.divergence)}
            </span>
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: C.gray, borderTop: `1px solid ${C.border}`, paddingTop: 5 }}>
            {tooltip.district.official} {"·"} Click to view report
          </div>
        </div>
      )}
    </div>
  );
};

// ── District Report Side Panel ───────────────────────────────────────────────
const DistrictReportPanel = ({ district, onClose }) => {
  if (!district) return null;
  const st = STATUS[district.status] || STATUS.aligned;
  const sent = sentimentLabel(district.sentiment);
  const divLabel = divergenceLabel(district.divergence);

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, width: 480, height: "100vh",
      background: "#fff", boxShadow: "-4px 0 30px rgba(0,0,0,0.12)",
      zIndex: 100, overflowY: "auto", borderLeft: `1px solid ${C.border}`,
    }} className="slide-in">
      {/* Header */}
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, background: "#FAFBFC", position: "sticky", top: 0, zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 9, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>DISTRICT REPORT</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>{district.name}</span>
              <Chip label={st.label.toUpperCase()} color={st.color} bg={st.bg} />
              {district.gamingFlag && <Chip label="GAMING FLAG" color={C.red} bg="rgba(220,38,38,0.08)" />}
            </div>
            <div style={{ fontSize: 12, color: C.gray, marginTop: 4 }}>
              {district.designation}: {district.official} {"·"} Tenure: {district.tenure}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, color: C.gray, lineHeight: 1, padding: "4px 8px" }}>{"×"}</button>
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {/* Key metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.gray, marginBottom: 4 }}>KPI Score</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.navy, fontFamily: "'DM Mono', monospace" }}>{district.kpi}%</div>
          </div>
          <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.gray, marginBottom: 4 }}>Sentiment</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: sent.color, marginTop: 6 }}>{sent.label}</div>
            <div style={{ fontSize: 11, color: C.gray, fontFamily: "'DM Mono', monospace" }}>{district.sentiment.toFixed(2)}</div>
          </div>
          <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.gray, marginBottom: 4 }}>Gap Status</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: district.divergence > 1.0 ? C.red : district.divergence > 0.5 ? C.orange : C.green, marginTop: 6 }}>{divLabel}</div>
            <div style={{ fontSize: 11, color: C.gray, fontFamily: "'DM Mono', monospace" }}>{district.divergence > 0 ? "+" : ""}{district.divergence.toFixed(2)}</div>
          </div>
        </div>

        {/* Additional stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#F9FAFB", borderRadius: 8 }}>
            <span style={{ fontSize: 12, color: C.gray }}>Feedback entries</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{district.feedback.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#F9FAFB", borderRadius: 8 }}>
            <span style={{ fontSize: 12, color: C.gray }}>Citizen experience</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{district.citizenExp}%</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#F9FAFB", borderRadius: 8 }}>
            <span style={{ fontSize: 12, color: C.gray }}>Trend</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: district.trend === "up" ? C.green : district.trend === "down" ? C.red : C.orange }}>
              {district.trend === "up" ? "↑ Improving" : district.trend === "down" ? "↓ Declining" : "→ Stable"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#F9FAFB", borderRadius: 8 }}>
            <span style={{ fontSize: 12, color: C.gray }}>Missed commitments</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: district.missedCommitments > 0 ? C.red : C.green }}>{district.missedCommitments}</span>
          </div>
        </div>

        {/* Diagnosis */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: C.gray, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>ANALYSIS</div>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.8, padding: "14px 16px", background: "#FAFBFC", borderRadius: 10, border: `1px solid ${C.border}` }}>
            {district.diagnosis}
          </div>
        </div>

        {/* Recommended action */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: C.gray, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>RECOMMENDED ACTION</div>
          <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.8, padding: "14px 16px", background: st.bg, borderRadius: 10, borderLeft: `3px solid ${st.color}` }}>
            {district.recommended}
          </div>
        </div>

        {/* Suggested actions */}
        <div style={{ fontSize: 10, color: C.gray, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>WHAT YOU CAN DO</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["Generate complete report for this district", "Complete analysis of performance trends", "View all citizen feedback entries", "Compare with similar districts"].map((action, i) => (
            <button key={i} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px",
              borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff",
              color: C.text, fontSize: 12, fontFamily: "'Lato', sans-serif", textAlign: "left",
            }}>
              <span style={{ color: C.accent, fontWeight: 700 }}>{"→"}</span> {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("dashboard");
  const [activeDistrict, setActiveDistrict] = useState(null);
  const [reportDistrict, setReportDistrict] = useState(null);
  const [fullReportDistrict, setFullReportDistrict] = useState(null);
  const [generatedReports, setGeneratedReports] = useState([]);
  const [chat, setChat] = useState([{
    role: "assistant",
    content: "Good morning. You have 4 districts with highly negative divergence this week. Agra's gap has widened for the third consecutive week — I recommend prioritising it in today's review. What would you like to go into?",
    sources: "Based on 5 district reports, 1,247 citizen feedback entries · Updated 28 Apr 2026, 06:00",
  }]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [brief, setBrief] = useState(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const chatEnd = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chat]);

  // ── Chat handler ────────────────────────────────────────────────────────
  const sendChat = async (msg) => {
    if (!msg.trim() || chatLoading) return;
    setChat(p => [...p, { role: "user", content: msg }]);
    setChatInput("");
    setChatLoading(true);

    const lower = msg.toLowerCase();

    // Check if this is a district report/analysis request
    const reportMatch = DISTRICTS.find(d => lower.includes(d.name.toLowerCase().split("(")[0].trim().toLowerCase()));
    if ((lower.includes("report") || lower.includes("analysis") || lower.includes("complete")) && reportMatch) {
      setReportDistrict(reportMatch);
      const reportTitle = lower.includes("analysis") ? `Analysis: ${reportMatch.name}` : `Report: ${reportMatch.name}`;
      const reportType = lower.includes("analysis") ? "analysis" : "report";
      setGeneratedReports(prev => {
        const exists = prev.some(r => r.districtName === reportMatch.name && r.type === reportType);
        if (exists) return prev;
        return [...prev, {
          id: Date.now(), title: reportTitle, districtName: reportMatch.name,
          type: reportType,
          timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          district: reportMatch,
        }];
      });
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          districts: DISTRICTS,
          scheme: SCHEME,
          carryForward: CARRY_FORWARD,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API error");
      setChat(p => [...p, { role: "assistant", content: data.response, sources: data.sources }]);
    } catch (err) {
      setChat(p => [...p, { role: "assistant", content: "Sorry, I encountered an error connecting to the intelligence service. Please try again.", sources: err.message }]);
    }
    setChatLoading(false);
  };

  // ── Brief generator ─────────────────────────────────────────────────────
  const generateBrief = async () => {
    setBriefLoading(true); setBrief(null);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          districts: DISTRICTS,
          scheme: SCHEME,
          carryForward: CARRY_FORWARD,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API error");
      setBrief(data);
    } catch (err) {
      console.error("Brief generation failed:", err);
      setBrief({
        issueNumber: "Error",
        flags: ["GENERATION FAILED"],
        context: "Failed to generate brief: " + err.message,
        stateOfScheme: "The intelligence brief could not be generated. Please check your API configuration and try again.",
        dominantTheme: "N/A",
        themeVolume: "N/A",
        districtSummaries: [],
        carryForward: CARRY_FORWARD.map(c => ({ item: c.item, status: c.status })),
      });
    }
    setBriefLoading(false);
  };

  const sc = (s) => STATUS[s] || STATUS.aligned;

  // ── SIDEBAR ───────────────────────────────────────────────────────────────
  const sidebar = (
    <div style={{ width: 220, background: C.sidebar, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, flexShrink: 0 }}>
      <div style={{ padding: "28px 20px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
        <svg width="44" height="44" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 8 }}>
          <g transform="translate(40,40)">
            <g transform="rotate(0)">
              <path d="M0,-38 C-2,-30 -8,-22 -18,-16 L0,-24 L18,-16 C8,-22 2,-30 0,-38Z" fill="rgba(255,255,255,0.9)" />
            </g>
            <g transform="rotate(120)">
              <path d="M0,-38 C-2,-30 -8,-22 -18,-16 L0,-24 L18,-16 C8,-22 2,-30 0,-38Z" fill="rgba(255,255,255,0.7)" />
            </g>
            <g transform="rotate(240)">
              <path d="M0,-38 C-2,-30 -8,-22 -18,-16 L0,-24 L18,-16 C8,-22 2,-30 0,-38Z" fill="rgba(255,255,255,0.55)" />
            </g>
          </g>
        </svg>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 20, letterSpacing: 1.5, marginBottom: 4 }}>BeGov</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 0.8, lineHeight: 1.5 }}>Designed with people.<br/>Delivered at scale.</div>
      </div>
      <div style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        {[{ id: "dashboard", icon: "◉", label: "Dashboard" }, { id: "brief", icon: "≡", label: "Weekly Brief" }].map(item => (
          <button key={item.id} onClick={() => { setView(item.id); setReportDistrict(null); }} style={{
            display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "9px 10px",
            borderRadius: 8, border: "none", marginBottom: 2,
            background: view === item.id ? "rgba(255,255,255,0.12)" : "transparent",
            color: view === item.id ? "#FFFFFF" : "rgba(255,255,255,0.45)",
            fontSize: 13, fontWeight: view === item.id ? 600 : 400,
            fontFamily: "'Lato', sans-serif", textAlign: "left",
          }}>
            <span style={{ fontSize: 11 }}>{item.icon}</span> {item.label}
          </button>
        ))}

        {/* Reports section */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: 1.5, padding: "0 10px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>REPORTS</span>
            {generatedReports.length > 0 && (
              <span style={{ fontSize: 9, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", padding: "1px 6px", borderRadius: 10 }}>{generatedReports.length}</span>
            )}
          </div>
          {generatedReports.length === 0 ? (
            <div style={{ padding: "8px 10px", fontSize: 11, color: "rgba(255,255,255,0.2)", lineHeight: 1.5 }}>
              No reports yet. Ask the system to generate a report for any district.
            </div>
          ) : (
            generatedReports.map((report) => (
              <button key={report.id} onClick={() => { setFullReportDistrict(report.district); setView("report"); setReportDistrict(null); }} style={{
                display: "flex", alignItems: "flex-start", gap: 8, width: "100%", padding: "8px 10px",
                borderRadius: 8, border: "none", marginBottom: 2,
                background: (fullReportDistrict?.name === report.districtName && view === "report") ? "rgba(255,255,255,0.12)" : "transparent",
                color: (fullReportDistrict?.name === report.districtName && view === "report") ? "#FFFFFF" : "rgba(255,255,255,0.45)",
                fontSize: 12, fontFamily: "'Lato', sans-serif", textAlign: "left",
                transition: "background 0.15s",
              }}>
                <span style={{ fontSize: 10, marginTop: 2, flexShrink: 0, color: report.type === "analysis" ? "#60A5FA" : "#34D399" }}>
                  {report.type === "analysis" ? "◈" : "◆"}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{report.title}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>Generated at {report.timestamp}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      <div style={{ padding: "12px 12px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>ACTIVE SCHEME</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Ayushman Bharat {"–"} UP</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "blink 2s infinite" }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Live {"·"} {SCHEME.week}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ── DASHBOARD VIEW ────────────────────────────────────────────────────────
  const topDistricts = [...DISTRICTS].sort((a, b) => b.divergence - a.divergence).slice(0, 8);

  const dashboardView = (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      {/* Top bar */}
      <div style={{ padding: "16px 24px", background: "#fff", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
        <div>
          <div style={{ fontSize: 10, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 }}>LIVE DASHBOARD</div>
          <div style={{ fontSize: 14, color: C.navy, fontWeight: 700 }}>{SCHEME.week}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost">Export brief</Btn>
          <Btn onClick={() => setView("brief")}>Prepare review meeting</Btn>
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {/* Scheme Snapshot */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", marginBottom: 16, border: `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 10, color: C.red, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.3, marginBottom: 8, textAlign: "center" }}>
            SCHEME SNAPSHOT {"—"} {SCHEME.name.toUpperCase()}, {SCHEME.state.toUpperCase()}
          </div>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.85, marginBottom: 14, margin: "0 0 14px", textAlign: "left" }}>
            <div style={{ textAlign: "center", marginBottom: 14, fontSize: 13, color: C.text, maxWidth: "none" }}>
              Statewide KPI compliance is at <strong>{SCHEME.avgKpi}%</strong>, while citizen sentiment remains <strong style={{ color: C.red }}>{sentimentLabel(SCHEME.sentiment).label}</strong> {"—"} a persistent divergence now in its <strong>{SCHEME.gapWeeks}th consecutive week</strong>.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: 12.5, lineHeight: 1.75 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ color: C.red, fontSize: 14, lineHeight: 1.4 }}>{"●"}</span>
                <span><strong>Agra</strong> continues to show the widest gap {"—"} high official KPI but highly negative citizen experience, corroborated by independent journalism investigations</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ color: C.orange, fontSize: 14, lineHeight: 1.4 }}>{"●"}</span>
                <span>A <strong>national software procurement delay</strong> is affecting claim processing across 7 districts {"—"} a systemic factor, not a local failure</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ color: C.green, fontSize: 14, lineHeight: 1.4 }}>{"●"}</span>
                <span><strong>Varanasi</strong> stands out as a positive outlier with a replicable community health worker model worth scaling statewide</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ color: C.red, fontSize: 14, lineHeight: 1.4 }}>{"●"}</span>
                <span><strong>4 districts</strong> show highly negative divergence between official KPI and ground-level citizen sentiment</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
            <Chip label={"▲ National software delay — claim processing"} color={C.red} bg="rgba(220,38,38,0.08)" />
            <Chip label="4 districts at highly negative divergence" color={C.orange} bg="rgba(217,119,6,0.06)" />
            <Chip label="Varanasi: positive outlier, replicable model" color={C.green} bg="rgba(22,163,74,0.06)" />
          </div>
        </div>

        {/* Four summary blocks */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div style={{ background: "linear-gradient(135deg, #fff 0%, #F0FDF4 100%)", borderRadius: 14, padding: "20px 18px", border: `1px solid #D1FAE5`, textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 11, color: C.gray, marginBottom: 8, fontWeight: 500 }}>State KPI score</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: C.navy, fontFamily: "'DM Mono', monospace", letterSpacing: -1.5 }}>{SCHEME.avgKpi}%</div>
            <div style={{ fontSize: 11, color: C.green, marginTop: 6, fontWeight: 600 }}>{"↑"} 1.2% vs last week</div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #fff 0%, #FEF2F2 100%)", borderRadius: 14, padding: "20px 18px", border: `1px solid #FECACA`, textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 11, color: C.gray, marginBottom: 8, fontWeight: 500 }}>Citizen sentiment</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.red, letterSpacing: -0.5 }}>{sentimentLabel(SCHEME.sentiment).label}</div>
            <div style={{ fontSize: 11, color: C.red, marginTop: 6, fontWeight: 600 }}>{"↓"} Declining vs last week</div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #fff 0%, #ECFDF5 100%)", borderRadius: 14, padding: "20px 18px", border: `1px solid #A7F3D0`, textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 11, color: C.gray, marginBottom: 8, fontWeight: 500 }}>Top Performer</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.green, letterSpacing: -0.5 }}>Varanasi</div>
            <div style={{ fontSize: 11, color: C.green, marginTop: 6, fontWeight: 600 }}>KPI 88% · Positive sentiment</div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #fff 0%, #EFF6FF 100%)", borderRadius: 14, padding: "20px 18px", border: `1px solid #BFDBFE`, textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 11, color: C.gray, marginBottom: 8, fontWeight: 500 }}>Active complaints</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: C.navy, fontFamily: "'DM Mono', monospace", letterSpacing: -1.5 }}>{SCHEME.complaints.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: C.red, marginTop: 6, fontWeight: 600 }}>{"↑"} 312 this week</div>
          </div>
        </div>

        {/* Map + KPI vs Sentiment table */}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* District map */}
          <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, color: C.navy, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.3 }}>UTTAR PRADESH {"—"} DISTRICT MAP</div>
              <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>Hover for stats {"·"} Click a district to open report</div>
            </div>
            <div style={{ padding: "12px 14px", minHeight: 320 }}>
              <UPMap
                districts={DISTRICTS}
                activeDistrict={activeDistrict}
                onDistrictClick={(d) => {
                  setActiveDistrict(activeDistrict?.name === d?.name ? null : d);
                  if (d) setReportDistrict(d);
                }}
              />
              <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                {[
                  { color: C.red, label: "Red" },
                  { color: C.orange, label: "Amber" },
                  { color: C.green, label: "Green" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: C.gray }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: item.color, display: "inline-block", opacity: 0.75 }} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* KPI vs Citizen Sentiment table */}
          <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, color: C.navy, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.3 }}>KPI VS CITIZEN SENTIMENT {"—"} DISTRICT ACCOUNTABILITY</div>
              <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>Sorted by divergence {"·"} Click a row to drill down</div>
            </div>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 0.8fr 0.8fr 0.8fr", padding: "8px 18px", borderBottom: `1px solid ${C.border}`, fontSize: 10, color: C.gray, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
              <span>District / Official</span>
              <span style={{ textAlign: "center" }}>KPI</span>
              <span style={{ textAlign: "center" }}>Sentiment</span>
              <span style={{ textAlign: "center" }}>Divergence</span>
            </div>
            {/* Table rows */}
            <div style={{ overflowY: "auto", maxHeight: 380 }}>
              {topDistricts.map((d, i) => {
                const sent = sentimentLabel(d.sentiment);
                return (
                  <div key={i}
                    onClick={() => setReportDistrict(d)}
                    style={{
                      display: "grid", gridTemplateColumns: "1.6fr 0.8fr 0.8fr 0.8fr",
                      padding: "12px 18px", borderBottom: `1px solid ${C.border}`,
                      cursor: "pointer", transition: "background 0.1s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F9FAFB"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {d.gamingFlag && <Chip label="GAMING" color={C.red} bg="rgba(220,38,38,0.08)" />}
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{d.name.split("(")[0].trim()}</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{d.designation} · {d.official} ({d.tenure})</div>
                    </div>
                    <div style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <div style={{ width: 40, height: 6, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${d.kpi}%`, height: "100%", background: d.kpi > 85 ? C.green : d.kpi > 70 ? C.orange : C.red, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.navy, fontFamily: "'DM Mono', monospace" }}>{d.kpi}%</span>
                    </div>
                    <div style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: sent.color }}>{sent.label}</span>
                    </div>
                    <div style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: d.divergence > 1.3 ? C.red : d.divergence > 0.5 ? C.orange : C.green }}>
                        {divergenceLabel(d.divergence)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Carry-forward from last meeting */}
        <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, padding: "18px 22px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 10, color: C.red, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.3, marginBottom: 16, textAlign: "center" }}>CARRY-FORWARD FROM LAST MEETING</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {CARRY_FORWARD.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", background: "#FAFBFC", borderRadius: 10, borderLeft: `3px solid ${item.color}` }}>
                <Chip label={item.status} color={item.color} />
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>
                    {item.item}
                    <span style={{ fontSize: 11, color: C.gray }}> (committed: {new Date(item.committedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })})</span>
                  </span>
                  {item.daysOverdue != null && (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: "rgba(220,38,38,0.08)", color: C.red }}>{item.daysOverdue} days overdue</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "13px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 10, color: C.navy, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.3 }}>ASK THE SYSTEM</div>
            <div style={{ fontSize: 11, color: C.gray }}>Powered by BeGov Intelligence</div>
          </div>
          <div style={{ padding: "10px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", flexWrap: "wrap", gap: 7 }}>
            {["Generate complete report for Agra", "Why is Varanasi doing well?", "Missed commitments from last meeting", "Complete analysis of Lucknow"].map(p => (
              <button key={p} onClick={() => sendChat(p)} style={{ fontSize: 11, padding: "5px 11px", borderRadius: 20, border: `1.5px solid ${C.border}`, background: "transparent", color: C.navy, fontFamily: "'Lato', sans-serif" }}>
                {p}
              </button>
            ))}
          </div>
          <div style={{ maxHeight: 260, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
            {chat.map((msg, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: msg.role === "assistant" ? C.navy : C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {msg.role === "assistant" ? "B" : "PS"}
                </div>
                <div style={{ background: msg.role === "assistant" ? "#F9FAFB" : "rgba(37,99,235,0.06)", borderRadius: 10, padding: "9px 13px", fontSize: 13, lineHeight: 1.65, color: C.text, maxWidth: "88%" }}>
                  {msg.content}
                  {msg.role === "assistant" && msg.sources && (
                    <div style={{ marginTop: 8, paddingTop: 6, borderTop: `1px solid ${C.border}`, fontSize: 10, color: C.gray, lineHeight: 1.5 }}>
                      {msg.sources}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>B</div>
                <div style={{ fontSize: 13, color: C.gray }}>Analysing district data...</div>
              </div>
            )}
            <div ref={chatEnd} />
          </div>
          <div style={{ padding: "10px 18px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat(chatInput)}
              placeholder="Ask about district performance, officials, trends..."
              style={{ flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "9px 13px", fontSize: 13, fontFamily: "'Lato', sans-serif", color: C.text, background: "#fff" }} />
            <Btn onClick={() => sendChat(chatInput)}>{"→"}</Btn>
          </div>
        </div>
      </div>
    </div>
  );

  // ── BRIEF VIEW ────────────────────────────────────────────────────────────
  const briefView = (
    <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
      <div style={{ padding: "18px 32px", background: "#fff", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontSize: 10, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 }}>WEEKLY INTELLIGENCE BRIEF</div>
          <div style={{ fontSize: 14, color: C.navy, fontWeight: 700 }}>Ayushman Bharat {"—"} {SCHEME.state}</div>
        </div>
        <Btn onClick={generateBrief} style={{ display: "flex", alignItems: "center", gap: 8, opacity: briefLoading ? 0.7 : 1 }}>
          {briefLoading
            ? <><div style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Generating...</>
            : brief ? "Regenerate brief →" : "Generate this week's brief →"}
        </Btn>
      </div>

      <div style={{ padding: "32px", maxWidth: 820, margin: "0 auto" }}>
        {!brief && !briefLoading && (
          <div style={{ textAlign: "center", padding: "70px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.15, color: C.navy }}>{"≡"}</div>
            <div style={{ fontSize: 16, color: C.navy, fontWeight: 700, marginBottom: 8 }}>Ready to generate this week's brief</div>
            <div style={{ fontSize: 13, color: C.gray, maxWidth: 380, margin: "0 auto", lineHeight: 1.7 }}>
              The system will synthesise all district data, citizen sentiment, journalism corroboration, and accountability items into a classified intelligence brief.
            </div>
          </div>
        )}
        {briefLoading && (
          <div style={{ textAlign: "center", padding: "70px 20px" }}>
            <div style={{ width: 44, height: 44, border: `4px solid ${C.border}`, borderTopColor: C.navy, borderRadius: "50%", animation: "spin 0.85s linear infinite", margin: "0 auto 18px" }} />
            <div style={{ fontSize: 15, color: C.navy, fontWeight: 600 }}>Synthesising intelligence...</div>
            <div style={{ fontSize: 12, color: C.gray, marginTop: 6 }}>Aggregating district signals, sentiment data, and accountability records</div>
          </div>
        )}

        {brief && (
          <div className="fade">
            <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ background: C.sidebar, padding: "22px 28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1.5 }}>PM-JAY / AYUSHMAN BHARAT {"·"} UTTAR PRADESH {"·"} WEEKLY INTELLIGENCE BRIEF</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textAlign: "right" }}>
                    {brief.issueNumber}<br />
                    Prepared: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} {"·"} 06:00<br />
                    For: Pr. Secretary (Health), GoUP<br />
                    <span style={{ color: "#FFB3B3", fontWeight: 700 }}>Classification: RESTRICTED</span>
                  </div>
                </div>
                <div style={{ fontSize: 23, fontWeight: 800, color: "#fff", letterSpacing: -0.5, marginBottom: 2 }}>Scheme Performance Review</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>{SCHEME.week}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {brief.flags?.map((flag, i) => (
                    <span key={i} style={{ fontSize: 9, padding: "3px 9px", borderRadius: 4, background: "rgba(255,255,255,0.06)", fontWeight: 700, letterSpacing: 0.5, color: i === 0 ? "#FFB3B3" : i === 1 ? "#FCD34D" : "#93C5FD" }}>
                      {flag}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ padding: "24px 28px" }}>
                {brief.context && (
                  <div style={{ background: "rgba(217,119,6,0.06)", borderRadius: 8, padding: "12px 16px", marginBottom: 22, borderLeft: `3px solid ${C.orange}` }}>
                    <div style={{ fontSize: 9, color: C.orange, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 5 }}>CONTEXT THIS WEEK</div>
                    <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.75 }}>{brief.context}</div>
                  </div>
                )}

                <div style={{ marginBottom: 26 }}>
                  <div style={{ fontSize: 9, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 12 }}>01 {"·"} STATE OF THE SCHEME</div>
                  <div style={{ fontSize: 14, color: C.text, lineHeight: 1.9 }}>{brief.stateOfScheme}</div>
                  {brief.dominantTheme && (
                    <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(220,38,38,0.05)", borderRadius: 8 }}>
                      <span style={{ fontSize: 12, color: C.gray }}>Dominant theme by volume:</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{brief.dominantTheme}</span>
                      <Chip label={brief.themeVolume} color={C.red} bg="rgba(220,38,38,0.08)" />
                    </div>
                  )}
                </div>

                {brief.districtSummaries && (
                  <div style={{ marginBottom: 26 }}>
                    <div style={{ fontSize: 9, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 16 }}>02 {"·"} WHAT CHANGED THIS WEEK</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {brief.districtSummaries.map((d, i) => {
                        const st = sc(d.status);
                        const dir = d.direction === "down" ? "↓" : d.direction === "up" ? "↑" : "→";
                        return (
                          <div key={i} style={{ paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                              <span style={{ fontSize: 16, color: st.color, fontWeight: 700 }}>{dir}</span>
                              <span style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>{d.name}</span>
                              <Chip label={st.label.toUpperCase()} color={st.color} bg={st.bg} />
                              <span style={{ fontSize: 10, color: C.gray, fontFamily: "'DM Mono', monospace" }}>KPI {d.kpi}% {"·"} Sentiment: {sentimentLabel(d.sentiment).label}</span>
                            </div>
                            <div style={{ fontSize: 13, color: C.text, lineHeight: 1.75, marginBottom: d.action ? 10 : 0 }}>{d.headline}</div>
                            {d.action && (
                              <div style={{ fontSize: 12, color: C.navy, fontStyle: "italic", paddingLeft: 14, borderLeft: `2px solid ${st.color}`, lineHeight: 1.65 }}>
                                <strong>ACTION</strong> {d.action}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Carry-forward */}
                {brief.carryForward && (
                  <div>
                    <div style={{ fontSize: 9, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 14 }}>03 · CARRY-FORWARD</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {brief.carryForward.map((item, i) => {
                        const col = item.status === "NO RESPONSE" ? C.red : item.status === "PARTIAL" ? C.orange : item.status === "COMPLETE" ? C.green : C.blue;
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <Chip label={item.status} color={col} />
                            <span style={{ fontSize: 13, color: C.text, lineHeight: 1.65, marginTop: 2 }}>{item.item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );


  // ── FULL REPORT VIEW ──────────────────────────────────────────────────────
  const reportView = (() => {
    if (!fullReportDistrict) return <div style={{ flex: 1, background: C.bg }} />;
    const d = fullReportDistrict;
    const st = STATUS[d.status] || STATUS.aligned;
    const sent = sentimentLabel(d.sentiment);
    const divLbl = divergenceLabel(d.divergence);
    const trendDir = d.trend === "up" ? "↑ Improving" : d.trend === "down" ? "↓ Declining" : "→ Stable";
    const trendColor = d.trend === "up" ? C.green : d.trend === "down" ? C.red : C.orange;

    // Generate detailed mock content based on district data
    const kpiBreakdown = [
      { metric: "Hospital empanelment", value: Math.min(100, d.kpi + Math.floor(Math.random()*5)), status: "On track" },
      { metric: "Claim processing (avg days)", value: d.kpi > 85 ? "18" : "27", status: d.kpi > 85 ? "Within target" : "Exceeding threshold" },
      { metric: "Beneficiary card issuance", value: Math.max(60, d.kpi - 5) + "%", status: d.kpi > 80 ? "Satisfactory" : "Below target" },
      { metric: "Grievance redressal rate", value: d.citizenExp + "%", status: d.citizenExp > 50 ? "Adequate" : "Needs attention" },
      { metric: "Fraud flag rate", value: d.gamingFlag ? "High" : "Low", status: d.gamingFlag ? "Under investigation" : "Normal" },
    ];

    const sentimentBreakdown = [
      { source: "Citizen helpline calls", sentiment: sent.label, volume: Math.floor(d.feedback * 0.3) },
      { source: "Social media monitoring", sentiment: d.sentiment > 0 ? "Mostly Positive" : "Mostly Negative", volume: Math.floor(d.feedback * 0.25) },
      { source: "Field survey responses", sentiment: d.sentiment > -0.3 ? "Mixed" : "Negative", volume: Math.floor(d.feedback * 0.2) },
      { source: "Journalism / media reports", sentiment: d.divergence > 1.0 ? "Critical" : "Neutral", volume: Math.floor(d.feedback * 0.15) },
      { source: "NGO partner feedback", sentiment: d.citizenExp > 50 ? "Constructive" : "Concerned", volume: Math.floor(d.feedback * 0.1) },
    ];

    const timelineEvents = [
      { date: "Week 1 (7 Apr)", event: "KPI audit completed — " + (d.kpi > 85 ? "no anomalies detected" : "discrepancies flagged in claim data") },
      { date: "Week 2 (14 Apr)", event: d.sentiment < -0.3 ? "Citizen sentiment sharply declined — helpline complaints surged" : "Citizen feedback remained stable across channels" },
      { date: "Week 3 (21 Apr)", event: d.divergence > 1.0 ? "Divergence between KPI and sentiment widened — field verification ordered" : "Routine review — no escalation required" },
      { date: "Week 4 (28 Apr)", event: d.missedCommitments > 0 ? d.missedCommitments + " carry-forward commitment(s) still unresolved" : "All prior commitments addressed" },
    ];

    return (
      <div style={{ flex: 1, overflowY: "auto", background: C.bg }}>
        {/* Top bar */}
        <div style={{ padding: "18px 32px", background: "#fff", borderBottom: "1px solid " + C.border, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 }}>DISTRICT INTELLIGENCE REPORT</div>
            <div style={{ fontSize: 14, color: C.navy, fontWeight: 700 }}>{d.name} {"—"} {SCHEME.week}</div>
          </div>
          <Btn onClick={() => setView("dashboard")}>{"←"} Back to dashboard</Btn>
        </div>

        <div style={{ padding: "32px", maxWidth: 900, margin: "0 auto" }}>
          {/* Dark header card — same style as weekly brief */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid " + C.border, overflow: "hidden", marginBottom: 28 }}>
            <div style={{ background: C.sidebar, padding: "22px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1.5 }}>
                  PM-JAY / AYUSHMAN BHARAT {"·"} {d.name.toUpperCase()} {"·"} DISTRICT INTELLIGENCE REPORT
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textAlign: "right" }}>
                  Prepared: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} {"·"} 06:00<br />
                  For: District Review Committee<br />
                  <span style={{ color: "#FFB3B3", fontWeight: 700 }}>Classification: RESTRICTED</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 2 }}>
                <span style={{ fontSize: 23, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>{d.name}</span>
                <Chip label={st.label.toUpperCase()} color={st.color} bg={st.bg} />
                {d.gamingFlag && <Chip label="GAMING FLAG" color={C.red} bg="rgba(220,38,38,0.15)" />}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>
                {d.designation}: {d.official} {"·"} Tenure: {d.tenure} {"·"} {SCHEME.week}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                <span style={{ fontSize: 9, padding: "3px 9px", borderRadius: 4, background: "rgba(255,255,255,0.06)", fontWeight: 700, letterSpacing: 0.5, color: d.divergence > 1.0 ? "#FFB3B3" : "#93C5FD" }}>
                  {divLbl}
                </span>
                <span style={{ fontSize: 9, padding: "3px 9px", borderRadius: 4, background: "rgba(255,255,255,0.06)", fontWeight: 700, letterSpacing: 0.5, color: "#FCD34D" }}>
                  {trendDir}
                </span>
                {d.missedCommitments > 0 && (
                  <span style={{ fontSize: 9, padding: "3px 9px", borderRadius: 4, background: "rgba(255,255,255,0.06)", fontWeight: 700, letterSpacing: 0.5, color: "#FFB3B3" }}>
                    {d.missedCommitments} MISSED COMMITMENT{d.missedCommitments > 1 ? "S" : ""}
                  </span>
                )}
              </div>
            </div>

            <div style={{ padding: "24px 28px" }}>
              {/* Section 01: Executive Summary */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 9, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 12 }}>01 {"·"} EXECUTIVE SUMMARY</div>
                <div style={{ fontSize: 14, color: C.text, lineHeight: 1.9 }}>
                  {d.name} is currently classified as <strong style={{ color: st.color }}>{st.label.toLowerCase()}</strong> with a KPI compliance of <strong>{d.kpi}%</strong> and citizen sentiment rated <strong style={{ color: sent.color }}>{sent.label.toLowerCase()}</strong>. The gap between official performance metrics and ground-level citizen experience is <strong style={{ color: d.divergence > 1.0 ? C.red : C.orange }}>{divLbl.toLowerCase()}</strong>, indicating {d.divergence > 1.0 ? "a significant disconnect that warrants immediate investigation" : d.divergence > 0.5 ? "a moderate disconnect that should be monitored closely" : "reasonable alignment between reported and experienced outcomes"}. {d.gamingFlag ? "A gaming flag has been raised — official numbers may not reflect actual service delivery." : ""} The district has received {d.feedback.toLocaleString()} citizen feedback entries this reporting period, with a citizen experience index of {d.citizenExp}%.
                </div>
              </div>

              {/* Section 02: KPI Breakdown */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 9, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 14 }}>02 {"·"} KPI PERFORMANCE BREAKDOWN</div>
                <div style={{ border: "1px solid " + C.border, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "10px 18px", background: "#F9FAFB", borderBottom: "1px solid " + C.border, fontSize: 10, color: C.gray, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    <span>Metric</span>
                    <span style={{ textAlign: "center" }}>Value</span>
                    <span style={{ textAlign: "right" }}>Status</span>
                  </div>
                  {kpiBreakdown.map((row, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", padding: "12px 18px", borderBottom: i < kpiBreakdown.length - 1 ? "1px solid " + C.border : "none", fontSize: 13, color: C.text }}>
                      <span style={{ fontWeight: 500 }}>{row.metric}</span>
                      <span style={{ textAlign: "center", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{row.value}</span>
                      <span style={{ textAlign: "right", fontSize: 11, color: row.status.includes("Below") || row.status.includes("Exceeding") || row.status.includes("investigation") ? C.red : row.status.includes("Needs") ? C.orange : C.green, fontWeight: 600 }}>
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 03: Sentiment Intelligence */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 9, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 14 }}>03 {"·"} CITIZEN SENTIMENT INTELLIGENCE</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "16px", textAlign: "center", border: "1px solid " + C.border }}>
                    <div style={{ fontSize: 10, color: C.gray, marginBottom: 6 }}>Overall sentiment</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: sent.color }}>{sent.label}</div>
                  </div>
                  <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "16px", textAlign: "center", border: "1px solid " + C.border }}>
                    <div style={{ fontSize: 10, color: C.gray, marginBottom: 6 }}>Feedback volume</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>{d.feedback.toLocaleString()}</div>
                  </div>
                  <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "16px", textAlign: "center", border: "1px solid " + C.border }}>
                    <div style={{ fontSize: 10, color: C.gray, marginBottom: 6 }}>Citizen experience</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: d.citizenExp > 50 ? C.green : C.red }}>{d.citizenExp}%</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: C.gray, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Breakdown by source</div>
                <div style={{ border: "1px solid " + C.border, borderRadius: 10, overflow: "hidden" }}>
                  {sentimentBreakdown.map((row, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 0.8fr", padding: "11px 18px", borderBottom: i < sentimentBreakdown.length - 1 ? "1px solid " + C.border : "none", fontSize: 13, color: C.text, alignItems: "center" }}>
                      <span>{row.source}</span>
                      <span style={{ fontWeight: 600, color: row.sentiment.includes("Negative") || row.sentiment === "Critical" || row.sentiment === "Concerned" ? C.red : row.sentiment.includes("Positive") || row.sentiment === "Constructive" ? C.green : C.orange }}>{row.sentiment}</span>
                      <span style={{ textAlign: "right", fontSize: 12, color: C.gray, fontFamily: "'DM Mono', monospace" }}>{row.volume} entries</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 04: Timeline */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 9, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 14 }}>04 {"·"} WEEKLY TIMELINE</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {timelineEvents.map((evt, i) => (
                    <div key={i} style={{ display: "flex", gap: 16, minHeight: 60 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: i === timelineEvents.length - 1 ? C.accent : C.border, border: "2px solid " + (i === timelineEvents.length - 1 ? C.accent : C.border), flexShrink: 0 }} />
                        {i < timelineEvents.length - 1 && <div style={{ width: 1.5, flex: 1, background: C.border }} />}
                      </div>
                      <div style={{ paddingBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, marginBottom: 3 }}>{evt.date}</div>
                        <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{evt.event}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 05: Analysis & Diagnosis */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 9, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 12 }}>05 {"·"} ANALYSIS {"&"} DIAGNOSIS</div>
                <div style={{ background: "rgba(217,119,6,0.06)", borderRadius: 8, padding: "14px 18px", borderLeft: "3px solid " + C.orange, marginBottom: 14 }}>
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.85 }}>{d.diagnosis}</div>
                </div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.85 }}>
                  {d.divergence > 1.0 ? "The significant gap between official KPI (" + d.kpi + "%) and citizen sentiment (" + sent.label.toLowerCase() + ") suggests potential systemic issues in service delivery that are not captured by compliance metrics alone. Field verification and independent audit are recommended." : d.divergence > 0.5 ? "A moderate gap exists between reported performance and citizen perception. While not critical, this warrants closer monitoring and targeted feedback collection to identify root causes." : "KPI performance and citizen sentiment are reasonably aligned, suggesting that official metrics are reflecting ground reality. Continue routine monitoring."}
                </div>
              </div>

              {/* Section 06: Recommended Actions */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 9, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 14 }}>06 {"·"} RECOMMENDED ACTIONS</div>
                <div style={{ borderRadius: 10, border: "1px solid " + C.border, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid " + C.border, background: st.bg }}>
                    <div style={{ fontSize: 9, color: st.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>PRIMARY RECOMMENDATION</div>
                    <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.7, fontWeight: 500 }}>{d.recommended}</div>
                  </div>
                  <div style={{ padding: "14px 18px" }}>
                    <div style={{ fontSize: 9, color: C.gray, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>SUGGESTED FOLLOW-UP</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        d.divergence > 1.0 ? "Commission independent field verification of KPI data" : "Schedule routine field visit for next quarter",
                        d.sentiment < -0.3 ? "Convene district-level citizen grievance hearing within 7 days" : "Continue periodic citizen feedback collection",
                        d.missedCommitments > 0 ? "Escalate " + d.missedCommitments + " unresolved carry-forward item(s) to Principal Secretary" : "No carry-forward escalation needed",
                        d.gamingFlag ? "Initiate formal audit of claim submission patterns" : "Maintain standard audit cycle",
                        "Share district performance summary with " + d.designation + " for response within 48 hours",
                      ].map((action, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: C.text, lineHeight: 1.7 }}>
                          <span style={{ color: st.color, fontWeight: 700, marginTop: 2, flexShrink: 0 }}>{"●"}</span>
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 07: Accountability */}
              <div>
                <div style={{ fontSize: 9, color: C.gray, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 14 }}>07 {"·"} ACCOUNTABILITY {"&"} CARRY-FORWARD</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "14px 18px", border: "1px solid " + C.border }}>
                    <div style={{ fontSize: 10, color: C.gray, marginBottom: 4 }}>Responsible officer</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{d.official}</div>
                    <div style={{ fontSize: 12, color: C.gray }}>{d.designation} {"·"} {d.tenure}</div>
                  </div>
                  <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "14px 18px", border: "1px solid " + C.border }}>
                    <div style={{ fontSize: 10, color: C.gray, marginBottom: 4 }}>Missed commitments</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: d.missedCommitments > 0 ? C.red : C.green }}>{d.missedCommitments === 0 ? "None" : d.missedCommitments + " pending"}</div>
                    <div style={{ fontSize: 12, color: C.gray }}>{d.missedCommitments > 0 ? "Requires follow-up" : "All commitments cleared"}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.75, padding: "12px 16px", background: "rgba(220,38,38,0.03)", borderRadius: 8, borderLeft: "3px solid " + C.border }}>
                  This report was auto-generated by BeGov Intelligence based on {d.feedback.toLocaleString()} citizen feedback entries, official KPI submissions, and journalism corroboration data. It is intended for internal review only and should not be circulated without classification approval.
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  })();

  // -- RENDER --
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Lato', sans-serif", overflow: "hidden" }}>
      <style>{FONTS}</style>
      {sidebar}
      {view === "dashboard" ? dashboardView : view === "report" ? reportView : briefView}
      {reportDistrict && <DistrictReportPanel district={reportDistrict} onClose={() => setReportDistrict(null)} />}
    </div>
  );
}
