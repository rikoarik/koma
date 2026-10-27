import asyncio
import json
import pathlib
import subprocess
import edge_tts

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / "assets" / "voice"
OUT.mkdir(parents=True, exist_ok=True)

SCRIPT = [
    {
        "id": "01-hook",
        "text": "Pernah ngetik panjang... terus dihapus semua?",
        "start": 0.2
    },
    {
        "id": "02-hesitation",
        "text": "Udah ditulis, dibaca ulang, nggak jadi dikirim.",
        "start": 3.8
    },
    {
        "id": "03-fragments",
        "text": "Padahal masih pengen cerita, cuma bingung ke siapa.",
        "start": 8.2
    },
    {
        "id": "04-brand",
        "text": "Koma. Cerita apa aja, tanpa harus kirim ke siapa-siapa.",
        "start": 12.6
    }
]

async def produce(line):
    path = OUT / (line["id"] + ".mp3")
    words = []
    # Natural young-adult conversational pacing
    voice = edge_tts.Communicate(line["text"], "id-ID-ArdiNeural", rate="+10%", pitch="-1Hz", boundary="WordBoundary")
    with path.open("wb") as audio:
        async for chunk in voice.stream():
            if chunk["type"] == "audio":
                audio.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                words.append({
                    "text": chunk["text"],
                    "start": round(chunk["offset"] / 1e7, 3),
                    "end": round((chunk["offset"] + chunk["duration"]) / 1e7, 3)
                })
    duration = float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(path)]
    ))
    duration = round(duration, 3)
    print(f"Generated {line['id']}: duration={duration}s, words={len(words)}")
    return {
        **line,
        "file": f"assets/voice/{path.name}",
        "duration": duration,
        "words": words
    }

async def main():
    (ROOT / "script.json").write_text(json.dumps(SCRIPT, ensure_ascii=False, indent=2))
    results = []
    for line in SCRIPT:
        res = await produce(line)
        results.append(res)
    (ROOT / "voice-timing.json").write_text(json.dumps(results, ensure_ascii=False, indent=2))
    print("Voice generation complete.")

if __name__ == "__main__":
    asyncio.run(main())
