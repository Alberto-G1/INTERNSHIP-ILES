from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError as DRFValidationError


def custom_exception_handler(exc, context):
    """Normalize Django model validation errors into DRF validation responses."""
    if isinstance(exc, DjangoValidationError):
        if hasattr(exc, 'message_dict'):
            exc = DRFValidationError(exc.message_dict)
        else:
            messages = getattr(exc, 'messages', None) or [str(exc)]
            exc = DRFValidationError(messages)

    response = exception_handler(exc, context)

    if response is None:
        return Response(
            {'error': 'An unexpected server error occurred.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response
