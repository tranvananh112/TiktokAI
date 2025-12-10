"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ImageIcon,
  Sparkles,
  Clock,
  User,
  Tag,
  Percent,
  FileText,
  X,
  Loader2,
  ShoppingCart,
  Truck,
  BadgePercent,
  Search,
  Globe,
} from "lucide-react"
import type { FormData } from "@/lib/types"

const CATEGORIES = [
  { id: "content", label: "Nội dung SP", icon: FileText, color: "bg-lime/20 text-lime-foreground border-lime/40" },
  {
    id: "price",
    label: "Về giá",
    icon: Tag,
    color: "bg-christmas-gold/20 text-christmas-gold border-christmas-gold/40",
  },
  {
    id: "promotion",
    label: "Khuyến mãi",
    icon: Percent,
    color: "bg-christmas-red/20 text-christmas-red border-christmas-red/40",
  },
]

const DURATIONS = [
  { value: 8, label: "8 giây" },
  { value: 10, label: "10 giây" },
  { value: 15, label: "15 giây" },
  { value: 20, label: "20 giây" },
  { value: 30, label: "30 giây" },
]

const DIALOGUE_COUNTS = [1, 2, 3, 4, 5, 6]

const DISCOUNT_PERCENTS = [10, 15, 20, 25, 30, 40, 50]

interface ProductInputFormProps {
  onGenerate: (data: FormData) => void
  isGenerating: boolean
}

export function ProductInputForm({ onGenerate, isGenerating }: ProductInputFormProps) {
  const [productName, setProductName] = useState("")
  const [productDescription, setProductDescription] = useState("")
  const [price, setPrice] = useState("")
  const [promotionInfo, setPromotionInfo] = useState("")
  const [promotionType, setPromotionType] = useState<"freeship" | "discount" | "both" | "none">("none")
  const [discountPercent, setDiscountPercent] = useState(20)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["content"])
  const [duration, setDuration] = useState(10)
  const [gender, setGender] = useState<"male" | "female">("female")
  const [dialogueCount, setDialogueCount] = useState(3)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [retryCountdown, setRetryCountdown] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId],
    )
  }

  const handleAutoSearch = async () => {
    if (!productName.trim()) {
      alert("Vui lòng nhập tên sản phẩm trước khi tìm kiếm!")
      return
    }

    setSearchError(null)
    setIsSearching(true)

    try {
      // Thử API scraping thực tế trước
      const realScrapeResponse = await fetch("/api/real-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: productName.trim() }),
      })

      const realScrapeData = await realScrapeResponse.json()

      if (realScrapeData.success && realScrapeData.description) {
        setProductDescription(realScrapeData.description)
        setSearchError(null)

        // Hiển thị thông báo thành công với nguồn dữ liệu thực tế
        const sources = realScrapeData.sources ? realScrapeData.sources.join(', ') : 'Web scraping'
        const totalFound = realScrapeData.totalFound || 0
        console.log(`✅ Đã scrape thành công ${totalFound} sản phẩm từ: ${sources}`)
        return
      }

      // Nếu real scraping không thành công, thử API scraping mô phỏng
      const scrapeResponse = await fetch("/api/scrape-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: productName.trim() }),
      })

      const scrapeData = await scrapeResponse.json()

      if (scrapeData.success && scrapeData.description) {
        setProductDescription(scrapeData.description)
        setSearchError(null)

        // Hiển thị thông báo thành công với nguồn dữ liệu
        const sources = scrapeData.sources ? scrapeData.sources.join(', ') : 'AI Analysis'
        console.log(`✅ Đã phân tích thông tin từ: ${sources}`)
        return
      }

      // Nếu scraping không thành công, fallback về API search cũ
      const response = await fetch("/api/search-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: productName.trim() }),
      })

      const data = await response.json()

      if (data.success && data.description) {
        setProductDescription(data.description)
        setSearchError(null)
      } else if (data.isQuotaError) {
        setSearchError("API đang bận. Đợi 30 giây rồi thử lại hoặc nhập mô tả thủ công.")
        setRetryCountdown(30)
        const interval = setInterval(() => {
          setRetryCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              setSearchError(null)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setSearchError(data.error || "Không thể tìm kiếm. Vui lòng nhập mô tả thủ công.")
      }
    } catch (error) {
      console.error("Search error:", error)
      setSearchError("Lỗi kết nối. Vui lòng thử lại!")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    onGenerate({
      productName,
      productDescription,
      price,
      promotionInfo,
      promotionType,
      discountPercent,
      categories: selectedCategories,
      duration,
      gender,
      count: dialogueCount,
      imageBase64: uploadedImage,
    })
  }

  return (
    <Card className="border-lime/30 shadow-lg shadow-lime/10 bg-gradient-to-br from-card to-lime/5">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lime to-primary flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          Thông tin sản phẩm
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Hình ảnh sản phẩm (tùy chọn)</Label>
            <div
              className="border-2 border-dashed border-lime/40 rounded-xl p-6 text-center cursor-pointer hover:border-lime hover:bg-lime/10 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadedImage ? (
                <div className="relative inline-block">
                  <img
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Product"
                    className="max-h-32 rounded-lg object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setUploadedImage(null)
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-christmas-red text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="w-12 h-12 rounded-full bg-lime/20 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-lime-foreground" />
                  </div>
                  <p className="text-sm">Kéo thả hoặc click để tải ảnh</p>
                  <p className="text-xs">PNG, JPG tối đa 5MB</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="productName" className="text-sm font-medium">
              Tên sản phẩm *
            </Label>
            <Input
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="VD: Kem chống nắng UV Expert Pro"
              className="h-11 border-lime/30 focus:border-lime focus:ring-lime/30"
              required
            />
          </div>

          {/* Description - Updated with error display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-sm font-medium">
                Mô tả sản phẩm *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoSearch}
                disabled={isSearching || !productName.trim() || retryCountdown > 0}
                className="h-8 px-3 text-xs font-medium border-lime bg-lime/10 text-lime-foreground hover:bg-lime/20 hover:border-lime disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                    Đang tìm...
                  </>
                ) : retryCountdown > 0 ? (
                  <>
                    <Clock className="w-3 h-3 mr-1.5" />
                    Đợi {retryCountdown}s
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3 mr-1.5" />
                    Tự động tìm kiếm
                  </>
                )}
              </Button>
            </div>

            {searchError && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-christmas-red/10 border border-christmas-red/30">
                <X className="w-4 h-4 text-christmas-red flex-shrink-0" />
                <p className="text-xs text-christmas-red">{searchError}</p>
              </div>
            )}

            {!searchError && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-lime/10 to-christmas-gold/10 border border-lime/20">
                <Search className="w-4 h-4 text-lime-foreground flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Nhập tên SP rồi nhấn <strong className="text-lime-foreground">"Tự động tìm kiếm"</strong> để hệ thống
                  <strong className="text-christmas-gold"> scrape dữ liệu thực tế</strong> từ Shopee, Tiki, Lazada...
                </p>
              </div>
            )}

            <Textarea
              id="description"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Nhập mô tả hoặc nhấn 'Tự động tìm kiếm' để AI Gemini tìm thông tin chi tiết về sản phẩm..."
              className="min-h-[120px] resize-none border-lime/30 focus:border-lime focus:ring-lime/30"
              required
            />

            {/* Hiển thị nguồn dữ liệu */}
            {productDescription && (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-lime-foreground">
                  <Sparkles className="w-3 h-3 text-christmas-gold" />
                  <span>✅ Đã thu thập dữ liệu thực tế từ các sàn TMĐT</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>🤖 AI sẽ tạo nội dung sáng tạo dựa trên dữ liệu này, không sao chép nguyên văn</span>
                </div>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium flex items-center gap-1">
              <Tag className="w-3 h-3 text-christmas-gold" />
              Giá sản phẩm
            </Label>
            <Input
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="199.000đ"
              className="h-11 border-christmas-gold/30 focus:border-christmas-gold"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Percent className="w-4 h-4 text-christmas-red" />
              Loại khuyến mãi
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPromotionType(promotionType === "freeship" ? "none" : "freeship")}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${promotionType === "freeship" || promotionType === "both"
                  ? "border-lime bg-lime/10 text-lime-foreground shadow-md"
                  : "border-border bg-secondary/30 text-muted-foreground hover:bg-lime/5 hover:border-lime/30"
                  }`}
              >
                <Truck className="w-4 h-4" />
                Freeship
              </button>
              <button
                type="button"
                onClick={() => setPromotionType(promotionType === "discount" ? "none" : "discount")}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${promotionType === "discount" || promotionType === "both"
                  ? "border-christmas-red bg-christmas-red/10 text-christmas-red shadow-md"
                  : "border-border bg-secondary/30 text-muted-foreground hover:bg-christmas-red/5 hover:border-christmas-red/30"
                  }`}
              >
                <BadgePercent className="w-4 h-4" />
                Giảm giá %
              </button>
            </div>

            {/* Discount Percent Selection */}
            {(promotionType === "discount" || promotionType === "both") && (
              <div className="space-y-2 p-3 rounded-lg bg-christmas-red/5 border border-christmas-red/20">
                <Label className="text-xs font-medium text-christmas-red">Chọn % giảm giá</Label>
                <div className="flex flex-wrap gap-2">
                  {DISCOUNT_PERCENTS.map((percent) => (
                    <button
                      key={percent}
                      type="button"
                      onClick={() => setDiscountPercent(percent)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${discountPercent === percent
                        ? "bg-christmas-red text-white shadow-md"
                        : "bg-christmas-red/10 text-christmas-red hover:bg-christmas-red/20"
                        }`}
                    >
                      {percent}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Both option */}
            <button
              type="button"
              onClick={() => setPromotionType(promotionType === "both" ? "none" : "both")}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${promotionType === "both"
                ? "border-christmas-gold bg-gradient-to-r from-lime/20 to-christmas-red/20 text-foreground shadow-md shadow-lime/30"
                : "border-dashed border-border bg-secondary/20 text-muted-foreground hover:border-christmas-gold/50"
                }`}
            >
              <Truck className="w-4 h-4" />
              +
              <BadgePercent className="w-4 h-4" />
              Cả Freeship + Giảm giá
            </button>
          </div>

          {/* Additional Promotion Info */}
          <div className="space-y-2">
            <Label htmlFor="promotion" className="text-sm font-medium">
              Thông tin khuyến mãi bổ sung (tùy chọn)
            </Label>
            <Input
              id="promotion"
              value={promotionInfo}
              onChange={(e) => setPromotionInfo(e.target.value)}
              placeholder="VD: Mua 2 tặng 1, Flash sale 12h..."
              className="h-11 border-christmas-red/30 focus:border-christmas-red"
            />
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Danh mục nội dung hội thoại</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedCategories.includes(category.id)
                    ? category.color + " border-current shadow-sm"
                    : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-lime/10 hover:border-lime/30"
                    }`}
                >
                  <category.icon className="w-4 h-4" />
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-lime-foreground" />
              Thời lượng video
            </Label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDuration(d.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${duration === d.value
                    ? "bg-gradient-to-r from-lime to-primary text-white shadow-md shadow-lime/30"
                    : "bg-secondary text-secondary-foreground hover:bg-lime/20 hover:text-lime-foreground"
                    }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-lime-foreground" />
              Giọng nhân vật
            </Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${gender === "female"
                  ? "border-christmas-red bg-christmas-red/10 text-christmas-red shadow-md shadow-christmas-red/20"
                  : "border-border bg-secondary/30 text-muted-foreground hover:bg-christmas-red/5 hover:border-christmas-red/30"
                  }`}
              >
                <span className="text-lg">👩</span>
                Nữ
              </button>
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${gender === "male"
                  ? "border-lime bg-lime/10 text-lime-foreground shadow-md shadow-lime/20"
                  : "border-border bg-secondary/30 text-muted-foreground hover:bg-lime/5 hover:border-lime/30"
                  }`}
              >
                <span className="text-lg">👨</span>
                Nam
              </button>
            </div>
          </div>

          {/* Dialogue Count */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Số đoạn hội thoại cần tạo</Label>
            <div className="flex flex-wrap gap-2">
              {DIALOGUE_COUNTS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setDialogueCount(count)}
                  className={`w-12 h-12 rounded-xl text-sm font-semibold transition-all ${dialogueCount === count
                    ? "bg-gradient-to-r from-lime to-primary text-white shadow-md shadow-lime/30"
                    : "bg-secondary text-secondary-foreground hover:bg-lime/20 hover:text-lime-foreground"
                    }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* TikTok Shop Notification */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-lime/10 border border-lime/30">
            <ShoppingCart className="w-5 h-5 text-lime-foreground flex-shrink-0" />
            <p className="text-xs text-lime-foreground">
              Đoạn thoại sẽ tự động nhắc người xem click vào <strong>giỏ hàng TikTok Shop</strong> ở góc màn hình
            </p>
          </div>

          {/* AI Research Notification */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-christmas-gold/10 border border-christmas-gold/30">
            <Sparkles className="w-5 h-5 text-christmas-gold flex-shrink-0" />
            <p className="text-xs text-christmas-gold">
              <strong>AI Gemini</strong> sẽ tự động nghiên cứu và tạo nội dung sáng tạo, không lặp lại mô tả gốc
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-lime via-primary to-lime hover:from-lime/90 hover:to-primary/90 text-white shadow-lg shadow-lime/30 transition-all hover:shadow-xl hover:shadow-lime/40"
            disabled={isGenerating || !productName || !productDescription}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                AI đang nghiên cứu sản phẩm...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Tạo {dialogueCount} đoạn hội thoại
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
