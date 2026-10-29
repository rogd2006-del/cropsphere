/**
 * FarmDirect Cloud — High-Performance In-Memory Data Store
 * Provides resilient, instant fallback data storage when MongoDB Atlas
 * is connecting or unavailable due to network/IP restrictions.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface FarmLocation {
  address: string;
  city: string;
  state: string;
  coordinates: Coordinates;
}

export interface LocalFarmerProfile {
  _id: string;
  userId: string;
  farmName: string;
  bio: string;
  location: FarmLocation;
  certifications: string[];
  farmingPractices: string[];
  rating: number;
  totalReviews: number;
  yearsInFarming: number;
  isVerified: boolean;
  coverImage?: string;
}

export interface LocalProduct {
  _id: string;
  farmerId: string;
  farmerName: string;
  farmName: string;
  name: string;
  description: string;
  category: 'vegetables' | 'fruits' | 'grains' | 'dairy' | 'herbs' | 'honey';
  price: number;
  unit: string;
  stockQuantity: number;
  city: string;
  state: string;
  coordinates: Coordinates;
  freshness: 'very-fresh' | 'fresh' | 'good';
  organic: boolean;
  tags: string[];
  images: string[];
  rating: number;
  totalReviews: number;
  soldCount: number;
  harvestDate: string;
  availability: boolean;
  lowStockThreshold: number;
}

export interface LocalUser {
  _id: string;
  name: string;
  email: string;
  role: 'CONSUMER' | 'FARMER' | 'ADMIN';
  avatar?: string;
  isActive: boolean;
  phone?: string;
}

export interface CartItem {
  productId: string;
  product: LocalProduct;
  quantity: number;
}

export interface LocalCart {
  userId: string;
  items: CartItem[];
  subtotal: number;
}

export interface LocalOrder {
  _id: string;
  orderNumber: string;
  consumerId: string;
  consumerName: string;
  consumerEmail: string;
  farmerId: string;
  farmName: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
    total: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  fulfillmentType: 'DELIVERY' | 'PICKUP';
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  shippingAddress?: {
    line1: string;
    city: string;
    state: string;
    zipCode: string;
  };
  pickupTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalNotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ORDER_PLACED' | 'ORDER_STATUS_CHANGED' | 'LOW_STOCK' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// Haversine distance calculator in miles
export function calculateDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

class LocalStore {
  public users: LocalUser[] = [];
  public farmerProfiles: LocalFarmerProfile[] = [];
  public products: LocalProduct[] = [];
  public carts: Map<string, LocalCart> = new Map();
  public orders: LocalOrder[] = [];
  public notifications: LocalNotification[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    // 1. Users & Farmers
    const farmersInit = [
      {
        id: 'farmer_01',
        name: 'Mary Okonkwo',
        email: 'mary@farmdirect.dev',
        farmName: "Mary's Organic Garden",
        city: 'Austin',
        state: 'TX',
        address: '1240 Farm Road 969, Austin, TX 78725',
        lat: 30.2672,
        lng: -97.7431,
        bio: 'Third-generation farmer specializing in heirloom vegetables and organic greens. Certified regenerative soil management.',
        certifications: ['USDA Organic', 'Non-GMO Project', 'Regenerative Organic'],
        years: 15,
        rating: 4.9,
        reviews: 48,
        cover: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'farmer_02',
        name: 'James Chen',
        email: 'james@farmdirect.dev',
        farmName: 'Chen Family Farm',
        city: 'Portland',
        state: 'OR',
        address: '8840 Sauvie Island Rd, Portland, OR 97231',
        lat: 45.5152,
        lng: -122.6784,
        bio: 'Family-run farm growing Asian vegetables, root crops, and specialty culinary herbs using organic river-valley soil.',
        certifications: ['Certified Naturally Grown', 'Oregon Tilth Organic'],
        years: 22,
        rating: 4.8,
        reviews: 36,
        cover: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'farmer_03',
        name: 'Sofia Martinez',
        email: 'sofia@farmdirect.dev',
        farmName: 'Sol y Tierra Farms',
        city: 'Fresno',
        state: 'CA',
        address: '4520 E Jensen Ave, Fresno, CA 93725',
        lat: 36.7468,
        lng: -119.7726,
        bio: 'Passionate about sustainable farming, solar irrigation, and tree-ripened organic stone fruits and citrus.',
        certifications: ['USDA Organic', 'California Certified Organic Farmers (CCOF)'],
        years: 8,
        rating: 4.95,
        reviews: 62,
        cover: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'farmer_04',
        name: 'David Mbeki',
        email: 'david@farmdirect.dev',
        farmName: 'Mbeki Grain Co.',
        city: 'Wichita',
        state: 'KS',
        address: '1100 E 21st St N, Wichita, KS 67214',
        lat: 37.6872,
        lng: -97.3301,
        bio: 'Specializing in heritage grains, ancient wheat varieties, and stone-milled artisan flour with high nutrient density.',
        certifications: ['Non-GMO', 'Heritage Grain Alliance'],
        years: 18,
        rating: 4.7,
        reviews: 29,
        cover: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'farmer_05',
        name: 'Rachel Green',
        email: 'rachel@farmdirect.dev',
        farmName: 'Green Meadows Dairy',
        city: 'Burlington',
        state: 'VT',
        address: '350 Dorset St, Burlington, VT 05403',
        lat: 44.4759,
        lng: -73.2121,
        bio: 'Small-batch artisan dairy producing award-winning cheeses, raw whole milk yogurt, and chèvre from pasture-raised goats.',
        certifications: ['Animal Welfare Approved', 'Certified Humane', 'Vermont Grassfed'],
        years: 12,
        rating: 4.9,
        reviews: 54,
        cover: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'farmer_06',
        name: 'Tom Nguyen',
        email: 'tom@farmdirect.dev',
        farmName: 'Sunrise Tropical Farm',
        city: 'Miami',
        state: 'FL',
        address: '18710 SW 288th St, Miami, FL 33030',
        lat: 25.7617,
        lng: -80.1918,
        bio: 'Growing tropical fruits, dragon fruit, and exotic produce in the sun-drenched South Florida sub-tropical climate.',
        certifications: ['Florida Certified Organic', 'Fresh From Florida'],
        years: 10,
        rating: 4.85,
        reviews: 41,
        cover: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'farmer_07',
        name: 'Elena Petrov',
        email: 'elena@farmdirect.dev',
        farmName: 'Petrov Honey & Herbs',
        city: 'Asheville',
        state: 'NC',
        address: '740 Craggy Pinnacle Way, Asheville, NC 28804',
        lat: 35.5951,
        lng: -82.5515,
        bio: 'Beekeeper and herb farmer producing raw wildflower honey, medicinal culinary herbs, and lavender in the Blue Ridge Mountains.',
        certifications: ['American Beekeeping Federation', 'USDA Organic', 'Certified Bee-Friendly'],
        years: 7,
        rating: 4.92,
        reviews: 38,
        cover: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'farmer_08',
        name: 'Michael Johnson',
        email: 'michael@farmdirect.dev',
        farmName: 'Johnson Family Orchards',
        city: 'Yakima',
        state: 'WA',
        address: '5200 Summitview Ave, Yakima, WA 98908',
        lat: 46.6021,
        lng: -120.5059,
        bio: 'Pacific Northwest orchard spanning 50 acres with 30 heritage varieties of Honeycrisp apples, Bartlett pears, and cherries.',
        certifications: ['IPM Certified', 'Bee Friendly Farming', 'Salmon-Safe'],
        years: 25,
        rating: 4.88,
        reviews: 67,
        cover: 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=800&q=80',
      },
    ];

    // Create user accounts
    this.users.push({
      _id: 'user_admin',
      name: 'FarmDirect Admin',
      email: 'admin@farmdirect.dev',
      role: 'ADMIN',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    });

    this.users.push({
      _id: 'user_alice',
      name: 'Alice Wong',
      email: 'alice@consumer.dev',
      role: 'CONSUMER',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    });

    farmersInit.forEach((f) => {
      this.users.push({
        _id: f.id,
        name: f.name,
        email: f.email,
        role: 'FARMER',
        isActive: true,
        avatar: f.cover,
      });

      this.farmerProfiles.push({
        _id: `prof_${f.id}`,
        userId: f.id,
        farmName: f.farmName,
        bio: f.bio,
        location: {
          address: f.address,
          city: f.city,
          state: f.state,
          coordinates: { lat: f.lat, lng: f.lng },
        },
        certifications: f.certifications,
        farmingPractices: ['Organic', 'Regenerative', 'Drip Irrigation', 'Zero Pesticide'],
        rating: f.rating,
        totalReviews: f.reviews,
        yearsInFarming: f.years,
        isVerified: true,
        coverImage: f.cover,
      });
    });

    // 2. Products Data
    const rawProducts = [
      // Mary's Organic Garden (Austin, TX)
      {
        farmerIdx: 0,
        name: 'Heirloom Vine Tomatoes',
        category: 'vegetables' as const,
        price: 4.99,
        unit: 'lb',
        stock: 85,
        freshness: 'very-fresh' as const,
        organic: true,
        tags: ['heirloom', 'vine-ripened', 'juicy', 'non-gmo'],
        desc: 'Vibrant mix of Cherokee Purple, Brandywine, and Green Zebra heirloom tomatoes. Harvested at full ripeness for maximum antioxidant sweetness.',
        img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      },
      {
        farmerIdx: 0,
        name: 'Organic Baby Spinach',
        category: 'vegetables' as const,
        price: 3.49,
        unit: 'bunch',
        stock: 60,
        freshness: 'very-fresh' as const,
        organic: true,
        tags: ['leafy', 'smoothie', 'vitamin-k'],
        desc: 'Tender baby spinach harvested morning-of order. Crisp, sweet, and washed in mineral spring water.',
        img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
      },
      {
        farmerIdx: 0,
        name: 'Rainbow Swiss Chard',
        category: 'vegetables' as const,
        price: 2.99,
        unit: 'bunch',
        stock: 45,
        freshness: 'fresh' as const,
        organic: true,
        tags: ['leafy', 'colorful', 'stir-fry'],
        desc: 'Striking ruby, gold, and white ribbed Swiss chard. Excellent for light sautés, quiches, and rustic soups.',
        img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
      },

      // Chen Family Farm (Portland, OR)
      {
        farmerIdx: 1,
        name: 'Crisp Baby Bok Choy',
        category: 'vegetables' as const,
        price: 2.49,
        unit: 'bunch',
        stock: 70,
        freshness: 'very-fresh' as const,
        organic: false,
        tags: ['asian', 'stir-fry', 'crisp'],
        desc: 'Crunchy baby bok choy grown with Willamette Valley spring irrigation. Perfect with garlic and sesame.',
        img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      },
      {
        farmerIdx: 1,
        name: 'Aromatic Thai Basil',
        category: 'herbs' as const,
        price: 1.99,
        unit: 'bunch',
        stock: 40,
        freshness: 'very-fresh' as const,
        organic: false,
        tags: ['asian', 'aromatic', 'anise'],
        desc: 'Distinctive purple-stemmed Thai basil with spicy anise notes. Essential for pho, curries, and herbal infusions.',
        img: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=600&q=80',
      },
      {
        farmerIdx: 1,
        name: 'Fresh Young Ginger',
        category: 'vegetables' as const,
        price: 3.99,
        unit: 'lb',
        stock: 30,
        freshness: 'fresh' as const,
        organic: false,
        tags: ['root', 'spice', 'immunity'],
        desc: 'Tender pink-tipped young ginger with paper-thin skin. No peeling needed; packs a vibrant warming zest.',
        img: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
      },

      // Sol y Tierra Farms (Fresno, CA)
      {
        farmerIdx: 2,
        name: 'Sweet White Peaches',
        category: 'fruits' as const,
        price: 5.99,
        unit: 'lb',
        stock: 50,
        freshness: 'very-fresh' as const,
        organic: true,
        tags: ['stone-fruit', 'seasonal', 'sweet'],
        desc: 'Juicy, fragrant white-fleshed peaches tree-ripened in the Central Valley sunshine. Low acidity and floral sweetness.',
        img: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=600&q=80',
      },
      {
        farmerIdx: 2,
        name: 'Moro Blood Oranges',
        category: 'fruits' as const,
        price: 4.49,
        unit: 'lb',
        stock: 80,
        freshness: 'fresh' as const,
        organic: true,
        tags: ['citrus', 'antioxidant', 'ruby'],
        desc: 'Deep crimson citrus bursting with raspberry undertones. Superb for fresh morning juices and colorful salads.',
        img: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=600&q=80',
      },
      {
        farmerIdx: 2,
        name: 'Sun-Gold Nectarines',
        category: 'fruits' as const,
        price: 4.99,
        unit: 'lb',
        stock: 65,
        freshness: 'very-fresh' as const,
        organic: true,
        tags: ['stone-fruit', 'summer', 'crisp'],
        desc: 'Firm, sweet nectarines with honeyed tang. Tree-harvested daily at peak sugar maturity.',
        img: 'https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=600&q=80',
      },

      // Mbeki Grain Co. (Wichita, KS)
      {
        farmerIdx: 3,
        name: 'Heritage Red Fife Flour',
        category: 'grains' as const,
        price: 8.99,
        unit: 'kg',
        stock: 100,
        freshness: 'good' as const,
        organic: false,
        tags: ['ancient-grain', 'stone-ground', 'sourdough'],
        desc: '19th-century Canadian heirloom wheat freshly stone-ground in our mill. Produces complex, nutty sourdough loaves.',
        img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      },
      {
        farmerIdx: 3,
        name: 'Ancient Emmer Farro',
        category: 'grains' as const,
        price: 7.49,
        unit: 'kg',
        stock: 75,
        freshness: 'good' as const,
        organic: false,
        tags: ['farro', 'fiber', 'superfood'],
        desc: 'Whole emmer wheat berries with rich chewiness. High in protein, iron, and fiber for hearty grain bowls.',
        img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      },
      {
        farmerIdx: 3,
        name: 'Stone-Ground Blue Corn Masa',
        category: 'grains' as const,
        price: 6.99,
        unit: 'kg',
        stock: 12,
        freshness: 'good' as const,
        organic: false,
        tags: ['heirloom-corn', 'masa', 'tortillas'],
        desc: 'Nixtamalized Hopi blue corn stone-ground into silky masa harina. Unmatched earthy flavor for tortillas.',
        img: 'https://images.unsplash.com/photo-1551462147-37885acc36f1?auto=format&fit=crop&w=600&q=80',
      },

      // Green Meadows Dairy (Burlington, VT)
      {
        farmerIdx: 4,
        name: 'Artisan Fresh Chèvre',
        category: 'dairy' as const,
        price: 9.99,
        unit: 'piece',
        stock: 25,
        freshness: 'very-fresh' as const,
        organic: false,
        tags: ['goat-cheese', 'artisan', 'pasture-raised'],
        desc: 'Creamy, tangy soft goat cheese hand-ladled in Vermont. Seasoned with sea salt and cracked peppercorn.',
        img: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80',
      },
      {
        farmerIdx: 4,
        name: '18-Month Aged Raw Cheddar',
        category: 'dairy' as const,
        price: 14.99,
        unit: 'lb',
        stock: 20,
        freshness: 'good' as const,
        organic: false,
        tags: ['aged-cheese', 'raw-milk', 'award-winner'],
        desc: 'Gold-medal award-winning Vermont cheddar aged in cedar caves. Sharp, crumbly, and studded with calcium crystals.',
        img: 'https://images.unsplash.com/photo-1618164435735-413d3b066c9a?auto=format&fit=crop&w=600&q=80',
      },
      {
        farmerIdx: 4,
        name: 'Whole Milk Grassfed Yogurt',
        category: 'dairy' as const,
        price: 5.99,
        unit: 'litre',
        stock: 35,
        freshness: 'fresh' as const,
        organic: false,
        tags: ['probiotic', 'grassfed', 'creamy'],
        desc: 'Slow-cultured for 24 hours with live Bulgarian cultures. Cream-top layer, no added sugar or thickeners.',
        img: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=600&q=80',
      },

      // Sunrise Tropical Farm (Miami, FL)
      {
        farmerIdx: 5,
        name: 'Ataulfo Champagne Mangoes',
        category: 'fruits' as const,
        price: 2.99,
        unit: 'piece',
        stock: 90,
        freshness: 'very-fresh' as const,
        organic: false,
        tags: ['tropical', 'mango', 'fiberless'],
        desc: 'Buttery, fiberless champagne mangoes. Golden skin with intense tropical aroma and honey sweetness.',
        img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
      },
      {
        farmerIdx: 5,
        name: 'Magenta Dragon Fruit',
        category: 'fruits' as const,
        price: 4.99,
        unit: 'piece',
        stock: 40,
        freshness: 'fresh' as const,
        organic: false,
        tags: ['dragon-fruit', 'pitahaya', 'exotic'],
        desc: 'Vivid magenta flesh pitahaya grown in South Florida limestone soil. Lightly sweet with crunchy edible seeds.',
        img: 'https://images.unsplash.com/photo-1527325678964-54921661f888?auto=format&fit=crop&w=600&q=80',
      },

      // Petrov Honey & Herbs (Asheville, NC)
      {
        farmerIdx: 6,
        name: 'Raw Blue Ridge Wildflower Honey',
        category: 'honey' as const,
        price: 12.99,
        unit: 'litre',
        stock: 30,
        freshness: 'good' as const,
        organic: true,
        tags: ['raw-honey', 'unpasteurized', 'mountain-pollens'],
        desc: 'Cold-extracted raw honey from high-elevation Appalachian wildflower blossoms. Never heated; contains live enzymes.',
        img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
      },
      {
        farmerIdx: 6,
        name: 'Mountain Culinary Lavender',
        category: 'herbs' as const,
        price: 5.99,
        unit: 'bunch',
        stock: 55,
        freshness: 'fresh' as const,
        organic: true,
        tags: ['lavender', 'aromatic', 'culinary'],
        desc: 'Hand-cut English lavender bunches grown at 3,200ft elevation. Suitable for baking, tea blends, or aromatics.',
        img: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=600&q=80',
      },

      // Johnson Orchards (Yakima, WA)
      {
        farmerIdx: 7,
        name: 'Crisp Honeycrisp Apples',
        category: 'fruits' as const,
        price: 3.99,
        unit: 'lb',
        stock: 150,
        freshness: 'fresh' as const,
        organic: false,
        tags: ['apples', 'crisp', 'honeycrisp'],
        desc: 'World-famous Yakima Valley Honeycrisp apples. Explosive cellular crunch with balanced sweetness and acid.',
        img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
      },
      {
        farmerIdx: 7,
        name: 'Organic Bartlett Pears',
        category: 'fruits' as const,
        price: 3.49,
        unit: 'lb',
        stock: 120,
        freshness: 'fresh' as const,
        organic: false,
        tags: ['pears', 'juicy', 'bartlett'],
        desc: 'Classic Bartlett pears with golden-yellow skin and buttery melting texture. Ideal for fresh slicing and poached desserts.',
        img: 'https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?auto=format&fit=crop&w=600&q=80',
      },
    ];

    rawProducts.forEach((p, index) => {
      const f = farmersInit[p.farmerIdx];
      const harvest = new Date();
      harvest.setDate(harvest.getDate() - (index % 4));

      this.products.push({
        _id: `prod_${index + 1}`,
        farmerId: f.id,
        farmerName: f.name,
        farmName: f.farmName,
        name: p.name,
        description: p.desc,
        category: p.category,
        price: p.price,
        unit: p.unit,
        stockQuantity: p.stock,
        city: f.city,
        state: f.state,
        coordinates: { lat: f.lat, lng: f.lng },
        freshness: p.freshness,
        organic: p.organic,
        tags: p.tags,
        images: [p.img],
        rating: 4.5 + ((index % 5) * 0.1),
        totalReviews: 12 + index * 3,
        soldCount: 30 + index * 7,
        harvestDate: harvest.toISOString(),
        availability: true,
        lowStockThreshold: 15,
      });
    });

    // Seed an initial demo order for Alice
    this.orders.push({
      _id: 'ord_demo_01',
      orderNumber: 'FD-2026-9041',
      consumerId: 'user_alice',
      consumerName: 'Alice Wong',
      consumerEmail: 'alice@consumer.dev',
      farmerId: 'farmer_01',
      farmName: "Mary's Organic Garden",
      items: [
        {
          productId: 'prod_1',
          name: 'Heirloom Vine Tomatoes',
          price: 4.99,
          quantity: 2,
          unit: 'lb',
          total: 9.98,
        },
        {
          productId: 'prod_2',
          name: 'Organic Baby Spinach',
          price: 3.49,
          quantity: 1,
          unit: 'bunch',
          total: 3.49,
        },
      ],
      subtotal: 13.47,
      deliveryFee: 4.99,
      platformFee: 1.5,
      total: 19.96,
      fulfillmentType: 'DELIVERY',
      status: 'CONFIRMED',
      shippingAddress: {
        line1: '402 Congress Ave #12',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
      },
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Seed a notification
    this.notifications.push({
      _id: 'notif_01',
      userId: 'user_alice',
      title: 'Order Confirmed! 🌿',
      message: "Mary's Organic Garden has confirmed your harvest basket. Estimated delivery tomorrow morning.",
      type: 'ORDER_STATUS_CHANGED',
      isRead: false,
      createdAt: new Date().toISOString(),
      link: '/consumer-dashboard',
    });
  }

  // --- Products ---
  public getProducts(params: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    organic?: boolean;
    freshness?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    userLat?: number;
    userLng?: number;
    maxDistanceMiles?: number;
  }) {
    let result = [...this.products];

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.farmName.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (params.category) {
      result = result.filter((p) => p.category === params.category);
    }

    if (params.organic !== undefined) {
      result = result.filter((p) => p.organic === params.organic);
    }

    if (params.freshness) {
      result = result.filter((p) => p.freshness === params.freshness);
    }

    if (params.minPrice !== undefined) {
      result = result.filter((p) => p.price >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
      result = result.filter((p) => p.price <= params.maxPrice!);
    }

    // Distance calculation and filtering when user coordinates are provided.
    if (params.userLat !== undefined && params.userLng !== undefined) {
      result = result.map((p) => ({
        ...p,
        distanceMiles: calculateDistanceMiles(
          params.userLat!,
          params.userLng!,
          p.coordinates.lat,
          p.coordinates.lng
        ),
      })) as any;

      const maxDist = params.maxDistanceMiles;
      if (typeof maxDist === 'number' && maxDist > 0) {
        result = result.filter((p: any) => p.distanceMiles <= maxDist);
      }
    }

    // Sorting
    const sortField = params.sort || 'createdAt';
    const isAsc = params.order === 'asc';

    result.sort((a: any, b: any) => {
      if (sortField === 'price') {
        return isAsc ? a.price - b.price : b.price - a.price;
      }
      if (sortField === 'rating') {
        return isAsc ? a.rating - b.rating : b.rating - a.rating;
      }
      if (sortField === 'soldCount') {
        return isAsc ? a.soldCount - b.soldCount : b.soldCount - a.soldCount;
      }
      if (sortField === 'distance' && a.distanceMiles !== undefined) {
        return isAsc ? a.distanceMiles - b.distanceMiles : b.distanceMiles - a.distanceMiles;
      }
      return isAsc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });

    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 12));
    const total = result.length;
    const pages = Math.ceil(total / limit);
    const paginated = result.slice((page - 1) * limit, page * limit);

    return {
      products: paginated,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    };
  }

  public getProductById(id: string): LocalProduct | undefined {
    return this.products.find((p) => p._id === id);
  }

  // --- Farmers ---
  public getFarmers() {
    return this.farmerProfiles.map((fp) => {
      const user = this.users.find((u) => u._id === fp.userId);
      const farmProducts = this.products.filter((p) => p.farmerId === fp.userId);
      return {
        ...fp,
        userId: user || { name: fp.farmName, email: '', avatar: fp.coverImage },
        productCount: farmProducts.length,
        specialties: farmProducts.map((p) => p.name).slice(0, 4),
      };
    });
  }

  public getFarmerById(id: string) {
    const fp = this.farmerProfiles.find((f) => f._id === id || f.userId === id);
    if (!fp) return null;
    const user = this.users.find((u) => u._id === fp.userId);
    const products = this.products.filter((p) => p.farmerId === fp.userId);
    return {
      ...fp,
      userId: user,
      products,
    };
  }

  // --- Cart ---
  public getCart(userId: string): LocalCart {
    let cart = this.carts.get(userId);
    if (!cart) {
      cart = { userId, items: [], subtotal: 0 };
      this.carts.set(userId, cart);
    }
    return cart;
  }

  public addToCart(userId: string, productId: string, quantity = 1): LocalCart {
    const cart = this.getCart(userId);
    const product = this.getProductById(productId);
    if (!product) throw new Error('Product not found');

    const existingIndex = cart.items.findIndex((i) => i.productId === productId);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, product, quantity });
    }

    cart.subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    cart.subtotal = Math.round(cart.subtotal * 100) / 100;
    return cart;
  }

  public updateCartItem(userId: string, productId: string, quantity: number): LocalCart {
    const cart = this.getCart(userId);
    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.productId !== productId);
    } else {
      const item = cart.items.find((i) => i.productId === productId);
      if (item) item.quantity = quantity;
    }
    cart.subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    cart.subtotal = Math.round(cart.subtotal * 100) / 100;
    return cart;
  }

  public removeFromCart(userId: string, productId: string): LocalCart {
    return this.updateCartItem(userId, productId, 0);
  }

  public clearCart(userId: string): LocalCart {
    const cart = { userId, items: [], subtotal: 0 };
    this.carts.set(userId, cart);
    return cart;
  }

  // --- Orders ---
  public createOrder(userId: string, data: Partial<LocalOrder>): LocalOrder {
    const user = this.users.find((u) => u._id === userId) || {
      _id: userId,
      name: 'Guest Consumer',
      email: 'guest@consumer.dev',
    };

    const newOrder: LocalOrder = {
      _id: `ord_${Date.now()}`,
      orderNumber: `FD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      consumerId: userId,
      consumerName: user.name,
      consumerEmail: user.email,
      farmerId: data.farmerId || 'farmer_01',
      farmName: data.farmName || "Mary's Organic Garden",
      items: data.items || [],
      subtotal: data.subtotal || 0,
      deliveryFee: data.deliveryFee || 0,
      platformFee: data.platformFee || 1.5,
      total: data.total || 0,
      fulfillmentType: data.fulfillmentType || 'DELIVERY',
      status: 'CONFIRMED',
      shippingAddress: data.shippingAddress,
      pickupTime: data.pickupTime,
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);

    // Add notification
    this.notifications.unshift({
      _id: `notif_${Date.now()}`,
      userId,
      title: 'Harvest Order Confirmed! 🌱',
      message: `Your order #${newOrder.orderNumber} for $${newOrder.total.toFixed(2)} has been placed with ${newOrder.farmName}.`,
      type: 'ORDER_PLACED',
      isRead: false,
      createdAt: new Date().toISOString(),
      link: '/consumer-dashboard',
    });

    // Clear cart
    this.clearCart(userId);

    return newOrder;
  }

  public getOrders(userId?: string, role?: string): LocalOrder[] {
    if (!userId) return this.orders;
    if (role === 'FARMER') {
      return this.orders.filter((o) => o.farmerId === userId);
    }
    if (role === 'ADMIN') {
      return this.orders;
    }
    return this.orders.filter((o) => o.consumerId === userId);
  }

  public getFarmerDashboard(farmerId: string) {
    const products = this.products.filter((p) => p.farmerId === farmerId);
    const orders = this.orders.filter((o) => o.farmerId === farmerId);
    const totalRev = orders.reduce((sum, o) => sum + o.total, 0);
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const salesByDate = new Map<string, { revenue: number; orders: number }>();

    for (const order of orders) {
      const createdAt = new Date(order.createdAt);
      if (
        createdAt.getTime() < thirtyDaysAgo ||
        ['CANCELLED', 'REJECTED'].includes(order.status)
      ) {
        continue;
      }

      const date = createdAt.toISOString().slice(0, 10);
      const dailySales = salesByDate.get(date) || { revenue: 0, orders: 0 };
      dailySales.revenue += order.total;
      dailySales.orders += 1;
      salesByDate.set(date, dailySales);
    }

    return {
      stats: {
        totalProducts: products.length,
        activeProducts: products.filter((p) => p.availability).length,
        lowStockProducts: products.filter(
          (p) => p.stockQuantity <= p.lowStockThreshold
        ).length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(
          (o) => o.status === 'PENDING' || o.status === 'CONFIRMED'
        ).length,
        totalRevenue: Math.round(totalRev * 100) / 100,
        totalSold: products.reduce((sum, p) => sum + p.soldCount, 0),
      },
      recentOrders: orders.slice(0, 5),
      monthlySales: [...salesByDate.entries()]
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([_id, sales]) => ({ _id, ...sales })),
      lowStockItems: products
        .filter((p) => p.stockQuantity <= p.lowStockThreshold)
        .slice(0, 5),
    };
  }
  public getFarmLocations() {
    return this.farmerProfiles.map((fp) => {
      const user = this.users.find((u) => u._id === fp.userId);
      const farmProducts = this.products.filter(
        (p) => p.farmerId === fp.userId
      );

      return {
        _id: fp._id,
        farmerId: fp.userId,
        farmName: fp.farmName,
        farmerName: user?.name || fp.farmName,
        bio: fp.bio,
        address: fp.location.address,
        city: fp.location.city,
        state: fp.location.state,
        coordinates: fp.location.coordinates,
        rating: fp.rating,
        totalReviews: fp.totalReviews,
        yearsInFarming: fp.yearsInFarming,
        certifications: fp.certifications,
        productCount: farmProducts.length,
        topProducts: farmProducts.slice(0, 3).map((p) => ({
          name: p.name,
          price: p.price,
          unit: p.unit,
        })),
      };
    });
  }
}

export const localStore = new LocalStore();