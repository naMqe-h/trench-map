/**
 * Defines the number of each type of house in a village.
 */
export interface Houses {
    [key: string]: number
}

/**
 * Represents the core data for a village fetched from the database.
 */
export interface Village {
    id?: string
    ca: string
    name: string
    ticker: string
    image: string
    houses: Houses
    marketCap: number
    socials: string[] | Record<string, string>
    lastUpdated: string | Date
    forcedIndex?: number
    villageStats?: Record<string, number>
}
