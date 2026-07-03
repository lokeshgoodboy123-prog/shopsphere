import mongoose from "mongoose";
import { isMongoDB, FileStore, generateId } from "../db.js";

// ==========================================
// TYPES & SCHEMAS
// ==========================================

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
  product: any; // populated product details
  productId: string;
  quantity: number;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  addresses: IAddress[];
  cart: ICartItem[];
  wishlist: string[]; // array of productIds
  createdAt: string;
  updatedAt: string;
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
  category: string; // Category Slug or name
  brand: string;
  price: number;
  discount: number; // Percentage, e.g. 10 for 10% off
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
  shippingAddress: Omit<IAddress, "_id" | "isDefault">;
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

// ==========================================
// UNIFIED MODELS LAYER (MONGOOSE OR FILESTORE)
// ==========================================

export let UsersStore: FileStore<IUser> | null = new FileStore<IUser>("users");
export let ProductsStore: FileStore<IProduct> | null = new FileStore<IProduct>("products");
export let CategoriesStore: FileStore<ICategory> | null = new FileStore<ICategory>("categories");
export let OrdersStore: FileStore<IOrder> | null = new FileStore<IOrder>("orders");
export let CouponsStore: FileStore<ICoupon> | null = new FileStore<ICoupon>("coupons");

// MongoDB Mongoose Schemas (if running with real MongoDB)
let MongooseUserModel: any;
let MongooseProductModel: any;
let MongooseCategoryModel: any;
let MongooseOrderModel: any;
let MongooseCouponModel: any;

if (isMongoDB) {
  // Mongoose definition
  const AddressSchema = new mongoose.Schema({
    _id: { type: String, default: generateId },
    name: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    phone: String,
    isDefault: { type: Boolean, default: false }
  });

  const CartItemSchema = new mongoose.Schema({
    productId: String,
    product: mongoose.Schema.Types.Mixed,
    quantity: Number
  });

  const UserSchema = new mongoose.Schema({
    _id: { type: String, default: generateId },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    addresses: [AddressSchema],
    cart: [CartItemSchema],
    wishlist: [String]
  }, { timestamps: true });

  const CategorySchema = new mongoose.Schema({
    _id: { type: String, default: generateId },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: String
  });

  const SpecificationSchema = new mongoose.Schema({
    name: String,
    value: String
  });

  const ReviewSchema = new mongoose.Schema({
    _id: { type: String, default: generateId },
    userId: String,
    userName: String,
    rating: Number,
    comment: String,
    createdAt: { type: String, default: () => new Date().toISOString() }
  });

  const ProductSchema = new mongoose.Schema({
    _id: { type: String, default: generateId },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    rating: { type: Number, default: 5 },
    images: [String],
    specifications: [SpecificationSchema],
    reviews: [ReviewSchema]
  }, { timestamps: true });

  const OrderItemSchema = new mongoose.Schema({
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  });

  const OrderSchema = new mongoose.Schema({
    _id: { type: String, default: generateId },
    userId: { type: String, required: true },
    userName: String,
    userEmail: String,
    items: [OrderItemSchema],
    shippingAddress: {
      name: String,
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
      phone: String
    },
    phoneNumber: String,
    paymentMethod: { type: String, enum: ["cod", "razorpay"], default: "cod" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    paymentId: String,
    orderStatus: { type: String, enum: ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"], default: "Pending" },
    subtotal: Number,
    shipping: Number,
    tax: Number,
    discount: Number,
    grandTotal: Number
  }, { timestamps: true });

  const CouponSchema = new mongoose.Schema({
    _id: { type: String, default: generateId },
    code: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ["percentage", "flat"], required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    expiryDate: String
  });

  MongooseUserModel = mongoose.models.User || mongoose.model("User", UserSchema);
  MongooseProductModel = mongoose.models.Product || mongoose.model("Product", ProductSchema);
  MongooseCategoryModel = mongoose.models.Category || mongoose.model("Category", CategorySchema);
  MongooseOrderModel = mongoose.models.Order || mongoose.model("Order", OrderSchema);
  MongooseCouponModel = mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
}

// Unified wrappers to support both Mongoose and FileStore out of the box
export const Users = {
  find: async (query: any = {}) => isMongoDB ? MongooseUserModel.find(query).lean() : UsersStore!.find(query),
  findOne: async (query: any) => isMongoDB ? MongooseUserModel.findOne(query).lean() : UsersStore!.findOne(query),
  findById: async (id: string) => isMongoDB ? MongooseUserModel.findById(id).lean() : UsersStore!.findById(id),
  create: async (data: any) => isMongoDB ? (await MongooseUserModel.create(data)).toJSON() : UsersStore!.create(data),
  findByIdAndUpdate: async (id: string, update: any) => {
    if (isMongoDB) {
      return MongooseUserModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    }
    return UsersStore!.findByIdAndUpdate(id, update);
  },
  findByIdAndDelete: async (id: string) => isMongoDB ? MongooseUserModel.findByIdAndDelete(id) : UsersStore!.findByIdAndDelete(id),
};

export const Products = {
  find: async (query: any = {}) => isMongoDB ? MongooseProductModel.find(query).lean() : ProductsStore!.find(query),
  findOne: async (query: any) => isMongoDB ? MongooseProductModel.findOne(query).lean() : ProductsStore!.findOne(query),
  findById: async (id: string) => isMongoDB ? MongooseProductModel.findById(id).lean() : ProductsStore!.findById(id),
  create: async (data: any) => isMongoDB ? (await MongooseProductModel.create(data)).toJSON() : ProductsStore!.create(data),
  findByIdAndUpdate: async (id: string, update: any) => {
    if (isMongoDB) {
      return MongooseProductModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    }
    return ProductsStore!.findByIdAndUpdate(id, update);
  },
  findByIdAndDelete: async (id: string) => isMongoDB ? MongooseProductModel.findByIdAndDelete(id) : ProductsStore!.findByIdAndDelete(id),
  updateMany: async (filter: any, update: any) => isMongoDB ? MongooseProductModel.updateMany(filter, update) : ProductsStore!.updateMany(filter, update),
};

export const Categories = {
  find: async (query: any = {}) => isMongoDB ? MongooseCategoryModel.find(query).lean() : CategoriesStore!.find(query),
  findOne: async (query: any) => isMongoDB ? MongooseCategoryModel.findOne(query).lean() : CategoriesStore!.findOne(query),
  findById: async (id: string) => isMongoDB ? MongooseCategoryModel.findById(id).lean() : CategoriesStore!.findById(id),
  create: async (data: any) => isMongoDB ? (await MongooseCategoryModel.create(data)).toJSON() : CategoriesStore!.create(data),
  findByIdAndUpdate: async (id: string, update: any) => {
    if (isMongoDB) {
      return MongooseCategoryModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    }
    return CategoriesStore!.findByIdAndUpdate(id, update);
  },
  findByIdAndDelete: async (id: string) => isMongoDB ? MongooseCategoryModel.findByIdAndDelete(id) : CategoriesStore!.findByIdAndDelete(id),
};

export const Orders = {
  find: async (query: any = {}) => isMongoDB ? MongooseOrderModel.find(query).sort({ createdAt: -1 }).lean() : OrdersStore!.find((item) => {
    for (const key in query) {
      if (item[key as keyof IOrder] !== query[key]) return false;
    }
    return true;
  }).then(list => list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())),
  findOne: async (query: any) => isMongoDB ? MongooseOrderModel.findOne(query).lean() : OrdersStore!.findOne(query),
  findById: async (id: string) => isMongoDB ? MongooseOrderModel.findById(id).lean() : OrdersStore!.findById(id),
  create: async (data: any) => isMongoDB ? (await MongooseOrderModel.create(data)).toJSON() : OrdersStore!.create(data),
  findByIdAndUpdate: async (id: string, update: any) => {
    if (isMongoDB) {
      return MongooseOrderModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    }
    return OrdersStore!.findByIdAndUpdate(id, update);
  },
  findByIdAndDelete: async (id: string) => isMongoDB ? MongooseOrderModel.findByIdAndDelete(id) : OrdersStore!.findByIdAndDelete(id),
};

export const Coupons = {
  find: async (query: any = {}) => isMongoDB ? MongooseCouponModel.find(query).lean() : CouponsStore!.find(query),
  findOne: async (query: any) => isMongoDB ? MongooseCouponModel.findOne(query).lean() : CouponsStore!.findOne(query),
  findById: async (id: string) => isMongoDB ? MongooseCouponModel.findById(id).lean() : CouponsStore!.findById(id),
  create: async (data: any) => isMongoDB ? (await MongooseCouponModel.create(data)).toJSON() : CouponsStore!.create(data),
  findByIdAndUpdate: async (id: string, update: any) => {
    if (isMongoDB) {
      return MongooseCouponModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    }
    return CouponsStore!.findByIdAndUpdate(id, update);
  },
  findByIdAndDelete: async (id: string) => isMongoDB ? MongooseCouponModel.findByIdAndDelete(id) : CouponsStore!.findByIdAndDelete(id),
};

// ==========================================
// SEEDING LOGIC FOR IMMACULATE CATALOG
// ==========================================

export async function seedInitialData() {
  const existingProducts = await Products.find();
  const hasIndianProducts = existingProducts.some(p => p.brand === "boAt" || p.brand === "Titan");

  if (existingProducts.length > 0 && hasIndianProducts) {
    return; // Already has Indian products and seeded correctly
  }

  console.log("🌱 Database is missing Indian products. Wiping and seeding product catalog, categories, and coupons in Indian Rupees...");

  // Wipe existing collections if they exist to force clean migration to Rupees and Indian products
  if (isMongoDB) {
    if (mongoose.connection.db) {
      try {
        await mongoose.connection.db.collection("products").deleteMany({});
        await mongoose.connection.db.collection("categories").deleteMany({});
        await mongoose.connection.db.collection("coupons").deleteMany({});
      } catch (e) {
        // collection might not exist yet
      }
    }
  } else {
    ProductsStore!.seed([]);
    CategoriesStore!.seed([]);
    CouponsStore!.seed([]);
  }

  // Seed Categories
  const categoriesData: Omit<ICategory, "_id">[] = [
    {
      name: "Electronics",
      slug: "electronics",
      description: "State-of-the-art gadgets, premium audio, smartphones, and smart home appliances.",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Fashion & Wearables",
      slug: "fashion",
      description: "Trendsetting apparel, high-performance athletic footwear, and luxury watches.",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Home & Workspace",
      slug: "home",
      description: "Ergonomic furniture, smart desk lamps, and beautiful ambient decorative pieces.",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Sports & Fitness",
      slug: "sports",
      description: "Smart fitness trackers, durable dumbbells, yoga gear, and workout hydration bottles.",
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop"
    },
    {
      name: "Beauty & Wellness",
      slug: "beauty",
      description: "Organic skincare essentials, rich aromatherapy oils, and natural wellness kits.",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop"
    }
  ];

  const seededCategories: ICategory[] = [];
  for (const cat of categoriesData) {
    const freshCat = await Categories.create(cat);
    seededCategories.push(freshCat);
  }

  // Seed Products with Rupees pricing (INR scale)
  const productsData: Omit<IProduct, "_id" | "rating" | "reviews" | "createdAt" | "updatedAt">[] = [
    {
      name: "ShopSphere Sonic Pro Wireless Headphones",
      description: "Immerse yourself in pure studio-quality sound with our premium active noise-cancelling headphones. Boasting a rich 40-hour battery life, ultra-plush memory foam ear cups, and highly responsive smart touch controls, the Sonic Pro is engineered for audiophiles who demand unmatched sonic clarity and enduring comfort.",
      category: "electronics",
      brand: "SonicWave",
      price: 24999,
      discount: 15,
      stock: 45,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop"
      ],
      specifications: [
        { name: "Driver Size", value: "40mm Dynamic" },
        { name: "Active Noise Cancellation", value: "Up to 38dB Hybrid ANC" },
        { name: "Battery Life", value: "40 Hours (ANC On) / 55 Hours (ANC Off)" },
        { name: "Bluetooth Version", value: "Bluetooth 5.3" },
        { name: "Water Resistance", value: "IPX4 Sweat Resistant" }
      ]
    },
    {
      name: "Vanguard Ultra Smartwatch Series 9",
      description: "Stay ahead of your wellness and connected lifestyle. Featuring a breathtaking always-on OLED retina display, real-time advanced cardiovascular tracking, integrated GPS, and cellular backup capabilities, the Vanguard Series 9 handles everything from intense rugged trail navigation to stylish evening boardrooms with ease.",
      category: "electronics",
      brand: "Vanguard",
      price: 32999,
      discount: 10,
      stock: 30,
      images: [
        "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=800&auto=format&fit=crop"
      ],
      specifications: [
        { name: "Display Type", value: "1.92\" Always-on LTPO OLED" },
        { name: "GPS", value: "Dual-Frequency L1+L5 GPS" },
        { name: "Sensors", value: "ECG, SpO2 Heart Rate, Temperature Sensor" },
        { name: "Water Resistance", value: "Swimproof up to 50m (WR50)" },
        { name: "Battery", value: "Up to 36 hours normal use / 72 hours low power mode" }
      ]
    },
    {
      name: "boAt Nirvana 750 ANC Over-Ear Headphones",
      description: "Experience premium Indian acoustics tuned for heavy bass. Features robust Hybrid Active Noise Cancellation, a massive 50-hour battery backup, signature ASAP charge technology, and deluxe memory foam cups for unmatched isolation and listening pleasure.",
      category: "electronics",
      brand: "boAt",
      price: 3999,
      discount: 20,
      stock: 55,
      images: [
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop"
      ],
      specifications: [
        { name: "Driver Size", value: "40mm Dynamic" },
        { name: "Active Noise Cancellation", value: "Up to 30dB Hybrid ANC" },
        { name: "Playback Duration", value: "50 Hours" },
        { name: "Fast Charge Support", value: "10 mins Charge = 10 hours Playback" },
        { name: "Bluetooth standard", value: "Bluetooth 5.2" }
      ]
    },
    {
      name: "AeroBounce Pro Athletic Sneakers",
      description: "Designed for ultimate kinetic energy return, the AeroBounce Pro features proprietary mesh weave for dynamic temperature regulation and a high-grade nitrogen-infused foam midsole. Perfect for marathon distance runners and urban explorers looking for cloud-like support.",
      category: "fashion",
      brand: "Stratus",
      price: 12999,
      discount: 20,
      stock: 80,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop"
      ],
      specifications: [
        { name: "Midsole Technology", value: "Nitro-Bounce Foam Infusion" },
        { name: "Upper Material", value: "Engineered Breathable Tech-Mesh" },
        { name: "Arch Support", value: "Dynamic Pronation Support Shank" },
        { name: "Weight", value: "240g (Size 9)" }
      ]
    },
    {
      name: "Titan Regalia Gold Chronograph Watch",
      description: "An emblem of premium Indian luxury and watchmaking legacy. Built with dual-tone 23.5 Karat gold plated stainless steel casing, a brilliant emerald green dial with calendar indicator, and surgical-grade sapphire glass with Japanese multi-movement chronograph precision.",
      category: "fashion",
      brand: "Titan",
      price: 14999,
      discount: 10,
      stock: 20,
      images: [
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop"
      ],
      specifications: [
        { name: "Case Material", value: "23.5K Gold-Plated 316L Stainless Steel" },
        { name: "Glass protection", value: "Shatterproof Sapphire Crystal" },
        { name: "Water Rating", value: "50m (5 ATM) Swimproof" },
        { name: "Movement Engine", value: "Japanese Quartz Chronograph" },
        { name: "Warranty", value: "2 Years International Brand Warranty" }
      ]
    },
    {
      name: "Horizon Chrono Steel Watch",
      description: "Exquisite craftsmanship meets modern timekeeping. Built with surgical-grade 316L stainless steel, scratch-resistant sapphire crystal glass, and a precision Japanese quartz chronograph movement, this watch radiates luxury, reliability, and executive polish.",
      category: "fashion",
      brand: "Horizon",
      price: 19999,
      discount: 5,
      stock: 15,
      images: [
        "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800&auto=format&fit=crop"
      ],
      specifications: [
        { name: "Case Diameter", value: "42mm" },
        { name: "Glass Type", value: "Scratch-Resistant Sapphire Crystal" },
        { name: "Movement", value: "Seiko VK63 Mecha-Quartz" },
        { name: "Strap Material", value: "Stainless Steel Oyster Bracelet" },
        { name: "Water Resistance", value: "100 meters (10 ATM)" }
      ]
    },
    {
      name: "The Sleep Company SmartGRID Ergo Chair",
      description: "Experience premium sitting ergonomics powered by patented Indian sleep and posture comfort technology. Built using hyper-elastic smart polymer that dynamically cradles your back, accompanied by dual-adjustable lumbar support and full synchro-tilt controls.",
      category: "home",
      brand: "The Sleep Company",
      price: 18499,
      discount: 15,
      stock: 15,
      images: [
        "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=800&auto=format&fit=crop"
      ],
      specifications: [
        { name: "Seat Composition", value: "Patented SmartGRID Polymer Tech" },
        { name: "Armrest Position", value: "3D Adjustable Controls" },
        { name: "Recline Limits", value: "Up to 135 Degrees Synchro-Tilt" },
        { name: "Piston Grade", value: "SGS Certified Class 4 Hydraulic cylinder" }
      ]
    },
    {
      name: "ErgoComfort Orthopedic Mesh Chair",
      description: "Transform your workspace health and efficiency. Crafted with a premium flexible polymer mesh back, 3D adjustable armrests, and dynamic self-adjusting lumbar support, this chair is certified to improve posture and keep you completely strain-free during long productive hours.",
      category: "home",
      brand: "WorkLine",
      price: 34999,
      discount: 25,
      stock: 12,
      images: [
        "https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?q=80&w=800&auto=format&fit=crop"
      ],
      specifications: [
        { name: "Mesh Type", value: "Korean Wintex Breathable Elastic Mesh" },
        { name: "Armrest Control", value: "3D (Height, Angle, Depth)" },
        { name: "Gas Lift Class", value: "SGS Certified Class 4 Cylinder" },
        { name: "Base Material", value: "Reinforced Heavy Duty Aluminum Alloy" }
      ]
    },
    {
      name: "Lumina Edge smart Desk Lamp",
      description: "A gorgeous, minimalist light sculpture that dynamically adapts to your eyes. Provides dimmable eye-care lighting, a customizable color temperature dial (from warm candlelight to crisp daylight), an ambient auto-sensor, and an integrated fast Qi wireless charger base.",
      category: "home",
      brand: "WorkLine",
      price: 6999,
      discount: 0,
      stock: 50,
      images: [
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1532372320978-9b4d7a92b24d?q=80&w=800&auto=format&fit=crop"
      ],
      specifications: [
        { name: "Wireless Charging", value: "15W Qi Fast Wireless Base" },
        { name: "Color Temp Range", value: "2700K (Warm) - 6500K (Cool)" },
        { name: "Max Brightness", value: "1000 Lumens with Eye-Care diffuser" },
        { name: "Controls", value: "Capacitive Slider and Ambient Auto-Dimming" }
      ]
    },
    {
      name: "Boldfit Adjustable Dumbbell Set (20kg)",
      description: "Build your dream home gym with the highest rated Indian weight training equipment. Features a smooth dual-lock selector dial that replaces 10 standard dumbbells instantly, styled in high-grade impact plastic shells with carbon steel internals.",
      category: "sports",
      brand: "Boldfit",
      price: 5499,
      discount: 12,
      stock: 30,
      images: [
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop"
      ],
      specifications: [
        { name: "Adjustable Dial", value: "2.5kg to 20kg Selectors" },
        { name: "Grip Surface", value: "Serrated Non-Slip Knurled Steel" },
        { name: "Base Platform", value: "Heavy-Duty ABS Safety Tray" },
        { name: "Plates Material", value: "High-Strength Cast Iron Core" }
      ]
    },
    {
      name: "CoreGrip Adjustable Dumbbell Set (40kg)",
      description: "Enjoy a complete home weight room in a single compact set. Features a robust dial lock system that adjusts smoothly from 5kg up to 40kg, replacing 15 separate pairs of dumbbells. Molded with heavy-duty steel cores and impact-resistant outer plates for ultimate longevity.",
      category: "sports",
      brand: "IronForge",
      price: 15999,
      discount: 10,
      stock: 25,
      images: [
        "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop"
      ],
      specifications: [
        { name: "Weight Range", value: "5kg to 40kg per Dumbbell" },
        { name: "Dial System", value: "Precision Steel Dial Lock" },
        { name: "Handle Grip", value: "Ergonomic Textured Steel Knurling" },
        { name: "Storage Tray", value: "Included High-Impact ABS Tray" }
      ]
    },
    {
      name: "HydroFlask Peak Insulated Bottle",
      description: "Keep your recovery beverages ice-cold for 24 hours or steaming hot for 12 hours. Formed from double-walled pro-grade stainless steel with a robust, scratch-resistant powder coat and a completely leakproof sport straw cap.",
      category: "sports",
      brand: "IronForge",
      price: 3499,
      discount: 10,
      stock: 120,
      images: [
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=800&auto=format&fit=crop"
      ],
      specifications: [
        { name: "Capacity", value: "950ml (32 oz)" },
        { name: "Material", value: "18/8 Food-Grade Stainless Steel" },
        { name: "Insulation", value: "TempShield Double-Wall Vacuum" },
        { name: "BPA Free", value: "100% Non-toxic, BPA-free" }
      ]
    },
    {
      name: "Forest Essentials Ayurvedic facial Elixir",
      description: "Luxuriate in authentic Indian skincare formulation by Forest Essentials. Formulated using pure Kashmiri saffron, precious sweet almond oils, and extracts of organic herbs to yield deep nourishment and a radiant traditional youth glow.",
      category: "beauty",
      brand: "Forest Essentials",
      price: 2999,
      discount: 5,
      stock: 40,
      images: [
        "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=800&auto=format&fit=crop"
      ],
      specifications: [
        { name: "Herb Source", value: "Kashmiri Saffron & Sweet Almond Cold-Pressed" },
        { name: "Aroma Type", value: "Natural Sandalwood & Rose Essential" },
        { name: "Volume Size", value: "15ml Elixir Dropper" },
        { name: "Application Method", value: "3-4 drops massaged into clean face overnight" }
      ]
    },
    {
      name: "GlowRadiance Elixir Face Oil",
      description: "Unveil natural luminosity. Our award-winning face oil combines pure certified organic rosehip oil, antioxidant-dense jojoba, and luxurious blue tansy. Rich in Omega-3 and Vitamin E, it deeply hydrates, balances sebum production, and gives you a radiant, healthy glow.",
      category: "beauty",
      brand: "GlowRadiance",
      price: 4999,
      discount: 12,
      stock: 65,
      images: [
        "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=800&auto=format&fit=crop"
      ],
      specifications: [
        { name: "Volume", value: "30ml (1 fl oz)" },
        { name: "Skin Type", value: "Suitable for All Skin Types" },
        { name: "Ingredients", value: "100% Organic Cold-Pressed Oils, Vegan" },
        { name: "Fragrance", value: "Subtle Herbal Aromatherapy Blend" }
      ]
    }
  ];

  for (const prod of productsData) {
    const defaultReviews: IReview[] = [
      {
        _id: generateId(),
        userId: "reviewer1",
        userName: "Alex Johnson",
        rating: 5,
        comment: "Absolutely outstanding quality. Exceeded my high expectations. Highly recommend!",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: generateId(),
        userId: "reviewer2",
        userName: "Samantha Lin",
        rating: 4,
        comment: "Extremely beautiful design and great materials. Just a tiny delay in shipping but completely worth it.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    await Products.create({
      ...prod,
      rating: 4.8,
      reviews: defaultReviews
    });
  }

  // Seed default coupons with Indian Rupee scale
  const couponsData: Omit<ICoupon, "_id">[] = [
    {
      code: "WELCOME5000",
      discountType: "flat",
      discountValue: 5000,
      minOrderValue: 20000,
      isActive: true,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      code: "SPHERE15",
      discountType: "percentage",
      discountValue: 15,
      minOrderValue: 8000,
      isActive: true,
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      code: "FREESHIP",
      discountType: "flat",
      discountValue: 500,
      minOrderValue: 4000,
      isActive: true,
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  for (const coup of couponsData) {
    await Coupons.create(coup);
  }

  console.log("✅ Database seeded with Indian products and INR pricing successfully.");
}
