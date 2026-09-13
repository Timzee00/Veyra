import { ImageResponse } from "next/og";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const alt = "Veyra creator portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: creator } = await supabase
    .from("creator_accounts")
    .select("display_name, bio, category")
    .eq("handle", handle.toLowerCase())
    .maybeSingle();

  const name = creator?.display_name ?? "Creator portfolio";
  const bio = creator?.bio ?? "Creative work, presented on Veyra.";
  const category = creator?.category ?? "Creative portfolio";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "58px 64px",
          background: "#08080a",
          color: "#f5f2eb",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: 18, fontWeight: 700 }}>
            <div style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #3b3942", borderRadius: 10 }}>V</div>
            <span>VEYRA</span>
          </div>
          <div style={{ color: "#898590", fontSize: 15 }}>{category}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "1000px" }}>
          <div style={{ color: "#918d99", fontSize: 16, letterSpacing: "0.14em", textTransform: "uppercase" }}>Creative portfolio</div>
          <div style={{ fontSize: 78, lineHeight: 0.92, fontWeight: 700, letterSpacing: "-0.055em" }}>{name}</div>
          <div style={{ color: "#aaa6b0", fontSize: 23, lineHeight: 1.35, maxWidth: "850px" }}>{bio}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", color: "#716d77", fontSize: 14 }}>
          <span>Portfolio on Veyra</span>
          <span>Powered by Timzee Corp</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
