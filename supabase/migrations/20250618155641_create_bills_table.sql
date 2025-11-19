-- Faturalar tablosunu oluştur
create table public.bills (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone not null default now(),
    user_id uuid not null references auth.users(id) on delete cascade,
    bill_type text not null,
    amount decimal(10,2) not null check (amount >= 0),
    due_date date not null,
    payment_date timestamp with time zone,
    notes text,
    status text not null check (status in ('pending', 'completed')) default 'pending',
    constraint bills_pkey primary key (id)
);

-- RLS politikalarını ayarla
alter table public.bills enable row level security;

create policy "Kullanıcılar kendi faturalarını görebilir"
    on public.bills for select
    using (auth.uid() = user_id);

create policy "Kullanıcılar kendi faturalarını ekleyebilir"
    on public.bills for insert
    with check (auth.uid() = user_id);

create policy "Kullanıcılar kendi faturalarını güncelleyebilir"
    on public.bills for update
    using (auth.uid() = user_id);

create policy "Kullanıcılar kendi faturalarını silebilir"
    on public.bills for delete
    using (auth.uid() = user_id);
