import React from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createClient } from "@synq/supabase/client";
import {
  fetchItemsView,
  getUserId,
  fetchItemDetails,
  fetchCategories,
  updateItemDetails,
} from "@synq/supabase/queries";
import { itemKeys, categoryKeys, type ItemFilters } from "./keys";
import type {
  ItemTableRow,
  ItemDetails,
  ItemUpdateParams,
} from "@synq/supabase/types";

export function useInfiniteItemsQuery(
  filters: ItemFilters,
  initialData?: ItemTableRow[]
) {
  const supabase = React.useMemo(() => createClient(), []);

  return useInfiniteQuery({
    queryKey: itemKeys.infinite(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const userId = await getUserId();
      const response = await fetchItemsView(supabase, {
        userId,
        page: pageParam,
        searchTerm: filters.searchTerm,
        categoryId: filters.categoryId,
      });
      return {
        data: response.data,
        nextPage: response.data.length === 10 ? pageParam + 1 : 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage || undefined,
    initialData:
      !filters.searchTerm && !filters.categoryId
        ? {
            pages: [{ data: initialData ?? [], nextPage: 2 }],
            pageParams: [1],
          }
        : undefined,
    initialPageParam: 1,
  });
}

export function useItemMutations() {
  const queryClient = useQueryClient();
  const supabase = React.useMemo(() => createClient(), []);

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.rpc('delete_item', { item_id_param: itemId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      itemId,
      updates,
    }: {
      itemId: Pick<ItemDetails, "item_id">;
      updates: ItemUpdateParams;
    }) => {
      await updateItemDetails(supabase, itemId, updates);
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: itemKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["purchase_details"] }),
        queryClient.invalidateQueries({ queryKey: ["purchases"] }),
      ]);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (itemId: string) => {},
  });

  return {
    delete: deleteMutation.mutateAsync,
    update: {
      mutate: updateMutation.mutateAsync,
      isPending: updateMutation.isPending,
    },
    create: createMutation.mutateAsync,
  };
}

export function useItemDetailsQuery(
  itemId: Pick<ItemDetails, "item_id"> | null
) {
  const supabase = React.useMemo(() => createClient(), []);

  return useQuery({
    queryKey: itemKeys.details(itemId?.item_id ?? ""),
    queryFn: () => (itemId ? fetchItemDetails(supabase, itemId) : null),
    enabled: !!itemId,
  });
}

export function useCategoriesQuery() {
  const supabase = React.useMemo(() => createClient(), []);

  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => fetchCategories(supabase),
  });
}
