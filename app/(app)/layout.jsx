import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import PageTransition from "@/components/layout/PageTransition";
import { Toaster } from "sonner";

export default function AppLayout({ children }) {
  return (
    <div className="relative min-h-[100dvh] w-full flex justify-center overflow-x-hidden">
      <Sidebar />
      
      <main className="flex-1 w-full lg:ml-[280px] xl:max-w-[calc(100%-600px)] min-h-[100dvh]">
        <div className="max-w-3xl mx-auto w-full pt-8 px-4 sm:px-6 lg:px-10 pb-24 lg:pb-8">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>

      <div className="hidden xl:block w-[320px] shrink-0">
        <RightPanel />
      </div>

      <Toaster position="top-right" expand={false} richColors closeButton />
    </div>
  );
}
