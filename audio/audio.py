"""TO-DO: This XBlock will play an MP3 file as an HTML5 audio element. """

import pkg_resources

from xblock.core import XBlock
from xblock.fields import Scope, Integer, String
from xblock.fragment import Fragment


class AudioXBlock(XBlock):
    """
    This XBlock will play an MP3 file as an HTML5 audio element. 
    """

    # Fields are defined on the class.  You can access them in your code as
    # self.<fieldname>.
    src = String(scope=Scope.settings, help="URL for MP3 file to play")
    transcript_src = String(scope=Scope.settings, help="plain text", default="")


    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    # TO-DO: change this view to display your data your own way.
    def student_view(self, context=None):
        """
        The primary view of the AudioXBlock, shown to students
        when viewing courses.
        """
        html = self.resource_string("static/html/audio.html")
        frag = Fragment(html.format(src=self.src, transcript_src=self.transcript_src))
        frag.add_css(self.resource_string("static/css/audio.css"))

        js = self.resource_string("static/js/src/audio.js")
        frag.add_javascript(js)
        frag.initialize_js('AudioXBlock')
        return frag

    def studio_view(self, context):
        """
        The view for editing the AudioXBlock parameters inside Studio.
        """
        html = self.resource_string("static/html/audio_edit.html")
        frag = Fragment(html.format(src=self.src, transcript_src=self.transcript_src))

        js = self.resource_string("static/js/src/audio_edit.js")
        frag.add_javascript(js)
        frag.initialize_js('AudioEditBlock')

        return frag

    @XBlock.json_handler
    def studio_submit(self, data, suffix=''):
        """
        Called when submitting the form in Studio.
        """
        self.src = data.get('src')
        self.transcript_src = data.get('transcript_src')

        return {'result': 'success'}

    # TO-DO: change this to create the scenarios you'd like to see in the
    # workbench while developing your XBlock.
    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("AudioXBlock",
             """<vertical_demo>
                    <audio src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" transcript_src="http://cpansearch.perl.org/src/MIYAGAWA/Video-Subtitle-SRT-0.01/t/sample.srt"> </audio>
                </vertical_demo>
             """),
        ]

# < audio
# src = "http://www.archive.org/download/MITCMS_608F10/MITCMS_608F10lec02.mp3"
# transcript_src = "https://ocw.mit.edu/courses/comparative-media-studies-writing/cms-608-game-design-fall-2010/audio-lectures/lecture-2-iterative-design/68554.srt" > < / audio >
