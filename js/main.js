var mediaPlayer;
var video;
var onScreenControls = [];
var videoContextMenuContainer;
var videoBufferBar;
var videoProgressBar;
var videoSeekSlider;
var videoSeekTooltip;
var videoPlayButton;
var videoVolumeButton;
var videoVolumeSlider;
var videoSettingsButton;
var videoSettingsOptions = [];
var videoSettingsMenu;
var videoPipButton;
var videoFullScreenButton;
var settingsMenuVisible;
var volumeSliderVisible;
var contextMenuVisible;

document.addEventListener('DOMContentLoaded', domLoaded, false);

function domLoaded() {
    mediaPlayer = document.getElementById('hv-media-player');
    video = document.getElementById('hv-media-video');
    videoContextMenuContainer = document.getElementById('hv-media-context-menu-container');

    // document.addEventListener('click', () => { contextMenuVisible = false; toggleContextMenu();}, false);
    // document.addEventListener('contextmenu', (e) => { contextMenuVisible = false; toggleContextMenu();}, false);
    mediaPlayer.addEventListener('click', () => { contextMenuVisible = false; toggleContextMenu();}, false);
    mediaPlayer.addEventListener('contextmenu', (e) => { 
        e.preventDefault(); 
        contextMenuVisible = true; 
        toggleContextMenu(e.pageX - mediaPlayer.offsetLeft, e.pageY - mediaPlayer.offsetTop);
    }, false);
    contextMenuVisible = false;

	video.addEventListener('loadstart', initializeMediaPlayer, false);
	video.addEventListener('loadedmetadata', initializeVideoControls, false);
    video.addEventListener('loadeddata', initializeVideo, false);
    video.addEventListener('stalled', videoStalled, false);
    video.addEventListener('error', videoError, false);

    checkOrientationChange();
}

function toggleContextMenu(x, y) {
    if(contextMenuVisible) {
        videoContextMenuContainer.style.display = 'block';
        videoContextMenuContainer.style.left = x + 'px';
        videoContextMenuContainer.style.top = y + 'px';
    } else {
        videoContextMenuContainer.style.display = 'none';
    }
}

function checkOrientationChange() {
    if ('orientation' in screen) {
        screen.orientation.addEventListener('change', function() {
            // Let's request fullscreen if user switches device in landscape mode.
            if (screen.orientation.type.startsWith('landscape')) {
                requestFullscreenVideo();
            } else if (document.fullscreenElement) {
                // document.exitFullscreen();
                exitFullscreenVideo();
            }
        });
    }      
}

function formatTime(timeInSeconds) {
	const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);
  
	return {
		hours: result.substr(0, 2),
	  	minutes: result.substr(3, 2),
	  	seconds: result.substr(6, 2)
	};
}

function mobileAndTablet() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

function initializeMediaPlayer() {
    onScreenControls[0] = document.getElementById('hv-media-onscreen-play-icon');
    onScreenControls[1] = document.getElementById('hv-media-onscreen-pause-icon');
    onScreenControls[2] = document.getElementById('hv-media-onscreen-loading-icon');
    onScreenControls[3] = document.getElementById('hv-media-onscreen-reload-icon');
    onScreenControls[4] = document.getElementById('hv-media-onscreen-error-icon');
    
    videoBufferBar = document.getElementById('hv-media-progress-buffer');
    videoProgressBar = document.getElementById('hv-media-progress-bar');
    videoSeekSlider = document.getElementById('hv-media-progress-slider');
    videoSeekTooltip = document.getElementById('hv-media-seek-tooltip');
    
    videoPlayButton = document.getElementById('hv-media-control-playpause-button');
    videoVolumeButton = document.getElementById('hv-media-control-mute-button');
    videoSettingsButton = document.getElementById('hv-media-control-settings-button');
    videoSettingsOptions = document.getElementsByClassName('hv-media-controls-settings-menu-option');
    videoSettingsMenu = document.getElementById('hv-media-controls-settings-menu');
    videoVolumeSlider = document.getElementById('hv-media-control-volume-slider');
    videoPipButton = document.getElementById('hv-media-control-pip-button');
    videoFullScreenButton = document.getElementById('hv-media-control-full-button');
    
    video.style.cursor = 'pointer';
    settingsMenuVisible = false;
    volumeSliderVisible = false;
}

function initializeVideoControls() {
    document.addEventListener('keydown', keyBoardDownHandle, false);
    document.addEventListener('keyup', keyBoardUpHandle, false);

    if(mobileAndTablet()) {
        mediaPlayer.addEventListener('touchstart', showControls, false);
        videoSeekSlider.addEventListener('touchmove', seekToValue, false);
        videoVolumeSlider.addEventListener('touchstart', volumeSliderOn, false);
        videoVolumeSlider.addEventListener('touchend', volumeSliderOff, false);
    } else {
        video.addEventListener('click', togglePlayPause, false);
        mediaPlayer.addEventListener('mouseover', showControls, false);
        mediaPlayer.addEventListener('mousemove', showControls, false);
        videoSeekSlider.addEventListener('mousemove', seekToValue, false);
        videoVolumeButton.addEventListener('click', toggleMute, false);
        videoVolumeSlider.addEventListener('mouseover', volumeSliderOn, false);
        videoVolumeSlider.addEventListener('mouseleave', volumeSliderOff, false);
    }
    videoSeekSlider.addEventListener('input', seekTo, false);
    videoVolumeSlider.addEventListener('input', toggleVolume, false);
    videoPlayButton.addEventListener('click', togglePlayPause, false);
    videoPipButton.addEventListener('click', togglePip, false);
    videoFullScreenButton.addEventListener('click', toggleFullScreen, false);
    videoSettingsButton.addEventListener('mouseover', settingsMenuEnabled, false);
    videoSettingsButton.addEventListener('mouseleave', settingsMenuReset, false);
    videoSettingsMenu.addEventListener('mouseover', settingsMenuEnabled, false);
    videoSettingsMenu.addEventListener('mouseleave', settingsMenuReset, false);
    for(var i = 0; i < videoSettingsOptions.length; i++) {
        videoSettingsOptions[i].addEventListener('click', selectedOption, false);
    }

    const videoDuration = Math.round(video.duration);
    videoBufferBar.setAttribute('max', videoDuration);
    videoProgressBar.setAttribute('max', videoDuration);
    videoSeekSlider.setAttribute('max', videoDuration);

    videoBufferBar.value = 0;
    videoProgressBar.value = 0;
    videoSeekSlider.value = 0;
    videoVolumeSlider.value = video.volume * 100;
	const time = formatTime(videoDuration);
	document.getElementById('hv-media-total-time').innerText = `${time.hours}:${time.minutes}:${time.seconds}`;
}

function initializeVideo() {
    onScreenControls[0].classList.remove('hidden');
    onScreenControls[2].classList.add('hidden');

    video.addEventListener('play', videoPlay, false);
    video.addEventListener('playing', videoPlaying, false);
    video.addEventListener('paused', videoPaused, false);
	video.addEventListener('progress', videoBuffering, false);
    video.addEventListener('timeupdate', videoTimeUpdate, false);
    video.addEventListener('seeking', videoSeeking, false);
    video.addEventListener('seeked', videoSeeked, false);
    // video.addEventListener('volumechange', videoVolumeChange, false);
    // video.addEventListener('waiting', videoWaiting, false);
    // video.addEventListener('suspend', videoSuspend, false);
    video.addEventListener('ended', videoEnded, false);
}

function keyBoardDownHandle(e) {
    switch(e.code) {
        case 'ArrowRight':
            const skipValue1 = video.currentTime + 5;
            videoSeekSlider.value = skipValue1;
            video.currentTime = skipValue1;
            videoProgressBar.value = video.currentTime;
            showControls();
            break;
        case 'ArrowLeft':
            const skipValue2 = video.currentTime - 5;
            videoSeekSlider.value = skipValue2;
            video.currentTime = skipValue2;
            videoProgressBar.value = video.currentTime;
            showControls();
            break;
        case 'ArrowUp':
            videoVolumeSlider.value++;
            video.volume = videoVolumeSlider.value / 100;
            showControls();
            break;
        case 'ArrowDown':
            videoVolumeSlider.value--;
            video.volume = videoVolumeSlider.value / 100;
            showControls();
            break;
    }
}

function keyBoardUpHandle(e) {
    switch(e.code) {
        case 'Space':
            togglePlayPause();
            showControls();
            break;
    }
}

function showControls() {
    $('#hv-media-controls').fadeIn('slow');
    $('#hv-media-onscreen').fadeIn('slow');
    $('#hv-media-video-header').fadeIn('slow');
    video.style.cursor = 'pointer';
    try {
        clearTimeout(timer);
    } catch (e) {}
    timer = setTimeout(function () {
        if(!(video.paused || video.ended)) {
            $('#hv-media-onscreen').fadeOut('slow');
            video.style.cursor = 'none';
        }
        if(!(settingsMenuVisible || volumeSliderVisible)) {
            $('#hv-media-controls').fadeOut('slow');
            $('#hv-media-video-header').fadeOut('slow');
        }
    }, 1500);
}

function videoStalled() {
    onScreenControls[0].classList.add('hidden');
    onScreenControls[1].classList.add('hidden');
    onScreenControls[2].classList.remove('hidden');
    onScreenControls[3].classList.add('hidden');
    onScreenControls[4].classList.add('hidden');
    videoPlayButton.title = 'play';
    document.getElementById('hv-media-control-play-icon').classList.remove('hidden');
    document.getElementById('hv-media-control-pause-icon').classList.add('hidden');
    video.pause();
}

function videoError() {
    onScreenControls[0].classList.add('hidden');
    onScreenControls[1].classList.add('hidden');
    onScreenControls[2].classList.add('hidden');
    onScreenControls[3].classList.add('hidden');
    onScreenControls[4].classList.remove('hidden');
    videoPlayButton.title = 'play';
    document.getElementById('hv-media-control-play-icon').classList.remove('hidden');
    document.getElementById('hv-media-control-pause-icon').classList.add('hidden');
    video.pause();
}

function videoPlay() {
    videoSeekSlider.disabled = false;
    videoSeekSlider.disabled = false;
    videoPlayButton.disabled = false;
    videoVolumeButton.disabled = false;
    videoVolumeSlider.disabled = false;
    videoSettingsButton.disabled = false;
    videoPipButton.disabled = false;
}

function videoPlaying() {
}

function videoPaused() {
}

function videoBuffering() {
    for (var i = 0; i < video.buffered.length; i++) {
        if (video.buffered.start(video.buffered.length - 1 - i) < video.currentTime) {
            videoBufferBar.value = video.buffered.end(video.buffered.length - 1 - i);
            break;
        }
    }
}

function videoTimeUpdate() {
    videoProgressBar.value = Math.floor(video.currentTime);
    videoSeekSlider.value = Math.floor(video.currentTime);
	const time = formatTime(Math.floor(video.currentTime));
	document.getElementById('hv-media-time-elapsed').innerText = `${time.hours}:${time.minutes}:${time.seconds}`;
}

function videoSeeking() {
    onScreenControls[0].classList.add('hidden');
    onScreenControls[1].classList.add('hidden');
    onScreenControls[2].classList.remove('hidden');
    onScreenControls[3].classList.add('hidden');
    onScreenControls[4].classList.add('hidden');
}

function videoSeeked() {
    if (video.paused) {
        onScreenControls[0].classList.remove('hidden');
        onScreenControls[1].classList.add('hidden');
        onScreenControls[2].classList.add('hidden');
        onScreenControls[3].classList.add('hidden');
        onScreenControls[4].classList.add('hidden');
    } else {
        onScreenControls[0].classList.add('hidden');
        onScreenControls[1].classList.remove('hidden');
        onScreenControls[2].classList.add('hidden');
        onScreenControls[3].classList.add('hidden');
        onScreenControls[4].classList.add('hidden');
    }
}

function videoWaiting() {
    console.log("waiting");
}

function videoSuspend() {
    console.log("suspend");
}

function videoEnded() {
    onScreenControls[0].classList.add('hidden');
    onScreenControls[1].classList.add('hidden');
    onScreenControls[2].classList.add('hidden');
    onScreenControls[3].classList.remove('hidden');
    onScreenControls[4].classList.add('hidden');
    document.getElementById('hv-media-control-play-icon').classList.remove('hidden');
    document.getElementById('hv-media-control-pause-icon').classList.add('hidden');
    videoSeekSlider.disabled = true;
    videoSeekSlider.disabled = true;
    videoPlayButton.disabled = true;
    videoVolumeButton.disabled = true;
    videoVolumeSlider.disabled = true;
    videoSettingsButton.disabled = true;
    videoPipButton.disabled = true;
}

function togglePlayPause() {
    if(contextMenuVisible) {
        return;
    }

    if (video.paused || video.ended) {
        onScreenControls[0].classList.add('hidden');
        onScreenControls[1].classList.remove('hidden');
        onScreenControls[2].classList.add('hidden');
        onScreenControls[3].classList.add('hidden');
        onScreenControls[4].classList.add('hidden');
        videoPlayButton.title = 'pause';
		document.getElementById('hv-media-control-play-icon').classList.add('hidden');
		document.getElementById('hv-media-control-pause-icon').classList.remove('hidden');
		video.play();
    } else {
        onScreenControls[0].classList.remove('hidden');
        onScreenControls[1].classList.add('hidden');
        onScreenControls[2].classList.add('hidden');
        onScreenControls[3].classList.add('hidden');
        onScreenControls[4].classList.add('hidden');
        videoPlayButton.title = 'play';
		document.getElementById('hv-media-control-play-icon').classList.remove('hidden');
		document.getElementById('hv-media-control-pause-icon').classList.add('hidden');
		video.pause();
    }
}

function seekTo(e) {
	const skipValue = e.target.dataset.seek;
	videoSeekSlider.value = skipValue;
    video.currentTime = skipValue;
    videoProgressBar.value = video.currentTime;
}

function seekToValue(e) {
    var seekValue;
    if(mobileAndTablet()) {
        seekValue = Math.round((e.targetTouches[0].pageX / e.target.clientWidth) * parseInt(e.target.getAttribute('max'), 10));
    } else {
        seekValue = Math.round((e.offsetX / e.target.clientWidth) * parseInt(e.target.getAttribute('max'), 10));
    }
	videoSeekSlider.setAttribute('data-seek', seekValue);
    const t = formatTime(seekValue);
    const rect = video.getBoundingClientRect();
    if(seekValue >= 0 && seekValue <= Math.round(video.duration)) {
        videoSeekTooltip.textContent = `${t.hours}:${t.minutes}:${t.seconds}`;
        videoSeekTooltip.style.left = `${event.pageX - rect.left}px`;
    }
}

function toggleMute() {
    if (video.muted) {
		video.muted = false;
		videoVolumeSlider.value = video.volume * 100;
		videoVolumeButton.title = 'Mute';
		document.getElementById('hv-media-control-vol-hi-icon').classList.add('hidden');
		document.getElementById('hv-media-control-vol-mute-icon').classList.remove('hidden');
    } else {
		video.muted = true;
		videoVolumeSlider.value = 0;
		videoVolumeButton.title = 'Unmute';
		document.getElementById('hv-media-control-vol-hi-icon').classList.remove('hidden');
		document.getElementById('hv-media-control-vol-mute-icon').classList.add('hidden');
    }
}

function toggleVolume() {
    video.volume = videoVolumeSlider.value/100;
	if(video.muted) {
		video.muted = false;
		videoVolumeButton.title = 'Mute';
		document.getElementById('hv-media-control-vol-hi-icon').classList.add('hidden');
		document.getElementById('hv-media-control-vol-mute-icon').classList.remove('hidden');
	}
	if(videoVolumeSlider.value == 0) {
		video.muted = true;
		videoVolumeButton.title = 'Unmute';
		document.getElementById('hv-media-control-vol-hi-icon').classList.remove('hidden');
		document.getElementById('hv-media-control-vol-mute-icon').classList.add('hidden');
	}
}

function volumeSliderOn() {
    volumeSliderVisible = true;
}

function volumeSliderOff() {
    volumeSliderVisible = false;
}

async function togglePip() {
    if(document.pictureInPictureEnabled) {
        videoPipButton.disabled = true;
        try {
            if (video !== document.pictureInPictureElement) {
                videoPipButton.disabled = true;
                await video.requestPictureInPicture();
            } else {
                await document.exitPictureInPicture();
            }
        } catch (error) {
            console.error(error);
        } finally {
            videoPipButton.disabled = false;
        }
    } else {
    	console.log('PIP error!');
    }
}

function toggleFullScreen() {
    var isFullScreen = !!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
    if (isFullScreen) {
        exitFullscreenVideo();
    } else {
        requestFullscreenVideo();    
    }
}

function requestFullscreenVideo() {
    if (mediaPlayer.requestFullscreen) mediaPlayer.requestFullscreen();
    else if (mediaPlayer.mozRequestFullScreen) mediaPlayer.mozRequestFullScreen();
    else if (mediaPlayer.webkitRequestFullScreen) mediaPlayer.webkitRequestFullScreen();
    else if (mediaPlayer.msRequestFullscreen) mediaPlayer.msRequestFullscreen();
    lockScreenOrientation();
    videoFullScreenButton.title = 'Exit Full Screen';
    video.style.height = '100%';
    document.getElementById('hv-media-control-fullscreen-icon').classList.add('hidden');
    document.getElementById('hv-media-control-fullscreen-exit-icon').classList.remove('hidden');
}

function exitFullscreenVideo() {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
    videoFullScreenButton.title = 'Full Screen';
    video.style.height = 'auto';
    document.getElementById('hv-media-control-fullscreen-icon').classList.remove('hidden');
    document.getElementById('hv-media-control-fullscreen-exit-icon').classList.add('hidden');
}

function lockScreenOrientation() {
    if (!('orientation' in screen)) {
        return;
    }
    // Let's force landscape mode only if device is in portrait mode and can be held in one hand.
    if (matchMedia('(orientation: portrait) and (max-device-width: 768px)').matches) {
        screen.orientation.lock('landscape').then(() => listenToDeviceOrientationChanges());
    }
}

function listenToDeviceOrientationChanges() {
    if (!('DeviceOrientationEvent' in window)) {
        return;
    }
    var previousDeviceOrientation, currentDeviceOrientation;
    window.addEventListener('deviceorientation', function onDeviceOrientationChange(event) {
        // event.beta represents a front to back motion of the device and
        // event.gamma a left to right motion.
        if (Math.abs(event.gamma) > 10 || Math.abs(event.beta) < 10) {
            previousDeviceOrientation = currentDeviceOrientation;
            currentDeviceOrientation = 'landscape';
            return;
        }
        if (Math.abs(event.gamma) < 10 || Math.abs(event.beta) > 10) {
            previousDeviceOrientation = currentDeviceOrientation;
            // When device is rotated back to portrait, let's unlock screen orientation.
            if (previousDeviceOrientation == 'landscape') {
                screen.orientation.unlock();
                window.removeEventListener('deviceorientation', onDeviceOrientationChange);
            }
        }
    });
}
  

function settingsMenuEnabled() {
    settingsMenuVisible = true;
    document.getElementById('hv-media-controls-settings-menu').classList.remove('hidden');
}

function settingsMenuReset() {
    document.getElementById('hv-media-controls-settings-menu-options').classList.remove('hidden');
    document.getElementById('hv-media-controls-settings-menu-playback').classList.add('hidden');
    document.getElementById('hv-media-controls-settings-menu').classList.add('hidden');
    settingsMenuVisible = false;
}

function selectedOption(e) {
    settingsMenuVisible = true;
    var optionElementString = e.target.innerText;
    switch(optionElementString) {
        case 'Playback Speed':
            document.getElementById('hv-media-controls-settings-menu-options').classList.add('hidden');
            document.getElementById('hv-media-controls-settings-menu-playback').classList.remove('hidden');
            break;
        case 'Back':
            document.getElementById('hv-media-controls-settings-menu-options').classList.remove('hidden');
            document.getElementById('hv-media-controls-settings-menu-playback').classList.add('hidden');
            break;
        case 'x0.5':
			video.playbackRate = 0.5;
            document.getElementById('hv-media-controls-settings-menu-options').classList.remove('hidden');
            document.getElementById('hv-media-controls-settings-menu-playback').classList.add('hidden');
            break;
        case 'Normal':
			video.playbackRate = 1;
            document.getElementById('hv-media-controls-settings-menu-options').classList.remove('hidden');
            document.getElementById('hv-media-controls-settings-menu-playback').classList.add('hidden');
            break;
        case 'x1.5':
			video.playbackRate = 1.5;
            document.getElementById('hv-media-controls-settings-menu-options').classList.remove('hidden');
            document.getElementById('hv-media-controls-settings-menu-playback').classList.add('hidden');
            break;
    }
}
