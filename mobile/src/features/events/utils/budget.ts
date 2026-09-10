import { colors } from "@/design-system/tokens/colors";
import { BudgetItem } from "@/types/BudgetItem";
import { Event } from "@/types/Event";

export type BudgetCategoryField =
  | "foodItems"
  | "drinkItems"
  | "decorItems"
  | "outfitItems";

interface CategoryConfig {
  field: BudgetCategoryField;
  title: string;
  screen: string;
  image: number;
  color: string;
}

export const CATEGORY_CONFIG: CategoryConfig[] = [
  {
    field: "foodItems",
    title: "Food",
    screen: "EventEditFood",
    image: require("@/assets/icons/food.png"),
    color: colors.primary
  },
  {
    field: "drinkItems",
    title: "Drink",
    screen: "EventEditDrink",
    image: require("@/assets/icons/drink.png"),
    color: colors.primaryTint
  },
  {
    field: "decorItems",
    title: "Decor",
    screen: "EventEditDecor",
    image: require("@/assets/icons/decor.png"),
    color: colors.primaryTint3
  },
  {
    field: "outfitItems",
    title: "Outfit",
    screen: "EventEditOutfit",
    image: require("@/assets/icons/outfit.png"),
    color: colors.secondary
  }
];

export function getCategorySpend(items: BudgetItem[] | undefined): number {
  return (items || []).reduce((sum, item) => sum + (item.cost || 0), 0);
}

export function getCategoryItemCount(items: BudgetItem[] | undefined): number {
  return (items || []).length;
}

interface CategorySummary {
  spent: number;
  itemCount: number;
}

export interface BudgetSummary {
  totalSpent: number;
  budgetMaximum: number;
  remaining: number;
  overBudget: boolean;
  overAmount: number;
  percentage: number;
  totalItemCount: number;
  perCategory: Record<BudgetCategoryField, CategorySummary>;
}

export function getBudgetSummary(event: Event): BudgetSummary {
  const perCategory = CATEGORY_CONFIG.reduce(
    (acc, category) => {
      const items = event[category.field] as BudgetItem[] | undefined;
      acc[category.field] = {
        spent: getCategorySpend(items),
        itemCount: getCategoryItemCount(items)
      };
      return acc;
    },
    {} as Record<BudgetCategoryField, CategorySummary>
  );

  const totalSpent = CATEGORY_CONFIG.reduce(
    (sum, category) => sum + perCategory[category.field].spent,
    0
  );
  const totalItemCount = CATEGORY_CONFIG.reduce(
    (sum, category) => sum + perCategory[category.field].itemCount,
    0
  );

  const budgetMaximum = event.budgetMaximum || 0;
  const overBudget = budgetMaximum > 0 && totalSpent > budgetMaximum;
  const overAmount = overBudget ? totalSpent - budgetMaximum : 0;
  const remaining = budgetMaximum - totalSpent;
  const percentage =
    budgetMaximum === 0 ? 0 : Math.min(100, (totalSpent / budgetMaximum) * 100);

  return {
    totalSpent,
    budgetMaximum,
    remaining,
    overBudget,
    overAmount,
    percentage,
    totalItemCount,
    perCategory
  };
}

export function getCategoryConfig(field: BudgetCategoryField): CategoryConfig {
  return CATEGORY_CONFIG.find((category) => category.field === field)!;
}
