function hasAudio (video) {
    return video.mozHasAudio ||
    Boolean(video.webkitAudioDecodedByteCount) ||
    Boolean(video.audioTracks && video.audioTracks.length);
}

function setVideoInGIFMode(video) {
    if (!hasAudio(video)) {
        if (typeof video.loop == 'boolean' && video.duration <= 10.0) {
            video.classList.add("video-gif-mode");
            video.loop = true;
            video.controls = false;
            video.addEventListener("mouseover", () => {
                video.play();
            })
            video.addEventListener("mouseleave", () => {
                video.pause();
            })
        }
    };
}

const videos = document.getElementsByTagName("video")
for (var i = 0; i < videos.length; i++) {
    if (videos[i].duration) {
        setVideoInGIFMode(videos[i]);
    } else {
        videos[i].addEventListener("loadeddata", function() {
            setVideoInGIFMode(this);
        });
    }
}
