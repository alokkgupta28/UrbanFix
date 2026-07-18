import { queryOptions } from "@tanstack/react-query";
import { api } from "./api";

export type Category = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  base_price: number;
  icon_key: string;
  sort_order: number;
};

export type Provider = {
  id: string;
  category_id: string;
  full_name: string;
  headline: string;
  bio: string;
  city: string;
  hourly_rate: number;
  experience_years: number;
  rating_avg: number;
  rating_count: number;
  jobs_completed: number;
  verified: boolean;
  avatar_key: string;
  languages: string[];
  user_id: string | null;
};

export type Review = {
  id: string;
  provider_id: string;
  booking_id: string | null;
  customer_id: string | null;
  customer_name: string;
  customer_city: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type Booking = {
  id: string;
  customer_id: string;
  provider_id: string;
  category_id: string;
  scheduled_at: string;
  address_line: string;
  address_city: string;
  address_pincode: string;
  notes: string | null;
  contact_phone: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  total_amount: number;
  payment_method: string;
  stripe_session_id: string | null;
  stripe_payment_status: string;
  stripe_environment: string | null;
  disputed: boolean;
  dispute_reason: string | null;
  admin_notes: string | null;
  created_at: string;
};

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const res = await api.get<Category[]>("/categories");
    return res.data;
  },
  staleTime: 5 * 60_000,
});

export const providersQuery = queryOptions({
  queryKey: ["providers"],
  queryFn: async (): Promise<Provider[]> => {
    const res = await api.get<Provider[]>("/providers");
    return res.data;
  },
  staleTime: 5 * 60_000,
});

export const reviewsQuery = queryOptions({
  queryKey: ["reviews"],
  queryFn: async (): Promise<Review[]> => {
    const res = await api.get<Review[]>("/reviews");
    return res.data;
  },
  staleTime: 5 * 60_000,
});

export function reviewByBookingQuery(bookingId: string) {
  return queryOptions({
    queryKey: ["review-by-booking", bookingId],
    queryFn: async (): Promise<Review | null> => {
      try {
        const res = await api.get<Review>(`/reviews/booking/${bookingId}`);
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
    staleTime: 30_000,
  });
}

export function myBookingsQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["my-bookings", userId ?? "anon"],
    queryFn: async (): Promise<Booking[]> => {
      if (!userId) return [];
      const res = await api.get<Booking[]>("/bookings");
      return res.data;
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

export function bookingByIdQuery(id: string) {
  return queryOptions({
    queryKey: ["booking", id],
    queryFn: async (): Promise<Booking | null> => {
      try {
        const res = await api.get<Booking>(`/bookings/${id}`);
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
    staleTime: 0,
  });
}

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  city: string | null;
};

export function profileQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["profile", userId ?? "anon"],
    queryFn: async (): Promise<Profile | null> => {
      if (!userId) return null;
      try {
        const res = await api.get<Profile>("/profiles/me");
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 401) return null;
        throw err;
      }
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

export function myProviderQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["my-provider", userId ?? "anon"],
    queryFn: async (): Promise<Provider | null> => {
      if (!userId) return null;
      try {
        const res = await api.get<Provider>("/providers/me");
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 401) return null;
        throw err;
      }
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

export function providerBookingsQuery(providerId: string | undefined) {
  return queryOptions({
    queryKey: ["provider-bookings", providerId ?? "none"],
    queryFn: async (): Promise<Booking[]> => {
      if (!providerId) return [];
      const res = await api.get<Booking[]>(`/bookings/provider/${providerId}`);
      return res.data;
    },
    enabled: Boolean(providerId),
    staleTime: 15_000,
  });
}

export function providerReviewsQuery(providerId: string | undefined) {
  return queryOptions({
    queryKey: ["provider-reviews", providerId ?? "none"],
    queryFn: async (): Promise<Review[]> => {
      if (!providerId) return [];
      const res = await api.get<Review[]>(`/reviews/provider/${providerId}`);
      return res.data;
    },
    enabled: Boolean(providerId),
    staleTime: 30_000,
  });
}

// UserRoleQuery isn't used much by customer but here is the replacement
export function isAdminQuery(userId: string | undefined) {
  return queryOptions({
    queryKey: ["is-admin", userId ?? "anon"],
    queryFn: async (): Promise<boolean> => {
      if (!userId) return false;
      try {
        // A simple way since auth/me returns user roles
        const res = await api.get("/auth/me");
        return res.data?.user?.roles?.includes("admin") || false;
      } catch (err) {
        return false;
      }
    },
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}

export const allBookingsQuery = queryOptions({
  queryKey: ["admin", "bookings"],
  queryFn: async (): Promise<Booking[]> => {
    const res = await api.get<Booking[]>("/bookings?all=true");
    return res.data;
  },
  staleTime: 10_000,
});

export type UserRoleRow = {
  id: string;
  user_id: string;
  role: "admin" | "customer" | "provider";
  created_at: string;
};

export const allUserRolesQuery = queryOptions({
  queryKey: ["admin", "user-roles"],
  queryFn: async (): Promise<UserRoleRow[]> => {
    const res = await api.get<UserRoleRow[]>("/roles");
    return res.data;
  },
  staleTime: 30_000,
});

// Provider phone is gated in backend
export function providerPhoneQuery(providerId: string | undefined, enabled = true) {
  return queryOptions({
    queryKey: ["provider-phone", providerId ?? "none"],
    queryFn: async (): Promise<string | null> => {
      if (!providerId) return null;
      try {
        const res = await api.get<string>(`/providers/${providerId}/phone`);
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 403 || err.response?.status === 401) return null;
        throw err;
      }
    },
    enabled: Boolean(providerId) && enabled,
    staleTime: 60_000,
  });
}
