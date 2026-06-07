import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";

export function PrivateLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
