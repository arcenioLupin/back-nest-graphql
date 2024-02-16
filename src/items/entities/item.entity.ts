/* eslint-disable prettier/prettier */
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ListItem } from '../../list-item/entities/list-item.entity';

@Entity({ name: 'items' })
@ObjectType()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => String)
  name: string;

  // @Column()
  // @Field(()=> Float)
  // quantity: number;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  quantityUnits?: string;

  @ManyToOne(()=> User, (user) => user.items, {nullable: false, lazy: true} )
  @Index('userIdIndex')
  @Field(()=> User)
  user: User;

  @OneToMany(()=> ListItem, (listItem) => listItem.item, {nullable: false, lazy: true})
  @Field(()=> [ListItem])
  listItem: ListItem[];
}
