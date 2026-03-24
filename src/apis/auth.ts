import type { AxiosResponse } from "axios";
import { apiRequest } from "./utils";

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const logIn = (data: AuthCredentials): Promise<AxiosResponse<AuthResponse>> =>
  apiRequest({
    method: "post",
    url: "/token",
    data: new URLSearchParams(data as Record<string, string>).toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

export const getToken = (token: string): Promise<AxiosResponse<AuthResponse>> =>
  apiRequest({
    method: "get",
    url: "/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token}`,
    },
  });

export const register = (data: AuthCredentials): Promise<AxiosResponse<AuthResponse>> =>
  apiRequest({
    method: "post",
    url: "/signup",
    data: new URLSearchParams(data as Record<string, string>).toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });