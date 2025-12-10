const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testApiKey() {
    try {
        console.log("🔍 Testing API key: AIzaSyApuSv-1qoB5HlYD9LKBtQDf1AmjSvfr6w");

        const genAI = new GoogleGenerativeAI("AIzaSyApuSv-1qoB5HlYD9LKBtQDf1AmjSvfr6w");

        // Thử với các models text generation
        const modelsToTest = [
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-2.0-flash",
            "gemini-flash-latest"
        ];

        for (const modelName of modelsToTest) {
            try {
                console.log(`\n🧪 Testing: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Chào bạn! Hãy trả lời ngắn: Bạn có thể hoạt động không?");
                const response = await result.response;
                const text = response.text();

                console.log(`✅ ${modelName} hoạt động tốt!`);
                console.log(`📝 Response: ${text.substring(0, 100)}...`);
                return { success: true, model: modelName, response: text };

            } catch (error) {
                console.log(`❌ ${modelName} failed: ${error.message}`);
            }
        }

        return { success: false, error: "No working models found" };

    } catch (error) {
        console.log("❌ API Key có vấn đề:");
        console.log("Error:", error.message);
        return { success: false, error: error.message };
    }
}

testApiKey().then(result => {
    if (result.success) {
        console.log(`\n🎉 KẾT LUẬN: API key hoạt động với model ${result.model}`);
    } else {
        console.log(`\n💥 KẾT LUẬN: API key có vấn đề - ${result.error}`);
    }
});