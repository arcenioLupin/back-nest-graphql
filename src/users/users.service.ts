/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { SignupInput } from 'src/auth/dto/inputs/signup.input';
import * as bcrypt from 'bcrypt';
import { ValidRoles } from '../auth/enums/valid-roles.enum';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

@Injectable()
export class UsersService {
  private logger = new Logger('UserService');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(signupInput: SignupInput): Promise<User> {
    try {
      const newUser = this.usersRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10),
      });
      return await this.usersRepository.save(newUser);
    } catch (error) {
      console.log(error);
      this.handleDBErrors(error);
    }
  }

  async findAll(
    roles: ValidRoles[],
    paginationsArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<User[]> {
    const { limit, offset } = paginationsArgs;
    const { search } = searchArgs;

    const queryBuilder = this.usersRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset);

    if (search) {
      console.log('entró: ', search.toLowerCase());
      queryBuilder.andWhere(`LOWER("fullName") like :fullName`, {
        fullName: `%${search.toLowerCase()}%`,
      });
    }

    if (roles.length !== 0) {
      queryBuilder.andWhere('ARRAY[roles] && ARRAY[:...roles]');
      queryBuilder.setParameter('roles', roles);
    }

    return queryBuilder.getMany();
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ email });
    } catch (error) {
      this.handleDBErrors({
        code: 'error-001',
        detail: `${email} not found`,
      });
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException(`${id} not found`);
    }
  }

  async update(
    id: string,
    updateUserInput: UpdateUserInput,
    updateBy: User,
  ): Promise<User> {
    try {
      const userToUpdate = await this.usersRepository.preload({
        ...updateUserInput,
        id,
      });
      if (!userToUpdate)
        throw new NotFoundException(
          `No found user with id: ${userToUpdate.id}`,
        );
      userToUpdate.lastUpdateBy = updateBy;
      return await this.usersRepository.save(userToUpdate);
    } catch (error) {
      this.handleDBErrors({
        code: 'error-003',
        detail: error,
      });
    }
  }

  async block(id: string, adminUser: User): Promise<User> {
    const userToBlock = await this.usersRepository.findOneByOrFail({ id });
    userToBlock.isActive = false;
    userToBlock.lastUpdateBy = adminUser;
    return await this.usersRepository.save(userToBlock);
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail.replace('Key', ''));
    }
    if (error.code === 'error-001') {
      throw new BadRequestException(error.detail.replace('Key', ''));
    }
    // this.logger.error(error);

    throw new InternalServerErrorException('Please check server logs');
  }
}
