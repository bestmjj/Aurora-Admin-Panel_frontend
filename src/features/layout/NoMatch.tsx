import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NoMatch = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-foreground">404</h1>
        <p className="py-6 text-muted-foreground">
          {t("The page you are looking for does not exist.")}
        </p>
        <Button asChild variant="outline">
          <Link to="/app/servers">{t("Go to servers")}</Link>
        </Button>
      </div>
    </div>
  );
};

export default NoMatch;
