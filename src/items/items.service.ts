/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { PaginationArgs, SearchArgs } from '../common/dto/args';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemRepository.create({ ...createItemInput, user });
    return await this.itemRepository.save(newItem);
  }

  async findAll(user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<Item[]> {
    const { limit, offset } = paginationArgs;
    const { search } =  searchArgs;

    const queryBuilder = this.itemRepository.createQueryBuilder()
    .take(limit)
    .skip(offset)
    .where(`"userId" = :userId`, {userId: user.id})

    if(search){
      queryBuilder.andWhere('LOWER(name) like :name', { name : `%${search.toLowerCase()}%`})
    }

    return queryBuilder.getMany();

    // Todo: filtrar
    // return this.itemRepository.find({
    //   take: limit,
    //   skip: offset,
    //   where: {
    //     user: {
    //       id: user.id,
    //     },
    //     name: Like(`%${search}%`)
    //   },
    // });

  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemRepository.findOneBy({
      user: {
        id: user.id,
      },
      id,
    });
    if (!item) throw new NotFoundException(`No found item with id: ${id}`);
    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput, user: User): Promise<Item> {
    await this.findOne( id, user); // validar si existe el usuario a modificar
    const item = await this.itemRepository.preload(updateItemInput);
    if (!item) throw new NotFoundException(`No found item with id: ${id}`);
    return this.itemRepository.save(item);
  }

  async remove(id: string, user: User): Promise<Item> {
    // Todo : soft delete , integridad referencial
    const item = await this.findOne(id, user);
    await this.itemRepository.remove(item);
    return { ...item, id };
  }

  async itemCountByUser( user: User): Promise<number>{
    
    return  this.itemRepository.count({
      where: {
         user:{
           id: user.id
         }
      }
    });
  }
}
