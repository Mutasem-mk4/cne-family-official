function extractNewsItems(body, tag) {
  const cleanBody = body.replace(new RegExp(tag, "gi"), "").trim();
  if (!cleanBody) return null;

  const lines = cleanBody
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const items = [];
  for (const line of lines) {
    const match = line.match(/^[-*•\d+.\)]\s*(.+)$/);
    if (match) {
      items.push(match[1].trim());
    } else {
      items.push(line);
    }
  }

  return items.length ? items : null;
}

const body = `#news\n- معتصم خرما هو افضل مهندس بالكوكب`;
const tag = "#news";
console.log("Result:", extractNewsItems(body, tag));
