const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');

dotenv.config({ path: '../.env' });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe-gym-system');
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      MenuItem.deleteMany({})
    ]);

    const users = await User.create([
      { name: 'Admin User', email: 'admin@cafegym.com', password: 'admin123', phone: '9800000001', role: 'admin' },
      { name: 'Kitchen Staff', email: 'kitchen@cafegym.com', password: 'kitchen123', phone: '9800000002', role: 'kitchen_staff' },
      { name: 'Gym Trainer', email: 'trainer@cafegym.com', password: 'trainer123', phone: '9800000003', role: 'gym_trainer' },
      { name: 'Customer One', email: 'customer@cafegym.com', password: 'customer123', phone: '9800000004', role: 'customer' }
    ]);
    console.log(`Created ${users.length} users`);

    const menuItems = await MenuItem.create([
      // Food Items
      { name: 'Momo', description: 'Steamed dumplings with spicy sauce', price: 200, category: 'food_items', isAvailable: true, preparationTime: 20 },
      { name: 'Chowmein', description: 'Stir-fried noodles with vegetables', price: 250, category: 'food_items', isAvailable: true, preparationTime: 15 },
      { name: 'Fried Rice', description: 'Fried rice with mixed vegetables', price: 220, category: 'food_items', isAvailable: true, preparationTime: 15 },
      { name: 'Pizza', description: 'Freshly baked pizza with cheese and toppings', price: 450, category: 'food_items', isAvailable: true, preparationTime: 25 },
      { name: 'Burger', description: 'Juicy burger with cheese and veggies', price: 300, category: 'food_items', isAvailable: true, preparationTime: 15 },

      // Beverages
      { name: 'Coke', description: 'Coca-Cola 330ml', price: 80, category: 'beverages', isAvailable: true, preparationTime: 2 },
      { name: 'Dew', description: 'Mountain Dew 330ml', price: 80, category: 'beverages', isAvailable: true, preparationTime: 2 },
      { name: 'Fanta', description: 'Fanta Orange 330ml', price: 80, category: 'beverages', isAvailable: true, preparationTime: 2 },

      // Coffee
      { name: 'Espresso', description: 'Strong concentrated coffee shot', price: 150, category: 'coffee', isAvailable: true, preparationTime: 5 },
      { name: 'Americano', description: 'Classic black coffee', price: 180, category: 'coffee', isAvailable: true, preparationTime: 5 },
      { name: 'Latte', description: 'Espresso with steamed milk', price: 220, category: 'coffee', isAvailable: true, preparationTime: 5 },
      { name: 'Cappuccino', description: 'Espresso with steamed milk foam', price: 200, category: 'coffee', isAvailable: true, preparationTime: 5 },
      { name: 'Flat White', description: 'Smooth espresso with velvety milk', price: 230, category: 'coffee', isAvailable: true, preparationTime: 5 },
      { name: 'Mocha', description: 'Espresso with chocolate and milk', price: 250, category: 'coffee', isAvailable: true, preparationTime: 7 },
      { name: 'Macchiato', description: 'Espresso with a dash of foam', price: 170, category: 'coffee', isAvailable: true, preparationTime: 5 },

      // Liquors
      { name: 'Draft Beer', description: 'Local craft beer 500ml', price: 350, category: 'liquors', isAvailable: true, preparationTime: 2 },
      { name: 'Whiskey', description: 'Premium whiskey 30ml', price: 500, category: 'liquors', isAvailable: true, preparationTime: 2 },
      { name: 'Vodka', description: 'Premium vodka 30ml', price: 400, category: 'liquors', isAvailable: true, preparationTime: 2 },
      { name: 'Rum', description: 'Dark rum 30ml', price: 350, category: 'liquors', isAvailable: true, preparationTime: 2 },
      { name: 'Wine', description: 'Red wine glass 150ml', price: 600, category: 'liquors', isAvailable: true, preparationTime: 2 }
    ]);
    console.log(`Created ${menuItems.length} menu items`);

    console.log('\n--- Seed Complete ---');
    console.log('Admin: admin@cafegym.com / admin123');
    console.log('Kitchen: kitchen@cafegym.com / kitchen123');
    console.log('Trainer: trainer@cafegym.com / trainer123');
    console.log('Customer: customer@cafegym.com / customer123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
