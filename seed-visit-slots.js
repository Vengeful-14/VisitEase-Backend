// Simple script to run the visit slots seeding
const { exec } = require('child_process');

console.log('🚀 Starting visit slots seeding process...');

// First, generate Prisma client
console.log('📦 Generating Prisma client...');
exec('npx prisma generate', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error generating Prisma client:', error);
    return;
  }
  
  console.log('✅ Prisma client generated successfully');
  
  // Then run the seeding script
  console.log('🌱 Running visit slots seeding...');
  exec('npm run seed:slots', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error seeding visit slots:', error);
      return;
    }
    
    console.log('✅ Visit slots seeding completed successfully!');
    console.log(stdout);
  });
});
