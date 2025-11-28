export interface Smoke {
    id: number;
    name: string;
    notes: string | null;
    created_at: string;
}

export interface Item {
    id: number;
    smoke_id: number;
    name: string;
    type: string; // Animal: porc, canard, boeuf, saumon, etc.
    icon: string | null; // Lucide icon name
    cut: string | null;
    initial_weight: number | null;
    diameter: number | null;
    target_weight: number | null;
    curing_method: 'vacuum' | 'traditional' | null;
    status: 'prep' | 'curing' | 'rinsing' | 'drying' | 'smoking' | 'aging' | 'done';
    created_at: string;

    // Curing details
    salt_amount: number | null;
    sugar_amount: number | null;
    pepper_amount: number | null;
    spices: string | null;
    curing_start_date: string | null;
    curing_end_date: string | null;

    // Process dates
    rinsing_date: string | null;
    drying_start_date: string | null;
    smoking_date: string | null;
    aging_start_date: string | null;
}

export interface WeightLog {
    id: number;
    item_id: number;
    date: string;
    weight: number;
}

export type ItemStatus = Item['status'];
export type CuringMethod = Item['curing_method'];
export type AnimalType = Item['type'];
