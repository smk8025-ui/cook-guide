"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { RECIPES, Recipe } from "@/lib/recipes";

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.id as string;
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  
  // Wake Lock states
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [wakeLockSentinel, setWakeLockSentinel] = useState<any>(null);

  useEffect(() => {
    const found = RECIPES.find((r) => r.id === recipeId);
    if (found) {
      setRecipe(found);
    } else {
      router.replace("/");
    }

    // Check favorite status
    fetch("/api/favorites")
      .then((res) => res.json())
      .then((data) => {
        const ids = data.favorites || [];
        setIsFavorited(ids.includes(recipeId));
      })
      .catch(() => {});

    // Clean up wake lock on unmount
    return () => {
      if (wakeLockSentinel) {
        wakeLockSentinel.release();
      }
    };
  }, [recipeId, router]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const toggleFavorite = async () => {
    try {
      const method = isFavorited ? "DELETE" : "POST";
      const res = await fetch("/api/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });

      if (res.ok) {
        setIsFavorited(!isFavorited);
        triggerToast(
          isFavorited
            ? "💔 즐겨찾기 해제되었습니다."
            : "💖 즐겨찾기 저장되었습니다."
        );
      }
    } catch (err) {}
  };

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((x) => x !== index) : [...prev, index]
    );
  };

  // Screen Wake Lock API implementation
  const toggleWakeLock = async () => {
    if (!("wakeLock" in navigator)) {
      alert("이 브라우저에서는 '화면 켜짐 유지(Wake Lock)' 기능을 지원하지 않습니다.");
      return;
    }

    try {
      if (wakeLockActive) {
        if (wakeLockSentinel) {
          await wakeLockSentinel.release();
          setWakeLockSentinel(null);
        }
        setWakeLockActive(false);
        triggerToast("💡 화면 켜짐 유지가 비활성화되었습니다.");
      } else {
        const sentinel = await (navigator as any).wakeLock.request("screen");
        setWakeLockSentinel(sentinel);
        setWakeLockActive(true);
        triggerToast("💡 화면 켜짐 유지가 활성화되었습니다. (조리 중 화면 안 꺼짐)");
        
        sentinel.addEventListener("release", () => {
          setWakeLockActive(false);
        });
      }
    } catch (err) {
      console.error(err);
      alert("화면 켜짐 유지 활성화에 실패했습니다.");
    }
  };

  // Add all recipe ingredients to personal shopping list
  const handleAddAllIngredients = async () => {
    if (!recipe) return;
    const items = recipe.ingredients.map((i) => i.name);
    
    try {
      const res = await fetch("/api/shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: items }),
      });

      if (res.ok) {
        triggerToast("📋 레시피의 전체 재료가 장보기 목록에 담겼습니다!");
      }
    } catch (err) {}
  };

  if (!recipe) return null;

  return (
    <div className="flex flex-col min-h-screen bg-brand-gray-50 dark:bg-zinc-900 pb-28">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-brand-gray-100 dark:border-zinc-800 px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center text-brand-gray-500 hover:text-brand-primary hover:bg-brand-gray-100 dark:text-brand-gray-300 dark:hover:bg-zinc-800 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="text-sm font-extrabold text-brand-gray-900 dark:text-zinc-100">레시피 상세</span>
        
        {/* FAVORITE TOGGLE HEART */}
        <button
          onClick={toggleFavorite}
          className="w-10 h-10 rounded-full flex items-center justify-center text-brand-gray-500 hover:bg-brand-gray-100 dark:text-brand-gray-300 dark:hover:bg-zinc-800 transition-all duration-200 active-press focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isFavorited ? "#EF4444" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke={isFavorited ? "#EF4444" : "currentColor"}
            className="w-6 h-6 transition-all duration-300 transform active:scale-125"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </header>

      {/* PHOTO & HERO SPEC */}
      <div className="relative w-full aspect-[16/10] bg-zinc-200 dark:bg-zinc-800">
        <Image
          src={recipe.image}
          alt={recipe.name}
          fill
          priority
          sizes="480px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h2 className="text-2xl font-black">{recipe.name}</h2>
          
          {/* SPEC BADGES */}
          <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-white/90">
            <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">⏱ {recipe.duration}분</span>
            <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">👥 {recipe.servings}</span>
            <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">🍳 {recipe.difficulty}</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="p-4 space-y-6">
        
        {/* WAKE LOCK TOGGLE SWITCH */}
        <div className="bg-white dark:bg-zinc-800 border border-brand-gray-100 dark:border-zinc-700/50 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className={`text-2xl transition-all duration-300 ${wakeLockActive ? "animate-pulse scale-110 drop-shadow-[0_0_8px_#FBBF24]" : "opacity-60"}`}>
              💡
            </span>
            <div>
              <h4 className="text-sm font-extrabold text-brand-gray-900 dark:text-zinc-100">요리할 때 화면 켜짐 유지</h4>
              <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400 mt-0.5">조리 중 화면이 꺼지지 않게 보호합니다.</p>
            </div>
          </div>
          <button
            onClick={toggleWakeLock}
            className={`w-12 h-6.5 rounded-full p-1 transition-all duration-300 focus:outline-none flex items-center ${
              wakeLockActive ? "bg-brand-primary justify-end" : "bg-brand-gray-300 dark:bg-zinc-700 justify-start"
            }`}
          >
            <span className="w-4.5 h-4.5 rounded-full bg-white shadow-md block transition-transform duration-300" />
          </button>
        </div>

        {/* INGREDIENTS SECTION */}
        <div className="bg-white dark:bg-zinc-800 border border-brand-gray-100 dark:border-zinc-700/50 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-brand-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
            <span>🌿</span> 필요한 재료
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {recipe.ingredients.map((ing) => (
              <div
                key={ing.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-brand-gray-50 dark:bg-zinc-900/40 border border-brand-gray-100/50 dark:border-zinc-700/30"
              >
                <span className="text-sm font-semibold text-brand-gray-800 dark:text-zinc-200">{ing.name}</span>
                <span className="text-xs text-brand-gray-500 dark:text-brand-gray-400 font-bold">{ing.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STEPS SECTION */}
        <div className="bg-white dark:bg-zinc-800 border border-brand-gray-100 dark:border-zinc-700/50 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-brand-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
            <span>👩‍🍳</span> 조리 가이드 순서
          </h3>
          
          <div className="space-y-4">
            {recipe.steps.map((step, idx) => {
              const isDone = completedSteps.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => toggleStep(idx)}
                  className="w-full text-left flex gap-3.5 items-start p-3 rounded-2xl transition-all duration-200 focus:outline-none border border-transparent"
                >
                  {/* Step Checker Checkbox */}
                  <div className="shrink-0 mt-0.5">
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                        isDone
                          ? "bg-brand-success border-brand-success text-white"
                          : "border-brand-gray-300 bg-white dark:bg-zinc-800 dark:border-zinc-600"
                      }`}
                    >
                      {isDone && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Step Description */}
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-wider block">
                      STEP {idx + 1}
                    </span>
                    <p className={`text-sm mt-0.5 leading-relaxed font-semibold transition-all duration-200 ${
                      isDone
                        ? "text-brand-gray-400 line-through decoration-brand-gray-300 dark:text-zinc-600"
                        : "text-brand-gray-800 dark:text-zinc-200"
                    }`}>
                      {step}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* FLOAT BOTTOM ACTIONS */}
      <div className="fixed bottom-16 left-0 right-0 z-40 mx-auto w-full max-w-[480px] p-4 bg-gradient-to-t from-brand-gray-50 via-brand-gray-50/95 to-transparent dark:from-zinc-900 dark:via-zinc-900/95 border-t border-brand-gray-100/50 dark:border-zinc-800/50 backdrop-blur-md">
        <div className="flex gap-3">
          <button
            onClick={handleAddAllIngredients}
            className="flex-1 h-12 bg-white dark:bg-zinc-800 hover:border-brand-primary/40 text-brand-gray-800 dark:text-zinc-100 border border-brand-gray-300 dark:border-zinc-700 rounded-xl font-extrabold flex items-center justify-center gap-1.5 shadow-sm active-press focus:outline-none"
          >
            <span>📋</span>
            <span>재료 추가</span>
          </button>
          
          <a
            href="https://m.coupang.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-12 bg-gradient-to-r from-brand-primary to-brand-primary-dark hover:brightness-110 text-white rounded-xl font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-brand-primary/20 active-press text-sm"
          >
            <span>🛍️</span>
            <span>재료 구매</span>
          </a>
        </div>
      </div>

      {/* TOAST ALERTS */}
      {toastMessage && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 bg-brand-gray-900/90 backdrop-blur text-white text-sm font-semibold py-3 px-6 rounded-2xl shadow-xl flex items-center gap-2 border border-white/10 animate-slide-in">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
