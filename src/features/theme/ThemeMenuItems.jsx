import { memo } from "react";
import { useTheme } from "../../components/theme-provider";
import { THEMES } from "../../atoms/theme";

const allOptions = [
  { name: "auto", label: "Auto" },
  ...THEMES.map((t) => ({ name: t.name, label: t.label })),
];

const ThemeMenuItems = ({ onSelect }) => {
  const { setTheme } = useTheme();

  const selectTheme = (themeName) => {
    setTheme(themeName);
    onSelect?.();
  };

  return (
    <>
      {allOptions.map(({ name, label }) => {
        return (
          <li key={name}>
            <button
              type="button"
              className="w-full truncate text-left"
              onClick={() => selectTheme(name)}
              title={label}
            >
              {label}
            </button>
          </li>
        );
      })}
    </>
  );
};

export default memo(ThemeMenuItems);
