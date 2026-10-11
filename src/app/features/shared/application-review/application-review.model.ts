
export interface MerchantApplication {
    id: string;
    name: string;
    email: string;
    phone: string;
    postalCode: string;
    city: string;
    state: string;
    country: string;
    status: string;
    address: string;
    reviewer: number | null;
    reviewerName?: string;
    createdBy: number;

    ownerFirstName: string;
    ownerLastName: string;
    ownerDob: string;
    ownerContact: string;
    ownerEmail: string;

    documentPath: string | null;
    imagePath: string | null;
}
