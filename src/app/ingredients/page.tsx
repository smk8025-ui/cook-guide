"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const POPULAR_TAGS = ["계란", "양파", "당근", "김치", "두부", "감자", "대파", "돼지고기", "된장", "애호박"];

const ALL_INGREDIENTS = [
  "계란", "양파", "당근", "김치", "두부", "감자", "대파", "돼지고기", "된장", "애호박",
  "간장", "소금", "깨", "고춧가루", "마늘", "고추장", "설탕", "쪽파", "참기름", "식용유",
  "라면", "치즈", "우유", "버터", "참치캔", "스팸", "베이컨", "닭고기", "소고기", "오뎅",
  "마요네즈", "식빵", "밀가루", "소시지", "밥"
];

function IngredientsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState("");
  const [autocomplete, setAutocomplete] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

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
    } catch (err) {
      console.error("Error loading ingredient data:", err);
    } finally {
      setLoading(false);
    }
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
            handleIngredientSubmit(cleanedText);
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

  // Parse photoRecognized query parameter
  useEffect(() => {
    if (!loading) {
      const photoRecognized = searchParams?.get("photoRecognized");
      if (photoRecognized) {
        const items = photoRecognized.split(",").map((x) => x.trim()).filter(Boolean);
        if (items.length > 0) {
          // POST to backend API
          fetch("/api/ingredients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ names: items }),
          })
            .then((res) => {
              if (res.ok) {
                triggerToast("📷 사진으로 인식된 재료가 추가되었습니다!");
                loadData();
                
                // Clear the query params from the URL bar to prevent adding again on reload
                const newUrl = window.location.pathname;
                window.history.replaceState({}, "", newUrl);
              }
            })
            .catch((err) => console.error("Error uploading photo recognized items:", err));
        }
      }
    }
  }, [loading, searchParams]);

  // Filter autocomplete
  useEffect(() => {
    if (!query.trim()) {
      setAutocomplete([]);
      return;
    }
    const filtered = ALL_INGREDIENTS.filter(
      (item) =>
        item.toLowerCase().includes(query.toLowerCase()) &&
        !ingredients.includes(item)
    );
    setAutocomplete(filtered.slice(0, 5));
  }, [query, ingredients]);

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
        setQuery("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleIngredientSubmit(query);
  };

  const deleteIngredient = async (name: string) => {
    try {
      const res = await fetch(`/api/ingredients?name=${encodeURIComponent(name)}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllIngredients = async () => {
    try {
      const res = await fetch("/api/ingredients?all=true", { method: "DELETE" });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecommendClick = () => {
    if (ingredients.length === 0) return;
    router.push("/recommend");
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
          <h1 className="text-lg font-black text-brand-gray-900 dark:text-zinc-100">재료 입력</h1>
        </div>
        <Link href="/" className="text-sm font-semibold text-brand-primary dark:text-brand-primary-light hover:underline">
          완료
        </Link>
      </header>

      {/* BODY CONTENT */}
      <main className="p-4 space-y-6 flex-1">
        {/* SEARCH BOX & MIC */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="재료를 검색해 주세요"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
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
                  await fetch("/api/recent-search", { method: "DELETE" });
                  loadData();
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
          <h3 className="text-xs font-bold text-brand-gray-400 uppercase tracking-wider">많이 찾는 인기 재료</h3>
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

          {loading ? (
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : ingredients.length === 0 ? (
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
      </main>

      {/* FLOAT BOTTOM BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-[480px] p-4 bg-gradient-to-t from-brand-gray-50 via-brand-gray-50/95 to-transparent dark:from-zinc-900 dark:via-zinc-900/95">
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

      {/* VOICE LISTEN OVERLAY */}
      {isListening && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white">
          <div className="relative w-28 h-28 flex items-center justify-center bg-brand-primary/10 border border-brand-primary/20 rounded-full animate-ping pointer-events-none" />
          <div className="absolute w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center text-4xl shadow-xl shadow-brand-primary/30 animate-pulse">
            🎙️
          </div>
          <h3 className="text-xl font-bold mt-20">말씀해 주세요</h3>
          <p className="text-sm text-brand-gray-300 mt-2">재료 이름을 말해주세요</p>
          <button
            onClick={toggleListening}
            className="mt-8 border border-white/20 bg-white/10 hover:bg-white/20 active-press px-6 py-2 rounded-full text-xs font-semibold"
          >
            취소하기
          </button>
        </div>
      )}

      {/* TOAST ALERTS */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-brand-gray-900/90 backdrop-blur text-white text-sm font-semibold py-3 px-6 rounded-2xl shadow-xl flex items-center gap-2 border border-white/10 animate-slide-in">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function IngredientsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 rounded-full border-4 border-brand-primary border-t-transparent" /></div>}>
      <IngredientsContent />
    </Suspense>
  );
}
