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

    // this event is fired when a seek operation completed.
    // this event is needed to clear the play bar canvas whenever user seek.
    audio.addEventListener('seeked', function() {
        playBarContext.clearRect(0,0,playBarCanvas.width, playBarCanvas.height);
     });


    // setting up initial state of player
    $('#play-btn').hide();
    $('#volume').val(audio.volume);
    $('#speed').hide();



    // handler for mute button click event
    $('#mute-btn').click(function () {
        if (audio.muted) {
            audio.muted = false;
            $('#volume').val(audio.volume);
        }
        else {
            audio.muted = true;
            $('#volume').val(0);
        }
    });

    // handler for play button click event
    $('#play-btn').click(function () {
        audio.play();
        $(this).hide();
        $("#pause-btn").show();
    });

    // handler for pause button click event
    $('#pause-btn').click(function () {
        audio.pause();
        $(this).hide();
        $("#play-btn").show();
    });


    // handler for volume change event
    $('#volume').change(function () {
        audio.volume = $(this).val();
        if (audio.volume == 0) {
            audio.muted = true;
        } else {
            audio.muted = false;
        }
    });

    // handler for seek change event to current time of audio
    $('#seekbar').change(function () {
        audio.currentTime = $(this).val();
    });

    // handler for playback rate button click event
    $('#playback-rate-controller').click(function () {
        if($('#speed').is(":visible")){
            $('#speed').hide();
        }
        else{
            $('#speed').show();
        }

    });

    // handler for rates buttons click event
    $('#speed').children().click(function () {
        // getting new playback rate
        var newRate = parseFloat($(this).attr('rate'));
        // setting ne playback rate
        audio.playbackRate = newRate;

        // updating the play back rate button state
        $('#playback-rate-controller').html($(this).html());
        //updating  rates state
        $('#speed').hide();
    });


    // reference of seek bar
    var seekbar = document.getElementById('seekbar');

    // this event is fired when the duration attribute has been updated
    $('#audio').bind('durationchange', function() {
        seekbar.min = 0;
        seekbar.max = audio.duration;
        seekbar.value = 0;
    });

    // this event is fired when the time indicated by the currentTime attribute has been updated.
    $('#audio').bind('timeupdate', function() {
        var sec = audio.currentTime;
        var h = Math.floor(sec / 3600);
        sec = sec % 3600;
        var min = Math.floor(sec / 60);
        sec = Math.ceil(sec % 60);
        if (sec.toString().length < 2) {sec = "0" + sec;}
        if (min.toString().length < 2) {min = "0" + min;}
        // formatting timer
        document.getElementById('timer').innerHTML = h + ":" + min + ":" + sec;
        seekbar.min = audio.startTime;
        seekbar.max = audio.duration;
        seekbar.value = audio.currentTime;
    });

}




