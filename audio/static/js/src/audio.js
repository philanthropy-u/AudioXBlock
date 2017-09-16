function AudioXBlock(runtime, element) {
    var audio = document.getElementById("audio");
    $('#speed').children().click(function () {
        var newRate = parseFloat($(this).attr('rate'));
        audio.playbackRate = newRate;
    });
}

