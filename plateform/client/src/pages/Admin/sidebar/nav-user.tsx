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
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              >
                <Avatar className="w-8 h-8 rounded-lg">
                  <AvatarImage
                      src={user.avatar}
                      alt={user.username}
                      className="object-cover object-center w-full h-full rounded-full"
                  />
                </Avatar>
                <div className="grid flex-1 text-sm leading-tight text-left">
                  <span className="font-semibold truncate">{user.username}</span>
                  <span className="text-xs truncate">{user.email}</span>
                </div>
                <ChevronRight className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="w-8 h-8 rounded-lg">
                    <AvatarImage
                        src={user.avatar}
                        alt={user.username}
                        className="object-cover object-center w-full h-full rounded-full"
                    />
                  </Avatar>
                  <div className="grid flex-1 text-sm leading-tight text-left">
                    <span className="font-semibold truncate">{user.username}</span>
                    <span className="text-xs truncate">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                    className="flex items-center gap-2 hover:cursor-pointer"
                    onClick={() => navigate("/")}
                >
                  <House className="w-4 h-4" />
                  <span>{t("navbar.home")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="flex items-center gap-2 hover:cursor-pointer"
                    onClick={() => navigate("/account")}
                >
                  <User className="w-4 h-4" />
                  <span>{t("navbar.account")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="flex items-center gap-2 hover:cursor-pointer"
                    onClick={() => navigate("/admin/dashboard")}
                >
                  <Wrench className="w-4 h-4" />
                  <span>{t("navbar.dashboard")}</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                    className="hover:cursor-pointer text-destructive focus:text-destructive"
                    onClick={logout}
                    disabled={loading}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t("navbar.logout")}</span>
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
  );
}