from decimal import Decimal

from django.db import migrations


def seed_default_criteria(apps, schema_editor):
    EvaluationCriterion = apps.get_model('evaluations', 'EvaluationCriterion')

    default_criteria = [
        {
            'name': 'Technical Competence',
            'description': 'Quality of technical output and practical skill application.',
            'max_score': Decimal('20.00'),
            'weight': Decimal('1.00'),
            'display_order': 1,
        },
        {
            'name': 'Communication',
            'description': 'Clarity, professionalism, and responsiveness in communication.',
            'max_score': Decimal('20.00'),
            'weight': Decimal('1.00'),
            'display_order': 2,
        },
        {
            'name': 'Problem Solving',
            'description': 'Ability to analyze tasks, resolve issues, and adapt solutions.',
            'max_score': Decimal('20.00'),
            'weight': Decimal('1.00'),
            'display_order': 3,
        },
        {
            'name': 'Professionalism',
            'description': 'Punctuality, reliability, ethics, and workplace conduct.',
            'max_score': Decimal('20.00'),
            'weight': Decimal('1.00'),
            'display_order': 4,
        },
        {
            'name': 'Learning Initiative',
            'description': 'Self-driven growth, curiosity, and openness to feedback.',
            'max_score': Decimal('20.00'),
            'weight': Decimal('1.00'),
            'display_order': 5,
        },
    ]

    for criterion in default_criteria:
        EvaluationCriterion.objects.get_or_create(name=criterion['name'], defaults=criterion)


def rollback_default_criteria(apps, schema_editor):
    EvaluationCriterion = apps.get_model('evaluations', 'EvaluationCriterion')
    names = [
        'Technical Competence',
        'Communication',
        'Problem Solving',
        'Professionalism',
        'Learning Initiative',
    ]
    EvaluationCriterion.objects.filter(name__in=names).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('evaluations', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_default_criteria, rollback_default_criteria),
    ]
