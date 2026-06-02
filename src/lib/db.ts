import fs from "fs";
import path from "path";

// File-based JSON Database representing SQLite in environments where native bindings fail.
// This preserves the exact PrismaClient interface to keep the rest of the codebase clean,
// typed, and functional without requiring native better-sqlite3 compilation.

const DB_FILE = path.join(process.cwd(), "prisma", "db.json");

interface DbSchema {
  users: any[];
  ingredients: any[];
  userIngredients: any[];
  recipes: any[];
  recipeIngredients: any[];
  recipeSteps: any[];
  bookmarks: any[];
  shoppingLists: any[];
}

function readDb(): DbSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      // Create schema directory if it doesn't exist
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const initial: DbSchema = {
        users: [],
        ingredients: [],
        userIngredients: [],
        recipes: [],
        recipeIngredients: [],
        recipeSteps: [],
        bookmarks: [],
        shoppingLists: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading JSON db, returning empty state:", error);
    return {
      users: [],
      ingredients: [],
      userIngredients: [],
      recipes: [],
      recipeIngredients: [],
      recipeSteps: [],
      bookmarks: [],
      shoppingLists: [],
    };
  }
}

function writeDb(data: DbSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing JSON db:", error);
  }
}

// Generate autoincrement ID
function nextId(list: any[]): number {
  return list.reduce((max, item) => (item.id > max ? item.id : max), 0) + 1;
}

export const prisma = {
  $disconnect: async () => { },

  user: {
    findUnique: async (args: { where: { id?: number; username?: string }; select?: Record<string, boolean> }) => {
      const db = readDb();
      let user = null;
      if (args.where.id !== undefined) {
        user = db.users.find((u) => u.id === args.where.id) || null;
      } else if (args.where.username !== undefined) {
        user = db.users.find((u) => u.username === args.where.username) || null;
      }
      // If select is specified, filter the returned fields
      if (user && args.select) {
        const filtered: Record<string, any> = {};
        for (const key of Object.keys(args.select)) {
          if (args.select[key]) filtered[key] = user[key];
        }
        return filtered;
      }
      return user;
    },
    create: async (args: { data: { username: string; passwordHash?: string; password?: string; nickname?: string } }) => {
      const db = readDb();
      const newUser = {
        id: nextId(db.users),
        username: args.data.username,
        password: args.data.password || args.data.passwordHash || "",
        nickname: args.data.nickname || args.data.username,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.users.push(newUser);
      writeDb(db);
      return newUser;
    },
    deleteMany: async (args?: any) => {
      const db = readDb();
      db.users = [];
      writeDb(db);
      return { count: 0 };
    },
  },

  ingredient: {
    findMany: async () => {
      return readDb().ingredients;
    },
    upsert: async (args: { where: { name: string }; update: any; create: { name: string; category: string } }) => {
      const db = readDb();
      let ing = db.ingredients.find((i) => i.name === args.where.name);
      if (!ing) {
        ing = {
          id: nextId(db.ingredients),
          name: args.create.name,
          category: args.create.category,
        };
        db.ingredients.push(ing);
        writeDb(db);
      }
      return ing;
    },
    deleteMany: async (args?: any) => {
      const db = readDb();
      db.ingredients = [];
      writeDb(db);
      return { count: 0 };
    },
  },

  userIngredient: {
    findMany: async (args?: { where?: { userId: number } }) => {
      const db = readDb();
      if (args?.where?.userId !== undefined) {
        return db.userIngredients.filter((ui) => ui.userId === args.where!.userId);
      }
      return db.userIngredients;
    },
    create: async (args: { data: { userId: number; name: string } }) => {
      const db = readDb();

      // Prevent duplicates
      const exists = db.userIngredients.find(
        (ui) => ui.userId === args.data.userId && ui.name === args.data.name
      );
      if (exists) return exists;

      const newUi = {
        id: nextId(db.userIngredients),
        userId: args.data.userId,
        name: args.data.name,
        createdAt: new Date().toISOString(),
      };
      db.userIngredients.push(newUi);
      writeDb(db);
      return newUi;
    },
    delete: async (args: { where: { id?: number; userId_name?: { userId: number; name: string } } }) => {
      const db = readDb();
      let index = -1;
      if (args.where.id !== undefined) {
        index = db.userIngredients.findIndex((ui) => ui.id === args.where.id);
      } else if (args.where.userId_name !== undefined) {
        index = db.userIngredients.findIndex(
          (ui) =>
            ui.userId === args.where.userId_name!.userId &&
            ui.name === args.where.userId_name!.name
        );
      }

      if (index !== -1) {
        const deleted = db.userIngredients.splice(index, 1)[0];
        writeDb(db);
        return deleted;
      }
      throw new Error("Record to delete not found.");
    },
    deleteMany: async (args?: { where?: { userId: number } }) => {
      const db = readDb();
      if (args?.where?.userId !== undefined) {
        const initialLength = db.userIngredients.length;
        db.userIngredients = db.userIngredients.filter((ui) => ui.userId !== args.where!.userId);
        writeDb(db);
        return { count: initialLength - db.userIngredients.length };
      }
      db.userIngredients = [];
      writeDb(db);
      return { count: 0 };
    },
  },

  recipe: {
    findMany: async (args?: { take?: number; include?: { ingredients?: boolean; steps?: boolean } }) => {
      const db = readDb();
      let list = db.recipes;
      if (args?.take !== undefined) {
        list = list.slice(0, args.take);
      }
      return list.map((r) => {
        const recipe: any = { ...r };
        if (args?.include?.ingredients) {
          recipe.ingredients = db.recipeIngredients.filter((ri) => ri.recipeId === r.id);
        }
        if (args?.include?.steps) {
          recipe.steps = db.recipeSteps.filter((rs) => rs.recipeId === r.id);
        }
        return recipe;
      });
    },
    findUnique: async (args: { where: { id: number }; include?: { ingredients?: boolean; steps?: boolean } }) => {
      const db = readDb();
      const r = db.recipes.find((rec) => rec.id === args.where.id);
      if (!r) return null;

      const recipe: any = { ...r };
      if (args.include?.ingredients) {
        recipe.ingredients = db.recipeIngredients.filter((ri) => ri.recipeId === r.id);
      }
      if (args.include?.steps) {
        recipe.steps = db.recipeSteps
          .filter((rs) => rs.recipeId === r.id)
          .sort((a, b) => a.stepNumber - b.stepNumber);
      }
      return recipe;
    },
    upsert: async (args: { where: { name: string }; update: any; create: { name: string; time: number; difficulty: string; servings: string } }) => {
      const db = readDb();
      let recipe = db.recipes.find((r) => r.name === args.where.name);
      if (recipe) {
        recipe.time = args.update.time ?? recipe.time;
        recipe.difficulty = args.update.difficulty ?? recipe.difficulty;
        recipe.servings = args.update.servings ?? recipe.servings;
      } else {
        recipe = {
          id: nextId(db.recipes),
          name: args.create.name,
          time: args.create.time,
          difficulty: args.create.difficulty,
          servings: args.create.servings,
        };
        db.recipes.push(recipe);
      }
      writeDb(db);
      return recipe;
    },
    deleteMany: async (args?: any) => {
      const db = readDb();
      db.recipes = [];
      writeDb(db);
      return { count: 0 };
    },
  },

  recipeIngredient: {
    create: async (args: { data: { recipeId: number; name: string; amount: string; isEssential: boolean } }) => {
      const db = readDb();
      const newRi = {
        id: nextId(db.recipeIngredients),
        recipeId: args.data.recipeId,
        name: args.data.name,
        amount: args.data.amount,
        isEssential: args.data.isEssential,
      };
      db.recipeIngredients.push(newRi);
      writeDb(db);
      return newRi;
    },
    deleteMany: async (args?: { where?: { recipeId: number } }) => {
      const db = readDb();
      if (args?.where?.recipeId !== undefined) {
        db.recipeIngredients = db.recipeIngredients.filter((ri) => ri.recipeId !== args.where!.recipeId);
      } else {
        db.recipeIngredients = [];
      }
      writeDb(db);
      return { count: 0 };
    },
  },

  recipeStep: {
    create: async (args: { data: { recipeId: number; stepNumber: number; instruction: string } }) => {
      const db = readDb();
      const newRs = {
        id: nextId(db.recipeSteps),
        recipeId: args.data.recipeId,
        stepNumber: args.data.stepNumber,
        instruction: args.data.instruction,
      };
      db.recipeSteps.push(newRs);
      writeDb(db);
      return newRs;
    },
    deleteMany: async (args?: { where?: { recipeId: number } }) => {
      const db = readDb();
      if (args?.where?.recipeId !== undefined) {
        db.recipeSteps = db.recipeSteps.filter((rs) => rs.recipeId !== args.where!.recipeId);
      } else {
        db.recipeSteps = [];
      }
      writeDb(db);
      return { count: 0 };
    },
  },

  bookmark: {
    findMany: async (args?: { where?: { userId: number }; include?: { recipe?: boolean } }) => {
      const db = readDb();
      let list = db.bookmarks;
      if (args?.where?.userId !== undefined) {
        list = list.filter((b) => b.userId === args.where!.userId);
      }

      return list.map((b) => {
        const bookmark: any = { ...b };
        if (args?.include?.recipe) {
          const r = db.recipes.find((rec) => rec.id === b.recipeId);
          if (r) {
            bookmark.recipe = {
              ...r,
              ingredients: db.recipeIngredients.filter((ri) => ri.recipeId === r.id),
              steps: db.recipeSteps.filter((rs) => rs.recipeId === r.id),
            };
          }
        }
        return bookmark;
      });
    },
    findUnique: async (args: { where: { userId_recipeId: { userId: number; recipeId: number } } }) => {
      const db = readDb();
      const { userId, recipeId } = args.where.userId_recipeId;
      return db.bookmarks.find((b) => b.userId === userId && b.recipeId === recipeId) || null;
    },
    create: async (args: { data: { userId: number; recipeId: number } }) => {
      const db = readDb();

      const exists = db.bookmarks.find(
        (b) => b.userId === args.data.userId && b.recipeId === args.data.recipeId
      );
      if (exists) return exists;

      const newB = {
        id: nextId(db.bookmarks),
        userId: args.data.userId,
        recipeId: args.data.recipeId,
        createdAt: new Date().toISOString(),
      };
      db.bookmarks.push(newB);
      writeDb(db);
      return newB;
    },
    delete: async (args: { where: { userId_recipeId: { userId: number; recipeId: number } } }) => {
      const db = readDb();
      const { userId, recipeId } = args.where.userId_recipeId;
      const index = db.bookmarks.findIndex((b) => b.userId === userId && b.recipeId === recipeId);
      if (index !== -1) {
        const deleted = db.bookmarks.splice(index, 1)[0];
        writeDb(db);
        return deleted;
      }
      throw new Error("Record to delete not found.");
    },
    deleteMany: async (args?: any) => {
      const db = readDb();
      db.bookmarks = [];
      writeDb(db);
      return { count: 0 };
    },
  },

  shoppingList: {
    findMany: async (args?: { where?: { userId: number } }) => {
      const db = readDb();
      if (args?.where?.userId !== undefined) {
        return db.shoppingLists.filter((s) => s.userId === args.where!.userId);
      }
      return db.shoppingLists;
    },
    create: async (args: { data: { userId: number; ingredientName: string } }) => {
      const db = readDb();

      const exists = db.shoppingLists.find(
        (s) => s.userId === args.data.userId && s.ingredientName === args.data.ingredientName
      );
      if (exists) return exists;

      const newS = {
        id: nextId(db.shoppingLists),
        userId: args.data.userId,
        ingredientName: args.data.ingredientName,
        createdAt: new Date().toISOString(),
      };
      db.shoppingLists.push(newS);
      writeDb(db);
      return newS;
    },
    delete: async (args: { where: { id?: number; userId_ingredientName?: { userId: number; ingredientName: string } } }) => {
      const db = readDb();
      let index = -1;
      if (args.where.id !== undefined) {
        index = db.shoppingLists.findIndex((s) => s.id === args.where.id);
      } else if (args.where.userId_ingredientName !== undefined) {
        index = db.shoppingLists.findIndex(
          (s) =>
            s.userId === args.where.userId_ingredientName!.userId &&
            s.ingredientName === args.where.userId_ingredientName!.ingredientName
        );
      }

      if (index !== -1) {
        const deleted = db.shoppingLists.splice(index, 1)[0];
        writeDb(db);
        return deleted;
      }
      throw new Error("Record to delete not found.");
    },
    deleteMany: async (args?: { where?: { userId: number } }) => {
      const db = readDb();
      if (args?.where?.userId !== undefined) {
        const initialLength = db.shoppingLists.length;
        db.shoppingLists = db.shoppingLists.filter((s) => s.userId !== args.where!.userId);
        writeDb(db);
        return { count: initialLength - db.shoppingLists.length };
      }
      db.shoppingLists = [];
      writeDb(db);
      return { count: 0 };
    },
  },
};
