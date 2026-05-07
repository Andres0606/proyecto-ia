import { NextRequest, NextResponse } from "next/server";

const FLASK_URL =
  process.env.FLASK_API_URL ||
  "https://estabilidaduccproyectopython-production.up.railway.app";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const mappedBody = {
      "Programa academico del que es egresado": body.Programa,
      "Genero": body.Genero,
      "Edad_Codificada": body.Edad,
      "Estrato": body.Estrato,
      "Estado civil": body.EstadoCivil,
      "Numero de hijos": body.Hijos,
      "Nivel de formacion actual": body.Formacion,
      "Tiene Emprendimiento": body.Emprendimiento,
      "Tipo de organizacion donde labora": body.TipoOrg,
      "Area en la cual se desempena": body.Area,
      "Tamano Organizacion": body.Tamano,
      "Sector economico pertenece empresa": body.Sector,
      "Ingreso Mensual": body.Ingreso
    };

    const flaskRes = await fetch(`${FLASK_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(mappedBody),
    });

    if (!flaskRes.ok) {
      const text = await flaskRes.text();
      return NextResponse.json(
        { error: `Flask error ${flaskRes.status}`, detail: text },
        { status: flaskRes.status }
      );
    }

    const data = await flaskRes.json();

    // Guardar resultado si hay userId
    if (body.userId) {
      try {
        const { cookies } = await import("next/headers");
        const { createClient } = await import("@/utils/supabase/server");
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        
        // El score es la probabilidad de estabilidad (usamos Larga si existe, o la predicción principal)
        const score = data.Larga ?? data.estabilidad ?? data.prediction ?? 0;
        const finalScore = score <= 1 ? score * 100 : score;

        await supabase.from("resultados_modelo").insert({
          user_id: body.userId,
          resultado_estabilidad: finalScore,
          programa_academico: body.Programa, // Guardamos el programa usado en el test
          genero: body.Genero, // Guardamos el género usado en el test
        });
      } catch (dbErr) {
        console.error("❌ Error persistiendo resultado:", dbErr);
      }
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
