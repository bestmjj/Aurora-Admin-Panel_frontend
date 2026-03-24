import { gql, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Link as LinkIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DataLoading from "../DataLoading";
import { useModal } from "../../atoms/modal";

const LIST_SERVICE_DEFINITIONS = gql`
  query ListServiceDefinitionsForPage($limit: Int, $offset: Int) {
    paginatedServiceDefinitions(limit: $limit, offset: $offset) {
      count
      items {
        id
        serviceKey
        version
        title
        description
        isActive
        updatedAt
      }
    }
  }
`;

interface ServiceItem {
  id: string;
  serviceKey: string;
  version: number;
  title: string;
  description?: string;
  isActive: boolean;
  updatedAt: string;
}

const ServiceListPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { open } = useModal();
  const { data, loading, error, refetch } = useQuery(LIST_SERVICE_DEFINITIONS, {
    variables: { limit: 200, offset: 0 },
    fetchPolicy: "network-only",
  });

  const items: ServiceItem[] = data?.paginatedServiceDefinitions?.items ?? [];

  if (error) {
    return (
      <div className="px-4 py-4">
        <Alert variant="destructive">
          <AlertDescription>{String(error.message || error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("Service Definitions")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("Browse saved services, then open one in the editor to edit and save.")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} type="button">
            <RefreshCw size={14} />
            {t("Refresh")}
          </Button>
          <Button
            variant="default"
            size="sm"
            type="button"
            onClick={() => navigate("/app/services/editor")}
          >
            <Plus size={14} />
            {t("Service Editor")}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <DataLoading />
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">{t("No services found.")}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t("Title")}</TableHead>
                  <TableHead>{t("Service Key")}</TableHead>
                  <TableHead>{t("Version")}</TableHead>
                  <TableHead>{t("Status")}</TableHead>
                  <TableHead>{t("Updated")}</TableHead>
                  <TableHead className="text-right">{t("Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/app/services/editor/${item.id}`)}
                  >
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      <div className="font-semibold">{item.title || "-"}</div>
                      {item.description ? (
                        <div className="max-w-md truncate text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{item.serviceKey}</TableCell>
                    <TableCell>{item.version}</TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? "default" : "outline"}>
                        {item.isActive ? t("Active") : t("Inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          open("binding", { serviceId: item.id, serviceTitle: item.title || item.serviceKey });
                        }}
                      >
                        <LinkIcon size={14} />
                        {t("Bindings")}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/services/editor/${item.id}`);
                        }}
                      >
                        <Pencil size={14} />
                        {t("Open")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceListPage;
