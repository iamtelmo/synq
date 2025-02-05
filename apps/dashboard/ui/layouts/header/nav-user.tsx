"use client";
import { useEffect, useState, memo } from "react";
import { BadgeCheck, LogOut, Palette } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@refrom/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@refrom/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@refrom/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@refrom/ui/select";
import { signOut } from "@ui/auth/actions";
import { useTheme } from "next-themes";
import { createClient } from "@refrom/supabase/client";
import Link from "next/link";

// Helper function to get the first character of a name
const getFirstCharacter = (fullName: string) => {
  return fullName.charAt(0).toUpperCase() || "";
};

const NavUser: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { isMobile } = useSidebar();
  const [userMetadata, setUserMetadata] = useState<{
    name: string;
    email: string;
    avatar_url: string;
  }>({
    name: "",
    email: "",
    avatar_url: "",
  });

  // Fetch user info on mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const metadata = user?.user_metadata;
      setUserMetadata({
        name: metadata?.full_name || "",
        email: metadata?.email || "",
        avatar_url: metadata?.avatar_url || "",
      });
    };

    fetchUserInfo();
  }, []);

  // Set theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "system";
    setTheme(storedTheme);
  }, [setTheme]);

  // Handle theme change
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
            >
              <Avatar className="h-8 w-8 rounded-full">
                {userMetadata.avatar_url ? (
                  <AvatarImage
                    src={userMetadata.avatar_url}
                    alt={userMetadata.name}
                  />
                ) : (
                  <AvatarFallback className="flex items-center justify-center rounded-full bg-gray-400 text-white">
                    {getFirstCharacter(userMetadata.name)}
                  </AvatarFallback>
                )}
              </Avatar>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "bottom"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {userMetadata.avatar_url ? (
                    <AvatarImage
                      src={userMetadata.avatar_url}
                      alt={userMetadata.name}
                    />
                  ) : (
                    <AvatarFallback className="flex items-center justify-center rounded-lg bg-gray-400 text-white">
                      {getFirstCharacter(userMetadata.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {userMetadata.name}
                  </span>
                  <span className="truncate text-xs">{userMetadata.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/settings">
                <DropdownMenuItem>
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Account
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem>
                <Palette className="mr-2 h-4 w-4" />
                Theme
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="neon">Neon</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <button
                onClick={signOut}
                className="flex w-full items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default memo(NavUser);
