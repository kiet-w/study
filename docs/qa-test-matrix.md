# 🧪 StudySnap API QA Test Matrix

Tài liệu Ma trận Kiểm thử API (QA Test Matrix) theo chuẩn QA Automation Engineering cho hệ thống **StudySnap REST API (NestJS)**.

---

## 1. Scope & Modules Coverage

| Module | Base Path | Methods | Core Responsibility |
|:-------|:----------|:--------|:--------------------|
| **Health** | `/api/health` | `GET` | System health check & uptime |
| **Categories** | `/api/categories` | `POST`, `GET`, `GET :id`, `PATCH :id`, `DELETE :id` | Quản lý môn học / danh mục bài giảng |
| **Topics** | `/api/topics` | `POST`, `GET`, `GET :id`, `PATCH :id`, `DELETE :id` | Quản lý chương / chủ đề thuộc môn học |
| **Photos** | `/api/photos` | `POST`, `POST /sync`, `GET`, `GET :id`, `PATCH :id`, `DELETE :id` | Quản lý ảnh bài giảng & đồng bộ offline-first |
| **Users** | `/api/users` | `POST`, `GET`, `GET :id`, `PATCH :id`, `DELETE :id` | Profile sync & thông tin người dùng |

---

## 2. Detailed Test Cases Matrix

### 🟢 Category Module (`/api/categories`)

| ID | Test Case Title | Input / Payload | Expected Status | Expected Output | Security / Isolation Check |
|:---|:----------------|:----------------|:----------------|:----------------|:---------------------------|
| `CAT-01` | Create Category (Happy Path) | `{ "name": "Giải Tích 1", "color": "#3B82F6", "icon": "🧮" }` | `201 Created` | Object chứa `id`, `name`, `color`, `icon`, `userId` | User ID tự gán khớp người dùng gọi API |
| `CAT-02` | Create Category (Missing Name) | `{ "color": "#3B82F6" }` | `400 Bad Request` | Validation Error message array | Input Validation |
| `CAT-03` | Create Category (Name > 50 chars) | `{ "name": "A...51 chars" }` | `400 Bad Request` | Validation Error | Constraint Check |
| `CAT-04` | Get All Categories for Current User | Query params / User Header | `200 OK` | Array categories thuộc về User | **Chỉ trả về categories của User hiện tại** |
| `CAT-05` | Get Category by ID (Existing & Owned) | Category ID hợp lệ | `200 OK` | Category Object | User A đọc Category của User A |
| `CAT-06` | Get Category by ID (Belongs to User B) | Category ID của User B | `404 Not Found` | Exception Not Found | **User A KHÔNG ĐỌC ĐƯỢC dữ liệu User B** |
| `CAT-07` | Update Category (Owned) | `{ "name": "Giải Tích Nâng Cao" }` | `200 OK` | Object đã update | Owned verification |
| `CAT-08` | Update Category (Owned by User B) | Category ID của User B | `404 Not Found` | Not Found Exception | **User A KHÔNG SỬA ĐƯỢC dữ liệu User B** |
| `CAT-09` | Delete Category (Owned) | Category ID hợp lệ | `200 OK` | Success confirmation | Cascade check |
| `CAT-10` | Delete Category (Owned by User B) | Category ID của User B | `404 Not Found` | Not Found Exception | **User A KHÔNG XÓA ĐƯỢC dữ liệu User B** |

---

### 🟡 Topic Module (`/api/topics`)

| ID | Test Case Title | Input / Payload | Expected Status | Expected Output | Security / Isolation Check |
|:---|:----------------|:----------------|:----------------|:----------------|:---------------------------|
| `TOP-01` | Create Topic (Happy Path) | `{ "name": "Chương 1: Tích Phân", "categoryId": "uuid..." }` | `201 Created` | Topic Object với `categoryId` | Belongs to user & valid category |
| `TOP-02` | Create Topic (Missing Name) | `{ "categoryId": "uuid..." }` | `400 Bad Request` | Validation Error | Input Validation |
| `TOP-03` | Get All Topics | User Header | `200 OK` | Array topics | Lọc đúng `user_id` |
| `TOP-04` | Get Topic by ID (Owned by User B) | Topic ID của User B | `404 Not Found` | Not Found Exception | **User Isolation Check** |
| `TOP-05` | Patch Topic (Owned by User B) | Topic ID của User B | `404 Not Found` | Not Found Exception | **User Isolation Check** |
| `TOP-06` | Delete Topic (Owned by User B) | Topic ID của User B | `404 Not Found` | Not Found Exception | **User Isolation Check** |

---

### 📸 Photo Module (`/api/photos`)

| ID | Test Case Title | Input / Payload | Expected Status | Expected Output | Security / Isolation Check |
|:---|:----------------|:----------------|:----------------|:----------------|:---------------------------|
| `PHO-01` | Create Photo Record | `{ "storagePath": "photos/p1.jpg", "takenAt": "2026-08-11T00:00:00Z" }` | `201 Created` | Photo Object với `synced: true` | Validates ISO date & storage path |
| `PHO-02` | Create Photo (Missing storagePath) | `{ "takenAt": "2026-08-11T00:00:00Z" }` | `400 Bad Request` | Validation Error | Mandatory Field Check |
| `PHO-03` | Batch Sync Offline Photos | `{ "photos": [{ "storagePath": "p1.jpg", "takenAt": "..." }] }` | `201 Created` | Array synced photos | Multi-record transaction & sync status |
| `PHO-04` | Get Photo by ID (Owned by User B) | Photo ID của User B | `404 Not Found` | Not Found Exception | **User Isolation Check** |
| `PHO-05` | Update Photo Note (Owned by User B) | Photo ID của User B | `404 Not Found` | Not Found Exception | **User Isolation Check** |

---

## 3. Automation Execution Tools

- **Jest + Supertest:** E2E Integration Testing trong NestJS (`npm run test:e2e`).
- **Postman / Newman CLI:** API Test Suite execution từ terminal.
- **k6 Load Testing:** Kịch bản giả lập tải & đo thời gian phản hồi API dưới tải cao.
