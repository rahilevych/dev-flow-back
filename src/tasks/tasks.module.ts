import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { DatabaseModule } from 'src/database/database.module';
import { MembersModule } from 'src/members/members.module';

@Module({
  imports: [DatabaseModule, MembersModule],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
