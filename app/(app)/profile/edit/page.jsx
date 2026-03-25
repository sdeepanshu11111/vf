"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/ui/UserAvatar";
import { toast } from "sonner";

const niches = [
  "Fashion",
  "Electronics",
  "Health & Wellness",
  "Home & Kitchen",
  "Beauty",
  "Other",
];

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    city: "",
    niche: "",
    avatar: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${session.user.id}`);
        const data = await res.json();
        const user = data.user;

        if (user) {
          setForm({
            name: user.name || "",
            bio: user.bio || "",
            city: user.city || "",
            niche: user.niche || "",
            avatar: user.avatar || "",
          });
          setAvatarPreview(user.avatar || null);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, [session]);

  const handleAvatarBlur = () => {
    if (form.avatar.trim()) {
      setAvatarPreview(form.avatar.trim());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${session.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updatedAvatar = form.avatar.trim() ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(form.name)}`;
        await update({
          name: form.name,
          avatar: updatedAvatar,
          bio: form.bio,
          city: form.city,
          niche: form.niche,
        });
        toast.success("Profile updated!");
        router.push(`/profile/${session.user.id}`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error.");
    }
    setLoading(false);
  };

  const generatedAvatar = form.name
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(form.name)}`
    : null;

  const displayAvatar = avatarPreview || generatedAvatar;

  return (
    <div className="space-y-6 pb-12">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Preview */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <UserAvatar
                src={displayAvatar}
                name={form.name}
                size="xl"
                className="ring-4 ring-gray-100 shadow-md"
              />
              {form.avatar.trim() && (
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">Profile Photo</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Paste a URL below, or leave blank to use your initials avatar.
              </p>
              <div className="relative mt-3">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  type="url"
                  placeholder="https://example.com/your-photo.jpg"
                  value={form.avatar}
                  onChange={(e) => {
                    setForm({ ...form, avatar: e.target.value });
                    if (!e.target.value.trim()) setAvatarPreview(generatedAvatar);
                  }}
                  onBlur={handleAvatarBlur}
                  className="rounded-xl pl-8 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Display Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl"
                required
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none border-gray-200"
                rows={4}
                placeholder="Tell the community about yourself..."
                maxLength={300}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.bio.length}/300</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  City
                </label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="rounded-xl"
                  placeholder="e.g. Mumbai"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Niche
                </label>
                <select
                  value={form.niche}
                  onChange={(e) => setForm({ ...form, niche: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  <option value="">Select Niche</option>
                  {niches.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm text-gray-500 hover:text-gray-700 font-bold transition-colors"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={loading || !form.name.trim()}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
