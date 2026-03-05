Deno.serve(async () => {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }
  return Response.json({ key: apiKey });
});
