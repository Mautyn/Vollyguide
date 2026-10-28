import type { SituationText } from '../types';

/** Polish topic titles, keyed by topic id. */
export const PL_TOPICS: Readonly<Record<string, string>> = {
  blocking: 'Blok',
  defense: 'Obrona',
  coverage: 'Asekuracja',
};

const READY_CAPTION =
  'Rozgrywający przeciwnika dostaje przyjęcie. Nasi blokujący czekają przy siatce, obrońcy w pozycjach wyjściowych.';

/** Polish situations, keyed by situation id. */
export const PL_SITUATIONS: Readonly<Record<string, SituationText>> = {
  // Blok
  'double-block-vs-outside': {
    title: 'Blok podwójny przeciw atakowi ze skrzydła',
    summary:
      'Przeciwnik atakuje ze swojej lewej strony. Nasz blokujący z prawej strony ustawia blok, a środkowy domyka go obok niego.',
    positioning: [
      'Blokujący z prawej strony (atakujący): około 1 m od prawej linii bocznej, na wysokości barku atakującego ręką uderzającą, tak żeby zamknąć linię.',
      'Środkowy: zaczyna na środku siatki i dochodzi do blokującego z prawej strony, kończąc ramię w ramię z nim.',
      'Zawodnik nieblokujący (przyjmujący z lewej strony pierwszej linii): odchodzi od siatki do linii ataku, 3 m od siatki, na ostry skos i kiwki.',
    ],
    execution: [
      'Czytaj wystawę: środkowy patrzy na rozgrywającego, potem na piłkę i rusza dopiero, gdy kierunek wystawy jest jasny.',
      'Skrzydłowy blokujący ustawia blok wcześnie; środkowy dochodzi krokiem skrzyżnym.',
      'Obaj skaczą razem, chwilę po atakującym, i przekładają ręce nad siatką w stronę środka boiska przeciwnika.',
    ],
    principles: [
      'Skrzydłowy ustawia blok, środkowy go domyka.',
      'Bez luki: wewnętrzne ręce obu blokujących są tak blisko, że piłka nie przejdzie między nimi.',
      'Przełóż ręce: dłonie nad siatką, skierowane w dół, na boisko przeciwnika.',
    ],
    captions: [
      'Rozgrywający przeciwnika dostaje przyjęcie. Nasi blokujący czekają przy siatce w pozycjach wyjściowych.',
      'Piłka idzie na skrzydło. Nasz blokujący z prawej strony ustawia blok na linii; środkowy dochodzi krokiem skrzyżnym.',
      'Wspólny skok: obaj blokujący przekładają ręce nad siatkę bez luki między sobą. Zawodnik nieblokujący zszedł do linii ataku.',
      'Blok punktowy: piłka spada prosto na stronę przeciwnika.',
    ],
  },
  'double-block-vs-right-side': {
    title: 'Blok podwójny przeciw atakowi z prawej strony',
    summary:
      'Odbicie lustrzane: przeciwnik atakuje ze swojej prawej strony (zwykle atakujący). Nasz blokujący z lewej strony ustawia blok, a środkowy go domyka.',
    positioning: [
      'Blokujący z lewej strony (przyjmujący): około 1 m od lewej linii bocznej, na wysokości barku atakującego ręką uderzającą.',
      'Środkowy: dochodzi ze środka do blokującego z lewej strony.',
      'Zawodnik nieblokujący (atakujący z prawej strony pierwszej linii): schodzi do linii ataku po prawej stronie, na skos i kiwki.',
    ],
    execution: [
      'Wystawa do tyłu leci krótko, więc środkowy musi wcześnie czytać ułożenie ciała rozgrywającego.',
      'Blokujący z lewej strony ustawia blok; środkowy domyka go krokiem skrzyżnym.',
      'Obaj skaczą razem i zamykają lukę między sobą.',
    ],
    principles: [
      'Ten sam schemat co przeciw skrzydłu, w odbiciu lustrzanym.',
      'Atakujący przeciwnika z prawej strony to często jego najsilniejszy zawodnik: szczelny, przełożony blok jest tu najważniejszy.',
      'Zawodnik nieblokujący po drugiej stronie zawsze schodzi do linii ataku.',
    ],
    captions: [
      'Rozgrywający przeciwnika dostaje przyjęcie. Nasi blokujący czekają przy siatce w pozycjach wyjściowych.',
      'Rozgrywający wystawia do tyłu, na prawą stronę. Nasz blokujący z lewej strony ustawia blok na linii; środkowy go domyka.',
      'Wspólny skok: nasz przyjmujący i środkowy blokują razem. Nasz atakujący zszedł do linii ataku na skosy i kiwki.',
      'Blok punktowy: piłka spada prosto na stronę przeciwnika.',
    ],
  },
  'triple-block-vs-high-ball': {
    title: 'Blok potrójny przeciw wysokiej piłce na skrzydło',
    summary:
      'Wysoka, wolna wystawa do dominującego przyjmującego daje wszystkim trzem zawodnikom pierwszej linii czas na blok.',
    positioning: [
      'Blokujący z prawej strony: ustawia blok na linii, jak w bloku podwójnym.',
      'Środkowy: domyka obok blokującego z prawej strony.',
      'Blokujący z dalszej strony (przyjmujący): biegnie wzdłuż siatki i dołącza od środka, zamykając skos.',
      'Druga linia: nie ma zawodnika nieblokującego, więc obrońca z lewej strony podchodzi do linii ataku na kiwki.',
    ],
    execution: [
      'Wchodź do bloku potrójnego tylko wtedy, gdy wystawa jest na tyle wysoka i wolna, że dalszy blokujący zdąży.',
      'Dalszy blokujący dochodzi ostatni i domyka do środkowego, a nie odwrotnie.',
      'Wszyscy trzej skaczą razem.',
    ],
    principles: [
      'Opłaca się przeciw dominującemu atakującemu przy wysokiej, wolnej wystawie.',
      'Koszt: brak zawodnika nieblokującego na kiwki i więcej wolnego miejsca dla obrońców drugiej linii.',
      'Spóźniony trzeci blokujący, który zostawia lukę, jest gorszy niż dobry blok podwójny.',
    ],
    captions: [
      'Przyjęcie jest daleko od siatki, więc rozgrywający może tylko wystawić wysoką piłkę na skrzydło.',
      'Wysoka wystawa daje czas: blokujący z prawej strony ustawia blok, środkowy go domyka, a blokujący z dalszej strony biegnie wzdłuż siatki.',
      'Blok potrójny: dalszy blokujący dochodzi ostatni i zamyka środek. Obrońca z lewej strony podchodzi, bo nikt inny nie asekuruje kiwek.',
      'Trzech blokujących zamyka wszystkie kierunki ataku: piłka wraca na stronę przeciwnika.',
    ],
  },
  'triple-block-vs-pipe': {
    title: 'Blok potrójny przeciw atakowi z drugiej linii (pipe)',
    summary:
      'Przeciwnik atakuje ze środka drugiej linii. Nasz środkowy ustawia blok, a obaj skrzydłowi blokujący dochodzą do niego.',
    positioning: [
      'Środkowy: zostaje naprzeciw atakującego i ustawia blok.',
      'Obaj skrzydłowi blokujący: dochodzą z boków i dołączają do środkowego.',
      'Druga linia: rozstawiona wokół bloku; najczęściej przyjdzie piłka odbita od bloku.',
    ],
    execution: [
      'Obserwuj rozbieg atakującego z drugiej linii, nie tylko rozgrywającego: pipe jest wystawiany tam, gdzie on wyskoczy.',
      'Atakujący uderza zza linii ataku, więc skacz do bloku później niż przeciw atakowi z pierwszej linii.',
      'Nawet bez bloku punktowego czubki palców zwalniają piłkę dla obrony.',
    ],
    principles: [
      'Środkowy ustawia, skrzydłowi domykają.',
      'Przeciw atakom z drugiej linii skacz później.',
      'Dotknięcie to sukces: zamienia mocny atak w piłkę do obrony.',
    ],
    captions: [
      'Przyjmujący z drugiej linii zaczyna rozbieg ze środka boiska. Nasi blokujący zostają w pozycjach wyjściowych.',
      'Pipe jest wystawiony za linię ataku. Nasz środkowy zostaje naprzeciw atakującego; obaj skrzydłowi blokujący dochodzą.',
      'Blok potrójny na środku: atakujący uderza z 3,5 m, więc blok może poczekać chwilę dłużej ze skokiem.',
      'Miękki blok: piłka odbija się wysoko od rąk blokujących i nasze libero ma czas ją obronić.',
    ],
  },

  // Obrona
  'attack-from-left-side': {
    title: 'Atak z lewej strony przeciwnika',
    summary:
      'Przyjmujący przeciwnika atakuje ze swojej lewej strony, czyli z naszej prawej. Nasz atakujący i środkowy stawiają blok podwójny, a reszta zajmuje miejsca w obronie obwodowej.',
    positioning: [
      'Blok: atakujący ustawia blok na linii, środkowy domyka go obok.',
      'Zawodnik nieblokujący (przyjmujący z lewej strony pierwszej linii): schodzi do linii ataku, około 3 m od siatki przy lewej linii bocznej, na ostry skos i kiwki.',
      'Obrońca na linii (prawa strona drugiej linii): około 6,5 m od siatki, tuż przy prawej linii bocznej, na ataki po linii i kiwki za blok.',
      'Obrońca w szóstej strefie: głęboko, około 8,5 m od siatki, bliżej strony skosu, na głębokie piłki i piłki odbite od bloku.',
      'Obrońca na skosie (lewa strona drugiej linii): około 6,5 m od siatki przy lewej linii bocznej – główna obrona mocnych ataków po skosie.',
    ],
    execution: [
      'Wszyscy ruszają, gdy tylko kierunek wystawy jest jasny, i w chwili uderzenia stoją nisko, w równowadze.',
      'Obrońcy patrzą na rękę atakującego, nie na piłkę w powietrzu.',
      'Kto broni, kieruje piłkę wysoko na środek naszego boiska, około 3 m od siatki.',
    ],
    principles: [
      'Stań tam, gdzie atakujący wciąż może uderzyć obok bloku: ostry skos, linia, nad blokiem lub od bloku.',
      'Widź rękę atakującego między blokującymi albo obok nich.',
      'W chwili uderzenia stój: obrońca w ruchu nie obroni.',
    ],
    whoIsAttacking: [
      'Przyjmujący (najczęściej): wysoka piłka na lewe skrzydło daje czas na blok podwójny.',
      'Atakujący po zmianie stron: rzadziej; traktuj go jak przyjmującego, ale spodziewaj się mocniejszego ataku po linii.',
      'Atak z drugiej linii z lewej strony (D-ball): zaczyna się za linią ataku, więc blok skacze później, a obrońcy mogą stać krok głębiej.',
    ],
    captions: [
      READY_CAPTION,
      'Wystawa na skrzydło. Blok przesuwa się w prawo, zawodnik nieblokujący odchodzi od siatki, a druga linia przechodzi do obrony obwodowej.',
      'Uderzenie: blok podwójny po prawej, zawodnik nieblokujący na linii ataku, obrońcy na linii i na skosie 6,5 m od siatki, obrońca w szóstej strefie głęboko.',
      'Atakujący uderza mocno po skosie, obok bloku: obrońca na skosie broni.',
    ],
  },
  'attack-from-right-side': {
    title: 'Atak z prawej strony przeciwnika',
    summary:
      'Odbicie lustrzane: przeciwnik atakuje ze swojej prawej strony, zwykle atakującym. Nasz przyjmujący i środkowy blokują; reszta zajmuje lustrzane miejsca w obronie obwodowej.',
    positioning: [
      'Blok: przyjmujący ustawia blok na linii, środkowy go domyka.',
      'Zawodnik nieblokujący (atakujący z prawej strony pierwszej linii): schodzi do linii ataku, około 3 m od siatki przy prawej linii bocznej.',
      'Obrońca na linii (lewa strona drugiej linii): około 6,5 m od siatki, tuż przy lewej linii bocznej.',
      'Obrońca w szóstej strefie: głęboko, około 8,5 m od siatki, bliżej strony skosu.',
      'Obrońca na skosie (rozgrywający, prawa strona drugiej linii): około 6,5 m od siatki przy prawej linii bocznej.',
    ],
    execution: [
      'Wystawa do tyłu leci krótko: blok i obrońcy muszą wcześnie czytać rozgrywającego.',
      'W chwili uderzenia obrońcy stoją nisko i patrzą na rękę atakującego.',
      'Jeśli broni rozgrywający, drugą piłkę wystawia ktoś inny (zwykle atakujący).',
    ],
    principles: [
      'Ta sama obrona obwodowa co przeciw lewej stronie, w odbiciu lustrzanym.',
      'Stań tam, gdzie atakujący wciąż może uderzyć obok bloku, i widź jego rękę.',
      'W chwili uderzenia stój.',
    ],
    whoIsAttacking: [
      'Atakujący (najczęściej): często uderza najmocniej, więc obrońca na skosie stoi krok głębiej, a obrońca na linii zostaje na linii.',
      'Przyjmujący po wystawie do tyłu: ten sam blok, ale spodziewaj się więcej kiwek i ostrych skosów.',
      'Środkowy z jednonóża za rozgrywającym: szybko i w ruchu, więc często dochodzi tylko jeden blokujący; zawodnik nieblokujący musi zejść do środka na skos.',
    ],
    captions: [
      READY_CAPTION,
      'Wystawa do tyłu, na prawą stronę. Blok przesuwa się w lewo, nasz atakujący odchodzi od siatki, a druga linia ustawia się lustrzanie.',
      'Uderzenie: blok podwójny po lewej, nasz atakujący na linii ataku, obrońcy na linii i na skosie 6,5 m od siatki, obrońca w szóstej strefie głęboko.',
      'Mocny atak po skosie obok bloku: broni nasz rozgrywający jako obrońca na skosie.',
    ],
  },
  'attack-from-middle': {
    title: 'Atak ze środka',
    summary:
      'Szybki atak ze środka nie daje czasu na blok podwójny: nasz środkowy blokuje sam, obaj skrzydłowi odchodzą od siatki, a druga linia rozstawia się wokół nich.',
    positioning: [
      'Blok: środkowy blokuje sam, naprzeciw ręki atakującego.',
      'Zawodnicy nieblokujący (obaj skrzydłowi przy siatce): schodzą do linii ataku, na lewo i na prawo od bloku, na kiwki i krótkie skosy.',
      'Skrzydła (lewa i prawa strona drugiej linii): około 6 m od siatki, przy liniach bocznych.',
      'Obrońca w szóstej strefie: głęboko na środku, za blokiem, na piłki odbite od bloku i nad nim.',
    ],
    execution: [
      'Blok z czytania: środkowy obserwuje ciało rozgrywającego i przyjęcie, a skacze dopiero, gdy wystawa jest jasna.',
      'Przy wolniejszej piłce na środek (pipe) skrzydłowi blokujący mają czas dojść i zbudować blok podwójny lub potrójny (zobacz: Blok).',
      'W chwili uderzenia obrońcy stoją; przy krótkiej piłce jest mniej niż sekunda, więc zaczynaj z dobrej pozycji.',
    ],
    principles: [
      'Najpierw czytaj rozgrywającego, potem skacz.',
      'Zawodnicy nieblokujący pilnują krótkich piłek, druga linia – boków i głębokiego środka.',
      'Dotknięcie bloku to sukces: zamienia mocny atak w piłkę do obrony.',
    ],
    whoIsAttacking: [
      'Środkowy z krótkiej piłki: nie ma czasu na blok podwójny; środkowy blokuje sam, a skrzydłowi schodzą na kiwki.',
      'Pipe przyjmującego z drugiej linii: wolniejszy, więc skrzydłowi blokujący zdążą zbudować blok podwójny lub potrójny.',
      'Kiwka rozgrywającego: środkowy i zawodnik nieblokujący po stronie rozgrywającego pilnują, czy rozgrywający nie zaatakuje drugiej piłki.',
    ],
    captions: [
      'Środkowy przeciwnika wcześnie rozbiega się do krótkiej piłki. Nasz środkowy czyta rozgrywającego, nie atakującego.',
      'Krótka wystawa. Nasz środkowy skacze z atakującym; skrzydłowi blokujący schodzą do środka, widzą, że nie zdążą, i odchodzą od siatki.',
      'Uderzenie: pojedynczy blok na środku, obaj zawodnicy nieblokujący na linii ataku, skrzydła 6 m od siatki, a obrońca w szóstej strefie głęboko.',
      'Piłka dotyka bloku i zwalnia: obrońca w szóstej strefie broni ją głęboko na środku.',
    ],
  },
  'tip-over-the-block': {
    title: 'Kiwka za blok',
    summary:
      'Atakujący widzi szczelny blok i kiwa piłkę za niego. Obrońca na linii wychodzi do przodu i woła piłkę; zawodnik nieblokujący go asekuruje.',
    positioning: [
      'Przed uderzeniem wszyscy są w obronie obwodowej, tak samo jak przy zwykłym ataku z lewej strony przeciwnika.',
      'Kiwka za blok spada 2–4 m od siatki, za blokującymi.',
    ],
    execution: [
      'Obrońca na linii rozpoznaje kiwkę po zwalniającej ręce atakującego, sprintem wychodzi do przodu i woła „Moja!”.',
      'Zawodnik nieblokujący przesuwa się w stronę środka jako asekuracja, gdyby kiwka poszła dalej do środka.',
      'Obrońca w szóstej strefie podchodzi, żeby zająć miejsce, które zostawił obrońca na linii.',
    ],
    principles: [
      'Czytaj rękę: zwalniający zamach oznacza kiwkę.',
      'Kiwki za blokiem należą do obrońcy na linii – woła je wcześnie.',
      'Wszyscy pozostali robią krok w stronę piłki jako asekuracja.',
    ],
    captions: [
      READY_CAPTION,
      'Wystawa na skrzydło. Blok przesuwa się w prawo, zawodnik nieblokujący odchodzi od siatki, a druga linia przechodzi do obrony obwodowej.',
      'Uderzenie: nasz blok podwójny jest szczelny, więc atakujący zmienia zagranie i kiwa piłkę za blok.',
      'Piłka spada tuż za blokiem. Obrońca na linii wybiega do przodu, woła „Moja!” i broni; zawodnik nieblokujący go asekuruje.',
    ],
  },

  // Asekuracja
  'outside-hitter-attacks-zone-4': {
    title: 'Przyjmujący atakuje ze strefy 4',
    summary:
      'Standardowa asekuracja 3-2: trzech zawodników tworzy bliskie półkole wokół atakującego, dwóch wypełnia luki za nimi.',
    positioning: [
      'Bliski krąg (rozgrywający, środkowy, lewa strona drugiej linii): około 1–2 m od atakującego, nisko, w półkolu wokół niego.',
      'Rozgrywający asekuruje za atakującym i na prawo od niego; środkowy ląduje po pozorowaniu i odwraca się do atakującego; zawodnik z lewej strony drugiej linii podchodzi tuż za niego.',
      'Dalszy krąg (środek i prawa strona drugiej linii): około 4–5 m od siatki, w lukach między zawodnikami bliskiego kręgu.',
    ],
    execution: [
      'Ruszaj, gdy tylko wystawa jest w powietrzu, a nie gdy atakujący skacze.',
      'Dobiegnij i zatrzymaj się przed uderzeniem, nisko i w równowadze.',
      'Patrz na ręce blokujących przeciwnika, nie na atakującego: piłka wraca od bloku.',
    ],
    principles: [
      'Nisko i stój przed uderzeniem.',
      'Twarzą do bloku, nie do atakującego.',
      'Bliski krąg ciasno, dalszy krąg wypełnia luki.',
      'Rozgrywający zawsze asekuruje po wystawie.',
    ],
    captions: [
      'Przyjęcie idzie do rozgrywającego. Nasz przyjmujący odchodzi na rozbieg; środkowy pozoruje krótką piłkę.',
      'Rozgrywający wystawia wysoko na skrzydło. Gdy tylko piłka opuszcza jego ręce, wszyscy ruszają w stronę atakującego.',
      'Uderzenie. Bliski krąg trzech zawodników jest nisko i blisko atakującego, z oczami na bloku; dalszy krąg dwóch zawodników wypełnia luki głębiej.',
      'Blok odbija piłkę prosto z powrotem. Spada w półkole asekuracji, gdzie rozgrywający już nisko czeka, żeby ją obronić.',
    ],
  },
  'opposite-attacks-zone-2': {
    title: 'Atakujący atakuje ze strefy 2',
    summary:
      'Odbicie lustrzane po prawej stronie. Rozgrywający, który wyszedł z drugiej linii do wystawy, asekuruje po lewej stronie atakującego.',
    positioning: [
      'Bliski krąg: rozgrywający za atakującym i na lewo od niego, środkowy od środka po pozorowaniu i libero tuż za atakującym.',
      'Tutaj rozgrywający to zawodnik z prawej strony drugiej linii, który wyszedł do wystawy, więc miejsce tuż za atakującym zajmuje libero (środek drugiej linii).',
      'Dalszy krąg: obaj przyjmujący, około 4–5 m od siatki, w lukach.',
    ],
    execution: [
      'Rozgrywający zaraz po wystawie odwraca się do atakującego i robi dwa kroki w jego stronę.',
      'Libero podchodzi ze środka drugiej linii, gdy tylko wystawa idzie w prawo.',
      'Wszyscy zatrzymują się nisko przed uderzeniem i patrzą na blok.',
    ],
    principles: [
      'Ten sam kształt co po lewej stronie, w odbiciu lustrzanym.',
      'Rozgrywający zawsze asekuruje po wystawie.',
      'Wołaj „Asekuracja!”, żeby atakujący wiedział, że może zagrać w blok.',
    ],
    captions: [
      'Rozgrywający wychodzi z drugiej linii do wystawy. Atakujący odchodzi na rozbieg po prawej; środkowy pozoruje krótką piłkę.',
      'Rozgrywający wystawia na prawą stronę. Wszyscy ruszają w stronę atakującego.',
      'Uderzenie. Rozgrywający, środkowy i libero tworzą bliski krąg; przyjmujący wypełniają luki za nimi.',
      'Piłka wraca od bloku w półkole asekuracji, między rozgrywającego i libero.',
    ],
  },
  'middle-quick-zone-3': {
    title: 'Środkowy atakuje krótką piłkę w strefie 3',
    summary:
      'Krótka wystawa prawie nie daje czasu, więc asekuracja jest ciaśniejsza i tworzą ją zawodnicy, którzy już są blisko siatki.',
    positioning: [
      'Bliski krąg: rozgrywający, tuż obok atakującego po krótkiej wystawie, oraz obaj skrzydłowi, którzy zaraz po pozorowanym rozbiegu odwracają się do środka.',
      'Dalszy krąg: libero i zawodnik z lewej strony drugiej linii, około 4–5 m od siatki.',
    ],
    execution: [
      'Między wystawą a uderzeniem jest mniej niż sekunda: pozorujący kończą rozbieg i od razu się odwracają.',
      'Półkole jest ciaśniejsze niż przy ataku ze skrzydła, bo blok jest tuż przed atakującym.',
    ],
    principles: [
      'Pozorujący są asekurującymi: skończ pozorowanie, odwróć się i asekuruj.',
      'Ciasne półkole, szybkie nogi, niska pozycja.',
      'Rozgrywający jest już blisko: jeden krok i nisko.',
    ],
    captions: [
      'Dobre przyjęcie. Środkowy już rozbiega się do krótkiej piłki; obaj skrzydłowi pozorują atak.',
      'Krótka wystawa prosto w rękę środkowego. Pozorujący odciągnęli skrzydłowych blokujących przeciwnika.',
      'Uderzenie. Rozgrywający i obaj pozorujący tworzą ciasne półkole; libero i zawodnik z lewej strony drugiej linii zostają głębiej.',
      'Środkowy przeciwnika dotyka piłki w bloku; piłka spada w półkole asekuracji.',
    ],
  },
  'pipe-from-zone-6': {
    title: 'Atak z drugiej linii (pipe) ze strefy 6',
    summary:
      'Przyjmujący z drugiej linii atakuje zza linii ataku. Pozorujący z pierwszej linii odwracają się i asekurują blisko; pozostali asekurują głęboko.',
    positioning: [
      'Pozorujący z pierwszej linii (przyjmujący i środkowy): lądują po pozorowaniu i odchodzą w bok z toru ataku, asekurując blisko, obok atakującego.',
      'Rozgrywający: za atakującym i na prawo od niego, na piłkę odbitą głęboko od bloku.',
      'Atakujący i libero: dalsza warstwa, wypełniają prawą stronę i głęboką lewą.',
    ],
    execution: [
      'Pipe uderza się zza linii ataku, więc piłka odbita od bloku leci dalej: asekuruj trochę głębiej niż przy ataku z pierwszej linii.',
      'Pozorujący muszą zwolnić tor przed atakującym; nikt nie może stać między atakującym a siatką.',
    ],
    principles: [
      'Najpierw zwolnij tor, potem asekuruj.',
      'Bliska asekuracja obok atakującego, głęboka za nim.',
      'Rozgrywający zawsze asekuruje po wystawie.',
    ],
    captions: [
      'Rozgrywający wychodzi do wystawy. Wszyscy trzej zawodnicy pierwszej linii pozorują atak; przyjmujący z drugiej linii zaczyna rozbieg do pipe.',
      'Rozgrywający wystawia za linię ataku. Pozorujący lądują i od razu schodzą z toru ataku.',
      'Uderzenie 2,8 m od siatki. Pozorujący z pierwszej linii asekurują blisko obok atakującego, rozgrywający za nim, a reszta głęboko.',
      'Blok potrójny odbija piłkę głęboko, za atakującego, gdzie czeka rozgrywający.',
    ],
  },
};
