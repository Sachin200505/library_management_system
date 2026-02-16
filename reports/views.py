import csv
from datetime import date
from io import BytesIO

from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render

from accounts.decorators import role_required
from accounts.models import UserProfile
from book_suggestions.models import BookSuggestion
from transactions.models import BookIssue, Fine

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
except Exception:  # pragma: no cover - fallback if reportlab missing
    A4 = None
    canvas = None


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def reports_home(request):
    return render(request, 'reports/index.html')


def _csv_response(filename, rows, headers):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    writer = csv.writer(response)
    writer.writerow(headers)
    for row in rows:
        writer.writerow(row)
    return response


def _pdf_response(filename, title, rows, headers):
    def _fallback_pdf_bytes(title_text, header_list, row_list):
        # Minimal, dependency-free PDF to avoid CSV fallback when reportlab is missing.
        def esc(text):
            return str(text).replace('\\', r'\\').replace('(', r'\(').replace(')', r'\)')

        lines = [title_text, ' | '.join(header_list)] + [' | '.join([esc(x) for x in row]) for row in row_list]
        text_ops = ["BT", "/F1 12 Tf", "50 780 Td", "14 TL"]
        for idx, line in enumerate(lines):
            if idx > 0:
                text_ops.append("T*")
            text_ops.append(f"({line}) Tj")
        text_ops.append("ET")
        stream = "\n".join(text_ops)

        pdf_parts = ["%PDF-1.4\n"]
        xref_offsets = []

        def add_obj(obj_num: int, content: str):
            offset = sum(len(p.encode('utf-8')) for p in pdf_parts)
            xref_offsets.append(offset)
            pdf_parts.append(f"{obj_num} 0 obj\n{content}\nendobj\n")

        add_obj(1, "<< /Type /Catalog /Pages 2 0 R >>")
        add_obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
        add_obj(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>")
        add_obj(4, f"<< /Length {len(stream.encode('utf-8'))} >>\nstream\n{stream}\nendstream")
        add_obj(5, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

        xref_start = sum(len(p.encode('utf-8')) for p in pdf_parts)
        xref_lines = ["xref", f"0 {len(xref_offsets) + 1}", "0000000000 65535 f "]
        for off in xref_offsets:
            xref_lines.append(f"{off:010d} 00000 n ")
        trailer = [
            "trailer",
            f"<< /Size {len(xref_offsets) + 1} /Root 1 0 R >>",
            "startxref",
            str(xref_start),
            "%%EOF",
        ]
        pdf_parts.append("\n".join(xref_lines + trailer) + "\n")
        return "".join(pdf_parts).encode('utf-8')

    if canvas:
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        y = height - 50
        p.setFont('Helvetica-Bold', 14)
        p.drawString(50, y, title)
        y -= 30
        p.setFont('Helvetica', 10)
        header_line = ' | '.join(headers)
        p.drawString(50, y, header_line)
        y -= 20
        for row in rows:
            p.drawString(50, y, ' | '.join([str(x) for x in row]))
            y -= 16
            if y < 50:
                p.showPage()
                y = height - 50
        p.save()
        pdf = buffer.getvalue()
        buffer.close()
    else:
        pdf = _fallback_pdf_bytes(title, headers, rows)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response.write(pdf)
    return response


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def export_issued_csv(request):
    issues = BookIssue.objects.filter(status=BookIssue.STATUS_ISSUED)
    rows = [(i.book.title, i.user.username, i.issue_date, i.due_date) for i in issues]
    return _csv_response('issued_books.csv', rows, ['Book', 'User', 'Issue Date', 'Due Date'])


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def export_overdue_csv(request):
    issues = BookIssue.objects.filter(status=BookIssue.STATUS_ISSUED, due_date__lt=date.today())
    rows = [(i.book.title, i.user.username, i.due_date) for i in issues]
    return _csv_response('overdue_books.csv', rows, ['Book', 'User', 'Due Date'])


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def export_fines_csv(request):
    fines = Fine.objects.select_related('issue__book', 'issue__user')
    rows = [(f.issue.book.title, f.issue.user.username, f.amount, f.paid, f.created_at) for f in fines]
    return _csv_response('fines.csv', rows, ['Book', 'User', 'Amount', 'Paid', 'Created'])


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def export_suggestions_csv(request):
    suggestions = BookSuggestion.objects.select_related('created_by')
    rows = [(s.title, s.author, s.category, s.status, s.created_by.username) for s in suggestions]
    return _csv_response('book_suggestions.csv', rows, ['Title', 'Author', 'Category', 'Status', 'User'])


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def export_issued_pdf(request):
    issues = BookIssue.objects.filter(status=BookIssue.STATUS_ISSUED)
    rows = [(i.book.title, i.user.username, i.issue_date, i.due_date) for i in issues]
    return _pdf_response('issued_books.pdf', 'Issued Books', rows, ['Book', 'User', 'Issue Date', 'Due Date'])


@login_required
@role_required(UserProfile.ROLE_ADMIN)
def export_suggestions_pdf(request):
    suggestions = BookSuggestion.objects.select_related('created_by')
    rows = [(s.title, s.author, s.category, s.status, s.created_by.username) for s in suggestions]
    return _pdf_response('book_suggestions.pdf', 'Book Suggestions', rows, ['Title', 'Author', 'Category', 'Status', 'User'])
