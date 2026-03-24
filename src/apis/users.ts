import type { AxiosResponse } from "axios";
import { v1AuthRequest, v2AuthRequest } from "./utils";

export interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_ops: boolean;
  notes?: string;
}

export interface UserCreateData {
  email: string;
  password: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_ops?: boolean;
}

export interface UserEditData {
  email?: string;
  password?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_ops?: boolean;
  notes?: string;
}

export interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  size: number;
}

export const meGet = (): Promise<AxiosResponse<User>> =>
  v1AuthRequest({
    method: "get",
    url: "/users/me",
  });

export const meEdit = (data: UserEditData): Promise<AxiosResponse<User>> =>
  v1AuthRequest({
    method: "put",
    url: "/users/me",
    data,
  });

export const usersGet = (
  page: number,
  size: number,
  query: string | null = null
): Promise<AxiosResponse<PaginatedUsers>> =>
  v2AuthRequest({
    method: "get",
    url: "/users",
    params: { page: page - 1, size, query },
  });

export const userCreate = (data: UserCreateData): Promise<AxiosResponse<User>> =>
  v1AuthRequest({
    method: "post",
    url: "/users",
    data,
  });

export const userGet = (user_id: number): Promise<AxiosResponse<User>> =>
  v1AuthRequest({
    method: "get",
    url: `/users/${user_id}`,
  });

export const userEdit = (user_id: number, data: UserEditData): Promise<AxiosResponse<User>> =>
  v1AuthRequest({
    method: "put",
    url: `/users/${user_id}`,
    data,
  });

export const userDelete = (user_id: number, data?: Record<string, unknown>): Promise<AxiosResponse<void>> =>
  v1AuthRequest({
    method: "delete",
    url: `/users/${user_id}`,
    data,
  });

export const userServersGet = (user_id: number): Promise<AxiosResponse<unknown[]>> =>
  v1AuthRequest({
    method: "get",
    url: `/users/${user_id}/servers`,
  });