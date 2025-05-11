import React from 'react';
import { Customer } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Eye,
  ArrowUpDown,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ShoppingBag,
  Award
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { formatDate, formatCurrency } from '@/lib/utils';

interface CustomerTableProps {
  customers: Customer[];
  onView: (customer: Customer) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onView,
  sortBy,
  sortOrder,
  onSortChange
}) => {
  const { t } = useTranslation();



  // Helper function to get avatar color
  const getAvatarColor = (name: string) => {
    const colors = [
      'rgba(239, 68, 68, 0.2)', // red
      'rgba(249, 115, 22, 0.2)', // orange
      'rgba(245, 158, 11, 0.2)', // amber
      'rgba(16, 185, 129, 0.2)', // emerald
      'rgba(6, 182, 212, 0.2)', // cyan
      'rgba(59, 130, 246, 0.2)', // blue
      'rgba(139, 92, 246, 0.2)', // violet
      'rgba(236, 72, 153, 0.2)', // pink
    ];

    // Simple hash function to get consistent color for the same name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  // Helper function to get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Helper function to render sort indicator
  const renderSortIndicator = (field: string) => {
    if (sortBy === field) {
      return (
        <Badge variant="secondary" className="ml-2 h-5 px-1">
          {sortOrder === "asc" ? "↑" : "↓"}
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => onSortChange('name')}
                >
                  {t("customer.name")}
                  {renderSortIndicator('name')}
                  <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => onSortChange('date')}
                >
                  {t("customer.created")}
                  {renderSortIndicator('date')}
                  <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => onSortChange('orders')}
                >
                  {t("customer.total_orders")}
                  {renderSortIndicator('orders')}
                  <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => onSortChange('spending')}
                >
                  {t("customer.total_spent")}
                  {renderSortIndicator('spending')}
                  <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead className="text-right w-[60px]">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => {

              const avatarColor = getAvatarColor(`${customer.first_name} ${customer.last_name}`);
              const initials = getInitials(customer.first_name, customer.last_name);

              return (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer hover:bg-muted/50 transition-all"
                  onClick={() => onView(customer)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border shrink-0">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.first_name}+${customer.last_name}`}
                          alt={`${customer.first_name} ${customer.last_name}`}
                        />
                        <AvatarFallback style={{ backgroundColor: avatarColor, color: 'rgba(0,0,0,0.7)' }}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium flex items-center gap-2 flex-wrap">
                          <span className="truncate">{customer.first_name} {customer.last_name}</span>

                        </div>
                        <div className="md:hidden flex flex-col gap-1 mt-1">
                          {customer.phone && (
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Phone className="h-3 w-3 shrink-0" />
                              <span className="truncate">{customer.phone}</span>
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <DollarSign className="h-3 w-3 shrink-0" />
                            <span>{customer.total_spent ? formatCurrency(customer.total_spent) : '0'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{formatDate(customer.created_at)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{customer.total_orders || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{customer.total_spent ? formatCurrency(customer.total_spent) : '0'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(customer);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('customer.view')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CustomerTable;
