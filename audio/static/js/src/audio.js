function AudioXBlock(runtime, element) {

    // reference of main audio file
    var audio = $(element).find('#audio');
    // reference of buffering canvas, that indicates audio file buffered progress
    var bufferingCanvas = $(element).find('#buffering-canvas');
    // context of buffering canvas
    var bufferingCanvasContext = bufferingCanvas[0].getContext('2d');
    // variable that will hold the incremental progress for buffering canvas
    var bufferIncrement;

    // reference of play bar canvas, that indicates the progress of playing audio file
    var playBarCanvas =$(element).find('#play-bar');
    // context of play bar canvas
    var playBarContext = playBarCanvas[0].getContext('2d');


    // Getting DOM references with JQuery
    var playBtn = $(element).find('#play-btn');
    var volume = $(element).find('#volume');
    var playbackRateSet = $(element).find('#speed');
    var playbackRateBtn = $(element).find('#playback-rate-controller');
    var pauseBtn = $(element).find('#pause-btn');
    var volumeBtn = $(element).find('#volume-controller');
    var seekBar = $(element).find('#seekbar');
    var timer = $(element).find('#timer');
    var transcript = $(element).find('#transcript-embed');
    var audioSrc = $(element).find('#audio_src').attr('src');
    var audioDownloadableSrc = $(element).find('#audio-link').attr('href');

    var noAudioSourceMessage = $(element).find('#no-audio-source')
    var noAudioTranscriptMessage = $(element).find('#no-transcript-source')
    var audioPlayerDiv = $(element).find('#audio-player-div');
    var transcriptDiv = $(element).find('#transcript-div-id');
    var transcriptDownloadableLink = $(element).find('#transcript-link');
    var downloadsHeading = $(element).find('#downloads-heading');
    var downloadsDiv = $(element).find('#downloads-div');

    // setting up initial state of player
    pauseBtn.hide();
    volume.val(audio[0].volume);
    playbackRateSet.hide();
    volume.hide();
    seekBar[0].value = 0;
    noAudioTranscriptMessage.hide();

    if(!audioSrc.endsWith('.ogg')){
        noAudioSourceMessage.show();
    }
    else{
        noAudioSourceMessage.hide();
    }

    if(!transcript.attr('src') && !audioDownloadableSrc) {
        downloadsDiv.hide();
        downloadsHeading.hide();
    } else if(!transcript.attr('src')){
        downloadsDiv.show();
        downloadsHeading.show();
        transcriptDownloadableLink.hide();
    } else if(!audioDownloadableSrc){
        downloadsDiv.show();
        downloadsHeading.show();
        $(element).find('#audio-link').hide();
    }

    if(transcript.attr('is-transcript-url-valid') === "False"){
        noAudioTranscriptMessage.show();
        transcript.hide();
        transcriptDownloadableLink.show();
    }

    // loading the meta data for audio file, e.g. audio length, and playing automatically
    audio.bind('loadedmetadata', function() {
        bufferIncrement = bufferingCanvas[0].width / audio[0].duration;
    });


    // setting up the buffering canvas
    bufferingCanvasContext.fillStyle = '#4F595D';
    bufferingCanvasContext.fillRect(0, 0, bufferingCanvas[0].width, bufferingCanvas[0].height);
    bufferingCanvasContext.fillStyle = '#697275';

    //setting up the play bar canvas
    playBarContext.fillStyle = '#CD578D';


    // this event will fired when the time indicated by the currentTime attribute has been updated.
    audio.bind('timeupdate', function() {
      for ( var i = 0; i < audio[0].buffered.length; i++) {
        var startX = audio[0].buffered.start(i) * bufferIncrement;
        var endX = audio[0].buffered.end(i) * bufferIncrement;
        var width = endX - startX;
        // keep updating the buffered canvas
        bufferingCanvasContext.fillRect(startX, 0, width, bufferingCanvas[0].height);
        bufferingCanvasContext.rect(startX, 0, width, bufferingCanvas[0].height);
      }
        // calculating the playing progress in percentage
        var playedAudio  = (audio[0].currentTime / audio[0].duration ) * 100;
        // keep updating the play bar canvas
        playBarContext.fillRect(0, 0, playedAudio, playBarCanvas[0].height);
    });

    /*
    this event is fired when a seek operation completed.
    this event is needed to clear the play bar canvas whenever user seek.
    */
    audio.bind('seeked', function() {
        playBarContext.clearRect(0,0,playBarCanvas[0].width, playBarCanvas[0].height);
     });


    // handler for play button click event
    playBtn.click(function () {
        audio[0].play();
        $(this).hide();
        pauseBtn.show();
    });

    // handler for pause button click event
    pauseBtn.click(function () {
        audio[0].pause();
        $(this).hide();
        playBtn.show();
    });

    // volume handler
    volume.bind('mousemove', function () {
        audio[0].volume = $(this).val();
        if (audio[0].volume == 0) {
            audio[0].muted = true;
        } else {
            audio[0].muted = false;
        }
    });

    // handler for volume controller click event
    volumeBtn.click(function () {
        volume.show();
    });

    // handler for seek change event to current time of audio
    seekBar.change(function () {
        audio[0].currentTime = $(this).val();
    });

    // handler for playback rate button click event
    playbackRateBtn.click(function () {
        playbackRateSet.show();
    });

    // handler for rates buttons click event
    playbackRateSet.children().click(function () {
        // getting new playback rate
        var newRate = parseFloat($(this).attr('rate'));
        // setting ne playback rate
        audio[0].playbackRate = newRate;

        // updating the play back rate button state
        playbackRateBtn.html($(this).html());
        //updating  rates state
        playbackRateSet.hide();
    });


    // reference of seek bar
    var seekbar = $(element).find('#seekbar');

    // this event is fired when the duration attribute has been updated
    audio.bind('durationchange', function() {
        seekbar[0].min = 0;
        seekbar[0].max = audio[0].duration;
        seekbar[0].value = 0;
    });

    // this event is fired when the time indicated by the currentTime attribute has been updated.
    audio.bind('timeupdate', function() {
        var sec = audio[0].currentTime;
        var h = Math.floor(sec / 3600);
        sec = sec % 3600;
        var min = Math.floor(sec / 60);
        sec = Math.ceil(sec % 60);
        if (sec.toString().length < 2) {sec = "0" + sec;}
        if (min.toString().length < 2) {min = "0" + min;}
        timer.html(h + ":" + min + ":" + sec);
        seekbar[0].min = audio[0].startTime;
        seekbar[0].max = audio[0].duration;
        seekbar[0].value = audio[0].currentTime;
    });

    // this event is fired when playback has stopped.
    audio.bind('ended', function() {
        playBtn.show();
        pauseBtn.hide();
    });

    // out side click handler for playback rate set and volume controller
    $(document).mouseup(function(e) {
        if (!playbackRateSet.is(e.target)) {
            playbackRateSet.hide();
        }
        if (!volume.is(e.target)) {
            volume.hide();
        }
    });

    //______________


    transcript[0].height = "100%";
}
