import React, { useState, useEffect } from 'react';
import { Activity, LayoutDashboard, FileText, Settings as SettingsIcon, Menu, X, Plus } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { TemplateLibrary } from './components/TemplateLibrary';
import { TemplateEditor } from './components/TemplateEditor';
import { Settings } from './components/Settings';
import { ReportPreview } from './components/ReportPreview';
import { SurgicalTemplate } from './types';

// Default templates updated with interactive notes
const defaultTemplates: SurgicalTemplate[] = [
  {
    id: '1',
    procedureName: 'Cắt ruột thừa nội soi',
    surgeon: '[Tên Phẫu thuật viên]',
    icd10: 'K35.80',
    preOpDiagnosis: 'Viêm ruột thừa cấp',
    postOpDiagnosis: 'Viêm ruột thừa cấp',
    findings: 'Ruột thừa viêm sung huyết, chưa vỡ, không có áp xe xung quanh.',
    description: 'Bệnh nhân nằm ngửa, gây mê nội khí quản. Sát trùng vùng mổ. Vào bụng 3 trocar (rốn, hố chậu trái, hạ vị).\n\nQuan sát thấy ruột thừa viêm đỏ. Tiến hành cầm máu mạc treo ruột thừa bằng dao điện/clip.\n\nCắt gốc ruột thừa bằng stapler/endo-loop. Lấy bệnh phẩm qua trocar rốn. Kiểm tra cầm máu kỹ, lau sạch hố chậu phải. Đóng các lỗ trocar.',
    interactiveNotes: [
       { id: 'in1', keyword: 'Cắt gốc ruột thừa', imageUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=800' }
    ],
    createdAt: Date.now(),
    lastUsed: Date.now() - 100000,
  },
  {
    id: '2',
    procedureName: 'Cắt túi mật nội soi',
    surgeon: '[Tên Phẫu thuật viên]',
    icd10: 'K80.20',
    preOpDiagnosis: 'Sỏi túi mật có triệu chứng',
    postOpDiagnosis: 'Sỏi túi mật, viêm túi mật mạn',
    findings: 'Túi mật viêm mạn, thành dày, chứa nhiều sỏi, đường mật chính bình thường.',
    description: 'Bệnh nhân nằm ngửa, gây mê nội khí quản. Vào bụng 4 trocar theo kỹ chuẩn. Bộc lộ tam giác Calot.\n\nPhẫu tích bộc lộ rõ ống túi mật và động mạch túi mật. Kẹp clip ống túi mật và động mạch túi mật, cắt rời.\n\nPhẫu tích bóc tách túi mật khỏi giường gan bằng dao điện. Cầm máu giường gan. Lấy túi mật qua trocar rốn. Kiểm tra cầm máu kỹ. Đóng các lỗ trocar.',
    interactiveNotes: [
       { id: 'in2', keyword: 'tam giác Calot', imageUrl: 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?auto=format&fit=crop&q=80&w=800' },
       { id: 'in3', keyword: 'bóc tách túi mật khỏi giường gan', imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800' }
    ],
    createdAt: Date.now() - 500000,
    lastUsed: Date.now() - 200000,
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'editor' | 'settings'>('dashboard');
  const [templates, setTemplates] = useState<SurgicalTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<SurgicalTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<SurgicalTemplate | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load from LocalStorage and Handle Data Migration
  useEffect(() => {
    const saved = localStorage.getItem('surgicalTemplates');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        
        if (!Array.isArray(parsedData)) {
          setTemplates(defaultTemplates);
          return;
        }

        // Data Migration: Convert old steps format back to description + interactive notes
        const migratedTemplates = parsedData.map((t: any) => {
           let newT = { ...t };
           if (t.steps && t.steps.length > 0) {
              newT.description = t.steps.map((s: any) => s.content).join('\n\n');
              
              const convertedNotes = t.steps
                 .filter((s: any) => s.imageUrl && s.imageUrl.trim() !== '')
                 .map((s: any) => ({
                    id: s.id,
                    keyword: s.content.substring(0, 40), // Use first 40 chars as keyword fallback
                    imageUrl: s.imageUrl
                 }));
                 
              newT.interactiveNotes = convertedNotes;
              delete newT.steps;
           }
           if(!newT.interactiveNotes) newT.interactiveNotes = [];
           return newT;
        });
        
        setTemplates(migratedTemplates);
      } catch (e) {
        setTemplates(defaultTemplates);
      }
    } else {
      setTemplates(defaultTemplates);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (templates.length > 0) {
      localStorage.setItem('surgicalTemplates', JSON.stringify(templates));
    }
  }, [templates]);

  const handleSaveTemplate = (template: SurgicalTemplate) => {
    if (templates.find(t => t.id === template.id)) {
      setTemplates(templates.map(t => t.id === template.id ? template : t));
    } else {
      setTemplates([template, ...templates]);
    }
    setActiveTab('library');
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mẫu này không?')) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleUseTemplate = (template: SurgicalTemplate) => {
    // Update last used
    const updated = { ...template, lastUsed: Date.now() };
    setTemplates(templates.map(t => t.id === template.id ? updated : t));
    setPreviewTemplate(updated);
  };

  const closePreview = () => setPreviewTemplate(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          templates={templates} 
          onUseTemplate={handleUseTemplate} 
          onCreateNew={() => { setEditingTemplate(null); setActiveTab('editor'); }} 
        />;
      case 'library':
        return <TemplateLibrary 
          templates={templates} 
          onEdit={(t) => { setEditingTemplate(t); setActiveTab('editor'); }}
          onDelete={handleDeleteTemplate}
          onUse={handleUseTemplate}
          onCreateNew={() => { setEditingTemplate(null); setActiveTab('editor'); }}
        />;
      case 'editor':
        return <TemplateEditor 
          template={editingTemplate} 
          onSave={handleSaveTemplate} 
          onCancel={() => { setEditingTemplate(null); setActiveTab('library'); }}
        />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard templates={templates} onUseTemplate={handleUseTemplate} onCreateNew={() => { setEditingTemplate(null); setActiveTab('editor'); }} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
    { id: 'library', label: 'Thư viện mẫu', icon: FileText },
    { id: 'settings', label: 'Cài đặt', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 bg-blue-600 md:bg-white text-white md:text-blue-600 shrink-0">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6" />
            <span className="font-semibold text-lg tracking-tight">SurgiDoc</span>
          </div>
          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 shrink-0">
           <button 
             onClick={() => { setEditingTemplate(null); setActiveTab('editor'); setIsMobileMenuOpen(false); }}
             className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
           >
             <Plus className="w-5 h-5" />
             <span>Tạo mẫu mới</span>
           </button>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (activeTab === 'editor' && item.id === 'library');
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="shrink-0 p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
              BS
            </div>
            <div>
              <p className="font-medium text-slate-900">Bác sĩ Lâm sàng</p>
              <p className="text-xs text-slate-500">Ngoại Tổng Quát</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-blue-600 text-white flex items-center px-4 border-b border-blue-700 shrink-0 shadow-sm z-30">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 -ml-1 rounded-md hover:bg-blue-700">
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-3 font-semibold text-lg flex items-center gap-2">
             <Activity className="w-5 h-5" /> SurgiDoc
          </span>
        </header>

        <div className="flex-1 overflow-auto bg-slate-50 relative">
          <div className="max-w-7xl mx-auto w-full h-full">
             {renderContent()}
          </div>
        </div>
      </main>

      {/* Report Preview Modal */}
      {previewTemplate && (
        <ReportPreview template={previewTemplate} onClose={closePreview} />
      )}
    </div>
  );
}
