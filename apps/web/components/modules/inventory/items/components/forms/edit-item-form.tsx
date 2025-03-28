"use client";

// REACT
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import React from "react";

// FORM
import { UPDATE_ITEM_SCHEMA } from "@ui/modules/inventory/items/queries/schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// API
import { type ItemDetails } from "@synq/supabase/types";
import { useItemMutations } from "@ui/modules/inventory/items/queries/items";

// UI COMPONENTS
import { Form } from "@synq/ui/form";
import { Label } from "@synq/ui/label";
import { useToast } from "@synq/ui/use-toast";

// SHARED COMPONENTS
import { NumberInput } from "@ui/shared/forms/number-input";
import { TextInput } from "@ui/shared/forms/text-input";
import { SelectInput } from "@ui/shared/forms/select-input";
import { PurchaseBatchCard } from "@ui/modules/inventory/items/components/cards/purchase-batch-card";

interface EditItemFormProps {
  item: ItemDetails;
  categories: { id: string; name: string }[];
  onSuccess?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export const EditItemForm = React.forwardRef<HTMLFormElement, EditItemFormProps>(
  ({ item, categories, onSuccess, onDirtyChange }, ref) => {
    const { toast } = useToast();
    const { update } = useItemMutations();

    const form = useForm({
      resolver: zodResolver(UPDATE_ITEM_SCHEMA),
      defaultValues: {
        name: item.item_name || "",
        sku: item.sku || "",
        listing_price: item.listing_price || 0,
        default_cogs: item.default_cogs || 0,
        inventory_group_id: item.inventory_group_id || "",
      },
    });

    // Reset form when item changes
    useEffect(() => {
      form.reset({
        name: item.item_name || "",
        sku: item.sku || "",
        listing_price: item.listing_price || 0,
        default_cogs: item.default_cogs || 0,
        inventory_group_id: item.inventory_group_id || "",
      });
      // Reset dirty state when item changes
      onDirtyChange?.(false);
    }, [item, form, onDirtyChange]);

    // Watch for form changes
    useEffect(() => {
      const subscription = form.watch(() => {
        const isDirty = Object.keys(form.formState.dirtyFields).length > 0;
        onDirtyChange?.(isDirty);
      });
      return () => subscription.unsubscribe();
    }, [form, onDirtyChange]);

    const onSubmit = async (data: z.infer<typeof UPDATE_ITEM_SCHEMA>) => {
      try {
        if (!item.item_id) throw new Error("Item ID is required");
        await update.mutate({ itemId: { item_id: item.item_id }, updates: data });
        toast({ title: "Success", description: "Item updated!" });
        // Reset form state after successful save
        form.reset({
          name: data.name,
          sku: data.sku || "",
          listing_price: data.listing_price,
          default_cogs: data.default_cogs,
          inventory_group_id: data.inventory_group_id,
        });
        onDirtyChange?.(false);
        onSuccess?.();
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to update item",
        });
      }
    };

    return (
      <Form {...form}>
        <form
          ref={ref}
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col h-full"
        >
          <div className="flex-1 overflow-y-auto space-y-6 p-6">
            {/* Item Name */}
            <TextInput control={form.control} name="name" label="Item Name" />

            {/* COGS and SKU */}
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                control={form.control}
                name="default_cogs"
                label="Default COGS"
              />
              <TextInput
                control={form.control}
                name="sku"
                label="SKU"
              />
            </div>

            {/* Listing Price */}
            <NumberInput
              control={form.control}
              name="listing_price"
              label="Listing Price"
            />

            {/* Category */}
            <SelectInput
              control={form.control}
              name="inventory_group_id"
              label="Inventory Group"
              options={categories}
              placeholder="Select group"
            />

            {/* Purchase History */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Purchase History
              </Label>
              {item.purchase_batches?.length > 0 && (
                <div className="space-y-1">
                  {item.purchase_batches.map((batch, index) => (
                    <PurchaseBatchCard
                      key={`${batch.id}-${index}-${batch.created_at}`}
                      batch={batch}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </Form>
    );
  }
);
