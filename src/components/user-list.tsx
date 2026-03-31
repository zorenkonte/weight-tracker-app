"use client";

import { Person } from "@/data/weight-data";
import { cn } from "@/lib/utils";

interface UserListProps {
  users: Person[];
  selectedUser: string;
  onUserSelect: (name: string) => void;
}

export function UserList({ users, selectedUser, onUserSelect }: UserListProps) {
  return (
    <div className="flex flex-col gap-1">
      {users.map((user) => {
        const hasData = user.data.some((d) => d.weight !== null);
        return (
          <button
            key={user.name}
            onClick={() => onUserSelect(user.name)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
              selectedUser === user.name
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-foreground",
              !hasData && "opacity-60"
            )}
          >
            {user.name}
          </button>
        );
      })}
    </div>
  );
}
