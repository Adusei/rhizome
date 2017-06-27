from django.conf.urls import patterns, include, url
from django.contrib.auth.views import login, logout
from django.contrib import admin
from django.conf import settings
from django.conf.urls import patterns, url
from django.conf.urls.static import static
from django.contrib.auth.decorators import login_required
from django.views.generic import RedirectView
from django.views.generic import TemplateView
from decorator_include import decorator_include
from tastypie.api import Api

from rhizome.api.resources import *
from rhizome.api.decorators import api_debug
from rhizome import views

admin.autodiscover()


######################
# TASTYPIE Endpoints #
######################

v1_api = Api(api_name='v1')

v1_api.register(document_errors.DocErrorResource())
v1_api.register(doc_datapoint.DocDataPointResource())
v1_api.register(doc_detail_type.DocDetailTypeResource())
v1_api.register(doc_trans_form.DocTransFormResource())
v1_api.register(document.DocumentResource())
v1_api.register(document_detail.DocumentDetailResource())
v1_api.register(refresh_master.RefreshMasterResource())
v1_api.register(source_object_map.SourceObjectMapResource())
v1_api.register(source_submission.SourceSubmissionResource())
v1_api.register(date_doc_results.DateDocResultResource())

protected_patterns = [

    url(r'^$', RedirectView.as_view(url='source-data/'), name='homepage-redirect'),

    url(r'^permissions_needed$', TemplateView.as_view(
        template_name='permissions_needed.html'), name='permissions_needed'),
    url(r'^export_file?$', views.export_file, name='export_file'),

    url(r'^source-data/', views.source_data, name='source_data'),

]

urlpatterns = patterns(
    '',
    url(r'^api/', include(v1_api.urls)),

    url(r'^admin/', decorator_include(login_required, admin.site.urls)),
    url(r'^accounts/login/$', login, name='login'),
    url(r'^accounts/logout/$', logout, name='logout'),
    url(r'^', decorator_include(login_required, protected_patterns)),

    # Waffle PATH
    url(r'^', include('waffle.urls')),

) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += patterns(
        '',
        url(r'^api_debug/', api_debug),
    )
