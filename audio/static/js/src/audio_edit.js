function AudioEditBlock(runtime, element) {
  $(element).find('.action-save').bind('click', function() {
    var handlerUrl = runtime.handlerUrl(element, 'studio_submit');
    var data = {
      src: $(element).find('input[name=audio_src]').val(),
      downloadable_src: $(element).find('input[name=audio_src_downloadable]').val(),
      transcript_src: $(element).find('input[name=transcript_src]').val()
    };
    $.post(handlerUrl, JSON.stringify(data)).done(function(response) {
      window.location.reload(false);
    });
  });

  $(element).find('.action-cancel').bind('click', function() {
    runtime.notify('cancel', {});
  });
}