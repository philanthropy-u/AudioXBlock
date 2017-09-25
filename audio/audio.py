"""TO-DO: This XBlock will play an MP3 file as an HTML5 audio element. """

import pkg_resources

from xblock.core import XBlock
from xblock.fields import Scope, Integer, String
from xblock.fragment import Fragment

import re
import requests

regex = re.compile(
        r'^(?:http|ftp)s?://' # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|' #domain...
        r'localhost|' #localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' # ...or ip
        r'(?::\d+)?' # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)


class AudioXBlock(XBlock):
    """
    This XBlock will play an MP3 file as an HTML5 audio element. 
    """

    # Fields are defined on the class.  You can access them in your code as
    # self.<fieldname>.

    # this variable holds the source of main media file
    src = String(scope=Scope.settings, help="URL for .ogg file to play", default="")
    # reference for script file
    transcript_src = String(scope=Scope.settings, help="plain text", default="")
    # holds the downloadable link of media file
    downloadable_src = String(scope=Scope.settings, help="URL for .mp3 file to download", default="")
    is_transcript_url_valid = String(scope=Scope.settings, help="transcript url validation flag", default="True")


    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    def student_view(self, context=None):
        """
        The primary view of the AudioXBlock, shown to students
        when viewing courses.
        """
        html = self.resource_string("static/html/audio.html")

        # Validate transcript link.
        if self.transcript_src:
            if not regex.match(self.transcript_src):
                self.transcript_src = ''
                self.is_transcript_url_valid = "False"
            else:
                r = requests.get(self.transcript_src)
                content_type = r.headers['content-type']
                if "text/plain" != content_type:
                    self.transcript_src = ''
                    self.is_transcript_url_valid = "False"

        frag = Fragment(html.format(src=self.src,
                                    transcript_src=self.transcript_src,
                                    downloadable_src=self.downloadable_src,
                                    is_transcript_url_valid=self.is_transcript_url_valid))

        frag.add_css(self.resource_string("static/css/audio.scss"))
        js = self.resource_string("static/js/src/audio.js")
        frag.add_javascript(js)
        frag.initialize_js('AudioXBlock')
        return frag

    def studio_view(self, context):
        """
        The view for editing the AudioXBlock parameters inside Studio.
        """
        html = self.resource_string("static/html/audio_edit.html")
        frag = Fragment(html.format(src=self.src, transcript_src=self.transcript_src, downloadable_src=self.downloadable_src))
        frag.add_css(self.resource_string("static/css/audio_edit.scss"))
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
        self.downloadable_src = data.get('downloadable_src')

        return {'result': 'success'}

    # workbench while developing your XBlock.
    @staticmethod
    def workbench_scenarios():
        """A canned scenario for display in the workbench."""
        return [
            ("AudioXBlock",
             """<vertical_demo>
                    <audio src="https://upload.wikimedia.org/wikipedia/en/4/45/ACDC_-_Back_In_Black-sample.ogg" 
                    transcript_src="http://humanstxt.org/humans.txt"
                    downloadable_src="sdfsdf.mp3"> </audio>
                    <audio src="" 
                    transcript_src="sdrfserf.txt"
                    downloadable_src="fasdf.mp3"> </audio>
                 </vertical_demo>
             """),
        ]
