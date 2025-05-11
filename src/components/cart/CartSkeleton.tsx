import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

const CartItemSkeleton = () => (
  <Card>
    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
      <Skeleton className="h-20 w-20 rounded-md shrink-0" />
      <div className="flex-grow space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const CartSummarySkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-32" />
    </CardHeader>
    <CardContent className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
      <div className="border-t pt-4 flex justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-10 w-full" />
    </CardFooter>
  </Card>
);

interface CartSkeletonProps {
  itemCount?: number;
}

const CartSkeleton: React.FC<CartSkeletonProps> = ({ itemCount = 3 }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          {Array.from({ length: itemCount }).map((_, i) => (
            <CartItemSkeleton key={i} />
          ))}
        </div>
        <div className="lg:col-span-4">
          <CartSummarySkeleton />
        </div>
      </div>
    </div>
  );
};

export default CartSkeleton;
