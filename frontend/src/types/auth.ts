export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: UserDto;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}