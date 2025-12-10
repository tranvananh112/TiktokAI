import { GoogleGenerativeAI } from "@google/generative-ai"
import { saveDialogueHistory } from "@/lib/dialogue-tracker"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "AIzaSyBkicFyAsv-olgokEl0eIN5Xbetdz2eho0")

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const MODELS = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]

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

  let productInsights = ""
  try {
    const researchPrompt = `Bạn là chuyên gia nghiên cứu sản phẩm với khả năng truy xuất dữ liệu từ Gemini AI. Hãy nghiên cứu SÂU về sản phẩm:

**TÊN SẢN PHẨM:** ${productName}
**MÔ TẢ CƠ BẢN:** ${productDescription}

**NHIỆM VỤ NGHIÊN CỨU:**
1. Truy xuất thông tin chi tiết từ cơ sở dữ liệu Gemini về sản phẩm này
2. Phân tích đặc điểm, công dụng, thành phần thực tế
3. Tìm hiểu xu hướng thị trường, đánh giá người dùng
4. Khám phá các góc nhìn mới, lợi ích ẩn của sản phẩm

**THÔNG TIN CẦN TRẢ VỀ:**

**NGHIÊN CỨU CHUYÊN SÂU:**
- Công dụng chính và lợi ích nổi bật (dựa trên dữ liệu thực tế)
- Thành phần/công nghệ/chất liệu quan trọng
- Cơ chế hoạt động, nguyên lý khoa học (nếu có)
- Kết quả nghiên cứu, chứng nhận (nếu có)

**PHÂN TÍCH THỊ TRƯỜNG:**
- Đối tượng khách hàng chính và phụ
- Xu hướng sử dụng hiện tại
- So sánh với đối thủ cạnh tranh
- Điểm khác biệt độc đáo

**INSIGHT SÁNG TẠO:**
- Cách sử dụng sáng tạo, mẹo hay
- Lợi ích ẩn mà ít người biết
- Câu chuyện thương hiệu, nguồn gốc
- Từ khóa marketing hấp dẫn, trending

**GÓC NHÌN NGƯỜI DÙNG:**
- Trải nghiệm thực tế của khách hàng
- Vấn đề sản phẩm giải quyết
- Cảm xúc, tâm lý khi sử dụng
- Lý do nên mua ngay hôm nay

**QUY TẮC:**
- Dựa trên dữ liệu có thật từ Gemini AI
- Viết ngắn gọn, súc tích, dễ hiểu
- Tập trung vào thông tin HỮU ÍCH cho việc tạo nội dung
- Tổng cộng 250-300 từ
- KHÔNG lặp lại mô tả gốc của người dùng`

    productInsights = await generateWithRetry(researchPrompt)
  } catch (error) {
    console.error("Error researching product:", error)
    productInsights = `Sản phẩm ${productName} với các đặc điểm nổi bật cần được nghiên cứu thêm để tạo nội dung chất lượng.`
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

    const prompt = `Bạn là chuyên gia viết kịch bản TikTok Shop. Tạo đoạn thoại số ${i + 1}/${count} HOÀN TOÀN KHÁC BIỆT với các đoạn trước.

**THÔNG TIN SẢN PHẨM:**
- Tên: ${productName}
- Nghiên cứu: ${productInsights}
${price ? `- Giá: ${price}` : ""}
${promotionText ? `- Ưu đãi: ${promotionText}` : ""}

**TRÁNH SAO CHÉP MÔ TẢ GỐC:**
"${productDescription}"

**CÁC ĐOẠN THOẠI ĐÃ TẠO (TUYỆT ĐỐI KHÔNG ĐƯỢC GIỐNG):**
${currentDialogues || "Chưa có đoạn nào"}

**YÊU CẦU KHÁC BIỆT HOÀN TOÀN:**
1. ${genderContext}
2. Độ dài: ${targetWords} từ (${duration} giây)
3. ${categoryPrompts[category]}
4. **Góc độ**: ${selectedAngle} - ${getAngleDefinition(selectedAngle)}
5. **Bắt đầu bằng**: "${selectedOpening}"

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

**PHONG CÁCH TIKTOK VIRAL:**
- Bắt đầu bằng: "${selectedOpening}"
- Từ trending: "viral", "trending", "hot hit", "must try", "game changer"
- Tương tác: "Comment nếu...", "Tag ai cần biết", "Ai đồng ý?"

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
    }
  })
}