import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "AIzaSyBkicFyAsv-olgokEl0eIN5Xbetdz2eho0")

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const MODELS = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]

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
          // Đợi lâu hơn nếu bị quota
          const waitTime = (attempt + 1) * 10000 // 10s, 20s, 30s
          console.log(`Quota exceeded for ${modelName}, waiting ${waitTime / 1000}s before retry...`)
          await delay(waitTime)
        } else {
          // Lỗi khác, thử model tiếp theo
          console.log(`Error with ${modelName}:`, error?.message)
          break
        }
      }
    }
  }
  throw new Error("QUOTA_EXHAUSTED")
}

export async function POST(request: Request) {
  try {
    const { productName } = await request.json()

    if (!productName) {
      return Response.json({ error: "Thiếu tên sản phẩm" }, { status: 400 })
    }

    const searchPrompt = `
Bạn là chuyên gia phân tích sản phẩm. Hãy tạo thông tin CHI TIẾT VỀ TÍNH NĂNG & CÔNG DỤNG cho: "${productName}"

**YÊU CẦU - CHỈ VIẾT THÔNG TIN CỤ THỂ, HỮU ÍCH:**

**TÍNH NĂNG CHÍNH:**
- Liệt kê 4-5 tính năng cụ thể, rõ ràng
- VD: "Chống nắng SPF50+", "Dưỡng ẩm 24h", "Kháng khuẩn 99.9%"
- Không viết chung chung như "chất lượng cao"

**CÔNG DỤNG CỤ THỂ:**
- Giải quyết vấn đề gì? (VD: da khô, mụn, lão hóa, tóc gãy rụng)
- Mang lại hiệu quả gì? (VD: da mềm mịn, giảm thâm, trắng sáng)
- Thời gian thấy hiệu quả? (VD: sau 7 ngày, tức thì, 2-4 tuần)

**CÁCH SỬ DỤNG CHI TIẾT:**
- Từng bước cụ thể (VD: Rửa mặt → Thoa đều → Massage 30s → Để khô)
- Thời điểm dùng (sáng/tối/trước khi ra nắng/sau khi gội đầu)
- Số lần/liều lượng (VD: 2 lần/ngày, 2-3 giọt, 1 viên sau ăn)
- Lưu ý quan trọng khi sử dụng

**THÀNH PHẦN/ĐẶC ĐIỂM:**
- Thành phần hoạt tính chính (VD: Vitamin C 20%, Hyaluronic Acid, Collagen)
- Đặc điểm nổi bật (VD: không paraben, pH cân bằng, kháng nước)
- Xuất xứ/chứng nhận (nếu biết)

**ĐỐI TƯỢNG PHÙ HỢP:**
- Loại da/nhu cầu cụ thể (VD: da dầu mụn, da khô lão hóa, tóc hư tổn)
- Độ tuổi phù hợp (VD: từ 25 tuổi, mọi lứa tuổi, trẻ em trên 12 tuổi)
- Trường hợp KHÔNG nên dùng (VD: da nhạy cảm, có thai, dị ứng)

**LƯU Ý AN TOÀN:**
- Cách bảo quản đúng cách
- Tác dụng phụ có thể có
- Lời khuyên khi sử dụng lần đầu
- Khi nào nên ngừng sử dụng

**QUY TẮC QUAN TRỌNG:**
- KHÔNG viết giới thiệu chung chung về sản phẩm
- KHÔNG lặp lại tên sản phẩm nhiều lần
- CHỈ viết thông tin CỤ THỂ, THỰC TẾ, HỮU ÍCH
- Ngắn gọn, súc tích: 200-250 từ
- Tập trung vào TÍNH NĂNG, CÔNG DỤNG, CÁCH DÙNG
Chỉ trả về thông tin chi tiết, không giải thích thêm.
`

    const text = await generateWithRetry(searchPrompt)

    return Response.json({
      success: true,
      description: text.trim(),
    })
  } catch (error: any) {
    console.error("Search product error:", error)

    if (error?.message === "QUOTA_EXHAUSTED") {
      return Response.json(
        {
          error: "API đã hết quota. Vui lòng đợi 1-2 phút rồi thử lại, hoặc nhập mô tả thủ công.",
          isQuotaError: true,
        },
        { status: 429 },
      )
    }

    return Response.json(
      {
        error: "Không thể tìm kiếm thông tin sản phẩm. Vui lòng thử lại.",
      },
      { status: 500 },
    )
  }
}
