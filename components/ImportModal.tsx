"use client";

import React, { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  X,
  FileCode,
  Check,
} from "lucide-react";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"OCR" | "CSV" | "JSON">("OCR");
  const [loading, setLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [csvContent, setCsvContent] = useState("");
  const [csvType, setCsvType] = useState<"CSV_ATTENDANCE" | "CSV_TIMETABLE">(
    "CSV_ATTENDANCE"
  );
  const [jsonContent, setJsonContent] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcessOCR = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "OCR_EXTRACT",
          content: ocrText,
        }),
      });
      const data = await res.json();
      setOcrResult(data);
    } catch (err: any) {
      setStatusMessage("Failed to process OCR: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommitOCR = async () => {
    if (!ocrResult || !ocrResult.extractedRecords) return;
    setLoading(true);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "OCR_COMMIT",
          confirmedRecords: ocrResult.extractedRecords,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage("✅ Attendance verified and saved successfully!");
        setTimeout(() => {
          onImportSuccess?.();
          onClose();
        }, 1200);
      } else {
        setStatusMessage("Error: " + data.error);
      }
    } catch (err: any) {
      setStatusMessage("Error saving records: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecordField = (
    index: number,
    field: "attended" | "conducted",
    val: number
  ) => {
    if (!ocrResult) return;
    const updated = [...ocrResult.extractedRecords];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    setOcrResult({ ...ocrResult, extractedRecords: updated });
  };

  const handleCSVImport = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: csvType,
          content: csvContent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`✅ ${data.message}`);
        setTimeout(() => {
          onImportSuccess?.();
          onClose();
        }, 1200);
      } else {
        setStatusMessage(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      setStatusMessage("CSV import error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJSONImport = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "JSON",
          content: jsonContent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`✅ ${data.message}`);
        setTimeout(() => {
          onImportSuccess?.();
          onClose();
        }, 1200);
      } else {
        setStatusMessage(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      setStatusMessage("JSON import error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Import Academic Data
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-4 pt-2">
          <button
            onClick={() => setActiveTab("OCR")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === "OCR"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Screenshot OCR</span>
          </button>
          <button
            onClick={() => setActiveTab("CSV")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === "CSV"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV Import</span>
          </button>
          <button
            onClick={() => setActiveTab("JSON")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === "JSON"
                ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>JSON Sync</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {statusMessage && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-900 dark:text-blue-200">
              {statusMessage}
            </div>
          )}

          {/* TAB 1: OCR SCREENSHOT */}
          {activeTab === "OCR" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Verification Required:</strong> We never silently trust
                  automated OCR. Review and edit the extracted attendance figures
                  before applying them to your dashboard.
                </p>
              </div>

              {!ocrResult ? (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Paste OCR Extracted Text from ERP Attendance Screenshot:
                  </label>
                  <textarea
                    rows={6}
                    value={ocrText}
                    onChange={(e) => setOcrText(e.target.value)}
                    placeholder={`TCS-301 Data Structures 36 / 42 85.71%
TCS-302 Mathematics 31 / 40 77.50%
TCS-303 Operating Systems 33 / 38 86.84%
TEC-301 Digital Electronics 26 / 36 72.22%`}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setOcrText(`Graphic Era Hill University ERP Portal
TCS-301 Data Structures 36 / 42 85.71%
TCS-302 Mathematics 31 / 40 77.50%
TCS-303 Operating Systems 33 / 38 86.84%
TEC-301 Digital Electronics 26 / 36 72.22%`);
                      }}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      Fill Sample OCR Text
                    </button>
                    <button
                      onClick={handleProcessOCR}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
                    >
                      {loading ? "Processing OCR..." : "Extract & Verify Data"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Please Verify Extracted Records ({ocrResult.confidenceScore * 100}% Confidence)
                    </h4>
                    <button
                      onClick={() => setOcrResult(null)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Re-parse Text
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    {ocrResult.extractedRecords.map(
                      (rec: any, index: number) => (
                        <div
                          key={rec.id}
                          className="p-3 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {rec.subjectCode}
                            </span>
                            <span className="text-slate-500 ml-2">
                              {rec.subjectName}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400 text-[10px]">
                                Attended:
                              </span>
                              <input
                                type="number"
                                value={rec.attended}
                                onChange={(e) =>
                                  handleUpdateRecordField(
                                    index,
                                    "attended",
                                    parseInt(e.target.value, 10) || 0
                                  )
                                }
                                className="w-14 p-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold"
                              />
                            </div>
                            <span className="text-slate-400">/</span>
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400 text-[10px]">
                                Conducted:
                              </span>
                              <input
                                type="number"
                                value={rec.conducted}
                                onChange={(e) =>
                                  handleUpdateRecordField(
                                    index,
                                    "conducted",
                                    parseInt(e.target.value, 10) || 0
                                  )
                                }
                                className="w-14 p-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold"
                              />
                            </div>
                            <span className="font-bold text-blue-600 dark:text-blue-400 min-w-[50px] text-right">
                              {Math.round(
                                (rec.attended / Math.max(1, rec.conducted)) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCommitOCR}
                      disabled={loading}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm & Save to Dashboard</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CSV */}
          {activeTab === "CSV" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  CSV Type:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCsvType("CSV_ATTENDANCE")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      csvType === "CSV_ATTENDANCE"
                        ? "bg-blue-500/10 border-blue-500 text-blue-600"
                        : "border-slate-200 dark:border-slate-700 text-slate-500"
                    }`}
                  >
                    Attendance Record
                  </button>
                  <button
                    onClick={() => setCsvType("CSV_TIMETABLE")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      csvType === "CSV_TIMETABLE"
                        ? "bg-blue-500/10 border-blue-500 text-blue-600"
                        : "border-slate-200 dark:border-slate-700 text-slate-500"
                    }`}
                  >
                    Timetable Entries
                  </button>
                </div>
              </div>

              <textarea
                rows={7}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder={
                  csvType === "CSV_ATTENDANCE"
                    ? `Subject Code,Subject Name,Conducted,Attended
TCS-301,Data Structures,42,36
TCS-302,Mathematics,40,31`
                    : `Day,Start,End,SubjectCode,SubjectName,Room,Faculty,Type
MONDAY,09:00,10:00,TCS-301,Data Structures,Room 204,Dr. Sharma,THEORY
MONDAY,10:00,11:00,TCS-303,Operating Systems,Room 204,Prof. Gupta,THEORY`
                }
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setCsvContent(
                      csvType === "CSV_ATTENDANCE"
                        ? `Subject Code,Subject Name,Conducted,Attended
TCS-301,Data Structures,42,36
TCS-302,Mathematics,40,31
TCS-303,Operating Systems,38,33`
                        : `Day,Start,End,SubjectCode,SubjectName,Room,Faculty,Type
MONDAY,09:00,10:00,TCS-301,Data Structures,Room 204,Dr. Sharma,THEORY
TUESDAY,09:00,10:00,TCS-302,Mathematics,Room 301,Dr. Joshi,THEORY`
                    );
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg"
                >
                  Fill Sample CSV
                </button>
                <button
                  onClick={handleCSVImport}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  {loading ? "Importing..." : "Import CSV"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: JSON */}
          {activeTab === "JSON" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Import complete academic profile data via structured JSON.
              </p>
              <textarea
                rows={8}
                value={jsonContent}
                onChange={(e) => setJsonContent(e.target.value)}
                placeholder={`{
  "attendance": [
    { "subjectCode": "TCS-301", "subjectName": "Data Structures", "conducted": 42, "attended": 36 }
  ],
  "timetable": [
    { "dayOfWeek": "MONDAY", "startTime": "09:00", "endTime": "10:00", "subjectCode": "TCS-301", "subjectName": "Data Structures" }
  ]
}`}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={handleJSONImport}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  {loading ? "Syncing..." : "Sync JSON Data"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
