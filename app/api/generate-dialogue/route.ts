import { GoogleGenerativeAI } from "@google/generative-ai"
import { saveDialogueHistory } from "@/lib/dialogue-tracker"
import {
  analyzeProduct,
  generateSmartDialogueStrategy,
  generateSmartDialogue,
  type ProductAnalysis
} from "@/lib/smart-product-analyzer"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "AIzaSyApuSv-1qoB5HlYD9LKBtQDf1AmjSvfr6w")

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const MODELS = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"]

// Hàm định nghĩa các góc độ sáng tạo khác nhau
function getAngleDefinition(angle: string): string {
  const definitions: Record<string, string> = {
    "personal_story": "Kể câu chuyện cá nhân về việc sử dụng sản phẩm, trải nghiệm thực tế của bản thân",
    "problem_solution": "Tập trung vào vấn đề cụ thể mà sản phẩm giải quyết, before/after rõ ràng",
    "before_after": "So sánh tình trạng trước và sau khi sử dụng, nhấn mạnh sự thay đổi",
    "expert_review": "Đánh giá chuyên môn, phân tích thành phần, công nghệ từ góc độ chuyên gia",
    "trending_topic": "Liên kết với xu hướng hiện tại, viral trend, hashtag hot",
    "comparison": "So sánh với sản phẩm khác, tại sao chọn sản phẩm này",
    "secret_tip": "Chia sẻ mẹo sử dụng ít người biết, cách dùng hiệu quả",
    "user_testimonial": "Phản hồi từ khách hàng khác, review thật từ cộng đồng",
    "behind_scenes": "Hậu trường sản xuất, nguồn gốc, quy trình tạo ra sản phẩm",
    "myth_busting": "Phá vỡ quan niệm sai lầm, sự thật về sản phẩm",
    "seasonal_relevance": "Liên kết với mùa, thời tiết, dịp đặc biệt",
    "lifestyle_integration": "Cách tích hợp sản phẩm vào lối sống hàng ngày"
  }

  return definitions[angle] || "Tạo nội dung độc đáo và sáng tạo"
}

async function generateWithRetry(prompt: string, maxRetries = 3) {
  for (const modelName of MODELS) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
      } catch (error: any) {
        const isQuotaError =
          error?.message?.includes("429") ||
          error?.message?.includes("quota") ||
          error?.message?.includes("RESOURCE_EXHAUSTED")

        if (isQuotaError) {
          const waitTime = (attempt + 1) * 5000 // 5s, 10s, 15s
          console.log(`Quota exceeded for ${modelName}, waiting ${waitTime / 1000}s...`)
          await delay(waitTime)
        } else {
          console.log(`Error with ${modelName}:`, error?.message)
          break
        }
      }
    }
  }
  throw new Error("QUOTA_EXHAUSTED")
}

export async function POST(request: Request) {
  const data = await request.json()

  const {
    productName,
    productDescription,
    price,
    promotionInfo,
    promotionType,
    discountPercent,
    categories,
    duration,
    gender,
    count,
  } = data

  const genderContext =
    gender === "female"
      ? "Giọng nữ trẻ trung, năng động, thân thiện như một người bạn đang chia sẻ sản phẩm yêu thích"
      : "Giọng nam trưởng thành, đáng tin cậy, chuyên nghiệp nhưng vẫn gần gũi"

  const targetWords = Math.round(duration * 3.5)

  let promotionText = ""
  if (promotionType === "freeship") {
    promotionText = "MIỄN PHÍ VẬN CHUYỂN toàn quốc"
  } else if (promotionType === "discount") {
    promotionText = `GIẢM NGAY ${discountPercent}%`
  } else if (promotionType === "both") {
    promotionText = `GIẢM ${discountPercent}% + FREESHIP`
  }
  if (promotionInfo) {
    promotionText += promotionText ? ` - ${promotionInfo}` : promotionInfo
  }

  const categoryPrompts: Record<string, string> = {
    content: `Tập trung vào công dụng, thành phần, ưu điểm nổi bật của sản phẩm. Nhấn mạnh những điểm khác biệt và lý do nên mua. Nhắc người xem rằng sản phẩm đang được giới thiệu có thể mua ngay tại giỏ hàng TikTok Shop góc dưới màn hình.`,
    price: `Tập trung vào giá trị sản phẩm so với giá tiền. Nhấn mạnh "đáng đồng tiền", "giá tốt", "tiết kiệm". Nhắc người xem click vào biểu tượng giỏ hàng góc dưới màn hình để xem giá và đặt hàng ngay trên TikTok Shop.`,
    promotion: `Tập trung vào ưu đãi đặc biệt, khuyến mãi có hạn, tạo cảm giác FOMO. Nhấn mạnh "chỉ hôm nay", "số lượng có hạn". Kêu gọi người xem nhanh tay click vào giỏ hàng TikTok Shop bên dưới để không bỏ lỡ deal hot.`,
  }

  const dialogues = []
  const usedConcepts = new Set<string>()
  const usedOpenings = new Set<string>()

  // 🧠 PHÂN TÍCH THÔNG MINH SẢN PHẨM
  console.log("🔍 Analyzing product with smart system...")
  const productAnalysis = analyzeProduct(productName, productDescription)
  const smartStrategy = generateSmartDialogueStrategy(productAnalysis, productName)

  console.log("📊 Product Analysis:", {
    category: productAnalysis.category,
    targetAudience: productAnalysis.targetAudience[0],
    keyBenefits: productAnalysis.keyBenefits.slice(0, 2),
    marketTrend: productAnalysis.marketTrend
  })

  // 🔬 NGHIÊN CỨU SÂU VỚI AI
  let productInsights = ""
  try {
    const enhancedResearchPrompt = `Bạn là chuyên gia phân tích sản phẩm với AI thông minh. Dựa trên phân tích ban đầu, hãy nghiên cứu SÂU hơn:

**SẢN PHẨM:** ${productName}
**MÔ TẢ:** ${productDescription}

**PHÂN TÍCH THÔNG MINH ĐÃ CÓ:**
- Danh mục: ${productAnalysis.category}
- Đối tượng: ${productAnalysis.targetAudience.join(', ')}
- Lợi ích chính: ${productAnalysis.keyBenefits.join(', ')}
- Pain Points: ${productAnalysis.painPoints.join(', ')}
- Cảm xúc: ${productAnalysis.emotionalTriggers.join(', ')}
- Xu hướng: ${productAnalysis.marketTrend}

**NGHIÊN CỨU CHUYÊN SÂU THÊM:**

🔬 **PHÂN TÍCH KỸ THUẬT:**
- Thành phần/công nghệ/chất liệu cụ thể
- Cơ chế hoạt động, nguyên lý khoa học
- Tiêu chuẩn chất lượng, chứng nhận

🎯 **INSIGHT MARKETING:**
- Điểm khác biệt so với đối thủ
- Lý do khách hàng nên chọn SẢN PHẨM NÀY
- Timing tốt nhất để mua (theo mùa/xu hướng)

💡 **SÁNG TẠO NỘI DUNG:**
- Góc nhìn mới lạ về sản phẩm
- Cách sử dụng sáng tạo, mẹo hay
- Câu chuyện thương hiệu hấp dẫn
- Từ khóa trending, viral

👥 **TÂM LÝ KHÁCH HÀNG:**
- Nỗi lo/mong muốn của ${productAnalysis.targetAudience[0]}
- Cảm xúc khi sử dụng sản phẩm
- Lý do thúc đẩy mua ngay

**YÊU CẦU:**
- Tập trung vào thông tin THỰC TẾ, HỮU ÍCH
- Viết ngắn gọn, dễ hiểu cho việc tạo script
- 200-250 từ
- Không lặp lại thông tin đã có`

    productInsights = await generateWithRetry(enhancedResearchPrompt)
  } catch (error) {
    console.error("Error researching product:", error)
    productInsights = `Sản phẩm ${productName} thuộc danh mục ${productAnalysis.category}, phù hợp với ${productAnalysis.targetAudience[0]}, mang lại lợi ích ${productAnalysis.keyBenefits[0]} và giải quyết vấn đề ${productAnalysis.painPoints[0]}.`
  }

  // Danh sách góc độ và câu mở đầu đa dạng
  const uniqueAngles = [
    "personal_story", "problem_solution", "before_after", "expert_review",
    "trending_topic", "comparison", "secret_tip", "user_testimonial",
    "behind_scenes", "myth_busting", "seasonal_relevance", "lifestyle_integration"
  ]

  const uniqueOpenings = [
    "Mọi người ơi!", "Thật không thể tin được!", "Hôm nay mình phát hiện ra...",
    "Ai cũng hỏi mình bí quyết...", "Sau bao lâu tìm hiểu...", "Bạn có biết không...",
    "Mình đã thử hàng trăm sản phẩm...", "Trending gì thế này...", "Real review nè mọi người!",
    "Mình phải chia sẻ ngay...", "Không thể giữ bí mật này...", "Update mới nhất nè...",
    "Chị em ơi, nghe mình kể...", "Viral quá rồi sản phẩm này!", "Mình shock luôn á..."
  ]

  for (let i = 0; i < count; i++) {
    // Đợi 2 giây giữa mỗi request để giảm tải
    if (i > 0) {
      await delay(2000)
    }

    const category = categories[i % categories.length]

    // Chọn góc độ và câu mở đầu duy nhất cho mỗi đoạn thoại
    const availableAngles = uniqueAngles.filter(angle => !usedConcepts.has(angle))
    const availableOpenings = uniqueOpenings.filter(opening => !usedOpenings.has(opening))

    const selectedAngle = availableAngles[i % availableAngles.length] || uniqueAngles[i % uniqueAngles.length]
    const selectedOpening = availableOpenings[i % availableOpenings.length] || uniqueOpenings[i % uniqueOpenings.length]

    usedConcepts.add(selectedAngle)
    usedOpenings.add(selectedOpening)

    // Tạo danh sách các đoạn thoại đã tạo trong phiên này
    const currentDialogues = dialogues.map(d => d.dialogue).join('\n---\n')

    const prompt = `Bạn là chuyên gia viết kịch bản TikTok Shop với AI thông minh. Tạo đoạn thoại số ${i + 1}/${count} HOÀN TOÀN KHÁC BIỆT.

**🎯 THÔNG TIN SẢN PHẨM:**
- Tên: ${productName}
- Danh mục: ${productAnalysis.category}
- Đối tượng: ${productAnalysis.targetAudience[0]}
${price ? `- Giá: ${price}` : ""}
${promotionText ? `- Ưu đãi: ${promotionText}` : ""}

**🧠 PHÂN TÍCH THÔNG MINH:**
- Lợi ích chính: ${productAnalysis.keyBenefits.slice(0, 3).join(', ')}
- Vấn đề giải quyết: ${productAnalysis.painPoints.slice(0, 2).join(', ')}
- Cảm xúc mục tiêu: ${productAnalysis.emotionalTriggers.slice(0, 2).join(', ')}
- Xu hướng thị trường: ${productAnalysis.marketTrend}
- Lợi thế cạnh tranh: ${productAnalysis.competitiveAdvantages.slice(0, 2).join(', ')}

**🔬 NGHIÊN CỨU CHUYÊN SÂU:**
${productInsights}

**TRÁNH SAO CHÉP MÔ TẢ GỐC:**
"${productDescription}"

**CÁC ĐOẠN THOẠI ĐÃ TẠO (TUYỆT ĐỐI KHÔNG ĐƯỢC GIỐNG):**
${currentDialogues || "Chưa có đoạn nào"}

**🎬 CHIẾN LƯỢC THÔNG MINH:**
- **Hook**: ${smartStrategy.hook}
- **Vấn đề**: ${smartStrategy.problemStatement}
- **Giải pháp**: ${smartStrategy.solutionPresentation}
- **Kết nối cảm xúc**: ${smartStrategy.emotionalConnection}
- **Tạo cấp bách**: ${smartStrategy.urgencyFactor}

**📝 YÊU CẦU KHÁC BIỆT:**
1. ${genderContext}
2. Độ dài: ${targetWords} từ (${duration} giây)
3. ${categoryPrompts[category]}
4. **Góc độ**: ${selectedAngle} - ${getAngleDefinition(selectedAngle)}
5. **Bắt đầu bằng**: "${selectedOpening}"
6. **Tập trung vào**: ${productAnalysis.keyBenefits[i % productAnalysis.keyBenefits.length]}

**NGUYÊN TẮC KHÁC BIỆT TUYỆT ĐỐI:**
🚫 **KHÔNG ĐƯỢC:**
- Lặp lại BẤT KỲ ý tưởng nào từ các đoạn trước
- Sử dụng cùng cấu trúc câu với các đoạn trước
- Nhắc đến cùng tính năng theo cách giống nhau
- Dùng từ ngữ tương tự các đoạn trước

✅ **BẮT BUỘC:**
- Góc nhìn HOÀN TOÀN MỚI về sản phẩm
- Cách kể chuyện KHÁC BIỆT
- Từ ngữ và phong cách RIÊNG BIỆT
- Trải nghiệm/tình huống KHÁC với các đoạn trước

**🔥 PHONG CÁCH TIKTOK VIRAL:**
- Bắt đầu bằng: "${selectedOpening}"
- Từ trending: "viral", "trending", "hot hit", "must try", "game changer"
- Tương tác: "Comment nếu...", "Tag ai cần biết", "Ai đồng ý?"
- Cảm xúc mục tiêu: Tạo cảm giác "${productAnalysis.emotionalTriggers[0]}" cho người xem
- Pain point: Nhắc đến "${productAnalysis.painPoints[0]}" một cách tự nhiên

**💡 SỬ DỤNG THÔNG TIN THÔNG MINH:**
- Nhấn mạnh lợi ích: "${productAnalysis.keyBenefits[0]}"
- Đối tượng: Nói chuyện trực tiếp với "${productAnalysis.targetAudience[0]}"
- Lợi thế: Nhắc đến "${productAnalysis.competitiveAdvantages[0]}"
- Xu hướng: Kết hợp với "${productAnalysis.marketTrend}"

**TIKTOK SHOP CTA (chọn 1 cách KHÁC với các đoạn trước):**
- "Mua ngay tại giỏ hàng TikTok Shop góc dưới!"
- "Link shop ở góc màn hình, order liền nha!"
- "Có sẵn trong TikTok Shop của mình, click ngay!"
- "Vào shop góc dưới để không bỏ lỡ!"

**KIỂM TRA CUỐI:**
- Đoạn này có khác HOÀN TOÀN với ${i} đoạn trước không?
- Có sử dụng góc độ "${selectedAngle}" đúng không?
- Có bắt đầu bằng "${selectedOpening}" không?

Tạo đoạn thoại ĐỘCĐÁO, KHÔNG TRÙNG LẶP!`

    try {
      const text = await generateWithRetry(prompt)

      const cleanedText = text.trim()
      const wordCount = cleanedText.split(/\s+/).length
      const estimatedDuration = Math.round(wordCount / 3.5)

      // Thêm dòng hướng dẫn tự động trước đoạn thoại
      const videoInstruction = "Tạo một video theo bối cảnh của sản phẩm để cho nhân vật sử dụng sản phẩm và dùng sản phẩm một cách chân thực nhất có câu thoại như sau:"
      const finalDialogue = `${videoInstruction}\n\n${cleanedText}`

      dialogues.push({
        dialogue: finalDialogue,
        category,
        gender,
        estimatedDuration,
        wordCount,
        angle: selectedAngle,
        opening: selectedOpening,
        productInsights: i === 0 ? productInsights : undefined,
      })
    } catch (error) {
      console.error("Error generating dialogue:", error)

      const backupDialogue = `${selectedOpening} Hôm nay mình giới thiệu đến các bạn ${productName} - một sản phẩm thật sự xịn sò mà mình đã dùng thử rồi! ${price ? `Với giá chỉ ${price}` : "Với mức giá hợp lý"} ${promotionText ? `lại còn ${promotionText}` : ""} thì còn chần chờ gì nữa! Sản phẩm mình để ngay trong giỏ hàng TikTok Shop góc dưới màn hình, mọi người click vào đó để mua ngay nha!`

      // Thêm dòng hướng dẫn tự động cho backup dialogue
      const videoInstruction = "Tạo một video theo bối cảnh của sản phẩm để cho nhân vật sử dụng sản phẩm và dùng sản phẩm một cách chân thực nhất có câu thoại như sau:"
      const finalBackupDialogue = `${videoInstruction}\n\n${backupDialogue}`

      dialogues.push({
        dialogue: finalBackupDialogue,
        category,
        gender,
        estimatedDuration: duration,
        wordCount: targetWords,
        angle: selectedAngle,
        opening: selectedOpening,
        isBackup: true,
      })
    }
  }

  // Lưu lịch sử để tránh lặp lại trong lần tạo tiếp theo
  try {
    const createdDialogues = dialogues.map(d => d.dialogue)
    const usedConceptsArray = Array.from(usedConcepts)
    const usedOpeningsArray = Array.from(usedOpenings)

    saveDialogueHistory(productName, createdDialogues, usedConceptsArray, usedOpeningsArray)
  } catch (error) {
    console.error("Error saving dialogue history:", error)
  }

  return Response.json({
    dialogues,
    productInsights,
    uniqueCount: dialogues.length,
    diversityInfo: {
      conceptsUsed: Array.from(usedConcepts),
      openingsUsed: Array.from(usedOpenings)
    },
    smartAnalysis: {
      category: productAnalysis.category,
      targetAudience: productAnalysis.targetAudience,
      keyBenefits: productAnalysis.keyBenefits,
      painPoints: productAnalysis.painPoints,
      emotionalTriggers: productAnalysis.emotionalTriggers,
      marketTrend: productAnalysis.marketTrend,
      priceRange: productAnalysis.priceRange,
      competitiveAdvantages: productAnalysis.competitiveAdvantages
    },
    strategy: {
      hook: smartStrategy.hook,
      problemStatement: smartStrategy.problemStatement,
      solutionPresentation: smartStrategy.solutionPresentation,
      emotionalConnection: smartStrategy.emotionalConnection,
      callToAction: smartStrategy.callToAction,
      urgencyFactor: smartStrategy.urgencyFactor
    }
  })
}