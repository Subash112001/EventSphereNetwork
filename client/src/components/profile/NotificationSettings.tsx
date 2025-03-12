import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const notificationSchema = z.object({
  ticketPurchases: z.boolean().default(true),
  eventReminders: z.boolean().default(true),
  eventUpdates: z.boolean().default(true),
  eventRecommendations: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  notificationFrequency: z.enum(['immediate', 'daily', 'weekly']).default('immediate'),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

const NotificationSettings = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const { data: notificationPreferences, isLoading } = useQuery({
    queryKey: ['/api/users/notification-preferences'],
  });

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      ticketPurchases: true,
      eventReminders: true,
      eventUpdates: true,
      eventRecommendations: true,
      marketingEmails: false,
      notificationFrequency: 'immediate',
    },
  });

  // Update form values when data is loaded
  useState(() => {
    if (notificationPreferences) {
      form.reset({
        ticketPurchases: notificationPreferences.ticketPurchases,
        eventReminders: notificationPreferences.eventReminders,
        eventUpdates: notificationPreferences.eventUpdates,
        eventRecommendations: notificationPreferences.eventRecommendations,
        marketingEmails: notificationPreferences.marketingEmails,
        notificationFrequency: notificationPreferences.notificationFrequency,
      });
    }
  });

  const onSubmit = async (data: NotificationFormValues) => {
    setIsSaving(true);
    try {
      await apiRequest('PUT', '/api/users/notification-preferences', data);
      
      queryClient.invalidateQueries({ queryKey: ['/api/users/notification-preferences'] });
      
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error saving preferences",
        description: "There was a problem updating your notification preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading notification preferences...</div>;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Notification Settings</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Configure how and when you receive notifications</p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h4 className="text-base font-medium text-gray-900">Email Notifications</h4>
                <div className="mt-4 space-y-4">
                  <FormField
                    control={form.control}
                    name="ticketPurchases"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Ticket Purchases</FormLabel>
                          <FormDescription>
                            Receive confirmation emails when you purchase tickets
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="eventReminders"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Event Reminders</FormLabel>
                          <FormDescription>
                            Receive reminders before events you're attending
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="eventUpdates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Event Updates</FormLabel>
                          <FormDescription>
                            Receive updates about changes to events you're attending
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="eventRecommendations"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Event Recommendations</FormLabel>
                          <FormDescription>
                            Receive personalized event recommendations
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="marketingEmails"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Marketing Emails</FormLabel>
                          <FormDescription>
                            Receive promotional emails and special offers
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-base font-medium text-gray-900">Email Template Preview</h4>
                <div className="mt-4 border border-gray-200 rounded-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700">Ticket Confirmation</h5>
                  </div>
                  <div className="p-4">
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-4 border-b border-gray-200 bg-primary-50">
                        <div className="flex justify-center">
                          <h1 className="text-2xl font-bold text-primary">EventSphere</h1>
                        </div>
                      </div>
                      <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Ticket Confirmation</h2>
                        <p className="text-gray-700 mb-4">Thank you for your purchase, John! Your tickets for <strong>Summer Music Festival</strong> have been confirmed.</p>
                        
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-medium text-gray-500">Event</div>
                            <div className="text-sm font-medium text-gray-900">Summer Music Festival</div>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-medium text-gray-500">Date</div>
                            <div className="text-sm font-medium text-gray-900">Sat, Jul 15, 2023 · 12:00 PM</div>
                          </div>
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-medium text-gray-500">Location</div>
                            <div className="text-sm font-medium text-gray-900">Central Park, New York</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium text-gray-500">Ticket Type</div>
                            <div className="text-sm font-medium text-gray-900">VIP Pass × 2</div>
                          </div>
                        </div>
                        
                        <div className="flex justify-center mb-4">
                          <div className="bg-gray-200 h-24 w-24 flex items-center justify-center rounded-md">
                            <span className="text-gray-500">QR Code</span>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <Button>
                            View Tickets
                          </Button>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
                        &copy; {new Date().getFullYear()} EventSphere. All rights reserved.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-base font-medium text-gray-900">Notification Frequency</h4>
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="notificationFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-4"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="immediate" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Immediate
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="daily" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Daily Digest
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="weekly" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Weekly Digest
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSaving || !form.formState.isDirty}
                >
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
