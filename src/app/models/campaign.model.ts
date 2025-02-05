export interface Campaign {
  id: number;
  name: string;
  keywords: string[];
  bidAmount: number;
  campaignFund: number;
  status: string;
  town: string;
  radius: number;
  createdAt: Date;
} 