"""
SIH26027 — AI/ML Scoring + Optimization Engine
Provides criticality scoring and greedy scheduling for maintenance tasks.
"""

import json
from data_generator import generate

def score_task(task):
    """Compute a priority score for a maintenance task."""
    # Formula: criticality*0.5 + urgency*0.3 + hours*0.1
    return (task.get('criticality', 0) * 0.5 +
            task.get('urgency', 0) * 0.3 +
            task.get('hours', 0) * 0.1)

def priority_label(criticality):
    """Map criticality to a human‑readable priority."""
    if criticality >= 9:
        return 'CRITICAL'
    if criticality >= 7:
        return 'HIGH'
    if criticality >= 5:
        return 'MEDIUM'
    return 'LOW'

def optimize_schedule(tasks):
    """Greedy optimization: schedule by descending score, calculate utilization."""
    # Attach score and priority label
    scored = []
    for t in tasks:
        score = score_task(t)
        scored.append({
            **t,
            'score': score,
            'priority_label': priority_label(t.get('criticality', 0))
        })
    # Sort descending by score
    scored.sort(key=lambda x: x['score'], reverse=True)

    total_hours = sum(t.get('hours', 0) for t in scored)
    # Assume a week has 7*24 = 168 hours available
    utilization = round((total_hours / 168) * 100, 1)
    asset_availability = round(100 - utilization, 1)

    # Count by priority
    counts = {'CRITICAL':0, 'HIGH':0, 'MEDIUM':0, 'LOW':0}
    for t in scored:
        counts[t['priority_label']] += 1

    return {
        'tasks': scored,
        'metrics': {
            'total_tasks': len(scored),
            'total_hours': total_hours,
            'utilization_percent': utilization,
            'asset_availability': asset_availability,
            'critical_tasks': counts['CRITICAL'],
            'high_tasks': counts['HIGH'],
            'medium_tasks': counts['MEDIUM'],
            'low_tasks': counts['LOW'],
        }
    }

if __name__ == '__main__':
    # Generate mock data and run the optimizer
    data = generate()
    all_tasks = (data['track_maintenance'] +
                 data['signalling_maintenance'] +
                 data['traction_maintenance'])
    plan = optimize_schedule(all_tasks)
    print(json.dumps(plan, indent=2))