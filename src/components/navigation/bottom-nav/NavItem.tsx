
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NavItemProps {
  icon: LucideIcon;
  name: string;
  path: string;
  isActive: boolean;
  isMobile: boolean;
}

const NavItem = ({ icon: Icon, name, path, isActive, isMobile }: NavItemProps) => {
  return (
    <Link
      to={path}
      className={cn(
        "relative flex items-center justify-center p-2 rounded-full transition-all",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeNavIndicator"
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
        <Icon className="h-6 w-6" />
      </motion.div>
    </Link>
  );
};

export default NavItem;
