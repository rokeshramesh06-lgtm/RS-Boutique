export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price: number;
  image_url: string;
  image_gradient: string;
  category: string;
  gender: 'Men' | 'Women' | 'Unisex';
  sizes: string;
  colors: string;
  in_stock: number;
  featured: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface Order {
  id: number;
  user_id: number;
  total: number;
  subtotal: number;
  discount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  payment_method: string;
  coupon_code: string | null;
  created_at: string;
  items?: OrderItem[];
  user_name?: string;
  user_email?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
}

export interface Coupon {
  id: number;
  code: string;
  discount_percent: number;
  discount_amount: number;
  min_order: number;
  max_uses: number;
  used_count: number;
  active: number;
  expires_at: string;
}
