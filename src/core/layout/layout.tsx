import {
  ShoppingBag,
  User2,
  Users,
  List as ListView,
  Menu,
  X,
  PlusCircle,
  LogOut,
  User,
  ChevronDown,
  Trophy,
  Gift,
  DollarSign,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
// import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLogout } from "../api/auth";
import { useAuth } from "../context/AuthContext";

import { LanguageSwitcher } from "@/components/LanguageSwithcher.tsx";
// import { ThemeToggle } from "../components/ThemeToggle";

type NavItem = {
  icon: LucideIcon;
  label: string;
  href?: string;
  id?: string;
  submenu?: NavItem[];
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set active submenu based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    navItems.forEach((item: NavItem) => {
      if (
        item.id &&
        item.submenu &&
        item.submenu.some((subItem) => subItem.href === currentPath)
      ) {
        setActiveSubmenu(item.id);
      }
    });
  }, [location.pathname]);

  const navItems: NavItem[] = (() => {
    // Base navigation items that all users can see
    const baseItems: NavItem[] = [
      {
        icon: ShoppingBag,
        label: t("navigation.stores"),
        id: "stores",
        submenu: [
          {
            icon: ListView,
            label: t("navigation.viewStores"),
            href: "/stores",
          },
          {
            icon: PlusCircle,
            label: t("navigation.createStore"),
            href: "/create-store",
          },
        ],
      },
      {
        icon: User2,
        label: t("navigation.employees"),
        id: "employees",
        submenu: [
          {
            icon: ListView,
            label: t("navigation.viewEmployees"),
            href: "/employees",
          },
          {
            icon: PlusCircle,
            label: t("navigation.createEmployee"),
            href: "/create-employee",
          },
        ],
      },
      {
        icon: Trophy,
        label: t("navigation.games"),
        id: "games",
        submenu: [
          {
            icon: ListView,
            label: t("navigation.viewGames"),
            href: "/games",
          },
          {
            icon: PlusCircle,
            label: t("navigation.createGame"),
            href: "/games/create",
          },
        ],
      },
      {
        icon: Gift,
        label: t("navigation.prizes") || "Prizes",
        id: "prizes",
        submenu: [
          {
            icon: ListView,
            label: t("navigation.viewPrizes") || "View Prizes",
            href: "/prizes",
          },
          {
            icon: PlusCircle,
            label: t("navigation.createPrize") || "Create Prize",
            href: "/prizes/create",
          },
        ],
      },
      {
        icon: DollarSign,
        label: t("navigation.bonus_ranges") || "Bonus Ranges",
        id: "bonus-ranges",
        submenu: [
          {
            icon: ListView,
            label: t("navigation.viewBonusRanges") || "View Bonus Ranges",
            href: "/bonus-ranges",
          },
          {
            icon: PlusCircle,
            label: t("navigation.createBonusRange") || "Create Bonus Range",
            href: "/bonus-ranges/create",
          },
        ],
      },
      {
        icon: Users,
        label: t("navigation.clients") || "Clients",
        id: "clients",
        submenu: [
          {
            icon: ListView,
            label: t("navigation.viewClients") || "View Clients",
            href: "/clients",
          },
          {
            icon: PlusCircle,
            label: t("navigation.createClient") || "Create Client",
            href: "/clients/create",
          },
        ],
      },
      {
        icon: ShoppingCart,
        label: t("navigation.purchases") || "Purchases",
        id: "purchases",
        submenu: [
          {
            icon: ListView,
            label: t("navigation.viewPurchases") || "View Purchases",
            href: "/purchases",
          },
          {
            icon: PlusCircle,
            label: t("navigation.createPurchase") || "Create Purchase",
            href: "/purchases/create",
          },
        ],
      },
    ];

    return baseItems;
  })();

  return (
    <div className="h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Mobile Header */}
      <header className="md:hidden shadow-sm px-4 py-2 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-foreground">OmadShow</div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {/*<ThemeToggle />*/}
          {/* Mobile Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(!dropdownOpen);
              }}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <User size={18} className="text-emerald-600" />
              </div>
            </button>

            {dropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-[998]"
                  onClick={() => setDropdownOpen(false)}
                />
                {/* Dropdown Content */}
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border py-3 z-[999]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {currentUser && (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <User size={24} className="text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800 text-lg">
                              {currentUser.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {currentUser.phone_number}
                            </div>
                            <div className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full mt-1">
                              {currentUser.role}
                            </div>
                          </div>
                        </div>
                        {currentUser.store && (
                          <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                            <div className="text-xs font-medium text-gray-600 mb-1">
                              Store Information
                            </div>
                            <div className="text-sm font-medium text-gray-800">
                              Store #{currentUser.store}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="py-1">
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDropdownOpen(false);
                            navigate("/profile");
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors cursor-pointer"
                          style={{ pointerEvents: "auto" }}
                        >
                          <User size={16} className="text-gray-500" />
                          {t("common.profile")}
                        </button>
                        <button
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors cursor-pointer"
                          style={{ pointerEvents: "auto" }}
                        >
                          <LogOut size={16} className="text-red-500" />
                          {t("common.logout")}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-gray-600" />
            ) : (
              <Menu size={24} className="text-gray-600" />
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row relative mt-14 md:mt-0">
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        {/* Sidebar - Desktop and Mobile */}
        <aside
          className={`
          ${mobileMenuOpen ? "block" : "hidden"}
          md:block
          w-full shadow-lg
          fixed md:sticky
          top-[3.5rem] md:top-0
          h-[calc(100vh-3.5rem)] md:h-screen
          z-50
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "md:w-20" : "md:w-72"}
          flex-shrink-0
          flex flex-col
        `}
        >
          {/* Desktop Logo and Language Switcher */}
          <div className="hidden md:block px-6 py-6 border-b border-sidebar-border ">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!isCollapsed && (
                  <div className="font-semibold text-sidebar-foreground">
                  OmadShow
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <Menu size={20} className="text-sidebar-accent-foreground" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-3 py-4 flex flex-col  relative z-50 h-[calc(100vh-6rem)] overflow-y-auto">
            {navItems.map((item, index) => (
              <div key={index}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => {
                        if (item.id) {
                          setActiveSubmenu(
                            activeSubmenu === item.id ? null : item.id,
                          );
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left mb-1 transition-colors
                        ${
                          activeSubmenu === item.id
                            ? "-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground"
                        }`}
                    >
                      <item.icon
                        size={20}
                        className={
                          activeSubmenu === item.id
                            ? "text-emerald-500"
                            : "text-gray-500"
                        }
                      />
                      {!isCollapsed && (
                        <>
                          <span className="font-medium">{item.label}</span>
                          <svg
                            className={`ml-auto h-5 w-5 transform transition-transform ${
                              activeSubmenu === item.id ? "rotate-180" : ""
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                    {activeSubmenu === item.id && (
                      <div
                        className={`ml-2 ${
                          isCollapsed
                            ? "absolute left-full top-0 ml-2 bg-sidebar shadow-lg rounded-lg p-2 min-w-[200px] max-h-[80vh] overflow-y-auto"
                            : ""
                        }`}
                      >
                        {item.submenu.map((subItem, subIndex) => (
                          <a
                            key={subIndex}
                            href={subItem.href}
                            onClick={(e) => {
                              e.preventDefault();
                              setMobileMenuOpen(false);
                              if (subItem.href) navigate(subItem.href);
                            }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left mb-1 transition-colors
                              ${
                                location.pathname === subItem.href
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                  : "text-sidebar-foreground"
                              }`}
                          >
                            <subItem.icon
                              size={20}
                              className={
                                location.pathname === subItem.href
                                  ? "text-emerald-500"
                                  : "text-gray-500"
                              }
                            />
                            <span className="font-medium">{subItem.label}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      if (item.href) navigate(item.href);
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left mb-1 transition-colors
                      ${
                        location.pathname === item.href
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground"
                      }`}
                  >
                    <item.icon
                      size={20}
                      className={
                        location.pathname === item.href
                          ? "text-emerald-500"
                          : "text-gray-500"
                      }
                    />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </a>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 transition-all duration-300 overflow-x-auto ">
          <div className="h-full flex flex-col min-w-[320px]">
            <div className=" px-4 md:px-6 py-4 flex items-center justify-end gap-4 sticky top-0 z-30 border-b border-border">


              <div className="hidden md:flex items-center gap-2">
                {/*<ThemeToggle />*/}
                <LanguageSwitcher />
              </div>

              {/* Desktop Profile Dropdown */}
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(!dropdownOpen);
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User size={18} className="text-emerald-600" />
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border py-3 z-[9999]"
                    style={{ zIndex: 9999 }}
                  >
                    {currentUser && (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                              <User size={24} className="text-emerald-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800 text-lg">
                                {currentUser.full_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {currentUser.phone_number}
                              </div>
                              <div className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full mt-1">
                                {currentUser.role}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDropdownOpen(false);
                              navigate("/profile");
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                          >
                            <User size={16} className="text-gray-500" />
                            <span className="font-medium">
                              {t("common.profile")}
                            </span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDropdownOpen(false);
                              handleLogout();
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                          >
                            <LogOut size={16} className="text-red-500" />
                            <span className="font-medium">
                              {t("common.logout")}
                            </span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
              <div
                className="max-w-[1920px] mx-auto "
                style={{ background: "l" }}
              >
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
