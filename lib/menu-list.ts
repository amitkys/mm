import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Tags,
  type LucideIcon,
} from "lucide-react";

export type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

export type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          active: pathname.startsWith("/dashboard"),
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Finances",
      menus: [
        {
          href: "/income",
          label: "Income Records",
          icon: Wallet,
          active: pathname.startsWith("/income"),
          submenus: [],
        },
        {
          href: "/expanses-log",
          label: "Expense Logs",
          icon: Receipt,
          active: pathname.startsWith("/expanses-log"),
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Configuration",
      menus: [
        {
          href: "/expanses-category",
          label: "Expense Categories",
          icon: Tags,
          active: pathname.startsWith("/expanses-category"),
          submenus: [],
        },
      ],
    },
  ];
}

