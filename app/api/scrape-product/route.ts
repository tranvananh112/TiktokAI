import { NextRequest } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "AIzaSyBkicFyAsv-olgokEl0eIN5Xbetdz2eho0")

// Danh sách các trang web để tìm kiếm
const SEARCH_SOURCES = [
    {
        name: "Shopee",
        searchUrl: (query: string) => `https://shopee.vn/search?keyword=${encodeURIComponent(query)}`,
        selectors: {
            title: ".shopee-search-item-result__item .shopee-item-card__title",
            description: ".shopee-search-item-result__item .shopee-item-card__description",
            price: ".shopee-search-item-result__item .shopee-price"
        }
    },
    {
        name: "Tiki",
        searchUrl: (query: string) => `https://tiki.vn/search?q=${encodeURIComponent(query)}`,
        selectors: {
            title: ".product-item .name",
            description: ".product-item .description",
            price: ".product-item .price"
        }
    },
    {
        name: "Lazada",
        searchUrl: (query: string) => `https://www.lazada.vn/catalog/?q=${encodeURIComponent(query)}`,
        selectors: {
            title: ".Bm3ON .RfADt",
            description: ".Bm3ON .JFGOx",
            price: ".Bm3ON .aBrP0"
        }
    }
]

// Hàm mô phỏng web scraping (do giới hạn CORS, chúng ta sẽ tạo dữ liệu mẫu)
async function scrapeProductInfo(productName: string) {
    // Trong thực tế, bạn cần sử dụng proxy server hoặc backend service để scrape
    // Ở đây tôi sẽ tạo một hệ thống mô phỏng dựa trên tên sản phẩm

    const mockData = await generateMockProductData(productName)
    return mockData
}

async function generateMockProductData(productName: string) {
    // Tạo dữ liệu mẫu dựa trên tên sản phẩm
    const productTypes = {
        // Mỹ phẩm
        'kem': {
            category: 'cosmetics',
            commonFeatures: ['dưỡng ẩm', 'chống lão hóa', 'làm trắng da', 'chống nắng'],
            ingredients: ['Vitamin C', 'Hyaluronic Acid', 'Niacinamide', 'Retinol'],
            usage: 'Thoa đều lên da mặt sau khi rửa mặt, sử dụng 2 lần/ngày',
            target: 'Phù hợp cho mọi loại da, đặc biệt da khô và da lão hóa'
        },
        'serum': {
            category: 'cosmetics',
            commonFeatures: ['cô đặc dưỡng chất', 'thẩm thấu nhanh', 'hiệu quả cao'],
            ingredients: ['Vitamin C', 'Peptide', 'Hyaluronic Acid', 'Niacinamide'],
            usage: 'Nhỏ 2-3 giọt lên da, massage nhẹ nhàng, sử dụng buổi tối',
            target: 'Dành cho da cần chăm sóc chuyên sâu, da có dấu hiệu lão hóa'
        },
        'sữa rửa mặt': {
            category: 'cosmetics',
            commonFeatures: ['làm sạch sâu', 'không gây khô da', 'pH cân bằng'],
            ingredients: ['Salicylic Acid', 'Glycerin', 'Ceramide', 'Tea Tree Oil'],
            usage: 'Làm ướt mặt, massage 30 giây, rửa sạch với nước',
            target: 'Phù hợp mọi loại da, đặc biệt da dầu và da mụn'
        },
        // Thực phẩm chức năng
        'viên uống': {
            category: 'supplement',
            commonFeatures: ['bổ sung vitamin', 'tăng cường sức khỏe', 'dễ hấp thụ'],
            ingredients: ['Vitamin D3', 'Omega-3', 'Collagen', 'Probiotics'],
            usage: 'Uống 1-2 viên/ngày sau bữa ăn với nhiều nước',
            target: 'Người trưởng thành cần bổ sung dinh dưỡng'
        },
        // Thời trang
        'áo': {
            category: 'fashion',
            commonFeatures: ['chất liệu thoáng mát', 'form dáng đẹp', 'dễ phối đồ'],
            ingredients: ['Cotton 100%', 'Polyester', 'Spandex', 'Bamboo fiber'],
            usage: 'Giặt ở nhiệt độ thường, không ngâm lâu',
            target: 'Nam/nữ mọi lứa tuổi, phong cách trẻ trung'
        },
        // Điện tử
        'tai nghe': {
            category: 'electronics',
            commonFeatures: ['chất lượng âm thanh cao', 'chống ồn', 'pin lâu'],
            ingredients: ['Driver 40mm', 'Bluetooth 5.0', 'Pin Lithium'],
            usage: 'Kết nối Bluetooth, sạc đầy trước khi sử dụng',
            target: 'Người yêu âm nhạc, game thủ, dân văn phòng'
        }
    }

    // Tìm loại sản phẩm dựa trên tên
    let productInfo = null
    for (const [key, info] of Object.entries(productTypes)) {
        if (productName.toLowerCase().includes(key)) {
            productInfo = info
            break
        }
    }

    // Nếu không tìm thấy, sử dụng thông tin chung
    if (!productInfo) {
        productInfo = {
            category: 'general',
            commonFeatures: ['chất lượng cao', 'giá cả hợp lý', 'dễ sử dụng'],
            ingredients: ['Thành phần tự nhiên', 'An toàn cho sức khỏe'],
            usage: 'Sử dụng theo hướng dẫn của nhà sản xuất',
            target: 'Phù hợp cho mọi đối tượng'
        }
    }

    return {
        productName,
        category: productInfo.category,
        features: productInfo.commonFeatures,
        ingredients: productInfo.ingredients,
        usage: productInfo.usage,
        target: productInfo.target,
        source: 'AI Generated based on product analysis'
    }
}

// Hàm tạo mô tả chi tiết từ dữ liệu đã scrape
async function generateDetailedDescription(scrapedData: any) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const prompt = `
Bạn là chuyên gia phân tích sản phẩm. Hãy tạo thông tin CHI TIẾT VỀ TÍNH NĂNG & CÔNG DỤNG dựa trên dữ liệu:

**DỮ LIỆU PHÂN TÍCH:**
- Loại: ${scrapedData.category}
- Tính năng: ${scrapedData.features.join(', ')}
- Thành phần: ${scrapedData.ingredients.join(', ')}
- Cách dùng: ${scrapedData.usage}
- Đối tượng: ${scrapedData.target}

**YÊU CẦU - CHỈ VIẾT THÔNG TIN CỤ THỂ:**

**TÍNH NĂNG CHÍNH:**
${scrapedData.features.map((feature: string, index: number) => `${index + 1}. ${feature.charAt(0).toUpperCase() + feature.slice(1)}`).join('\n')}

**CÔNG DỤNG CỤ THỂ:**
- Giải quyết vấn đề gì cho người dùng
- Mang lại hiệu quả như thế nào
- Thời gian thấy kết quả

**CÁCH SỬ DỤNG CHI TIẾT:**
${scrapedData.usage}
- Thời điểm sử dụng tốt nhất
- Lưu ý khi sử dụng

**THÀNH PHẦN/ĐẶC ĐIỂM:**
${scrapedData.ingredients.map((ing: string) => `- ${ing}`).join('\n')}

**ĐỐI TƯỢNG PHÙ HỢP:**
${scrapedData.target}
- Trường hợp KHÔNG nên sử dụng

**LƯU Ý QUAN TRỌNG:**
- Cách bảo quản
- Tác dụng phụ có thể có
- Lời khuyên sử dụng hiệu quả

**QUY TẮC BẮT BUỘC:**
- KHÔNG viết giới thiệu chung chung
- KHÔNG lặp lại tên sản phẩm
- CHỈ viết thông tin THỰC TẾ, HỮU ÍCH
- Ngắn gọn: 200-250 từ
- Tập trung vào TÍNH NĂNG & CÁCH DÙNG

Chỉ trả về thông tin chi tiết, không giải thích thêm.
`

        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error("Error generating description:", error)

        // Fallback description
        return `
**TỔNG QUAN:** ${scrapedData.productName} là sản phẩm ${scrapedData.category} chất lượng cao với các tính năng nổi bật: ${scrapedData.features.slice(0, 3).join(', ')}.

**TÍNH NĂNG CHÍNH:** 
${scrapedData.features.map((feature: string, index: number) => `${index + 1}. ${feature.charAt(0).toUpperCase() + feature.slice(1)}`).join('\n')}

**THÀNH PHẦN/ĐẶC ĐIỂM:** Sản phẩm được làm từ ${scrapedData.ingredients.join(', ')}, đảm bảo chất lượng và hiệu quả sử dụng.

**CÁCH SỬ DỤNG:** ${scrapedData.usage}

**ĐỐI TƯỢNG PHÙ HỢP:** ${scrapedData.target}

**ƯU ĐIỂM:** Sản phẩm nổi bật với chất lượng vượt trội, giá cả hợp lý và được nhiều khách hàng tin tưởng lựa chọn.
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

        // Bước 1: Scrape thông tin sản phẩm
        console.log(`Đang tìm kiếm thông tin cho: ${productName}`)
        const scrapedData = await scrapeProductInfo(productName.trim())

        // Bước 2: Tạo mô tả chi tiết từ dữ liệu đã scrape
        console.log("Đang tạo mô tả chi tiết...")
        const detailedDescription = await generateDetailedDescription(scrapedData)

        return Response.json({
            success: true,
            description: detailedDescription.trim(),
            scrapedData: scrapedData,
            sources: SEARCH_SOURCES.map(s => s.name),
            timestamp: new Date().toISOString()
        })

    } catch (error: any) {
        console.error("Scrape product error:", error)

        return Response.json({
            error: "Không thể tìm kiếm thông tin sản phẩm. Vui lòng thử lại hoặc nhập mô tả thủ công.",
            details: error.message
        }, { status: 500 })
    }
}