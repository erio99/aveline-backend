import pool from './config/db.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const products = [
  {
    name: "Manteau Midnight",
    price: 1200,
    category: "manteaux",
    color: "midnight",
    colorName: "Midnight Blue",
    images: JSON.stringify([
      "https://images.pexels.com/photos/972995/pexels-photo-972995.jpeg?w=600",
      "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?w=600"
    ]),
    sizes: JSON.stringify(["S", "M", "L", "XL"]),
    description: "Manteau long en laine mélangée. Coupe oversize. Doublure en viscose. Exclusivité Web.",
    details: "80% laine, 20% polyamide. Nettoyage à sec uniquement.",
    featured: true
  },
  {
    name: "Robe Burgundy",
    price: 850,
    category: "robes",
    color: "burgundy",
    colorName: "Burgundy",
    images: JSON.stringify([
      "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?w=600",
      "https://images.pexels.com/photos/1485781/pexels-photo-1485781.jpeg?w=600"
    ]),
    sizes: JSON.stringify(["XS", "S", "M", "L"]),
    description: "Robe midi en velours côtelé. Encolure en V. Ceinture assortie.",
    details: "90% polyester, 10% élasthanne. Lavage à 30°C.",
    featured: true
  },
  {
    name: "Pull Midnight",
    price: 450,
    category: "pulls",
    color: "midnight",
    colorName: "Midnight Blue",
    images: JSON.stringify([
      "https://images.pexels.com/photos/1884584/pexels-photo-1884584.jpeg?w=600",
      "https://images.pexels.com/photos/2065195/pexels-photo-2065195.jpeg?w=600"
    ]),
    sizes: JSON.stringify(["S", "M", "L"]),
    description: "Pull col roulé en maille fine. Coupe ajustée. Manches longues.",
    details: "100% mérinos. Lavage à la main recommandé.",
    featured: true
  },
  {
    name: "Pantalon Burgundy",
    price: 580,
    category: "pantalons",
    color: "burgundy",
    colorName: "Burgundy",
    images: JSON.stringify([
      "https://images.pexels.com/photos/994234/pexels-photo-994234.jpeg?w=600",
      "https://images.pexels.com/photos/1485781/pexels-photo-1485781.jpeg?w=600"
    ]),
    sizes: JSON.stringify(["34", "36", "38", "40", "42"]),
    description: "Pantalon tailleur à pinces. Jambe droite. Taille haute.",
    details: "65% polyester, 35% viscose. Lavage à 30°C.",
    featured: true
  },
  {
    name: "Veste Midnight",
    price: 950,
    category: "vestes",
    color: "midnight",
    colorName: "Midnight Blue",
    images: JSON.stringify([
      "https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?w=600",
      "https://images.pexels.com/photos/972995/pexels-photo-972995.jpeg?w=600"
    ]),
    sizes: JSON.stringify(["S", "M", "L", "XL"]),
    description: "Veste en tweed. Boutons dorés. Poches plaquées.",
    details: "60% coton, 40% acrylique. Nettoyage à sec."
  },
  {
    name: "Jupe Burgundy",
    price: 390,
    category: "jupes",
    color: "burgundy",
    colorName: "Burgundy",
    images: JSON.stringify([
      "https://images.pexels.com/photos/1485781/pexels-photo-1485781.jpeg?w=600",
      "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?w=600"
    ]),
    sizes: JSON.stringify(["XS", "S", "M", "L"]),
    description: "Jupe portefeuille en similicuir. Longueur midi. Fermeture zippée.",
    details: "100% polyuréthane. Nettoyer avec un chiffon humide."
  }
];

const seedDB = async () => {
  try {
    // Vider les tables
    await pool.query('DELETE FROM order_items');
    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM users');

    // Insérer les produits
    for (const product of products) {
      await pool.query(
        `INSERT INTO products (name, price, category, color, color_name, images, sizes, description, details, featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [product.name, product.price, product.category, product.color, product.colorName, product.images, product.sizes, product.description, product.details, product.featured]
      );
    }

    // Créer un admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin', 'admin@aveline.com', hashedPassword, 'admin']
    );

    console.log('✅ Données insérées avec succès !');
    console.log('📧 Admin: admin@aveline.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

seedDB();