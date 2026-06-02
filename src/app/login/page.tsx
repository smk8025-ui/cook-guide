"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setError("");
    setLoading(true);

    const url = isLogin ? "/api/auth/login" : "/api/auth/signup";

    try {
      const body = isLogin
        ? { username, password }
        : { username, password, nickname: nickname.trim() || undefined };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "인증에 실패했습니다.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("서버와의 연결이 원활하지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = username.trim() !== "" && password.trim() !== "";


  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 dark:bg-zinc-900 bg-brand-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* LOGO */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-primary-light mb-3">
            🍳 자취생을 위한 초간단 요리 도우미
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-brand-primary dark:text-brand-primary-light">
            냉털쿡
          </h1>
          <p className="mt-2 text-sm text-brand-gray-500 dark:text-brand-gray-400">
            냉장고 재료로 쉽게 요리하세요
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-800 py-8 px-6 shadow-xl rounded-3xl border border-brand-gray-100 dark:border-zinc-700/50">
          {/* Tab Selector */}
          <div className="flex border-b border-brand-gray-100 dark:border-zinc-700 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 pb-3 text-center text-sm font-semibold transition-all duration-200 ${
                isLogin
                  ? "border-b-2 border-brand-primary text-brand-primary dark:text-brand-primary-light"
                  : "text-brand-gray-500 dark:text-brand-gray-400 hover:text-brand-primary"
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`flex-1 pb-3 text-center text-sm font-semibold transition-all duration-200 ${
                !isLogin
                  ? "border-b-2 border-brand-primary text-brand-primary dark:text-brand-primary-light"
                  : "text-brand-gray-500 dark:text-brand-gray-400 hover:text-brand-primary"
              }`}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-brand-gray-700 dark:text-brand-gray-300 uppercase tracking-wider"
              >
                아이디
              </label>
              <div className="mt-1.5">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="아이디를 입력해주세요"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full h-11 px-4 rounded-xl border border-brand-gray-300 dark:border-zinc-700 bg-brand-gray-50 dark:bg-zinc-900 text-brand-gray-900 dark:text-zinc-50 placeholder-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all duration-200"
                />
              </div>
            </div>

            {/* 닉네임 필드 — 회원가입 시에만 표시 */}
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: isLogin ? "0" : "100px", opacity: isLogin ? 0 : 1 }}
              aria-hidden={isLogin}
            >
              <label
                htmlFor="nickname"
                className="block text-xs font-semibold text-brand-gray-700 dark:text-brand-gray-300 uppercase tracking-wider"
              >
                닉네임 <span className="text-brand-gray-400 normal-case font-normal">(선택, 최대 12자)</span>
              </label>
              <div className="mt-1.5">
                <input
                  id="nickname"
                  name="nickname"
                  type="text"
                  maxLength={12}
                  placeholder="표시될 닉네임을 입력해주세요"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  tabIndex={isLogin ? -1 : 0}
                  className="block w-full h-11 px-4 rounded-xl border border-brand-gray-300 dark:border-zinc-700 bg-brand-gray-50 dark:bg-zinc-900 text-brand-gray-900 dark:text-zinc-50 placeholder-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-brand-gray-700 dark:text-brand-gray-300 uppercase tracking-wider"
              >
                비밀번호
              </label>
              <div className="mt-1.5">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="비밀번호를 입력해주세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full h-11 px-4 rounded-xl border border-brand-gray-300 dark:border-zinc-700 bg-brand-gray-50 dark:bg-zinc-900 text-brand-gray-900 dark:text-zinc-50 placeholder-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all duration-200"
                />
              </div>
            </div>


            {error && (
              <div className="text-xs text-brand-danger bg-brand-danger/10 p-3 rounded-xl flex items-center gap-2 border border-brand-danger/20 animate-shake">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`w-full h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-brand-primary/20 active-press transition-all duration-200 ${
                  isFormValid && !loading
                    ? "bg-gradient-to-r from-brand-primary to-brand-primary-dark hover:brightness-110 cursor-pointer"
                    : "bg-brand-gray-300 dark:bg-zinc-700 text-brand-gray-500 cursor-not-allowed shadow-none"
                }`}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : isLogin ? (
                  "로그인"
                ) : (
                  "회원가입"
                )}
              </button>
            </div>
          </form>

          {/* Additional controls */}
          <div className="mt-6 text-center text-xs text-brand-gray-500 dark:text-brand-gray-400">
            <button
              onClick={() => alert("임시 비밀번호를 전송하였습니다. (가상)")}
              className="hover:underline font-medium focus:outline-none"
            >
              비밀번호 찾기
            </button>
            <span className="mx-2 text-brand-gray-300 dark:text-zinc-700">or</span>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="hover:underline font-medium focus:outline-none text-brand-primary dark:text-brand-primary-light"
            >
              {isLogin ? "회원가입 하기" : "로그인 하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
