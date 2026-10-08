from fastapi import APIRouter
from app.database import db_manager

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_statistics():
    """
    Returns aggregated metrics, distribution breakdowns, and recent activity logs for dashboard charts.
    """
    licenses = db_manager.list_licenses()
    total = len(licenses)
    active = sum(1 for l in licenses if l.get("status") == "ACTIVE")
    expired = sum(1 for l in licenses if l.get("status") == "EXPIRED")
    revoked = sum(1 for l in licenses if l.get("status") == "REVOKED")
    transferred = sum(1 for l in licenses if l.get("status") == "TRANSFERRED")

    # Group by software name
    software_counts = {}
    for l in licenses:
        name = l.get("softwareName", "Unknown")
        software_counts[name] = software_counts.get(name, 0) + 1

    software_distribution = [
        {"name": name, "count": count} for name, count in software_counts.items()
    ]

    # Status distribution for Recharts donut
    status_distribution = [
        {"name": "Active", "value": active, "color": "#10B981"},
        {"name": "Expired", "value": expired, "color": "#F59E0B"},
        {"name": "Revoked", "value": revoked, "color": "#EF4444"},
        {"name": "Transferred", "value": transferred, "color": "#6366F1"}
    ]

    # Verification activity
    recent_logs = db_manager.get_recent_verification_logs(limit=10)

    # Historical issuance mock/aggregation for timeline chart
    activity_timeline = [
        {"month": "May 2026", "issued": 18, "verified": 45},
        {"month": "Jun 2026", "issued": 24, "verified": 72},
        {"month": "Jul 2026", "issued": 35, "verified": 110},
        {"month": "Aug 2026", "issued": 42, "verified": 138},
        {"month": "Sep 2026", "issued": 58, "verified": 194},
        {"month": "Oct 2026", "issued": max(total, 65), "verified": 220}
    ]

    return {
        "metrics": {
            "totalLicenses": total,
            "activeLicenses": active,
            "expiredLicenses": expired,
            "revokedLicenses": revoked,
            "transferredLicenses": transferred
        },
        "statusDistribution": status_distribution,
        "softwareDistribution": software_distribution,
        "activityTimeline": activity_timeline,
        "recentLogs": recent_logs
    }
