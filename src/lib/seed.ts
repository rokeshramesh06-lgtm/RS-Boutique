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
    'Churidar': 'linear-gradient(135deg, #2D6A4F 0%, #74C69D 100%)',
    'Nighty': 'linear-gradient(135deg, #7B2FBE 0%, #D4A5FF 100%)',
  };

  const insertProduct = db.prepare(
    `INSERT INTO products (name, description, price, original_price, image_url, image_gradient, category, gender, sizes, colors, in_stock, featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const products = [
    // Sarees
    {
      name: 'Banarasi Silk Saree',
      description: 'Exquisite handwoven Banarasi silk saree with intricate gold zari work and traditional motifs. Perfect for weddings and festive occasions.',
      price: 12999, original_price: 15999, category: 'Sarees', gender: 'Women',
      image_url: 'https://images.pexels.com/photos/8908597/pexels-photo-8908597.jpeg?auto=compress&cs=tinysrgb&w=800',
      sizes: JSON.stringify(['Free Size']),
      colors: JSON.stringify(['Red', 'Maroon', 'Royal Blue', 'Green']),
      in_stock: 1, featured: 1,
    },
    {
      name: 'Kanjeevaram Silk Saree',
      description: 'Authentic Kanjeevaram silk saree from Tamil Nadu with rich pallu design and contrasting border. A timeless masterpiece for your collection.',
      price: 18999, original_price: 22999, category: 'Sarees', gender: 'Women',
      image_url: 'https://images.pexels.com/photos/12995512/pexels-photo-12995512.jpeg?auto=compress&cs=tinysrgb&w=800',
      sizes: JSON.stringify(['Free Size']),
      colors: JSON.stringify(['Purple', 'Gold', 'Magenta', 'Teal']),
      in_stock: 1, featured: 1,
    },
    {
      name: 'Georgette Saree',
      description: 'Lightweight georgette saree with beautiful digital print and satin border. Easy to drape and perfect for office wear and casual functions.',
      price: 6999, original_price: 8999, category: 'Sarees', gender: 'Women',
      image_url: 'https://images.pexels.com/photos/8387170/pexels-photo-8387170.jpeg?auto=compress&cs=tinysrgb&w=800',
      sizes: JSON.stringify(['Free Size']),
      colors: JSON.stringify(['Coral', 'Turquoise', 'Dusty Pink', 'Sage Green']),
      in_stock: 1, featured: 0,
    },
    {
      name: 'Chiffon Saree',
      description: 'Elegant pure chiffon saree with delicate floral embroidery and sequin border. Lightweight and graceful for every celebration.',
      price: 4999, original_price: 6499, category: 'Sarees', gender: 'Women',
      image_url: 'https://images.pexels.com/photos/11812668/pexels-photo-11812668.jpeg?auto=compress&cs=tinysrgb&w=800',
      sizes: JSON.stringify(['Free Size']),
      colors: JSON.stringify(['Pink', 'Peach', 'Sky Blue', 'Lavender']),
      in_stock: 1, featured: 0,
    },
    {
      name: 'Cotton Saree',
      description: 'Handloom cotton saree with traditional hand-block print patterns. Breathable and comfortable, ideal for daily wear and summer outings.',
      price: 2999, original_price: 3999, category: 'Sarees', gender: 'Women',
      image_url: 'https://images.pexels.com/photos/5469670/pexels-photo-5469670.jpeg?auto=compress&cs=tinysrgb&w=800',
      sizes: JSON.stringify(['Free Size']),
      colors: JSON.stringify(['Indigo', 'Mustard', 'White', 'Olive']),
      in_stock: 1, featured: 0,
    },
    {
      name: 'Pattu Silk Saree',
      description: 'Premium Pattu silk saree with rich golden temple border and traditional peacock motifs. A must-have for festive celebrations and temple visits.',
      price: 15999, original_price: 19999, category: 'Sarees', gender: 'Women',
      image_url: 'https://images.pexels.com/photos/9419108/pexels-photo-9419108.jpeg?auto=compress&cs=tinysrgb&w=800',
      sizes: JSON.stringify(['Free Size']),
      colors: JSON.stringify(['Red', 'Navy Blue', 'Emerald Green', 'Wine']),
      in_stock: 1, featured: 1,
    },

    // Churidar
    {
      name: 'Embroidered Churidar Set',
      description: 'Stunning embroidered churidar set with intricate thread work on premium georgette fabric. Includes matching dupatta with scalloped border.',
      price: 5999, original_price: 7999, category: 'Churidar', gender: 'Women',
      image_url: 'https://images.pexels.com/photos/5595710/pexels-photo-5595710.jpeg?auto=compress&cs=tinysrgb&w=800',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Maroon', 'Navy Blue', 'Emerald Green', 'Black']),
      in_stock: 1, featured: 1,
    },
    {
      name: 'Cotton Churidar Suit',
      description: 'Comfortable pure cotton churidar suit with elegant block print design. Perfect for everyday ethnic wear with a modern touch.',
      price: 2499, original_price: 3499, category: 'Churidar', gender: 'Women',
      image_url: 'https://images.pexels.com/photos/2257905/pexels-photo-2257905.jpeg?auto=compress&cs=tinysrgb&w=800',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Yellow', 'Sky Blue', 'Mint Green', 'Coral']),
      in_stock: 1, featured: 0,
    },
    {
      name: 'Silk Churidar Set',
      description: 'Luxurious silk churidar set with zari weave and rich embellishments. A regal choice for weddings and special celebrations.',
      price: 8999, original_price: 11999, category: 'Churidar', gender: 'Women',
      image_url: 'https://images.pexels.com/photos/11159692/pexels-photo-11159692.jpeg?auto=compress&cs=tinysrgb&w=800',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Red', 'Gold', 'Purple', 'Teal']),
      in_stock: 1, featured: 1,
    },
    {
      name: 'Designer Anarkali Churidar',
      description: 'Elegant floor-length Anarkali style churidar with heavy neck embroidery and flared silhouette. Comes with matching churidar pants and dupatta.',
      price: 7999, original_price: 9999, category: 'Churidar', gender: 'Women',
      image_url: 'https://images.pexels.com/photos/19764064/pexels-photo-19764064.jpeg?auto=compress&cs=tinysrgb&w=800',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Wine', 'Turquoise', 'Dusty Rose', 'Midnight Blue']),
      in_stock: 1, featured: 0,
    },
    {
      name: 'Printed Churidar Set',
      description: 'Trendy printed churidar set with contemporary floral patterns on soft rayon fabric. Lightweight and perfect for daily wear and casual outings.',
      price: 3499, original_price: 4999, category: 'Churidar', gender: 'Women',
      image_url: 'https://images.pexels.com/photos/5922741/pexels-photo-5922741.jpeg?auto=compress&cs=tinysrgb&w=800',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Lavender', 'Peach', 'Olive Green', 'Dusty Rose']),
      in_stock: 1, featured: 0,
    },

    // Nighty
    {
      name: 'Silk Night Gown',
      description: 'Luxurious pure silk night gown with delicate lace trim and satin finish. Soft, breathable, and perfect for a restful night.',
      price: 1999, original_price: 2999, category: 'Nighty', gender: 'Women',
      image_url: 'https://images.pexels.com/photos/18160123/pexels-photo-18160123.jpeg?auto=compress&cs=tinysrgb&w=800',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['Blush Pink', 'Lavender', 'Ivory', 'Wine']),
      in_stock: 1, featured: 1,
    },
    {
      name: 'Cotton Nighty',
      description: 'Breathable pure cotton nightdress with charming floral print. Ultra-soft and comfortable for everyday sleepwear.',
      price: 999, original_price: 1499, category: 'Nighty', gender: 'Women',
      image_url: 'https://images.pexels.com/photos/6963182/pexels-photo-6963182.jpeg?auto=compress&cs=tinysrgb&w=800',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL', 'Free Size']),
      colors: JSON.stringify(['Blue', 'Pink', 'Yellow', 'White']),
      in_stock: 1, featured: 0,
    },
    {
      name: 'Satin Night Dress',
      description: 'Elegant satin night dress with adjustable straps and lace detailing. Smooth, lightweight, and glamorous sleepwear for special nights.',
      price: 2499, original_price: 3499, category: 'Nighty', gender: 'Women',
      image_url: 'https://images.pexels.com/photos/10877185/pexels-photo-10877185.jpeg?auto=compress&cs=tinysrgb&w=800',
      sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
      colors: JSON.stringify(['Champagne', 'Black', 'Ruby Red', 'Teal']),
      in_stock: 1, featured: 0,
    },
    {
      name: 'Embroidered Night Gown',
      description: 'Beautiful cotton-blend night gown with delicate chikankari embroidery. A perfect blend of traditional craftsmanship and modern comfort.',
      price: 1499, original_price: 1999, category: 'Nighty', gender: 'Women',
      image_url: 'https://images.pexels.com/photos/7683712/pexels-photo-7683712.jpeg?auto=compress&cs=tinysrgb&w=800',
      sizes: JSON.stringify(['M', 'L', 'XL', 'XXL']),
      colors: JSON.stringify(['White', 'Peach', 'Light Blue', 'Mint']),
      in_stock: 1, featured: 0,
    },
    {
      name: 'Floral Print Nighty',
      description: 'Cheerful floral print nighty in soft hosiery fabric. Features comfortable round neck and short sleeves for all-season wear.',
      price: 1299, original_price: 1799, category: 'Nighty', gender: 'Women',
      image_url: 'https://images.pexels.com/photos/8838890/pexels-photo-8838890.jpeg?auto=compress&cs=tinysrgb&w=800',
      sizes: JSON.stringify(['M', 'L', 'XL', 'XXL', 'Free Size']),
      colors: JSON.stringify(['Rose', 'Lilac', 'Aqua', 'Cream']),
      in_stock: 1, featured: 0,
    },
  ];

  for (const product of products) {
    insertProduct.run(
      product.name,
      product.description,
      product.price,
      product.original_price,
      product.image_url,
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
