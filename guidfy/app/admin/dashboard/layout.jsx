import Sidebar from "@/app/components/admin/dashboard/Sidebar";

const DashboardAdminPanelLayout = ({ children }) => {
  return (
    <div className="flex items-start ">
        <div className="sticky top-0 h-screen">
          <Sidebar />    
        </div>
   
      <main className="flex-1">{children}</main>
     
    </div>
  );
};
export default DashboardAdminPanelLayout;