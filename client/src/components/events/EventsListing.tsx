import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import EventCard from "./EventCard";
import EventFilters, { ActiveFilter } from "./EventFilters";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

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

  const events = data?.events || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to page 1 when filters change
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
      <EventFilters onFiltersChange={handleFiltersChange} />
      
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
                  Showing <span className="font-medium">{((currentPage - 1) * 9) + 1}</span> to <span className="font-medium">{Math.min(currentPage * 9, data?.pagination?.totalItems || 0)}</span> of <span className="font-medium">{data?.pagination?.totalItems || 0}</span> results
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
