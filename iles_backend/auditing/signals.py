from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from placements.models import Placement
from logbook.models import WeeklyLog
from evaluations.models import PlacementEvaluation, FinalInternshipScore

from .audit import capture_previous_state, log_action, serialize_model
from .models import AuditLog


@receiver(pre_save, sender=Placement)
def capture_placement_previous(sender, instance, **kwargs):
    capture_previous_state(sender, instance)


@receiver(pre_save, sender=WeeklyLog)
def capture_weekly_log_previous(sender, instance, **kwargs):
    capture_previous_state(sender, instance)


@receiver(pre_save, sender=PlacementEvaluation)
def capture_evaluation_previous(sender, instance, **kwargs):
    capture_previous_state(sender, instance)


@receiver(pre_save, sender=FinalInternshipScore)
def capture_final_score_previous(sender, instance, **kwargs):
    capture_previous_state(sender, instance)


# ===== PLACEMENT SIGNALS =====

@receiver(post_save, sender=Placement)
def log_placement_action(sender, instance, created, **kwargs):
    """Log placement creation/update."""
    previous_value = getattr(instance, '_audit_previous_state', None)
    new_value = serialize_model(instance)

    if created:
        log_action(
            action=AuditLog.ACTION_CREATE,
            entity_type=AuditLog.ENTITY_PLACEMENT,
            entity_id=instance.id,
            entity_description=f"Placement #{instance.id}: {instance.student.get_full_name()}",
            actor=instance.student,
            previous_value=None,
            new_value=new_value,
        )
    else:
        log_action(
            action=AuditLog.ACTION_UPDATE,
            entity_type=AuditLog.ENTITY_PLACEMENT,
            entity_id=instance.id,
            entity_description=f"Placement #{instance.id}: {instance.student.get_full_name()}",
            previous_value=previous_value,
            new_value=new_value,
        )


# ===== WEEKLY LOG SIGNALS =====

@receiver(post_save, sender=WeeklyLog)
def log_weekly_log_action(sender, instance, created, **kwargs):
    """Log weekly log creation/update."""
    previous_value = getattr(instance, '_audit_previous_state', None)
    new_value = serialize_model(instance)

    if created:
        log_action(
            action=AuditLog.ACTION_CREATE,
            entity_type=AuditLog.ENTITY_LOGBOOK,
            entity_id=instance.id,
            entity_description=f"Log for {instance.placement.student.get_full_name()} (Week ending {instance.week_ending_date})",
            actor=instance.placement.student,
            previous_value=None,
            new_value=new_value,
        )
    else:
        log_action(
            action=AuditLog.ACTION_UPDATE,
            entity_type=AuditLog.ENTITY_LOGBOOK,
            entity_id=instance.id,
            entity_description=f"Log for {instance.placement.student.get_full_name()} (Week ending {instance.week_ending_date})",
            previous_value=previous_value,
            new_value=new_value,
        )


# ===== PLACEMENT EVALUATION SIGNALS =====

@receiver(post_save, sender=PlacementEvaluation)
def log_evaluation_action(sender, instance, created, **kwargs):
    """Log evaluation creation/update."""
    previous_value = getattr(instance, '_audit_previous_state', None)
    new_value = serialize_model(instance)

    if created:
        log_action(
            action=AuditLog.ACTION_CREATE,
            entity_type=AuditLog.ENTITY_EVALUATION,
            entity_id=instance.id,
            entity_description=f"Evaluation for {instance.student.get_full_name()} (Placement #{instance.placement_id})",
            previous_value=None,
            new_value=new_value,
        )
    else:
        log_action(
            action=AuditLog.ACTION_UPDATE,
            entity_type=AuditLog.ENTITY_EVALUATION,
            entity_id=instance.id,
            entity_description=f"Evaluation for {instance.student.get_full_name()} (Placement #{instance.placement_id})",
            previous_value=previous_value,
            new_value=new_value,
        )


# ===== FINAL INTERNSHIP SCORE SIGNALS =====

@receiver(post_save, sender=FinalInternshipScore)
def log_final_score_action(sender, instance, created, **kwargs):
    """Log final score creation/computation."""
    previous_value = getattr(instance, '_audit_previous_state', None)
    new_value = serialize_model(instance)

    if created:
        log_action(
            action=AuditLog.ACTION_COMPUTE,
            entity_type=AuditLog.ENTITY_SCORE,
            entity_id=instance.id,
            entity_description=f"Final Score for {instance.student.get_full_name()}: {instance.final_score} ({instance.grade})",
            actor=instance.computed_by,
            previous_value=None,
            new_value=new_value,
        )
    else:
        log_action(
            action=AuditLog.ACTION_UPDATE,
            entity_type=AuditLog.ENTITY_SCORE,
            entity_id=instance.id,
            entity_description=f"Final Score for {instance.student.get_full_name()}: {instance.final_score} ({instance.grade})",
            previous_value=previous_value,
            new_value=new_value,
        )
