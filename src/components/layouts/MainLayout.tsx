
import { Outlet } from "react-router-dom";
import Header from "@/components/navigation/Header";
import BottomNav from "@/components/navigation/BottomNav";
import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";
import { useBreakpoint } from "@/hooks/use-breakpoint";

const MainLayout = () => {
  const { isMobile } = useBreakpoint();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto pt-4 sm:pt-6 pb-20 sm:pb-24"
        >
          <Container>
            <Outlet />
          </Container>
        </motion.main>

        {/* Bottom Navigation - visible on all devices */}
        <BottomNav />
      </div>
    </div>
  );
};

export default MainLayout;
