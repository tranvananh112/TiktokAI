"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Sparkles, Zap, Search, Gift, TrendingUp } from "lucide-react"

export function UpdateNotification() {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    return (
        <Card className="mb-6 border-2 border-lime/40 bg-gradient-to-r from-lime/10 via-primary/10 to-christmas-gold/10 shadow-lg">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-lime to-primary flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="font-semibold text-lg text-foreground">
                                🎉 Cập Nhật Mới: AI Gemini Nâng Cấp!
                            </h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-lime-foreground" />
                                    <span className="font-medium">API Key Gemini Mới</span>
                                </div>
                                <p className="text-muted-foreground ml-6">
                                    Chất lượng đầu ra được cải thiện đáng kể với API key mới
                                </p>

                                <div className="flex items-center gap-2">
                                    <Search className="w-4 h-4 text-primary" />
                                    <span className="font-medium">Web Scraping Thực Tế</span>
                                </div>
                                <p className="text-muted-foreground ml-6">
                                    Tự động scrape dữ liệu từ Shopee, Tiki, Lazada để có thông tin chính xác
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Gift className="w-4 h-4 text-christmas-red" />
                                    <span className="font-medium">Hệ Thống Khuyến Mãi</span>
                                </div>
                                <p className="text-muted-foreground ml-6">
                                    Freeship, Giảm giá %, hoặc combo cả hai
                                </p>

                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-christmas-gold" />
                                    <span className="font-medium">Hướng Dẫn Video Tự Động</span>
                                </div>
                                <p className="text-muted-foreground ml-6">
                                    Tự động thêm hướng dẫn tạo video chân thực cho mỗi đoạn thoại
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 p-3 rounded-lg bg-lime/10 border border-lime/30">
                            <p className="text-xs text-lime-foreground">
                                <strong>💡 Mẹo:</strong> Nhập tên sản phẩm → Nhấn "Tự động tìm kiếm" → Hệ thống sẽ scrape dữ liệu thực tế từ các sàn TMĐT → AI tạo nội dung sáng tạo!
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsVisible(false)}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}