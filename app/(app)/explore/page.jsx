"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import MemberCard from "@/components/members/MemberCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ posts: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&type=${activeTab}`,
      );
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search founders, niches, or content..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12 rounded-xl border-0 shadow-sm ring-1 ring-gray-200 focus-visible:ring-[#FF6B35]/20"
        />
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-xl bg-gray-100 p-1 h-11">
          <TabsTrigger
            value="all"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="posts"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Founders
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : query.trim() ? (
            <div className="space-y-8">
              {(activeTab === "all" || activeTab === "posts") &&
                results.posts.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Posts</h3>
                    {results.posts.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))}
                  </div>
                )}

              {(activeTab === "all" || activeTab === "users") &&
                results.users.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Founders</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {results.users.map((user) => (
                        <MemberCard key={user._id} member={user} />
                      ))}
                    </div>
                  </div>
                )}

              {results.posts.length === 0 && results.users.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No results found for &quot;{query}&quot;
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">
                Try searching for &quot;sourcing&quot;, &quot;RTO&quot;, or
                &quot;Arjun&quot;
              </p>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
