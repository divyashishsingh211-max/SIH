"""
SIH26027 — Mock railway data generator
Simulates TMS, SMMS, TDMS and COA data sources.
"""

def generate():
    track_maintenance = [
        {'id': 'TMS-001', 'asset': 'Track Section A1', 'type': 'Engineering', 'defect': 'Rail fracture', 'criticality': 9, 'urgency': 8, 'status': 'pending', 'hours': 6},
        {'id': 'TMS-002', 'asset': 'Track Section B2', 'type': 'Engineering', 'defect': 'Sleeper degradation', 'criticality': 6, 'urgency': 5, 'status': 'pending', 'hours': 4},
        {'id': 'TMS-003', 'asset': 'Track Section C3', 'type': 'Engineering', 'defect': 'Ballast washout', 'criticality': 8, 'urgency': 7, 'status': 'pending', 'hours': 8},
        {'id': 'TMS-004', 'asset': 'Track Section D4', 'type': 'Engineering', 'defect': 'Switch wear', 'criticality': 5, 'urgency': 6, 'status': 'pending', 'hours': 3},
        {'id': 'TMS-005', 'asset': 'Track Section E5', 'type': 'Engineering', 'defect': 'Gauge deviation', 'criticality': 7, 'urgency': 9, 'status': 'pending', 'hours': 5},
    ]

    signalling_maintenance = [
        {'id': 'SMMS-001', 'asset': 'Signal Box S1', 'type': 'Signalling', 'defect': 'Relay failure', 'criticality': 10, 'urgency': 9, 'status': 'pending', 'hours': 4},
        {'id': 'SMMS-002', 'asset': 'Signal Box S2', 'type': 'Signalling', 'defect': 'Cable fault', 'criticality': 8, 'urgency': 7, 'status': 'pending', 'hours': 6},
        {'id': 'SMMS-003', 'asset': 'Signal Box S3', 'type': 'Signalling', 'defect': 'Software error', 'criticality': 7, 'urgency': 5, 'status': 'pending', 'hours': 3},
        {'id': 'SMMS-004', 'asset': 'Level Crossing LC1', 'type': 'Signalling', 'defect': 'Gate actuator fault', 'criticality': 9, 'urgency': 8, 'status': 'pending', 'hours': 5},
    ]

    traction_maintenance = [
        {'id': 'TDMS-001', 'asset': 'Substation ST1', 'type': 'Traction', 'defect': 'Transformer overheating', 'criticality': 8, 'urgency': 8, 'status': 'pending', 'hours': 7},
        {'id': 'TDMS-002', 'asset': 'Trolley Pole TP3', 'type': 'Traction', 'defect': 'Wire breakage', 'criticality': 6, 'urgency': 6, 'status': 'pending', 'hours': 4},
        {'id': 'TDMS-003', 'asset': 'Substation ST2', 'type': 'Traction', 'defect': 'Cooling system fault', 'criticality': 7, 'urgency': 5, 'status': 'pending', 'hours': 5},
        {'id': 'TDMS-004', 'asset': 'Power Feed PF5', 'type': 'Traction', 'defect': 'Insulation failure', 'criticality': 9, 'urgency': 7, 'status': 'pending', 'hours': 6},
    ]

    train_timetable = [
        {'train': 'Express-101', 'route': 'Section A1-C3', 'departure': '06:00', 'arrival': '08:30', 'priority': 'high'},
        {'train': 'Passenger-205', 'route': 'Section B2-D4', 'departure': '09:00', 'arrival': '11:00', 'priority': 'medium'},
        {'train': 'Freight-301', 'route': 'Section E5-A1', 'departure': '12:00', 'arrival': '14:00', 'priority': 'low'},
        {'train': 'Express-102', 'route': 'Section S1-S3', 'departure': '15:00', 'arrival': '17:30', 'priority': 'high'},
    ]

    block_availability = {
        'Section A1': {'available': True, 'hours': list(range(1, 24))},
        'Section B2': {'available': True, 'hours': list(range(1, 24))},
        'Section C3': {'available': False, 'hours': [6, 7, 8, 9, 10]},
        'Section D4': {'available': True, 'hours': list(range(1, 24))},
        'Section E5': {'available': True, 'hours': list(range(1, 24))},
        'Signal Box S1': {'available': True, 'hours': list(range(1, 24))},
        'Signal Box S2': {'available': True, 'hours': list(range(1, 24))},
        'Substation ST1': {'available': True, 'hours': list(range(1, 24))},
    }

    return {
        'track_maintenance': track_maintenance,
        'signalling_maintenance': signalling_maintenance,
        'traction_maintenance': traction_maintenance,
        'train_timetable': train_timetable,
        'block_availability': block_availability,
    }

if __name__ == '__main__':
    print(generate())