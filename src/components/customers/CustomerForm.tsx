import React, { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCreateCustomer, useUpdateCustomer } from '@/queries/useCustomers';
import { toast } from 'sonner';

interface CustomerFormProps {
  customer?: Customer;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  isOpen,
  onClose,
  onSave
}) => {
  const { t } = useTranslation();
  const isEditing = !!customer;

  // Setup mutations
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [notes, setNotes] = useState('');

  // Initialize form with customer data if editing
  useEffect(() => {
    if (customer) {
      setFirstName(customer.first_name || '');
      setLastName(customer.last_name || '');
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setAddress(customer.address || '');
      setCity(customer.city || '');
      setPostalCode(customer.postal_code || '');
      setCountry(customer.country || '');
      setNotes(customer.notes || '');
    } else {
      resetForm();
    }
  }, [customer, isOpen]);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCity('');
    setPostalCode('');
    setCountry('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email) {
      toast.error(t('customer.validation_error'));
      return;
    }

    try {
      const customerData = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        address,
        city,
        postal_code: postalCode,
        country,
        notes
      };

      if (isEditing && customer) {
        await updateCustomerMutation.mutateAsync({
          id: customer.id,
          data: customerData
        });
      } else {
        await createCustomerMutation.mutateAsync(customerData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">
            {isEditing ? t('customer.edit') : t('customer.add')}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {isEditing
              ? t('customer.edit_description')
              : t('customer.add_description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Required fields section */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="required text-xs">
                  {t('common.first_name')}
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t('customer.first_name_placeholder')}
                  required
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="required text-xs">
                  {t('common.last_name')}
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t('customer.last_name_placeholder')}
                  required
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="required text-xs">
                {t('common.email')}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs">
                {t('common.phone')}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Optional fields - collapsible on mobile */}
          <details className="group">
            <summary className="list-none flex items-center justify-between cursor-pointer py-1 text-sm font-medium">
              <span>{t('customer.additional_info')}</span>
              <span className="transition group-open:rotate-180">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </summary>
            <div className="pt-2 space-y-3">
              <div className="space-y-1">
                <Label htmlFor="address" className="text-xs">
                  {t('common.address')}
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t('customer.address_placeholder')}
                  className="h-8 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="city" className="text-xs">
                    {t('common.city')}
                  </Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t('customer.city_placeholder')}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="postalCode" className="text-xs">
                    {t('common.postal_code')}
                  </Label>
                  <Input
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="12345"
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="country" className="text-xs">
                  {t('common.country')}
                </Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={t('customer.country_placeholder')}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="notes" className="text-xs">
                  {t('customer.notes')}
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('customer.notes_placeholder')}
                  className="min-h-[80px] text-sm"
                />
              </div>
            </div>
          </details>

          <DialogFooter className="pt-2">
            <div className="flex w-full gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                className="flex-1 sm:flex-none h-9 text-xs sm:text-sm"
              >
                <X className="h-3 w-3 mr-1" />
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                className="flex-1 sm:flex-none h-9 text-xs sm:text-sm"
              >
                <Save className="h-3 w-3 mr-1" />
                {(createCustomerMutation.isPending || updateCustomerMutation.isPending) ? t('ui.processing') : t('common.save')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerForm;
