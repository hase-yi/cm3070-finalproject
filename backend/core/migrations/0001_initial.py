# Generated by Django 4.2.13 on 2024-07-20 09:21

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Book',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('isbn', models.CharField(max_length=13)),
                ('title', models.CharField(max_length=200)),
                ('author', models.CharField(max_length=200)),
                ('total_pages', models.PositiveIntegerField(blank=True, null=True)),
                ('release_year', models.PositiveBigIntegerField(blank=True, null=True)),
                ('image', models.URLField(blank=True, max_length=400, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='UserSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('share_all_reviews', models.BooleanField(default=False)),
                ('share_all_reading_progress', models.BooleanField(default=False)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='settings', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Shelf',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True, null=True)),
                ('image', models.URLField(blank=True, max_length=400, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='shelves', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Review',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField()),
                ('shared', models.BooleanField(default=False)),
                ('date', models.DateField(default=django.utils.timezone.now)),
                ('book', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='review', to='core.book')),
            ],
        ),
        migrations.CreateModel(
            name='ReadingProgress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('W', 'Want to Read'), ('R', 'Is Reading'), ('F', 'Finished Reading'), ('N', 'Not to Finish')], max_length=1)),
                ('current_page', models.PositiveIntegerField(default=0)),
                ('shared', models.BooleanField(default=False)),
                ('book', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='reading_progress', to='core.book')),
            ],
        ),
        migrations.CreateModel(
            name='Following',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('followed_users', models.ManyToManyField(related_name='followers', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField()),
                ('date', models.DateField(default=django.utils.timezone.now)),
                ('review', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='core.review')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='book',
            name='shelf',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='books', to='core.shelf'),
        ),
        migrations.AddField(
            model_name='book',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='books', to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='Activity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.CharField(max_length=200)),
                ('backlink', models.URLField()),
                ('book', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.book')),
                ('comment', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.comment')),
                ('reading_progress', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.readingprogress')),
                ('review', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.review')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
