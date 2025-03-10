import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { KeycloakService } from 'src/keycloak/keycloak.service';
import { NewUser } from 'src/model/new-user';
import { UpdateUser } from 'src/model/update-user';

@Controller('user')
export class UserApi {
  constructor(private readonly keycloakService: KeycloakService) {}

  @Post()
  async createNewUser(@Body() newUser: NewUser): Promise<void> {
    await this.keycloakService.createUser(newUser);
  }

  @Put('/:id')
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUser: UpdateUser,
  ): Promise<void> {
    await this.keycloakService.updateUser(updateUser, userId);
  }
}
