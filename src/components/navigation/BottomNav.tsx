import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Home,
  QrCode,
  ChartBar,
  User
} from "lucide-react";

import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

import NavItem from "./bottom-nav/NavItem";
import NavMenu from "./bottom-nav/NavMenu";
import ScrollHandler from "./bottom-nav/ScrollHandler";

const BottomNav = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const { isMobile } = useBreakpoint();
  const { t } = useTranslation();

  // Include only the most important navigation items for mobile
  const navItems = isMobile
    ? [
        { icon: Home, name: t("nav.home"), path: "/" },
        { icon: Package, name: t("nav.products"), path: "/products" },
        { icon: QrCode, name: t("checkout.scan"), path: "/scan-to-pay" },
        { icon: ShoppingCart, name: t("nav.cart"), path: "/cart" },
      ]
    : [
        { icon: Home, name: t("nav.home"), path: "/" },
        { icon: Package, name: t("nav.products"), path: "/products" },
        { icon: QrCode, name: t("checkout.scan"), path: "/scan-to-pay" },
        { icon: ShoppingCart, name: t("nav.cart"), path: "/cart" },
        { icon: ChartBar, name: t("nav.analytics"), path: "/analytics" },
        { icon: User, name: t("nav.customers"), path: "/customers" }
      ];

  // Additional menu items for mobile
  const menuItems = isMobile
    ? [
        { icon: ChartBar, name: t("nav.analytics"), path: "/analytics" },
        { icon: User, name: t("nav.customers"), path: "/customers" }
      ]
    : [];

  return (
    <>
      <ScrollHandler onVisibilityChange={setIsVisible} />

      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.nav
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 1
            }}
            className="fixed bottom-3 sm:bottom-4 left-0 right-0 mx-auto w-fit z-50 flex"
          >
            <div className="flex items-center justify-center h-12 sm:h-14 px-4 sm:px-6 bg-background/95 backdrop-blur-md border border-border rounded-full shadow-lg w-auto">
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                {navItems.map((item) => (
                  <NavItem
                    key={item.path}
                    icon={item.icon}
                    name={item.name}
                    path={item.path}
                    isActive={location.pathname === item.path}
                    isMobile={isMobile}
                  />
                ))}

                {/* Menu button for additional options */}
                <div className="relative">
                  <NavMenu
                    menuItems={menuItems}
                    currentPath={location.pathname}
                    isMobile={isMobile}
                  />
                </div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};

export default BottomNav;
