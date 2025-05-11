import React, { useState, useEffect } from 'react';
import { Customer, Order } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  FileText,
  Edit,
  Trash2,
  Send,
  Tag,
  Plus,
  Award,
  BarChart4,
  Clock,
  ArrowUpRight,
  Save,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useCustomer, useCustomerOrders, useUpdateCustomer } from '@/queries/useCustomers';
import CustomerDetailsSkeleton from '@/components/customers/CustomerDetailsSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface CustomerDetailsProps {
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

interface CustomerDetailsProps {
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

type ViewMode = 'view' | 'edit' | 'email';

const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customerId,
  isOpen,
  onClose,
  onEdit: _onEdit, // We're not using this directly anymore, but keeping for interface compatibility
  onDelete
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('info');
  const [viewMode, setViewMode] = useState<ViewMode>('view');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Setup mutations
  const updateCustomerMutation = useUpdateCustomer();

  // Form state for inline editing
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    notes: ''
  });

  // Fetch customer data
  const { data: customer, isLoading } = useCustomer(customerId || '', {
    enabled: !!customerId && isOpen,
    retry: 1,
    staleTime: 30000
  });

  // Fetch customer orders
  const { data: orders = [] } = useCustomerOrders(customerId || '', {
    enabled: !!customerId && !!customer?.email && isOpen,
    retry: 1
  });

  // Initialize edit form when customer data changes
  useEffect(() => {
    if (customer) {
      setEditForm({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        postal_code: customer.postal_code || '',
        country: customer.country || '',
        notes: customer.notes || ''
      });
    }
  }, [customer]);

  // Reset view mode when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setViewMode('view');
      setEmailSubject('');
      setEmailBody('');
    }
  }, [isOpen]);

  if (!customerId || !isOpen) return null;

  const handleEdit = () => {
    if (customer) {
      setViewMode('edit');
    }
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    if (customer) {
      setEditForm({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        postal_code: customer.postal_code || '',
        country: customer.country || '',
        notes: customer.notes || ''
      });
    }
    setViewMode('view');
  };

  const handleSaveEdit = async () => {
    if (!customer || !editForm.first_name || !editForm.last_name || !editForm.email) {
      toast.error(t('customer.validation_error'));
      return;
    }

    try {
      await updateCustomerMutation.mutateAsync({
        id: customer.id,
        data: editForm
      });
      setViewMode('view');
      toast.success(t('customer.update_success'));
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error(t('customer.update_error'));
    }
  };

  const handleDelete = () => {
    if (customer) {
      onDelete(customer);
    }
  };

  const handleShowEmailForm = () => {
    setViewMode('email');
    // Pre-populate with template if empty
    if (!emailBody) {
      setEmailBody(`Dear ${customer?.first_name},\n\n`);
    }
  };

  const handleCancelEmail = () => {
    setViewMode('view');
  };

  const handleSendEmail = () => {
    // Implement email sending logic here
    console.log('Sending email to:', customer?.email);
    console.log('Subject:', emailSubject);
    console.log('Body:', emailBody);

    toast.success(t('customer.email_sent'));

    // Reset form and close
    setEmailSubject('');
    setEmailBody('');
    setViewMode('view');
  };

  // We're now handling tag addition directly in the onClick handler

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };



  // Generate initials for avatar
  const getInitials = () => {
    if (!customer) return '';
    return `${customer.first_name.charAt(0)}${customer.last_name.charAt(0)}`.toUpperCase();
  };

  // Generate random pastel color based on customer id
  const getAvatarColor = () => {
    if (!customer) return 'hsl(0, 0%, 90%)';
    const hue = parseInt(customer.id.substring(0, 8), 16) % 360;
    return `hsl(${hue}, 70%, 85%)`;
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">{t('order.completed')}</Badge>;
      case 'pending':
        return <Badge variant="outline">{t('order.pending')}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{t('order.cancelled')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isLoading ? t('ui.loading') : `${customer?.first_name} ${customer?.last_name}`}
          </DialogTitle>
          <DialogDescription>
            {t('customer.view_description')}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <CustomerDetailsSkeleton />
        ) : customer ? (
          <div className="py-4">
            <AnimatePresence mode="wait" key={viewMode}>
              {viewMode === 'view' && (
                <motion.div
                  key="view-mode"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.first_name}+${customer.last_name}`} alt={`${customer.first_name} ${customer.last_name}`} />
                      <AvatarFallback style={{ backgroundColor: getAvatarColor(), color: 'rgba(0,0,0,0.7)' }}>
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h2 className="text-2xl font-bold">
                        {customer.first_name} {customer.last_name}
                      </h2>
                      <p className="text-muted-foreground flex items-center gap-1 mt-1">
                        <Mail className="h-4 w-4" />
                        {customer.email}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80" onClick={() => handleRemoveTag(tag)}>
                            <Tag className="h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-secondary" onClick={() => {
                          if (!tags.includes('VIP')) {
                            setTags([...tags, 'VIP']);
                          }
                        }}>
                          <Plus className="h-3 w-3" />
                          {t('common.add')}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                      className="gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShowEmailForm}
                      className="gap-1"
                    >
                      <Send className="h-4 w-4" />
                      {t('common.action_items.send')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      className="gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('common.delete')}
                    </Button>
                  </div>
                </motion.div>
              )}

              {viewMode === 'edit' && (
                <motion.div
                  key="edit-mode"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        {t('customer.edit_customer')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">{t('customer.first_name')}</Label>
                          <Input
                            id="first_name"
                            value={editForm.first_name}
                            onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                            placeholder={t('customer.first_name')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">{t('customer.last_name')}</Label>
                          <Input
                            id="last_name"
                            value={editForm.last_name}
                            onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                            placeholder={t('customer.last_name')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">{t('common.email')}</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            placeholder={t('common.email')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">{t('common.phone')}</Label>
                          <Input
                            id="phone"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            placeholder={t('common.phone')}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">{t('customer.address')}</Label>
                        <Input
                          id="address"
                          value={editForm.address}
                          onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                          placeholder={t('customer.address')}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">{t('customer.city')}</Label>
                          <Input
                            id="city"
                            value={editForm.city}
                            onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                            placeholder={t('customer.city')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postal_code">{t('customer.postal_code')}</Label>
                          <Input
                            id="postal_code"
                            value={editForm.postal_code}
                            onChange={(e) => setEditForm({...editForm, postal_code: e.target.value})}
                            placeholder={t('customer.postal_code')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">{t('customer.country')}</Label>
                          <Input
                            id="country"
                            value={editForm.country}
                            onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                            placeholder={t('customer.country')}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">{t('customer.notes')}</Label>
                        <Textarea
                          id="notes"
                          value={editForm.notes}
                          onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                          placeholder={t('customer.notes_placeholder')}
                          className="min-h-[100px]"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={handleCancelEdit} disabled={updateCustomerMutation.isPending}>
                        <X className="h-4 w-4 mr-2" />
                        {t('common.cancel')}
                      </Button>
                      <Button onClick={handleSaveEdit} disabled={updateCustomerMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {updateCustomerMutation.isPending ? t('ui.processing') : t('common.save')}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}

              {viewMode === 'email' && (
                <motion.div
                  key="email-mode"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        {t('customer.send_email')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-to">{t('common.email')}</Label>
                        <Input id="email-to" value={customer.email} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-subject">{t('common.subject')}</Label>
                        <Input
                          id="email-subject"
                          placeholder={t('common.subject')}
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-body">{t('common.message')}</Label>
                        <Textarea
                          id="email-body"
                          placeholder={t('common.message')}
                          className="min-h-[100px]"
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={handleCancelEmail}>
                        <X className="h-4 w-4 mr-2" />
                        {t('common.cancel')}
                      </Button>
                      <Button onClick={handleSendEmail}>
                        <Send className="h-4 w-4 mr-2" />
                        {t('common.action_items.send')}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="info">{t('customer.info')}</TabsTrigger>
                <TabsTrigger value="orders">{t('customer.orders')}</TabsTrigger>
                <TabsTrigger value="stats">{t('customer.stats')}</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('customer.contact_info')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{t('common.email')}</p>
                          <p>{customer.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{t('common.phone')}</p>
                          <p>{customer.phone || t('customer.not_provided')}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{t('customer.customer_since')}</p>
                          <p>{formatDate(customer.created_at)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t('customer.address')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {customer.address ? (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p>{customer.address}</p>
                            {customer.city && (
                              <p>
                                {customer.city}
                                {customer.postal_code && `, ${customer.postal_code}`}
                              </p>
                            )}
                            {customer.country && <p>{customer.country}</p>}
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">{t('customer.no_address')}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {customer.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('customer.notes')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line">{customer.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{t('customer.order_history')}</span>
                      {orders.length > 0 && (
                        <Badge variant="outline" className="ml-2">
                          {orders.length} {t('customer.orders')}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {orders.length > 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('order.details')}</TableHead>
                              <TableHead>{t('order.date')}</TableHead>
                              <TableHead>{t('order.status')}</TableHead>
                              <TableHead className="text-right">{t('order.total')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {orders.map((order) => (
                              <TableRow
                                key={order.id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <div className="bg-primary/10 p-1.5 rounded-full">
                                      <FileText className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <div className="font-medium">{t('order.order_number')}{order.id.substring(0, 8)}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {order.status === 'completed' ? t('order.paid') : t(`order.${order.status}`)}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{formatDate(order.created_at)}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </TableCell>
                                <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(order.total)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-center py-8"
                      >
                        <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-1">{t('customer.no_orders')}</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">{t('customer.no_orders_description')}</p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="stats">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t('customer.total_orders')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <ShoppingBag className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-2xl font-bold">
                              {orders.length}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t('customer.total_spent')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <div className="bg-green-100 p-2 rounded-full">
                              <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <span className="text-2xl font-bold">
                              {formatCurrency(orders.reduce((sum, order) =>
                                order.status === 'completed' ? sum + order.total : sum, 0)
                              )}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t('customer.avg_order')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-2xl font-bold">
                              {formatCurrency(
                                orders.length > 0
                                  ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length
                                  : 0
                              )}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Additional customer stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart4 className="h-5 w-5" />
                            {t('customer.purchase_history')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {orders.length > 0 ? (
                            <div className="h-[200px] flex items-center justify-center">
                              <p className="text-muted-foreground text-center">
                                {t('customer.purchase_history_chart')}
                              </p>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">{t('customer.no_purchase_history')}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            {t('customer.recent_activity')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {orders.length > 0 ? (
                            <div className="space-y-4">
                              {orders.slice(0, 3).map((order, index) => (
                                <motion.div
                                  key={order.id}
                                  className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.2, delay: 0.1 * index }}
                                >
                                  <div className="bg-primary/10 p-2 rounded-full">
                                    <ShoppingBag className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {t('customer.placed_order', { id: order.id.substring(0, 8) })}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {formatDate(order.created_at)}
                                    </p>
                                  </div>
                                  <Badge className="ml-auto">
                                    {formatCurrency(order.total)}
                                  </Badge>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">{t('customer.no_recent_activity')}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>


                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">{t('customer.not_found')}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetails;
