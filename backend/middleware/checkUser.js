const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const checkUser = async (req, res, next) => {
  try {
    const userId = req.user.id; // Assuming you have user authentication and the user ID is available in req.user.id
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = checkUser;
