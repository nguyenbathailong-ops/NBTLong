import React, { useState, useEffect } from 'react';
import { Save, X, Eye, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { SurgicalTemplate, InteractiveNote } from '../types';
import { ReportPreview } from './ReportPreview';

interface TemplateEditorProps {
  template: SurgicalTemplate | null;
  onSave: (template: SurgicalTemplate) => void;
  onCancel: () => void;
}

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [formData, setFormData] = useState<SurgicalTemplate>({
    id: '',
    procedureName: '',
    surgeon: '',
    icd10: '',
    preOpDiagnosis: '',
    postOpDiagnosis: '',
    findings: '',
    description: '',
    interactiveNotes: [],
    createdAt: Date.now()
  });

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        ...template,
        interactiveNotes: template.interactiveNotes || [],
        description: template.description || ''
      });
    } else {
      setFormData({
        id: Date.now().toString(),
        procedureName: '',
        surgeon: '[Tên Phẫu thuật viên]',
        icd10: '',
        preOpDiagnosis: '',
        postOpDiagnosis: '',
        findings: '',
        description: '',
        interactiveNotes: [],
        createdAt: Date.now()
      });
    }
  }, [template]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNoteChange = (index: number, field: keyof InteractiveNote, value: string) => {
    const newNotes = [...(formData.interactiveNotes || [])];
    let finalValue = value;
    
    // Auto-convert Google Drive Link
    if (field === 'imageUrl' && value) {
      const gdriveMatch = value.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (gdriveMatch && gdriveMatch[1]) {
         finalValue = `https://drive.google.com/uc?export=view&id=${gdriveMatch[1]}`;
      } else {
         const idMatch = value.match(/[?&]id=([a-zA-Z0-9_-]+)/);
         if (idMatch && idMatch[1] && value.includes('drive.google.com')) {
            finalValue = `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
         }
      }
    }
    
    newNotes[index] = { ...newNotes[index], [field]: finalValue };
    setFormData(prev => ({ ...prev, interactiveNotes: newNotes }));
  };

  const addNote = () => {
    setFormData(prev => ({
      ...prev,
      interactiveNotes: [...(prev.interactiveNotes || []), { id: Date.now().toString() + Math.random().toString(36).substr(2, 9), keyword: '', imageUrl: '' }]
    }));
  };

  const removeNote = (index: number) => {
    const newNotes = (formData.interactiveNotes || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, interactiveNotes: newNotes }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.procedureName) {
      alert('Vui lòng nhập tên phẫu thuật');
      return;
    }
    // Clean up empty notes
    const cleanedData = {
      ...formData,
       interactiveNotes: (formData.interactiveNotes || []).filter(n => n.keyword.trim() && n.imageUrl.trim())
    };
    onSave(cleanedData);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col pt-4 md:pt-8 px-4 md:px-0 pb-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {template ? 'Chỉnh sửa mẫu' : 'Tạo mẫu mới'}
        </h1>
        <div className="flex items-center gap-2 md:gap-3">
          <button 
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Xem trước</span>
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Hủy</span>
          </button>
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm"
          >
            <Save className="w-4 h-4" />
            Lưu
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl flex-1 overflow-auto">
        <form id="template-form" onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Tên thủ thuật / Phẫu thuật <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="procedureName"
                value={formData.procedureName}
                onChange={handleChange}
                placeholder="VD: Cắt ruột thừa nội soi"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Mã ICD-10</label>
              <input 
                type="text" 
                name="icd10"
                value={formData.icd10}
                onChange={handleChange}
                placeholder="VD: K35.80"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Phẫu thuật viên</label>
              <input 
                type="text" 
                name="surgeon"
                value={formData.surgeon}
                onChange={handleChange}
                placeholder="[Tên Phẫu thuật viên]"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Chẩn đoán trước mổ</label>
              <input 
                type="text" 
                name="preOpDiagnosis"
                value={formData.preOpDiagnosis}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Chẩn đoán sau mổ</label>
              <input 
                type="text" 
                name="postOpDiagnosis"
                value={formData.postOpDiagnosis}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Quan sát bệnh lý (Findings)</label>
              <textarea 
                name="findings"
                value={formData.findings}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5 col-span-1 md:col-span-2 flex flex-col">
              <label className="block text-sm font-medium text-slate-700 mt-2 mb-1">Mô tả chi tiết quá trình phẫu thuật</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={12}
                placeholder="Mô tả chi tiết các bước phẫu thuật..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-y font-mono text-sm leading-relaxed"
              />
            </div>

            {/* Interactive Notes Section */}
            <div className="space-y-4 col-span-1 md:col-span-2 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                 <div>
                   <label className="block text-sm font-medium text-slate-700">Hình ảnh tương tác (Interactive Notes)</label>
                   <p className="text-xs text-slate-500 mt-1">Cụm từ được nhập sẽ trở thành dạng bôi đậm (in nổi). Khi click vào sẽ hiện ảnh.</p>
                 </div>
                 <button 
                    type="button" 
                    onClick={addNote} 
                    className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                 >
                    <Plus className="w-4 h-4"/> Thêm liên kết
                 </button>
              </div>
              
              <div className="space-y-3">
                 {(formData.interactiveNotes || []).map((note, index) => (
                    <div key={note.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 group transition-all hover:border-blue-200 relative">
                       
                       <div className="flex flex-col md:flex-row gap-3 pr-8">
                         <div className="flex-1">
                           <input 
                             type="text"
                             placeholder="Từ khóa/Cụm từ trong bài (Ví dụ: bộc lộ rõ ống túi mật)"
                             value={note.keyword}
                             onChange={e => handleNoteChange(index, 'keyword', e.target.value)}
                             className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm font-medium"
                           />
                         </div>
                         <div className="flex-[2] flex items-center gap-2">
                           <div className="p-1.5 bg-slate-200 rounded-md text-slate-500 shrink-0">
                             <ImageIcon className="w-3.5 h-3.5" />
                           </div>
                           <input 
                             type="text"
                             placeholder="Dán link ảnh hiển thị (Google Drive, Imgur...)"
                             value={note.imageUrl}
                             onChange={e => handleNoteChange(index, 'imageUrl', e.target.value)}
                             className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm text-slate-600 font-mono"
                           />
                         </div>
                       </div>

                       <button type="button" onClick={() => removeNote(index)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-600 rounded bg-white hover:bg-red-50 border border-slate-100 shadow-sm transition-colors"><Trash2 className="w-4 h-4"/></button>

                       {/* Thumbnail preview */}
                       {note.imageUrl && (
                          <div className="relative inline-block border border-slate-200 p-1 rounded-lg bg-white mt-1 w-max">
                             <img 
                                src={note.imageUrl} 
                                alt="Preview" 
                                className="max-h-24 max-w-[200px] object-cover rounded shadow-sm" 
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdib3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2JkNWUxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9Imx1Y2lkZSBsdWNpZGUtaW1hZ2Utb2ZmIj48bGluZSB4MT0iMiIgeTE9IjIiIHgyPSIyMiIgeTI9IjIyIi8+PHBhdGggZD0iTTEwLjQxIDEwLjQxYTIgMiAwIDAgMC0yLjgzIDIuODMiLz48bGluZSB4MT0iMTMuNSIgeTE9IjEzLjUiIHgyPSIxNiIgeTI9IjExIi8+PGxpbmUgeDE9IjIxIiB5MT0iMjEiIHgyPSIyMSIgeTI9IjMiLz48bGluZSB4MT0iMjEiIHkxPSIzIiB4Mj0iMyIgeTI9IjMiLz48bGluZSB4MT0iMyIteTE9IjMiHgyPSIzIiB5Mj0iMjEiLz48bGluZSB4MT0iMyIteTE9IjIxIiB4Mj0iMjEiIHkyPSIyMSIvPjwvc3ZnPg==';
                                }}
                             />
                             <div className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur rounded p-0.5 text-[10px] font-medium text-slate-500 shadow-sm">Xem trước</div>
                          </div>
                       )}
                    </div>
                 ))}
                 
                 {(formData.interactiveNotes || []).length === 0 && (
                   <div className="text-center py-6 text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed text-sm">
                      Bạn có thể gắn link hình ảnh vào các cụm từ quan trọng trong mẫu.
                   </div>
                 )}
              </div>
            </div>

          </div>
        </form>
      </div>

      {showPreview && (
        <ReportPreview 
          template={formData} 
          onClose={() => setShowPreview(false)} 
          isEditingPreview={true} 
        />
      )}
    </div>
  );
}
