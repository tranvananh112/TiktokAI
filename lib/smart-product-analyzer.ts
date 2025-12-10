// Hệ thống phân tích sản phẩm thông minh
export interface ProductAnalysis {
    category: string
    targetAudience: string[]
    keyBenefits: string[]
    painPoints: string[]
    emotionalTriggers: string[]
    competitiveAdvantages: string[]
    usageScenarios: string[]
    priceRange: string
    seasonality: string
    marketTrend: string
}

export interface SmartDialogueStrategy {
    hook: string
    problemStatement: string
    solutionPresentation: string
    proofPoints: string[]
    emotionalConnection: string
    callToAction: string
    urgencyFactor: string
}

// Cơ sở dữ liệu kiến thức sản phẩm
const PRODUCT_KNOWLEDGE_BASE = {
    // Mỹ phẩm & Làm đẹp
    beauty: {
        keywords: ['kem', 'serum', 'mặt nạ', 'son', 'phấn', 'nước hoa', 'dưỡng', 'chống nắng', 'tẩy trang', 'sữa rửa mặt'],
        painPoints: ['da khô', 'mụn', 'nám', 'lão hóa', 'da nhạy cảm', 'da dầu', 'thâm', 'nhăn'],
        benefits: ['dưỡng ẩm', 'trắng da', 'chống lão hóa', 'se khít lỗ chân lông', 'làm mịn da'],
        emotions: ['tự tin', 'xinh đẹp', 'trẻ trung', 'quyến rũ', 'hoàn hảo'],
        audience: ['phụ nữ 18-45', 'người yêu làm đẹp', 'da có vấn đề', 'muốn trẻ hóa']
    },

    // Thời trang
    fashion: {
        keywords: ['áo', 'quần', 'váy', 'giày', 'túi', 'phụ kiện', 'đồng hồ', 'trang sức'],
        painPoints: ['không có gì mặc', 'style cũ kỹ', 'không tự tin', 'không hợp xu hướng'],
        benefits: ['thời trang', 'nổi bật', 'phong cách', 'chất lượng cao', 'bền đẹp'],
        emotions: ['phong cách', 'cá tính', 'nổi bật', 'sang trọng', 'trendy'],
        audience: ['giới trẻ', 'người yêu thời trang', 'công sở', 'dự tiệc']
    },

    // Công nghệ
    tech: {
        keywords: ['điện thoại', 'laptop', 'tai nghe', 'sạc', 'ốp lưng', 'máy tính', 'camera'],
        painPoints: ['thiết bị cũ', 'chậm', 'hỏng', 'pin yếu', 'không đủ tính năng'],
        benefits: ['hiệu năng cao', 'pin trâu', 'camera đẹp', 'bảo mật', 'tiện lợi'],
        emotions: ['hiện đại', 'thông minh', 'tiện lợi', 'chuyên nghiệp', 'đẳng cấp'],
        audience: ['tech lover', 'dân văn phòng', 'game thủ', 'nhiếp ảnh gia']
    },

    // Gia dụng
    home: {
        keywords: ['nồi', 'chảo', 'máy', 'bình', 'ly', 'chén', 'dao', 'thớt', 'tủ', 'giường'],
        painPoints: ['nhà bừa bộn', 'nấu ăn khó', 'không gian chật', 'đồ dùng cũ'],
        benefits: ['tiện lợi', 'tiết kiệm thời gian', 'bền đẹp', 'đa năng', 'an toàn'],
        emotions: ['ấm cúng', 'hạnh phúc', 'tiện nghi', 'sang trọng', 'hoàn hảo'],
        audience: ['gia đình', 'người nội trợ', 'vợ chồng trẻ', 'người yêu nấu ăn']
    },

    // Sức khỏe
    health: {
        keywords: ['vitamin', 'thực phẩm chức năng', 'thuốc', 'máy massage', 'dụng cụ y tế'],
        painPoints: ['mệt mỏi', 'sức khỏe kém', 'thiếu vitamin', 'đau nhức', 'stress'],
        benefits: ['tăng sức khỏe', 'bổ sung dinh dưỡng', 'giảm đau', 'thư giãn', 'phòng bệnh'],
        emotions: ['khỏe mạnh', 'năng động', 'yên tâm', 'tự tin', 'hạnh phúc'],
        audience: ['người cao tuổi', 'người bận rộn', 'vận động viên', 'gia đình có con nhỏ']
    }
}

// Phân tích danh mục sản phẩm
export function analyzeProductCategory(productName: string): string {
    const name = productName.toLowerCase()

    for (const [category, data] of Object.entries(PRODUCT_KNOWLEDGE_BASE)) {
        if (data.keywords.some(keyword => name.includes(keyword))) {
            return category
        }
    }

    return 'general'
}

// Phân tích sản phẩm thông minh
export function analyzeProduct(productName: string, description?: string): ProductAnalysis {
    const category = analyzeProductCategory(productName)
    const categoryData = PRODUCT_KNOWLEDGE_BASE[category as keyof typeof PRODUCT_KNOWLEDGE_BASE]

    if (!categoryData) {
        return {
            category: 'general',
            targetAudience: ['người tiêu dùng'],
            keyBenefits: ['chất lượng tốt', 'giá cả hợp lý'],
            painPoints: ['nhu cầu sử dụng'],
            emotionalTriggers: ['hài lòng', 'tin tưởng'],
            competitiveAdvantages: ['uy tín', 'chất lượng'],
            usageScenarios: ['sử dụng hàng ngày'],
            priceRange: 'trung bình',
            seasonality: 'quanh năm',
            marketTrend: 'ổn định'
        }
    }

    // Phân tích giá từ tên sản phẩm
    const priceRange = analyzePriceRange(productName)

    // Phân tích xu hướng thị trường
    const marketTrend = analyzeMarketTrend(productName, category)

    return {
        category,
        targetAudience: categoryData.audience,
        keyBenefits: categoryData.benefits,
        painPoints: categoryData.painPoints,
        emotionalTriggers: categoryData.emotions,
        competitiveAdvantages: generateCompetitiveAdvantages(productName, category),
        usageScenarios: generateUsageScenarios(productName, category),
        priceRange,
        seasonality: analyzeSeasonality(productName),
        marketTrend
    }
}

// Phân tích khoảng giá
function analyzePriceRange(productName: string): string {
    const name = productName.toLowerCase()

    if (name.includes('cao cấp') || name.includes('premium') || name.includes('luxury')) {
        return 'cao cấp'
    }
    if (name.includes('rẻ') || name.includes('giá sốc') || name.includes('sale')) {
        return 'bình dân'
    }

    return 'trung bình'
}

// Phân tích xu hướng thị trường
function analyzeMarketTrend(productName: string, category: string): string {
    const name = productName.toLowerCase()

    if (name.includes('mới') || name.includes('2024') || name.includes('2025') || name.includes('hot')) {
        return 'đang hot'
    }
    if (name.includes('trending') || name.includes('viral') || name.includes('xu hướng')) {
        return 'xu hướng'
    }

    return 'ổn định'
}

// Phân tích tính mùa vụ
function analyzeSeasonality(productName: string): string {
    const name = productName.toLowerCase()

    if (name.includes('hè') || name.includes('chống nắng') || name.includes('mát')) {
        return 'mùa hè'
    }
    if (name.includes('đông') || name.includes('ấm') || name.includes('giữ nhiệt')) {
        return 'mùa đông'
    }
    if (name.includes('tết') || name.includes('xuân')) {
        return 'tết nguyên đán'
    }

    return 'quanh năm'
}

// Tạo lợi thế cạnh tranh
function generateCompetitiveAdvantages(productName: string, category: string): string[] {
    const advantages = ['chất lượng cao', 'giá cả hợp lý', 'uy tín thương hiệu']

    if (category === 'beauty') {
        advantages.push('thành phần tự nhiên', 'không gây kích ứng', 'hiệu quả nhanh')
    } else if (category === 'tech') {
        advantages.push('công nghệ tiên tiến', 'bảo hành dài hạn', 'hỗ trợ 24/7')
    } else if (category === 'fashion') {
        advantages.push('thiết kế độc đáo', 'chất liệu cao cấp', 'theo xu hướng')
    }

    return advantages
}

// Tạo kịch bản sử dụng
function generateUsageScenarios(productName: string, category: string): string[] {
    const scenarios = ['sử dụng hàng ngày']

    if (category === 'beauty') {
        scenarios.push('chăm sóc da buổi sáng', 'skincare buổi tối', 'chuẩn bị dự tiệc')
    } else if (category === 'tech') {
        scenarios.push('làm việc', 'giải trí', 'học tập')
    } else if (category === 'fashion') {
        scenarios.push('đi làm', 'dự tiệc', 'hẹn hò', 'du lịch')
    }

    return scenarios
}

// Tạo chiến lược đoạn thoại thông minh
export function generateSmartDialogueStrategy(analysis: ProductAnalysis, productName: string): SmartDialogueStrategy {
    const { category, targetAudience, keyBenefits, painPoints, emotionalTriggers } = analysis

    // Hook dựa trên pain point chính
    const mainPainPoint = painPoints[0] || 'vấn đề thường gặp'
    const hook = generateHook(mainPainPoint, category)

    // Problem statement
    const problemStatement = `Bạn có đang gặp phải ${mainPainPoint}? Nhiều ${targetAudience[0]} cũng đang trải qua điều này...`

    // Solution presentation
    const mainBenefit = keyBenefits[0] || 'giải pháp hiệu quả'
    const solutionPresentation = `${productName} chính là giải pháp với khả năng ${mainBenefit} vượt trội!`

    // Proof points
    const proofPoints = [
        `Đã được ${Math.floor(Math.random() * 10000) + 1000}+ khách hàng tin dùng`,
        `Hiệu quả ${keyBenefits[1] || 'tuyệt vời'} chỉ sau ${Math.floor(Math.random() * 7) + 1} ngày`,
        `Được chuyên gia ${category === 'beauty' ? 'làm đẹp' : 'ngành'} khuyên dùng`
    ]

    // Emotional connection
    const mainEmotion = emotionalTriggers[0] || 'hài lòng'
    const emotionalConnection = `Hãy tưởng tượng bạn sẽ cảm thấy ${mainEmotion} như thế nào khi sử dụng ${productName}!`

    // Call to action
    const callToAction = analysis.priceRange === 'bình dân'
        ? 'Đặt hàng ngay với giá ưu đãi!'
        : 'Đầu tư cho bản thân ngay hôm nay!'

    // Urgency factor
    const urgencyFactor = analysis.marketTrend === 'đang hot'
        ? 'Sản phẩm đang hot trend, số lượng có hạn!'
        : 'Ưu đãi đặc biệt chỉ trong thời gian ngắn!'

    return {
        hook,
        problemStatement,
        solutionPresentation,
        proofPoints,
        emotionalConnection,
        callToAction,
        urgencyFactor
    }
}

// Tạo hook hấp dẫn
function generateHook(painPoint: string, category: string): string {
    const hooks = {
        beauty: [
            `Bạn có biết ${painPoint} có thể được giải quyết chỉ trong 7 ngày?`,
            `Bí mật để không còn lo về ${painPoint} mà 90% phụ nữ chưa biết!`,
            `Tại sao ${painPoint} lại khiến bạn mất tự tin đến vậy?`
        ],
        tech: [
            `Thiết bị của bạn có đang ${painPoint}? Đây là giải pháp!`,
            `Công nghệ mới giúp bạn không còn phải chịu ${painPoint}`,
            `Bạn có muốn thoát khỏi ${painPoint} một lần và mãi mãi?`
        ],
        fashion: [
            `Tủ đồ của bạn có đang thiếu thứ này để không còn ${painPoint}?`,
            `Bí quyết để luôn ${emotionalTriggers[0] || 'tự tin'} mà fashionista nào cũng biết!`,
            `Làm sao để không bao giờ phải lo ${painPoint} nữa?`
        ],
        default: [
            `Bạn có đang gặp vấn đề với ${painPoint}?`,
            `Giải pháp cho ${painPoint} mà bạn đang tìm kiếm!`,
            `Đây là cách để giải quyết ${painPoint} hiệu quả nhất!`
        ]
    }

    const categoryHooks = hooks[category as keyof typeof hooks] || hooks.default
    return categoryHooks[Math.floor(Math.random() * categoryHooks.length)]
}

// Tạo script đoạn thoại hoàn chỉnh
export function generateSmartDialogue(
    productName: string,
    analysis: ProductAnalysis,
    strategy: SmartDialogueStrategy,
    style: string = 'friendly'
): string {
    const { hook, problemStatement, solutionPresentation, proofPoints, emotionalConnection, callToAction, urgencyFactor } = strategy

    let dialogue = `🎯 ${hook}\n\n`
    dialogue += `${problemStatement}\n\n`
    dialogue += `✨ ${solutionPresentation}\n\n`
    dialogue += `🔥 Tại sao ${productName} lại đặc biệt:\n`

    proofPoints.forEach((point, index) => {
        dialogue += `${index + 1}. ${point}\n`
    })

    dialogue += `\n💫 ${emotionalConnection}\n\n`

    // Thêm social proof
    dialogue += `👥 Hàng nghìn ${analysis.targetAudience[0]} đã chọn ${productName} và cảm thấy ${analysis.emotionalTriggers[0]}!\n\n`

    // Thêm urgency
    dialogue += `⚡ ${urgencyFactor}\n\n`

    dialogue += `🛒 ${callToAction}\n\n`

    // Thêm hashtags
    const hashtags = generateHashtags(analysis, productName)
    dialogue += `${hashtags}`

    return dialogue
}

// Tạo hashtags thông minh
function generateHashtags(analysis: ProductAnalysis, productName: string): string {
    const baseHashtags = ['#TikTokShop', '#MuaNgay', '#UuDai']

    // Hashtags theo category
    const categoryHashtags = {
        beauty: ['#LamDep', '#SkinCare', '#MyPham', '#TrangDiem'],
        tech: ['#CongNghe', '#Tech', '#GadgetHot', '#PhuKienDienThoai'],
        fashion: ['#ThoiTrang', '#Fashion', '#Style', '#Outfit'],
        home: ['#GiaDung', '#NhaDepTuiTip', '#NoiThat', '#BepNha'],
        health: ['#SucKhoe', '#ThucPhamChucNang', '#Vitamin', '#ChamSocSucKhoe']
    }

    const categorySpecific = categoryHashtags[analysis.category as keyof typeof categoryHashtags] || []

    // Hashtags theo emotion
    const emotionHashtags = analysis.emotionalTriggers.map(emotion => `#${emotion.replace(/\s+/g, '')}`)

    const allHashtags = [...baseHashtags, ...categorySpecific, ...emotionHashtags.slice(0, 2)]

    return allHashtags.join(' ')
}