import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { User } from '../interfaces';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UserService {
  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    let hashedPassword: string;
    if (createUserDto.password.startsWith('$2')) {
      hashedPassword = createUserDto.password;
    } else {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
    }

    const now = Date.now();
    const newUser: User = {
      id: randomUUID(),
      login: createUserDto.login,
      password: hashedPassword,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    this.users.push(newUser);
    return newUser;
  }

  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<User> {
    const user = this.findOne(id);

    const isOldPasswordValid = await bcrypt.compare(
      updatePasswordDto.oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new ForbiddenException('oldPassword is wrong');
    }

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(
      updatePasswordDto.newPassword,
      saltRounds,
    );

    user.password = hashedNewPassword;
    user.version += 1;
    user.updatedAt = Date.now();

    return user;
  }

  remove(id: string): void {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.users.splice(userIndex, 1);
  }
}
