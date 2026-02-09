import { PickType } from '@nestjs/swagger';
import { RegisterDto } from './create-user.dto';

export class LoginDto extends PickType(RegisterDto, [
  'email',
  'password',
] as const) {}
