import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userIngredients = await prisma.userIngredient.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ ingredients: userIngredients.map(i => i.name) });
  } catch (error) {
    console.error("GET ingredients error:", error);
    return NextResponse.json({ error: "재료 목록을 가져오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, names } = await request.json();
    const listToAdd: string[] = names && Array.isArray(names) ? names : (name ? [name] : []);
    
    if (listToAdd.length === 0) {
      return NextResponse.json({ error: "추가할 재료명을 입력해주세요." }, { status: 400 });
    }

    const created: string[] = [];
    for (const ingName of listToAdd) {
      const trimmed = ingName.trim();
      if (!trimmed) continue;
      
      try {
        const item = await prisma.userIngredient.upsert({
          where: {
            userId_name: {
              userId: session.userId,
              name: trimmed,
            },
          },
          update: {},
          create: {
            userId: session.userId,
            name: trimmed,
          },
        });
        created.push(item.name);
      } catch (e) {
        // Ignore duplicate errors
      }
    }

    return NextResponse.json({ success: true, ingredients: created });
  } catch (error) {
    console.error("POST ingredients error:", error);
    return NextResponse.json({ error: "재료를 저장하지 못했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "true";
  const name = searchParams.get("name");

  try {
    if (all) {
      await prisma.userIngredient.deleteMany({
        where: { userId: session.userId },
      });
      return NextResponse.json({ success: true, message: "전체 삭제 완료" });
    }

    if (!name) {
      return NextResponse.json({ error: "삭제할 재료명을 지정해주세요." }, { status: 400 });
    }

    await prisma.userIngredient.deleteMany({
      where: {
        userId: session.userId,
        name: name,
      },
    });

    return NextResponse.json({ success: true, message: `${name} 삭제 완료` });
  } catch (error) {
    console.error("DELETE ingredients error:", error);
    return NextResponse.json({ error: "재료를 삭제하지 못했습니다." }, { status: 500 });
  }
}
