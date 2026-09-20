import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Branch from '../models/Branch.js';
import Outlet from '../models/Outlet.js';
import Product from '../models/Product.js';

const log = console;

async function seed() {
  await connectDB(log);

  // RazMed-only demonstration data. No external production records are used.
  await Promise.all([
    User.deleteMany({}),
    Branch.deleteMany({}),
    Outlet.deleteMany({}),
    Product.deleteMany({}),
  ]);

  const branches = await Branch.insertMany([
    { name: 'Accra Branch', code: 'ACC', type: 'Automotive Retail', divisions: ['tyres'], manager: 'Branch Manager', staffCount: 0, active: true },
    { name: 'Kumasi Branch', code: 'KSI', type: 'Automotive Retail', divisions: ['tyres'], manager: 'Branch Manager', staffCount: 0, active: true },
  ]);

  const outlets = await Outlet.insertMany(branches.map((branch) => ({
    code: `${branch.code}-AUTO`,
    name: `${branch.name} Automotive Outlet`,
    branch: branch._id,
    division: 'tyres',
    active: true,
    allowCreditSales: true,
  })));

  const accounts = [
    { name: 'RazMed Administrator', username: 'admin', role: 'super_admin' },
    { name: 'RazMed Director', username: 'ceo', role: 'ceo' },
    { name: 'General Manager', username: 'gm', role: 'gm' },
    { name: 'Branch Manager', username: 'branch', role: 'branch' },
    { name: 'Finance Officer', username: 'finance', role: 'finance' },
    { name: 'Sales Attendant', username: 'staff', role: 'staff' },
  ];

  for (const account of accounts) {
    const passwordHash = await bcrypt.hash(account.username, 10);
    await User.create({ ...account, passwordHash, branch: branches[0]._id, branches: branches.map((branch) => branch._id), outlets: outlets.map((outlet) => outlet._id), active: true });
  }

  const catalog = [
    ['TY-001', 'Michelin 205/55R16', 'Tyre', 24, 1450, 1120, '🛞'],
    ['TY-002', 'Bridgestone 195/65R15', 'Tyre', 30, 1280, 960, '🛞'],
    ['RM-001', 'Alloy Rim 17 inch', 'Rim', 12, 2100, 1650, '⭕'],
    ['BA-001', 'Car Battery 12V 60Ah', 'Battery', 18, 980, 720, '🔋'],
    ['LU-001', 'Engine Oil 5W-30 4L', 'Oil & Lubricant', 42, 420, 310, '🛢️'],
    ['LU-002', 'Automatic Transmission Fluid 1L', 'Oil & Lubricant', 36, 180, 125, '🛢️'],
  ];

  for (const outlet of outlets) {
    await Product.insertMany(catalog.map(([code, name, category, qty, price, cost, icon]) => ({ code: `${outlet.code}-${code}`, name, category, qty, reorderLevel: 6, price, cost, icon, branch: outlet.branch, outlet: outlet._id, active: true })));
  }

  console.log('RazMed demo seed complete. Change all demo passwords before production.');
  await disconnectDB();
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
