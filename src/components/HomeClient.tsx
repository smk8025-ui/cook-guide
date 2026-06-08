"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LogoMark from "./LogoMark";

interface Recipe {
  id: number;
  name: string;
  time: number;
  difficulty: string;
  servings: string;
}

interface HomeClientProps {
  user: { username: string; nickname?: string | null } | null;
  recommendedRecipes: Recipe[];
}

export default function HomeClient({ user, recommendedRecipes }: HomeClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        startTransition(() => {
          router.push("/login");
          router.refresh();
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCloseModal = () => {
    setShowPhotoModal(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handlePhotoUpload = () => {
    if (!selectedFile) return;
    setPhotoLoading(true);
    // Simulate AI image recognition
    setTimeout(() => {
      setPhotoLoading(false);
      setShowPhotoModal(false);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      // Redirect to ingredient entry with recognized ingredients query
      router.push("/ingredients?photoRecognized=김치,계란,대파");
    }, 2000);
  };

  return (
    <div className="flex flex-col flex-1 px-4 py-6">
      
      {/* HEADER */}
      <header className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <LogoMark size="sm" />
          <span className="text-2xl font-black text-brand-primary">냉털쿡</span>
          {user && (
            <span className="text-[11px] font-medium bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full animate-scale-in">
              {user.nickname || user.username}님 환영합니다! 🧑‍🍳
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("새 알림이 없습니다.")}
            className="text-zinc-500 hover:text-brand-primary dark:text-zinc-300 active-press"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </button>
          
          {user ? (
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="text-xs font-semibold text-zinc-400 hover:text-brand-danger dark:text-zinc-500 active-press"
            >
              {isPending ? "로그아웃..." : "로그아웃"}
            </button>
          ) : (
            <Link
              href="/login"
              className="text-xs font-bold text-brand-primary hover:underline"
            >
              로그인
            </Link>
          )}
        </div>
      </header>

      {/* BANNER / SLOGAN */}
      <section className="my-6 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primary-dark p-5 text-white shadow-lg shadow-brand-primary/15 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold leading-tight">
            {user ? `${user.nickname || user.username}님, 환영합니다! ✨` : "오늘도 냉장고 파먹기!"}<br />남은 식재료로 뭐 만들지?
          </h2>
          <p className="mt-2 text-xs opacity-90">
            가지고 계신 식재료만 넣으면 최적의 요리 레시피를 분석해 드려요.
          </p>
        </div>
        <div className="absolute right-[-10px] bottom-[-20px] opacity-10 text-8xl font-black select-none pointer-events-none">
          🍳
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="grid grid-cols-2 gap-4 my-2">
        {/* ACTION 1: Ingredient Input */}
        <Link
          href="/ingredients"
          className="flex flex-col justify-between p-5 rounded-2xl border border-zinc-100 bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800 active-press"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xl mb-3">
              ✍️
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">재료 입력하기</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 leading-snug">
              냉장고 속 재료로 맛있는 요리를 추천받아보세요!
            </p>
          </div>
          <span className="text-[11px] font-semibold text-brand-primary mt-4 flex items-center gap-1">
            입력하러 가기 &rarr;
          </span>
        </Link>

        {/* ACTION 2: Photo Upload */}
        <button
          onClick={() => setShowPhotoModal(true)}
          className="flex flex-col justify-between p-5 rounded-2xl border border-zinc-100 bg-white text-left shadow-sm dark:bg-zinc-900 dark:border-zinc-800 active-press w-full"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xl mb-3">
              📷
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">사진으로 찾기</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 leading-snug">
              사진을 찍으면 재료를 자동으로 인식해요!
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-500 mt-4 flex items-center gap-1">
            사진 촬영 &rarr;
          </span>
        </button>
      </section>

      {/* TODAY RECOMMENDATION */}
      <section className="mt-6 mb-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">오늘의 추천 메뉴</h3>
          <Link
            href="/search"
            className="text-xs font-semibold text-zinc-400 hover:text-brand-primary dark:text-zinc-500"
          >
            더보기 &gt;
          </Link>
        </div>

        <div className="space-y-3.5">
          {recommendedRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipe/${recipe.id}`}
              className="flex items-center gap-4 p-3.5 rounded-xl border border-zinc-100 bg-white shadow-xs hover:border-brand-primary/20 dark:bg-zinc-900 dark:border-zinc-800/80 active-press transition-colors"
            >
              <div className="w-14 h-14 rounded-lg bg-zinc-100 flex items-center justify-center text-2xl dark:bg-zinc-800">
                {recipe.name === "김치볶음밥" ? "🍛" : recipe.name === "계란말이" ? "🍳" : recipe.name === "김치찌개" ? "🍲" : recipe.name === "된장찌개" ? "🥣" : "🥘"}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">{recipe.name}</h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded dark:bg-zinc-800 dark:text-zinc-300">
                    ⏱ {recipe.time}분
                  </span>
                  <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded">
                    🔥 {recipe.difficulty}
                  </span>
                </div>
              </div>
              <div className="text-zinc-300 dark:text-zinc-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* PHOTO UPLOAD MODAL */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <h4 className="text-base font-bold text-zinc-900 dark:text-white mb-2">사진으로 재료 찾기</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              식재료나 냉장고 내부 사진을 업로드해 보세요. AI가 자동으로 분석하여 인식합니다.
            </p>

            <div className={`relative overflow-hidden rounded-xl border-2 mb-4 flex flex-col items-center justify-center transition-all min-h-[160px] ${
              photoLoading 
                ? "border-emerald-500 animate-scan-glow" 
                : selectedFile 
                  ? "border-zinc-300 dark:border-zinc-700" 
                  : "border-dashed border-zinc-200 dark:border-zinc-700 hover:border-brand-primary/50"
            }`}>
              <input
                type="file"
                accept="image/*"
                id="photo-file"
                className="hidden"
                onChange={handleFileChange}
                disabled={photoLoading}
              />
              
              {selectedFile && previewUrl ? (
                <div className="relative w-full min-h-[160px] flex items-center justify-center bg-zinc-950/5 dark:bg-zinc-950/20 py-2">
                  <img
                    src={previewUrl}
                    alt="Scan Preview"
                    className="max-h-[180px] object-contain w-full rounded-lg"
                  />
                  
                  {!photoLoading && (
                    <label htmlFor="photo-file" className="absolute bottom-2 right-2 cursor-pointer bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg backdrop-blur-xs transition-colors active-press">
                      사진 변경
                    </label>
                  )}
                  
                  {photoLoading && (
                    <>
                      <div className="absolute left-0 w-full h-[3px] bg-emerald-400 shadow-[0_0_12px_#10b981,0_0_6px_#059669] animate-scan" />
                      <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
                    </>
                  )}
                </div>
              ) : (
                <label htmlFor="photo-file" className="cursor-pointer flex flex-col items-center p-6 w-full h-full">
                  <span className="text-3xl mb-2">📷</span>
                  <span className="text-xs font-bold text-brand-primary">사진 선택하기</span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                    식재료나 냉장고 내부 사진
                  </span>
                </label>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                disabled={photoLoading}
                className="flex-1 rounded-xl bg-zinc-100 py-3 text-xs font-bold text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handlePhotoUpload}
                disabled={!selectedFile || photoLoading}
                className={`flex-1 rounded-xl py-3 text-xs font-bold text-white transition-colors ${
                  !selectedFile || photoLoading
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                    : "bg-brand-primary hover:bg-brand-primary-dark"
                }`}
              >
                {photoLoading ? "AI 분석 중..." : "AI 인식 시작"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
