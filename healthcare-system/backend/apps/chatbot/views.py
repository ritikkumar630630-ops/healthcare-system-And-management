"""
apps/chatbot/views.py
AI Symptom Checker — powered by Claude (Anthropic API).
"""

import json
import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from apps.doctors.models import Doctor


# ─── Symptom → Specialization mapping ────────────────────────────────────────

SYMPTOM_SPEC_MAP = {
    'chest pain':        'Cardiologist',
    'heart':             'Cardiologist',
    'palpitations':      'Cardiologist',
    'bp':                'Cardiologist',
    'blood pressure':    'Cardiologist',
    'headache':          'Neurologist',
    'migraine':          'Neurologist',
    'seizure':           'Neurologist',
    'dizziness':         'Neurologist',
    'numbness':          'Neurologist',
    'cough':             'General Physician',
    'fever':             'General Physician',
    'cold':              'General Physician',
    'flu':               'General Physician',
    'fatigue':           'General Physician',
    'weakness':          'General Physician',
    'vomiting':          'General Physician',
    'nausea':            'General Physician',
    'diabetes':          'Endocrinologist',
    'thyroid':           'Endocrinologist',
    'sugar':             'Endocrinologist',
    'hormone':           'Endocrinologist',
    'joint pain':        'Orthopedic Surgeon',
    'bone':              'Orthopedic Surgeon',
    'fracture':          'Orthopedic Surgeon',
    'back pain':         'Orthopedic Surgeon',
    'knee':              'Orthopedic Surgeon',
    'spine':             'Orthopedic Surgeon',
    'skin':              'Dermatologist',
    'rash':              'Dermatologist',
    'acne':              'Dermatologist',
    'itching':           'Dermatologist',
    'hair fall':         'Dermatologist',
    'eczema':            'Dermatologist',
    'eye':               'Ophthalmologist',
    'vision':            'Ophthalmologist',
    'ear':               'ENT Specialist',
    'throat':            'ENT Specialist',
    'nose':              'ENT Specialist',
    'sinus':             'ENT Specialist',
    'tonsil':            'ENT Specialist',
    'stomach':           'Gastroenterologist',
    'gastric':           'Gastroenterologist',
    'liver':             'Gastroenterologist',
    'acidity':           'Gastroenterologist',
    'constipation':      'Gastroenterologist',
    'pregnancy':         'Gynecologist',
    'menstrual':         'Gynecologist',
    'periods':           'Gynecologist',
    'pcod':              'Gynecologist',
    'pcos':              'Gynecologist',
    'child':             'Pediatrician',
    'baby':              'Pediatrician',
    'infant':            'Pediatrician',
    'mental':            'Psychiatrist',
    'anxiety':           'Psychiatrist',
    'depression':        'Psychiatrist',
    'stress':            'Psychiatrist',
    'insomnia':          'Psychiatrist',
    'shortness of breath': 'General Physician',
    'asthma':            'General Physician',
    'breathless':        'General Physician',
}

# ─── Claude system prompt ──────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are MediBot, a helpful AI medical assistant for a hospital management system in India.
Your role is to help patients understand their symptoms and guide them.

When a patient describes symptoms or asks a health question, respond ONLY in valid JSON format (no extra text, no markdown, no backticks):
{
  "greeting": "A warm, empathetic 1-2 sentence response acknowledging their concern",
  "assessment": "Brief 2-3 sentence assessment of the symptoms",
  "possible_conditions": ["condition1", "condition2"],
  "suggested_specialization": "The most relevant doctor specialization",
  "medicines": [
    {
      "name": "Medicine name (generic)",
      "type": "Tablet/Syrup/Cream/etc",
      "purpose": "What it helps with",
      "dosage": "Standard adult dosage",
      "note": "Important precaution"
    }
  ],
  "home_remedies": [
    "Remedy 1 with brief explanation",
    "Remedy 2 with brief explanation"
  ],
  "do_list": ["What patient should do"],
  "dont_list": ["What patient should avoid"],
  "emergency_warning": "",
  "follow_up_advice": "When to see a doctor"
}

RULES:
1. MANDATORY: medicines array mein hamesha 2-3 OTC medicines ZAROOR daalo with full details.
   NEVER return empty medicines array. Brand name brackets mein likho jaise:
   "Paracetamol (Crocin/Dolo 650)". Yeh rule sabse important hai.
2. For serious symptoms (chest pain, difficulty breathing, high fever, bleeding), set emergency_warning.
3. Keep language simple. Patient may not have medical knowledge.
4. Suggest 2-3 practical home remedies.
5. Respond in the same language the patient uses.
6. Never diagnose definitively. Use may be, could be, possibly.
7. Return ONLY valid JSON. No preamble, no backticks, no markdown.
"""


# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_specializations_from_text(text):
    text_lower = text.lower()
    matched = []
    for keyword, spec in SYMPTOM_SPEC_MAP.items():
        if keyword in text_lower and spec not in matched:
            matched.append(spec)
    return matched if matched else ['General Physician']


def get_doctors_for_specs(specs):
    suggested = []
    for spec in specs[:2]:
        first_word = spec.split()[0]
        doctors = Doctor.objects.filter(
            specialization__icontains=first_word,
            is_available=True
        ).select_related('user', 'department')[:3]

        for doc in doctors:
            suggested.append({
                'id':               doc.id,
                'name':             "Dr. %s" % doc.user.get_full_name(),
                'specialization':   doc.specialization,
                'department':       doc.department.name if doc.department else '',
                'consultation_fee': str(doc.consultation_fee),
                'experience_years': doc.experience_years,
                'working_days':     doc.working_days,
            })
    return suggested


def call_claude_api(user_message, conversation_history):
    api_key = getattr(settings, 'ANTHROPIC_API_KEY', '').strip()
    if not api_key:
        return None, 'ANTHROPIC_API_KEY not set in settings.'

    # Build messages list (keep last 6 exchanges to avoid token overload)
    messages = list(conversation_history[-6:]) + [
        {'role': 'user', 'content': user_message}
    ]

    try:
        resp = requests.post(
            'https://api.anthropic.com/v1/messages',
            headers={
                'x-api-key':         api_key,
                'anthropic-version': '2023-06-01',
                'content-type':      'application/json',
            },
            json={
                'model':      'claude-sonnet-4-20250514',
                'max_tokens': 2500,
                'system':     SYSTEM_PROMPT,
                'messages':   messages,
            },
            timeout=30,
        )
    except requests.exceptions.Timeout:
        return None, 'Request timed out.'
    except requests.exceptions.RequestException as e:
        return None, str(e)

    if resp.status_code != 200:
        return None, 'API error %d: %s' % (resp.status_code, resp.text[:200])

    data = resp.json()
    content = data.get('content', [{}])[0].get('text', '')
    return content, None


def parse_claude_json(raw):
    """Safely extract JSON from Claude response."""
    text = raw.strip()
    # Strip markdown code fences if present
    if text.startswith('```'):
        parts = text.split('```')
        for part in parts:
            part = part.strip()
            if part.startswith('json'):
                part = part[4:].strip()
            if part.startswith('{'):
                text = part
                break
    # Find first { and last }
    start = text.find('{')
    end   = text.rfind('}')
    if start != -1 and end != -1:
        text = text[start:end + 1]
    return json.loads(text)


# ─── View ─────────────────────────────────────────────────────────────────────

class SymptomCheckerView(APIView):
    """
    POST /api/chatbot/symptom-check/
    Body: { "symptoms": "...", "history": [ {role, content}, ... ] }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        symptoms_text = request.data.get('symptoms', '').strip()
        history       = request.data.get('history', [])

        if not symptoms_text:
            return Response({'error': 'Please describe your symptoms.'}, status=400)

        # Call Claude
        raw_response, error = call_claude_api(symptoms_text, history)

        ai_data = None
        if raw_response:
            try:
                ai_data = parse_claude_json(raw_response)
            except (json.JSONDecodeError, ValueError):
                ai_data = None

        if not ai_data:
            ai_data = {
                'greeting': 'Aapki problem samajh aayi. Neeche doctors ki list hai.',
        'assessment': 'Aapke symptoms ke basis par main suggest karta hoon ki aap ek specialist se milein.',
        'possible_conditions': [],
        'suggested_specialization': 'General Physician',
        'medicines': [
            {
                'name': 'Paracetamol (Crocin / Dolo 650)',
                'type': 'Tablet',
                'purpose': 'Fever, body ache aur dard mein rahat',
                'dosage': '1 tablet (500mg) har 6-8 ghante mein khane ke baad, max 4 baar/day',
                'note': 'Liver problem ho to na lein. 3 din se zyada na lein bina doctor ke.',
            },
            {
                'name': 'ORS (Electral / Glucon-D)',
                'type': 'Powder (Oral Solution)',
                'purpose': 'Dehydration aur weakness mein rahat',
                'dosage': '1 packet 1 litre paani mein ghol kar din mein 2-3 baar',
                'note': 'Paani ubal ke thanda kiya hua use karein.',
            },
        ],
        'home_remedies': [
            'Zyada paani piyen aur rest karein.',
            'Apne symptoms ko observe karein aur worsen hone par turant doctor ke paas jayein.',
        ],
        'do_list': ['Jald se jald doctor se milein.'],
        'dont_list': ['Bina doctor ki salah ke koi bhi medicine na lein.'],
        'emergency_warning': '',
        'follow_up_advice': 'Agar symptoms badh rahein hain to aaj hi doctor se milein.',
    }
            

        # Match doctors from DB
        specs = get_specializations_from_text(symptoms_text)
        ai_spec = ai_data.get('suggested_specialization', '')
        if ai_spec and ai_spec not in specs:
            specs.insert(0, ai_spec)
        suggested_doctors = get_doctors_for_specs(specs)

        return Response({
            'success':          True,
            'ai_response':      ai_data,
            'suggested_doctors': suggested_doctors,
            'specializations':  specs,
            'disclaimer': (
                'DISCLAIMER: Yeh AI response sirf informational purposes ke liye hai. '
                'Yeh professional medical advice ka substitute nahi hai. '
                'Koi bhi medicine lene se pehle qualified doctor se zaroor milein. '
                'Emergency mein 108 (Ambulance) ya 104 (Medical Helpline) call karein.'
            ),
        })