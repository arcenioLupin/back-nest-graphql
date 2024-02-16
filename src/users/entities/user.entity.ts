/* eslint-disable prettier/prettier */
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Item } from '../../items/entities/item.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { List } from 'src/lists/entities/list.entity';

@Entity({ name: 'users' })
@ObjectType()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  fullName: string;

  @Field(() => String)
  @Column({ unique: true })
  email: string;

  // @Field(()=> String)
  @Column()
  password: string;

  @Field(() => [String])
  @Column({
    type: 'text',
    array: true,
    default: ['user'],
  })
  roles: string[];

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

// Todo: relaciones y otras cosas...

  @ManyToOne( ()=> User, (user) => user.lastUpdateBy, { nullable: true, lazy:true })
  @JoinColumn({ name: 'lastUpdateBy'})
  @Field(()=> User, { nullable: true })
  lastUpdateBy?: User;

  @OneToMany(()=> Item, (item)=> item.user, { lazy: true})
  // @Field(()=> [Item])
  items: Item[];

  @OneToMany(()=> List, (list)=> list.user)
  // @Field(()=> [Item])
  lists: List[];

}
