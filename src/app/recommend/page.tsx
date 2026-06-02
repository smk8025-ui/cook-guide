"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RECIPES, getRecommendedRecipes, MatchResult } from "@/lib/recipes";

type ViewMode = "recommend" | "all";

export default function RecommendPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [hasIngredients, setHasIngredients] = useState(false);

  const loadRecommendations = async () => {
    try {
      const res = await fetch("/api/ingredients");
      if (res.ok) {
        const data = await res.json();
        const userIngs = data.ingredients || [];
        setHasIngredients(userIngs.length > 0);
        const results = getRecommendedRecipes(userIngs);
        setMatchResults(results);
        // 재료가 있으면 추천순, 없으면 전체 목록
        setViewMode(userIngs.length > 0 ? "recommend" : "all");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleAddShoppingList = async (e: React.MouseEvent, missingIngs: string[]) => {
    e.preventDefault();
    e.stopPropagation();

    if (missingIngs.length === 0) {
      triggerToast("부족한 재료가 없습니다!");
      return;
    }

    try {
      const res = await fetch("/api/shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: missingIngs }),
      });

      if (res.ok) {
        triggerToast("🛒 부족한 재료가 장보기 목록에 추가되었습니다.");
      } else {
        triggerToast("장보기 목록 저장에 실패했습니다.");
      }
    } catch (err) {
      triggerToast("통신 오류가 발생했습니다.");
    }
  };

  const difficultyColor = (d: string) => {
    if (d === "쉬움") return "bg-brand-success/15 text-brand-success dark:bg-brand-success/20";
    if (d === "중간") return "bg-brand-warning/15 text-brand-warning dark:bg-brand-warning/20";
    return "bg-brand-danger/15 text-brand-danger dark:bg-brand-danger/20";
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-gray-50 dark:bg-zinc-900 pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-brand-gray-100 dark:border-zinc-800 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center text-brand-gray-500 hover:text-brand-primary hover:bg-brand-gray-100 dark:text-brand-gray-300 dark:hover:bg-zinc-800 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-lg font-black text-brand-gray-900 dark:text-zinc-100">전체 메뉴</h1>
        </div>
        <Link href="/" className="text-sm font-semibold text-brand-primary dark:text-brand-primary-light hover:underline">
          홈으로
        </Link>
      </header>

      {/* VIEW MODE TABS */}
      <div className="flex border-b border-brand-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4">
        <button
          onClick={() => setViewMode("all")}
          className={`flex-1 py-3.5 text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1 ${
            viewMode === "all"
              ? "border-b-2 border-brand-primary text-brand-primary dark:text-brand-primary-light"
              : "text-brand-gray-500 dark:text-brand-gray-400 hover:text-brand-primary"
          }`}
        >
          📋 전체 목록
          <span className="text-[10px] font-black bg-brand-gray-100 dark:bg-zinc-800 text-brand-gray-500 dark:text-brand-gray-400 px-1.5 py-0.5 rounded-full ml-1">
            {RECIPES.length}
          </span>
        </button>
        <button
          onClick={() => setViewMode("recommend")}
          className={`flex-1 py-3.5 text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1 ${
            viewMode === "recommend"
              ? "border-b-2 border-brand-primary text-brand-primary dark:text-brand-primary-light"
              : "text-brand-gray-500 dark:text-brand-gray-400 hover:text-brand-primary"
          }`}
        >
          ✨ 재료 매칭
          {hasIngredients && (
            <span className="text-[10px] font-black bg-brand-success/20 text-brand-success px-1.5 py-0.5 rounded-full ml-1">
              추천순
            </span>
          )}
        </button>
      </div>

      {/* BODY CONTENT */}
      <main className="p-4 space-y-4 flex-1">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <svg className="animate-spin h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xs text-brand-gray-500 animate-pulse">메뉴를 불러오는 중...</p>
          </div>
        ) : (
          <>
            {/* ======================== ALL VIEW ======================== */}
            {viewMode === "all" && (
              <div className="space-y-3">
                {RECIPES.map((recipe) => (
                  <Link
                    key={recipe.id}
                    href={`/recipe/${recipe.id}`}
                    className="flex items-center gap-4 bg-white dark:bg-zinc-800 p-3 rounded-2xl border border-brand-gray-100 dark:border-zinc-700/50 shadow-sm hover:border-brand-primary/30 transition-all duration-200 active-press group"
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
                      {recipe.tag && (
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary-light">
                          {recipe.tag}
                        </span>
                      )}
                      <h4 className="font-bold text-base text-brand-gray-900 dark:text-zinc-100 mt-0.5 truncate">
                        {recipe.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-brand-gray-500 dark:text-brand-gray-400 mt-1">
                        <span>⏱ {recipe.duration}분</span>
                        <span className="w-1 h-1 rounded-full bg-brand-gray-300 dark:bg-zinc-700" />
                        <span className={`px-1.5 py-0.5 rounded-md font-bold text-[10px] ${difficultyColor(recipe.difficulty)}`}>
                          {recipe.difficulty}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-brand-gray-300 dark:bg-zinc-700" />
                        <span>{recipe.servings}</span>
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
            )}

            {/* ======================== RECOMMEND VIEW ======================== */}
            {viewMode === "recommend" && (
              <>
                {!hasIngredients ? (
                  <div className="text-center py-16 bg-white dark:bg-zinc-800 border border-brand-gray-100 dark:border-zinc-700 rounded-3xl p-6">
                    <p className="text-4xl mb-3">🛒</p>
                    <p className="text-sm font-bold text-brand-gray-700 dark:text-zinc-200">냉장고 재료를 먼저 입력해주세요!</p>
                    <p className="text-xs text-brand-gray-400 mt-1">재료를 입력하면 만들 수 있는 메뉴를 추천해드려요.</p>
                    <button
                      onClick={() => router.push("/search")}
                      className="mt-4 bg-brand-primary text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm"
                    >
                      재료 입력하러 가기
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur border border-brand-gray-100 dark:border-zinc-700/50 rounded-2xl p-4">
                      <h2 className="text-sm font-extrabold text-brand-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <span>✨</span> AI 매칭 완료
                      </h2>
                      <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400 mt-1">
                        입력한 재료로 만들 수 있는 요리예요! 매칭률이 높은 순으로 정렬되었습니다.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {matchResults.map((result) => {
                        const { recipe, matchRate, missingIngredients, ownedIngredients } = result;

                        let badgeColor = "bg-brand-gray-100 text-brand-gray-600 dark:bg-zinc-800 dark:text-brand-gray-300";
                        if (matchRate >= 80) {
                          badgeColor = "bg-brand-success/15 text-brand-success dark:bg-brand-success/20";
                        } else if (matchRate >= 40) {
                          badgeColor = "bg-brand-warning/15 text-brand-warning dark:bg-brand-warning/20";
                        }

                        return (
                          <Link
                            key={recipe.id}
                            href={`/recipe/${recipe.id}`}
                            className="flex flex-col bg-white dark:bg-zinc-800 rounded-3xl border border-brand-gray-100 dark:border-zinc-700/50 shadow-sm overflow-hidden hover:border-brand-primary/20 transition-all duration-200 active-press"
                          >
                            <div className="flex gap-4 p-4">
                              {/* Recipe Image */}
                              <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-brand-gray-100 dark:bg-zinc-700">
                                <Image
                                  src={recipe.image}
                                  alt={recipe.name}
                                  fill
                                  sizes="96px"
                                  className="object-cover"
                                />
                              </div>

                              {/* Metadata */}
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between gap-2">
                                    <h3 className="font-extrabold text-base text-brand-gray-900 dark:text-zinc-100 truncate">
                                      {recipe.name}
                                    </h3>
                                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full shrink-0 ${badgeColor}`}>
                                      {matchRate}% 매치
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-brand-gray-500 dark:text-brand-gray-400 mt-1">
                                    <span>⏱ {recipe.duration}분</span>
                                    <span className="w-1 h-1 rounded-full bg-brand-gray-300 dark:bg-zinc-700" />
                                    <span className={`px-1.5 py-0.5 rounded-md font-bold text-[10px] ${difficultyColor(recipe.difficulty)}`}>
                                      {recipe.difficulty}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-[11px] text-brand-gray-400 dark:text-brand-gray-500 truncate mt-1">
                                  보유: {ownedIngredients.length > 0 ? ownedIngredients.join(", ") : "없음"}
                                </div>
                              </div>
                            </div>

                            {/* Missing ingredients & Quick Shopping list action */}
                            <div className="bg-brand-gray-50 dark:bg-zinc-900/50 px-4 py-3 border-t border-brand-gray-100 dark:border-zinc-700/30 flex items-center justify-between text-xs gap-3">
                              <div className="min-w-0">
                                {missingIngredients.length > 0 ? (
                                  <p className="truncate text-brand-danger/90 dark:text-brand-danger font-semibold">
                                    부족한 재료: {missingIngredients.join(", ")}
                                  </p>
                                ) : (
                                  <p className="text-brand-success font-semibold">
                                    🎉 재료 완벽 보유! 즉시 조리 가능
                                  </p>
                                )}
                              </div>
                              {missingIngredients.length > 0 && (
                                <button
                                  onClick={(e) => handleAddShoppingList(e, missingIngredients)}
                                  className="flex items-center gap-1 bg-white dark:bg-zinc-800 border border-brand-gray-200 dark:border-zinc-700 hover:border-brand-primary dark:hover:border-brand-primary/50 text-brand-gray-700 dark:text-zinc-200 px-3 py-1.5 rounded-xl font-bold transition-all duration-200 shrink-0 shadow-sm active-press focus:outline-none"
                                >
                                  <span className="text-sm">🛒</span>
                                  <span>장보기 추가</span>
                                </button>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* TOAST PANEL */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-brand-gray-900/90 backdrop-blur text-white text-sm font-semibold py-3 px-6 rounded-2xl shadow-xl flex items-center gap-2 border border-white/10 animate-slide-in">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
