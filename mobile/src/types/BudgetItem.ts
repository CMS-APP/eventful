export interface BudgetItem {
  item: string;
  cost: number | null;
  quantity?: number;
  paid?: boolean;
}
