import csv, random, math
random.seed(42)

# ---------- Structured source data ----------
capitals = {"France":"Paris","Germany":"Berlin","Italy":"Rome","Spain":"Madrid","Portugal":"Lisbon","Japan":"Tokyo","China":"Beijing","India":"New Delhi","Pakistan":"Islamabad","Bangladesh":"Dhaka","Nepal":"Kathmandu","Sri Lanka":"Colombo","Thailand":"Bangkok","Vietnam":"Hanoi","Indonesia":"Jakarta","Malaysia":"Kuala Lumpur","Philippines":"Manila","South Korea":"Seoul","Russia":"Moscow","Ukraine":"Kyiv","Poland":"Warsaw","Norway":"Oslo","Sweden":"Stockholm","Finland":"Helsinki","Denmark":"Copenhagen","Netherlands":"Amsterdam","Belgium":"Brussels","Austria":"Vienna","Switzerland":"Bern","Greece":"Athens","Turkey":"Ankara","Egypt":"Cairo","Kenya":"Nairobi","Nigeria":"Abuja","Ghana":"Accra","Ethiopia":"Addis Ababa","South Africa":"Pretoria","Morocco":"Rabat","Algeria":"Algiers","Canada":"Ottawa","United States":"Washington, D.C.","Mexico":"Mexico City","Brazil":"Brasilia","Argentina":"Buenos Aires","Chile":"Santiago","Peru":"Lima","Colombia":"Bogota","Australia":"Canberra","New Zealand":"Wellington","Iran":"Tehran","Iraq":"Baghdad","Saudi Arabia":"Riyadh","Israel":"Jerusalem","Afghanistan":"Kabul","Cuba":"Havana","Ireland":"Dublin","Hungary":"Budapest","Czech Republic":"Prague","Romania":"Bucharest","Bulgaria":"Sofia","Croatia":"Zagreb","Serbia":"Belgrade","Kazakhstan":"Astana","Mongolia":"Ulaanbaatar","Myanmar":"Naypyidaw","Cambodia":"Phnom Penh","Laos":"Vientiane","Tanzania":"Dodoma","Uganda":"Kampala","Senegal":"Dakar","Venezuela":"Caracas","Ecuador":"Quito","Bolivia":"Sucre","Uruguay":"Montevideo","Iceland":"Reykjavik"}

elements = {"Hydrogen":(1,"H"),"Helium":(2,"He"),"Lithium":(3,"Li"),"Beryllium":(4,"Be"),"Boron":(5,"B"),"Carbon":(6,"C"),"Nitrogen":(7,"N"),"Oxygen":(8,"O"),"Fluorine":(9,"F"),"Neon":(10,"Ne"),"Sodium":(11,"Na"),"Magnesium":(12,"Mg"),"Aluminium":(13,"Al"),"Silicon":(14,"Si"),"Phosphorus":(15,"P"),"Sulfur":(16,"S"),"Chlorine":(17,"Cl"),"Argon":(18,"Ar"),"Potassium":(19,"K"),"Calcium":(20,"Ca"),"Titanium":(22,"Ti"),"Chromium":(24,"Cr"),"Manganese":(25,"Mn"),"Iron":(26,"Fe"),"Cobalt":(27,"Co"),"Nickel":(28,"Ni"),"Copper":(29,"Cu"),"Zinc":(30,"Zn"),"Arsenic":(33,"As"),"Bromine":(35,"Br"),"Silver":(47,"Ag"),"Tin":(50,"Sn"),"Iodine":(53,"I"),"Gold":(79,"Au"),"Mercury":(80,"Hg"),"Lead":(82,"Pb"),"Uranium":(92,"U"),"Platinum":(78,"Pt"),"Tungsten":(74,"W"),"Neodymium":(60,"Nd"),"Radon":(86,"Rn"),"Plutonium":(94,"Pu")}

authors = {"Hamlet":"William Shakespeare","Romeo and Juliet":"William Shakespeare","Macbeth":"William Shakespeare","Pride and Prejudice":"Jane Austen","Emma":"Jane Austen","Great Expectations":"Charles Dickens","Oliver Twist":"Charles Dickens","1984":"George Orwell","Animal Farm":"George Orwell","The Great Gatsby":"F. Scott Fitzgerald","Moby-Dick":"Herman Melville","War and Peace":"Leo Tolstoy","Anna Karenina":"Leo Tolstoy","Crime and Punishment":"Fyodor Dostoevsky","The Odyssey":"Homer","The Iliad":"Homer","Don Quixote":"Miguel de Cervantes","Gitanjali":"Rabindranath Tagore","Godan":"Munshi Premchand","Frankenstein":"Mary Shelley","Dracula":"Bram Stoker","Jane Eyre":"Charlotte Bronte","Wuthering Heights":"Emily Bronte","Ulysses":"James Joyce","The Hobbit":"J. R. R. Tolkien","Brave New World":"Aldous Huxley","The Catcher in the Rye":"J. D. Salinger","To Kill a Mockingbird":"Harper Lee","One Hundred Years of Solitude":"Gabriel Garcia Marquez","The Old Man and the Sea":"Ernest Hemingway","Les Miserables":"Victor Hugo","The Divine Comedy":"Dante Alighieri","Midnight's Children":"Salman Rushdie","The God of Small Things":"Arundhati Roy","Madame Bovary":"Gustave Flaubert","The Trial":"Franz Kafka","Lolita":"Vladimir Nabokov","The Alchemist":"Paulo Coelho","Things Fall Apart":"Chinua Achebe"}

events = {"The French Revolution began":1789,"World War I began":1914,"World War II ended":1945,"India gained independence":1947,"The Berlin Wall fell":1989,"Humans first landed on the Moon":1969,"The Titanic sank":1912,"Columbus reached the Americas":1492,"The Magna Carta was sealed":1215,"The Soviet Union dissolved":1991,"The first iPhone was released":2007,"The Wright brothers' first powered flight took place":1903,"The Indian Constitution came into effect":1950,"The Battle of Plassey was fought":1757,"The Russian Revolution occurred":1917,"The printing press was introduced in Europe by Gutenberg around":1440,"The American Declaration of Independence was signed":1776,"The Chernobyl disaster occurred":1986,"The Euro was introduced as physical currency":2002,"The Battle of Waterloo was fought":1815,"The first Sputnik satellite was launched":1957,"Apollo 11 launched":1969,"The Bhopal gas tragedy occurred":1984,"The Indian Space Research Organisation was founded":1969,"The Hubble Space Telescope was launched":1990,"The World Wide Web was proposed by Tim Berners-Lee":1989,"The Human Genome Project was declared complete":2003,"The Treaty of Versailles was signed":1919,"The Panipat first battle took place":1526,"Chandrayaan-3 landed near the lunar south pole":2023}

inventors = {"the telephone":"Alexander Graham Bell","the light bulb (commercial incandescent)":"Thomas Edison","the theory of general relativity":"Albert Einstein","penicillin":"Alexander Fleming","the polio vaccine (inactivated)":"Jonas Salk","the periodic table":"Dmitri Mendeleev","the law of universal gravitation":"Isaac Newton","the World Wide Web":"Tim Berners-Lee","the radio (early wireless telegraphy)":"Guglielmo Marconi","the theory of evolution by natural selection":"Charles Darwin","the Raman effect":"C. V. Raman","radioactivity":"Henri Becquerel","the structure of DNA (double helix model)":"James Watson and Francis Crick","the first smallpox vaccine":"Edward Jenner","the steam engine improvements (separate condenser)":"James Watt","the dynamite":"Alfred Nobel","the laws of planetary motion":"Johannes Kepler","the Bose-Einstein statistics (Bose)":"Satyendra Nath Bose","the cell theory (plant cells, co-founder)":"Matthias Schleiden","the Rh blood group (co-discoverer)":"Karl Landsteiner","the ABO blood groups":"Karl Landsteiner","the electron":"J. J. Thomson","the neutron":"James Chadwick","the electromagnetic induction":"Michael Faraday"}
inventor_pool = list(set(inventors.values()))

planets = ["Mercury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune"]
ordinal = ["first","second","third","fourth","fifth","sixth","seventh","eighth"]

# (name, value, unit-phrase)
misc = [
 ("The boiling point of water at sea level is","100 degrees Celsius","100"),
 ("The freezing point of water at standard pressure is","0 degrees Celsius","0"),
 ("The speed of light in vacuum is approximately","299,792 kilometres per second","299792"),
 ("A human adult typically has","206 bones","206"),
 ("The human heart has","four chambers","4"),
 ("Humans normally have","23 pairs of chromosomes","23"),
 ("A year on Earth lasts about","365.25 days","365"),
 ("The chemical formula of water is","H2O","H2O"),
 ("The chemical formula of table salt is","NaCl","NaCl"),
 ("The chemical formula of carbon dioxide is","CO2","CO2"),
 ("The chemical formula of methane is","CH4","CH4"),
 ("The chemical formula of glucose is","C6H12O6","C6H12O6"),
 ("The chemical formula of ammonia is","NH3","NH3"),
 ("The powerhouse of the cell is the","mitochondrion","mito"),
 ("Photosynthesis in plants mainly takes place in the","chloroplasts","chloro"),
 ("The largest planet in the Solar System is","Jupiter","Jupiter"),
 ("The smallest planet in the Solar System is","Mercury","Mercury"),
 ("The hottest planet in the Solar System is","Venus","Venus"),
 ("The longest river in India (within the country, main stem) is the","Ganga","Ganga"),
 ("The highest mountain above sea level is","Mount Everest","Everest"),
 ("The largest ocean on Earth is the","Pacific Ocean","Pacific"),
 ("The largest hot desert in the world is the","Sahara","Sahara"),
 ("The currency of Japan is the","yen","yen"),
 ("The currency of India is the","rupee","rupee"),
 ("The currency of the United Kingdom is the","pound sterling","pound"),
 ("The most abundant gas in Earth's atmosphere is","nitrogen","nitrogen"),
 ("The protein that carries oxygen in red blood cells is","haemoglobin","hb"),
 ("The hormone that regulates blood glucose by lowering it is","insulin","insulin"),
 ("The organ that produces bile is the","liver","liver"),
 ("The largest organ of the human body is the","skin","skin"),
 ("The unit of electrical resistance is the","ohm","ohm"),
 ("The SI unit of force is the","newton","newton"),
 ("The SI unit of frequency is the","hertz","hertz"),
 ("The base pairing partner of adenine in DNA is","thymine","thymine"),
 ("The enzyme that unwinds DNA during replication is","helicase","helicase"),
 ("The first 'Nobel Prize in Physics' went to","Wilhelm Rontgen (1901)","Rontgen"),
 ("The capital of the Indian state of Maharashtra is","Mumbai","Mumbai"),
 ("The capital of the Indian state of Karnataka is","Bengaluru","Bengaluru"),
 ("The capital of the Indian state of Tamil Nadu is","Chennai","Chennai"),
 ("The capital of the Indian state of West Bengal is","Kolkata","Kolkata"),
 ("The capital of the Indian state of Rajasthan is","Jaipur","Jaipur"),
 ("The capital of the Indian state of Gujarat is","Gandhinagar","Gandhinagar"),
 ("The capital of the Indian state of Kerala is","Thiruvananthapuram","TVM"),
 ("The capital of the Indian state of Uttar Pradesh is","Lucknow","Lucknow"),
 ("The capital of the Indian state of Telangana is","Hyderabad","Hyderabad"),
 ("The capital of the Indian state of Punjab is","Chandigarh","Chandigarh"),
 ("The capital of the Indian state of Bihar is","Patna","Patna"),
 ("The capital of the Indian state of Odisha is","Bhubaneswar","Bhubaneswar"),
 ("The capital of the Indian state of Assam is","Dispur","Dispur"),
 ("The capital of the Indian state of Madhya Pradesh is","Bhopal","Bhopal"),
]
misc_wrong = ["Saturn","Mars","Neptune","Atlantic Ocean","Gobi","dollar","euro","oxygen","carbon dioxide","kidney","heart","joule","watt","pascal","cytosine","guanine","ligase","polymerase","nucleus","ribosome","K2","Kanchenjunga","Brahmaputra","Yamuna","Delhi","Pune","Mysuru","Madurai","Surat","Kochi","Kanpur","Amritsar","Hyderabad","Guwahati","Indore","H2O2","NaOH","CO","C2H6","N2H4","myoglobin","glucagon","pancreas","spleen","1905","Marie Curie (1903)"]

def wrong_for(correct):
    pool = [w for w in misc_wrong if w.lower() not in correct.lower() and correct.lower() not in w.lower()]
    return random.choice(pool)

verified_pool, contradicted_pool = [], []
facts = []  # (true_claim, false_claim, category, evidence, source)

for c, cap in capitals.items():
    other = random.choice([v for k, v in capitals.items() if k != c])
    facts.append((f"The capital of {c} is {cap}.", f"The capital of {c} is {other}.", "geography", f"Capital of {c} = {cap}", "CIA World Factbook / UN"))
    facts.append((f"{cap} is the capital city of {c}.", f"{other} is the capital city of {c}.", "geography", f"Capital of {c} = {cap}", "CIA World Factbook / UN"))

for e, (n, s) in elements.items():
    wn = n + random.choice([-3, -2, -1, 1, 2, 5, 7])
    ws = random.choice([v[1] for k, v in elements.items() if k != e])
    facts.append((f"The atomic number of {e} is {n}.", f"The atomic number of {e} is {wn}.", "chemistry", f"{e}: Z={n}", "IUPAC Periodic Table"))
    facts.append((f"The chemical symbol for {e} is {s}.", f"The chemical symbol for {e} is {ws}.", "chemistry", f"{e}: symbol {s}", "IUPAC Periodic Table"))
    facts.append((f"{e} has {n} protons in a neutral atom's nucleus.", f"{e} has {wn} protons in a neutral atom's nucleus.", "chemistry", f"{e}: Z={n}", "IUPAC Periodic Table"))

for b, a in authors.items():
    wa = random.choice([v for v in authors.values() if v != a])
    facts.append((f"{b} was written by {a}.", f"{b} was written by {wa}.", "literature", f"{b} -> {a}", "Library of Congress catalogue"))
    facts.append((f"{a} is the author of {b}.", f"{wa} is the author of {b}.", "literature", f"{b} -> {a}", "Library of Congress catalogue"))

for ev, y in events.items():
    wy = y + random.choice([-12, -7, -5, -3, 3, 4, 6, 9, 11])
    facts.append((f"{ev} in {y}.", f"{ev} in {wy}.", "history", f"{ev}: {y}", "Encyclopaedia Britannica"))

for k, p in inventors.items():
    wp = random.choice([v for v in inventor_pool if v != p])
    facts.append((f"{k.capitalize()} is credited to {p}.", f"{k.capitalize()} is credited to {wp}.", "science history", f"{k} -> {p}", "Encyclopaedia Britannica"))

for i, p in enumerate(planets):
    wi = random.choice([o for o in range(8) if o != i])
    facts.append((f"{p} is the {ordinal[i]} planet from the Sun.", f"{p} is the {ordinal[wi]} planet from the Sun.", "astronomy", f"{p}: position {i+1}", "NASA"))

for stem, val, key in misc:
    w = wrong_for(val)
    facts.append((f"{stem} {val}.", f"{stem} {w}.", "general knowledge", f"{stem} {val}", "Standard reference texts"))

# ---- Computed facts (correct by construction) ----
def is_prime(n):
    if n < 2: return False
    return all(n % d for d in range(2, int(n**0.5) + 1))

computed = []
for _ in range(1500):
    a, b = random.randint(12, 999), random.randint(12, 999)
    r = a + b
    computed.append((f"{a} plus {b} equals {r}.", f"{a} plus {b} equals {r + random.choice([-10,-2,-1,1,2,10,100])}.", "arithmetic", f"{a}+{b}={r}", "Computed"))
for _ in range(1000):
    a, b = random.randint(12, 99), random.randint(12, 99)
    r = a * b
    computed.append((f"{a} multiplied by {b} equals {r}.", f"{a} multiplied by {b} equals {r + random.choice([-20,-10,-1,1,10,20])}.", "arithmetic", f"{a}*{b}={r}", "Computed"))
for n in range(2, 400):
    if is_prime(n):
        computed.append((f"{n} is a prime number.", f"{n} is a composite number.", "mathematics", f"{n} is prime", "Computed"))
    else:
        d = next(x for x in range(2, n) if n % x == 0)
        computed.append((f"{n} is a composite number.", f"{n} is a prime number.", "mathematics", f"{n} divisible by {d}", "Computed"))
for _ in range(300):
    n = random.randint(5, 60)
    computed.append((f"The square root of {n*n} is {n}.", f"The square root of {n*n} is {n + random.choice([-3,-2,-1,1,2,3])}.", "mathematics", f"{n}^2={n*n}", "Computed"))
for _ in range(300):
    km = random.randint(2, 500)
    computed.append((f"{km} kilometres equals {km*1000:,} metres.", f"{km} kilometres equals {km*100:,} metres.", "units", f"1 km = 1000 m", "SI definition"))
for _ in range(250):
    h = random.randint(2, 48)
    computed.append((f"{h} hours equal {h*60} minutes.", f"{h} hours equal {h*100} minutes.", "units", "1 h = 60 min", "SI definition"))
for _ in range(250):
    c = random.randint(-30, 110)
    f = c * 9 / 5 + 32
    fs = f"{f:g}"
    computed.append((f"{c} degrees Celsius equals {fs} degrees Fahrenheit.", f"{c} degrees Celsius equals {f + random.choice([-9,-5,5,9,18]):g} degrees Fahrenheit.", "units", f"F=C*9/5+32={fs}", "SI / standard conversion"))

random.shuffle(computed)
# Split: each fact used ONCE, either as verified or contradicted (no paired claims across labels)
facts_all = facts[:]
random.shuffle(facts_all)
need_total = 10**6
extra = computed[: max(0, need_total - len(facts_all))]
pool = facts_all + extra
random.shuffle(pool)
pool = pool[:need_total]

# de-duplicate on claim text
seen = set(); rows = []
for i, (t, f, cat, ev, src) in enumerate(pool):
    claim, label = (t, "Verified") if i % 2 == 0 else (f, "Contradicted")
    if claim in seen: continue
    seen.add(claim)
    rows.append([claim, label, ev if label == "Verified" else f"Correct fact: {ev}", src, cat])

# ---- Unverified (no checkable evidence, by construction) ----
people = ["Rohan Mehta","Priya Nair","Ahmed Siddiqui","Lakshmi Iyer","Karan Bhatia","Fatima Khan","Sanjay Rao","Neha Kulkarni","Arjun Reddy","Meera Joshi","Vikram Sethi","Ananya Das","Imran Qureshi","Deepa Menon","Harish Gupta"]
foods = ["dal and rice","a cheese sandwich","poha","idli and sambar","paratha","pasta","a banana","khichdi","rajma chawal","a salad"]
cities = list(capitals.values())
countries = list(capitals.keys())
fake_journals = ["Journal of Applied Obscure Studies","Regional Review of Unlisted Science","Proceedings of the Local Research Circle"]
templates = [
 lambda: (f"{random.choice(people)} ate {random.choice(foods)} for lunch on {random.randint(1,28)} {random.choice(['March','June','September','December'])} {random.randint(1990,2019)}.", "personal-private"),
 lambda: (f"By {random.randint(2060,2150)}, the population of {random.choice(countries)} will exceed {random.randint(2,9)*random.choice([50,100,200])} million.", "future-prediction"),
 lambda: (f"The stock price of a randomly chosen company will rise exactly {random.randint(3,40)}% next year.", "future-prediction"),
 lambda: (f"A secret tunnel reportedly connects the main railway station of {random.choice(cities)} to a hidden vault.", "rumor"),
 lambda: (f"Dr. {random.choice(people)} published a study in the {random.choice(fake_journals)} in {random.randint(1975,2015)} proving a cure for the common cold.", "unsourced-claim"),
 lambda: (f"Exactly {random.randint(1000,99999):,} people walked through a street market in {random.choice(cities)} on {random.randint(1,28)} {random.choice(['January','April','July','October'])} {random.randint(1950,2005)}.", "unrecorded-detail"),
 lambda: (f"The grandmother of {random.choice(people)} once met a famous scientist in {random.choice(cities)} in {random.randint(1930,1980)}.", "personal-private"),
 lambda: (f"A tiger sighted near {random.choice(cities)} in {random.randint(1900,1960)} weighed exactly {random.randint(150,260)} kg.", "unrecorded-detail"),
 lambda: (f"The next major earthquake in {random.choice(countries)} will occur in the month of {random.choice(['February','May','August','November'])} {random.randint(2027,2060)}.", "future-prediction"),
 lambda: (f"People in {random.choice(cities)} are, on average, {random.randint(2,9)} percent happier on Tuesdays than on Wednesdays.", "unsourced-claim"),
 lambda: (f"An undiscovered manuscript in a library in {random.choice(cities)} contains an unknown play by {random.choice(list(set(authors.values())))}.", "speculation"),
 lambda: (f"Ancient traders from {random.choice(countries)} secretly reached the Americas around the year {random.randint(200,1100)}.", "speculation"),
 lambda: (f"The mayor of {random.choice(cities)} privately decided in {random.randint(1960,2015)} to rename a bridge after a childhood friend.", "unrecorded-detail"),
 lambda: (f"There is a species of beetle living only in a single cave near {random.choice(cities)} that has never been catalogued.", "speculation"),
]
un_rows = []
tries = 0
while len(un_rows) < 1500 and tries < 200000:
    tries += 1
    t, cat = random.choice(templates)()
    if t in seen: continue
    seen.add(t)
    un_rows.append([t, "Unverified", "No verifiable source exists; claim is speculative, private, unrecorded or about the future.", "N/A", cat])

ver=[r for r in rows if r[1]=='Verified'][:1500]
con=[r for r in rows if r[1]=='Contradicted'][:1500]
assert len(ver)==1500 and len(con)==1500, (len(ver),len(con))
rows = ver + con + un_rows[:1500]
random.shuffle(rows)

with open("/mnt/user-data/outputs/fact_checker_dataset_4500.csv", "w", newline="", encoding="utf-8") as fh:
    w = csv.writer(fh)
    w.writerow(["id", "claim", "label", "evidence", "source", "category"])
    for i, r in enumerate(rows, 1):
        w.writerow([i] + r)

from collections import Counter
print(len(rows), Counter(r[1] for r in rows))
print(Counter(r[4] for r in rows))
