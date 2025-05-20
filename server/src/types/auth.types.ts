export interface RegisterUserDTO {
  email: string;
  pseudo: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterUserResult {
  accountId: string;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterEmployeeDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshAccessTokenResult {
  accessToken: string;
  newRefreshToken: string;
}
