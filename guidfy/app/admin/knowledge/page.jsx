'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, FileJson, Save, RefreshCw, Archive, Check } from 'lucide-react';

export default function AdminKnowledgeDashboard() {
  const [activeFile, setActiveFile] = useState('rules');
  const [jsonData, setJsonData] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const files = ['rules', 'questions', 'paths', 'technologies', 'roadmaps'];

  const loadData = async (filename) => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`http://localhost:5050/admin/api/knowledge/${filename}`);
      const data = await res.json();
      setJsonData(JSON.stringify(data, null, 2));
      setActiveFile(filename);
    } catch (err) {
      setMessage('Failed to load file.');
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Validate JSON
      const parsed = JSON.parse(jsonData);
      
      const res = await fetch(`http://localhost:5050/admin/api/knowledge/${activeFile}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      const data = await res.json();
      setMessage(data.message || 'Saved successfully!');
    } catch (err) {
      setMessage('Invalid JSON format or server error.');
    } finally {
      setLoading(false);
    }
  };

  const backupData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5050/admin/api/backup`, { method: 'POST' });
      const data = await res.json();
      setMessage(data.message || 'Backup created!');
    } catch (err) {
      setMessage('Backup failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData('rules');
  }, []);

  return (
    <div className="min-h-screen bg-[#08080f] p-8 text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-[#111118] p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Knowledge Base Manager</h1>
              <p className="text-sm text-slate-400">Expert System Administrator Dashboard</p>
            </div>
          </div>
          <button 
            onClick={backupData}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-white/10 transition-colors"
          >
            <Archive className="w-4 h-4" /> Backup Knowledge
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">JSON Files</h3>
            {files.map(file => (
              <button
                key={file}
                onClick={() => loadData(file)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
                  ${activeFile === file 
                    ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30' 
                    : 'text-slate-300 hover:bg-white/5 border border-transparent'}`}
              >
                <FileJson className="w-4 h-4" />
                <span className="font-medium">{file}.json</span>
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="lg:col-span-3 bg-[#111118] border border-white/10 rounded-2xl p-6 flex flex-col h-[70vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Editing: <span className="text-violet-400">{activeFile}.json</span>
                {loading && <RefreshCw className="w-4 h-4 text-slate-500 animate-spin ml-2" />}
              </h2>
              <div className="flex items-center gap-4">
                {message && (
                  <span className={`text-sm flex items-center gap-1 ${message.includes('success') || message.includes('Backup') ? 'text-green-400' : 'text-red-400'}`}>
                    {message.includes('success') && <Check className="w-4 h-4" />} {message}
                  </span>
                )}
                <button
                  onClick={saveData}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 px-6 py-2 rounded-lg font-medium shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>

            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full bg-[#08080f] text-slate-300 font-mono text-sm p-4 rounded-xl border border-white/10 focus:border-violet-500/50 focus:outline-none resize-none scrollbar-animated"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
