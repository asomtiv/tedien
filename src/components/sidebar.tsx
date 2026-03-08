"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Calendar, Stethoscope, Package, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pacientes", href: "/pacientes", icon: Users },
  { label: "Agenda", href: "/agenda", icon: Calendar },
  { label: "Profesionales", href: "/profesionales", icon: Stethoscope },
  { label: "Insumos", href: "/insumos", icon: Package },
];

function NavLink({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-border bg-background">
      <div className="flex h-18 items-center px-7">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          tedien
        </h1>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 px-4 py-5">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={isActive(item.href)}
          />
        ))}
      </nav>
      <div className="border-t border-border px-4 py-4">
        <NavLink
          href="/configuracion"
          icon={Settings}
          label="Configuracion"
          isActive={isActive("/configuracion")}
        />
      </div>
    </aside>
  );
}
