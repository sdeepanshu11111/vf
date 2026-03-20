import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import PageTransition from "@/components/layout/PageTransition";
import { Toaster } from "sonner";

export default function AppLayout({ children }) {
  return (
    <div className="relative min-h-[100dvh] w-full flex overflow-x-hidden">
      <Sidebar />
      
      <main className="flex-1 w-full lg:ml-[290px] xl:mr-[350px] min-h-[100dvh]">
        <div className="max-w-3xl mx-auto w-full pt-8 px-4 sm:px-6 lg:px-10 pb-24 lg:pb-8">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>

      <aside className="hidden xl:flex fixed right-4 top-4 bottom-4 w-[320px] z-30">
        <RightPanel />
      </aside>

      <Toaster position="top-right" expand={false} richColors closeButton />
    </div>
  );
}
