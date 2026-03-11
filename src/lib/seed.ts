import { getDb } from './db';
import bcrypt from 'bcryptjs';

export function seedDatabase() {
  const db = getDb();

  const existingProducts = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (existingProducts.count > 0) {
    return { message: 'Database already seeded', seeded: false };
  }

  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const userPasswordHash = bcrypt.hashSync('user123', 10);

  const insertUser = db.prepare(
    'INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
  );

  insertUser.run('Admin', 'admin@rsboutique.com', adminPasswordHash, 'admin');
  insertUser.run('Priya Sharma', 'priya@example.com', userPasswordHash, 'user');

  const gradients: Record<string, string> = {
    'Sarees': 'linear-gradient(135deg, #8B1A1A 0%, #C9A84C 100%)',
    'Lehengas': 'linear-gradient(135deg, #D4337B 0%, #E8A87C 100%)',
    'Suits': 'linear-gradient(135deg, #2D6A4F 0%, #74C69D 100%)',
    'Kurtis': 'linear-gradient(135deg, #7B2FBE 0%, #D4A5FF 100%)',
    'Kurtas': 'linear-gradient(135deg, #1A5276 0%, #48C9B0 100%)',
    'Sherwanis': 'linear-gradient(135deg, #1A1A3E 0%, #C9A84C 100%)',
    'Indo-Western': 'linear-gradient(135deg, #2C3E50 0%, #BDC3C7 100%)',
    'Dupattas': 'linear-gradient(135deg, #E74C3C 0%, #F1948A 100%)',
  };

  const insertProduct = db.prepare(
    `INSERT INTO products (name, description, price, original_price, image_gradient, category, gender, sizes, colors, in_stock, featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const products = [
    {
      name: 'Banarasi Silk Saree',
      description: 'Exquisite handwoven Banarasi silk saree with intricate gold zari work and traditional motifs. Perfect for weddings and festive occasions.',
      price: 12999, original_price: 15999, category: 'Sarees', gender: 'Women',
      sizes: JSON.stringify(['Free Size']),
      colors: JSON.stringify(['Red', 'Maroon', 'Royal Blue', 'Green']),
      in_stock: 1, featured: 1,
    },
    {
      name: 'Kanjeevaram Silk Saree',
      description: 'Authentic Kanjeevaram silk saree from Tamil Nadu with rich pallu design and contrasting border. A timeless masterpiece for your collection.',
      price: 18999, original_price: 22999, category: 'Sarees', gender: 'Women',
      sizes: JSON.stringify(['Free Size']),
      colors: JSON.stringify(['Purple', 'Gold', 'Magenta', 'Teal']),
      in_stock: 1, featured: 1,
    },
    {
      name: 'Embroidered Lehenga Choli',
      description: 'Stunning embroidered lehenga choli with heavy thread work and sequin detailing. Includes matching dupatta with scalloped border.',
      price: 24999, original_price: 32999, category: 'Lehengas', gender: 'Women',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Pink', 'Red', 'Peach', 'Wine']),
      in_stock: 1, featured: 1,
    },
    {
      name: 'Designer Anarkali Suit',
      description: 'Elegant floor-length Anarkali suit with delicate embroidery and flared silhouette. Comes with matching churidar and dupatta.',
      price: 8999, original_price: 11999, category: 'Suits', gender: 'Women',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Navy Blue', 'Emerald Green', 'Maroon', 'Black']),
      in_stock: 1, featured: 0,
    },
    {
      name: 'Cotton Kurti Set',
      description: 'Comfortable pure cotton kurti with hand block print design. Paired with matching palazzo pants for a complete ethnic look.',
      price: 2499, original_price: 3499, category: 'Kurtis', gender: 'Women',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Yellow', 'Sky Blue', 'Mint Green', 'Coral']),
      in_stock: 1, featured: 0,
    },
    {
      name: 'Printed Palazzo Suit',
      description: 'Trendy printed palazzo suit set with contemporary floral patterns. Lightweight and perfect for daily wear and casual outings.',
      price: 3999, original_price: 5499, category: 'Suits', gender: 'Women',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Lavender', 'Peach', 'Olive Green', 'Dusty Rose']),
      in_stock: 1, featured: 0,
    },
    {
      name: 'Bridal Lehenga Set',
      description: 'Magnificent bridal lehenga with heavy hand-embroidered zardozi work, kundan stones, and a luxurious velvet finish. A dream ensemble for your special day.',
      price: 45999, original_price: 59999, category: 'Lehengas', gender: 'Women',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Red', 'Crimson', 'Deep Pink', 'Ivory']),
      in_stock: 1, featured: 1,
    },
    {
      name: 'Chiffon Dupatta',
      description: 'Graceful pure chiffon dupatta with delicate hand-printed patterns and fine lace border. Adds elegance to any outfit.',
      price: 1499, original_price: 1999, category: 'Dupattas', gender: 'Women',
      sizes: JSON.stringify(['Free Size']),
      colors: JSON.stringify(['Red', 'Pink', 'Golden', 'White', 'Blue']),
      in_stock: 1, featured: 0,
    },
    {
      name: 'Royal Sherwani',
      description: 'Regal sherwani crafted with premium jacquard fabric featuring intricate embroidery and button detailing. Ideal for groom and wedding functions.',
      price: 15999, original_price: 19999, category: 'Sherwanis', gender: 'Men',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Ivory', 'Gold', 'Maroon', 'Navy Blue']),
      in_stock: 1, featured: 1,
    },
    {
      name: 'Silk Kurta Pajama',
      description: 'Premium silk kurta pajama set with subtle self-design pattern. Comfortable yet stylish for festive gatherings and ceremonies.',
      price: 5999, original_price: 7999, category: 'Kurtas', gender: 'Men',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['White', 'Cream', 'Light Blue', 'Peach']),
      in_stock: 1, featured: 1,
    },
    {
      name: 'Embroidered Nehru Jacket',
      description: 'Classic Nehru jacket with fine embroidery work on premium cotton blend fabric. Versatile layering piece for ethnic and fusion looks.',
      price: 7999, original_price: 9999, category: 'Indo-Western', gender: 'Men',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Black', 'Navy Blue', 'Beige', 'Olive']),
      in_stock: 1, featured: 0,
    },
    {
      name: 'Cotton Kurta Set',
      description: 'Breathable pure cotton kurta with matching pajama. Features minimalist design with contrast piping, perfect for everyday ethnic wear.',
      price: 2999, original_price: 3999, category: 'Kurtas', gender: 'Men',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['White', 'Sky Blue', 'Lemon Yellow', 'Sage Green']),
      in_stock: 1, featured: 0,
    },
    {
      name: 'Designer Blazer Set',
      description: 'Contemporary Indo-Western designer blazer with mandarin collar and asymmetric cut. Paired with slim-fit trousers for a modern ethnic statement.',
      price: 12999, original_price: 16999, category: 'Indo-Western', gender: 'Men',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Charcoal', 'Wine', 'Teal', 'Slate Blue']),
      in_stock: 1, featured: 0,
    },
    {
      name: 'Pathani Suit',
      description: 'Traditional Pathani suit crafted from premium cotton fabric with comfortable fit. Features classic collar and side pockets for a distinguished look.',
      price: 4499, original_price: 5999, category: 'Kurtas', gender: 'Men',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Black', 'Grey', 'Brown', 'Olive Green']),
      in_stock: 1, featured: 0,
    },
    {
      name: 'Wedding Sherwani Set',
      description: 'Opulent wedding sherwani set with heavy zardozi and dabka embroidery. Includes matching stole, mojari shoes, and sehra. The ultimate groom ensemble.',
      price: 28999, original_price: 35999, category: 'Sherwanis', gender: 'Men',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Ivory', 'Champagne Gold', 'Royal Blue', 'Deep Red']),
      in_stock: 1, featured: 1,
    },
    {
      name: 'Georgette Saree',
      description: 'Lightweight georgette saree with beautiful digital print and satin border. Easy to drape and perfect for office wear and casual functions.',
      price: 6999, original_price: 8999, category: 'Sarees', gender: 'Women',
      sizes: JSON.stringify(['Free Size']),
      colors: JSON.stringify(['Coral', 'Turquoise', 'Dusty Pink', 'Sage Green']),
      in_stock: 1, featured: 0,
    },
  ];

  for (const product of products) {
    insertProduct.run(
      product.name,
      product.description,
      product.price,
      product.original_price,
      gradients[product.category],
      product.category,
      product.gender,
      product.sizes,
      product.colors,
      product.in_stock,
      product.featured
    );
  }

  const insertCoupon = db.prepare(
    `INSERT OR IGNORE INTO coupons (code, discount_percent, discount_amount, min_order, max_uses, used_count, active, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  insertCoupon.run('WELCOME10', 10, 0, 1000, 100, 0, 1, '2027-12-31');
  insertCoupon.run('FESTIVE20', 20, 0, 5000, 50, 0, 1, '2027-03-31');
  insertCoupon.run('FLAT500', 0, 500, 3000, 200, 0, 1, '2027-06-30');

  return { message: 'Database seeded successfully', seeded: true };
}
