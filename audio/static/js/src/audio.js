function AudioXBlock(runtime, element) {
    var audio = document.getElementById("audio");
    var seekbar = document.getElementById('seekbar');

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




