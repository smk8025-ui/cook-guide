"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  const loadData = async () => {
    try {
      // Profile
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.user) {
          setUsername(meData.user.username);
          setNickname(meData.user.nickname || meData.user.username);
        }
      } else {
        router.push("/login?from=/mypage");
        return;
      }

      // Shopping list
      const listRes = await fetch("/api/shopping-list");
      if (listRes.ok) {
        const listData = await listRes.json();
        setShoppingList(listData.shoppingList || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {}
  };

  const handleDeleteItem = async (name: string) => {
    try {
      const res = await fetch(`/api/shopping-list?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        triggerToast(`🗑️ ${name} 삭제 완료`);
        loadData();
      }
    } catch (err) {}
  };

  const handleClearAll = async () => {
    try {
      const res = await fetch("/api/shopping-list?all=true", {
        method: "DELETE",
      });
      if (res.ok) {
        triggerToast("🗑️ 장보기 목록이 초기화되었습니다.");
        loadData();
      }
    } catch (err) {}
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-gray-50 dark:bg-zinc-900 pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-brand-gray-100 dark:border-zinc-800 px-4 h-16 flex items-center justify-between">
        <h1 className="text-lg font-black text-brand-gray-900 dark:text-zinc-100">마이페이지</h1>
      </header>

      {/* BODY CONTENT */}
      <main className="p-4 space-y-6 flex-1">
        {/* USER PROFILE INFO */}
        <div className="bg-white dark:bg-zinc-800 border border-brand-gray-100 dark:border-zinc-700/50 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-brand-primary to-brand-primary-light rounded-2xl flex items-center justify-center text-2xl text-white font-bold shadow-md shadow-brand-primary/20">
              👤
            </div>
            <div>
              <h3 className="font-extrabold text-base text-brand-gray-900 dark:text-zinc-100">
                {nickname || username || "사용자"}님
              </h3>
              <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400 mt-0.5">
                냉털쿡 자취생 요리 회원
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-brand-gray-100 hover:bg-brand-danger/10 hover:text-brand-danger dark:bg-zinc-900 dark:hover:bg-brand-danger/20 text-brand-gray-600 dark:text-brand-gray-300 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all duration-200 active-press focus:outline-none"
          >
            로그아웃
          </button>
        </div>

        {/* PERSISTENT SHOPPING LIST */}
        <div className="bg-white dark:bg-zinc-800 border border-brand-gray-100 dark:border-zinc-700/50 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-brand-gray-50 dark:border-zinc-700 pb-3">
            <h3 className="font-extrabold text-base text-brand-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>🛒</span> 나의 장보기 목록 <span className="text-brand-primary dark:text-brand-primary-light">({shoppingList.length})</span>
            </h3>
            {shoppingList.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs font-semibold text-brand-gray-400 hover:text-brand-danger transition-colors focus:outline-none"
              >
                전체비우기
              </button>
            )}
          </div>

          {loadingList ? (
            <div className="flex justify-center py-6">
              <svg className="animate-spin h-5 w-5 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : shoppingList.length === 0 ? (
            <div className="text-center py-8 text-brand-gray-400 text-sm space-y-2">
              <div>🛒</div>
              <p>장보기 목록이 비어있습니다.</p>
              <p className="text-xs text-brand-gray-500">추천 요리 목록에서 부족한 재료를 담아보세요.</p>
            </div>
          ) : (
            <div className="divide-y divide-brand-gray-50 dark:divide-zinc-700/50">
              {shoppingList.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <span className="text-sm font-semibold text-brand-gray-800 dark:text-zinc-200">
                    🛍️ {item}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://m.coupang.com/nm/search?q=${encodeURIComponent(item)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white dark:bg-brand-primary/20 dark:hover:bg-brand-primary-light dark:text-brand-primary-light dark:hover:text-zinc-950 font-extrabold text-[11px] px-2.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 active-press"
                    >
                      <span>🛒</span>
                      <span>구매하기</span>
                    </a>
                    
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="w-8 h-8 rounded-lg hover:bg-brand-danger/10 text-brand-gray-400 hover:text-brand-danger flex items-center justify-center focus:outline-none transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* TOAST ALERTS */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-brand-gray-900/90 backdrop-blur text-white text-sm font-semibold py-3 px-6 rounded-2xl shadow-xl flex items-center gap-2 border border-white/10 animate-slide-in">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
