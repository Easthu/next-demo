// 统一导出所有查询函数
// 调用方可以 import { fetchRevenue } from '@/app/lib/data'
// 也可以 import { fetchRevenue } from '@/app/lib/data/dashboard'（更精确）

export {
  fetchRevenue,
  fetchLatestInvoices,
  fetchCardData,
  fetchTopCustomers,
} from './dashboard';

export {
  fetchFilteredInvoices,
  fetchInvoicesPages,
  fetchInvoiceById,
  fetchInvoiceDetailById,
} from './invoice';

export {
  fetchCustomers,
  fetchFilteredCustomers,
  fetchCustomerById,
  fetchInvoicesByCustomer,
} from './customer';

export { fetchUsers } from './user';
