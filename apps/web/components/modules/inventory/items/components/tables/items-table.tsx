"use server";

import { createClient } from "@synq/supabase/server";
import { fetchItemsView, getUserId } from "@synq/supabase/queries";
import { ItemsTableClient } from "./items-table-client";

async function getItems() {
  const supabase = await createClient();
  const userId = await getUserId();
  const showArchived = true;

  const result = await fetchItemsView(supabase, {
    userId,
    page: 1,
    includeArchived: showArchived,
  });

  return result.data;
}

export default async function ItemsTable() {
  const items = await getItems();

  return <ItemsTableClient items={items} />;
}
