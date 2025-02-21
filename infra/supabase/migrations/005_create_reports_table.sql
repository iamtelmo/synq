CREATE TABLE public.financial_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_type text NOT NULL CHECK (report_type IN ('P&L', 'Inventory Valuation', 'Sales Tax')),
    report_date timestamp with time zone DEFAULT now(),
    file_path text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);
