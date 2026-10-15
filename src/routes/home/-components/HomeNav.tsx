import { Link } from "@tanstack/react-router";
import {
  Menu,
  X,
  MousePointer2,
  LogIn,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/store/authStore";

export default function HomeNav() {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [user] = useAuth();

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Solutions", href: "#solutions" },
    { name: "Pricing", href: "#pricing" },
    { name: "About", href: "#about" },
  ];

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 w-full border-b border-base-200 bg-base-100/70 backdrop-blur-lg"
    >
      <div className="container mx-auto flex h-20 items-center justify-between">
        {/* Brand/Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group transition-all duration-300"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-content shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <MousePointer2 className="size-6 rotate-12" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-semibold tracking-tight text-primary">
              <span className="text-base-content">Kinovia</span>
            </span>
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase opacity-50">
              Business Suite
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-base-200 hover:text-primary transition-all"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link
              to="/tenant"
              className="btn btn-primary btn-sm rounded-lg px-6 font-semibold shadow-md shadow-primary/10 hover:shadow-primary/30 gap-2"
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/auth/login"
                search={{ email: "" }}
                className="btn btn-ghost btn-sm font-semibold gap-2"
              >
                <LogIn className="size-4" />
                Sign In
              </Link>
              <Link
                to="/auth/register"
                className="btn btn-primary btn-sm rounded-lg px-6 font-semibold shadow-md shadow-primary/10 hover:shadow-primary/30"
              >
                Get Started
                <ChevronRight className="size-4" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden btn btn-ghost btn-circle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-x-0 top-20 bg-base-100 border-b border-base-200 p-6 shadow-2xl transition-all duration-300 transform lg:hidden ${
          isOpen
            ? "translate-y-0 opacity-100 visible"
            : "-translate-y-4 opacity-0 invisible"
        }`}
      >
        <div className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="flex items-center justify-between p-3 text-lg font-semibold rounded-xl hover:bg-base-200 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
              <ChevronRight className="size-4 opacity-30" />
            </a>
          ))}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {user ? (
              <Link
                to="/tenant"
                className="btn btn-primary font-semibold shadow-lg shadow-primary/20 col-span-2 gap-2"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="size-4" />
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  search={{ email: "" }}
                  className="btn btn-outline btn-primary font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="btn btn-primary font-semibold shadow-lg shadow-primary/20"
                  onClick={() => setIsOpen(false)}
                >
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
