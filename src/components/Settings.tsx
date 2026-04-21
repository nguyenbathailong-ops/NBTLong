import React from 'react';
import { User, Bell, Shield, Database } from 'lucide-react';

export function Settings() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cài đặt</h1>
        <p className="text-slate-500 mt-1">Quản lý tài khoản và tùy chọn ứng dụng của bạn</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
        
        {/* Profile Section */}
        <section className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Hồ sơ Cán bộ Y tế</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Họ và tên</label>
              <input 
                type="text" 
                defaultValue="Bs. Nguyễn Văn A"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-slate-900"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Chuyên khoa</label>
              <input 
                type="text" 
                defaultValue="Ngoại Tổng Quát"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-slate-900"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Tên viện / Cơ sở y tế</label>
              <input 
                type="text" 
                defaultValue="Bệnh viện Đa khoa Tâm Anh"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-slate-900"
              />
            </div>
          </div>
          <div className="mt-6">
            <button className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-lg transition-colors text-sm">
              Cập nhật thông tin
            </button>
          </div>
        </section>

        {/* Data Management Section */}
        <section className="p-6 md:p-8">
           <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Quản lý Dữ liệu</h2>
          </div>

          <div className="space-y-4 max-w-2xl text-sm text-slate-600">
            <p>
              Tất cả các mẫu tường trình đang được đồng bộ hóa trực tuyến trên đám mây (Cloud Sync) để đảm bảo bạn có thể truy cập từ bất kỳ thiết bị nào.
            </p>
            
            <div className="flex flex-wrap gap-3 pt-2">
              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-lg transition-colors shadow-sm cursor-not-allowed opacity-50">
                Xuất dữ liệu (JSON)
              </button>
              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-lg transition-colors shadow-sm cursor-not-allowed opacity-50">
                Nhập dữ liệu
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
