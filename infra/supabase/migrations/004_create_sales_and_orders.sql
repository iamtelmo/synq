CREATE TABLE user_sales_batches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    status text CHECK (status IN ('draft', 'listed', 'completed')) DEFAULT 'draft',
    created_at timestamptz DEFAULT now(),
    listed_at timestamptz
);

CREATE TABLE user_sales_batch_items (
    sales_batch_id uuid NOT NULL REFERENCES user_sales_batches(id) ON DELETE CASCADE,
    inventory_id uuid NOT NULL REFERENCES user_inventory(id) ON DELETE CASCADE,
    listing_price numeric(10,2) NOT NULL CHECK (listing_price >= 0),
    quantity_to_list integer NOT NULL CHECK (quantity_to_list >= 1),
    ebay_category_id text,
    status text CHECK (status IN ('pending', 'listed', 'sold')) DEFAULT 'pending',
    PRIMARY KEY (sales_batch_id, inventory_id),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE user_listings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    inventory_id uuid NOT NULL REFERENCES user_inventory(id) ON DELETE CASCADE,
    sales_batch_id uuid REFERENCES user_sales_batches(id) ON DELETE SET NULL,
    ebay_listing_id text NOT NULL,
    quantity_sold integer NOT NULL DEFAULT 0 CHECK (quantity_sold >= 0),
    sale_price numeric(10,2),
    listed_at timestamptz DEFAULT now(),
    sold_at timestamptz,
    created_at timestamptz DEFAULT now()
);

CREATE TYPE user_sales_batch_item_details AS (
    inventory_id uuid,
    listing_price numeric(10,2),
    quantity_to_list integer,
    ebay_category_id text
);

CREATE OR REPLACE FUNCTION create_sales_batch(
    p_user_id uuid,
    p_name text,
    p_items user_sales_batch_item_details[]
)
RETURNS uuid AS $$
DECLARE
    v_sales_batch_id uuid;
    item user_sales_batch_item_details;
BEGIN
    -- Insert the new sales batch and capture its id
    INSERT INTO user_sales_batches(user_id, name)
    VALUES (p_user_id, p_name)
    RETURNING id INTO v_sales_batch_id;

    -- Insert each item into the sales batch items table
    FOREACH item IN ARRAY p_items
    LOOP
        INSERT INTO user_sales_batch_items(
            sales_batch_id,
            inventory_id,
            listing_price,
            quantity_to_list,
            ebay_category_id
        )
        VALUES (
            v_sales_batch_id,
            item.inventory_id,
            item.listing_price,
            item.quantity_to_list,
            item.ebay_category_id
        );
    END LOOP;

    RETURN v_sales_batch_id;
END;
$$ LANGUAGE plpgsql;
