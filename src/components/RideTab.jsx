import React, { useState, useEffect } from 'react';
import { useApp, DEFAULT_PRESETS } from '../context/AppContext';
import MapView from '../components/MapView';
import { getDistanceInMeters, formatDistance, calculateEcoImpact } from '../utils/geo';
import { Play, Square, MapPin, Flag, Compass, Zap, CheckCircle2, AlertCircle, RefreshCw, Navigation } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RideTab() {
  const {
    userLocation,
    setUserLocation,
    isSimulated,
    setIsSimulated,
    departure,
    setDeparture,
    arrival,
    setArrival,
    rideStatus,
    setRideStatus,
    activeSession,
    setActiveSession,
    addRideHistoryItem,
    updateStats,
  } = useApp();

  const [selectionMode, setSelectionMode] = useState(null); // 'departure' | 'arrival' | null
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completedRideData, setCompletedRideData] = useState(null);

  // Distances in meters
  const distUserToDeparture = getDistanceInMeters(
    userLocation.lat,
    userLocation.lng,
    departure.lat,
    departure.lng
  );

  const distUserToArrival = getDistanceInMeters(
    userLocation.lat,
    userLocation.lng,
    arrival.lat,
    arrival.lng
  );

  const totalTripDistanceMeters = getDistanceInMeters(
    departure.lat,
    departure.lng,
    arrival.lat,
    arrival.lng
  );

  const totalTripDistanceKm = totalTripDistanceMeters / 1000;
  const estimatedImpact = calculateEcoImpact(totalTripDistanceKm);

  // Active ride timer
  useEffect(() => {
    let timer;
    if (rideStatus === 'RIDING') {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [rideStatus]);

  // Threshold distance to allow start/stop: 300 meters (or simulator)
  const START_THRESHOLD_METERS = 300;
  const ARRIVAL_THRESHOLD_METERS = 300;

  const isAtDeparture = distUserToDeparture <= START_THRESHOLD_METERS;
  const isAtArrival = distUserToArrival <= ARRIVAL_THRESHOLD_METERS;

  // Map Click Handler for selecting locations
  const handleMapClick = (latlng) => {
    if (selectionMode === 'departure') {
      setDeparture({
        id: 'custom_dep',
        name: `지정한 출발지 (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`,
        lat: latlng.lat,
        lng: latlng.lng,
      });
      setSelectionMode(null);
    } else if (selectionMode === 'arrival') {
      setArrival({
        id: 'custom_arr',
        name: `지정한 도착지 (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`,
        lat: latlng.lat,
        lng: latlng.lng,
      });
      setSelectionMode(null);
    }
  };

  // Start Riding
  const handleStartRide = () => {
    setRideStatus('RIDING');
    setActiveSession({
      startTime: new Date().toISOString(),
      departureName: departure.name,
      arrivalName: arrival.name,
      departureCoords: { lat: departure.lat, lng: departure.lng },
      arrivalCoords: { lat: arrival.lat, lng: arrival.lng },
    });
  };

  // Stop / Finish Riding
  const handleFinishRide = () => {
    const endTime = new Date();
    const startTime = activeSession ? new Date(activeSession.startTime) : new Date();
    const durationSec = Math.max(1, Math.round((endTime - startTime) / 1000));

    const finalDistanceMeters = totalTripDistanceMeters;
    const finalDistanceKm = finalDistanceMeters / 1000;
    const impact = calculateEcoImpact(finalDistanceKm);

    const rideData = {
      id: 'ride_' + Date.now(),
      date: new Intl.DateTimeFormat('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(endTime),
      departureName: departure.name,
      arrivalName: arrival.name,
      distanceMeters: finalDistanceMeters,
      co2Grams: impact.co2Gram,
      earnedPoints: impact.points,
      durationSec: durationSec,
    };

    // Update global context & storage
    updateStats(finalDistanceMeters, impact.co2Gram, impact.points);
    addRideHistoryItem(rideData);

    setRideStatus('COMPLETED');
    setCompletedRideData(rideData);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.log(e);
    }
  };

  // Reset to plan new ride
  const handleNewRide = () => {
    setRideStatus('IDLE');
    setActiveSession(null);
    setCompletedRideData(null);
  };

  // Simulation controls helper
  const teleportToDeparture = () => {
    setIsSimulated(true);
    setUserLocation({ lat: departure.lat, lng: departure.lng });
  };

  const teleportToArrival = () => {
    setIsSimulated(true);
    setUserLocation({ lat: arrival.lat, lng: arrival.lng });
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Ride Status */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-emerald-600 uppercase bg-emerald-50 px-3 py-1 rounded-full">
            Eco Bicycle Tracker
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 mt-1">
            {rideStatus === 'RIDING' ? '🚲 자전거 라이딩 진행 중' : rideStatus === 'COMPLETED' ? '🎉 라이딩 완료 및 포인트 적립' : '🗺️ 자전거 출발/도착 설정'}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            자전거로 이동하여 내뿜지 않는 탄소만큼 포인트를 차곡차곡 쌓아보세요!
          </p>
        </div>

        {/* Live Status Indicator */}
        {rideStatus === 'RIDING' && (
          <div className="flex items-center gap-3 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-md animate-pulse">
            <Zap className="w-6 h-6 fill-white" />
            <div>
              <div className="text-xs opacity-90">주행 시간</div>
              <div className="text-2xl font-black tracking-wider">{formatTimer(elapsedSeconds)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Map Component */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
        <MapView
          userLocation={userLocation}
          departure={departure}
          arrival={arrival}
          onMapClick={handleMapClick}
          selectionMode={selectionMode}
        />
      </div>

      {/* Simulator Tools Bar (For Testing Ease) */}
      <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-white">테스트용 위치 이동 시뮬레이터</span>
          <span className="text-slate-400 text-xs hidden sm:inline">(클릭 시 현재 위치를 즉시 이동)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={teleportToDeparture}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5" /> 출발지로 위치 이동
          </button>
          <button
            onClick={teleportToArrival}
            className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 shadow-sm"
          >
            <Flag className="w-3.5 h-3.5" /> 도착지로 위치 이동
          </button>
        </div>
      </div>

      {/* Ride Controls & Info Cards */}
      {rideStatus === 'IDLE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Departure & Arrival Selectors */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-600" /> 경로 설정
            </h3>

            {/* Departure Choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                <span>출발점</span>
                <span className="text-emerald-600 font-semibold">{formatDistance(distUserToDeparture)} 남음</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={departure.id || ''}
                  onChange={(e) => {
                    const found = DEFAULT_PRESETS.find((p) => p.id === e.target.value);
                    if (found) setDeparture(found);
                  }}
                  className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {DEFAULT_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                  <option value="custom_dep" disabled>직접 선택된 위치</option>
                </select>
                <button
                  onClick={() => setSelectionMode(selectionMode === 'departure' ? null : 'departure')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                    selectionMode === 'departure'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                  }`}
                >
                  지도 지정
                </button>
              </div>
            </div>

            {/* Arrival Choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                <span>도착점</span>
                <span className="text-rose-600 font-semibold">{formatDistance(distUserToArrival)} 남음</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={arrival.id || ''}
                  onChange={(e) => {
                    const found = DEFAULT_PRESETS.find((p) => p.id === e.target.value);
                    if (found) setArrival(found);
                  }}
                  className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {DEFAULT_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                  <option value="custom_arr" disabled>직접 선택된 위치</option>
                </select>
                <button
                  onClick={() => setSelectionMode(selectionMode === 'arrival' ? null : 'arrival')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                    selectionMode === 'arrival'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                  }`}
                >
                  지도 지정
                </button>
              </div>
            </div>

            {/* Distance Summary */}
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">예상 경로 총 거리:</span>
              <span className="font-extrabold text-slate-800 text-base">{formatDistance(totalTripDistanceMeters)}</span>
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">🌱 예상 탄소 절감 효과</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 text-center">
                  <div className="text-xs text-emerald-700 font-medium">탄소 절감량</div>
                  <div className="text-xl font-black text-emerald-800">{estimatedImpact.co2Gram}g CO₂</div>
                </div>
                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-100 text-center">
                  <div className="text-xs text-amber-700 font-medium">적립 예상 포인트</div>
                  <div className="text-xl font-black text-amber-800">+{estimatedImpact.points} P</div>
                </div>
              </div>

              {/* Proximity Warning / Info */}
              <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                isAtDeparture ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'bg-slate-100 text-slate-600'
              }`}>
                {isAtDeparture ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>출발지 근처에 위치해 있습니다! [라이딩 시작] 버튼을 눌러 출발하세요.</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                      현재 출발지와의 거리: <strong>{formatDistance(distUserToDeparture)}</strong>.<br />
                      출발지 근처({START_THRESHOLD_METERS}m 이내)에 도착해야 라이딩 시작 버튼이 활성화됩니다. 상단의 시뮬레이터로 위치를 이동해보세요.
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* START RIDE BUTTON */}
            <button
              disabled={!isAtDeparture}
              onClick={handleStartRide}
              className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-lg transition duration-200 ${
                isAtDeparture
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              자전거 라이딩 시작하기
            </button>
          </div>
        </div>
      )}

      {/* RIDING IN PROGRESS VIEW */}
      {rideStatus === 'RIDING' && (
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/20 pb-4">
            <div>
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-bold">라이딩 주행 중</span>
              <h3 className="text-2xl font-black mt-1">목적지를 향해 자전거로 이동하세요!</h3>
            </div>
            <div className="text-right">
              <div className="text-xs text-emerald-100">도착지까지 잔여 거리</div>
              <div className="text-3xl font-black text-amber-300">{formatDistance(distUserToArrival)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="text-xs text-emerald-100">출발지</div>
              <div className="font-bold text-base truncate">{departure.name}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="text-xs text-emerald-100">도착지</div>
              <div className="font-bold text-base truncate">{arrival.name}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="text-xs text-emerald-100">예상 획득 포인트</div>
              <div className="font-bold text-base text-amber-300">+{estimatedImpact.points} P</div>
            </div>
          </div>

          <div className="pt-2">
            {!isAtArrival ? (
              <div className="bg-amber-400/20 border border-amber-300/30 p-4 rounded-xl text-xs md:text-sm text-amber-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-300 shrink-0" />
                  <span>도착지 근처({ARRIVAL_THRESHOLD_METERS}m 이내)에 올 경우 [종료 및 포인트 받기] 버튼이 활성화됩니다.</span>
                </div>
                <button
                  onClick={teleportToArrival}
                  className="bg-amber-300 text-slate-900 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-white transition whitespace-nowrap"
                >
                  도착지로 워프
                </button>
              </div>
            ) : (
              <div className="bg-emerald-400/20 border border-emerald-300/40 p-4 rounded-xl text-sm font-semibold text-emerald-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span>도착지 영역에 성공적으로 진입했습니다! 아래 버튼을 눌러 라이딩을 완료하세요.</span>
              </div>
            )}
          </div>

          {/* FINISH RIDE BUTTON */}
          <button
            disabled={!isAtArrival}
            onClick={handleFinishRide}
            className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-xl transition duration-200 ${
              isAtArrival
                ? 'bg-rose-500 hover:bg-rose-600 text-white cursor-pointer shadow-rose-900/30'
                : 'bg-white/20 text-white/50 cursor-not-allowed border border-white/10'
            }`}
          >
            <Square className="w-5 h-5 fill-current" />
            라이딩 종료 & 에코 포인트 받기
          </button>
        </div>
      )}

      {/* COMPLETED RIDE MODAL / SUMMARY */}
      {rideStatus === 'COMPLETED' && completedRideData && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-emerald-500 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
            🎉
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">라이딩을 완주했습니다!</h3>
            <p className="text-slate-500 text-sm mt-1">자동차 대신 자전거를 이용하여 지구를 보호하셨습니다.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <div>
              <div className="text-xs text-slate-500 font-medium">이동 거리</div>
              <div className="text-xl font-black text-slate-800 mt-0.5">{formatDistance(completedRideData.distanceMeters)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">탄소 절감량</div>
              <div className="text-xl font-black text-emerald-600 mt-0.5">{completedRideData.co2Grams}g CO₂</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-500 font-medium">획득 에코 포인트</div>
              <div className="text-2xl font-black text-amber-500 mt-0.5">+{completedRideData.earnedPoints} P</div>
            </div>
          </div>

          <button
            onClick={handleNewRide}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            새로운 라이딩 설정하기
          </button>
        </div>
      )}
    </div>
  );
}
