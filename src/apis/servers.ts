import { v1AuthRequest, v2AuthRequest } from "./utils";

export const serversGet = () => v1AuthRequest({
    method: "get",
    url: '/servers',
});

export const serverGet = (server_id: number) => v1AuthRequest({
    method: "get",
    url: `/servers/${server_id}`
});

export const serverCreate = (data: Record<string, unknown>) => v1AuthRequest({
    method: "post",
    url: `/servers`,
    data: data
});

export const serverEdit = (server_id: number, data: Record<string, unknown>) => v1AuthRequest({
    method: "put",
    url: `/servers/${server_id}`,
    data: data
});

export const serverConfigEdit = (server_id: number, config: Record<string, unknown>) => v1AuthRequest({
    method: "put",
    url: `/servers/${server_id}/config`,
    data: config
});

export const serverDelete = (server_id: number) => v1AuthRequest({
    method: "delete",
    url: `/servers/${server_id}`,
});

export const serverConnect = (server_id: number, data: Record<string, unknown>) => v1AuthRequest({
    method: "post",
    url: `/servers/${server_id}/connect`,
    data: data
});

export const serverUsersGet = (server_id: number) => v1AuthRequest({
    method: "get",
    url: `/servers/${server_id}/users`
});

export const serverUserCreate = (server_id: number, data: Record<string, unknown>) => v1AuthRequest({
    method: "post",
    url: `/servers/${server_id}/users`,
    data: data
});

export const serverUserEdit = (server_id: number, user_id: number, data: Record<string, unknown>) => v1AuthRequest({
    method: "put",
    url: `/servers/${server_id}/users/${user_id}`,
    data: data
});

export const serverUserDelete = (server_id: number, user_id: number) => v1AuthRequest({
    method: "delete",
    url: `/servers/${server_id}/users/${user_id}`
});

export const serverGetV2 = (server_id: number) => v2AuthRequest({
    method: "get",
    url: `/servers/${server_id}`,
});

export const serverGetDetailedV2 = (server_id: number) => v2AuthRequest({
    method: "get",
    url: `/servers/${server_id}/detailed`,
});

export const serversGetV2 = (page: number, size: number) => v2AuthRequest({
    method: "get",
    url: '/servers',
    params: { page: page-1, size }
});
