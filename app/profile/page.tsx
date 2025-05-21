"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  getStoriesByAuthorId,
  getFavoriteStories, // Import for fetching favorite stories
} from "@/lib/firebase/firestore";
import type { UserProfile, Story } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StoryList } from "@/components/story-list"; // Import StoryList component
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthCheck from "@/components/auth-check";
import { useToast } from "@/components/ui/use-toast";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true); // Profile loading
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [favoriteStories, setFavoriteStories] = useState<Story[]>([]); // State for favorite stories
  const [favoriteStoriesLoading, setFavoriteStoriesLoading] = useState(true); // Loading state for favorite stories

  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    avatar: "", // Added avatar to formData
    bio: "",
    website: "",
    twitter: "",
    github: "",
    linkedin: "",
  });

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setLoading(true); 
        setStoriesLoading(true);
        setFavoriteStoriesLoading(true); // Initialize favorite stories loading

        // Load profile
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setProfile(userProfile);
          setFormData({
            displayName: userProfile.displayName,
            username: userProfile.username || "",
            avatar: userProfile.avatar || user?.photoURL || "",
            bio: userProfile.bio || "",
            website: userProfile.website || "",
            twitter: userProfile.socialLinks?.twitter || "",
            github: userProfile.socialLinks?.github || "",
            linkedin: userProfile.socialLinks?.linkedin || "",
          });
        } else {
           setFormData({
            displayName: user?.displayName || "",
            username: "",
            avatar: user?.photoURL || "",
            bio: "",
            website: "",
            twitter: "",
            github: "",
            linkedin: "",
          });
        }
        setLoading(false);

        // Load user's own stories
        try {
          const stories = await getStoriesByAuthorId(user.uid);
          setUserStories(stories);
        } catch (error) {
          console.error("Failed to fetch user stories:", error);
          setUserStories([]);
        } finally {
          setStoriesLoading(false);
        }

        // Load favorite stories
        try {
          const favStories = await getFavoriteStories(user.uid);
          setFavoriteStories(favStories);
        } catch (error) {
          console.error("Failed to fetch favorite stories:", error);
          setFavoriteStories([]);
        } finally {
          setFavoriteStoriesLoading(false);
        }

      } else {
        // Reset states if user logs out or is not available
        setProfile(null);
        setFormData({ 
            displayName: "", username: "", avatar: "", bio: "", website: "", twitter: "", github: "", linkedin: ""
        });
        setUserStories([]);
        setFavoriteStories([]); // Reset favorite stories
        setLoading(false);
        setStoriesLoading(false);
        setFavoriteStoriesLoading(false); // Reset favorite stories loading
      }
    };
    loadData();
  }, [user]);

  if (loading) { 
    return (
      <div className="container mx-auto p-4">
        <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      // Prepare the profile data
      const profileData: UserProfile = {
        id: user.uid,
        displayName: formData.displayName || user.displayName || "User",
        username: formData.username,
        email: user.email || "",
        bio: formData.bio,
        website: formData.website,
        // Prioritize formData.avatar, then existing profile.avatar, then auth photoURL
        avatar: formData.avatar || profile?.avatar || user?.photoURL || "",
        socialLinks: {
          twitter: formData.twitter,
          github: formData.github,
          linkedin: formData.linkedin,
        },
      };

      const existingProfile = await getUserProfile(user.uid);
      if (existingProfile) {
        await updateUserProfile(user.uid, profileData);
      } else {
        await createUserProfile(user.uid, profileData);
      }

      const newProfile = await getUserProfile(user.uid);
      setProfile(newProfile);
      if (newProfile) {
        setFormData({
            displayName: newProfile.displayName,
            username: newProfile.username || "",
            avatar: newProfile.avatar || user?.photoURL || "", // Repopulate avatar
            bio: newProfile.bio || "",
            website: newProfile.website || "",
            twitter: newProfile.socialLinks?.twitter || "",
            github: newProfile.socialLinks?.github || "",
            linkedin: newProfile.socialLinks?.linkedin || "",
        });
      }
      setIsEditing(false);
      setActiveTab("view"); // Switch to view tab after saving
      toast({
        title: "Success",
        description: "Your profile has been updated",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof Error) {
        if (
          error.message === "Username already taken" || // Specific error from createUserProfile
          error.message === "Username already taken by another user" // Specific error from updateUserProfile
        ) {
          toast({
            title: "Username Conflict",
            description:
              "That username is already taken. Please choose another.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to update profile. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <AuthCheck>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl">
          <div className="px-6 py-5 border-b border-gray-200/50 dark:border-gray-800/50">
            <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
              Profile
            </h1>
          </div>

          <div className="p-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full mb-6 rounded-2xl bg-gray-100/50 dark:bg-gray-800/50 p-1">
                <TabsTrigger
                  value="view"
                  onClick={() => { setActiveTab("view"); setIsEditing(false); }}
                  className="w-full rounded-xl transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
                >
                  View Profile
                </TabsTrigger>
                <TabsTrigger
                  value="edit"
                  onClick={() => { setActiveTab("edit"); setIsEditing(true); }}
                  className="w-full rounded-xl transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
                >
                  Edit Profile
                </TabsTrigger>
                <TabsTrigger
                  value="my-stories"
                  onClick={() => { setActiveTab("my-stories"); setIsEditing(false); }}
                  className="w-full rounded-xl transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
                >
                  My Stories
                </TabsTrigger>
                <TabsTrigger
                  value="favorite-stories"
                  onClick={() => { setActiveTab("favorite-stories"); setIsEditing(false); }}
                  className="w-full rounded-xl transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
                >
                  Favorites
                </TabsTrigger>
              </TabsList>

              <TabsContent value="view" className={activeTab === "view" ? "" : "hidden"}>
                <div className="space-y-6">
                  <div className="flex justify-center mb-4">
                    <img
                      src={profile?.avatar || formData.avatar || "/placeholder-user.jpg"}
                      alt={profile?.displayName || formData.displayName || "User"}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                    />
                  </div>

                  <div className="rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-4 space-y-1">
                    <h3 className="text-base font-medium text-gray-500 dark:text-gray-400">
                      Display Name
                    </h3>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {profile?.displayName}
                    </p>
                  </div>

                  {/* Username display section */}
                  <div className="rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-4 space-y-1">
                    <h3 className="text-base font-medium text-gray-500 dark:text-gray-400">
                      Username
                    </h3>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {profile?.username || "Not set"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-4 space-y-1">
                    <h3 className="text-base font-medium text-gray-500 dark:text-gray-400">
                      Bio
                    </h3>
                    <p className="text-gray-900 dark:text-gray-100">
                      {profile?.bio || "No bio yet"}
                    </p>
                  </div>

                  {profile?.website && (
                    <div className="rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-4 space-y-1">
                      <h3 className="text-base font-medium text-gray-500 dark:text-gray-400">
                        Website
                      </h3>
                      <a
                        href={
                          profile.website.startsWith("http")
                            ? profile.website
                            : `https://${profile.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center group"
                      >
                        {profile.website}
                        <svg
                          className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </a>
                    </div>
                  )}

                  <div className="rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-4 space-y-3">
                    <h3 className="text-base font-medium text-gray-500 dark:text-gray-400">
                      Social Links
                    </h3>
                    <div className="space-y-2">
                      {profile?.socialLinks?.twitter && (
                        <a
                          href={`https://twitter.com/${profile.socialLinks.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                          <span className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-3 text-blue-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                            {profile.socialLinks.twitter}
                          </span>
                          <svg
                            className="w-4 h-4 text-gray-400 transition-transform group-hover:translate-x-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </a>
                      )}

                      {profile?.socialLinks?.github && (
                        <a
                          href={`https://github.com/${profile.socialLinks.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                          <span className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-3 text-gray-900 dark:text-gray-100"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            {profile.socialLinks.github}
                          </span>
                          <svg
                            className="w-4 h-4 text-gray-400 transition-transform group-hover:translate-x-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </a>
                      )}

                      {profile?.socialLinks?.linkedin && (
                        <a
                          href={`https://linkedin.com/in/${profile.socialLinks.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                          <span className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-3 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            {profile.socialLinks.linkedin}
                          </span>
                          <svg
                            className="w-4 h-4 text-gray-400 transition-transform group-hover:translate-x-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="edit">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Avatar URL input field in edit mode */}
                  <div className="rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-4 space-y-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Profile Picture URL
                    </label>
                    <Input
                      name="avatar"
                      type="url"
                      value={formData.avatar}
                      onChange={handleChange}
                      placeholder="https://example.com/your-image.png"
                      className="rounded-xl border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50"
                    />
                    {formData.avatar && (
                      <div className="mt-2">
                        <img src={formData.avatar} alt="Avatar preview" className="w-24 h-24 rounded-full object-cover border dark:border-gray-700"/>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-4 space-y-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Display Name
                    </label>
                    <Input
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      required
                      className="rounded-xl border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50"
                    />
                  </div>
                  
                  <div className="rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-4 space-y-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Username
                    </label>
                    <Input
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="rounded-xl border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50"
                    />
                    <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
                      Username must be unique and cannot be changed once set.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-4 space-y-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Bio
                    </label>
                    <Textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="rounded-xl border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50"
                    />
                  </div>

                  <div className="rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-4 space-y-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Website
                    </label>
                    <Input
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      type="url"
                      className="rounded-xl border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50"
                    />
                  </div>

                  <div className="rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-4 space-y-4">
                    <h3 className="text-base font-medium text-gray-500 dark:text-gray-400">
                      Social Links
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Twitter Username
                        </label>
                        <Input
                          name="twitter"
                          value={formData.twitter}
                          onChange={handleChange}
                          className="rounded-xl border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          GitHub Username
                        </label>
                        <Input
                          name="github"
                          value={formData.github}
                          onChange={handleChange}
                          className="rounded-xl border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          LinkedIn Username
                        </label>
                        <Input
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleChange}
                          className="rounded-xl border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full rounded-xl bg-blue-500 hover:bg-blue-600 text-white py-2.5"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="my-stories" className={activeTab === "my-stories" ? "" : "hidden"}>
                {storiesLoading ? (
                  <p className="text-gray-500 dark:text-gray-400">Loading stories...</p>
                ) : (
                  <StoryList stories={userStories} user={user} />
                )}
              </TabsContent>

              <TabsContent value="favorite-stories" className={activeTab === "favorite-stories" ? "" : "hidden"}>
                {favoriteStoriesLoading ? (
                  <p className="text-gray-500 dark:text-gray-400">Loading favorite stories...</p>
                ) : (
                  <StoryList stories={favoriteStories} user={user} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
