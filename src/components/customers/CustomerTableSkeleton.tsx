import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerTableSkeletonProps {
  rowCount?: number;
}

const CustomerTableSkeleton: React.FC<CustomerTableSkeletonProps> = ({ rowCount = 5 }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">
              <div className="flex items-center">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-5 ml-2" />
              </div>
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <div className="flex items-center">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-5 ml-2" />
              </div>
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              <div className="flex items-center">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-5 ml-2" />
              </div>
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              <div className="flex items-center">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-5 ml-2" />
              </div>
            </TableHead>
            <TableHead className="text-right">
              <Skeleton className="h-5 w-16 ml-auto" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(rowCount).fill(0).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24 opacity-50" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerTableSkeleton;
