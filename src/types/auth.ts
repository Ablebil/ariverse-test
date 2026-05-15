export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}
