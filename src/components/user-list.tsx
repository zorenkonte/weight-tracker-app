"use client";

import { useState, useEffect } from "react";
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
  // Re-render after hydration so localStorage colors are picked up
  const [, forceRender] = useState(0);
  useEffect(() => { forceRender(1); }, []);

  return (
    <div className="flex flex-col gap-0.5">
      {users.map((user, i) => {
        const hasData = user.data.some((d) => d.weight !== null);
        const isSelected = selectedUser === user.name;
        const initials = user.name.slice(0, 2);
        const color = getAvatarColor(user.name, i);
        const avatarColor = `${color.bg} ${color.text}`;

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
                className={cn(
                  "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                  isSelected ? "bg-white/20 text-primary-foreground" : avatarColor
                )}
              >
                {initials}
              </span>
              <span className="truncate">{user.name}</span>
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
