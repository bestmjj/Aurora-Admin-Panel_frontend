import { useTheme } from "@/components/theme-provider";
import { THEMES } from "@/atoms/theme";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const Themes = () => {
  const { theme: currentTheme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Themes</h2>
        <p className="text-sm text-muted-foreground">
          Choose a theme for the Aurora panel.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <button
          type="button"
          onClick={() => setTheme("auto")}
          className={cn(
            "flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors",
            currentTheme === "auto"
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-muted"
          )}
        >
          <span className="text-sm font-medium">Auto</span>
          {currentTheme === "auto" && <Check className="size-4 text-primary" />}
        </button>
        {THEMES.map((t) => (
          <button
            key={t.name}
            type="button"
            onClick={() => setTheme(t.name as Parameters<typeof setTheme>[0])}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors",
              currentTheme === t.name
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted"
            )}
          >
            <span className="text-sm font-medium">{t.label}</span>
            <span className="text-xs text-muted-foreground">{t.colorScheme}</span>
            {currentTheme === t.name && <Check className="size-4 text-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Themes;
