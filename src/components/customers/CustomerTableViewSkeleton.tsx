import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import CustomerTableSkeleton from './CustomerTableSkeleton';

interface CustomerTableViewSkeletonProps {
  rowCount?: number;
}

const CustomerTableViewSkeleton: React.FC<CustomerTableViewSkeletonProps> = ({
  rowCount = 6
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <CustomerTableSkeleton rowCount={rowCount} />
      </CardContent>
    </Card>
  );
};

export default CustomerTableViewSkeleton;
