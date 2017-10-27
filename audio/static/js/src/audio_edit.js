function AudioEditBlock(runtime, element) {

    $(element).parents('.edit-xblock-modal').find('.action-save').unbind('click').bind('click', function(evt){
        evt.preventDefault();
        var handlerUrl = runtime.handlerUrl(element, 'studio_submit');
        var data = {
            src: $(element).find('input[name=audio_src]').val(),
            downloadable_src: $(element).find('input[name=audio_src_downloadable]').val(),
            transcript_src: $(element).find('input[name=transcript_src]').val()
        };

        runtime.notify('save', {state: 'start', 'message': 'Updating'});
        $.post(handlerUrl, JSON.stringify(data)).done(function(response) {
            runtime.modal.editOptions.refresh(runtime.modal.xblockInfo);
            runtime.notify('save', {state: 'end'});
        });

    });

    $(element).find('.action-cancel').bind('click', function() {
        runtime.notify('cancel', {});
    });
}