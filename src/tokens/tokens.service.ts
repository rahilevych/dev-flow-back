import { Injectable, NotFoundException } from '@nestjs/common';

import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class TokensService {
  constructor(private db: DatabaseService) {}
  async saveTokenToDB(token: string, userId: string) {
    return this.db.refreshToken.upsert({
      where: { userId },
      update: {
        token,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      create: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
    });
  }
  async findRefreshToken(refreshToken: string) {
    const token = await this.db.refreshToken.findFirst({
      where: {
        token: refreshToken,
      },
    });
    if (!token) throw new NotFoundException('Token not found');
    return token;
  }
  async deleteTokenFromDB(token: string) {
    return await this.db.refreshToken.deleteMany({
      where: {
        token,
      },
    });
  }
}
