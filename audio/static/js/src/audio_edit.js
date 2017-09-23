function AudioEditBlock(runtime, element) {

    // var audioSrc = $(element).find('#audio_src');
    // var audioSrcDownloadable = $(element).find('#audio_src_downloadable');
    // var transcriptSrc = $(element).find('#transcript_src');
    //
    // audioSrc.on('input', function () {
    //    if(audioSrc.val().endsWith('.ogg')) {
    //        console.log("ok");
    //    } else {
    //        console.log("invalid");
    //    }
    // });

    $(element).parents('.edit-xblock-modal').find('.action-save').unbind('click').bind('click', function(evt){
        evt.preventDefault();
        var handlerUrl = runtime.handlerUrl(element, 'studio_submit');
        var data = {
            src: $(element).find('input[name=audio_src]').val(),
            downloadable_src: $(element).find('input[name=audio_src_downloadable]').val(),
            transcript_src: $(element).find('input[name=transcript_src]').val()
        };
        $.post(handlerUrl, JSON.stringify(data)).done(function(response) {
            runtime.notify('save', {state: 'end'});
        });
    });

    $(element).find('.action-cancel').bind('click', function() {
        runtime.notify('cancel', {});
    });
}