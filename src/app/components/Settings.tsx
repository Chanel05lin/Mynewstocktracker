import { ChevronRight, User, Bell, Palette, Shield, Info, LogOut } from 'lucide-react';

interface SettingsProps {
  onLogout?: () => void;
}

export function Settings({ onLogout }: SettingsProps = {}) {
  const userEmail = localStorage.getItem('userEmail') || '未登录';
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[#E2E8F0]">
        <h1 className="text-lg font-semibold text-[#1A3A5F]">设置</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#F7FAFC] p-4">
        {/* Account Info */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="p-4 border-b border-[#EDF2F7]">
            <h3 className="text-sm font-medium text-[#1A3A5F]">账户信息</h3>
          </div>
          <div className="divide-y divide-[#EDF2F7]">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-1">
                <User size={20} className="text-[#4A5568]" />
                <span className="text-[#4A5568] font-medium">个人资料</span>
              </div>
              <div className="pl-8 text-sm text-[#A0AEC0]">{userEmail}</div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="p-4 border-b border-[#EDF2F7]">
            <h3 className="text-sm font-medium text-[#1A3A5F]">通知设置</h3>
          </div>
          <div className="divide-y divide-[#EDF2F7]">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-[#4A5568]" />
                <span className="text-[#4A5568]">价格提醒</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4299E1]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-[#4A5568]" />
                <span className="text-[#4A5568]">交易确认</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4299E1]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="p-4 border-b border-[#EDF2F7]">
            <h3 className="text-sm font-medium text-[#1A3A5F]">显示设置</h3>
          </div>
          <div className="divide-y divide-[#EDF2F7]">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Palette size={20} className="text-[#4A5568]" />
                <span className="text-[#4A5568]">涨跌颜色偏好</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#A0AEC0]">绿涨红跌</span>
                <ChevronRight size={20} className="text-[#A0AEC0]" />
              </div>
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="p-4 border-b border-[#EDF2F7]">
            <h3 className="text-sm font-medium text-[#1A3A5F]">安全设置</h3>
          </div>
          <div className="divide-y divide-[#EDF2F7]">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-[#4A5568]" />
                <span className="text-[#4A5568]">修改密码</span>
              </div>
              <ChevronRight size={20} className="text-[#A0AEC0]" />
            </button>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-[#4A5568]" />
                <span className="text-[#4A5568]">面容ID / 指纹</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4299E1]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="p-4 border-b border-[#EDF2F7]">
            <h3 className="text-sm font-medium text-[#1A3A5F]">关于应用</h3>
          </div>
          <div className="divide-y divide-[#EDF2F7]">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Info size={20} className="text-[#4A5568]" />
                <span className="text-[#4A5568]">版本信息</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#A0AEC0]">v1.0.0</span>
                <ChevronRight size={20} className="text-[#A0AEC0]" />
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Info size={20} className="text-[#4A5568]" />
                <span className="text-[#4A5568]">用户协议</span>
              </div>
              <ChevronRight size={20} className="text-[#A0AEC0]" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <Info size={20} className="text-[#4A5568]" />
                <span className="text-[#4A5568]">隐私政策</span>
              </div>
              <ChevronRight size={20} className="text-[#A0AEC0]" />
            </button>
          </div>
        </div>

        {/* Logout */}
        {onLogout && (
          <button 
            onClick={onLogout}
            className="w-full bg-white rounded-lg shadow-sm p-4 flex items-center justify-center gap-2 text-[#E53E3E] hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">退出登录</span>
          </button>
        )}
      </div>
    </div>
  );
}
