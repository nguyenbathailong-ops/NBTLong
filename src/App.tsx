import React, { useState, useEffect } from 'react';
import { Activity, LayoutDashboard, FileText, Settings as SettingsIcon, Menu, X, Plus, LogIn, LogOut, User as UserIcon, Loader2 } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { Dashboard } from './components/Dashboard';
import { TemplateLibrary } from './components/TemplateLibrary';
import { TemplateEditor } from './components/TemplateEditor';
import { Settings } from './components/Settings';
import { ReportPreview } from './components/ReportPreview';
import { SurgicalTemplate } from './types';
import { auth, db, logout, handleFirestoreError, loginWithEmail, registerWithEmail, updateUserDisplayName } from './lib/firebase';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [regCode, setRegCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'editor' | 'settings'>('dashboard');
  const [templates, setTemplates] = useState<SurgicalTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<SurgicalTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<SurgicalTemplate | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);
    
    // We append a virtual domain to treat the username as an email for Firebase
    const virtualEmail = `${username.trim().toLowerCase()}@surgidoc.id`;
    
    try {
      if (authMode === 'register') {
        if (!displayName.trim()) throw new Error('Vui lòng nhập tên của bạn');
        if (regCode !== '612313') throw new Error('Mã đăng ký không chính xác');
        await registerWithEmail(virtualEmail, password);
        await updateUserDisplayName(displayName);
      } else {
        await loginWithEmail(virtualEmail, password);
      }
    } catch (error: any) {
      let msg = error.message || 'Đã có lỗi xảy ra';
      if (error.code === 'auth/user-not-found') msg = 'Không tìm thấy tài khoản này';
      else if (error.code === 'auth/wrong-password') msg = 'Mật khẩu không chính xác';
      else if (error.code === 'auth/email-already-in-use') msg = 'Tên đăng nhập này đã tồn tại';
      else if (error.code === 'auth/weak-password') msg = 'Mật khẩu cần tối thiểu 6 ký tự';
      else if (error.code === 'auth/invalid-email') msg = 'Tên đăng nhập không hợp lệ';
      setAuthError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sync Templates from Firestore
  useEffect(() => {
    if (!user) {
      setTemplates([]);
      return;
    }

    const q = query(
      collection(db, 'templates'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const templatesData: SurgicalTemplate[] = [];
      snapshot.forEach((doc) => {
        templatesData.push(doc.data() as SurgicalTemplate);
      });
      setTemplates(templatesData);
    }, (error) => {
      console.error("Firestore sync error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveTemplate = async (template: SurgicalTemplate) => {
    if (!user) return;
    
    try {
      const templateData = {
        ...template,
        userId: user.uid,
        createdAt: template.createdAt || Date.now(), // Fallback if missing
      };

      const docRef = doc(db, 'templates', template.id);
      await setDoc(docRef, templateData, { merge: true });
      
      setActiveTab('library');
      setEditingTemplate(null);
    } catch (error) {
      handleFirestoreError(error, 'write', `templates/${template.id}`);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!user) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa mẫu này không?')) {
      try {
        await deleteDoc(doc(db, 'templates', id));
      } catch (error) {
        handleFirestoreError(error, 'delete', `templates/${id}`);
      }
    }
  };

  const handleUseTemplate = async (template: SurgicalTemplate) => {
    if (!user) return;
    try {
      const updated = { ...template, lastUsed: Date.now() };
      await updateDoc(doc(db, 'templates', template.id), { lastUsed: updated.lastUsed });
      setPreviewTemplate(updated);
    } catch (error) {
      handleFirestoreError(error, 'update', `templates/${template.id}`);
    }
  };

  const closePreview = () => setPreviewTemplate(null);

  if (authLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium tracking-tight">Đang tải cấu hình...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-4 overflow-y-auto">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-10 my-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
              <Activity className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SurgiDoc Sync</h1>
            <p className="text-slate-500 text-sm mt-1">Đăng nhập để quản lý tường trình</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'register' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tên của bạn</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="VD: BS. Nguyễn Văn A"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                  required
                />
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tên đăng nhập (Số hoặc chữ)</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="VD: bacsi123"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mật khẩu</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                required
              />
            </div>

            {authMode === 'register' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest ml-1">Mã đăng ký bắt buộc</label>
                <input 
                  type="text" 
                  value={regCode}
                  onChange={(e) => setRegCode(e.target.value)}
                  placeholder="Nhập mã 6 chữ số"
                  className="w-full px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-bold tracking-widest text-center"
                  required
                />
              </div>
            )}

            {authError && (
              <div className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
                {authError}
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (authMode === 'login' ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}
              className="text-slate-500 hover:text-blue-600 font-medium text-sm transition-colors"
            >
              {authMode === 'login' ? 'Bạn chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Quay về đăng nhập'}
            </button>
          </div>
          
          <p className="text-[9px] text-slate-400 mt-10 text-center uppercase tracking-[0.2em] font-bold">SurgiDoc Professional System</p>
        </div>
      </div>
    );
  }

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
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
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
          <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-9 h-9 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 uppercase">
                  {user.displayName?.substring(0, 2) || 'BS'}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="font-medium text-slate-900 truncate">{user.displayName || 'Bác sĩ'}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
