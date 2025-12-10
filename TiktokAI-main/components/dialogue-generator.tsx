"use client"

import { useState } from "react"
import { Header } from "./header"
import { ProductInputForm } from "./product-input-form"
import { DialogueResults } from "./dialogue-results"
import { UpdateNotification } from "./update-notification"
import { DemoComparison } from "./demo-comparison"
import { VideoInstructionDemo } from "./video-instruction-demo"
import type { DialogueResult, FormData } from "@/lib/types"

export function DialogueGenerator() {
  const [results, setResults] = useState<DialogueResult[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [diversityInfo, setDiversityInfo] = useState<{ conceptsUsed: string[], openingsUsed: string[] } | undefined>()

  const handleGenerate = async (data: FormData) => {
    setIsGenerating(true)
    setFormData(data)

    try {
      const response = await fetch("/api/generate-dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      setResults(result.dialogues)
      setDiversityInfo(result.diversityInfo)
    } catch (error) {
      console.error("Error generating dialogues:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = async (index: number) => {
    if (!formData) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, count: 1 }),
      })

      const result = await response.json()
      setResults((prev) => {
        const newResults = [...prev]
        newResults[index] = result.dialogues[0]
        return newResults
      })
    } catch (error) {
      console.error("Error regenerating:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex-1 container mx-auto px-4 py-8">
        <UpdateNotification />
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Input Form */}
          <div className="space-y-6">
            <ProductInputForm onGenerate={handleGenerate} isGenerating={isGenerating} />
          </div>

          {/* Right: Results */}
          <div className="space-y-6">
            <DialogueResults
              results={results}
              isGenerating={isGenerating}
              onRegenerate={handleRegenerate}
              diversityInfo={diversityInfo}
            />

            {/* Demo comparison khi chưa có kết quả */}
            {results.length === 0 && !isGenerating && (
              <div className="space-y-6">
                <VideoInstructionDemo />
                <DemoComparison />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
