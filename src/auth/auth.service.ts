import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';

export interface TokenPayload {
  userId: string;
  login: string;
}

export interface AuthResponse {
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(login: string, password: string) {
    const users = this.userService.findAll();
    const existingUser = users.find((user) => user.login === login);
    if (existingUser) {
      throw new ConflictException('User with this login already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await this.userService.create({
      login,
      password: hashedPassword,
    });

    return {
      id: user.id,
      login: user.login,
      version: user.version,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async login(login: string, password: string): Promise<AuthResponse> {
    const users = this.userService.findAll();
    const user = users.find((user) => user.login === login);

    if (!user) {
      throw new UnauthorizedException('Invalid login or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid login or password');
    }

    const payload: TokenPayload = {
      userId: user.id,
      login: user.login,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
    };
  }
}
