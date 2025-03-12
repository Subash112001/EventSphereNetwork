import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import EventCard from "./EventCard";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterState {
  search: string;
  dateRange: string;
  category: string;
  priceRange: string;
  location: string;
  distance: string;
}

const EventsListing = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateRange: 'all',
    category: 'all',
    priceRange: 'all',
    location: '',
    distance: '10'
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Initialize the search term from filters
  useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  // Convert filters to query params
  const getQueryParams = () => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.dateRange !== 'all') params.append('dateRange', filters.dateRange);
    if (filters.category !== 'all') params.append('category', filters.category);
    if (filters.priceRange !== 'all') params.append('priceRange', filters.priceRange);
    if (filters.location) {
      params.append('location', filters.location);
      params.append('distance', filters.distance);
    }
    
    params.append('page', currentPage.toString());
    
    return params.toString();
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/events', getQueryParams()],
  });

  // Type checking for data
  type QueryResponse = {
    events: Event[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      pageSize: number;
    }
  };

  const typedData = data as QueryResponse | undefined;
  const events = typedData?.events || [];
  const totalPages = typedData?.pagination?.totalPages || 1;

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFiltersChange({
      ...filters,
      search: searchTerm
    });
  };

  const handleCategoryChange = (value: string) => {
    handleFiltersChange({
      ...filters,
      category: value
    });
  };

  const handleDateRangeChange = (value: string) => {
    handleFiltersChange({
      ...filters,
      dateRange: value
    });
  };

  const handlePriceRangeChange = (value: string) => {
    handleFiltersChange({
      ...filters,
      priceRange: value
    });
  };

  const handleFavoriteToggle = async (eventId: number, isFavorite: boolean) => {
    // Optimistically update the cache
    const prevData = queryClient.getQueryData(['/api/events', getQueryParams()]);
    
    queryClient.setQueryData(['/api/events', getQueryParams()], (old: any) => {
      if (!old) return old;
      
      return {
        ...old,
        events: old.events.map((event: Event) => 
          event.id === eventId ? { ...event, is_favorite: isFavorite } : event
        )
      };
    });
    
    try {
      await apiRequest('POST', `/api/events/${eventId}/favorite`, { isFavorite });
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData(['/api/events', getQueryParams()], prevData);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) setCurrentPage(currentPage - 1);
              }}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }
            
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink 
                  href="#" 
                  isActive={pageNumber === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(pageNumber);
                  }}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
              }}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading events...</div>;
  }

  if (isError) {
    return <div className="p-6 text-center text-red-500">Error loading events. Please try again later.</div>;
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="flex w-full lg:col-span-2">
            <Input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-r-none"
            />
            <Button type="submit" className="rounded-l-none">
              <i className="fas fa-search mr-1"></i>
              Search
            </Button>
          </div>
          
          <div>
            <Select value={filters.category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Art & Culture">Art & Culture</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Food & Drink">Food & Drink</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Any Date</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="weekend">This Weekend</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={filters.priceRange} onValueChange={handlePriceRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="0-25">$0 - $25</SelectItem>
                  <SelectItem value="25-50">$25 - $50</SelectItem>
                  <SelectItem value="50-100">$50 - $100</SelectItem>
                  <SelectItem value="100+">$100+</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </form>
      </div>
      
      <div className="p-6">
        {events.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event: Event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
            
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-4 sm:px-0 mt-6">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((currentPage - 1) * 9) + 1}</span> to <span className="font-medium">{Math.min(currentPage * 9, typedData?.pagination?.totalItems || 0)}</span> of <span className="font-medium">{typedData?.pagination?.totalItems || 0}</span> results
                </p>
              </div>
              {renderPagination()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventsListing;
