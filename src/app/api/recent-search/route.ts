import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await prisma.recentSearch.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    
    // Deduplicate queries while preserving order
    const seen = new Set<string>();
    const uniqueQueries: string[] = [];
    for (const item of list) {
      const q = item.query.trim();
      if (q && !seen.has(q)) {
        seen.add(q);
        uniqueQueries.push(q);
      }
    }
    
    return NextResponse.json({ recentSearches: uniqueQueries.slice(0, 10) });
  } catch (error) {
    console.error("GET recent-search error:", error);
    return NextResponse.json({ error: "최근 검색어를 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { query } = await request.json();
    if (!query || !query.trim()) {
      return NextResponse.json({ error: "검색어를 입력해주세요." }, { status: 400 });
    }

    const trimmed = query.trim();

    // To prevent infinite storage of identical successive queries, check if the last one matches
    const lastSearch = await prisma.recentSearch.findFirst({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    if (lastSearch?.query !== trimmed) {
      await prisma.recentSearch.create({
        data: {
          userId: session.userId,
          query: trimmed,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST recent-search error:", error);
    return NextResponse.json({ error: "검색어를 저장하지 못했습니다." }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.recentSearch.deleteMany({
      where: { userId: session.userId },
    });
    return NextResponse.json({ success: true, message: "검색 기록이 전체 삭제되었습니다." });
  } catch (error) {
    console.error("DELETE recent-search error:", error);
    return NextResponse.json({ error: "검색 기록 삭제에 실패했습니다." }, { status: 500 });
  }
}
