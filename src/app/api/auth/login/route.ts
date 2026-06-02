import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "아이디와 비밀번호를 모두 입력해 주세요." },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json(
        { error: "아이디 또는 비밀번호가 틀렸습니다." },
        { status: 401 }
      );
    }

    // Sign JWT
    const token = signToken({
      userId: user.id,
      username: user.username,
    });

    // Set cookie
    const response = NextResponse.json({
      message: "로그인에 성공했습니다.",
      user: {
        id: user.id,
        username: user.username,
      },
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "로그인 처리 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
