import { ChevronRight, House, LogOut, User, Wrench } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { UserInterface } from "@/interfaces/User";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/contexts/authContext";
import { cn } from "@/lib/utils";

export function NavUser({ user }: { user: UserInterface | null }) {
  if (!user) return null;

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const { logout, loading } = useAuthContext();
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={isDropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                  size="lg"
                  className={cn(
                      "cursor-pointer transition-all duration-200 border-2 border-transparent hover:border-border rounded-xl px-2",
                      "data-[state=open]:bg-foreground data-[state=open]:text-background data-[state=open]:border-foreground"
                  )}
              >
                <Avatar className="w-8 h-8 rounded-full border-2 border-muted-foreground/20">
                  <AvatarImage
                      src={user.avatar}
                      alt={user.username}
                      className="object-cover object-center w-full h-full"
                  />
                </Avatar>
                <div className="grid flex-1 text-sm leading-tight text-left ml-2">
                  <span className="font-black uppercase tracking-tighter text-[11px] truncate">{user.username}</span>
                  <span className="text-[10px] font-medium opacity-50 truncate">{user.email}</span>
                </div>
                <ChevronRight className={cn(
                    "ml-auto size-4 transition-transform duration-200",
                    isDropdownOpen ? "rotate-90" : ""
                )} />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border-2 border-border bg-background shadow-xl p-2"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={12}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 px-2 py-3 text-left">
                  <Avatar className="w-10 h-10 rounded-full border-2 border-foreground">
                    <AvatarImage src={user.avatar} alt={user.username} />
                  </Avatar>
                  <div className="grid flex-1 leading-tight">
                    <span className="font-black uppercase tracking-tighter text-sm italic">{user.username}</span>
                    <span className="text-[10px] font-mono opacity-60">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-border h-[2px] my-2" />

              <DropdownMenuGroup className="space-y-1">
                {[
                  { icon: House, label: t("navbar.home"), path: "/" },
                  { icon: User, label: t("navbar.account"), path: "/account" },
                  { icon: Wrench, label: t("navbar.dashboard"), path: "/admin/dashboard" },
                ].map((item) => (
                    <DropdownMenuItem
                        key={item.path}
                        className="flex items-center gap-3 p-2 rounded-lg cursor-pointer font-bold text-[11px] uppercase tracking-widest hover:bg-muted transition-colors"
                        onClick={() => navigate(item.path)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="bg-border h-[2px] my-2" />

              <DropdownMenuItem
                  className="flex items-center gap-3 p-2 rounded-lg cursor-pointer font-black text-[11px] uppercase tracking-widest text-destructive focus:bg-destructive focus:text-destructive-foreground transition-all"
                  onClick={logout}
                  disabled={loading}
              >
                <LogOut className="w-4 h-4" />
                <span>{t("navbar.logout")}</span>
                <DropdownMenuShortcut className="text-[10px] opacity-50">⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
  );
}