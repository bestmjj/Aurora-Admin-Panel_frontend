import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { gql, useQuery } from "@apollo/client";
import ModalShell from "../ui/ModalShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const GET_PORT_QUERY = gql`
  query GetPort($portId: Int!) {
    port(id: $portId) {
      id
      config
    }
  }
`;

interface PortRestrictionModalProps {
  modalProps?: {
    port?: { id: number; [key: string]: unknown };
    [key: string]: unknown;
  };
  close: () => void;
  resolve?: (value: unknown) => void;
}

const PortRestrictionModal = ({ modalProps = {}, close, resolve }: PortRestrictionModalProps) => {
  const { t } = useTranslation();
  const { port } = modalProps;
  const portId = port?.id;
  const { data: portData, loading: portLoading } = useQuery(GET_PORT_QUERY, {
    variables: portId ? { portId } : undefined,
    skip: !portId,
  });
  const [tab, setTab] = useState("expiration");

  const handleCancel = () => {
    if (resolve) resolve(false);
    close();
  };
  const handleSubmit = async () => {};

  useEffect(() => {}, []);

  return (
    <ModalShell
      title={t("Port Restriction")}
      onClose={close}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleCancel}>
            {t("Cancel")}
          </Button>
          <Button variant="default" size="sm" onClick={handleSubmit}>
            {t("Save")}
          </Button>
        </>
      }
    >
      <div className="flex w-full flex-col items-start space-y-0">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList>
            <TabsTrigger value="expiration">{t("Expiration")}</TabsTrigger>
            <TabsTrigger value="speed">{t("Speed Limit")}</TabsTrigger>
            <TabsTrigger value="traffic">{t("Traffic Limit")}</TabsTrigger>
            <TabsTrigger value="function">{t("Function Limit")}</TabsTrigger>
          </TabsList>
          <TabsContent value="expiration">
            <div className="flex h-64 w-full flex-col items-center justify-center rounded-b-md rounded-tr-md bg-muted shadow-xl" />
          </TabsContent>
          <TabsContent value="speed">
            <div className="flex h-64 w-full flex-col items-center justify-center rounded-b-md rounded-tr-md bg-muted shadow-xl" />
          </TabsContent>
          <TabsContent value="traffic">
            <div className="flex h-64 w-full flex-col items-center justify-center rounded-b-md rounded-tr-md bg-muted shadow-xl" />
          </TabsContent>
          <TabsContent value="function">
            <div className="flex h-64 w-full flex-col items-center justify-center rounded-b-md rounded-tr-md bg-muted shadow-xl" />
          </TabsContent>
        </Tabs>
      </div>
    </ModalShell>
  );
};

export default PortRestrictionModal;
