# Cấu trúc thư mục source code

Áp dụng tinh thần Feature-Sliced Design (FSD) tương tự webapp hiện tại, rút gọn cho quy mô mobile app — giúp AI coding tool và người code sau này biết ngay 1 file mới nên nằm ở đâu.

```
app/                        # Expo Router — chỉ chứa file định tuyến (screen thin wrapper)
  (tabs)/
    capture.tsx
    library.tsx
    subjects.tsx
  _layout.tsx

src/
  shared/                    # Không phụ thuộc business logic — dùng chung toàn app
    ui/
      atoms/                  # Button, Chip, Icon...
      molecules/               # SubjectChip, PhotoThumbnail...
    lib/                       # supabase client, storage helpers, formatters
    config/                    # constants, env

  entities/                   # Đối tượng nghiệp vụ thuần (type + API call, ít logic UI)
    subject/                    # Subject type, subjectApi (CRUD)
    photo/                      # Photo type, photoApi

  features/                    # 1 hành động nghiệp vụ cụ thể = 1 feature
    capture-photo/                # logic chụp + gắn môn ngay lúc chụp
    manage-subjects/              # CRUD môn học
    sync-photos/                  # upload nền, retry khi mất mạng

  widgets/                     # Ghép nhiều feature/entity thành 1 khối UI lớn
    photo-grid/                   # lưới ảnh có filter theo môn/ngày
    capture-flow/                  # toàn bộ màn hình chụp (camera + chip chọn môn)

  screens/                     # Nội dung thật của từng screen, import từ widgets
    CaptureScreen.tsx
    LibraryScreen.tsx
    SubjectsScreen.tsx
```

## Quy tắc import (giữ nguyên tinh thần FSD của webapp)

- `features/` không được import lẫn nhau — nếu 2 feature cần dùng chung logic, đưa xuống `entities/` hoặc `shared/`.
- File trong `app/` chỉ import từ `screens/`, không viết logic trực tiếp trong đó.
- `entities/` không được import từ `features/` hay `widgets/` — chiều phụ thuộc chỉ đi xuống: `app → screens → widgets → features → entities → shared`.
