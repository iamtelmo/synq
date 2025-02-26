"use client";

import React, { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";

import { List, Package, Plus } from "lucide-react";

import { Button } from "@synq/ui/button";
import { Skeleton } from "@synq/ui/skeleton";

import { CreateItemDialog } from "@ui/dialogs/inventory/create-item-dialog";

import { fetchAllItems, fetchInventoryBatches } from "@synq/supabase/queries/inventory";
import { DialogTrigger } from "@synq/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@synq/ui/tabs";
import { AddNewBatchDialog } from "@ui/dialogs/inventory/add-new-batch-dialog";

const BatchesDataTable = lazy(
  () => import("@ui/data-tables/inventory/batches-data-table")
);
const ItemsDataTable = lazy(
  () => import("@ui/data-tables/inventory/items-data-table")
);

const InventoryPage = () => {
  const { data: batches, isLoading: isFetchingBatches } = useQuery({
    queryKey: ["user_inventory_batches"],
    queryFn: fetchInventoryBatches,
  });

  const { data: items, isLoading: isFetchingItems } = useQuery({
    queryKey: ["user_inv_items"],
    queryFn: fetchAllItems,
  });

  return (
    <Tabs defaultValue="items" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="items">
            <List className="h-4 w-4 mr-2" />
            Items
          </TabsTrigger>
          <TabsTrigger value="batches">
            <Package className="h-4 w-4 mr-2" />
            Batches
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Items Tab */}
      <TabsContent value="items">
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          }
        >
          <ItemsDataTable
            data={items || []}
            loading={isFetchingItems}
            actions={<CreateItemDialog />}
          />
        </Suspense>
      </TabsContent>

      {/* Batches Tab */}
       <TabsContent value="batches">
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          }
        >
          <BatchesDataTable
            data={batches || []}
            loading={isFetchingBatches}
            actions={
              <AddNewBatchDialog
                trigger={
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                      New
                    </Button>
                  </DialogTrigger>
                }
              ></AddNewBatchDialog>
            }
          />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
};

export default InventoryPage;
