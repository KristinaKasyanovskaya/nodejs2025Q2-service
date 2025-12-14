import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ValidationPipe } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto.login, signupDto.password);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.login, loginDto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UsePipes(
    new ValidationPipe({
      skipMissingProperties: false,
      whitelist: false,
      forbidNonWhitelisted: false,
      transform: false,
      validateCustomDecorators: false,
      exceptionFactory: () => {
        return new UnauthorizedException('Refresh token is missing');
      },
    }),
  )
  async refresh(@Body() body: any) {
    if (
      !body ||
      !body.refreshToken ||
      typeof body.refreshToken !== 'string' ||
      body.refreshToken.trim() === ''
    ) {
      throw new UnauthorizedException('Refresh token is missing');
    }
    return this.authService.refresh(body.refreshToken);
  }
}
