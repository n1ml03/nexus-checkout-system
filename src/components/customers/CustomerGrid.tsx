import React from 'react';
import { Customer } from '@/types';
import CustomerCard from '@/components/customers/CustomerCard';

interface CustomerGridProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
}

const CustomerGrid: React.FC<CustomerGridProps> = ({
  customers,
  onView
}) => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {customers.map((customer) => (
        <CustomerCard
          key={customer.id}
          customer={customer}
          onView={onView}
        />
      ))}
    </div>
  );
};

export default CustomerGrid;
