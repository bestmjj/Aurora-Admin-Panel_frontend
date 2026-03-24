import { memo } from "react";
import { Check } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { THEMES, type ThemeSelection } from "@/atoms/theme";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const allOptions: { name: ThemeSelection; label: string }[] = [
  { name: "auto", label: "Auto" },
  ...THEMES.map((t) => ({ name: t.name as ThemeSelection, label: t.label })),
];

interface ThemeMenuItemsProps {
  onSelect?: () => void;
}

const ThemeMenuItems = ({ onSelect }: ThemeMenuItemsProps) => {
  const { theme: currentTheme, setTheme } = useTheme();

  return (
    <>
      {allOptions.map(({ name, label }) => (
        <DropdownMenuItem
          key={name}
          onClick={() => {
            setTheme(name);
            onSelect?.();
          }}
        >
          <span className="flex-1">{label}</span>
          {currentTheme === name && (
            <Check className="size-4 text-primary" />
          )}
        </DropdownMenuItem>
      ))}
    </>
  );
};

export default memo(ThemeMenuItems);
