# Rule 02 — Code Style (TypeScript + React Native + NestJS)

## 1. General TypeScript Guidelines

```ts
// ✅ Explicit types, tuyệt đối không dùng `any`
const uploadPhoto = async (photo: Photo): Promise<void> => { ... }

// ❌ Không dùng type any
const upload = async (photo: any) => { ... }
```

- Dùng `interface` cho Object shapes / DTO definitions, `type` cho Unions hoặc Utility types.
- Tuyệt đối không dùng `as any`. Nếu bắt buộc cast type thì dùng `as unknown as T` kèm giải thích.
- Sử dụng Optional Chaining `?.` và Nullish Coalescing `??`:
  ```ts
  const name = category?.name ?? 'Không có tên'
  ```

---

## 2. NestJS Backend Code Style (`backend/src/`)

### A. Controllers (`*.controller.ts`)
- Sử dụng NestJS Decorators: `@Controller('path')`, `@Get()`, `@Post()`, `@Body()`, `@Param()`, `@Query()`.
- Gắn Swagger decorators cho tất cả endpoints: `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`.
- Controllers **chỉ làm nhiệm vụ điều hướng request & response**, không được chứa logic nghiệp vụ hay truy vấn database trực tiếp.

```ts
@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo danh mục/môn học mới' })
  @ApiResponse({ status: 201, description: 'Tạo danh mục thành công' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }
}
```

### B. Services (`*.service.ts`)
- Sử dụng decorator `@Injectable()`.
- Inject `PrismaService` qua constructor injection.
- Xử lý toàn bộ logic nghiệp vụ, gọi Prisma DB query, và throw `HttpException` (như `BadRequestException`, `NotFoundException`).

```ts
@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: dto,
    });
  }
}
```

### C. DTOs (`dto/*.dto.ts`)
- Đặt tên file theo định dạng: `create-*.dto.ts`, `update-*.dto.ts`, `query-*.dto.ts`.
- Gắn `class-validator` và `@nestjs/swagger` decorators trên từng thuộc tính:

```ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'ID người sở hữu từ Supabase Auth' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Tên danh mục/môn học' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Mã màu Hex' })
  @IsString()
  @IsOptional()
  color?: string;
}
```

---

## 3. React Native Mobile Code Style (`frontend/src/`)

### A. Components Structure
```tsx
import React from 'react'
import { View, Text } from 'react-native'
import { Subject } from '@/types'

interface SubjectChipProps {
  subject: Subject
  selected: boolean
  onPress: () => void
}

export function SubjectChip({ subject, selected, onPress }: SubjectChipProps) {
  return (
    <View className={`px-3 py-1 rounded-full ${selected ? 'opacity-100' : 'opacity-60'}`}
          style={{ backgroundColor: subject.color }}>
      <Text className="text-white text-sm font-medium">{subject.icon} {subject.name}</Text>
    </View>
  )
}
```

- Sử dụng **NativeWind** (`className`) cho layout, spacing, typography. Dùng `style={}` cho dynamic styles (như màu từ database).
- Named exports cho components. Không dùng Default export.
- Mỗi component 1 file, PascalCase trùng tên file. Không để file quá 150 dòng.

### B. Custom Hooks
- Tên hook bắt đầu bằng `use` (`useSubjects.ts`, `usePhotos.ts`).
- Trả về object `{ subjects, loading, error, refetch }`.

---

## 4. File Naming Rules Across Monorepo

```
backend/src/modules/*/       → kebab-case.ts    (categories.controller.ts, create-category.dto.ts)
frontend/src/components/     → PascalCase.tsx   (CreateSubjectModal.tsx)
frontend/src/hooks/          → camelCase.ts     (useSubjects.ts)
frontend/src/lib/            → camelCase.ts     (subjectService.ts)
```
