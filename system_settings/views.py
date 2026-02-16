from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render

from accounts.decorators import role_required
from accounts.models import UserProfile

from .utils import get_setting_value, set_setting_value


DEFAULT_KEYS = {
    'fine_per_day': '5',
    'max_books_per_user': '3',
    'max_issue_days': '14',
    'reservation_expiry_days': '3',
}


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def settings_view(request):
    if request.method == 'POST':
        for key in DEFAULT_KEYS.keys():
            val = request.POST.get(key)
            if val is not None:
                set_setting_value(key, val)
        messages.success(request, 'Settings updated.')
        return redirect('system_settings:settings')

    # ensure defaults
    for key, val in DEFAULT_KEYS.items():
        if get_setting_value(key) is None:
            set_setting_value(key, val)

    context = {k: get_setting_value(k) for k in DEFAULT_KEYS.keys()}
    return render(request, 'system_settings/settings.html', context)
