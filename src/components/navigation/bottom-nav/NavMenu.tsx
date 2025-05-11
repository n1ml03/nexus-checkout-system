
import { Link } from "react-router-dom";
import { LucideIcon, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface NavMenuItem {
  icon: LucideIcon;
  name: string;
  path: string;
}

interface NavMenuProps {
  menuItems: NavMenuItem[];
  currentPath: string;
  isMobile: boolean;
}

const NavMenu = ({ menuItems, currentPath, isMobile }: NavMenuProps) => {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative flex flex-col items-center justify-center rounded-full transition-all p-2",
            isMobile ? "flex-1" : "flex-1 max-w-[50px]"
          )}
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="flex flex-col items-center"
          >
            <Menu className="h-6 w-6 text-muted-foreground" />
          </motion.div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        alignOffset={-10}
        sideOffset={8}
        className="w-auto min-w-[180px] p-3 rounded-full border border-border bg-background/95 backdrop-blur-md shadow-lg"
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
            className="flex flex-row gap-2 px-1"
          >
            {menuItems.map((item) => (
              <DropdownMenuItem key={`menu-${item.path}`} asChild className="p-0">
                <Link
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-full transition-all",
                    currentPath === item.path
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {currentPath === item.path && (
                    <motion.div
                      layoutId="activeMenuIndicator"
                      className="absolute inset-0 bg-primary/15 rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30
                      }}
                    />
                  )}
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="relative z-10"
                  >
                    <item.icon className="h-6 w-6" />
                  </motion.div>
                </Link>
              </DropdownMenuItem>
            ))}
          </motion.div>
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavMenu;
