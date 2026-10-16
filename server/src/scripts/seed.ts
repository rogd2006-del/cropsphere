/**
 * FarmDirect Cloud — Database Seed Script
 * 
 * Creates realistic demo data: 8 farmers, 20+ products, 10 consumers, orders, notifications.
 * Idempotent — safe to run multiple times without duplicating records.
 * 
 * Usage: npm run seed --workspace=server
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import argon2 from 'argon2';
import { User } from '../models/User';
import { FarmerProfile } from '../models/FarmerProfile';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Notification } from '../models/Notification';
import { AuditLog } from '../models/AuditLog';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmdirect';

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

const farmersData = [
  { name: 'Mary Okonkwo', email: 'mary@farmdirect.dev', farmName: "Mary's Organic Garden", city: 'Austin', state: 'TX', bio: 'Third-generation farmer specializing in heirloom vegetables and organic greens.', certifications: ['USDA Organic', 'Non-GMO'], yearsInFarming: 15 },
  { name: 'James Chen', email: 'james@farmdirect.dev', farmName: "Chen Family Farm", city: 'Portland', state: 'OR', bio: 'Family-run farm growing Asian vegetables and specialty herbs for over 20 years.', certifications: ['Certified Naturally Grown'], yearsInFarming: 22 },
  { name: 'Sofia Martinez', email: 'sofia@farmdirect.dev', farmName: "Sol y Tierra Farms", city: 'Fresno', state: 'CA', bio: 'Passionate about sustainable farming, growing stone fruits and citrus year-round.', certifications: ['USDA Organic'], yearsInFarming: 8 },
  { name: 'David Mbeki', email: 'david@farmdirect.dev', farmName: "Mbeki Grain Co.", city: 'Wichita', state: 'KS', bio: 'Specializing in heritage grains, ancient wheat varieties, and artisan flour.', certifications: ['Non-GMO', 'Heritage Grain Alliance'], yearsInFarming: 18 },
  { name: 'Rachel Green', email: 'rachel@farmdirect.dev', farmName: "Green Meadows Dairy", city: 'Burlington', state: 'VT', bio: 'Small-batch artisan dairy producing award-winning cheeses and fresh dairy products.', certifications: ['Animal Welfare Approved', 'Certified Humane'], yearsInFarming: 12 },
  { name: 'Tom Nguyen', email: 'tom@farmdirect.dev', farmName: "Sunrise Tropical Farm", city: 'Miami', state: 'FL', bio: 'Growing tropical fruits and exotic produce in the sunny Florida climate.', certifications: ['Florida Organic'], yearsInFarming: 10 },
  { name: 'Elena Petrov', email: 'elena@farmdirect.dev', farmName: "Petrov Honey & Herbs", city: 'Asheville', state: 'NC', bio: 'Beekeeper and herb farmer producing raw honey and medicinal herbs.', certifications: ['American Beekeeping Federation', 'USDA Organic'], yearsInFarming: 7 },
  { name: 'Michael Johnson', email: 'michael@farmdirect.dev', farmName: "Johnson Family Orchards", city: 'Yakima', state: 'WA', bio: 'Apple and pear orchard spanning 50 acres with 30 heritage varieties.', certifications: ['IPM Certified', 'Bee Friendly Farming'], yearsInFarming: 25 },
];

const productsData = [
  // Mary's Organic Garden - vegetables
  { farmerIdx: 0, name: 'Heirloom Tomatoes', description: 'Mix of colorful heirloom tomatoes - Cherokee Purple, Brandywine, and Green Zebra. Vine-ripened for maximum flavor.', category: 'vegetables', price: 4.99, unit: 'lb', stockQuantity: 85, city: 'Austin', state: 'TX', freshness: 'very-fresh', organic: true, tags: ['heirloom', 'vine-ripened'] },
  { farmerIdx: 0, name: 'Baby Spinach', description: 'Tender young spinach leaves, perfect for salads and smoothies. Harvested twice weekly.', category: 'vegetables', price: 3.49, unit: 'bunch', stockQuantity: 60, city: 'Austin', state: 'TX', freshness: 'very-fresh', organic: true, tags: ['leafy', 'salad'] },
  { farmerIdx: 0, name: 'Rainbow Chard', description: 'Colorful Swiss chard varieties. Beautiful and nutritious, great for stir-fries.', category: 'vegetables', price: 2.99, unit: 'bunch', stockQuantity: 45, city: 'Austin', state: 'TX', freshness: 'fresh', organic: true, tags: ['leafy', 'colorful'] },
  // Chen Family Farm - vegetables + herbs
  { farmerIdx: 1, name: 'Bok Choy', description: 'Crisp, fresh baby bok choy. Perfect for stir-fries and soups. Harvested fresh daily.', category: 'vegetables', price: 2.49, unit: 'bunch', stockQuantity: 70, city: 'Portland', state: 'OR', freshness: 'very-fresh', organic: false, tags: ['asian', 'stir-fry'] },
  { farmerIdx: 1, name: 'Thai Basil', description: 'Aromatic Thai basil with distinctive anise flavor. Essential for Thai and Vietnamese cuisine.', category: 'herbs', price: 1.99, unit: 'bunch', stockQuantity: 40, city: 'Portland', state: 'OR', freshness: 'very-fresh', organic: false, tags: ['asian', 'aromatic'] },
  { farmerIdx: 1, name: 'Ginger Root', description: 'Fresh young ginger with thin skin and mild flavor. Perfect for tea and cooking.', category: 'vegetables', price: 3.99, unit: 'lb', stockQuantity: 30, city: 'Portland', state: 'OR', freshness: 'fresh', organic: false, tags: ['root', 'spice'] },
  // Sofia's Fruits - fruits
  { farmerIdx: 2, name: 'White Peaches', description: 'Delicate white peaches with sweet, floral flavor. Limited summer harvest - get them while fresh!', category: 'fruits', price: 5.99, unit: 'lb', stockQuantity: 50, city: 'Fresno', state: 'CA', freshness: 'very-fresh', organic: true, tags: ['stone-fruit', 'seasonal'] },
  { farmerIdx: 2, name: 'Blood Oranges', description: 'Ruby-red Moro blood oranges with rich, complex flavor. Perfect for juice and desserts.', category: 'fruits', price: 4.49, unit: 'lb', stockQuantity: 80, city: 'Fresno', state: 'CA', freshness: 'fresh', organic: true, tags: ['citrus', 'winter'] },
  { farmerIdx: 2, name: 'Nectarines', description: 'Sweet, juicy yellow nectarines with deep flavor. Tree-ripened for natural sweetness.', category: 'fruits', price: 4.99, unit: 'lb', stockQuantity: 65, city: 'Fresno', state: 'CA', freshness: 'very-fresh', organic: true, tags: ['stone-fruit', 'summer'] },
  // Mbeki Grain Co - grains
  { farmerIdx: 3, name: 'Heritage Red Fife Wheat', description: 'Ancient Canadian wheat variety with rich, nutty flavor. Stone-ground to order. Perfect for artisan bread.', category: 'grains', price: 8.99, unit: 'kg', stockQuantity: 100, city: 'Wichita', state: 'KS', freshness: 'good', organic: false, tags: ['ancient-grain', 'bread-wheat'] },
  { farmerIdx: 3, name: 'Emmer Farro', description: 'Nutty, chewy ancient grain. Rich in fiber and protein. Excellent in salads, soups and pilafs.', category: 'grains', price: 7.49, unit: 'kg', stockQuantity: 75, city: 'Wichita', state: 'KS', freshness: 'good', organic: false, tags: ['ancient-grain', 'farro'] },
  { farmerIdx: 3, name: 'Blue Corn Masa', description: 'Stone-ground blue corn masa flour from heirloom varieties. Perfect for tamales and tortillas.', category: 'grains', price: 6.99, unit: 'kg', stockQuantity: 8, city: 'Wichita', state: 'KS', freshness: 'good', organic: false, tags: ['corn', 'masa', 'heirloom'], lowStockThreshold: 15 },
  // Green Meadows Dairy
  { farmerIdx: 4, name: 'Fresh Chèvre', description: 'Soft, tangy fresh goat cheese. Made with milk from our humanely raised Nigerian Dwarf goats.', category: 'dairy', price: 9.99, unit: 'piece', stockQuantity: 25, city: 'Burlington', state: 'VT', freshness: 'very-fresh', organic: false, tags: ['goat-cheese', 'artisan'] },
  { farmerIdx: 4, name: 'Aged Cheddar', description: '18-month aged raw milk cheddar with complex flavors. Award-winning at Vermont Cheese Fest.', category: 'dairy', price: 14.99, unit: 'lb', stockQuantity: 20, city: 'Burlington', state: 'VT', freshness: 'good', organic: false, tags: ['aged-cheese', 'award-winning'] },
  { farmerIdx: 4, name: 'Whole Milk Yogurt', description: 'Creamy whole milk yogurt, cultured for 24 hours. Probiotic-rich with mild tang.', category: 'dairy', price: 5.99, unit: 'litre', stockQuantity: 35, city: 'Burlington', state: 'VT', freshness: 'fresh', organic: false, tags: ['probiotic', 'cultured'] },
  // Sunrise Tropical
  { farmerIdx: 5, name: 'Ataulfo Mangoes', description: 'Creamy, fiberless Ataulfo (champagne) mangoes. The sweetest variety, harvested at peak ripeness.', category: 'fruits', price: 2.99, unit: 'piece', stockQuantity: 90, city: 'Miami', state: 'FL', freshness: 'very-fresh', organic: false, tags: ['tropical', 'sweet'] },
  { farmerIdx: 5, name: 'Dragon Fruit', description: 'Vibrant pink pitahaya with sweet, mild flavor. A striking addition to fruit platters.', category: 'fruits', price: 4.99, unit: 'piece', stockQuantity: 40, city: 'Miami', state: 'FL', freshness: 'fresh', organic: false, tags: ['exotic', 'tropical'] },
  // Petrov Honey & Herbs
  { farmerIdx: 6, name: 'Raw Wildflower Honey', description: 'Unfiltered raw honey from Blue Ridge mountain wildflowers. Contains natural pollen and enzymes.', category: 'honey', price: 12.99, unit: 'litre', stockQuantity: 30, city: 'Asheville', state: 'NC', freshness: 'good', organic: true, tags: ['raw', 'wildflower', 'unpasteurized'] },
  { farmerIdx: 6, name: 'Lavender Bunch', description: 'Fresh dried lavender bunches. Perfect for sachets, cooking, and aromatherapy.', category: 'herbs', price: 5.99, unit: 'bunch', stockQuantity: 55, city: 'Asheville', state: 'NC', freshness: 'fresh', organic: true, tags: ['aromatic', 'dried'] },
  // Johnson Orchards
  { farmerIdx: 7, name: 'Honeycrisp Apples', description: 'The crowd-favorite Honeycrisp with perfect balance of sweet and tart. Our most popular variety.', category: 'fruits', price: 3.99, unit: 'lb', stockQuantity: 150, city: 'Yakima', state: 'WA', freshness: 'fresh', organic: false, tags: ['apples', 'crisp', 'sweet'] },
  { farmerIdx: 7, name: 'Bartlett Pears', description: 'Classic Bartlett pears with buttery texture and honey-sweet flavor. Perfect for eating and canning.', category: 'fruits', price: 3.49, unit: 'lb', stockQuantity: 120, city: 'Yakima', state: 'WA', freshness: 'fresh', organic: false, tags: ['pears', 'traditional'] },
];

const consumersData = [
  { name: 'Alice Wong', email: 'alice@consumer.dev' },
  { name: 'Bob Smith', email: 'bob@consumer.dev' },
  { name: 'Carol Davis', email: 'carol@consumer.dev' },
  { name: 'Daniel Kim', email: 'daniel@consumer.dev' },
  { name: 'Emma Thompson', email: 'emma@consumer.dev' },
  { name: 'Frank Moore', email: 'frank@consumer.dev' },
  { name: 'Grace Lee', email: 'grace@consumer.dev' },
  { name: 'Henry Wilson', email: 'henry@consumer.dev' },
  { name: 'Iris Chen', email: 'iris@consumer.dev' },
  { name: 'Jack Brown', email: 'jack@consumer.dev' },
];

async function seed() {
  console.log('🌱 FarmDirect Cloud — Seed Script Starting...');
  console.log(`📡 Connecting to: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`);

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@FarmDirect2024!';
  const defaultPassword = 'FarmDirect@123';
  
  // ─ Admin ─────────────────────────────────────────────────────────────────
  let admin = await User.findOne({ email: process.env.SEED_ADMIN_EMAIL || 'admin@farmdirect.dev' });
  if (!admin) {
    admin = await User.create({
      email: process.env.SEED_ADMIN_EMAIL || 'admin@farmdirect.dev',
      password: await hashPassword(adminPassword),
      name: 'FarmDirect Admin',
      role: 'ADMIN',
      isActive: true,
    });
    console.log(`✅ Admin created: ${admin.email}`);
  } else {
    console.log(`⏭  Admin already exists: ${admin.email}`);
  }

  // ─ Farmers ───────────────────────────────────────────────────────────────
  const farmerUsers: any[] = [];
  for (const fd of farmersData) {
    let user = await User.findOne({ email: fd.email });
    if (!user) {
      user = await User.create({
        email: fd.email,
        password: await hashPassword(defaultPassword),
        name: fd.name,
        role: 'FARMER',
        isActive: true,
      });
      await FarmerProfile.create({
        userId: user._id,
        farmName: fd.farmName,
        bio: fd.bio,
        location: { city: fd.city, state: fd.state },
        certifications: fd.certifications,
        yearsInFarming: fd.yearsInFarming,
        rating: 4 + Math.random(),
        totalReviews: Math.floor(Math.random() * 50) + 10,
        isVerified: true,
      });
      console.log(`✅ Farmer: ${user.name} (${fd.farmName})`);
    } else {
      console.log(`⏭  Farmer exists: ${user.email}`);
    }
    farmerUsers.push(user);
  }

  // ─ Products ──────────────────────────────────────────────────────────────
  const productDocs: any[] = [];
  for (const pd of productsData) {
    const farmer = farmerUsers[pd.farmerIdx];
    let product = await Product.findOne({ farmerId: farmer._id, name: pd.name });
    if (!product) {
      const harvestDate = new Date();
      harvestDate.setDate(harvestDate.getDate() - Math.floor(Math.random() * 3));
      
      product = await Product.create({
        farmerId: farmer._id,
        ...pd,
        harvestDate,
        availability: true,
        images: [`https://source.unsplash.com/400x300/?${encodeURIComponent(pd.name)},farm,food`],
        lowStockThreshold: (pd as any).lowStockThreshold || 10,
        soldCount: Math.floor(Math.random() * 100),
        rating: 3.5 + Math.random() * 1.5,
        totalReviews: Math.floor(Math.random() * 30),
      });
      console.log(`  🌿 Product: ${product.name}`);
    }
    productDocs.push(product);
  }

  // ─ Consumers ─────────────────────────────────────────────────────────────
  const consumerUsers: any[] = [];
  for (const cd of consumersData) {
    let user = await User.findOne({ email: cd.email });
    if (!user) {
      user = await User.create({
        email: cd.email,
        password: await hashPassword(defaultPassword),
        name: cd.name,
        role: 'CONSUMER',
        isActive: true,
      });
      console.log(`✅ Consumer: ${user.name}`);
    } else {
      console.log(`⏭  Consumer exists: ${user.email}`);
    }
    consumerUsers.push(user);
  }

  // ─ Sample Orders ─────────────────────────────────────────────────────────
  const statusOptions = ['PENDING', 'CONFIRMED', 'PREPARING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];
  let ordersCreated = 0;
  
  for (let i = 0; i < 15; i++) {
    const consumer = consumerUsers[i % consumerUsers.length];
    const product = productDocs[i % productDocs.length];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)] as any;
    const orderNumber = `FD-SEED-${String(i + 1).padStart(4, '0')}`;
    
    const existing = await Order.findOne({ orderNumber });
    if (!existing) {
      const subtotal = product.price * quantity;
      const deliveryFee = 5.00;
      await Order.create({
        orderNumber,
        consumerId: consumer._id,
        farmerId: product.farmerId,
        items: [{
          productId: product._id,
          farmerId: product.farmerId,
          name: product.name,
          unitPrice: product.price,
          quantity,
          unit: product.unit,
          subtotal,
        }],
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        status,
        paymentStatus: status === 'CANCELLED' ? 'REFUNDED' : 'PAID',
        paymentMethod: 'DEMO_PAYMENT',
        paymentReference: `DEMO-SEED-${i}`,
        deliveryMethod: i % 2 === 0 ? 'PICKUP' : 'DELIVERY',
        deliveryAddress: i % 2 !== 0 ? {
          name: consumer.name,
          line1: `${100 + i} Main Street`,
          city: product.city,
          state: product.state,
          zipCode: '10001',
          phone: '555-0100',
        } : undefined,
        statusHistory: [{ status: 'PENDING', timestamp: new Date(Date.now() - i * 86400000), note: 'Order placed (seeded)' }],
        idempotencyKey: `seed-order-${i}`,
        createdAt: new Date(Date.now() - i * 86400000),
      });
      ordersCreated++;
    }
  }
  console.log(`✅ ${ordersCreated} sample orders created`);

  // ─ Notifications ─────────────────────────────────────────────────────────
  let notifsCreated = 0;
  for (const consumer of consumerUsers.slice(0, 3)) {
    const count = await Notification.countDocuments({ userId: consumer._id });
    if (count === 0) {
      await Notification.create([
        { userId: consumer._id, type: 'ORDER_PLACED', title: 'Order Placed', message: 'Your order FD-SEED-0001 has been placed!', read: false },
        { userId: consumer._id, type: 'ORDER_CONFIRMED', title: 'Order Confirmed', message: 'Great news! Your order has been confirmed by the farmer.', read: true },
      ]);
      notifsCreated += 2;
    }
  }
  for (const farmer of farmerUsers.slice(0, 3)) {
    const count = await Notification.countDocuments({ userId: farmer._id });
    if (count === 0) {
      await Notification.create([
        { userId: farmer._id, type: 'ORDER_PLACED', title: 'New Order', message: 'You have received a new order! Please review.', read: false },
        { userId: farmer._id, type: 'LOW_STOCK', title: 'Low Stock Alert', message: 'Blue Corn Masa is running low. Only 8 units remaining.', read: false },
      ]);
      notifsCreated += 2;
    }
  }
  console.log(`✅ ${notifsCreated} notifications created`);

  // ─ Audit log ─────────────────────────────────────────────────────────────
  const auditCount = await AuditLog.countDocuments();
  if (auditCount === 0) {
    await AuditLog.create({
      userId: admin._id,
      userEmail: admin.email,
      action: 'SEED_COMPLETED',
      entity: 'System',
      metadata: { farmersCreated: farmerUsers.length, productsCreated: productDocs.length, consumersCreated: consumerUsers.length },
    });
  }

  console.log('\n✨ Seed completed successfully!');
  console.log('─'.repeat(50));
  console.log('📋 Demo Credentials (local development only):');
  console.log(`  Admin:    ${process.env.SEED_ADMIN_EMAIL || 'admin@farmdirect.dev'} / ${adminPassword}`);
  console.log(`  Farmer:   mary@farmdirect.dev / ${defaultPassword}`);
  console.log(`  Consumer: alice@consumer.dev / ${defaultPassword}`);
  console.log('─'.repeat(50));
  
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
