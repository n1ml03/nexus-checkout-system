
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="space-y-4 text-center">
        <h1 className="text-9xl font-bold">404</h1>
        <h2 className="text-3xl font-bold">{t("ui.page_not_found")}</h2>
        <p className="text-muted-foreground max-w-md">
          {t("ui.page_not_found_message")}
        </p>
        <Button asChild>
          <Link to="/">{t("ui.return_home")}</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
