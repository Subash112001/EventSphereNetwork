import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface FilterState {
  search: string;
  dateRange: string;
  category: string;
  priceRange: string;
  location: string;
  distance: string;
}

export interface ActiveFilter {
  type: 'dateRange' | 'category' | 'priceRange' | 'location' | 'distance';
  value: string;
  label: string;
}

interface EventFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

const EventFilters = ({ onFiltersChange }: EventFiltersProps) => {
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateRange: 'all',
    category: 'all',
    priceRange: 'all',
    location: '',
    distance: '10'
  });

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  const toggleFilterPanel = () => {
    setShowFilterPanel(!showFilterPanel);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getFilterLabel = (type: ActiveFilter['type'], value: string): string => {
    const labels: Record<string, Record<string, string>> = {
      dateRange: {
        today: 'Today',
        tomorrow: 'Tomorrow',
        weekend: 'This Weekend',
        week: 'This Week',
        month: 'This Month',
        custom: 'Custom Range'
      },
      category: {
        music: 'Music',
        tech: 'Technology',
        art: 'Art & Culture',
        sports: 'Sports',
        food: 'Food & Drink',
        business: 'Business'
      },
      priceRange: {
        free: 'Free',
        '1-25': '$1 - $25',
        '25-50': '$25 - $50',
        '50-100': '$50 - $100',
        '100+': '$100+'
      },
      distance: {
        '5': 'Within 5 miles',
        '10': 'Within 10 miles',
        '25': 'Within 25 miles',
        '50': 'Within 50 miles',
        '100': 'Within 100 miles',
        any: 'Any distance'
      }
    };

    if (type === 'location') {
      return `Location: ${value}`;
    }

    return labels[type][value] || value;
  };

  const applyFilters = () => {
    const newActiveFilters: ActiveFilter[] = [];
    
    if (filters.dateRange !== 'all') {
      newActiveFilters.push({
        type: 'dateRange',
        value: filters.dateRange,
        label: `Date: ${getFilterLabel('dateRange', filters.dateRange)}`
      });
    }
    
    if (filters.category !== 'all') {
      newActiveFilters.push({
        type: 'category',
        value: filters.category,
        label: `Category: ${getFilterLabel('category', filters.category)}`
      });
    }
    
    if (filters.priceRange !== 'all') {
      newActiveFilters.push({
        type: 'priceRange',
        value: filters.priceRange,
        label: `Price: ${getFilterLabel('priceRange', filters.priceRange)}`
      });
    }
    
    if (filters.location) {
      newActiveFilters.push({
        type: 'location',
        value: filters.location,
        label: `Location: ${filters.location}`
      });
      
      newActiveFilters.push({
        type: 'distance',
        value: filters.distance,
        label: `Distance: ${getFilterLabel('distance', filters.distance)}`
      });
    }
    
    setActiveFilters(newActiveFilters);
    onFiltersChange(filters);
    setShowFilterPanel(false);
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      search: '',
      dateRange: 'all',
      category: 'all',
      priceRange: 'all',
      location: '',
      distance: '10'
    };
    
    setFilters(defaultFilters);
    setActiveFilters([]);
    onFiltersChange(defaultFilters);
  };

  const removeFilter = (filter: ActiveFilter) => {
    const updatedFilters = { ...filters, [filter.type]: filter.type === 'location' ? '' : 'all' };
    setFilters(updatedFilters);
    setActiveFilters(activeFilters.filter(f => !(f.type === filter.type && f.value === filter.value)));
    onFiltersChange(updatedFilters);
  };

  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <Input 
              type="text" 
              name="search" 
              id="search" 
              className="pl-10" 
              placeholder="Search events..." 
              value={filters.search}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div>
          <Button
            id="filter-button"
            variant="outline"
            className="flex items-center"
            onClick={toggleFilterPanel}
          >
            <i className="fas fa-filter mr-2"></i>
            Filters
          </Button>
        </div>
        
        <div>
          <Button
            id="sort-button"
            variant="outline"
            className="flex items-center"
          >
            <i className="fas fa-sort mr-2"></i>
            Sort
          </Button>
        </div>
      </div>
      
      {/* Advanced Filter Panel */}
      {showFilterPanel && (
        <div id="filter-panel" className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <label htmlFor="date-range" className="block text-sm font-medium text-gray-700">Date Range</label>
            <div className="mt-1">
              <Select 
                value={filters.dateRange} 
                onValueChange={(value) => handleSelectChange('dateRange', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="weekend">This Weekend</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <div className="mt-1">
              <Select 
                value={filters.category} 
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="art">Art & Culture</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="food">Food & Drink</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="price-range" className="block text-sm font-medium text-gray-700">Price Range</label>
            <div className="mt-1">
              <Select 
                value={filters.priceRange} 
                onValueChange={(value) => handleSelectChange('priceRange', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="1-25">$1 - $25</SelectItem>
                  <SelectItem value="25-50">$25 - $50</SelectItem>
                  <SelectItem value="50-100">$50 - $100</SelectItem>
                  <SelectItem value="100+">$100+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
            <div className="mt-1">
              <Input 
                type="text" 
                name="location" 
                id="location" 
                placeholder="City, state, or venue" 
                value={filters.location}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="distance" className="block text-sm font-medium text-gray-700">Distance</label>
            <div className="mt-1">
              <Select 
                value={filters.distance} 
                onValueChange={(value) => handleSelectChange('distance', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Within 5 miles</SelectItem>
                  <SelectItem value="10">Within 10 miles</SelectItem>
                  <SelectItem value="25">Within 25 miles</SelectItem>
                  <SelectItem value="50">Within 50 miles</SelectItem>
                  <SelectItem value="100">Within 100 miles</SelectItem>
                  <SelectItem value="any">Any distance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="sm:col-span-6">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="mr-3"
                onClick={resetFilters}
              >
                Reset
              </Button>
              <Button
                type="button"
                onClick={applyFilters}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge 
              key={`${filter.type}-${index}`} 
              variant="secondary"
              className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
            >
              {filter.label}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1.5 inline-flex flex-shrink-0 h-4 w-4 rounded-full items-center justify-center text-primary-400 hover:bg-primary-200 hover:text-primary-500 focus:outline-none focus:bg-primary-500 focus:text-white"
                onClick={() => removeFilter(filter)}
              >
                <span className="sr-only">Remove filter</span>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventFilters;
