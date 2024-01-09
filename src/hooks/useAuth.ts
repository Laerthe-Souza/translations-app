import { AuthContext } from "@/contexts/auth";
import { useContext } from "react";

export function useAuth() {
  const context = useContext(AuthContext);

  return context;
}