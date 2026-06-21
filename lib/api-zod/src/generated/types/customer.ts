export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string | null;
  created_at?: string;
}
