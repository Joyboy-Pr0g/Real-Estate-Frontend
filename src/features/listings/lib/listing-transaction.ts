const SALE_TRANSACTIONS = ['for_sale', 'for_sale_with_assets'] as const;

export function isSaleTransaction(name: string): boolean {
  return (SALE_TRANSACTIONS as readonly string[]).includes(name);
}
