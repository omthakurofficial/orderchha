
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  imageHint: string;
  inStock: boolean;
}

export interface OrderItem extends MenuItem {
    quantity: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  items: MenuItem[];
}

export interface Table {
  id: number;
  status: 'available' | 'occupied' | 'reserved' | 'disabled';
  capacity: number;
}

export interface Settings {
    cafeName: string;
    address: string;
    phone: string;
    logo: string;
    aiSuggestionsEnabled: boolean;
    onlineOrderingEnabled: boolean;
    paymentQrUrl: string;
}
