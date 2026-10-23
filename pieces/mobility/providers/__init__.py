"""TRNXP ModeProviders — walk/OSRM, deep-link PT oficial, gancho OTP."""

from .base import GeoContext, ModeOffer, ModeProvider, offer_to_dict
from .deeplink import OfficialPlannerProvider
from .osrm import OsrmWalkProvider
from .otp_proxy import OtpProxyProvider

__all__ = [
    "GeoContext",
    "ModeOffer",
    "ModeProvider",
    "OfficialPlannerProvider",
    "OsrmWalkProvider",
    "OtpProxyProvider",
    "offer_to_dict",
]
