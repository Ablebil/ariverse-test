import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  gameIds: string[];
  add: (gameId: string) => void;
  remove: (gameId: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      gameIds: [],
      add: (gameId) =>
        set((state) => ({
          gameIds: state.gameIds.includes(gameId)
            ? state.gameIds
            : [...state.gameIds, gameId],
        })),
      remove: (gameId) =>
        set((state) => ({
          gameIds: state.gameIds.filter((id) => id !== gameId),
        })),
      clear: () => set({ gameIds: [] }),
    }),
    {
      name: "guest-wishlist",
    }
  )
);
