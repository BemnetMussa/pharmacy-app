"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/features/auth/auth-client";
import type { NavRole } from "./sidebar";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  role?: NavRole;
}

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function UserMenu({ user, role = "PHARMACIST" }: UserMenuProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const fullName = user.name.trim() || "Unknown user";
  const initials = getInitials(fullName);
  const roleLabel = role === "ADMIN" ? "Owner / Admin" : "Pharmacist";

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="focus-visible:ring-ring flex items-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label={`Account menu for ${fullName}`}
      >
        <Avatar className="size-9">
          <AvatarImage src={user.image ?? undefined} alt={fullName} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-3 font-normal">
            <div className="flex flex-col gap-1.5">
              <p className="text-foreground text-sm leading-snug font-semibold">
                {fullName}
              </p>
              <p className="text-muted-foreground text-xs leading-snug break-all">
                {user.email}
              </p>
              <p className="text-primary text-xs font-medium">{roleLabel}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleSignOut}
          disabled={signingOut}
          className="cursor-pointer"
        >
          <LogOut className="size-4" aria-hidden />
          {signingOut ? "Signing out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
