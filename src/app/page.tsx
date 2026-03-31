"use client";

import { useState } from "react";
import { weightData } from "@/data/weight-data";
import { UserList } from "@/components/user-list";
import { WeightChart } from "@/components/weight-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [selectedUser, setSelectedUser] = useState(weightData[0].name);

  const person = weightData.find((p) => p.name === selectedUser) || weightData[0];

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Weight Tracker</h1>
      <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
        <Card className="w-full md:w-64 shrink-0">
          <CardHeader>
            <CardTitle className="text-lg">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <UserList
              users={weightData}
              selectedUser={selectedUser}
              onUserSelect={setSelectedUser}
            />
          </CardContent>
        </Card>
        <div className="flex-1">
          <WeightChart person={person} />
        </div>
      </div>
    </main>
  );
}
