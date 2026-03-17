import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F5F5F5]">
      <Sidebar />
      <main className="flex-1 lg:ml-[240px] xl:mr-[300px] flex flex-col min-h-screen pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto w-full pt-6 px-4 lg:px-6">
          {children}
        </div>
      </main>
      <div className="fixed right-0 top-0 bottom-0 overflow-y-auto">
        <RightPanel />
      </div>
    </div>
  );
}
