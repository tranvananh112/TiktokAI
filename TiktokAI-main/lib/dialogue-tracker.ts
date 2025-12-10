// Hệ thống theo dõi và tránh lặp lại nội dung đoạn thoại

interface DialogueHistory {
    productName: string
    dialogues: string[]
    concepts: string[]
    openings: string[]
    timestamp: number
}

// Lưu trữ tạm thời trong memory (trong production nên dùng database)
const dialogueHistory = new Map<string, DialogueHistory>()

// Thời gian lưu trữ lịch sử (24 giờ)
const HISTORY_DURATION = 24 * 60 * 60 * 1000

export function getProductHistory(productName: string): DialogueHistory | null {
    const key = productName.toLowerCase().trim()
    const history = dialogueHistory.get(key)

    if (!history) return null

    // Kiểm tra xem lịch sử có còn hợp lệ không
    if (Date.now() - history.timestamp > HISTORY_DURATION) {
        dialogueHistory.delete(key)
        return null
    }

    return history
}

export function saveDialogueHistory(
    productName: string,
    dialogues: string[],
    concepts: string[],
    openings: string[]
): void {
    const key = productName.toLowerCase().trim()
    const existing = dialogueHistory.get(key)

    const history: DialogueHistory = {
        productName,
        dialogues: existing ? [...existing.dialogues, ...dialogues] : dialogues,
        concepts: existing ? [...existing.concepts, ...concepts] : concepts,
        openings: existing ? [...existing.openings, ...openings] : openings,
        timestamp: Date.now()
    }

    // Giới hạn số lượng để tránh memory leak
    if (history.dialogues.length > 50) {
        history.dialogues = history.dialogues.slice(-30)
    }
    if (history.concepts.length > 20) {
        history.concepts = history.concepts.slice(-15)
    }
    if (history.openings.length > 20) {
        history.openings = history.openings.slice(-15)
    }

    dialogueHistory.set(key, history)
}

export function getAvailableConcepts(productName: string, allConcepts: string[]): string[] {
    const history = getProductHistory(productName)
    if (!history) return allConcepts

    return allConcepts.filter(concept => !history.concepts.includes(concept))
}

export function getAvailableOpenings(productName: string, allOpenings: string[]): string[] {
    const history = getProductHistory(productName)
    if (!history) return allOpenings

    return allOpenings.filter(opening => !history.openings.includes(opening))
}

export function checkSimilarity(newDialogue: string, existingDialogues: string[]): boolean {
    const newWords = new Set(newDialogue.toLowerCase().split(/\s+/))

    for (const existing of existingDialogues) {
        const existingWords = new Set(existing.toLowerCase().split(/\s+/))
        const intersection = new Set([...newWords].filter(x => existingWords.has(x)))
        const similarity = intersection.size / Math.min(newWords.size, existingWords.size)

        // Nếu độ tương đồng > 40% thì coi là giống
        if (similarity > 0.4) {
            return true
        }
    }

    return false
}

export function generateUniquePromptElements(productName: string) {
    const allAngles = [
        "personal_story", "problem_solution", "before_after", "expert_review",
        "trending_topic", "comparison", "secret_tip", "user_testimonial",
        "behind_scenes", "myth_busting", "seasonal_relevance", "lifestyle_integration",
        "emotional_appeal", "scientific_proof", "celebrity_endorsement", "community_feedback"
    ]

    const allOpenings = [
        "Mọi người ơi!", "Thật không thể tin được!", "Hôm nay mình phát hiện ra...",
        "Ai cũng hỏi mình bí quyết...", "Sau bao lâu tìm hiểu...", "Bạn có biết không...",
        "Mình đã thử hàng trăm sản phẩm...", "Trending gì thế này...", "Real review nè mọi người!",
        "Mình phải chia sẻ ngay...", "Không thể giữ bí mật này...", "Update mới nhất nè...",
        "Chị em ơi, nghe mình kể...", "Viral quá rồi sản phẩm này!", "Mình shock luôn á...",
        "Bao lâu rồi mới thấy...", "Thử xem có thật không...", "Mọi người đã sẵn sàng chưa?"
    ]

    const allTones = [
        "excited_friend", "trusted_expert", "honest_reviewer", "trendy_influencer",
        "caring_sister", "knowledgeable_guide", "enthusiastic_fan", "practical_advisor"
    ]

    const availableAngles = getAvailableConcepts(productName, allAngles)
    const availableOpenings = getAvailableOpenings(productName, allOpenings)

    return {
        angles: availableAngles.length > 0 ? availableAngles : allAngles,
        openings: availableOpenings.length > 0 ? availableOpenings : allOpenings,
        tones: allTones
    }
}