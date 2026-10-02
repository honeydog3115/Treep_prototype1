import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import RideTab from './components/RideTab';
import ShopTab from './components/ShopTab';
import CouponsTab from './components/CouponsTab';
import DashboardTab from './components/DashboardTab';
import { Bike, MapPin, ShoppingBag, Ticket, LayoutDashboard, Leaf, Sparkles } from 'lucide-react';

function Navigation() {
  const { userStats, coupons } = useApp();
  const [activeTab, setActiveTab] = useState('ride'); // 'ride' | 'shop' | 'coupons' | 'dashboard'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-[1100] shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('ride')}>
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-emerald-200 font-bold text-xl">
              🚲
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">
                EcoRide <span className="text-emerald-600">Points</span>
              </h1>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mt-0.5">
                자전거 탄소 절감 포인트
              </span>
            </div>
          </div>

          {/* Point Counter Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('shop')}
              className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 px-3.5 py-1.5 rounded-full font-black text-sm flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{userStats.points.toLocaleString()} P</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto w-full px-4 py-6 flex-1">
        {activeTab === 'ride' && <RideTab />}
        {activeTab === 'shop' && <ShopTab />}
        {activeTab === 'coupons' && <CouponsTab />}
        {activeTab === 'dashboard' && <DashboardTab />}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="bg-white border-t border-slate-200 sticky bottom-0 z-[1100] shadow-lg">
        <div className="max-w-5xl mx-auto px-4 h-16 grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab('ride')}
            className={`flex flex-col items-center justify-center gap-1 font-bold text-xs transition cursor-pointer ${
              activeTab === 'ride' ? 'text-emerald-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span>라이딩</span>
          </button>

          <button
            onClick={() => setActiveTab('shop')}
            className={`flex flex-col items-center justify-center gap-1 font-bold text-xs transition cursor-pointer ${
              activeTab === 'shop' ? 'text-emerald-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>포인트 상점</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex flex-col items-center justify-center gap-1 font-bold text-xs transition cursor-pointer relative ${
              activeTab === 'coupons' ? 'text-emerald-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Ticket className="w-5 h-5" />
            <span>쿠폰함</span>
            {coupons.length > 0 && (
              <span className="absolute top-2 right-6 w-2 h-2 bg-purple-500 rounded-full animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center gap-1 font-bold text-xs transition cursor-pointer ${
              activeTab === 'dashboard' ? 'text-emerald-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>대시보드</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Navigation />
    </AppProvider>
  );
}
