"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Activity, 
  Database, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Play,
  RotateCw,
  TrendingUp,
  HardDrive,
  Copy
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import apiClient from "@/lib/apiClient";

export default function AITrainingDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Polling ref
  const pollInterval = useRef(null);

  const fetchStatus = async () => {
    try {
      const data = await apiClient.get("/super-admin/ai-training/status");
      setStatus(data);
      if (data.training.status === "training") {
        setRetraining(true);
      } else {
        setRetraining(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch status");
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await apiClient.get("/super-admin/ai-training/history");
      if (data.success) {
        setHistory(data.data.reverse()); // latest first
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await apiClient.get("/super-admin/ai-training/logs");
      if (data.success) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchStatus(), fetchHistory(), fetchLogs()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Polling logic when training
  useEffect(() => {
    if (retraining) {
      pollInterval.current = setInterval(() => {
        fetchStatus();
        fetchHistory();
        fetchLogs();
      }, 5000);
    } else {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    }
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [retraining]);

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRetrain = async () => {
    setShowConfirm(false);
    try {
      const data = await apiClient.post("/super-admin/ai-training/retrain");
      if (!data.success) {
        alert(data.message || "Retraining failed to start");
        return;
      }
      setRetraining(true);
      // Let polling take over
    } catch (err) {
      alert("Error triggering retrain: " + (err.message || "Unknown error"));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RotateCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Error loading dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  const { model, feedback, training } = status || {};
  const noFeedback = feedback?.pending <= 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            AI Model Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monitor recommendation model performance and trigger retraining workflows.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={loading || retraining}
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={() => setShowConfirm(true)}
            disabled={retraining || noFeedback}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-lg
              ${retraining 
                ? 'bg-blue-100 text-blue-400 cursor-not-allowed' 
                : noFeedback 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/25'}`}
          >
            {retraining ? (
              <><RotateCw className="w-5 h-5 animate-spin" /> Training in Progress...</>
            ) : (
              <><Play className="w-5 h-5" /> Retrain Model</>
            )}
          </button>
        </div>
      </div>

      {noFeedback && !retraining && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <h3 className="font-semibold">No new feedback available</h3>
            <p className="text-sm">The model is up-to-date with current user interactions. Wait for more user feedback before retraining.</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Model Info */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase">Version {model?.version}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Model Size</p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{model?.modelSize}</h3>
          <p className="text-xs text-gray-400 mt-2">Algo: {model?.algorithm}</p>
        </div>

        {/* Metrics */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">NDCG@10</p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
            {model?.ndcg_10 !== null && model?.ndcg_10 !== undefined ? model.ndcg_10 : 'N/A'}
          </h3>
          <p className="text-xs text-gray-400 mt-2">
            MAP: {model?.map !== null && model?.map !== undefined ? model.map : 'N/A'}
            {model?.evaluation_status === 'skipped' && ' (Eval Skipped)'}
          </p>
        </div>

        {/* Feedback */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase">Total: {feedback?.total}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Pending Feedback</p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{feedback?.pending}</h3>
          <p className="text-xs text-gray-400 mt-2">
            Processed: {feedback?.processed}
            {feedback?.rejected > 0 && <span className="text-red-400 ml-2">Rejected: {feedback.rejected}</span>}
          </p>
        </div>

        {/* Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${
              training?.status === 'training' ? 'bg-yellow-50 text-yellow-600' :
              training?.lastResult === 'success' ? 'bg-emerald-50 text-emerald-600' :
              'bg-red-50 text-red-600'
            }`}>
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Status</p>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1 capitalize">{training?.status}</h3>
          <p className="text-xs text-gray-400 mt-2">Last Run: {training?.lastRun ? new Date(training.lastRun).toLocaleString() : 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* History Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 flex flex-col h-[400px]">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-6 shrink-0">
            <Clock className="w-5 h-5 text-gray-400" />
            Training History
          </h2>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold">Rows</th>
                  <th className="pb-3 font-semibold">NDCG</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {history.length > 0 ? history.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="py-4 text-gray-700 dark:text-gray-300 font-medium">
                      {new Date(item.date).toLocaleString()}
                    </td>
                    <td className="py-4 text-gray-600 dark:text-gray-400">{item.duration}</td>
                    <td className="py-4 text-gray-600 dark:text-gray-400">{item.rows}</td>
                    <td className="py-4 text-gray-600 dark:text-gray-400">{item.ndcg}</td>
                    <td className="py-4">
                      {item.status === 'success' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-100 dark:border-red-800">
                          <AlertCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400">No training history available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Logs */}
        <div className="bg-gray-900 rounded-2xl shadow-sm p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-gray-400" />
              Execution Logs
            </h2>
            <button 
              onClick={handleCopyLogs}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
              title="Copy Logs"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-black/50 rounded-xl p-4 font-mono text-xs text-green-400 flex flex-col-reverse">
            <div>
              {logs.length > 0 ? logs.map((log, i) => (
                <div key={i} className="mb-1 leading-relaxed break-words">{log}</div>
              )) : (
                <div className="text-gray-500 text-center mt-10">No logs available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Retrain Model</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This action will retrain the recommendation model using {feedback?.pending} pending user feedback entries. This process may take a few minutes. Continue?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRetrain}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                >
                  Start Training
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
