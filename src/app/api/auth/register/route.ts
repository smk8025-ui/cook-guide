import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password, nickname } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "아이디와 비밀번호를 모두 입력해 주세요." },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "아이디는 최소 3자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: "비밀번호는 최소 4자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const trimmedNickname = nickname?.trim();
    if (trimmedNickname && trimmedNickname.length > 12) {
      return NextResponse.json(
        { error: "닉네임은 최대 12자까지 설정 가능합니다." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 존재하는 아이디입니다." },
        { status: 400 }
      );
    }

    // Create user
    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        password: passwordHash,
        nickname: trimmedNickname || username,
      },
    });

    return NextResponse.json(
      { message: "회원가입이 완료되었습니다.", username: user.username },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "회원가입 처리 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
