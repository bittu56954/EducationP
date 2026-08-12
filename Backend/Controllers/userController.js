import { User } from '../Model/User.js';
import { hashPassword } from '../utils/password.js';

export async function getAllUsers(req, res) {
  try {
    const { role, status, search } = req.query;
    let query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password');
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
}

export async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newStatus = req.body.status || (user.status === 'active' ? 'inactive' : 'active');
    user.status = newStatus;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: `User status changed to ${newStatus}`,
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user status', error: error.message });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.name !== undefined) {
      if (!req.body.name || req.body.name.trim().replace(/[^a-zA-Z]/g, '').length < 4) {
        return res.status(400).json({ success: false, message: 'Name must contain at least 4 letters.' });
      }
      user.name = req.body.name;
    }

    if (req.body.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const cleanEmail = (req.body.email || '').trim().toLowerCase();
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      }
      const existingEmailUser = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
      if (existingEmailUser) {
        return res.status(400).json({ 
          success: false, 
          message: `The email "${cleanEmail}" is already registered to another account. Each email must be unique.` 
        });
      }
      user.email = cleanEmail;
    }

    if (req.body.role) user.role = req.body.role;
    if (req.body.status) user.status = req.body.status;

    if (req.body.password !== undefined) {
      if (!req.body.password || req.body.password.length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
      }
      user.password = hashPassword(req.body.password);
    }

    if (req.body.profile) {
      const { bio, qualification, phone } = req.body.profile;

      if (phone !== undefined) {
        const phoneRegex = /^\d{10}$/;
        if (!phone || !phoneRegex.test(phone)) {
          return res.status(400).json({ success: false, message: 'Mobile number must be exactly 10 digits.' });
        }
      }

      if (bio !== undefined && (!bio || !bio.trim())) {
        return res.status(400).json({ success: false, message: 'Bio is mandatory.' });
      }

      if (user.role === 'teacher' || req.body.role === 'teacher') {
        if (qualification !== undefined && (!qualification || !qualification.trim())) {
          return res.status(400).json({ success: false, message: 'Qualification is mandatory for teachers.' });
        }
      }

      user.profile = { ...user.profile, ...req.body.profile };
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({ success: true, message: 'User updated successfully', user: userObj });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
}
