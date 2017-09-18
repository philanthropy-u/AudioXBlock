function AudioXBlock(runtime, element) {
    var inc;
    var audio = document.getElementById("audio");
    audio.addEventListener('loadedmetadata', function() {
        inc = myCanvas.width / audio.duration;
        audio.play();
    });
    var seekbar = document.getElementById('seekbar');

    //________________________ buffering-canvas

    var myCanvas = document.getElementById('my-canvas');
    var context = myCanvas.getContext('2d');
    context.fillStyle = 'lightgray';
    context.fillRect(0, 0, myCanvas.width, myCanvas.height);
    context.fillStyle = 'red';
    context.strokeStyle = 'red';

    audio.addEventListener('timeupdate', function() {
      for ( var i = 0; i < audio.buffered.length; i++) {

        var startX = audio.buffered.start(i) * inc;
        var endX = audio.buffered.end(i) * inc;
        var width = endX - startX;

        context.fillRect(startX, 0, width, myCanvas.height);
        context.rect(startX, 0, width, myCanvas.height);
        context.stroke();
      }
    });

    $('#audio').bind('durationchange', function() {
        seekbar.min = 0;
        seekbar.max = audio.duration;
        seekbar.value = 0;
    });

    $('#audio').bind('timeupdate', function() {
        var sec = audio.currentTime;
        var h = Math.floor(sec / 3600);
        sec = sec % 3600;
        var min = Math.floor(sec / 60);
        sec = Math.floor(sec % 60);
        if (sec.toString().length < 2) {sec = "0" + sec;}
        if (min.toString().length < 2) {min = "0" + min;}
        document.getElementById('timer').innerHTML = h + ":" + min + ":" + sec;
        seekbar.min = audio.startTime;
        seekbar.max = audio.duration;
        seekbar.value = audio.currentTime;
    });


    $('#volume').val(audio.volume);
    $('#play-btn').hide();

    $('#speed').children().click(function () {
        var newRate = parseFloat($(this).attr('rate'));
        audio.playbackRate = newRate;
    });

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

    $('#play-btn').click(function () {
        audio.play();
        $(this).hide();
        $("#pause-btn").show();
    });

    $('#pause-btn').click(function () {
        audio.pause();
        $(this).hide();
        $("#play-btn").show();
    });


    $('#volume').change(function () {
        audio.volume = $(this).val();
        if (audio.volume == 0) {
            audio.muted = true;
        } else {
            audio.muted = false;
        }
    });

    $('#seekbar').change(function () {
        audio.currentTime = $(this).val();
    });

}




