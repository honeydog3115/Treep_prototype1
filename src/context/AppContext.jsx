import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const DEFAULT_PRESETS = [
  { id: 'hangang', name: '한강 공원 (여의도)', lat: 37.5283, lng: 126.9328 },
  { id: 'seoul_forest', name: '서울숲 공원', lat: 37.5443, lng: 127.0374 },
  { id: 'gangnam_st', name: '강남역', lat: 37.4979, lng: 127.0276 },
  { id: 'hongdae', name: '홍대입구역', lat: 37.5563, lng: 126.9237 },
  { id: 'city_hall', name: '서울시청', lat: 37.5665, lng: 126.9780 }
];

export function AppProvider({ children }) {
  // Current user real or simulated location [lat, lng]
  const [userLocation, setUserLocation] = useState({ lat: 37.5283, lng: 126.9328 }); // Default Yeouido
  const [isSimulated, setIsSimulated] = useState(false);

  // Selected departure and arrival points
  const [departure, setDeparture] = useState(DEFAULT_PRESETS[0]);
  const [arrival, setArrival] = useState(DEFAULT_PRESETS[1]);

  // Riding state: 'IDLE' | 'RIDING' | 'COMPLETED'
  const [rideStatus, setRideStatus] = useState('IDLE');
  const [activeSession, setActiveSession] = useState(null);

  // User eco stats and coupons stored in localStorage
  const [userStats, setUserStats] = useState(() => {
    const saved = localStorage.getItem('eco_user_stats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* use default */ }
    }
    return {
      points: 2500, // Starting bonus points for demo
      totalCo2SavedGrams: 0,
      totalDistanceMeters: 0,
      totalRides: 0,
    };
  });

  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('eco_coupons');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* use default */ }
    }
    return [];
  });

  const [rideHistory, setRideHistory] = useState(() => {
    const saved = localStorage.getItem('eco_ride_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* use default */ }
    }
    return [];
  });

  // Save to localStorage whenever state updates
  useEffect(() => {
    localStorage.setItem('eco_user_stats', JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    localStorage.setItem('eco_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('eco_ride_history', JSON.stringify(rideHistory));
  }, [rideHistory]);

  // Geolocation setup
  useEffect(() => {
    if (!isSimulated && 'geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation error or denied, using simulated location:', err.message);
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isSimulated]);

  const addRideHistoryItem = (item) => {
    setRideHistory((prev) => [item, ...prev]);
  };

  const addCoupon = (coupon) => {
    setCoupons((prev) => [coupon, ...prev]);
  };

  const updateStats = (distanceMeters, co2Grams, earnedPoints) => {
    setUserStats((prev) => ({ ...prev,
      points: prev.points + earnedPoints,
      totalCo2SavedGrams: prev.totalCo2SavedGrams + co2Grams,
      totalDistanceMeters: prev.totalDistanceMeters + distanceMeters,
      totalRides: prev.totalRides + 1,
    }));
  };

  const deductPoints = (amount) => {
    if (userStats.points >= amount) {
      setUserStats((prev) => ({ ...prev, points: prev.points - amount }));
      return true;
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
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
        userStats,
        coupons,
        rideHistory,
        addRideHistoryItem,
        addCoupon,
        updateStats,
        deductPoints,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
