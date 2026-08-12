# Polityka prywatności

Ostatnia aktualizacja: 12 sierpnia 2026

Tak działa Gender Diary w wydanej wersji. Każde miejsce jest tu opisane od dnia,
w którym rusza, i ani chwili wcześniej.

## Czego to dotyczy

Gender Diary działa w kilku miejscach naraz i każde z nich widzi co innego:

- aplikacja webowa pod adresem `app.genderdiary.barankiewicz.dev`, kiedy
  hosting ruszy,
- kanały dystrybucji wydań na Androida (Google Play, F-Droid, APK do pobrania),
  kiedy te wydania się pojawią,
- miejsce, w którym ląduje kopia zapasowa, jeśli zdecydujesz się ją zrobić.

Jedno zdanie o wszystkich trzech naraz byłoby nieprawdziwe przynajmniej w jednym
z nich, więc każde jest opisane osobno.

## Aplikacja webowa

Serwer, który wysyła aplikację do przeglądarki, widzi przy pobraniu i przy
aktualizacji to samo, co widzi każdy serwer WWW:

- adres IP,
- godzinę zapytania,
- ścieżki i rozmiary pobranych plików,
- nagłówki User-Agent i Referer wysłane przez przeglądarkę.

Nie dostaje za to kont, identyfikatorów profilu ani wpisów z dziennika. Treść
dziennika zostaje w pamięci przeglądarki, na urządzeniu.

## Wydania na Androida

Wydania na Androida rozchodzą się przez sklepy i katalogi, które mają własną
telemetrię i własne konta. Operator takiego kanału może zobaczyć instalację
i aktualizację, na zasadach ze swojego regulaminu, nie z tego dokumentu.

W samej aplikacji dane zostają na urządzeniu. Przy zwykłym używaniu treść
dziennika nie idzie na żaden serwer projektu.

## Kopia zapasowa i miejsce, w którym leży

Przy eksporcie miejsce zapisu wybierasz ty.

Jeśli plik trafi na dysk w chmurze albo do dostawcy dokumentów, ten dostawca
zobaczy metadane pliku: nazwę, rozmiar, datę zapisu i wpisy w logach dostępu do
konta.

Zaszyfrowanej kopii nie da się otworzyć bez jej hasła. Nikt tego nie odczyta,
Gender Diary też nie, a zgubionego hasła nikt nie odzyska.

Zwykły eksport do CSV albo JSON to co innego: nie jest szyfrowany i każdy, kto
dostanie ten plik, przeczyta cały dziennik. Aplikacja mówi to przy eksporcie
i ten dokument mówi to samo.

## Czego ten projekt nie obiecuje

- Że aplikacja webowa nie wykonuje żadnych zapytań sieciowych. Wykonuje, bo
  inaczej nie dałoby się jej pobrać ani zaktualizować.
- Że kanały dystrybucji niczego nie zbierają.
- Że da się odzyskać zapomniane hasło do dziennika albo hasło do kopii. Nie da
  się.

## Wsparcie i zgłoszenia bezpieczeństwa

Ani pomoc w problemie, ani zgłoszenie błędu bezpieczeństwa nie wymaga pokazywania
komukolwiek treści dziennika.

- zasady wsparcia: `SUPPORT.md`,
- zgłaszanie podatności: `SECURITY.md`.
