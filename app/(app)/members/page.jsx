"use client";

import { useState, useEffect } from "react";
import Podium from "@/components/members/Podium";
import LeaderboardTable from "@/components/members/LeaderboardTable";
import MemberCard from "@/components/members/MemberCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/members?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      setMembers(data.members || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const top3 = members.slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Community Directory
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Founders, hustlers, and visionaries
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, niche or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl"
        />
      </div>

      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-xl h-11">
          <TabsTrigger value="directory" className="rounded-lg">
            Directory
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="rounded-lg">
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <MemberCard key={member._id} member={member} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          {!search && <Podium users={top3} />}
          <LeaderboardTable members={members} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
