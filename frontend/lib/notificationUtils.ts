import { useCallback } from "react";

export function useNotification() {
  // Simple browser alert for demonstration
  return {
    info: (msg: string) => alert(msg),
    error: (msg: string) => alert("Error: " + msg),
    success: (msg: string) => alert("Success: " + msg),
  };
}
