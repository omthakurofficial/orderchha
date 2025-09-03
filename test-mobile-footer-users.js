// Test script to create users with different roles for testing mobile footer navigation

const testUsers = [
  {
    name: "John Waiter",
    email: "waiter@test.com", 
    role: "waiter",
    password: "test123"
  },
  {
    name: "Chef Kitchen",
    email: "kitchen@test.com",
    role: "kitchen", 
    password: "test123"
  },
  {
    name: "Alice Accountant",
    email: "accountant@test.com",
    role: "accountant",
    password: "test123"
  },
  {
    name: "Bob Cashier",
    email: "cashier@test.com",
    role: "cashier",
    password: "test123"
  },
  {
    name: "Admin User",
    email: "admin@test.com", 
    role: "admin",
    password: "test123"
  }
];

console.log("Test Users for Mobile Footer Navigation:");
console.log("=====================================");
testUsers.forEach(user => {
  console.log(`Role: ${user.role.toUpperCase()}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Password: ${user.password}`);
  console.log(`  Name: ${user.name}`);
  console.log("");
});

console.log("Mobile Footer Navigation Features:");
console.log("=================================");
console.log("1. Waiter: Tables, Take Order, Bills, Customers, Profile");
console.log("2. Kitchen: Kitchen View, Notifications, Profile"); 
console.log("3. Accountant: Tables, Take Order, Bills, Inventory, Customers, Profile");
console.log("4. Cashier: Tables, Take Order, Bills, Inventory, Customers, Profile");
console.log("5. Admin: Settings, Users, Inventory, Dashboard, Profile");
console.log("");
console.log("Footer only appears on mobile devices (< 768px width)");
console.log("Desktop users continue to use the sidebar navigation");
