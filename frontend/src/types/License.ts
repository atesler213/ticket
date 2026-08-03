export type LicenseType = 'Per-Seat' | 'Site License' | 'Subscription' | 'Concurrent' | 'Perpetual'
export type LicenseStatus = 'Active' | 'Expiring Soon' | 'Expired' | 'Over-capacity' | 'Unassigned'
export type LicenseCategory = 'SaaS' | 'Desktop App' | 'OS'

export interface LicenseUser {
  id: string
  name: string
  avatar?: string
  department?: string
  assignedAt?: string
}

export interface License {
  id: string
  softwareName: string
  vendor: string
  type: LicenseType
  status: LicenseStatus
  category: LicenseCategory
  totalSeats: number
  assignedSeats: number
  costPerSeat: number
  monthlyCost: number
  expirationDate: string | null
  purchaseDate: string | null
  licenseKey?: string
  department?: string
  assignedUsers: LicenseUser[]
}
