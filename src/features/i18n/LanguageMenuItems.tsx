import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
  { code: "en", labelKey: "English" },
  { code: "zh", labelKey: "\u4E2D\u6587" },
];

interface LanguageMenuItemsProps {
  onSelect?: () => void;
}

const LanguageMenuItems = ({ onSelect }: LanguageMenuItemsProps) => {
  const { t, i18n } = useTranslation();

  return (
    <>
      {LANGUAGES.map((language) => {
        const isActive =
          i18n.resolvedLanguage === language.code ||
          i18n.language?.startsWith(`${language.code}-`);

        return (
          <DropdownMenuItem
            key={language.code}
            onClick={() => {
              i18n.changeLanguage(language.code);
              onSelect?.();
            }}
          >
            <span className="flex-1">{t(language.labelKey)}</span>
            {isActive && (
              <Check className="size-4 text-primary" />
            )}
          </DropdownMenuItem>
        );
      })}
    </>
  );
};

export default memo(LanguageMenuItems);
