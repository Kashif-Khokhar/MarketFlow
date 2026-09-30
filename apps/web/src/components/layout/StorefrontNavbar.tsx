"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Drawer, 
  DrawerContent, 
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Heart, 
  ShoppingCart, 
  Bell, 
  Menu,
  UserCircle,
  LayoutDashboard,
  Package,
  LogOut,
  Store,
  Shield,
  ChevronDown
} from 'lucide-react';

export const StorefrontNavbar = () => {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0); 

  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: 'Categories', path: '/categories' },
    { name: 'Deals', path: '/deals' },
    { name: 'New Arrivals', path: '/new-arrivals' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-md shadow-sm border-b' : 'bg-background border-b'}`}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navbar */}
        <div className="hidden lg:flex h-20 items-center justify-between gap-8">
          {/* Logo & Main Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center group overflow-visible mr-16 lg:mr-24 -ml-2 lg:-ml-6">
              <img src="/logo.png" alt="MarketFlow" className="h-14 lg:h-16 w-auto object-contain scale-[1.5] lg:scale-[1.8] origin-left" />
            </Link>
            
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-muted flex items-center gap-1 ${isActive(link.path) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {link.name}
                  {link.name === 'Categories' && <ChevronDown className="h-4 w-4 opacity-50" />}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl relative">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                type="text"
                placeholder="Search products, brands, or categories..."
                className="w-full pl-10 pr-4 h-12 rounded-full border-input bg-muted/40 focus:bg-background focus-visible:ring-primary shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Right Section (Icons & Auth) */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Heart className="h-5 w-5" />
            </Button>
            
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <ShoppingCart className="h-5 w-5" />
                {cartCount >= 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground ring-2 ring-background">
                    3
                  </span>
                )}
              </Button>
            </Link>

            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground mr-2">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground ring-2 ring-background">
                1
              </span>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full ml-2 overflow-hidden flex items-center gap-2 pl-2 pr-1 h-10 hover:bg-muted">
                    <div className="h-8 w-8 rounded-full overflow-hidden shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover border-2 border-primary/20" />
                      ) : (
                        <div className="h-full w-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex items-center">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer flex items-center">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {(user.role === 'SELLER' || user.role === 'ADMIN') && (
                    <DropdownMenuItem asChild>
                      <Link href="/seller" className="cursor-pointer flex items-center">
                        <Store className="mr-2 h-4 w-4" />
                        <span>Seller Portal</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'ADMIN' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Portal</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <Link href="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navbar */}
        <div className="lg:hidden flex flex-col py-3 gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="icon" className="-ml-2">
                    <Menu className="h-6 w-6" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="p-4 flex flex-col gap-4">
                    <div className="flex items-center mb-4 overflow-visible">
                      <img src="/logo.png" alt="MarketFlow" className="h-12 md:h-14 w-auto object-contain scale-[1.8] md:scale-[2] origin-left" />
                    </div>
                    
                    <nav className="flex flex-col gap-2">
                      {navLinks.map((link) => (
                        <Link 
                          key={link.path} 
                          href={link.path}
                          className="px-4 py-3 rounded-md text-base font-medium bg-muted/50"
                        >
                          {link.name}
                        </Link>
                      ))}
                    </nav>

                    <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
                      {user ? (
                        <>
                          <Link href="/dashboard" className="px-4 py-3 rounded-md flex items-center gap-3">
                            <LayoutDashboard className="h-5 w-5" /> Dashboard
                          </Link>
                          <Link href="/profile" className="px-4 py-3 rounded-md flex items-center gap-3">
                            <UserCircle className="h-5 w-5" /> Profile
                          </Link>
                          <Link href="/orders" className="px-4 py-3 rounded-md flex items-center gap-3">
                            <Package className="h-5 w-5" /> Orders
                          </Link>
                          <button onClick={logout} className="px-4 py-3 rounded-md flex items-center gap-3 text-destructive text-left">
                            <LogOut className="h-5 w-5" /> Log out
                          </button>
                        </>
                      ) : (
                        <>
                          <Link href="/login">
                            <Button variant="outline" className="w-full justify-start h-12">Log in</Button>
                          </Link>
                          <Link href="/register">
                            <Button className="w-full justify-start h-12">Sign up</Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>

              <Link href="/" className="font-heading text-xl font-bold tracking-tight">
                MarketFlow
              </Link>
            </div>

            <div className="flex items-center gap-1">
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
              {user && (
                <Link href="/profile">
                  <Button variant="ghost" size="icon">
                    <UserCircle className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text"
              placeholder="Search..."
              className="w-full pl-9 bg-muted/40 rounded-full border-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </div>
    </header>
  );
};
