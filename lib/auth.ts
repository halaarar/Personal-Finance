export function login(email: string, password: string): boolean {
  if (email === "hala@financialplanning.ca" && password === "hala123") {
    localStorage.setItem("auth", "true");
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem("auth");
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("auth") === "true";
}
