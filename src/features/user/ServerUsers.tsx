import type { FC } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ServerUsers: FC = () => {
  const { serverId } = useParams<{ serverId: string }>();
  const { t } = useTranslation();

  return (
    <>
      {/* <AddServerModal /> */}
      <div className="flex h-full w-full flex-col px-2">
        <div className="flex h-16 w-full shrink-0 basis-16 grow items-center justify-between px-4 sm:px-8">
          <div className="flex items-center">
            <h1 className="text-2xl font-extrabold">
              {t("ServerUsers")}-{serverId}
            </h1>
            <Button size="icon-xs" className="ml-2">
              <Plus />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="10">
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="1">
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Page 1</SelectItem>
                <SelectItem value="2">Page 2</SelectItem>
                <SelectItem value="3">Page 3</SelectItem>
                <SelectItem value="4">Page 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex max-h-screen flex-auto flex-col items-center space-y-3 overflow-y-auto px-2 pt-2 pb-10" />
      </div>
    </>
  );
};

export default ServerUsers;
