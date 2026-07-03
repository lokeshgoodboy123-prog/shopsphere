export interface IAddress {
  _id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface ICartItem {
  productId: string;
  product: {
    _id: string;
    name: string;
    price: number;
    discount: number;
    images: string[];
    stock: number;
  };
  quantity: number;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  addresses: IAddress[];
  cart: ICartItem[];
  wishlist: string[];
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface ISpecification {
  name: string;
  value: string;
}

export interface IReview {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  discount: number;
  stock: number;
  rating: number;
  images: string[];
  specifications: ISpecification[];
  reviews: IReview[];
  createdAt: string;
  updatedAt: string;
}

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: IOrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
  };
  phoneNumber: string;
  paymentMethod: "cod" | "razorpay";
  paymentStatus: "pending" | "paid" | "failed";
  paymentId?: string;
  orderStatus: "Pending" | "Confirmed" | "Packed" | "Shipped" | "Delivered" | "Cancelled";
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICoupon {
  _id: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderValue: number;
  isActive: boolean;
  expiryDate: string;
}

export interface IAdminStats {
  stats: {
    revenue: number;
    ordersCount: number;
    productsCount: number;
    usersCount: number;
  };
  salesOverTime: Array<{
    month: string;
    sales: number;
    orders: number;
  }>;
  recentOrders: IOrder[];
}
