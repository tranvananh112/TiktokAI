"use client"

import { Sparkles, Gift, TreePine } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-lime/30 bg-gradient-to-r from-lime/10 via-christmas-gold/10 to-christmas-red/10 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime to-primary flex items-center justify-center shadow-lg shadow-lime/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-lime-foreground via-christmas-red to-primary bg-clip-text text-transparent">
                TikTok Script AI
              </h1>
              <p className="text-sm text-muted-foreground">Tạo hội thoại video bán hàng TikTok Shop</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1 text-christmas-red">
              <TreePine className="w-4 h-4" />
              <Gift className="w-4 h-4 text-christmas-gold" />
              <TreePine className="w-4 h-4" />
            </div>
            <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-lime/20 to-christmas-red/20 text-sm font-medium border border-lime/30">
              Phiên bản Pro
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
