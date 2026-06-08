import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await prisma.shoppingItem.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ shoppingList: list.map(item => item.name) });
  } catch (error) {
    console.error("GET shopping-list error:", error);
    return NextResponse.json({ error: "장보기 목록을 가져오지 못했습니다." }, { status: 500 });
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
      return NextResponse.json({ error: "추가할 항목명을 입력해주세요." }, { status: 400 });
    }

    // Use batch upsert to add all items in a single read/write operation,
    // preventing ID conflicts and ensuring no items are silently skipped.
    const added = await (prisma.shoppingItem as any).upsertMany({
      userId: session.userId,
      names: listToAdd,
    });

    return NextResponse.json({ success: true, added });
  } catch (error) {
    console.error("POST shopping-list error:", error);
    return NextResponse.json({ error: "장보기 목록에 재료를 추가하지 못했습니다." }, { status: 500 });
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
      await prisma.shoppingItem.deleteMany({
        where: { userId: session.userId },
      });
      return NextResponse.json({ success: true, message: "장보기 목록 전체 삭제 완료" });
    }

    if (!name) {
      return NextResponse.json({ error: "삭제할 재료명을 지정해주세요." }, { status: 400 });
    }

    await prisma.shoppingItem.deleteMany({
      where: {
        userId: session.userId,
        name: name,
      },
    });

    return NextResponse.json({ success: true, message: `${name} 삭제 완료` });
  } catch (error) {
    console.error("DELETE shopping-list error:", error);
    return NextResponse.json({ error: "장보기 목록 항목을 삭제하지 못했습니다." }, { status: 500 });
  }
}
