"""Generate the commissioned Indonesian narration and native word boundaries."""
import asyncio, json, pathlib, subprocess, sys
import edge_tts

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / "assets" / "voice"
OUT.mkdir(parents=True, exist_ok=True)

async def produce(line):
    path = OUT / (line["id"] + ".mp3")
    words = []
    voice = edge_tts.Communicate(line["text"], "id-ID-ArdiNeural", rate="+6%", pitch="-2Hz", boundary="WordBoundary")
    with path.open("wb") as audio:
        async for chunk in voice.stream():
            if chunk["type"] == "audio": audio.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                words.append({"text":chunk["text"], "start":chunk["offset"]/1e7, "end":(chunk["offset"]+chunk["duration"])/1e7})
    duration = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",str(path)]))
    print(line["id"], round(duration,3), flush=True)
    return {**line,"file":"assets/voice/"+path.name,"duration":duration,"words":words}

async def main():
    lines = json.loads((ROOT/"script.json").read_text())
    if len(sys.argv)>1:
        previous = json.loads((ROOT/"voice-timing.json").read_text())
        target = next(x for x in lines if x['id']==sys.argv[1])
        revised = await produce(target)
        result = [revised if x['id']==target['id'] else x for x in previous]
        (ROOT/"voice-timing.json").write_text(json.dumps(result,ensure_ascii=False,indent=2))
        return
    result=[]
    for i in range(0,len(lines),3): result.extend(await asyncio.gather(*(produce(x) for x in lines[i:i+3])))
    (ROOT/"voice-timing.json").write_text(json.dumps(result,ensure_ascii=False,indent=2))

asyncio.run(main())
