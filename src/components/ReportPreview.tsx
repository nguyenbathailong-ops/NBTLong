import React, { useState } from 'react';
import { X, Copy, Check, Printer, ImageIcon, ChevronRight } from 'lucide-react';
import { SurgicalTemplate, InteractiveNote } from '../types';

interface ReportPreviewProps {
  template: SurgicalTemplate;
  onClose: () => void;
  isEditingPreview?: boolean;
}

export function ReportPreview({ template, onClose, isEditingPreview = false }: ReportPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [activeImage, setActiveImage] = useState<{url: string, keyword: string} | null>(null);

  const generateReportText = () => {
    return `TƯỜNG TRÌNH PHẪU THUẬT

1. Tên phẫu thuật: ${template.procedureName}
2. Phẫu thuật viên: ${template.surgeon}
3. Mã ICD-10: ${template.icd10 || 'Không có'}
4. Chẩn đoán trước mổ: ${template.preOpDiagnosis}
5. Chẩn đoán sau mổ: ${template.postOpDiagnosis}

6. Quan sát bệnh lý (Findings):
${template.findings}

7. Mô tả chi tiết quá trình phẫu thuật:
${template.description}
`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateReportText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = generateReportText();
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        alert('Không thể sao chép. Vui lòng thử lại.');
      }
      document.body.removeChild(textArea);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Logic to highlight interactive notes in text
  const renderInteractiveDescription = (text: string, notes: InteractiveNote[]) => {
    if (!text) return '...';
    if (!notes || notes.length === 0) return text;

    // Filter empty keywords and sort by length descending to match longest phrases first
    const validNotes = notes.filter(n => n.keyword && n.keyword.trim() !== '');
    const sortedNotes = [...validNotes].sort((a, b) => b.keyword.length - a.keyword.length);
    
    if (sortedNotes.length === 0) return text;

    // Escape regex chars
    const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(${sortedNotes.map(n => escapeRegExp(n.keyword)).join('|')})`, 'gi');
    
    const parts = text.split(pattern);

    return (
      <>
        {parts.map((part, index) => {
          const matchingNote = sortedNotes.find(n => n.keyword.toLowerCase() === part.toLowerCase());
          if (matchingNote) {
            const isActive = activeImage?.keyword === matchingNote.keyword;
            return (
              <span
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage({ url: matchingNote.imageUrl, keyword: matchingNote.keyword });
                }}
                className={`font-semibold cursor-pointer border-b px-1 rounded transition-all duration-200 ${
                  isActive 
                  ? 'bg-blue-600 text-white border-blue-600 print:bg-transparent print:text-black' 
                  : 'text-blue-600 border-blue-400 border-dashed hover:bg-blue-50 print:bg-transparent print:text-black print:border-none'
                }`}
                title="Click để xem hình ảnh minh họa"
              >
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-6xl max-h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isEditingPreview ? 'Xem trước Mẫu' : 'Hoàn thiện Tường trình'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Sao chép văn bản. Các liên kết in đậm có thể được click để xem ảnh.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-100/50 relative">
          
          {/* Main Paper Content */}
          <div className={`flex-1 overflow-auto p-6 md:p-10 transition-all duration-300 ${activeImage ? 'md:pr-10' : ''}`}>
            <div className="bg-white max-w-3xl mx-auto shadow-sm border border-slate-200 rounded-lg p-8 md:p-12 print-content" onClick={() => setActiveImage(null)}>
              <div className="text-center mb-8 border-b pb-6 border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900 uppercase">Tường trình phẫu thuật</h1>
                <p className="text-slate-500 mt-2">Bệnh viện / Phòng khám SurgiDoc</p>
              </div>

              <div className="space-y-6 text-slate-800 leading-relaxed font-serif text-[15px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Tên phẫu thuật</span>
                    <span className="font-medium text-lg">{template.procedureName || '...'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Phẫu thuật viên</span>
                    <span className="font-medium">{template.surgeon || '...'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Chẩn đoán trước mổ</span>
                    <span>{template.preOpDiagnosis || '...'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Chẩn đoán sau mổ</span>
                    <span>{template.postOpDiagnosis || '...'}</span>
                  </div>
                </div>

                {(template.icd10) && (
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Mã ICD-10</span>
                    <span>{template.icd10}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100">
                  <span className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Quan sát bệnh lý (Findings)</span>
                  <p className="whitespace-pre-wrap">{template.findings || '...'}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 relative">
                  <span className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Mô tả chi tiết quá trình phẫu thuật</span>
                  
                  <div className="whitespace-pre-wrap text-justify leading-loose">
                    {renderInteractiveDescription(template.description || '', template.interactiveNotes || [])}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Side Panel / Popup for Images */}
          {activeImage && (
             <div className="fixed md:static inset-0 z-50 md:z-auto bg-slate-900/80 md:bg-slate-900 md:w-1/3 md:min-w-[320px] lg:min-w-[400px] flex flex-col animate-in slide-in-from-right-4 md:fade-in duration-300 border-l border-slate-700">
                <div className="p-4 flex items-center justify-between text-white border-b border-slate-800 bg-slate-900/50 backdrop-blur shrink-0 md:pt-4 pt-16">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-sm">Hình ảnh minh họa</span>
                  </div>
                  <button 
                    onClick={() => setActiveImage(null)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4 shrink-0 bg-slate-800/50 border-b border-slate-800">
                  <div className="flex items-start gap-2 text-slate-300 text-sm">
                     <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
                     <p className="italic">"{activeImage.keyword}"</p>
                  </div>
                </div>

                <div className="flex-1 p-4 flex items-center justify-center overflow-hidden bg-black/20">
                   <img 
                     src={activeImage.url} 
                     alt={activeImage.keyword}
                     className="max-w-full max-h-full object-contain rounded drop-shadow-2xl"
                     referrerPolicy="no-referrer"
                   />
                </div>
             </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-white shrink-0 flex flex-col sm:flex-row justify-end items-center gap-3">
          <button 
            onClick={handlePrint}
            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Printer className="w-5 h-5" />
            <span>In báo cáo</span>
          </button>
          
          <button 
            onClick={handleCopy}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
              copied 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
              : 'bg-blue-600 hover:bg-blue-700 justify-center text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                <span>Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Sao chép vào bộ nhớ tạm</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
