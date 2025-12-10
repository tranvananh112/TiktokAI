"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, ArrowRight } from "lucide-react"

export function DemoComparison() {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">So Sánh Kết Quả</h2>
                <p className="text-muted-foreground">Sự khác biệt giữa mô tả cũ và mô tả mới tập trung vào tính năng</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Kết quả CŨ */}
                <Card className="border-red-200 bg-red-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <XCircle className="w-5 h-5" />
                            Mô Tả Cũ (Chung Chung)
                        </CardTitle>
                        <Badge variant="destructive" className="w-fit">Không Hữu Ích</Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="p-3 bg-white rounded-lg border border-red-200">
                            <p className="text-sm text-gray-700">
                                <strong>**TỔNG QUAN:**</strong> Mặt nạ nghệ Hưng Yên (cocoon) là sản phẩm được bán phổ biến trên các sàn thương mại điện tử Việt Nam.
                            </p>
                            <p className="text-sm text-gray-700 mt-2">
                                <strong>**THÔNG TIN THỊ TRƯỜNG:**</strong><br />
                                - Số lượng sản phẩm tìm thấy: 0<br />
                                - Khoảng giá: Đa dạng<br />
                                - Nguồn: |
                            </p>
                            <p className="text-sm text-gray-700 mt-2">
                                <strong>**TÍNH NĂNG:**</strong> Dựa trên dữ liệu thực tế từ 0 sản phẩm tương tự được tìm thấy trên thị trường.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-red-600">
                                <XCircle className="w-4 h-4" />
                                <span className="text-sm">Không có thông tin cụ thể</span>
                            </div>
                            <div className="flex items-center gap-2 text-red-600">
                                <XCircle className="w-4 h-4" />
                                <span className="text-sm">Lặp lại tên sản phẩm</span>
                            </div>
                            <div className="flex items-center gap-2 text-red-600">
                                <XCircle className="w-4 h-4" />
                                <span className="text-sm">Không có hướng dẫn sử dụng</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Kết quả MỚI */}
                <Card className="border-green-200 bg-green-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-5 h-5" />
                            Mô Tả Mới (Tập Trung Tính Năng)
                        </CardTitle>
                        <Badge variant="default" className="w-fit bg-green-600">Hữu Ích & Cụ Thể</Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="p-3 bg-white rounded-lg border border-green-200">
                            <p className="text-sm text-gray-700">
                                <strong>TÍNH NĂNG CHÍNH:</strong><br />
                                1. Làm sạch sâu lỗ chân lông, loại bỏ bụi bẩn tích tụ<br />
                                2. Dưỡng ẩm tự nhiên với tinh chất nghệ và mật ong<br />
                                3. Kháng viêm, giảm mụn và vết thâm hiệu quả<br />
                                4. Làm trắng da tự nhiên, đều màu da
                            </p>
                            <p className="text-sm text-gray-700 mt-2">
                                <strong>CÁCH SỬ DỤNG:</strong><br />
                                - Rửa mặt sạch → Thoa đều mặt nạ → Để 15-20 phút → Rửa sạch với nước ấm<br />
                                - Sử dụng 2-3 lần/tuần, tốt nhất vào buổi tối<br />
                                - Tránh vùng mắt và môi
                            </p>
                            <p className="text-sm text-gray-700 mt-2">
                                <strong>ĐỐI TƯỢNG:</strong> Da dầu mụn, da xỉn màu, từ 16 tuổi trở lên. Không dùng cho da nhạy cảm.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm">Tính năng cụ thể, rõ ràng</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm">Hướng dẫn sử dụng chi tiết</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm">Đối tượng sử dụng rõ ràng</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Mũi tên chỉ sự cải thiện */}
            <div className="flex items-center justify-center">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-100 to-green-100 rounded-lg border">
                    <span className="text-red-600 font-medium">Mô tả chung chung</span>
                    <ArrowRight className="w-6 h-6 text-gray-500" />
                    <span className="text-green-600 font-medium">Thông tin cụ thể & hữu ích</span>
                </div>
            </div>

            {/* Ví dụ khác */}
            <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                    <CardTitle className="text-blue-700">Ví Dụ Khác: Serum Vitamin C</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium text-red-600 mb-2">❌ Trước (Chung chung):</h4>
                            <p className="text-sm text-gray-600 italic">
                                "Serum Vitamin C là sản phẩm chăm sóc da cao cấp với nhiều tính năng ưu việt..."
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium text-green-600 mb-2">✅ Sau (Cụ thể):</h4>
                            <p className="text-sm text-gray-600">
                                <strong>TÍNH NĂNG:</strong> Vitamin C 20%, chống oxy hóa, làm sáng da<br />
                                <strong>CÁCH DÙNG:</strong> 2-3 giọt buổi sáng, thoa trước kem chống nắng<br />
                                <strong>HIỆU QUẢ:</strong> Da sáng hơn sau 2 tuần, giảm thâm sau 4 tuần
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}