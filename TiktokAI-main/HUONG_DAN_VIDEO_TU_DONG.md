# 📹 Hướng Dẫn Video Tự Động - Hoàn Thành

## ✅ Tính Năng Mới

### **Tự Động Thêm Hướng Dẫn Video**
Mỗi đoạn thoại giờ đây sẽ tự động có dòng hướng dẫn:

```
"Tạo một video theo bối cảnh của sản phẩm để cho nhân vật sử dụng sản phẩm và dùng sản phẩm một cách chân thực nhất có câu thoại như sau:"
```

## 🎯 Cách Hoạt Động

### **1. Tự Động Thêm Prefix**
```typescript
// Thêm dòng hướng dẫn tự động trước đoạn thoại
const videoInstruction = "Tạo một video theo bối cảnh của sản phẩm để cho nhân vật sử dụng sản phẩm và dùng sản phẩm một cách chân thực nhất có câu thoại như sau:"
const finalDialogue = `${videoInstruction}\n\n${cleanedText}`
```

### **2. UI Hiển Thị Đẹp**
- 📹 **Phần Hướng Dẫn**: Background màu xanh, icon video
- 💬 **Phần Thoại**: Background gradient, icon message

## 📊 Ví Dụ Kết Quả

### **Input:**
```
Sản phẩm: Serum Vitamin C
Danh mục: Nội dung SP
Giọng: Nữ
```

### **Output:**
```
📹 HƯỚNG DẪN TẠO VIDEO
Tạo một video theo bối cảnh của sản phẩm để cho nhân vật sử dụng sản phẩm và dùng sản phẩm một cách chân thực nhất có câu thoại như sau:

💬 NỘI DUNG THOẠI
Chị em ơi, nghe mình kể! Mình đã struggle với da xỉn màu suốt 2 năm trời. Thử đủ thứ từ đắt đến rẻ mà không thấy cải thiện. Cho đến khi bạn thân recommend serum Vitamin C này. Sau đúng 1 tuần, da mình sáng lên trông thấy luôn! Giờ ai gặp cũng hỏi bí quyết. Sản phẩm này có ngay trong TikTok Shop của mình góc dưới, chị em order thử nha!
```

## 🎨 UI Components

### **Phần Hướng Dẫn Video**
```tsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
  <div className="flex items-center gap-2 mb-2">
    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
      <span className="text-white text-xs">📹</span>
    </div>
    <span className="text-xs font-semibold text-blue-700">HƯỚNG DẪN TẠO VIDEO</span>
  </div>
  <p className="text-xs text-blue-600 leading-relaxed">
    Tạo một video theo bối cảnh của sản phẩm...
  </p>
</div>
```

### **Phần Nội Dung Thoại**
```tsx
<div className="bg-gradient-to-r from-lime/10 to-christmas-gold/10 rounded-lg p-3 border border-lime/20">
  <div className="flex items-center gap-2 mb-2">
    <MessageSquare className="w-4 h-4 text-lime-600" />
    <span className="text-xs font-semibold text-lime-700">NỘI DUNG THOẠI</span>
  </div>
  <p className="text-sm leading-relaxed">
    {actualDialogueContent}
  </p>
</div>
```

## 🔄 Quy Trình Tạo Video

### **Bước 1: Đọc Hướng Dẫn**
```
📹 HƯỚNG DẪN TẠO VIDEO
Tạo một video theo bối cảnh của sản phẩm để cho nhân vật sử dụng sản phẩm và dùng sản phẩm một cách chân thực nhất có câu thoại như sau:
```

### **Bước 2: Setup Video**
- **Bối cảnh**: Phù hợp với sản phẩm (phòng ngủ cho skincare, bếp cho thực phẩm...)
- **Nhân vật**: Sử dụng sản phẩm một cách tự nhiên
- **Chân thực**: Không diễn quá, tự nhiên như đời thường

### **Bước 3: Đọc Thoại**
```
💬 NỘI DUNG THOẠI
[Nội dung đoạn thoại được tạo bởi AI]
```

### **Bước 4: Quay Video**
- Nhân vật thực hiện hành động sử dụng sản phẩm
- Đồng thời đọc đoạn thoại đã được tạo
- Đảm bảo sync giữa hành động và lời nói

## 🎯 Lợi Ích

### **Cho Content Creator:**
- ✅ **Hướng dẫn rõ ràng** - Biết chính xác cách tạo video
- ✅ **Bối cảnh cụ thể** - Không bị bối rối về setup
- ✅ **Chân thực** - Video trông tự nhiên, không fake
- ✅ **Chuyên nghiệp** - Có cấu trúc và hướng dẫn chi tiết

### **Cho Người Xem:**
- ✅ **Tin tưởng hơn** - Video chân thực, không diễn
- ✅ **Dễ hiểu** - Thấy cách sử dụng sản phẩm thực tế
- ✅ **Thuyết phục** - Nhân vật thực sự dùng sản phẩm
- ✅ **Engagement cao** - Nội dung chất lượng

### **Cho TikTok Algorithm:**
- ✅ **Watch time cao** - Video chất lượng, người xem xem lâu
- ✅ **Engagement tốt** - Nhiều like, comment, share
- ✅ **Authentic content** - TikTok ưu tiên nội dung chân thực
- ✅ **Conversion rate** - Tăng tỷ lệ mua hàng

## 📱 Ví Dụ Thực Tế

### **Serum Vitamin C:**
```
📹 HƯỚNG DẪN TẠO VIDEO
Tạo một video theo bối cảnh của sản phẩm để cho nhân vật sử dụng sản phẩm và dùng sản phẩm một cách chân thực nhất có câu thoại như sau:

💬 NỘI DUNG THOẠI
Chị em ơi, nghe mình kể! Mình đã struggle với da xỉn màu suốt 2 năm trời...

🎬 SETUP VIDEO:
- Bối cảnh: Phòng ngủ, bàn trang điểm
- Hành động: Nhân vật thực sự thoa serum lên mặt
- Timing: Thoa serum trong khi nói về trải nghiệm
- Chân thực: Biểu cảm tự nhiên, không diễn quá
```

### **Tai Nghe Bluetooth:**
```
📹 HƯỚNG DẪN TẠO VIDEO
Tạo một video theo bối cảnh của sản phẩm để cho nhân vật sử dụng sản phẩm và dùng sản phẩm một cách chân thực nhất có câu thoại như sau:

💬 NỘI DUNG THOẠI
Mình đã thử hàng trăm sản phẩm và phải nói thật: tai nghe này win toàn tập!...

🎬 SETUP VIDEO:
- Bối cảnh: Phòng làm việc hoặc phòng ngủ
- Hành động: Đeo tai nghe, test âm thanh
- Timing: Đeo tai nghe khi nói về chất lượng âm thanh
- Chân thực: Thực sự nghe nhạc, phản ứng tự nhiên
```

## 🚀 Kết Quả Mong Đợi

Với tính năng này, mỗi đoạn thoại sẽ trở thành:

1. **Hướng dẫn hoàn chỉnh** - Từ setup đến thực hiện
2. **Video chân thực** - Nhân vật thực sự sử dụng sản phẩm  
3. **Nội dung chất lượng** - Có cấu trúc và mục đích rõ ràng
4. **Tăng conversion** - Khách hàng tin tưởng hơn khi thấy sử dụng thực tế
5. **Viral potential** - Video chân thực có khả năng viral cao hơn

**Kết quả cuối cùng:** Mỗi đoạn thoại không chỉ là script mà là một hướng dẫn tạo video hoàn chỉnh!