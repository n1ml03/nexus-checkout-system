import React from 'react';
import { Customer } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import CustomerTable from './CustomerTable';

interface CustomerTableViewProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
}

const CustomerTableView: React.FC<CustomerTableViewProps> = ({
  customers,
  onView,
  sortBy,
  sortOrder,
  onSortChange
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <CustomerTable
          customers={customers}
          onView={onView}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      </CardContent>
    </Card>
  );
};

export default CustomerTableView;
