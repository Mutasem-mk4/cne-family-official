/**
 * /api/live-data?file=news-ticker.json
 * يجيب البيانات مباشرة من GitHub API بدون أي CDN cache
 * يستخدم التوكن عشان ما نوصل لحد الـ rate limit
 */

const ALLOWED_FILES = new Set(["news-ticker.json", "tech-titans.json"]);

export default async function handler(req, res) {
  const file = req.query?.file;

  if (!file || !ALLOWED_FILES.has(file)) {
    return res.status(400).json({ ok: false, error: "Invalid file" });
  }

  const token = process.env.GITHUB_REPO_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY || "Mutasem-mk4/cne-family-official";

  try {
    const url = `https://api.github.com/repos/${repo}/contents/public/data/${file}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.raw+json",
        "User-Agent": "cne-family-official",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) throw new Error(`GitHub API: ${response.status}`);

    const data = await response.json();

    // منع أي كاشينج — دايماً نسخة طازجة
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
