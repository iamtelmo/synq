CREATE TABLE public.subscription_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE, -- e.g., 'Basic', 'Pro', 'Enterprise'
    price numeric(10, 2) NOT NULL CHECK (price >= 0),
    billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    description text NULL, -- Short details about the plan
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.user_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    status text NOT NULL CHECK (status IN ('active', 'canceled', 'expired')),
    started_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone NOT NULL, -- Auto-calculate based on billing cycle
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.subscription_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    old_plan_id uuid NULL REFERENCES subscription_plans(id) ON DELETE SET NULL, -- Previous plan
    new_plan_id uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE, -- New plan
    change_type text NOT NULL CHECK (change_type IN ('upgrade', 'downgrade', 'cancellation', 'renewal')),
    changed_at timestamp with time zone DEFAULT now()
);
