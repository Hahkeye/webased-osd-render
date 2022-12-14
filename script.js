const frames = [];
const button = document.querySelector("button");
const select = document.querySelector("select");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

button.onclick = async(evt) => {
  if (window.MediaStreamTrackProcessor) {
    let stopped = false;
    const track = await getVideoTrack();
    const processor = new MediaStreamTrackProcessor(track);
    const reader = processor.readable.getReader();
    readChunk();

    function readChunk() {
      reader.read().then(async({ done, value }) => {
        if (value) {
        //   console.log(value.constructor.name);
        //   console.log(value.colorSpace);
          const bitmap = await createImageBitmap(value);
          const index = frames.length;
          frames.push(bitmap);
          select.append(new Option("Frame #" + (index + 1), index));
          value.close();
        }
        if (!done && !stopped) {//recursive read
          readChunk();
        } else {
          select.disabled = false;
        }
      });
    }
    button.onclick = (evt) => stopped = true;
    button.textContent = "stop";
  } else {
    console.error("your browser doesn't support this API yet");
  }
};

select.onchange = (evt) => {
  const frame = frames[select.value];
  canvas.width = frame.width;
  canvas.height = frame.height;
  ctx.drawImage(frame, 0, 0);
};

async function getVideoTrack() {
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.src = "./test.mp4";
  document.body.append(video);
  await video.play();
  const [track] = video.captureStream().getVideoTracks();
  video.onended = (evt) => track.stop();
  return track;
}