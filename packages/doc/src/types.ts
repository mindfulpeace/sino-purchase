export interface ReimbursementItem {
  detail?: string;
  amount?: number;
}

export interface DocReimburseProps {
  date?: string;
  items?: ReimbursementItem[];
  applicant?: string;
  companyName?: string;
  companyNameEn?: string;
}
