// Run with: npm run seed
// Creates one admin user and a small starter menu so you have something
// to test against immediately after setup.
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

const run = async () => {
  await connectDB();

  const adminEmail = 'admin@cafe.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'Cafe Admin',
      email: adminEmail,
      password: 'admin1234',
      role: 'admin',
    });
    console.log(`Created admin user -> ${adminEmail} / admin1234`);
  } else {
    console.log('Admin user already exists, skipping.');
  }

  const categoryData = [
    { name: 'Beverages', displayOrder: 1 },
    { name: 'Traditional', displayOrder: 2 },
    { name: 'Fast Food', displayOrder: 3 },
  ];

  const categories = {};
  for (const c of categoryData) {
    let cat = await Category.findOne({ name: c.name });
    if (!cat) cat = await Category.create(c);
    categories[c.name] = cat;
  }
  console.log('Categories ready:', Object.keys(categories));

  const itemCount = await MenuItem.countDocuments();
  if (itemCount === 0) {
    await MenuItem.insertMany([
      {
        name: 'Macchiato',
        description: 'Espresso with a dash of steamed milk foam',
        price: 250,
        category: categories['Beverages']._id,
        imageUrl: '',
      },
      {
        name: 'Iced Latte',
        description: 'Chilled espresso with cold milk',
        price: 320,
        category: categories['Beverages']._id,
        imageUrl: '',
      },
      {
        name: 'Doro Wat',
        description: 'Spiced chicken stew, slow-cooked',
        price: 650,
        category: categories['Traditional']._id,
        imageUrl: '',
      },
      {
        name: 'Club Sandwich',
        description: 'Triple-decker with chicken, egg, and veggies',
        price: 475,
        category: categories['Fast Food']._id,
        imageUrl: '',
      },
    ]);
    console.log('Sample menu items created.');
  } else {
    console.log('Menu items already exist, skipping.');
  }

  await mongoose.disconnect();
  console.log('Seeding complete.');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});