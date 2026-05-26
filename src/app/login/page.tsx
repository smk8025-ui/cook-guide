"use client";

import { useState, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("from") || "/";

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const isFormValid = username.trim() !== "" && password.trim() !== "" && 
    (activeTab === "login" || confirmPassword.trim() !== "");

  const handleTabChange = (tab: "login" | "register") => {
    setActiveTab(tab);
    setError("");
    setSuccessMsg("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (activeTab === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "아이디 또는 비밀번호가 틀렸습니다.");
          setLoading(false);
          return;
        }

        // Login success, redirect to target page
        startTransition(() => {
          router.push(redirectPath);
          router.refresh();
        });
      } else {
        // Register mode
        if (password !== confirmPassword) {
          setError("비밀번호가 일치하지 않습니다.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "회원가입에 실패했습니다.");
          setLoading(false);
          return;
        }

        setSuccessMsg("회원가입이 완료되었습니다! 로그인해 주세요.");
        setActiveTab("login");
        setPassword("");
        setConfirmPassword("");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("서버와 통신하는 중 문제가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-xl dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50">
        
        {/* LOGO & SLOGAN */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-brand-primary animate-bounce">
            냉털쿡
          </h1>
          <p className="mt-2.5 text-sm text-brand-gray-500 dark:text-brand-gray-300">
            냉장고 재료로 쉽게 요리하세요
          </p>
        </div>

        {/* TABS */}
        <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => handleTabChange("login")}
            className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition-all duration-200 ${
              activeTab === "login"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("register")}
            className={`flex-1 rounded-lg py-2.5 text-xs font-semibold transition-all duration-200 ${
              activeTab === "register"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            회원가입
          </button>
        </div>

        {/* FORM */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              아이디
            </label>
            <input
              type="text"
              required
              placeholder="아이디를 입력해주세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-3 text-sm outline-none transition-all focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-zinc-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              required
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-3 text-sm outline-none transition-all focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-zinc-800 dark:text-white"
            />
          </div>

          {activeTab === "register" && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                비밀번호 확인
              </label>
              <input
                type="password"
                required
                placeholder="비밀번호를 한번 더 입력해주세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-transparent px-4 py-3 text-sm outline-none transition-all focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-zinc-800 dark:text-white"
              />
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {successMsg && (
            <div className="text-center text-xs font-medium text-brand-success">
              {successMsg}
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div className="text-center text-xs font-medium text-brand-danger">
              {error}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-200 active-press ${
              !isFormValid
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                : "bg-brand-primary hover:bg-brand-primary-dark shadow-md shadow-brand-primary/10"
            }`}
          >
            {loading ? "처리 중..." : activeTab === "login" ? "로그인" : "회원가입"}
          </button>
        </form>

        {/* OR DIVIDER & HELP */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-zinc-150 dark:border-zinc-800"></div>
          <span className="flex-shrink mx-4 text-xs text-zinc-400 dark:text-zinc-500">or</span>
          <div className="flex-grow border-t border-zinc-150 dark:border-zinc-800"></div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => alert("비밀번호 찾기 기능은 아직 개발 중입니다. 새 계정을 생성해 주세요!")}
            className="text-xs font-semibold text-zinc-400 hover:text-brand-primary dark:text-zinc-500"
          >
            비밀번호 찾기
          </button>
        </div>

      </div>
    </div>
  );
}
