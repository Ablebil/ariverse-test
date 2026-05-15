import type { PaginationMeta } from "./api";

export interface GameCard {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  description: string;
  developer: string;
  publisher: string;
  releaseDate: string;
  rating: number;
  price: number;
  featured: boolean;
  genres: string[];
  platforms: string[];
}

export interface GameDetail extends GameCard {
  screenshots: string[];
  longDescription: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GamesResponse {
  games: GameCard[];
  pagination: PaginationMeta;
}

export type SortOption =
  | "rating_desc"
  | "rating_asc"
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc";

export interface GamesQuery {
  search?: string;
  genres?: string[];
  platforms?: string[];
  sort?: SortOption;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface WishlistItem {
  game: GameCard;
  createdAt: string;
}

export interface WishlistResponse {
  wishlist: WishlistItem[];
  pagination: PaginationMeta;
}
