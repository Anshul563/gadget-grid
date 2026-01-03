import { auth } from "@/lib/auth"; // Better-Auth Server
import { headers } from "next/headers"; // Next.js headers
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Check Session on Server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 2. Security Guard: Redirect if not admin
  if (!session || session.user.role !== "admin") {
    redirect("/"); 
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Left Sidebar */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}