/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';

const AuthProvider = () => {
  const [initData, setInitData] = useState<any>(null); // initData uchun state yaratamiz

  // URL query parametrlaridan initData ni olish uchun funksiya
  const getInitDataFromTelegram = () => {
    const urlParams = new URLSearchParams(window.location.search); // URL parametrlarini olish
    const initDataFromTelegram = urlParams.get('initData'); // 'initData' parametrini olish
    return initDataFromTelegram ? JSON.parse(initDataFromTelegram) : null; // Agar initData mavjud bo'lsa, uni JSON formatida qaytarish
  };

  useEffect(() => {
    const initDataFromTelegram = getInitDataFromTelegram(); // URL dan initData ni olish

    if (initDataFromTelegram) {
       // initData ni alertda ko'rsatish
      setInitData(initDataFromTelegram); // State'ga saqlash
    }
    alert(JSON.stringify(initDataFromTelegram, null, 2));
  }, []); // Bu faqat komponent birinchi marta ishlaganda ishga tushadi
  
  return (
    <div>
      {initData && (
        <div>
          <h2>Qabul qilingan InitData:</h2>
          <pre>{JSON.stringify(initData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default AuthProvider;
