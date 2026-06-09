"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { RECIPES } from "@/lib/recipes";

const POPULAR_TAGS = ["계란", "양파", "당근", "김치", "두부", "감자", "대파", "돼지고기", "된장", "애호박"];

// Common ingredients database for autocomplete
const ALL_INGREDIENTS = [
  "계란", "양파", "당근", "김치", "두부", "감자", "대파", "돼지고기", "된장", "애호박",
  "간장", "소금", "깨", "고춧가루", "마늘", "고추장", "설탕", "쪽파", "참기름", "식용유",
  "라면", "치즈", "우유", "버터", "참치캔", "스팸", "베이컨", "닭고기", "소고기", "오뎅",
  "마요네즈", "식빵", "밀가루", "소시지", "스팸", "밥"
];

type SearchTab = "ingredient" | "menu";

export default function SearchPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SearchTab>("menu");
  
  // Ingredient search state
  const [ingredientQuery, setIngredientQuery] = useState("");
  const [autocomplete, setAutocomplete] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Menu search state
  const [menuQuery, setMenuQuery] = useState("");
  const [menuResults, setMenuResults] = useState(RECIPES);
  
  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Load ingredients & recent searches
  const loadData = async () => {
    try {
      const ingRes = await fetch("/api/ingredients");
      if (ingRes.ok) {
        const data = await ingRes.json();
        setIngredients(data.ingredients || []);
      }

      const searchRes = await fetch("/api/recent-search");
      if (searchRes.ok) {
        const data = await searchRes.json();
        setRecentSearches(data.recentSearches || []);
      }
    } catch (err) {}
  };

  useEffect(() => {
    loadData();

    // Initialize Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "ko-KR";
        rec.onstart = () => setIsListening(true);
        rec.onend = () => setIsListening(false);
        rec.onresult = (event: any) => {
          const resultText = event.results[0][0].transcript;
          const cleanedText = resultText.replace(/\./g, "").trim();
          if (cleanedText) {
            if (activeTab === "ingredient") {
              handleIngredientSubmit(cleanedText);
            } else {
              setMenuQuery(cleanedText);
            }
          }
        };
        rec.onerror = () => {
          setIsListening(false);
          alert("음성 인식에 실패했습니다. 마이크 권한을 확인해주세요.");
        };
        setRecognition(rec);
      }
    }
  }, []);

  // Filter ingredient autocomplete
  useEffect(() => {
    if (!ingredientQuery.trim()) {
      setAutocomplete([]);
      return;
    }
    const filtered = ALL_INGREDIENTS.filter(
      (item) =>
        item.toLowerCase().includes(ingredientQuery.toLowerCase()) &&
        !ingredients.includes(item)
    );
    setAutocomplete(filtered.slice(0, 5));
  }, [ingredientQuery, ingredients]);

  // Filter menu search results
  useEffect(() => {
    if (!menuQuery.trim()) {
      setMenuResults(RECIPES);
      return;
    }
    const q = menuQuery.trim().toLowerCase();
    const filtered = RECIPES.filter(
      (r) =>
        r.name.includes(menuQuery.trim()) ||
        r.name.toLowerCase().includes(q) ||
        r.matchIngredients.some((ing) => ing.includes(menuQuery.trim())) ||
        (r.tag && r.tag.includes(menuQuery.trim()))
    );
    setMenuResults(filtered);
  }, [menuQuery]);

  const toggleListening = () => {
    if (!recognition) {
      alert("이 브라우저에서는 음성 인식을 지원하지 않습니다. Chrome 혹은 Edge 브라우저를 사용해주세요.");
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const handleIngredientSubmit = async (itemName: string) => {
    if (!itemName.trim()) return;
    const name = itemName.trim();

    try {
      const ingRes = await fetch("/api/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (ingRes.ok) {
        await fetch("/api/recent-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: name }),
        });
        setIngredientQuery("");
        loadData();
      }
    } catch (err) {}
  };

  const handleIngredientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleIngredientSubmit(ingredientQuery);
  };

  const deleteIngredient = async (name: string) => {
    try {
      const res = await fetch(`/api/ingredients?name=${encodeURIComponent(name)}`, { method: "DELETE" });
      if (res.ok) {
        setIngredients((prev) => prev.filter((i) => i !== name));
      } else {
        const data = await res.json().catch(() => ({}));
        console.error("Delete ingredient failed:", res.status, data);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllIngredients = async () => {
    try {
      const res = await fetch("/api/ingredients?all=true", { method: "DELETE" });
      if (res.ok) {
        setIngredients([]);
      } else {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecommendClick = () => {
    if (ingredients.length === 0) return;
    router.push("/recommend");
  };

  const difficultyColor = (d: string) => {
    if (d === "쉬움") return "bg-brand-success/15 text-brand-success";
    if (d === "중간") return "bg-brand-warning/15 text-brand-warning";
    return "bg-brand-danger/15 text-brand-danger";
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-gray-50 dark:bg-zinc-900 pb-32">
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
          <h1 className="text-lg font-black text-brand-gray-900 dark:text-zinc-100">검색</h1>
        </div>
        <Link href="/" className="text-sm font-semibold text-brand-primary dark:text-brand-primary-light hover:underline">
          완료
        </Link>
      </header>

      {/* TAB SELECTOR */}
      <div className="flex border-b border-brand-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4">
        <button
          onClick={() => setActiveTab("ingredient")}
          className={`flex-1 py-3.5 text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === "ingredient"
              ? "border-b-2 border-brand-primary text-brand-primary dark:text-brand-primary-light"
              : "text-brand-gray-500 dark:text-brand-gray-400 hover:text-brand-primary"
          }`}
        >
          🥬 재료 검색
        </button>
        <button
          onClick={() => setActiveTab("menu")}
          className={`flex-1 py-3.5 text-sm font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            activeTab === "menu"
              ? "border-b-2 border-brand-primary text-brand-primary dark:text-brand-primary-light"
              : "text-brand-gray-500 dark:text-brand-gray-400 hover:text-brand-primary"
          }`}
        >
          🍽️ 메뉴 검색
        </button>
      </div>

      {/* BODY CONTENT */}
      <main className="p-4 space-y-6 flex-1">

        {/* ======================== INGREDIENT TAB ======================== */}
        {activeTab === "ingredient" && (
          <>
            {/* SEARCH BOX & MIC */}
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="재료를 검색해 주세요"
                    value={ingredientQuery}
                    onChange={(e) => setIngredientQuery(e.target.value)}
                    onKeyDown={handleIngredientKeyDown}
                    className="w-full h-12 pl-11 pr-4 rounded-2xl border border-brand-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-brand-gray-900 dark:text-zinc-50 placeholder-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all duration-200 shadow-sm"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-400 text-lg">🔍</span>
                </div>

                {/* MIC BUTTON */}
                <button
                  onClick={toggleListening}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-200 active-press shrink-0 border focus:outline-none ${
                    isListening
                      ? "bg-brand-danger text-white border-brand-danger animate-pulse shadow-brand-danger/20"
                      : "bg-white dark:bg-zinc-800 text-brand-gray-500 dark:text-brand-gray-300 border-brand-gray-300 dark:border-zinc-700 hover:text-brand-primary"
                  }`}
                  title={isListening ? "듣는 중... 말하고 멈추세요" : "음성으로 검색"}
                >
                  <span className="text-xl">🎙️</span>
                </button>
              </div>

              {/* AUTOCOMPLETE DROPDOWN */}
              {autocomplete.length > 0 && (
                <ul className="absolute top-14 left-0 right-0 z-50 bg-white dark:bg-zinc-800 border border-brand-gray-100 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden divide-y divide-brand-gray-50 dark:divide-zinc-700/50">
                  {autocomplete.map((item) => (
                    <li key={item}>
                      <button
                        onClick={() => handleIngredientSubmit(item)}
                        className="w-full h-11 px-4 text-left text-sm font-semibold text-brand-gray-700 dark:text-zinc-200 hover:bg-brand-primary/5 hover:text-brand-primary flex items-center justify-between"
                      >
                        <span>{item}</span>
                        <span className="text-xs text-brand-primary opacity-60">추가하기 +</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* RECENT SEARCHES */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-brand-gray-400 uppercase tracking-wider">최근 검색한 재료</h3>
                  <button
                    onClick={async () => {
                      const res = await fetch("/api/recent-search", { method: "DELETE" });
                      if (res.ok) {
                        setRecentSearches([]);
                      } else {
                        loadData();
                      }
                    }}
                    className="text-[11px] font-semibold text-brand-gray-400 hover:text-brand-danger"
                  >
                    기록 삭제
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => handleIngredientSubmit(search)}
                      className="text-xs font-medium bg-brand-gray-100 dark:bg-zinc-800 text-brand-gray-600 dark:text-brand-gray-300 px-3 py-1.5 rounded-full hover:bg-brand-primary/10 hover:text-brand-primary dark:hover:bg-brand-primary/20 dark:hover:text-brand-primary-light transition-colors active-press"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* POPULAR TAGS */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-brand-gray-400 uppercase tracking-wider">많이 찾는 인기 재료 tag</h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TAGS.map((tag) => {
                  const alreadyHas = ingredients.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleIngredientSubmit(tag)}
                      disabled={alreadyHas}
                      className={`text-xs font-bold px-4 py-2.5 rounded-full border transition-all duration-200 active-press focus:outline-none ${
                        alreadyHas
                          ? "bg-brand-gray-100 dark:bg-zinc-800/50 text-brand-gray-300 dark:text-zinc-600 border-transparent cursor-not-allowed"
                          : "bg-white dark:bg-zinc-800 text-brand-gray-700 dark:text-zinc-200 border-brand-gray-200 dark:border-zinc-700 hover:border-brand-primary hover:text-brand-primary"
                      }`}
                    >
                      {tag} {alreadyHas ? "✓" : "+"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MY INGREDIENT LIST */}
            <div className="bg-white dark:bg-zinc-800 border border-brand-gray-100 dark:border-zinc-700/50 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-brand-gray-50 dark:border-zinc-700 pb-3">
                <h3 className="font-extrabold text-base text-brand-gray-900 dark:text-zinc-100">
                  내가 입력한 재료 <span className="text-brand-primary dark:text-brand-primary-light">({ingredients.length})</span>
                </h3>
                {ingredients.length > 0 && (
                  <button
                    onClick={clearAllIngredients}
                    className="text-xs font-semibold text-brand-gray-400 hover:text-brand-danger transition-colors focus:outline-none"
                  >
                    전체삭제
                  </button>
                )}
              </div>

              {ingredients.length === 0 ? (
                <div className="text-center py-8 text-brand-gray-400 text-sm space-y-2">
                  <div>🛒</div>
                  <p>입력한 재료가 없습니다.</p>
                  <p className="text-xs text-brand-gray-500">인기 태그를 누르거나 검색해 추가해보세요.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="inline-flex items-center gap-1 bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary-light border border-brand-primary/20 px-3.5 py-1.5 rounded-xl text-sm font-semibold animate-scale-in"
                    >
                      {ing}
                      <button
                        onClick={() => deleteIngredient(ing)}
                        className="w-5 h-5 rounded-full hover:bg-brand-primary/10 text-brand-primary dark:hover:bg-brand-primary/30 flex items-center justify-center font-bold text-xs focus:outline-none transition-colors ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ======================== MENU TAB ======================== */}
        {activeTab === "menu" && (
          <>
            {/* MENU SEARCH BOX */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="메뉴 이름을 검색해 주세요"
                  value={menuQuery}
                  onChange={(e) => setMenuQuery(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-2xl border border-brand-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-brand-gray-900 dark:text-zinc-50 placeholder-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all duration-200 shadow-sm"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-400 text-lg">🍽️</span>
              </div>
              <button
                onClick={toggleListening}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-200 active-press shrink-0 border focus:outline-none ${
                  isListening
                    ? "bg-brand-danger text-white border-brand-danger animate-pulse"
                    : "bg-white dark:bg-zinc-800 text-brand-gray-500 dark:text-brand-gray-300 border-brand-gray-300 dark:border-zinc-700"
                }`}
              >
                <span className="text-xl">🎙️</span>
              </button>
            </div>

            {/* MENU COUNT */}
            <p className="text-xs text-brand-gray-400 dark:text-brand-gray-500">
              {menuResults.length}개의 메뉴
              {menuQuery && <span className="ml-1 text-brand-primary font-semibold">"{menuQuery}" 검색 결과</span>}
            </p>

            {/* MENU LIST */}
            {menuResults.length === 0 ? (
              <div className="text-center py-16 text-brand-gray-400 text-sm space-y-3">
                <div className="text-4xl">🤔</div>
                <p className="font-semibold">"{menuQuery}"에 해당하는 메뉴가 없어요.</p>
                <p className="text-xs text-brand-gray-500">다른 키워드로 검색해보세요.</p>
                <button
                  onClick={() => setMenuQuery("")}
                  className="mt-2 text-xs font-bold text-brand-primary border border-brand-primary/20 px-4 py-2 rounded-full"
                >
                  전체 메뉴 보기
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {menuResults.map((recipe) => (
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
          </>
        )}
      </main>

      {/* FLOAT BOTTOM BUTTON (재료 탭에서만) */}
      {activeTab === "ingredient" && (
        <div className="fixed bottom-16 left-0 right-0 z-40 mx-auto w-full max-w-[480px] p-4 bg-gradient-to-t from-brand-gray-50 via-brand-gray-50/95 to-transparent dark:from-zinc-900 dark:via-zinc-900/95">
          <button
            onClick={handleRecommendClick}
            disabled={ingredients.length === 0}
            className={`w-full h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg active-press transition-all duration-200 focus:outline-none ${
              ingredients.length > 0
                ? "bg-gradient-to-r from-brand-primary to-brand-primary-dark hover:brightness-110 shadow-brand-primary/20 cursor-pointer"
                : "bg-brand-gray-300 dark:bg-zinc-700 text-brand-gray-500 cursor-not-allowed shadow-none"
            }`}
          >
            {ingredients.length > 0 ? `레시피 추천받기 (${ingredients.length}개 재료)` : "재료를 먼저 추가해주세요"}
          </button>
        </div>
      )}

      {/* VOICE LISTEN OVERLAY */}
      {isListening && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white">
          <div className="relative w-28 h-28 flex items-center justify-center bg-brand-primary/10 border border-brand-primary/20 rounded-full animate-ping pointer-events-none" />
          <div className="absolute w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center text-4xl shadow-xl shadow-brand-primary/30 animate-pulse">
            🎙️
          </div>
          <h3 className="text-xl font-bold mt-20">말씀해 주세요</h3>
          <p className="text-sm text-brand-gray-300 mt-2">
            {activeTab === "ingredient" ? "재료 이름을 말해주세요" : "메뉴 이름을 말해주세요"}
          </p>
          <button
            onClick={toggleListening}
            className="mt-8 border border-white/20 bg-white/10 hover:bg-white/20 active-press px-6 py-2 rounded-full text-xs font-semibold"
          >
            취소하기
          </button>
        </div>
      )}
    </div>
  );
}
