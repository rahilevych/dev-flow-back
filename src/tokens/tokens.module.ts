import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
