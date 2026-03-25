import { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, RefreshCw, ArrowUpRight, Link as LinkIcon, Hub } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Dialog } from "@/components/ui/dialog";
import BindingModal from "../deployment/BindingModal";

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
  const [bindingTarget, setBindingTarget] = useState<{ serviceId: string; serviceTitle: string } | null>(null);
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("Service Definitions")}</h2>
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

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <DataLoading />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8">
                <Hub size={28} className="text-primary/50" />
              </div>
              <h2 className="mt-5 text-lg font-bold tracking-tight">{t("No services yet")}</h2>
              <p className="mt-1.5 max-w-xs text-center text-sm text-muted-foreground">
                {t("Create your first service definition to get started.")}
              </p>
              <Button
                variant="default"
                size="sm"
                className="mt-6"
                onClick={() => navigate("/app/services/editor")}
              >
                <Plus size={14} />
                {t("New Service")}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Service")}</TableHead>
                  <TableHead>{t("Identifier")}</TableHead>
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
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Hub size={16} />
                        </div>
                        <div>
                          <span className="text-sm font-semibold">{item.title || "-"}</span>
                          {item.description && (
                            <div className="max-w-md truncate text-xs text-muted-foreground">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-muted-foreground">
                      {item.serviceKey}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground border border-border">
                        v{item.version}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {t("Active")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground italic">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                          {t("Inactive")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBindingTarget({ serviceId: item.id, serviceTitle: item.title || item.serviceKey });
                          }}
                        >
                          <LinkIcon size={14} />
                          {t("Bindings")}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/app/services/editor/${item.id}`);
                          }}
                        >
                          {t("Open")}
                          <ArrowUpRight size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Binding modal */}
      {bindingTarget && (
        <Dialog open={!!bindingTarget} onOpenChange={(open) => !open && setBindingTarget(null)}>
          <BindingModal
            open={!!bindingTarget}
            onOpenChange={(open) => !open && setBindingTarget(null)}
            serviceId={bindingTarget.serviceId}
            serviceTitle={bindingTarget.serviceTitle}
          />
        </Dialog>
      )}
    </div>
  );
};

export default ServiceListPage;
