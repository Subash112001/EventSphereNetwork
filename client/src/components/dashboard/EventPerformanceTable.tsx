import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Event } from "@shared/schema";

interface EventPerformanceTableProps {
  events: Array<Event & { tickets_sold: number, capacity: number, revenue: number, status: string }>;
}

const EventPerformanceTable = ({ events }: EventPerformanceTableProps) => {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'On Track':
        return 'bg-green-100 text-green-800';
      case 'Needs Attention':
        return 'bg-yellow-100 text-yellow-800';
      case 'At Risk':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressBarColor = (fillRate: number) => {
    if (fillRate >= 80) return 'bg-green-600';
    if (fillRate >= 60) return 'bg-yellow-500';
    return 'bg-red-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Upcoming Events Performance</h3>
        <div>
          <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            Export Report
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Ticket Sales</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Fill Rate</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => {
              const fillRate = Math.round((event.tickets_sold / event.capacity) * 100);
              return (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell>{formatDate(event.date)}</TableCell>
                  <TableCell>{`${event.tickets_sold} / ${event.capacity}`}</TableCell>
                  <TableCell>${event.revenue.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`${getProgressBarColor(fillRate)} h-2.5 rounded-full`} 
                        style={{ width: `${fillRate}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-900">{fillRate}%</span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(event.status)}`}>
                      {event.status}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EventPerformanceTable;
