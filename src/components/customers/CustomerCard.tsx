import React from 'react';
import { Customer } from '@/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Phone,
  Eye,
  ShoppingBag,
  Calendar,
  DollarSign,
  Award,
  MapPin
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { formatDate, formatCurrency } from '@/lib/utils';

interface CustomerCardProps {
  customer: Customer;
  onView: (customer: Customer) => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onView
}) => {
  const { t } = useTranslation();

  // Generate initials for avatar
  const getInitials = () => {
    return `${customer.first_name.charAt(0)}${customer.last_name.charAt(0)}`.toUpperCase();
  };

  // Generate random pastel color based on customer id
  const getAvatarColor = () => {
    const hue = parseInt(customer.id.substring(0, 8), 16) % 360;
    return `hsl(${hue}, 70%, 85%)`;
  };



  // Customer status based on spending
  const getCustomerStatus = () => {
    if (!customer.total_spent) return null;

    if (customer.total_spent > 1000000) return { label: 'VIP', color: 'bg-amber-500' };
    if (customer.total_spent > 500000) return { label: 'Gold', color: 'bg-amber-400' };
    if (customer.total_spent > 200000) return { label: 'Silver', color: 'bg-slate-400' };
    return { label: 'Regular', color: 'bg-green-500' };
  };

  const status = getCustomerStatus();

  // Format address for display
  const getFormattedAddress = () => {
    const parts = [];
    if (customer.city) parts.push(customer.city);
    if (customer.country) parts.push(customer.country);
    return parts.join(', ') || null;
  };

  const address = getFormattedAddress();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-12 w-12 border shrink-0">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.first_name}+${customer.last_name}`} alt={`${customer.first_name} ${customer.last_name}`} />
              <AvatarFallback style={{ backgroundColor: getAvatarColor(), color: 'rgba(0,0,0,0.7)' }}>
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg truncate">
                  {customer.first_name} {customer.last_name}
                </h3>
                {status && (
                  <Badge className={`${status.color} text-white shrink-0`}>
                    {status.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => onView(customer)}
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
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {customer.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{customer.phone}</span>
            </div>
          )}

          {address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{address}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{formatDate(customer.created_at)}</span>
          </div>

          {customer.total_orders !== undefined && (
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">
                {customer.total_orders} {t('customer.orders')}
              </span>
            </div>
          )}

          {customer.total_spent !== undefined && (
            <div className="flex items-center gap-2 col-span-full">
              <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">
                {t('customer.total_spent')}: {formatCurrency(customer.total_spent)}
              </span>
            </div>
          )}


        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerCard;
