"""TO-DO: This XBlock will play an MP3 file as an HTML5 audio element. """
import json
import datetime
import pkg_resources
import requests

from xmodule.exceptions import NotFoundError
from xmodule.fields import RelativeTime

from xblock.core import XBlock
from xblock.fields import Scope, Integer, String, Integer, Boolean
from xblock.fragment import Fragment
from webob.multidict import MultiDict
from webob import Response
from mimetypes import MimeTypes
import urllib
import re
from xblockutils.resources import ResourceLoader
_ = lambda text: text
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

    saved_audio_position = RelativeTime(
        help=_("Current position in the audio."),
        scope=Scope.user_state,
        default=datetime.timedelta(seconds=0)
    )

    is_audio_completed = Boolean(
        help=_("Have user once listened the audio completely?"),
        scope=Scope.user_state,
        default=False
    )

    restart_count = Integer(
        help=_("Count the audio was restarted from the beginning."),
        scope=Scope.user_state,
        default=0
    )

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
        fragment.add_css(self.resource_string("static/css/audio.css"))
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
            'loader_icon': self.runtime.local_resource_url(self, 'public/images/ajax-loader.gif'),
            'src': self.src,
            'transcript': content,
            'transcript_src': self.transcript_src,
            'downloadable_src': self.downloadable_src,
            'is_transcript_url_valid': is_transcript_url_valid
        })

        return frag

    def student_view_data(self, context=None):
        """
        Return JSON data for student view
        """
        return {
            'transcripts': self.transcript_src,
            'playable_audio': {
                'mp3': self.downloadable_src,
                'ogg': self.src
            }
        }

    def studio_view(self, context):
        """
        The view for editing the AudioXBlock parameters inside Studio.
        """
        html = self.resource_string("static/html/audio_edit.html")
        frag = Fragment(html.format(src=self.src, transcript_src=self.transcript_src, downloadable_src=self.downloadable_src))
        frag.add_css(self.resource_string("static/css/audio_edit.css"))
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

        return {'result': 'success'}\


    @XBlock.handler
    def xmodule_handler(self, request, suffix=None):
        """
        XBlock handler that wraps `handle_ajax`
        """

        class FileObjForWebobFiles(object):
            """
            Turn Webob cgi.FieldStorage uploaded files into pure file objects.

            Webob represents uploaded files as cgi.FieldStorage objects, which
            have a .file attribute.  We wrap the FieldStorage object, delegating
            attribute access to the .file attribute.  But the files have no
            name, so we carry the FieldStorage .filename attribute as the .name.

            """

            def __init__(self, webob_file):
                self.file = webob_file.file
                self.name = webob_file.filename

            def __getattr__(self, name):
                return getattr(self.file, name)

        # WebOb requests have multiple entries for uploaded files.  handle_ajax
        # expects a single entry as a list.
        request_post = MultiDict(request.POST)
        for key in set(request.POST.iterkeys()):
            if hasattr(request.POST[key], "file"):
                request_post[key] = map(FileObjForWebobFiles, request.POST.getall(key))

        response_data = self.handle_ajax(suffix, request_post)
        return Response(response_data, content_type='application/json')

    def handle_ajax(self, dispatch, data):
        """
        Update values of xfields, that were changed by student.
        """
        accepted_keys = [
            "is_audio_completed", "saved_audio_position", "restart_count"
        ]

        conversions = {
            "saved_audio_position": RelativeTime.isotime_to_timedelta,
        }

        incremented = ["restart_count"]

        if dispatch == 'save_user_state':
            for key in data:
                if key in accepted_keys:
                    if key in conversions:
                        value = conversions[key](data[key])
                    elif key in incremented:
                        value = getattr(self, key) + 1
                    else:
                        value = data[key]

                    setattr(self, key, value)

            return json.dumps({'success': True})

        raise NotFoundError('Unexpected dispatch type')
    #
    # def save(self):
    #     pass


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
