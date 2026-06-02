"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RECIPES } from "@/lib/recipes";

interface UserProfile {
  id: string;
  username: string;
  nickname?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedIngredients, setScannedIngredients] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch profile
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setShowScanner(true);
      setScanning(true);
      setScannedIngredients([]);

      // Simulate AI Vision scanning
      setTimeout(() => {
        setScanning(false);
        // Pre-defined set of recognized ingredients for the mock
        setScannedIngredients(["계란", "양파", "김치", "두부", "대파"]);
      }, 2500);
    }
  };

  const addScannedIngredients = async () => {
    if (scannedIngredients.length === 0) return;

    try {
      const res = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: scannedIngredients }),
      });

      if (res.ok) {
        triggerToast("📸 인식된 재료가 냉장고에 추가되었습니다!");
        setShowScanner(false);
        setTimeout(() => {
          router.push("/search");
        }, 1000);
      } else {
        triggerToast("재료 저장에 실패했습니다.");
      }
    } catch (err) {
      triggerToast("통신 오류가 발생했습니다.");
    }
  };

  // 홈에서 모든 추천 메뉴 표시
  const todayRecommendations = RECIPES;

  return (
    <div className="flex flex-col min-h-screen bg-brand-gray-50 dark:bg-zinc-900 pb-20">
      {/* Hidden File Input for scanning */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-brand-gray-100 dark:border-zinc-800 px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-black text-brand-primary dark:text-brand-primary-light tracking-tight flex items-center gap-1.5">
          <span className="text-2xl">🍳</span> 냉털쿡
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("새로운 알림이 없습니다.")}
            className="w-10 h-10 rounded-full flex items-center justify-center text-brand-gray-500 hover:text-brand-primary hover:bg-brand-gray-100 dark:text-brand-gray-300 dark:hover:bg-zinc-800 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a9.04 9.04 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 4.5a8.969 8.969 0 00-2.168-4.5M12 5.25a6 6 0 00-6 6v3.582l-.707.707a1 1 0 00.707 1.707h11.986a1 1 0 00.707-1.707l-.707-.707V11.25a6 6 0 00-6-6z" />
            </svg>
          </button>
        </div>
      </header>

      {/* BODY CONTENT */}
      <main className="p-4 flex-1 space-y-6">
        {/* WELCOME BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary to-brand-primary-dark p-6 text-white shadow-xl shadow-brand-primary/20">
          <div className="relative z-10">
            <h2 className="text-xl font-bold">
              반가워요, <span className="underline decoration-wavy decoration-white/40">{user?.nickname || user?.username || "자취생"}</span>님!
            </h2>
            <p className="text-sm text-white/80 mt-1">
              오늘 냉장고에 어떤 재료가 숨어있나요?
            </p>
          </div>
          <div className="absolute right-2 -bottom-2 text-8xl opacity-10 pointer-events-none select-none font-bold">
            COOK
          </div>
        </div>

        {/* INPUT MODE CARDS */}
        <div className="grid grid-cols-1 gap-4">
          {/* text input link */}
          <Link
            href="/search"
            className="flex items-center gap-4 bg-white dark:bg-zinc-800 p-5 rounded-2xl border border-brand-gray-100 dark:border-zinc-700/50 shadow-sm active-press hover:border-brand-primary/40 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary-light flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
              🔍
            </div>
            <div>
              <h3 className="font-bold text-base text-brand-gray-900 dark:text-zinc-100">
                재료 입력하기
              </h3>
              <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400 mt-0.5">
                냉장고 속 재료로 맛있는 요리를 추천받아보세요!
              </p>
            </div>
          </Link>

          {/* photo input button */}
          <button
            onClick={handlePhotoClick}
            className="flex w-full items-center text-left gap-4 bg-white dark:bg-zinc-800 p-5 rounded-2xl border border-brand-gray-100 dark:border-zinc-700/50 shadow-sm active-press hover:border-brand-primary/40 transition-all duration-300 group focus:outline-none"
          >
            <div className="w-12 h-12 rounded-full bg-brand-success/10 text-brand-success flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform duration-300">
              📸
            </div>
            <div>
              <h3 className="font-bold text-base text-brand-gray-900 dark:text-zinc-100">
                사진으로 재료 찾기
              </h3>
              <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400 mt-0.5">
                사진을 찍으면 재료를 자동으로 인식해요!
              </p>
            </div>
          </button>
        </div>

        {/* TODAY RECOMMENDATIONS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-brand-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>📅</span> 오늘의 추천 메뉴
            </h3>
            <Link
              href="/recommend"
              className="text-xs font-semibold text-brand-primary dark:text-brand-primary-light hover:underline"
            >
              더보기 &gt;
            </Link>
          </div>

          <div className="space-y-4">
            {todayRecommendations.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipe/${recipe.id}`}
                className="flex items-center gap-4 bg-white dark:bg-zinc-800 p-3 rounded-2xl border border-brand-gray-100 dark:border-zinc-700/50 shadow-sm hover:border-brand-primary/20 transition-all duration-200 active-press group"
              >
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-brand-gray-100 dark:bg-zinc-700">
                  <Image
                    src={recipe.image}
                    alt={recipe.name}
                    fill
                    sizes="80px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary-light">
                    {recipe.tag}
                  </span>
                  <h4 className="font-bold text-base text-brand-gray-900 dark:text-zinc-100 mt-1 truncate">
                    {recipe.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-brand-gray-500 dark:text-brand-gray-400 mt-1">
                    <span>⏱ {recipe.duration}분</span>
                    <span className="w-1 h-1 rounded-full bg-brand-gray-300 dark:bg-zinc-700" />
                    <span>🍳 난이도: {recipe.difficulty}</span>
                  </div>
                </div>
                <div className="text-brand-gray-300 dark:text-zinc-700 pr-1 group-hover:text-brand-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* TOAST ALERTS */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-brand-gray-900/90 backdrop-blur text-white text-sm font-semibold py-3 px-6 rounded-2xl shadow-xl flex items-center gap-2 border border-white/10 animate-slide-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SIMULATED AI CAMERA SCANNER OVERLAY */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col justify-between p-6">
          <div className="flex items-center justify-between text-white">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="animate-pulse text-brand-success">●</span> AI 식재료 분석기
            </h3>
            <button
              onClick={() => setShowScanner(false)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active-press"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* SCAN CAMERA VIEWPORT */}
          <div className="relative my-8 aspect-[4/3] w-full max-w-md mx-auto rounded-3xl overflow-hidden border border-white/20 bg-zinc-950 flex items-center justify-center shadow-2xl">
            {/* LASER LINE */}
            {scanning && (
              <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-success to-transparent z-10 shadow-[0_0_15px_#10B981] animate-laser" />
            )}

            {/* MOCK REFRIGERATOR IMAGE AS BACKGROUND */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]" />
            
            <div className="text-center p-6 relative z-0">
              {scanning ? (
                <div className="space-y-4">
                  <div className="text-brand-success text-5xl animate-bounce">🤖</div>
                  <p className="text-sm font-semibold text-brand-gray-300 animate-pulse">
                    이미지를 분석하는 중...
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-brand-success text-5xl">✅</div>
                  <p className="text-sm font-bold text-white">
                    분석이 완료되었습니다!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* INGREDIENT LIST DETECTED */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 w-full max-w-md mx-auto space-y-4">
            <h4 className="text-xs font-bold text-brand-gray-400 uppercase tracking-wider">
              검출된 식재료 ({scannedIngredients.length})
            </h4>

            {scanning ? (
              <div className="flex gap-2 justify-center py-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-success animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2.5 h-2.5 rounded-full bg-brand-success animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2.5 h-2.5 rounded-full bg-brand-success animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {scannedIngredients.map((ing) => (
                  <span
                    key={ing}
                    className="inline-flex items-center gap-1 text-sm font-semibold bg-brand-success/20 text-brand-success border border-brand-success/30 px-3 py-1 rounded-full animate-scale-in"
                  >
                    🌿 {ing}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={addScannedIngredients}
              disabled={scanning || scannedIngredients.length === 0}
              className={`w-full h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg active-press transition-all duration-200 ${
                !scanning && scannedIngredients.length > 0
                  ? "bg-brand-success hover:brightness-110 shadow-brand-success/20 cursor-pointer"
                  : "bg-zinc-800 text-zinc-600 shadow-none cursor-not-allowed"
              }`}
            >
              냉장고에 담기
            </button>
          </div>
        </div>
      )}

      {/* Scanning laser and laser keyframes inside global style tags */}
      <style jsx global>{`
        @keyframes laser {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 100%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }
        .animate-laser {
          animation: laser 2s infinite linear;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
