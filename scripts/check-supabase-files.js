const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://zxbunwdnvkitrnzcbpnt.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YnVud2RudmtpdHJuemNicG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5MTU4MzYsImV4cCI6MjA4NzQ5MTgzNn0.YpOWLPgbo8Wm4pRvhqFT87vUwB7dPekZ7jtiJOlYoFc",
  { auth: { persistSession: false } }
);

async function main() {
  // Try the database
  console.log("Trying database...");
  const { data, error } = await supabase
    .from("portfolio_content")
    .select("id, projects, testimonials, experience_entries")
    .eq("id", "main")
    .maybeSingle();

  if (error) {
    console.log("DB error:", error.message);
    return;
  }

  if (data) {
    console.log("Database accessed successfully!");
    
    // Extract all URLs from the data
    const dataStr = JSON.stringify(data);
    const supabaseUrls = [];
    const regex = /https?:\/\/[^"'\s]*supabase[^"'\s]*/gi;
    let match;
    while ((match = regex.exec(dataStr)) !== null) {
      supabaseUrls.push(match[0]);
    }
    
    if (supabaseUrls.length > 0) {
      console.log("\nFound Supabase Storage URLs in database:");
      supabaseUrls.forEach((u, i) => console.log(`  ${i + 1}. ${u}`));
    } else {
      console.log("\nNo Supabase Storage URLs found.");
      console.log("All assets use local paths (/image.png, /comradz.png, etc.)");
    }
  }
}

main().catch((e) => console.error(e));