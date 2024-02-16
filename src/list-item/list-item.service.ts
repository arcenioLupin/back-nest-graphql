/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListItem } from './entities/list-item.entity';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';
import { List } from '../lists/entities/list.entity';
import { Item } from '../items/entities/item.entity';

@Injectable()
export class ListItemService {
  constructor(
    @InjectRepository(ListItem)
    private readonly listItemsRepository: Repository<ListItem>,
  ) {}

  async create(createListItemInput: CreateListItemInput): Promise<ListItem> {
    const { itemId, listId, ...rest } = createListItemInput;
    const newListItem = this.listItemsRepository.create({
      ...rest,
      item: {
        id: itemId,
      },
      list: {
        id: listId,
      },
    });

    await this.listItemsRepository.save(newListItem);
    return this.findOne(newListItem.id)
  }

  async findAll(
    list: List,
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<ListItem[]> {
    const { limit, offset } = paginationArgs;
    const { search } = searchArgs;

    const queryBuilder = this.listItemsRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"listId" = :listId`, { listId: list.id });

    if (search) {
      queryBuilder.andWhere('LOWER(name) like :name', {
        name: `%${search.toLowerCase()}%`,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<ListItem> {
    const listItem = await this.listItemsRepository.findOneBy({ id });
    if (!listItem)
      throw new NotFoundException(`ListItem with id ${id} not found`);
    return listItem;
  }

  async update(
    id: string,
    updateListItemInput: UpdateListItemInput,
  ): Promise<ListItem> {
    const { listId, itemId, ...rest } = updateListItemInput;
    // const listItem = await this.listItemsRepository.preload({
    //   ...rest,
    //   list: { id: listId },
    //   item: { id: itemId },
    // });
    // if (!listItem)
    //   throw new NotFoundException(`ListItem with id ${id} not found`);
    // return this.listItemsRepository.save(listItem);

    const queryBuilder = this.listItemsRepository.createQueryBuilder()
    .update()
    .set(rest)
    .where('id = :id', { id });

    if(listId) queryBuilder.set({ list: { id: listId }});
    if(itemId) queryBuilder.set({ item: { id: itemId }});

    await queryBuilder.execute();
    return this.listItemsRepository.findOneBy({id})
  }

  remove(id: number) {
    return `This action removes a #${id} listItem`;
  }

  async ItemsCountByList(list: List): Promise<number> {
    return this.listItemsRepository.count({
      where: {
        list: {
          id: list.id,
        },
      },
    });
  }
}
