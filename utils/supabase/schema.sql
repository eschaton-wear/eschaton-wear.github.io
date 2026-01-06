-- Create chats table
create table public.chats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null default 'New Chat',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references public.chats on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.chats enable row level security;
alter table public.messages enable row level security;

-- Policies for chats
create policy "Users can view own chats"
  on public.chats for select
  using (auth.uid() = user_id);

create policy "Users can insert own chats"
  on public.chats for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own chats"
  on public.chats for delete
  using (auth.uid() = user_id);

-- Policies for messages
create policy "Users can view messages from own chats"
  on public.messages for select
  using (
    exists (
      select 1 from public.chats
      where public.chats.id = public.messages.chat_id
      and public.chats.user_id = auth.uid()
    )
  );

create policy "Users can insert messages to own chats"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.chats
      where public.chats.id = public.messages.chat_id
      and public.chats.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at on chats when content changes
create trigger on_chat_updated
  before update on public.chats
  for each row
  execute procedure public.handle_updated_at();

