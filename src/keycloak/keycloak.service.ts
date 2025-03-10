import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NewUser } from 'src/model/new-user';
import { UserRepresentation, Credential } from './dto/user-representation';
import { firstValueFrom } from 'rxjs';
import { UpdateUser } from 'src/model/update-user';

@Injectable()
export class KeycloakService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}
  keycloakAdminUrl = this.configService.get<string>('keycloak_admin.baseURL');
  keycloakLoginUrl = this.configService.get<string>('keycloak.login_url');
  clientId = this.configService.get<string>('keycloak_admin.clientId');
  clientSecret = this.configService.get<string>('keycloak_admin.clientSecret');
  lifespan = this.configService.get<string>('keycloak_admin.linkLifeSpan');
  redirectUrl = this.configService.get<string>(
    'keycloak_admin.clientRedirectUrl',
  );

  async createUser(newUser: NewUser): Promise<void> {
    try {
      const token = await this.getAdminToken();
      const user = new UserRepresentation();
      user.lastName = newUser.lastName;
      user.firstName = newUser.firstName;
      user.username = newUser.username;
      user.email = newUser.username;

      const credential: Credential = new Credential();
      credential.type = 'password';
      credential.temporary = false;
      credential.value = newUser.password;

      user.credentials = [credential];
      user.enabled = true;
      user.emailVerified = false;

      await firstValueFrom(
        this.httpService.post(`${this.keycloakAdminUrl}/users`, user, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
    } catch (error) {
      const errorMesasage = <string>error.response.data.errorMessage;
      throw new Error('Failed to create a user: ' + errorMesasage);
    }
  }
  async updateUser(updateUser: UpdateUser, userId: string): Promise<void> {
    try {
      const token = await this.getAdminToken();

      await firstValueFrom(
        this.httpService.put(
          `${this.keycloakAdminUrl}/users/${userId}`,
          updateUser,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );
    } catch (error) {
      const errorMesasage = <string>error.response.data.errorMessage;
      throw new Error('Failed to create a user: ' + errorMesasage);
    }
  }
  async getAdminToken(): Promise<string> {
    const formData = new URLSearchParams();
    formData.append('client_id', <string>this.clientId);
    formData.append('grant_type', 'client_credentials');
    formData.append('client_secret', <string>this.clientSecret);
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          <string>this.keycloakLoginUrl,
          formData.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { access_token } = response.data;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return access_token;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(
        `Client login failed: ${error.code}` +
          '\n' +
          'URL: ' +
          <string>this.keycloakLoginUrl +
          '\n',
      );
    }
  }
}
