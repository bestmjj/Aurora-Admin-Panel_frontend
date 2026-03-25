import { useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { Rocket, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Paginator from "../Paginator";
import DataLoading from "../DataLoading";
import useQueryParams from "../../hooks/useQueryParams";
import { useModal } from "../../atoms/modal";
import { GET_PAGINATED_SERVER_DEPLOYMENTS } from "../../queries/deployment";
import DeploymentStatusBadge from "./DeploymentStatusBadge";
import PageHeader from "../ui/PageHeader";

interface Port {
  num: number;
  externalNum?: number | null;
}

interface DeploymentItem {
  id: number;
  serviceTitle?: string | null;
  serviceBindingId?: number | null;
  port?: Port | null;
  status: string;
  updatedAt?: string | null;
}

const DeploymentList = () => {
  const { t } = useTranslation();
  const { open } = useModal();
  const { serverId } = useParams();
  const navigate = useNavigate();
  const serverIdNum = Number(serverId);
  const [limit, offset, setLimit, setOffset] = useQueryParams([
    { name: "limit", defaultValue: 20, isNumeric: true, replace: false },
    { name: "offset", defaultValue: 0, isNumeric: true, replace: false },
  ]);

  const { loading, data, refetch } = useQuery(GET_PAGINATED_SERVER_DEPLOYMENTS, {
    variables: { limit, offset, serverId: serverIdNum },
    fetchPolicy: "cache-and-network",
  });

  const items: DeploymentItem[] = data?.paginatedServerDeployments?.items ?? [];

  const handleDeploy = async () => {
    const result = await open("deploy", { serverId: serverIdNum });
    if (result) refetch();
  };

  return (
    <>
      <PageHeader
        title={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/app/servers")}
              type="button"
            >
              <ArrowLeft size={16} />
              {t("Back")}
            </Button>
            <h1 className="not-prose text-2xl font-extrabold">{t("Deployments")}</h1>
          </>
        }
        onAdd={handleDeploy}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/app/servers/${serverId}/ports`)}
          type="button"
        >
          {t("Ports")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          type="button"
        >
          {t("Refresh")}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleDeploy}
          type="button"
        >
          <Rocket size={14} />
          {t("Deploy")}
        </Button>
      </PageHeader>

      <div className="mx-auto w-full max-w-screen-2xl px-4">
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
          {loading && !data ? (
            <div className="p-6">
              <DataLoading />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8">
                <Rocket size={28} className="text-primary/50" />
              </div>
              <h2 className="mt-5 text-lg font-bold tracking-tight">{t("No deployments yet")}</h2>
              <p className="mt-1.5 max-w-xs text-center text-sm text-muted-foreground">
                {t("Create a deployment from a bound service to start running workloads on this server.")}
              </p>
              <Button variant="default" size="sm" className="mt-6" onClick={handleDeploy}>
                <Rocket size={14} />
                {t("Deploy")}
              </Button>
            </div>
          ) : (
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{t("App")}</TableHead>
                    <TableHead>{t("Port")}</TableHead>
                    <TableHead>{t("Status")}</TableHead>
                    <TableHead>{t("Updated")}</TableHead>
                    <TableHead className="text-right">{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((dep) => (
                    <TableRow key={dep.id}>
                      <TableCell className="font-mono text-sm text-muted-foreground">#{dep.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Rocket size={16} />
                          </div>
                          <span className="text-sm font-semibold">
                            {dep.serviceTitle || (dep.serviceBindingId ? `Binding #${dep.serviceBindingId}` : "-")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {dep.port ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground border border-border">
                            :{dep.port.num}
                            {dep.port.externalNum && dep.port.externalNum !== dep.port.num
                              ? ` → :${dep.port.externalNum}`
                              : ""}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DeploymentStatusBadge status={dep.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {dep.updatedAt
                          ? new Date(dep.updatedAt).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="secondary"
                          size="xs"
                          onClick={async () => {
                            const result = await open("deploymentDetail", {
                              deploymentId: dep.id,
                            });
                            if (result) refetch();
                          }}
                        >
                          <Eye size={14} />
                          {t("Detail")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </div>
        <Paginator
          isLoading={loading}
          count={data?.paginatedServerDeployments?.count}
          limit={limit}
          offset={offset}
          setLimit={setLimit}
          setOffset={setOffset}
        />
      </div>
    </>
  );
};

export default DeploymentList;
