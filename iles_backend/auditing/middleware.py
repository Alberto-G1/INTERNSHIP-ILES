from .request_context import clear_current_request, set_current_request


class RequestContextMiddleware:
    """Stores current request in thread-local storage for audit context capture."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        set_current_request(request)
        try:
            return self.get_response(request)
        finally:
            clear_current_request()
