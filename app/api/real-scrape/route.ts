import { NextRequest } from "next/server"
import * as cheerio from "cheerio"
import axios from "axios"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

interface ScrapedProduct {
    name: string
    price?: string
    description?: string
    features: string[]
    source: string
    url: string
}

// Cấu hình các trang web để scrape
const SCRAPE_CONFIGS = [
    {
        name: "Shopee",
        searchUrl: (query: string) => `https://shopee.vn/search?keyword=${encodeURIComponent(query)}`,
        selectors: {
            productCards: '[data-sqe="item"]',
            title: '[data-sqe="name"]',
            price: '.shopee-price',
            description: '.shopee-item-card__description',
            link: 'a'
        },
        maxResults: 3
    },
    {
        name: "Tiki",
        searchUrl: (query: string) => `https://tiki.vn/search?q=${encodeURIComponent(query)}`,
        selectors: {
            productCards: '.product-item',
            title: '.name',
            price: '.price-discount__price',
            description: '.item-brand',
            link: 'a'
        },
        maxResults: 3
    }
]

// Hàm scrape với Axios + Cheerio (chính)
async function scrapeProducts(productName: string): Promise<ScrapedProduct[]> {
    const results: ScrapedProduct[] = []

    for (const config of SCRAPE_CONFIGS) {
        try {
            console.log(`Scraping ${config.name} for: ${productName}`)

            const response = await axios.get(config.searchUrl(productName), {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                },
                timeout: 10000
            })

            const $ = cheerio.load(response.data)
            const products: ScrapedProduct[] = []

            $(config.selectors.productCards).slice(0, config.maxResults).each((i, element) => {
                const $el = $(element)
                const name = $el.find(config.selectors.title).text().trim()
                const price = $el.find(config.selectors.price).text().trim()
                const link = $el.find(config.selectors.link).attr('href') || ''

                if (name) {
                    products.push({
                        name,
                        price,
                        description: '',
                        features: [],
                        source: config.name,
                        url: link.startsWith('http') ? link : `https://${config.name.toLowerCase()}.vn${link}`
                    })
                }
            })

            results.push(...products)
            console.log(`Found ${products.length} products from ${config.name}`)

        } catch (error) {
            console.error(`Error scraping ${config.name}:`, error)
        }
    }

    return results
}



// Hàm tạo mô tả từ dữ liệu đã scrape
async function generateDescriptionFromScrapedData(productName: string, scrapedProducts: ScrapedProduct[]): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const productList = scrapedProducts.map(p =>
            `- ${p.name} (${p.price}) từ ${p.source}`
        ).join('\n')

        const prompt = `
Bạn là chuyên gia phân tích sản phẩm. Dựa trên dữ liệu THỰC TẾ từ ${scrapedProducts.length} sản phẩm đã scrape, hãy tạo thông tin CHI TIẾT VỀ TÍNH NĂNG & CÔNG DỤNG cho: "${productName}"

**DỮ LIỆU THỰC TẾ ĐÃ THU THẬP:**
${productList}

**YÊU CẦU - CHỈ TẬP TRUNG VÀO:**

**1. TÍNH NĂNG CHÍNH:**
- Liệt kê 4-5 tính năng cụ thể của sản phẩm này
- Dựa trên phân tích tên sản phẩm thực tế đã tìm thấy
- VD: "Chống nắng SPF50+", "Dưỡng ẩm 24h", "Kháng khuẩn"

**2. CÔNG DỤNG CỤ THỂ:**
- Sản phẩm này GIẢI QUYẾT vấn đề gì?
- Mang lại lợi ích gì cho người dùng?
- Hiệu quả như thế nào?

**3. CÁCH SỬ DỤNG:**
- Hướng dẫn sử dụng từng bước
- Thời điểm sử dụng (sáng/tối/khi nào)
- Liều lượng/số lần sử dụng
- Lưu ý khi sử dụng

**4. THÀNH PHẦN/ĐẶC ĐIỂM KỸ THUẬT:**
- Thành phần hoạt tính chính (nếu là mỹ phẩm/thực phẩm)
- Thông số kỹ thuật (nếu là điện tử)
- Chất liệu/kích thước (nếu là thời trang/gia dụng)

**5. ĐỐI TƯỢNG SỬ DỤNG:**
- Ai nên dùng sản phẩm này?
- Loại da/nhu cầu/độ tuổi phù hợp
- Trường hợp nào KHÔNG nên dùng

**QUAN TRỌNG:**
- KHÔNG viết giới thiệu chung chung
- KHÔNG lặp lại tên sản phẩm nhiều lần
- TẬP TRUNG vào thông tin THỰC TẾ, HỮU ÍCH
- Viết ngắn gọn, súc tích, dễ hiểu
- Tổng cộng 200-250 từ

Chỉ trả về thông tin cụ thể, không giải thích thêm.
`

        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()

    } catch (error) {
        console.error("Error generating description:", error)

        // Fallback description
        const avgPrice = scrapedProducts.length > 0 ?
            scrapedProducts.filter(p => p.price).map(p => p.price).join(', ') : 'Đa dạng'

        return `
**TỔNG QUAN:** ${productName} là sản phẩm được bán phổ biến trên các sàn thương mại điện tử Việt Nam.

**THÔNG TIN THỊ TRƯỜNG:** 
- Số lượng sản phẩm tìm thấy: ${scrapedProducts.length}
- Khoảng giá: ${avgPrice}
- Nguồn: ${scrapedProducts.map(p => p.source).join(', ')}

**TÍNH NĂNG:** Dựa trên dữ liệu thực tế từ ${scrapedProducts.length} sản phẩm tương tự được tìm thấy trên thị trường.

**KHUYẾN NGHỊ:** Nên so sánh giá cả và đánh giá từ nhiều nguồn trước khi quyết định mua.
`
    }
}

export async function POST(request: NextRequest) {
    try {
        const { productName } = await request.json()

        if (!productName || productName.trim().length < 2) {
            return Response.json({
                error: "Tên sản phẩm quá ngắn. Vui lòng nhập ít nhất 2 ký tự."
            }, { status: 400 })
        }

        console.log(`Starting real scraping for: ${productName}`)

        // Scrape với Axios + Cheerio
        const scrapedProducts = await scrapeProducts(productName.trim())

        // Tạo mô tả từ dữ liệu đã scrape
        const description = await generateDescriptionFromScrapedData(productName, scrapedProducts)

        return Response.json({
            success: true,
            description: description.trim(),
            scrapedData: scrapedProducts,
            totalFound: scrapedProducts.length,
            sources: [...new Set(scrapedProducts.map(p => p.source))],
            timestamp: new Date().toISOString(),
            method: 'axios-cheerio'
        })

    } catch (error: any) {
        console.error("Real scrape error:", error)

        return Response.json({
            error: "Không thể scrape dữ liệu thực tế. Vui lòng thử lại.",
            details: error.message,
            fallback: true
        }, { status: 500 })
    }
}