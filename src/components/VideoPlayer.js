import React, { Component } from 'react';
import './VideoPlayer.css';

var timer;

class VideoPlayer extends Component {
    
    constructor(props) {
        super(props);
        
        this.state = { 
            controls: false,
            videoState: 'loading',
            showControls: true,
            videoTime: 0,
            videoDuration: 0,
            videoBuffer: 0,
            tooltipTime: 0,
            tooltipPos: 0,
            muted: false,
            pipOn: false,
            fullScreen: false,
            volume: 100,
            settingsMenuNum: 0,
            contextMenuTop: 0,
            contextMenuLeft: 0,
            contextMenuVisible: false,
        }

        this.onOrientationChange = this.onOrientationChange.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
        this.onContainerClick = this.onContainerClick.bind(this);
        this.togglePlayPause = this.togglePlayPause.bind(this);
        this.toggleMute = this.toggleMute.bind(this);
        this.onVolumeSliderChange = this.onVolumeSliderChange.bind(this);
        this.toggleSettings = this.toggleSettings.bind(this);
        // this.onSettingsOption = this.onSettingsOption.bind(this);
        this.togglePIP = this.togglePIP.bind(this);
        this.toggleFullScreen = this.toggleFullScreen.bind(this);
        this.onLoadedMetadata = this.onLoadedMetadata.bind(this);
        this.onProgressBarChange = this.onProgressBarChange.bind(this);
        this.onProgressBarMove = this.onProgressBarMove.bind(this);
        this.onTimeUpdate = this.onTimeUpdate.bind(this);
        this.onProgress = this.onProgress.bind(this);
        this.onSeeking = this.onSeeking.bind(this);
        this.onSeeked = this.onSeeked.bind(this);
        this.onEnded = this.onEnded.bind(this);
        this.onError = this.onError.bind(this);
    }

    componentDidMount() {
        this.checkOrientationChange();
    }

    checkOrientationChange() {
        if ('orientation' in window.screen) {
            window.screen.orientation.addEventListener('change', this.onOrientationChange);
        }      
    }

    onOrientationChange() {
        // Let's request fullscreen if user switches device in landscape mode.
        if (window.screen.orientation.type.startsWith('landscape')) {
            this.requestFullscreenVideo();
        } else if (document.fullscreenElement) {
            this.exitFullscreenVideo();
        }
    }

    formatTime(timeInSeconds) {
        const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);
      
        return {
            hours: result.substr(0, 2),
            minutes: result.substr(3, 2),
            seconds: result.substr(6, 2)
        };
    };

    onMouseMove() {
        this.showControls();
    }

    onContextMenu(event) {
        event.preventDefault();
        this.setState({ 
            contextMenuLeft: event.pageX - this.refs.mediaPlayer.offsetLeft, 
            contextMenuTop: event.pageY - this.refs.mediaPlayer.offsetTop, 
            contextMenuVisible: true 
        });
    }

    onContainerClick() {
        this.setState({ contextMenuVisible: false });
    }

    showControls() {
        this.setState({ showControls: true });
        try {
            clearTimeout(timer);
        } catch(e){}
        timer = setTimeout(() => {
            if(this.state.videoState === 'play') {
                this.setState({ showControls: false });
            }
        }, 1500);
    }

    onLoadedMetadata(event) {
        this.setState({ videoState: 'pause', videoDuration: event.target.duration });
    }

    togglePlayPause() {
        if(!this.state.contextMenuVisible) {
            if(this.state.videoState === 'pause' || this.state.videoState === 'ended') {
                this.setState({ videoState: 'play' });
                this.refs.video.play();
            } else {
                this.setState({ videoState: 'pause' });
                this.refs.video.pause();
            }
        }
        this.showControls();
    }

    toggleMute() {
        if(this.state.muted) {
            this.refs.video.muted = false;
        } else {
            this.refs.video.muted = true;
        }
        this.setState({ muted: !this.state.muted });
    }

    onVolumeSliderChange(event) {
        this.setState({ volume: event.target.value });
    }

    toggleSettings() {
        this.setState({ settingsMenuNum: 0 }); 
    }

    onSettingsOption(option, value) {
        switch(this.state.settingsMenuNum) {
            case 1://change playback
                break;
            case 2://change resolution
                break;
            case 3://add subtitles
                break;
            default:
        }
        this.setState({ settingsMenuNum: option });
    }

    async togglePIP() {
        if(document.pictureInPictureEnabled) {
            try {
                if (this.refs.video !== document.pictureInPictureElement) {
                    this.setState({ pipOn: true });
                    await this.refs.video.requestPictureInPicture();
                } else {
                    await document.exitPictureInPicture();
                    this.setState({ pipOn: false });
                }
            } catch (error) {
                console.error(error);
                this.setState({ pipOn: false });
            }
        } else {
            console.log('PIP error!');
            this.setState({ pipOn: false });
        }
    }

    toggleFullScreen() {
        var isFullScreen = !!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
        if (isFullScreen) {
            this.exitFullscreenVideo();
        } else {
            this.requestFullscreenVideo();    
        }
    }

    requestFullscreenVideo() {
        if (this.refs.mediaPlayer.requestFullscreen) this.refs.mediaPlayer.requestFullscreen();
        else if (this.refs.mediaPlayer.mozRequestFullScreen) this.refs.mediaPlayer.mozRequestFullScreen();
        else if (this.refs.mediaPlayer.webkitRequestFullScreen) this.refs.mediaPlayer.webkitRequestFullScreen();
        else if (this.refs.mediaPlayer.msRequestFullscreen) this.refs.mediaPlayer.msRequestFullscreen();
        this.lockScreenOrientation();
        this.setState({ fullScreen: true });
    }
    
    exitFullscreenVideo() {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
        this.setState({ fullScreen: false });
    }
    
    lockScreenOrientation() {
        if (!('orientation' in window.screen)) {
            return;
        }
        // Let's force landscape mode only if device is in portrait mode and can be held in one hand.
        if (matchMedia('(orientation: portrait) and (max-device-width: 768px)').matches) {
            window.screen.orientation.lock('landscape').then(() => this.listenToDeviceOrientationChanges());
        }
    }
    
    listenToDeviceOrientationChanges() {
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
                if (previousDeviceOrientation === 'landscape') {
                    window.screen.orientation.unlock();
                    window.removeEventListener('deviceorientation', onDeviceOrientationChange);
                }
            }
        });
    }

    onProgressBarChange(event) {
        this.setState({ videoTime: Math.floor(event.target.value) });
        this.refs.video.currentTime = Math.floor(event.target.value);
    }

    onProgressBarMove(event) {
        const seekValue = Math.floor((event.nativeEvent.offsetX / event.target.clientWidth) * parseInt(event.target.getAttribute('max'), 10));
        const rect = this.refs.video.getBoundingClientRect();
        if(seekValue >= 0 && seekValue <= Math.floor(this.state.videoDuration)) {
            this.setState({ 
                tooltipTime: seekValue, 
                tooltipPos: (event.pageX <= event.target.clientWidth - 30) ? event.pageX - rect.left : event.target.clientWidth - rect.left - 30 
            });
        }
    }

    onTimeUpdate(event) {
        this.setState({ videoTime: Math.floor(event.target.currentTime) });
    }

    onProgress(event) {
        for (var i = 0; i < event.target.buffered.length; i++) {
            if (event.target.buffered.start(event.target.buffered.length - 1 - i) < event.target.currentTime) {
                this.setState({ videoBuffer: event.target.buffered.end(event.target.buffered.length - 1 - i)});
                break;
            }
        }
    }

    onSeeking() {
        this.setState({ videoState: 'loading' });
    }

    onSeeked() {
        if(this.refs.video.paused) {
            this.setState({ videoState: 'pause' });
        } else {
            this.setState({ videoState: 'play' });
        }
    }

    onEnded() {
        this.setState({ videoState: 'ended' });
    }

    onError() {
        this.setState({ videoState: 'error' });
    }

    renderIcon(type) {
        if(type === 'play') {
            switch(this.state.videoState) {
                case 'pause':
                    return <use href='#play-icon'></use>;
                case 'play':
                    return <use href='#pause'></use>;
                case 'ended':
                    return <use href='#reload'></use>;
                default:
                    return <use href='#play-icon'></use>;
            }
        } else if(type === 'volume') {
            switch(this.state.muted) {
                case true:
                    return <use href='#volume-mute'></use>;
                case false:
                    return <use href='#volume-high'></use>;
                default:
                    return <use href='#volume-high'></use>;
            }
        } else if(type === 'fullscreen') {
            switch(this.state.fullScreen) {
                case true:
                    return <use href='#fullscreen-exit'></use>;
                case false:
                    return <use href='#fullscreen'></use>;
                default:
                    return <use href='#fullscreen'></use>;
            }
        } else if(type === 'onscreen') {
            switch(this.state.videoState) {
                case 'pause':
                    return <use href='#play-icon'></use>;
                case 'play':
                    return <use href='#pause'></use>;
                case 'ended':
                    return <use href='#reload'></use>;
                case 'error':
                    return <use href='#error'></use>;
                case 'loading':
                    return <use href='#loading'></use>;
                default:
                    return <use href='#loading'></use>;
            }
        }
    }

    renderSettingsMenu() {
        switch(this.state.settingsMenuNum) {
            case 1:
                return(
                    <ul className='settings-menu-options'>
                        <li className='settings-menu-option' onClick={this.onSettingsOption.bind(this, 0, 0.5)}>x0.5</li>
                        <li className='settings-menu-option' onClick={this.onSettingsOption.bind(this, 0, 1)}>Normal</li>
                        <li className='settings-menu-option' onClick={this.onSettingsOption.bind(this, 0, 1.5)}>x1.5</li> 
                    </ul>
                );
            case 2:
                return(
                    <ul className='settings-menu-options'>
                        <li className='settings-menu-option'>720p</li>
                        <li className='settings-menu-option'>480p</li>
                        <li className='settings-menu-option'>360p</li>
                        <li className='settings-menu-option'>240p</li> 
                        <li className='settings-menu-option'>144p</li>
                    </ul>
                );
            case 3:
                return(
                    <ul className='settings-menu-options'>
                        <li className='settings-menu-option'>None</li>
                        <li className='settings-menu-option'>English</li>
                        <li className='settings-menu-option'>Auto</li> 
                    </ul>
                );
            default:
                return(
                    <ul className='settings-menu-options'>
                        <li className='settings-menu-option' onClick={this.onSettingsOption.bind(this, 1)}>Playback Speed</li>
                        {/* <li id='settings-menu-option'>Quality</li>
                        <li id='settings-menu-option'>Subtitles</li> */}
                    </ul>
                );
        }
    }

    render() {
        const time = this.formatTime(this.state.videoTime);
        const duration = this.formatTime(this.state.videoDuration);
        const tooltipTime = this.formatTime(this.state.tooltipTime);

        return (
            <div 
                className='container' 
                ref='mediaPlayer' 
                style={this.props.style}
                onClick={this.onContainerClick} 
                onContextMenu={this.onContextMenu}
                onMouseMove={this.onMouseMove}
                // onTouchStart
            >
                <div className={(this.state.showControls) ? 'header' : 'hidden'}>
                    <h2 className='title'>{this.props.videoTitle}</h2>
                </div>
                <video 
                    ref='video' 
                    preload='metadata'
                    style={{ cursor: (this.state.showControls) ? 'pointer' : 'none' }}
                    poster={this.props.videoPoster} 
                    playsInline
                    className='video' 
                    onClick={this.togglePlayPause} 
                    controls={this.state.controls}
                    onAbort={this.onError} 
                    // onCanPlay 
                    // onCanPlayThrough 
                    // onDurationChange 
                    // onEmptied 
                    // onEncrypted
                    onEnded={this.onEnded} 
                    onError={this.onError} 
                    // onLoadedData 
                    onLoadedMetadata={this.onLoadedMetadata} 
                    // onLoadStart 
                    // onPause 
                    // onPlay
                    // onPlaying 
                    onProgress={this.onProgress}
                    // onRateChange 
                    onSeeked={this.onSeeked} 
                    onSeeking={this.onSeeking} 
                    // onStalled 
                    // onSuspend
                    onTimeUpdate={this.onTimeUpdate}
                    // onVolumeChange 
                    // onWaiting
                >
                    <source src={this.props.video} type={this.props.videoType} />
                </video>
                <div className={(this.state.showControls) ? 'onscreen-controls' : 'hidden'}>
                    <svg className='onscreen-control-icons'>
                        {this.renderIcon('onscreen')}
                    </svg>
                </div>
                <div 
                    className={(this.state.contextMenuVisible) ? 'context-menu-container' : 'hidden'} 
                    style={{ top: this.state.contextMenuTop + 'px', left: this.state.contextMenuLeft + 'px' }}
                >
                    <ul className='context-menu'>
                        <li className='context-menu-option'>Keyboard Shortcuts</li>
                        <li className='context-menu-option'>About</li>
                    </ul>
                </div>
                <div className={(this.state.showControls) ? 'controls' : 'hidden'}>
                    <div className='top'>
                        <div className='progress-controls'>
                            <progress className='progress-buffer' min='0' max={this.state.videoDuration} value={this.state.videoBuffer}></progress>
                            <progress className='progress-bar' min='0' max={this.state.videoDuration} value={this.state.videoTime}></progress>
                            <input 
                                className='progress-slider' 
                                type='range' 
                                step='1' 
                                min='0' 
                                max={this.state.videoDuration} 
                                value={this.state.videoTime} 
                                onChange={this.onProgressBarChange}
                                onMouseMove={this.onProgressBarMove}
                                disabled={this.state.videoState === 'ended'} 
                                // onTouchMove
                            />
                            <div className='seek-tooltip' style={{ left: this.state.tooltipPos + 'px' }}>
                                {tooltipTime.hours + ':' + tooltipTime.minutes + ':' + tooltipTime.seconds}
                            </div>
                        </div>
                    </div>
                    <div className='bottom'>
                        <div className='left'>
                            <button className='button' onClick={this.togglePlayPause}>
                                <svg className='button-icon'>
                                    {this.renderIcon('play')}
                                </svg>
                            </button>
                            <div className='control-volume'>
                                <button id='volume-button' className='button' onClick={this.toggleMute} disabled={this.state.videoState === 'ended'}>
                                    <svg className='button-icon'>
                                        {this.renderIcon('volume')}
                                    </svg>
                                </button>
                                <div className='volume-slider-container'>
                                    <progress className='volume-bar' min='0' max='100' value={this.state.volume}></progress>
                                    <input 
                                        type='range' 
                                        className='volume-slider' 
                                        min='0' 
                                        max='100' 
                                        value={this.state.volume} 
                                        onChange={this.onVolumeSliderChange}
                                        step='1' 
                                        orient='vertical' 
                                    />
                                </div>
                            </div>
                            <div className='time-text'>
                                <time className='time-elapsed'>{time.hours + ':' + time.minutes + ':' + time.seconds}</time>
                                <span>/</span>
                                <time className='total-time'>{duration.hours + ':' + duration.minutes + ':' + duration.seconds}</time>
                            </div>
                        </div>
                        <div className='right'>
                            <button 
                                className='button' 
                                id='settings-button'
                                onMouseLeave={this.toggleSettings}
                                disabled={this.state.videoState === 'ended'}
                            >
                                <svg className='button-icon'>
                                    <use href='#settings'></use>
                                </svg>
                            </button>
                            <div className='settings-menu' onMouseLeave={this.toggleSettings}>
                                {this.renderSettingsMenu()}
                            </div>
                            <button className='button' onClick={this.togglePIP} disabled={this.state.videoState === 'ended' || this.state.pipOn}>
                                <svg className='button-icon'>
                                    <use href='#pip'></use>
                                </svg>
                            </button>
                            <button className='button' onClick={this.toggleFullScreen}>
                                <svg className='button-icon'>
                                    {this.renderIcon('fullscreen')}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <svg style={{display: 'none'}}>
                    <defs>
                        <symbol id="pause" viewBox="0 0 24 24">
                            <path d="M14.016 5.016h3.984v13.969h-3.984v-13.969zM6 18.984v-13.969h3.984v13.969h-3.984z"></path>
                        </symbol>

                        <symbol id="play-icon" viewBox="0 0 24 24">
                            <path d="M8.016 5.016l10.969 6.984-10.969 6.984v-13.969z"></path>
                        </symbol>

                        <symbol id="volume-high" viewBox="0 0 24 24">
                            <path d="M14.016 3.234q3.047 0.656 5.016 3.117t1.969 5.648-1.969 5.648-5.016 3.117v-2.063q2.203-0.656 3.586-2.484t1.383-4.219-1.383-4.219-3.586-2.484v-2.063zM16.5 12q0 2.813-2.484 4.031v-8.063q1.031 0.516 1.758 1.688t0.727 2.344zM3 9h3.984l5.016-5.016v16.031l-5.016-5.016h-3.984v-6z"></path>
                        </symbol>

                        <symbol id="volume-low" viewBox="0 0 24 24">
                            <path d="M5.016 9h3.984l5.016-5.016v16.031l-5.016-5.016h-3.984v-6zM18.516 12q0 2.766-2.531 4.031v-8.063q1.031 0.516 1.781 1.711t0.75 2.32z"></path>
                        </symbol>

                        <symbol id="volume-mute" viewBox="0 0 24 24">
                            <path d="M12 3.984v4.219l-2.109-2.109zM4.266 3l16.734 16.734-1.266 1.266-2.063-2.063q-1.547 1.313-3.656 1.828v-2.063q1.172-0.328 2.25-1.172l-4.266-4.266v6.75l-5.016-5.016h-3.984v-6h4.734l-4.734-4.734zM18.984 12q0-2.391-1.383-4.219t-3.586-2.484v-2.063q3.047 0.656 5.016 3.117t1.969 5.648q0 2.203-1.031 4.172l-1.5-1.547q0.516-1.266 0.516-2.625zM16.5 12q0 0.422-0.047 0.609l-2.438-2.438v-2.203q1.031 0.516 1.758 1.688t0.727 2.344z"></path>
                        </symbol>

                        <symbol id="fullscreen" viewBox="0 0 24 24">
                            <path d="M14.016 5.016h4.969v4.969h-1.969v-3h-3v-1.969zM17.016 17.016v-3h1.969v4.969h-4.969v-1.969h3zM5.016 9.984v-4.969h4.969v1.969h-3v3h-1.969zM6.984 14.016v3h3v1.969h-4.969v-4.969h1.969z"></path>
                        </symbol>

                        <symbol id="fullscreen-exit" viewBox="0 0 24 24">
                            <path d="M15.984 8.016h3v1.969h-4.969v-4.969h1.969v3zM14.016 18.984v-4.969h4.969v1.969h-3v3h-1.969zM8.016 8.016v-3h1.969v4.969h-4.969v-1.969h3zM5.016 15.984v-1.969h4.969v4.969h-1.969v-3h-3z"></path>
                        </symbol>

                        <symbol id="settings" viewBox="0 0 66 66">
                            <path d="M36,62H28a3,3,0,0,1-3-3V53.567a.982.982,0,0,0-.631-.923c-.519-.192-1.047-.411-1.566-.65a.986.986,0,0,0-1.1.206l-3.846,3.838a2.968,2.968,0,0,1-2.121.885h0a2.973,2.973,0,0,1-2.126-.891L7.963,50.387a2.984,2.984,0,0,1,0-4.249L11.8,42.3a.981.981,0,0,0,.206-1.1q-.352-.77-.65-1.567a.976.976,0,0,0-.92-.631H5a3,3,0,0,1-3-3V28a3,3,0,0,1,3-3h5.433a.979.979,0,0,0,.923-.63q.3-.8.65-1.567a.982.982,0,0,0-.206-1.1L7.962,17.856a2.985,2.985,0,0,1,0-4.248l5.646-5.645a2.968,2.968,0,0,1,2.121-.886h0a2.972,2.972,0,0,1,2.127.89L21.7,11.8a.981.981,0,0,0,1.1.206c.518-.239,1.049-.459,1.576-.653A.966.966,0,0,0,25,10.445V5a3,3,0,0,1,3-3h8a3,3,0,0,1,3,3v5.433a.984.984,0,0,0,.632.924c.523.193,1.051.412,1.565.649a.983.983,0,0,0,1.1-.206l3.846-3.838a2.964,2.964,0,0,1,2.121-.885h0a2.973,2.973,0,0,1,2.126.891l5.645,5.645a2.984,2.984,0,0,1-.005,4.249L52.2,21.7a.981.981,0,0,0-.206,1.1c.241.526.462,1.057.654,1.581a.96.96,0,0,0,.9.617H59a3,3,0,0,1,3,3v8a3,3,0,0,1-3,3H53.567a.979.979,0,0,0-.923.63q-.3.8-.65,1.567a.982.982,0,0,0,.206,1.1l3.838,3.847a2.985,2.985,0,0,1,0,4.248l-5.646,5.645a2.968,2.968,0,0,1-2.121.886h0a2.972,2.972,0,0,1-2.127-.89L42.3,52.2a.986.986,0,0,0-1.1-.206c-.512.236-1.037.454-1.57.651A.972.972,0,0,0,39,53.56V59A3,3,0,0,1,36,62ZM22.409,49.909a2.944,2.944,0,0,1,1.232.269q.695.321,1.42.589A2.988,2.988,0,0,1,27,53.567V59a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1V53.56a2.978,2.978,0,0,1,1.935-2.791c.483-.179.959-.376,1.424-.591a2.993,2.993,0,0,1,3.351.606l3.846,3.838a.986.986,0,0,0,.709.3h0a.985.985,0,0,0,.7-.3l5.655-5.655a.985.985,0,0,0,.005-1.411L50.784,43.71a2.989,2.989,0,0,1-.606-3.35q.321-.7.589-1.422A2.988,2.988,0,0,1,53.567,37H59a1,1,0,0,0,1-1V28a1,1,0,0,0-1-1H53.551a2.967,2.967,0,0,1-2.78-1.926q-.269-.732-.593-1.435a2.988,2.988,0,0,1,.606-3.349l3.838-3.847a.984.984,0,0,0,.005-1.412L48.973,9.377a.99.99,0,0,0-.707-.3h0a.977.977,0,0,0-.7.3L43.71,13.216a2.989,2.989,0,0,1-3.351.606q-.694-.321-1.42-.589A2.989,2.989,0,0,1,37,10.433V5a1,1,0,0,0-1-1H28a1,1,0,0,0-1,1v5.448a2.971,2.971,0,0,1-1.93,2.785q-.729.268-1.429.592a2.99,2.99,0,0,1-3.351-.606L16.444,9.378a.986.986,0,0,0-.709-.3h0a.985.985,0,0,0-.7.295L9.377,15.027a.985.985,0,0,0-.005,1.411l3.844,3.852a2.989,2.989,0,0,1,.606,3.35q-.321.7-.589,1.422A2.988,2.988,0,0,1,10.433,27H5a1,1,0,0,0-1,1v8a1,1,0,0,0,1,1h5.439a2.985,2.985,0,0,1,2.8,1.939q.267.724.589,1.422a2.988,2.988,0,0,1-.606,3.349L9.378,47.557a.984.984,0,0,0-.005,1.412l5.654,5.654a.99.99,0,0,0,.707.3h0a.977.977,0,0,0,.7-.3l3.852-3.843A3,3,0,0,1,22.409,49.909Z"/>
                        </symbol>

                        <symbol id="pip" viewBox="0 0 24 24">
                            <path d="M21 19.031v-14.063h-18v14.063h18zM23.016 18.984q0 0.797-0.609 1.406t-1.406 0.609h-18q-0.797 0-1.406-0.609t-0.609-1.406v-14.016q0-0.797 0.609-1.383t1.406-0.586h18q0.797 0 1.406 0.586t0.609 1.383v14.016zM18.984 11.016v6h-7.969v-6h7.969z"></path>
                        </symbol>

                        <symbol id="loading" viewBox="0 0 51 50">
                            <rect y="0" width="13" height="50" fill="#1fa2ff">
                                <animate attributeName="height" values="50;10;50" begin="0s" dur="1s" repeatCount="indefinite" />
                                <animate attributeName="y" values="0;20;0" begin="0s" dur="1s" repeatCount="indefinite" />
                            </rect>
                            <rect x="19" y="0" width="13" height="50" fill="#12d8fa">
                                <animate attributeName="height" values="50;10;50" begin="0.2s" dur="1s" repeatCount="indefinite" />
                                <animate attributeName="y" values="0;20;0" begin="0.2s" dur="1s" repeatCount="indefinite" />
                            </rect>
                            <rect x="38" y="0" width="13" height="50" fill="#06ffcb">
                                <animate attributeName="height" values="50;10;50" begin="0.4s" dur="1s" repeatCount="indefinite" />
                                <animate attributeName="y" values="0;20;0" begin="0.4s" dur="1s" repeatCount="indefinite" />
                            </rect>
                        </symbol>

                        <symbol id="reload" viewBox="0 0 489.533 489.533">
                            <path d="M268.175,488.161c98.2-11,176.9-89.5,188.1-187.7c14.7-128.4-85.1-237.7-210.2-239.1v-57.6c0-3.2-4-4.9-6.7-2.9
                                l-118.6,87.1c-2,1.5-2,4.4,0,5.9l118.6,87.1c2.7,2,6.7,0.2,6.7-2.9v-57.5c87.9,1.4,158.3,76.2,152.3,165.6
                                c-5.1,76.9-67.8,139.3-144.7,144.2c-81.5,5.2-150.8-53-163.2-130c-2.3-14.3-14.8-24.7-29.2-24.7c-17.9,0-31.9,15.9-29.1,33.6
                                C49.575,418.961,150.875,501.261,268.175,488.161z"/>
                        </symbol>

                        <symbol id="error" viewBox="0 0 249.499 249.499">
                            <path d="M7.079,214.851l25.905,26.276c9.536,9.674,25.106,9.782,34.777,0.252l56.559-55.761l55.739,56.548
                                c9.542,9.674,25.112,9.782,34.78,0.246l26.265-25.887c9.674-9.536,9.788-25.106,0.246-34.786l-55.742-56.547l56.565-55.754
                                c9.667-9.536,9.787-25.106,0.239-34.786L216.52,8.375c-9.541-9.667-25.111-9.782-34.779-0.252l-56.568,55.761L69.433,7.331
                                C59.891-2.337,44.32-2.451,34.65,7.079L8.388,32.971c-9.674,9.542-9.791,25.106-0.252,34.786l55.745,56.553l-56.55,55.767
                                C-2.343,189.607-2.46,205.183,7.079,214.851z"/>
                        </symbol>
                    </defs>
                </svg>
            </div>
        );
    }
}

export default VideoPlayer;
