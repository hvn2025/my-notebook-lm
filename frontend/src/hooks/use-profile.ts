"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentProfile } from "@/lib/api/profile";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getCurrentProfile,
    staleTime: 5 * 60 * 1000,
  });
}
