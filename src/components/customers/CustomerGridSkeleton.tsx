import React from 'react';
import CustomerCardSkeleton from './CustomerCardSkeleton';

interface CustomerGridSkeletonProps {
  count?: number;
}

const CustomerGridSkeleton: React.FC<CustomerGridSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array(count).fill(0).map((_, index) => (
        <CustomerCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default CustomerGridSkeleton;
