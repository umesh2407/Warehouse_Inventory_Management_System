export const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (value) => {
  return new Intl.NumberFormat('en-IN').format(Number(value) || 0);
};

export const formatRole = (role) => {
  if (role === 'ADMIN') return 'Admin';
  if (role === 'WAREHOUSE_STAFF') return 'Warehouse Staff';
  return role || '—';
};
