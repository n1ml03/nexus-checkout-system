
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  CreditCard,
  ChartBar,
  User,
  ArrowRight,
  QrCode,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const HomePage = () => {
  const { t } = useTranslation();

  const quickActions = [
    {
      title: t("quickActions.scan_pay"),
      description: t("quickActions.scan_pay_desc"),
      icon: QrCode,
      link: "/scan-to-pay",
      color: "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300",
    },
    {
      title: t("quickActions.browse_products"),
      description: t("quickActions.browse_products_desc"),
      icon: Package,
      link: "/products",
      color: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300",
    },
    {
      title: t("quickActions.view_cart"),
      description: t("quickActions.view_cart_desc"),
      icon: ShoppingCart,
      link: "/cart",
      color: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300",
    },
    {
      title: t("quickActions.checkout"),
      description: t("quickActions.checkout_desc"),
      icon: CreditCard,
      link: "/checkout",
      color: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300",
    },
    {
      title: t("quickActions.analytics"),
      description: t("quickActions.analytics_desc"),
      icon: ChartBar,
      link: "/analytics",
      color: "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300",
    },
    {
      title: t("quickActions.customers"),
      description: t("quickActions.customers_desc"),
      icon: User,
      link: "/customers",
      color: "bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div
      className="animate-fade-in space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("ui.dashboard")}</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {t("ui.welcome")}
        </p>
      </motion.div>

      <motion.div
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
      >
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            variants={itemVariants}
            whileHover={{
              y: -5,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Card className="overflow-hidden h-full">
              <CardHeader className="pb-2 pt-4 sm:pt-6 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    className={`p-2 sm:p-3 rounded-md ${action.color}`}
                  >
                    <action.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </motion.div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground h-8 w-8 sm:h-10 sm:w-10"
                    asChild
                  >
                    <Link to={action.link}>
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                  </Button>
                </div>
                <CardTitle className="mt-2 text-base sm:text-lg">{action.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">{t("ui.recent_activity")}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-center py-6 sm:py-10 text-muted-foreground">
              <p className="text-sm sm:text-base">{t("ui.no_activity")}</p>
              <Button variant="outline" className="mt-4 h-10 sm:h-12 text-sm sm:text-base" asChild>
                <Link to="/products">{t("ui.browse_products")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
