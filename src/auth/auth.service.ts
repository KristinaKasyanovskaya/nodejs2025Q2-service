import {
  Injectable,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../user/user.service';

export interface TokenPayload {
  userId: string;
  login: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
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
      throw new ForbiddenException('Invalid login or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid login or password');
    }

    const payload: TokenPayload = {
      userId: user.id,
      login: user.login,
    };

    return this.generateTokens(payload);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const refreshSecret =
      process.env.JWT_SECRET_REFRESH_KEY ||
      process.env.JWT_SECRET ||
      'your-secret-key';

    try {
      const payload = jwt.verify(refreshToken, refreshSecret) as TokenPayload &
        jwt.JwtPayload;

      if (!payload.userId || !payload.login) {
        throw new ForbiddenException('Invalid refresh token');
      }

      const tokenPayload: TokenPayload = {
        userId: payload.userId,
        login: payload.login,
      };

      return this.generateTokens(tokenPayload);
    } catch (error) {
      throw new ForbiddenException('Invalid or expired refresh token');
    }
  }

  private generateTokens(payload: TokenPayload): AuthResponse {
    const accessToken = this.jwtService.sign(payload);

    const refreshSecret =
      process.env.JWT_SECRET_REFRESH_KEY ||
      process.env.JWT_SECRET ||
      'your-secret-key';

    const refreshToken = jwt.sign(payload, refreshSecret, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
