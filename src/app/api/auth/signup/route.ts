import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { hashPassword, createSession } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password, nickname } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "아이디와 비밀번호를 모두 입력해주세요." }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({ error: "아이디는 3글자 이상이어야 합니다." }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: "비밀번호는 4글자 이상이어야 합니다." }, { status: 400 });
    }

    const trimmedNickname = nickname?.trim();
    if (trimmedNickname && trimmedNickname.length > 12) {
      return NextResponse.json({ error: "닉네임은 12글자 이하이어야 합니다." }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ error: "이미 존재하는 아이디입니다." }, { status: 400 });
    }

    // Hash password & save user
    const passwordHash = await hashPassword(password);
    const finalNickname = trimmedNickname || username;
    const user = await prisma.user.create({
      data: {
        username,
        nickname: finalNickname,
        passwordHash,
      },
    });

    // Create session cookie
    await createSession(user.id, user.username, user.nickname ?? undefined);

    return NextResponse.json({ success: true, user: { id: user.id, username: user.username, nickname: user.nickname } });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "회원가입 중 오류가 발생했습니다." }, { status: 500 });
  }
}
