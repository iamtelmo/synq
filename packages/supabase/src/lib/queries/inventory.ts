import { SupabaseClient } from "@supabase/supabase-js";
import {
  InventoryGroup,
  InventoryItemWithDetails,
  Purchase,
  PurchaseBatch,
  CreateItemParams,
  CreatePurchaseParams,
} from "../types/inventory";

// Error handling utility
function handleSupabaseError(error: any, operation: string): never {
  throw new Error(`${operation} failed: ${error.message}`);
}

// Categories
export async function fetchCategories(
  supabase: SupabaseClient,
): Promise<InventoryGroup[]> {
  const { data, error } = await supabase
    .from("user_inventory_groups")
    .select("*")
    .order("name");

  if (error) handleSupabaseError(error, "Categories fetch");
  return data;
}

// Inventory Items
export async function fetchInventoryItems(
  supabase: SupabaseClient,
  includeArchived: boolean = false,
): Promise<InventoryItemWithDetails[]> {
  let query = supabase
    .from("user_inventory_items")
    .select(
      `
      *,
      category:user_inventory_groups (
        name
      )
    `,
    )
    .order("name");

  if (!includeArchived) {
    query = query.eq("is_archived", false);
  }

  const { data, error } = await query;

  if (error) handleSupabaseError(error, "Inventory items fetch");
  return data.map((item) => ({
    ...item,
    category: item.category?.name,
  }));
}

export async function createCustomItem(
  supabase: SupabaseClient,
  params: CreateItemParams,
): Promise<void> {
  const { error } = await supabase.from("user_inventory_items").insert({
    user_id: params.userId,
    inventory_group_id: params.categoryId,
    name: params.name,
    sku: params.sku,
    default_cogs: params.cogs,
    listing_price: params.listingPrice,
    is_archived: false,
  });

  if (error) handleSupabaseError(error, "Item creation");
}

export async function deleteInventoryItem(
  supabase: SupabaseClient,
  itemId: string,
): Promise<void> {
  const { error } = await supabase
    .from("user_inventory_items")
    .delete()
    .eq("id", itemId);

  if (error) handleSupabaseError(error, "Item deletion");
}

// Purchases
export async function fetchPurchases(
  supabase: SupabaseClient,
  userId: string,
): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from("vw_purchases_ui_table")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) handleSupabaseError(error, "Purchases fetch");
  return data;
}

export async function fetchPurchaseDetails(
  supabase: SupabaseClient,
  purchaseId: string,
): Promise<Purchase> {
  const { data, error } = await supabase
    .from("vw_purchases_ui_table")
    .select("*")
    .eq("id", purchaseId)
    .single();

  if (error) handleSupabaseError(error, "Purchase details fetch");
  return data;
}

export async function createPurchase(
  supabase: SupabaseClient,
  params: CreatePurchaseParams,
): Promise<PurchaseBatch> {
  // Create purchase batch
  const { data: batch, error: batchError } = await supabase
    .from("user_purchase_batches")
    .insert({
      name: params.name,
      user_id: params.userId,
    })
    .select()
    .single();

  if (batchError) handleSupabaseError(batchError, "Purchase batch creation");

  // Create purchase items
  const { error: itemsError } = await supabase
    .from("user_purchase_items")
    .insert(
      params.items.map(
        (item: { item_id: string; quantity: number; unit_cost: number }) => ({
          batch_id: batch.id,
          item_id: item.item_id,
          quantity: item.quantity,
          remaining_quantity: item.quantity,
          unit_cost: item.unit_cost,
          user_id: params.userId,
        }),
      ),
    );

  if (itemsError) handleSupabaseError(itemsError, "Purchase items creation");

  return batch;
}

export async function addItemToPurchase(
  supabase: SupabaseClient,
  batchId: string,
  itemId: string,
  quantity: number,
  unitCost: number,
  userId: string,
): Promise<void> {
  const { error } = await supabase.from("user_purchase_items").insert({
    batch_id: batchId,
    item_id: itemId,
    quantity,
    remaining_quantity: quantity,
    unit_cost: unitCost,
    user_id: userId,
  });

  if (error) handleSupabaseError(error, "Add item to purchase");
}

export async function updatePurchaseItem(
  supabase: SupabaseClient,
  itemId: string,
  updates: {
    quantity?: number;
    unit_cost?: number;
  },
): Promise<void> {
  const { error } = await supabase
    .from("user_purchase_items")
    .update({
      ...updates,
      remaining_quantity: updates.quantity,
    })
    .eq("id", itemId);

  if (error) handleSupabaseError(error, "Update purchase item");
}

export async function archivePurchase(
  supabase: SupabaseClient,
  purchaseId: string,
): Promise<void> {
  const { error } = await supabase
    .from("user_purchase_batches")
    .update({ status: "archived" })
    .eq("id", purchaseId);

  if (error) handleSupabaseError(error, "Purchase archive");
}

export async function restorePurchase(
  supabase: SupabaseClient,
  purchaseId: string,
): Promise<void> {
  const { error } = await supabase
    .from("user_purchase_batches")
    .update({ status: "active" })
    .eq("id", purchaseId);

  if (error) handleSupabaseError(error, "Purchase restore");
}

export async function archiveItem(
  supabase: SupabaseClient,
  itemId: string,
): Promise<void> {
  const { error } = await supabase
    .from("user_inventory_items")
    .update({ is_archived: true })
    .eq("id", itemId);

  if (error) handleSupabaseError(error, "Item archive");
}

export async function restoreItem(
  supabase: SupabaseClient,
  itemId: string,
): Promise<void> {
  const { error } = await supabase
    .from("user_inventory_items")
    .update({ is_archived: false })
    .eq("id", itemId);

  if (error) handleSupabaseError(error, "Item restore");
}
