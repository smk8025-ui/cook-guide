import { prisma } from "../src/lib/db";

async function main() {
  console.log("Seeding database...");

  // 1. Clean existing data
  await prisma.bookmark.deleteMany({});
  await prisma.shoppingList.deleteMany({});
  await prisma.userIngredient.deleteMany({});
  await prisma.recipeStep.deleteMany({});
  await prisma.recipeIngredient.deleteMany({});
  await prisma.recipe.deleteMany({});
  await prisma.ingredient.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed basic ingredients dictionary
  const ingredientsData = [
    { name: "계란", category: "단백질" },
    { name: "양파", category: "채소" },
    { name: "당근", category: "채소" },
    { name: "김치", category: "반찬" },
    { name: "두부", category: "단백질" },
    { name: "감자", category: "채소" },
    { name: "대파", category: "채소" },
    { name: "된장", category: "양념" },
    { name: "돼지고기", category: "단백질" },
    { name: "밥", category: "곡류" },
    { name: "간장", category: "양념" },
    { name: "소금", category: "양념" },
    { name: "깨", category: "양념" },
    { name: "호박", category: "채소" },
    { name: "쪽파", category: "채소" },
    { name: "고추장", category: "양념" },
    { name: "설탕", category: "양념" },
  ];

  for (const ing of ingredientsData) {
    await prisma.ingredient.upsert({
      where: { name: ing.name },
      update: {},
      create: ing,
    });
  }

  // 3. Seed pre-defined recipes
  const recipes = [
    {
      name: "김치볶음밥",
      time: 15,
      difficulty: "쉬움",
      servings: "1~2인분",
      ingredients: [
        { name: "김치", amount: "1 컵", isEssential: true },
        { name: "밥", amount: "한 공기", isEssential: true },
        { name: "간장", amount: "2 스푼", isEssential: true },
        { name: "소금", amount: "반 스푼", isEssential: true },
        { name: "대파", amount: "50g", isEssential: true },
        { name: "깨", amount: "반 스푼", isEssential: true },
        { name: "쪽파", amount: "10g", isEssential: false },
      ],
      steps: [
        "후라이팬에 기름을 두르고 김치를 볶는다.",
        "김치를 볶고 가장자리에 간장 1스푼을 넣고 태운다.",
        "밥을 넣고 고슬고슬하게 볶는다.",
        "소금으로 간을 맞춘다.",
        "불을 끄고 김가루와 깨를 뿌리고 맛있게 먹는다.",
      ],
    },
    {
      name: "계란말이",
      time: 10,
      difficulty: "쉬움",
      servings: "1~2인분",
      ingredients: [
        { name: "계란", amount: "4 개", isEssential: true },
        { name: "소금", amount: "반 작은술", isEssential: true },
        { name: "대파", amount: "20g", isEssential: true },
        { name: "당근", amount: "20g", isEssential: true },
      ],
      steps: [
        "계란을 그릇에 풀고 소금으로 간을 한다.",
        "대파와 당근을 잘게 다져 푼 계란에 섞는다.",
        "팬에 기름을 두르고 달군 뒤 계란물을 조금씩 부어가며 말아준다.",
        "먹기 좋은 크기로 썰어 완성한다.",
      ],
    },
    {
      name: "제육덮밥",
      time: 20,
      difficulty: "중간",
      servings: "1~2인분",
      ingredients: [
        { name: "돼지고기", amount: "200g", isEssential: true },
        { name: "고추장", amount: "2 스푼", isEssential: true },
        { name: "설탕", amount: "1 스푼", isEssential: true },
        { name: "양파", amount: "반 개", isEssential: true },
        { name: "대파", amount: "30g", isEssential: true },
        { name: "밥", amount: "한 공기", isEssential: true },
      ],
      steps: [
        "돼지고기를 고추장, 설탕 등으로 양념하여 재워둔다.",
        "팬에 식용유를 두르고 양념한 고기를 볶는다.",
        "고기가 익어갈 때 양파와 대파를 넣고 함께 볶는다.",
        "그릇에 밥을 담고 볶은 제육을 올려 완성한다.",
      ],
    },
    {
      name: "김치찌개",
      time: 15,
      difficulty: "중간",
      servings: "1~2인분",
      ingredients: [
        { name: "김치", amount: "1 컵", isEssential: true },
        { name: "돼지고기", amount: "150g", isEssential: true },
        { name: "두부", amount: "반 모", isEssential: true },
        { name: "대파", amount: "30g", isEssential: true },
        { name: "물", amount: "2 컵", isEssential: true },
      ],
      steps: [
        "냄비에 김치와 돼지고기를 넣고 볶는다.",
        "물을 붓고 끓이다가 썰어둔 두부와 대파를 넣는다.",
        "국물이 진해질 때까지 푹 끓여 완성한다.",
      ],
    },
    {
      name: "된장찌개",
      time: 20,
      difficulty: "중간",
      servings: "1~2인분",
      ingredients: [
        { name: "두부", amount: "반 모", isEssential: true },
        { name: "된장", amount: "2 스푼", isEssential: true },
        { name: "감자", amount: "1 개", isEssential: true },
        { name: "대파", amount: "30g", isEssential: true },
        { name: "물", amount: "2.5 컵", isEssential: true },
        { name: "호박", amount: "1/4 개", isEssential: true },
      ],
      steps: [
        "냄비에 물을 붓고 된장을 풀어 끓인다.",
        "깍둑썰기한 감자와 호박을 넣고 익힌다.",
        "마지막에 두부와 대파를 넣고 한소끔 더 끓여 완성한다.",
      ],
    },
  ];

  for (const recipe of recipes) {
    const createdRecipe = await prisma.recipe.upsert({
      where: { name: recipe.name },
      update: {
        time: recipe.time,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
      },
      create: {
        name: recipe.name,
        time: recipe.time,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
      },
    });

    // Seed Recipe Ingredients
    await prisma.recipeIngredient.deleteMany({ where: { recipeId: createdRecipe.id } });
    for (const ing of recipe.ingredients) {
      await prisma.recipeIngredient.create({
        data: {
          recipeId: createdRecipe.id,
          name: ing.name,
          amount: ing.amount,
          isEssential: ing.isEssential,
        },
      });
    }

    // Seed Recipe Steps
    await prisma.recipeStep.deleteMany({ where: { recipeId: createdRecipe.id } });
    for (let i = 0; i < recipe.steps.length; i++) {
      await prisma.recipeStep.create({
        data: {
          recipeId: createdRecipe.id,
          stepNumber: i + 1,
          instruction: recipe.steps[i],
        },
      });
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
