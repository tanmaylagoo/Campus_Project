const { GoogleGenAI } = require('@google/genai');
const FoodItem = require('../models/foodItem.model');

// Initialize Gemini client lazily
let aiClient = null;
const getAIClient = () => {
    if (!aiClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('GEMINI_API_KEY is not defined in backend environment.');
            return null;
        }
        aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
};

// Fallback response generator if external AI API is unreachable
const generateSmartFallback = (query, menuItems = []) => {
    const q = query.toLowerCase();

    // 1. Sickness / Unwell / Upset stomach
    if (q.includes('sick') || q.includes('fever') || q.includes('cold') || q.includes('stomach') || q.includes('digestion') || q.includes('ill') || q.includes('unwell')) {
        return "When feeling unwell or with a delicate stomach, it's best to stick to light, non-greasy foods. From our campus menu:\n\n" +
            "• **Sada Dosa (₹47)**: Light, fermented, and easy on the stomach. Ask for mild sambar.\n" +
            "• **Plain Uttapam (₹79)**: Soft and gentle to digest.\n" +
            "• **Hot Ginger/Cardamom Chai (₹15)**: Soothing for colds, sore throat, or fatigue.\n\n" +
            "⚠️ Avoid oily deep-fried snacks like Vada Pav or Samosa Pav and spicy Chinese sauces until you feel better!";
    }

    // 2. Fasting / Vrat / Religious diets
    if (q.includes('fast') || q.includes('vrat') || q.includes('upvas') || q.includes('navratri') || q.includes('ekadashi')) {
        return "For traditional fasts (vrat/upvas):\n\n" +
            "• Most standard canteen dishes (like Vada Pav, Samosa Pav, Noodles, Sandwiches) contain regular grains (wheat/maida), onion, or garlic, which are usually avoided during strict fasts.\n" +
            "• **Beverages**: Hot Chai (₹15) or Filter Coffee (₹20) are acceptable for many fasting traditions.\n\n" +
            "💡 Tip: Please check with our canteen counter staff to see if any special fasting items (like Sabudana Khichdi or fruit options) are available today!";
    }

    // 3. Diet / Weight loss / Low calorie / Healthy
    if (q.includes('diet') || q.includes('calorie') || q.includes('weight') || q.includes('gym') || q.includes('protein') || q.includes('healthy') || q.includes('fat')) {
        return "Looking for healthier, diet-friendly campus meals? Here are the best picks:\n\n" +
            "• **Sada Dosa (₹47, ~8 mins prep)**: Fermented rice & lentil crepe, low fat, and easy to burn off (~160 kcal).\n" +
            "• **Masala Uttappa (₹79, ~10 mins prep)**: Packed with vegetable toppings; avoid extra butter for a clean carb meal.\n" +
            "• **Avoid**: Deep-fried carbs (Vada Pav, Samosa Pav) and oily Chinese items (Schezwan Rice, Hakka Noodles) which are higher in calories and saturated fats.\n\n" +
            "Stay hydrated and pair with water or black tea!";
    }

    // 4. Quick meals (<10 mins prep)
    if (q.includes('quick') || q.includes('fast') || q.includes('hurry') || q.includes('rush') || q.includes('late')) {
        return "In a rush between campus lectures? Our fastest meals:\n\n" +
            "• **Vada Pav (₹22)** — Ready in ~5 mins!\n" +
            "• **Samosa Pav (₹22)** — Ready in ~5 mins!\n" +
            "• **Sada Dosa (₹47)** — Ready in ~8 mins!\n\n" +
            "You can order ahead on CanteenHub and pick it up right when it's marked ready!";
    }

    // Default menu-aware reply
    const sampleItems = menuItems.slice(0, 4).map(i => `• ${i.name} (₹${i.price}) - ${i.avgPrepTimeMinutes}m prep`).join('\n');
    return `Welcome to CanteenHub! Our kitchen is serving fresh meals today:\n\n${sampleItems}\n\nAsk me about dietary requirements (fasts, sickness, weight loss, allergies) or ingredient details!`;
};

// POST /api/chat — Chatbot endpoint powered by Gemini & live menu database
const chatWithBot = async (req, res) => {
    try {
        const { message, history } = req.body || {};

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'A message prompt is required.',
            });
        }

        // 1. Fetch live available menu items from MongoDB
        const menuItems = await FoodItem.find({ isAvailable: true }).sort({ category: 1 });

        // Compact knowledge base of the menu
        const menuContext = menuItems.map((item) => {
            const ingredients = (item.ingredients || []).join(', ');
            return `- ${item.name} | Category: ${item.category} | Price: ₹${item.price} | Prep: ${item.avgPrepTimeMinutes} mins | Ingredients: [${ingredients}]`;
        }).join('\n');

        // 2. Build system instructions tailored to campus food & dietary needs
        const systemInstruction = `You are "CanteenHub AI", an intelligent, empathetic, and knowledgeable food & nutrition assistant for a university campus canteen.

CURRENT LIVE CANTEEN MENU (Use ONLY these items for menu-related recommendations):
${menuContext}

YOUR RESPONSIBILITIES & EXPERTISE:
1. MENU INQUIRIES: Answer questions about dishes, ingredients, exact prices in Indian Rupees (₹), and prep times accurately based on the live menu above.
2. FASTING / VRAT ADVICE:
   - Understand traditional Indian fasts (e.g. Navratri, Ekadashi, Monday fasts, Upvas).
   - Honestly advise what is or is not suitable. Standard campus items made with wheat/maida (Pav, Noodles, Sandwiches) or onion/garlic (Vada Pav, Samosa Pav, Chinese dishes) are generally NOT permitted during strict fasts.
   - Highlight permissible choices (e.g. Plain milk tea / Chai, black coffee, or advise requesting customized preparation at the counter).
3. SICKNESS / RECOVERY / DIGESTIVE DISTRESS:
   - When a student is unwell, has a cold, fever, or an upset stomach, guide them toward soothing, gentle, low-oil, low-spice options (e.g. Sada Dosa, steamed items, hot Chai/ginger tea).
   - Explicitly warn against greasy, deep-fried snacks (Vada Pav, Samosa Pav) and spicy Chinese meals (Schezwan Rice, Hakka Noodles).
4. DIET / WEIGHT LOSS / FITNESS:
   - Recommend calorie-conscious choices (e.g. Sada Dosa, Uttapam with veggies and less oil).
   - Advise against deep-fried foods and heavy carbs when cutting calories.
5. ALLERGENS & DIETARY CHOICES:
   - Identify vegetarian, vegan, dairy, and gluten elements based on the listed ingredients.

STYLE GUIDELINES:
- Friendly, warm, student-focused tone.
- Keep answers concise and readable with bullet points where appropriate.
- Always quote prices in Indian Rupees (₹) and preparation times in minutes.
- Do NOT hallucinate items that are not on the canteen menu.`;

        // 3. Attempt Gemini API generation
        const ai = getAIClient();

        if (ai) {
            try {
                // Build contents payload including recent conversation turns
                const contents = [];

                // Inject system instruction as first user/model context or system prompt
                contents.push({
                    role: 'user',
                    parts: [{ text: `[System Instruction]\n${systemInstruction}\n\nPlease acknowledge and assist the student.` }],
                });
                contents.push({
                    role: 'model',
                    parts: [{ text: 'Understood! I am CanteenHub AI, ready to assist students with live menu details, dietary recommendations for fasts, sickness, diets, and healthy choices.' }],
                });

                // Append recent conversation history (last 6 messages max)
                if (Array.isArray(history)) {
                    for (const msg of history.slice(-6)) {
                        const role = msg.sender === 'user' || msg.role === 'user' ? 'user' : 'model';
                        const text = msg.text || msg.content || '';
                        if (text.trim()) {
                            contents.push({
                                role,
                                parts: [{ text }],
                            });
                        }
                    }
                }

                // Append latest student question
                contents.push({
                    role: 'user',
                    parts: [{ text: message.trim() }],
                });

                // Call Gemini 3.5 Flash
                const response = await ai.models.generateContent({
                    model: 'gemini-3.5-flash',
                    contents,
                });

                const replyText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;

                if (replyText && replyText.trim()) {
                    return res.status(200).json({
                        success: true,
                        reply: replyText.trim(),
                        modelUsed: 'gemini-3.5-flash',
                    });
                }
            } catch (geminiError) {
                console.error('Gemini API Error (falling back to smart canteen advisor):', geminiError.message);
            }
        }

        // 4. Fallback advisor if Gemini is unreachable
        const fallbackReply = generateSmartFallback(message, menuItems);
        return res.status(200).json({
            success: true,
            reply: fallbackReply,
            modelUsed: 'canteen-advisor-fallback',
        });
    } catch (error) {
        console.error('Error in chatbot controller:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request.',
        });
    }
};

module.exports = {
    chatWithBot,
};

