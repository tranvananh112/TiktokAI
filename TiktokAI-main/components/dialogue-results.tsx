"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Copy, Check, RefreshCw, Clock, User, Sparkles, ShoppingCart } from "lucide-react"
import { DiversityIndicator } from "./diversity-indicator"
import type { DialogueResult } from "@/lib/types"

interface DialogueResultsProps {
  results: DialogueResult[]
  isGenerating: boolean
  onRegenerate: (index: number) => void
  diversityInfo?: {
    conceptsUsed: string[]
    openingsUsed: string[]
  }
}

export function DialogueResults({ results, isGenerating, onRegenerate, diversityInfo }: DialogueResultsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (results.length === 0 && !isGenerating) {
    return (
      <Card className="border-lime/30 shadow-lg shadow-lime/10 h-full min-h-[400px] bg-gradient-to-br from-card to-lime/5">
        <CardContent className="flex flex-col items-center justify-center h-full py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lime/20 to-christmas-gold/20 flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-lime-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Chưa có đoạn hội thoại nào</h3>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            Nhập thông tin sản phẩm và nhấn &quot;Tạo hội thoại&quot; để AI tạo các đoạn thoại phù hợp cho video TikTok
            Shop của bạn
          </p>
          <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-lime/10 text-lime-foreground text-xs">
            <ShoppingCart className="w-4 h-4" />
            Tối ưu cho TikTok Shop
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isGenerating && results.length === 0) {
    return (
      <Card className="border-lime/30 shadow-lg shadow-lime/10 bg-gradient-to-br from-card to-lime/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lime to-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            Đang tạo hội thoại...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gradient-to-r from-lime/10 to-christmas-gold/10 rounded-xl" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-lime/30 shadow-lg shadow-lime/10 bg-gradient-to-br from-card to-lime/5">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lime to-primary flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          Kết quả ({results.length} đoạn thoại)
          <span className="ml-auto text-xs px-2 py-1 rounded-full bg-christmas-red/10 text-christmas-red flex items-center gap-1">
            <ShoppingCart className="w-3 h-3" />
            TikTok Shop
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Hiển thị thông tin đa dạng */}
          <DiversityIndicator
            diversityInfo={diversityInfo}
            dialogueCount={results.length}
          />

          {results.map((result, index) => (
            <DialogueCard
              key={index}
              result={result}
              index={index}
              isCopied={copiedIndex === index}
              onCopy={() => handleCopy(result.dialogue, index)}
              onRegenerate={() => onRegenerate(index)}
              isRegenerating={isGenerating}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface DialogueCardProps {
  result: DialogueResult
  index: number
  isCopied: boolean
  onCopy: () => void
  onRegenerate: () => void
  isRegenerating: boolean
}

function DialogueCard({ result, index, isCopied, onCopy, onRegenerate, isRegenerating }: DialogueCardProps) {
  const categoryColors: Record<string, string> = {
    content: "bg-lime/20 text-lime-foreground",
    price: "bg-christmas-gold/20 text-christmas-gold",
    promotion: "bg-christmas-red/20 text-christmas-red",
  }

  const categoryLabels: Record<string, string> = {
    content: "Nội dung SP",
    price: "Về giá",
    promotion: "Khuyến mãi",
  }

  return (
    <div className="group relative border border-lime/20 rounded-xl p-4 hover:border-lime/50 hover:shadow-md hover:shadow-lime/10 transition-all bg-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-lime-foreground bg-lime/20 px-2 py-0.5 rounded">#{index + 1}</span>
          <span className={`text-xs px-2 py-1 rounded-md ${categoryColors[result.category] || "bg-secondary"}`}>
            {categoryLabels[result.category] || result.category}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{result.estimatedDuration}s</span>
          <span className="mx-1">•</span>
          <User className="w-3 h-3" />
          <span>{result.gender === "female" ? "Nữ" : "Nam"}</span>
        </div>
      </div>

      {/* Dialogue Content - Background gradient */}
      <div className="bg-gradient-to-r from-lime/5 to-christmas-gold/5 rounded-lg p-4 mb-3 border border-lime/10">
        {result.dialogue.includes("Tạo một video theo bối cảnh") ? (
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
            <div className="bg-gradient-to-r from-lime/10 to-christmas-gold/10 rounded-lg p-3 border border-lime/20">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-lime-600" />
                <span className="text-xs font-semibold text-lime-700">NỘI DUNG THOẠI</span>
              </div>
              <p className="text-sm leading-relaxed">
                {result.dialogue.split("Tạo một video theo bối cảnh của sản phẩm để cho nhân vật sử dụng sản phẩm và dùng sản phẩm một cách chân thực nhất có câu thoại như sau:\n\n")[1] || result.dialogue}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.dialogue}</p>
        )}
      </div>

      {/* Word count & Actions */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {result.wordCount} từ • ~{result.estimatedDuration} giây
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="h-8 px-3 text-xs hover:bg-lime/10 hover:text-lime-foreground"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isRegenerating ? "animate-spin" : ""}`} />
            Tạo lại
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onCopy}
            className="h-8 px-3 text-xs bg-lime/20 text-lime-foreground hover:bg-lime/30"
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Đã copy
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
