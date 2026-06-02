import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await prisma.favorite.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ favorites: list.map(f => f.recipeId) });
  } catch (error) {
    console.error("GET favorites error:", error);
    return NextResponse.json({ error: "즐겨찾기 목록을 가져오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { recipeId } = await request.json();
    if (!recipeId) {
      return NextResponse.json({ error: "레시피 ID를 제공해주세요." }, { status: 400 });
    }

    const fav = await prisma.favorite.upsert({
      where: {
        userId_recipeId: {
          userId: session.userId,
          recipeId,
        },
      },
      update: {},
      create: {
        userId: session.userId,
        recipeId,
      },
    });

    return NextResponse.json({ success: true, favorite: fav.recipeId });
  } catch (error) {
    console.error("POST favorites error:", error);
    return NextResponse.json({ error: "즐겨찾기 추가에 실패했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Attempt to parse body (useful for bulk delete POST-like DELETE)
    const clonedRequest = request.clone();
    let recipeId: string | null = null;
    let recipeIds: string[] | null = null;

    try {
      const body = await clonedRequest.json();
      recipeId = body.recipeId || null;
      recipeIds = body.recipeIds || null;
    } catch (e) {
      // Body empty or malformed, rely on query params
    }

    if (recipeIds && Array.isArray(recipeIds)) {
      await prisma.favorite.deleteMany({
        where: {
          userId: session.userId,
          recipeId: { in: recipeIds },
        },
      });
      return NextResponse.json({ success: true, message: "선택된 즐겨찾기가 삭제되었습니다." });
    }

    const urlId = new URL(request.url).searchParams.get("recipeId");
    const idToDelete = recipeId || urlId;

    if (!idToDelete) {
      return NextResponse.json({ error: "삭제할 레시피 ID가 필요합니다." }, { status: 400 });
    }

    await prisma.favorite.deleteMany({
      where: {
        userId: session.userId,
        recipeId: idToDelete,
      },
    });

    return NextResponse.json({ success: true, message: "즐겨찾기가 해제되었습니다." });
  } catch (error) {
    console.error("DELETE favorites error:", error);
    return NextResponse.json({ error: "즐겨찾기 삭제에 실패했습니다." }, { status: 500 });
  }
}
