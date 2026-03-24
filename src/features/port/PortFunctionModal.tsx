import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { gql, useQuery } from "@apollo/client";
import DataLoading from "../DataLoading";
import ModalShell from "../ui/ModalShell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GET_RULE_OPTIONS_QUERY = gql`
  query GetRuleOptions($portId: Int!) {
    ruleOptions(portId: $portId)
  }
`;

interface PortFunctionModalProps {
  modalProps?: {
    port?: { id: number; [key: string]: unknown };
    serverId?: number;
    [key: string]: unknown;
  };
  close: () => void;
  resolve?: (value: unknown) => void;
}

const PortFunctionModal = ({ modalProps = {}, close, resolve }: PortFunctionModalProps) => {
  const { t } = useTranslation();
  const { port, serverId } = modalProps || {};
  const portId = port?.id;
  const { data: ruleOptions, loading: ruleOptionsLoading } = useQuery(
    GET_RULE_OPTIONS_QUERY,
    {
      variables: portId ? { portId } : undefined,
      skip: !portId,
    },
  );

  const [method, setMethod] = useState("iptables");

  const handleCancel = () => {
    if (resolve) resolve(false);
    close();
  };
  const handleSubmit = async () => {};

  useEffect(() => {}, []);
  const availableRuleOptions: string[] = ruleOptions?.ruleOptions ?? [];

  return (
    <ModalShell
      title={
        <div className="flex flex-row items-center space-x-2">
          <span>{t("Port Function")}</span>
          {!portId ? null : ruleOptionsLoading ? (
            <DataLoading />
          ) : (
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger size="sm" className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableRuleOptions.map((option) => (
                  <SelectItem value={option} key={option}>
                    {t(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      }
      onClose={close}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleCancel}>
            {t("Cancel")}
          </Button>
          <Button variant="default" size="sm" onClick={handleSubmit}>
            {serverId ? t("Edit") : t("Add")}
          </Button>
        </>
      }
    >
      {!portId && (
        <div className="px-2 text-sm text-amber-500">
          {t("No port selected for function configuration.")}
        </div>
      )}
    </ModalShell>
  );
};

export default PortFunctionModal;
