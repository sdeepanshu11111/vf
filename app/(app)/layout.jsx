import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import PageTransition from "@/components/layout/PageTransition";
import { Toaster } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sparkles } from "lucide-react";
import VfRoundMark from "@/components/brand/VfRoundMark";
import WelcomeTour from "@/components/layout/WelcomeTour";

export default function AppLayout({ children }) {
  return (
    <div className="relative min-h-[100dvh] w-full flex overflow-x-hidden">
      <Sidebar />
      
      <main className="flex-1 w-full lg:ml-[290px] xl:mr-[350px] min-h-[100dvh] flex flex-col">
        {/* Mobile Header for RightPanel (Insights) */}
        <div className="xl:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-3xl border-b border-black/5 dark:border-white/5 py-3 px-4 sm:px-6 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full overflow-hidden shadow-md shadow-[#514de2]/25 shrink-0">
              <VfRoundMark className="h-8 w-8" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-foreground tracking-tight block text-sm">
                vF Community
              </span>
              <span className="text-[9px] font-bold text-[#514de2] uppercase tracking-wider">
                Inner Circle
              </span>
            </div>
          </div>
          
          <Sheet>
            <SheetTrigger className="h-9 px-3.5 rounded-xl bg-primary/10 flex items-center gap-2 text-primary font-bold text-sm tracking-wide hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-primary/40 shadow-sm border border-primary/20">
              <Sparkles className="h-3.5 w-3.5 fill-primary" />
              <span>Drops</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[400px] p-0 bg-background border-l border-white/10 dark:border-white/5 shadow-2xl">
              <RightPanel />
            </SheetContent>
          </Sheet>
        </div>

        <div className="max-w-3xl mx-auto w-full pt-4 sm:pt-8 px-2 sm:px-6 lg:px-10 pb-24 lg:pb-8 flex-1">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>

      <aside id="tour-right-panel" className="hidden xl:flex fixed right-4 top-4 bottom-4 w-[320px] z-30">
        <RightPanel />
      </aside>

      <Toaster position="top-right" expand={false} richColors closeButton />
      <WelcomeTour />
    </div>
  );
}
