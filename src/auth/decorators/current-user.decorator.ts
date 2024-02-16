/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ValidRoles } from '../enums/valid-roles.enum';
import { User } from '../../users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (roles: ValidRoles[] = [], context: ExecutionContext) => {
    console.log({ roles });
    const ctx = GqlExecutionContext.create(context);
    const user: User = ctx.getContext().req.user;

    if (!user) {
      throw new InternalServerErrorException(
        `No user inside the request - make sure that we use the AuthGuard`,
      );
    }

    if (roles.length === 0) return user;
    for (const role of user.roles) {
      // Todo: eliminar Valid roles
       if( roles.includes(role as ValidRoles)){
        return user;
       }
    }



    throw new ForbiddenException(`User ${user.fullName} need a valid role [${roles}]`)
  },
);
