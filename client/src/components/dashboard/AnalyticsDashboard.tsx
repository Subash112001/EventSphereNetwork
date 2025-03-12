import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MetricCard from "./MetricCard";
import EventPerformanceTable from "./EventPerformanceTable";
import { EventCategoryStat, MonthlyStat } from "@shared/schema";

const AnalyticsDashboard = () => {
  const [revenueTimeframe, setRevenueTimeframe] = useState("30");
  const [categoryView, setCategoryView] = useState("tickets");

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/analytics/metrics'],
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['/api/analytics/revenue', revenueTimeframe],
  });

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['/api/analytics/categories', categoryView],
  });

  const { data: eventsPerformance, isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/analytics/events-performance'],
  });

  const COLORS = ['#EC4899', '#4F46E5', '#A855F7', '#10B981', '#F59E0B', '#3B82F6'];

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (metricsLoading || revenueLoading || categoryLoading || eventsLoading) {
    return <div className="p-8 text-center">Loading dashboard data...</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Tickets Sold"
          value={metrics?.ticketsSold.toLocaleString() || "0"}
          icon={<i className="fas fa-ticket-alt"></i>}
          iconBgColor="bg-primary-100"
          iconTextColor="text-primary-600"
          change={`+${metrics?.ticketsGrowth || 0}% from last month`}
          changeColor="text-green-600"
        />
        
        <MetricCard
          title="Revenue Generated"
          value={formatCurrency(metrics?.revenue || 0)}
          icon={<i className="fas fa-dollar-sign"></i>}
          iconBgColor="bg-secondary-100"
          iconTextColor="text-secondary-600"
          change={`+${metrics?.revenueGrowth || 0}% from last month`}
          changeColor="text-green-600"
        />
        
        <MetricCard
          title="Active Events"
          value={metrics?.activeEvents || 0}
          icon={<i className="fas fa-calendar-check"></i>}
          iconBgColor="bg-green-100"
          iconTextColor="text-green-600"
          change={`+${metrics?.eventsGrowth || 0} from last month`}
          changeColor="text-green-600"
        />
        
        <MetricCard
          title="Total Attendees"
          value={metrics?.attendees.toLocaleString() || "0"}
          icon={<i className="fas fa-users"></i>}
          iconBgColor="bg-yellow-100"
          iconTextColor="text-yellow-600"
          change={`+${metrics?.attendeesGrowth || 0}% from last month`}
          changeColor="text-green-600"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Monthly Revenue</h3>
              <div className="flex items-center space-x-2">
                <Select value={revenueTimeframe} onValueChange={setRevenueTimeframe}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="60">Last 60 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last 12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData as MonthlyStat[]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#4F46E5" 
                    fill="#EEF2FF" 
                    activeDot={{ r: 8 }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Event Categories</h3>
              <div className="flex items-center space-x-2">
                <Select value={categoryView} onValueChange={setCategoryView}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tickets">By Ticket Count</SelectItem>
                    <SelectItem value="revenue">By Revenue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData as EventCategoryStat[]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey={categoryView === "tickets" ? "ticketCount" : "revenue"}
                    nameKey="category"
                  >
                    {(categoryData as EventCategoryStat[])?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value) => {
                    return categoryView === "revenue" 
                      ? [`$${Number(value).toLocaleString()}`, "Revenue"] 
                      : [value, "Tickets Sold"];
                  }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <EventPerformanceTable events={eventsPerformance || []} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
