from django.db import models


class Author(models.Model):
    name = models.CharField(max_length=150, unique=True)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name


class Book(models.Model):
    isbn = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=255)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='books')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='books')
    quantity = models.PositiveIntegerField(default=1)
    available_count = models.PositiveIntegerField(default=1)
    description = models.TextField(blank=True)
    published_year = models.PositiveIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.title} ({self.isbn})"

    @property
    def is_available(self) -> bool:
        return self.available_count > 0

    def save(self, *args, **kwargs):
        if self.available_count > self.quantity:
            self.available_count = self.quantity
        super().save(*args, **kwargs)
