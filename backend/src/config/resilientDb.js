import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "../data/db.json");
const PRODUCTS_FILE = path.join(__dirname, "../data/products.json");

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

function loadInitialProducts() {
  if (fs.existsSync(PRODUCTS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
    } catch (e) {}
  }
  return [];
}

function getInitialStore() {
  const products = loadInitialProducts();
  const passwordHash = bcrypt.hashSync("AdminPassword123!", 10);

  return {
    products,
    customers: [
      {
        id: "cust_demo_1",
        email: "connoisseur@gayatribhai.com",
        name: "Arjun Singhania",
        phone: "+91 9820123456",
        password_hash: passwordHash,
        total_spent: 479800,
        total_orders: 2,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
    ],
    addresses: [
      {
        id: "addr_1",
        customer_id: "cust_demo_1",
        name: "Arjun Singhania",
        phone: "+91 9820123456",
        street: "B-42, Altamount Road, Cumballa Hill",
        area: "South Mumbai",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400026",
        type: "HOME",
        is_default: true,
        created_at: new Date().toISOString(),
      },
    ],
    orders: [
      {
        id: "ord_demo_101",
        order_number: "ORD-2026-8819",
        customer_id: "cust_demo_1",
        shipping_address: {
          name: "Arjun Singhania",
          phone: "9820123456",
          street: "B-42, Altamount Road, Cumballa Hill",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400026",
        },
        items: [
          {
            productId: products[0]?.id || "p1",
            name: products[0]?.name || "Azure Leaf Hand-Embroidered Shirt",
            sku: products[0]?.sku || "GB-AZR-01",
            size: "L",
            quantity: 1,
            price: products[0]?.price || 210000,
            image: products[0]?.images?.[0] || "",
          },
        ],
        subtotal: 210000,
        discount_amount: 0,
        shipping_cost: 0,
        total: 210000,
        payment_method: "razorpay",
        payment_status: "paid",
        order_status: "confirmed",
        package_weight: 0.35,
        package_length: 30,
        package_breadth: 25,
        package_height: 4,
        razorpay_order_id: "order_demo_rzp_1",
        razorpay_payment_id: "pay_demo_rzp_1",
        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    coupons: [
      {
        id: "cpn_1",
        code: "WELCOME10",
        description: "10% off on your inaugural atelier order",
        type: "percentage",
        value: 10,
        min_order_amount: 150000,
        usage_limit: 500,
        used_count: 14,
        is_active: true,
      },
      {
        id: "cpn_2",
        code: "GAYATRI20",
        description: "Flat ₹200 off on fine linen orders above ₹2,000",
        type: "fixed",
        value: 20000,
        min_order_amount: 200000,
        usage_limit: 200,
        used_count: 5,
        is_active: true,
      },
    ],
    home_banners: [
      {
        id: "ban_1",
        title: "The Artisanal Linen Atelier",
        subtitle: "Handcrafted French Knot Embroidery & Pure Luxury",
        image_desktop: "/assets/banners/hero_desktop.jpg",
        image_mobile: "/assets/banners/hero_mobile.jpg",
        link: "/shop",
        sort_order: 1,
        is_active: true,
      },
    ],
    blog_posts: [
      {
        id: "post_1",
        slug: "connoisseurs-guide-french-linen-shirts",
        title: "The Connoisseur’s Guide to French Linen",
        subtitle: "Breathable Elegance & European Looming Heritage",
        category: "Artisanal Craft",
        read_time: "5 min read",
        author_name: "Gayatri Bhai Atelier",
        cover_image: "/assets/banners/craft_story.jpg",
        excerpt: "Discover the intricate story behind linen fibers harvested in Normandy and tailored in India with heirloom single-needle precision.",
        is_published: true,
        created_at: new Date().toISOString(),
      },
    ],
    reels: [
      {
        id: "reel_1",
        title: "French Knots in Motion",
        tag: "Craft Heritage",
        video_url: "https://assets.gayatribhai.com/reels/linen1.mp4",
        poster_url: products[0]?.images?.[1] || "",
        views: 1420,
        likes: 184,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ],
    contact_messages: [
      {
        id: "msg_1",
        name: "Devendra Verma",
        email: "devendra@atelierclient.com",
        phone: "+91 9988776655",
        subject: "Custom Monogramming Inquiry",
        message: "Hello Gayatri Bhai team, I would like to order 5 Azure Leaf shirts with personalized hand-embroidered monograms for a family wedding.",
        is_read: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    admin_users: [
      {
        id: "admin_super_1",
        email: "gayatripuri634@gmail.com",
        password_hash: passwordHash,
        name: "Gayatri Puri",
        role: "super_admin",
        is_active: true,
      },
    ],
    settings: {
      pickup_pincode: "452001",
      shiprocket_email: "gayatripuri634@gmail.com",
      free_shipping_threshold: 1999,
      support_phone: "+91 9876543210",
    },
  };
}

class LocalStore {
  constructor() {
    this.data = this.read();
  }

  read() {
    if (fs.existsSync(DB_FILE)) {
      try {
        return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      } catch (e) {}
    }
    const initial = getInitialStore();
    this.write(initial);
    return initial;
  }

  write(data) {
    this.data = data;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {}
  }

  getTable(name) {
    if (!this.data[name]) {
      this.data[name] = [];
      this.write(this.data);
    }
    return this.data[name];
  }

  saveTable(name, records) {
    this.data[name] = records;
    this.write(this.data);
  }
}

export const localStore = new LocalStore();

// Chainable Query Builder
export class LocalQueryBuilder {
  constructor(table) {
    this.tableName = table;
    this.records = [...localStore.getTable(table)];
    this.isSingle = false;
    this.countOnly = false;
  }

  select(fields = "*", options = {}) {
    if (options && options.head) {
      this.countOnly = true;
    }
    return this;
  }

  eq(column, value) {
    this.records = this.records.filter((r) => r[column] === value || String(r[column]) === String(value));
    return this;
  }

  in(column, values) {
    this.records = this.records.filter((r) => values.includes(r[column]));
    return this;
  }

  ilike(column, pattern) {
    const raw = pattern.replace(/%/g, "").toLowerCase();
    this.records = this.records.filter((r) => String(r[column] || "").toLowerCase().includes(raw));
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.records.sort((a, b) => {
      const va = a[column];
      const vb = b[column];
      if (va < vb) return ascending ? -1 : 1;
      if (va > vb) return ascending ? 1 : -1;
      return 0;
    });
    return this;
  }

  range(start, end) {
    this.records = this.records.slice(start, end + 1);
    return this;
  }

  limit(n) {
    this.records = this.records.slice(0, n);
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async insert(data) {
    const tableData = localStore.getTable(this.tableName);
    const newItems = (Array.isArray(data) ? data : [data]).map((item) => ({
      id: item.id || `rec_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
      ...item,
    }));

    tableData.unshift(...newItems);
    localStore.saveTable(this.tableName, tableData);
    this.records = newItems;
    return this;
  }

  async update(updates) {
    const tableData = localStore.getTable(this.tableName);
    const updatedIds = this.records.map((r) => r.id);

    const nextTable = tableData.map((r) => {
      if (updatedIds.includes(r.id)) {
        return { ...r, ...updates, updated_at: new Date().toISOString() };
      }
      return r;
    });

    localStore.saveTable(this.tableName, nextTable);
    this.records = nextTable.filter((r) => updatedIds.includes(r.id));
    return this;
  }

  async upsert(data, options = {}) {
    const tableData = localStore.getTable(this.tableName);
    const conflictCol = options.onConflict || "id";
    const existingIdx = tableData.findIndex((r) => r[conflictCol] === data[conflictCol]);

    if (existingIdx !== -1) {
      tableData[existingIdx] = { ...tableData[existingIdx], ...data, updated_at: new Date().toISOString() };
    } else {
      tableData.unshift({
        id: data.id || `rec_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        created_at: new Date().toISOString(),
        ...data,
      });
    }

    localStore.saveTable(this.tableName, tableData);
    this.records = [tableData[existingIdx !== -1 ? existingIdx : 0]];
    return this;
  }

  async delete() {
    const tableData = localStore.getTable(this.tableName);
    const toDeleteIds = this.records.map((r) => r.id);
    const remaining = tableData.filter((r) => !toDeleteIds.includes(r.id));
    localStore.saveTable(this.tableName, remaining);
    return { error: null };
  }

  then(resolve, reject) {
    const totalCount = localStore.getTable(this.tableName).length;
    let resultData = this.isSingle ? this.records[0] || null : this.records;
    const response = {
      data: resultData,
      count: this.countOnly ? totalCount : this.records.length,
      error: null,
    };
    return Promise.resolve(response).then(resolve, reject);
  }
}
