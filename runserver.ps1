Set-Location -Path $PSScriptRoot
. .\.venv\Scripts\Activate.ps1
Set-Location .\app_horarios
python manage.py runserver
