"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getProfile,
  updateProfile,
  createProfile,
} from "@/lib/firebase/firestore";
import { uploadProfileImage } from "@/lib/firebase/storage";
import type { UserProfile, ProfileUpdate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ProfileUpdate>({
    displayName: "",
    bio: "",
    socialLinks: {
      twitter: "",
      website: "",
    },
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user?.uid) return;

    try {
      let userProfile = await getProfile(user.uid);

      if (!userProfile) {
        const defaultProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || "Anonymous",
          bio: "",
          socialLinks: {},
          profileImageUrl: user.photoURL || "/placeholder-user.jpg",
          joinDate: new Date().toISOString(),
        };

        await createProfile(user.uid, defaultProfile);
        userProfile = defaultProfile;
      }

      setProfile(userProfile);
      setFormData({
        displayName: userProfile.displayName,
        bio: userProfile.bio,
        socialLinks: userProfile.socialLinks,
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const imageUrl = await uploadProfileImage(user.uid, file, (progress) => {
        setUploadProgress(progress);
      });

      await updateProfile(user.uid, { profileImageUrl: imageUrl });
      await loadProfile();
      toast.success("Profile picture updated successfully");
    } catch (error) {
      toast.error("Failed to upload profile picture");
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("social.")) {
      const socialType = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialType]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    try {
      await updateProfile(user.uid, formData);
      await loadProfile();
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (!profile) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-900 rounded-[20px] shadow-lg overflow-hidden backdrop-blur-lg backdrop-saturate-150 border border-gray-100 dark:border-gray-800">
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            Profile
          </h1>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full px-6 hover:opacity-90 transition-opacity"
            >
              Edit Profile
            </Button>
          )}
        </div>
        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                  Display Name
                </label>
                <Input
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  required
                  className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                  Bio
                </label>
                <Textarea
                  className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary/20"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                  Twitter
                </label>
                <Input
                  className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary/20"
                  name="social.twitter"
                  value={formData.socialLinks?.twitter || ""}
                  onChange={handleInputChange}
                  placeholder="Twitter username"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">
                  Website
                </label>
                <Input
                  className="rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary/20"
                  name="social.website"
                  value={formData.socialLinks?.website || ""}
                  onChange={handleInputChange}
                  type="url"
                  placeholder="https://your-website.com"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <Button
                  type="submit"
                  className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full hover:opacity-90 transition-opacity"
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-full border-gray-200 dark:border-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <img
                    src={profile.profileImageUrl}
                    alt={profile.displayName}
                    className="h-24 w-24 rounded-[22px] object-cover ring-4 ring-gray-50 dark:ring-gray-800"
                  />
                  <div className="absolute inset-0 rounded-[22px] ring-1 ring-inset ring-gray-900/10 dark:ring-white/10" />

                  {/* Upload overlay */}
                  <button
                    onClick={handleImageClick}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-[22px] cursor-pointer"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {/* Upload progress */}
                  {isUploading && (
                    <div className="absolute -bottom-2 left-0 right-0 px-2">
                      <Progress value={uploadProgress} className="h-1 w-full" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                    {profile.displayName}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Joined {new Date(profile.joinDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {profile.bio && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )}
              {(profile.socialLinks?.twitter ||
                profile.socialLinks?.website) && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Links
                  </h3>
                  <div className="space-y-2">
                    {profile.socialLinks.twitter && (
                      <a
                        href={`https://twitter.com/${profile.socialLinks.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="currentColor"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        Twitter
                      </a>
                    )}
                    {profile.socialLinks.website && (
                      <a
                        href={profile.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0a9 9 0 0 0 9-9m-9 9a9 9 0 0 1-9-9m9 9v-2m9-7H3m9-9v2" />
                        </svg>
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
