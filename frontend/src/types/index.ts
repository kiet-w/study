export interface Category {
  id: string;
  user_id: string;
  name: string;
  color?: string | null;
  icon?: string | null;
  sort_order: number;
  created_at: string;
}

export interface CreateCategoryInput {
  name: string;
  color: string;
  icon: string;
}

export interface Topic {
  id: string;
  user_id: string;
  category_id?: string | null;
  name: string;
  color?: string | null;
  icon?: string | null;
  sort_order: number;
  created_at: string;
}

export interface CreateTopicInput {
  category_id?: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface Photo {
  id: string;
  user_id: string;
  category_id?: string | null;
  topic_id?: string | null;
  storage_path: string;
  thumbnail_path?: string | null;
  note?: string | null;
  taken_at: string;
  sort_order: number;
  synced: boolean;
  created_at: string;
}
