import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages, model } = await req.json();

        // Get the last user message
        const userQuery = messages[messages.length - 1]?.content || 'Hello';
        const isPortal = model === 'portal';

        // Simple demo response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

                const response = `\n\n**Léger AI [${isPortal ? 'Portal Mode' : 'Normal Mode'}]**\n\nYou asked: "${userQuery}"\n\n${isPortal ? 'Using our most advanced reasoning engine to analyze your request...' : 'Analyzing your brand request with our standard intelligence model...'}\n\n*This is a demo interface. Real AI integration with customized models is ready to be enabled.*`;

                const chunks = response.split('');
                for (const chunk of chunks) {
                    controller.enqueue(encoder.encode(chunk));
                    // Much faster streaming (5-10ms)
                    await delay(5 + Math.random() * 5);
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
            },
        });

    } catch (error) {
        console.error('Chat error:', error);
        return new Response(JSON.stringify({ error: 'Error processing request' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
