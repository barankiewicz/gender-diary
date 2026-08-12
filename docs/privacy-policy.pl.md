# Polityka prywatności

Ostatnia aktualizacja: 12 sierpnia 2026

Tak działa Gender Diary w wersji, która jest teraz dostępna. Nie ma tu planów na
przyszłość, tylko to, co aplikacja robi dzisiaj.

## Czego to dotyczy

Gender Diary działa w kilku miejscach naraz i każde z nich widzi co innego:

- aplikacja webowa pod adresem `app.genderdiary.barankiewicz.dev`,
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

Nie ma tam kont ani identyfikatorów profilu, a wpisy z dziennika nie są nigdzie
wysyłane. Treść dziennika zostaje w pamięci przeglądarki, na urządzeniu.

## Wydania na Androida

Wydania na Androida rozchodzą się przez sklepy i katalogi, które mają własną
telemetrię i własne konta. Operator takiego kanału może zobaczyć instalację
i aktualizację, na zasadach ze swojego regulaminu, nie z tego dokumentu.

W samej aplikacji dane zostają na urządzeniu. Przy zwykłym używaniu treść
dziennika nie idzie na żaden serwer projektu.

## Kopia zapasowa i miejsce, w którym leży

Przy eksporcie kopia jest szyfrowana, a miejsce zapisu wybierasz ty.

Jeśli plik trafi na dysk w chmurze albo do dostawcy dokumentów, ten dostawca
zobaczy metadane pliku: nazwę, rozmiar, datę zapisu i wpisy w logach dostępu do
konta.

Bez hasła do tej kopii nikt nie odczyta jej zawartości. Gender Diary też nie.

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
