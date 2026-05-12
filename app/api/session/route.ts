import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function GET(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  const searchParams = request.nextUrl.searchParams;
  const widgetKey = searchParams.get("widgetKey");

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500, headers }
    );
  }

  if (!widgetKey) {
    return NextResponse.json(
      { error: "Missing widgetKey" },
      { status: 400, headers }
    );
  }

  // 1. Fetch Agent Dynamic Config from Supabase
  const { data: agent, error } = await supabase
    .from("agents")
    .select("id, system_prompt, name, is_active")
    .eq("widget_key", widgetKey)
    .single();

  if (error || !agent) {
    return NextResponse.json(
      { error: "Agent not found or invalid key" },
      { status: 404, headers }
    );
  }

  if (!agent.is_active) {
    return NextResponse.json(
      { error: "Agent is currently inactive" },
      { status: 403, headers }
    );
  }

  // 2. Log a new session start in analytics (Async/Optional)
  await supabase.rpc('increment_agent_conversations', { agent_id: agent.id });
  
  // Also log to analytics table for daily tracking
  const today = new Date().toISOString().split('T')[0];
  await supabase.from('analytics')
    .upsert({ 
      agent_id: agent.id, 
      date: today,
    }, { onConflict: 'agent_id,date' })
    .select()
    .then(async ({ data: analytics }) => {
       if (analytics && analytics.length > 0) {
          await supabase.from('analytics')
            .update({ total_calls: (analytics[0].total_calls || 0) + 1 })
            .eq('id', analytics[0].id);
       }
    });

  const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;

  return NextResponse.json({ 
    wsUrl,
    systemInstruction: agent.system_prompt,
    agentName: agent.name
  }, { headers });
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }
  });
}
