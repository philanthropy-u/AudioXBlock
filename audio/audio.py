"""TO-DO: This XBlock will play an MP3 file as an HTML5 audio element. """

import pkg_resources
import requests

from xblock.core import XBlock
from xblock.fields import Scope, Integer, String
from xblock.fragment import Fragment

from mimetypes import MimeTypes
import urllib
import re
from xblockutils.resources import ResourceLoader
loader = ResourceLoader(__name__)

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

    def get_fragment(self, context):
        """
        return fragment after loading css/js/html either for studio OR student view
        :param context: context for templates
        :param view: view_type i;e studio/student
        :return: fragment after loading all assets
        """
        """
            Return fragment after adding required css/js/html
        """
        fragment = Fragment()
        fragment.add_content(loader.render_template("static/html/audio.html", context))
        fragment.add_css(self.resource_string("static/css/audio.scss"))
        js = self.resource_string("static/js/src/audio.js")
        fragment.add_javascript(js)

        fragment.initialize_js('AudioXBlock')
        return fragment

    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    def student_view(self, context=None):
        """
        The primary view of the AudioXBlock, shown to students
        when viewing courses.
        """

        is_transcript_url_valid = True
        transcript_src = self.transcript_src
        content = ""

        # Validate transcript link.
        if transcript_src:
            try:
                result = re.match(regex, transcript_src)
            except Exception as ex:
                pass

            if not result:
                transcript_src = ''
                is_transcript_url_valid = False
            else:
                try:
                    mime = MimeTypes()
                    file = urllib.pathname2url(transcript_src)
                    content_type, jj = mime.guess_type(file)

                    if "text/plain" != content_type:
                        transcript_src = ''
                        is_transcript_url_valid = False
                except:
                    transcript_src = ''
                    is_transcript_url_valid = False

            if is_transcript_url_valid:
                try:
                    r = requests.get(transcript_src)
                    content = r.text
                except:
                    content = ''
                    is_transcript_url_valid = False
        else:
            is_transcript_url_valid = False

        frag = self.get_fragment(context={
            'src': self.src,
            'transcript': content,
            'transcript_src': self.transcript_src,
            'downloadable_src': self.downloadable_src,
            'is_transcript_url_valid': is_transcript_url_valid
        })

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
                    downloadable_src="sample.mp3"> </audio>
                    <audio src="" 
                    transcript_src=""
                    downloadable_src=""> </audio>
                 </vertical_demo>
             """),
        ]
