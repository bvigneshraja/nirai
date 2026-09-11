export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Customer {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  location?: string;
  creditLimit?: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  defaultCost: number;
  stock: number;
  unit: string;
}

export interface Sale {
  id: string;
  customerId: string;
  customer: Customer;
  totalAmount: number;
  paidAmount: number;
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'CANCELLED';
  soldAt: string;
  items: SaleItem[];
}

export interface SaleItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  supplierId?: string;
  totalAmount: number;
  purchasedAt: string;
  items: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface CustomerBalance {
  customerId: string;
  customer: Customer;
  stockOnHold: number;
  amountDue: number;
  costValue: number;
  expectedProfit: number;
  creditLimit: number;
  capacityBalance: number;
}

export interface BalanceLedger {
  id: string;
  customerId: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  salesToday: { amount: number; count: number };
  totalOutstanding: number;
  lowStockProducts: Product[];
  recentSales: Sale[];
}
