def get_reports(days, domain):
    return {
        "dateRanges": [{"startDate": f"{days}daysAgo", "endDate": "today"}],
        "dimensions": [{"name": "eventName"}],
        "metrics": [{"name": "eventCount"}, {"name": "totalUsers"}],
        "dimensionFilter": {
            "filter": {
                "fieldName": "eventName",
                "inListFilter": {"values": domain["events"]},
            }
        },
        "orderBys": [{"metric": {"metricName": "eventCount"}, "desc": True}],
    }
