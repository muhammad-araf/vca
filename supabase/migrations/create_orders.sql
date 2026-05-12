-- SQL to create the orders table for Kababjees AI Waiter
-- Run this in the Supabase SQL Editor

create table orders (
  id bigint generated always as identity primary key,
  customer_name text,
  phone text,
  address text,
  items jsonb, -- Stores [{name, qty, price}]
  total numeric,
  transcript text,
  status text default 'pending',
  order_type text, -- 'pickup' or 'delivery'
  created_at timestamp with time zone default now()
);

-- Enable Realtime for the orders table
-- This is required for the Admin Dashboard to update instantly
alter publication supabase_realtime add table orders;

-- Enable Row Level Security (RLS)
-- For this MVP, we'll allow anyone to insert but only authenticated (or specific) users to view
alter table orders enable row level security;

-- Policy: Anyone can insert orders (for the customer-facing agent)
create policy "Anyone can insert orders"
on orders for insert
with check (true);

-- Policy: Only authenticated users can view/manage orders (for the admin dashboard)
-- Note: In a real app, you'd restrict this further.
create policy "Authenticated users can manage orders"
on orders for all
using (auth.role() = 'authenticated');
