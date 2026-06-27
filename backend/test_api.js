const axios = require('axios');
const prisma = require('./prismaClient');

async function testApi() {
  // Get token for admin1@guidify.com
  const user = await prisma.user.findFirst({ where: { email: 'admin1@guidify.com' } });
  if (!user) return console.log('User not found');
  
  // We need to generate a token or just call the DB directly if we can't easily sign a token here.
  // Wait, I can generate a token since the app uses jwt.
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "11223344", { expiresIn: '1d' });

  try {
    const res = await axios.get('http://localhost:8000/api/v1/super-admin/learning-paths', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const paths = res.data.data;
    
    const frontendPath = paths.find(p => p.title.toLowerCase() === 'frontend');
    console.log("Frontend Path progress in API response:");
    console.log(JSON.stringify(frontendPath.enrollments, null, 2));
  } catch (err) {
    console.log(err.response ? err.response.data : err.message);
  }
}

testApi().finally(() => prisma.$disconnect());
