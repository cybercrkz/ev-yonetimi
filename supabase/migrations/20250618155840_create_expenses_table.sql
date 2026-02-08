-- Önce mevcut tabloyu sil
drop table if exists public.expenses;

-- Giderler tablosunu oluştur
create table public.expenses (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone not null default now(),
    user_id uuid not null references auth.users(id) on delete cascade,
    category text not null,
    description text not null,
    amount decimal(10,2) not null check (amount >= 0),
    date date not null,
    payment_method text not null check (payment_method in ('nakit', 'kredi_karti', 'banka_karti', 'havale_eft')),
    constraint expenses_pkey primary key (id)
);

-- RLS politikalarını ayarla
alter table public.expenses enable row level security;

create policy "Kullanıcılar kendi giderlerini görebilir"
    on public.expenses for select
    using (auth.uid() = user_id);

create policy "Kullanıcılar kendi giderlerini ekleyebilir"
    on public.expenses for insert
    with check (auth.uid() = user_id);

create policy "Kullanıcılar kendi giderlerini güncelleyebilir"
    on public.expenses for update
    using (auth.uid() = user_id);

create policy "Kullanıcılar kendi giderlerini silebilir"
    on public.expenses for delete
    using (auth.uid() = user_id);
