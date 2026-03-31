"use client";

import { Person } from "@/data/weight-data";
import { cn } from "@/lib/utils";

interface UserListProps {
  users: Person[];
  selectedUser: string;
  onUserSelect: (name: string) => void;
}

const AVATAR_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
];

export function UserList({ users, selectedUser, onUserSelect }: UserListProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {users.map((user, i) => {
        const hasData = user.data.some((d) => d.weight !== null);
        const isSelected = selectedUser === user.name;
        const initials = user.name.slice(0, 2);
        const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];

        return (
          <button
            key={user.name}
            onClick={() => onUserSelect(user.name)}
            aria-pressed={isSelected}
            className={cn(
              "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium",
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
        );
      })}
    </div>
  );
}
