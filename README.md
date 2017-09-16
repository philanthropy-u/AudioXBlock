AudioXBlock

This is a simple XBlock which will play audio files as an HTML5 audio
element and render the transcript as plain text. If unavailable, it will fall back to an embed element.

Usage: 

    <audio src="http://server.tld/static/song.mp3" transcript_src="http://transcripts.com/sample.srt"/>

    open-edx:

        key : "audio"
