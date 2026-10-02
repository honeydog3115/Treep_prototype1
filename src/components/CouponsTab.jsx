import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Ticket, Barcode, CheckCircle2, Clock, Copy, ExternalLink, QrCode } from 'lucide-react';

export default function CouponsTab() {
  const { coupons } = useApp();
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-purple-600 uppercase bg-purple-50 px-3 py-1 rounded-full">
            Coupon Wallet
          </span>
          <h2 className="text-2xl font-black text-slate-800 mt-1">🎟️ 내 모바일 쿠폰함</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            포인트로 환전한 모바일 금액권 및 기프트카드를 확인할 수 있습니다.
          </p>
        </div>
        <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-xs font-bold border border-purple-100 shrink-0">
          총 보관된 쿠폰: <span className="text-base font-black ml-1">{coupons.length}개</span>
        </div>
      </div>

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl">
            🎫
          </div>
          <h3 className="font-bold text-slate-700 text-lg">보유 중인 쿠폰이 없습니다</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            자전거를 타고 포인트를 쌓아 [포인트 상점]에서 편의점 쿠폰이나 구글 기프트카드로 교환해보세요!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-extrabold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
                      {coupon.brand}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base mt-1.5">{coupon.name}</h3>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {coupon.purchasedAt}
                  </span>
                </div>

                {/* Simulated Barcode Display */}
                <div className="my-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                    ||| | ||||| || |||| ||| |||||| ||| |
                  </div>
                  <div className="font-mono font-black text-lg text-slate-800 tracking-wider">
                    {coupon.code}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>바코드 코드 복사</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
