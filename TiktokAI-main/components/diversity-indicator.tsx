"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Zap, MessageSquare, Eye } from "lucide-react"

interface DiversityIndicatorProps {
    diversityInfo?: {
        conceptsUsed: string[]
        openingsUsed: string[]
    }
    dialogueCount: number
}

export function DiversityIndicator({ diversityInfo, dialogueCount }: DiversityIndicatorProps) {
    if (!diversityInfo || dialogueCount === 0) return null

    const conceptNames = {
        "personal_story": "Câu chuyện cá nhân",
        "problem_solution": "Giải quyết vấn đề",
        "before_after": "Trước & sau",
        "expert_review": "Đánh giá chuyên gia",
        "trending_topic": "Xu hướng hot",
        "comparison": "So sánh sản phẩm",
        "secret_tip": "Mẹo bí mật",
        "user_testimonial": "Phản hồi người dùng",
        "behind_scenes": "Hậu trường",
        "myth_busting": "Phá vỡ quan niệm",
        "seasonal_relevance": "Liên quan mùa",
        "lifestyle_integration": "Tích hợp lối sống"
    }

    return (
        <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-green-700">Đảm Bảo Nội Dung Không Trùng Lặp</h3>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Đã tạo {dialogueCount} đoạn thoại hoàn toàn khác biệt</span>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Eye className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium">Góc độ tiếp cận đa dạng:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {diversityInfo.conceptsUsed.map((concept, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-purple-50 border-purple-200">
                                    {conceptNames[concept as keyof typeof conceptNames] || concept}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium">Câu mở đầu khác nhau:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {diversityInfo.openingsUsed.map((opening, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-orange-50 border-orange-200">
                                    {opening}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="p-2 bg-green-100 rounded-lg border border-green-200">
                        <p className="text-xs text-green-700">
                            ✅ Mỗi đoạn thoại có góc nhìn và phong cách riêng biệt
                            <br />
                            ✅ Không lặp lại ý tưởng hay từ ngữ từ các đoạn trước
                            <br />
                            ✅ Phù hợp với nhiều đối tượng khách hàng khác nhau
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}