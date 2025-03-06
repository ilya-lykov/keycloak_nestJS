import { Body, Controller, Post } from '@nestjs/common';
import { KeycloakService } from 'src/keycloak/keycloak.service';
import { NewUser } from 'src/model/new-user';

@Controller('user')
export class UserApi {
  constructor(private readonly keycloakService: KeycloakService) {}

  @Post()
  async createNewUser(@Body() newUser: NewUser): Promise<void> {
    await this.keycloakService.createUser(newUser);
  }
}
