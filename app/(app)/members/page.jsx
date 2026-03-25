"use client";

import { useState, useEffect, useCallback } from "react";
import Podium from "@/components/members/Podium";
import LeaderboardTable from "@/components/members/LeaderboardTable";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/members?q=${encodeURIComponent(search)}&sort=points&limit=50`,
      );
      const data = await res.json();
      setMembers(data.members || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMembers]);

  const top3 = members.slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Leaderboard
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Top community members, founders and visionaries
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, niche or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 rounded-xl bg-white shadow-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
        />
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {!search && !loading && members.length > 0 && <Podium users={top3} />}
        {!loading && members.length > 0 && <LeaderboardTable members={members} />}
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
            <p>Loading members...</p>
          </div>
        )}

        {!loading && members.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg font-medium">No members found</p>
            <p className="text-sm mt-1">Try a different search query</p>
          </div>
        )}
      </div>
    </div>
  );
}
