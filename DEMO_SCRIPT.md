# Copiedcatz Demo Script

## Overview (30 seconds)
> "Copiedcatz extracts the Visual DNA from any image—camera angles, lighting, composition, and style—and gives you a copyable JSON recipe you can use to generate infinite variations."

---

## Demo Flow (3-5 minutes)

### 1. The Problem (30 seconds)
> "Ever tried to recreate a photo's look? You describe it to an AI: 'dramatic lighting, shallow depth of field...' and get something completely different. That's because traditional prompts are vague. There's no standard format."

### 2. The Solution (30 seconds)
> "Copiedcatz solves this with Visual DNA—a structured JSON format that captures every visual parameter. Upload any image, and our AI extracts a complete recipe you can copy, share, and remix."

---

### 3. Live Demo

#### Step 1: Upload an Image
1. Go to **Dashboard**
2. Click **"Extract Visual DNA"** or drag-drop an image
3. Wait for extraction (show progress: "Analyzing visual DNA... Converting to structured JSON...")

> "Watch as FIBO—Bria's visual AI—analyzes the image, then Gemini converts it into clean, structured JSON."

#### Step 2: View the JSON
1. Once redirected to Editor, click the **Code icon** (JSON mode)
2. Show the structured JSON with all parameters:

```json
{
  "short_description": "Professional product shot of sneakers",
  "objects": [{
    "description": "White running shoes",
    "location": "center",
    "relative_size": "large"
  }],
  "lighting": {
    "conditions": "Studio softbox",
    "direction": "45 degree from left",
    "shadows": "Soft, diffused"
  },
  "photographic_characteristics": {
    "depth_of_field": "Shallow (f/2.8)",
    "camera_angle": "Low angle",
    "lens_focal_length": "85mm portrait"
  }
}
```

> "This is your Visual DNA. Every detail—camera angle, lighting direction, depth of field—captured in a format anyone can understand and use."

#### Step 3: Copy & Share
1. Click **"Copy JSON"** button (turns green: "Copied!")
2. Show the **"Download"** button

> "Copy this JSON to share with your team, use in other tools, or save for later. It's a universal recipe."

#### Step 4: Edit & Remix
1. Switch to **Visual Mode** (Type icon)
2. Show the tabs: **Objects, Camera, Lighting, Style**
3. Change something (e.g., Camera Angle → "Bird's Eye View")
4. Or use **Quick Edit with AI**: type "Make the lighting more dramatic"

> "Edit visually or use natural language. The AI updates only what you ask—no random changes."

#### Step 5: Generate Variation
1. Click **"Generate Variation"**
2. Show the new image appearing

> "Same Visual DNA, new image. Consistent results every time."

---

### 4. Key Differentiators (30 seconds)

| Feature | Traditional AI | Copiedcatz |
|---------|---------------|------------|
| Prompts | Vague text | Structured JSON |
| Control | Random | Deterministic |
| Sharing | Screenshots | Copy JSON |
| Editing | Start over | Tweak parameters |

---

## Talking Points

### For Designers
> "Stop describing what you want. Show it, extract it, remix it."

### For Developers
> "The JSON is your API. Build automations, batch processing, CI/CD for visuals."

### For Teams
> "Share Visual DNA, not mood boards. Everyone generates consistent results."

---

## Q&A Prep

**Q: How is this different from img2img?**
> "img2img copies pixels. We extract the recipe—the camera settings, lighting setup, composition rules—so you can apply them to completely different subjects."

**Q: Can I use my own images?**
> "Yes, any image. Upload a competitor's ad, a movie still, or your own photo."

**Q: What about copyright?**
> "FIBO is trained on licensed data. The Visual DNA is a description, not a copy. Like a recipe, not the dish."

**Q: How accurate is the extraction?**
> "FIBO analyzes 100+ visual attributes. Gemini structures them into clean JSON. You can always tweak the result."

---

## Demo Checklist

- [ ] Have 2-3 interesting images ready to upload
- [ ] Test the flow before demo (upload → extract → edit → generate)
- [ ] Check Supabase edge function secrets are set:
  - `BRIA_API_TOKEN`
  - `GEMINI_API_KEY`
  - `PUSHER_*` credentials
- [ ] Have fallback screenshots if live demo fails

---

## One-Liner Pitch
> "Copiedcatz extracts Visual DNA from images—camera, lighting, composition—as copyable JSON you can remix to generate consistent variations."

## Hackathon Angle
> "Built for the Bria FIBO Hackathon. We're using FIBO's structured prompt API with Gemini to create a no-code Visual DNA editor."
