
import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  UserPlus,
  Search,
  Filter,
  SlidersHorizontal,
  RefreshCw,
  Users,
  Upload,
  ArrowUpDown,
  ChevronDown,
  FileSpreadsheet,
  FileJson,
  FileText,
  DollarSign,
  Tag
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Customer } from "@/types";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer
} from "@/queries/useCustomers";
import CustomerTableView from "@/components/customers/CustomerTableView";
import CustomerTableViewSkeleton from "@/components/customers/CustomerTableViewSkeleton";
import CustomerGrid from "@/components/customers/CustomerGrid";
import CustomerGridSkeleton from "@/components/customers/CustomerGridSkeleton";
import CustomerEmptyState from "@/components/customers/CustomerEmptyState";
import CustomerErrorState from "@/components/customers/CustomerErrorState";
import CustomerForm from "@/components/customers/CustomerForm";
import CustomerDetails from "@/components/customers/CustomerDetails";
import DeleteCustomerDialog from "@/components/customers/DeleteCustomerDialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const CustomersPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSpending, setFilterSpending] = useState<string>("all");
  const [showImportSheet, setShowImportSheet] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Setup mutations
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  // Fetch customers
  const { data: customers = [], isLoading, isError, refetch } = useCustomers({}, {
    retry: 1,
    staleTime: 30000
  });

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let result = [...(customers as Customer[])];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(customer =>
        customer.first_name.toLowerCase().includes(searchLower) ||
        customer.last_name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'vip') {
        result = result.filter(customer =>
          customer.total_spent && customer.total_spent > 1000000
        );
      } else if (filterStatus === 'regular') {
        result = result.filter(customer =>
          !customer.total_spent || customer.total_spent <= 1000000
        );
      } else if (filterStatus === 'new') {
        // Consider customers created in the last 30 days as new
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        result = result.filter(customer =>
          new Date(customer.created_at) >= thirtyDaysAgo
        );
      }
    }

    // Apply spending filter
    if (filterSpending !== 'all') {
      if (filterSpending === 'high') {
        result = result.filter(customer =>
          customer.total_spent && customer.total_spent > 500000
        );
      } else if (filterSpending === 'medium') {
        result = result.filter(customer =>
          customer.total_spent &&
          customer.total_spent > 100000 &&
          customer.total_spent <= 500000
        );
      } else if (filterSpending === 'low') {
        result = result.filter(customer =>
          !customer.total_spent || customer.total_spent <= 100000
        );
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return sortOrder === 'asc'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
      else if (sortBy === 'date') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      else if (sortBy === 'spending') {
        const spendingA = a.total_spent || 0;
        const spendingB = b.total_spent || 0;
        return sortOrder === 'asc' ? spendingA - spendingB : spendingB - spendingA;
      }
      else if (sortBy === 'orders') {
        const ordersA = a.total_orders || 0;
        const ordersB = b.total_orders || 0;
        return sortOrder === 'asc' ? ordersA - ordersB : ordersB - ordersA;
      }
      return 0;
    });

    return result;
  }, [customers, searchTerm, sortBy, sortOrder, filterStatus, filterSpending]);

  // Handlers
  const handleAddCustomer = () => {
    setShowAddCustomer(true);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  // We no longer need to open a separate dialog for editing
  // as editing is now handled within the CustomerDetails component
  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteConfirmation(true);
    setShowCustomerDetails(false);
  };

  const handleCustomerSaved = () => {
    // No need to manually invalidate queries, the mutations handle this
    setShowAddCustomer(false);
    setShowEditCustomer(false);
  };

  const handleCustomerDeleted = () => {
    // No need to manually invalidate queries, the mutations handle this
    setShowDeleteConfirmation(false);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleSortChange = (value: string) => {
    if (value === sortBy) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and reset to ascending
      setSortBy(value);
      setSortOrder('asc');
    }
  };

  const handleExportCSV = () => {
    // In a real app, this would generate and download a CSV file
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Address', 'City', 'Country', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredCustomers.map(customer => [
        customer.first_name,
        customer.last_name,
        customer.email,
        customer.phone || '',
        customer.address || '',
        customer.city || '',
        customer.country || '',
        customer.created_at
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'customers.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    setShowImportSheet(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, this would parse the CSV and import customers
      console.log('Importing file:', file.name);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setShowImportSheet(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("nav.customers")}</h1>
          <p className="text-muted-foreground">
            {t("analytics.customers")}
          </p>
        </div>
        {/* Add Customer button moved to bottom for mobile, still visible here on desktop */}
        <div className="hidden sm:block">
          <Button
            className="flex items-center gap-2"
            onClick={handleAddCustomer}
          >
            <UserPlus className="h-4 w-4" />
            {t("ui.add_customer")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Search - Always at the top for mobile and desktop */}
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("customer.search_placeholder")}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Controls in specified order for mobile, flex-row for desktop */}
        <div className="flex flex-col gap-2 sm:gap-4 items-stretch sm:items-center sm:justify-end">
          {/* Filter, Sort, Import/Export in a horizontal row */}
          <div className="grid grid-cols-3 gap-2">
            {/* 1. Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 w-full justify-center">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only">{t("common.filter")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <p className="text-sm font-medium mb-2">{t("customer.status")}</p>
                  <div className="grid grid-cols-2 gap-1">
                    <Button
                      variant={filterStatus === "all" ? "default" : "outline"}
                      size="sm"
                      className="h-8 justify-start"
                      onClick={() => setFilterStatus("all")}
                    >
                      {t("customer.all_statuses")}
                    </Button>
                    <Button
                      variant={filterStatus === "vip" ? "default" : "outline"}
                      size="sm"
                      className="h-8 justify-start"
                      onClick={() => setFilterStatus("vip")}
                    >
                      {t("customer.vip")}
                    </Button>
                    <Button
                      variant={filterStatus === "regular" ? "default" : "outline"}
                      size="sm"
                      className="h-8 justify-start"
                      onClick={() => setFilterStatus("regular")}
                    >
                      {t("customer.regular")}
                    </Button>
                    <Button
                      variant={filterStatus === "new" ? "default" : "outline"}
                      size="sm"
                      className="h-8 justify-start"
                      onClick={() => setFilterStatus("new")}
                    >
                      {t("customer.new")}
                    </Button>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <div className="p-2">
                  <p className="text-sm font-medium mb-2">{t("customer.spending_level")}</p>
                  <div className="grid grid-cols-1 gap-1">
                    <Button
                      variant={filterSpending === "all" ? "default" : "outline"}
                      size="sm"
                      className="h-8 justify-start"
                      onClick={() => setFilterSpending("all")}
                    >
                      {t("customer.all_spending")}
                    </Button>
                    <Button
                      variant={filterSpending === "high" ? "default" : "outline"}
                      size="sm"
                      className="h-8 justify-start"
                      onClick={() => setFilterSpending("high")}
                    >
                      {t("customer.high_spending")}
                    </Button>
                    <Button
                      variant={filterSpending === "medium" ? "default" : "outline"}
                      size="sm"
                      className="h-8 justify-start"
                      onClick={() => setFilterSpending("medium")}
                    >
                      {t("customer.medium_spending")}
                    </Button>
                    <Button
                      variant={filterSpending === "low" ? "default" : "outline"}
                      size="sm"
                      className="h-8 justify-start"
                      onClick={() => setFilterSpending("low")}
                    >
                      {t("customer.low_spending")}
                    </Button>
                  </div>
                </div>

                <DropdownMenuSeparator />

                <div className="p-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterStatus("all");
                      setFilterSpending("all");
                    }}
                  >
                    {t("common.reset")}
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 2. Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 w-full justify-center">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only">{t("common.sort")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSortChange("name")} className="gap-2">
                  {sortBy === "name" && (
                    <Badge variant="secondary" className="h-5 px-1">
                      {sortOrder === "asc" ? "A-Z" : "Z-A"}
                    </Badge>
                  )}
                  {t("customer.name")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("date")} className="gap-2">
                  {sortBy === "date" && (
                    <Badge variant="secondary" className="h-5 px-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </Badge>
                  )}
                  {t("customer.created")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("spending")} className="gap-2">
                  {sortBy === "spending" && (
                    <Badge variant="secondary" className="h-5 px-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </Badge>
                  )}
                  {t("customer.total_spent")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("orders")} className="gap-2">
                  {sortBy === "orders" && (
                    <Badge variant="secondary" className="h-5 px-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </Badge>
                  )}
                  {t("customer.total_orders")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 3. Import/Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 w-full justify-center">
                  <FileText className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only">{t("customer.import_export")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleImportClick} className="gap-2">
                  <Upload className="h-4 w-4" />
                  {t("customer.import")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportCSV} className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  {t("customer.export_csv")}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <FileJson className="h-4 w-4" />
                  {t("customer.export_json")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Grid/Table View and Refresh in a row */}
          <div className="grid grid-cols-2 gap-2">
            {/* 4. Grid/Table View */}
            <Tabs
              defaultValue="grid"
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "grid" | "table")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grid">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">{t("customer.grid_view")}</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="table">
                  <div className="flex items-center gap-1">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">{t("customer.table_view")}</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Refresh button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              title={t("customer.refresh")}
              className="w-full h-9"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="sr-only sm:not-sr-only">{t("customer.refresh")}</span>
            </Button>
          </div>
        </div>

        {/* Active filters display */}
        {(filterStatus !== 'all' || filterSpending !== 'all') && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("customer.active_filters")}:</span>

            {filterStatus !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                <Tag className="h-3 w-3" />
                {t(`customer.${filterStatus}`)}
                <button
                  className="ml-1 hover:text-primary"
                  onClick={() => setFilterStatus('all')}
                >
                  ×
                </button>
              </Badge>
            )}

            {filterSpending !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                <DollarSign className="h-3 w-3" />
                {t(`customer.${filterSpending}_spending`)}
                <button
                  className="ml-1 hover:text-primary"
                  onClick={() => setFilterSpending('all')}
                >
                  ×
                </button>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => {
                setFilterStatus('all');
                setFilterSpending('all');
              }}
            >
              {t("common.reset")}
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        viewMode === "grid" ? (
          <CustomerGridSkeleton count={6} />
        ) : (
          <CustomerTableViewSkeleton rowCount={6} />
        )
      ) : isError ? (
        <CustomerErrorState onRefresh={handleRefresh} />
      ) : filteredCustomers.length === 0 ? (
        <CustomerEmptyState
          searchTerm={searchTerm}
          onAddCustomer={handleAddCustomer}
        />
      ) : (
        <div className="w-full">
          {viewMode === "grid" ? (
            <CustomerGrid
              customers={filteredCustomers}
              onView={handleViewCustomer}
            />
          ) : (
            <CustomerTableView
              customers={filteredCustomers}
              onView={handleViewCustomer}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />
          )}
        </div>
      )}

      {/* Customer Form Dialog */}
      <CustomerForm
        customer={showEditCustomer ? selectedCustomer : undefined}
        isOpen={showAddCustomer || showEditCustomer}
        onClose={() => {
          setShowAddCustomer(false);
          setShowEditCustomer(false);
        }}
        onSave={handleCustomerSaved}
      />

      {/* Customer Details Dialog */}
      <CustomerDetails
        customerId={selectedCustomer?.id || null}
        isOpen={showCustomerDetails}
        onClose={() => setShowCustomerDetails(false)}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteCustomerDialog
        customer={selectedCustomer}
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onDeleted={handleCustomerDeleted}
      />

      {/* Import Sheet */}
      <Sheet open={showImportSheet} onOpenChange={setShowImportSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t("customer.import_customers")}</SheetTitle>
            <SheetDescription>
              {t("customer.import_description")}
            </SheetDescription>
          </SheetHeader>

          <div className="py-6">
            <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium mb-1">{t("customer.drop_files")}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("customer.supported_formats")}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t("customer.select_file")}
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">{t("customer.import_template")}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {t("customer.download_template")}
              </p>
              <Button variant="outline" size="sm" className="gap-1">
                <FileText className="h-4 w-4" />
                {t("customer.download_template_file")}
              </Button>
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setShowImportSheet(false)}>
              {t("common.cancel")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Add Customer button for mobile view - fixed at bottom */}
      <div className="sm:hidden fixed bottom-20 right-4 z-10">
        <Button
          className="flex items-center justify-center rounded-full shadow-lg h-14 w-14 p-0"
          onClick={handleAddCustomer}
          size="icon"
          variant="default"
        >
          <UserPlus className="h-6 w-6" />
          <span className="sr-only">{t("ui.add_customer")}</span>
        </Button>
      </div>
    </div>
  );
};

export default CustomersPage;
