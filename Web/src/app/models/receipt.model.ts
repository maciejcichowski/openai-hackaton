export interface Receipt {
  id: string;
  storeName: string;
  purchaseDate: string;
  totalAmount: number;
  receiptNumber: string;
  imagePath: string;
  createdAt: string;
  items: ReceiptItem[];
}

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
}
