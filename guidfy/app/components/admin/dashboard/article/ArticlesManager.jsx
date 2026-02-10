// app/components/ArticlesManager.tsx
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  FileText,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ExternalLink
} from 'lucide-react';



export default function ArticlesManager() {
  const [articles, setArticles] = useState([
    {
      id: 1,
      title: "Introduction to React Hooks",
      category: "Web Development",
      author: "Sarah Johnson",
      status: "published",
      createdAt: "2024-01-15",
      views: 2450,
      readTime: 8
    },
    {
      id: 2,
      title: "Machine Learning Basics",
      category: "Data Science",
      author: "David Chen",
      status: "published",
      createdAt: "2024-01-10",
      views: 1870,
      readTime: 12
    },
    {
      id: 3,
      title: "Advanced CSS Techniques",
      category: "Web Development",
      author: "Maria Garcia",
      status: "draft",
      createdAt: "2024-01-18",
      views: 0,
      readTime: 6
    },
    {
      id: 4,
      title: "Introduction to Python",
      category: "Programming",
      author: "Ahmed Hassan",
      status: "published",
      createdAt: "2024-01-05",
      views: 3200,
      readTime: 10
    },
    {
      id: 5,
      title: "DevOps Fundamentals",
      category: "System Operations",
      author: "James Wilson",
      status: "draft",
      createdAt: "2024-01-20",
      views: 0,
      readTime: 15
    },
    {
      id: 6,
      title: "UI/UX Design Principles",
      category: "Design",
      author: "Emma Davis",
      status: "published",
      createdAt: "2024-01-12",
      views: 1890,
      readTime: 7
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleToDelete, setArticleToDelete] = useState(null);

  const categories = ["all", "Web Development", "Data Science", "Programming", "System Operations", "Design"];
  const statuses = ["all", "draft", "published", "archived"];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || article.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <CheckCircle size={14} />;
      case 'draft': return <Clock size={14} />;
      case 'archived': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setIsAddModalOpen(true);
  };

  const handleDelete = (article) => {
    setArticleToDelete(article);
  };

  const confirmDelete = () => {
    if (articleToDelete) {
      setArticles(articles.filter(a => a.id !== articleToDelete.id));
      setArticleToDelete(null);
    }
  };

  const handleSaveArticle = (articleData) => {
    if (editingArticle) {
      // Update existing article
      setArticles(articles.map(a => 
        a.id === editingArticle.id ? { ...a, ...articleData } : a
      ));
      setEditingArticle(null);
    } else {
      // Add new article
      const newArticle = {
        id: articles.length + 1,
        title: articleData.title || "New Article",
        category: articleData.category || "Uncategorized",
        author: articleData.author || "Admin",
        status: articleData.status || "draft",
        createdAt: new Date().toISOString().split('T')[0],
        views: 0,
        readTime: articleData.readTime || 5
      };
      setArticles([newArticle, ...articles]);
    }
    setIsAddModalOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { opacity: 0, scale: 0.8 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-blue-600" size={28} />
            Articles Manager
          </h2>
          <p className="text-gray-600 mt-1">Manage and organize your educational articles</p>
        </div>
        
        <motion.button
          onClick={() => {
            setEditingArticle(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={20} />
          Add New Article
        </motion.button>
      </div>

      {/* Filters and Search */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <motion.div variants={itemVariants} className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search articles by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </motion.div>
      </motion.div>

      {/* Articles Table */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Article</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Author</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Views</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredArticles.map((article, index) => (
                <motion.tr
                  key={article.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <motion.div 
                        className="flex-shrink-0"
                        whileHover={{ rotate: 5 }}
                      >
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileText size={20} className="text-blue-600" />
                        </div>
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{article.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                          <Calendar size={14} />
                          <span>{article.createdAt}</span>
                          <span>•</span>
                          <Clock size={14} />
                          <span>{article.readTime} min read</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                      <Tag size={12} className="mr-1" />
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User size={16} className="text-gray-400 mr-2" />
                      <span className="text-gray-700">{article.author}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(article.status)}`}>
                      {getStatusIcon(article.status)}
                      {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Eye size={16} className="text-gray-400 mr-2" />
                      <span className="font-medium text-gray-700">{article.views.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => handleEdit(article)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit2 size={18} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(article)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={18} />
                      </motion.button>
                      <motion.button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <MoreVertical size={18} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Statistics Summary */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">Total Articles</p>
          <p className="text-2xl font-bold text-gray-800">{articles.length}</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">Published</p>
          <p className="text-2xl font-bold text-gray-800">
            {articles.filter(a => a.status === 'published').length}
          </p>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">Total Views</p>
          <p className="text-2xl font-bold text-gray-800">
            {articles.reduce((sum, article) => sum + article.views, 0).toLocaleString()}
          </p>
        </div>
      </motion.div>

      {/* Add/Edit Article Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    {editingArticle ? 'Edit Article' : 'Add New Article'}
                  </h3>
                  <motion.button
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <XCircle size={24} className="text-gray-500" />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      defaultValue={editingArticle?.title}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter article title"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                        <option>Select category</option>
                        {categories.slice(1).map(category => (
                          <option key={category} selected={editingArticle?.category === category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select 
                        defaultValue={editingArticle?.status || 'draft'}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Write your article content here..."
                      defaultValue={editingArticle ? "Article content would be here..." : ""}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <motion.button
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={() => handleSaveArticle({})}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {editingArticle ? 'Update Article' : 'Publish Article'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {articleToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Trash2 size={32} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Article</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{articleToDelete.title}"? This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-3">
                  <motion.button
                    onClick={() => setArticleToDelete(null)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={confirmDelete}
                    className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Delete Article
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}