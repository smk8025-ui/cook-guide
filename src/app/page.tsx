import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import HomeClient from "@/components/HomeClient";

// Force dynamic rendering to ensure cookies/auth checks work correctly on every load
export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  
  // Fetch top 3 recipes as recommended items
  const recommendedRecipes = await prisma.recipe.findMany({
    take: 3,
  });

  return (
    <HomeClient
      user={user ? { username: user.username } : null}
      recommendedRecipes={recommendedRecipes}
    />
  );
}
