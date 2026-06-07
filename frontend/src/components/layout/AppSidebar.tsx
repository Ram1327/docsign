import { NavLink, useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 7a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM13 7a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V7zM3 17a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zM13 17a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
  },
  {
    to: "/documents/upload",
    label: "Upload",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        />
      </svg>
    ),
  },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-gray-100">
        <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <span className="font-bold text-gray-900 tracking-tight">DocSign</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-brand-700">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
