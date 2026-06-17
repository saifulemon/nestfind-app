import { Injectable, ConflictException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseService } from '../../core/base/base.service';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    private readonly userRepository: UserRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(userRepository, 'User');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findByEmailWithPassword(email);
  }

  async createUser(data: Partial<User>): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existing = await queryRunner.manager.findOne(User, { where: { email: data.email } });
      if (existing) {
        throw new ConflictException('Email already exists!');
      }

      const user = await queryRunner.manager.save(queryRunner.manager.create(User, data));
      await queryRunner.commitTransaction();
      return user;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof ConflictException) throw err;
      throw new ConflictException('Email already exists!');
    } finally {
      await queryRunner.release();
    }
  }
}
