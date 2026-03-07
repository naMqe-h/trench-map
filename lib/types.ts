export interface Village {
    ca: string
    name: string
    ticker: string
    image: string
    houses: {
        singleStory: number
        twoStory: number
        tenement: number
    }
    marketCap: number
    socials: Record<string, string>
}