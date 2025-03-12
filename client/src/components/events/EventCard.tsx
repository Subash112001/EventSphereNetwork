import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Event } from "@shared/schema";
import { Link } from "wouter";

interface EventCardProps {
  event: Event;
  onFavoriteToggle: (eventId: number, isFavorite: boolean) => void;
}

const EventCard = ({ event, onFavoriteToggle }: EventCardProps) => {
  const [isFavorite, setIsFavorite] = useState(event.is_favorite || false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFavoriteToggle = async () => {
    setIsProcessing(true);
    try {
      await apiRequest('POST', `/api/events/${event.id}/favorite`, { isFavorite: !isFavorite });
      setIsFavorite(!isFavorite);
      onFavoriteToggle(event.id, !isFavorite);
      toast({
        title: !isFavorite ? "Added to favorites" : "Removed from favorites",
        description: !isFavorite 
          ? `${event.name} has been added to your favorites.`
          : `${event.name} has been removed from your favorites.`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Action failed",
        description: "There was a problem updating your favorites.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    }) + ' · ' + 
    date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getCategoryBadgeColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      'Music': 'bg-pink-100 text-pink-800',
      'Technology': 'bg-blue-100 text-blue-800',
      'Art & Culture': 'bg-purple-100 text-purple-800',
      'Sports': 'bg-green-100 text-green-800',
      'Food & Drink': 'bg-yellow-100 text-yellow-800',
      'Business': 'bg-indigo-100 text-indigo-800',
      'Health & Wellness': 'bg-teal-100 text-teal-800'
    };
    
    return categoryColors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm transition-all hover:shadow-md">
      <div className="relative">
        <img 
          src={event.image_url} 
          alt={event.name} 
          className="object-cover w-full h-48"
        />
        <div className="absolute top-0 right-0 mt-3 mr-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 flex items-center justify-center bg-white text-gray-500 hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={handleFavoriteToggle}
            disabled={isProcessing}
          >
            <i className={`${isFavorite ? 'fas' : 'far'} fa-heart ${isFavorite ? 'text-primary' : ''}`}></i>
          </Button>
        </div>
      </div>
      <div className="p-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(event.category)} mb-2`}>
          {event.category}
        </span>
        <h3 className="text-lg font-medium text-gray-900">{event.name}</h3>
        <div className="mt-2 text-sm text-gray-500 flex items-center">
          <i className="fas fa-calendar-alt mr-1.5"></i>
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="mt-2 text-sm text-gray-500 flex items-center">
          <i className="fas fa-map-marker-alt mr-1.5"></i>
          <span>{event.location}</span>
        </div>
        <div className="mt-2 text-sm text-gray-500 flex items-center">
          <i className="fas fa-ticket-alt mr-1.5"></i>
          <span>{event.price_range}</span>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">{event.attendees_count} going</span>
          <Link href={`/events/${event.id}/tickets`}>
            <Button
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Get Tickets
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
