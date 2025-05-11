import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface CustomerEmptyStateProps {
  searchTerm?: string;
  onAddCustomer: () => void;
}

const CustomerEmptyState: React.FC<CustomerEmptyStateProps> = ({
  searchTerm,
  onAddCustomer
}) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center space-y-1">
          {searchTerm ? (
            <>
              <h2 className="font-semibold text-xl">{t("customer.no_search_results")}</h2>
              <p className="text-muted-foreground">{t("customer.try_different_search")}</p>
            </>
          ) : (
            <>
              <h2 className="font-semibold text-xl">{t("ui.no_customers")}</h2>
              <p className="text-muted-foreground">{t("ui.add_customers")}</p>
            </>
          )}
        </div>
        <Button onClick={onAddCustomer}>{t("ui.add_customer")}</Button>
      </CardContent>
    </Card>
  );
};

export default CustomerEmptyState;
