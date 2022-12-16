# Ghetto Voting

Aplikacija za glasovanje v costume contest kluba Amulet.

> Ta aplikacija je bila spisana v treh večerih, in potem še nadgrajena v treh večerih. 
> Zaradi tega je v kodi mogoče najti vsak ne-ne pod soncem. Kvaliteta kode ne predstavlja
> programerskih in varnostnih standardov ter praks kateregakoli preteklega, trenutnega,
> ali prihodnjega delodajalca.

"Ta koda je brez dvoma najslabša koda, ki sem jo spisal"  
" — Ampak sem jo spisal."

&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; :> Pirati s karibov al nekej

## Licenca

Slike: ne pipaj

Koda: nared kar hočeš, stvar je itak prevečik podn za resno uporabo lol.

## Postavitev

1. imaš tam `.nvmrc`, ki vsebuje node version. `v14.15.0` za Windows plebe in tiste, ki brez razloga hejtajo nvmrc
2. `npm i`
3. sej maš google če kj ne dela

## Zagon

### Za razvoj

App:

```sh
npm run serve
```

Api:

```sh
npm run run-backend
```

### Za deploy

Oboje je na node 14 (obstaja nvmrc). Ne pozabit `npm i` narest.

#### App

```sh
npm run build
```

Stvari se pojavijo v `/dist-app`. To gre na nginx/apache/whatever se uporablja za web server. Pomembno je, da ima voting app svojo poddomeno, in da **ni kje drugje v kakšnem subdirektoriju** ker vue ni tko skonfiguriran 

#### Api

Api rabi poslušat na isti domeni/poddomeni, port `6969` (hardkodiran, yes). Api nima narjen proper compilanja/whatevs, samo greš in poženeš isto kot za development:

```sh
npm run run-backend
```

### Za docker local deploy

Namesti si Docker Desktop. Aplikacijo lokalno poženež z naslednjimi ukazi:

Base build:

```sh
docker compose -f .\docker-compose.build-base.yml build
```

Nato buildaš celoten app:

```sh
docker compose build
```

Celoten stack poženeš:

```sh
docker compose up -d
```

App ugasneš z:

```sh
docker compose down -v
```

Loge gledaš z:

```sh
docker compose logs -ft server
docker compose logs -ft client
```
