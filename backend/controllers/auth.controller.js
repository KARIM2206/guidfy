const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
// const errorHandler = require('../utils/errorHandler');
// Helper لتوليد التوكن
const generateToken = require('../utils/generateToken');
const generateVerificationToken = require('../utils/generateVerificationToken');

// Register
const sendEmail = require("../utils/sendEmail"); // هنكتبها بعد شوية
const errorHandler = require('../utils/errorHandler');
const prisma = require('../prismaClient');

exports.register = async (req, res) => {
  try {
    const { email, name, password, confirmPassword } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: "Passwords do not match" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
  
  

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        password: hashedPassword,
        // confirmPassword: confirmPassword || null,
        // role: (role || "BUYER").toUpperCase(),
     
      }
    });

 
 

    res.status(201).json({
      success: true,
      message: "User registered successfully"
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, error: "Failed to register", details: error.message });
  }
};
// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    const token = generateToken(user.id);


    res.json({
      success: true,
      message: "Login successful",
      data: { id: user.id, email: user.email, role: user.role ,name:user.name},
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Failed to login", details: error.message });
  }
};


// Verify Account (مثال بسيط)

// Get Current User
exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(errorHandler(401, "Unauthorized"));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
       
        createdAt: true,
        updatedAt: true
      }
    });
//  //(user);

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    res.json({ 
      success: true, 
      message: "Current user fetched successfully", 
      status: 200,
      data: user 
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return next(errorHandler(500, "Failed to fetch current user", error.message));
  }
};

exports.uploadImage=async(req,res,next)=>{
  try {
    if (!req.file) {
      return next(errorHandler(400, "No file uploaded"));
    }

    // هنا يمكنك معالجة الصورة المرفوعة، مثل حفظها في قاعدة البيانات
    const imageUrl = `/uploads/profileImage/${req.file.filename}`;

    // تحديث صورة المستخدم في قاعدة البيانات
    await prisma.user.update({
      where: { id: req.user.id },
      data: { image: imageUrl }
    });

    res.json({
      success: true,
      message: "Image uploaded successfully",
      data: { image: imageUrl }
    });
  } catch (error) {
    console.error("Upload image error:", error);
    return next(errorHandler(500, "Failed to upload image", error.message));
  }
};

exports.updateProfile=async(req,res,next)=>{
  try {
    const { name ,email,password} = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return next(errorHandler(401, "Unauthorized"));
    }
    const user=await prisma.user.findUnique({where:{id:userId}})
    if(!user){
      return next(errorHandler(404, "User not found"));
    }
    const updateData={};
    if(name){
      updateData.name=name;
    }
    if(email){
      updateData.email=email;
    }
    if(password){
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password=hashedPassword;
    }
    
    const updatedUser=await prisma.user.update({where:{id:userId},data:updateData});
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return next(errorHandler(500, "Failed to update profile", error.message));
  }
};

exports.changeUserRole=async(req,res,next)=>{
  try {
    const { role,email} = req.body;
  
    const updatedUser=await prisma.user.update({where:{email:email},data:{role:role}});
    res.json({
      success: true,
      message: "Role updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error("Change role error:", error);
    return next(errorHandler( error.message, 500));
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query; // ?role=ADMIN or ?role=STUDENT

    let filter = {  }; // استبعاد السوبر أدمن

    if (role === "ADMIN") {
      filter.role = "ADMIN";
    } else if (role === "STUDENT") {
      filter.role = "STUDENT";
    }

    const users = await prisma.user.findMany({
      where: filter,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: `All ${role ? role.toLowerCase() : ""} users fetched successfully`,
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return next(errorHandler(error.message, 500));
  }
};
exports.addUser = async (req, res, next) => {
  try {
    const { email, name, role, password } = req.body;

    // ✅ تحقق من البيانات
    if (!email || !name || !role || !password) {
      return next(errorHandler("All fields are required", 400));
    }

    // ✅ توحيد شكل الإيميل
    const normalizedEmail = email.toLowerCase();
console.log(role,'role');

    // ✅ تأكد إن الرول صحيح (Enum validation)
    const allowedRoles = ["STUDENT", "ADMIN", "SUPER_ADMIN"];
    if (!allowedRoles.includes(role.toUpperCase())) {
      return next(errorHandler("Invalid role", 400));
    }

    // ✅ تحقق هل المستخدم موجود
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return next(errorHandler("User already exists", 400));
    }

    // ✅ تشفير الباسورد
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ إنشاء المستخدم
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name,
        role: role.toUpperCase(), // مهم علشان Prisma Enum
        password: hashedPassword,
      },
    });

    // ❌ لا ترجع الباسورد في الريسبونس
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: `${role} added successfully`,
      data: userWithoutPassword,
    });

  } catch (error) {
    console.error("Add user error:", error);
    return next(errorHandler(error.message, 500));
  }
};
exports.deleteUser=async(req,res,next)=>{
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return next(errorHandler("User not found", 404));
    }
    const updatedUser=await prisma.user.delete({where:{id:user.id}});
    res.json({
      success: true,
      message: "User deleted successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return next(errorHandler);
  }
}

exports.getAllDashboardStats=async(req,res,next)=>{
  try {
    const usersCount = await prisma.user.count();
    const learningPathsCount = await prisma.learningPath.count();
    const roadmapsCount = await prisma.roadmap.count();
    const lessonsCount = await prisma.lesson.count();
 
    res.json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: {
        users: usersCount,
        learningPaths: learningPathsCount,
        roadmaps: roadmapsCount,
        lessons: lessonsCount,
      },
    });
  } catch (error) {
    console.error("Get all dashboard stats error:", error);
    return next(errorHandler(error.message, 500));
  }
};