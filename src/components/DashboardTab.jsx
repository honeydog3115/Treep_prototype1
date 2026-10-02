import React from 'react';
import { useApp } from '../context/AppContext';
import { formatDistance } from '../utils/geo';
import { TreePine, Zap, Award, History, Bike, ChevronRight } from 'lucide-react';

export default function DashboardTab() {
  const { userStats, rideHistory } = useApp();

  const totalCo2Kg = (userStats.totalCo2SavedGrams / 1000).toFixed(2);
  const totalTrees = (userStats.totalCo2SavedGrams / 8800).toFixed(2); // 1 tree ~ 8.8kg/yr

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Points */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center opacity-80">
            <span className="text-xs font-bold uppercase tracking-wider">보유 포인트</span>
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div className="text-3xl font-black">{userStats.points.toLocaleString()} P</div>
          <div className="text-xs text-amber-100">편의점 쿠폰 및 기프트카드 교환 가능</div>
        </div>

        {/* CO2 Reduction */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center opacity-80">
            <span className="text-xs font-bold uppercase tracking-wider">총 탄소 절감량</span>
            <Award className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black">{totalCo2Kg} kg</div>
          <div className="text-xs text-emerald-100">자동차 대신 자전거 이용 효과</div>
        </div>

        {/* Total Distance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">누적 주행 거리</span>
            <Bike className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-800">
            {formatDistance(userStats.totalDistanceMeters)}
          </div>
          <div className="text-xs text-slate-400">총 {userStats.totalRides}회 라이딩 완료</div>
        </div>

        {/* Tree Equivalent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">나무 심기 효과</span>
            <TreePine className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">🌲 {totalTrees} 그루</div>
          <div className="text-xs text-slate-400">소나무를 심은 것과 동일한 효과</div>
        </div>
      </div>

      {/* Ride History */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" /> 최근 라이딩 주행 기록
          </h3>
          <span className="text-xs text-slate-400 font-medium">총 {rideHistory.length}건</span>
        </div>

        {rideHistory.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            아직 라이딩 기록이 없습니다. 자전거 타고 첫 라이딩을 시작해보세요!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rideHistory.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-400 font-medium">{item.date}</div>
                  <div className="font-bold text-slate-800 text-base mt-0.5">
                    {item.departureName} → {item.arrivalName}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs sm:text-sm">
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">이동 거리</span>
                    <span className="font-extrabold text-slate-700">{formatDistance(item.distanceMeters)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">탄소 절감</span>
                    <span className="font-extrabold text-emerald-600">{item.co2Grams}g CO₂</span>
                  </div>
                  <div className="text-right bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
                    <span className="text-amber-700 block text-[10px] font-bold">획득 포인트</span>
                    <span className="font-black text-amber-600">+{item.earnedPoints} P</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
