# -*- coding: utf-8 -*-
# Generated by Django 1.11.27 on 2020-01-23 19:07
from __future__ import unicode_literals

import logging

from django.db import migrations

from sentry import eventstore
from sentry.utils.query import RangeQuerySetWrapper

logger = logging.getLogger(__name__)


def backfill_file_type(apps, schema_editor):
    """
    Fill the new EventAttachment.type column with values from EventAttachment.file.type.
    """
    EventAttachment = apps.get_model("sentry", "EventAttachment")
    all_event_attachments = EventAttachment.objects.select_related("file").all()
    for event_attachment in RangeQuerySetWrapper(all_event_attachments, step=1000):
        if event_attachment.type is None:
            event_attachment.type = event_attachment.file.type
            event_attachment.save(update_fields=["type"])


class Migration(migrations.Migration):
    # This flag is used to mark that a migration shouldn't be automatically run in
    # production. We set this to True for operations that we think are risky and want
    # someone from ops to run manually and monitor.
    # General advice is that if in doubt, mark your migration as `is_dangerous`.
    # Some things you should always mark as dangerous:
    # - Adding indexes to large tables. These indexes should be created concurrently,
    #   unfortunately we can't run migrations outside of a transaction until Django
    #   1.10. So until then these should be run manually.
    # - Large data migrations. Typically we want these to be run manually by ops so that
    #   they can be monitored. Since data migrations will now hold a transaction open
    #   this is even more important.
    # - Adding columns to highly active tables, even ones that are NULL.
    is_dangerous = True

    # This flag is used to decide whether to run this migration in a transaction or not.
    # By default we prefer to run in a transaction, but for migrations where you want
    # to `CREATE INDEX CONCURRENTLY` this needs to be set to False. Typically you'll
    # want to create an index concurrently when adding one to an existing table.
    atomic = False

    dependencies = [
        ("sentry", "0100_file_type_on_event_attachment"),
    ]

    operations = [
        migrations.RunPython(backfill_file_type, migrations.RunPython.noop),
    ]