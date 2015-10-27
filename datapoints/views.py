import json
from pprint import pprint
import datetime
from datetime import date

import re
import itertools
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.core.urlresolvers import reverse_lazy, reverse, resolve
from django.core.exceptions import ObjectDoesNotExist
from django.core import serializers
from django.views import generic
from django.views.decorators.cache import cache_control as django_cache_control
from django.contrib.auth.models import User,Group
from django.contrib.auth.decorators import login_required

from django.template import RequestContext

from pandas import read_csv
from pandas import DataFrame
from functools import partial

from datapoints.models import *
from datapoints.forms import *
from datapoints import cache_tasks
from datapoints.mixins import PermissionRequiredMixin

class IndexView(generic.ListView):
    paginate_by = 20

    def get_queryset(self):
        return self.model.objects.order_by('-created_at')

    ###################
    ###################
    ### DATA POINTS ###
    ###################
    ###################

class DataPointIndexView(IndexView):

    model=DataPoint
    template_name = 'datapoints/index.html'
    context_object_name = 'top_datapoints'


def data_entry(request):

    return render_to_response('data-entry/index.html',
        context_instance=RequestContext(request))

def dashboard_list(request):

    return render_to_response('dashboard-builder/list.html',
        context_instance=RequestContext(request))

def dashboard_builder(request,dashboard_id=None):

    return render_to_response('dashboard-builder/index.html', {'dashboard_id': dashboard_id },
        context_instance=RequestContext(request))

def chart_builder(request,dashboard_id):

    return render_to_response('dashboard-builder/chart_builder.html', {'dashboard_id': dashboard_id },
        context_instance=RequestContext(request))


class DashBoardView(IndexView):
    paginate_by = 50

    template_name = 'dashboard/index.html'
    context_object_name = 'user_dashboard'

    def get_queryset(self):
        return DataPoint.objects.all()[:1]


    #################
    ### CAMPAIGNS ###
    #################


class CampaignCreateView(PermissionRequiredMixin,generic.CreateView):

    model = Campaign
    success_url = '/ufadmin/campaigns'
    template_name = 'campaigns/create.html'
    fields = ['office','campaign_type','start_date','end_date']


class CampaignUpdateView(PermissionRequiredMixin,generic.UpdateView):

    model = Campaign
    success_url = '/ufadmin/campaigns'
    template_name = 'campaigns/create.html'
    form_class = CampaignForm
    # permission_required = 'datapoints.change_campaign'

    ###############
    ### locationS ###
    ###############

class LocationCreateView(PermissionRequiredMixin,generic.CreateView):

    model = Location
    template_name='regions/create.html'
    permission_required = 'datapoints.add_location'
    form_class = LocationForm
    success_url= '/ufadmin/locations'

    def form_valid(self, form):
        # this inserts into the changed_by field with  the user who made the insert

        obj = form.save(commit=False)
        obj.changed_by = self.request.user

        obj.save()
        return HttpResponseRedirect(self.success_url)


class LocationUpdateView(PermissionRequiredMixin,generic.UpdateView):

    model = Location
    success_url = '/ufadmin/locations'
    template_name = 'regions/update.html'
    permission_required = 'datapoints.change_location'
    form_class = LocationForm

    ##############################
    ##############################
    #### FUNCTION BASED VIEWS ####
    ##############################
    ##############################

def manage_data_refresh(request):

    cache_jobs = CacheJob.objects.all().\
        exclude(response_msg='NOTHING_TO_PROCESS').order_by('-id')

    return render_to_response('manage_data_refresh.html',{'cache_jobs':cache_jobs},
    context_instance=RequestContext(request))


def refresh_cache(request):

    cr = cache_tasks.CacheRefresh()
    return HttpResponseRedirect(reverse('datapoints:manage_data_refresh'))


def parse_url_args(request,keys):

    request_meta = {}

    for k in keys:

        try:
            request_meta[k] = request.GET[k]
        except KeyError:
            request_meta[k] = None

    return request_meta


def refresh_metadata(request):
    '''
    This is what happens when you click the "refresh_metadata" button
    '''

    indicator_cache_data = cache_tasks.cache_indicator_abstracted()
    user_cache_data = cache_tasks.cache_user_abstracted()
    campaign_cache_data = cache_tasks.cache_campaign_abstracted()
    location_tree_cache_data = cache_tasks.cache_location_tree()
    source_object_cache = cache_tasks.update_source_object_names()

    return HttpResponseRedirect(reverse('datapoints:manage_data_refresh'))


class GroupCreateView(PermissionRequiredMixin, generic.CreateView):

    model = Group
    template_name = 'group_create.html'

    form_class = GroupForm

    def form_valid(self, form):

        new_group = form.save()

        return HttpResponseRedirect(reverse('datapoints:create_group', \
            kwargs={'pk':new_group.id}))


class GroupEditView(PermissionRequiredMixin,generic.UpdateView):

    model = Group
    template_name = 'group_update.html'

    form_class = GroupForm

    def get_success_url(self):

        requested_group_id = self.get_object().id

        return reverse_lazy('datapoints:group_update',kwargs={'pk':
            requested_group_id})

    def get_context_data(self, **kwargs):

        context = super(GroupEditView, self).get_context_data(**kwargs)
        group_obj = self.get_object()
        context['group_id'] = group_obj.id

        return context

class UserCreateView(PermissionRequiredMixin,generic.CreateView):

    model = User
    template_name = 'user_create.html'
    form_class = UserCreateForm
    success_url= '/ufadmin/users'

    def form_valid(self, form):
        new_user = form.save()
        return HttpResponseRedirect(self.success_url)


class UserEditView(PermissionRequiredMixin,generic.UpdateView):

    model = User
    template_name = 'user_edit.html'
    form_class = UserEditForm

    def get_success_url(self):

        requested_user_id = self.get_object().id

        return reverse_lazy('datapoints:user_update',kwargs={'pk':
            requested_user_id})

    def get_context_data(self, **kwargs):

        context = super(UserEditView, self).get_context_data(**kwargs)
        user_obj = self.get_object()
        context['user_id'] = user_obj.id

        return context

class IndicatorCreateView(PermissionRequiredMixin,generic.CreateView):

    model = User
    template_name = 'user_create.html'
    form_class = IndicatorForm

    def form_valid(self, form):

        new_indicator = form.save()

        return HttpResponseRedirect(reverse('datapoints:update_indicator', \
            kwargs={'pk':new_indicator.id}))


class IndicatorEditView(PermissionRequiredMixin,generic.UpdateView):

    model = Indicator
    template_name = 'indicators/upsert.html'
    form_class = IndicatorForm

    def get_success_url(self):

        new_indicator_id = self.get_object().id

        return reverse_lazy('datapoints:update_indicator',kwargs={'pk':
            new_indicator_id})

    def get_context_data(self, **kwargs):

        context = super(IndicatorEditView, self).get_context_data(**kwargs)
        indicator_obj = self.get_object()
        context['pk'] = indicator_obj.id

        return context

def html_decorator(func):
    """
    This decorator wraps the output of the django debug tooldbar in html.
    (From http://stackoverflow.com/a/14647943)
    """

    def _decorated(*args, **kwargs):
        response = func(*args, **kwargs)

        wrapped = ("<html><body>",
                   response.content,
                   "</body></html>")

        return HttpResponse(wrapped)

    return _decorated


@html_decorator
def debug(request):
    """
    Debug endpoint that uses the html_decorator,
    """
    path = request.META.get("PATH_INFO")
    api_url = path.replace("debug/", "")

    view = resolve(api_url)

    accept = request.META.get("HTTP_ACCEPT")
    accept += ",application/json"
    request.META["HTTP_ACCEPT"] = accept

    res = view.func(request, **view.kwargs)
    return HttpResponse(res._container)
