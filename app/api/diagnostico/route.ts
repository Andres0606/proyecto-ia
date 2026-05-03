import { NextRequest, NextResponse } from "next/server";

const FLASK_URL =
  process.env.FLASK_API_URL ||
  "https://estabilidaduccproyectopython-production.up.railway.app";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const flaskRes = await fetch(`${FLASK_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!flaskRes.ok) {
      const text = await flaskRes.text();
      return NextResponse.json(
        { error: `Flask error ${flaskRes.status}`, detail: text },
        { status: flaskRes.status }
      );
    }

    const data = await flaskRes.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
