function AudioXBlock(runtime, element) {

    // reference of main audio file
    var audio = document.getElementById("audio");

    // reference of buffering canvas, that indicates audio file buffered progress
    var bufferingCanvas = document.getElementById('buffering-canvas');
    // context of buffering canvas
    var bufferingCanvasContext = bufferingCanvas.getContext('2d');
    // variable that will hold the incremental progress for buffering canvas
    var bufferIncrement;

    // reference of play bar canvas, that indicates the progress of playing audio file
    var playBarCanvas = document.getElementById('play-bar');
    // context of play bar canvas
    var playBarContext = playBarCanvas.getContext('2d');


    // loading the meta data for audio file, e.g. audio length, and playing automatically
    audio.addEventListener('loadedmetadata', function() {
        bufferIncrement = bufferingCanvas.width / audio.duration;
        audio.play();
    });


    // setting up the buffering canvas
    bufferingCanvasContext.fillStyle = '#4F595D';
    bufferingCanvasContext.fillRect(0, 0, bufferingCanvas.width, bufferingCanvas.height);
    bufferingCanvasContext.fillStyle = '#697275';

    //setting up the play bar canvas
    playBarContext.fillStyle = '#CD578D';


    // this event will fired when the time indicated by the currentTime attribute has been updated.
    audio.addEventListener('timeupdate', function() {
      for ( var i = 0; i < audio.buffered.length; i++) {
        var startX = audio.buffered.start(i) * bufferIncrement;
        var endX = audio.buffered.end(i) * bufferIncrement;
        var width = endX - startX;
        // keep updating the buffered canvas
        bufferingCanvasContext.fillRect(startX, 0, width, bufferingCanvas.height);
        bufferingCanvasContext.rect(startX, 0, width, bufferingCanvas.height);
      }
        // calculating the playing progress in percentage
        var playedAudio  = (audio.currentTime / audio.duration ) * 100;
        // keep updating the play bar canvas
        playBarContext.fillRect(0, 0, playedAudio, playBarCanvas.height);
    });

    /*
    this event is fired when a seek operation completed.
    this event is needed to clear the play bar canvas whenever user seek.
    */
    audio.addEventListener('seeked', function() {
        playBarContext.clearRect(0,0,playBarCanvas.width, playBarCanvas.height);
     });

    // Getting DOM references with JQuery
    var playBtn = $('#play-btn');
    var volume = $('#volume');
    var playbackRateSet = $('#speed');
    var playbackRateBtn = $('#playback-rate-controller');
    var pauseBtn = $('#pause-btn');
    var volumeBtn = $('#volume-controller');
    var seekBar = $('#seekbar');
    var timer = $('#timer');

    // setting up initial state of player
    playBtn.hide();
    volume.val(audio.volume);
    playbackRateSet.hide();
    volume.hide();


    // handler for play button click event
    playBtn.click(function () {
        audio.play();
        $(this).hide();
        pauseBtn.show();
    });

    // handler for pause button click event
    pauseBtn.click(function () {
        audio.pause();
        $(this).hide();
        playBtn.show();
    });

    // volume handler
    volume.change(function () {
        audio.volume = $(this).val();
        if (audio.volume == 0) {
            audio.muted = true;
        } else {
            audio.muted = false;
        }
    });

    // handler for volume controller click event
    volumeBtn.click(function () {
        volume.show();
    });

    // handler for seek change event to current time of audio
    seekBar.change(function () {
        audio.currentTime = $(this).val();
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
        audio.playbackRate = newRate;

        // updating the play back rate button state
        playbackRateBtn.html($(this).html());
        //updating  rates state
        playbackRateSet.hide();
    });


    // reference of seek bar
    var seekbar = document.getElementById('seekbar');

    // this event is fired when the duration attribute has been updated
    audio.addEventListener('durationchange', function() {
        seekbar.min = 0;
        seekbar.max = audio.duration;
        seekbar.value = 0;
    });

    // this event is fired when the time indicated by the currentTime attribute has been updated.
    audio.addEventListener('timeupdate', function() {
        var sec = audio.currentTime;
        var h = Math.floor(sec / 3600);
        sec = sec % 3600;
        var min = Math.floor(sec / 60);
        sec = Math.ceil(sec % 60);
        if (sec.toString().length < 2) {sec = "0" + sec;}
        if (min.toString().length < 2) {min = "0" + min;}
        timer.html(h + ":" + min + ":" + sec);
        seekbar.min = audio.startTime;
        seekbar.max = audio.duration;
        seekbar.value = audio.currentTime;
    });

    // this event is fired when playback has stopped.
    audio.addEventListener('ended', function() {
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

}




