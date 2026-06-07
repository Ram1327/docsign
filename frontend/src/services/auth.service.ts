import api from "./api";
import { User, LoginFormData, RegisterFormData, ApiResponse } from "@/types";

interface AuthResponseData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async register(
    data: Omit<RegisterFormData, "confirmPassword">
  ): Promise<AuthResponseData> {
    const res = await api.post<ApiResponse<AuthResponseData>>(
      "/auth/register",
      data
    );
    return res.data.data!;
  },

  async login(data: LoginFormData): Promise<AuthResponseData> {
    const res = await api.post<ApiResponse<AuthResponseData>>(
      "/auth/login",
      data
    );
    return res.data.data!;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post("/auth/logout", { refreshToken });
  },

  async me(): Promise<User> {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data.data!;
  },
};
