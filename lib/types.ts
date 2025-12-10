export interface FormData {
  productName: string
  productDescription: string
  price: string
  promotionInfo: string
  promotionType: "freeship" | "discount" | "both" | "none"
  discountPercent: number
  categories: string[]
  duration: number
  gender: "male" | "female"
  count: number
  imageBase64: string | null
}

export interface DialogueResult {
  dialogue: string
  category: string
  gender: "male" | "female"
  estimatedDuration: number
  wordCount: number
  productInsights?: string
}
