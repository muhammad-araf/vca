import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      items,
      total,
      customer_name,
      phone,
      address,
      order_type,
      transcript,
    } = body;

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          items,
          total,
          customer_name,
          phone,
          address,
          order_type,
          transcript,
          status: "pending",
        },
      ])
      .select();

    if (error) {
      console.error("[API] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      id: data[0].id,
      message: "Order saved successfully",
    });
  } catch (err: any) {
    console.error("[API] Error processing order:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
