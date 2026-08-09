import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/prisma/prisma.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TopicsModule } from './modules/topics/topics.module';
import { PhotosModule } from './modules/photos/photos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CategoriesModule,
    TopicsModule,
    PhotosModule,
  ],
})
export class AppModule {}


