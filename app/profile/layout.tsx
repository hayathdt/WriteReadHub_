import AuthCheck from "@/components/auth-check";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthCheck>{children}</AuthCheck>;
}
