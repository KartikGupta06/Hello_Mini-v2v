"""
Emergency Notification Service — Provider-independent abstraction.

Architecture:
    SOS Endpoint
        ↓
    SOSService
        ↓
    EmergencyNotificationService  (this file)
        ↓
    SMSProviderAdapter (Twilio adapter built-in)

Adding a new SMS provider: subclass BaseSMSAdapter and
register it via EmergencyNotificationService.
"""

import logging
import re
from typing import Optional
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Delivery result model
# ---------------------------------------------------------------------------

class NotificationStatus(str, Enum):
    SENT = "sent"
    PARTIAL = "partial"
    FAILED = "failed"
    PROVIDER_NOT_CONFIGURED = "provider_not_configured"
    NO_CONTACTS = "no_contacts"


@dataclass
class ContactDispatchResult:
    """Result for a single contact notification attempt."""
    contact_name: str
    success: bool
    error: Optional[str] = None


@dataclass
class NotificationResult:
    """Aggregate result returned to the SOS endpoint."""
    status: NotificationStatus
    contacts_attempted: int = 0
    contacts_notified: int = 0
    details: list = field(default_factory=list)


# ---------------------------------------------------------------------------
# Phone number normalisation
# ---------------------------------------------------------------------------

# SafeRoute AI is currently configured for Indian (+91) phone numbers.
# If a stored number already starts with '+', it is assumed to be E.164.
# If it starts with '0' (Indian STD format), the '0' is replaced with '+91'.
# If it starts with '91' (10-digit country-code without +), '+' is prepended.
# Otherwise '+91' is prepended, treating it as a local 10-digit number.
# Numbers that cannot be normalised to a plausible format are skipped.

def normalize_phone(raw: str) -> Optional[str]:
    """
    Return an E.164-compatible phone number string, or None if invalid.
    Documented strategy: Indian numbers assumed when no country code present.
    """
    number = re.sub(r"[\s\-\(\).]", "", raw or "")

    if not number:
        return None

    if number.startswith("+"):
        # Already has country code — trust it as-is.
        normalized = number
    elif number.startswith("0"):
        # Indian STD trunk-code prefix
        normalized = "+91" + number[1:]
    elif number.startswith("91") and len(number) == 12:
        # 91 + 10-digit mobile
        normalized = "+" + number
    else:
        # Assume bare 10-digit Indian mobile
        normalized = "+91" + number

    # Basic plausibility: must be between 10 and 15 digits after the '+'
    digits = re.sub(r"\D", "", normalized)
    if not (10 <= len(digits) <= 15):
        logger.warning("Skipping malformed phone number (length %d): [REDACTED]", len(digits))
        return None

    return normalized


# ---------------------------------------------------------------------------
# SMS adapter base class
# ---------------------------------------------------------------------------

class BaseSMSAdapter:
    """Subclass this to add a new SMS provider."""

    def send(self, to: str, body: str) -> bool:
        """
        Send an SMS. Return True on success, False on failure.
        Must not raise — failures are caught by the notification service.
        """
        raise NotImplementedError


# ---------------------------------------------------------------------------
# Twilio SMS adapter
# ---------------------------------------------------------------------------

class TwilioSMSAdapter(BaseSMSAdapter):
    """
    Twilio SMS adapter.

    Required environment variables (backend .env only — NEVER frontend):
        TWILIO_ACCOUNT_SID   — Twilio Account SID
        TWILIO_AUTH_TOKEN    — Twilio Auth Token
        TWILIO_FROM_NUMBER   — Verified Twilio sender number in E.164 format

    The adapter self-disables when credentials are absent rather than crashing.
    """

    def __init__(self):
        import os
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_number = os.getenv("TWILIO_FROM_NUMBER")
        self._configured = bool(self.account_sid and self.auth_token and self.from_number)

        if not self._configured:
            logger.info(
                "Twilio credentials not found in environment. "
                "Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER to enable SMS."
            )

    @property
    def is_configured(self) -> bool:
        return self._configured

    def send(self, to: str, body: str) -> bool:
        if not self._configured:
            return False
        try:
            from twilio.rest import Client  # type: ignore
            client = Client(self.account_sid, self.auth_token)
            message = client.messages.create(
                body=body,
                from_=self.from_number,
                to=to
            )
            logger.info("SMS sent to [REDACTED] — SID: %s", message.sid)
            return True
        except ImportError:
            logger.error("twilio package not installed. Run: pip install twilio")
            return False
        except Exception as exc:
            # Log error WITHOUT exposing the recipient phone number
            logger.error("Twilio SMS delivery error: %s", type(exc).__name__)
            return False


# ---------------------------------------------------------------------------
# Emergency message builder
# ---------------------------------------------------------------------------

def build_emergency_message(user_name: str, location_url: Optional[str]) -> str:
    """Construct the SMS body sent to guardians."""
    if location_url:
        return (
            f"SAFEROUTE AI - SOS ALERT\n\n"
            f"{user_name} has triggered an emergency SOS.\n\n"
            f"Location:\n{location_url}\n\n"
            f"Please contact them immediately and seek emergency assistance if required."
        )
    else:
        return (
            f"SAFEROUTE AI - SOS ALERT\n\n"
            f"{user_name} has triggered an emergency SOS.\n\n"
            f"Live location is currently unavailable.\n\n"
            f"Please contact them immediately and seek emergency assistance if required."
        )


# ---------------------------------------------------------------------------
# Emergency Notification Service
# ---------------------------------------------------------------------------

class EmergencyNotificationService:
    """
    Orchestrates fetching guardians and dispatching SMS alerts.
    Instantiated fresh per SOS request so adapter state is clean.
    """

    def __init__(self):
        self._adapter = TwilioSMSAdapter()

    @property
    def provider_configured(self) -> bool:
        return self._adapter.is_configured

    def dispatch(
        self,
        contacts,          # List[EmergencyContact] ORM objects
        user_name: str,
        location_url: Optional[str],
    ) -> NotificationResult:
        """
        Dispatch SMS alerts to all registered guardian contacts.

        Contract:
          - This method NEVER raises. All exceptions are caught internally.
          - SOS persistence is independent of this method's success.
        """
        if not contacts:
            return NotificationResult(status=NotificationStatus.NO_CONTACTS)

        if not self.provider_configured:
            return NotificationResult(
                status=NotificationStatus.PROVIDER_NOT_CONFIGURED,
                contacts_attempted=len(contacts),
                contacts_notified=0,
                details=[
                    ContactDispatchResult(
                        contact_name=c.name,
                        success=False,
                        error="SMS provider not configured"
                    )
                    for c in contacts
                ]
            )

        message_body = build_emergency_message(user_name, location_url)
        dispatch_results: list[ContactDispatchResult] = []

        for contact in contacts:
            normalized = normalize_phone(contact.phone)
            if normalized is None:
                dispatch_results.append(ContactDispatchResult(
                    contact_name=contact.name,
                    success=False,
                    error="Invalid or un-normalizable phone number — skipped"
                ))
                continue

            success = self._adapter.send(to=normalized, body=message_body)
            dispatch_results.append(ContactDispatchResult(
                contact_name=contact.name,
                success=success,
                error=None if success else "Provider delivery failed"
            ))

        notified = sum(1 for r in dispatch_results if r.success)
        attempted = len(dispatch_results)

        if notified == attempted:
            final_status = NotificationStatus.SENT
        elif notified > 0:
            final_status = NotificationStatus.PARTIAL
        else:
            final_status = NotificationStatus.FAILED

        return NotificationResult(
            status=final_status,
            contacts_attempted=attempted,
            contacts_notified=notified,
            details=dispatch_results
        )
