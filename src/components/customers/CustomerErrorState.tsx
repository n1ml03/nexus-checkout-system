import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

interface CustomerErrorStateProps {
  onRefresh: () => void;
}

const CustomerErrorState: React.FC<CustomerErrorStateProps> = ({
  onRefresh
}) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="text-center space-y-1">
          <h2 className="font-semibold text-xl">{t("customer.error_loading")}</h2>
          <p className="text-muted-foreground">{t("customer.try_again")}</p>
        </div>
        <Button onClick={onRefresh}>{t("customer.refresh")}</Button>
      </CardContent>
    </Card>
  );
};

export default CustomerErrorState;
