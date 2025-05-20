export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  token?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: () => Promise<any>;
  signOut: () => Promise<void>;
}
