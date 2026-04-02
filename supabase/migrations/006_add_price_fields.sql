ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS price_system TEXT,
  ADD COLUMN IF NOT EXISTS first_visit_budget TEXT;
