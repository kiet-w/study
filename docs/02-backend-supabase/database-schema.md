# Database schema (Supabase / Postgres)

Nguồn sự thật duy nhất cho schema — mọi thay đổi bảng phải cập nhật ở đây trước khi code.

## Giai đoạn 1 (MVP — chạy trước)

```sql
-- Môn học
create table subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null,          -- hex code, hiển thị chip
  icon text,                    -- tên icon (tabler icon name)
  created_at timestamptz default now()
);

-- Ảnh
create table photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject_id uuid references subjects(id) on delete set null,
  storage_path text not null,          -- path trong bucket "photos"
  thumbnail_path text,
  taken_at timestamptz not null,
  note text,
  sync_status text default 'pending',  -- 'pending' | 'synced'
  created_at timestamptz default now()
);

create index idx_photos_user_subject on photos(user_id, subject_id);
create index idx_photos_taken_at on photos(taken_at desc);
```

## Giai đoạn 2

```sql
-- Chương/buổi học trong 1 môn
create table folders (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id) on delete cascade not null,
  name text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table photos add column folder_id uuid references folders(id) on delete set null;
```

## Giai đoạn 3 (tương lai — nhóm chat, chưa chạy)

```sql
create table groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) not null,
  name text not null,
  invite_code text unique not null,
  created_at timestamptz default now()
);

create table group_members (
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);

create table photo_comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references photos(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  content text not null,
  created_at timestamptz default now()
);
```

## Giai đoạn 4 (tương lai — AI, chưa chạy)

```sql
alter table photos add column ocr_text text;
alter table photos add column ai_summary text;
alter table photos add column ai_status text default 'not_processed'; -- 'not_processed' | 'queued' | 'done' | 'failed'
```

## Giai đoạn 5 (tương lai — lịch học, chưa chạy)

```sql
create table class_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  subject_id uuid references subjects(id) on delete cascade not null,
  weekday int not null,      -- 0 = Chủ nhật ... 6 = Thứ 7
  start_time time not null,
  end_time time not null
);
```
