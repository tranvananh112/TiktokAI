// Web Scraper Service cho việc tìm kiếm thông tin sản phẩm

export interface ProductInfo {
    name: string
    description: string
    price?: string
    features: string[]
    specifications: string[]
    images?: string[]
    source: string
    url: string
}

export interface ScrapingResult {
    success: boolean
    data: ProductInfo[]
    errors: string[]
}

// Danh sách các trang web hỗ trợ scraping
const SUPPORTED_SITES = [
    {
        name: 'Shopee',
        domain: 'shopee.vn',
        searchUrl: (query: string) => `https://shopee.vn/search?keyword=${encodeURIComponent(query)}`,
        selectors: {
            productCard: '[data-sqe="item"]',
            title: '[data-sqe="name"]',
            price: '.shopee-price',
            image: '.shopee-image__wrapper img',
            link: 'a'
        }
    },
    {
        name: 'Tiki',
        domain: 'tiki.vn',
        searchUrl: (query: string) => `https://tiki.vn/search?q=${encodeURIComponent(query)}`,
        selectors: {
            productCard: '.product-item',
            title: '.name',
            price: '.price-discount__price',
            image: '.product-item img',
            link: 'a'
        }
    },
    {
        name: 'Lazada',
        domain: 'lazada.vn',
        searchUrl: (query: string) => `https://www.lazada.vn/catalog/?q=${encodeURIComponent(query)}`,
        selectors: {
            productCard: '[data-qa-locator="product-item"]',
            title: '[data-qa-locator="product-item-title"]',
            price: '.price',
            image: '.item-img img',
            link: 'a'
        }
    }
]

// Hàm mô phỏng scraping (do giới hạn CORS và cần proxy)
export async function scrapeProductInfo(productName: string): Promise<ScrapingResult> {
    try {
        // Trong môi trường thực tế, bạn cần:
        // 1. Sử dụng proxy server
        // 2. Cài đặt Puppeteer hoặc Playwright
        // 3. Xử lý CAPTCHA và rate limiting

        const mockResults = await generateMockScrapingResults(productName)

        return {
            success: true,
            data: mockResults,
            errors: []
        }
    } catch (error) {
        return {
            success: false,
            data: [],
            errors: [error instanceof Error ? error.message : 'Unknown error']
        }
    }
}

// Hàm tạo kết quả mô phỏng dựa trên phân tích tên sản phẩm
async function generateMockScrapingResults(productName: string): Promise<ProductInfo[]> {
    const results: ProductInfo[] = []

    // Phân tích loại sản phẩm
    const productAnalysis = analyzeProductType(productName)

    // Tạo kết quả cho mỗi trang web
    for (const site of SUPPORTED_SITES) {
        const mockProduct: ProductInfo = {
            name: generateProductVariation(productName),
            description: generateProductDescription(productName, productAnalysis),
            price: generateMockPrice(productAnalysis.category),
            features: generateFeatures(productAnalysis),
            specifications: generateSpecifications(productAnalysis),
            images: [`https://via.placeholder.com/300x300?text=${encodeURIComponent(productName)}`],
            source: site.name,
            url: site.searchUrl(productName)
        }

        results.push(mockProduct)
    }

    return results
}

// Phân tích loại sản phẩm dựa trên tên
function analyzeProductType(productName: string) {
    const name = productName.toLowerCase()

    // Mỹ phẩm
    if (name.includes('kem') || name.includes('serum') || name.includes('sữa rửa mặt') ||
        name.includes('toner') || name.includes('mask') || name.includes('son')) {
        return {
            category: 'cosmetics',
            priceRange: [50000, 500000],
            commonIngredients: ['Vitamin C', 'Hyaluronic Acid', 'Niacinamide', 'Retinol', 'AHA/BHA'],
            features: ['dưỡng ẩm', 'chống lão hóa', 'làm trắng da', 'chống nắng', 'se khít lỗ chân lông']
        }
    }

    // Thực phẩm chức năng
    if (name.includes('viên uống') || name.includes('vitamin') || name.includes('collagen') ||
        name.includes('omega') || name.includes('probiotics')) {
        return {
            category: 'supplement',
            priceRange: [100000, 800000],
            commonIngredients: ['Vitamin D3', 'Omega-3', 'Collagen', 'Probiotics', 'Magnesium'],
            features: ['bổ sung dinh dưỡng', 'tăng cường miễn dịch', 'hỗ trợ tiêu hóa', 'chống oxy hóa']
        }
    }

    // Thời trang
    if (name.includes('áo') || name.includes('quần') || name.includes('váy') ||
        name.includes('giày') || name.includes('túi')) {
        return {
            category: 'fashion',
            priceRange: [100000, 1000000],
            commonIngredients: ['Cotton', 'Polyester', 'Spandex', 'Denim', 'Silk'],
            features: ['thoáng mát', 'co giãn', 'form đẹp', 'dễ phối đồ', 'bền màu']
        }
    }

    // Điện tử
    if (name.includes('tai nghe') || name.includes('điện thoại') || name.includes('laptop') ||
        name.includes('chuột') || name.includes('bàn phím')) {
        return {
            category: 'electronics',
            priceRange: [200000, 5000000],
            commonIngredients: ['Bluetooth 5.0', 'USB-C', 'Lithium Battery', 'LED Display'],
            features: ['chất lượng cao', 'pin lâu', 'kết nối ổn định', 'thiết kế đẹp']
        }
    }

    // Mặc định
    return {
        category: 'general',
        priceRange: [50000, 500000],
        commonIngredients: ['Chất liệu cao cấp', 'Công nghệ hiện đại'],
        features: ['chất lượng tốt', 'giá cả hợp lý', 'dễ sử dụng']
    }
}

// Tạo biến thể tên sản phẩm
function generateProductVariation(originalName: string): string {
    const variations = [
        `${originalName} Premium`,
        `${originalName} Pro`,
        `${originalName} Plus`,
        `${originalName} Advanced`,
        originalName
    ]

    return variations[Math.floor(Math.random() * variations.length)]
}

// Tạo mô tả sản phẩm
function generateProductDescription(productName: string, analysis: any): string {
    const templates = {
        cosmetics: `${productName} là sản phẩm chăm sóc da cao cấp với công thức độc quyền. Sản phẩm giúp ${analysis.features.slice(0, 3).join(', ')} hiệu quả. Thành phần chính bao gồm ${analysis.commonIngredients.slice(0, 3).join(', ')} được chứng minh an toàn và hiệu quả.`,

        supplement: `${productName} là thực phẩm chức năng chất lượng cao, bổ sung các dưỡng chất thiết yếu cho cơ thể. Sản phẩm ${analysis.features.slice(0, 2).join(' và ')}, chứa ${analysis.commonIngredients.slice(0, 2).join(', ')} cần thiết cho sức khỏe.`,

        fashion: `${productName} với thiết kế hiện đại, chất liệu ${analysis.commonIngredients[0]} cao cấp. Sản phẩm ${analysis.features.slice(0, 3).join(', ')}, phù hợp cho nhiều dịp khác nhau.`,

        electronics: `${productName} là sản phẩm công nghệ tiên tiến với ${analysis.features.slice(0, 2).join(' và ')}. Tích hợp ${analysis.commonIngredients.slice(0, 2).join(', ')}, mang lại trải nghiệm tuyệt vời cho người dùng.`,

        general: `${productName} là sản phẩm chất lượng cao với nhiều tính năng ưu việt. Sản phẩm ${analysis.features.join(', ')}, đáp ứng nhu cầu đa dạng của khách hàng.`
    }

    return templates[analysis.category as keyof typeof templates] || templates.general
}

// Tạo giá mô phỏng
function generateMockPrice(category: string): string {
    const ranges = {
        cosmetics: [50000, 500000],
        supplement: [100000, 800000],
        fashion: [100000, 1000000],
        electronics: [200000, 5000000],
        general: [50000, 500000]
    }

    const range = ranges[category as keyof typeof ranges] || ranges.general
    const price = Math.floor(Math.random() * (range[1] - range[0]) + range[0])

    return `${price.toLocaleString('vi-VN')}đ`
}

// Tạo danh sách tính năng
function generateFeatures(analysis: any): string[] {
    return analysis.features.slice(0, 5)
}

// Tạo thông số kỹ thuật
function generateSpecifications(analysis: any): string[] {
    const specs = []

    if (analysis.category === 'cosmetics') {
        specs.push(`Thành phần: ${analysis.commonIngredients.join(', ')}`)
        specs.push('Dung tích: 30ml - 50ml')
        specs.push('Xuất xứ: Hàn Quốc/Nhật Bản')
        specs.push('Hạn sử dụng: 3 năm')
    } else if (analysis.category === 'electronics') {
        specs.push('Kết nối: Bluetooth 5.0')
        specs.push('Pin: 8-12 giờ')
        specs.push('Bảo hành: 12 tháng')
        specs.push('Trọng lượng: 200-500g')
    } else {
        specs.push(`Chất liệu: ${analysis.commonIngredients[0]}`)
        specs.push('Kích thước: Đa dạng')
        specs.push('Màu sắc: Nhiều lựa chọn')
        specs.push('Bảo hành: 6-12 tháng')
    }

    return specs
}

// Hàm để thực hiện scraping thực sự (cần cài đặt thêm)
export async function realWebScraping(productName: string): Promise<ScrapingResult> {
    // Đây là nơi bạn sẽ implement scraping thực sự
    // Cần cài đặt: npm install puppeteer hoặc playwright

    /*
    const puppeteer = require('puppeteer');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set user agent để tránh bị block
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    const results = [];
    
    for (const site of SUPPORTED_SITES) {
      try {
        await page.goto(site.searchUrl(productName), { waitUntil: 'networkidle2' });
        
        const products = await page.evaluate((selectors) => {
          const items = document.querySelectorAll(selectors.productCard);
          return Array.from(items).slice(0, 5).map(item => ({
            name: item.querySelector(selectors.title)?.textContent?.trim(),
            price: item.querySelector(selectors.price)?.textContent?.trim(),
            image: item.querySelector(selectors.image)?.src,
            link: item.querySelector(selectors.link)?.href
          }));
        }, site.selectors);
        
        results.push(...products);
      } catch (error) {
        console.error(`Error scraping ${site.name}:`, error);
      }
    }
    
    await browser.close();
    return { success: true, data: results, errors: [] };
    */

    // Tạm thời return mock data
    return scrapeProductInfo(productName)
}