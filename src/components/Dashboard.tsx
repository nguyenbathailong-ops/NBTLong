import React, { useState } from 'react';
import { Search, Clock, FileText, ChevronRight, Plus } from 'lucide-react';
import { SurgicalTemplate } from '../types';

interface DashboardProps {
  templates: SurgicalTemplate[];
  onUseTemplate: (template: SurgicalTemplate) => void;
  onCreateNew: () => void;
}

export function Dashboard({ templates, onUseTemplate, onCreateNew }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Sort by last used conceptually, descending
  const recentTemplates = [...templates]
    .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
    .slice(0, 5);

  const filteredTemplates = (term: string) => {
    if (!term) return [];
    return templates.filter(t => 
      t.procedureName.toLowerCase().includes(term.toLowerCase()) ||
      t.diagnosis.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 5);
  };

  const searchResults = filteredTemplates(searchTerm);

  const formatDate = (ts?: number) => {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString('vi-VN', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute:'2-digit'
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Chào mừng Bác sĩ,</h1>
        <p className="text-slate-500 mt-1">Hôm nay bạn cần tường trình phẫu thuật gì?</p>
      </header>

      {/* Quick Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Tìm tên phẫu thuật, chẩn đoán..."
          className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-lg transition-shadow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {searchTerm && searchResults.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-semibold text-slate-800">Kết quả tìm kiếm</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {searchResults.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                <div>
                  <h3 className="font-medium text-slate-900 text-lg">{template.procedureName}</h3>
                  <p className="text-sm text-slate-500 mt-1">{template.diagnosis}</p>
                </div>
                <button
                  onClick={() => onUseTemplate(template)}
                  className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-lg transition-colors text-sm"
                >
                  Sử dụng
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchTerm && searchResults.length === 0 && (
        <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 border-dashed">
          <p className="text-slate-500">Không tìm thấy mẫu tường trình nào.</p>
          <button onClick={onCreateNew} className="mt-4 text-blue-600 font-medium hover:text-blue-700 flex items-center justify-center gap-1 mx-auto">
            <Plus className="w-4 h-4" /> Tạo mẫu mới "{searchTerm}"
          </button>
        </div>
      )}

      {/* Recently Used */}
      {!searchTerm && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800 px-1">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Sử dụng gần đây</h2>
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {recentTemplates.length > 0 ? recentTemplates.map((template) => (
              <div 
                key={template.id} 
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-blue-200 group cursor-pointer flex flex-col h-full"
                onClick={() => onUseTemplate(template)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                  {template.procedureName}
                </h3>
                <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>{template.lastUsed ? formatDate(template.lastUsed) : 'Chưa sử dụng'}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                </div>
              </div>
            )) : (
              <div className="col-span-full py-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
                Chưa có mẫu nào được sử dụng gần đây.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
