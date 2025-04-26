export interface DashboardSummary {
    categories: CategorySummary[];
}

export interface CategorySummary {
    name: string;
    total: number;
}