'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@/app/components/ui/Button';
import Table from '@/app/components/ui/Table';
import Input from '@/app/components/ui/Input';
import Select from '@/app/components/ui/Select';
import Modal from '@/app/components/ui/Modal';
import { Edit, Trash2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { deleteUser, addUser, changeUserRole, getAllUsers } from '@/services/auth';
import { useAuth } from '@/app/CONTEXT/AuthProvider';
import DeleteModel from '@/app/components/admin/dashboard/roadmap/DeleteModel';
import { toast } from 'react-toastify';
import { timeAgo } from '@/lib/timeAgo';

// استبدل هذا بالـ BASE_URL الصحيح
// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/auth';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, email: null });
  const [editingUser, setEditingUser] = useState(null);
  const ROLES = ['STUDENT', 'ADMIN'];
  const [formData, setFormData] = useState({ name: '', email: '', role: 'STUDENT', password: '' });
  const [errors, setErrors] = useState({});
  const [roleFilter, setRoleFilter] = useState('');
const{user,token}=useAuth()
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'createdAt', label: 'Created At',render:(user)=>timeAgo(user.createdAt) },
    { key: 'updatedAt', label: 'Updated At', render:(user)=>timeAgo(user.updatedAt) },
  ];

 const fetchUsers = async () => {
  try {
    const usersData = await getAllUsers({ token });

    setUsers(usersData?.data);     // لا تستخدم .data هنا
  } catch (error) {
    console.error('Fetch users error:', error.message);
  }
};

useEffect(() => {
  if (!token) return; // تحقق فقط من وجود التوكن
  fetchUsers();
}, [token]);

  const filteredUsers = roleFilter ? users.filter((u) => u.role === roleFilter) : users;

 const handleOpenModal = (user = null) => {
  if (user) {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '' // ما نظهرش الباسورد
    });
  } else {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'STUDENT', // ✅ مش User
      password: ''
    });
  }

  setErrors({});
  setModalOpen(true);
};

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.role) newErrors.role = 'Role is required';
    return newErrors;
  };

  const handleSubmit = async () => {
  const newErrors = validate();
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  try {
    if (editingUser) {
      console.log('Update user', editingUser, formData);
      
      // ✅ تعديل رول مستخدم
      await changeUserRole({
        email: editingUser.email,
        role: formData.role,
        token,
      });

    } else {
      // ✅ إضافة أدمن فقط (حسب الـ API الجديد)
    console.log('Add user', formData);
        await addUser({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          role: formData.role,
          token,
        });

    }

    setModalOpen(false);
    fetchUsers(); // إعادة تحميل البيانات بعد التحديث

  } catch (error) {
    console.error('Submit error:', error.message);
  }
};

  const handleDelete =  (email) => {
   setDeleteModal({ open: true, email });
  };
const handleConfirmDelete = async () => {
  try {
   console.log('Delete user', deleteModal);
  await deleteUser({ email: deleteModal?.email, token });

    toast.success( 'User deleted successfully');
    setDeleteModal({ open: false, email: null });

    fetchUsers();
  } catch (error) {
    console.error('Delete user error:', error.message);
  }
};
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} className="mr-2" /> Add User
        </Button>
      </div>

      <div className="mb-4 flex items-center">
        <label className="mr-2 text-sm font-medium">Filter by Role:</label>
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          options={[
            { value: '', label: 'All' },
            { value: 'ADMIN', label: 'ADMIN' },
            { value: 'STUDENT', label: 'STUDENT' },
          ]}
          className="w-48"
        />
      </div>

      <Table
        columns={columns}
        data={filteredUsers}
        renderActions={(row) => (
          <div className="flex space-x-2">
            <button onClick={() => handleOpenModal(row)} className="text-blue-600 hover:text-blue-800">
              <Edit size={18} />
            </button>
            <button onClick={() => handleDelete(row.email)} className="text-red-600 hover:text-red-800">
              <Trash2 size={18} />
            </button>
          </div>
        )}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? 'Edit User' : 'Add User'}>
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
        />
        <Select
          label="Role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          options={ ROLES.map((role) => ({ value: role, label: role })) }
          error={errors.role}
        />
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </Modal>
      <DeleteModel isOpen={deleteModal.open} onClose={() => setDeleteModal({ open: false, email: null })} confirmDelete={handleConfirmDelete} />
    </motion.div>
  );
}