import React, { useState } from 'react';
import { Search, Edit2, Trash2, FileOutput, Plus } from 'lucide-react';
import { SurgicalTemplate } from '../types';

interface TemplateLibraryProps {
  templates: SurgicalTemplate[];
  onEdit: (template: SurgicalTemplate) => void;
  onDelete: (id: string) => void;
  onUse: (template: SurgicalTemplate) => void;
  onCreateNew: () => void;
}

export function TemplateLibrary({ templates, onEdit, onDelete, onUse, onCreateNew }: TemplateLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = templates.filter(t => 
    t.procedureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.icd10.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thư viện mẫu</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý các mẫu tường trình phẫu thuật của bạn</p>
        </div>
        
        <button 
          onClick={onCreateNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Tạo mẫu mới
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm mẫu..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Tên phẫu thuật</th>
                <th className="px-6 py-4">Mã ICD-10</th>
                <th className="px-6 py-4 hidden md:table-cell">Cập nhật lần cuối</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTemplates.length > 0 ? filteredTemplates.map(template => (
                <tr key={template.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <span className="block truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-xl" title={template.procedureName}>
                      {template.procedureName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="bg-slate-100 px-2 py-1 flex w-max rounded text-xs font-medium">{template.icd10 || '-'}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell">
                    {new Date(template.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onUse(template)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Sử dụng mẫu này"
                      >
                        <FileOutput className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onEdit(template)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(template.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    Không tìm thấy mẫu nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
