"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Video, Play, CheckCircle } from "lucide-react"

export function VideoInstructionDemo() {
    const demoDialogue = `Tạo một video theo bối cảnh của sản phẩm để cho nhân vật sử dụng sản phẩm và dùng sản phẩm một cách chân thực nhất có câu thoại như sau:

Chị em ơi, nghe mình kể! Mình đã struggle với da xỉn màu suốt 2 năm trời. Thử đủ thứ từ đắt đến rẻ mà không thấy cải thiện. Cho đến khi bạn thân recommend serum Vitamin C này. Sau đúng 1 tuần, da mình sáng lên trông thấy luôn! Giờ ai gặp cũng hỏi bí quyết. Sản phẩm này có ngay trong TikTok Shop của mình góc dưới, chị em order thử nha!`

    return (
        <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Video className="w-5 h-5" />
                    Demo: Hướng Dẫn Video Tự Động
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h3 className="font-semibold text-blue-700 mb-3">✨ Kết Quả Mới - Có Hướng Dẫn Video:</h3>

                    <div className="space-y-3">
                        {/* Video Instruction First */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">📹</span>
                                </div>
                                <span className="text-xs font-semibold text-blue-700">HƯỚNG DẪN TẠO VIDEO</span>
                            </div>
                            <p className="text-xs text-blue-600 leading-relaxed">
                                Tạo một video theo bối cảnh của sản phẩm để cho nhân vật sử dụng sản phẩm và dùng sản phẩm một cách chân thực nhất có câu thoại như sau:
                            </p>
                        </div>

                        {/* Actual Dialogue After */}
                        <div className="bg-gradient-to-r from-lime/10 to-green-100 rounded-lg p-3 border border-lime/20">
                            <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-4 h-4 text-lime-600" />
                                <span className="text-xs font-semibold text-lime-700">NỘI DUNG THOẠI</span>
                            </div>
                            <p className="text-sm leading-relaxed">
                                Chị em ơi, nghe mình kể! Mình đã struggle với da xỉn màu suốt 2 năm trời. Thử đủ thứ từ đắt đến rẻ mà không thấy cải thiện. Cho đến khi bạn thân recommend serum Vitamin C này. Sau đúng 1 tuần, da mình sáng lên trông thấy luôn! Giờ ai gặp cũng hỏi bí quyết. Sản phẩm này có ngay trong TikTok Shop của mình góc dưới, chị em order thử nha!
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Cách Thực Hiện Video:
                    </h4>
                    <div className="space-y-2 text-sm text-green-600">
                        <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span><strong>Bối cảnh:</strong> Phòng ngủ, bàn trang điểm với ánh sáng tự nhiên</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span><strong>Hành động:</strong> Nhân vật thực sự thoa serum lên mặt trong khi nói</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span><strong>Chân thực:</strong> Biểu cảm tự nhiên, không diễn quá, như đang tâm sự với bạn</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span><strong>Timing:</strong> Sync hành động sử dụng sản phẩm với nội dung thoại</span>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-700">
                        <strong>💡 Lưu ý:</strong> Hướng dẫn video được đặt trước nội dung thoại để bạn đọc hướng dẫn trước, sau đó đọc thoại.
                        Hướng dẫn video trước, nội dung thoại sau!
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}