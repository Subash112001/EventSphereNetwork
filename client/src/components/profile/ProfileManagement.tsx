import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  country: z.string(),
  city: z.string().optional(),
  interests: z.array(z.string()).optional(),
  emailUpdates: z.boolean().optional(),
  newsletter: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  publicProfile: z.boolean().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const interests = [
  { id: 'music', label: 'Music' },
  { id: 'technology', label: 'Technology' },
  { id: 'sports', label: 'Sports' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'art', label: 'Art & Culture' },
  { id: 'business', label: 'Business' },
  { id: 'health', label: 'Health & Wellness' },
];

const ProfileManagement = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const { data: profile, isLoading } = useQuery<User>({
    queryKey: ['/api/users/profile'],
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: 'United States',
      city: '',
      interests: [],
      emailUpdates: true,
      newsletter: true,
      smsNotifications: false,
      publicProfile: true,
    },
  });

  // When profile data is loaded, update the form values
  useState(() => {
    if (profile) {
      form.reset({
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        phone: profile.phone || '',
        country: profile.country || 'United States',
        city: profile.city || '',
        interests: profile.interests || [],
        emailUpdates: profile.notification_preferences?.email_updates ?? true,
        newsletter: profile.notification_preferences?.newsletter ?? true,
        smsNotifications: profile.notification_preferences?.sms_notifications ?? false,
        publicProfile: profile.notification_preferences?.public_profile ?? true,
      });
    }
  });

  const toggleInterest = (interestId: string) => {
    const currentInterests = form.getValues('interests') || [];
    const isSelected = currentInterests.includes(interestId);
    
    const updatedInterests = isSelected
      ? currentInterests.filter(id => id !== interestId)
      : [...currentInterests, interestId];
    
    form.setValue('interests', updatedInterests);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      await apiRequest('PUT', '/api/users/profile', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        country: data.country,
        city: data.city,
        interests: data.interests,
        notificationPreferences: {
          emailUpdates: data.emailUpdates,
          newsletter: data.newsletter,
          smsNotifications: data.smsNotifications,
          publicProfile: data.publicProfile,
        }
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading profile data...</div>;
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your personal details and preferences</p>
          </div>
          <Button 
            type="button" 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving || !form.formState.isDirty}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
        
        <div className="border-t border-gray-200">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="px-4 py-5 sm:px-6">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-1/3 mb-4 sm:mb-0">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <img 
                          className="h-40 w-40 rounded-full" 
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                          alt="Profile picture"
                        />
                        <div className="absolute bottom-0 right-0">
                          <Button
                            variant="outline"
                            size="icon"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-sm text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                          >
                            <i className="fas fa-camera"></i>
                          </Button>
                        </div>
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-gray-900">
                        {profile?.first_name} {profile?.last_name}
                      </h3>
                      <p className="text-gray-500 text-sm">Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="sm:w-2/3">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email address</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone number</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="United States">United States</SelectItem>
                                  <SelectItem value="Canada">Canada</SelectItem>
                                  <SelectItem value="Mexico">Mexico</SelectItem>
                                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                  <SelectItem value="Australia">Australia</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Interests */}
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Your Interests</h3>
                <p className="mt-1 text-sm text-gray-500">Select the event categories you're interested in</p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Button
                      key={interest.id}
                      type="button"
                      variant="outline"
                      className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                        form.getValues('interests')?.includes(interest.id)
                          ? 'bg-primary-50 border-primary text-primary'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleInterest(interest.id)}
                    >
                      {interest.label}
                      {form.getValues('interests')?.includes(interest.id) && (
                        <i className="fas fa-check ml-2 text-primary"></i>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Preferences */}
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Preferences</h3>
                <p className="mt-1 text-sm text-gray-500">Manage your notification and privacy settings</p>
                
                <div className="mt-4 space-y-4">
                  <FormField
                    control={form.control}
                    name="emailUpdates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Email updates</FormLabel>
                          <p className="text-sm text-gray-500">Receive email notifications about events you might be interested in</p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="newsletter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Newsletter</FormLabel>
                          <p className="text-sm text-gray-500">Receive our weekly newsletter with top events and offers</p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="smsNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>SMS notifications</FormLabel>
                          <p className="text-sm text-gray-500">Receive text message updates about your event tickets</p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="publicProfile"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Public profile</FormLabel>
                          <p className="text-sm text-gray-500">Make your profile visible to other EventSphere users</p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Payment Methods */}
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Payment Methods</h3>
                    <p className="mt-1 text-sm text-gray-500">Manage your saved payment methods</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center"
                  >
                    <i className="fas fa-plus mr-2"></i> Add New
                  </Button>
                </div>
                
                <div className="mt-4 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <i className="fab fa-cc-visa text-blue-600 text-2xl"></i>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">Visa ending in 4242</h4>
                        <p className="text-sm text-gray-500">Expires 12/2025</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <i className="fas fa-pen"></i>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <i className="fab fa-cc-mastercard text-orange-600 text-2xl"></i>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">Mastercard ending in 8888</h4>
                        <p className="text-sm text-gray-500">Expires 10/2024</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <i className="fas fa-pen"></i>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileManagement;
