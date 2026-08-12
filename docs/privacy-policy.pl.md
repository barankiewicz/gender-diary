# Polityka prywatnosci

Ostatnia aktualizacja: 2026-08-12

Ten dokument opisuje, jak dziala Gender Diary w obecnej wersji.

## Zakres

Gender Diary dziala w kilku miejscach, a kazde z nich ma inny profil
obserwacji:

- hostowana aplikacja webowa pod adresem `app.genderdiary.barankiewicz.dev`,
- kanaly dystrybucji wydan Androida (Google Play, F-Droid, bezposredni APK),
  gdy wydania Android zostana opublikowane,
- opcjonalne miejsca zapisu archiwum wybrane przez osobe uzywajaca aplikacji.

Jedno haslo nie opisze bezpiecznie tych trzech sytuacji, dlatego polityka
oddziela je od siebie.

## Hostowana aplikacja webowa

Host widzi zwykle metadane serwera WWW podczas ladowania lub aktualizacji
aplikacji, na przyklad:

- adres IP,
- czas zapytania,
- sciezki i rozmiary pobieranych plikow,
- naglowki User-Agent i Referrer wyslane przez przegladarke.

Host nie dostaje kont, identyfikatorow profilu ani przesylanych wpisow z
dziennika. Tresc dziennika jest zapisywana lokalnie w pamieci przegladarki na
urzadzeniu.

## Dystrybucja w sklepach Android

Wydania Android sa dostarczane przez kanaly, ktore maja wlasne zasady telemetry
i kont. Operatorzy sklepow moga widziec zdarzenia instalacji i aktualizacji na
warunkach swoich regulaminow.

W samej aplikacji dane pozostaja lokalne. Tresc dziennika nie jest wysylana na
serwer projektu podczas zwyklego uzywania.

## Opcjonalne miejsca zapisu archiwum

Przy eksporcie zaszyfrowanego Archiwum miejsce zapisu wybierane jest lokalnie.

Jesli plik trafi do dostawcy dokumentow lub chmury, ten dostawca moze zobaczyc
metadane pliku, na przyklad nazwe, czas zapisu, rozmiar i logi dostepu do
konta.

Bez hasla do Archiwum zawartosc pliku pozostaje nieczytelna.

## Czego ten projekt nie obiecuje

- Nie ma twierdzenia, ze hostowana aplikacja nie wykonuje zadnych polaczen
  sieciowych.
- Nie ma twierdzenia, ze kanaly dystrybucji nie zbieraja zadnych danych.
- Nie ma odzyskiwania zapomnianego hasla dziennika ani hasla Archiwum.

## Granice wsparcia i zgloszen bezpieczenstwa

Wsparcie i triage bezpieczenstwa nie wymagaja przekazywania prywatnej tresci
dziennika.

- zasady wsparcia: `SUPPORT.md`,
- proces zglaszania podatnosci: `SECURITY.md`.
