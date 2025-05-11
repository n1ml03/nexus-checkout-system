import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Sun,
  Moon,
  User,
  Search,
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  UserCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import NotificationBell from "@/components/notifications/NotificationBell";
import { Logo } from "@/components/ui/logo";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { useAuthContext } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const { itemCount } = useCart();
  const { isMobile } = useBreakpoint();
  const { user, isAuthenticated, signOut } = useAuthContext();
  const navigate = useNavigate();

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success(t("auth.logout_success"));
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur-sm"
    >
      <Container>
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="mr-2 sm:mr-4">
            <Logo size={isMobile ? "sm" : "md"} variant={isMobile ? "icon" : "full"} />
          </Link>

          {/* Search button - mobile only */}
          {isMobile && (
            <Button variant="ghost" size="icon" className="mr-auto h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>
          )}

          {/* Search bar - desktop only */}
          {!isMobile && (
            <div className="relative flex-1 max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder={t("ui.search")}
                  className="w-full h-10 pl-10 pr-4 rounded-full bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 md:gap-2">
            {/* Cart button with badge */}
            <Button variant="ghost" size="icon" asChild className="relative h-9 w-9 sm:h-10 sm:w-10">
              <Link to="/cart">
                <ShoppingCart className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
                {itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] sm:text-xs font-semibold"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Theme toggle - now visible on mobile too */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={isMobile ? "h-9 w-9" : ""}>
                  {theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches) ? (
                    <Sun className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
                  ) : (
                    <Moon className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="animate-scale-in">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  {t("ui.light")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  {t("ui.dark")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  {t("ui.system")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language switcher - hidden on small mobile */}
            <div className={isMobile ? "hidden sm:block" : "block"}>
              <LanguageSwitcher />
            </div>

            {/* User menu or login/register buttons */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar_url || ""} alt={user?.name || "User"} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user?.name && <p className="font-medium">{user.name}</p>}
                      {user?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <UserCircle className="h-4 w-4" />
                      <span>{t("auth.profile")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center gap-2 cursor-pointer">
                      <ShoppingCart className="h-4 w-4" />
                      <span>{t("nav.orders")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      <span>{t("auth.settings")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t("auth.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                {!isMobile && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/register" className="flex items-center gap-1">
                      <UserPlus className="h-4 w-4" />
                      <span>{t("auth.register")}</span>
                    </Link>
                  </Button>
                )}
                <Button size="sm" asChild>
                  <Link to="/login" className="flex items-center gap-1">
                    <LogIn className="h-4 w-4" />
                    <span>{isMobile ? "" : t("auth.login")}</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </motion.header>
  );
};

export default Header;
