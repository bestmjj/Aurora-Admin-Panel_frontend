import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { routes, type RouteConfig } from "@/routes";

interface SideBarProps {
  onNavigate?: () => void;
}

export function SideBar({ onNavigate }: SideBarProps) {
  const { t } = useTranslation();
  const sidebarRoutes = routes.filter(
    (route): route is RouteConfig & { nav: true; icon: NonNullable<RouteConfig["icon"]>; labelKey: string; fullPath: string } =>
      !!route.nav
  );

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="px-6 py-5">
        <span className="text-lg font-black tracking-tight">Aurora</span>
      </div>

      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-0.5">
          {sidebarRoutes.map((route) => {
            const Icon = route.icon;
            return (
              <li key={route.key}>
                <NavLink
                  to={route.fullPath}
                  end={route.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <Icon className="size-[18px]" aria-hidden="true" />
                  <span>{t(route.labelKey)}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export default SideBar;
