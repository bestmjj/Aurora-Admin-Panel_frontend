import { Palette } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeMenuItems from "./ThemeMenuItems";

const ThemeSwitch = () => {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("Theme switcher")}
          className="rounded-full bg-base-100/20"
        >
          <Palette className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <ThemeMenuItems />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitch;
