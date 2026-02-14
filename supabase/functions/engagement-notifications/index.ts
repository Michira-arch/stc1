
/*
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
    title?: string;
    body?: string;
    deepLink?: string;
    preview?: boolean; // If true, just return the generated text without sending
    force?: boolean;   // Override time check
}

// Helper: Fisher-Yates shuffle for keys
const getApiKeys = () => {
    const keys = [
        Deno.env.get('GROQ_API_KEY'),
        Deno.env.get('GROQ_API_KEY_2'),
        Deno.env.get('GROQ_API_KEY_3'),
    ].filter((k): k is string => !!k && k.length > 0);

    for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    return keys;
};

// Helper: Call Groq with rotation
const callGroq = async (messages: any[], model: string) => {
    const keys = getApiKeys();
    if (keys.length === 0) throw new Error("No GROQ_API_KEY set in environment");

    let lastError: any;

    for (const apiKey of keys) {
        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    max_tokens: 100, // Short hook
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Groq API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content?.trim();
        } catch (error) {
            console.error(`API Key ending in ...${apiKey.slice(-4)} failed:`, error);
            lastError = error;
            // Continue to next key
        }
    }
    throw lastError || new Error("All API keys failed");
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 1. Time Check (Africa/Nairobi - GMT+3)
        const now = new Date();
        // Use Intl to get the current hour in Nairobi
        const nairobiTime = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Africa/Nairobi',
            hour: 'numeric',
            hour12: false
        }).format(now);

        const currentHour = parseInt(nairobiTime, 10);
        const isWithinWindow = currentHour >= 10 && currentHour < 17;

        // 2. Auth & Input
        const { title, body, deepLink, preview, force } = await req.json() as NotificationRequest;

        // Safeguard
        if (!isWithinWindow && !force && !preview) {
            console.log(`Outside window (Current Hour: ${currentHour} EAT). Skipping send.`);
            return new Response(JSON.stringify({
                success: false,
                message: "Outside of the 10AM-5PM GMT+3 window. Use 'force: true' to override for testing."
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Missing Authorization header');

        // Simple Admin Check (matching existing upper/lower case role logic)
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

        if (user) {
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            const role = profile?.role?.toUpperCase();
            if (role !== 'ADMIN') {
                throw new Error('Unauthorized: Admin access required');
            }
        }

        let notificationTitle = title || "Campus Update";
        let notificationBody = body || "";
        let dataPayload = { url: deepLink || "/" };

        // 3. AI Autonomous Mode (Moonshot via Groq)
        if (!notificationBody) {
            console.log("Autonomous Mode: Finding trending content...");

            const { data: stories } = await supabaseClient
                .from('stories')
                .select('id, title, description')
                .eq('is_hidden', false)
                .gt('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
                .order('views_count', { ascending: false })
                .limit(3);

            if (stories && stories.length > 0) {
                const story = stories[0]; // Top story

                try {
                    const promptMessages = [
                        {
                            role: 'system',
                            content: 'You are a social media bot for a university campus app called UniCampus. Write a very short, high-curiosity "hook" notification (under 15 words) to get students to check out a new trending story. Use emojis sparingly. Be catchy but not clickbaity.'
                        },
                        {
                            role: 'user',
                            content: `Trending Story Title: "${story.title}"\nDescription: "${story.description || ''}"`
                        }
                    ];

                    // Use Moonshot AI (Kimi K2)
                    const generatedText = await callGroq(promptMessages, "moonshotai/kimi-k2-instruct-0905");

                    notificationBody = generatedText || `Check out what's trending: ${story.title}`;
                } catch (e) {
                    console.error("AI Generation failed, using fallback:", e);
                    notificationBody = `Everyone is talking about: "${story.title}". See what's happening.`;
                }

                notificationTitle = title || "Trending on UniCampus ⚡";
                dataPayload = { url: `/story/${story.id}` };
            } else {
                notificationTitle = "Campus Connect";
                notificationBody = "Stay updated with what's happening on campus today!";
            }
        }

        if (preview) {
            return new Response(JSON.stringify({ title: notificationTitle, body: notificationBody, hourEAT: currentHour }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 4. FCM Send
        const serverKey = Deno.env.get('FIREBASE_SERVER_KEY');
        if (!serverKey) throw new Error("FIREBASE_SERVER_KEY not set in Secrets");

        const { data: tokens } = await supabaseClient
            .from('fcm_tokens')
            .select('token');

        if (!tokens || tokens.length === 0) {
            return new Response(JSON.stringify({ message: "No devices to send to" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const registrationIds = tokens.map(t => t.token);

        const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${serverKey}`
            },
            body: JSON.stringify({
                registration_ids: registrationIds,
                notification: {
                    title: notificationTitle,
                    body: notificationBody,
                    sound: 'default'
                },
                data: dataPayload
            })
        });

        const fcmResult = await fcmResponse.json();

        // 5. Audit Log
        await supabaseClient.from('notifications').insert({
            title: notificationTitle,
            body: notificationBody,
            sent_by: user?.id || null,
            is_global: true,
            data: dataPayload
        });

        return new Response(JSON.stringify({ success: true, fcmResult, hourEAT: currentHour }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
*/