// backend/controllers/careerReport.controller.js
const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const { generateAnalysis } = require('../services/careerReport.service');
const { generateTextReport } = require('../services/careerReportGenerator');

async function getOrCreateSupportAccount() {
  const email = 'support@guidfy.com';
  let supportUser = await prisma.user.findUnique({ where: { email } });

  if (!supportUser) {
    const hashedPassword = await bcrypt.hash('support123!@#', 10);
    supportUser = await prisma.user.create({
      data: {
        name: 'Guidfy Support Bot',
        email,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        title: 'AI Career Advisor',
      }
    });
  }
  return supportUser;
}

const generateCareerReport = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Generate Analysis
    const analysis = await generateAnalysis(studentId);

    // 2. Generate Text Report
    const reportText = generateTextReport(analysis);

    // 3. Get Support Account
    const supportUser = await getOrCreateSupportAccount();

    // 4. Send Message via Chat System
    const message = await prisma.chatMessage.create({
      data: {
        senderId: supportUser.id,
        receiverId: studentId,
        content: reportText,
        read: false
      }
    });

    res.status(200).json({ 
      success: true, 
      message: 'Career report generated successfully and sent to your messages.',
      reportId: message.id
    });
  } catch (error) {
    console.error('Error generating career report:', error);
    res.status(500).json({ success: false, message: 'Failed to generate career report.' });
  }
};

module.exports = { generateCareerReport };
