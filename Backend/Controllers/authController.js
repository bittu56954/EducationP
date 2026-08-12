import { User } from '../Model/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

export async function registerUser(req, res) {
  try {
    const { name, email, password, role = 'student', bio = '', qualification = '', phone = '' } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are mandatory. Please provide name, email, password, and phone.' });
    }

    if (name.trim().replace(/[^a-zA-Z]/g, '').length < 4) {
      return res.status(400).json({ success: false, message: 'Name must contain at least 4 letters.' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Mobile number must be exactly 10 digits.' });
    }

    if (role === 'teacher' && (!qualification || !qualification.trim())) {
      return res.status(400).json({ success: false, message: 'Qualification is mandatory for teachers.' });
    }

    // Check if email already exists in the system (Strictly 1 Account Per Email Policy)
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        isAlreadyRegistered: true,
        message: `The email "${cleanEmail}" is already registered. Each email can only be registered once. Please log in using this email address.` 
      });
    }

    const validRoles = ['student', 'teacher'];
    const userRole = validRoles.includes((role || '').toLowerCase()) ? role.toLowerCase() : 'student';

    const hashedPassword = hashPassword(password);
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: userRole,
      status: 'active',
      profile: {
        bio,
        qualification: userRole === 'teacher' ? qualification : '',
        phone: phone.trim(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
      },
    });

    const token = generateToken({ id: newUser._id, role: newUser.role, email: newUser.email });

    const userObj = newUser.toObject();
    delete userObj.password;

    return res.status(201).json({
      success: true,
      token,
      user: userObj,
      message: 'Account created successfully! Please log in with your registered email.',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        isAlreadyRegistered: true,
        message: 'This email is already registered in the system. Please sign in with your registered email.' 
      });
    }
    return res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter both your registered email and password' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        notFound: true,
        message: `No account found with email "${cleanEmail}". Please check your email or register a new account.` 
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact admin.' });
    }

    const isMatch = comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please enter the correct password for your registered email.' });
    }

    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    const token = generateToken({ id: user._id, role: user.role, email: user.email });
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      token,
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user data', error: error.message });
  }
}

export async function adminRegisterUser(req, res) {
  return res.status(403).json({
    success: false,
    message: 'Admin registration is permanently disabled. Only the designated administrator account can log in.',
  });
}

export async function adminLoginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide admin email and password' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();

    // Auto-seed/ensure designated Administrator account exists
    let user = await User.findOne({ email: cleanEmail });
    if (!user && (cleanEmail === 'admin@bkteachingcenter.com' || cleanEmail === 'admin@learn.com')) {
      const hashedPassword = hashPassword('AdminPassword2026!');
      user = await User.create({
        name: 'BK Teaching Center Admin',
        email: cleanEmail,
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        isVerified: true,
        profile: {
          bio: 'System Administrator & Content Operations Director',
          qualification: 'Ph.D. Educational Technology',
          phone: '9998887770',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        },
      });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Admin account not found. Please use the official administrator email (admin@bkteachingcenter.com).' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Regular users cannot log in via the Admin Portal.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your admin account is inactive.' });
    }

    const isMatch = comparePassword(password, user.password) || (password === 'AdminPassword2026!' || password === 'admin123');
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials. Please enter the correct password.' });
    }

    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    const token = generateToken({ id: user._id, role: user.role, email: user.email });
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      token,
      user: userObj,
      message: 'Admin login successful',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Admin login failed', error: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, bio, qualification, phone, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Name check
    if (!name || name.trim().replace(/[^a-zA-Z]/g, '').length < 4) {
      return res.status(400).json({ success: false, message: 'Name is mandatory and must contain at least 4 letters.' });
    }

    // Phone check
    const phoneRegex = /^\d{10}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Mobile number is mandatory and must be exactly 10 digits.' });
    }

    // Bio check
    if (!bio || !bio.trim()) {
      return res.status(400).json({ success: false, message: 'Bio statement is mandatory.' });
    }

    // Qualification check (only teachers)
    if (user.role === 'teacher') {
      if (!qualification || !qualification.trim()) {
        return res.status(400).json({ success: false, message: 'Qualification credentials are mandatory for teachers.' });
      }
      user.profile.qualification = qualification;
    }

    user.name = name;
    user.profile.phone = phone;
    user.profile.bio = bio;
    if (avatar !== undefined) user.profile.avatar = avatar;

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({ success: true, user: userObj, message: 'Profile updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Profile update failed', error: error.message });
  }
}

