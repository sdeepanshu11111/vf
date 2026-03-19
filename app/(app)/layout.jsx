import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import PageTransition from "@/components/layout/PageTransition";
import { Toaster } from "sonner";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">
      <Sidebar />
      
      <main className="lg:ml-[280px] xl:mr-[340px] min-h-screen">
        <div className="max-w-3xl mx-auto w-full pt-8 px-4 lg:px-8 pb-24 lg:pb-8">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>

      <div className="fixed right-0 top-0 bottom-0 overflow-y-auto hidden xl:block">
        <RightPanel />
      </div>

      <Toaster position="top-right" expand={false} richColors closeButton />
    </div>
  );
}
