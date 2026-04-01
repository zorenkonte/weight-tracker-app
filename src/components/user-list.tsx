"use client";

import { Settings } from "lucide-react";
import { Person } from "@/hooks/use-weight-data";
import { cn } from "@/lib/utils";
import { getAvatarColor } from "@/lib/avatar-store";

interface UserListProps {
  users: Person[];
  selectedUser: string;
  onUserSelect: (name: string) => void;
  onEditMember?: (name: string, index: number) => void;
}

export function UserList({ users, selectedUser, onUserSelect, onEditMember }: UserListProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {users.map((user, i) => {
        const hasData = user.data.some((d) => d.weight !== null);
        const isSelected = selectedUser === user.name;
        const initials = user.name.slice(0, 2);
        const color = getAvatarColor(user.colorIndex, i);

        return (
          <div key={user.name} className="group relative flex items-center">
            <button
              onClick={() => onUserSelect(user.name)}
              aria-pressed={isSelected}
              className={cn(
                "flex-1 flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium",
                "transition-colors duration-150 cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-secondary text-foreground",
                !hasData && "opacity-50"
              )}
            >
              <span
                aria-hidden="true"
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={
                  isSelected
                    ? { backgroundColor: "rgba(255,255,255,0.2)", color: "inherit" }
                    : { backgroundColor: color.hex, color: color.textHex }
                }
              >
                {initials}
              </span>
              <span className="min-w-0">
                <span className="block truncate">{user.name}</span>
                {user.handle && (
                  <span className={cn(
                    "block truncate text-[11px] leading-tight",
                    isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    @{user.handle}
                  </span>
                )}
              </span>
            </button>

            {onEditMember && (
              <button
                onClick={(e) => { e.stopPropagation(); onEditMember(user.name, i); }}
                aria-label={`Edit ${user.name}'s profile`}
                className={cn(
                  "absolute right-1 w-6 h-6 rounded flex items-center justify-center transition-all cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected
                    ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/20"
                    : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground"
                )}
              >
                <Settings className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
