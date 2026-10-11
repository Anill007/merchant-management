
export interface MerchantApplication {
    id: string;
    name: string;
    email: string;
    status: string;
    address: string;
    reviewer: number | null;
    createdBy: number;
}
