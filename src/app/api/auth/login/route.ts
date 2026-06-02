import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { verifyPassword, createSession } from "../../../../lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "아이디와 비밀번호를 모두 입력해주세요." }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: "아이디 또는 비밀번호가 틀렸습니다." }, { status: 400 });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "아이디 또는 비밀번호가 틀렸습니다." }, { status: 400 });
    }

    // Create session cookie
    await createSession(user.id, user.username);

    return NextResponse.json({ success: true, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "로그인 중 오류가 발생했습니다." }, { status: 500 });
  }
}
