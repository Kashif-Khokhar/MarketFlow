import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ChevronDown, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

const CATEGORIES = [
  { id: 'electronics', label: 'Electronics' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'home-and-living', label: 'Home & Living' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'sports', label: 'Sports' },
  { id: 'toys-and-games', label: 'Toys & Games' },
  { id: 'groceries', label: 'Groceries' },
];

const RATINGS = [
  { id: '4', label: '4 Stars & Up' },
  { id: '3', label: '3 Stars & Up' },
  { id: '2', label: '2 Stars & Up' },
];

interface ProductFiltersProps {
  className?: string;
  onClose?: () => void;
}

export function ProductFilters({ className, onClose }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentRating = searchParams.get('rating') || '';

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when filtering
    params.delete('page');
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('rating');
    params.delete('page');
    router.push(`/products?${params.toString()}`, { scroll: false });
    if (onClose) onClose();
  };

  const handlePriceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const min = formData.get('minPrice') as string;
    const max = formData.get('maxPrice') as string;
    
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set('minPrice', min);
    else params.delete('minPrice');
    
    if (max) params.set('maxPrice', max);
    else params.delete('maxPrice');
    
    params.delete('page');
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const hasActiveFilters = currentCategory || currentMinPrice || currentMaxPrice || currentRating;

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Filter size={18} /> Filters
        </h2>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="h-8 text-xs text-muted-foreground hover:text-primary px-2"
          >
            Clear All
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={['categories', 'price', 'rating']} className="w-full">
        {/* Category Filter */}
        <AccordionItem value="categories" className="border-b-0 mb-4">
          <AccordionTrigger className="hover:no-underline py-3">
            <span className="font-medium text-sm">Categories</span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="space-y-3">
              {CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category.id}`} 
                    checked={currentCategory === category.id}
                    onCheckedChange={(checked) => {
                      updateFilters('category', checked ? category.id : null);
                    }}
                  />
                  <Label 
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {category.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Filter */}
        <AccordionItem value="price" className="border-b-0 mb-4">
          <AccordionTrigger className="hover:no-underline py-3">
            <span className="font-medium text-sm">Price Range</span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <form onSubmit={handlePriceSubmit} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                  <Input 
                    type="number" 
                    name="minPrice" 
                    placeholder="Min" 
                    defaultValue={currentMinPrice}
                    className="pl-6 h-9 text-sm" 
                  />
                </div>
                <span className="text-muted-foreground">-</span>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                  <Input 
                    type="number" 
                    name="maxPrice" 
                    placeholder="Max" 
                    defaultValue={currentMaxPrice}
                    className="pl-6 h-9 text-sm" 
                  />
                </div>
              </div>
              <Button type="submit" variant="outline" className="w-full h-9 text-xs">
                Apply Range
              </Button>
            </form>
          </AccordionContent>
        </AccordionItem>

        {/* Rating Filter */}
        <AccordionItem value="rating" className="border-b-0 mb-4">
          <AccordionTrigger className="hover:no-underline py-3">
            <span className="font-medium text-sm">Customer Rating</span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="space-y-3">
              {RATINGS.map((rating) => (
                <div key={rating.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`rating-${rating.id}`} 
                    checked={currentRating === rating.id}
                    onCheckedChange={(checked) => {
                      updateFilters('rating', checked ? rating.id : null);
                    }}
                  />
                  <Label 
                    htmlFor={`rating-${rating.id}`}
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <div className="flex text-[#E08A3E]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className={`w-3.5 h-3.5 ${i < parseInt(rating.id) ? 'fill-current' : 'fill-muted text-muted'}`} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1">& Up</span>
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
