'use client'
import OverviewStats from '@/app/components/admin/dashboard/OverviewStats'
import { useAdminContext } from '@/app/CONTEXT/AdminProvider';
import { Menu } from 'lucide-react';
import React from 'react'
import { useEffect } from 'react';

const page = () => {
  const {openSidebar, setOpenSidebar}=useAdminContext();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header للشاشات الصغيرة */}
 

      {/* المحتوى الرئيسي */}
      <div className=" px-3 overflow-hidden sm:px-4 md:px-6 py-4 md:py-6">
        <OverviewStats />
      </div>
    </div>
  )
}

export default page