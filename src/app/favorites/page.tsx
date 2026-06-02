"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RECIPES, Recipe } from "@/lib/recipes";

export default function FavoritesPage() {
  const router = useRouter();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState("");

  const loadFavorites = async () => {
    try {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        const ids = data.favorites || [];
        setFavoriteIds(ids);
        
        // Map to static recipe list
        const mapped = RECIPES.filter((r) => ids.includes(r.id));
        setFavoriteRecipes(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit mode
      setIsEditing(false);
      setSelectedIds([]);
    } else {
      setIsEditing(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    try {
      const res = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeIds: selectedIds }),
      });

      if (res.ok) {
        triggerToast(`🗑️ ${selectedIds.length}개의 레시피가 즐겨찾기에서 제거되었습니다.`);
        setIsEditing(false);
        setSelectedIds([]);
        loadFavorites();
      } else {
        triggerToast("삭제에 실패했습니다.");
      }
    } catch (err) {
      triggerToast("통신 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-gray-50 dark:bg-zinc-900 pb-24">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-brand-gray-100 dark:border-zinc-800 px-4 h-16 flex items-center justify-between">
        <h1 className="text-lg font-black text-brand-gray-900 dark:text-zinc-100">즐겨찾기</h1>
        {favoriteRecipes.length > 0 && (
          <button
            onClick={handleEditToggle}
            className={`text-sm font-semibold transition-colors focus:outline-none ${
              isEditing
                ? "text-brand-gray-500 hover:text-brand-gray-700"
                : "text-brand-primary dark:text-brand-primary-light hover:underline"
            }`}
          >
            {isEditing ? "완료" : "편집"}
          </button>
        )}
      </header>

      {/* BODY CONTENT */}
      <main className="p-4 space-y-4 flex-1">
        <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur border border-brand-gray-100 dark:border-zinc-700/50 rounded-2xl p-4">
          <h2 className="text-sm font-extrabold text-brand-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
            <span>❤️</span> 보관함
          </h2>
          <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400 mt-1">
            즐겨 드시는 음식 목록이에요! {isEditing && "삭제할 레시피를 선택해 주세요."}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <svg className="animate-spin h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xs text-brand-gray-500">불러오는 중...</p>
          </div>
        ) : favoriteRecipes.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-800 border border-brand-gray-100 dark:border-zinc-700 rounded-3xl p-6">
            <p className="text-sm text-brand-gray-400">즐겨찾기한 레시피가 없습니다.</p>
            <p className="text-xs text-brand-gray-500 mt-1">원하는 요리의 상세화면에서 하트 아이콘을 눌러 저장해보세요!</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 bg-brand-primary text-white font-bold text-xs px-4 py-2 rounded-xl"
            >
              레시피 찾으러 가기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteRecipes.map((recipe) => {
              const isSelected = selectedIds.includes(recipe.id);
              const cardContent = (
                <div className="flex gap-4 p-4 items-center">
                  {/* Checkbox (visible only in editing mode) */}
                  {isEditing && (
                    <div className="shrink-0 mr-1 animate-scale-in">
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? "bg-brand-danger border-brand-danger text-white"
                            : "border-brand-gray-300 bg-white dark:bg-zinc-800 dark:border-zinc-600"
                        }`}
                      >
                        {isSelected && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-brand-gray-100 dark:bg-zinc-700">
                    <Image
                      src={recipe.image}
                      alt={recipe.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-base text-brand-gray-900 dark:text-zinc-100 truncate">
                      {recipe.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-brand-gray-500 dark:text-brand-gray-400 mt-1">
                      <span>⏱ {recipe.duration}분</span>
                      <span className="w-1 h-1 rounded-full bg-brand-gray-300 dark:bg-zinc-700" />
                      <span>🍳 {recipe.difficulty}</span>
                    </div>
                  </div>
                </div>
              );

              if (isEditing) {
                return (
                  <button
                    key={recipe.id}
                    onClick={() => toggleSelect(recipe.id)}
                    className="w-full text-left bg-white dark:bg-zinc-800 rounded-3xl border border-brand-gray-100 dark:border-zinc-700/50 shadow-sm overflow-hidden active-press focus:outline-none"
                  >
                    {cardContent}
                  </button>
                );
              }

              return (
                <Link
                  key={recipe.id}
                  href={`/recipe/${recipe.id}`}
                  className="block bg-white dark:bg-zinc-800 rounded-3xl border border-brand-gray-100 dark:border-zinc-700/50 shadow-sm overflow-hidden hover:border-brand-primary/20 transition-all duration-200 active-press"
                >
                  {cardContent}
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* BULK DELETE ACTION FLOATING BAR */}
      {isEditing && selectedIds.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-40 mx-auto w-full max-w-[480px] p-4 bg-white/95 dark:bg-zinc-900/95 border-t border-brand-gray-100 dark:border-zinc-800 backdrop-blur-md animate-slide-in">
          <button
            onClick={handleBulkDelete}
            className="w-full h-12 bg-brand-danger text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-danger/25 active-press transition-colors focus:outline-none"
          >
            <span>🗑️</span>
            <span>{selectedIds.length}개 선택 삭제</span>
          </button>
        </div>
      )}

      {/* TOAST ALERTS */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-brand-gray-900/90 backdrop-blur text-white text-sm font-semibold py-3 px-6 rounded-2xl shadow-xl flex items-center gap-2 border border-white/10 animate-slide-in">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
