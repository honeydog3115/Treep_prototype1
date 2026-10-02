import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateVoucherCode } from '../utils/geo';
import { ShoppingBag, Ticket, Check, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SHOP_ITEMS = [
  {
    id: 'cu_1000',
    category: 'convenience',
    brand: 'CU 편의점',
    name: 'CU 모바일 금액권 1,000원',
    price: 1000,
    bgColor: 'bg-purple-600',
    badgeColor: 'bg-purple-100 text-purple-700',
    description: '전국 CU 편의점에서 사용 가능한 1,000원 모바일 쿠폰',
  },
  {
    id: 'cu_3000',
    category: 'convenience',
    brand: 'CU 편의점',
    name: 'CU 모바일 금액권 3,000원',
    price: 3000,
    bgColor: 'bg-purple-600',
    badgeColor: 'bg-purple-100 text-purple-700',
    description: '전국 CU 편의점에서 사용 가능한 3,000원 모바일 쿠폰',
  },
  {
    id: 'gs25_1000',
    category: 'convenience',
    brand: 'GS25',
    name: 'GS25 모바일 금액권 1,000원',
    price: 1000,
    bgColor: 'bg-sky-600',
    badgeColor: 'bg-sky-100 text-sky-700',
    description: '전국 GS25 편의점에서 사용 가능한 1,000원 상품권',
  },
  {
    id: 'gs25_5000',
    category: 'convenience',
    brand: 'GS25',
    name: 'GS25 모바일 금액권 5,000원',
    price: 5000,
    bgColor: 'bg-sky-600',
    badgeColor: 'bg-sky-100 text-sky-700',
    description: '전국 GS25 편의점에서 사용 가능한 5,000원 상품권',
  },
  {
    id: 'seven_2000',
    category: 'convenience',
    brand: '세븐일레븐',
    name: '세븐일레븐 금액권 2,000원',
    price: 2000,
    bgColor: 'bg-emerald-600',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    description: '전국 세븐일레븐 매장에서 자유롭게 사용 가능',
  },
  {
    id: 'google_5000',
    category: 'giftcard',
    brand: 'Google Play',
    name: '구글 기프트카드 5,000원권',
    price: 5000,
    bgColor: 'bg-red-500',
    badgeColor: 'bg-red-100 text-red-700',
    description: 'Google Play 스토어에서 앱, 게임 구매 시 사용',
  },
  {
    id: 'google_10000',
    category: 'giftcard',
    brand: 'Google Play',
    name: '구글 기프트카드 10,000원권',
    price: 10000,
    bgColor: 'bg-red-500',
    badgeColor: 'bg-red-100 text-red-700',
    description: 'Google Play 스토어에서 사용 가능한 10,000원 코드',
  },
];

export default function ShopTab() {
  const { userStats, deductPoints, addCoupon } = useApp();
  const [filter, setFilter] = useState('all'); // 'all' | 'convenience' | 'giftcard'
  const [purchaseSuccessItem, setPurchaseSuccessItem] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const filteredItems = SHOP_ITEMS.filter(
    (item) => filter === 'all' || item.category === filter
  );

  const handleBuy = (item) => {
    setErrorMessage('');
    if (userStats.points < item.price) {
      setErrorMessage(`포인트가 부족합니다. (필요: ${item.price} P, 보유: ${userStats.points} P)`);
      return;
    }

    const success = deductPoints(item.price);
    if (success) {
      const code = generateVoucherCode();
      const newCoupon = {
        id: 'coupon_' + Date.now(),
        brand: item.brand,
        name: item.name,
        code: code,
        price: item.price,
        purchasedAt: new Intl.DateTimeFormat('ko-KR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date()),
        isUsed: false,
      };

      addCoupon(newCoupon);
      setPurchaseSuccessItem({ ...item, code });

      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-wider uppercase bg-white/20 px-3 py-1 rounded-full text-amber-100">
            Points Shop
          </span>
          <h2 className="text-2xl font-black mt-1">에코 포인트 상점 & 환전</h2>
          <p className="text-amber-100 text-sm mt-0.5">
            자전거로 모은 포인트로 편의점 모바일 쿠폰 및 구글 기프트카드를 교환하세요!
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-center shrink-0">
          <div className="text-xs text-amber-100 font-medium">내 보유 포인트</div>
          <div className="text-3xl font-black text-amber-200">{userStats.points.toLocaleString()} P</div>
        </div>
      </div>

      {/* Error / Success Toast */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-500 hover:text-rose-800 text-xs font-bold">
            닫기
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          전체 상품
        </button>
        <button
          onClick={() => setFilter('convenience')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
            filter === 'convenience'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          🏪 편의점 쿠폰
        </button>
        <button
          onClick={() => setFilter('giftcard')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
            filter === 'giftcard'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          🎮 구글 기프트카드
        </button>
      </div>

      {/* Product List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Card Header Color Header */}
              <div className={`${item.bgColor} p-5 text-white flex justify-between items-start`}>
                <span className="font-extrabold text-lg tracking-wide">{item.brand}</span>
                <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full uppercase">
                  {item.category === 'convenience' ? '편의점' : '기프트카드'}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-bold text-slate-800 text-base">{item.name}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{item.description}</p>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-slate-50 mt-2 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">교환 가격</span>
                <span className="text-lg font-black text-amber-600">{item.price.toLocaleString()} P</span>
              </div>
              <button
                onClick={() => handleBuy(item)}
                disabled={userStats.points < item.price}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                  userStats.points >= item.price
                    ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {userStats.points >= item.price ? '포인트로 구매' : '포인트 부족'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Successful Purchase Modal */}
      {purchaseSuccessItem && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-6 text-center space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">쿠폰 교환 완료!</h3>
              <p className="text-xs text-slate-500 mt-1">
                구매하신 모바일 쿠폰이 [내 쿠폰함]에 발급되었습니다.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">상품명:</span>
                <span className="font-bold text-slate-800">{purchaseSuccessItem.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">발급 바코드/코드:</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {purchaseSuccessItem.code}
                </span>
              </div>
            </div>

            <button
              onClick={() => setPurchaseSuccessItem(null)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
