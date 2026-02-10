'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const AdminPage = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      router.push('/admin/dashboard');
    }
  }, [loading, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      {loading && (
        <Loader2 className="animate-spin text-blue-500" size={48} />
      )}
    </div>
  );
};

export default AdminPage;
